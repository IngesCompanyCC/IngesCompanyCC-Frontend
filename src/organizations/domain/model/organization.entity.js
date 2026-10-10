/**
 * Represents a laboratory organization registered in DoofPlus.
 *
 * @class Organization
 */
export class Organization {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the organization.
     * @param {string} params.legalName - Legal name (razón social) of the laboratory.
     * @param {string} params.ruc - Peruvian taxpayer number (RUC), 11 digits.
     * @param {string} params.region - Country or region of the organization.
     * @param {string} params.ownerName - Name of the first administrator.
     * @param {string} params.status - Status of the organization (active or pending-verification).
     */
    constructor({id = 0, legalName = '', ruc = '', region = '', ownerName = '', status = ''}) {
        this.id = id;
        this.legalName = legalName;
        this.ruc = ruc;
        this.region = region;
        this.ownerName = ownerName;
        this.status = status;
    }
}
