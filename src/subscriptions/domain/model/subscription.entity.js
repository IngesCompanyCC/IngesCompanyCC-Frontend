/**
 * Represents the subscription of an organization to a plan, paid through Niubiz.
 *
 * @class Subscription
 */
export class Subscription {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the subscription.
     * @param {number} params.organizationId - Identifier of the subscribed organization.
     * @param {string} params.planKey - Key of the subscribed plan.
     * @param {string} params.billingCycle - Billing cycle (monthly or annual).
     * @param {string} params.status - Status of the subscription (active or pending).
     * @param {string} params.paymentState - State of the last charge (approved or declined).
     * @param {string} params.nextInvoiceDate - Date of the next invoice (ISO 8601).
     * @param {boolean} params.autoRenew - Whether the subscription renews automatically.
     * @param {string} params.cardBrand - Brand of the card on file.
     * @param {string} params.cardLast4 - Last four digits of the card on file.
     * @param {string} params.cardExpiry - Expiry date of the card (MM/YYYY).
     * @param {string} params.billingEmail - Email that receives invoices and renewal reminders.
     */
    constructor({id = 0, organizationId = 0, planKey = '', billingCycle = '', status = '', paymentState = '', nextInvoiceDate = '', autoRenew = false, cardBrand = '', cardLast4 = '', cardExpiry = '', billingEmail = ''}) {
        this.id = id;
        this.organizationId = organizationId;
        this.planKey = planKey;
        this.billingCycle = billingCycle;
        this.status = status;
        this.paymentState = paymentState;
        this.nextInvoiceDate = nextInvoiceDate;
        this.autoRenew = autoRenew;
        this.cardBrand = cardBrand;
        this.cardLast4 = cardLast4;
        this.cardExpiry = cardExpiry;
        this.billingEmail = billingEmail;
    }
}
