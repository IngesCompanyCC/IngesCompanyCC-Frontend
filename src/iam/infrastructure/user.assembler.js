import {User} from "../domain/model/user.entity.js";

/**
 * Maps user resources of the API to and from User entities.
 *
 * @class UserAssembler
 */
export class UserAssembler {
    /**
     * @param {Object} resource - User resource from the API.
     * @returns {User} The user entity.
     */
    static toEntityFromResource(resource) {
        return new User({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with user resources.
     * @returns {Array<User>} The user entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {User} entity - The user entity.
     * @returns {Object} The user resource, without credentials.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            fullName: entity.fullName,
            initials: entity.initials,
            email: entity.email,
            role: entity.role,
            environment: entity.environment,
            facility: entity.facility,
            status: entity.status,
            organizationId: entity.organizationId,
            organizationName: entity.organizationName,
            plant: entity.plant,
            privilege: entity.privilege
        };
    }
}
