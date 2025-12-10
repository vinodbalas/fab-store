/**
 * TP Lend SOP Data
 * Standard Operating Procedures for mortgage/loan processing
 * Based on Fannie Mae Selling Guide (November 2025)
 */

// SOP Index - maps SOP codes to SOP data
export const SOP_INDEX = {
  "SOP-501": {
    title: "SOP-501 — Under Review: Application Package Documentation",
    steps: [
      "Verify application package completeness per B1-1-01",
      "Check allowable age of credit documents and tax returns per B1-1-03",
      "Validate blanket authorization form per B1-1-02",
      "Route to initial eligibility review",
    ],
    link: "https://selling-guide.fanniemae.com/B1-1-01",
    denialCodes: [],
    documentReferences: ["B1-1-01", "B1-1-02", "B1-1-03"],
    states: ["All"],
    category: "Application Review",
    effectiveDate: "2025-11-05",
    revision: "1.0",
    totalSteps: 4,
  },
  "SOP-502": {
    title: "SOP-502 — Pending Documentation: Missing Information Handling",
    steps: [
      "Identify missing documentation per application package requirements",
      "Send documentation request to borrower with 48-hour follow-up",
      "Set reminder for documentation receipt deadline",
      "If no response within SLA, escalate to conditional approval or denial workflow",
    ],
    link: "https://selling-guide.fanniemae.com/B1-1-01",
    denialCodes: [],
    documentReferences: ["B1-1-01", "B3-3.1-02"],
    states: ["All"],
    category: "Documentation",
    effectiveDate: "2025-11-05",
    revision: "1.0",
    totalSteps: 4,
  },
  "SOP-503": {
    title: "SOP-503 — In Underwriting: Comprehensive Risk Assessment",
    steps: [
      "Run Desktop Underwriter (DU) or manual underwriting per B3-1-01 or B3-2-01",
      "Assess income per B3-3.1-01 (Employment) or B3-3.2-01 (Self-Employment)",
      "Verify assets per B3-4.1-01 (Minimum Reserves) and B3-4.2-01 (Depository Assets)",
      "Review credit assessment per B3-5.1-01 (Credit Scores) and B3-5.2-01 (Credit Reports)",
      "Calculate debt-to-income ratios per B3-6-02",
      "Assess property eligibility and valuation per B4-1.1-01 (Appraisal Requirements)",
      "Review DU findings report per B3-2-11",
      "Prepare underwriting decision recommendation",
    ],
    link: "https://selling-guide.fanniemae.com/B3-1-01",
    denialCodes: [],
    documentReferences: [
      "B3-1-01", "B3-2-01", "B3-3.1-01", "B3-3.2-01", 
      "B3-4.1-01", "B3-4.2-01", "B3-5.1-01", "B3-5.2-01", 
      "B3-6-02", "B4-1.1-01", "B3-2-11"
    ],
    states: ["All"],
    category: "Underwriting",
    effectiveDate: "2025-11-05",
    revision: "1.0",
    totalSteps: 8,
  },
  "SOP-504": {
    title: "SOP-504 — Conditional Approval: Conditions Management",
    steps: [
      "Document all conditions required for final approval",
      "Categorize conditions: Prior to Funding (PTF) or Prior to Document (PTD)",
      "Send conditional approval letter to borrower with condition checklist",
      "Set follow-up reminders for condition receipt",
      "Verify condition satisfaction per applicable SOP sections",
      "Once all conditions met, proceed to final approval",
    ],
    link: "https://selling-guide.fanniemae.com/B3-2-05",
    denialCodes: [],
    documentReferences: ["B3-2-05", "B3-2-06"],
    states: ["All"],
    category: "Conditional Approval",
    effectiveDate: "2025-11-05",
    revision: "1.0",
    totalSteps: 6,
  },
  "SOP-505": {
    title: "SOP-505 — Approved: Pre-Closing and Closing Preparation",
    steps: [
      "Verify all conditions satisfied and documentation complete",
      "Order title insurance per B7-2-01",
      "Verify property and flood insurance per B7-3-01 and B7-3-06",
      "Prepare closing documents per B8-2-01 (Security Instruments) and B8-3-01 (Notes)",
      "Schedule closing date and coordinate with all parties",
      "Complete final pre-closing quality check",
      "Proceed to closing and funding",
    ],
    link: "https://selling-guide.fanniemae.com/B8-1-01",
    denialCodes: [],
    documentReferences: [
      "B7-2-01", "B7-3-01", "B7-3-06", 
      "B8-2-01", "B8-3-01", "B8-1-01"
    ],
    states: ["All"],
    category: "Approval",
    effectiveDate: "2025-11-05",
    revision: "1.0",
    totalSteps: 7,
  },
  "SOP-506": {
    title: "SOP-506 — Denied: Denial Process and Documentation",
    steps: [
      "Document specific denial reasons per DU recommendations (B3-2-06) or manual underwriting findings",
      "Review denial rationale with underwriting manager",
      "Prepare adverse action notice per regulatory requirements",
      "Send denial letter to borrower with explanation of reasons",
      "Provide borrower with information on appeal process if applicable",
      "File denial documentation in loan file",
    ],
    link: "https://selling-guide.fanniemae.com/B3-2-06",
    denialCodes: [],
    documentReferences: ["B3-2-06", "B3-1-01"],
    states: ["All"],
    category: "Denial",
    effectiveDate: "2025-11-05",
    revision: "1.0",
    totalSteps: 6,
  },
};

// Scenario-specific SOPs
export const SCENARIO_SOPS = {
  "low-credit-score": {
    title: "SOP — Low Credit Score Underwriting",
    state: "All",
    page: "B3-5.1-01",
    steps: [
      "Review credit score determination per B3-5.1-01 and B3-5.1-02",
      "Assess nontraditional credit options per B3-5.4-01 if applicable",
      "Evaluate extenuating circumstances per B3-5.3-08",
      "Consider alternative qualification paths per loan program requirements",
      "Document rationale for approval or denial",
    ],
    denialCodes: [],
    documentReferences: ["B3-5.1-01", "B3-5.1-02", "B3-5.4-01", "B3-5.3-08"],
    link: "https://selling-guide.fanniemae.com/B3-5.1-01",
  },
  "high-dti": {
    title: "SOP — High Debt-to-Income Ratio Assessment",
    state: "All",
    page: "B3-6-02",
    steps: [
      "Calculate front-end and back-end DTI per B3-6-02",
      "Review compensating factors per comprehensive risk assessment (B3-1-01)",
      "Assess residual income if applicable",
      "Consider loan program-specific DTI limits",
      "Document approval rationale or denial reasons",
    ],
    denialCodes: [],
    documentReferences: ["B3-6-02", "B3-1-01"],
    link: "https://selling-guide.fanniemae.com/B3-6-02",
  },
  "self-employed": {
    title: "SOP — Self-Employed Borrower Underwriting",
    state: "All",
    page: "B3-3.2-01",
    steps: [
      "Review self-employment documentation per B3-3.2-01",
      "Analyze business structure per B3-3.2-02",
      "Review individual tax returns per B3-3.3-01 through B3-3.3-07",
      "Analyze business returns per B3-3.4-01 through B3-3.4-04 if applicable",
      "Calculate qualifying income using appropriate methodology",
      "Verify business stability and continuity",
    ],
    denialCodes: [],
    documentReferences: [
      "B3-3.2-01", "B3-3.2-02", "B3-3.3-01", "B3-3.3-07",
      "B3-3.4-01", "B3-3.4-04"
    ],
    link: "https://selling-guide.fanniemae.com/B3-3.2-01",
  },
  "appraisal-issues": {
    title: "SOP — Appraisal Review and Issues Resolution",
    state: "All",
    page: "B4-1.3-01",
    steps: [
      "Review appraisal report per B4-1.3-01",
      "Verify appraisal age and use requirements per B4-1.2-04",
      "Assess property condition per B4-1.3-06",
      "Review comparable sales per B4-1.3-08",
      "If appraisal issues identified, request clarification or new appraisal per B4-1.1-02",
      "Document resolution or proceed with value acceptance if applicable per B4-1.4-10",
    ],
    denialCodes: [],
    documentReferences: [
      "B4-1.3-01", "B4-1.2-04", "B4-1.3-06", 
      "B4-1.3-08", "B4-1.1-02", "B4-1.4-10"
    ],
    link: "https://selling-guide.fanniemae.com/B4-1.3-01",
  },
  "dti-bankruptcy-single": {
    title: "SOP — DTI Assessment with Prior Single Bankruptcy (B3-6-02, B3-5.3-07)",
    state: "All",
    page: "B3-6-02, B3-5.3-07",
    steps: [
      "Verify bankruptcy waiting period per B3-5.3-07: Single bankruptcy requires 4-year waiting period from discharge/dismissal date",
      "Confirm bankruptcy discharge or dismissal date from credit report and court documents",
      "If bankruptcy occurred more than 4 years ago, proceed with DTI assessment per B3-6-02",
      "Calculate front-end DTI: (Monthly Housing Payment) / Monthly Income",
      "Calculate back-end DTI: (Total Monthly Obligations) / Monthly Income",
      "Review maximum DTI ratios per loan program (typically 28% front-end, 36% back-end for conventional, higher with compensating factors)",
      "Assess compensating factors if DTI exceeds standard limits: strong credit re-establishment, significant reserves, stable employment/income",
      "For self-employed borrowers: Verify business stability (2+ years) and income documentation per B3-3.2-01",
      "Document credit re-establishment since bankruptcy: on-time payments, no new derogatory events",
      "If all criteria met and DTI within acceptable limits, approve with appropriate loan amount",
      "If DTI too high, consider: reducing loan amount, increasing down payment, or denial with specific rationale",
    ],
    denialCodes: [],
    documentReferences: ["B3-6-02", "B3-5.3-07", "B3-3.2-01", "B3-1-01"],
    link: "https://selling-guide.fanniemae.com/B3-6-02",
  },
  "dti-bankruptcy-multiple": {
    title: "SOP — DTI Assessment with Multiple Bankruptcy Filings (B3-6-02, B3-5.3-07)",
    state: "All",
    page: "B3-6-02, B3-5.3-07",
    steps: [
      "Verify multiple bankruptcy waiting period per B3-5.3-07: Multiple bankruptcies within past 7 years require 5-year waiting period from most recent discharge/dismissal",
      "Confirm all bankruptcy discharge/dismissal dates from credit report and court documents",
      "Identify the most recent bankruptcy filing date",
      "If most recent bankruptcy occurred more than 5 years ago, proceed with enhanced DTI assessment",
      "Calculate front-end and back-end DTI per B3-6-02 with stricter scrutiny",
      "Review maximum DTI ratios - may require lower DTI thresholds due to multiple bankruptcy history",
      "Require strong compensating factors: excellent credit re-establishment (24+ months), substantial reserves (6+ months), stable income history",
      "For self-employed: Require 3+ years business stability and comprehensive income documentation per B3-3.2-01",
      "Document detailed credit re-establishment: consistent on-time payments, no new derogatory events, improving credit score trend",
      "Assess extenuating circumstances that led to bankruptcies per B3-5.3-08",
      "If criteria met with strong compensating factors, approve with conservative loan amount and terms",
      "If insufficient compensating factors or DTI concerns, consider conditional approval with additional requirements or denial",
    ],
    denialCodes: [],
    documentReferences: ["B3-6-02", "B3-5.3-07", "B3-3.2-01", "B3-5.3-08", "B3-1-01"],
    link: "https://selling-guide.fanniemae.com/B3-6-02",
  },
};

// Helper functions
export const getSOPByScenario = (scenario) => {
  return SCENARIO_SOPS[scenario] || null;
};

export const getSOPByStatus = (status) => {
  // Map loan status to relevant SOPs
  const statusMap = {
    "Under Review": "SOP-501",
    "Pending Documentation": "SOP-502",
    "In Underwriting": "SOP-503",
    "Conditional Approval": "SOP-504",
    "Approved": "SOP-505",
    "Denied": "SOP-506",
  };
  const sopCode = statusMap[status];
  return sopCode ? SOP_INDEX[sopCode] : null;
};

export const getApplicableSOPsForLoan = (loan) => {
  const sops = [];
  
  // Add status-based SOP
  const statusSOP = getSOPByStatus(loan.status);
  if (statusSOP) {
    sops.push(statusSOP);
  }
  
  // Add scenario-based SOP if present
  if (loan.scenario) {
    const scenarioSOP = getSOPByScenario(loan.scenario);
    if (scenarioSOP) {
      sops.push(scenarioSOP);
    }
  }
  
  return sops;
};

export const getSOPByCode = (code) => {
  return SOP_INDEX[code] || null;
};

export const getSOPsByState = (state) => {
  // Return state-specific SOPs if any
  return Object.values(SOP_INDEX).filter(sop => 
    sop.states && sop.states.includes(state)
  );
};

export const getSOPByDenialCode = (denialCode) => {
  // Map denial codes to SOPs (can be expanded based on Fannie Mae denial codes)
  const denialCodeMap = {
    // Add specific denial codes as needed
  };
  return denialCodeMap[denialCode] ? SOP_INDEX[denialCodeMap[denialCode]] : null;
};
