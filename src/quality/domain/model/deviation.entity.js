/**
 * Represents a deviation report with its investigation, risk assessment and disposition.
 *
 * @class Deviation
 */
export class Deviation {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the deviation.
     * @param {string} params.code - Deviation code, such as DEV-26017.
     * @param {string} params.title - Short title.
     * @param {string} params.batchCode - Affected batch.
     * @param {string} params.orderCode - Affected production order.
     * @param {string} params.summary - Deviation summary.
     * @param {string} params.classification - Classification (minor, major or critical).
     * @param {string} params.containment - Initial containment.
     * @param {number} params.severity - Severity score from 1 to 5.
     * @param {number} params.likelihood - Likelihood score from 1 to 5.
     * @param {number} params.detectability - Detectability score from 1 to 5.
     * @param {string} params.status - Status (open, submitted, dispositioned or closed).
     * @param {string} params.rootCause - Root-cause category.
     * @param {string} params.capaCode - Linked CAPA plan, if any.
     * @param {string} params.reportedBy - Who reported it.
     * @param {string} params.reportedAt - When it was reported (ISO 8601).
     * @param {string} params.owner - QA owner of the assessment.
     * @param {string} params.dueAt - Due date of the assessment (ISO 8601).
     */
    constructor({id = 0, code = '', title = '', batchCode = '', orderCode = '', summary = '', classification = '', containment = '', severity = 0, likelihood = 0, detectability = 0, status = '', rootCause = '', capaCode = '', reportedBy = '', reportedAt = '', owner = '', dueAt = ''}) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.batchCode = batchCode;
        this.orderCode = orderCode;
        this.summary = summary;
        this.classification = classification;
        this.containment = containment;
        this.severity = severity;
        this.likelihood = likelihood;
        this.detectability = detectability;
        this.status = status;
        this.rootCause = rootCause;
        this.capaCode = capaCode;
        this.reportedBy = reportedBy;
        this.reportedAt = reportedAt;
        this.owner = owner;
        this.dueAt = dueAt;
    }
}
