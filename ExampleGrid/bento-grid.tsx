"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  Globe,
  Code2,
  Zap,
  Camera,
  Music,
  Layers,
  MessageSquare,
  Shield,
  X,
} from "lucide-react";

interface BentoItem {
  id: number;
  title: string;
  description: string;
  expandedDescription: string;
  icon: React.ReactNode;
  accentColor: string;
  bgPattern: string;
  tag: string;
  colSpan: number;
  rowSpan: number;
}

const items: BentoItem[] = [
  {
    id: 1,
    title: "Yapay Zeka Asistan",
    description: "Akıllı görev yönetimi ve otomasyon araçları.",
    expandedDescription:
      "Gelişmiş yapay zeka modelleri ile günlük iş akışlarınızı otomatikleştirin. Doğal dil işleme, görüntü tanıma ve öngörücü analiz özellikleriyle verimliliğinizi katlayın. 50+ entegrasyon ve özelleştirilebilir iş akışları ile her ekip için ideal çözüm.",
    icon: <Sparkles className="w-6 h-6" />,
    accentColor: "from-[oklch(0.55_0.22_290)] to-[oklch(0.45_0.2_270)]",
    bgPattern: "radial-gradient(circle at 80% 20%, oklch(0.55 0.22 290 / 0.15) 0%, transparent 60%)",
    tag: "AI",
    colSpan: 2,
    rowSpan: 2,
  },
  {
    id: 2,
    title: "Analitik Pano",
    description: "Gerçek zamanlı veri görselleştirme.",
    expandedDescription:
      "100+ kaynaktan toplanan verileri tek panoda inceleyin. Özelleştirilebilir widget'lar, otomatik raporlar ve anlık bildirimlerle ekibinizin her zaman güncel kalmasını sağlayın.",
    icon: <BarChart3 className="w-6 h-6" />,
    accentColor: "from-[oklch(0.55_0.22_200)] to-[oklch(0.45_0.2_180)]",
    bgPattern: "radial-gradient(circle at 20% 80%, oklch(0.55 0.22 200 / 0.15) 0%, transparent 60%)",
    tag: "Analytics",
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 3,
    title: "Global Ağ",
    description: "Dünya genelinde bağlantı altyapısı.",
    expandedDescription:
      "180+ ülkede CDN altyapısı ile içeriklerinizi ışık hızında dağıtın. Otomatik yük dengeleme, sıfır kesinti süresi garantisi ve GDPR uyumlu veri işleme ile küresel bir deneyim sunun.",
    icon: <Globe className="w-6 h-6" />,
    accentColor: "from-[oklch(0.62_0.18_155)] to-[oklch(0.5_0.16_140)]",
    bgPattern: "radial-gradient(circle at 50% 50%, oklch(0.62 0.18 155 / 0.12) 0%, transparent 70%)",
    tag: "Network",
    colSpan: 1,
    rowSpan: 2,
  },
  {
    id: 4,
    title: "Kod Editör",
    description: "Entegre geliştirme ortamı.",
    expandedDescription:
      "Bulut tabanlı IDE ile her cihazdan kodlayın. Gerçek zamanlı işbirliği, 200+ dil desteği, yapay zeka destekli kod tamamlama ve otomatik hata ayıklama özellikleriyle geliştirme sürecinizi hızlandırın.",
    icon: <Code2 className="w-6 h-6" />,
    accentColor: "from-[oklch(0.72_0.18_70)] to-[oklch(0.6_0.16_55)]",
    bgPattern: "radial-gradient(circle at 90% 90%, oklch(0.72 0.18 70 / 0.12) 0%, transparent 60%)",
    tag: "Dev",
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: 5,
    title: "Performans",
    description: "Yüksek hız ve güvenilirlik.",
    expandedDescription:
      "99.99% uptime garantisi ve ortalama 12ms yanıt süresi ile kullanıcılarınıza kesintisiz deneyim sunun. Otomatik ölçekleme ve akıllı önbellekleme ile trafik artışlarını sorunsuz yönetin.",
    icon: <Zap className="w-6 h-6" />,
    accentColor: "from-[oklch(0.62_0.22_10)] to-[oklch(0.52_0.2_355)]",
    bgPattern: "radial-gradient(circle at 10% 10%, oklch(0.62 0.22 10 / 0.15) 0%, transparent 60%)",
    tag: "Speed",
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 6,
    title: "Medya Stüdyo",
    description: "Profesyonel içerik üretim araçları.",
    expandedDescription:
      "4K video düzenleme, RAW fotoğraf işleme ve canlı yayın araçları ile içerik üretiminizi bir üst seviyeye taşıyın. Yapay zeka destekli arka plan kaldırma, renk düzeltme ve ses iyileştirme özellikleri dahildir.",
    icon: <Camera className="w-6 h-6" />,
    accentColor: "from-[oklch(0.65_0.2_260)] to-[oklch(0.55_0.18_280)]",
    bgPattern: "radial-gradient(circle at 80% 80%, oklch(0.65 0.2 260 / 0.15) 0%, transparent 60%)",
    tag: "Media",
    colSpan: 3,
    rowSpan: 1,
  },
  {
    id: 7,
    title: "Ses Motoru",
    description: "Uzamsal ses ve müzik üretimi.",
    expandedDescription:
      "3D uzamsal ses teknolojisi, yapay zeka müzik bestesi ve gerçek zamanlı ses efektleri ile projelerinize sinematik bir kalite katın. 120+ profesyonel ses paketi ve VST eklenti desteği mevcuttur.",
    icon: <Music className="w-6 h-6" />,
    accentColor: "from-[oklch(0.6_0.18_190)] to-[oklch(0.5_0.16_175)]",
    bgPattern: "radial-gradient(circle at 30% 60%, oklch(0.6 0.18 190 / 0.15) 0%, transparent 60%)",
    tag: "Audio",
    colSpan: 1,
    rowSpan: 3,
  },
  {
    id: 8,
    title: "Katman Sistemi",
    description: "Modüler bileşen mimarisi.",
    expandedDescription:
      "Sürükle-bırak arayüzü ile karmaşık iş akışlarını görsel olarak oluşturun. 500+ hazır bileşen, özelleştirilebilir şablonlar ve gerçek zamanlı önizleme ile tasarım-geliştirme sürecini birleştirin.",
    icon: <Layers className="w-6 h-6" />,
    accentColor: "from-[oklch(0.65_0.22_30)] to-[oklch(0.55_0.2_15)]",
    bgPattern: "radial-gradient(circle at 60% 30%, oklch(0.65 0.22 30 / 0.12) 0%, transparent 60%)",
    tag: "Design",
    colSpan: 2,
    rowSpan: 2,
  },
  {
    id: 9,
    title: "Mesajlaşma",
    description: "Ekip içi anlık iletişim.",
    expandedDescription:
      "Uçtan uca şifreli mesajlaşma, video konferans ve dosya paylaşımı ile ekibinizi her zaman bağlı tutun. Yapay zeka destekli toplantı özetleri, görev takibi ve 80+ üçüncü taraf entegrasyonuyla iletişimi merkezileştirin.",
    icon: <MessageSquare className="w-6 h-6" />,
    accentColor: "from-[oklch(0.55_0.22_290)] to-[oklch(0.45_0.2_310)]",
    bgPattern: "radial-gradient(circle at 40% 70%, oklch(0.55 0.22 290 / 0.15) 0%, transparent 60%)",
    tag: "Collab",
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: 10,
    title: "Güvenlik Kalkanı",
    description: "Kurumsal düzeyde koruma.",
    expandedDescription:
      "Sıfır güven mimarisi, yapay zeka destekli tehdit tespiti ve otomatik güvenlik yamaları ile verilerinizi 7/24 koruyun. SOC 2 Type II, ISO 27001 ve PCI DSS sertifikaları ile uyumluluk gereksinimlerinizi karşılayın.",
    icon: <Shield className="w-6 h-6" />,
    accentColor: "from-[oklch(0.62_0.18_155)] to-[oklch(0.52_0.16_170)]",
    bgPattern: "radial-gradient(circle at 70% 50%, oklch(0.62 0.18 155 / 0.12) 0%, transparent 60%)",
    tag: "Security",
    colSpan: 1,
    rowSpan: 2,
  },
];

function BentoCard({
  item,
  isExpanded,
  onToggle,
  style,
}: {
  item: BentoItem;
  isExpanded: boolean;
  onToggle: () => void;
  style: React.CSSProperties;
}) {
  return (
    <motion.div
      layout
      layoutId={`card-${item.id}`}
      onClick={onToggle}
      className="relative overflow-hidden rounded-2xl border border-border cursor-pointer group"
      style={{
        ...style,
        background: `${item.bgPattern}, oklch(0.17 0.015 250)`,
      }}
      initial={false}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      whileHover={{ scale: isExpanded ? 1 : 1.015 }}
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 35 },
        scale: { duration: 0.2 },
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
    >
      {/* Gradient border shimmer on hover */}
      <motion.div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl bg-gradient-to-br ${item.accentColor} pointer-events-none`}
        style={{ padding: "1px" }}
        transition={{ duration: 0.3 }}
      />

      {/* Inner content */}
      <div className={`relative z-10 h-full flex flex-col ${isExpanded ? "p-8" : "p-5"}`}>
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            layout="position"
            className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${item.accentColor} text-foreground shadow-lg ${isExpanded ? "w-14 h-14" : "w-11 h-11"}`}
            transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
          >
            {item.icon}
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.span
              layout="position"
              className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-secondary text-muted-foreground"
            >
              {item.tag}
            </motion.span>
            <AnimatePresence>
              {isExpanded && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <motion.h3
          layout="position"
          className={`font-semibold text-foreground leading-tight ${isExpanded ? "text-2xl mb-3" : "text-base mb-2"}`}
          transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
        >
          {item.title}
        </motion.h3>

        {/* Description */}
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.05, duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl mb-6">
                {item.expandedDescription}
              </p>
              <div className="mt-auto flex items-center gap-3">
                <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-secondary to-muted text-foreground">
                  Daha fazla bilgi
                </span>
                <span className="text-xs text-muted-foreground">
                  Boyut: {item.colSpan}x{item.rowSpan}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground text-xs leading-relaxed line-clamp-2 flex-1"
            >
              {item.description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Expand hint */}
        {!isExpanded && (
          <motion.div
            className="mt-auto pt-3 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-[10px] text-muted-foreground font-mono">
              {item.colSpan}x{item.rowSpan}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Genişlet
              </span>
              <motion.span
                className="text-xs text-muted-foreground"
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </div>
          </motion.div>
        )}

        {/* Decorative bottom accent */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.accentColor} opacity-50`}
        />
      </div>
    </motion.div>
  );
}

export function BentoGrid() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Compute grid styles for each item
  const gridStyles = useMemo(() => {
    return items.map((item) => {
      const isExpanded = expandedId === item.id;
      
      if (isExpanded) {
        return {
          gridColumn: "1 / -1",
          gridRow: "span 2",
        };
      }
      
      return {
        gridColumn: `span ${item.colSpan}`,
        gridRow: `span ${item.rowSpan}`,
      };
    });
  }, [expandedId]);

  return (
    <LayoutGroup>
      <motion.div
        layout
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "120px",
          gridAutoFlow: "dense",
        }}
        transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
      >
        {items.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <BentoCard
              key={item.id}
              item={item}
              isExpanded={isExpanded}
              onToggle={() => handleToggle(item.id)}
              style={gridStyles[index]}
            />
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}
