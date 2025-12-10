import { fabApps } from "./fabApps";

// Calculate platform metrics dynamically
export function enrichPlatformWithMetrics(platform) {
  const solutions = fabApps.filter((app) => app.platformId === platform.id);
  const industries = [...new Set(solutions.map((app) => app.industry))];
  const statuses = [...new Set(solutions.map((app) => app.status))];
  
  return {
    ...platform,
    metrics: {
      solutionCount: solutions.length,
      solutions: solutions.map((s) => s.id),
      industries: industries,
      industriesCount: industries.length,
      statuses: statuses,
      liveSolutions: solutions.filter((s) => s.status === "Live").length,
    },
  };
}

export const fabPlatforms = [
  {
    id: "sop-navigator",
    name: "SOP Executor",
    tagline: "SOP-native platform for regulated operations",
    category: "Platform",
    industry: "Cross-Industry",
    status: "Live",
    description:
      "A reusable platform for building SOP-native solutions across industries. Provides AI-powered SOP matching, reasoning, and compliance guardrails that can be configured for any regulated domain.",
    highlights: ["SOP orchestration", "Multi-industry support", "AI reasoning engine", "Compliance guardrails"],
    tags: ["Platform", "Cross-Industry", "Live", "SOP-native"],
    accent: "from-[#5B2E90] to-[#A64AC9]",
    statusColor: "bg-emerald-100 text-emerald-700",
    categoryColor: "text-[#A64AC9]",
    stack: ["RAG", "GPT-4", "LangChain", "SOP Engine"],
    documentation: {
      overview: "SOP Executor is a platform that enables rapid development of SOP-native solutions for regulated industries. It provides a complete AI reasoning engine, SOP matching capabilities, and compliance guardrails out of the box.",
      features: [
        "AI-powered SOP matching and reasoning",
        "Multi-agent reasoning system with confidence scoring",
        "SOP document viewer with step navigation",
        "Industry-agnostic architecture",
        "Configurable SOP data structures",
        "Real-time compliance checking",
      ],
      architecture: {
        title: "Platform Architecture",
        description: "SOP Executor follows a modular, layered architecture that separates concerns between data, reasoning, and presentation layers, enabling rapid solution development.",
        diagram: {
          title: "SOP Executor Architecture",
          layers: [
            {
              name: "Presentation Layer",
              components: ["UnifiedAIConsole", "ReasoningCard", "SOPViewer", "Solution-specific UI"],
              description: "Reusable React components that solutions compose into their interfaces",
            },
            {
              name: "Platform Services Layer",
              components: ["SOPDataProvider", "Multi-Agent AI Engine", "Chat Agent", "Compliance Engine"],
              description: "Core platform services that solutions consume via adapters",
            },
            {
              name: "Solution Adapter Layer",
              components: ["platformAdapter.js", "platformComponents.js", "Data Mappers"],
              description: "Solution-specific adapters that map domain data to platform models",
            },
            {
              name: "Data Layer",
              components: ["SOP Definitions", "Solution Data (Claims/Cases)", "Configuration"],
              description: "Industry-specific SOPs and solution data structures",
            },
          ],
        },
        components: [
          {
            name: "SOP Data Provider",
            description: "Abstracts access to SOP data structures. Solutions provide their own SOP definitions (SCENARIO_SOPS, SOP_INDEX) which the platform consumes generically.",
            code: `// Platform: src/platforms/sop-navigator/core/sopDataProvider.js
export class SOPDataProvider {
  constructor(sopData) {
    this.SOP_INDEX = sopData.SOP_INDEX || {};
    this.SCENARIO_SOPS = sopData.SCENARIO_SOPS || {};
    // Generic methods for SOP access
  }
}`,
          },
          {
            name: "Multi-Agent AI Reasoning Engine",
            description: "Four specialized AI agents work in sequence: Analysis → SOP Matching → Risk Assessment → Recommendation. Each agent uses GPT-4 with specialized prompts and confidence scoring.",
            code: `// Platform: src/platforms/sop-navigator/services/ai/agents.js
const createPlatformAgents = (sopProvider, itemLabel) => {
  return {
    analysisAgent: createAnalysisAgent(sopProvider, itemLabel),
    sopMatchingAgent: createSOPMatchingAgent(sopProvider, itemLabel),
    riskAssessmentAgent: createRiskAssessmentAgent(sopProvider, itemLabel),
    recommendationAgent: createRecommendationAgent(sopProvider, itemLabel),
  };
};`,
          },
          {
            name: "Solution Adapter Pattern",
            description: "Solutions use adapters to connect their domain-specific data (claims, cases) to the platform's generic item model. This enables platform reuse without coupling.",
            code: `// Solution: src/apps/cogniclaim/services/ai/platformAdapter.js
import { SOPDataProvider, createPlatformAgents } from '../../../../platforms/sop-navigator';
import * as sopsData from '../../data/sops';

const sopProvider = new SOPDataProvider({
  SOP_INDEX: sopsData.SOP_INDEX,
  SCENARIO_SOPS: sopsData.SCENARIO_SOPS,
  // ... other SOP methods
});

const platformAgents = createPlatformAgents(sopProvider, "claim");
export const executeReasoning = async (claim, onStep) => {
  return platformAgents.executeReasoning(claim, onStep);
};`,
          },
          {
            name: "Component Wrapping",
            description: "Solutions wrap platform components (SOPViewer, ReasoningCard) with solution-specific data providers, so components don't need to know about solution details.",
            code: `// Solution: src/apps/cogniclaim/components/platformComponents.js
import { SOPViewer as PlatformSOPViewer } from '../../../platforms/sop-navigator';
import { sopProvider } from '../services/ai/platformAdapter';

export const SOPViewer = (props) => {
  return React.createElement(PlatformSOPViewer, {
    ...props,
    sopProvider,
    itemStatus: props.claimStatus,
  });
};`,
          },
        ],
        dataFlow: {
          title: "Data Flow Architecture",
          steps: [
            {
              step: 1,
              title: "Solution Input",
              description: "Solution receives domain-specific input (e.g., claim, case) with industry-specific fields (CPT codes, denial codes, etc.)",
            },
            {
              step: 2,
              title: "Adapter Transformation",
              description: "Solution adapter maps domain data to platform's generic 'item' model, preserving key metadata for AI reasoning",
            },
            {
              step: 3,
              title: "Platform AI Processing",
              description: "Platform's multi-agent engine processes the item: analyzes metadata, matches SOPs, assesses risk, generates recommendations",
            },
            {
              step: 4,
              title: "SOP Resolution",
              description: "Platform uses solution's SOPDataProvider to retrieve relevant SOPs, steps, denial codes, and document references",
            },
            {
              step: 5,
              title: "Component Rendering",
              description: "Platform components (ReasoningCard, SOPViewer) render with solution-specific branding and data, using wrapped adapters",
            },
          ],
        },
        technology: {
          title: "Technology Stack",
          frontend: ["React 18", "Framer Motion", "Tailwind CSS", "LangChain.js (demo mode)"],
          backend: ["Node.js / Express", "LangChain", "OpenAI GPT-4", "Server-Sent Events"],
          ai: ["GPT-4 / GPT-4o-mini", "Multi-Agent Architecture", "Confidence Scoring", "Streaming Responses", "RAG"],
          patterns: ["Platform-Solution Separation", "Adapter Pattern", "Component Composition", "Service Abstraction"],
        },
      },
      integration: {
        title: "How to Build Solutions",
        steps: [
          {
            step: 1,
            title: "Define Your SOPs",
            description: "Create SOP data structures in the format required by SOP Executor. Include steps, denial codes, document references, and industry-specific metadata.",
            code: `// Example: src/data/sops.js
export const SCENARIO_SOPS = {
  "your-scenario": {
    title: "SOP — Your Scenario Name",
    state: "All",
    page: "Page X",
    steps: [
      "Step 1 description",
      "Step 2 description",
    ],
    denialCodes: [
      { code: "XX-1", description: "Denial reason" },
    ],
    documentReferences: ["Page X"],
  },
};`,
          },
          {
            step: 2,
            title: "Configure AI Agents",
            description: "Set up your AI reasoning agents to analyze domain-specific inputs and match against your SOPs.",
            code: `// Example: src/services/ai/agents.js
// Configure agents for your domain
const analysisAgent = createAgent({
  role: "Domain Analyst",
  systemPrompt: "Analyze [your domain] inputs...",
});`,
          },
          {
            step: 3,
            title: "Integrate Components",
            description: "Use UnifiedAIConsole, ReasoningCard, and SOPViewer components in your solution UI.",
            code: `// Example: Your solution component
import UnifiedAIConsole from "./UnifiedAIConsole";
import SOPViewer from "./SOPViewer";

function YourSolution({ item }) {
  return (
    <UnifiedAIConsole
      item={item}
      onSOPView={handleSOPView}
    />
  );
}`,
          },
          {
            step: 4,
            title: "Customize for Your Industry",
            description: "Adapt the UI, terminology, and workflows to match your industry's requirements while leveraging the core platform capabilities.",
          },
        ],
      },
      bestPractices: {
        title: "Best Practices",
        items: [
          "Keep SOP definitions structured and consistent across scenarios",
          "Use clear, actionable step descriptions",
          "Include denial codes and document references for traceability",
          "Test AI reasoning with diverse input scenarios",
          "Maintain SOP versioning and effective dates",
          "Document industry-specific customizations",
        ],
      },
    },
  },
  {
    id: "field-service",
    name: "Field Service Platform",
    tagline: "AI-powered field service management platform",
    category: "Platform",
    industry: "Cross-Industry",
    status: "Live",
    description:
      "A reusable platform for building field service management solutions. Provides AI-powered routing optimization, technician scheduling, work order management, and SLA tracking across industries.",
    highlights: ["Route optimization", "Scheduling AI", "Work order management", "SLA tracking", "Asset management", "Inventory integration"],
    tags: ["Platform", "Cross-Industry", "Live", "Field Service"],
    accent: "from-[#0EA5E9] to-[#3B82F6]",
    statusColor: "bg-emerald-100 text-emerald-700",
    categoryColor: "text-blue-500",
    stack: ["Routing AI", "GPT-4", "Scheduling Engine", "Geospatial"],
    documentation: {
      overview: "Field Service Platform enables rapid development of field service management solutions. It provides intelligent routing, scheduling optimization, technician management, and SLA tracking out of the box.",
      features: [
        "AI-powered route optimization",
        "Intelligent technician scheduling",
        "Work order lifecycle management",
        "Real-time SLA tracking",
        "Technician skill matching",
        "Geospatial routing and tracking",
      ],
      architecture: {
        title: "Platform Architecture",
        description: "Field Service Platform follows a modular architecture with data providers, AI services, and reusable components for rapid solution development.",
        diagram: {
          title: "Field Service Platform Architecture",
          layers: [
            {
              name: "Presentation Layer",
              components: ["WorkOrderCard", "ScheduleView", "TechnicianMap", "Solution-specific UI"],
              description: "Reusable React components for field service interfaces",
            },
            {
              name: "Platform Services Layer",
              components: ["FieldServiceDataProvider", "Routing Agent", "Scheduling Agent", "Optimization Engine"],
              description: "Core platform services for routing, scheduling, and optimization",
            },
            {
              name: "Solution Adapter Layer",
              components: ["platformAdapter.js", "Data Mappers"],
              description: "Solution-specific adapters mapping domain data to platform models",
            },
            {
              name: "Data Layer",
              components: ["Work Orders", "Technicians", "Schedules", "Routes", "Configuration"],
              description: "Solution-specific work orders, technicians, and scheduling data",
            },
          ],
        },
        components: [
          {
            name: "Field Service Data Provider",
            description: "Abstracts access to field service data structures. Solutions provide their own work orders, technicians, and schedules which the platform consumes generically.",
            code: `// Platform: src/platforms/field-service/core/fieldServiceDataProvider.js
export class FieldServiceDataProvider {
  constructor(serviceData) {
    this.WORK_ORDERS = serviceData.WORK_ORDERS || [];
    this.TECHNICIANS = serviceData.TECHNICIANS || [];
    // Generic methods for field service data access
  }
}`,
          },
          {
            name: "Routing & Scheduling Agents",
            description: "AI agents optimize routes and schedules using GPT-4, considering technician skills, location, SLA constraints, and real-time availability.",
            code: `// Platform: src/platforms/field-service/services/ai/agents.js
const createFieldServiceAgents = (dataProvider) => {
  return {
    routingAgent: createRoutingAgent(dataProvider),
    analyzeWorkOrder: analyzeWorkOrder,
    optimizeSchedule: optimizeSchedule,
  };
};`,
          },
        ],
        technology: {
          title: "Technology Stack",
          frontend: ["React 18", "Framer Motion", "Tailwind CSS", "Map Libraries"],
          backend: ["Node.js / Express", "LangChain", "OpenAI GPT-4", "Routing Algorithms"],
          ai: ["GPT-4", "Routing Optimization", "Scheduling AI", "Geospatial Intelligence"],
          patterns: ["Platform-Solution Separation", "Adapter Pattern", "Component Composition"],
        },
      },
      integration: {
        title: "How to Build Solutions",
        steps: [
          {
            step: 1,
            title: "Define Your Work Orders",
            description: "Create work order data structures with service types, priorities, locations, and SLA requirements.",
          },
          {
            step: 2,
            title: "Configure Technicians",
            description: "Define technician profiles with skills, availability, and location data.",
          },
          {
            step: 3,
            title: "Integrate Platform Components",
            description: "Use WorkOrderCard, ScheduleView, and routing components in your solution UI.",
          },
          {
            step: 4,
            title: "Customize for Your Industry",
            description: "Adapt workflows, terminology, and features to match your industry requirements.",
          },
        ],
      },
    },
  },
];

// Export enriched platforms with calculated metrics
export const getEnrichedPlatforms = () => {
  return fabPlatforms.map((platform) => enrichPlatformWithMetrics(platform));
};

