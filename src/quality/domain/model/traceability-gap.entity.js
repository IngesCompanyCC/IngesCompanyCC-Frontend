/**
 * Represents a mandatory record missing in a closed batch.
 *
 * @class TraceabilityGap
 */
export class TraceabilityGap {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the traceability gap.
     * @param {string} params.batchCode - Batch with the gap.
     * @param {string} params.product - Product of the batch.
     * @param {string} params.missingRecord - Mandatory record that is missing.
     * @param {string} params.detail - Where the record is required.
     */
    constructor({id = 0, batchCode = '', product = '', missingRecord = '', detail = ''}) {
        this.id = id;
        this.batchCode = batchCode;
        this.product = product;
        this.missingRecord = missingRecord;
        this.detail = detail;
    }
}
