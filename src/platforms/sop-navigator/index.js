/**
 * SOP Executor Platform
 * 
 * Reusable platform for building SOP-native solutions across industries
 * Provides AI reasoning, SOP matching, and compliance guardrails
 */

export { SOPDataProvider } from './core/sopDataProvider';
export { default as createPlatformAgents } from './services/ai/agents';
export { default as createPlatformChatAgent } from './services/ai/chatAgent';

// Platform Components
export { default as SOPViewer } from './components/SOPViewer';
export { default as ReasoningCard } from './components/ReasoningCard';

