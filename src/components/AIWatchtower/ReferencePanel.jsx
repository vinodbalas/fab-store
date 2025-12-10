/**
 * Reference Panel - Platform-Agnostic
 * 
 * Displays references (SOPs, Assets, Inventory) based on provider
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Package, X } from "lucide-react";

export default function ReferencePanel({
  provider,
  item,
  references = [],
  isOpen,
  onClose,
  onView,
  type = "sop",
}) {
  const [referenceItems, setReferenceItems] = useState([]);

  useEffect(() => {
    if (item && provider) {
      provider.getReferences(item).then(setReferenceItems);
    }
  }, [item, provider]);

  const getIcon = () => {
    switch (type) {
      case "asset":
      case "inventory":
        return Package;
      default:
        return FileText;
    }
  };

  const Icon = getIcon();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 320, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        className="border-l border-gray-200 bg-white dark:bg-gray-900 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                {type === "sop" ? "SOP References" : type === "asset" ? "Assets" : "Inventory"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {references.length === 0 && referenceItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No references available</p>
              </div>
            ) : (
              [...references, ...referenceItems].map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => onView?.(ref.id || ref, ref.type || type)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {ref.label || ref.name || ref.id || ref}
                  </div>
                  {ref.description && (
                    <div className="text-xs text-gray-600 mt-1">{ref.description}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

