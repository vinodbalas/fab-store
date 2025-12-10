/**
 * TP Dispatch API Service
 */

import { WORK_ORDERS, TECHNICIANS, getWorkOrderById, getTechnicianById } from "../data/workOrders";

// Check demo mode from localStorage (same pattern as other apps)
function isDemoMode() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("cogniclaim.demoMode");
  return stored !== "false"; // Default to demo mode
}

export const dispatchAPI = {
  async getAll() {
    if (isDemoMode()) {
      return {
        workOrders: WORK_ORDERS,
        technicians: TECHNICIANS,
      };
    }

    // Real API call would go here
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/dispatch/work-orders`);
    return response.json();
  },

  async getById(id) {
    if (isDemoMode()) {
      return getWorkOrderById(id);
    }

    // Real API call
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/dispatch/work-orders/${id}`);
    return response.json();
  },

  async getTechnicians() {
    if (isDemoMode()) {
      return TECHNICIANS;
    }

    // Real API call
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/dispatch/technicians`);
    return response.json();
  },
};

