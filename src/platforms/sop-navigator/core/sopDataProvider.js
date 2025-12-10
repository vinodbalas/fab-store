/**
 * SOP Data Provider
 * Platform-agnostic interface for SOP data access
 * Solutions using SOP Executor pass their SOP data through this provider
 */

export class SOPDataProvider {
  constructor(sopData) {
    this.SOP_INDEX = sopData.SOP_INDEX || {};
    this.SCENARIO_SOPS = sopData.SCENARIO_SOPS || {};
    this.getSOPByScenario = sopData.getSOPByScenario || (() => null);
    this.getSOPByStatus = sopData.getSOPByStatus || (() => null);
    this.getApplicableSOPsForClaim = sopData.getApplicableSOPsForClaim || (() => []);
    this.getSOPByCode = sopData.getSOPByCode || (() => null);
    this.getSOPsByState = sopData.getSOPsByState || (() => []);
    this.getSOPByDenialCode = sopData.getSOPByDenialCode || (() => null);
  }

  getSOPIndex() {
    return this.SOP_INDEX;
  }

  getScenarioSOPs() {
    return this.SCENARIO_SOPS;
  }

  lookupSOPByScenario(scenario) {
    return this.getSOPByScenario(scenario);
  }

  lookupSOPByStatus(status) {
    return this.getSOPByStatus(status);
  }

  lookupApplicableSOPs(claim) {
    return this.getApplicableSOPsForClaim(claim);
  }
}

