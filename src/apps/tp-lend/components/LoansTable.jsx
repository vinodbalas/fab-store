import { useCallback, useEffect, useMemo, useState } from "react";
import { loansAPI } from "../services/api";
import { Loader2, AlertCircle, RefreshCw, Clock, Sparkles } from "lucide-react";

const HEADERS = [
  { key: "loanNumber", label: "LOAN NUMBER" },
  { key: "loanType", label: "LOAN TYPE" },
  { key: "borrower", label: "BORROWER" },
  { key: "propertyState", label: "STATE" },
  { key: "status", label: "STATUS" },
  { key: "sla", label: "SLA" },
  { key: "loanAmount", label: "AMOUNT ($)" },
];

const STATUS_FILTERS = ["All", "Under Review", "Pending Documentation", "In Underwriting", "Conditional Approval", "Approved", "Denied"];
const LOAN_TYPE_FILTERS = ["All", "Conventional", "FHA", "VA", "USDA", "Jumbo"];
const STATE_FILTERS = ["All", "TX", "CA", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "MI"];

function SLABadge({ daysUntilSLA }) {
  if (daysUntilSLA === undefined || daysUntilSLA === null) {
    return <span className="text-gray-400 text-xs">—</span>;
  }
  
  let color = "text-gray-600 dark:text-gray-400";
  let bgColor = "bg-gray-100 dark:bg-gray-800";
  
  if (daysUntilSLA < 0) {
    color = "text-red-700 dark:text-red-400";
    bgColor = "bg-red-100 dark:bg-red-900/30";
  } else if (daysUntilSLA < 7) {
    color = "text-orange-600 dark:text-orange-400";
    bgColor = "bg-orange-100 dark:bg-orange-900/30";
  } else if (daysUntilSLA < 14) {
    color = "text-yellow-600 dark:text-yellow-400";
    bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
  } else {
    color = "text-green-600 dark:text-green-400";
    bgColor = "bg-green-100 dark:bg-green-900/30";
  }
  
  const text = daysUntilSLA < 0 
    ? `${Math.abs(daysUntilSLA)}d overdue`
    : daysUntilSLA === 0
    ? "Due today"
    : `${daysUntilSLA}d left`;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color} ${bgColor}`}>
      {text}
    </span>
  );
}

export default function LoansTable({ onSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // Debounced search term
  const [status, setStatus] = useState("All");
  const [loanType, setLoanType] = useState("All");
  const [propertyState, setPropertyState] = useState("All");
  const [sortKey, setSortKey] = useState("sla");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loans, setLoans] = useState([]);
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

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loansAPI.getAll({
        status: status === "All" ? null : status,
        loanType: loanType === "All" ? null : loanType,
        propertyState: propertyState === "All" ? null : propertyState,
        search: search || null,
        page,
        pageSize,
      });
      setLoans(result.loans);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message || "Failed to load loans");
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  }, [status, loanType, propertyState, search, page, pageSize]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const sorted = useMemo(() => {
    return [...loans].sort((a, b) => {
      const A = a[sortKey], B = b[sortKey];
      if (sortKey === "loanAmount") {
        const numA = typeof A === 'number' ? A : parseFloat(A) || 0;
        const numB = typeof B === 'number' ? B : parseFloat(B) || 0;
        return sortDir === "asc" ? numA - numB : numB - numA;
      }
      if (sortKey === "sla") {
        const daysA = a.daysUntilSLA ?? Infinity;
        const daysB = b.daysUntilSLA ?? Infinity;
        return sortDir === "asc" ? daysA - daysB : daysB - daysA;
      }
      if (sortKey === "borrower") {
        const nameA = a.borrower || "";
        const nameB = b.borrower || "";
        return sortDir === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      return sortDir === "asc"
        ? String(A || "").localeCompare(String(B || ""))
        : String(B || "").localeCompare(String(A || ""));
    });
  }, [loans, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (loading && loans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#612D91]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search loans (min 3 chars)..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#612D91] dark:focus:ring-[#A64AC9]"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#612D91] dark:focus:ring-[#A64AC9]"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={loanType}
          onChange={(e) => {
            setLoanType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#612D91] dark:focus:ring-[#A64AC9]"
        >
          {LOAN_TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={propertyState}
          onChange={(e) => {
            setPropertyState(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#612D91] dark:focus:ring-[#A64AC9]"
        >
          {STATE_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={fetchLoans}
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
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading loans...</p>
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
                      onClick={() => handleSort(h.key)}
                      className={`text-left px-4 py-3 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700/50 transition`}
                      title="Click to sort"
                    >
                      {h.label}
                      {sortKey === h.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sorted.map((loan) => (
                  <>
                    <tr
                      key={loan.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId((prev) => (prev === loan.id ? null : loan.id))
                      }
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{loan.loanNumber}</span>
                          {Array.isArray(loan.lineItems) && loan.lineItems.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId((prev) => (prev === loan.id ? null : loan.id));
                              }}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                            >
                              {loan.lineItems.length} line item{loan.lineItems.length > 1 ? "s" : ""}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect?.(loan);
                            }}
                            className="inline-flex items-center justify-center text-[11px] px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 text-[#612D91] dark:text-[#A64AC9] border border-[#612D91]/40 dark:border-[#A64AC9]/50 hover:bg-[#F5F3FF] dark:hover:bg-[#4B2E83]/40"
                            title="Open in AI Reasoning"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="sr-only">Open in AI Reasoning</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          loan.loanType === "FHA" 
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : loan.loanType === "VA"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : loan.loanType === "Jumbo"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {loan.loanType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{loan.borrower}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{loan.propertyState}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          loan.status === "Approved" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : loan.status === "Denied"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : loan.status === "In Underwriting"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : loan.status === "Conditional Approval"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <SLABadge daysUntilSLA={loan.daysUntilSLA} />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        ${loan.loanAmount?.toLocaleString() || '0'}
                      </td>
                    </tr>
                    {expandedId === loan.id && Array.isArray(loan.lineItems) && loan.lineItems.length > 0 && (
                      <tr key={`${loan.id}-lines`} className="bg-gray-50/60 dark:bg-gray-900/60">
                        <td colSpan={HEADERS.length} className="px-6 pb-4 pt-0">
                          <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Line</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Description</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
                                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                                {loan.lineItems.map((li) => (
                                  <tr
                                    key={li.lineId}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelect?.(loan);
                                    }}
                                  >
                                    <td className="px-2 py-1 font-medium text-gray-800 dark:text-gray-100">{li.lineId}</td>
                                    <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.description}</td>
                                    <td className="px-2 py-1 text-gray-700 dark:text-gray-300">${li.amount?.toLocaleString() || '0'}</td>
                                    <td className="px-2 py-1">
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        li.status === "Approved"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                          : li.status === "Rejected"
                                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                      }`}>
                                        {li.status}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total} loans
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

