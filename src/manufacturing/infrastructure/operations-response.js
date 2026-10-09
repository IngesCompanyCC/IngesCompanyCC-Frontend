/**
 * Resource representation of a operation.
 */
export interface OperationResource extends BaseResource {
  /**
   * Unique identifier of the operation.
   */
  id;
  /**
   * Identifier of the production order.
   */
  orderId;
  /**
   * Position of the operation.
   */
  sequence;
  /**
   * Name of the operation.
   */
  name;
  /**
   * Equipment or station and its owner.
   */
  equipment;
  /**
   * Progress from 0 to 100.
   */
  progress;
  /**
   * Status (complete, in-progress, on-hold or not-started).
   */
  status;
  /**
   * Record that explains the status, such as a deviation.
   */
  reference;
}

/**
 * Response envelope for operation collection queries.
 */
export interface OperationsResponse extends BaseResponse {
  /**
   * Array of operation resources included in the response.
   */
  operations;
}