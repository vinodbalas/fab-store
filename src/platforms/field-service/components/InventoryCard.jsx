import { Package, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Inventory Card Component
 * Displays inventory item information with stock levels
 */
export default function InventoryCard({ item, onSelect }) {
  const getStockStatus = (quantity, minThreshold) => {
    if (quantity === 0) return { color: "bg-red-100 text-red-700", label: "Out of Stock", icon: AlertTriangle };
    if (quantity <= minThreshold) return { color: "bg-amber-100 text-amber-700", label: "Low Stock", icon: AlertTriangle };
    return { color: "bg-emerald-100 text-emerald-700", label: "In Stock", icon: CheckCircle2 };
  };

  const stockStatus = getStockStatus(item.quantity, item.minThreshold || 5);
  const StatusIcon = stockStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(item)}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{item.partNumber || item.id}</h3>
            </div>
            <p className="text-sm text-gray-600">{item.name || item.description}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${stockStatus.color}`}>
            <StatusIcon className="w-4 h-4" />
            {stockStatus.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Quantity:</span>
            <span className={`font-semibold ${item.quantity === 0 ? "text-red-600" : item.quantity <= (item.minThreshold || 5) ? "text-amber-600" : "text-emerald-600"}`}>
              {item.quantity} {item.unit || "units"}
            </span>
          </div>
          {item.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{item.location}</span>
            </div>
          )}
          {item.category && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                {item.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

