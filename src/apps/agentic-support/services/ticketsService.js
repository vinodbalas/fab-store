/**
 * Tickets Service
 * Manages storage and retrieval of tickets created by AI workflows
 */

const STORAGE_KEY = "agenticSupport.tickets";

// Rich mock data so Watchtower and Executive Dashboard always have something meaningful to show
const MOCK_TICKETS = (() => {
  const base = [
    {
      id: "INC-1042",
      ticketId: "INC-1042",
      ticketUrl: "https://servicenow.example.com/incident.do?sys_id=INC1042",
      ticketSystem: "servicenow",
      workflow: "printer_offline",
      category: "Printer Offline on Floor 3",
      interactionText: "Our floor 3 printer is offline and nothing is printing before a client meeting.",
      detectedDevice: "printer",
      status: "resolved",
      diagnosis: { root_cause: "Network queue stuck on floor 3 print server" },
      actions: [
        { name: "Restarted print spooler service" },
        { name: "Flushed pending jobs" },
      ],
      escalationReason: null,
      knowledgeBase: "Printer_Guide.pdf p.12-15",
    },
    {
      id: "INC-1043",
      ticketId: "INC-1043",
      ticketUrl: "https://jira.example.com/browse/IT-4321",
      ticketSystem: "jira",
      workflow: "ink_error",
      category: "Genuine Ink Not Recognized",
      interactionText: "Device shows cyan cartridge not recognized even though it is genuine.",
      detectedDevice: "printer",
      status: "escalated",
      diagnosis: { root_cause: "Firmware version below minimum for new cartridge batch" },
      actions: [
        { name: "Validated cartridge authenticity" },
        { name: "Checked firmware version against catalog" },
      ],
      escalationReason: "Firmware update requires maintenance window approval",
      knowledgeBase: "Ink_Error_Resolution.pdf p.8-10",
    },
    {
      id: "INC-1044",
      ticketId: "INC-1044",
      ticketUrl: "",
      ticketSystem: "zendesk",
      workflow: "printer_offline",
      category: "Store Printer Slow",
      interactionText: "Retail store printer is extremely slow when printing invoices.",
      detectedDevice: "printer",
      status: "in-progress",
      diagnosis: { root_cause: "High-resolution templates and low Wi‑Fi signal" },
      actions: [{ name: "Collected telemetry and queued Wi‑Fi survey" }],
      escalationReason: null,
      knowledgeBase: "Printer_Performance_Playbook.pdf p.3-6",
    },
    {
      id: "INC-1045",
      ticketId: "INC-1045",
      ticketUrl: "",
      ticketSystem: "salesforce",
      workflow: "unknown",
      category: "Unknown Category",
      interactionText: "Customer laptop randomly shuts down when joining VPN.",
      detectedDevice: "laptop",
      status: "escalated",
      diagnosis: null,
      actions: [],
      escalationReason: "Pattern not seen before, needs L2 investigation",
      knowledgeBase: null,
    },
  ];

  const systems = ["servicenow", "jira", "zendesk", "salesforce"];
  const workflows = ["printer_offline", "ink_error"];
  const categories = [
    "Printer Offline on Floor 3",
    "Genuine Ink Not Recognized",
    "Store Printer Slow",
    "VPN Connection Issue",
  ];

  const items = base.map((t, idx) => ({
    ...t,
    createdAt: new Date(Date.now() - (idx + 1) * 60 * 60 * 1000).toISOString(),
    timestamp: new Date(Date.now() - (idx + 1) * 60 * 60 * 1000).toISOString(),
  }));

  // Generate extra tickets up to ~36 total
  for (let i = 0; i < 32; i++) {
    const baseTicket = base[i % base.length];
    const num = 1100 + i;
    items.push({
      ...baseTicket,
      id: `INC-${num}`,
      ticketId: `INC-${num}`,
      ticketSystem: systems[i % systems.length],
      workflow: workflows[i % workflows.length],
      category: categories[i % categories.length],
      status: i % 5 === 0 ? "failed" : i % 4 === 0 ? "in-progress" : i % 3 === 0 ? "escalated" : "resolved",
      createdAt: new Date(Date.now() - (i + 5) * 45 * 60 * 1000).toISOString(),
      timestamp: new Date(Date.now() - (i + 5) * 45 * 60 * 1000).toISOString(),
    });
  }

  return items;
})();

/**
 * Get all tickets from storage
 * @returns {Array} Array of tickets
 */
export function getAllTickets() {
  // During SSR or tooling, fall back to mock data
  if (typeof window === "undefined") return MOCK_TICKETS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return MOCK_TICKETS;
    const parsed = JSON.parse(stored);
    // If storage is empty array, still show rich mock data for demos
    if (!Array.isArray(parsed) || parsed.length === 0) return MOCK_TICKETS;
    return parsed;
  } catch (error) {
    console.error("Failed to load tickets:", error);
    return [];
  }
}

/**
 * Save a ticket to storage
 * @param {Object} ticket - Ticket object
 */
export function saveTicket(ticket) {
  if (typeof window === "undefined") return;
  
  try {
    const tickets = getAllTickets();
    const existingIndex = tickets.findIndex(t => t.id === ticket.id);
    
    if (existingIndex >= 0) {
      tickets[existingIndex] = ticket;
    } else {
      tickets.push(ticket);
    }
    
    // Sort by created date (newest first)
    tickets.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.error("Failed to save ticket:", error);
  }
}

/**
 * Get tickets with optional filters
 * @param {Object} filters - { status, search, page, pageSize, sortKey, sortDir, fromDate, toDate }
 * @returns {Promise<{ tickets: Array, total: number, page: number, pageSize: number, totalPages: number }>}
 */
export async function getTickets(filters = {}) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let tickets = getAllTickets();
  
  // Apply status filter
  if (filters.status && filters.status !== "All") {
    tickets = tickets.filter(t => t.status === filters.status);
  }
  
  // Apply search filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    tickets = tickets.filter(t =>
      t.id?.toLowerCase().includes(q) ||
      t.workflow?.toLowerCase().includes(q) ||
      t.interactionText?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.ticketSystem?.toLowerCase().includes(q) ||
      t.ticketId?.toLowerCase().includes(q)
    );
  }
  
  // Date range filter
  if (filters.fromDate) {
    const from = new Date(filters.fromDate);
    tickets = tickets.filter((t) => new Date(t.createdAt || t.timestamp || 0) >= from);
  }
  if (filters.toDate) {
    const to = new Date(filters.toDate);
    to.setHours(23, 59, 59, 999);
    tickets = tickets.filter((t) => new Date(t.createdAt || t.timestamp || 0) <= to);
  }
  
  // Apply sorting
  const sortKey = filters.sortKey || "createdAt";
  const sortDir = filters.sortDir || "desc";
  
  tickets.sort((a, b) => {
    const A = a[sortKey];
    const B = b[sortKey];
    
    if (sortKey === "createdAt" || sortKey === "timestamp") {
      const dateA = new Date(A || 0);
      const dateB = new Date(B || 0);
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (typeof A === "number" && typeof B === "number") {
      return sortDir === "asc" ? A - B : B - A;
    }
    
    return sortDir === "asc"
      ? String(A || "").localeCompare(String(B || ""))
      : String(B || "").localeCompare(String(A || ""));
  });
  
  // Apply pagination
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    tickets: tickets.slice(start, end),
    total: tickets.length,
    page,
    pageSize,
    totalPages: Math.ceil(tickets.length / pageSize),
  };
}

/**
 * Get ticket statistics
 * @returns {Object} Statistics object
 */
export function getTicketStats() {
  const tickets = getAllTickets();
  
  return {
    total: tickets.length,
    selfHealed: tickets.filter(t => t.status === "resolved" || t.status === "self-healed").length,
    escalated: tickets.filter(t => t.status === "escalated" || t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in-progress" || t.status === "running").length,
    failed: tickets.filter(t => t.status === "failed" || t.status === "error").length,
    bySystem: tickets.reduce((acc, t) => {
      const system = t.ticketSystem || "Unknown";
      acc[system] = (acc[system] || 0) + 1;
      return acc;
    }, {}),
    byWorkflow: tickets.reduce((acc, t) => {
      const workflow = t.workflow || "unknown";
      acc[workflow] = (acc[workflow] || 0) + 1;
      return acc;
    }, {}),
  };
}

/**
 * Clear all tickets (for testing/reset)
 */
export function clearAllTickets() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

