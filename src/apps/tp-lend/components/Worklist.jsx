import React from "react";
import { Store } from "lucide-react";
import LoansTable from "./LoansTable";

/**
 * Worklist Component for TP Lend
 * Main loans processing area with full table, filtering, and actions
 */
export default function Worklist({ onSelectLoan, onNavigate }) {
  return (
    <div className="p-6">
      {/* Header with Back to Store button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Loans Worklist
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and process mortgage applications. Click on a loan to analyze with AI reasoning.
            </p>
          </div>
          
          {/* Back to Store Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate("store")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#612D91] dark:hover:text-[#A64AC9] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Back to FAB Store"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </button>
          )}
        </div>
      </div>

      {/* Loans Table */}
      <LoansTable onSelect={onSelectLoan} />
    </div>
  );
}

