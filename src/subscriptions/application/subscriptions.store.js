import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {SubscriptionsApi} from "../infrastructure/subscriptions-api.js";
import {PlanAssembler} from "../infrastructure/plan.assembler.js";
import {SubscriptionAssembler} from "../infrastructure/subscription.assembler.js";
import {InvoiceAssembler} from "../infrastructure/invoice.assembler.js";
import {Subscription} from "../domain/model/subscription.entity.js";
import {Invoice} from "../domain/model/invoice.entity.js";

const subscriptionsApi = new SubscriptionsApi();

/**
 * Application service store for the Subscriptions & Payments bounded context.
 * It holds the plans, the subscription of the organization and its invoices, and applies the plan
 * change and the payment retry.
 *
 * @returns {Object} Store state and actions.
 */
const useSubscriptionsStore = defineStore('subscriptions', () => {
    /** @type {import('vue').Ref<Array<import('../domain/model/plan.entity.js').Plan>>} Plans offered by DoofPlus. */
    const plans = ref([]);
    /** @type {import('vue').Ref<Subscription|null>} Subscription of the current organization. */
    const subscription = ref(null);
    /** @type {import('vue').Ref<Array<Invoice>>} Invoices of the subscription. */
    const allInvoices = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether a request is running. */
    const loading = ref(false);
    /** @type {import('vue').Ref<Array<Error>>} Errors of the last requests. */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<Array<Invoice>>} Invoices of the subscription, newest first. */
    const invoices = computed(() => [...allInvoices.value].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));
    /** @type {import('vue').ComputedRef<Object|undefined>} Plan of the subscription. */
    const currentPlan = computed(() => plans.value.find(plan => plan.key === subscription.value?.planKey));
    /** @type {import('vue').ComputedRef<number>} Amount charged per billing cycle. */
    const currentAmount = computed(() => {
        if (!currentPlan.value) return 0;
        return subscription.value?.billingCycle === 'annual' ? currentPlan.value.annualPrice : currentPlan.value.monthlyPrice;
    });

    /** Loads the plans, which are public. */
    function fetchPlans() {
        subscriptionsApi.getPlans()
            .then(response => plans.value = PlanAssembler.toEntitiesFromResponse(response))
            .catch(error => errors.value.push(error));
    }

    /**
     * Loads the subscription of an organization and its invoices.
     * @param {number} organizationId - Identifier of the organization.
     */
    function fetchForOrganization(organizationId) {
        loading.value = true;
        subscriptionsApi.getSubscriptions()
            .then(response => {
                subscription.value = SubscriptionAssembler.toEntitiesFromResponse(response)
                    .find(item => item.organizationId === organizationId) ?? null;
                if (!subscription.value) return;
                return subscriptionsApi.getInvoices().then(invoicesResponse => allInvoices.value = InvoiceAssembler
                    .toEntitiesFromResponse(invoicesResponse).filter(invoice => invoice.subscriptionId === subscription.value.id));
            })
            .catch(error => errors.value.push(error))
            .finally(() => loading.value = false);
    }

    /**
     * Creates the pending subscription of a newly registered organization.
     * @param {number} organizationId - Identifier of the new organization.
     * @param {string} planKey - Key of the selected plan.
     * @param {string} billingCycle - Selected billing cycle (monthly or annual).
     * @param {string} billingEmail - Email of the administrator.
     * @returns {Promise<void>} Resolves when the subscription was created.
     */
    function subscribe(organizationId, planKey, billingCycle, billingEmail) {
        const nextInvoice = new Date();
        nextInvoice.setMonth(nextInvoice.getMonth() + (billingCycle === 'annual' ? 12 : 1));
        const {id, ...resource} = SubscriptionAssembler.toResourceFromEntity(new Subscription({
            organizationId, planKey, billingCycle, status: 'pending', paymentState: 'approved',
            nextInvoiceDate: nextInvoice.toISOString().slice(0, 10), autoRenew: true, billingEmail
        }));
        return subscriptionsApi.createSubscription(resource)
            .then(response => subscription.value = SubscriptionAssembler.toEntityFromResource(response.data))
            .catch(error => errors.value.push(error));
    }

    /**
     * Persists changes to the subscription and refreshes the state.
     * @param {Object} changes - Fields to change.
     * @returns {Promise<void>} Resolves when the subscription was saved.
     */
    function saveSubscription(changes) {
        loading.value = true;
        const resource = {...SubscriptionAssembler.toResourceFromEntity(subscription.value), ...changes};
        return subscriptionsApi.updateSubscription(resource)
            .then(response => subscription.value = SubscriptionAssembler.toEntityFromResource(response.data))
            .catch(error => errors.value.push(error))
            .finally(() => loading.value = false);
    }

    /**
     * Changes the plan or billing cycle of the subscription. Only administrators reach this action.
     * @param {string} planKey - Key of the new plan.
     * @param {string} billingCycle - New billing cycle.
     * @returns {Promise<void>|undefined} Resolves when the change was saved.
     */
    function changePlan(planKey, billingCycle) {
        if (!subscription.value) return;
        return saveSubscription({planKey, billingCycle});
    }

    /**
     * Retries a declined charge: Niubiz approves it, an invoice is issued and the subscription becomes active.
     * @returns {Promise<void>|undefined} Resolves when the payment was registered.
     */
    function retryPayment() {
        if (!subscription.value) return;
        const issuedAt = new Date().toISOString().slice(0, 10);
        const {id, ...invoice} = InvoiceAssembler.toResourceFromEntity(new Invoice({
            subscriptionId: subscription.value.id, number: `INV-${issuedAt.slice(0, 4)}-${issuedAt.slice(5, 7)}01`,
            issuedAt, amount: currentAmount.value, status: 'approved'
        }));
        subscriptionsApi.createInvoice(invoice)
            .then(response => allInvoices.value.push(InvoiceAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
        return saveSubscription({paymentState: 'approved', status: 'active'});
    }

    fetchPlans();

    return {
        plans,
        subscription,
        invoices,
        currentPlan,
        currentAmount,
        loading,
        errors,
        fetchPlans,
        fetchForOrganization,
        subscribe,
        changePlan,
        retryPayment
    };
});

export default useSubscriptionsStore;
