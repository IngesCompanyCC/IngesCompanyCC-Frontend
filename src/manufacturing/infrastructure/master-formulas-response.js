/**
 * Resource representation of a master formula.
 */
export interface MasterFormulaResource extends BaseResource {
  /**
   * Unique identifier of the master formula.
   */
  id;
  /**
   * Code of the product.
   */
  productCode;
  /**
   * Version of the formula, such as v3.2.
   */
  version;
  /**
   * Status of the version (approved or draft).
   */
  status;
  /**
   * Quality manager who approved the version.
   */
  approvedBy;
  /**
   * Approval date (ISO 8601).
   */
  approvedAt;
  /**
   * Standard batch size in units.
   */
  batchSize;
}

/**
 * Response envelope for master formula collection queries.
 */
export interface MasterFormulasResponse extends BaseResponse {
  /**
   * Array of master formula resources included in the response.
   */
  masterFormulas;
}