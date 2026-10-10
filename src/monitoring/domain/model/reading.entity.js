/**
 * Represents a telemetry reading captured automatically by ThingsBoard.
 *
 * @class Reading
 */
export class Reading {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the reading.
     * @param {string} params.sensorCode - Code of the sensor.
     * @param {string} params.batchCode - Batch the reading is linked to, if any.
     * @param {number} params.value - Measured value.
     * @param {string} params.recordedAt - Time of the reading (ISO 8601).
     * @param {string} params.source - Source of the reading.
     */
    constructor({id = 0, sensorCode = '', batchCode = '', value = 0, recordedAt = '', source = ''}) {
        this.id = id;
        this.sensorCode = sensorCode;
        this.batchCode = batchCode;
        this.value = value;
        this.recordedAt = recordedAt;
        this.source = source;
    }
}
