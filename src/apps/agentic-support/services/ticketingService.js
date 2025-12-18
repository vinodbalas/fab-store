/**
 * Ticketing System Integration Service
 * Supports multiple ITSM/CRM platforms: ServiceNow, Jira, Zendesk, Salesforce, etc.
 */

// Ticketing system configuration (in production, this would come from settings/API)
const TICKETING_CONFIG = {
  system: localStorage.getItem("agenticSupport.ticketingSystem") || "servicenow", // servicenow, jira, zendesk, salesforce
  servicenow: {
    instance: localStorage.getItem("agenticSupport.servicenow.instance") || "https://your-instance.service-now.com",
    username: localStorage.getItem("agenticSupport.servicenow.username") || "",
    password: localStorage.getItem("agenticSupport.servicenow.password") || "",
    table: "incident",
  },
  jira: {
    instance: localStorage.getItem("agenticSupport.jira.instance") || "https://your-domain.atlassian.net",
    email: localStorage.getItem("agenticSupport.jira.email") || "",
    apiToken: localStorage.getItem("agenticSupport.jira.apiToken") || "",
    projectKey: localStorage.getItem("agenticSupport.jira.projectKey") || "IT",
  },
  zendesk: {
    instance: localStorage.getItem("agenticSupport.zendesk.instance") || "https://your-domain.zendesk.com",
    email: localStorage.getItem("agenticSupport.zendesk.email") || "",
    apiToken: localStorage.getItem("agenticSupport.zendesk.apiToken") || "",
  },
  salesforce: {
    instance: localStorage.getItem("agenticSupport.salesforce.instance") || "https://your-instance.salesforce.com",
    accessToken: localStorage.getItem("agenticSupport.salesforce.accessToken") || "",
    objectType: "Case",
  },
};

/**
 * Create a ticket in the configured ticketing system
 * @param {Object} ticketData - Ticket data including interaction, telemetry, diagnosis, etc.
 * @param {string} systemOverride - Optional system override (servicenow, jira, zendesk, salesforce)
 * @returns {Promise<Object>} Created ticket information
 */
export async function createTicket(ticketData, systemOverride = null) {
  const system = systemOverride || TICKETING_CONFIG.system;
  
  switch (system) {
    case "servicenow":
      return await createServiceNowTicket(ticketData);
    case "jira":
      return await createJiraTicket(ticketData);
    case "zendesk":
      return await createZendeskTicket(ticketData);
    case "salesforce":
      return await createSalesforceTicket(ticketData);
    default:
      throw new Error(`Unsupported ticketing system: ${system}`);
  }
}

/**
 * ServiceNow Integration
 * Creates an incident via ServiceNow REST API
 */
async function createServiceNowTicket(ticketData) {
  const config = TICKETING_CONFIG.servicenow;
  const { interactionText, telemetry, diagnosis, escalationReason, ticketId } = ticketData;

  // Build ServiceNow incident payload
  const incidentPayload = {
    short_description: escalationReason || "Agentic Support Escalation",
    description: buildServiceNowDescription(interactionText, telemetry, diagnosis, escalationReason),
    urgency: determineUrgency(diagnosis),
    impact: "3", // Medium impact
    category: "Inquiry / Help",
    subcategory: "Technical Support",
    assignment_group: "IT Support",
    caller_id: "agentic-support@company.com",
    work_notes: `Auto-created by Agentic Support System\n\nTelemetry: ${JSON.stringify(telemetry, null, 2)}\nDiagnosis: ${JSON.stringify(diagnosis, null, 2)}`,
    // Custom fields for agentic context
    u_agentic_workflow: diagnosis?.workflow || "unknown",
    u_agentic_confidence: diagnosis?.confidence || 0,
    u_agentic_interaction: interactionText,
  };

  // In production, make actual API call:
  /*
  const auth = btoa(`${config.username}:${config.password}`);
  const response = await fetch(`${config.instance}/api/now/table/${config.table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify(incidentPayload),
  });
  
  if (!response.ok) {
    throw new Error(`ServiceNow API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return {
    ticketId: result.result.number,
    sysId: result.result.sys_id,
    url: `${config.instance}/nav_to.do?uri=incident.do?sys_id=${result.result.sys_id}`,
    system: "servicenow",
  };
  */

  // Mock response for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ticketId: ticketId || `INC${Math.floor(1000000 + Math.random() * 9000000)}`,
        sysId: `mock-sys-id-${Date.now()}`,
        url: `${config.instance}/nav_to.do?uri=incident.do?sys_id=mock-sys-id`,
        system: "servicenow",
        apiResponse: {
          status: 201,
          message: "Incident created successfully",
          payload: incidentPayload,
        },
      });
    }, 1500); // Simulate API delay
  });
}

/**
 * Jira Integration
 * Creates an issue via Jira REST API
 */
async function createJiraTicket(ticketData) {
  const config = TICKETING_CONFIG.jira;
  const { interactionText, telemetry, diagnosis, escalationReason, ticketId } = ticketData;

  const issuePayload = {
    fields: {
      project: { key: config.projectKey },
      summary: escalationReason || "Agentic Support Escalation",
      description: buildJiraDescription(interactionText, telemetry, diagnosis, escalationReason),
      issuetype: { name: "Incident" },
      priority: { name: determineJiraPriority(diagnosis) },
      labels: ["agentic-support", "auto-created"],
      // Custom fields
      customfield_10000: diagnosis?.workflow || "unknown", // Example custom field
    },
  };

  // In production, make actual API call:
  /*
  const auth = btoa(`${config.email}:${config.apiToken}`);
  const response = await fetch(`${config.instance}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify(issuePayload),
  });
  
  if (!response.ok) {
    throw new Error(`Jira API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return {
    ticketId: result.key,
    id: result.id,
    url: `${config.instance}/browse/${result.key}`,
    system: "jira",
  };
  */

  // Mock response for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ticketId: ticketId || `${config.projectKey}-${Math.floor(1000 + Math.random() * 9000)}`,
        id: `mock-jira-id-${Date.now()}`,
        url: `${config.instance}/browse/${ticketId || "IT-1234"}`,
        system: "jira",
        apiResponse: {
          status: 201,
          message: "Issue created successfully",
          payload: issuePayload,
        },
      });
    }, 1500);
  });
}

/**
 * Zendesk Integration
 * Creates a ticket via Zendesk REST API
 */
async function createZendeskTicket(ticketData) {
  const config = TICKETING_CONFIG.zendesk;
  const { interactionText, telemetry, diagnosis, escalationReason, ticketId } = ticketData;

  const ticketPayload = {
    ticket: {
      subject: escalationReason || "Agentic Support Escalation",
      comment: {
        body: buildZendeskDescription(interactionText, telemetry, diagnosis, escalationReason),
      },
      priority: determineZendeskPriority(diagnosis),
      type: "incident",
      tags: ["agentic-support", "auto-created"],
      custom_fields: [
        { id: 12345678, value: diagnosis?.workflow || "unknown" }, // Example custom field
      ],
    },
  };

  // In production, make actual API call:
  /*
  const auth = btoa(`${config.email}/token:${config.apiToken}`);
  const response = await fetch(`${config.instance}/api/v2/tickets.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify(ticketPayload),
  });
  
  if (!response.ok) {
    throw new Error(`Zendesk API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return {
    ticketId: result.ticket.id.toString(),
    url: `${config.instance}/agent/tickets/${result.ticket.id}`,
    system: "zendesk",
  };
  */

  // Mock response for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ticketId: ticketId || Math.floor(100000 + Math.random() * 900000).toString(),
        url: `${config.instance}/agent/tickets/${ticketId || "123456"}`,
        system: "zendesk",
        apiResponse: {
          status: 201,
          message: "Ticket created successfully",
          payload: ticketPayload,
        },
      });
    }, 1500);
  });
}

/**
 * Salesforce Integration
 * Creates a Case via Salesforce REST API
 */
async function createSalesforceTicket(ticketData) {
  const config = TICKETING_CONFIG.salesforce;
  const { interactionText, telemetry, diagnosis, escalationReason, ticketId } = ticketData;

  const casePayload = {
    Subject: escalationReason || "Agentic Support Escalation",
    Description: buildSalesforceDescription(interactionText, telemetry, diagnosis, escalationReason),
    Priority: determineSalesforcePriority(diagnosis),
    Status: "New",
    Origin: "Agentic Support System",
    Type: "Technical Support",
    // Custom fields
    Agentic_Workflow__c: diagnosis?.workflow || "unknown",
    Agentic_Confidence__c: diagnosis?.confidence || 0,
  };

  // In production, make actual API call:
  /*
  const response = await fetch(`${config.instance}/services/data/v58.0/sobjects/${config.objectType}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify(casePayload),
  });
  
  if (!response.ok) {
    throw new Error(`Salesforce API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return {
    ticketId: result.id,
    caseNumber: result.CaseNumber,
    url: `${config.instance}/lightning/r/Case/${result.id}/view`,
    system: "salesforce",
  };
  */

  // Mock response for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ticketId: ticketId || `500${Math.floor(10000000 + Math.random() * 90000000)}`,
        caseNumber: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
        url: `${config.instance}/lightning/r/Case/${ticketId || "mock-id"}/view`,
        system: "salesforce",
        apiResponse: {
          status: 201,
          message: "Case created successfully",
          payload: casePayload,
        },
      });
    }, 1500);
  });
}

// Helper functions to build descriptions for each system

function buildServiceNowDescription(interactionText, telemetry, diagnosis, escalationReason) {
  return `Agentic Support System Escalation

Customer Interaction:
${interactionText}

Escalation Reason:
${escalationReason}

Diagnostic Results:
- Workflow: ${diagnosis?.workflow || "Unknown"}
- Root Cause: ${diagnosis?.root_cause || "Not determined"}
- Confidence: ${(diagnosis?.confidence * 100 || 0).toFixed(0)}%

Telemetry Snapshot:
${JSON.stringify(telemetry, null, 2)}

This ticket was automatically created by the Agentic Support System when the workflow determined that human intervention is required.`;
}

function buildJiraDescription(interactionText, telemetry, diagnosis, escalationReason) {
  return `*Agentic Support System Escalation*

*Customer Interaction:*
${interactionText}

*Escalation Reason:*
${escalationReason}

*Diagnostic Results:*
* Workflow: ${diagnosis?.workflow || "Unknown"}
* Root Cause: ${diagnosis?.root_cause || "Not determined"}
* Confidence: ${(diagnosis?.confidence * 100 || 0).toFixed(0)}%

*Telemetry Snapshot:*
{code}
${JSON.stringify(telemetry, null, 2)}
{code}

This issue was automatically created by the Agentic Support System when the workflow determined that human intervention is required.`;
}

function buildZendeskDescription(interactionText, telemetry, diagnosis, escalationReason) {
  return `Agentic Support System Escalation

Customer Interaction:
${interactionText}

Escalation Reason:
${escalationReason}

Diagnostic Results:
- Workflow: ${diagnosis?.workflow || "Unknown"}
- Root Cause: ${diagnosis?.root_cause || "Not determined"}
- Confidence: ${(diagnosis?.confidence * 100 || 0).toFixed(0)}%

Telemetry Snapshot:
${JSON.stringify(telemetry, null, 2)}

This ticket was automatically created by the Agentic Support System when the workflow determined that human intervention is required.`;
}

function buildSalesforceDescription(interactionText, telemetry, diagnosis, escalationReason) {
  return `Agentic Support System Escalation

Customer Interaction:
${interactionText}

Escalation Reason:
${escalationReason}

Diagnostic Results:
- Workflow: ${diagnosis?.workflow || "Unknown"}
- Root Cause: ${diagnosis?.root_cause || "Not determined"}
- Confidence: ${(diagnosis?.confidence * 100 || 0).toFixed(0)}%

Telemetry Snapshot:
${JSON.stringify(telemetry, null, 2)}

This case was automatically created by the Agentic Support System when the workflow determined that human intervention is required.`;
}

// Helper functions to determine priority/urgency

function determineUrgency(diagnosis) {
  // High urgency for critical issues, medium for most escalations
  if (diagnosis?.root_cause?.toLowerCase().includes("critical") || 
      diagnosis?.root_cause?.toLowerCase().includes("outage")) {
    return "1"; // Critical
  }
  return "2"; // High
}

function determineJiraPriority(diagnosis) {
  if (diagnosis?.root_cause?.toLowerCase().includes("critical")) {
    return "Highest";
  }
  return "High";
}

function determineZendeskPriority(diagnosis) {
  if (diagnosis?.root_cause?.toLowerCase().includes("critical")) {
    return "urgent";
  }
  return "high";
}

function determineSalesforcePriority(diagnosis) {
  if (diagnosis?.root_cause?.toLowerCase().includes("critical")) {
    return "Critical";
  }
  return "High";
}

/**
 * Get available ticketing systems
 */
export function getAvailableTicketingSystems() {
  return [
    { id: "servicenow", name: "ServiceNow", icon: "🔧" },
    { id: "jira", name: "Jira", icon: "🎯" },
    { id: "zendesk", name: "Zendesk", icon: "💬" },
    { id: "salesforce", name: "Salesforce", icon: "☁️" },
  ];
}

/**
 * Get current ticketing system configuration
 */
export function getTicketingConfig() {
  return TICKETING_CONFIG;
}

/**
 * Update ticketing system configuration
 */
export function updateTicketingConfig(system, config) {
  localStorage.setItem("agenticSupport.ticketingSystem", system);
  if (config) {
    Object.keys(config).forEach((key) => {
      localStorage.setItem(`agenticSupport.${system}.${key}`, config[key]);
    });
  }
  // Reload config
  Object.assign(TICKETING_CONFIG, { system, [system]: config });
}

