import {Subscription} from "../domain/model/subscription.entity.js";

/**
 * Maps subscriptions resources of the API to and from Subscription entities.
 *
 * @class SubscriptionAssembler
 */
export class SubscriptionAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {Subscription} The entity.
     */
    static toEntityFromResource(resource) {
        return new Subscription({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<Subscription>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {Subscription} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            organizationId: entity.organizationId,
            planKey: entity.planKey,
            billingCycle: entity.billingCycle,
            status: entity.status,
            paymentState: entity.paymentState,
            nextInvoiceDate: entity.nextInvoiceDate,
            autoRenew: entity.autoRenew,
            cardBrand: entity.cardBrand,
            cardLast4: entity.cardLast4,
            cardExpiry: entity.cardExpiry,
            billingEmail: entity.billingEmail
        };
    }
}
