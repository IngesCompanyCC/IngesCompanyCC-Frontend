/**
 * Represents a production order issued against an approved master formula.
 *
 * @class ProductionOrder
 */
export class ProductionOrder {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the production order.
     * @param {string} params.code - Order code, such as PO-26041.
     * @param {string} params.productCode - Code of the product.
     * @param {number} params.formulaId - Identifier of the master formula used.
     * @param {string} params.batchCode - Code of the batch produced by the order.
     * @param {number} params.plannedQuantity - Planned quantity in units.
     * @param {string} params.line - Manufacturing line.
     * @param {string} params.status - Status of the order (planned, approved, in-progress, on-hold or completed).
     * @param {string} params.plannedStart - Planned start (ISO 8601).
     * @param {string} params.plannedEnd - Planned end (ISO 8601).
     */
    constructor({id = 0, code = '', productCode = '', formulaId = 0, batchCode = '', plannedQuantity = 0, line = '', status = '', plannedStart = '', plannedEnd = ''}) {
        this.id = id;
        this.code = code;
        this.productCode = productCode;
        this.formulaId = formulaId;
        this.batchCode = batchCode;
        this.plannedQuantity = plannedQuantity;
        this.line = line;
        this.status = status;
        this.plannedStart = plannedStart;
        this.plannedEnd = plannedEnd;
    }
}
