import { AlertCircle } from "lucide-react";

/**
 * Denial Code Badge Component
 * Displays denial codes with descriptions
 */
export default function DenialCodeBadge({ code, description, className = "" }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-medium ${className}`}
      title={description}
    >
      <AlertCircle className="w-3 h-3" />
      <span className="font-semibold">{code}</span>
      {description && (
        <span className="hidden sm:inline text-red-700 dark:text-red-300">
          {description}
        </span>
      )}
    </div>
  );
}

