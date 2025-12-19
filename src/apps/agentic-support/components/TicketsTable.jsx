import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getTickets } from "../services/ticketsService";
import { Loader2, AlertCircle, RefreshCw, Sparkles, BookOpen, ExternalLink, Cloud, FileText } from "lucide-react";

const HEADERS = [
  { key: "id", label: "TICKET ID" },
  { key: "workflow", label: "WORKFLOW" },
  { key: "category", label: "CATEGORY" },
  { key: "interactionText", label: "COMPLAINT DESCRIPTION" },
  { key: "status", label: "STATUS" },
  { key: "ticketSystem", label: "TICKETING SYSTEM" },
  { key: "createdAt", label: "CREATED ON" },
  { key: "knowledgeBase", label: "KNOWLEDGE BASE" },
];

const STATUS_FILTERS = ["All", "resolved", "escalated", "in-progress", "failed"];

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    resolved: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Resolved" },
    "self-healed": { color: "bg-green-100 text-green-700 border-green-200", label: "Self-Healed" },
    escalated: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Escalated" },
    "in-progress": { color: "bg-blue-100 text-blue-700 border-blue-200", label: "In Progress" },
    running: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Running" },
    failed: { color: "bg-red-100 text-red-700 border-red-200", label: "Failed" },
    error: { color: "bg-red-100 text-red-700 border-red-200", label: "Error" },
  };
  
  const config = statusConfig[status] || { color: "bg-gray-100 text-gray-700 border-gray-200", label: status || "Unknown" };
  
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}

// Ticketing System badge
function SystemBadge({ system }) {
  if (!system) return <span className="text-gray-400 text-xs">—</span>;
  
  const systemNames = {
    servicenow: "ServiceNow",
    jira: "Jira",
    zendesk: "Zendesk",
    salesforce: "Salesforce",
  };
  
  const displayName = systemNames[system.toLowerCase()] || system;
  
  return (
    <div className="flex items-center gap-1.5">
      <Cloud className="w-3.5 h-3.5 text-gray-500" />
      <span className="text-xs font-medium text-gray-700">{displayName}</span>
    </div>
  );
}

// Knowledge Base badge
function KnowledgeBaseBadge({ knowledgeBase }) {
  if (!knowledgeBase) return <span className="text-gray-400 text-xs">—</span>;
  
  return (
    <div className="flex items-center gap-1.5">
      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
      <span className="text-xs text-gray-700 truncate max-w-[120px]" title={knowledgeBase}>
        {typeof knowledgeBase === "string" ? knowledgeBase : "Referenced"}
      </span>
    </div>
  );
}

export default function TicketsTable({ onSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [expandedId, setExpandedId] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // API state
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length === 0 || trimmed.length >= 3) {
      const timer = setTimeout(() => {
        setSearch(trimmed);
        setPage(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchInput]);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTickets({
        status: status === "All" ? null : status,
        search: search || null,
        page,
        pageSize,
        sortKey,
        sortDir,
        fromDate: fromDate || null,
        toDate: toDate || null,
      });
      setTickets(result.tickets);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [status, search, page, pageSize, sortKey, sortDir, fromDate, toDate]);

  // Fetch tickets when filters change
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + 
             " " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Status Tabs, Date Filters and Search */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
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

        {/* Date range + Search */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            disabled={loading}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs disabled:opacity-50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#612D91]/40 dark:focus:ring-[#A64AC9]/40"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            disabled={loading}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs disabled:opacity-50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#612D91]/40 dark:focus:ring-[#A64AC9]/40"
          />
          <input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by ID, Workflow, Category, System (min 3 chars)"
            disabled={loading}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 text-sm w-64 disabled:opacity-50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#612D91]/50 dark:focus:ring-[#A64AC9]/50"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error loading tickets</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && tickets.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#612D91] dark:text-[#A64AC9]" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading tickets...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No tickets found</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {search || status !== "All"
              ? "Try adjusting your filters or search terms"
              : "Tickets will appear here once AI workflows create them"}
          </p>
        </div>
      )}

      {/* Tickets Table */}
      {!loading && tickets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {HEADERS.map((header) => (
                  <th
                    key={header.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => toggleSort(header.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.label}
                      {sortKey === header.key && (
                        <span className="text-[#612D91] dark:text-[#A64AC9]">
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <tr
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                      expandedId === ticket.id ? "bg-purple-50 dark:bg-purple-900/10" : ""
                    }`}
                    onClick={() => {
                      setExpandedId(expandedId === ticket.id ? null : ticket.id);
                      onSelect?.(ticket);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {ticket.ticketId || ticket.id}
                        </span>
                        {ticket.ticketUrl && (
                          <a
                            href={ticket.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#612D91] dark:text-[#A64AC9] hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {ticket.workflow || "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {ticket.category || "—"}
                      </span>
                    </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      {ticket.interactionText || "—"}
                    </span>
                  </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3">
                      <SystemBadge system={ticket.ticketSystem} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(ticket.createdAt || ticket.timestamp)}
                      </span>
                    </td>
                  <td className="px-4 py-3">
                    <KnowledgeBaseBadge knowledgeBase={ticket.knowledgeBase} />
                  </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(expandedId === ticket.id ? null : ticket.id);
                        }}
                        className="text-xs text-[#612D91] dark:text-[#A64AC9] hover:underline font-medium"
                      >
                        {expandedId === ticket.id ? "Hide" : "View"} Details
                      </button>
                    </td>
                  </tr>
                  {expandedId === ticket.id && (
                    <tr>
                      <td colSpan={HEADERS.length + 1} className="px-4 py-4 bg-gray-50 dark:bg-gray-800/30">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Customer Issue:</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{ticket.interactionText || "—"}</p>
                          </div>
                          {ticket.detectedDevice && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Detected Device:</p>
                              <p className="text-sm text-gray-900 dark:text-gray-100 capitalize">{ticket.detectedDevice}</p>
                            </div>
                          )}
                          {ticket.diagnosis && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">AI Diagnosis:</p>
                              <p className="text-sm text-gray-900 dark:text-gray-100">{ticket.diagnosis.root_cause || ticket.diagnosis}</p>
                            </div>
                          )}
                          {ticket.escalationReason && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Escalation Reason:</p>
                              <p className="text-sm text-gray-900 dark:text-gray-100">{ticket.escalationReason}</p>
                            </div>
                          )}
                          {ticket.actions && ticket.actions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Actions Taken:</p>
                              <ul className="list-disc list-inside text-sm text-gray-900 dark:text-gray-100 space-y-1">
                                {ticket.actions.map((action, idx) => (
                                  <li key={idx}>{action.name || action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer: counts, refresh, pagination */}
      {!loading && total > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <span>Showing {tickets.length} of {total} tickets</span>
            {totalPages > 1 && (
              <span className="sm:inline hidden text-gray-400">•</span>
            )}
            {totalPages > 1 && (
              <span>Page {page} of {totalPages}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

