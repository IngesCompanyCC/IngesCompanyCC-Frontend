/**
 * Resource representation of a batch.
 */
export interface BatchResource extends BaseResource {
  /**
   * Unique identifier of the batch.
   */
  id;
  /**
   * Unique batch code, such as B-26041.
   */
  code;
  /**
   * Code of the product.
   */
  productCode;
  /**
   * Code of the production order.
   */
  orderCode;
  /**
   * Quantity in units.
   */
  quantity;
  /**
   * Manufacturing line.
   */
  line;
  /**
   * Person responsible for the batch.
   */
  owner;
  /**
   * Status (planned, in-progress, on-hold, release-requested or released).
   */
  status;
  /**
   * Progress from 0 to 100.
   */
  progress;
  /**
   * Open incident that affects the batch, if any.
   */
  incident;
  /**
   * Last activity on the batch.
   */
  lastActivity;
  /**
   * Date of the last activity (ISO 8601).
   */
  lastActivityAt;
}

/**
 * Response envelope for batch collection queries.
 */
export interface BatchesResponse extends BaseResponse {
  /**
   * Array of batch resources included in the response.
   */
  batches;
}