import {Batch} from "../domain/model/batch.entity.js";

/**
 * Maps batches resources of the API to and from Batch entities.
 *
 * @class BatchAssembler
 */
export class BatchAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Batch} The entity.
     */
    static toEntityFromResource(resource) {
        return new Batch({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Batch>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Batch} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            productCode: entity.productCode,
            orderCode: entity.orderCode,
            quantity: entity.quantity,
            line: entity.line,
            owner: entity.owner,
            status: entity.status,
            progress: entity.progress,
            incident: entity.incident,
            lastActivity: entity.lastActivity,
            lastActivityAt: entity.lastActivityAt
        };
    }
}
