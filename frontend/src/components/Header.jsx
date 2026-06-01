export default function Header({ pathname, onNavigate }) {
  const isHome = pathname === "/";
  const isAnalyze = pathname === "/cv-analizi";

  function navButton(label, target, active) {
    return (
      <button
        type="button"
        onClick={() => onNavigate(target)}
        className={`transition ${
          active ? "text-white" : "text-white/75 hover:text-white"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div>
          <p className="font-display text-xl font-bold tracking-[0.24em] text-mist">
            SKILLSYNC
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/55">
            Akıllı CV Analizi
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-white/75 md:flex">
          {navButton("Ana Sayfa", "/", isHome)}
          {navButton("CV Analizi", "/cv-analizi", isAnalyze)}
          <button
            type="button"
            onClick={() => onNavigate("/cv-analizi")}
            className="rounded-full bg-ember px-4 py-2 font-semibold text-white transition hover:bg-ember/90"
          >
            Analize Başla
          </button>
        </nav>
      </div>
    </header>
  );
}
