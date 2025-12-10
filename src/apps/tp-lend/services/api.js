/**
 * API Service Layer for TP Lend
 * 
 * This service provides a clean interface for all API calls.
 * Supports demo mode (frontend-only) and backend mode (API calls with SSE streaming).
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Helper to get demo mode state
const getDemoMode = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlDemo = urlParams.get('demo');
    if (urlDemo !== null) {
      return urlDemo === 'true' || urlDemo === '1';
    }
    const stored = localStorage.getItem('cogniclaim.demoMode');
    if (stored !== null) {
      return stored === 'true';
    }
  }
  return true;
};

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Loans API
 */
export const loansAPI = {
  /**
   * Fetch all loans with optional filters
   * @param {Object} filters - { status, loanType, propertyState, search, page, pageSize }
   * @returns {Promise<{ loans: Array, total: number }>}
   */
  async getAll(filters = {}) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        await delay(400);
        const { ALL_LOANS } = await import('../data/loans');
        let filtered = [...ALL_LOANS];
        
        if (filters.status && filters.status !== 'All') {
          filtered = filtered.filter(l => l.status === filters.status);
        }
        
        if (filters.loanType && filters.loanType !== 'All') {
          filtered = filtered.filter(l => l.loanType === filters.loanType);
        }
        
        if (filters.propertyState && filters.propertyState !== 'All') {
          filtered = filtered.filter(l => l.propertyState === filters.propertyState);
        }
        
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(l =>
            l.id.toLowerCase().includes(q) ||
            l.loanNumber.toLowerCase().includes(q) ||
            l.borrower.toLowerCase().includes(q) ||
            l.propertyState.toLowerCase().includes(q) ||
            l.status.toLowerCase().includes(q)
          );
        }
        
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          loans: filtered.slice(start, end),
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        };
      } else {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.loanType) params.append('loanType', filters.loanType);
        if (filters.propertyState) params.append('propertyState', filters.propertyState);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.pageSize) params.append('pageSize', filters.pageSize);
        
        const response = await fetch(`${API_BASE_URL}/loans?${params}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.error('Loans API error:', error);
      throw error;
    }
  },

  /**
   * Fetch a single loan by ID
   * @param {string} loanId
   * @returns {Promise<Object>}
   */
  async getById(loanId) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        await delay(300);
        const { ALL_LOANS } = await import('../data/loans');
        const loan = ALL_LOANS.find(l => l.id === loanId || l.loanNumber === loanId);
        if (!loan) {
          throw new Error(`Loan not found: ${loanId}`);
        }
        return loan;
      } else {
        const response = await fetch(`${API_BASE_URL}/loans/${loanId}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.data || data;
      }
    } catch (error) {
      console.error('Get loan error:', error);
      throw error;
    }
  },
};

/**
 * AI API for TP Lend
 */
export const aiAPI = {
  /**
   * Analyze a loan application with AI reasoning
   * @param {Object} loanData
   * @param {Function} onStep - Callback for streaming steps
   * @returns {Promise<Object>}
   */
  async analyzeLoan(loanData, onStep = null) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Use platform adapter for demo mode
        const { executeReasoning } = await import('./ai/platformAdapter');
        return await executeReasoning(loanData, onStep);
      } else {
        // Backend mode: use SSE streaming
        const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: loanData, itemType: 'loan' }),
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'step' && onStep) {
                  onStep(data.step);
                }
                if (data.type === 'complete') {
                  return data.result;
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
        
        return {};
      }
    } catch (error) {
      console.error('AI analyze error:', error);
      throw error;
    }
  },

  /**
   * Send a chat message about a loan
   * @param {string} message
   * @param {Object} context - { loan, loanId, reasoningSteps }
   * @param {Function} onToken - Callback for streaming tokens
   * @returns {Promise<Object>}
   */
  async sendMessage(message, context = {}, onToken = null) {
    const isDemoMode = getDemoMode();
    
    try {
      if (isDemoMode) {
        // Use platform adapter for demo mode
        const { sendChatMessage } = await import('./ai/platformAdapter');
        return await sendChatMessage(message, context, onToken);
      } else {
        // Backend mode: use SSE streaming
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            context: {
              ...context,
              item: context.loan,
              itemId: context.loanId,
            },
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'token' && onToken) {
                  fullResponse += data.token;
                  onToken(data.token);
                }
                if (data.type === 'complete') {
                  return { text: fullResponse, sopRefs: data.sopRefs || [] };
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
        
        return { text: fullResponse, sopRefs: [] };
      }
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },
};

export default {
  loansAPI,
  aiAPI,
};

