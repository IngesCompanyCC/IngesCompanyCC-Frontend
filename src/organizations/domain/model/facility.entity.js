/**
 * Represents a plant or laboratory of an organization.
 *
 * @class Facility
 */
export class Facility {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the facility.
     * @param {number} params.organizationId - Identifier of the organization the facility belongs to.
     * @param {string} params.name - Name of the facility.
     * @param {string} params.type - Type of facility (manufacturing or qc-laboratory).
     * @param {string} params.timezone - Time zone of the facility.
     * @param {string} params.ownerName - Person responsible for the facility.
     * @param {string} params.status - Status of the facility (active or inactive).
     */
    constructor({id = 0, organizationId = 0, name = '', type = '', timezone = '', ownerName = '', status = ''}) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.type = type;
        this.timezone = timezone;
        this.ownerName = ownerName;
        this.status = status;
    }
}
