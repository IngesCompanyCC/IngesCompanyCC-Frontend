/**
 * Represents a received lot of raw material and its quarantine inspection.
 *
 * @class MaterialLot
 */
export class MaterialLot {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the material lot.
     * @param {string} params.code - Internal lot code, such as RM-26104.
     * @param {string} params.receiptCode - Receipt code, such as RCV-26104.
     * @param {string} params.material - Material name.
     * @param {string} params.category - Category (api, excipient or packaging).
     * @param {string} params.supplier - Supplier name.
     * @param {string} params.supplierLot - Lot code of the supplier.
     * @param {string} params.quantity - Quantity received and packaging.
     * @param {string} params.expiryDate - Expiry date (ISO 8601).
     * @param {string} params.storageLocation - Storage location.
     * @param {string} params.certificate - File name of the certificate of analysis.
     * @param {string} params.status - Disposition (quarantine, sampling, inspection, approved or rejected).
     * @param {boolean} params.packagingVerified - Whether the packaging was verified.
     * @param {boolean} params.identityVerified - Whether identity and labeling were verified.
     * @param {string} params.samplingStatus - QC sampling status (pending, requested or done).
     * @param {string} params.allocatedBatch - Batch the lot is allocated to, if any.
     */
    constructor({id = 0, code = '', receiptCode = '', material = '', category = '', supplier = '', supplierLot = '', quantity = '', expiryDate = '', storageLocation = '', certificate = '', status = '', packagingVerified = false, identityVerified = false, samplingStatus = '', allocatedBatch = ''}) {
        this.id = id;
        this.code = code;
        this.receiptCode = receiptCode;
        this.material = material;
        this.category = category;
        this.supplier = supplier;
        this.supplierLot = supplierLot;
        this.quantity = quantity;
        this.expiryDate = expiryDate;
        this.storageLocation = storageLocation;
        this.certificate = certificate;
        this.status = status;
        this.packagingVerified = packagingVerified;
        this.identityVerified = identityVerified;
        this.samplingStatus = samplingStatus;
        this.allocatedBatch = allocatedBatch;
    }
}
