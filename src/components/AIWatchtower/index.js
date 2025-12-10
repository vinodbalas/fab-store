/**
 * AI Watchtower - Platform-Agnostic Uber Component
 * 
 * Reusable AI reasoning and chat interface for all platforms and solutions
 */

export { AIWatchtowerProvider } from './core/AIWatchtowerProvider';
export { default as UnifiedAIConsole } from './UnifiedAIConsole';
export { default as AIWatchtowerHub } from './AIWatchtowerHub';
export { default as ReasoningCard } from './ReasoningCard';
export { default as ReasoningSummaryCard } from './ReasoningSummaryCard';
export { default as ChatInterface } from './ChatInterface';
export { default as ReferencePanel } from './ReferencePanel';

// Platform Adapters
export { createSOPExecutorWatchtowerProvider } from './adapters/SOPExecutorAdapter';
export { createFieldServiceWatchtowerProvider } from './adapters/FieldServiceAdapter';

