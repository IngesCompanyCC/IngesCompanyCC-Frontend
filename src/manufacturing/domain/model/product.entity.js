/**
 * Represents a pharmaceutical product of the catalog.
 *
 * @class Product
 */
export class Product {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the product.
     * @param {string} params.code - Unique product code, such as AC500.
     * @param {string} params.name - Product name and strength.
     * @param {string} params.dosageForm - Dosage form (tablet, capsule...).
     * @param {string} params.formulaVersion - Version of the current master formula, or empty.
     * @param {string} params.formulaStatus - Status of the current master formula (approved, pending or none).
     */
    constructor({id = 0, code = '', name = '', dosageForm = '', formulaVersion = '', formulaStatus = ''}) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.dosageForm = dosageForm;
        this.formulaVersion = formulaVersion;
        this.formulaStatus = formulaStatus;
    }
}
