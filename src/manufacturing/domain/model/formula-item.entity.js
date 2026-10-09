/**
 * Represents a component or a process parameter of a master formula.
 */
export class FormulaItem  {
  /**
   * Unique identifier of the formula item.
   */
  #;

  /**
   * Identifier of the master formula.
   */
  #;

  /**
   * Kind of item (component or parameter).
   */
  #;

  /**
   * Name of the component or parameter.
   */
  #;

  /**
   * Function of the component, such as binder.
   */
  #;

  /**
   * Quantity per batch or target value, with its unit.
   */
  #;

  /**
   * Allowed tolerance.
   */
  #;

  /**
   * Supplier, lot or sensor that controls the item.
   */
  #;

  /**
   * Creates a new formula item.
   * @param formulaItem - Initial values of the formula item.
   */
  constructor(formulaItem) {
    this.#id = formulaItem.id;
    this.#formulaId = formulaItem.formulaId;
    this.#kind = formulaItem.kind;
    this.#name = formulaItem.name;
    this.#role = formulaItem.role;
    this.#target = formulaItem.target;
    this.#tolerance = formulaItem.tolerance;
    this.#control = formulaItem.control;
  }

  get () { return this.#id; }
  set (value) { this.#id = value; }

  get () { return this.#formulaId; }
  set (value) { this.#formulaId = value; }

  get () { return this.#kind; }
  set (value) { this.#kind = value; }

  get () { return this.#name; }
  set (value) { this.#name = value; }

  get () { return this.#role; }
  set (value) { this.#role = value; }

  get () { return this.#target; }
  set (value) { this.#target = value; }

  get () { return this.#tolerance; }
  set (value) { this.#tolerance = value; }

  get () { return this.#control; }
  set (value) { this.#control = value; }
}