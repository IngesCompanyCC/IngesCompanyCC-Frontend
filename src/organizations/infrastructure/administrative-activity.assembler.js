import {AdministrativeActivity} from "../domain/model/administrative-activity.entity.js";

/**
 * Maps administrative activities resources of the API to and from AdministrativeActivity entities.
 *
 * @class AdministrativeActivityAssembler
 */
export class AdministrativeActivityAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {AdministrativeActivity} The entity.
     */
    static toEntityFromResource(resource) {
        return new AdministrativeActivity({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<AdministrativeActivity>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {AdministrativeActivity} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            title: entity.title,
            actor: entity.actor,
            occurredAt: entity.occurredAt
        };
    }
}
