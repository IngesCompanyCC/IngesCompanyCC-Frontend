import {ProductionOrder} from "../domain/model/production-order.entity.js";

/**
 * Maps production orders resources of the API to and from ProductionOrder entities.
 *
 * @class ProductionOrderAssembler
 */
export class ProductionOrderAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {ProductionOrder} The entity.
     */
    static toEntityFromResource(resource) {
        return new ProductionOrder({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<ProductionOrder>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {ProductionOrder} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            productCode: entity.productCode,
            formulaId: entity.formulaId,
            batchCode: entity.batchCode,
            plannedQuantity: entity.plannedQuantity,
            line: entity.line,
            status: entity.status,
            plannedStart: entity.plannedStart,
            plannedEnd: entity.plannedEnd
        };
    }
}
