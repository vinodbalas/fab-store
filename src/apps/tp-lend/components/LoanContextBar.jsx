import { ArrowLeft, ChevronRight, Clock, AlertCircle, PanelRight } from "lucide-react";

export default function LoanContextBar({ loanData, onBack, onToggleSop, sopOpen = false }) {
  // Calculate SLA urgency
  const getSLAColor = () => {
    if (!loanData?.daysUntilSLA) return "text-gray-600";
    if (loanData.daysUntilSLA < 0) return "text-red-600";
    if (loanData.daysUntilSLA < 7) return "text-orange-600";
    if (loanData.daysUntilSLA < 14) return "text-yellow-600";
    return "text-green-600";
  };

  const getSLAText = () => {
    if (!loanData?.daysUntilSLA) return "N/A";
    if (loanData.daysUntilSLA < 0) return `${Math.abs(loanData.daysUntilSLA)} days overdue`;
    if (loanData.daysUntilSLA === 0) return "Due today";
    if (loanData.daysUntilSLA === 1) return "Due tomorrow";
    return `${loanData.daysUntilSLA} days remaining`;
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
          <span>Loan {loanData.loanNumber}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">AI Reasoning</span>
        </div>
      </div>

      {/* Right side - Loan details and SOP toggle */}
      <div className="flex items-center gap-4">
        {/* Loan Type */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            loanData.loanType === "FHA" 
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : loanData.loanType === "VA"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : loanData.loanType === "Jumbo"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}>
            {loanData.loanType}
          </span>
        </div>

        {/* Borrower */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{loanData.borrower}</span>
        </div>

        {/* Property State */}
        <div className="flex items-center gap-1.5 text-sm">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">{loanData.propertyState}</span>
        </div>

        {/* SLA Deadline */}
        <div className={`flex items-center gap-1.5 text-sm ${getSLAColor()}`}>
          <Clock className="w-4 h-4" />
          <span className="font-semibold">{getSLAText()}</span>
        </div>

        {/* Loan Amount */}
        <div className="flex items-center gap-1.5 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            ${loanData.loanAmount?.toLocaleString() || '0'}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            loanData.status === "Approved" 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : loanData.status === "Denied"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : loanData.status === "In Underwriting"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : loanData.status === "Conditional Approval"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}>
            {loanData.status}
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

