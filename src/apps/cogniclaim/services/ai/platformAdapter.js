/**
 * Cogniclaim Platform Adapter
 *
 * Connects Cogniclaim (solution) to SOP Executor (platform)
 * Provides Cogniclaim-specific SOP data to the platform
 */

// Note: this file lives at src/apps/cogniclaim/services/ai/
// To reach src/platforms/sop-navigator, we need to go up four levels.
import { SOPDataProvider, createPlatformAgents, createPlatformChatAgent } from '../../../../platforms/sop-navigator';
import * as sopsData from '../../data/sops';

// Create SOP data provider with Cogniclaim's SOP data
const sopProvider = new SOPDataProvider({
  SOP_INDEX: sopsData.SOP_INDEX,
  SCENARIO_SOPS: sopsData.SCENARIO_SOPS,
  getSOPByScenario: sopsData.getSOPByScenario,
  getSOPByStatus: sopsData.getSOPByStatus,
  getApplicableSOPsForClaim: sopsData.getApplicableSOPsForClaim,
  getSOPByCode: sopsData.getSOPByCode,
  getSOPsByState: sopsData.getSOPsByState,
  getSOPByDenialCode: sopsData.getSOPByDenialCode,
});

// Create platform agents with Cogniclaim's SOP data
const platformAgents = createPlatformAgents(sopProvider, null);

// Create platform chat agent with Cogniclaim's configuration
const platformChatAgent = createPlatformChatAgent(sopProvider, "Cogniclaim", "healthcare claims");

// Export adapted functions that match Cogniclaim's expected API
export const executeReasoning = async (claim, onStep = null) => {
  // Adapt claim to item for platform
  const result = await platformAgents.executeReasoning(claim, onStep);
  // Adapt result back to Cogniclaim's expected format
  return {
    ...result,
    claim: result.item, // Keep claim for backward compatibility
  };
};

export const sendChatMessage = async (message, context = {}, onToken = null) => {
  // Adapt context: claim -> item
  const adaptedContext = {
    ...context,
    item: context.claim,
    itemId: context.claimId,
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

