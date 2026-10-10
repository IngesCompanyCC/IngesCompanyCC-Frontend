import {DeviationTrend} from "../domain/model/deviation-trend.entity.js";

/**
 * Maps deviation trends resources of the API to and from DeviationTrend entities.
 *
 * @class DeviationTrendAssembler
 */
export class DeviationTrendAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {DeviationTrend} The entity.
     */
    static toEntityFromResource(resource) {
        return new DeviationTrend({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<DeviationTrend>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {DeviationTrend} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            rootCause: entity.rootCause,
            month: entity.month,
            count: entity.count
        };
    }
}
