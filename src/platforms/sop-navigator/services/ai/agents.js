/**
 * SOP Executor Platform - AI Agents
 * 
 * Multi-agent reasoning engine using LangChain
 * Platform-agnostic implementation that accepts SOP data via provider
 * 
 * Note: Using LangChain's core chat models for browser compatibility.
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

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
    model: MODEL_NAME,
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
  item: null,           // Current item being analyzed (claim, application, etc.)
  messages: [],          // Conversation history
  reasoningSteps: [],    // Chain of thought steps
  currentStep: null,     // Current processing step
  sopMatches: [],        // Matched SOPs
  riskFactors: [],       // Identified risk factors
  confidence: null,      // Overall confidence score
  recommendation: null,  // Final recommendation
  metadata: {},          // Additional metadata
});

// ==================== Platform API Factory ====================
/**
 * Create AI agents with SOP data provider
 * @param {Object} sopProvider - SOPDataProvider instance
 * @param {Object} itemAPI - API for accessing items (e.g., claimsAPI)
 */
export const createPlatformAgents = (sopProvider, itemAPI = null) => {
  const getSOPByScenario = (scenario) => sopProvider.lookupSOPByScenario(scenario);
  const getSOPByStatus = (status) => sopProvider.lookupSOPByStatus(status);
  const getApplicableSOPs = (item) => sopProvider.lookupApplicableSOPs(item);
  const SOP_INDEX = sopProvider.getSOPIndex();
  const SCENARIO_SOPS = sopProvider.getScenarioSOPs();

  // ==================== Specialized Agents ====================

  /**
   * Agent 1: Analysis Agent
   * Analyzes item metadata and extracts key information
   */
  const createAnalysisAgent = () => {
    const model = createModel(0.2);
    
    return async (state) => {
      if (!model) {
        const newStep = {
          role: "ai-step",
          text: "Analyzing item metadata and codes",
          confidence: 0.92,
          details: "Extracted key information and initial observations",
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
      
      // Detect scenario from item (solution-specific logic)
      const scenario = state.item?.scenario || null;
      const scenarioSOP = scenario ? getSOPByScenario(scenario) : null;
      
      const systemPrompt = `You are an analysis specialist. Your role is to analyze item metadata and extract key information including:
- Item amount and categorization
- Provider/entity information and history
- Member/customer details
- Submission dates and processing timeline
- Initial risk indicators
${scenario ? `- Scenario-specific analysis for: ${scenario}` : ""}

Provide your analysis in a structured format with confidence scores.${scenarioSOP ? ` Reference SOP: ${scenarioSOP.title}` : ""}`;

      const userPrompt = `Analyze the following item:
${JSON.stringify(state.item, null, 2)}
${scenario ? `\n\nThis item matches the "${scenario}" scenario. Pay special attention to scenario-specific fields.` : ""}

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
          text: "Analyzing item metadata and codes",
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
   * Matches items to relevant Standard Operating Procedures
   */
  const createSOPMatchingAgent = () => {
    const model = createModel(0.3);
    
    return async (state) => {
      const applicableSOPs = getApplicableSOPs(state.item);
      
      // Detect scenario (solution-specific logic)
      const scenario = state.item?.scenario || null;
      const scenarioSOP = scenario ? getSOPByScenario(scenario) : null;
      const statusSOP = SOP_INDEX[state.item?.status] || {};
      
      const primarySOP = scenarioSOP || statusSOP;

      if (!model) {
        const sop = primarySOP || statusSOP;
        const sopId = sop?.id || sop?.title?.match(/\d+\.\d+(\.\d+)?/)?.[0] || "3.2.1";
        const sopTitle = sop?.title || "SOP 3.2.1";
        const sopPage = primarySOP?.page || scenarioSOP?.page || "";
        const sopRefs = primarySOP?.documentReferences || scenarioSOP?.documentReferences || [sopId];
        
        let sopText = `Matching against ${sopTitle}`;
        if (sopPage) {
          sopText += ` (${sopPage})`;
        }
        if (scenario) {
          const scenarioName = scenario.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
          sopText += ` for scenario: ${scenarioName}`;
        }
        
        const newStep = {
          role: "ai-step",
          text: sopText,
          confidence: 0.88,
          details: primarySOP 
            ? `Scenario: ${scenario || "General"}. ${primarySOP.steps?.length || 0} steps identified. ${applicableSOPs.length > 1 ? `${applicableSOPs.length} total applicable SOPs found.` : ""}`
            : "Found matching rule conditions",
          agent: "SOP Matcher",
          sopRefs: sopRefs,
          scenario: scenario,
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
1. Identify which SOPs apply to the item based on status and characteristics
2. Extract SOP requirements and steps
3. Match item conditions to SOP rules
4. Provide confidence scores for matches
${scenario ? `5. Pay special attention to scenario-specific SOPs for: ${scenario}` : ""}`;

      const availableSOPs = scenarioSOP
        ? `Scenario SOP (${scenario}):\n${scenarioSOP.title}\nPage: ${scenarioSOP.page}\nSteps: ${scenarioSOP.steps.join(", ")}\n\n`
        : "";
      
      const statusSOPs = Object.entries(SOP_INDEX)
        .map(([status, sop]) => `Status: ${status}\n${sop.title}\nSteps: ${sop.steps.join(", ")}`)
        .join("\n\n");

      const userPrompt = `Match the following item to relevant SOPs:
Item: ${JSON.stringify(state.item, null, 2)}
${scenario ? `\n\nThis item matches the "${scenario}" scenario.` : ""}

Available SOPs:
${availableSOPs}${statusSOPs}

Identify matching SOPs and explain why they apply.${scenarioSOP ? ` Reference: ${scenarioSOP.page}` : ""}`;

      try {
        const messages = [
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ];
        
        const response = await model.invoke(messages);
        
        const sopMatches = response.content.match(/SOP\s*[\d.]+/gi) || [];
        const sopIds = sopMatches.map(m => m.match(/[\d.]+/)?.[0]).filter(Boolean);
        
        const sopId = sopIds[0] || scenarioSOP?.id || "3.2.1";
        const sopTitle = scenarioSOP?.title || "SOP rules";
        const sopPage = scenarioSOP?.page || null;
        
        let sopText = `Matching against SOP ${sopId} - ${sopTitle}`;
        if (sopPage) {
          sopText += ` (${sopPage})`;
        }
        if (scenario) {
          const scenarioName = scenario.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
          sopText += ` for scenario: ${scenarioName}`;
        }
        
        const newStep = {
          role: "ai-step",
          text: sopText,
          confidence: 0.88,
          details: response.content,
          agent: "SOP Matcher",
          sopRefs: sopIds.length > 0 ? sopIds : (scenarioSOP?.documentReferences || [sopId]),
          scenario: scenario,
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
  const createRiskAssessmentAgent = () => {
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
5. Provider/entity reliability

Provide risk assessment with confidence scores.`;

      const userPrompt = `Assess risks for this item:
${JSON.stringify(state.item, null, 2)}

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
  const createRecommendationAgent = () => {
    const model = createModel(0.5);
    
    return async (state) => {
      const scenario = state.item?.scenario || null;
      const scenarioSOP = scenario ? getSOPByScenario(scenario) : null;
      const denialCodes = [
        ...(scenarioSOP?.denialCodes || []),
        ...(state.item?.denialCodes?.map(code => ({ code, description: "" })) || []),
      ];

      if (!model) {
        let action = "PROCESS";
        const item = state.item || {};
        let recommendationText;
        let reasoningText;
        const hasDuplicateDenial = denialCodes.some(dc => dc.code === "CO-18");

        const formatAmount = (val) =>
          typeof val === "number" ? `$${val.toLocaleString()}` : val;

        const itemLabel = (() => {
          if (item.loanNumber || String(item.id || "").startsWith("LND-")) return "loan";
          if (item.caseNumber || item.type === "Appeal") return "case";
          return "claim";
        })();

        const idLabel = item.loanNumber || item.caseNumber || item.id || "this item";
        const statusLabel = item.status || "In Process";
        const amountLabel = item.amount || item.loanAmount;
        const amountText = amountLabel ? `Amount: ${formatAmount(amountLabel)}. ` : "";

        const denialSummary = denialCodes.length
          ? `Key denial codes: ${denialCodes.map(d => `${d.code}${d.description ? ` (${d.description})` : ""}`).join(", ")}. `
          : "No high-severity denial codes present. ";

        const sopLabel = scenarioSOP
          ? `${scenarioSOP.title}${scenarioSOP.page ? ` (${scenarioSOP.page}${scenarioSOP.state && scenarioSOP.state !== "All" ? `, ${scenarioSOP.state}` : ""})` : ""}`
          : "applicable standard operating procedures";

        if (hasDuplicateDenial || scenario === "duplicate-claim-same-day" || scenario === "duplicate-claim-appeal") {
          action = "DENY";
          recommendationText = `Deny ${itemLabel} ${idLabel} as a true duplicate. ${amountText}Detected duplicate indicator CO-18 and matching service details; processing under the duplicate-claim rule. Apply denial per ${sopLabel} and document the linkage to the original ${itemLabel} for audit traceability.`;
        } else if (scenario === "dti-bankruptcy-single" || scenario === "dti-bankruptcy-multiple") {
          // Handle DTI with bankruptcy scenarios (used by TP Lend)
          const frontEndDTI = item?.frontEndDTI;
          const backEndDTI = item?.backEndDTI;
          const bankruptcyHistory = item?.bankruptcyHistory;
          const waitingPeriodSatisfied = bankruptcyHistory?.waitingPeriodSatisfied;
          
          if (!waitingPeriodSatisfied) {
            action = "DENY";
            recommendationText = `Deny loan ${idLabel} due to bankruptcy seasoning not met. Required waiting period is ${bankruptcyHistory?.waitingPeriodRequired || 4} years, but only ${bankruptcyHistory?.yearsSinceDischarge || "an unknown number of"} years have elapsed. Reference B3-5.3-07 for multiple bankruptcy filings and document the exception handling.`;
          } else if (frontEndDTI && backEndDTI) {
            // Check DTI thresholds
            const dtiAcceptable = frontEndDTI <= 28 && backEndDTI <= 36;
            const dtiWithCompensating = frontEndDTI <= 36 && backEndDTI <= 45 && item?.creditReestablishment?.onTimePayments;
            
            if (dtiAcceptable || dtiWithCompensating) {
              action = "APPROVE";
              const loanAmount = item?.loanAmount || "the requested amount";
              recommendationText = `Approve loan ${idLabel} for ${formatAmount(loanAmount)} subject to final documentation. Front-end DTI is ${frontEndDTI.toFixed(2)}% and back-end DTI is ${backEndDTI.toFixed(2)}%, both inside the acceptable range for this profile given strong post-bankruptcy credit re-establishment. Base the decision on B3-6-02 (Debt-to-Income Ratios) and B3-5.3-07 (Bankruptcy Waiting Periods), and confirm income and asset documentation before clear-to-close.`;

              const monthsSinceBk = item?.creditReestablishment?.monthsSinceBankruptcy;
              const approxYearsSinceBk = monthsSinceBk ? (monthsSinceBk / 12).toFixed(1) : null;
              const waitingRequired = bankruptcyHistory?.waitingPeriodRequired || 4;

              reasoningText =
                `• Front-end DTI ≈ ${frontEndDTI.toFixed(2)}% = monthly housing payment ÷ gross monthly income.\n` +
                `• Back-end DTI ≈ ${backEndDTI.toFixed(2)}% = (housing payment + recurring debts) ÷ gross income.\n` +
                `• Benchmarks from B3-6-02: standard guideline ≈ 28% front-end / 36% back-end; this file is comfortably below those limits.\n` +
                `• Bankruptcy seasoning satisfied per B3-5.3-07 (${bankruptcyHistory?.count || 1} prior filing(s); required waiting period ${waitingRequired} years; actual ≈ ${approxYearsSinceBk || "≥ required"} years with re-established credit and on-time payments).`;
            } else {
              action = "DENY";
              recommendationText = `Deny loan ${idLabel} due to excessive leverage. Calculated front-end DTI is ${frontEndDTI.toFixed(2)}% and back-end DTI is ${backEndDTI.toFixed(2)}%, exceeding the standard limits in B3-6-02 without sufficient compensating factors. Document the specific drivers (e.g., high revolving utilization or limited reserves) and reference B3-6-02 in the adverse action notice.`;
            }
          } else {
            action = "PROCESS";
            recommendationText = `Continue underwriting for loan ${idLabel} with a focus on validating DTI inputs. Confirm all income sources, recurring obligations, and any contingent liabilities before applying B3-6-02 and B3-5.3-07. Do not issue a final decision until updated documentation confirms ratios within tolerances.`;
          }
        } else {
          // Generic but richer fallback for standard claims/cases/loans
          const contextBits = [];
          if (item.member) contextBits.push(`member ${item.member}`);
          if (item.borrower) contextBits.push(`borrower ${item.borrower}`);
          if (item.provider) contextBits.push(`provider ${item.provider}`);
          if (item.issueType) contextBits.push(`issue: ${item.issueType}`);

          const contextText = contextBits.length
            ? `Context: ${contextBits.join(" • ")}. `
            : "";

          recommendationText = `Process ${itemLabel} ${idLabel} under ${statusLabel} following ${sopLabel}. ${amountText}${contextText}${denialSummary}No material red flags were identified in the analysis, so proceed with standard workflow steps and monitoring in line with the referenced SOP.`;
        }

        const sopRefs = scenarioSOP?.documentReferences || ["3.2.1"];

        const newStep = {
          role: "ai-reco",
          text: `Recommendation: ${recommendationText}`,
          confidence: 0.89,
          reasoning: reasoningText || `High confidence based on ${scenario ? `${scenario} scenario analysis and alignment with ${sopLabel}` : `status (${statusLabel}) and SOP-based controls`}.\n\n${denialSummary}This recommendation assumes no additional adverse information beyond what is reflected in the current item snapshot.`,
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
            timeline: "48 hours",
            sopRefs: sopRefs,
            confidence: 0.89,
            denialCodes: denialCodes,
          },
        };
      }
      
      const systemPrompt = `You are a recommendation specialist. Based on all previous analysis, provide:
1. Clear, actionable recommendation
2. Whether to APPROVE, DENY (including deny as duplicate), or PROCESS
3. Timeline for action
4. Relevant SOP references
5. Confidence score
6. Reasoning behind the recommendation
${scenario ? `7. Scenario-specific recommendations for: ${scenario}` : ""}
${denialCodes.length > 0 ? `8. Denial codes if applicable: ${denialCodes.map(dc => `${dc.code} - ${dc.description}`).join(", ")}` : ""}
${scenario?.includes("dti") ? `9. For DTI scenarios: Calculate and evaluate front-end DTI (housing payment/income) and back-end DTI (total obligations/income). Standard limits: 28% front-end, 36% back-end for conventional loans. Higher DTI may be acceptable with strong compensating factors.` : ""}
${scenario?.includes("bankruptcy") ? `10. For bankruptcy scenarios: Verify waiting period satisfied (4 years for single, 5 years for multiple within 7 years per B3-5.3-07). Assess credit re-establishment and compensating factors.` : ""}`;

      const userPrompt = `Generate a recommendation for this item.
Item: ${JSON.stringify(state.item, null, 2)}
Analysis steps: ${JSON.stringify(state.reasoningSteps, null, 2)}
Matched SOPs: ${JSON.stringify(state.sopMatches, null, 2)}
${scenario ? `\nThis item matches the "${scenario}" scenario.` : ""}
${scenarioSOP ? `\nScenario SOP: ${scenarioSOP.title} (${scenarioSOP.page}).` : ""}
${denialCodes.length ? `\nKey denial codes present: ${denialCodes.map(dc => dc.code).join(", ")}` : ""}

If this is a true duplicate claim (e.g., CO-18 or 'duplicate claim/service'), explicitly recommend DENYING the duplicate claim and reference the duplicate-claim SOP and denial code.
If it is a valid corrected claim or not a duplicate, recommend APPROVE or PROCESS with clear justification.`;

      try {
        const messages = [
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ];
        
        const response = await model.invoke(messages);
        
        const sopMatches = response.content.match(/SOP\s*[\d.]+/gi) || [];
        const sopIds = sopMatches.map(m => m.match(/[\d.]+/)?.[0]).filter(Boolean);
        const finalSopRefs = sopIds.length > 0 ? sopIds : (scenarioSOP?.documentReferences || ["3.2.1"]);
        
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
            text: response.content,
            sopRefs: finalSopRefs,
            confidence: 0.89,
            denialCodes: denialCodes,
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
   */
  const createReasoningWorkflow = () => {
    return {
      analysisAgent: createAnalysisAgent(),
      sopMatchingAgent: createSOPMatchingAgent(),
      riskAssessmentAgent: createRiskAssessmentAgent(),
      recommendationAgent: createRecommendationAgent(),
    };
  };

  /**
   * Execute reasoning workflow for an item
   * @param {Object} item - Item to analyze
   * @param {Function} onStep - Callback for each reasoning step (for streaming)
   * @returns {Promise<Object>} Final state with reasoning steps and recommendation
   */
  const executeReasoning = async (item, onStep = null) => {
    const workflow = createReasoningWorkflow();
    
    let state = {
      item,
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
      if (onStep) {
        onStep(state.reasoningSteps[0]);
      }
      
      state = await workflow.analysisAgent(state);
      if (onStep && state.reasoningSteps.length > 1) {
        onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      
      state = await workflow.sopMatchingAgent(state);
      if (onStep && state.reasoningSteps.length > 1) {
        onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      
      state = await workflow.riskAssessmentAgent(state);
      if (onStep && state.reasoningSteps.length > 1) {
        onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      
      state = await workflow.recommendationAgent(state);
      if (onStep && state.reasoningSteps.length > 1) {
        onStep(state.reasoningSteps[state.reasoningSteps.length - 1]);
      }
      
      return state;
    } catch (error) {
      console.error("Reasoning workflow error:", error);
      return state;
    }
  };

  return {
    executeReasoning,
    createReasoningWorkflow,
    createAnalysisAgent,
    createSOPMatchingAgent,
    createRiskAssessmentAgent,
    createRecommendationAgent,
  };
};

export default createPlatformAgents;

