import {Organization} from "../domain/model/organization.entity.js";

/**
 * Maps organizations resources of the API to and from Organization entities.
 *
 * @class OrganizationAssembler
 */
export class OrganizationAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Organization} The entity.
     */
    static toEntityFromResource(resource) {
        return new Organization({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Organization>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Organization} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            legalName: entity.legalName,
            ruc: entity.ruc,
            region: entity.region,
            ownerName: entity.ownerName,
            status: entity.status
        };
    }
}
