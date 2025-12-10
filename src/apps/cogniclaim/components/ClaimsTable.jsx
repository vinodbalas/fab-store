import { useCallback, useEffect, useMemo, useState } from "react";
import { claimsAPI } from "../services/api";
import StatusPill from "./StatusPill";
import { Loader2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";

const HEADERS = [
  { key: "id", label: "CLAIM ID" },
  { key: "member", label: "MEMBER" },
  { key: "provider", label: "PROVIDER" },
  { key: "status", label: "STATUS" },
  { key: "amount", label: "AMOUNT ($)" },
  { key: "date", label: "RECEIVED DATE" },
  { key: "aiPriority", label: "AI PRIORITY" },
];

const STATUS_FILTERS = ["All", "Pending Review", "Under Process", "Information Needed", "Escalated"];

// AI Priority indicator component
function AIPriorityBadge({ score }) {
  if (!score && score !== 0) return <span className="text-gray-400 text-xs">—</span>;
  
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  
  let color = "text-gray-600 dark:text-gray-400";
  let dotColor = "bg-gray-400";
  
  if (numScore >= 8.0) {
    color = "text-red-700 dark:text-red-400";
    dotColor = "bg-red-500";
  } else if (numScore >= 7.0) {
    color = "text-orange-600 dark:text-orange-400";
    dotColor = "bg-orange-500";
  } else if (numScore >= 6.0) {
    color = "text-yellow-600 dark:text-yellow-400";
    dotColor = "bg-yellow-500";
  } else if (numScore >= 5.0) {
    color = "text-green-600 dark:text-green-400";
    dotColor = "bg-green-500";
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-bold ${color}`}>{numScore.toFixed(1)}</span>
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
    </div>
  );
}

export default function ClaimsTable({ onSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // Debounced search term
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [expandedId, setExpandedId] = useState(null);

  // API state
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  // Fetch claims from API
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await claimsAPI.getAll({
        status: status === "All" ? null : status,
        search: search || null,
        page,
        pageSize,
      });
      setClaims(result.claims);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message || "Failed to load claims");
      console.error("Error fetching claims:", err);
    } finally {
      setLoading(false);
    }
  }, [status, search, page, pageSize]);

  // Fetch claims when filters change
  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Client-side sorting
  const sorted = useMemo(() => {
    return [...claims].sort((a, b) => {
      const A = a[sortKey], B = b[sortKey];
      if (sortKey === "amount" || sortKey === "aiPriority") {
        const numA = typeof A === 'number' ? A : parseFloat(A) || 0;
        const numB = typeof B === 'number' ? B : parseFloat(B) || 0;
        return sortDir === "asc" ? numA - numB : numB - numA;
      }
      return sortDir === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
  }, [claims, sortKey, sortDir]);

  // Calculate AI insights
  const aiInsights = useMemo(() => {
    const highPriority = claims.filter(c => (c.aiPriority || 0) >= 8.0).length;
    const highPriorityPercent = claims.length > 0 ? Math.round((highPriority / claims.length) * 100) : 0;
    const escalationRisk = claims.filter(c => c.status === "Escalated" || (c.aiPriority || 0) >= 8.5).length;
    const escalationPercent = claims.length > 0 ? Math.round((escalationRisk / claims.length) * 100) : 0;
    
    return { highPriority, highPriorityPercent, escalationRisk, escalationPercent };
  }, [claims]);

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* AI Smart Filters */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#612D91] dark:text-[#A64AC9]" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">AI Smart Filters</span>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3FF] dark:bg-[#4B2E83]/30 text-[#612D91] dark:text-[#A64AC9] border border-[#612D91]/30 dark:border-[#A64AC9]/30 text-xs font-medium hover:bg-[#EDE9FE] dark:hover:bg-[#4B2E83]/40 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Priority ({aiInsights.highPriority})</span>
            <span className="ml-0.5 opacity-75">({aiInsights.highPriorityPercent}%)</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEF3F2] dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800/50 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Escalation Risk ({aiInsights.escalationRisk})</span>
            <span className="ml-0.5 opacity-75">({aiInsights.escalationPercent}%)</span>
          </button>
        </div>
      </div>

      {/* Status Tabs and Search */}
      <div className="flex items-center justify-between gap-4 px-6 pb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={loading}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${
                status === s
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by ID, Member, Provider, Status (min 3 chars)"
          disabled={loading}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 text-sm w-80 disabled:opacity-50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#612D91]/50 dark:focus:ring-[#A64AC9]/50"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={fetchClaims}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <Loader2 className="w-8 h-8 text-[#612D91] dark:text-[#A64AC9] animate-spin mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading claims...</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 text-[11px] font-semibold tracking-wide">
                <tr>
                  {HEADERS.map((h) => (
                    <th
                      key={h.key}
                      onClick={() => h.key !== 'date' && toggleSort(h.key)}
                      className={`text-left px-4 py-3 ${h.key !== 'date' ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700/50' : ''} transition`}
                      title={h.key !== 'date' ? "Click to sort" : ""}
                    >
                      {h.label}
                      {sortKey === h.key && h.key !== 'date' ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sorted.map((c) => (
                  <>
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId((prev) => (prev === c.id ? null : c.id))
                      }
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{c.id}</span>
                          {Array.isArray(c.lineItems) && c.lineItems.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId((prev) => (prev === c.id ? null : c.id));
                              }}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                            >
                              {c.lineItems.length} line item{c.lineItems.length > 1 ? "s" : ""}
                            </button>
                          )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(c);
                          }}
                          className="inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 text-[#612D91] dark:text-[#A64AC9] border border-[#612D91]/40 dark:border-[#A64AC9]/50 hover:bg-[#F5F3FF] dark:hover:bg-[#4B2E83]/40"
                          title="Open in AI Reasoning"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="sr-only">Open in AI Reasoning</span>
                        </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{c.member}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.provider}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{c.amount?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.date}</td>
                      <td className="px-4 py-3">
                        <AIPriorityBadge score={c.aiPriority} />
                      </td>
                    </tr>
                    {expandedId === c.id && Array.isArray(c.lineItems) && c.lineItems.length > 0 && (
                      <tr key={`${c.id}-lines`} className="bg-gray-50/60 dark:bg-gray-900/60">
                        <td colSpan={HEADERS.length} className="px-6 pb-4 pt-0">
                          <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Line</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Description</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">CPT</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">ICD‑10</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                                {c.lineItems.map((li) => (
                                  <tr
                                    key={li.lineId}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Surface the parent claim in the side panel; line-level next steps are shown in details panel
                                      onSelect?.(c);
                                    }}
                                  >
                                    <td className="px-2 py-1 font-medium text-gray-800 dark:text-gray-100">{li.lineId}</td>
                                    <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.description}</td>
                                    <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.cptCode}</td>
                                    <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.icd10Code}</td>
                                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">
                                      {li.amount != null ? `$${li.amount.toLocaleString()}` : "—"}
                                    </td>
                                    <td className="px-2 py-1">
                                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        {li.status || c.status}
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
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={HEADERS.length} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      No matching claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} claims
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-300 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
