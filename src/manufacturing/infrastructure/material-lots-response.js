/**
 * Resource representation of a material lot.
 */
export interface MaterialLotResource extends BaseResource {
  /**
   * Unique identifier of the material lot.
   */
  id;
  /**
   * Internal lot code, such as RM-26104.
   */
  code;
  /**
   * Receipt code, such as RCV-26104.
   */
  receiptCode;
  /**
   * Material name.
   */
  material;
  /**
   * Category (api, excipient or packaging).
   */
  category;
  /**
   * Supplier name.
   */
  supplier;
  /**
   * Lot code of the supplier.
   */
  supplierLot;
  /**
   * Quantity received and packaging.
   */
  quantity;
  /**
   * Expiry date (ISO 8601).
   */
  expiryDate;
  /**
   * Storage location.
   */
  storageLocation;
  /**
   * File name of the certificate of analysis.
   */
  certificate;
  /**
   * Disposition (quarantine, sampling, inspection, approved or rejected).
   */
  status;
  /**
   * Whether the packaging was verified.
   */
  packagingVerified;
  /**
   * Whether identity and labeling were verified.
   */
  identityVerified;
  /**
   * QC sampling status (pending, requested or done).
   */
  samplingStatus;
  /**
   * Batch the lot is allocated to, if any.
   */
  allocatedBatch;
}

/**
 * Response envelope for material lot collection queries.
 */
export interface MaterialLotsResponse extends BaseResponse {
  /**
   * Array of material lot resources included in the response.
   */
  materialLots;
}