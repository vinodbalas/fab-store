import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, MapPin, User, ArrowRight, Calendar } from "lucide-react";
import { dispatchAPI } from "../services/api";
import WorkOrderCard from "../../../platforms/field-service/components/WorkOrderCard";

export default function TPDispatchHomeDashboard({ onSelectWorkOrder, onNavigate }) {
  const [stats, setStats] = useState({
    totalWorkOrders: 0,
    pending: 0,
    inProgress: 0,
    scheduled: 0,
    completed: 0,
    urgent: 0,
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await dispatchAPI.getAll();
    const workOrders = data.workOrders || [];
    
    setStats({
      totalWorkOrders: workOrders.length,
      pending: workOrders.filter((wo) => wo.status === "Pending").length,
      inProgress: workOrders.filter((wo) => wo.status === "In Progress").length,
      scheduled: workOrders.filter((wo) => wo.status === "Scheduled").length,
      completed: workOrders.filter((wo) => wo.status === "Completed").length,
      urgent: workOrders.filter((wo) => wo.priority === "High" && wo.status !== "Completed").length,
    });

    // Get recent high-priority work orders
    setRecentWorkOrders(
      workOrders
        .filter((wo) => wo.status !== "Completed")
        .sort((a, b) => {
          if (a.priority === "High" && b.priority !== "High") return -1;
          if (b.priority === "High" && a.priority !== "High") return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 6)
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-8 text-white shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Watchtower</h1>
                <p className="text-blue-100 text-sm">Real-time field service insights and optimization</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Live Demo</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.totalWorkOrders}</div>
            <div className="text-xs text-blue-100 mt-1">Total Work Orders</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs text-blue-100 mt-1">Pending</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-xs text-blue-100 mt-1">In Progress</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.urgent}</div>
            <div className="text-xs text-blue-100 mt-1">Urgent</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          onClick={() => onNavigate("dispatch/worklist")}
          className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">View All Work Orders</h3>
              <p className="text-sm text-gray-600 mt-1">Browse and manage all work orders</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.button>
        <motion.button
          className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Schedule Optimization</h3>
              <p className="text-sm text-gray-600 mt-1">AI-powered route and schedule optimization</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
        </motion.button>
      </div>

      {/* Recent Work Orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Work Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentWorkOrders.map((wo) => (
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
      </div>
    </div>
  );
}

