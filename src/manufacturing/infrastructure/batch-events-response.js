/**
 * Resource representation of a batch event.
 */
export interface BatchEventResource extends BaseResource {
  /**
   * Unique identifier of the batch event.
   */
  id;
  /**
   * Code of the batch.
   */
  batchCode;
  /**
   * What happened.
   */
  title;
  /**
   * Who or what was involved.
   */
  detail;
  /**
   * When it happened (ISO 8601).
   */
  occurredAt;
  /**
   * Color of the entry (normal, warning or danger).
   */
  tone;
}

/**
 * Response envelope for batch event collection queries.
 */
export interface BatchEventsResponse extends BaseResponse {
  /**
   * Array of batch event resources included in the response.
   */
  batchEvents;
}