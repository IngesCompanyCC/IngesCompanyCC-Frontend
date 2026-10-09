/**
 * Resource representation of a formula item.
 */
export interface FormulaItemResource extends BaseResource {
  /**
   * Unique identifier of the formula item.
   */
  id;
  /**
   * Identifier of the master formula.
   */
  formulaId;
  /**
   * Kind of item (component or parameter).
   */
  kind;
  /**
   * Name of the component or parameter.
   */
  name;
  /**
   * Function of the component, such as binder.
   */
  role;
  /**
   * Quantity per batch or target value, with its unit.
   */
  target;
  /**
   * Allowed tolerance.
   */
  tolerance;
  /**
   * Supplier, lot or sensor that controls the item.
   */
  control;
}

/**
 * Response envelope for formula item collection queries.
 */
export interface FormulaItemsResponse extends BaseResponse {
  /**
   * Array of formula item resources included in the response.
   */
  formulaItems;
}