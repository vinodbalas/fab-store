/**
 * AI App Builder Agent using LangChain
 * 
 * Generates complete app structures from natural language descriptions.
 * Uses GPT-4o to create pages, components, entities, and bindings.
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// ==================== Configuration ====================
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";
const TEMPERATURE = 0.2; // Lower temperature for more structured, consistent outputs

// Debug: Log environment variable status (only in dev)
if (import.meta.env.DEV) {
  console.log("[AppBuilder] Environment check:", {
    hasKey: !!OPENAI_API_KEY,
    keyLength: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0,
    keyPrefix: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 7) + "..." : "none",
    model: MODEL_NAME,
    allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith("VITE_")),
  });
}

// Initialize OpenAI model
const createBuilderModel = (temperature = TEMPERATURE) => {
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.trim()) {
    console.warn("OpenAI API key not found. Builder will use template-based generation.");
    console.warn("To enable LLM generation, create a .env file in the project root with:");
    console.warn("  VITE_OPENAI_API_KEY=sk-your-key-here");
    console.warn("Then restart your dev server.");
    return null;
  }
  
  // Ensure key is a string and not undefined
  const apiKey = String(OPENAI_API_KEY).trim();
  if (!apiKey || apiKey.length < 10) {
    console.error("Invalid API key format");
    return null;
  }
  
  try {
    // Try apiKey first (newer LangChain versions), fallback to openAIApiKey
    return new ChatOpenAI({
      model: MODEL_NAME,
      temperature,
      streaming: false, // We want complete JSON, not streaming
      apiKey: apiKey, // Primary parameter name
      openAIApiKey: apiKey, // Fallback for older versions
    });
  } catch (error) {
    console.error("Failed to create ChatOpenAI model:", error);
    console.error("API Key present:", !!apiKey, "Length:", apiKey?.length);
    return null;
  }
};

// ==================== Component Catalog ====================
/**
 * Available components for the LLM to choose from
 */
const COMPONENT_CATALOG = {
  layout: [
    { type: "app-header", name: "App Header", description: "Application header with branding, navbar, avatar" },
    { type: "toolbar", name: "Toolbar", description: "Action toolbar with search and buttons" },
    { type: "container", name: "Container", description: "Content container for grouping components" },
    { type: "grid", name: "Grid", description: "Grid layout for responsive columns" },
    { type: "section", name: "Section", description: "Page section with padding and background" },
    { type: "side-nav", name: "Left Sidebar Nav", description: "Vertical navigation sidebar" },
  ],
  "form-controls": [
    { type: "button", name: "Button", description: "Clickable button" },
    { type: "input", name: "Text Input", description: "Single-line text input" },
    { type: "textarea", name: "Textarea", description: "Multi-line text input" },
    { type: "dropdown", name: "Dropdown", description: "Select dropdown" },
    { type: "checkbox", name: "Checkbox", description: "Checkbox input" },
    { type: "radio", name: "Radio Button", description: "Radio button group" },
    { type: "switch", name: "Switch", description: "Toggle switch" },
    { type: "date-picker", name: "Date Picker", description: "Date input" },
    { type: "slider", name: "Slider", description: "Range slider input" },
    { type: "rating", name: "Rating", description: "Star rating input" },
  ],
  "data-display": [
    { type: "data-table", name: "Data Table", description: "Sortable, filterable data table" },
    { type: "card", name: "Card", description: "Content card" },
    { type: "badge", name: "Badge", description: "Status badge" },
    { type: "metric-card", name: "Metric Card", description: "KPI/metric display card" },
  ],
  platform: [
    { type: "sop-reasoning-card", name: "SOP Reasoning Card", description: "AI reasoning card with SOP matching", platform: "sop-executor" },
    { type: "sop-viewer", name: "SOP Viewer", description: "Document viewer for SOPs", platform: "sop-executor" },
  ],
};

// ==================== App Config Schema ====================
/**
 * JSON Schema for app config output
 */
const APP_CONFIG_SCHEMA = {
  type: "object",
  properties: {
    entities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["string", "number", "date", "boolean", "array"] },
                required: { type: "boolean" },
              },
            },
          },
        },
        required: ["id", "name", "fields"],
      },
    },
    pages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          components: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                name: { type: "string" },
                props: { type: "object" },
                dataBinding: { type: ["string", "null"] },
                parentId: { type: ["string", "null"] },
                pageTag: { type: ["string", "null"] },
              },
              required: ["id", "type", "name"],
            },
          },
        },
        required: ["name", "components"],
      },
    },
  },
  required: ["entities", "pages"],
};

// ==================== Heuristic Component Hints ====================
/**
 * Infer useful component types from natural language description.
 * This is a lightweight planner that nudges the LLM toward richer UIs.
 */
function inferComponentHints(description = "") {
  const text = description.toLowerCase();
  const hints = new Set();

  // Tables / worklists / lists
  if (/\b(list|table|worklist|queue|inbox|grid)\b/.test(text)) {
    hints.add("data-table");
  }

  // KPIs / metrics / dashboards
  if (/\b(kpi|metric|dashboard|summary|insight|watchtower)\b/.test(text)) {
    hints.add("metric-card");
  }

  // Charts / trends
  if (/\b(trend|time series|over time|chart|graph|analytics?|distribution|top \d+)/.test(text)) {
    hints.add("chart");
  }

  // Forms / input-heavy flows
  if (/\b(form|input|create|edit|update|wizard|onboarding|application)\b/.test(text)) {
    [
      "input",
      "textarea",
      "dropdown",
      "checkbox",
      "radio",
      "switch",
      "date-picker",
      "button",
    ].forEach((t) => hints.add(t));
  }

  // Rating / scores
  if (/\b(rating|score|satisfaction|1-5|1 to 5|stars?)\b/.test(text)) {
    hints.add("rating");
  }

  // Slider usage (ranges, thresholds)
  if (/\b(range|threshold|min|max|slider)\b/.test(text)) {
    hints.add("slider");
  }

  // Navigation
  if (/\b(nav|navigation|sidebar|menu|left nav|tabs?)\b/.test(text)) {
    hints.add("side-nav");
  }

  // SOP / reasoning specific
  if (/\b(sop|standard operating procedure|reasoning|explain why|policy|guideline)\b/.test(text)) {
    hints.add("sop-reasoning-card");
    hints.add("sop-viewer");
  }

  return Array.from(hints);
}

// ==================== Builder Agent ====================

/**
 * Generate app structure from natural language description
 * @param {string} description - User's app description
 * @param {Object} basicInfo - Basic app info (name, platform, etc.)
 * @returns {Promise<Object>} Generated app config with entities and pages
 */
export const generateAppFromPrompt = async (description, basicInfo = {}) => {
  const model = createBuilderModel();
  
  try {
    if (!description || !description.trim()) {
      throw new Error("Description is required");
    }

    // If no model (no API key), return null to fall back to template generator
    if (!model) {
      return null;
    }

    // Heuristic hints to nudge the LLM toward richer, domain-appropriate controls
    const componentHints = inferComponentHints(description);

    // Build system prompt - generic and flexible
    const systemPrompt = `You are an expert AI app builder. Your task is to generate complete application structures from natural language descriptions.

You have access to these component types:
${JSON.stringify(COMPONENT_CATALOG, null, 2)}

Your output must be valid JSON matching this exact schema:
${JSON.stringify(APP_CONFIG_SCHEMA, null, 2)}

Guidelines:
1. **Extract entities** from the description based on what the user describes (e.g., "Claim", "Loan", "Order", "Ticket", "Product", "User" - whatever makes sense for their domain)
2. **Create pages** based on navigation items explicitly mentioned in the description, or logical sections if navigation isn't specified
3. **Choose components** that match the user's requirements:
   - Use layout components (app-header, toolbar, container, grid, section, side-nav) to structure pages
   - Use form-controls (button, input, dropdown, etc.) for interactive forms
   - Use data-display (data-table, card, metric-card) for showing data
   - Use platform components (sop-reasoning-card, sop-viewer) ONLY if the user explicitly mentions "SOP Executor", "SOP", "AI reasoning", or similar platform-specific features
4. **Bind data tables** to entities using the dataBinding field (e.g., if entity is "Claim", dataBinding should be "Claim")
5. **Use parentId** to nest components logically (e.g., metric cards inside a grid, buttons inside a container)
6. **Set pageTag** to group components by page (use page names in lowercase with hyphens, e.g., "home", "dashboard", "detail", "settings")
7. **Include realistic props** for components based on the user's description:
   - Button labels should match actions mentioned
   - Table columns should reflect entity fields
   - Metric card titles should match KPIs mentioned
   - Input placeholders should be contextually relevant
8. **Be creative and flexible** - don't force any specific patterns. Let the user's description guide the structure.
9. **Only use platform-specific components** if the user explicitly mentions the platform or its features

When choosing components, pay special attention to these suggested types inferred from the description (only if they make sense):
${componentHints.length ? componentHints.join(", ") : "none – infer from description normally."}

Important: Do NOT assume Cogniclaim patterns, AI reasoning cards, or specific workflows unless explicitly mentioned. Build what the user asks for, not what you think they might want.

Return ONLY valid JSON, no markdown, no explanations.`;

    // Build user message with context
    const platform = basicInfo.platformName || basicInfo.platform || "";
    const platformNote = platform && platform.toLowerCase().includes("sop")
      ? `\nNote: Platform is "${platform}" - you may use platform-specific components (sop-reasoning-card, sop-viewer) if they fit the description.`
      : platform
      ? `\nNote: Platform is "${platform}" - use platform components only if explicitly relevant.`
      : "";

    const userMessage = `Generate an app structure based on this description:

App Name: ${basicInfo.name || "New Application"}
${platform ? `Platform: ${platform}` : ""}

User Description:
${description}
${platformNote}

Requirements:
1. Extract all entities mentioned and create appropriate field schemas
2. Create pages based on navigation items or logical sections described
3. Choose components that match what the user is asking for (don't add features they didn't mention)
4. Use platform components only if the description explicitly calls for them
5. Make it production-ready with proper data bindings, nesting, and realistic props

Generate the complete JSON config now.`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userMessage),
    ];

    // Call GPT-4
    console.log("[AppBuilder] Calling GPT with model:", MODEL_NAME);
    const response = await model.invoke(messages);
    console.log("[AppBuilder] GPT response received, length:", response?.content?.length || 0);
    const content = response.content;

    // Parse JSON from response (handle markdown code blocks if present)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/```json\n?/, "").replace(/```\n?$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```\n?/, "").replace(/```\n?$/, "");
    }

    const appConfig = JSON.parse(jsonStr);

    // Validate and normalize
    if (!appConfig.entities || !Array.isArray(appConfig.entities)) {
      appConfig.entities = [];
    }
    if (!appConfig.pages || !Array.isArray(appConfig.pages)) {
      appConfig.pages = [];
    }

    // Ensure all components have required fields
    appConfig.pages.forEach((page) => {
      if (page.components) {
        page.components = page.components.map((comp) => ({
          id: comp.id || `comp-${Date.now()}-${Math.random()}`,
          type: comp.type,
          name: comp.name || comp.type,
          props: comp.props || {},
          dataBinding: comp.dataBinding || null,
          parentId: comp.parentId || null,
          pageTag: comp.pageTag || null,
        }));
      }
    });

    return appConfig;
  } catch (error) {
    console.error("Builder AI agent error:", error);
    
    // Return null to fall back to template generator
    return null;
  }
};

export default {
  generateAppFromPrompt,
};

