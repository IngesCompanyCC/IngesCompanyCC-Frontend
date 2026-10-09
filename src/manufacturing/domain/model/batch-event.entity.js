/**
 * Represents an entry of the status history of a batch.
 */
export class BatchEvent  {
  /**
   * Unique identifier of the batch event.
   */
  #;

  /**
   * Code of the batch.
   */
  #;

  /**
   * What happened.
   */
  #;

  /**
   * Who or what was involved.
   */
  #;

  /**
   * When it happened (ISO 8601).
   */
  #;

  /**
   * Color of the entry (normal, warning or danger).
   */
  #;

  /**
   * Creates a new batch event.
   * @param batchEvent - Initial values of the batch event.
   */
  constructor(batchEvent) {
    this.#id = batchEvent.id;
    this.#batchCode = batchEvent.batchCode;
    this.#title = batchEvent.title;
    this.#detail = batchEvent.detail;
    this.#occurredAt = batchEvent.occurredAt;
    this.#tone = batchEvent.tone;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#batchCode; }
  set (value) { this.#batchCode = value; }

  get () { return this.#title; }
  set (value) { this.#title = value; }

  get () { return this.#detail; }
  set (value) { this.#detail = value; }

  get () { return this.#occurredAt; }
  set (value) { this.#occurredAt = value; }

  get () { return this.#tone; }
  set (value) { this.#tone = value; }
}