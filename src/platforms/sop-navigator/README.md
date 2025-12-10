# SOP Executor Platform

A reusable platform for building SOP-native solutions across industries. Provides AI reasoning, SOP matching, and compliance guardrails out of the box.

## Architecture

SOP Executor follows a modular architecture:

- **Core**: Platform utilities and data providers
- **Services/AI**: Multi-agent reasoning engine and chat agent
- **Components**: Reusable UI components (to be moved from solutions)

## Usage

### 1. Import the Platform

```javascript
import { SOPDataProvider, createPlatformAgents, createPlatformChatAgent } from '../platforms/sop-navigator';
```

### 2. Provide Your SOP Data

```javascript
import * as yourSOPs from './data/sops';

const sopProvider = new SOPDataProvider({
  SOP_INDEX: yourSOPs.SOP_INDEX,
  SCENARIO_SOPS: yourSOPs.SCENARIO_SOPS,
  getSOPByScenario: yourSOPs.getSOPByScenario,
  getSOPByStatus: yourSOPs.getSOPByStatus,
  getApplicableSOPsForClaim: yourSOPs.getApplicableSOPsForClaim,
  // ... other SOP functions
});
```

### 3. Create Platform Agents

```javascript
const platformAgents = createPlatformAgents(sopProvider, itemAPI);

// Execute reasoning on an item
const result = await platformAgents.executeReasoning(item, onStep);
```

### 4. Create Chat Agent

```javascript
const chatAgent = createPlatformChatAgent(
  sopProvider,
  "Your Solution Name",
  "your domain description"
);

const response = await chatAgent.sendChatMessage(message, context, onToken);
```

## Example: Cogniclaim

Cogniclaim is a solution built on SOP Executor. See `src/apps/cogniclaim/services/ai/platformAdapter.js` for reference.

## Platform Components

Platform components (SOPViewer, ReasoningCard, etc.) are currently in the solution folders but will be moved to the platform as they're made generic.

