import {CapaAction} from "../domain/model/capa-action.entity.js";

/**
 * Maps capa actions resources of the API to and from CapaAction entities.
 *
 * @class CapaActionAssembler
 */
export class CapaActionAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {CapaAction} The entity.
     */
    static toEntityFromResource(resource) {
        return new CapaAction({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<CapaAction>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {CapaAction} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            capaCode: entity.capaCode,
            code: entity.code,
            title: entity.title,
            owner: entity.owner,
            dueAt: entity.dueAt,
            status: entity.status,
            evidence: entity.evidence,
            evidenceAttached: entity.evidenceAttached
        };
    }
}
