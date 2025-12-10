import { Package, AlertCircle, CheckCircle2, Clock, Wrench } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Asset Card Component
 * Displays asset information with maintenance status
 */
export default function AssetCard({ asset, onSelect }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "operational":
        return "bg-emerald-100 text-emerald-700";
      case "maintenance required":
        return "bg-amber-100 text-amber-700";
      case "critical":
        return "bg-red-100 text-red-700";
      case "under maintenance":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "operational":
        return <CheckCircle2 className="w-4 h-4" />;
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      case "under maintenance":
        return <Wrench className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(asset)}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{asset.id}</h3>
            </div>
            <p className="text-sm text-gray-600">{asset.name || asset.model}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(asset.status)}`}>
            {getStatusIcon(asset.status)}
            {asset.status || "Unknown"}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {asset.customer && (
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-4 h-4 text-gray-400" />
              <span>{asset.customer.name || asset.customer}</span>
            </div>
          )}
          {asset.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-4 h-4 text-gray-400" />
              <span>{asset.location.address || asset.location}</span>
            </div>
          )}
          {asset.lastMaintenance && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Last maintenance: {new Date(asset.lastMaintenance).toLocaleDateString()}</span>
            </div>
          )}
          {asset.nextMaintenance && (
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${new Date(asset.nextMaintenance) < new Date() ? "text-red-500" : "text-gray-400"}`} />
              <span className={`text-sm ${new Date(asset.nextMaintenance) < new Date() ? "text-red-600 font-medium" : "text-gray-600"}`}>
                Next maintenance: {new Date(asset.nextMaintenance).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

