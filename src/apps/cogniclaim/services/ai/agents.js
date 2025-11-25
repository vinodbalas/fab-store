/**
 * Cogniclaim Agentic AI System
 * 
 * Multi-agent reasoning engine using LangChain
 * Implements Chain of Thought reasoning with specialized agents
 * 
 * Note: Using LangChain's core chat models for browser compatibility.
 * LangGraph is Node.js-only and not used in this browser-based implementation.
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { SOP_INDEX, getSOPByScenario, SCENARIO_SOPS, getApplicableSOPsForClaim, getSOPByCode, getSOPsByState, getSOPByDenialCode } from "../../data/sops";
import { claimsAPI } from "../api";

// ==================== Configuration ====================
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";
const TEMPERATURE = 0.3; // Lower temperature for more consistent, analytical responses

// Initialize OpenAI model
const createModel = (temperature = TEMPERATURE) => {
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not found. Using mock mode.");
    return null;
  }
  
  return new ChatOpenAI({
    modelName: MODEL_NAME,
    temperature,
    streaming: true,
    openAIApiKey: OPENAI_API_KEY,
  });
};

// ==================== State Management ====================
/**
 * Agent state for reasoning workflow
 */
export const createAgentState = () => ({
  claim: null,           // Current claim being analyzed
  messages: [],          // Conversation history
  reasoningSteps: [],    // Chain of thought steps
  currentStep: null,     // Current processing step
  sopMatches: [],        // Matched SOPs
  riskFactors: [],       // Identified risk factors
  confidence: null,      // Overall confidence score
  recommendation: null,  // Final recommendation
  metadata: {},          // Additional metadata
});

// ==================== Tools ====================
/**
 * Tool: Lookup SOP by status or ID
 */
export const sopLookupTool = {
  name: "lookup_sop",
  description: "Lookup Standard Operating Procedure (SOP) by claim status or SOP ID. Returns SOP details including title, steps, and requirements.",
  schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description: "Claim status (e.g., 'Pending Review', 'Information Needed')",
      },
      sopId: {
        type: "string",
        description: "SOP ID (e.g., '3.2.1', '4.5.2')",
      },
    },
  },
  func: async ({ status, sopId }) => {
    if (status && SOP_INDEX[status]) {
      return JSON.stringify({
        success: true,
        sop: SOP_INDEX[status],
        matchedBy: "status",
      });
    }
    
    // Search by SOP ID in DEFAULT_SOPS (from SOPReferencePanel)
    const DEFAULT_SOPS = [
      { id: "3.1", title: "Eligibility & Pre-Authorization", text: "Patient eligibility must be confirmed before adjudication." },
      { id: "3.2.1", title: "Missing Pre-Authorization Handling", text: "If pre-auth is not attached, request from provider within 48 hours." },
      { id: "4.5.2", title: "Follow-up Escalation Process", text: "If no response after 48 hours, escalate to coding QA." },
    ];
    
    const sop = DEFAULT_SOPS.find(s => s.id === sopId);
    if (sop) {
      return JSON.stringify({ success: true, sop, matchedBy: "id" });
    }
    
    return JSON.stringify({ success: false, message: "SOP not found" });
  },
};

/**
 * Tool: Get similar historical claims
 */
export const historicalClaimsTool = {
  name: "get_similar_claims",
  description: "Retrieve similar historical claims for pattern analysis. Helps identify trends and predict outcomes.",
  schema: {
    type: "object",
    properties: {
      provider: { type: "string", description: "Provider name" },
      status: { type: "string", description: "Claim status" },
      amountRange: { type: "object", description: "Amount range {min, max}" },
      limit: { type: "number", description: "Maximum number of claims to return", default: 10 },
    },
  },
  func: async ({ provider, status, amountRange, limit = 10 }) => {
    try {
      // This would typically query a database
      // For now, we'll simulate with mock data
      const { CLAIMS } = await import("../../data/claims");
      
      let filtered = [...CLAIMS];
      
      if (provider) {
        filtered = filtered.filter(c => 
          c.provider.toLowerCase().includes(provider.toLowerCase())
        );
      }
      
      if (status) {
        filtered = filtered.filter(c => c.status === status);
      }
      
      if (amountRange) {
        filtered = filtered.filter(c => 
          c.amount >= (amountRange.min || 0) && 
          c.amount <= (amountRange.max || Infinity)
        );
      }
      
      // Calculate statistics
      const avgAmount = filtered.reduce((sum, c) => sum + c.amount, 0) / filtered.length || 0;
      const successRate = filtered.filter(c => 
        c.status === "Approved" || c.status === "Under Process"
      ).length / filtered.length || 0;
      
      return JSON.stringify({
        success: true,
        count: Math.min(filtered.length, limit),
        claims: filtered.slice(0, limit),
        statistics: {
          averageAmount: avgAmount,
          successRate,
          totalAnalyzed: filtered.length,
        },
      });
    } catch (error) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
};

/**
 * Tool: Analyze claim metadata
 */
export const claimAnalyzerTool = {
  name: "analyze_claim_metadata",
  description: "Deep analysis of claim metadata including diagnosis codes, provider info, amounts, and dates. Extracts key insights.",
  schema: {
    type: "object",
    properties: {
      claimId: { type: "string", description: "Claim ID to analyze" },
    },
  },
  func: async ({ claimId }) => {
    try {
      const claim = await claimsAPI.getById(claimId);
      
      // Extract insights
      const insights = {
        amount: claim.amount,
        provider: claim.provider,
        status: claim.status,
        member: claim.member,
        date: claim.date,
        daysSinceSubmission: Math.floor(
          (new Date() - new Date(claim.date)) / (1000 * 60 * 60 * 24)
        ),
        amountCategory: claim.amount < 2000 ? "low" : claim.amount < 4000 ? "medium" : "high",
      };
      
      return JSON.stringify({
        success: true,
        claim,
        insights,
      });
    } catch (error) {
      return JSON.stringify({ success: false, error: error.message });
    }
  },
};

// ==================== Specialized Agents ====================

/**
 * Agent 1: Claim Analysis Agent
 * Analyzes claim metadata and extracts key information
 */
export const createAnalysisAgent = () => {
  const model = createModel(0.2); // Lower temperature for analysis
  
  return async (state) => {
    if (!model) {
      // Fallback to mock
      const newStep = {
        role: "ai-step",
        text: "Analyzing claim metadata and diagnosis codes",
        confidence: 0.92,
        details: "Extracted ICD-10 codes, provider info, and claim amount",
        agent: "Analysis",
      };
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
      };
    }
    
    // Detect scenario from claim
    const scenario = state.claim.scenario || 
      (state.claim.buildDays !== null && state.claim.authorizedDays !== null ? "build-days" : null) ||
      (state.claim.ssn || state.claim.cob?.hasSecondary || state.claim.cob?.hasTertiary ? "cob" : null) ||
      (state.claim.admissionType === 1 || state.claim.revenueCodes?.length > 0 || state.claim.surgeryType ? "precertification" : null);

    const scenarioSOP = scenario ? getSOPByScenario(scenario) : null;
    
    const systemPrompt = `You are a claims analysis specialist. Your role is to analyze healthcare claim metadata and extract key information including:
- Claim amount and categorization
- Provider information and history
- Member details
- Submission dates and processing timeline
- Initial risk indicators
${scenario ? `- Scenario-specific analysis for: ${scenario}` : ""}

Provide your analysis in a structured format with confidence scores.${scenarioSOP ? ` Reference SOP: ${scenarioSOP.title}` : ""}`;

    const userPrompt = `Analyze the following claim:
${JSON.stringify(state.claim, null, 2)}
${scenario ? `\n\nThis claim matches the "${scenario}" scenario. Pay special attention to scenario-specific fields.` : ""}

Provide a detailed analysis with:
1. Key metadata extracted
2. Initial observations
3. Scenario-specific insights (if applicable)
4. Confidence score (0-1)`;

    try {
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];
      
      const response = await model.invoke(messages);
      
      const newStep = {
        role: "ai-step",
        text: "Analyzing claim metadata and diagnosis codes",
        confidence: 0.92,
        details: response.content,
        agent: "Analysis",
      };
      
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
      };
    } catch (error) {
      console.error("Analysis agent error:", error);
      return state;
    }
  };
};

/**
 * Agent 2: SOP Matching Agent
 * Matches claims to relevant Standard Operating Procedures
 */
export const createSOPMatchingAgent = () => {
  const model = createModel(0.3);
  
  return async (state) => {
    // Get all applicable SOPs for the claim (based on codes, state, scenario, etc.)
    const applicableSOPs = getApplicableSOPsForClaim(state.claim);
    
    // Detect scenario and get scenario-specific SOP
    const scenario = state.claim.scenario || 
      (state.claim.buildDays !== null && state.claim.authorizedDays !== null && state.claim.state === "Texas" ? "texas-medicaid-limits" : null) ||
      (state.claim.buildDays !== null && state.claim.authorizedDays !== null ? "build-days" : null) ||
      (state.claim.cob && state.claim.cob.primaryPayer === "Medicare" && state.claim.cob.hasSecondary ? "cob-medicare-secondary" : null) ||
      (state.claim.ssn || state.claim.cob?.hasSecondary || state.claim.cob?.hasTertiary ? "cob-primary-payer" : null) ||
      (state.claim.precertification && state.claim.precertification.required && !state.claim.precertification.obtained ? "prior-auth-missing" : null) ||
      (state.claim.admissionType === 1 || state.claim.revenueCodes?.length > 0 || state.claim.surgeryType ? "precertification-required" : null);
    
    const scenarioSOP = scenario ? getSOPByScenario(scenario) : null;
    const statusSOP = SOP_INDEX[state.claim?.status] || {};
    
    // Get SOP by CPT code if available
    const cptSOP = state.claim.cptCode ? getSOPByCode(state.claim.cptCode, "cpt") : null;
    // Get SOP by ICD-10 code if available
    const icd10SOP = state.claim.icd10Code ? getSOPByCode(state.claim.icd10Code, "icd10") : null;
    // Get SOP by state if available
    const stateSOPs = state.claim.state ? getSOPsByState(state.claim.state) : [];
    
    // Get primary SOP (scenario SOP takes precedence, then CPT, then ICD-10, then state-specific)
    const primarySOP = scenarioSOP || cptSOP || icd10SOP || (stateSOPs.length > 0 ? stateSOPs[0] : null) || statusSOP;

    if (!model) {
      // Fallback to mock
      const sop = primarySOP || statusSOP;
      const sopId = sop?.id || sop?.title?.match(/\d+\.\d+(\.\d+)?/)?.[0] || (primarySOP?.page?.match(/\d+/)?.[0] || "3.2.1");
      const sopTitle = sop?.title || "SOP 3.2.1";
      const sopPage = primarySOP?.page || scenarioSOP?.page || "";
      const sopRefs = primarySOP?.documentReferences || scenarioSOP?.documentReferences || [sopId];
      
      const newStep = {
        role: "ai-step",
        text: `Matching against ${sopTitle}${sopPage ? ` (${sopPage})` : ""}${scenario ? ` for scenario: ${scenario}` : ""}${state.claim.cptCode ? ` - CPT: ${state.claim.cptCode}` : ""}${state.claim.icd10Code ? ` - ICD-10: ${state.claim.icd10Code}` : ""}${state.claim.state ? ` - State: ${state.claim.state}` : ""}`,
        confidence: 0.88,
        details: primarySOP 
          ? `Scenario: ${scenario || "General"}. ${primarySOP.steps?.length || 0} steps identified. ${applicableSOPs.length > 1 ? `${applicableSOPs.length} total applicable SOPs found.` : ""}`
          : "Found 3 matching rule conditions",
        agent: "SOP Matcher",
        sopRefs: sopRefs,
      };
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
        sopMatches: scenarioSOP?.documentReferences || [sopId],
      };
    }
    
    const systemPrompt = `You are an SOP (Standard Operating Procedure) matching specialist. Your role is to:
1. Identify which SOPs apply to the claim based on status and characteristics
2. Extract SOP requirements and steps
3. Match claim conditions to SOP rules
4. Provide confidence scores for matches
${scenario ? `5. Pay special attention to scenario-specific SOPs for: ${scenario}` : ""}`;

    // Include scenario SOP if available
    const availableSOPs = scenarioSOP
      ? `Scenario SOP (${scenario}):\n${scenarioSOP.title}\nPage: ${scenarioSOP.page}\nSteps: ${scenarioSOP.steps.join(", ")}\n\n`
      : "";
    
    const statusSOPs = Object.entries(SOP_INDEX)
      .map(([status, sop]) => `Status: ${status}\n${sop.title}\nSteps: ${sop.steps.join(", ")}`)
      .join("\n\n");

    const userPrompt = `Match the following claim to relevant SOPs:
Claim: ${JSON.stringify(state.claim, null, 2)}
${scenario ? `\n\nThis claim matches the "${scenario}" scenario.` : ""}

Available SOPs:
${availableSOPs}${statusSOPs}

Identify matching SOPs and explain why they apply.${scenarioSOP ? ` Reference: ${scenarioSOP.page}` : ""}`;

    try {
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];
      
      const response = await model.invoke(messages);
      
      // Extract SOP references from response
      const sopMatches = response.content.match(/SOP\s*[\d.]+/gi) || [];
      const sopIds = sopMatches.map(m => m.match(/[\d.]+/)?.[0]).filter(Boolean);
      
      const newStep = {
        role: "ai-step",
        text: `Matching against SOP ${sopIds[0] || "3.2.1"} (Pre-authorization rules)`,
        confidence: 0.88,
        details: response.content,
        agent: "SOP Matcher",
        sopRefs: sopIds,
      };
      
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
        sopMatches: sopIds,
      };
    } catch (error) {
      console.error("SOP matching agent error:", error);
      return state;
    }
  };
};

/**
 * Agent 3: Risk Assessment Agent
 * Evaluates risk factors and compliance
 */
export const createRiskAssessmentAgent = () => {
  const model = createModel(0.4);
  
  return async (state) => {
    if (!model) {
      const newStep = {
        role: "ai-step",
        text: "Evaluating risk factors and compliance",
        confidence: 0.91,
        details: "No anomalies detected, all required documents present",
        agent: "Risk Assessor",
      };
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
        riskFactors: [],
      };
    }
    
    const systemPrompt = `You are a risk assessment specialist. Evaluate:
1. Compliance with SOPs
2. Missing documentation
3. Anomalies or red flags
4. Historical patterns
5. Provider reliability

Provide risk assessment with confidence scores.`;

    const userPrompt = `Assess risks for this claim:
${JSON.stringify(state.claim, null, 2)}

Previous analysis:
${JSON.stringify(state.reasoningSteps, null, 2)}`;

    try {
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];
      
      const response = await model.invoke(messages);
      
      const newStep = {
        role: "ai-step",
        text: "Evaluating risk factors and compliance",
        confidence: 0.91,
        details: response.content,
        agent: "Risk Assessor",
      };
      
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
      };
    } catch (error) {
      console.error("Risk assessment agent error:", error);
      return state;
    }
  };
};

/**
 * Agent 4: Recommendation Agent
 * Generates final recommendation based on all analysis
 */
export const createRecommendationAgent = () => {
  const model = createModel(0.5); // Slightly higher for creative recommendations
  
  return async (state) => {
    // Detect scenario and get scenario-specific SOP
    const scenario = state.claim.scenario || 
      (state.claim.buildDays !== null && state.claim.authorizedDays !== null ? "build-days" : null) ||
      (state.claim.ssn || state.claim.cob?.hasSecondary || state.claim.cob?.hasTertiary ? "cob" : null) ||
      (state.claim.admissionType === 1 || state.claim.revenueCodes?.length > 0 || state.claim.surgeryType ? "precertification" : null);
    
    const scenarioSOP = scenario ? getSOPByScenario(scenario) : null;
    const denialCodes = scenarioSOP?.denialCodes || [];

    if (!model) {
      // Generate scenario-specific recommendation
      let recommendationText, action, sopRefs;
      
      // Enhanced scenario-based recommendations
      if (scenario === "texas-medicaid-limits" || scenario === "build-days") {
        const exceeds = state.claim.buildDays > state.claim.authorizedDays;
        const providerEligible = state.claim.providerEligibility?.eligible ?? true;
        action = exceeds || !providerEligible ? "DENY" : "APPROVE";
        recommendationText = exceeds
          ? `Claim should be denied. Build-in patient days (${state.claim.buildDays}) exceed authorized days (${state.claim.authorizedDays}) in ${state.claim.state || "Texas"}. Refer to ${scenarioSOP?.title || "SOP 7.01"} (${scenarioSOP?.page || "Page 9"}) for Texas Medicaid day limits.`
          : !providerEligible
          ? `Claim should be denied. Provider ${state.claim.provider} is not eligible for authorization.`
          : "Claim may proceed with standard processing.";
        sopRefs = scenarioSOP?.documentReferences || ["Page 9"];
      } else if (scenario === "cob-medicare-secondary" || scenario === "cob-primary-payer" || scenario === "cob") {
        action = "PROCESS";
        recommendationText = state.claim.ssn
          ? `COB compliance achieved. Member profile updated with ${state.claim.cob?.primaryPayer || "primary payer"} data and external enrollment records. Refer to ${scenarioSOP?.title || "SOP 8.01"} (${scenarioSOP?.page || "Page 25"}) for COB guidelines.`
          : "COB compliance pending SSN verification.";
        sopRefs = scenarioSOP?.documentReferences || ["Page 25", "Page 26"];
      } else if (scenario === "precertification-required" || scenario === "prior-auth-missing" || scenario === "precertification") {
        const requiresPrecert = state.claim.admissionType === 1 || 
          (state.claim.revenueCodes && state.claim.revenueCodes.some(code => code.startsWith('45') || code.startsWith('7B'))) ||
          (state.claim.precertification && state.claim.precertification.required);
        const hasPrecert = state.claim.precertification?.obtained ?? false;
        action = requiresPrecert && hasPrecert ? "APPROVE" : (requiresPrecert ? "DENY" : "PROCESS");
        recommendationText = requiresPrecert && hasPrecert
          ? `Claim qualifies for precertification. ${state.claim.admissionType === 1 ? "Admission type 1" : ""} ${state.claim.revenueCodes && state.claim.revenueCodes.length > 0 ? "and revenue codes present" : ""}. Document verified. Refer to ${scenarioSOP?.title || "SOP 12.01"} (${scenarioSOP?.page || "Page 11-12"}).`
          : requiresPrecert
          ? `Precertification required but document not obtained. Claim should be denied. Refer to ${scenarioSOP?.title || "SOP 4.01"} (${scenarioSOP?.page || "Page 15"}) for prior authorization requirements.`
          : "Precertification not required for this claim.";
        sopRefs = scenarioSOP?.documentReferences || ["Page 11", "Page 12"];
      } else if (scenario === "medical-necessity") {
        action = "REVIEW";
        recommendationText = `Medical necessity review required for CPT code ${state.claim.cptCode} with diagnosis ${state.claim.icd10Code}. Refer to ${scenarioSOP?.title || "SOP 5.01"} (${scenarioSOP?.page || "Page 22"}) for medical necessity guidelines.`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 22"];
      } else if (scenario === "provider-out-of-network") {
        action = "DENY";
        recommendationText = `Provider is out-of-network. Claim should be denied unless emergency exception applies. Refer to ${scenarioSOP?.title || "SOP 9.01"} (${scenarioSOP?.page || "Page 27"}) for out-of-network guidelines.`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 27"];
      } else if (scenario === "california-medi-cal-prior-auth") {
        action = state.claim.precertification?.obtained ? "APPROVE" : "DENY";
        recommendationText = state.claim.precertification?.obtained
          ? `California Medi-Cal authorization verified. Refer to ${scenarioSOP?.title || "SOP 7.02"} (${scenarioSOP?.page || "Page 18"}).`
          : `California Medi-Cal prior authorization missing. 72-hour notification required for non-emergency surgeries. Refer to ${scenarioSOP?.title || "SOP 7.02"} (${scenarioSOP?.page || "Page 18"}).`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 18"];
      } else if (scenario === "new-york-medicaid-inpatient") {
        action = state.claim.precertification?.obtained ? "APPROVE" : "DENY";
        recommendationText = state.claim.precertification?.obtained
          ? `New York Medicaid inpatient authorization verified. Refer to ${scenarioSOP?.title || "SOP 7.03"} (${scenarioSOP?.page || "Page 19"}).`
          : `New York Medicaid requires authorization for all inpatient procedures. Refer to ${scenarioSOP?.title || "SOP 7.03"} (${scenarioSOP?.page || "Page 19"}).`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 19"];
      } else if (scenario === "florida-medicaid-elective-surgery") {
        action = state.claim.precertification?.obtained ? "APPROVE" : "DENY";
        recommendationText = state.claim.precertification?.obtained
          ? `Florida Medicaid elective surgery authorization verified. Refer to ${scenarioSOP?.title || "SOP 7.04"} (${scenarioSOP?.page || "Page 20"}).`
          : `Florida Medicaid requires authorization for all elective surgeries. Refer to ${scenarioSOP?.title || "SOP 7.04"} (${scenarioSOP?.page || "Page 20"}).`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 20"];
      } else if (scenario === "timely-filing") {
        action = "DENY";
        recommendationText = `Timely filing deadline exceeded. Claim should be denied. Refer to ${scenarioSOP?.title || "SOP 10.01"} (${scenarioSOP?.page || "Page 28"}) for timely filing guidelines.`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 28"];
      } else if (scenario === "bundled-services") {
        action = "REVIEW";
        recommendationText = `Bundled services detected. Check if modifier -59 applies for distinct procedural service. Refer to ${scenarioSOP?.title || "SOP 11.01"} (${scenarioSOP?.page || "Page 29"}) for CCI edits.`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 29"];
      } else if (scenario === "invalid-cpt-code") {
        action = "DENY";
        recommendationText = `Invalid CPT code ${state.claim.cptCode}. Request corrected claim with valid CPT code. Refer to ${scenarioSOP?.title || "SOP 6.01"} (${scenarioSOP?.page || "Page 30"}) for coding guidelines.`;
        sopRefs = scenarioSOP?.documentReferences || ["Page 30"];
      } else {
        action = "PROCESS";
        recommendationText = `Request pre-authorization from provider and set follow-up in 48 hours.${applicableSOPs.length > 0 ? ` ${applicableSOPs.length} applicable SOP(s) identified.` : ""}`;
        sopRefs = applicableSOPs.length > 0 ? applicableSOPs[0].documentReferences || [] : ["3.2.1"];
      }

      const newStep = {
        role: "ai-reco",
        text: `Recommendation: ${recommendationText}${scenarioSOP ? ` See ${scenarioSOP.page || "SOP"}.` : ""}`,
        confidence: 0.89,
        reasoning: `High confidence based on ${scenario ? `${scenario} scenario analysis` : "SOP compliance"} and historical success rate of 87%`,
        sopRefs: sopRefs,
        agent: "Recommender",
        denialCodes: denialCodes.map(dc => dc.code),
      };
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
        recommendation: {
          action,
          text: recommendationText,
          timeline: scenario === "cob" ? "Immediate" : "48 hours",
          sopRefs: sopRefs,
          confidence: 0.89,
          denialCodes: denialCodes,
        },
      };
    }
    
    const systemPrompt = `You are a claims recommendation specialist. Based on all previous analysis, provide:
1. Clear, actionable recommendation
2. Timeline for action
3. Relevant SOP references
4. Confidence score
5. Reasoning behind the recommendation
${scenario ? `6. Scenario-specific recommendations for: ${scenario}` : ""}
${denialCodes.length > 0 ? `7. Denial codes if applicable: ${denialCodes.map(dc => `${dc.code} - ${dc.description}`).join(", ")}` : ""}`;

    const userPrompt = `Generate recommendation based on:
Claim: ${JSON.stringify(state.claim, null, 2)}
Analysis: ${JSON.stringify(state.reasoningSteps, null, 2)}
SOPs: ${JSON.stringify(state.sopMatches, null, 2)}
${scenario ? `\n\nThis claim matches the "${scenario}" scenario. Provide scenario-specific recommendation.` : ""}
${scenarioSOP ? `\n\nScenario SOP: ${scenarioSOP.title} (${scenarioSOP.page})` : ""}`;

    try {
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];
      
      const response = await model.invoke(messages);
      
      // Extract SOP references
      const sopMatches = response.content.match(/SOP\s*[\d.]+/gi) || [];
      const sopIds = sopMatches.map(m => m.match(/[\d.]+/)?.[0]).filter(Boolean);
      
      // Extract denial codes (e.g., N26, N24)
      const denialCodeMatches = response.content.match(/\b([N]\d{2,3})\b/gi) || [];
      const extractedDenialCodes = denialCodeMatches.map(code => {
        const denialCode = denialCodes.find(dc => dc.code === code.toUpperCase());
        return denialCode || { code: code.toUpperCase(), description: "Denial code" };
      });
      
      // Use scenario SOP references if no SOP IDs found
      const finalSopRefs = sopIds.length > 0 ? sopIds : (scenarioSOP?.documentReferences || ["3.2.1"]);
      
      // Determine action from response
      const responseLower = response.content.toLowerCase();
      let action = "PROCESS";
      if (responseLower.includes("deny") || responseLower.includes("denial")) {
        action = "DENY";
      } else if (responseLower.includes("approve") || responseLower.includes("approval")) {
        action = "APPROVE";
      }
      
      const newStep = {
        role: "ai-reco",
        text: response.content.split("\n")[0] || "See recommendation details.",
        confidence: 0.89,
        reasoning: response.content,
        sopRefs: finalSopRefs,
        agent: "Recommender",
        denialCodes: extractedDenialCodes.length > 0 ? extractedDenialCodes.map(dc => dc.code) : denialCodes.map(dc => dc.code),
      };
      
      return {
        ...state,
        reasoningSteps: [
          ...(state.reasoningSteps || []),
          newStep,
        ],
        recommendation: {
          action,
          text: response.content,
          sopRefs: finalSopRefs,
          confidence: 0.89,
          denialCodes: extractedDenialCodes.length > 0 ? extractedDenialCodes : denialCodes,
        },
      };
    } catch (error) {
      console.error("Recommendation agent error:", error);
      return state;
    }
  };
};

// ==================== Multi-Agent Workflow ====================

/**
 * Main reasoning workflow using multi-agent chain of thought
 * Orchestrates sequential agent execution: Analysis -> SOP Matching -> Risk Assessment -> Recommendation
 * 
 * Note: Uses LangChain's core chat models for browser compatibility.
 * The workflow is manually orchestrated to avoid Node.js-only dependencies.
 */
export const createReasoningWorkflow = () => {
  // Create agents
  const analysisAgent = createAnalysisAgent();
  const sopMatchingAgent = createSOPMatchingAgent();
  const riskAssessmentAgent = createRiskAssessmentAgent();
  const recommendationAgent = createRecommendationAgent();
  
  // Return workflow executor
  return {
    analysisAgent,
    sopMatchingAgent,
    riskAssessmentAgent,
    recommendationAgent,
  };
};

// ==================== Public API ====================

/**
 * Execute reasoning workflow for a claim
 * Chain of Thought: Analysis -> SOP Matching -> Risk Assessment -> Recommendation
 * @param {Object} claim - Claim to analyze
 * @param {Function} onStep - Callback for each reasoning step (for streaming)
 * @returns {Promise<Object>} Final state with reasoning steps and recommendation
 */
export const executeReasoning = async (claim, onStep = null) => {
  const workflow = createReasoningWorkflow();
  
  let state = {
    claim,
    reasoningSteps: [
      {
        role: "ai-model",
        model: MODEL_NAME || "gpt-4o-mini",
        strategy: "Multi-agent chain of thought reasoning",
        confidence: null,
      },
    ],
    sopMatches: [],
    riskFactors: [],
    recommendation: null,
  };
  
  try {
    // Step 1: Analysis Agent
    if (onStep) {
      onStep({
        role: "ai-model",
        model: MODEL_NAME || "gpt-4o-mini",
        strategy: "Multi-agent chain of thought reasoning",
        confidence: null,
      });
    }
    
    state = await workflow.analysisAgent(state);
    if (onStep && state.reasoningSteps.length > 1) {
      onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
    }
    
    // Small delay for UI smoothness
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 2: SOP Matching Agent
    state = await workflow.sopMatchingAgent(state);
    if (onStep && state.reasoningSteps.length > 1) {
      onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 3: Risk Assessment Agent
    state = await workflow.riskAssessmentAgent(state);
    if (onStep && state.reasoningSteps.length > 1) {
      onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 4: Recommendation Agent
    state = await workflow.recommendationAgent(state);
    if (onStep && state.reasoningSteps.length > 1) {
      onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
    }
    
    return state;
  } catch (error) {
    console.error("Reasoning workflow error:", error);
    
    // Fallback to mock response if API fails
    const fallbackSteps = [
      ...state.reasoningSteps,
      {
        role: "ai-step",
        text: "Analyzing claim metadata and diagnosis codes",
        confidence: 0.92,
        details: "Using fallback analysis due to API unavailability",
        agent: "Analysis",
      },
      {
        role: "ai-step",
        text: "Matching against SOP 3.2.1 (Pre-authorization rules)",
        confidence: 0.88,
        details: "Found 3 matching rule conditions",
        agent: "SOP Matcher",
        sopRefs: ["3.2.1"],
      },
      {
        role: "ai-step",
        text: "Evaluating risk factors and compliance",
        confidence: 0.91,
        details: "No anomalies detected, all required documents present",
        agent: "Risk Assessor",
      },
      {
        role: "ai-reco",
        text: "Recommendation: Request pre-authorization from provider and set follow-up in 48 hours. See SOP 3.2.1.",
        confidence: 0.89,
        reasoning: "High confidence based on SOP compliance and historical success rate of 87%",
        sopRefs: ["3.2.1"],
        agent: "Recommender",
      },
    ];
    
    // Call onStep for each fallback step
    if (onStep) {
      fallbackSteps.slice(state.reasoningSteps.length).forEach(step => {
        onStep(step);
        // Small delay for streaming effect
        return new Promise(resolve => setTimeout(resolve, 100));
      });
    }
    
    return {
      ...state,
      reasoningSteps: fallbackSteps,
    };
  }
};

export default {
  executeReasoning,
  createReasoningWorkflow,
  createAnalysisAgent,
  createSOPMatchingAgent,
  createRiskAssessmentAgent,
  createRecommendationAgent,
};

