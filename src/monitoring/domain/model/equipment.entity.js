/**
 * Represents a piece of equipment with its calibration and preventive maintenance.
 *
 * @class Equipment
 */
export class Equipment {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the equipment.
     * @param {string} params.code - Equipment code, such as EQ-COAT-02.
     * @param {string} params.name - Type of equipment.
     * @param {string} params.model - Brand, model and serial number.
     * @param {string} params.location - Plant and line or laboratory.
     * @param {string} params.calibrationStatus - Calibration status (fit, due or not-fit).
     * @param {string} params.calibrationDue - Calibration due date (ISO 8601).
     * @param {string} params.certificate - Current calibration certificate.
     * @param {string} params.nextMaintenance - Next preventive maintenance (ISO 8601).
     * @param {string} params.maintenanceOwner - Person responsible for maintenance.
     * @param {string} params.workOrder - Open maintenance work order, if any.
     * @param {string} params.healthNote - Short note about the current condition.
     */
    constructor({id = 0, code = '', name = '', model = '', location = '', calibrationStatus = '', calibrationDue = '', certificate = '', nextMaintenance = '', maintenanceOwner = '', workOrder = '', healthNote = ''}) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.model = model;
        this.location = location;
        this.calibrationStatus = calibrationStatus;
        this.calibrationDue = calibrationDue;
        this.certificate = certificate;
        this.nextMaintenance = nextMaintenance;
        this.maintenanceOwner = maintenanceOwner;
        this.workOrder = workOrder;
        this.healthNote = healthNote;
    }
}
