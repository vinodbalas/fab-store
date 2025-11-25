import { useState } from "react";

export default function Tabs({ tabs, initial = 0 }) {
  const [active, setActive] = useState(initial);
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 px-4 pt-3">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`px-3 py-2 text-sm rounded-t-md font-medium transition-colors ${
              i===active
                ? "bg-white dark:bg-gray-900 border border-b-0 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {tabs[active]?.content}
      </div>
    </div>
  );
}
