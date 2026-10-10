/**
 * Represents an entry of the status history of a batch.
 *
 * @class BatchEvent
 */
export class BatchEvent {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the batch event.
     * @param {string} params.batchCode - Code of the batch.
     * @param {string} params.title - What happened.
     * @param {string} params.detail - Who or what was involved.
     * @param {string} params.occurredAt - When it happened (ISO 8601).
     * @param {string} params.tone - Color of the entry (normal, warning or danger).
     */
    constructor({id = 0, batchCode = '', title = '', detail = '', occurredAt = '', tone = ''}) {
        this.id = id;
        this.batchCode = batchCode;
        this.title = title;
        this.detail = detail;
        this.occurredAt = occurredAt;
        this.tone = tone;
    }
}
