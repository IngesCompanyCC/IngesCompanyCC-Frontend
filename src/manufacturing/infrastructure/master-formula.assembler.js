import {MasterFormula} from "../domain/model/master-formula.entity.js";

/**
 * Maps master formulas resources of the API to and from MasterFormula entities.
 *
 * @class MasterFormulaAssembler
 */
export class MasterFormulaAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {MasterFormula} The entity.
     */
    static toEntityFromResource(resource) {
        return new MasterFormula({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<MasterFormula>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {MasterFormula} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            productCode: entity.productCode,
            version: entity.version,
            status: entity.status,
            approvedBy: entity.approvedBy,
            approvedAt: entity.approvedAt,
            batchSize: entity.batchSize
        };
    }
}
