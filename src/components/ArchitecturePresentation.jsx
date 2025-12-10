import { useState } from "react";
import { X, Layers, Code, Database, Brain, Zap, ArrowRight, ChevronRight, ChevronLeft, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ArchitecturePresentation({ onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "overview",
      title: "FAB Store Architecture Overview",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Teleperformance AI Platform Architecture</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A layered architecture enabling rapid development of AI-powered solutions for regulated industries
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl border-2 border-[#612D91] bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10">
              <Layers className="w-8 h-8 text-[#612D91] mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Layer</h3>
              <p className="text-gray-700">
                Reusable, industry-agnostic platforms providing core AI capabilities, reasoning engines, and compliance frameworks.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border-2 border-[#5B2E90] bg-gradient-to-br from-[#5B2E90]/10 to-[#A64AC9]/10">
              <Code className="w-8 h-8 text-[#5B2E90] mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Solution Layer</h3>
              <p className="text-gray-700">
                Industry-specific applications built on platforms, delivering tailored experiences for healthcare, finance, and other regulated domains.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border-2 border-[#4B5563] bg-gradient-to-br from-[#4B5563]/10 to-[#6B7280]/10">
              <Zap className="w-8 h-8 text-[#4B5563] mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Services</h3>
              <p className="text-gray-700">
                Shared AI capabilities including reasoning engines, natural language processing, and compliance checking.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "platform-layer",
      title: "Platform Layer: SOP Executor",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">SOP Executor Platform</h2>
            <p className="text-lg text-gray-600">
              Industry-agnostic platform for SOP-driven AI solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#612D91]" />
                Core Components
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• SOP Data Provider (abstracts industry-specific SOPs)</li>
                <li>• Multi-Agent AI Reasoning Engine</li>
                <li>• SOP Matching & Compliance Checking</li>
                <li>• SOP Document Viewer</li>
                <li>• Reasoning Card Components</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#612D91]" />
                AI Capabilities
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Analysis Agent (metadata extraction)</li>
                <li>• SOP Matcher Agent (rule matching)</li>
                <li>• Risk Assessor Agent (compliance scoring)</li>
                <li>• Recommendation Agent (actionable insights)</li>
                <li>• Chat Agent (interactive assistance)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-[#612D91]/10 to-[#A64AC9]/10 border border-[#612D91]/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold text-gray-900">Reusability</p>
                <p className="text-sm text-gray-600">One platform, multiple solutions</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Speed</p>
                <p className="text-sm text-gray-600">Weeks to deploy vs. months</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Consistency</p>
                <p className="text-sm text-gray-600">Standardized AI reasoning across solutions</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "solution-layer",
      title: "Solution Layer: Cogniclaim & TP Resolve Appeals",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Solutions Built on SOP Executor</h2>
            <p className="text-lg text-gray-600">
              Industry-specific applications leveraging platform capabilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border-2 border-[#612D91] bg-gradient-to-br from-[#612D91]/5 to-[#A64AC9]/5">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cogniclaim</h3>
              <p className="text-gray-700 mb-4">
                Healthcare claims intelligence solution for medical claims processing, denial management, and compliance.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">Key Features:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Multi-line item claim processing</li>
                  <li>• Duplicate & split-bill detection</li>
                  <li>• AI-powered SOP matching</li>
                  <li>• Real-time compliance checking</li>
                  <li>• Healthcare-specific SOPs (CPT, ICD-10, denial codes)</li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border-2 border-[#4B5563] bg-gradient-to-br from-[#4B5563]/5 to-[#6B7280]/5">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">TP Resolve Appeals</h3>
              <p className="text-gray-700 mb-4">
                Appeals & Grievances resolution solution for healthcare appeals, complaints, and regulatory compliance.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">Key Features:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Case management with deadline tracking</li>
                  <li>• Multi-line item case processing</li>
                  <li>• Jurisdiction-specific workflows</li>
                  <li>• Regulatory body compliance (CMS, HHS, State DOH)</li>
                  <li>• Appeals & Grievances SOPs</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-6 rounded-xl bg-gray-50 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Solution Architecture Pattern</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>1. Data Adapter Layer:</strong> Solution-specific data structures (claims, cases) mapped to platform's generic item model</p>
              <p><strong>2. Platform Integration:</strong> Solutions consume platform services (SOPDataProvider, AI agents, components)</p>
              <p><strong>3. UI Customization:</strong> Industry-specific branding, terminology, and workflows while using platform components</p>
              <p><strong>4. SOP Configuration:</strong> Industry-specific SOPs loaded into platform's SOP engine</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "data-flow",
      title: "Data Flow & AI Reasoning",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Reasoning Flow</h2>
            <p className="text-lg text-gray-600">
              How solutions leverage platform AI capabilities
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-6 rounded-xl border-l-4 border-[#612D91] bg-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#612D91] text-white flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Input Processing</h3>
                  <p className="text-gray-700">
                    Solution receives domain-specific input (claim, case, etc.) and adapts it to platform's generic item model via adapter layer.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border-l-4 border-[#5B2E90] bg-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#5B2E90] text-white flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Agent Analysis</h3>
                  <p className="text-gray-700">
                    Platform's AI reasoning engine executes multi-agent chain: Analysis → SOP Matching → Risk Assessment → Recommendation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border-l-4 border-[#A64AC9] bg-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#A64AC9] text-white flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SOP Matching</h3>
                  <p className="text-gray-700">
                    Platform matches input against solution's SOP library, identifies applicable procedures, and extracts relevant steps and denial codes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border-l-4 border-[#4B5563] bg-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#4B5563] text-white flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendation Generation</h3>
                  <p className="text-gray-700">
                    Platform generates actionable recommendations with confidence scores, SOP references, and compliance guardrails.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border-l-4 border-[#10B981] bg-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold shrink-0">5</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Presentation</h3>
                  <p className="text-gray-700">
                    Solution renders platform's ReasoningCard, SOPViewer, and UnifiedAIConsole components with solution-specific branding and data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "technology",
      title: "Technology Stack",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <p className="text-lg text-gray-600">
              Modern, scalable architecture built for enterprise deployment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>React 18</strong> - Component-based UI framework</li>
                <li>• <strong>Framer Motion</strong> - Smooth animations and transitions</li>
                <li>• <strong>Tailwind CSS</strong> - Utility-first styling</li>
                <li>• <strong>LangChain.js</strong> - AI agent orchestration (demo mode)</li>
                <li>• <strong>React Context</strong> - State management</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Node.js / Express</strong> - RESTful API server</li>
                <li>• <strong>LangChain</strong> - Multi-agent AI reasoning</li>
                <li>• <strong>OpenAI GPT-4</strong> - Large language model</li>
                <li>• <strong>Server-Sent Events (SSE)</strong> - Real-time streaming</li>
                <li>• <strong>CORS</strong> - Cross-origin resource sharing</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI & ML</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>GPT-4 / GPT-4o-mini</strong> - Core reasoning engine</li>
                <li>• <strong>Multi-Agent Architecture</strong> - Specialized AI agents</li>
                <li>• <strong>Confidence Scoring</strong> - AI output reliability metrics</li>
                <li>• <strong>Streaming Responses</strong> - Real-time AI reasoning display</li>
                <li>• <strong>RAG (Retrieval Augmented Generation)</strong> - SOP context injection</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Architecture Patterns</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Platform-Solution Separation</strong> - Reusable platform layer</li>
                <li>• <strong>Adapter Pattern</strong> - Solution-to-platform data mapping</li>
                <li>• <strong>Component Composition</strong> - Shared UI components</li>
                <li>• <strong>Service Abstraction</strong> - Platform services via providers</li>
                <li>• <strong>Demo/Production Modes</strong> - Flexible deployment</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "business-value",
      title: "Business Value & ROI",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Value Proposition</h2>
            <p className="text-lg text-gray-600">
              How the platform architecture delivers value to Teleperformance and clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#612D91]/10 to-[#A64AC9]/10 border border-[#612D91]/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Speed to Market</h3>
              <p className="text-gray-700 mb-4">
                Build new solutions in <strong>weeks instead of months</strong> by leveraging platform capabilities.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Pre-built AI reasoning engine</li>
                <li>✓ Reusable UI components</li>
                <li>✓ Standardized data patterns</li>
                <li>✓ Compliance frameworks</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#34D399]/10 border border-[#10B981]/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cost Efficiency</h3>
              <p className="text-gray-700 mb-4">
                <strong>Reduce development costs</strong> by reusing platform infrastructure across solutions.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Shared AI infrastructure</li>
                <li>✓ Common component library</li>
                <li>✓ Unified maintenance</li>
                <li>✓ Scalable architecture</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#3B82F6]/10 to-[#60A5FA]/10 border border-[#3B82F6]/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Consistency & Quality</h3>
              <p className="text-gray-700 mb-4">
                <strong>Standardized AI reasoning</strong> ensures consistent quality across all solutions.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Unified AI agent architecture</li>
                <li>✓ Consistent compliance checking</li>
                <li>✓ Standardized SOP matching</li>
                <li>✓ Quality guardrails</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#F59E0B]/10 to-[#FBBF24]/10 border border-[#F59E0B]/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scalability</h3>
              <p className="text-gray-700 mb-4">
                <strong>Platform-first approach</strong> enables rapid expansion to new industries and use cases.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Multi-industry support</li>
                <li>✓ Horizontal scaling</li>
                <li>✓ Easy solution addition</li>
                <li>✓ Future platform expansion</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-6 rounded-xl bg-gray-900 text-white">
            <h3 className="text-xl font-semibold mb-3">ROI Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-bold text-[#A64AC9] mb-1">70%</p>
                <p className="text-sm text-gray-300">Faster time to market</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#A64AC9] mb-1">60%</p>
                <p className="text-sm text-gray-300">Reduced development costs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#A64AC9] mb-1">2+</p>
                <p className="text-sm text-gray-300">Solutions per platform</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5" />
            <div>
              <h2 className="font-semibold text-lg">Architecture Presentation</h2>
              <p className="text-xs text-white/80">
                Slide {currentSlide + 1} of {slides.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const onePager = document.getElementById('architecture-one-pager');
                if (onePager) {
                  window.print();
                } else {
                  // Create printable one-pager
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>TP.ai FAB Store Architecture - One Pager</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                          h1 { color: #612D91; border-bottom: 3px solid #612D91; padding-bottom: 10px; }
                          h2 { color: #5B2E90; margin-top: 30px; }
                          .section { margin: 20px 0; }
                          .highlight { background: #f0f0f0; padding: 15px; border-left: 4px solid #612D91; margin: 15px 0; }
                          .metric { display: inline-block; margin: 10px 20px 10px 0; }
                          .metric-value { font-size: 24px; font-weight: bold; color: #612D91; }
                          ul { line-height: 1.8; }
                        </style>
                      </head>
                      <body>
                        <h1>TP.ai FAB Store Architecture - Executive Summary</h1>
                        <div class="section">
                          <h2>Overview</h2>
                          <p>The Teleperformance AI Platform Architecture is a layered system enabling rapid development of AI-powered solutions for regulated industries. It separates reusable platform capabilities from industry-specific solutions, delivering speed, consistency, and cost efficiency.</p>
                        </div>
                        <div class="section">
                          <h2>Architecture Layers</h2>
                          <div class="highlight">
                            <strong>Platform Layer:</strong> Reusable, industry-agnostic platforms (e.g., SOP Executor) providing core AI capabilities, reasoning engines, and compliance frameworks.
                          </div>
                          <div class="highlight">
                            <strong>Solution Layer:</strong> Industry-specific applications (Cogniclaim, TP Resolve) built on platforms, delivering tailored experiences for healthcare, finance, and other regulated domains.
                          </div>
                          <div class="highlight">
                            <strong>AI Services:</strong> Shared AI capabilities including reasoning engines, natural language processing, and compliance checking.
                          </div>
                        </div>
                        <div class="section">
                          <h2>Platform: SOP Executor</h2>
                          <p><strong>Purpose:</strong> Industry-agnostic platform for SOP-driven AI solutions</p>
                          <p><strong>Core Components:</strong></p>
                          <ul>
                            <li>SOP Data Provider (abstracts industry-specific SOPs)</li>
                            <li>Multi-Agent AI Reasoning Engine (Analysis, SOP Matching, Risk Assessment, Recommendation)</li>
                            <li>SOP Matching & Compliance Checking</li>
                            <li>SOP Document Viewer</li>
                            <li>Reusable UI Components (ReasoningCard, UnifiedAIConsole)</li>
                          </ul>
                        </div>
                        <div class="section">
                          <h2>Solutions Built on SOP Executor</h2>
                          <p><strong>Cogniclaim:</strong> Healthcare claims intelligence solution for medical claims processing, denial management, and compliance. Features multi-line item processing, duplicate detection, and healthcare-specific SOPs.</p>
                          <p><strong>TP Resolve:</strong> Appeals & Grievances resolution solution for healthcare appeals, complaints, and regulatory compliance. Features case management, deadline tracking, and jurisdiction-specific workflows.</p>
                        </div>
                        <div class="section">
                          <h2>Business Value</h2>
                          <div class="metric">
                            <div class="metric-value">70%</div>
                            <div>Faster time to market</div>
                          </div>
                          <div class="metric">
                            <div class="metric-value">60%</div>
                            <div>Reduced development costs</div>
                          </div>
                          <div class="metric">
                            <div class="metric-value">2+</div>
                            <div>Solutions per platform</div>
                          </div>
                          <ul>
                            <li><strong>Speed to Market:</strong> Build new solutions in weeks instead of months</li>
                            <li><strong>Cost Efficiency:</strong> Reduce development costs by reusing platform infrastructure</li>
                            <li><strong>Consistency & Quality:</strong> Standardized AI reasoning ensures consistent quality</li>
                            <li><strong>Scalability:</strong> Platform-first approach enables rapid expansion to new industries</li>
                          </ul>
                        </div>
                        <div class="section">
                          <h2>Technology Stack</h2>
                          <p><strong>Frontend:</strong> React 18, Framer Motion, Tailwind CSS, LangChain.js</p>
                          <p><strong>Backend:</strong> Node.js/Express, LangChain, OpenAI GPT-4, Server-Sent Events</p>
                          <p><strong>AI:</strong> GPT-4/GPT-4o-mini, Multi-Agent Architecture, Confidence Scoring, RAG</p>
                          <p><strong>Patterns:</strong> Platform-Solution Separation, Adapter Pattern, Component Composition</p>
                        </div>
                        <div class="section">
                          <h2>Data Flow</h2>
                          <ol>
                            <li>Solution receives domain-specific input (claim, case)</li>
                            <li>Adapter maps data to platform's generic item model</li>
                            <li>Platform's multi-agent engine processes: Analysis → SOP Matching → Risk Assessment → Recommendation</li>
                            <li>Platform retrieves relevant SOPs via solution's SOPDataProvider</li>
                            <li>Platform components render with solution-specific branding</li>
                          </ol>
                        </div>
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ccc; text-align: center; color: #666;">
                          <p>TP.ai · Teleperformance AI Platform · ${new Date().getFullYear()}</p>
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  setTimeout(() => printWindow.print(), 250);
                }
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
              title="Print One-Pager"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">One-Pager</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? "bg-[#612D91] w-8"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 rounded-lg bg-[#612D91] text-white hover:bg-[#512579] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

