import {QualityDocument} from "../domain/model/quality-document.entity.js";

/**
 * Maps quality documents resources of the API to and from QualityDocument entities.
 *
 * @class QualityDocumentAssembler
 */
export class QualityDocumentAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {QualityDocument} The entity.
     */
    static toEntityFromResource(resource) {
        return new QualityDocument({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<QualityDocument>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {QualityDocument} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            title: entity.title,
            version: entity.version,
            status: entity.status,
            author: entity.author,
            technicalReviewer: entity.technicalReviewer,
            approver: entity.approver,
            changedAt: entity.changedAt,
            purpose: entity.purpose,
            scope: entity.scope,
            procedure: entity.procedure,
            revisionSummary: entity.revisionSummary,
            reviewCycleMonths: entity.reviewCycleMonths
        };
    }
}
