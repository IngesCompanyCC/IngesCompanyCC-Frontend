/**
 * Represents an IoT sensor registered in ThingsBoard and installed on a piece of equipment.
 *
 * @class Sensor
 */
export class Sensor {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the sensor.
     * @param {string} params.code - Sensor code, such as T-204.
     * @param {string} params.deviceId - ThingsBoard device identifier.
     * @param {string} params.type - Measured variable (temperature, humidity or pressure).
     * @param {string} params.unit - Unit of the readings.
     * @param {string} params.equipmentCode - Code of the equipment where the sensor is installed.
     * @param {number} params.lowerLimit - Lower acceptable limit.
     * @param {number} params.upperLimit - Upper acceptable limit.
     * @param {string} params.status - Status (active or offline).
     * @param {string} params.assignedBatch - Batch in progress that receives the readings, if any.
     */
    constructor({id = 0, code = '', deviceId = '', type = '', unit = '', equipmentCode = '', lowerLimit = 0, upperLimit = 0, status = '', assignedBatch = ''}) {
        this.id = id;
        this.code = code;
        this.deviceId = deviceId;
        this.type = type;
        this.unit = unit;
        this.equipmentCode = equipmentCode;
        this.lowerLimit = lowerLimit;
        this.upperLimit = upperLimit;
        this.status = status;
        this.assignedBatch = assignedBatch;
    }
}
