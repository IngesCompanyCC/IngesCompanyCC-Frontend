import {Audit} from "../domain/model/audit.entity.js";

/**
 * Maps audits resources of the API to and from Audit entities.
 *
 * @class AuditAssembler
 */
export class AuditAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Audit} The entity.
     */
    static toEntityFromResource(resource) {
        return new Audit({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Audit>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Audit} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            title: entity.title,
            period: entity.period,
            areasReviewed: entity.areasReviewed,
            areasTotal: entity.areasTotal,
            status: entity.status
        };
    }
}
