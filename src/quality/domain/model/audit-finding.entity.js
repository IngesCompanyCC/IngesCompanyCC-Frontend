/**
 * Represents a finding of an audit with its evidence and closure requirement.
 *
 * @class AuditFinding
 */
export class AuditFinding {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the audit finding.
     * @param {string} params.auditCode - Code of the audit.
     * @param {string} params.code - Finding code, such as F-01.
     * @param {string} params.title - Finding title.
     * @param {string} params.classification - Classification (major or minor).
     * @param {string} params.owner - Owner of the response.
     * @param {string} params.dueAt - Due date (ISO 8601).
     * @param {string} params.status - Status (evidence-pending, in-review or closed).
     * @param {string} params.observation - What the auditor observed.
     * @param {string} params.response - Evidence and corrective response.
     * @param {string} params.closureRequirement - What is needed to close the finding.
     */
    constructor({id = 0, auditCode = '', code = '', title = '', classification = '', owner = '', dueAt = '', status = '', observation = '', response = '', closureRequirement = ''}) {
        this.id = id;
        this.auditCode = auditCode;
        this.code = code;
        this.title = title;
        this.classification = classification;
        this.owner = owner;
        this.dueAt = dueAt;
        this.status = status;
        this.observation = observation;
        this.response = response;
        this.closureRequirement = closureRequirement;
    }
}
