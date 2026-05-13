import { mockAnalysis } from "../data/mockAnalysis";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
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
    alternative_jobs:
      alternativeJobs.length > 0
        ? alternativeJobs
        : [response.best_job?.title].filter(Boolean),
    nearby_jobs: Array.isArray(response.nearby_jobs)
      ? response.nearby_jobs
      : mockAnalysis.nearby_jobs,
    market_info: response.market_info || buildMarketInfo(response)
  };
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

  const response = await fetch(`${API_BASE_URL}/upload-cv`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("CV yükleme başarısız oldu.");
  }

  return response.json();
}

export async function analyzeCvJob(jobText, fileName) {
  if (USE_MOCK_API) {
    await wait(1400);
    return buildMockAnalysis(jobText, fileName);
  }

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ job_text: jobText })
  });

  if (!response.ok) {
    throw new Error("Analiz isteği başarısız oldu.");
  }

  return normalizeAnalysisResponse(await response.json());
}
