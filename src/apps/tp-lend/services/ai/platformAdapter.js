/**
 * TP Lend Platform Adapter
 *
 * Connects TP Lend (solution) to SOP Executor (platform)
 * Provides TP Lend-specific SOP data to the platform
 */

// Note: this file lives at src/apps/tp-lend/services/ai/
// To reach src/platforms/sop-navigator, we need to go up four levels.
import { SOPDataProvider, createPlatformAgents, createPlatformChatAgent } from '../../../../platforms/sop-navigator';
import * as sopsData from '../../data/sops';

// Create SOP data provider with TP Lend's SOP data
const sopProvider = new SOPDataProvider({
  SOP_INDEX: sopsData.SOP_INDEX,
  SCENARIO_SOPS: sopsData.SCENARIO_SOPS,
  getSOPByScenario: sopsData.getSOPByScenario,
  getSOPByStatus: sopsData.getSOPByStatus,
  getApplicableSOPsForClaim: sopsData.getApplicableSOPsForLoan,
  getSOPByCode: sopsData.getSOPByCode,
  getSOPsByState: sopsData.getSOPsByState,
  getSOPByDenialCode: sopsData.getSOPByDenialCode,
});

// Create platform agents with TP Lend's SOP data
const platformAgents = createPlatformAgents(sopProvider, null);

// Create platform chat agent with TP Lend's configuration
const platformChatAgent = createPlatformChatAgent(sopProvider, "TP Lend", "mortgage applications");

// Export adapted functions that match TP Lend's expected API
export const executeReasoning = async (loanData, onStep = null) => {
  // Adapt loan to item for platform
  const result = await platformAgents.executeReasoning(loanData, onStep);
  // Adapt result back to TP Lend's expected format
  return {
    ...result,
    loan: result.item, // Keep loan for backward compatibility
  };
};

export const sendChatMessage = async (message, context = {}, onToken = null) => {
  // Adapt context: loan -> item
  const adaptedContext = {
    ...context,
    item: context.loan,
    itemId: context.loanId,
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

