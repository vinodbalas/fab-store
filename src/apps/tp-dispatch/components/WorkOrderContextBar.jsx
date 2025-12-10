import { ArrowLeft, FileText, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkOrderContextBar({ workOrder, onBack, onToggleReference, referenceOpen }) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {workOrder?.id || "Work Order"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {workOrder?.serviceType || "Field Service"} • {workOrder?.status || "Pending"}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleReference}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            referenceOpen
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          {referenceOpen ? "Hide" : "Show"} References
        </button>
      </div>
    </div>
  );
}

