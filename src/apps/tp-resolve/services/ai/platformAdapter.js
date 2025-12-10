/**
 * TP Resolve Platform Adapter
 *
 * Connects TP Resolve (solution) to SOP Executor (platform)
 * Provides TP Resolve-specific SOP data to the platform
 */

// Note: this file lives at src/apps/tp-resolve/services/ai/
// To reach src/platforms/sop-navigator, we need to go up four levels.
import { SOPDataProvider, createPlatformAgents, createPlatformChatAgent } from '../../../../platforms/sop-navigator';
import * as sopsData from '../../data/sops';

// Create SOP data provider with TP Resolve's SOP data
const sopProvider = new SOPDataProvider({
  SOP_INDEX: sopsData.SOP_INDEX,
  SCENARIO_SOPS: sopsData.SCENARIO_SOPS,
  getSOPByScenario: sopsData.getSOPByScenario,
  getSOPByStatus: sopsData.getSOPByStatus,
  getApplicableSOPsForClaim: sopsData.getApplicableSOPsForCase,
  getSOPByCode: sopsData.getSOPByCode,
  getSOPsByState: sopsData.getSOPsByJurisdiction,
  getSOPByDenialCode: sopsData.getSOPByDenialCode,
});

// Create platform agents with TP Resolve's SOP data
const platformAgents = createPlatformAgents(sopProvider, null);

// Create platform chat agent with TP Resolve's configuration
const platformChatAgent = createPlatformChatAgent(sopProvider, "TP Resolve", "appeals and grievances");

// Export adapted functions that match TP Resolve's expected API
export const executeReasoning = async (caseData, onStep = null) => {
  // Adapt case to item for platform
  const result = await platformAgents.executeReasoning(caseData, onStep);
  // Adapt result back to TP Resolve's expected format
  return {
    ...result,
    case: result.item, // Keep case for backward compatibility
  };
};

export const sendChatMessage = async (message, context = {}, onToken = null) => {
  // Adapt context: case -> item
  const adaptedContext = {
    ...context,
    item: context.case,
    itemId: context.caseId,
  };
  return platformChatAgent.sendChatMessage(message, adaptedContext, onToken);
};

// Export agent creators for backward compatibility
export const createAnalysisAgent = () => platformAgents.createAnalysisAgent();
export const createSOPMatchingAgent = () => platformAgents.createSOPMatchingAgent();
export const createRiskAssessmentAgent = () => platformAgents.createRiskAssessmentAgent();
export const createRecommendationAgent = () => platformAgents.createRecommendationAgent();
export const createReasoningWorkflow = () => platformAgents.createReasoningWorkflow();

export default {
  executeReasoning,
  sendChatMessage,
  createAnalysisAgent,
  createSOPMatchingAgent,
  createRiskAssessmentAgent,
  createRecommendationAgent,
  createReasoningWorkflow,
};

