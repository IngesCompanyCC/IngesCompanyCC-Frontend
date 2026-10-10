/**
 * Represents a version of a controlled document, such as an SOP.
 *
 * @class QualityDocument
 */
export class QualityDocument {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the quality document.
     * @param {string} params.code - Document code, such as SOP-QA-014.
     * @param {string} params.title - Document title.
     * @param {string} params.version - Version number.
     * @param {string} params.status - Status of the version (draft, in-review, approved or obsolete).
     * @param {string} params.author - Author of the version.
     * @param {string} params.technicalReviewer - Technical reviewer.
     * @param {string} params.approver - Quality manager who must approve the version.
     * @param {string} params.changedAt - Date of the change (ISO 8601).
     * @param {string} params.purpose - Purpose section.
     * @param {string} params.scope - Scope section.
     * @param {string} params.procedure - Response procedure section.
     * @param {string} params.revisionSummary - Summary of the revision.
     * @param {number} params.reviewCycleMonths - Periodic review cycle in months.
     */
    constructor({id = 0, code = '', title = '', version = '', status = '', author = '', technicalReviewer = '', approver = '', changedAt = '', purpose = '', scope = '', procedure = '', revisionSummary = '', reviewCycleMonths = 0}) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.version = version;
        this.status = status;
        this.author = author;
        this.technicalReviewer = technicalReviewer;
        this.approver = approver;
        this.changedAt = changedAt;
        this.purpose = purpose;
        this.scope = scope;
        this.procedure = procedure;
        this.revisionSummary = revisionSummary;
        this.reviewCycleMonths = reviewCycleMonths;
    }
}
