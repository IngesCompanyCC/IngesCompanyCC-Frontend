/**
 * Represents an evidence-backed report for internal review, audits or DIGEMID inspections.
 *
 * @class RegulatoryReport
 */
export class RegulatoryReport {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the regulatory report.
     * @param {string} params.code - Report code, such as RPT-26012.
     * @param {string} params.type - Report type.
     * @param {string} params.scope - Period or record scope.
     * @param {string} params.owner - Report owner.
     * @param {string} params.status - Status (draft, blocked or approved).
     * @param {string} params.template - Template used.
     * @param {string} params.format - Output format.
     * @param {string} params.createdAt - Creation date (ISO 8601).
     */
    constructor({id = 0, code = '', type = '', scope = '', owner = '', status = '', template = '', format = '', createdAt = ''}) {
        this.id = id;
        this.code = code;
        this.type = type;
        this.scope = scope;
        this.owner = owner;
        this.status = status;
        this.template = template;
        this.format = format;
        this.createdAt = createdAt;
    }
}
