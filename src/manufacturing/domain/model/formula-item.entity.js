/**
 * Represents a component or a process parameter of a master formula.
 *
 * @class FormulaItem
 */
export class FormulaItem {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the formula item.
     * @param {number} params.formulaId - Identifier of the master formula.
     * @param {string} params.kind - Kind of item (component or parameter).
     * @param {string} params.name - Name of the component or parameter.
     * @param {string} params.role - Function of the component, such as binder.
     * @param {string} params.target - Quantity per batch or target value, with its unit.
     * @param {string} params.tolerance - Allowed tolerance.
     * @param {string} params.control - Supplier, lot or sensor that controls the item.
     */
    constructor({id = 0, formulaId = 0, kind = '', name = '', role = '', target = '', tolerance = '', control = ''}) {
        this.id = id;
        this.formulaId = formulaId;
        this.kind = kind;
        this.name = name;
        this.role = role;
        this.target = target;
        this.tolerance = tolerance;
        this.control = control;
    }
}
