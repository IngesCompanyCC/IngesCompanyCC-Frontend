import {Alert} from "../domain/model/alert.entity.js";

/**
 * Maps alerts resources of the API to and from Alert entities.
 *
 * @class AlertAssembler
 */
export class AlertAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Alert} The entity.
     */
    static toEntityFromResource(resource) {
        return new Alert({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Alert>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Alert} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            sensorCode: entity.sensorCode,
            equipmentCode: entity.equipmentCode,
            severity: entity.severity,
            status: entity.status,
            title: entity.title,
            detail: entity.detail,
            batchCode: entity.batchCode,
            acknowledgedBy: entity.acknowledgedBy,
            acknowledgedAt: entity.acknowledgedAt,
            responseNote: entity.responseNote,
            linkedRecord: entity.linkedRecord
        };
    }
}
