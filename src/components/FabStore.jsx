import { useMemo, useState, useEffect } from "react";
import { Sparkles, Search, ArrowRight, ChevronDown, User, LogOut, ArrowLeft, Layers, Copy } from "lucide-react";
import { fabApps } from "../data/fabApps";
import { fabModels } from "../data/fabModels";
import { fabPlatforms, getEnrichedPlatforms } from "../data/fabPlatforms";
import { applicationTemplates, getTemplatesByIndustry } from "../data/templates";
import StoreFooter from "./StoreFooter";
import PlatformDetail from "./PlatformDetail";
import TemplateCloner from "./TemplateCloner";
import MySpace from "./MySpace";
import AppBuilder from "./AppBuilder";
import { useAuth } from "../auth/AuthContext";

const sortOptions = [
  { value: "name", label: "Alphabetical" },
  { value: "status", label: "Status (Live → Coming)" },
];

const statusPriority = { Live: 0, Preview: 1, Beta: 2, "Coming Soon": 3 };

function FabStore({ onLaunch, readOnly = false, onRequestLogin, onNavigate }) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [sort, setSort] = useState("status");
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [activeNav, setActiveNav] = useState("store");
  const [modalCategory, setModalCategory] = useState("All");
  const [modalModality, setModalModality] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [platformCategory, setPlatformCategory] = useState("All");
  const [platformIndustry, setPlatformIndustry] = useState("All");
  const [templateIndustry, setTemplateIndustry] = useState("All");
  const [cloningTemplate, setCloningTemplate] = useState(null);
  const [clonedTemplates, setClonedTemplates] = useState(() => {
    // Load cloned templates from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fabStore.clonedTemplates");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const industries = useMemo(() => {
    // Curated list of key industries, enriched from actual apps and templates
    const base = new Set([
      "Healthcare",
      "Financial Services",
      "Contact Center",
      "Banking",
      "Travel",
      "Manufacturing",
      "Retail",
    ]);
    fabApps.forEach((app) => {
      if (app.industry) base.add(app.industry);
    });
    applicationTemplates.forEach((template) => {
      if (template.industry) base.add(template.industry);
    });
    return ["All", ...Array.from(base)];
  }, []);

  const filteredTemplates = useMemo(() => {
    const query = search.toLowerCase();
    const templates = getTemplatesByIndustry(templateIndustry);
    return templates.filter((template) => {
      const matchesQuery =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesQuery;
    });
  }, [templateIndustry, search]);

  const modalCategories = useMemo(() => {
    const unique = Array.from(new Set(fabModels.map((model) => model.category)));
    return ["All", ...unique];
  }, []);

  const modalModalities = useMemo(() => {
    const unique = Array.from(new Set(fabModels.map((model) => model.modality)));
    return ["All", ...unique];
  }, []);

  const platformIndustries = useMemo(() => {
    const base = new Set([
      "Healthcare",
      "Financial Services",
      "Contact Center",
      "Banking",
      "Travel",
    ]);
    fabPlatforms.forEach((platform) => {
      if (platform.industry) base.add(platform.industry);
    });
    return ["All", ...Array.from(base)];
  }, []);

  const filteredPlatforms = useMemo(() => {
    const query = search.toLowerCase();
    const enrichedPlatforms = getEnrichedPlatforms();
    const base = enrichedPlatforms.filter((platform) => {
      const matchesIndustry = platformIndustry === "All" || platform.industry === platformIndustry;
      const matchesQuery =
        !query ||
        platform.name.toLowerCase().includes(query) ||
        platform.description.toLowerCase().includes(query) ||
        platform.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesIndustry && matchesQuery;
    });
    return base.sort((a, b) => {
      const pa = statusPriority[a.status] ?? 99;
      const pb = statusPriority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      // Sort by solution count (descending) as secondary sort
      const aCount = a.metrics?.solutionCount || 0;
      const bCount = b.metrics?.solutionCount || 0;
      if (aCount !== bCount) return bCount - aCount;
      return a.name.localeCompare(b.name);
    });
  }, [platformCategory, platformIndustry, search]);

  // Combine original apps with cloned templates
  const allApps = useMemo(() => {
    return [...fabApps, ...clonedTemplates];
  }, [clonedTemplates]);

  const filteredApps = useMemo(() => {
    const query = search.toLowerCase();
    const base = allApps.filter((app) => {
      const matchesIndustry = industry === "All" || app.industry === industry;
      const matchesQuery =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesIndustry && matchesQuery;
    });
    return base.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const pa = statusPriority[a.status] ?? 99;
      const pb = statusPriority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name);
    });
  }, [industry, search, sort, allApps]);

  const filteredModals = useMemo(() => {
    return fabModels.filter((model) => {
      const matchesCategory = modalCategory === "All" || model.category === modalCategory;
      const matchesModality = modalModality === "All" || model.modality === modalModality;
      return matchesCategory && matchesModality;
    });
  }, [modalCategory, modalModality]);

  const handleSectionNavigate = (target) => {
    setActiveNav(target);
    setSelectedPlatform(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlatformBack = () => {
    setSelectedPlatform(null);
  };

  const handleCloneTemplate = (template) => {
    const newClonedTemplates = [...clonedTemplates, template];
    setClonedTemplates(newClonedTemplates);
    if (typeof window !== "undefined") {
      localStorage.setItem("fabStore.clonedTemplates", JSON.stringify(newClonedTemplates));
    }
    setCloningTemplate(null);
  };

  const spotlightApps = allApps.slice(0, 2);
  const heroSlides = allApps.slice(0, 4).map((app, idx) => ({
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
  const pipelineApps = allApps.filter((app) => app.status !== "Live");

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
          onNavSelect={handleSectionNavigate}
          active={activeNav}
        />
        <div className="space-y-10 pb-16 pt-6 flex-1">
          {activeNav === "store" && (
            <>
              <HeroCarousel slides={heroSlides} readOnly={readOnly} onRequestLogin={onRequestLogin} onLaunch={onLaunch} />
              
              {/* Platforms Section */}
              <section className="px-4 md:px-10">
                <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_45px_85px_rgba(15,10,45,0.15)] p-6 md:p-10 space-y-6 backdrop-blur">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5C36C8]">Platforms</div>
                        <p className="text-sm text-gray-600 mt-1">Reusable AI platforms that power multiple solutions</p>
                      </div>
                      <button
                        onClick={() => handleSectionNavigate("platforms")}
                        className="text-sm font-semibold text-[#612D91] hover:text-[#7B3DA1] transition-colors flex items-center gap-1"
                      >
                        View all platforms
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {getEnrichedPlatforms().slice(0, 3).map((platform) => (
                      <PlatformCard key={platform.id} platform={platform} onSelect={handlePlatformSelect} />
                    ))}
                  </div>
                </div>
              </section>

              {/* Solutions Section */}
              <section className="px-4 md:px-10">
                <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_45px_85px_rgba(15,10,45,0.15)] p-6 md:p-10 space-y-6 backdrop-blur">
                  <div className="flex flex-col gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5C36C8]">Solutions</div>
                    <p className="text-sm text-gray-600">Applications built on our platforms</p>
                    <div className="flex flex-wrap gap-2">
                      <FilterPill label="Industry" activeValue={industry} options={industries} onSelect={setIndustry} />
                      <SortSelect value={sort} onChange={setSort} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredApps.map((app) => (
                      <AppCard 
                        key={app.id} 
                        app={app} 
                        onLaunch={onLaunch} 
                        readOnly={readOnly} 
                        onRequestLogin={onRequestLogin}
                        onPlatformClick={handlePlatformSelect}
                        onCloneTemplate={() => setCloningTemplate(app)}
                      />
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
            </>
          )}

          {activeNav === "modals" && (
            <ModelGallery
              models={filteredModals}
              totalModels={fabModels}
              readOnly={readOnly}
              onRequestLogin={onRequestLogin}
              categoryOptions={modalCategories}
              modalityOptions={modalModalities}
              activeCategory={modalCategory}
              activeModality={modalModality}
              onCategoryChange={setModalCategory}
              onModalityChange={setModalModality}
            />
          )}

          {activeNav === "templates" && (
            <section className="px-4 md:px-10">
              <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_45px_85px_rgba(15,10,45,0.15)] p-6 md:p-10 space-y-6 backdrop-blur">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5C36C8]">Template Marketplace</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Clone and customize pre-built templates to create your own solutions
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill label="Industry" activeValue={templateIndustry} options={industries} onSelect={setTemplateIndustry} />
                    <SortSelect value={sort} onChange={setSort} />
                  </div>
                </div>

                {/* Pre-built Templates */}
                {filteredTemplates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-built Templates</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Industry-specific templates ready to clone and customize
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredTemplates.map((template) => (
                        <AppCard 
                          key={template.id} 
                          app={template} 
                          onLaunch={onLaunch} 
                          readOnly={readOnly} 
                          onRequestLogin={onRequestLogin}
                          onPlatformClick={handlePlatformSelect}
                          onCloneTemplate={() => setCloningTemplate(template)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Original Live Apps as Templates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Solutions (Available as Templates)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Clone existing live solutions to create your own customized versions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {fabApps.filter((app) => app.status === "Live").map((app) => (
                      <AppCard 
                        key={app.id} 
                        app={app} 
                        onLaunch={onLaunch} 
                        readOnly={readOnly} 
                        onRequestLogin={onRequestLogin}
                        onPlatformClick={handlePlatformSelect}
                        onCloneTemplate={() => setCloningTemplate(app)}
                      />
                    ))}
                  </div>
                </div>

                {/* Cloned Templates */}
                {clonedTemplates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Cloned Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {clonedTemplates.map((app) => (
                        <AppCard 
                          key={app.id} 
                          app={app} 
                          onLaunch={onLaunch} 
                          readOnly={readOnly} 
                          onRequestLogin={onRequestLogin}
                          onPlatformClick={handlePlatformSelect}
                          onCloneTemplate={() => setCloningTemplate(app)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {clonedTemplates.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Copy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm">No cloned templates yet. Clone a template to get started!</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeNav === "platforms" && !selectedPlatform && (
            <section className="px-4 md:px-10">
              <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_45px_85px_rgba(15,10,45,0.15)] p-6 md:p-10 space-y-6 backdrop-blur">
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5C36C8]">Platform Catalog</div>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill label="Industry" activeValue={platformIndustry} options={platformIndustries} onSelect={setPlatformIndustry} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredPlatforms.map((platform) => (
                    <PlatformCard key={platform.id} platform={platform} onSelect={handlePlatformSelect} />
                  ))}
                  {filteredPlatforms.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                      No platforms found. Try a different search term.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeNav === "platforms" && selectedPlatform && (
            <PlatformDetail platform={selectedPlatform} onBack={handlePlatformBack} onLaunch={onLaunch} readOnly={readOnly} onRequestLogin={onRequestLogin} />
          )}

          {activeNav === "myspace" && (
            <MySpace
              onLaunchBuilder={() => {
                setShowBuilder(true);
                setEditingApp(null);
              }}
              onEditApp={(app) => {
                setEditingApp(app);
                setShowBuilder(true);
              }}
              onViewApp={(app) => {
                if (app.launchKey) {
                  onLaunch?.(app.launchKey);
                }
              }}
            />
          )}

          {showBuilder && (
            <AppBuilder
              app={editingApp}
              onClose={() => {
                setShowBuilder(false);
                setEditingApp(null);
              }}
              onSave={(appData) => {
                const userApps = JSON.parse(localStorage.getItem("fabStore.userApps") || "[]");
                const existingIndex = userApps.findIndex((a) => a.id === appData.id);
                const appToSave = {
                  ...appData,
                  lastModified: new Date().toISOString(),
                  status: appData.status || "Workspace",
                };
                if (existingIndex >= 0) {
                  userApps[existingIndex] = appToSave;
                } else {
                  userApps.push(appToSave);
                }
                localStorage.setItem("fabStore.userApps", JSON.stringify(userApps));
                setShowBuilder(false);
                setEditingApp(null);
                if (activeNav !== "myspace") {
                  handleSectionNavigate("myspace");
                }
              }}
            />
          )}

          {activeNav === "about" && (
            <section className="px-4 md:px-10">
              <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_35px_85px_rgba(15,10,45,0.12)] p-8 space-y-4 backdrop-blur text-gray-700">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5C36C8]">About FAB Store</p>
                <h2 className="text-3xl font-semibold text-gray-900">Operational AI built with guardrails</h2>
                <p>
                  Teleperformance FAB bundles human-centered operations knowledge with modern AI orchestration. Pick a solution blueprint, drop in the modals you need, and stay compliant with SOP-native guardrails.
                </p>
                <p className="text-sm text-gray-500">
                  Need more detail? Reach out via Request Demo and we’ll line up a deep dive.
                </p>
              </div>
            </section>
          )}
      </div>
      <StoreFooter onNavigate={onNavigate} />
      <DemoRequestModal open={showDemoForm} onClose={() => setShowDemoForm(false)} />
      {cloningTemplate && (
        <TemplateCloner
          template={cloningTemplate}
          onClose={() => setCloningTemplate(null)}
          onClone={handleCloneTemplate}
        />
      )}
    </div>
  </div>
  );
}

export default FabStore;

function TopNav({ search, onSearchChange, readOnly, onRequestLogin, onRequestDemo, onNavSelect, active }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { label: "Store", key: "store" },
    { label: "Templates", key: "templates" },
    { label: "Modals", key: "modals" },
    { label: "Platforms", key: "platforms" },
    { label: "My Space", key: "myspace" },
    { label: "About", key: "about" },
  ];
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-white/60 shadow-[0_12px_30px_rgba(15,14,63,0.08)] text-gray-900">
      <div className="w-full px-4 lg:px-12 py-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2">
            <img src="/tp-logo.svg" alt="TP.ai" className="h-9 w-auto" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">TP.ai</p>
              <p className="text-base font-semibold text-gray-900">FAB Store</p>
            </div>
          </div>
          <span className="hidden sm:block h-6 w-px bg-gray-200" />
          <nav className="flex items-center gap-5 text-sm font-semibold text-gray-500">
            {navItems.map(({ label, key }) => {
              const isActive = key === active;
              return (
              <button
                  key={key}
                  onClick={() => onNavSelect?.(key)}
                  className={`relative pb-2 transition ${
                    isActive ? "text-gray-900" : "text-gray-500 hover:text-[#5C36C8]"
                  }`}
              >
                {label}
                {isActive && <span className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-gray-900" />}
              </button>
            );
          })}
          </nav>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-[260px]">
          <div className="relative flex-1 min-w-[220px] md:min-w-[320px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search apps, solutions, industries"
              className="w-full pl-12 pr-4 py-2.5 rounded-full border border-white shadow-[0_12px_40px_rgba(22,19,70,0.12)] bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D9CCFF]/60"
            />
          </div>
          <button
            type="button"
            onClick={onRequestDemo}
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#4C2DBF] bg-[#EFE9FF] border border-[#E0D3FF] hover:bg-white transition-colors shadow-sm"
          >
            Request demo
          </button>

          {(!isAuthenticated || readOnly) ? (
            <button
              onClick={onRequestLogin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8E49FF] via-[#7C3AED] to-[#5C2DB1] text-sm font-semibold text-white shadow-[0_10px_25px_rgba(109,53,207,0.3)]"
            >
              <User className="w-4 h-4" />
              Sign in
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-white transition-colors"
              >
                <img
                  src={user?.avatar || "/vkv.jpeg"}
                  alt={user?.name || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-sm font-semibold text-gray-800">{user?.name || "User"}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
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

function ModelGallery({
  models,
  totalModels,
  readOnly,
  onRequestLogin,
  categoryOptions,
  modalityOptions,
  activeCategory,
  activeModality,
  onCategoryChange,
  onModalityChange,
}) {
  const productionTotal = totalModels?.filter((m) => m.maturity === "Production").length ?? 0;
  return (
    <section id="fab-modals" className="px-4 md:px-10">
      <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_35px_85px_rgba(14,10,60,0.15)] p-6 md:p-10 space-y-8 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          <FilterPill label="Modality" activeValue={activeModality} options={modalityOptions} onSelect={onModalityChange} />
          <FilterPill label="Category" activeValue={activeCategory} options={categoryOptions} onSelect={onCategoryChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {models.length > 0 ? (
            models.map((model) => (
              <ModelCard key={model.id} model={model} readOnly={readOnly} onRequestLogin={onRequestLogin} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">No modals match this filter.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function ModelCard({ model, readOnly, onRequestLogin }) {
  return (
    <article className="rounded-[24px] border border-gray-200/70 bg-white shadow-[0_20px_45px_rgba(15,10,55,0.12)] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-gray-500">
        <span>{model.category}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{model.modality}</span>
      </div>
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-[#6F54E8] font-semibold">
          <span
            className={`h-2 w-2 rounded-full ${
              model.maturity === "Production"
                ? "bg-emerald-400"
                : model.maturity === "Beta"
                ? "bg-amber-400"
                : "bg-gray-300"
            }`}
          />
          {model.signal}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{model.name}</h3>
        <p className="text-sm text-gray-600">{model.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
        <div className="rounded-2xl border border-gray-200 px-3 py-2 bg-gray-50/60">
          <p className="uppercase tracking-wide text-gray-400">Inputs</p>
          <p>{model.inputs.join(" · ")}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 px-3 py-2 bg-gray-50/60">
          <p className="uppercase tracking-wide text-gray-400">Outputs</p>
          <p>{model.outputs.join(" · ")}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
        {model.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-gray-200 px-3 py-2 bg-white">
            <p className="uppercase tracking-wide text-gray-400">{metric.label}</p>
            <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        <p className="uppercase tracking-wide text-gray-400">Stack</p>
        <p className="text-gray-700">{model.stack.join(" · ")}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (readOnly) {
            onRequestLogin?.();
            return;
          }
        }}
        className="mt-auto inline-flex items-center justify-between rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#612D91] hover:border-[#612D91]/60 transition"
      >
        {readOnly ? "Sign in to orchestrate" : model.ctaLabel}
        <ArrowRight className="w-4 h-4" />
      </button>
    </article>
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

function PlatformCard({ platform, onSelect }) {
  const metrics = platform.metrics || { solutionCount: 0, industries: [], liveSolutions: 0 };
  
  return (
    <div 
      onClick={() => onSelect?.(platform)}
      className="rounded-[28px] border border-white/40 bg-white/95 shadow-[0_20px_50px_rgba(18,12,64,0.15)] flex flex-col overflow-hidden cursor-pointer hover:shadow-[0_25px_60px_rgba(18,12,64,0.2)] transition-shadow"
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${platform.accent}`} />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-2 text-xs uppercase tracking-wide text-gray-500">
            <span className={platform.categoryColor}>{platform.category}</span>
            <span className={`px-2 py-0.5 rounded-full ${platform.statusColor || "bg-gray-100 text-gray-700"}`}>{platform.status}</span>
          </div>
          {metrics.solutionCount > 0 && (
            <div className="px-2.5 py-1 rounded-full bg-[#612D91]/10 text-[#612D91] text-[10px] font-semibold">
              {metrics.solutionCount} {metrics.solutionCount === 1 ? 'Solution' : 'Solutions'}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{platform.name}</h3>
          <p className="text-sm text-gray-600 font-medium">{platform.tagline}</p>
        </div>
        <p className="text-sm text-gray-600 flex-1">{platform.description}</p>

        <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
          <div className="rounded-2xl border border-gray-200/80 px-3 py-1.5">
            <p className="uppercase tracking-wide text-gray-500 font-semibold">Solutions Built</p>
            <p className="font-semibold text-gray-900">{metrics.solutionCount || 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200/80 px-3 py-1.5">
            <p className="uppercase tracking-wide text-gray-500 font-semibold">Industries</p>
            <p className="font-semibold text-gray-900">
              {metrics.industriesCount > 0 
                ? `${metrics.industriesCount} ${metrics.industriesCount === 1 ? 'Industry' : 'Industries'}`
                : platform.industry}
            </p>
          </div>
          {metrics.liveSolutions > 0 && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 px-3 py-1.5">
              <p className="uppercase tracking-wide text-emerald-600 font-semibold">Live</p>
              <p className="font-semibold text-emerald-700">{metrics.liveSolutions}</p>
            </div>
          )}
        </div>

        {metrics.industries && metrics.industries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metrics.industries.slice(0, 3).map((industry, idx) => (
              <span key={idx} className="px-2 py-1 rounded-full bg-[#612D91]/10 text-[#612D91] text-[10px] font-medium">
                {industry}
              </span>
            ))}
            {metrics.industries.length > 3 && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                +{metrics.industries.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-gray-600">
          {platform.highlights?.slice(0, 3).map((highlight, idx) => (
            <span key={idx} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {highlight}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(platform);
          }}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-semibold text-sm hover:shadow-lg transition-all"
        >
          View Platform
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AppCard({ app, onLaunch, readOnly, onRequestLogin, onPlatformClick, onCloneTemplate }) {
  const platform = app.platformId ? fabPlatforms.find((p) => p.id === app.platformId) : null;
  
  return (
    <div className="rounded-[28px] border border-white/40 bg-white/95 shadow-[0_20px_50px_rgba(18,12,64,0.15)] flex flex-col overflow-hidden">
      <div className={`h-1.5 w-full bg-gradient-to-r ${app.accent}`} />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-2 text-xs uppercase tracking-wide text-gray-500">
            <span className={app.categoryColor}>{app.category}</span>
            <span className={`px-2 py-0.5 rounded-full ${app.statusColor || "bg-gray-100 text-gray-700"}`}>{app.status}</span>
          </div>
          {platform && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlatformClick?.(platform);
              }}
              className="px-2.5 py-1 rounded-full bg-[#612D91]/10 text-[#612D91] text-[10px] font-semibold hover:bg-[#612D91]/20 transition-colors flex items-center gap-1"
              title={`Built on ${platform.name}`}
            >
              <Layers className="w-3 h-3" />
              {platform.name}
            </button>
          )}
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
          {platform && (
            <div className="rounded-2xl border border-[#612D91]/20 bg-[#612D91]/5 px-3 py-1.5">
              <p className="uppercase tracking-wide text-[#612D91] font-semibold">Platform</p>
              <p className="font-semibold text-[#612D91]">{platform.name}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-gray-600">
          {app.tags?.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
              {tag}
            </span>
          ))}
          {app.isCloned && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
              Cloned
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto">
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
            className="inline-flex items-center justify-between rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#612D91] hover:border-[#612D91]/60 transition"
          >
            {readOnly ? "Sign in to launch" : app.ctaLabel || "Open"}
            <ArrowRight className="w-4 h-4" />
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCloneTemplate?.(app);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#612D91]/30 bg-[#612D91]/5 px-4 py-2 text-sm font-semibold text-[#612D91] hover:bg-[#612D91]/10 transition"
            >
              <Copy className="w-4 h-4" />
              Clone Template
            </button>
          )}
        </div>
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

