import {RoleProfile} from "../domain/model/role-profile.entity.js";

/**
 * Maps role profile resources of the API to RoleProfile entities.
 *
 * @class RoleProfileAssembler
 */
export class RoleProfileAssembler {
    /**
     * @param {Object} resource - Role profile resource from the API.
     * @returns {RoleProfile} The role profile entity.
     */
    static toEntityFromResource(resource) {
        return new RoleProfile({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with role profile resources.
     * @returns {Array<RoleProfile>} The role profile entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }
}
