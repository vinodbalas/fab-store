/**
 * Field Service Platform Adapter for AI Watchtower
 * 
 * Bridges Field Service Platform's AI agents to the generic AI Watchtower interface
 */

import { AIWatchtowerProvider } from '../core/AIWatchtowerProvider';
import { createFieldServiceAgents } from '../../../platforms/field-service';

export function createFieldServiceWatchtowerProvider(dataProvider, workOrderAPI, solutionConfig) {
  const platformAgents = createFieldServiceAgents(dataProvider);

  const provider = new AIWatchtowerProvider({
    itemLabel: "work order",
    itemLabelPlural: "work orders",
    referenceType: "asset", // Can be asset, inventory, or contract
    platformName: "Field Service Platform",
    solutionName: solutionConfig.solutionName || "Field Service Solution",
    agentNames: {
      analyzer: "Work Order Analyzer",
      matcher: "Resource Matcher",
      risk: "SLA Risk Assessor",
      recommendation: "Scheduling Optimizer",
    },
    ...solutionConfig,
  });

  // Override methods
  provider.getItem = async (itemId) => {
    if (!workOrderAPI) return null;
    return workOrderAPI.getById(itemId);
  };

  provider.executeReasoning = async (workOrder, onStep) => {
    if (!platformAgents) return;

    // Step 1: Work Order Analysis
    const analysisSteps = await platformAgents.analyzeWorkOrder(workOrder, (step) => {
      onStep?.({
        role: "ai-step",
        agent: step.agent,
        text: step.result || step.step,
        confidence: step.confidence,
      });
    });

    // Step 2: Scheduling Optimization
    const technicians = dataProvider.getTechnicians();
    const scheduleResult = await platformAgents.optimizeSchedule(
      [workOrder],
      technicians,
      {}
    );

    if (scheduleResult.optimizedRoutes?.length > 0) {
      const route = scheduleResult.optimizedRoutes[0];
      const tech = dataProvider.lookupTechnician(route.technicianId);
      onStep?.({
        role: "ai-step",
        agent: "Route Optimizer",
        text: `Optimized route: ${route.distance}km, ${route.duration}min. Recommended technician: ${tech?.name || route.technicianId}. Skill match: ${route.skillMatch || "High"}. SLA risk: ${route.slaRisk || "Low"}.`,
        confidence: 0.92,
        references: workOrder.assetId ? [{ id: workOrder.assetId, type: "asset", label: "Related Asset" }] : [],
      });
    }

    // Step 3: Recommendation
    const priorityRec = await platformAgents.recommendPriority(workOrder);
    const recommendedAction = workOrder.status === "Pending" 
      ? "Schedule Now" 
      : workOrder.status === "Scheduled"
      ? "Assign Technician"
      : "Review";

    onStep?.({
      role: "ai-reco",
      text: `Recommended priority: ${priorityRec.recommendedPriority}. ${priorityRec.reasoning}. Based on SLA (${workOrder.slaHours}h remaining), customer tier (${workOrder.customer?.tier || "Standard"}), and service type (${workOrder.serviceType}), we recommend ${recommendedAction}.`,
      confidence: priorityRec.confidence,
      actions: [
        { type: "schedule", label: "Schedule Now" },
        { type: "assign", label: "Assign Technician" },
        { type: "escalate", label: "Escalate" },
        { type: "defer", label: "Defer" },
      ],
      references: workOrder.assetId ? [{ id: workOrder.assetId, type: "asset", label: "Asset" }] : [],
    });
  };

  provider.sendChatMessage = async (message, context, onToken) => {
    // Simple chat response (can be enhanced with real chat agent)
    const response = `Based on work order ${context.item?.id}, I can help you with scheduling, routing, or resource allocation.`;
    
    if (onToken) {
      for (const char of response) {
        await new Promise(resolve => setTimeout(resolve, 20));
        onToken(char);
      }
    }

    return { text: response };
  };

  provider.getReferences = async (workOrder) => {
    const references = [];
    
    // Get related assets
    if (workOrder.assetId) {
      const asset = dataProvider.lookupAsset(workOrder.assetId);
      if (asset) references.push({ id: asset.id, type: "asset", label: asset.name });
    }

    // Get required inventory
    if (workOrder.requiredParts) {
      workOrder.requiredParts.forEach(partId => {
        const part = dataProvider.lookupInventoryItem(partId);
        if (part) references.push({ id: part.id, type: "inventory", label: part.name });
      });
    }

    return references;
  };

  provider.getReferenceById = async (referenceId, referenceType) => {
    if (referenceType === "asset") {
      return dataProvider.lookupAsset(referenceId);
    } else if (referenceType === "inventory") {
      return dataProvider.lookupInventoryItem(referenceId);
    }
    return null;
  };

  provider.getAvailableActions = (workOrder, recommendation) => {
    return [
      { type: "schedule", label: "Schedule Now" },
      { type: "assign", label: "Assign Technician" },
      { type: "escalate", label: "Escalate" },
      { type: "defer", label: "Defer" },
    ];
  };

  provider.executeAction = async (actionType, workOrder, recommendation) => {
    console.log(`Executing action: ${actionType} for work order ${workOrder.id}`);
    return { success: true, action: actionType };
  };

  return provider;
}

