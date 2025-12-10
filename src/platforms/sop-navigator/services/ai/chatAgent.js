/**
 * SOP Executor Platform - Chat Agent
 * 
 * Provides AI chat functionality with context awareness.
 * Platform-agnostic implementation that accepts SOP data via provider
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// ==================== Configuration ====================
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";
const TEMPERATURE = 0.7; // Higher temperature for more conversational responses

// Initialize OpenAI model
const createChatModel = (temperature = TEMPERATURE) => {
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

/**
 * Create chat agent with SOP data provider
 * @param {Object} sopProvider - SOPDataProvider instance
 * @param {string} solutionName - Name of the solution (e.g., "Cogniclaim")
 * @param {string} solutionDomain - Domain description (e.g., "healthcare claims")
 */
export const createPlatformChatAgent = (sopProvider, solutionName = "Solution", solutionDomain = "items") => {
  const getSOPByScenario = (scenario) => sopProvider.lookupSOPByScenario(scenario);

  /**
   * Send a chat message to the AI assistant
   * @param {string} message - User's message
   * @param {Object} context - { item, itemId, reasoningSteps, conversationHistory }
   * @param {Function} onToken - Callback for streaming tokens
   * @returns {Promise<Object>} Chat response with text, sopRefs, suggestions
   */
  const sendChatMessage = async (message, context = {}, onToken = null) => {
    const model = createChatModel();
    
    try {
      if (!message || !message.trim()) {
        throw new Error("Message is required");
      }

      const item = context.item || null;
      const itemId = context.itemId || null;
      const reasoningSteps = context.reasoningSteps || [];
      const conversationHistory = context.conversationHistory || [];

      let systemPrompt = `You are an expert assistant for ${solutionName}, an AI-powered ${solutionDomain} intelligence platform. Your role is to help users understand ${solutionDomain}, SOPs (Standard Operating Procedures), and provide actionable insights.

Key capabilities:
- Explain ${solutionDomain} details and status
- Reference relevant SOPs and procedures
- Interpret AI reasoning steps and recommendations
- Answer questions about processing
- Provide guidance on next steps

Always be helpful, accurate, and reference SOPs when relevant.`;

      if (item) {
        const scenario = item.scenario || null;
        const scenarioSOP = scenario ? getSOPByScenario(scenario) : null;
        
        systemPrompt += `\n\nCurrent Item Context:
- Item ID: ${item.id || itemId || "N/A"}
- Status: ${item.status || "N/A"}
- Amount: $${item.amount || 0}
${scenario ? `- Scenario: ${scenario}` : ""}
${scenarioSOP ? `- Relevant SOP: ${scenarioSOP.title} (${scenarioSOP.page})` : ""}`;
      }

      if (reasoningSteps && reasoningSteps.length > 0) {
        systemPrompt += `\n\nAI Reasoning Summary:`;
        reasoningSteps.forEach((step, idx) => {
          if (step.role === "ai-step") {
            systemPrompt += `\n${idx + 1}. ${step.text} (${step.agent || "AI"})`;
            if (step.details) {
              systemPrompt += `\n   Details: ${step.details.substring(0, 200)}...`;
            }
          } else if (step.role === "ai-reco") {
            systemPrompt += `\n\nRecommendation: ${step.text}`;
            if (step.reasoning) {
              systemPrompt += `\nReasoning: ${step.reasoning.substring(0, 300)}...`;
            }
          }
        });
      }

      const messages = [new SystemMessage(systemPrompt)];
      
      conversationHistory.forEach((msg) => {
        if (msg.role === "user") {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
          messages.push(new AIMessage(msg.content));
        }
      });

      messages.push(new HumanMessage(message));

      if (!model) {
        const mockResponse = `I understand you're asking about "${message}". In demo mode, I can provide general guidance about ${solutionDomain} processing. For specific analysis, please ensure your OpenAI API key is configured.`;
        
        const sopMatches = message.match(/(?:SOP\s*)?(\d+(?:\.\d+){0,2})/gi) || [];
        const sopRefs = sopMatches.map(m => {
          const match = m.match(/(\d+(?:\.\d+){0,2})/);
          return match ? match[1] : null;
        }).filter(Boolean);

        if (onToken) {
          for (let i = 0; i < mockResponse.length; i++) {
            onToken(mockResponse[i]);
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        return {
          text: mockResponse,
          sopRefs: sopRefs.length > 0 ? sopRefs : [],
          suggestions: [
            `What SOPs apply to this ${solutionDomain.slice(0, -1)}?`,
            "Explain the recommendation",
            "What are the next steps?",
          ],
        };
      }

      let fullResponse = "";
      const stream = await model.stream(messages);

      for await (const chunk of stream) {
        const content = chunk.content;
        if (content) {
          fullResponse += content;
          if (onToken) {
            onToken(content);
          }
        }
      }

      const sopMatches = fullResponse.match(/(?:SOP\s*)?(\d+(?:\.\d+){0,2})/gi) || [];
      const sopRefs = sopMatches.map(m => {
        const match = m.match(/(\d+(?:\.\d+){0,2})/);
        return match ? match[1] : null;
      }).filter(Boolean);

      const suggestions = [
        `What SOPs apply to this ${solutionDomain.slice(0, -1)}?`,
        "Explain the recommendation in more detail",
        "What are the next steps?",
      ];

      return {
        text: fullResponse,
        sopRefs: sopRefs.length > 0 ? sopRefs : [],
        suggestions,
      };
    } catch (error) {
      console.error("Chat agent error:", error);
      
      const errorMessage = `I apologize, but I encountered an error: ${error.message}. Please try again or check your API configuration.`;
      
      if (onToken) {
        for (let i = 0; i < errorMessage.length; i++) {
          onToken(errorMessage[i]);
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      return {
        text: errorMessage,
        sopRefs: [],
        suggestions: ["Try asking again", "Check API configuration"],
      };
    }
  };

  return {
    sendChatMessage,
  };
};

export default createPlatformChatAgent;

