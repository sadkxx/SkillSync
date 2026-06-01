import { mockAnalysis } from "../data/mockAnalysis";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const SESSION_STORAGE_KEY = "skillsync_session_id";

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `skillsync-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const created = createSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return createSessionId();
  }
}

function buildMockAnalysis(jobText, fileName) {
  const base = { ...mockAnalysis };
  const lowered = jobText.toLowerCase();

  if (lowered.includes("typescript")) {
    base.match_percentage += 4;
    base.improved_match += 2;
  }

  if (lowered.includes("docker")) {
    base.missing_skills = Array.from(
      new Set([...base.missing_skills, "docker"])
    );
  }

  if (fileName?.toLowerCase().includes("intern")) {
    base.alternative_jobs = [
      "Junior Frontend Geliştirici",
      "Arayüz Geliştirici",
      "Web Arayüz Stajyeri"
    ];
  }

  base.match_percentage = Math.min(base.match_percentage, 96);
  base.improved_match = Math.min(base.improved_match, 98);

  return base;
}

function buildMarketInfo(analysis) {
  const stats = analysis.alan_istatistikleri || {};
  const sectors = Object.entries(analysis.top_sektorler || {})
    .slice(0, 3)
    .map(([sector, count]) => `${sector} (${count})`);
  const parts = [];

  if (typeof stats.toplam_ilan === "number") {
    parts.push(`Veri setinde ${stats.toplam_ilan} ilan incelendi.`);
  }

  if (typeof stats.yuzde50_uzeri === "number") {
    parts.push(`${stats.yuzde50_uzeri} ilan %50 üzeri uyum gösteriyor.`);
  }

  if (typeof stats.yuzde70_uzeri === "number") {
    parts.push(`${stats.yuzde70_uzeri} ilan %70 üzeri uyum gösteriyor.`);
  }

  if (sectors.length > 0) {
    parts.push(`Öne çıkan sektörler: ${sectors.join(", ")}.`);
  }

  if (typeof stats.ortalama_uyum === "number") {
    parts.push(`Ortalama uyum seviyesi %${stats.ortalama_uyum}.`);
  }

  return parts.join(" ") || "Piyasa özeti hazırlanamadı.";
}

function normalizeJob(job) {
  const displayCompany =
    job.display_company ||
    job.company_name ||
    job.company ||
    job.industry ||
    "Dataset ilanı";

  return {
    ...job,
    id: job.id || `${job.title || "job"}-${job.company || "company"}`,
    company: displayCompany,
    display_company: displayCompany,
    company_name: job.company_name || "",
    company_known: Boolean(job.company_known),
    location: job.location || "Konum belirtilmemiş",
    location_label: job.location_label || job.location || "Konum belirtilmemiş",
    industry: job.industry || "Sektör belirtilmemiş",
    department: job.department || "",
    employment_type: job.employment_type || "",
    required_experience: job.required_experience || "",
    required_education: job.required_education || "",
    function: job.function || "",
    description: job.description || "",
    requirements: job.requirements || "",
    benefits: job.benefits || "",
    distance_km:
      typeof job.distance_km === "number" ? job.distance_km : null,
    work_model: job.work_model || "Ofis",
    salary_range: job.salary_range || "Belirtilmemiş",
    match_score:
      typeof job.match_score === "number"
        ? job.match_score
        : typeof job.uyum === "number"
          ? job.uyum
          : 0,
    matched_skills: Array.isArray(job.matched_skills) ? job.matched_skills : [],
    missing_skills: Array.isArray(job.missing_skills) ? job.missing_skills : [],
    map_url:
      job.map_url ||
      `https://www.openstreetmap.org/search?query=${encodeURIComponent(
        [job.company, job.title, job.location].filter(Boolean).join(" ")
      )}`
  };
}

function normalizeAnalysisResponse(response) {
  const topJobs = Array.isArray(response.top5_jobs) ? response.top5_jobs : [];
  const alternativeJobs = Array.from(
    new Set(
      topJobs
        .map((job) => job.title)
        .filter(Boolean)
    )
  ).slice(0, 3);

  return {
    ...response,
    matched_skills: Array.isArray(response.matched_skills)
      ? response.matched_skills
      : [],
    missing_skills: Array.isArray(response.missing_skills)
      ? response.missing_skills
      : [],
    alternative_jobs:
      Array.isArray(response.alternative_jobs) && response.alternative_jobs.length > 0
        ? response.alternative_jobs
        : alternativeJobs.length > 0
        ? alternativeJobs
        : [response.best_job?.title].filter(Boolean),
    nearby_jobs: Array.isArray(response.nearby_jobs)
      ? response.nearby_jobs.map(normalizeJob)
      : [],
    top5_jobs: topJobs.map(normalizeJob),
    market_info: response.market_info || buildMarketInfo(response)
  };
}

function getBrowserLocation() {
  if (!("geolocation" in navigator)) {
    return Promise.resolve({});
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          user_lat: position.coords.latitude,
          user_lon: position.coords.longitude
        });
      },
      () => resolve({}),
      {
        enableHighAccuracy: false,
        maximumAge: 10 * 60 * 1000,
        timeout: 3000
      }
    );
  });
}

async function readErrorMessage(response, fallback) {
  try {
    const payload = await response.json();
    if (typeof payload.detail === "string") {
      return payload.detail;
    }
  } catch {
    // Fall through to the UI-safe fallback.
  }
  return fallback;
}

export async function uploadCv(file) {
  if (USE_MOCK_API) {
    await wait(900);
    return {
      status: "success",
      message: `${file.name} başarıyla yüklendi.`,
      char_count: 1842
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", getSessionId());

  const response = await fetch(`${API_BASE_URL}/upload-cv`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "CV yükleme başarısız oldu."));
  }

  return response.json();
}

export async function analyzeCvJob(jobText, fileName) {
  if (USE_MOCK_API) {
    await wait(1400);
    return buildMockAnalysis(jobText, fileName);
  }

  const locationPayload = await getBrowserLocation();
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session_id: getSessionId(),
      job_text: jobText,
      ...locationPayload
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Analiz isteği başarısız oldu."));
  }

  return normalizeAnalysisResponse(await response.json());
}
