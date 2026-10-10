import {Invoice} from "../domain/model/invoice.entity.js";

/**
 * Maps invoices resources of the API to and from Invoice entities.
 *
 * @class InvoiceAssembler
 */
export class InvoiceAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Invoice} The entity.
     */
    static toEntityFromResource(resource) {
        return new Invoice({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Invoice>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Invoice} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            subscriptionId: entity.subscriptionId,
            number: entity.number,
            issuedAt: entity.issuedAt,
            amount: entity.amount,
            status: entity.status
        };
    }
}
