import {FormulaItem} from "../domain/model/formula-item.entity.js";

/**
 * Maps formula items resources of the API to and from FormulaItem entities.
 *
 * @class FormulaItemAssembler
 */
export class FormulaItemAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {FormulaItem} The entity.
     */
    static toEntityFromResource(resource) {
        return new FormulaItem({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<FormulaItem>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {FormulaItem} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            formulaId: entity.formulaId,
            kind: entity.kind,
            name: entity.name,
            role: entity.role,
            target: entity.target,
            tolerance: entity.tolerance,
            control: entity.control
        };
    }
}
