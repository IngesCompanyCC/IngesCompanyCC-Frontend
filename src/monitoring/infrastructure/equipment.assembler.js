import {Equipment} from "../domain/model/equipment.entity.js";

/**
 * Maps equipment resources of the API to and from Equipment entities.
 *
 * @class EquipmentAssembler
 */
export class EquipmentAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Equipment} The entity.
     */
    static toEntityFromResource(resource) {
        return new Equipment({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Equipment>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Equipment} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            name: entity.name,
            model: entity.model,
            location: entity.location,
            calibrationStatus: entity.calibrationStatus,
            calibrationDue: entity.calibrationDue,
            certificate: entity.certificate,
            nextMaintenance: entity.nextMaintenance,
            maintenanceOwner: entity.maintenanceOwner,
            workOrder: entity.workOrder,
            healthNote: entity.healthNote
        };
    }
}
