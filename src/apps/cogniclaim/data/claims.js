/**
 * Cogniclaim Mock Data
 * Realistic healthcare claims dataset for development and testing
 */

// Helper function to generate dates (ensures past dates)
const generateDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Providers pool
const providers = [
  "Apex Health", "CarePlus", "MediCore", "GlobalMed",
  "Metro Healthcare", "Sunshine Medical", "City Hospital", "Regional Health",
  "Premier Medical", "Unity Health", "Wellness Clinic", "Elite Care",
  "Coastal Medical", "Summit Health", "Valley Hospital", "Pine Medical",
  "Riverside Clinic", "Oakwood Healthcare", "Harbor Medical", "Mountain View Hospital"
];

// Member names pool (diverse, realistic names)
const members = [
  "John Doe", "Sarah Lin", "Raj Patel", "Maria Gomez", "Ravi Sharma",
  "Aisha Khan", "Carlos Silva", "Lisa Wong", "Emily Clark", "Mohit Jain",
  "Ana Torres", "Jacob Lee", "Priya Reddy", "Michael Chen", "Sofia Martinez",
  "David Kim", "Nina Patel", "James Wilson", "Fatima Ali", "Robert Brown",
  "Yuki Tanaka", "Ahmed Hassan", "Emma Johnson", "Diego Rodriguez", "Mei Li",
  "Kevin O'Brien", "Samantha Taylor", "Juan Garcia", "Leila Ahmed", "Brian Thompson",
  "Chloe Williams", "Hiroshi Yamamoto", "Isabella Rossi", "Omar Farooq", "Grace Park",
  "Alexander Schmidt", "Zara Malik", "Lucas Anderson", "Amina Ibrahim", "Noah Davis",
  "Olivia Martinez", "Ethan Wright", "Maya Patel", "Benjamin Lee", "Sophia Kim",
  "Daniel Garcia", "Lily Chen", "Christopher Brown", "Ava Singh", "Matthew Jones",
  "Charlotte Wilson", "William Taylor", "Mia Anderson", "Henry Martinez", "Harper Thompson"
];

// Statuses with realistic distribution
const statuses = [
  "Pending Review", "Pending Review", "Pending Review", "Pending Review", // 40%
  "Under Process", "Under Process", "Under Process", // 30%
  "Information Needed", "Information Needed", // 20%
  "Escalated", // 10%
];

// Generate realistic claim amounts (skewed towards lower amounts, some high-value)
const generateAmount = () => {
  const rand = Math.random();
  if (rand < 0.5) return Math.floor(Math.random() * 2000) + 500; // $500-$2500 (50%)
  if (rand < 0.8) return Math.floor(Math.random() * 5000) + 2500; // $2500-$7500 (30%)
  if (rand < 0.95) return Math.floor(Math.random() * 15000) + 7500; // $7500-$22500 (15%)
  return Math.floor(Math.random() * 50000) + 22500; // $22500-$72500 (5%)
};

// Generate realistic dates (most recent 90 days)
const generateDateForClaim = (index) => {
  // Mix of recent and older claims with realistic distribution
  const rand = Math.random();
  if (rand < 0.4) {
    // Recent claims (last 7 days) - 40%
    return generateDate(Math.floor(Math.random() * 7));
  } else if (rand < 0.7) {
    // Medium recent (7-30 days) - 30%
    return generateDate(Math.floor(Math.random() * 23) + 7);
  } else if (rand < 0.9) {
    // Medium age (30-60 days) - 20%
    return generateDate(Math.floor(Math.random() * 30) + 30);
  } else {
    // Older claims (60-90 days) - 10%
    return generateDate(Math.floor(Math.random() * 30) + 60);
  }
};

// US States for claims
const states = [
  "Texas", "California", "New York", "Florida", "Illinois",
  "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan",
  "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts",
];

// Common CPT codes for different scenarios
const cptCodes = {
  surgery: ["29881", "29882", "29883", "27447", "27130", "22612", "22614", "29827"],
  physicalTherapy: ["97110", "97112", "97140", "97530", "97150"],
  emergency: ["99281", "99282", "99283", "99284", "99285"],
  diagnostic: ["70450", "72141", "73060", "77067"],
  laboratory: ["80053", "85025", "80061", "85610"],
};

// Common ICD-10 diagnosis codes
const icd10Codes = {
  musculoskeletal: ["M25.511", "M25.512", "M79.3", "M54.5", "M25.561"],
  pain: ["G89.29", "R52", "M79.3"],
  injury: ["S72.001A", "S42.001A", "S52.001A"],
  chronic: ["E11.9", "I10", "M79.3"],
};

// Revenue codes
const revenueCodes = {
  surgery: ["0450", "0451", "0452", "0459"],
  emergency: ["0450", "0451"],
  observation: ["0760", "0761", "0762"],
  inpatient: ["0100", "0101", "0102"],
};

// Generate claims with realistic distribution and medical codes
export const CLAIMS = Array.from({ length: 100 }, (_, index) => {
  const claimId = `CLM-${String(index + 1).padStart(3, '0')}`;
  
  // Realistic status distribution
  const statusRand = Math.random();
  let status;
  if (statusRand < 0.4) {
    status = "Pending Review"; // 40%
  } else if (statusRand < 0.7) {
    status = "Under Process"; // 30%
  } else if (statusRand < 0.9) {
    status = "Information Needed"; // 20%
  } else {
    status = "Escalated"; // 10%
  }
  
  const amount = generateAmount();
  const date = generateDateForClaim(index);
  const state = states[Math.floor(Math.random() * states.length)];
  const rand = Math.random();
  
  // Determine claim type and scenario with medical codes
  let cptCode, icd10Code, revenueCode, scenario, admissionType, surgeryType;
  let buildDays = null;
  let authorizedDays = null;
  let precertification = { required: false, obtained: false, documentReference: null };
  let cob = { hasSecondary: false, hasTertiary: false, primaryPayer: "Self", secondaryPayer: null, tertiaryPayer: null };
  let ssn = null;
  let denialCodes = [];
  let documentReferences = [];
  
  // 10% - Texas Medicaid day limits
  if (rand < 0.1 && state === "Texas") {
    scenario = "texas-medicaid-limits";
    buildDays = Math.floor(Math.random() * 30) + 15;
    authorizedDays = 21;
    cptCode = "0101"; // Inpatient
    icd10Code = icd10Codes.chronic[Math.floor(Math.random() * icd10Codes.chronic.length)];
    revenueCode = revenueCodes.inpatient[0];
    admissionType = 1;
    denialCodes = buildDays > 21 ? ["N24", "N26"] : [];
    documentReferences = ["Page 9"];
  }
  // 8% - Prior authorization missing
  else if (rand < 0.18) {
    scenario = "prior-auth-missing";
    cptCode = cptCodes.surgery[Math.floor(Math.random() * cptCodes.surgery.length)];
    icd10Code = icd10Codes.musculoskeletal[Math.floor(Math.random() * icd10Codes.musculoskeletal.length)];
    revenueCode = revenueCodes.surgery[Math.floor(Math.random() * revenueCodes.surgery.length)];
    admissionType = 1;
    surgeryType = "Arthroscopic Surgery";
    precertification = { required: true, obtained: false, documentReference: null };
    denialCodes = ["PR-1", "N270"];
    documentReferences = ["Page 15"];
  }
  // 8% - Precertification required
  else if (rand < 0.26) {
    scenario = "precertification-required";
    cptCode = cptCodes.surgery[Math.floor(Math.random() * cptCodes.surgery.length)];
    icd10Code = icd10Codes.musculoskeletal[Math.floor(Math.random() * icd10Codes.musculoskeletal.length)];
    revenueCode = revenueCodes.surgery[Math.floor(Math.random() * revenueCodes.surgery.length)];
    admissionType = 1;
    surgeryType = "Shoulder Surgery";
    const hasPrecert = Math.random() > 0.5;
    precertification = hasPrecert
      ? { required: true, obtained: true, documentReference: "Page 11-12" }
      : { required: true, obtained: false, documentReference: null };
    denialCodes = hasPrecert ? [] : ["PR-1"];
    documentReferences = hasPrecert ? ["Page 11", "Page 12"] : ["Page 11-12"];
  }
  // 7% - COB with Medicare
  else if (rand < 0.33) {
    scenario = "cob-medicare-secondary";
    cptCode = cptCodes.emergency[Math.floor(Math.random() * cptCodes.emergency.length)];
    icd10Code = icd10Codes.injury[Math.floor(Math.random() * icd10Codes.injury.length)];
    revenueCode = revenueCodes.emergency[0];
    ssn = `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
    cob = {
      hasSecondary: true,
      hasTertiary: false,
      primaryPayer: "Medicare",
      secondaryPayer: "Commercial",
      tertiaryPayer: null,
    };
    documentReferences = ["Page 25", "Page 26"];
  }
  // 7% - Medical necessity (physical therapy)
  else if (rand < 0.4) {
    scenario = "medical-necessity";
    cptCode = cptCodes.physicalTherapy[Math.floor(Math.random() * cptCodes.physicalTherapy.length)];
    icd10Code = icd10Codes.pain[Math.floor(Math.random() * icd10Codes.pain.length)];
    revenueCode = "0420"; // Physical therapy
    denialCodes = Math.random() > 0.7 ? ["CO-50"] : [];
    documentReferences = ["Page 22"];
  }
  // 5% - Out-of-network provider
  else if (rand < 0.45) {
    scenario = "provider-out-of-network";
    cptCode = cptCodes.surgery[Math.floor(Math.random() * cptCodes.surgery.length)];
    icd10Code = icd10Codes.musculoskeletal[Math.floor(Math.random() * icd10Codes.musculoskeletal.length)];
    revenueCode = revenueCodes.surgery[0];
    denialCodes = ["CO-109"];
    documentReferences = ["Page 27"];
  }
  // 5% - California Medi-Cal prior auth
  else if (rand < 0.5 && state === "California") {
    scenario = "california-medi-cal-prior-auth";
    cptCode = cptCodes.surgery[Math.floor(Math.random() * cptCodes.surgery.length)];
    icd10Code = icd10Codes.musculoskeletal[Math.floor(Math.random() * icd10Codes.musculoskeletal.length)];
    revenueCode = revenueCodes.surgery[0];
    admissionType = 1;
    const hasAuth = Math.random() > 0.6;
    precertification = { required: true, obtained: hasAuth, documentReference: hasAuth ? "Page 18" : null };
    denialCodes = hasAuth ? [] : ["PR-1", "N270"];
    documentReferences = ["Page 18"];
  }
  // 5% - New York Medicaid inpatient
  else if (rand < 0.55 && state === "New York") {
    scenario = "new-york-medicaid-inpatient";
    cptCode = "0101";
    icd10Code = icd10Codes.chronic[Math.floor(Math.random() * icd10Codes.chronic.length)];
    revenueCode = revenueCodes.inpatient[0];
    admissionType = 1;
    const hasAuth = Math.random() > 0.5;
    precertification = { required: true, obtained: hasAuth, documentReference: hasAuth ? "Page 19" : null };
    denialCodes = hasAuth ? [] : ["PR-1"];
    documentReferences = ["Page 19"];
  }
  // 5% - Florida Medicaid elective surgery
  else if (rand < 0.6 && state === "Florida") {
    scenario = "florida-medicaid-elective-surgery";
    cptCode = cptCodes.surgery[Math.floor(Math.random() * cptCodes.surgery.length)];
    icd10Code = icd10Codes.musculoskeletal[Math.floor(Math.random() * icd10Codes.musculoskeletal.length)];
    revenueCode = revenueCodes.surgery[0];
    admissionType = 2; // Elective
    const hasAuth = Math.random() > 0.6;
    precertification = { required: true, obtained: hasAuth, documentReference: hasAuth ? "Page 20" : null };
    denialCodes = hasAuth ? [] : ["PR-1", "N270"];
    documentReferences = ["Page 20"];
  }
  // 5% - Timely filing
  else if (rand < 0.65) {
    scenario = "timely-filing";
    cptCode = cptCodes.diagnostic[Math.floor(Math.random() * cptCodes.diagnostic.length)];
    icd10Code = icd10Codes.chronic[Math.floor(Math.random() * icd10Codes.chronic.length)];
    revenueCode = "0324"; // Diagnostic imaging
    denialCodes = ["CO-29"];
    documentReferences = ["Page 28"];
  }
  // 5% - Bundled services
  else if (rand < 0.7) {
    scenario = "bundled-services";
    cptCode = cptCodes.surgery[Math.floor(Math.random() * cptCodes.surgery.length)];
    icd10Code = icd10Codes.musculoskeletal[Math.floor(Math.random() * icd10Codes.musculoskeletal.length)];
    revenueCode = revenueCodes.surgery[0];
    denialCodes = ["CO-97"];
    documentReferences = ["Page 29"];
  }
  // 5% - Invalid CPT code
  else if (rand < 0.75) {
    scenario = "invalid-cpt-code";
    cptCode = "99999"; // Invalid code
    icd10Code = icd10Codes.musculoskeletal[Math.floor(Math.random() * icd10Codes.musculoskeletal.length)];
    revenueCode = revenueCodes.surgery[0];
    denialCodes = ["CO-16"];
    documentReferences = ["Page 30"];
  }
  // 25% - Standard claims (no specific scenario)
  else {
    scenario = null;
    const allCptCodes = [
      ...cptCodes.surgery,
      ...cptCodes.physicalTherapy,
      ...cptCodes.emergency,
      ...cptCodes.diagnostic,
    ];
    cptCode = allCptCodes[Math.floor(Math.random() * allCptCodes.length)];
    const allIcd10Codes = [
      ...icd10Codes.musculoskeletal,
      ...icd10Codes.pain,
      ...icd10Codes.injury,
      ...icd10Codes.chronic,
    ];
    icd10Code = allIcd10Codes[Math.floor(Math.random() * allIcd10Codes.length)];
    const allRevenueCodes = [
      ...revenueCodes.surgery,
      ...revenueCodes.emergency,
      ...revenueCodes.inpatient,
    ];
    revenueCode = allRevenueCodes[Math.floor(Math.random() * allRevenueCodes.length)];
  }
  
  // Ensure provider diversity (some providers have more claims)
  const providerRand = Math.random();
  let provider;
  if (providerRand < 0.3) {
    // Top 4 providers get 30% of claims
    provider = providers[Math.floor(Math.random() * 4)];
  } else {
    // Rest distributed across all providers
    provider = providers[Math.floor(Math.random() * providers.length)];
  }
  
  // Ensure member diversity
  const member = members[Math.floor(Math.random() * members.length)];
  
  // Calculate AI Priority Score (4.0 - 9.0)
  let aiPriority = 5.0; // Base priority
  
  // Increase priority based on amount
  if (amount > 15000) aiPriority += 1.5;
  else if (amount > 10000) aiPriority += 1.0;
  else if (amount > 5000) aiPriority += 0.5;
  
  // Increase priority based on status
  if (status === "Escalated") aiPriority += 2.0;
  else if (status === "Information Needed") aiPriority += 1.0;
  else if (status === "Under Process") aiPriority += 0.5;
  
  // Increase priority if there are denial codes
  if (denialCodes.length > 0) aiPriority += 1.0;
  
  // Increase priority based on scenario complexity
  if (scenario && scenario.includes("medicaid")) aiPriority += 0.5;
  if (scenario && scenario.includes("cob")) aiPriority += 0.5;
  
  // Cap at 9.0 and ensure minimum of 4.5
  aiPriority = Math.max(4.5, Math.min(9.0, aiPriority));
  
  // Base claim structure
  const claim = {
    id: claimId,
    member,
    provider,
    status,
    amount,
    date,
    aiPriority, // AI Priority Score
    // Enhanced fields with medical codes
    state,
    claimType: "UB04", // UB04 or CMS-1500
    dos: date, // Date of Service
    cptCode,
    icd10Code,
    revenueCodes: revenueCode ? [revenueCode] : [],
    admissionType,
    surgeryType,
    ssn,
    cob,
    buildDays,
    authorizedDays,
    precertification,
    providerEligibility: {
      eligible: scenario !== "provider-out-of-network",
      effectiveDate: generateDate(365),
      memoDate: generateDate(30),
    },
    denialCodes,
    documentReferences,
    scenario,
    // Additional fields
    hcpcsCode: null, // Can be added for DME, etc.
    modifier: null, // Can be "-25", "-59", "-50", etc.
    placeOfService: admissionType ? "21" : "11", // 21 = Inpatient, 11 = Office
  };
  
  return claim;
});

// Add predefined scenario claims for testing
const SCENARIO_CLAIMS = [
  {
    id: "SCN-001",
    member: "John Smith",
    provider: "Texas Regional Hospital",
    status: "Pending Review",
    amount: 12500,
    date: generateDate(2),
    aiPriority: 6.5,
    state: "Texas",
    claimType: "UB04",
    dos: generateDate(5),
    cptCode: "0101",
    icd10Code: "E11.9",
    revenueCodes: ["0100"],
    ssn: null,
    cob: { hasSecondary: false, hasTertiary: false, primaryPayer: "Self", secondaryPayer: null, tertiaryPayer: null },
    buildDays: 40,
    authorizedDays: 21,
    admissionType: 1,
    surgeryType: null,
    precertification: { required: false, obtained: false, documentReference: null },
    providerEligibility: {
      eligible: false,
      effectiveDate: generateDate(30),
      memoDate: generateDate(15),
    },
    denialCodes: ["N26", "N24"],
    documentReferences: ["Page 9"],
    scenario: "texas-medicaid-limits",
    hcpcsCode: null,
    modifier: null,
    placeOfService: "21",
  },
  {
    id: "SCN-002",
    member: "Sarah Johnson",
    provider: "Metro Healthcare",
    status: "Pending Review",
    amount: 8750,
    date: generateDate(1),
    aiPriority: 6.0,
    state: "Texas",
    claimType: "UB04",
    dos: generateDate(3),
    cptCode: "99284",
    icd10Code: "S72.001A",
    revenueCodes: ["0450"],
    ssn: "123-45-6789",
    cob: {
      hasSecondary: true,
      hasTertiary: false,
      primaryPayer: "Medicare",
      secondaryPayer: "Aetna",
      tertiaryPayer: null,
    },
    buildDays: null,
    authorizedDays: null,
    admissionType: null,
    surgeryType: null,
    precertification: { required: false, obtained: false, documentReference: null },
    providerEligibility: { eligible: true, effectiveDate: generateDate(365), memoDate: generateDate(30) },
    denialCodes: [],
    documentReferences: ["Page 25", "Page 26"],
    scenario: "cob-medicare-secondary",
    hcpcsCode: null,
    modifier: null,
    placeOfService: "11",
  },
  {
    id: "SCN-003",
    member: "Robert Williams",
    provider: "Elite Care Surgical Center",
    status: "Pending Review",
    amount: 22500,
    date: generateDate(1),
    aiPriority: 6.0,
    state: "Texas",
    claimType: "UB04",
    dos: generateDate(2),
    cptCode: "29881",
    icd10Code: "M25.511",
    revenueCodes: ["0450"],
    ssn: null,
    cob: { hasSecondary: false, hasTertiary: false, primaryPayer: "Self", secondaryPayer: null, tertiaryPayer: null },
    buildDays: null,
    authorizedDays: null,
    admissionType: 1,
    surgeryType: "Shoulder Surgery",
    precertification: {
      required: true,
      obtained: true,
      documentReference: "Page 11-12",
    },
    providerEligibility: { eligible: true, effectiveDate: generateDate(365), memoDate: generateDate(30) },
    denialCodes: [],
    documentReferences: ["Page 11", "Page 12"],
    scenario: "precertification-required",
    hcpcsCode: null,
    modifier: null,
    placeOfService: "21",
  },
];

// Prepend scenario claims to the beginning of the array
CLAIMS.unshift(...SCENARIO_CLAIMS);

// Sort by date (most recent first) for better UX
CLAIMS.sort((a, b) => new Date(b.date) - new Date(a.date));

// Export statistics for debugging
export const CLAIMS_STATS = {
  total: CLAIMS.length,
  byStatus: CLAIMS.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {}),
  byProvider: CLAIMS.reduce((acc, claim) => {
    acc[claim.provider] = (acc[claim.provider] || 0) + 1;
    return acc;
  }, {}),
  totalAmount: CLAIMS.reduce((sum, claim) => sum + claim.amount, 0),
  averageAmount: Math.round(CLAIMS.reduce((sum, claim) => sum + claim.amount, 0) / CLAIMS.length),
  minAmount: Math.min(...CLAIMS.map(c => c.amount)),
  maxAmount: Math.max(...CLAIMS.map(c => c.amount)),
};
