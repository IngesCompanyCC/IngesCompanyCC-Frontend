import {AuditFinding} from "../domain/model/audit-finding.entity.js";

/**
 * Maps audit findings resources of the API to and from AuditFinding entities.
 *
 * @class AuditFindingAssembler
 */
export class AuditFindingAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {AuditFinding} The entity.
     */
    static toEntityFromResource(resource) {
        return new AuditFinding({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<AuditFinding>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {AuditFinding} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            auditCode: entity.auditCode,
            code: entity.code,
            title: entity.title,
            classification: entity.classification,
            owner: entity.owner,
            dueAt: entity.dueAt,
            status: entity.status,
            observation: entity.observation,
            response: entity.response,
            closureRequirement: entity.closureRequirement
        };
    }
}
