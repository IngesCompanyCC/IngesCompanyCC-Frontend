/**
 * Represents an operation of the manufacturing execution of an order.
 */
export class Operation  {
  /**
   * Unique identifier of the operation.
   */
  #;

  /**
   * Identifier of the production order.
   */
  #;

  /**
   * Position of the operation.
   */
  #;

  /**
   * Name of the operation.
   */
  #;

  /**
   * Equipment or station and its owner.
   */
  #;

  /**
   * Progress from 0 to 100.
   */
  #;

  /**
   * Status (complete, in-progress, on-hold or not-started).
   */
  #;

  /**
   * Record that explains the status, such as a deviation.
   */
  #;

  /**
   * Creates a new operation.
   * @param operation - Initial values of the operation.
   */
  constructor(operation) {
    this.#id = operation.id;
    this.#orderId = operation.orderId;
    this.#sequence = operation.sequence;
    this.#name = operation.name;
    this.#equipment = operation.equipment;
    this.#progress = operation.progress;
    this.#status = operation.status;
    this.#reference = operation.reference;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#orderId; }
  set (value) { this.#orderId = value; }

  get () { return this.#sequence; }
  set (value) { this.#sequence = value; }

  get () { return this.#name; }
  set (value) { this.#name = value; }

  get () { return this.#equipment; }
  set (value) { this.#equipment = value; }

  get () { return this.#progress; }
  set (value) { this.#progress = value; }

  get () { return this.#status; }
  set (value) { this.#status = value; }

  get () { return this.#reference; }
  set (value) { this.#reference = value; }
}