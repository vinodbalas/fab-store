# Field Service Platform

A reusable platform for building field service management solutions across industries, inspired by ServiceMax capabilities.

## Features

- **Work Order Management**: Complete lifecycle tracking from scheduling to completion
- **Intelligent Scheduling**: AI-powered scheduling with location, skills, and availability matching
- **Route Optimization**: Geospatial routing optimization considering proximity, skills, and SLA constraints
- **Asset Management**: Track assets, maintenance history, and service interventions
- **Inventory Management**: Parts, tools, and equipment tracking across multiple locations
- **Contract & Warranty Management**: SLA tracking, entitlements, and service contracts
- **SLA Tracking**: Monitor and manage service level agreements with risk assessment
- **Real-time Updates**: Live status tracking and notifications

## Architecture

Similar to SOP Executor, Field Service Platform follows a modular architecture:

- **Core**: Data providers for work orders, technicians, schedules
- **Services**: AI agents for routing, scheduling, optimization
- **Components**: Reusable UI components (WorkOrderCard, ScheduleView)

## Usage

```javascript
import { FieldServiceDataProvider, createFieldServiceAgents, WorkOrderCard } from '@platforms/field-service';

// Create data provider
const dataProvider = new FieldServiceDataProvider({
  WORK_ORDERS: [...],
  TECHNICIANS: [...],
  // ... other data
});

// Create AI agents
const agents = createFieldServiceAgents(dataProvider);

// Use components
<WorkOrderCard workOrder={workOrder} onSelect={handleSelect} />
```

## Solutions Built on This Platform

- **TP Dispatch**: Comprehensive field service management with work orders, scheduling, and dispatch
- **TP Inventory**: Parts and equipment management with multi-location tracking and low-stock alerts
- More solutions coming soon (TP Contracts, TP Assets, TP Analytics...)

