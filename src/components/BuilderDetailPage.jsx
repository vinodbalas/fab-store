import { ArrowLeft, Code, Sparkles, Layers, Zap, Palette, Database, BarChart3, Navigation, Bell, GripVertical, CheckCircle } from "lucide-react";

export default function BuilderDetailPage({ onBack }) {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Creation",
      description: "Describe your app in natural language and watch it generate automatically with a progress bar showing each step of creation.",
    },
    {
      icon: Layers,
      title: "67 Pre-built Components",
      description: "Comprehensive component library across 8 categories: Layout, Platform Components, Form Controls, Data Display, Charts, Navigation, Feedback, and Advanced components.",
    },
    {
      icon: Database,
      title: "Data Model Configurator",
      description: "Full-featured entity editor with support for Text, Number, Date, Boolean, Reference, File, Enum, and JSON field types. Define relationships (One-to-Many, Many-to-Many, One-to-One) and validation rules.",
    },
    {
      icon: Zap,
      title: "Drag-and-Drop Builder",
      description: "Intuitive visual builder with drag-and-drop functionality. Place components on canvas, configure properties, and see live preview in real-time.",
    },
    {
      icon: Palette,
      title: "Property Editor",
      description: "Dynamic property panels that adapt to each component. Edit colors, sizes, labels, validation rules, and more with type-specific inputs.",
    },
    {
      icon: BarChart3,
      title: "Live Preview",
      description: "See your app come to life with real-time preview. Switch between canvas, preview, and split views. Test responsive designs for desktop, tablet, and mobile.",
    },
    {
      icon: Navigation,
      title: "Multi-page Support",
      description: "Build applications with multiple pages. Create complex navigation flows and organize your app structure with page tabs.",
    },
    {
      icon: CheckCircle,
      title: "Platform Integration",
      description: "Auto-integrate with SOP Executor and Field Service platforms. AI Watchtower automatically connects to your entities for intelligent reasoning.",
    },
  ];

  const componentCategories = [
    {
      name: "Layout Components",
      count: 5,
      items: ["App Header", "Toolbar", "Container", "Grid", "Section"],
    },
    {
      name: "Platform Components",
      count: 4,
      items: ["SOP Reasoning Card", "SOP Viewer", "Work Order Card", "Asset Card"],
    },
    {
      name: "Form Controls",
      count: 11,
      items: ["Button", "Text Input", "Textarea", "Dropdown", "Checkbox", "Radio", "Switch", "Date Picker", "File Upload", "Slider", "Rating"],
    },
    {
      name: "Data Display",
      count: 8,
      items: ["Data Table", "List", "Card", "Badge", "Tag", "Metric Card", "Stat Card", "Timeline"],
    },
    {
      name: "Charts & Graphs",
      count: 6,
      items: ["Bar Chart", "Line Chart", "Pie Chart", "Area Chart", "Gauge", "Heatmap"],
    },
    {
      name: "Navigation",
      count: 5,
      items: ["Tabs", "Breadcrumbs", "Pagination", "Menu", "Steps"],
    },
    {
      name: "Feedback",
      count: 9,
      items: ["Alert", "Progress Bar", "Spinner", "Skeleton", "Toast", "Modal", "Drawer", "Notification"],
    },
    {
      name: "Advanced",
      count: 8,
      items: ["Splitter", "Resizer", "Accordion", "Carousel", "Advanced Tabs", "Tree", "Transfer", "Advanced Timeline"],
    },
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
              <Code className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">FAB Builder</h1>
              <p className="text-lg text-gray-600 mt-1">AI-Native Low-Code/No-Code Platform</p>
            </div>
          </div>
          <p className="text-gray-700 max-w-3xl leading-relaxed">
            Build production-ready applications faster with our AI-powered visual builder. Create apps using 67 pre-built components, 
            configure data models, and deploy with one click. Integrated with SOP Executor and Field Service platforms for intelligent, 
            compliant applications.
          </p>
        </div>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#612D91]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Component Library */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Component Library (67 Components)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {componentCategories.map((category, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <span className="text-xs font-medium text-[#612D91] bg-[#612D91]/10 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {category.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#612D91]/30" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Choose Your Path</h3>
                  <p className="text-gray-600 text-sm">
                    Start with <strong>AI-Powered Creation</strong> (describe your app) or <strong>Manual Builder</strong> (step-by-step). 
                    Both paths capture basic app information upfront (name, tagline, description, platform, industry).
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Configure Data Model</h3>
                  <p className="text-gray-600 text-sm">
                    Define your entities with full field type support (Text, Number, Date, Boolean, Reference, File, Enum, JSON). 
                    Set properties (Required, Default, Validation) and relationships (One-to-Many, Many-to-Many, One-to-One).
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Build Your UI</h3>
                  <p className="text-gray-600 text-sm">
                    Drag and drop components from the library onto your canvas. Configure properties in the right panel. 
                    See live preview in real-time. Switch between desktop, tablet, and mobile views. Create multiple pages.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] flex items-center justify-center text-white font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Generate & Deploy</h3>
                  <p className="text-gray-600 text-sm">
                    Generate complete app structure with code generation. Save to "My Space" for further customization. 
                    Publish to FAB Store (Admin) or submit for review (Developer). AI Watchtower auto-integrates with your entities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Integration */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#612D91]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SOP Executor</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Auto-integrate SOP Reasoning Cards and SOP Viewer components. Your entities automatically connect to AI reasoning engine 
                for intelligent decision-making with SOP matching and compliance guardrails.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#612D91]" />
                  <span>SOP Reasoning Card component</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#612D91]" />
                  <span>SOP Viewer component</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#612D91]" />
                  <span>Auto AI Watchtower integration</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Field Service Platform</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Auto-integrate Work Order Cards and Asset Cards. Connect to routing optimization, scheduling AI, and SLA tracking 
                for intelligent field service management.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Work Order Card component</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Asset Card component</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Routing & Scheduling AI</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pre-built Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#612D91]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dashboard Layout</h3>
              <p className="text-sm text-gray-600">
                Complete dashboard with metrics grid, analytics charts, and data tables. Perfect for executive dashboards and KPI monitoring.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-[#612D91]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Form Layout</h3>
              <p className="text-sm text-gray-600">
                Complete form with validation, input fields, and submission handling. Ideal for data entry and workflow forms.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-[#612D91]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Detail View</h3>
              <p className="text-sm text-gray-600">
                Detail page with header sections, key metrics cards, and detail containers. Great for item detail pages and profile views.
              </p>
            </div>
          </div>
        </section>

        {/* Access Control */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Access Control</h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 mb-4">
              FAB Builder is available to <strong>Admin</strong> and <strong>Developer</strong> roles. Users can only launch and use published applications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-1">Admin</h4>
                <p className="text-sm text-gray-600">Full access, can publish directly</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-1">Developer</h4>
                <p className="text-sm text-gray-600">Build and edit, submit for review</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">User</h4>
                <p className="text-sm text-gray-600">Use published apps only</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

