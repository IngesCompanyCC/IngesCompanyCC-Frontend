/**
 * Represents a task assigned to an accountable owner and linked to a record.
 *
 * @class CollaborationTask
 */
export class CollaborationTask {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the task.
     * @param {string} params.title - What has to be done.
     * @param {string} params.recordCode - Linked record.
     * @param {string} params.detail - Context of the task.
     * @param {string} params.owner - Accountable owner.
     * @param {string} params.dueAt - Due date and time (ISO 8601).
     * @param {string} params.status - Status (to-do, in-review, ready, pending, open or done).
     */
    constructor({id = 0, title = '', recordCode = '', detail = '', owner = '', dueAt = '', status = ''}) {
        this.id = id;
        this.title = title;
        this.recordCode = recordCode;
        this.detail = detail;
        this.owner = owner;
        this.dueAt = dueAt;
        this.status = status;
    }
}
