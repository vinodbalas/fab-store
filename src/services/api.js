/**
 * API Service Layer
 * 
 * This service provides a clean interface for all API calls.
 * Supports demo mode (frontend-only) and backend mode (API calls with SSE streaming).
 * Frontend agents are imported dynamically only in demo mode.
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Helper to get demo mode state
const getDemoMode = () => {
  if (typeof window !== 'undefined') {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlDemo = urlParams.get('demo');
    if (urlDemo !== null) {
      return urlDemo === 'true' || urlDemo === '1';
    }
    // Check localStorage
    const stored = localStorage.getItem('cogniclaim.demoMode');
    if (stored !== null) {
      return stored === 'true';
    }
  }
  // Default to demo mode
  return true;
};

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic API request handler with error handling
 * Supports both demo mode (mock) and backend mode (real API calls)
 */
async function apiRequest(endpoint, options = {}) {
  const isDemoMode = getDemoMode();
  
  try {
    if (isDemoMode) {
      // Demo mode: simulate network delay and throw error to use mock functions
      await delay(300);
      throw new Error('DEMO_MODE: Use mock functions below');
    } else {
      // Backend mode: make real API call
      await delay(300); // Still simulate delay for now
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    }
  } catch (error) {
    // In demo mode, this error is expected - mock functions will handle it
    if (isDemoMode && error.message.includes('DEMO_MODE')) {
      throw error; // Re-throw to be caught by mock functions
    }
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Claims API
 */
export const claimsAPI = {
  /**
   * Fetch all claims with optional filters
   * @param {Object} filters - { status, search, page, pageSize }
   * @returns {Promise<{ claims: Array, total: number }>}
   */
  async getAll(filters = {}) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: use mock data
        await delay(400);
        const { CLAIMS } = await import('../data/claims');
        let filtered = [...CLAIMS];
        
        if (filters.status && filters.status !== 'All') {
          filtered = filtered.filter(c => c.status === filters.status);
        }
        
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(c =>
            c.id.toLowerCase().includes(q) ||
            c.member.toLowerCase().includes(q) ||
            c.provider.toLowerCase().includes(q) ||
            c.status.toLowerCase().includes(q)
          );
        }
        
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          claims: filtered.slice(start, end),
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        };
      } else {
        // Backend mode: call API
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.pageSize) params.append('pageSize', filters.pageSize);
        
        const response = await fetch(`${API_BASE_URL}/claims?${params}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.error('Claims API error:', error);
      throw new Error(error.message || 'Failed to fetch claims');
    }
  },

  /**
   * Fetch a single claim by ID
   * @param {string} claimId
   * @returns {Promise<Object>}
   */
  async getById(claimId) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: use mock data
        await delay(300);
        const { CLAIMS } = await import('../data/claims');
        const claim = CLAIMS.find(c => c.id === claimId);
        if (!claim) {
          throw new Error(`Claim ${claimId} not found`);
        }
        return claim;
      } else {
        // Backend mode: call API
        const response = await fetch(`${API_BASE_URL}/claims/${claimId}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.error('Claims API error:', error);
      throw new Error(error.message || 'Failed to fetch claim');
    }
  },

  /**
   * Update claim status
   * @param {string} claimId
   * @param {string} status
   * @returns {Promise<Object>}
   */
  async updateStatus(claimId, status) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: mock update (local only)
        await delay(500);
        const claim = await this.getById(claimId);
        return { ...claim, status };
      } else {
        // Backend mode: real API call
        const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.error('Update status error:', error);
      throw new Error(error.message || 'Failed to update claim status');
    }
  },
};

/**
 * Feedback API - Captures user actions vs AI recommendations for learning
 */
export const feedbackAPI = {
  /**
   * Record user feedback (action taken vs AI recommendation)
   * @param {Object} feedback - { claimId, aiRecommendation, userAction, claimAmount, aiConfidence }
   * @returns {Promise<Object>}
   */
  async recordFeedback(feedback) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: mock feedback (store in localStorage for demo)
        await delay(200);
        const stored = JSON.parse(localStorage.getItem('cogniclaim.feedback') || '[]');
        stored.push({
          ...feedback,
          id: `feedback-${Date.now()}`,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('cogniclaim.feedback', JSON.stringify(stored));
        return { success: true, feedback: stored[stored.length - 1] };
      } else {
        // Backend mode: real API call
        const response = await fetch(`${API_BASE_URL}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedback),
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.error('Record feedback error:', error);
      // Don't throw - feedback is non-critical
      return { success: false, error: error.message };
    }
  },

  /**
   * Get feedback metrics
   * @returns {Promise<Object>}
   */
  async getMetrics() {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: calculate from localStorage
        await delay(200);
        const stored = JSON.parse(localStorage.getItem('cogniclaim.feedback') || '[]');
        const total = stored.length;
        const correct = stored.filter(f => f.isCorrect).length;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;
        
        return {
          totalActions: total,
          aiCorrect: correct,
          aiIncorrect: total - correct,
          accuracy,
          learningRate: 0,
          improvementOverTime: [],
        };
      } else {
        // Backend mode: real API call
        const response = await fetch(`${API_BASE_URL}/feedback/metrics`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.error('Get feedback metrics error:', error);
      // Return default metrics on error
      return {
        totalActions: 0,
        aiCorrect: 0,
        aiIncorrect: 0,
        accuracy: 0,
        learningRate: 0,
        improvementOverTime: [],
      };
    }
  },
};

/**
 * AI Insights API - Priority queue, anomalies, predictions
 */
export const aiInsightsAPI = {
  /**
   * Get AI-prioritized claims queue
   * @param {Object} options - { limit, status }
   * @returns {Promise<Array>}
   */
  async getPriorityQueue(options = {}) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: mock prioritized claims
        await delay(400);
        const result = await claimsAPI.getAll({ status: options.status || 'All', page: 1, pageSize: options.limit || 10 });
        // Add mock priority scores
        return result.claims.map((claim, idx) => ({
          ...claim,
          aiPriority: 9 - (idx * 0.5),
          aiRiskLevel: idx < 3 ? 'high' : idx < 6 ? 'medium' : 'low',
          aiReasons: [
            idx < 3 ? 'High-value claim' : 'Pending review',
            idx < 5 ? 'Urgent status' : 'Standard processing',
          ],
          aiConfidence: 0.85 + (Math.random() * 0.1),
        })).sort((a, b) => b.aiPriority - a.aiPriority);
      } else {
        // Backend mode: real API call
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.status) params.append('status', options.status);
        
        const response = await fetch(`${API_BASE_URL}/ai-insights/priority-queue?${params}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error('Get priority queue error:', error);
      return [];
    }
  },

  /**
   * Get AI-detected anomalies
   * @returns {Promise<Array>}
   */
  async getAnomalies() {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: mock anomalies
        await delay(500);
        return [
          {
            id: 'anomaly-1',
            type: 'delay',
            title: 'Unusual delay pattern: GlobalMed',
            description: 'AI detected 5 claims with 2x longer processing time. Root cause analysis suggests missing documentation.',
            severity: 'medium',
            confidence: 0.87,
            affectedClaims: ['CLM-002', 'CLM-005', 'CLM-010'],
            affectedCount: 5,
            recommendation: 'Review documentation requirements for GlobalMed',
          },
          {
            id: 'anomaly-2',
            type: 'documentation',
            title: 'Missing documentation pattern: Apex Health',
            description: 'AI identified 8 claims from Apex Health requiring additional documentation. Consider template reminder.',
            severity: 'low',
            confidence: 0.82,
            affectedClaims: ['CLM-003', 'CLM-007'],
            affectedCount: 8,
            recommendation: 'Setup template reminder for Apex Health',
          },
        ];
      } else {
        // Backend mode: real API call
        const response = await fetch(`${API_BASE_URL}/ai-insights/anomalies`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error('Get anomalies error:', error);
      return [];
    }
  },

  /**
   * Get AI-generated insights for reports
   * @returns {Promise<Array>}
   */
  async getInsights() {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: mock insights
        await delay(500);
        return [
          {
            id: 'insight-1',
            type: 'revenue',
            title: 'Revenue Recovery Increased 18%',
            description: 'AI attributes this to faster processing of high-value claims. 12 high-value claims (₹2.3L potential) are currently pending review.',
            impact: 'high',
            confidence: 0.89,
            recommendation: 'Focus on processing high-value pending claims for maximum revenue impact',
            metric: '₹2.3L potential',
          },
          {
            id: 'insight-2',
            type: 'efficiency',
            title: 'Denial Rate Dropped 12%',
            description: 'AI suggests SOP 4.2.1 training helped reduce denials. Current denial rate: 8.5% (12 of 141 claims).',
            impact: 'medium',
            confidence: 0.85,
            recommendation: 'Continue SOP training to maintain low denial rates',
            metric: '8.5% denial rate',
          },
        ];
      } else {
        const response = await fetch(`${API_BASE_URL}/ai-insights/reports/insights`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error('Get insights error:', error);
      return [];
    }
  },

  /**
   * Get AI predictions
   * @returns {Promise<Array>}
   */
  async getPredictions() {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: mock predictions
        await delay(500);
        return [
          {
            id: 'prediction-1',
            type: 'escalation',
            title: '8 Claims Likely to Escalate Next Week',
            description: 'Based on historical patterns and current status, AI predicts with 92% confidence these claims will require escalation. Total value at risk: ₹1.2L.',
            confidence: 0.92,
            timeframe: 'Next week',
            impact: '₹1.2L potential cost',
            recommendation: 'Review and process these claims to prevent escalation',
          },
          {
            id: 'prediction-2',
            type: 'revenue',
            title: 'Revenue Forecast: ₹4.2M Next Month',
            description: 'AI predicts next month\'s revenue based on current trends and pending high-value claims. This represents a +10% increase vs current month.',
            confidence: 0.87,
            timeframe: 'Next month',
            impact: '+10% vs current',
            recommendation: 'Focus on processing pending high-value claims to achieve forecast',
            metric: '₹4.2M forecast',
          },
        ];
      } else {
        const response = await fetch(`${API_BASE_URL}/ai-insights/reports/predictions`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error('Get predictions error:', error);
      return [];
    }
  },
};

/**
 * AI API - Uses backend API with SSE streaming
 */
export const aiAPI = {
  /**
   * Execute AI reasoning on a claim (agentic chain of thought)
   * @param {Object} claim - Claim to analyze (or claimId string)
   * @param {Function} onStep - Callback for streaming reasoning steps
   * @returns {Promise<Object>} Reasoning results
   */
  async analyzeClaim(claim, onStep = null) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Demo mode: use frontend agents
        if (!claim) {
          throw new Error('Claim is required for analysis');
        }
        const { executeReasoning } = await import('./ai/agents.js');
        const result = await executeReasoning(claim, onStep);
        return result;
      } else {
        // Backend mode: use SSE streaming
        const claimId = typeof claim === 'string' ? claim : claim?.id;
        const claimData = typeof claim === 'object' ? claim : null;
        
        if (!claimId && !claimData) {
          throw new Error('Claim ID or claim data is required');
        }
        
        return new Promise((resolve, reject) => {
          const requestBody = claimId ? { claimId } : { claim: claimData };
          
          fetch(`${API_BASE_URL}/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalResult = null;
            
            const processStream = () => {
              reader.read().then(({ done, value }) => {
                if (done) {
                  if (finalResult) {
                    resolve(finalResult);
                  } else {
                    reject(new Error('Stream ended without result'));
                  }
                  return;
                }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.substring(6));
                      
                      if (data.type === 'connection') {
                        // Connection established
                      } else if (data.type === 'step') {
                        // Stream reasoning step
                        if (onStep) {
                          onStep(data.step);
                        }
                      } else if (data.type === 'complete') {
                        // Final result
                        finalResult = data.result;
                      } else if (data.type === 'error') {
                        reject(new Error(data.error));
                        return;
                      } else if (data.type === 'end') {
                        // Stream ended
                      }
                    } catch (parseError) {
                      console.error('Error parsing SSE data:', parseError);
                    }
                  }
                }
                
                processStream();
              }).catch(reject);
            };
            
            processStream();
          })
          .catch(reject);
        });
      }
    } catch (error) {
      console.error('AI reasoning error:', error);
      throw new Error(error.message || 'Failed to analyze claim');
    }
  },

  /**
   * Send a message to the AI chat assistant
   * @param {string} message - User message
   * @param {Object} context - { claim, reasoningSteps, claimId }
   * @param {Function} onToken - Callback for streaming tokens
   * @returns {Promise<Object>} Chat response
   */
  async sendMessage(message, context = {}, onToken = null) {
    const isDemoMode = getDemoMode();
    
    try {
      if (!message || !message.trim()) {
        throw new Error('Message is required');
      }
      
      if (isDemoMode) {
        // Demo mode: use frontend chat agent
        const { sendChatMessage } = await import('./ai/chatAgent.js');
        const response = await sendChatMessage(message, context, onToken);
        return response;
      } else {
        // Backend mode: use SSE streaming
        const conversationHistory = context.conversationHistory || [];
        const claimId = context.claimId || context.claim?.id;
        
        return new Promise((resolve, reject) => {
          fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              claimId,
              conversationHistory,
            }),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';
            let finalResult = null;
            
            const processStream = () => {
              reader.read().then(({ done, value }) => {
                if (done) {
                  if (finalResult) {
                    resolve({
                      text: finalResult.response || fullResponse,
                      sopRefs: finalResult.sopReferences?.map(sop => sop.page || sop.title) || [],
                      suggestions: [],
                    });
                  } else {
                    resolve({
                      text: fullResponse,
                      sopRefs: [],
                      suggestions: [],
                    });
                  }
                  return;
                }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.substring(6));
                      
                      if (data.type === 'connection') {
                        // Connection established
                      } else if (data.type === 'token') {
                        // Stream token
                        fullResponse += data.token;
                        if (onToken) {
                          onToken(data.token);
                        }
                      } else if (data.type === 'complete') {
                        // Final result
                        finalResult = data.result;
                      } else if (data.type === 'error') {
                        reject(new Error(data.error));
                        return;
                      } else if (data.type === 'end') {
                        // Stream ended
                      }
                    } catch (parseError) {
                      console.error('Error parsing SSE data:', parseError);
                    }
                  }
                }
                
                processStream();
              }).catch(reject);
            };
            
            processStream();
          })
          .catch(reject);
        });
      }
    } catch (error) {
      console.error('AI chat error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }
  },
};

/**
 * Auth API
 */
export const authAPI = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async login(email, password) {
    try {
      await delay(600);
      
      // Mock authentication
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      return {
        user: {
          email,
          name: email.split('@')[0],
          avatar: '/vkv.jpeg',
        },
        token: 'mock-jwt-token',
      };
    } catch (error) {
      throw new Error(error.message || 'Authentication failed');
    }
  },

  /**
   * Logout
   * @returns {Promise<void>}
   */
  async logout() {
    await delay(200);
    // In real implementation, this would invalidate the token on the server
  },
};

export default {
  claims: claimsAPI,
  ai: aiAPI,
  auth: authAPI,
};

