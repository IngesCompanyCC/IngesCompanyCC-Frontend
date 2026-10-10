import {Plan} from "../domain/model/plan.entity.js";

/**
 * Maps plans resources of the API to and from Plan entities.
 *
 * @class PlanAssembler
 */
export class PlanAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Plan} The entity.
     */
    static toEntityFromResource(resource) {
        return new Plan({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Plan>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Plan} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            key: entity.key,
            name: entity.name,
            monthlyPrice: entity.monthlyPrice,
            annualPrice: entity.annualPrice,
            userLimit: entity.userLimit,
            iotDeviceLimit: entity.iotDeviceLimit
        };
    }
}
