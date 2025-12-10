import { Clock, MapPin, User, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Work Order Card Component
 * Displays work order information in a card format
 */
export default function WorkOrderCard({ workOrder, onSelect, onAssign }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "in progress":
        return "bg-blue-100 text-blue-700";
      case "scheduled":
        return "bg-purple-100 text-purple-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "low":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(workOrder)}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{workOrder.id}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)} border`}>
                {workOrder.priority || "Medium"}
              </span>
            </div>
            <p className="text-sm text-gray-600">{workOrder.serviceType || "Service Request"}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(workOrder.status)}`}>
            {getStatusIcon(workOrder.status)}
            {workOrder.status || "Pending"}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {workOrder.customer && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span>{workOrder.customer.name || workOrder.customer}</span>
            </div>
          )}
          {workOrder.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{workOrder.location.address || workOrder.location}</span>
            </div>
          )}
          {workOrder.scheduledTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{new Date(workOrder.scheduledTime).toLocaleString()}</span>
            </div>
          )}
          {workOrder.slaHours !== undefined && (
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${workOrder.slaHours < 4 ? "text-red-500" : workOrder.slaHours < 8 ? "text-amber-500" : "text-green-500"}`} />
              <span className={`text-sm font-medium ${workOrder.slaHours < 4 ? "text-red-600" : workOrder.slaHours < 8 ? "text-amber-600" : "text-green-600"}`}>
                {workOrder.slaHours}h SLA remaining
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {onAssign && workOrder.status !== "completed" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssign?.(workOrder);
            }}
            className="w-full mt-2 px-3 py-2 text-sm font-medium text-[#612D91] bg-[#612D91]/10 rounded-lg hover:bg-[#612D91]/20 transition-colors"
          >
            Assign Technician
          </button>
        )}
      </div>
    </motion.div>
  );
}

