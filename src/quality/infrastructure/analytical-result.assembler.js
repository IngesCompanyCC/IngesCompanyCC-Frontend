import {AnalyticalResult} from "../domain/model/analytical-result.entity.js";

/**
 * Maps analytical results resources of the API to and from AnalyticalResult entities.
 *
 * @class AnalyticalResultAssembler
 */
export class AnalyticalResultAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {AnalyticalResult} The entity.
     */
    static toEntityFromResource(resource) {
        return new AnalyticalResult({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<AnalyticalResult>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {AnalyticalResult} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            batchCode: entity.batchCode,
            sampleCode: entity.sampleCode,
            reportCode: entity.reportCode,
            test: entity.test,
            protocol: entity.protocol,
            result: entity.result,
            specification: entity.specification,
            analyst: entity.analyst,
            status: entity.status,
            approval: entity.approval
        };
    }
}
