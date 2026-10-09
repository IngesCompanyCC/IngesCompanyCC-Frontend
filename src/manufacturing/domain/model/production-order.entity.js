/**
 * Represents a production order issued against an approved master formula.
 */
export class ProductionOrder  {
  /**
   * Unique identifier of the production order.
   */
  #;

  /**
   * Order code, such as PO-26041.
   */
  #;

  /**
   * Code of the product.
   */
  #;

  /**
   * Identifier of the master formula used.
   */
  #;

  /**
   * Code of the batch produced by the order.
   */
  #;

  /**
   * Planned quantity in units.
   */
  #;

  /**
   * Manufacturing line.
   */
  #;

  /**
   * Status of the order (planned, approved, in-progress, on-hold or completed).
   */
  #;

  /**
   * Planned start (ISO 8601).
   */
  #;

  /**
   * Planned end (ISO 8601).
   */
  #;

  /**
   * Creates a new production order.
   * @param productionOrder - Initial values of the production order.
   */
  constructor(productionOrder) {
    this.#id = productionOrder.id;
    this.#code = productionOrder.code;
    this.#productCode = productionOrder.productCode;
    this.#formulaId = productionOrder.formulaId;
    this.#batchCode = productionOrder.batchCode;
    this.#plannedQuantity = productionOrder.plannedQuantity;
    this.#line = productionOrder.line;
    this.#status = productionOrder.status;
    this.#plannedStart = productionOrder.plannedStart;
    this.#plannedEnd = productionOrder.plannedEnd;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#code; }
  set (value) { this.#code = value; }

  get () { return this.#productCode; }
  set (value) { this.#productCode = value; }

  get () { return this.#formulaId; }
  set (value) { this.#formulaId = value; }

  get () { return this.#batchCode; }
  set (value) { this.#batchCode = value; }

  get () { return this.#plannedQuantity; }
  set (value) { this.#plannedQuantity = value; }

  get () { return this.#line; }
  set (value) { this.#line = value; }

  get () { return this.#status; }
  set (value) { this.#status = value; }

  get () { return this.#plannedStart; }
  set (value) { this.#plannedStart = value; }

  get () { return this.#plannedEnd; }
  set (value) { this.#plannedEnd = value; }
}