/**
 * TP Dispatch Platform Adapter
 * Connects TP Dispatch to the Field Service Platform
 */

import { FieldServiceDataProvider, createFieldServiceAgents } from "../../../platforms/field-service";
import * as workOrdersData from "../data/workOrders";

// Create data provider
const dataProvider = new FieldServiceDataProvider({
  WORK_ORDERS: workOrdersData.WORK_ORDERS,
  TECHNICIANS: workOrdersData.TECHNICIANS,
  getWorkOrderById: workOrdersData.getWorkOrderById,
  getTechnicianById: workOrdersData.getTechnicianById,
  getWorkOrdersByStatus: workOrdersData.getWorkOrdersByStatus,
  getWorkOrdersByPriority: workOrdersData.getWorkOrdersByPriority,
  getAvailableTechnicians: workOrdersData.getAvailableTechnicians,
  getScheduleForTechnician: workOrdersData.getScheduleForTechnician,
});

// Create platform agents
export const platformAgents = createFieldServiceAgents(dataProvider);

// Export data provider for components
export { dataProvider };

