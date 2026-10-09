/**
 * Represents a manufacturing batch and its quality gates.
 */
export class Batch  {
  /**
   * Unique identifier of the batch.
   */
  #;

  /**
   * Unique batch code, such as B-26041.
   */
  #;

  /**
   * Code of the product.
   */
  #;

  /**
   * Code of the production order.
   */
  #;

  /**
   * Quantity in units.
   */
  #;

  /**
   * Manufacturing line.
   */
  #;

  /**
   * Person responsible for the batch.
   */
  #;

  /**
   * Status (planned, in-progress, on-hold, release-requested or released).
   */
  #;

  /**
   * Progress from 0 to 100.
   */
  #;

  /**
   * Open incident that affects the batch, if any.
   */
  #;

  /**
   * Last activity on the batch.
   */
  #;

  /**
   * Date of the last activity (ISO 8601).
   */
  #;

  /**
   * Creates a new batch.
   * @param batch - Initial values of the batch.
   */
  constructor(batch) {
    this.#id = batch.id;
    this.#code = batch.code;
    this.#productCode = batch.productCode;
    this.#orderCode = batch.orderCode;
    this.#quantity = batch.quantity;
    this.#line = batch.line;
    this.#owner = batch.owner;
    this.#status = batch.status;
    this.#progress = batch.progress;
    this.#incident = batch.incident;
    this.#lastActivity = batch.lastActivity;
    this.#lastActivityAt = batch.lastActivityAt;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#code; }
  set (value) { this.#code = value; }

  get () { return this.#productCode; }
  set (value) { this.#productCode = value; }

  get () { return this.#orderCode; }
  set (value) { this.#orderCode = value; }

  get () { return this.#quantity; }
  set (value) { this.#quantity = value; }

  get () { return this.#line; }
  set (value) { this.#line = value; }

  get () { return this.#owner; }
  set (value) { this.#owner = value; }

  get () { return this.#status; }
  set (value) { this.#status = value; }

  get () { return this.#progress; }
  set (value) { this.#progress = value; }

  get () { return this.#incident; }
  set (value) { this.#incident = value; }

  get () { return this.#lastActivity; }
  set (value) { this.#lastActivity = value; }

  get () { return this.#lastActivityAt; }
  set (value) { this.#lastActivityAt = value; }
}