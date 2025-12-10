/**
 * Field Service Data Provider
 * Platform-agnostic interface for field service data access
 * Solutions using Field Service Platform pass their data through this provider
 */

export class FieldServiceDataProvider {
  constructor(serviceData) {
    this.WORK_ORDERS = serviceData.WORK_ORDERS || [];
    this.TECHNICIANS = serviceData.TECHNICIANS || [];
    this.SCHEDULES = serviceData.SCHEDULES || [];
    this.ROUTES = serviceData.ROUTES || [];
    this.CUSTOMERS = serviceData.CUSTOMERS || [];
    this.PARTS_INVENTORY = serviceData.PARTS_INVENTORY || [];
    this.ASSETS = serviceData.ASSETS || [];
    this.CONTRACTS = serviceData.CONTRACTS || [];
    this.WARRANTIES = serviceData.WARRANTIES || [];
    this.INVENTORY_ITEMS = serviceData.INVENTORY_ITEMS || [];
    
    // Helper methods - Work Orders
    this.getWorkOrderById = serviceData.getWorkOrderById || ((id) => null);
    this.getTechnicianById = serviceData.getTechnicianById || ((id) => null);
    this.getScheduleForTechnician = serviceData.getScheduleForTechnician || ((techId) => []);
    this.getRouteForWorkOrder = serviceData.getRouteForWorkOrder || ((woId) => null);
    this.getCustomerById = serviceData.getCustomerById || ((id) => null);
    this.getAvailableTechnicians = serviceData.getAvailableTechnicians || ((date, time) => []);
    this.getWorkOrdersByStatus = serviceData.getWorkOrdersByStatus || ((status) => []);
    this.getWorkOrdersByPriority = serviceData.getWorkOrdersByPriority || ((priority) => []);
    
    // Helper methods - Assets
    this.getAssetById = serviceData.getAssetById || ((id) => null);
    this.getAssetsByCustomer = serviceData.getAssetsByCustomer || ((customerId) => []);
    this.getAssetMaintenanceHistory = serviceData.getAssetMaintenanceHistory || ((assetId) => []);
    
    // Helper methods - Contracts & Warranties
    this.getContractById = serviceData.getContractById || ((id) => null);
    this.getContractsByCustomer = serviceData.getContractsByCustomer || ((customerId) => []);
    this.getWarrantyById = serviceData.getWarrantyById || ((id) => null);
    this.getWarrantiesByAsset = serviceData.getWarrantiesByAsset || ((assetId) => []);
    
    // Helper methods - Inventory
    this.getInventoryItemById = serviceData.getInventoryItemById || ((id) => null);
    this.getInventoryByLocation = serviceData.getInventoryByLocation || ((location) => []);
    this.getRequiredPartsForWorkOrder = serviceData.getRequiredPartsForWorkOrder || ((woId) => []);
  }

  getWorkOrders() {
    return this.WORK_ORDERS;
  }

  getTechnicians() {
    return this.TECHNICIANS;
  }

  getSchedules() {
    return this.SCHEDULES;
  }

  getRoutes() {
    return this.ROUTES;
  }

  lookupWorkOrder(id) {
    return this.getWorkOrderById(id);
  }

  lookupTechnician(id) {
    return this.getTechnicianById(id);
  }

  lookupSchedule(technicianId) {
    return this.getScheduleForTechnician(technicianId);
  }

  lookupRoute(workOrderId) {
    return this.getRouteForWorkOrder(workOrderId);
  }

  // Asset Management
  getAssets() {
    return this.ASSETS;
  }

  lookupAsset(id) {
    return this.getAssetById(id);
  }

  lookupAssetsByCustomer(customerId) {
    return this.getAssetsByCustomer(customerId);
  }

  // Contracts & Warranties
  getContracts() {
    return this.CONTRACTS;
  }

  lookupContract(id) {
    return this.getContractById(id);
  }

  lookupWarranty(id) {
    return this.getWarrantyById(id);
  }

  // Inventory
  getInventory() {
    return this.INVENTORY_ITEMS;
  }

  lookupInventoryItem(id) {
    return this.getInventoryItemById(id);
  }
}

