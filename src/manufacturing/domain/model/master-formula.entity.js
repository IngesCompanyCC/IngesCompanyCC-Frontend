/**
 * Represents an approved or draft version of the master formula of a product.
 */
export class MasterFormula  {
  /**
   * Unique identifier of the master formula.
   */
  #;

  /**
   * Code of the product.
   */
  #;

  /**
   * Version of the formula, such as v3.2.
   */
  #;

  /**
   * Status of the version (approved or draft).
   */
  #;

  /**
   * Quality manager who approved the version.
   */
  #;

  /**
   * Approval date (ISO 8601).
   */
  #;

  /**
   * Standard batch size in units.
   */
  #;

  /**
   * Creates a new master formula.
   * @param masterFormula - Initial values of the master formula.
   */
  constructor(masterFormula) {
    this.#id = masterFormula.id;
    this.#productCode = masterFormula.productCode;
    this.#version = masterFormula.version;
    this.#status = masterFormula.status;
    this.#approvedBy = masterFormula.approvedBy;
    this.#approvedAt = masterFormula.approvedAt;
    this.#batchSize = masterFormula.batchSize;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#productCode; }
  set (value) { this.#productCode = value; }

  get () { return this.#version; }
  set (value) { this.#version = value; }

  get () { return this.#status; }
  set (value) { this.#status = value; }

  get () { return this.#approvedBy; }
  set (value) { this.#approvedBy = value; }

  get () { return this.#approvedAt; }
  set (value) { this.#approvedAt = value; }

  get () { return this.#batchSize; }
  set (value) { this.#batchSize = value; }
}