/**
 * Represents an internal or supplier audit.
 *
 * @class Audit
 */
export class Audit {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the audit.
     * @param {string} params.code - Audit code, such as AUD-26004.
     * @param {string} params.title - Audit title.
     * @param {string} params.period - Dates of the audit.
     * @param {number} params.areasReviewed - Areas already reviewed.
     * @param {number} params.areasTotal - Areas to review.
     * @param {string} params.status - Status (in-progress or closed).
     */
    constructor({id = 0, code = '', title = '', period = '', areasReviewed = 0, areasTotal = 0, status = ''}) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.period = period;
        this.areasReviewed = areasReviewed;
        this.areasTotal = areasTotal;
        this.status = status;
    }
}
