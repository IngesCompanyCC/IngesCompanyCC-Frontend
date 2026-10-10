import {UserProfile} from "../domain/model/user-profile.entity.js";

/**
 * Maps user profiles resources of the API to and from UserProfile entities.
 *
 * @class UserProfileAssembler
 */
export class UserProfileAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {UserProfile} The entity.
     */
    static toEntityFromResource(resource) {
        return new UserProfile({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<UserProfile>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {UserProfile} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            userId: entity.userId,
            firstName: entity.firstName,
            lastName: entity.lastName,
            email: entity.email,
            area: entity.area,
            site: entity.site,
            emailNotifications: entity.emailNotifications,
            inAppNotifications: entity.inAppNotifications,
            language: entity.language
        };
    }
}
