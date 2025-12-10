import { ArrowLeft, ChevronRight, Clock, AlertCircle, PanelRight } from "lucide-react";

export default function CaseContextBar({ caseData, onBack, onToggleSop, sopOpen = false }) {
  // Calculate deadline urgency
  const getDeadlineColor = () => {
    if (!caseData?.daysUntilDeadline) return "text-gray-600";
    if (caseData.daysUntilDeadline < 0) return "text-red-600";
    if (caseData.daysUntilDeadline < 7) return "text-orange-600";
    if (caseData.daysUntilDeadline < 14) return "text-yellow-600";
    return "text-green-600";
  };

  const getDeadlineText = () => {
    if (!caseData?.daysUntilDeadline) return "N/A";
    if (caseData.daysUntilDeadline < 0) return `${Math.abs(caseData.daysUntilDeadline)} days overdue`;
    if (caseData.daysUntilDeadline === 0) return "Due today";
    if (caseData.daysUntilDeadline === 1) return "Due tomorrow";
    return `${caseData.daysUntilDeadline} days remaining`;
  };

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
          <span>Case {caseData.caseNumber}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">AI Reasoning</span>
        </div>
      </div>

      {/* Right side - Case details and SOP toggle */}
      <div className="flex items-center gap-4">
        {/* Case Type */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            caseData.type === "Appeal" 
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          }`}>
            {caseData.type}
          </span>
        </div>

        {/* Complainant */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{caseData.complainant?.name}</span>
        </div>

        {/* Issue Type */}
        <div className="flex items-center gap-1.5 text-sm">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">{caseData.issueType}</span>
        </div>

        {/* Deadline */}
        <div className={`flex items-center gap-1.5 text-sm ${getDeadlineColor()}`}>
          <Clock className="w-4 h-4" />
          <span className="font-semibold">{getDeadlineText()}</span>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            ${caseData.amount?.toLocaleString() || '0'}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            caseData.status === "Resolved" 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : caseData.status === "Escalated"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : caseData.status === "Under Investigation"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}>
            {caseData.status}
          </span>
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

