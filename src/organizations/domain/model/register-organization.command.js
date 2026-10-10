/**
 * Command with the data a laboratory enters to register its organization, its plan and its first administrator.
 *
 * @class RegisterOrganizationCommand
 */
export class RegisterOrganizationCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.legalName - Legal name of the laboratory.
     * @param {string} params.ruc - RUC (tax ID) of the laboratory, 11 digits.
     * @param {string} params.facilityName - Name of the primary plant.
     * @param {string} params.planKey - Key of the selected plan.
     * @param {string} params.billingCycle - Selected billing cycle (monthly or annual).
     * @param {string} params.administratorName - Full name of the first administrator.
     * @param {string} params.administratorEmail - Work email of the first administrator.
     * @param {string} params.password - Password chosen by the administrator.
     */
    constructor({legalName, ruc, facilityName, planKey, billingCycle, administratorName, administratorEmail, password}) {
        this.legalName = legalName;
        this.ruc = ruc;
        this.facilityName = facilityName;
        this.planKey = planKey;
        this.billingCycle = billingCycle;
        this.administratorName = administratorName;
        this.administratorEmail = administratorEmail;
        this.password = password;
    }
}
