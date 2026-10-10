/**
 * Represents a manufacturing batch and its quality gates.
 *
 * @class Batch
 */
export class Batch {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the batch.
     * @param {string} params.code - Unique batch code, such as B-26041.
     * @param {string} params.productCode - Code of the product.
     * @param {string} params.orderCode - Code of the production order.
     * @param {number} params.quantity - Quantity in units.
     * @param {string} params.line - Manufacturing line.
     * @param {string} params.owner - Person responsible for the batch.
     * @param {string} params.status - Status (planned, in-progress, on-hold, release-requested or released).
     * @param {number} params.progress - Progress from 0 to 100.
     * @param {string} params.incident - Open incident that affects the batch, if any.
     * @param {string} params.lastActivity - Last activity on the batch.
     * @param {string} params.lastActivityAt - Date of the last activity (ISO 8601).
     */
    constructor({id = 0, code = '', productCode = '', orderCode = '', quantity = 0, line = '', owner = '', status = '', progress = 0, incident = '', lastActivity = '', lastActivityAt = ''}) {
        this.id = id;
        this.code = code;
        this.productCode = productCode;
        this.orderCode = orderCode;
        this.quantity = quantity;
        this.line = line;
        this.owner = owner;
        this.status = status;
        this.progress = progress;
        this.incident = incident;
        this.lastActivity = lastActivity;
        this.lastActivityAt = lastActivityAt;
    }
}
