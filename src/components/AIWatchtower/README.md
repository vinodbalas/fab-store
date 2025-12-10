# AI Watchtower - Platform-Agnostic Uber Component

A reusable AI reasoning and chat interface that works across **all platforms and solutions**, providing a consistent AI experience regardless of the underlying platform.

## Architecture

```
AI Watchtower (Uber Component)
├── Core Interface (AIWatchtowerProvider)
├── UI Components (UnifiedAIConsole, ReasoningCard, ChatInterface)
├── Platform Adapters
│   ├── SOP Executor Adapter
│   └── Field Service Platform Adapter
└── Reference Panels (SOP, Assets, Inventory)
```

## Key Features

- **Platform-Agnostic**: Works with any platform via provider interface
- **Multi-Agent Reasoning**: Displays reasoning steps from multiple AI agents
- **Chat Interface**: Ask questions about items in natural language
- **Reference Integration**: Shows SOPs, Assets, Inventory, etc. based on platform
- **Action Buttons**: Platform-specific actions (Approve, Schedule, etc.)
- **Streaming Responses**: Real-time AI responses with token streaming

## Usage

### For SOP Executor Solutions

```javascript
import { 
  AIWatchtowerHub, 
  createSOPExecutorWatchtowerProvider 
} from '../../../components/AIWatchtower';
import { sopProvider } from '../services/ai/platformAdapter';
import { claimsAPI } from '../services/api';

// Create provider
const watchtowerProvider = createSOPExecutorWatchtowerProvider(
  sopProvider,
  claimsAPI,
  {
    itemLabel: "claim",
    itemLabelPlural: "claims",
    solutionName: "Cogniclaim",
  }
);

// Use in component
<AIWatchtowerHub
  provider={watchtowerProvider}
  itemId={claimId}
  item={claim}
  contextBar={ClaimContextBar}
  referencePanelType="sop"
/>
```

### For Field Service Platform Solutions

```javascript
import { 
  AIWatchtowerHub, 
  createFieldServiceWatchtowerProvider 
} from '../../../components/AIWatchtower';
import { dataProvider } from '../services/platformAdapter';
import { dispatchAPI } from '../services/api';

// Create provider
const watchtowerProvider = createFieldServiceWatchtowerProvider(
  dataProvider,
  dispatchAPI,
  {
    itemLabel: "work order",
    solutionName: "TP Dispatch",
  }
);

// Use in component
<AIWatchtowerHub
  provider={watchtowerProvider}
  itemId={workOrderId}
  item={workOrder}
  contextBar={WorkOrderContextBar}
  referencePanelType="asset"
/>
```

## Provider Interface

Solutions implement the `AIWatchtowerProvider` interface:

```javascript
class MyProvider extends AIWatchtowerProvider {
  async getItem(itemId) { /* ... */ }
  async executeReasoning(item, onStep) { /* ... */ }
  async sendChatMessage(message, context, onToken) { /* ... */ }
  async getReferences(item) { /* ... */ }
  getAvailableActions(item, recommendation) { /* ... */ }
  async executeAction(actionType, item, recommendation) { /* ... */ }
}
```

## Components

- **AIWatchtowerHub**: Complete interface with console + reference panel
- **UnifiedAIConsole**: Core reasoning and chat interface
- **ReasoningCard**: Displays individual reasoning steps
- **ReasoningSummaryCard**: Shows final recommendation with actions
- **ChatInterface**: Natural language chat
- **ReferencePanel**: Displays SOPs, Assets, Inventory, etc.

## Benefits

1. **Consistency**: Same AI experience across all solutions
2. **Reusability**: Write once, use everywhere
3. **Maintainability**: Single codebase for AI UI
4. **Extensibility**: Easy to add new platforms
5. **User Experience**: Familiar interface regardless of solution

## Future Platforms

To add AI Watchtower to a new platform:

1. Create a platform adapter (like `SOPExecutorAdapter.js`)
2. Implement the `AIWatchtowerProvider` interface
3. Connect platform-specific AI agents
4. Use `AIWatchtowerHub` in your solution

That's it! The AI Watchtower will automatically work with your platform.

