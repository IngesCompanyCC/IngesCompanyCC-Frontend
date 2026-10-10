import {Operation} from "../domain/model/operation.entity.js";

/**
 * Maps operations resources of the API to and from Operation entities.
 *
 * @class OperationAssembler
 */
export class OperationAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Operation} The entity.
     */
    static toEntityFromResource(resource) {
        return new Operation({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Operation>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Operation} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            orderId: entity.orderId,
            sequence: entity.sequence,
            name: entity.name,
            equipment: entity.equipment,
            progress: entity.progress,
            status: entity.status,
            reference: entity.reference
        };
    }
}
