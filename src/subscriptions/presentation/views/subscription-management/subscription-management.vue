<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatCurrency, formatDate} from "../../../../shared/presentation/format.js";
import useSubscriptionsStore from "../../../application/subscriptions.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";

/**
 * Subscription and payments of the organization: plan, billing history, plan change review and payment retry.
 */
const { t, locale } = useI18n();
const store = useSubscriptionsStore();
const iamStore = useIamStore();

/** Plan proposed in the plan change review. */
const proposedPlanKey = ref(null);
/** Billing cycle proposed in the plan change review. */
const proposedCycle = ref(null);

const planOptions = computed(() => store.plans.map(plan => ({ label: plan.name, value: plan.key })));
const cycleOptions = computed(() => ['monthly', 'annual'].map(value => ({ label: t(`subscriptions.cycle.${value}`), value })));

/** Plan proposed in the review, or the current plan. */
const proposedPlan = computed(() => store.plans.find(plan => plan.key === (proposedPlanKey.value ?? store.subscription?.planKey)));
/** Billing cycle proposed in the review, or the current one. */
const cycle = computed(() => proposedCycle.value ?? store.subscription?.billingCycle ?? 'monthly');
/** Amount of the next invoice with the proposed plan and cycle. */
const proposedAmount = computed(() => !proposedPlan.value ? 0
    : cycle.value === 'annual' ? proposedPlan.value.annualPrice : proposedPlan.value.monthlyPrice);
/** Whether the review proposes a change. */
const hasChange = computed(() => !!store.subscription
    && (proposedPlan.value?.key !== store.subscription.planKey || cycle.value !== store.subscription.billingCycle));
/** Share of the user limit in use. */
const usersProgress = computed(() => {
  const limit = store.currentPlan?.userLimit;
  return limit ? Math.min(100, iamStore.activeUsers.length / limit * 100) : 0;
});

/** Loads the subscription of the organization and its users. */
onMounted(() => {
  if (!iamStore.currentUser) return;
  store.fetchForOrganization(iamStore.currentUser.organizationId);
  iamStore.fetchUsers();
});

/** Discards the proposed change. */
const cancelChange = () => {
  proposedPlanKey.value = null;
  proposedCycle.value = null;
};

/** Confirms the plan change. */
const confirmChange = () => {
  if (!proposedPlan.value || !hasChange.value) return;
  store.changePlan(proposedPlan.value.key, cycle.value);
  cancelChange();
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.administration.short'), t('nav.subscription-payments')]"
                 :title="t('nav.subscription-payments')" :subtitle="t('subscriptions.subtitle')"/>

    <template v-if="store.subscription">
      <div class="stats">
        <pv-card class="stat">
          <template #content>
            <p class="stat-label">{{ t('subscriptions.current-plan') }}</p>
            <p class="stat-value">{{ store.currentPlan?.name }}</p>
            <span class="chip chip-teal">{{ t(`subscriptions.cycle.${store.subscription.billingCycle}`) }}</span>
          </template>
        </pv-card>
        <pv-card class="stat">
          <template #content>
            <p class="stat-label">{{ t('subscriptions.active-users') }}</p>
            <p class="stat-value">{{ iamStore.activeUsers.length }}</p>
            <pv-progress-bar v-if="store.currentPlan?.userLimit" :value="usersProgress" :show-value="false" class="usage"
                             :aria-label="t('subscriptions.active-users')"/>
            <p class="stat-note">
              {{ store.currentPlan?.userLimit ? t('subscriptions.user-limit', { limit: store.currentPlan.userLimit }) : t('subscriptions.unlimited') }}
            </p>
          </template>
        </pv-card>
        <pv-card class="stat">
          <template #content>
            <p class="stat-label">{{ t('subscriptions.amount') }}</p>
            <p class="stat-value">{{ formatCurrency(store.currentAmount, locale) }}</p>
            <p class="stat-note">{{ t(`subscriptions.per.${store.subscription.billingCycle}`) }} · {{ t('subscriptions.taxes') }}</p>
          </template>
        </pv-card>
        <pv-card class="stat">
          <template #content>
            <p class="stat-label">{{ t('subscriptions.next-invoice') }}</p>
            <p class="stat-value">{{ formatDate(store.subscription.nextInvoiceDate, locale) }}</p>
            <p class="stat-note">{{ t(store.subscription.autoRenew ? 'subscriptions.auto-renew' : 'subscriptions.no-auto-renew') }}</p>
          </template>
        </pv-card>
      </div>

      <div v-if="store.subscription.paymentState === 'declined'" class="alert declined" role="alert">
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
        <div class="flex-1">
          <strong>{{ t('subscriptions.declined-title') }}</strong>
          <p>{{ t('subscriptions.declined-text') }}</p>
        </div>
        <pv-button :label="`${t('subscriptions.retry')} →`" severity="danger" :loading="store.loading" @click="store.retryPayment()"/>
      </div>

      <div class="columns">
        <div class="stack">
          <pv-card>
            <template #title>{{ t('subscriptions.billing-history') }}</template>
            <template #content>
              <pv-data-table :value="store.invoices" data-key="id" scrollable :aria-label="t('subscriptions.billing-history')">
                <pv-column :header="t('subscriptions.invoice')">
                  <template #body="{ data }"><strong>{{ data.number }}</strong></template>
                </pv-column>
                <pv-column :header="t('subscriptions.date')">
                  <template #body="{ data }">{{ formatDate(data.issuedAt, locale) }}</template>
                </pv-column>
                <pv-column :header="t('subscriptions.amount-column')">
                  <template #body="{ data }">{{ formatCurrency(data.amount, locale, 2) }}</template>
                </pv-column>
                <pv-column :header="t('subscriptions.status')">
                  <template #body="{ data }">
                    <span class="chip" :class="data.status === 'approved' ? 'chip-success' : 'chip-danger'">{{ t(`subscriptions.payment.${data.status}`) }}</span>
                  </template>
                </pv-column>
                <template #empty><span class="muted">{{ t('subscriptions.no-invoices') }}</span></template>
              </pv-data-table>
            </template>
          </pv-card>

          <pv-card class="panel">
            <template #content>
              <h2>{{ t('subscriptions.review') }}</h2>
              <div class="form-grid">
                <div class="field">
                  <label for="review-plan">{{ t('subscriptions.plan') }}</label>
                  <pv-select input-id="review-plan" :model-value="proposedPlan?.key" :options="planOptions" option-label="label"
                             option-value="value" fluid @update:model-value="value => proposedPlanKey = value"/>
                </div>
                <div class="field">
                  <label for="review-cycle">{{ t('subscriptions.billing-cycle') }}</label>
                  <pv-select input-id="review-cycle" :model-value="cycle" :options="cycleOptions" option-label="label"
                             option-value="value" fluid @update:model-value="value => proposedCycle = value"/>
                </div>
              </div>
              <template v-if="hasChange">
                <span class="chip chip-warning align-self-start">{{ t('subscriptions.proposed-change') }}</span>
                <dl>
                  <dt>{{ t('subscriptions.current') }}</dt>
                  <dd>{{ store.currentPlan?.name }} · {{ t(`subscriptions.cycle.${store.subscription.billingCycle}`) }} · {{ formatCurrency(store.currentAmount, locale) }}</dd>
                  <dt>{{ t('subscriptions.proposed') }}</dt>
                  <dd><strong>{{ proposedPlan?.name }} · {{ t(`subscriptions.cycle.${cycle}`) }} · {{ formatCurrency(proposedAmount, locale) }}</strong></dd>
                  <dt>{{ t('subscriptions.effective') }}</dt>
                  <dd>{{ formatDate(store.subscription.nextInvoiceDate, locale) }} · {{ t('subscriptions.no-charge') }}</dd>
                </dl>
                <div class="row">
                  <pv-button :label="t('subscriptions.confirm')" :loading="store.loading" @click="confirmChange"/>
                  <pv-button :label="t('subscriptions.cancel')" text @click="cancelChange"/>
                </div>
              </template>
              <p v-else class="muted">{{ t('subscriptions.no-change') }}</p>
              <p class="small muted">{{ t('subscriptions.cancellation') }}</p>
            </template>
          </pv-card>
        </div>

        <aside class="stack">
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('subscriptions.payment-method') }}</h2>
              <div v-if="store.subscription.cardLast4" class="credit-card">
                <strong>•••• •••• •••• {{ store.subscription.cardLast4 }}</strong>
                <span>{{ store.subscription.cardBrand }} · Exp {{ store.subscription.cardExpiry }} · Niubiz</span>
                <span>{{ iamStore.currentUser?.organizationName }}</span>
              </div>
              <p v-else class="muted">{{ t('subscriptions.no-card') }}</p>
              <div>
                <p class="stat-label">{{ t('subscriptions.billing-contact') }}</p>
                <p>{{ store.subscription.billingEmail }}</p>
              </div>
            </template>
          </pv-card>
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('subscriptions.states') }}</h2>
              <div class="state state-declined">
                <i class="pi pi-times" aria-hidden="true"></i>
                <div><strong>{{ t('subscriptions.state-declined') }}</strong><p class="small">{{ t('subscriptions.state-declined-text') }}</p></div>
              </div>
              <div class="state state-upgrades">
                <i class="pi pi-lock" aria-hidden="true"></i>
                <div><strong>{{ t('subscriptions.state-upgrades') }}</strong><p class="small">{{ t('subscriptions.state-upgrades-text') }}</p></div>
              </div>
              <div class="state state-reminder">
                <i class="pi pi-bell" aria-hidden="true"></i>
                <div><strong>{{ t('subscriptions.state-reminder') }}</strong><p class="small">{{ t('subscriptions.state-reminder-text', { email: store.subscription.billingEmail }) }}</p></div>
              </div>
            </template>
          </pv-card>
        </aside>
      </div>
    </template>
    <p v-else-if="!store.loading" class="muted">{{ t('subscriptions.none') }}</p>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
}

.stat-note {
  color: var(--muted);
  font-size: 12px;
}

.stat .chip {
  align-self: flex-start;
}

.usage {
  height: 6px;
  margin: 4px 0 8px;
}

.declined {
  border-color: var(--danger-border);
  border-left: 4px solid var(--danger);
  background: var(--danger-bg);
  color: var(--danger-dark);
}

dl {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px 16px;
  margin: 0;
}

dt {
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

dd {
  margin: 0;
}

.credit-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--teal), var(--teal-dark));
  color: #fff;
  font-size: 13px;
}

.credit-card strong {
  font-size: 15px;
}

.state {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid;
  border-radius: 8px;
}

.state i {
  margin-top: 2px;
}

.state-declined { border-color: var(--danger-border); background: var(--danger-bg); color: var(--danger-dark); }
.state-upgrades { border-color: #bfdbfe; background: #eff6ff; color: var(--blue); }
.state-reminder { border-color: var(--warning-border); background: var(--warning-bg); color: var(--warning); }

@media (max-width: 600px) {
  dl {
    grid-template-columns: 1fr;
  }
}
</style>
