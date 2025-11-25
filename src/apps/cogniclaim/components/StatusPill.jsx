export default function StatusPill({ status, value }) {
    const statusText = status || value;
    const map = {
      "Pending Review":   "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      "Under Process":    "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      "Information Needed":"bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
      "Escalated":        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      "Approved":         "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      "Rejected":         "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    };
    const cls = map[statusText] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    return <span className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{statusText}</span>;
  }
  