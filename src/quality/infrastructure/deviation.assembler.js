import {Deviation} from "../domain/model/deviation.entity.js";

/**
 * Maps deviations resources of the API to and from Deviation entities.
 *
 * @class DeviationAssembler
 */
export class DeviationAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Deviation} The entity.
     */
    static toEntityFromResource(resource) {
        return new Deviation({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Deviation>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Deviation} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            title: entity.title,
            batchCode: entity.batchCode,
            orderCode: entity.orderCode,
            summary: entity.summary,
            classification: entity.classification,
            containment: entity.containment,
            severity: entity.severity,
            likelihood: entity.likelihood,
            detectability: entity.detectability,
            status: entity.status,
            rootCause: entity.rootCause,
            capaCode: entity.capaCode,
            reportedBy: entity.reportedBy,
            reportedAt: entity.reportedAt,
            owner: entity.owner,
            dueAt: entity.dueAt
        };
    }
}
