import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LayoutGroup, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  ChevronRight,
  FileBadge2,
  FileSearch,
  FileText,
  Gauge,
  Eye,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Radar,
  ScanSearch,
  Sparkles,
  TrendingUp,
  Upload,
  X
} from "lucide-react";
import { Navbar } from "./components/ui/mini-navbar";
import { Boxes } from "./components/ui/background-boxes";
import Pricing from "./components/ui/pricing-base";
import { analyzeCvJob, uploadCv } from "./services/analysisService";

const processSteps = [
  {
    title: "CV ve ilanı ekle",
    description: "PDF ya da DOCX CV'ni yükle, başvurmayı düşündüğün ilan metnini aynı ekranda paylaş."
  },
  {
    title: "Eşleşmeyi gör",
    description: "Sistem beceri, deneyim ve anahtar kelime uyumunu puanlar; eksik kalan başlıkları ayırır."
  },
  {
    title: "Sonraki adımı seç",
    description: "CV'ni güncellemen gereken alanları ve sana daha yakın ilan önerilerini birlikte değerlendir."
  }
];

const benefitCards = [
  {
    icon: Gauge,
    title: "Başvuru öncesi kontrol",
    description: "Bir ilana başvurmadan önce CV'nin o rol için ne kadar hazır olduğunu gör."
  },
  {
    icon: ScanSearch,
    title: "Eksik başlık listesi",
    description: "İlanda istenen ama CV'nde açık görünmeyen teknoloji ve deneyim başlıklarını ayır."
  },
  {
    icon: Sparkles,
    title: "Yakın ilan önerileri",
    description: "Analiz sonucuna göre konum ve uyum puanı yüksek örnek ilanları harita üzerinde incele."
  }
];

const knownSkills = [
  "react",
  "javascript",
  "typescript",
  "css",
  "docker",
  "ci/cd",
  "responsive tasarım",
  "rest api",
  "test",
  "frontend"
];

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname || "/");

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname || "/");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(nextPath) {
    if (nextPath === pathname) return;
    window.history.pushState({}, "", nextPath);
    setPathname(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return { pathname, navigate };
}

function StatCard({ icon: Icon, label, value, tone }) {
  const toneMap = {
    ember: "border-ember/30 bg-ember/10 text-ember",
    gold: "border-gold/40 bg-gold/15 text-ink",
    moss: "border-moss/30 bg-moss/15 text-ink"
  };

  return (
    <div className="min-w-0 rounded-[20px] border border-white/60 bg-white/80 p-3 shadow-panel backdrop-blur sm:rounded-[24px] sm:p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="min-w-0 text-[11px] font-medium uppercase tracking-[0.12em] text-slate sm:text-xs sm:tracking-[0.16em]">
          {label}
        </span>
        <div className={`shrink-0 rounded-full border px-2.5 py-1.5 ${toneMap[tone]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="break-words font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

function InsightPanel({ title, icon: Icon, children }) {
  return (
    <section className="min-w-0 rounded-[26px] border border-ink/10 bg-[#fffaf2]/90 p-5 shadow-panel sm:rounded-[30px] sm:p-6">
      <div className="mb-5 flex min-w-0 items-center gap-3">
        <div className="shrink-0 rounded-2xl bg-ink p-3 text-mist">
          <Icon size={20} />
        </div>
        <h3 className="min-w-0 font-display text-xl font-semibold leading-tight text-ink">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[30px] border border-dashed border-ink/20 bg-white/60 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-mist">
        <Radar size={24} />
      </div>
      <h3 className="font-display text-2xl font-semibold text-ink">
        Analiz sonucu burada belirecek
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate">
        CV'ni yükleyip ilan metnini eklediğinde, uyum oranı ve öne çıkan
        başlıklar bu alanda görüntülenecek.
      </p>
    </div>
  );
}

function AnalysisLoader() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-ink/92 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,201,93,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,122,89,0.14),transparent_26%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl rounded-[40px] border border-white/10 bg-black/20 px-6 py-10 text-center text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-10">
          <div className="mx-auto loader-orbit">
            <div className="loader-ring loader-ring-one" />
            <div className="loader-ring loader-ring-two" />
            <div className="loader-core">
              <Radar size={34} />
            </div>
          </div>

          <p className="mt-10 text-sm uppercase tracking-[0.4em] text-white/70">
            Analiz sürüyor
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
            CV ve ilan karşılaştırılıyor
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
            Teknik beceriler, öne çıkan ifadeler ve genel uyum birlikte
            değerlendiriliyor. Sonuç ekranı birazdan hazır olacak.
          </p>

          <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Tarama
              </p>
              <p className="mt-2 text-sm leading-6 text-white/90">
                CV içeriği çözümleniyor
              </p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Karşılaştırma
              </p>
              <p className="mt-2 text-sm leading-6 text-white/90">
                İlan beklentileri eşleştiriliyor
              </p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Rapor
              </p>
              <p className="mt-2 text-sm leading-6 text-white/90">
                Sonuç kartları hazırlanıyor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function summarizeText(text, maxLength = 220) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}

function extractFocusAreas(jobText, missingSkills) {
  const lowered = jobText.toLowerCase();
  const foundSkills = knownSkills.filter((skill) => lowered.includes(skill));
  const merged = Array.from(new Set([...foundSkills, ...missingSkills]));
  return merged.slice(0, 6);
}

function getMapPoints(jobs, userLocation) {
  const jobPoints = (Array.isArray(jobs) ? jobs : [])
    .map((job, index) => ({
      id: job.id || `job-${index}`,
      type: "job",
      label: String(index + 1),
      job,
      title: job.title,
      company: job.company_known ? job.company : job.display_company || job.industry,
      meta: [job.location_label || job.location, job.industry].filter(Boolean).join(" · "),
      matchScore: job.match_score,
      distance: job.distance_km,
      lat: Number(job.lat),
      lon: Number(job.lon)
    }))
    .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));

  const userLat = Number(userLocation?.lat);
  const userLon = Number(userLocation?.lon);
  if (Number.isFinite(userLat) && Number.isFinite(userLon)) {
    return [
      {
        id: "user-location",
        type: "user",
        label: "Sen",
        title: "Senin konumun",
        company: "Analiz için kullanılan konum",
        lat: userLat,
        lon: userLon
      },
      ...jobPoints
    ];
  }

  return jobPoints;
}

function getMapBounds(points) {
  const validPoints = points.filter(
    (point) => Number.isFinite(point.lat) && Number.isFinite(point.lon)
  );

  if (validPoints.length === 0) {
    return null;
  }

  const lats = validPoints.map((point) => point.lat);
  const lons = validPoints.map((point) => point.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latPad = Math.max((maxLat - minLat) * 0.2, 0.12);
  const lonPad = Math.max((maxLon - minLon) * 0.2, 0.12);

  return {
    left: minLon - lonPad,
    right: maxLon + lonPad,
    bottom: minLat - latPad,
    top: maxLat + latPad
  };
}

function formatDistance(distance) {
  return typeof distance === "number" ? `${distance} km` : "Mesafe yok";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createMapIcon(point) {
  const isUser = point.type === "user";
  return L.divIcon({
    className: "",
    iconSize: isUser ? [42, 42] : [36, 42],
    iconAnchor: isUser ? [21, 21] : [18, 39],
    popupAnchor: [0, -34],
    html: `
      <div class="${isUser ? "skillsync-user-marker" : "skillsync-job-marker"}">
        <span>${escapeHtml(point.label)}</span>
      </div>
    `
  });
}

function pointTooltip(point) {
  if (point.type === "user") {
    return `
      <div class="skillsync-map-tooltip-body">
        <strong>${escapeHtml(point.title)}</strong>
        <span>${escapeHtml(point.company)}</span>
      </div>
    `;
  }

  return `
    <div class="skillsync-map-tooltip-body">
      <strong>${escapeHtml(point.title)}</strong>
      <span>${escapeHtml(point.meta)}</span>
      <em>%${escapeHtml(point.matchScore)} · ${escapeHtml(formatDistance(point.distance))}</em>
    </div>
  `;
}

function LeafletJobMap({ jobs, userLocation, expanded = false, onSelectJob }) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const points = getMapPoints(jobs, userLocation);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    mapRef.current = L.map(mapNodeRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView([41.0082, 28.9784], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    layerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;

    layerRef.current.clearLayers();
    const validPoints = points.filter(
      (point) => Number.isFinite(point.lat) && Number.isFinite(point.lon)
    );

    validPoints.forEach((point) => {
      const marker = L.marker([point.lat, point.lon], {
        icon: createMapIcon(point),
        keyboard: true,
        title: point.type === "user" ? "Senin konumun" : point.title,
      });
      const tooltipContent = pointTooltip(point);
      const tooltipOptions = {
        direction: "top",
        offset: [0, -16],
        opacity: 1,
        sticky: true,
        className: "skillsync-map-tooltip",
      };
      marker.bindTooltip(tooltipContent, tooltipOptions);
      marker.bindPopup(tooltipContent, {
        className: "skillsync-map-popup",
        closeButton: true,
      });
      marker.on("popupopen", () => {
        marker.closeTooltip();
        marker.unbindTooltip();
      });
      marker.on("popupclose", () => {
        marker.bindTooltip(tooltipContent, tooltipOptions);
      });
      marker.on("click", () => {
        if (point.type === "job" && point.job) {
          onSelectJob?.(point.job);
        }
      });
      marker.addTo(layerRef.current);
    });

    if (validPoints.length > 1) {
      const bounds = L.latLngBounds(validPoints.map((point) => [point.lat, point.lon]));
      mapRef.current.fitBounds(bounds, {
        padding: expanded ? [70, 70] : [36, 36],
        maxZoom: 13,
      });
    } else if (validPoints.length === 1) {
      mapRef.current.setView([validPoints[0].lat, validPoints[0].lon], 12);
    } else {
      mapRef.current.setView([41.0082, 28.9784], 11);
    }

    window.setTimeout(() => mapRef.current?.invalidateSize(), 80);
  }, [points, expanded, onSelectJob]);

  useEffect(() => {
    window.setTimeout(() => mapRef.current?.invalidateSize(), 120);
  }, [expanded]);

  return <div ref={mapNodeRef} className="skillsync-leaflet-map h-full w-full" />;
}

function JobMapPanel({ jobs, userLocation, onSelectJob, className = "" }) {
  const nearbyJobs = Array.isArray(jobs) ? jobs : [];
  const bestJob = nearbyJobs[0];

  if (nearbyJobs.length === 0) {
    return null;
  }

  return (
    <section className={`min-w-0 overflow-hidden rounded-[28px] border border-ink/10 bg-white/90 shadow-panel sm:rounded-[32px] ${className}`}>
      <div className="border-b border-ink/10 bg-[#eef7f1] px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-moss/30 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
              <LocateFixed size={14} />
              Yakındaki uygun ilanlar
            </div>
            <h3 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              CV'ne en yakın fırsatlar haritada
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate">
              Harita gerçek OpenStreetMap görünümüdür; iş kartlarındaki konum
              bağlantıları ilgili şirket lokasyonlarını açar.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-1 gap-3 rounded-[24px] border border-ink/10 bg-white/75 p-3 text-center sm:grid-cols-3 lg:min-w-[310px]">
            <div className="px-2">
              <p className="font-display text-2xl font-semibold text-ink">
                {nearbyJobs.length}
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate">
                İlan
              </p>
            </div>
            <div className="border-x border-ink/10 px-2">
              <p className="font-display text-2xl font-semibold text-ink">
                %{bestJob.match_score}
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate">
                En iyi
              </p>
            </div>
            <div className="px-2">
              <p className="font-display text-2xl font-semibold text-ink">
                {formatDistance(bestJob.distance_km)}
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate">
                En yakın
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 2xl:grid-cols-[1.25fr_0.75fr]">
        <div className="relative min-h-[520px] overflow-hidden bg-[#dfeee7] sm:min-h-[680px]">
          <LeafletJobMap
            jobs={nearbyJobs}
            userLocation={userLocation}
            expanded
            onSelectJob={onSelectJob}
          />
          <div className="absolute left-4 top-4 z-10 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full bg-white/88 px-4 py-2 text-xs font-semibold text-ink shadow-sm backdrop-blur">
            <MapPin size={14} />
            <span className="truncate">Etkileşimli OpenStreetMap</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10 rounded-[24px] border border-ink/10 bg-white/90 p-4 shadow-panel backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
              Örnek şirket lokasyonları
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {nearbyJobs.map((job) => (
                <a
                  key={`map-link-${job.id}`}
                  href={job.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-mist transition hover:bg-ink/90"
                >
                  <MapPin size={13} />
                  {job.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid max-h-none gap-4 overflow-y-auto bg-white p-4 sm:p-5 2xl:max-h-[620px]">
          {nearbyJobs.map((job, index) => (
            <article
              key={job.id}
              className="min-w-0 rounded-[24px] border border-ink/10 bg-[#fffaf2] p-4 sm:rounded-[26px] sm:p-5"
            >
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-mist">
                      <Building2 size={13} />
                      <span className="truncate">{job.display_company || job.company}</span>
                    </span>
                    <span className="rounded-full bg-moss/18 px-3 py-1.5 text-xs font-semibold text-ink">
                      {job.work_model}
                    </span>
                  </div>
                  <h4 className="break-words font-display text-xl font-semibold leading-tight text-ink">
                    {job.title}
                  </h4>
                  <p className="mt-2 flex min-w-0 items-start gap-2 text-sm leading-6 text-slate">
                    <MapPin size={15} className="mt-0.5 shrink-0" />
                    <span className="min-w-0 break-words">
                      {job.location_label || job.location} · {formatDistance(job.distance_km)}
                    </span>
                  </p>
                </div>

                <div className="w-full shrink-0 rounded-2xl bg-white px-4 py-3 text-center shadow-sm sm:w-auto">
                  <p className="font-display text-2xl font-bold text-ember">
                    %{job.match_score}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate">
                    Uyum
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.matched_skills.map((skill) => (
                  <span
                    key={`${job.id}-${skill}`}
                    className="rounded-full border border-moss/25 bg-white px-3 py-1.5 text-xs font-medium capitalize text-ink"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-4 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">
                    Maaş aralığı
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {job.salary_range}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.open(job.map_url, "_blank", "noopener,noreferrer")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white transition hover:bg-ember/90"
                >
                  Haritada aç
                  <ArrowRight size={15} />
                </button>
              </div>

              {index === 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-2 text-xs font-semibold text-ink">
                  <TrendingUp size={14} />
                  En güçlü öneri
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JobDetailPanel({ job, panelRef }) {
  if (!job) {
    return null;
  }

  const details = [
    ["Çalışma tipi", job.employment_type],
    ["Deneyim", job.required_experience],
    ["Eğitim", job.required_education],
    ["Departman", job.department],
    ["Fonksiyon", job.function],
    ["Maaş", job.salary_range && job.salary_range !== "Belirtilmemis" ? job.salary_range : ""],
  ].filter(([, value]) => value && String(value).trim());

  const textSections = [
    ["İlan açıklaması", job.description],
    ["Aranan özellikler", job.requirements],
    ["Yan haklar", job.benefits],
  ].filter(([, value]) => value && String(value).trim());

  return (
    <section
      ref={panelRef}
      className="w-full min-w-0 overflow-hidden rounded-[30px] border border-ink/10 bg-white text-ink shadow-panel"
    >
      <div className="border-b border-ink/10 bg-[#fffaf2] px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
              Seçili ilan detayı
            </p>
            <h3 className="mt-2 break-words font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {job.title}
            </h3>
            <p className="mt-3 text-sm font-semibold text-ember">
              {job.display_company || job.company} · {job.location_label || job.location}
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="font-display text-2xl font-bold text-ember">
                %{job.match_score}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate">
                Uyum
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="font-display text-2xl font-bold text-ink">
                {formatDistance(job.distance_km)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate">
                Mesafe
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="font-display text-2xl font-bold text-ink">
                {job.work_model || "Ofis"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate">
                Model
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
              Özet bilgiler
            </p>
            <div className="mt-3 grid gap-2">
              {details.length > 0 ? details.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-ink/10 bg-[#f7fbf8] px-4 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-ink">
                    {value}
                  </p>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-ink/15 bg-[#f7fbf8] px-4 py-5 text-sm leading-6 text-slate">
                  Bu ilan için ek meta veri bulunamadı.
                </div>
              )}
            </div>
          </div>

          {(job.matched_skills?.length > 0 || job.missing_skills?.length > 0) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                Beceri eşleşmesi
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(job.matched_skills || []).slice(0, 8).map((skill) => (
                  <span
                    key={`detail-match-${skill}`}
                    className="rounded-full border border-moss/25 bg-moss/12 px-3 py-1.5 text-xs font-semibold capitalize text-ink"
                  >
                    {skill}
                  </span>
                ))}
                {(job.missing_skills || []).slice(0, 5).map((skill) => (
                  <span
                    key={`detail-missing-${skill}`}
                    className="rounded-full border border-ember/20 bg-ember/10 px-3 py-1.5 text-xs font-semibold capitalize text-ember"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="space-y-4">
          {textSections.length > 0 ? textSections.map(([title, value]) => (
            <article
              key={title}
              className="rounded-[24px] border border-ink/10 bg-[#fffaf2] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                {title}
              </p>
              <p className="mt-3 break-words text-sm leading-7 text-ink">
                {value}
              </p>
            </article>
          )) : (
            <article className="rounded-[24px] border border-dashed border-ink/15 bg-[#fffaf2] p-5 text-sm leading-7 text-slate">
              Bu ilanda açıklama veya gereksinim metni bulunamadı. Yine de rol, lokasyon ve uyum skoru öneri için kullanılabilir.
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

function LandingPage({ pathname, onNavigate }) {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
        <div className="fixed inset-0 z-0 overflow-hidden bg-slate-900">
          <Boxes className="opacity-70" />
          <div className="pointer-events-none absolute inset-0 z-20 bg-slate-900 [mask-image:radial-gradient(transparent,white)]" />
          <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(180deg,rgba(15,23,42,0.14),rgba(15,23,42,0.36)_62%,rgba(15,23,42,0.58))]" />
        </div>
        <section className="pointer-events-none relative z-10 mx-auto grid min-h-[78vh] w-full max-w-7xl items-center gap-10 px-6 pb-12 pt-36 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/72 backdrop-blur">
              <FileSearch size={14} />
              CV, ilan ve konum tek raporda
            </div>

            <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.02] text-white md:text-7xl">
              Başvuru yapmadan önce
              <span className="block text-gold">uyumu ölç.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              SkillSync, CV içeriğini seçtiğin ilanla karşılaştırır; eksik
              becerileri, güçlü eşleşmeleri ve konuma göre öne çıkan ilan
              alternatiflerini okunabilir bir raporda toplar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate("/cv-analizi")}
                className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full bg-ember px-7 py-3.5 font-semibold text-white shadow-[0_18px_44px_rgba(255,122,89,0.26)] transition hover:bg-ember/90"
              >
                Raporu dene
                <ArrowRight size={18} />
              </button>

              <a
                href="#nasil-calisir"
                className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/16 px-7 py-3.5 font-semibold text-white/82 transition hover:bg-white/10"
              >
                Süreci incele
                <ChevronRight size={18} />
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["Uyum", "%86"],
                ["Eksik başlık", "4"],
                ["Yakın ilan", "3"]
              ].map(([label, value]) => (
                <div key={label} className="border-l border-white/18 pl-5">
                  <p className="font-display text-3xl font-semibold text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/48">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <div className="absolute left-4 top-2 w-[82%] rounded-[30px] border border-white/12 bg-white/10 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl md:left-10">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                    Analiz edilen ilan
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    Frontend Developer
                  </h2>
                  <p className="mt-2 text-sm text-white/55">
                    İstanbul · Hibrit · Orta seviye
                  </p>
                </div>
                <div className="rounded-2xl bg-moss px-4 py-3 text-center text-ink">
                  <p className="font-display text-2xl font-bold">%86</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    Uyum
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-white/56">
                    <span>Teknik eşleşme</span>
                    <span>React, JS, CSS</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[86%] rounded-full bg-ember" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                      Eksik görünenler
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Docker", "Test", "CI/CD"].map((item) => (
                        <span key={item} className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                      Önerilen rol
                    </p>
                    <p className="mt-3 font-display text-xl font-semibold">
                      UI Engineer
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-[78%] overflow-hidden rounded-[30px] border border-white/12 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between gap-3 border-b border-ink/8 bg-[#fffaf2] px-5 py-4 text-ink">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate/55">
                    Konuma göre eşleşmeler
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold">
                    İstanbul çevresi
                  </p>
                </div>
                <div className="rounded-full bg-moss/24 px-3 py-1.5 text-xs font-bold text-ink">
                  3 ilan
                </div>
              </div>
              <div className="mock-map relative h-80">
                <span className="map-district left-[12%] top-[18%]">Maslak</span>
                <span className="map-district right-[11%] top-[14%]">Levent</span>
                <span className="map-district bottom-[30%] left-[18%]">Kadıköy</span>
                <span className="map-route map-route-primary" />
                <span className="map-route map-route-secondary" />
                <span className="map-distance left-[37%] top-[37%]">4.2 km</span>
                <span className="map-distance right-[19%] top-[30%]">2.8 km</span>

                <div className="absolute left-[23%] top-[48%] z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-moss text-ink shadow-panel ring-4 ring-moss/20">
                  <LocateFixed size={18} />
                </div>
                <div className="absolute left-[58%] top-[42%] z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-ember text-white shadow-panel ring-4 ring-ember/18">
                  <MapPin size={24} fill="currentColor" />
                </div>
                <div className="absolute left-[76%] top-[33%] z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-gold text-ink shadow-panel ring-4 ring-gold/20">
                  <MapPin size={18} fill="currentColor" />
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-30 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/80 bg-white/92 p-3 text-ink shadow-[0_12px_32px_rgba(18,26,47,0.12)] backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ember">
                      En yakın uygun ilan
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold leading-tight">
                      Qullt Inc.
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate">
                      4.2 km · %91 uyum
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/86 p-3 text-ink shadow-[0_12px_32px_rgba(18,26,47,0.1)] backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate/60">
                      Alternatif rota
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold leading-tight">
                      UI Engineer
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate">
                      Hibrit · %84 uyum
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pointer-events-none relative z-10 px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 rounded-[30px] border border-white/12 bg-white/90 p-4 text-ink shadow-panel backdrop-blur md:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div className="rounded-[24px] bg-ink p-6 text-white">
              <p className="text-sm uppercase tracking-[0.24em] text-gold/70">
                Rapor çıktısı
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
                Sonuç sadece skor değil; neyi düzeltmen gerektiği.
              </h2>
            </div>
            {benefitCards.slice(0, 2).map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-[24px] bg-[#fffaf2] p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ember text-white">
                  <Icon size={21} />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="nasil-calisir" className="pointer-events-none relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[30px] border border-white/12 bg-white/10 p-7 text-white backdrop-blur">
              <p className="text-sm uppercase tracking-[0.26em] text-white/50">
                Analiz akışı
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
                Üç adımda başvuru kararı.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                CV'ni ve ilan metnini yükle; uyum skoru, eksik beceriler ve
                konuma göre öne çıkan ilanları tek raporda incele.
              </p>
              <button
                type="button"
                onClick={() => onNavigate("/cv-analizi")}
                className="pointer-events-auto mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-ink transition hover:bg-white/90"
              >
                Analiz ekranına git
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {processSteps.map((item, index) => (
                <div
                  key={item.title}
                  className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-white p-6 shadow-panel"
                >
                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink font-display text-lg font-bold text-mist">
                    0{index + 1}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pointer-events-none relative z-10 mx-auto max-w-7xl px-6 pb-12 lg:px-8">
          <div className="grid overflow-hidden rounded-[34px] bg-white text-ink shadow-panel lg:grid-cols-[0.82fr_1.18fr]">
            <div className="p-7 md:p-9">
              <p className="text-sm uppercase tracking-[0.28em] text-slate">
                Harita destekli öneri
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
                Uyumlu ilanı sadece title ile değil, lokasyonla da gör.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate">
                Analiz sonucunda önerilen ilanlar; şirket, çalışma modeli,
                eşleşen beceriler, uyum puanı ve harita bağlantısıyla birlikte
                listelenir.
              </p>
            </div>

            <div className="grid gap-4 bg-[#eef7f1] p-5 md:grid-cols-2">
              {[
                ["Qullt Inc.", "Frontend Developer", "%86", "4.2 km"],
                ["Türkiye Finans", "UI Engineer", "%81", "6.8 km"]
              ].map(([company, role, score, distance]) => (
                <div key={company} className="rounded-[26px] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">
                        {company}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold">
                        {role}
                      </h3>
                    </div>
                    <span className="rounded-full bg-moss/20 px-3 py-2 text-sm font-bold text-ink">
                      {score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-ink/10 pt-4 text-sm text-slate">
                    <span>Hibrit</span>
                    <span>{distance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobText, setJobText] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [selectedNearbyJob, setSelectedNearbyJob] = useState(null);
  const jobTextareaRef = useRef(null);
  const jobDetailRef = useRef(null);

  const focusAreas = analysis
    ? extractFocusAreas(jobText, analysis.missing_skills)
    : [];
  const nearbyJobs = Array.isArray(analysis?.nearby_jobs)
    ? analysis.nearby_jobs
    : [];
  const firstNearbyJob = nearbyJobs[0];
  const userLocation = analysis?.user_location || null;
  const cvMeta = selectedFile
    ? {
        name: selectedFile.name,
        type: selectedFile.name.split(".").pop()?.toUpperCase() || "DOSYA",
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
      }
    : null;

  let readiness = 0;

  if (selectedFile || jobText.trim()) {
    readiness = selectedFile && jobText.trim() ? 100 : 50;
  }

  function handleSelectNearbyJob(job) {
    setSelectedNearbyJob(job);
    window.setTimeout(() => {
      jobDetailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 80);
  }

  function resizeJobTextarea() {
    const textarea = jobTextareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function handleJobTextChange(event) {
    setJobText(event.target.value);
    window.requestAnimationFrame(resizeJobTextarea);
  }

  async function handleUpload(file) {
    if (!file) return;

    setSelectedFile(file);
    setError("");
    setUploadMessage("");
    setIsUploading(true);

    try {
      const response = await uploadCv(file);
      setUploadMessage(response.message);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Analize başlamadan önce bir CV dosyası seçmelisin.");
      return;
    }

    if (!jobText.trim()) {
      setError("İlan metni alanı boş bırakılamaz.");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    try {
      const result = await analyzeCvJob(jobText, selectedFile.name);
      setAnalysis(result);
      setSelectedNearbyJob(null);
      setIsMapExpanded(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (analysisError) {
      setError(analysisError.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleViewCv() {
    if (!selectedFile) return;

    const fileUrl = URL.createObjectURL(selectedFile);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 30000);
  }

  function resetCv() {
    setSelectedFile(null);
    setUploadMessage("");
    setError("");
    setAnalysis(null);
    setSelectedNearbyJob(null);
    setIsMapExpanded(false);
    setConfirmAction(null);
  }

  function resetJobText() {
    setJobText("");
    setError("");
    setAnalysis(null);
    setSelectedNearbyJob(null);
    setIsMapExpanded(false);
    setConfirmAction(null);
  }

  const gridArea = (collapsedArea, expandedArea) => ({
    gridArea: isMapExpanded ? expandedArea : collapsedArea
  });
  return (
    <>
      {isAnalyzing && <AnalysisLoader />}
      {confirmAction && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/72 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white p-6 text-ink shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                  Onay gerekli
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">
                  Emin misiniz?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-full bg-ink/5 p-2 text-ink transition hover:bg-ink/10"
                aria-label="Modalı kapat"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-7 text-slate">
              {confirmAction === "cv"
                ? "Yüklenen CV kaldırılacak ve analiz sonucu temizlenecek. Tekrar devam etmek için yeni CV yüklemeniz gerekecek."
                : "İş ilanı metni temizlenecek ve analiz sonucu kaldırılacak. Devam etmek için ilan metnini yeniden girmeniz gerekecek."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmAction === "cv" ? resetCv : resetJobText}
                className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:bg-ember/90"
              >
                Evet, temizle
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="relative overflow-x-hidden bg-slate-950 pt-28">
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
        <Boxes className="opacity-45" />
        <div className="pointer-events-none absolute inset-0 z-20 bg-slate-950 [mask-image:radial-gradient(transparent,white)]" />
        <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.58)_58%,rgba(2,6,23,0.76))]" />
      </div>
      <section className="pointer-events-none relative z-10 overflow-hidden border-b border-white/10 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.26em] text-white/55">
                Analiz Alanı
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                CV ve ilan eşleşmesini
                <span className="block text-gold">tek ekranda incele.</span>
              </h1>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-3">
              <StatCard
                icon={Gauge}
                label="Form Durumu"
                value={`%${readiness}`}
                tone="gold"
              />
              <StatCard
                icon={FileText}
                label="CV Durumu"
                value={selectedFile ? "Yüklendi" : "Bekliyor"}
                tone="ember"
              />
              <StatCard
                icon={BadgeCheck}
                label="Analiz"
                value={analysis ? "Hazır" : "Bekliyor"}
                tone="moss"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className={`relative z-10 mx-auto grid max-w-7xl px-5 py-8 sm:px-6 lg:px-8 ${
          analysis
            ? "grid-cols-1 gap-4 lg:h-[920px] lg:grid-cols-12 lg:grid-rows-8 lg:gap-x-4 lg:gap-y-4"
            : "items-start gap-8 lg:grid-cols-2"
        }`}
      >
        <LayoutGroup>
          <motion.form
            layout
            layoutId="analysis-form"
            transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
            onSubmit={handleAnalyze}
            className="contents"
          >
            {analysis ? (
              <>
                <motion.div
                  layout
                  layoutId="cv-upload-card"
                  transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                  className={`min-w-0 rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-panel backdrop-blur ${
                    isMapExpanded ? "lg:[grid-area:1/1/3/5]" : "lg:[grid-area:1/1/3/5]"
                  }`}
                >
                  <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-2xl bg-ink p-3 text-mist">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">
                        CV dosyası
                      </p>
                      <h2 className="font-display text-xl font-semibold leading-tight text-ink">
                        Yüklenen CV
                      </h2>
                    </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmAction("cv")}
                      className="shrink-0 rounded-full border border-ember/20 bg-ember/10 p-2 text-ember transition hover:bg-ember/15"
                      aria-label="CV'yi kaldır"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="min-w-0 rounded-[20px] border border-ink/10 bg-[#f8f2e7] p-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-display text-lg font-semibold leading-tight text-ink">
                        {cvMeta?.name || "CV seçilmedi"}
                      </p>
                      <button
                        type="button"
                        onClick={handleViewCv}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-mist transition hover:bg-ink/90"
                      >
                        <Eye size={14} />
                        Gör
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink">
                        {cvMeta?.type || "DOSYA"}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink">
                        {cvMeta?.size || "0 MB"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                layout
                layoutId="job-text-card"
                transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                className={`flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-panel backdrop-blur ${
                    isMapExpanded ? "lg:[grid-area:1/9/3/13]" : "lg:[grid-area:1/9/4/13]"
                  }`}
                >
                  <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">
                        İş ilanı metni
                      </p>
                      <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-ink">
                        İlan özeti
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmAction("job")}
                      className="shrink-0 rounded-full border border-ember/20 bg-ember/10 p-2 text-ember transition hover:bg-ember/15"
                      aria-label="İlan metnini temizle"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto rounded-[22px] border border-ink/10 bg-[#fffaf2] px-4 py-3 pr-3">
                    <p className="text-sm leading-6 text-ink">
                      {summarizeText(jobText, 260)}
                    </p>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  layout
                  layoutId="cv-upload-card"
                  transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                  className="min-w-0 rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-panel backdrop-blur sm:rounded-[32px] sm:p-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-2xl bg-ink p-3 text-mist">
                      <Upload size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate sm:text-sm sm:tracking-[0.22em]">
                        CV dosyası
                      </p>
                      <h2 className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">
                        Öz geçmişini yükle
                      </h2>
                    </div>
                  </div>

                  <label className="mt-8 block">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate">
                      Dosya seç
                    </span>
                    <div className="min-w-0 rounded-[24px] border border-dashed border-ink/25 bg-[#f8f2e7] p-4 sm:rounded-[28px] sm:p-5">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="block w-full min-w-0 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-3 file:text-sm file:font-semibold file:text-mist hover:file:bg-ink/90"
                        onChange={(event) => handleUpload(event.target.files?.[0])}
                      />
                      <p className="mt-3 text-sm leading-6 text-slate">
                        PDF ve DOCX formatları desteklenir.
                      </p>
                    </div>
                  </label>

                  <div className="mt-6 inline-flex w-full min-w-0 items-center justify-center rounded-full border border-ink/10 px-5 py-3 text-sm text-slate">
                    <span className="max-w-full truncate">
                      {isUploading
                        ? "CV yükleniyor"
                        : uploadMessage
                          ? uploadMessage
                          : selectedFile
                            ? `${selectedFile.name} seçildi`
                          : "Henüz dosya seçilmedi"}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  layout
                  layoutId="job-text-card"
                  transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                  className="flex min-w-0 flex-col rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-panel backdrop-blur sm:rounded-[32px] sm:p-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-2xl bg-ink p-3 text-mist">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate sm:text-sm sm:tracking-[0.22em]">
                        İş ilanı metni
                      </p>
                      <h2 className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">
                        İlanı yapıştır
                      </h2>
                    </div>
                  </div>

                  <label className="mt-8 block min-w-0">
                    <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-slate">
                      Başvurulacak ilan
                    </span>
                    <textarea
                      ref={jobTextareaRef}
                      value={jobText}
                      onChange={handleJobTextChange}
                      rows={3}
                      className="max-h-[420px] w-full min-w-0 resize-none overflow-y-auto rounded-[24px] border border-ink/10 bg-[#fffaf2] px-5 py-4 text-sm leading-7 text-ink outline-none transition placeholder:text-slate/60 focus:border-ember focus:ring-4 focus:ring-ember/10 sm:rounded-[28px]"
                      placeholder="Başvurmak istediğin ilanın metnini buraya yapıştır."
                    />
                  </label>

                  {error && (
                    <div className={`mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
                      error ? "bg-red-50 text-red-700" : "bg-moss/15 text-ink"
                    }`}>
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span className="min-w-0 break-words">
                        {error}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading || isAnalyzing}
                    className="mt-4 inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 font-semibold text-white transition hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Analiz hazırlanıyor
                      </>
                    ) : (
                      <>
                        Analizi başlat
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </motion.div>
              </>
            )}
          </motion.form>

        {analysis ? (
          <>
              <motion.div
                layout
                layoutId="match-score-card"
                transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                className={`flex min-w-0 flex-col justify-between overflow-hidden rounded-[30px] bg-ink p-6 text-white shadow-panel ${
                      isMapExpanded ? "lg:[grid-area:1/5/3/9]" : "lg:[grid-area:1/5/3/9]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
                      Analiz tamamlandı
                    </p>
                    <h2 className="mt-3 max-w-xs font-display text-3xl font-semibold leading-tight">
                      CV ve ilan uyumu
                    </h2>
                  </div>
                  <BadgeCheck className="shrink-0 text-moss" size={28} />
                </div>
                <div>
                  <p className="font-display text-7xl font-bold leading-none">
                    %{analysis.match_percentage}
                  </p>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-ember"
                      style={{ width: `${analysis.match_percentage}%` }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl bg-white/8 px-2 py-2">
                      <p className="font-display text-xl font-semibold">
                        {focusAreas.length}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                        Başlık
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/8 px-2 py-2">
                      <p className="font-display text-xl font-semibold">
                        {nearbyJobs.length}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                        İlan
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/8 px-2 py-2">
                      <p className="font-display text-xl font-semibold">
                        {analysis.alternative_jobs?.length || 0}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                        Rol
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                layout
                layoutId="potential-card"
                transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                className={`rounded-[28px] bg-white p-5 text-ink shadow-panel ${
                  isMapExpanded ? "lg:[grid-area:7/1/9/4]" : "lg:[grid-area:3/1/5/5]"
                }`}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate">
                      Potansiyel
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="font-display text-5xl font-semibold leading-none">
                        %{analysis.improved_match}
                      </p>
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-moss/18 text-sm font-bold text-ink ring-8 ring-moss/8">
                        +{Math.max(0, Math.round(analysis.improved_match - analysis.match_percentage))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-ember" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                        <div
                          className="h-full rounded-full bg-ember"
                          style={{ width: `${analysis.match_percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-moss" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                        <div
                          className="h-full rounded-full bg-moss"
                          style={{ width: `${analysis.improved_match}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate">
                      Eksikler tamamlanırsa.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                layout
                layoutId="missing-count-card"
                transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                className={`overflow-hidden rounded-[28px] bg-[#fff4ea] p-5 text-ink shadow-panel ${
                  isMapExpanded ? "lg:[grid-area:3/10/7/13]" : "lg:[grid-area:4/9/7/13]"
                }`}
              >
                <div className="flex h-full min-h-0 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">
                        Çevredeki ilanlar
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        Yakın eşleşmeler
                      </p>
                    </div>
                    <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-mist">
                      {nearbyJobs.length} ilan
                    </span>
                  </div>
                  <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {nearbyJobs.length > 0 ? nearbyJobs.map((job, index) => (
                      <button
                        type="button"
                        key={job.id}
                        onClick={() => handleSelectNearbyJob(job)}
                        className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:bg-white ${
                          selectedNearbyJob?.id === job.id
                            ? "bg-white ring-2 ring-ember/30"
                            : "bg-white/82"
                        }`}
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-mist">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {job.title}
                          </p>
                          <p className="truncate text-xs text-slate">
                            {job.display_company || job.company} · {job.location_label || job.location} · {formatDistance(job.distance_km)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-ember">
                            %{job.match_score}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-slate">
                            {job.work_model}
                          </p>
                        </div>
                      </button>
                    )) : (
                      <div className="rounded-2xl bg-white/82 px-4 py-5 text-sm leading-6 text-slate shadow-sm">
                        Konumlu ilan bulunamadı; dataset önerileri rol kartlarında gösteriliyor.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                layout
                layoutId="missing-skills-card"
                transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                className={`rounded-[28px] bg-white p-5 text-ink shadow-panel ${
                  isMapExpanded ? "lg:[grid-area:7/7/9/13]" : "lg:[grid-area:7/5/9/13]"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate">
                    Eksik beceriler
                  </p>
                  <span className="rounded-full bg-ember/10 px-2 py-1 text-xs font-semibold text-ember">
                    {analysis.missing_skills.length || "Tam"}
                  </span>
                </div>
                {analysis.missing_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-ember/20 bg-ember/10 px-3 py-1.5 text-xs font-semibold capitalize text-ember"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate">
                    Bu ilan için kritik eksik beceri görünmüyor.
                  </p>
                )}
              </motion.div>

              <motion.div
                layout
                layoutId="map-card"
                transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                className={`min-h-[380px] overflow-hidden rounded-[28px] bg-[#eef7f1] text-left text-ink shadow-panel lg:min-h-0 ${
                  isMapExpanded
                    ? "lg:[grid-area:3/1/7/10]"
                    : "lg:[grid-area:3/5/7/9]"
                }`}
              >
                <div className="relative h-full min-h-0">
                  <LeafletJobMap
                    jobs={nearbyJobs}
                    userLocation={userLocation}
                    expanded={isMapExpanded}
                    onSelectJob={handleSelectNearbyJob}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),transparent_28%,rgba(18,26,47,0.12))]" />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/92 px-3 py-2 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                      En yakın
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      {firstNearbyJob?.title || "Konumlu ilan bulunamadı"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ember">
                      {firstNearbyJob
                        ? `${firstNearbyJob.location_label || firstNearbyJob.location} · ${formatDistance(firstNearbyJob.distance_km)}`
                        : "Dataset önerileri listeleniyor"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsMapExpanded((current) => !current);
                    }}
                    className="absolute bottom-12 right-4 z-[500] min-w-[92px] whitespace-nowrap rounded-full bg-ink px-5 py-2.5 text-center text-xs font-semibold text-mist shadow-panel transition hover:bg-ink/90 focus:outline-none focus:ring-4 focus:ring-ember/30 sm:bottom-5 sm:right-5"
                    aria-expanded={isMapExpanded}
                  >
                    {isMapExpanded ? "Küçült" : "Genişlet"}
                  </button>
                </div>
              </motion.div>

              <motion.div
                layout
                layoutId="role-card"
                transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                className={`rounded-[28px] bg-white p-5 text-ink shadow-panel ${
                  isMapExpanded ? "lg:[grid-area:7/4/9/7]" : "lg:[grid-area:5/1/9/5]"
                }`}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate">
                        Önerilen roller
                      </p>
                      <p className="mt-2 font-display text-xl font-semibold leading-tight">
                        {analysis.alternative_jobs?.[0] || analysis.best_job?.title || "Rol önerisi bulunamadı"}
                      </p>
                    </div>
                    <BriefcaseBusiness size={22} className="shrink-0 text-ember" />
                  </div>

                  <div className="space-y-2">
                    {(analysis.alternative_jobs || []).slice(1, 3).map((job, index) => (
                      <div
                        key={job}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-ink/5 px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-xs font-semibold text-slate">
                          {job}
                        </span>
                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ink">
                          {index === 0 ? "Yakın" : "Alternatif"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

          </>
        ) : (
          null
        )}
        </LayoutGroup>
      </section>
      {analysis && selectedNearbyJob && (
        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-10 sm:px-6 lg:px-8">
          <JobDetailPanel job={selectedNearbyJob} panelRef={jobDetailRef} />
        </section>
      )}
      </main>
    </>
  );
}

export default function App() {
  const { pathname, navigate } = usePathname();
  const currentPath = ["/cv-analizi", "/pricing"].includes(pathname) ? pathname : "/";

  return (
    <div className="min-h-screen text-ink">
      <Navbar pathname={currentPath} onNavigate={navigate} />
      {currentPath === "/cv-analizi" ? (
        <AnalyzePage />
      ) : currentPath === "/pricing" ? (
        <Pricing onNavigate={navigate} />
      ) : (
        <LandingPage pathname={currentPath} onNavigate={navigate} />
      )}
    </div>
  );
}
