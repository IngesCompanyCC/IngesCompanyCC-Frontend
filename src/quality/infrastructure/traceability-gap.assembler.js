import {TraceabilityGap} from "../domain/model/traceability-gap.entity.js";

/**
 * Maps traceability gaps resources of the API to and from TraceabilityGap entities.
 *
 * @class TraceabilityGapAssembler
 */
export class TraceabilityGapAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {TraceabilityGap} The entity.
     */
    static toEntityFromResource(resource) {
        return new TraceabilityGap({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<TraceabilityGap>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {TraceabilityGap} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            batchCode: entity.batchCode,
            product: entity.product,
            missingRecord: entity.missingRecord,
            detail: entity.detail
        };
    }
}
