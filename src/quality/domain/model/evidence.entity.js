/**
 * Represents a file attached as evidence to a quality record.
 *
 * @class Evidence
 */
export class Evidence {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the evidence.
     * @param {string} params.recordCode - Code of the record the file supports.
     * @param {string} params.fileName - File name.
     * @param {string} params.detail - Who attached it and what it shows.
     * @param {string} params.status - Status (attached, pending-review or reviewed).
     */
    constructor({id = 0, recordCode = '', fileName = '', detail = '', status = ''}) {
        this.id = id;
        this.recordCode = recordCode;
        this.fileName = fileName;
        this.detail = detail;
        this.status = status;
    }
}
