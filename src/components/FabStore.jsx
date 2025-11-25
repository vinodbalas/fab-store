import { useMemo, useRef, useState, useEffect } from "react";
import { Sparkles, Search, ArrowRight, ChevronDown, User } from "lucide-react";
import { fabApps } from "../data/fabApps";
import StoreFooter from "./StoreFooter";

const sortOptions = [
  { value: "name", label: "Alphabetical" },
  { value: "status", label: "Status (Live → Coming)" },
];

const statusPriority = { Live: 0, Preview: 1, Beta: 2, "Coming Soon": 3 };

function FabStore({ onLaunch, readOnly = false, onRequestLogin }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [sort, setSort] = useState("status");
  const [showDemoForm, setShowDemoForm] = useState(false);
  const catalogRef = useRef(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(fabApps.map((app) => app.category)));
    return ["All", ...unique];
  }, []);

  const industries = useMemo(() => {
    const unique = Array.from(new Set(fabApps.map((app) => app.industry)));
    return ["All", ...unique];
  }, []);

  const spotlightApps = fabApps.slice(0, 2);
  const liveCount = fabApps.filter((app) => app.status === "Live").length;
  const pipelineCount = fabApps.filter((app) => app.status !== "Live").length;
  const heroSlides = fabApps.slice(0, 4).map((app, idx) => ({
    ...app,
    previewPanels: [
      {
        title: `${app.name} Command`,
        description: "Ops cockpit · KPI streak · SLA health",
        pill: "Live control",
      },
      {
        title: "AI Telemetry",
        description: "Reasoning traces · Confidence bands",
        pill: idx % 2 === 0 ? "FAB Core" : "Roadmap",
      },
    ],
  }));
  const trendingApps = fabApps.filter((app) => app.status === "Live");
  const pipelineApps = fabApps.filter((app) => app.status !== "Live");

  const filteredApps = useMemo(() => {
    const query = search.toLowerCase();
    const base = fabApps.filter((app) => {
      const matchesCategory = category === "All" || app.category === category;
      const matchesIndustry = industry === "All" || app.industry === industry;
      const matchesQuery =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesIndustry && matchesQuery;
    });
    return base.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const pa = statusPriority[a.status] ?? 99;
      const pb = statusPriority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name);
    });
  }, [category, industry, search, sort]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FF]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(155,138,255,0.18),transparent_55%),radial-gradient(circle_at_75%_15%,rgba(118,196,255,0.16),transparent_55%),radial-gradient(circle_at_50%_85%,rgba(255,208,233,0.2),transparent_50%)] pointer-events-none" />
      <div className="relative flex flex-col min-h-screen">
        <TopNav
          search={search}
          onSearchChange={setSearch}
          readOnly={readOnly}
          onRequestLogin={onRequestLogin}
          onRequestDemo={() => setShowDemoForm(true)}
        />
        <div className="space-y-10 pb-16 pt-6 flex-1">
        <HeroCarousel
        slides={heroSlides}
        readOnly={readOnly}
        onRequestLogin={onRequestLogin}
        onLaunch={onLaunch}
      />

      <section className="px-4 md:px-10" ref={catalogRef}>
        <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_45px_85px_rgba(15,10,45,0.15)] p-6 md:p-10 space-y-6 backdrop-blur">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5C36C8]">Full catalog</div>
            <div className="flex flex-wrap gap-2">
              <FilterPill label="Category" activeValue={category} options={categories} onSelect={setCategory} />
              <FilterPill label="Industry" activeValue={industry} options={industries} onSelect={setIndustry} />
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} onLaunch={onLaunch} readOnly={readOnly} onRequestLogin={onRequestLogin} />
            ))}
            {filteredApps.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                No apps found. Try a different search term.
              </div>
            )}
          </div>
        </div>
      </section>

      <SectionRow
        title="Coming soon & roadmap"
        subtitle="Preview, beta, and roadmap launches"
        apps={pipelineApps}
        readOnly={readOnly}
        onRequestLogin={onRequestLogin}
        onLaunch={onLaunch}
      />
      </div>
      <StoreFooter />
      <DemoRequestModal open={showDemoForm} onClose={() => setShowDemoForm(false)} />
    </div>
  </div>
  );
}

export default FabStore;

function TopNav({ search, onSearchChange, readOnly, onRequestLogin, onRequestDemo }) {
  const navItems = ["Home", "Apps", "Solutions", "About"];
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_10px_30px_rgba(15,14,63,0.12)] text-gray-900">
      <div className="w-full px-4 lg:px-10 py-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2">
            <img src="/tp-logo.svg" alt="TP.ai" className="h-8 w-auto" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">TP.ai</p>
              <p className="text-sm font-semibold text-gray-900">FAB Store</p>
            </div>
          </div>
          <span className="hidden sm:block h-6 w-px bg-gray-200" />
          <nav className="flex items-center gap-5 text-sm font-semibold text-gray-500">
            {navItems.map((item, idx) => (
              <button
                key={item}
                className={`pb-1 border-b-2 transition ${
                  idx === 0 ? "text-gray-900 border-gray-900" : "border-transparent hover:text-[#612D91]"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-[260px]">
          <div className="relative flex-1 min-w-[200px] md:min-w-[280px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search apps, solutions, industries"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CBB7FF]/50"
            />
          </div>
          <button
            type="button"
            onClick={onRequestDemo}
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#4C2DBF] bg-[#E8E2FF] border border-[#D3C5FF] hover:bg-white"
          >
            Request demo
          </button>
          <button
            onClick={readOnly ? onRequestLogin : undefined}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#612D91] to-[#A960FF] text-sm font-semibold text-white shadow-[0_10px_25px_rgba(99,42,191,0.25)]"
          >
            <User className="w-4 h-4" />
            {readOnly ? "Sign in" : "Manage"}
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroCarousel({ slides, readOnly, onRequestLogin, onLaunch }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const activeSlide = slides[index];
  if (!activeSlide) return null;

  const sideSlides = [];
  const targetCount = Math.min(2, Math.max(0, slides.length - 1));
  for (let offset = 1; sideSlides.length < targetCount; offset += 1) {
    const candidate = slides[(index + offset) % slides.length];
    if (candidate.id !== activeSlide.id && !sideSlides.find((s) => s.id === candidate.id)) {
      sideSlides.push(candidate);
    }
    if (offset > slides.length * 2) break;
  }

  const interactCard = {
    id: "interact-preview",
    category: "Experience",
    status: "Concept",
    statusColor: "bg-[#F8EFFF] text-[#6F34E8]",
    name: "Interact",
    description: "AI-guided co-pilots that amplify human-centered experiences across voice, chat, and in-context surfaces.",
    tags: ["Human-in-loop", "AI Personas"],
    metrics: [
      { label: "Channels", value: "Voice · Chat · Canvas" },
      { label: "Persona sync", value: "Realtime" },
    ],
    industry: "Cross-vertical",
    vertical: "Engagement",
  };

  const secondaryCards = [...sideSlides];
  if (secondaryCards.length < 2) {
    secondaryCards.push(interactCard);
  }

  return (
    <section className="px-4 md:px-10 space-y-6">
      <div className="w-full grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.55fr)] items-stretch">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-white via-[#F2F5FF] to-[#E6E9FF] text-gray-900 shadow-[0_18px_50px_rgba(105,128,255,0.18)] border border-white/60 min-h-[320px]">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,_rgba(114,102,255,0.25),_transparent_60%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] p-6 md:p-8 items-start">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2DEFF] text-xs uppercase tracking-[0.4em] text-[#6F54E8]">
                TP.ai FAB
                <Sparkles className="w-4 h-4 text-[#F5B52A]" />
              </div>
              <div className="space-y-3 max-w-2xl">
                <p className="text-sm uppercase tracking-[0.35em] text-gray-400">{activeSlide.category}</p>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{activeSlide.name}</h1>
                <p className="text-base md:text-lg text-gray-600">{activeSlide.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSlide.tags?.slice(0, 4).map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs uppercase tracking-wide bg-white text-gray-700 border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (readOnly) {
                      onRequestLogin?.();
                      return;
                    }
                    if (activeSlide.launchKey) {
                      onLaunch?.(activeSlide.launchKey);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#612D91] to-[#A960FF] text-white font-semibold text-sm shadow-[0_12px_30px_rgba(97,45,145,0.35)]"
                >
                  Launch {activeSlide.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#DDD7FF] text-gray-700 font-semibold text-sm bg-white/80 hover:bg-white">
                  Watch product film
                </button>
                {readOnly && (
                  <button
                    onClick={onRequestLogin}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#E6D8FF] text-[#612D91] font-semibold text-sm"
                  >
                    Sign in to launch
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                {activeSlide.metrics?.slice(0, 3).map((metric) => (
                  <div key={metric.label}>
                    <div className="text-[11px] uppercase tracking-[0.35em] text-gray-400 font-semibold">{metric.label}</div>
                    <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] bg-white shadow-[0_30px_80px_rgba(20,16,66,0.15)] border border-[#E8E7FF] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">In-market telemetry</p>
                  <h3 className="text-xl font-semibold text-gray-900">FAB intelligence feed</h3>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[#F4F1FF] text-[#5C36C8] text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  Live · FAB shared core
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Active sessions", value: "1,284", delta: "+12%" },
                  { label: "Playbooks triggered", value: "436", delta: "+8%" },
                  { label: "Median confidence", value: "96.4%", delta: "+2.1 pts" },
                  { label: "SLA streak", value: "42 hrs", delta: "stable" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-gray-100 px-4 py-3 bg-gray-50">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 font-semibold">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                      <span className="text-xs text-gray-500">{stat.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="uppercase tracking-[0.35em] text-gray-400 font-semibold">Trusted by</span>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-[#E5E1FF] to-[#F7F4FF] border border-white shadow" />
                ))}
                <span className="text-gray-400">+18 enterprise teams</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Claims", "Banking", "Telco", "Retail", "Healthcare"].map((chip) => (
                  <button
                    key={chip}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-[#6F54E8] hover:text-[#6F54E8]"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-[#6F54E8] text-[#6F54E8] font-semibold hover:bg-[#F4F1FF] transition text-sm">
                View store insights
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid h-full gap-4 lg:grid-rows-2 bg-gradient-to-br from-white/70 via-[#F4F5FF]/80 to-white/70 rounded-[30px] p-4 border border-white/60 shadow-[0_18px_50px_rgba(105,128,255,0.1)]">
          {secondaryCards.slice(0, 2).map((slide) => (
            <MiniSpotlightCard
              key={slide.id}
              slide={slide}
              disabled={slide.id === "interact-preview"}
              onSelect={() => {
                if (slide.id === "interact-preview") return;
                const target = slides.findIndex((item) => item.id === slide.id);
                if (target >= 0) setIndex(target);
              }}
            />
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-[#6F54E8]" : "w-3 bg-gray-300/50"}`}
          />
        ))}
      </div>
    </section>
  );
}

function MiniSpotlightCard({ slide, onSelect, disabled = false }) {
  if (!slide) return null;
  const baseClasses =
    "rounded-[18px] border bg-white shadow-[0_14px_35px_rgba(20,16,66,0.12)] px-4 py-4 text-left flex flex-col gap-2 transition h-full";
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      className={`${baseClasses} ${disabled ? "border-dashed border-[#E2DEFF] text-gray-500 bg-white/80 cursor-default" : "border-white hover:border-[#6F54E8]"}`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-500">
        <span>{slide.category}</span>
        <span className={`px-2 py-0.5 rounded-full ${slide.statusColor || "bg-gray-100 text-gray-700"}`}>{slide.status}</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-gray-900">{slide.name}</p>
        <p className="text-sm text-gray-500 line-clamp-2">{slide.description}</p>
        <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
          {slide.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100">
              {tag}
            </span>
          ))}
          {slide.metrics?.slice(0, 2).map((metric) => (
            <span key={metric.label} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
              {metric.label}: {metric.value}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-[0.2em]">
        <span>{slide.industry}</span>
        <span>{slide.vertical ?? slide.category}</span>
      </div>
      {!disabled && <span className="text-sm font-semibold text-[#6F54E8]">View spotlight →</span>}
      {disabled && <span className="text-sm font-semibold text-gray-400">Interact preview</span>}
    </button>
  );
}

function SectionRow({ title, subtitle, apps, readOnly, onRequestLogin, onLaunch }) {
  if (!apps.length) return null;
  return (
    <section className="px-6 md:px-10 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <button className="text-sm font-semibold text-[#5C36C8] hover:text-[#2D0B7A]">Show all</button>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-full snap-x snap-mandatory">
          {apps.map((app) => (
            <MiniAppTile
              key={app.id}
              app={app}
              readOnly={readOnly}
              onRequestLogin={onRequestLogin}
              onLaunch={onLaunch}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniAppTile({ app, readOnly, onRequestLogin, onLaunch }) {
  return (
    <div className="snap-start min-w-[280px] max-w-sm rounded-3xl border border-white/30 bg-white/90 backdrop-blur shadow-[0_25px_45px_rgba(12,8,45,0.18)] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide">
        <div className="flex items-center gap-2">
          <span className={app.categoryColor}>{app.category}</span>
          <span>•</span>
          <span className={`px-2 py-0.5 rounded-full ${app.statusColor || "bg-gray-100 text-gray-700"}`}>{app.status}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium">
            ★ {app.rating ?? "4.9"}
          </span>
          <button
            type="button"
            className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:text-[#612D91] hover:border-[#612D91]/40 transition"
            aria-label="Favorite"
          >
            ♥
          </button>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{app.name}</h4>
        <p className="text-sm text-gray-500">{app.tagline}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
        <div className="rounded-2xl border border-gray-200 px-3 py-2">
          <p className="uppercase tracking-wide text-gray-400">Industry</p>
          <p className="font-semibold text-gray-700">{app.industry}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 px-3 py-2">
          <p className="uppercase tracking-wide text-gray-400">Vertical</p>
          <p className="font-semibold text-gray-700">{app.vertical ?? app.category}</p>
        </div>
      </div>
      <div className="text-xs text-gray-600">
        <p className="uppercase tracking-wide text-gray-400">USP</p>
        <p>{app.usp ?? "AI + SOP-native orchestration"}</p>
      </div>
      <div className="text-xs text-gray-600">
        <p className="uppercase tracking-wide text-gray-400">Models</p>
        <p>{app.models ?? "GPT-4o mini · Sonnet 3.5 · FAB RAG"}</p>
      </div>
      <div className="text-xs text-gray-500 flex flex-wrap gap-1">
        {(app.tagsOverride ?? app.tags)?.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={() => {
          if (readOnly) {
            onRequestLogin?.();
            return;
          }
          if (app.launchKey) {
            onLaunch?.(app.launchKey);
          }
        }}
        className="mt-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#612D91] to-[#A960FF] text-white text-sm font-semibold shadow-[0_12px_25px_rgba(97,45,145,0.35)]"
      >
        {readOnly ? "Sign in" : app.ctaLabel || "Open"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function AppCard({ app, onLaunch, readOnly, onRequestLogin }) {
  return (
    <div className="rounded-[28px] border border-white/40 bg-white/95 shadow-[0_20px_50px_rgba(18,12,64,0.15)] flex flex-col overflow-hidden">
      <div className={`h-1.5 w-full bg-gradient-to-r ${app.accent}`} />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center flex-wrap gap-2 text-xs uppercase tracking-wide text-gray-500">
          <span className={app.categoryColor}>{app.category}</span>
          <span className={`px-2 py-0.5 rounded-full ${app.statusColor || "bg-gray-100 text-gray-700"}`}>{app.status}</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{app.name}</h3>
          <p className="text-sm text-gray-600 font-medium">{app.tagline}</p>
        </div>
        <p className="text-sm text-gray-600 flex-1">{app.description}</p>

        <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
          <div className="rounded-2xl border border-gray-200/80 px-3 py-1.5">
            <p className="uppercase tracking-wide text-gray-500 font-semibold">Industry</p>
            <p className="font-semibold text-gray-900">{app.industry}</p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 px-3 py-1.5">
            <p className="uppercase tracking-wide text-gray-500 font-semibold">Vertical</p>
            <p className="font-semibold text-gray-900">{app.vertical ?? app.category}</p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 px-3 py-1.5">
            <p className="uppercase tracking-wide text-gray-500 font-semibold">Models</p>
            <p className="font-semibold text-gray-900">{app.models ?? "GPT-4o mini · Sonnet 3.5"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-gray-600">
          {app.tags?.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (readOnly) {
              onRequestLogin?.();
              return;
            }
            if (app.launchKey) {
              onLaunch?.(app.launchKey);
            }
          }}
          className="mt-auto inline-flex items-center justify-between rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#612D91] hover:border-[#612D91]/60 transition"
        >
          {readOnly ? "Sign in to launch" : app.ctaLabel || "Open"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function FilterPill({ label, activeValue, options, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 shadow-[0_6px_18px_rgba(15,14,63,0.08)]">
      <span className="uppercase tracking-wide text-gray-500">{label}</span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-2.5 py-1 rounded-xl transition ${
            activeValue === option
              ? "bg-[#612D91] text-white shadow"
              : "text-gray-600 hover:text-[#612D91]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function SortSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 shadow-[0_6px_18px_rgba(15,14,63,0.08)]">
      <span className="uppercase tracking-wide text-gray-500">Sort</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent pr-6"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-white text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function DemoRequestModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="max-w-lg w-full rounded-3xl bg-white shadow-[0_30px_80px_rgba(15,14,63,0.25)] border border-gray-100 p-6 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">TP.ai FAB</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">Schedule a briefing</h3>
          <p className="text-sm text-gray-500 mt-1">
            Share a few details and we’ll align a live walkthrough tailored to your use case.
          </p>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-gray-600 space-y-1">
              <span>Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CBB7FF]/50"
                placeholder="Alex Morgan"
                required
              />
            </label>
            <label className="text-sm text-gray-600 space-y-1">
              <span>Work email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CBB7FF]/50"
                placeholder="you@company.com"
                required
              />
            </label>
          </div>
          <label className="text-sm text-gray-600 space-y-1">
            <span>Company / Program</span>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CBB7FF]/50"
              placeholder="Teleperformance Claims Ops"
            />
          </label>
          <label className="text-sm text-gray-600 space-y-1">
            <span>Focus areas</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CBB7FF]/50"
              placeholder="Example: Claims AI + compliance guardrails, demo priority queue and SOP mapping…"
            />
          </label>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>We’ll follow up within one business day.</span>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#612D91] to-[#A960FF] text-white text-sm font-semibold py-3 shadow-[0_15px_35px_rgba(97,45,145,0.35)]"
          >
            Submit request
          </button>
        </form>
      </div>
    </div>
  );
}

