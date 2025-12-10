import { ArrowLeft, ChevronRight, PanelRight } from "lucide-react";
import StatusPill from "./StatusPill";

export default function ClaimContextBar({ claim, onBack, onToggleSop, sopOpen = false }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm px-6 py-3.5 sticky top-0 z-20">
      {/* Left side - Back button and breadcrumb */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#612D91] dark:hover:text-[#A64AC9] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Worklist</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Claim #{claim.id}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">AI Reasoning</span>
        </div>
      </div>

      {/* Right side - Claim details and SOP toggle */}
      <div className="flex items-center gap-4">
        {/* Member name */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{claim.member}</span>
        </div>

        {/* Provider */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">{claim.provider}</span>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            ${claim.amount?.toLocaleString() || '0'}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <StatusPill status={claim.status} />
        </div>

        {/* SOP Toggle Button */}
        <button
          onClick={onToggleSop}
          className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${
            sopOpen 
              ? 'bg-[#612D91] text-white hover:bg-[#512579] shadow-md' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={sopOpen ? "Close SOP Reference Panel" : "Open SOP Reference Panel"}
        >
          <PanelRight className={`w-5 h-5 ${sopOpen ? '' : 'opacity-70'}`} />
          <span className="text-xs font-medium hidden sm:inline">
            {sopOpen ? 'SOP' : 'SOP'}
          </span>
        </button>
      </div>
    </div>
  );
}
