/**
 * Represents a corrective or preventive action of a CAPA plan.
 *
 * @class CapaAction
 */
export class CapaAction {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the CAPA action.
     * @param {string} params.capaCode - Code of the CAPA plan.
     * @param {string} params.code - Action code, such as CA-01.
     * @param {string} params.title - What has to be done.
     * @param {string} params.owner - Action owner.
     * @param {string} params.dueAt - Due date (ISO 8601).
     * @param {string} params.status - Status (open, planned, in-review or complete).
     * @param {string} params.evidence - Evidence required to close the action.
     * @param {boolean} params.evidenceAttached - Whether the evidence was attached.
     */
    constructor({id = 0, capaCode = '', code = '', title = '', owner = '', dueAt = '', status = '', evidence = '', evidenceAttached = false}) {
        this.id = id;
        this.capaCode = capaCode;
        this.code = code;
        this.title = title;
        this.owner = owner;
        this.dueAt = dueAt;
        this.status = status;
        this.evidence = evidence;
        this.evidenceAttached = evidenceAttached;
    }
}
