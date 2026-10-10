/**
 * Represents an alert raised when a reading leaves its limits or a sensor stops reporting.
 *
 * @class Alert
 */
export class Alert {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the alert.
     * @param {string} params.code - Alert code, such as ALT-26031.
     * @param {string} params.sensorCode - Code of the sensor.
     * @param {string} params.equipmentCode - Code or name of the equipment.
     * @param {string} params.severity - Severity (critical or warning).
     * @param {string} params.status - Status (open, acknowledged, under-investigation or closed).
     * @param {string} params.title - Short description.
     * @param {string} params.detail - What happened, with values and times.
     * @param {string} params.batchCode - Affected batch, if any.
     * @param {string} params.acknowledgedBy - Who acknowledged the alert.
     * @param {string} params.acknowledgedAt - When it was acknowledged (ISO 8601).
     * @param {string} params.responseNote - Corrective actions taken.
     * @param {string} params.linkedRecord - Linked incident or deviation.
     */
    constructor({id = 0, code = '', sensorCode = '', equipmentCode = '', severity = '', status = '', title = '', detail = '', batchCode = '', acknowledgedBy = '', acknowledgedAt = '', responseNote = '', linkedRecord = ''}) {
        this.id = id;
        this.code = code;
        this.sensorCode = sensorCode;
        this.equipmentCode = equipmentCode;
        this.severity = severity;
        this.status = status;
        this.title = title;
        this.detail = detail;
        this.batchCode = batchCode;
        this.acknowledgedBy = acknowledgedBy;
        this.acknowledgedAt = acknowledgedAt;
        this.responseNote = responseNote;
        this.linkedRecord = linkedRecord;
    }
}
