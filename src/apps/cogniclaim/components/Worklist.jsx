import React from "react";
import { ArrowLeft, Store } from "lucide-react";
import ClaimsTable from "./ClaimsTable";

/**
 * Worklist Component
 * Main claims processing area with full table, filtering, and actions
 */
export default function Worklist({ onSelectClaim, onNavigate }) {
  return (
    <div className="p-6">
      {/* Header with Back to Store button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Claims Worklist
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and process claims. Click on a claim to analyze with AI reasoning.
            </p>
          </div>
          
          {/* Back to Store Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate("store")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#612D91] to-[#A64AC9] rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Store className="w-4 h-4" />
              Back to Store
            </button>
          )}
        </div>
      </div>

      {/* Claims Table */}
      <ClaimsTable onSelect={onSelectClaim} />
    </div>
  );
}

