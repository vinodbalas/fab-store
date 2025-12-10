import { useCallback, useEffect, useMemo, useState } from "react";
import { casesAPI } from "../services/api";
import { Loader2, AlertCircle, RefreshCw, Clock, Sparkles } from "lucide-react";

const HEADERS = [
  { key: "caseNumber", label: "CASE NUMBER" },
  { key: "type", label: "TYPE" },
  { key: "complainant", label: "COMPLAINANT" },
  { key: "issueType", label: "ISSUE TYPE" },
  { key: "status", label: "STATUS" },
  { key: "deadline", label: "DEADLINE" },
  { key: "amount", label: "AMOUNT ($)" },
];

const STATUS_FILTERS = ["All", "Filed", "Under Investigation", "Awaiting Response", "Resolved", "Escalated"];
const TYPE_FILTERS = ["All", "Appeal", "Grievance"];
const JURISDICTION_FILTERS = ["All", "Federal", "State", "Internal"];

function DeadlineBadge({ daysUntilDeadline }) {
  if (daysUntilDeadline === undefined || daysUntilDeadline === null) {
    return <span className="text-gray-400 text-xs">—</span>;
  }
  
  let color = "text-gray-600 dark:text-gray-400";
  let bgColor = "bg-gray-100 dark:bg-gray-800";
  
  if (daysUntilDeadline < 0) {
    color = "text-red-700 dark:text-red-400";
    bgColor = "bg-red-100 dark:bg-red-900/30";
  } else if (daysUntilDeadline < 7) {
    color = "text-orange-600 dark:text-orange-400";
    bgColor = "bg-orange-100 dark:bg-orange-900/30";
  } else if (daysUntilDeadline < 14) {
    color = "text-yellow-600 dark:text-yellow-400";
    bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
  } else {
    color = "text-green-600 dark:text-green-400";
    bgColor = "bg-green-100 dark:bg-green-900/30";
  }
  
  const text = daysUntilDeadline < 0 
    ? `${Math.abs(daysUntilDeadline)}d overdue`
    : daysUntilDeadline === 0
    ? "Due today"
    : `${daysUntilDeadline}d left`;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color} ${bgColor}`}>
      {text}
    </span>
  );
}

export default function CasesTable({ onSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // Debounced search term
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [jurisdiction, setJurisdiction] = useState("All");
  const [sortKey, setSortKey] = useState("deadline");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  // Debounce search: only update search term if input has 3+ chars or is empty
  useEffect(() => {
    const trimmed = searchInput.trim();
    // Only search if empty or has at least 3 characters
    if (trimmed.length === 0 || trimmed.length >= 3) {
      const timer = setTimeout(() => {
        setSearch(trimmed);
        setPage(1); // Reset to first page on new search
      }, 300); // 300ms debounce delay
      return () => clearTimeout(timer);
    }
  }, [searchInput]);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await casesAPI.getAll({
        status: status === "All" ? null : status,
        type: type === "All" ? null : type,
        jurisdiction: jurisdiction === "All" ? null : jurisdiction,
        search: search || null,
        page,
        pageSize,
      });
      setCases(result.cases);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message || "Failed to load cases");
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  }, [status, type, jurisdiction, search, page, pageSize]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const sorted = useMemo(() => {
    return [...cases].sort((a, b) => {
      const A = a[sortKey], B = b[sortKey];
      if (sortKey === "amount") {
        const numA = typeof A === 'number' ? A : parseFloat(A) || 0;
        const numB = typeof B === 'number' ? B : parseFloat(B) || 0;
        return sortDir === "asc" ? numA - numB : numB - numA;
      }
      if (sortKey === "deadline") {
        const daysA = a.daysUntilDeadline ?? Infinity;
        const daysB = b.daysUntilDeadline ?? Infinity;
        return sortDir === "asc" ? daysA - daysB : daysB - daysA;
      }
      if (sortKey === "complainant") {
        const nameA = a.complainant?.name || "";
        const nameB = b.complainant?.name || "";
        return sortDir === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      return sortDir === "asc"
        ? String(A || "").localeCompare(String(B || ""))
        : String(B || "").localeCompare(String(A || ""));
    });
  }, [cases, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (loading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#612D91]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchCases}
          className="px-4 py-2 bg-[#612D91] text-white rounded-md hover:bg-[#512579] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search cases... (min 3 chars)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
        >
          {STATUS_FILTERS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
        >
          {TYPE_FILTERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-sm"
        >
          {JURISDICTION_FILTERS.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {HEADERS.map(header => (
                  <th
                    key={header.key}
                    onClick={() => handleSort(header.key)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-1">
                      {header.label}
                      {sortKey === header.key && (
                        <span className="text-[#612D91]">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sorted.map((caseData) => (
                <>
                  <tr
                    key={caseData.id}
                    onClick={() =>
                      setSortDir((prev) => {
                        // reuse expandedId state to toggle row expansion
                        setExpandedId((prevId) => (prevId === caseData.id ? null : caseData.id));
                        return prev;
                      })
                    }
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <span>{caseData.caseNumber}</span>
                        {Array.isArray(caseData.lineItems) && caseData.lineItems.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId((prev) => (prev === caseData.id ? null : caseData.id));
                            }}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          >
                            {caseData.lineItems.length} line item{caseData.lineItems.length > 1 ? "s" : ""}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(caseData);
                          }}
                          className="inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 text-[#612D91] dark:text-[#A64AC9] border border-[#612D91]/40 dark:border-[#A64AC9]/50 hover:bg-[#F5F3FF] dark:hover:bg-[#4B2E83]/40"
                          title="Open in AI Reasoning"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="sr-only">Open in AI Reasoning</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        caseData.type === "Appeal"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      }`}>
                        {caseData.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {caseData.complainant?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {caseData.issueType}
                    </td>
                    <td className="px-4 py-3 text-sm">
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
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <DeadlineBadge daysUntilDeadline={caseData.daysUntilDeadline} />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${caseData.amount?.toLocaleString() || '0'}
                    </td>
                  </tr>
                  {expandedId === caseData.id && Array.isArray(caseData.lineItems) && caseData.lineItems.length > 0 && (
                    <tr key={`${caseData.id}-lines`} className="bg-gray-50/60 dark:bg-gray-900/60">
                      <td colSpan={HEADERS.length} className="px-6 pb-4 pt-0">
                        <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                              <tr>
                                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Line</th>
                                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Description</th>
                                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Issue Type</th>
                                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
                                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                              {caseData.lineItems.map((li) => (
                                <tr
                                  key={li.lineId}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Open parent case; line-level next steps are then available in details panel
                                    onSelect?.(caseData);
                                  }}
                                >
                                  <td className="px-2 py-1 font-medium text-gray-800 dark:text-gray-100">{li.lineId}</td>
                                  <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.description}</td>
                                  <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.issueType}</td>
                                  <td className="px-2 py-1 text-gray-800 dark:text-gray-100">
                                    {li.amount != null ? `$${li.amount.toLocaleString()}` : "—"}
                                  </td>
                                  <td className="px-2 py-1">
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                      {li.status || caseData.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} cases
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

