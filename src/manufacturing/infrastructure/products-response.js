/**
 * Resource representation of a product.
 */
export interface ProductResource extends BaseResource {
  /**
   * Unique identifier of the product.
   */
  id;
  /**
   * Unique product code, such as AC500.
   */
  code;
  /**
   * Product name and strength.
   */
  name;
  /**
   * Dosage form (tablet, capsule...).
   */
  dosageForm;
  /**
   * Version of the current master formula, or empty.
   */
  formulaVersion;
  /**
   * Status of the current master formula (approved, pending or none).
   */
  formulaStatus;
}

/**
 * Response envelope for product collection queries.
 */
export interface ProductsResponse extends BaseResponse {
  /**
   * Array of product resources included in the response.
   */
  products;
}