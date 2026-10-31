import {Invitation} from "../domain/model/invitation.entity.js";

/**
 * Maps invitation resources of the API to and from Invitation entities.
 *
 * @class InvitationAssembler
 */
export class InvitationAssembler {
    /**
     * @param {Object} resource - Invitation resource from the API.
     * @returns {Invitation} The invitation entity.
     */
    static toEntityFromResource(resource) {
        return new Invitation({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with invitation resources.
     * @returns {Array<Invitation>} The invitation entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Invitation} entity - The invitation entity.
     * @returns {Object} The invitation resource.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            role: entity.role,
            facility: entity.facility,
            note: entity.note,
            status: entity.status,
            sentAt: entity.sentAt
        };
    }
}
