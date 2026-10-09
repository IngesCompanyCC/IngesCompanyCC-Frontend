/**
 * Resource representation of a production order.
 */
export interface ProductionOrderResource extends BaseResource {
  /**
   * Unique identifier of the production order.
   */
  id;
  /**
   * Order code, such as PO-26041.
   */
  code;
  /**
   * Code of the product.
   */
  productCode;
  /**
   * Identifier of the master formula used.
   */
  formulaId;
  /**
   * Code of the batch produced by the order.
   */
  batchCode;
  /**
   * Planned quantity in units.
   */
  plannedQuantity;
  /**
   * Manufacturing line.
   */
  line;
  /**
   * Status of the order (planned, approved, in-progress, on-hold or completed).
   */
  status;
  /**
   * Planned start (ISO 8601).
   */
  plannedStart;
  /**
   * Planned end (ISO 8601).
   */
  plannedEnd;
}

/**
 * Response envelope for production order collection queries.
 */
export interface ProductionOrdersResponse extends BaseResponse {
  /**
   * Array of production order resources included in the response.
   */
  productionOrders;
}