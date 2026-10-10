/**
 * Represents an approved or draft version of the master formula of a product.
 *
 * @class MasterFormula
 */
export class MasterFormula {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the master formula.
     * @param {string} params.productCode - Code of the product.
     * @param {string} params.version - Version of the formula, such as v3.2.
     * @param {string} params.status - Status of the version (approved or draft).
     * @param {string} params.approvedBy - Quality manager who approved the version.
     * @param {string} params.approvedAt - Approval date (ISO 8601).
     * @param {number} params.batchSize - Standard batch size in units.
     */
    constructor({id = 0, productCode = '', version = '', status = '', approvedBy = '', approvedAt = '', batchSize = 0}) {
        this.id = id;
        this.productCode = productCode;
        this.version = version;
        this.status = status;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.batchSize = batchSize;
    }
}
