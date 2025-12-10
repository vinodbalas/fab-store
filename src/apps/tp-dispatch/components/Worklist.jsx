import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { dispatchAPI } from "../services/api";
import WorkOrderCard from "../../../platforms/field-service/components/WorkOrderCard";

export default function TPDispatchWorklist({ onSelectWorkOrder, onNavigate }) {
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    loadWorkOrders();
  }, []);

  useEffect(() => {
    filterWorkOrders();
  }, [workOrders, search, statusFilter, priorityFilter]);

  async function loadWorkOrders() {
    const data = await dispatchAPI.getAll();
    setWorkOrders(data.workOrders || []);
  }

  function filterWorkOrders() {
    let filtered = [...workOrders];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.id.toLowerCase().includes(searchLower) ||
          wo.serviceType?.toLowerCase().includes(searchLower) ||
          wo.customer?.name?.toLowerCase().includes(searchLower) ||
          wo.location?.address?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((wo) => wo.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((wo) => wo.priority?.toLowerCase() === priorityFilter.toLowerCase());
    }

    setFilteredWorkOrders(filtered);
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("dispatch")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
            <p className="text-sm text-gray-600">Manage and track field service work orders</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkOrders.map((wo) => (
          <div key={wo.id} className="relative">
            <WorkOrderCard
              workOrder={wo}
              onSelect={onSelectWorkOrder}
            />
            <button
              onClick={() => onSelectWorkOrder?.(wo)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              title="Open in AI Watchtower"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {filteredWorkOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No work orders found matching your filters.</p>
        </div>
      )}
    </div>
  );
}

