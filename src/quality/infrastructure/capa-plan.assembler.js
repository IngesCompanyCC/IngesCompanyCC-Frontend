import {CapaPlan} from "../domain/model/capa-plan.entity.js";

/**
 * Maps capa plans resources of the API to and from CapaPlan entities.
 *
 * @class CapaPlanAssembler
 */
export class CapaPlanAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {CapaPlan} The entity.
     */
    static toEntityFromResource(resource) {
        return new CapaPlan({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<CapaPlan>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {CapaPlan} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            title: entity.title,
            sourceDeviation: entity.sourceDeviation,
            owner: entity.owner,
            reviewer: entity.reviewer,
            rootCause: entity.rootCause,
            acceptanceCriterion: entity.acceptanceCriterion,
            effectivenessCheckAt: entity.effectivenessCheckAt,
            status: entity.status
        };
    }
}
