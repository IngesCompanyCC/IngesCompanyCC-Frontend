import {BatchEvent} from "../domain/model/batch-event.entity.js";

/**
 * Maps batch events resources of the API to and from BatchEvent entities.
 *
 * @class BatchEventAssembler
 */
export class BatchEventAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {BatchEvent} The entity.
     */
    static toEntityFromResource(resource) {
        return new BatchEvent({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<BatchEvent>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {BatchEvent} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            batchCode: entity.batchCode,
            title: entity.title,
            detail: entity.detail,
            occurredAt: entity.occurredAt,
            tone: entity.tone
        };
    }
}
