/**
 * Represents an invoice of a subscription.
 *
 * @class Invoice
 */
export class Invoice {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the invoice.
     * @param {number} params.subscriptionId - Identifier of the invoiced subscription.
     * @param {string} params.number - Invoice number.
     * @param {string} params.issuedAt - Issue date (ISO 8601).
     * @param {number} params.amount - Amount in US dollars, before tax.
     * @param {string} params.status - Payment status of the invoice (approved or declined).
     */
    constructor({id = 0, subscriptionId = 0, number = '', issuedAt = '', amount = 0, status = ''}) {
        this.id = id;
        this.subscriptionId = subscriptionId;
        this.number = number;
        this.issuedAt = issuedAt;
        this.amount = amount;
        this.status = status;
    }
}
