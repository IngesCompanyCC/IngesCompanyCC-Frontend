import {MaterialLot} from "../domain/model/material-lot.entity.js";

/**
 * Maps material lots resources of the API to and from MaterialLot entities.
 *
 * @class MaterialLotAssembler
 */
export class MaterialLotAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {MaterialLot} The entity.
     */
    static toEntityFromResource(resource) {
        return new MaterialLot({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<MaterialLot>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {MaterialLot} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            receiptCode: entity.receiptCode,
            material: entity.material,
            category: entity.category,
            supplier: entity.supplier,
            supplierLot: entity.supplierLot,
            quantity: entity.quantity,
            expiryDate: entity.expiryDate,
            storageLocation: entity.storageLocation,
            certificate: entity.certificate,
            status: entity.status,
            packagingVerified: entity.packagingVerified,
            identityVerified: entity.identityVerified,
            samplingStatus: entity.samplingStatus,
            allocatedBatch: entity.allocatedBatch
        };
    }
}
