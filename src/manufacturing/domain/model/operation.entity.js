/**
 * Represents an operation of the manufacturing execution of an order.
 *
 * @class Operation
 */
export class Operation {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the operation.
     * @param {number} params.orderId - Identifier of the production order.
     * @param {number} params.sequence - Position of the operation.
     * @param {string} params.name - Name of the operation.
     * @param {string} params.equipment - Equipment or station and its owner.
     * @param {number} params.progress - Progress from 0 to 100.
     * @param {string} params.status - Status (complete, in-progress, on-hold or not-started).
     * @param {string} params.reference - Record that explains the status, such as a deviation.
     */
    constructor({id = 0, orderId = 0, sequence = 0, name = '', equipment = '', progress = 0, status = '', reference = ''}) {
        this.id = id;
        this.orderId = orderId;
        this.sequence = sequence;
        this.name = name;
        this.equipment = equipment;
        this.progress = progress;
        this.status = status;
        this.reference = reference;
    }
}
