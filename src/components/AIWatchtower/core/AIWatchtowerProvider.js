/**
 * AI Watchtower Provider Interface
 * 
 * Platform-agnostic interface for AI Watchtower
 * Solutions implement this interface to provide their specific data and agents
 */

export class AIWatchtowerProvider {
  constructor(config) {
    this.config = config;
  }

  // ==================== Data Access ====================
  
  /**
   * Get the item being analyzed (claim, work order, loan, etc.)
   */
  async getItem(itemId) {
    throw new Error("getItem must be implemented by solution");
  }

  /**
   * Get related items (e.g., line items, related work orders)
   */
  async getRelatedItems(itemId) {
    return [];
  }

  // ==================== AI Agents ====================
  
  /**
   * Execute multi-agent reasoning on an item
   * Returns streaming steps via onStep callback
   */
  async executeReasoning(item, onStep) {
    throw new Error("executeReasoning must be implemented by solution");
  }

  /**
   * Send a chat message and get AI response
   */
  async sendChatMessage(message, context, onToken) {
    throw new Error("sendChatMessage must be implemented by solution");
  }

  // ==================== Reference Data ====================
  
  /**
   * Get reference items (SOPs, Assets, Inventory, etc.)
   * Returns array of reference objects
   */
  async getReferences(item) {
    return [];
  }

  /**
   * Get a specific reference by ID
   */
  async getReferenceById(referenceId, referenceType) {
    return null;
  }

  /**
   * Search references
   */
  async searchReferences(query, item) {
    return [];
  }

  // ==================== Actions ====================
  
  /**
   * Get available actions for the item
   */
  getAvailableActions(item, recommendation) {
    return [];
  }

  /**
   * Execute an action
   */
  async executeAction(actionType, item, recommendation) {
    throw new Error("executeAction must be implemented by solution");
  }

  // ==================== Configuration ====================
  
  /**
   * Get solution-specific configuration
   */
  getConfig() {
    return {
      itemLabel: this.config.itemLabel || "item", // "claim", "work order", "loan"
      itemLabelPlural: this.config.itemLabelPlural || "items",
      referenceType: this.config.referenceType || "sop", // "sop", "asset", "inventory"
      reasoningAgents: this.config.reasoningAgents || [], // Agent names
      ...this.config,
    };
  }

  /**
   * Get agent names for display
   */
  getAgentNames() {
    return this.config.agentNames || {
      analyzer: "Analysis",
      matcher: "Resource Matcher",
      risk: "Risk Assessor",
      recommendation: "Recommendation Engine",
    };
  }
}

