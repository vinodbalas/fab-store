/**
 * AI API Routes
 * Handles all AI-related endpoints (reasoning, chat, RAG)
 */

import express from 'express';
import { executeReasoning } from '../services/ai/agents.js';
import { getClaimById } from '../services/data/claimsLoader.js';
import { generateChatResponse } from '../services/ai/chatAgent.js';
import { searchSOPs } from '../services/rag/ragService.js';

const router = express.Router();

/**
 * POST /api/v1/ai/analyze
 * Analyze a claim using AI reasoning engine
 * 
 * Request body: { claimId: string } or { claim: object }
 * Response: Streaming Server-Sent Events (SSE) with reasoning steps
 * 
 * Example request:
 *   POST /api/v1/ai/analyze
 *   Body: { "claimId": "CLM-002" }
 *   OR
 *   Body: { "claim": { id: "CLM-002", member: "...", ... } }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { claimId, claim: claimData } = req.body;
    
    // Validate input
    if (!claimId && !claimData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: 'Either claimId or claim object is required',
      });
    }
    
    // Get claim data
    let claim;
    if (claimId) {
      claim = await getClaimById(claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found',
          message: `Claim with ID ${claimId} not found`,
        });
      }
    } else {
      claim = claimData;
    }
    
    // Set up Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Connected to AI reasoning stream',
      timestamp: new Date().toISOString(),
    })}\n\n`);
    
    // Track final result
    let finalResult = null;
    let hasError = false;
    
    // Execute reasoning with streaming callback
    try {
      finalResult = await executeReasoning(claim, (step) => {
        try {
          // Send each reasoning step as SSE event
          res.write(`data: ${JSON.stringify({
            type: 'step',
            step: step,
            timestamp: new Date().toISOString(),
          })}\n\n`);
        } catch (writeError) {
          console.error('Error writing SSE data:', writeError);
          // Client may have disconnected, but continue processing
        }
      });
      
      // Send completion message
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        result: {
          reasoningSteps: finalResult.reasoningSteps,
          sopMatches: finalResult.sopMatches,
          riskFactors: finalResult.riskFactors,
          recommendation: finalResult.recommendation,
          confidence: finalResult.confidence,
        },
        timestamp: new Date().toISOString(),
      })}\n\n`);
      
    } catch (error) {
      console.error('Error during reasoning:', error);
      hasError = true;
      
      // Send error message
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      })}\n\n`);
    }
    
    // Close the stream
    res.write(`data: ${JSON.stringify({
      type: 'end',
      timestamp: new Date().toISOString(),
    })}\n\n`);
    
    res.end();
    
  } catch (error) {
    console.error('Error in AI analyze:', error);
    
    // If headers not sent yet, send JSON error
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to analyze claim',
        message: error.message,
      });
    } else {
      // Otherwise, send SSE error and close
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/v1/ai/chat
 * Send a message to the AI chat agent
 * 
 * Request body: { message: string, claimId?: string, context?: object }
 * Response: Streaming Server-Sent Events (SSE) with chat response
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, claimId, conversationHistory = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: 'message is required and must be a string',
      });
    }
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Connected to chat stream',
      timestamp: new Date().toISOString(),
    })}\n\n`);
    
    try {
      const result = await generateChatResponse({
        message,
        claimId,
        conversationHistory,
        onToken: (token) => {
          try {
            res.write(`data: ${JSON.stringify({
              type: 'token',
              token: token,
              timestamp: new Date().toISOString(),
            })}\n\n`);
          } catch (writeError) {
            console.error('Error writing chat token:', writeError);
          }
        },
      });
      
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        result: {
          response: result.response,
          sopReferences: result.sopReferences,
          claimContext: result.claimContext,
        },
        timestamp: new Date().toISOString(),
      })}\n\n`);
      
    } catch (error) {
      console.error('Error during chat:', error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      })}\n\n`);
    }
    
    res.write(`data: ${JSON.stringify({
      type: 'end',
      timestamp: new Date().toISOString(),
    })}\n\n`);
    
    res.end();
    
  } catch (error) {
    console.error('Error in AI chat:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message',
        message: error.message,
      });
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/v1/ai/rag/search
 * Search SOPs using RAG (Retrieval-Augmented Generation)
 * 
 * Request body: { query: string, limit?: number, filters?: object }
 * Response: Array of relevant SOPs with relevance scores
 */
router.post('/rag/search', async (req, res) => {
  try {
    const { query, limit = 10, filters = {} } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: 'query is required and must be a string',
      });
    }
    
    const results = await searchSOPs(query, {
      topK: limit,
      filters,
    });
    
    res.json({
      success: true,
      results: results,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error('Error in RAG search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search SOPs',
      message: error.message,
    });
  }
});

export default router;

