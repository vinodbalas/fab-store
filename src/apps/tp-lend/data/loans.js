/**
 * TP Lend Mock Data
 * Realistic mortgage/loan applications dataset for development and testing
 */

// Helper function to generate dates
const generateDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Borrowers pool
const borrowers = [
  "Michael Chen", "Sarah Johnson", "David Martinez", "Emily Rodriguez", "James Wilson",
  "Jennifer Lee", "Robert Brown", "Amanda Davis", "Christopher Taylor", "Jessica Anderson",
  "Daniel Thomas", "Ashley Jackson", "Matthew White", "Lauren Harris", "Andrew Martin",
  "Nicole Thompson", "Joshua Garcia", "Stephanie Martinez", "Kevin Robinson", "Michelle Clark",
  "Ryan Lewis", "Kimberly Walker", "Brandon Hall", "Rachel Young", "Justin King",
  "Samantha Wright", "Tyler Lopez", "Brittany Hill", "Jordan Green", "Megan Adams",
];

// Property types
const propertyTypes = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Unit",
  "Investment Property",
];

// Loan types
const loanTypes = [
  "Conventional",
  "FHA",
  "VA",
  "USDA",
  "Jumbo",
];

// Property states
const propertyStates = ["TX", "CA", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "MI"];

// Generate realistic loan amounts
const generateLoanAmount = () => {
  const rand = Math.random();
  if (rand < 0.3) return Math.floor(Math.random() * 200000) + 150000; // $150K-$350K (30%)
  if (rand < 0.6) return Math.floor(Math.random() * 250000) + 350000; // $350K-$600K (30%)
  if (rand < 0.85) return Math.floor(Math.random() * 400000) + 600000; // $600K-$1M (25%)
  return Math.floor(Math.random() * 1000000) + 1000000; // $1M-$2M (15%)
};

// Generate application dates
const generateApplicationDate = (index) => {
  const rand = Math.random();
  if (rand < 0.3) {
    return generateDate(Math.floor(Math.random() * 7)); // Last 7 days (30%)
  } else if (rand < 0.6) {
    return generateDate(Math.floor(Math.random() * 23) + 7); // 7-30 days (30%)
  } else if (rand < 0.85) {
    return generateDate(Math.floor(Math.random() * 30) + 30); // 30-60 days (25%)
  } else {
    return generateDate(Math.floor(Math.random() * 30) + 60); // 60-90 days (15%)
  }
};

// Calculate SLA deadline (typically 30-45 days for mortgage processing)
const calculateSLA = (applicationDate) => {
  const appDate = new Date(applicationDate);
  const daysToAdd = 30 + Math.floor(Math.random() * 15); // 30-45 days
  appDate.setDate(appDate.getDate() + daysToAdd);
  return appDate.toISOString().split('T')[0];
};

// Generate loans with realistic distribution
export const LOANS = Array.from({ length: 100 }, (_, index) => {
  const loanId = `LND-${String(index + 1).padStart(3, '0')}`;
  const loanNumber = `2025-${loanId}`;
  
  // Determine loan type
  const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
  
  // Realistic status distribution
  const statusRand = Math.random();
  let status;
  if (statusRand < 0.25) {
    status = "Under Review"; // 25%
  } else if (statusRand < 0.5) {
    status = "Pending Documentation"; // 25%
  } else if (statusRand < 0.7) {
    status = "In Underwriting"; // 20%
  } else if (statusRand < 0.85) {
    status = "Conditional Approval"; // 15%
  } else if (statusRand < 0.95) {
    status = "Approved"; // 10%
  } else {
    status = "Denied"; // 5%
  }
  
  const applicationDate = generateApplicationDate(index);
  const slaDeadline = calculateSLA(applicationDate);
  const slaDate = new Date(slaDeadline);
  const today = new Date();
  const daysUntilSLA = Math.ceil((slaDate - today) / (1000 * 60 * 60 * 24));
  
  const loanAmount = generateLoanAmount();
  const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const propertyState = propertyStates[Math.floor(Math.random() * propertyStates.length)];
  
  // Generate line items (loan components)
  const numLineItems = Math.floor(Math.random() * 5) + 1; // 1-5 line items
  const lineItems = Array.from({ length: numLineItems }, (_, liIdx) => ({
    lineId: `LI-${liIdx + 1}`,
    description: [
      "Principal Amount",
      "Interest Rate Lock",
      "Property Appraisal",
      "Title Insurance",
      "Origination Fee",
      "Credit Report",
      "Flood Certification",
      "Tax Service",
    ][liIdx % 8],
    amount: liIdx === 0 ? loanAmount * 0.95 : Math.floor(Math.random() * 5000) + 500,
    status: ["Pending", "Approved", "Conditional", "Rejected"][Math.floor(Math.random() * 4)],
    daysUntilDeadline: daysUntilSLA - Math.floor(Math.random() * 10),
    scenario: null,
    documentReferences: [],
  }));
  
  // AI priority based on amount, status, and SLA
  let aiPriority = 5.0;
  if (loanAmount > 1000000) aiPriority += 1.5;
  if (status === "Pending Documentation" || status === "Under Review") aiPriority += 0.5;
  if (daysUntilSLA < 7 && daysUntilSLA >= 0) aiPriority += 1.0;
  if (daysUntilSLA < 0) aiPriority += 2.0;
  if (loanType === "Jumbo") aiPriority += 0.5;
  aiPriority = Math.min(10, Math.max(1, aiPriority));
  
  return {
    id: loanId,
    loanNumber,
    borrower: borrowers[index % borrowers.length],
    loanType,
    propertyType,
    propertyState,
    loanAmount,
    applicationDate,
    slaDeadline,
    daysUntilSLA,
    status,
    lineItems,
    aiPriority: parseFloat(aiPriority.toFixed(1)),
    aiRiskLevel: aiPriority >= 8 ? 'high' : aiPriority >= 6 ? 'medium' : 'low',
  };
});

// Scenario loans for specific demos
export const SCENARIO_LOANS = [
  /**
   * John Doe Case - DTI with Single Bankruptcy
   * 
   * Borrower: John Doe, Self-employed (Vehicle Repair Shop, 10 years in business)
   * Loan Request: $200,000 for primary residence purchase
   * Monthly Income: $10,000
   * Monthly Housing Payment: $1,564 (P&I + Taxes + Insurance)
   * Monthly Debt Obligations: $500 (credit card minimums)
   * 
   * DTI Analysis:
   * - Front-End DTI: 15.64% (excellent, well below 28% standard)
   * - Back-End DTI: 20.64% (excellent, well below 36% standard)
   * 
   * Bankruptcy History:
   * - Single Chapter 7 bankruptcy, discharged 8 years ago
   * - Waiting period required: 4 years
   * - Waiting period satisfied: YES (8 years > 4 years)
   * 
   * Credit Re-establishment:
   * - 96 months since bankruptcy
   * - Current credit score: 680
   * - On-time payments: Yes
   * - No new derogatory events: Yes
   * 
   * Expected Recommendation: APPROVED for $200,000
   * Pending: Business income documentation (tax returns, P&L), final credit verification
   * 
   * Reference SOPs: B3-6-02 (Debt-to-Income Ratios), B3-5.3-07 (Bankruptcy Waiting Periods), B3-3.2-01 (Self-Employed Income)
   */
  {
    id: "LND-DTI-BK-001",
    loanNumber: "2025-LND-DTI-BK-001",
    borrower: "John Doe",
    loanType: "Conventional",
    propertyType: "Single Family",
    propertyState: "TX",
    loanAmount: 200000,
    applicationDate: generateDate(5),
    slaDeadline: calculateSLA(generateDate(5)),
    daysUntilSLA: 28,
    status: "In Underwriting",
    scenario: "dti-bankruptcy-single",
    lineItems: [
      {
        lineId: "LI-1",
        description: "Principal Amount",
        amount: 190000,
        status: "Approved",
        daysUntilDeadline: 28,
        scenario: null,
        documentReferences: [],
      },
      {
        lineId: "LI-2",
        description: "Property Appraisal",
        amount: 500,
        status: "Pending",
        daysUntilDeadline: 25,
        scenario: null,
        documentReferences: [],
      },
      {
        lineId: "LI-3",
        description: "Title Insurance",
        amount: 1200,
        status: "Pending",
        daysUntilDeadline: 20,
        scenario: null,
        documentReferences: [],
      },
    ],
    aiPriority: 7.5,
    aiRiskLevel: "medium",
    // Additional scenario-specific data
    monthlyIncome: 10000,
    monthlyHousingPayment: 1564, // P&I + Taxes + Insurance
    monthlyDebtObligations: 500, // Credit card minimum payments
    frontEndDTI: 15.64, // (1564 / 10000) * 100
    backEndDTI: 20.64, // ((1564 + 500) / 10000) * 100
    bankruptcyHistory: {
      count: 1,
      mostRecentDischargeDate: generateDate(2920), // 8 years ago
      type: "Chapter 7",
      waitingPeriodRequired: 4, // years
      waitingPeriodSatisfied: true, // 8 years > 4 years required
    },
    employmentType: "Self-Employed",
    businessType: "Vehicle Repair Shop",
    businessYearsInOperation: 10,
    creditReestablishment: {
      monthsSinceBankruptcy: 96, // 8 years
      currentCreditScore: 680,
      onTimePayments: true,
      noNewDerogatoryEvents: true,
    },
  },
  {
    id: "LND-DTI-BK-002",
    loanNumber: "2025-LND-DTI-BK-002",
    borrower: "Jane Smith",
    loanType: "Conventional",
    propertyType: "Single Family",
    propertyState: "CA",
    loanAmount: 350000,
    applicationDate: generateDate(3),
    slaDeadline: calculateSLA(generateDate(3)),
    daysUntilSLA: 30,
    status: "In Underwriting",
    scenario: "dti-bankruptcy-multiple",
    lineItems: [
      {
        lineId: "LI-1",
        description: "Principal Amount",
        amount: 332500,
        status: "Approved",
        daysUntilDeadline: 30,
        scenario: null,
        documentReferences: [],
      },
      {
        lineId: "LI-2",
        description: "Property Appraisal",
        amount: 500,
        status: "Pending",
        daysUntilDeadline: 27,
        scenario: null,
        documentReferences: [],
      },
    ],
    aiPriority: 8.5,
    aiRiskLevel: "high",
    // Additional scenario-specific data
    monthlyIncome: 12000,
    monthlyHousingPayment: 2737, // P&I + Taxes + Insurance
    monthlyDebtObligations: 800, // Credit card + auto loan
    frontEndDTI: 22.81, // (2737 / 12000) * 100
    backEndDTI: 29.48, // ((2737 + 800) / 12000) * 100
    bankruptcyHistory: {
      count: 2,
      mostRecentDischargeDate: generateDate(2190), // 6 years ago
      type: "Chapter 7 (both)",
      waitingPeriodRequired: 5, // years for multiple
      waitingPeriodSatisfied: true, // 6 years > 5 years required
    },
    employmentType: "W-2 Employee",
    businessType: null,
    businessYearsInOperation: null,
    creditReestablishment: {
      monthsSinceBankruptcy: 72, // 6 years
      currentCreditScore: 695,
      onTimePayments: true,
      noNewDerogatoryEvents: true,
      substantialReserves: true, // 8 months reserves
    },
  },
];

// Combine and export
export const ALL_LOANS = [...LOANS, ...SCENARIO_LOANS].sort((a, b) => 
  new Date(b.applicationDate) - new Date(a.applicationDate)
);

