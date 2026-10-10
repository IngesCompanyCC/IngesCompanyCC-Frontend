import {Sensor} from "../domain/model/sensor.entity.js";

/**
 * Maps sensors resources of the API to and from Sensor entities.
 *
 * @class SensorAssembler
 */
export class SensorAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Sensor} The entity.
     */
    static toEntityFromResource(resource) {
        return new Sensor({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Sensor>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Sensor} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            deviceId: entity.deviceId,
            type: entity.type,
            unit: entity.unit,
            equipmentCode: entity.equipmentCode,
            lowerLimit: entity.lowerLimit,
            upperLimit: entity.upperLimit,
            status: entity.status,
            assignedBatch: entity.assignedBatch
        };
    }
}
