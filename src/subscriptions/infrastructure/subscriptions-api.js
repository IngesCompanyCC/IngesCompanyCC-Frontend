import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const plansEndpointPath = import.meta.env.VITE_PLANS_ENDPOINT_PATH;
const subscriptionsEndpointPath = import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH;
const invoicesEndpointPath = import.meta.env.VITE_INVOICES_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the Subscriptions & Payments endpoints.
 *
 * @class SubscriptionsApi
 * @extends BaseApi
 */
export class SubscriptionsApi extends BaseApi {
    #plansEndpoint;
    #subscriptionsEndpoint;
    #invoicesEndpoint;

    /** Creates one endpoint client per collection. */
    constructor() {
        super();
        this.#plansEndpoint = new BaseEndpoint(this, plansEndpointPath);
        this.#subscriptionsEndpoint = new BaseEndpoint(this, subscriptionsEndpointPath);
        this.#invoicesEndpoint = new BaseEndpoint(this, invoicesEndpointPath);
    }

    /**
     * Retrieves the plans.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the plans.
     */
    getPlans() {
        return this.#plansEndpoint.getAll();
    }

    /**
     * Retrieves the subscriptions.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the subscriptions.
     */
    getSubscriptions() {
        return this.#subscriptionsEndpoint.getAll();
    }

    /**
     * Creates a subscription resource.
     * @param {Object} resource - Resource built by the SubscriptionAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createSubscription(resource) {
        return this.#subscriptionsEndpoint.create(resource);
    }

    /**
     * Updates a subscription resource.
     * @param {Object} resource - Resource built by the SubscriptionAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateSubscription(resource) {
        return this.#subscriptionsEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the invoices.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the invoices.
     */
    getInvoices() {
        return this.#invoicesEndpoint.getAll();
    }

    /**
     * Creates a invoice resource.
     * @param {Object} resource - Resource built by the InvoiceAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createInvoice(resource) {
        return this.#invoicesEndpoint.create(resource);
    }
}
