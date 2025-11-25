/**
 * Pre-Screening Service
 * 
 * Handles scenario-based pre-screening of claims with step-by-step processing,
 * transparency logging, and compliance checks.
 */

import { getSOPByScenario, getDenialCodes, getDocumentReferences } from '../data/sops';

// Helper to simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Transparency Log Entry
 */
export class TransparencyLogEntry {
  constructor(action, status, apiName, executionTime, details = {}) {
    this.timestamp = new Date().toISOString();
    this.action = action;
    this.status = status; // 'success', 'warning', 'error', 'pending'
    this.apiName = apiName;
    this.executionTime = executionTime; // in milliseconds
    this.details = details;
  }
}

/**
 * Pre-Screening Result
 */
export class PreScreeningResult {
  constructor(scenario, claim) {
    this.scenario = scenario;
    this.claim = claim;
    this.steps = [];
    this.log = [];
    this.recommendation = null;
    this.denialCodes = [];
    this.documentReferences = [];
    this.completed = false;
    this.startTime = Date.now();
  }

  addStep(step) {
    this.steps.push({
      ...step,
      timestamp: new Date().toISOString(),
    });
  }

  addLogEntry(entry) {
    this.log.push(entry);
  }

  setRecommendation(recommendation) {
    this.recommendation = recommendation;
  }

  setDenialCodes(codes) {
    this.denialCodes = codes;
  }

  setDocumentReferences(refs) {
    this.documentReferences = refs;
  }

  complete() {
    this.completed = true;
    this.endTime = Date.now();
    this.totalTime = this.endTime - this.startTime;
  }
}

/**
 * Scenario 1: Build Days Exceed Authorized Days
 */
export async function processBuildDaysScenario(claim, onProgress = null) {
  const result = new PreScreeningResult('build-days', claim);
  const startTime = Date.now();

  try {
    // Step 1: Claim Review
    const step1Start = Date.now();
    await delay(200);
    result.addStep({
      step: 1,
      title: "Claim Review",
      action: "Assessing patient days vs. authorized days",
      status: "success",
      details: {
        buildDays: claim.buildDays,
        authorizedDays: claim.authorizedDays,
        state: claim.state,
      },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Claim Review",
      "success",
      "ClaimAnalysisAPI",
      Date.now() - step1Start,
      { buildDays: claim.buildDays, authorizedDays: claim.authorizedDays }
    ));

    if (onProgress) onProgress(result);

    // Step 2: Limit Check
    const step2Start = Date.now();
    await delay(250);
    const exceedsLimit = claim.buildDays > claim.authorizedDays;
    result.addStep({
      step: 2,
      title: "Limit Check",
      action: exceedsLimit 
        ? `Build-in patient days (${claim.buildDays}) exceed authorized days (${claim.authorizedDays})`
        : `Build-in patient days (${claim.buildDays}) within authorized limit (${claim.authorizedDays})`,
      status: exceedsLimit ? "warning" : "success",
      details: {
        buildDays: claim.buildDays,
        authorizedDays: claim.authorizedDays,
        exceeds: exceedsLimit,
      },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Limit Check",
      exceedsLimit ? "warning" : "success",
      "DaysValidationAPI",
      Date.now() - step2Start,
      { exceeds: exceedsLimit }
    ));

    if (onProgress) onProgress(result);

    // Step 3: Denial Coding (N26)
    const step3Start = Date.now();
    await delay(200);
    const denialCodeN26 = { code: "N26", description: "Missing itemized bill or statement" };
    result.addStep({
      step: 3,
      title: "Denial Coding",
      action: `Applying denial code N26: ${denialCodeN26.description}`,
      status: "warning",
      details: { denialCode: denialCodeN26 },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Denial Code Assignment",
      "success",
      "DenialCodeAPI",
      Date.now() - step3Start,
      { code: "N26" }
    ));

    if (onProgress) onProgress(result);

    // Step 4: Provider Eligibility
    const step4Start = Date.now();
    await delay(300);
    const providerEligible = claim.providerEligibility?.eligible ?? true;
    const dos = new Date(claim.dos);
    const effectiveDate = claim.providerEligibility?.effectiveDate 
      ? new Date(claim.providerEligibility.effectiveDate) 
      : null;
    const memoDate = claim.providerEligibility?.memoDate 
      ? new Date(claim.providerEligibility.memoDate) 
      : null;

    const eligibilityStatus = !providerEligible || (effectiveDate && dos < effectiveDate)
      ? "not eligible"
      : "eligible";

    result.addStep({
      step: 4,
      title: "Provider Eligibility",
      action: `Provider ${claim.provider} is ${eligibilityStatus}`,
      status: eligibilityStatus === "eligible" ? "success" : "error",
      details: {
        provider: claim.provider,
        eligible: providerEligible,
        dos: claim.dos,
        effectiveDate: claim.providerEligibility?.effectiveDate,
        memoDate: claim.providerEligibility?.memoDate,
      },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Provider Eligibility Check",
      eligibilityStatus === "eligible" ? "success" : "error",
      "ProviderEligibilityAPI",
      Date.now() - step4Start,
      { eligible: providerEligible, status: eligibilityStatus }
    ));

    if (onProgress) onProgress(result);

    // Step 5: Final Recommendation
    const step5Start = Date.now();
    await delay(200);
    const finalDenialCode = !providerEligible ? "N24" : (exceedsLimit ? "N26" : null);
    const recommendation = exceedsLimit
      ? `Claim should be denied. Build-in patient days (${claim.buildDays}) exceed authorized days (${claim.authorizedDays}) in ${claim.state}.`
      : !providerEligible
      ? `Claim should be denied. Provider ${claim.provider} is not eligible for authorization.`
      : "Claim may proceed with standard processing.";

    result.setRecommendation({
      action: exceedsLimit || !providerEligible ? "DENY" : "APPROVE",
      reason: recommendation,
      denialCodes: finalDenialCode ? [finalDenialCode] : [],
      sopReference: "Page 9 (Texas)",
    });

    result.setDenialCodes(finalDenialCode ? [{ code: finalDenialCode, description: finalDenialCode === "N24" 
      ? "Charges covered under a capitation agreement/managed care plan"
      : "Missing itemized bill or statement" }] : []);

    result.setDocumentReferences(["Page 9"]);

    result.addStep({
      step: 5,
      title: "Final Recommendation",
      action: recommendation,
      status: exceedsLimit || !providerEligible ? "error" : "success",
      details: {
        recommendation: result.recommendation,
        denialCodes: result.denialCodes,
      },
    });

    result.addLogEntry(new TransparencyLogEntry(
      "Final Recommendation",
      "success",
      "RecommendationEngineAPI",
      Date.now() - step5Start,
      { recommendation: result.recommendation }
    ));

    result.complete();
    if (onProgress) onProgress(result);

    return result;
  } catch (error) {
    result.addLogEntry(new TransparencyLogEntry(
      "Error",
      "error",
      "PreScreeningService",
      Date.now() - startTime,
      { error: error.message }
    ));
    throw error;
  }
}

/**
 * Scenario 2: Coordination of Benefits (COB)
 */
export async function processCOBScenario(claim, onProgress = null) {
  const result = new PreScreeningResult('cob', claim);
  const startTime = Date.now();

  try {
    // Step 1: SSN Check
    const step1Start = Date.now();
    await delay(250);
    const hasSSN = !!claim.ssn;
    result.addStep({
      step: 1,
      title: "SSN Check",
      action: hasSSN 
        ? `SSN present: ${claim.ssn.substring(0, 3)}-XX-XXXX`
        : "SSN not available",
      status: hasSSN ? "success" : "warning",
      details: { hasSSN, ssn: hasSSN ? claim.ssn : null },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "SSN Verification",
      hasSSN ? "success" : "warning",
      "MemberDataAPI",
      Date.now() - step1Start,
      { hasSSN }
    ));

    if (onProgress) onProgress(result);

    // Step 2: COB Action Determination
    const step2Start = Date.now();
    await delay(300);
    const cobActions = [];
    if (hasSSN) {
      cobActions.push("Query external databases for benefit eligibility");
      cobActions.push("Verify benefit eligibility with external insurers");
    }
    if (claim.cob?.hasSecondary) {
      cobActions.push("Coordinate with secondary payer");
    }
    if (claim.cob?.hasTertiary) {
      cobActions.push("Coordinate with tertiary payer");
    }

    result.addStep({
      step: 2,
      title: "COB Action Determination",
      action: cobActions.length > 0
        ? `Required actions: ${cobActions.join(", ")}`
        : "No COB actions required",
      status: "success",
      details: { actions: cobActions, cob: claim.cob },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "COB Action Determination",
      "success",
      "COBEngineAPI",
      Date.now() - step2Start,
      { actions: cobActions }
    ));

    if (onProgress) onProgress(result);

    // Step 3: Profile Update
    const step3Start = Date.now();
    await delay(350);
    const profileUpdates = [];
    if (hasSSN) {
      profileUpdates.push("Update Medicare (MCR) data");
      profileUpdates.push("Update managed medic paid (m) records");
      profileUpdates.push("Update external enrollment records");
      profileUpdates.push("Process Letters of Intent (LOI)");
    }

    result.addStep({
      step: 3,
      title: "Profile Update",
      action: profileUpdates.length > 0
        ? `Updating member profile: ${profileUpdates.join(", ")}`
        : "No profile updates required",
      status: "success",
      details: { updates: profileUpdates },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Member Profile Update",
      "success",
      "MemberProfileAPI",
      Date.now() - step3Start,
      { updates: profileUpdates }
    ));

    if (onProgress) onProgress(result);

    // Step 4: Compliance Goal
    const step4Start = Date.now();
    await delay(200);
    const complianceStatus = hasSSN && claim.cob?.hasSecondary 
      ? "COB compliance achieved"
      : hasSSN
      ? "COB data updated, no secondary payer"
      : "COB compliance pending SSN";

    result.setRecommendation({
      action: "PROCESS",
      reason: complianceStatus,
      nextSteps: profileUpdates,
      sopReference: "COB SOP",
    });

    result.addStep({
      step: 4,
      title: "Compliance Goal",
      action: complianceStatus,
      status: hasSSN ? "success" : "warning",
      details: { compliance: complianceStatus },
    });

    result.addLogEntry(new TransparencyLogEntry(
      "COB Compliance Check",
      hasSSN ? "success" : "warning",
      "ComplianceAPI",
      Date.now() - step4Start,
      { compliance: complianceStatus }
    ));

    result.complete();
    if (onProgress) onProgress(result);

    return result;
  } catch (error) {
    result.addLogEntry(new TransparencyLogEntry(
      "Error",
      "error",
      "PreScreeningService",
      Date.now() - startTime,
      { error: error.message }
    ));
    throw error;
  }
}

/**
 * Scenario 3: Precertification (Shoulder Surgery)
 */
export async function processPrecertificationScenario(claim, onProgress = null) {
  const result = new PreScreeningResult('precertification', claim);
  const startTime = Date.now();

  try {
    // Step 1: Claim Identification
    const step1Start = Date.now();
    await delay(200);
    result.addStep({
      step: 1,
      title: "Claim Identification",
      action: `Claim type: ${claim.claimType}, Surgery type: ${claim.surgeryType}`,
      status: "success",
      details: {
        claimType: claim.claimType,
        surgeryType: claim.surgeryType,
      },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Claim Identification",
      "success",
      "ClaimTypeAPI",
      Date.now() - step1Start,
      { claimType: claim.claimType, surgeryType: claim.surgeryType }
    ));

    if (onProgress) onProgress(result);

    // Step 2: Criteria Assessment
    const step2Start = Date.now();
    await delay(250);
    const requiresPrecert = claim.admissionType === 1 || 
      claim.revenueCodes.some(code => code.startsWith('45') || code.startsWith('7B'));

    result.addStep({
      step: 2,
      title: "Criteria Assessment",
      action: requiresPrecert
        ? "Precertification is required based on admission type and revenue codes"
        : "Precertification not required",
      status: requiresPrecert ? "warning" : "success",
      details: {
        admissionType: claim.admissionType,
        revenueCodes: claim.revenueCodes,
        requiresPrecert,
      },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Precertification Criteria Check",
      "success",
      "PrecertificationAPI",
      Date.now() - step2Start,
      { requiresPrecert }
    ));

    if (onProgress) onProgress(result);

    // Step 3: Specific Condition Check
    const step3Start = Date.now();
    await delay(200);
    const hasAdmissionType1 = claim.admissionType === 1;
    const hasRevenueCode45X = claim.revenueCodes.some(code => code.startsWith('45'));
    const hasRevenueCode7BX = claim.revenueCodes.some(code => code.startsWith('7B'));

    result.addStep({
      step: 3,
      title: "Specific Condition Check",
      action: `Admission type: ${claim.admissionType === 1 ? 'Type 1' : 'Other'}, Revenue codes: ${claim.revenueCodes.join(', ') || 'None'}`,
      status: "success",
      details: {
        admissionType1: hasAdmissionType1,
        revenueCode45X: hasRevenueCode45X,
        revenueCode7BX: hasRevenueCode7BX,
      },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Condition Verification",
      "success",
      "ConditionCheckAPI",
      Date.now() - step3Start,
      { hasAdmissionType1, hasRevenueCode45X, hasRevenueCode7BX }
    ));

    if (onProgress) onProgress(result);

    // Step 4: Document Verification
    const step4Start = Date.now();
    await delay(300);
    const hasPrecertDoc = claim.precertification?.obtained ?? false;
    const docRef = claim.precertification?.documentReference || "Page 11-12";

    result.addStep({
      step: 4,
      title: "Document Verification",
      action: hasPrecertDoc
        ? `Precertification document verified at ${docRef}`
        : `Precertification document not found. Reference: ${docRef}`,
      status: hasPrecertDoc ? "success" : "error",
      details: {
        obtained: hasPrecertDoc,
        documentReference: docRef,
      },
    });
    result.addLogEntry(new TransparencyLogEntry(
      "Document Verification",
      hasPrecertDoc ? "success" : "error",
      "DocumentVerificationAPI",
      Date.now() - step4Start,
      { obtained: hasPrecertDoc, reference: docRef }
    ));

    result.setDocumentReferences(["Page 11", "Page 12"]);

    if (onProgress) onProgress(result);

    // Step 5: Final Analysis & Completion
    const step5Start = Date.now();
    await delay(200);
    const qualifies = requiresPrecert && hasPrecertDoc;
    const recommendation = qualifies
      ? "Claim qualifies for precertification. Admission type 1 and revenue code 45X present. Document verified."
      : requiresPrecert && !hasPrecertDoc
      ? "Precertification required but document not obtained. Claim should be denied or returned for documentation."
      : "Precertification not required for this claim.";

    result.setRecommendation({
      action: qualifies ? "APPROVE" : (requiresPrecert ? "DENY" : "PROCESS"),
      reason: recommendation,
      sopReference: "Page 11-12",
    });

    result.addStep({
      step: 5,
      title: "Final Analysis & Completion",
      action: recommendation,
      status: qualifies ? "success" : (requiresPrecert ? "error" : "success"),
      details: {
        qualifies,
        recommendation: result.recommendation,
      },
    });

    result.addLogEntry(new TransparencyLogEntry(
      "Final Analysis",
      qualifies ? "success" : "error",
      "AnalysisEngineAPI",
      Date.now() - step5Start,
      { qualifies, recommendation }
    ));

    result.complete();
    if (onProgress) onProgress(result);

    return result;
  } catch (error) {
    result.addLogEntry(new TransparencyLogEntry(
      "Error",
      "error",
      "PreScreeningService",
      Date.now() - startTime,
      { error: error.message }
    ));
    throw error;
  }
}

/**
 * Main pre-screening processor
 * Determines scenario and routes to appropriate processor
 */
export async function processPreScreening(claim, onProgress = null) {
  // Determine scenario from claim
  const scenario = claim.scenario;

  if (!scenario) {
    // Auto-detect scenario
    if (claim.buildDays !== null && claim.authorizedDays !== null) {
      return processBuildDaysScenario(claim, onProgress);
    } else if (claim.ssn || claim.cob?.hasSecondary || claim.cob?.hasTertiary) {
      return processCOBScenario(claim, onProgress);
    } else if (claim.admissionType === 1 || claim.revenueCodes.length > 0 || claim.surgeryType) {
      return processPrecertificationScenario(claim, onProgress);
    } else {
      throw new Error("Unable to determine scenario for claim");
    }
  }

  // Route to specific scenario processor
  switch (scenario) {
    case 'build-days':
    case 'texas-medicaid-limits':
      return processBuildDaysScenario(claim, onProgress);
    case 'cob':
    case 'cob-primary-payer':
    case 'cob-medicare-secondary':
      return processCOBScenario(claim, onProgress);
    case 'precertification':
    case 'precertification-required':
    case 'prior-auth-missing':
      return processPrecertificationScenario(claim, onProgress);
    case 'medical-necessity':
    case 'provider-out-of-network':
    case 'california-medi-cal-prior-auth':
    case 'new-york-medicaid-inpatient':
    case 'florida-medicaid-elective-surgery':
    case 'timely-filing':
    case 'bundled-services':
    case 'invalid-cpt-code':
    case 'generic':
      // For now, route these to COB as a generic processor
      return processCOBScenario(claim, onProgress);
    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}

export default {
  processPreScreening,
  processBuildDaysScenario,
  processCOBScenario,
  processPrecertificationScenario,
  PreScreeningResult,
  TransparencyLogEntry,
};

