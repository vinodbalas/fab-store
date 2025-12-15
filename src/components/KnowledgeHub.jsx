import { ArrowLeft, BookOpen, Code, Layers, Zap, Database, BarChart3, Shield, Users, Settings, Sparkles } from "lucide-react";

export default function KnowledgeHub({ onBack, onNavigate }) {
  const knowledgeSections = [
    {
      icon: Layers,
      title: "Platform Architecture",
      description: "Understand how our platforms work, their architecture, and how to build solutions on top of them.",
      items: [
        "SOP Executor Platform architecture",
        "Field Service Platform architecture",
        "Platform-solution separation pattern",
        "Adapter pattern implementation",
        "Component composition",
        "Data flow architecture",
      ],
      action: { label: "View Architecture", key: "architecture" },
    },
    {
      icon: Code,
      title: "FAB Builder Guide",
      description: "Learn how to use the low-code/no-code builder to create applications quickly.",
      items: [
        "67 component library overview",
        "AI-powered app generation",
        "Data model configuration",
        "Property editing",
        "Multi-page support",
        "Platform integration",
      ],
      action: { label: "View Builder Details", key: "builder-detail" },
    },
    {
      icon: Users,
      title: "Role-Based Access Control",
      description: "Understand the three personas (Admin, Developer, User) and their capabilities.",
      items: [
        "Admin capabilities and permissions",
        "Developer capabilities and permissions",
        "User capabilities and permissions",
        "Permission matrix",
        "Role switching for testing",
      ],
      action: null,
    },
    {
      icon: Database,
      title: "Data Models & Entities",
      description: "Learn how to define entities, fields, relationships, and validation rules.",
      items: [
        "Entity definition",
        "Field types (Text, Number, Date, Boolean, Reference, File, Enum, JSON)",
        "Properties (Required, Default, Validation)",
        "Relationships (One-to-Many, Many-to-Many, One-to-One)",
        "Data binding",
      ],
      action: null,
    },
    {
      icon: Zap,
      title: "AI Watchtower",
      description: "Understand the unified AI console that provides intelligent reasoning across all applications.",
      items: [
        "Multi-agent reasoning system",
        "Confidence scoring",
        "SOP matching and references",
        "Recommendations with detailed reasoning",
        "Chat interface for follow-up questions",
        "Streaming responses (SSE)",
      ],
      action: null,
    },
    {
      icon: Shield,
      title: "SOP Integration",
      description: "Learn how to integrate Standard Operating Procedures into your applications.",
      items: [
        "SOP data structure",
        "SOP document viewer",
        "SOP matching algorithms",
        "Step navigation",
        "Page references",
        "Compliance guardrails",
      ],
      action: null,
    },
  ];

  const quickLinks = [
    { label: "FAB Builder", key: "builder-detail", icon: Code },
    { label: "Platforms Hub", key: "platforms-hub", icon: Layers },
    { label: "Architecture Overview", key: "architecture", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FF]">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#612D91] hover:text-[#7B3DA1] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Store</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Knowledge Hub</h1>
              <p className="text-lg text-gray-600 mt-1">Documentation, guides, and resources</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-3xl leading-relaxed">
            Comprehensive documentation and guides to help you understand, build, and deploy applications on the FAB Store platform. 
            Learn about platforms, components, AI capabilities, and best practices.
          </p>
        </div>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.key}
                  onClick={() => onNavigate && onNavigate(link.key)}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 flex items-center justify-center group-hover:from-[#612D91]/20 group-hover:to-[#A64AC9]/20 transition-colors">
                      <Icon className="w-5 h-5 text-[#612D91]" />
                    </div>
                    <span className="font-semibold text-gray-900">{link.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">Click to view detailed information</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Knowledge Sections */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {knowledgeSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#612D91]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{section.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#612D91]/30 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {section.action && (
                    <button
                      onClick={() => onNavigate && onNavigate(section.action.key)}
                      className="text-sm font-medium text-[#612D91] hover:text-[#7B3DA1] transition-colors"
                    >
                      {section.action.label} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-12">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#612D91] mb-1">5</div>
                <div className="text-sm text-gray-600">Live Applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#612D91] mb-1">2</div>
                <div className="text-sm text-gray-600">AI Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#612D91] mb-1">67</div>
                <div className="text-sm text-gray-600">Builder Components</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#612D91] mb-1">3</div>
                <div className="text-sm text-gray-600">User Roles</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

