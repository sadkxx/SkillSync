import { BentoGrid } from "@/components/bento-grid";

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-sans px-4 py-16 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <span className="inline-block text-xs font-mono font-medium tracking-widest uppercase text-primary mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10">
          Dashboard
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground text-balance leading-tight mb-4">
          Güçlü araçlar,{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            sade bir arayüz
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty leading-relaxed">
          Tüm özellikleri tek panoda keşfedin. Bir karta tıklayarak daha fazlasını görün.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto">
        <BentoGrid />
      </div>
    </main>
  );
}
