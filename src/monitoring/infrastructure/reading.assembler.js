import {Reading} from "../domain/model/reading.entity.js";

/**
 * Maps readings resources of the API to and from Reading entities.
 *
 * @class ReadingAssembler
 */
export class ReadingAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Reading} The entity.
     */
    static toEntityFromResource(resource) {
        return new Reading({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Reading>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Reading} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            sensorCode: entity.sensorCode,
            batchCode: entity.batchCode,
            value: entity.value,
            recordedAt: entity.recordedAt,
            source: entity.source
        };
    }
}
