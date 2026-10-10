import {Product} from "../domain/model/product.entity.js";

/**
 * Maps products resources of the API to and from Product entities.
 *
 * @class ProductAssembler
 */
export class ProductAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Product} The entity.
     */
    static toEntityFromResource(resource) {
        return new Product({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Product>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Product} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            name: entity.name,
            dosageForm: entity.dosageForm,
            formulaVersion: entity.formulaVersion,
            formulaStatus: entity.formulaStatus
        };
    }
}
