/**
 * Field Service Platform
 * 
 * Reusable platform for building field service management solutions
 * Provides routing optimization, scheduling, and technician management
 */

export { FieldServiceDataProvider } from './core/fieldServiceDataProvider';
export { default as createFieldServiceAgents } from './services/ai/agents';
export { createRoutingAgent } from './services/ai/routingAgent';

// Platform Components
export { default as WorkOrderCard } from './components/WorkOrderCard';
export { default as ScheduleView } from './components/ScheduleView';
export { default as AssetCard } from './components/AssetCard';
export { default as InventoryCard } from './components/InventoryCard';

