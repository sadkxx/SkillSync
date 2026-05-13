import { ArrowRight, BadgeCheck, Check, FileSearch, MapPin, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Boxes } from "./background-boxes";

const plans = [
  {
    name: "Başlangıç",
    price: "0 TL",
    period: "ilk rapor",
    description: "CV ve ilan eşleşmesini denemek isteyen adaylar için.",
    cta: "Ücretsiz dene",
    featured: false,
    features: [
      "1 CV ve ilan analizi",
      "Uyum skoru ve kısa özet",
      "Eksik beceri listesi",
      "Mock yakın ilan önerileri"
    ]
  },
  {
    name: "Aday Plus",
    price: "149 TL",
    period: "aylık",
    description: "Aktif başvuru sürecinde olan ve her ilanı kontrol etmek isteyenler için.",
    cta: "Plus ile başla",
    featured: true,
    features: [
      "Sınırsız CV ve ilan analizi",
      "Detaylı beceri kırılımı",
      "Konuma göre ilan haritası",
      "CV iyileştirme öncelikleri",
      "Başvuru geçmişi ve karşılaştırma"
    ]
  },
  {
    name: "Kariyer Pro",
    price: "399 TL",
    period: "aylık",
    description: "Koçlar, bootcamp ekipleri ve yoğun aday takibi yapan ekipler için.",
    cta: "Demo iste",
    featured: false,
    features: [
      "Ekip paneli ve aday listesi",
      "Toplu CV değerlendirme",
      "Rol bazlı rapor şablonları",
      "Öncelikli destek",
      "API entegrasyonu hazırlığı"
    ]
  }
];

const highlights = [
  {
    icon: FileSearch,
    label: "Analiz",
    value: "CV + ilan",
    text: "Tek ekranda beceri, deneyim ve anahtar kelime uyumu."
  },
  {
    icon: MapPin,
    label: "Konum",
    value: "Haritalı öneri",
    text: "Yakındaki fırsatları uyum skoru ile birlikte gör."
  },
  {
    icon: ShieldCheck,
    label: "Kontrol",
    value: "Net rapor",
    text: "Başvuru öncesi eksik kalan başlıkları ayır."
  }
];

export default function Pricing({ onNavigate }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
        <Boxes className="opacity-55" />
        <div className="pointer-events-none absolute inset-0 z-20 bg-slate-950 [mask-image:radial-gradient(transparent,white)]" />
        <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.54)_54%,rgba(2,6,23,0.82))]" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-40 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 backdrop-blur">
              <Sparkles size={14} />
              Ücretlendirme
            </div>
            <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.02] text-white md:text-7xl">
              Başvuru kararını
              <span className="block text-gold">daha net ver.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              SkillSync planları CV ve ilan eşleşmesini hızlıca denemek,
              düzenli başvuru takibi yapmak veya aday portföyünü ekip olarak
              yönetmek için tasarlandı.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, label, value, text }) => (
              <div
                key={label}
                className="rounded-[28px] border border-white/12 bg-white/10 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink">
                  <Icon size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                  {label}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-white">
                  {value}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/58">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex min-h-[560px] flex-col overflow-hidden rounded-[34px] border p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur ${
                plan.featured
                  ? "border-ember/45 bg-white text-ink"
                  : "border-white/12 bg-white/10 text-white"
              }`}
            >
              {plan.featured && (
                <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-mist">
                  <Zap size={14} />
                  Önerilen
                </div>
              )}

              <div className="pr-24">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                    plan.featured ? "text-ember" : "text-gold/70"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="font-display text-5xl font-bold leading-none">
                    {plan.price}
                  </span>
                  <span
                    className={`pb-1 text-sm font-semibold ${
                      plan.featured ? "text-slate" : "text-white/50"
                    }`}
                  >
                    / {plan.period}
                  </span>
                </div>
                <p
                  className={`mt-5 min-h-[72px] text-sm leading-7 ${
                    plan.featured ? "text-slate" : "text-white/62"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div
                className={`my-7 h-px ${
                  plan.featured ? "bg-ink/10" : "bg-white/12"
                }`}
              />

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        plan.featured ? "bg-moss/20 text-ink" : "bg-white/10 text-moss"
                      }`}
                    >
                      <Check size={14} />
                    </span>
                    <span className={plan.featured ? "text-ink" : "text-white/72"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onNavigate?.("/cv-analizi")}
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition ${
                  plan.featured
                    ? "bg-ember text-white shadow-[0_18px_44px_rgba(255,122,89,0.26)] hover:bg-ember/90"
                    : "border border-white/14 bg-white/8 text-white hover:bg-white/14"
                }`}
              >
                {plan.cta}
                <ArrowRight size={17} />
              </button>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[34px] border border-white/12 bg-white/10 p-6 backdrop-blur">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Plan karşılaştırması
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold">
                  Deneme ücretsiz, değer gördüğünde büyüt.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.("/cv-analizi")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-ink transition hover:bg-white/90"
              >
                Analiz ekranına git
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/12 bg-ink/80 p-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold text-ink">
                <BadgeCheck size={22} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold">
                  Backend bağlanınca plan limitleri canlı yönetilecek.
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Şimdilik ekran mock ürün paketlerini gösteriyor; ödeme,
                  kullanıcı limiti ve ekip paneli entegrasyonları backend ile
                  birlikte netleşecek.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
