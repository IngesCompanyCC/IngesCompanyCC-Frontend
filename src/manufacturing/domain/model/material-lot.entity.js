/**
 * Represents a received lot of raw material and its quarantine inspection.
 */
export class MaterialLot  {
  /**
   * Unique identifier of the material lot.
   */
  #;

  /**
   * Internal lot code, such as RM-26104.
   */
  #;

  /**
   * Receipt code, such as RCV-26104.
   */
  #;

  /**
   * Material name.
   */
  #;

  /**
   * Category (api, excipient or packaging).
   */
  #;

  /**
   * Supplier name.
   */
  #;

  /**
   * Lot code of the supplier.
   */
  #;

  /**
   * Quantity received and packaging.
   */
  #;

  /**
   * Expiry date (ISO 8601).
   */
  #;

  /**
   * Storage location.
   */
  #;

  /**
   * File name of the certificate of analysis.
   */
  #;

  /**
   * Disposition (quarantine, sampling, inspection, approved or rejected).
   */
  #;

  /**
   * Whether the packaging was verified.
   */
  #;

  /**
   * Whether identity and labeling were verified.
   */
  #;

  /**
   * QC sampling status (pending, requested or done).
   */
  #;

  /**
   * Batch the lot is allocated to, if any.
   */
  #;

  /**
   * Creates a new material lot.
   * @param materialLot - Initial values of the material lot.
   */
  constructor(materialLot) {
    this.#id = materialLot.id;
    this.#code = materialLot.code;
    this.#receiptCode = materialLot.receiptCode;
    this.#material = materialLot.material;
    this.#category = materialLot.category;
    this.#supplier = materialLot.supplier;
    this.#supplierLot = materialLot.supplierLot;
    this.#quantity = materialLot.quantity;
    this.#expiryDate = materialLot.expiryDate;
    this.#storageLocation = materialLot.storageLocation;
    this.#certificate = materialLot.certificate;
    this.#status = materialLot.status;
    this.#packagingVerified = materialLot.packagingVerified;
    this.#identityVerified = materialLot.identityVerified;
    this.#samplingStatus = materialLot.samplingStatus;
    this.#allocatedBatch = materialLot.allocatedBatch;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#code; }
  set (value) { this.#code = value; }

  get () { return this.#receiptCode; }
  set (value) { this.#receiptCode = value; }

  get () { return this.#material; }
  set (value) { this.#material = value; }

  get () { return this.#category; }
  set (value) { this.#category = value; }

  get () { return this.#supplier; }
  set (value) { this.#supplier = value; }

  get () { return this.#supplierLot; }
  set (value) { this.#supplierLot = value; }

  get () { return this.#quantity; }
  set (value) { this.#quantity = value; }

  get () { return this.#expiryDate; }
  set (value) { this.#expiryDate = value; }

  get () { return this.#storageLocation; }
  set (value) { this.#storageLocation = value; }

  get () { return this.#certificate; }
  set (value) { this.#certificate = value; }

  get () { return this.#status; }
  set (value) { this.#status = value; }

  get () { return this.#packagingVerified; }
  set (value) { this.#packagingVerified = value; }

  get () { return this.#identityVerified; }
  set (value) { this.#identityVerified = value; }

  get () { return this.#samplingStatus; }
  set (value) { this.#samplingStatus = value; }

  get () { return this.#allocatedBatch; }
  set (value) { this.#allocatedBatch = value; }
}