/**
 * SOP Executor Platform Adapter for AI Watchtower
 * 
 * Bridges SOP Executor's AI agents to the generic AI Watchtower interface
 */

import { AIWatchtowerProvider } from '../core/AIWatchtowerProvider';
import { createPlatformAgents, createPlatformChatAgent } from '../../../platforms/sop-executor';

export function createSOPExecutorWatchtowerProvider(sopProvider, itemAPI, solutionConfig) {
  const platformAgents = createPlatformAgents(sopProvider, solutionConfig.itemLabel || "item");
  const chatAgent = createPlatformChatAgent(sopProvider, solutionConfig.solutionName || "Solution", solutionConfig.itemLabel || "item");

  const provider = new AIWatchtowerProvider({
    itemLabel: solutionConfig.itemLabel || "item",
    itemLabelPlural: solutionConfig.itemLabelPlural || "items",
    referenceType: "sop",
    platformName: "SOP Executor",
    solutionName: solutionConfig.solutionName || "Solution",
    agentNames: {
      analyzer: "Intake Agent",
      matcher: "SOP Reasoning",
      risk: "SLA Risk Assessment",
      recommendation: "Recommendation Engine",
    },
    ...solutionConfig,
  });

  // Override methods
  provider.getItem = async (itemId) => {
    if (!itemAPI) return null;
    return itemAPI.getById(itemId);
  };

  provider.executeReasoning = async (item, onStep) => {
    if (!platformAgents) return;

    // Execute the multi-agent reasoning chain
    const state = { item, reasoningSteps: [], recommendation: null };
    
    // Step 1: Analysis
    const analysisState = await platformAgents.analysisAgent(state);
    onStep?.({
      role: "ai-step",
      agent: "Intake Agent",
      text: analysisState.reasoningSteps[0]?.text || "Analyzed item metadata and extracted key information",
      confidence: 0.92,
    });

    // Step 2: SOP Matching
    const sopState = await platformAgents.sopMatchingAgent(analysisState);
    onStep?.({
      role: "ai-step",
      agent: "SOP Reasoning",
      text: sopState.reasoningSteps[0]?.text || "Matched applicable SOPs",
      confidence: 0.88,
      references: sopState.sopMatches?.map(sop => ({
        id: sop.id,
        type: "sop",
        label: sop.title || sop.id,
      })),
    });

    // Step 3: Risk Assessment
    const riskState = await platformAgents.riskAssessmentAgent(sopState);
    onStep?.({
      role: "ai-step",
      agent: "SLA Risk Assessment",
      text: riskState.reasoningSteps[0]?.text || "Assessed SLA compliance risk",
      confidence: 0.90,
    });

    // Step 4: Recommendation
    const finalState = await platformAgents.recommendationAgent(riskState);
    onStep?.({
      role: "ai-reco",
      text: finalState.recommendation?.text || "Recommendation generated",
      confidence: finalState.recommendation?.confidence || 0.85,
      actions: [
        { type: "approve", label: "Approve" },
        { type: "deny", label: "Deny" },
        { type: "request", label: "Request Info" },
        { type: "review", label: "Review" },
      ],
      references: finalState.recommendation?.sopRefs?.map(ref => ({
        id: ref,
        type: "sop",
        label: `SOP ${ref}`,
      })),
    });
  };

  provider.sendChatMessage = async (message, context, onToken) => {
    if (!chatAgent) return { text: "Chat agent not available" };
    
    const response = await chatAgent.sendMessage(message, {
      item: context.item,
      reasoningSteps: context.reasoningSteps,
    }, onToken);

    return {
      text: response.text || response,
      references: response.sopRefs?.map(ref => ({
        id: ref,
        type: "sop",
        label: `SOP ${ref}`,
      })),
    };
  };

  provider.getReferences = async (item) => {
    if (!sopProvider) return [];
    return sopProvider.lookupApplicableSOPs(item) || [];
  };

  provider.getReferenceById = async (referenceId, referenceType) => {
    if (referenceType !== "sop" || !sopProvider) return null;
    return sopProvider.lookupSOPByScenario(referenceId) || sopProvider.lookupSOPByStatus(referenceId);
  };

  provider.getAvailableActions = (item, recommendation) => {
    return [
      { type: "approve", label: "Approve" },
      { type: "deny", label: "Deny" },
      { type: "request", label: "Request Info" },
      { type: "review", label: "Review" },
    ];
  };

  provider.executeAction = async (actionType, item, recommendation) => {
    // Action execution logic (e.g., API call)
    console.log(`Executing action: ${actionType} for ${item.id}`);
    // Return success/failure
    return { success: true, action: actionType };
  };

  return provider;
}

