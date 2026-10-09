/**
 * Represents a pharmaceutical product of the catalog.
 */
export class Product  {
  /**
   * Unique identifier of the product.
   */
  #;

  /**
   * Unique product code, such as AC500.
   */
  #;

  /**
   * Product name and strength.
   */
  #;

  /**
   * Dosage form (tablet, capsule...).
   */
  #;

  /**
   * Version of the current master formula, or empty.
   */
  #;

  /**
   * Status of the current master formula (approved, pending or none).
   */
  #;

  /**
   * Creates a new product.
   * @param product - Initial values of the product.
   */
  constructor(product) {
    this.#id = product.id;
    this.#code = product.code;
    this.#name = product.name;
    this.#dosageForm = product.dosageForm;
    this.#formulaVersion = product.formulaVersion;
    this.#formulaStatus = product.formulaStatus;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#code; }
  set (value) { this.#code = value; }

  get () { return this.#name; }
  set (value) { this.#name = value; }

  get () { return this.#dosageForm; }
  set (value) { this.#dosageForm = value; }

  get () { return this.#formulaVersion; }
  set (value) { this.#formulaVersion = value; }

  get () { return this.#formulaStatus; }
  set (value) { this.#formulaStatus = value; }
}