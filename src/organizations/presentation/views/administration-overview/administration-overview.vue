<script setup>
import {computed, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate, formatDateTime} from "../../../../shared/presentation/format.js";
import useOrganizationsStore from "../../../application/organizations.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";
import useSubscriptionsStore from "../../../../subscriptions/application/subscriptions.store.js";

/**
 * Administration overview: users, organization and facilities, subscription, account health and activity.
 */
const { t, locale } = useI18n();
const store = useOrganizationsStore();
const iamStore = useIamStore();
const subscriptionsStore = useSubscriptionsStore();

/** Accounts invited that have not verified their email yet. */
const invitedUsers = computed(() => iamStore.users.filter(user => user.status === 'invited'));

/** Users that need attention first: invited accounts, then the rest. */
const usersRequiringAttention = computed(() => [...iamStore.users]
    .sort((a, b) => Number(b.status === 'invited') - Number(a.status === 'invited')).slice(0, 5));

/** The organization followed by its facilities. */
const sites = computed(() => {
  const organization = store.organization;
  const rows = organization ? [{
    key: 'organization', name: organization.legalName, detail: `RUC ${organization.ruc}`, region: organization.region,
    owner: organization.ownerName, status: organization.status, organization: true
  }] : [];
  return rows.concat(store.facilities.map(facility => ({
    key: `facility-${facility.id}`, name: facility.name, detail: t(`organizations.facility-type.${facility.type}`),
    region: facility.timezone, owner: facility.ownerName, status: facility.status, organization: false
  })));
});

/** Loads the data shown in the overview. */
onMounted(() => {
  store.fetchOrganization();
  iamStore.fetchUsers();
  if (iamStore.currentUser) subscriptionsStore.fetchForOrganization(iamStore.currentUser.organizationId);
});
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.administration.short'), t('nav.administration-overview')]"
                 :title="t('nav.administration-overview')" :subtitle="t('organizations.overview.subtitle')"/>

    <pv-card class="summary">
      <template #content>
        <div>
          <p class="stat-label">{{ t('organizations.overview.active-users') }}</p>
          <p class="stat-value">{{ iamStore.activeUsers.length }}</p>
          <span class="chip chip-warning align-self-start">{{ t('organizations.overview.invitations-pending', { count: invitedUsers.length }) }}</span>
        </div>
        <div>
          <p class="stat-label">{{ t('organizations.overview.organizations') }}</p>
          <p class="stat-value">1</p>
          <p class="stat-note">{{ store.organization?.legalName }} · {{ t('organizations.overview.facilities-count', { count: store.facilities.length }) }}</p>
        </div>
        <div>
          <p class="stat-label">{{ t('organizations.overview.subscription') }}</p>
          <p class="stat-value">{{ subscriptionsStore.currentPlan?.name }}</p>
          <p v-if="subscriptionsStore.subscription" class="row">
            <span class="chip" :class="subscriptionsStore.subscription.status === 'active' ? 'chip-success' : 'chip-warning'">
              {{ t(`organizations.status.${subscriptionsStore.subscription.status}`) }}
            </span>
            <span class="stat-note">{{ t('organizations.overview.renews') }} {{ formatDate(subscriptionsStore.subscription.nextInvoiceDate, locale) }}</span>
          </p>
        </div>
        <div>
          <p class="stat-label">{{ t('organizations.overview.access-reviews') }}</p>
          <p class="stat-value">{{ invitedUsers.length + 1 }}</p>
          <span class="chip chip-warning align-self-start">{{ t('organizations.overview.due') }}</span>
        </div>
      </template>
    </pv-card>

    <div v-if="subscriptionsStore.subscription?.paymentState === 'declined'" class="alert declined" role="alert">
      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
      <div class="flex-1">
        <strong>{{ t('subscriptions.declined-title') }}</strong>
        <p>{{ t('subscriptions.declined-text') }}</p>
      </div>
      <pv-button as-child v-slot="slotProps" severity="danger">
        <router-link to="/administration/subscription" :class="slotProps['class']">{{ t('subscriptions.retry') }} →</router-link>
      </pv-button>
    </div>

    <div class="columns">
      <div class="stack">
        <pv-card>
          <template #title>{{ t('organizations.overview.users-attention') }}</template>
          <template #content>
            <pv-data-table :value="usersRequiringAttention" data-key="id" scrollable :aria-label="t('organizations.overview.users-attention')">
              <pv-column :header="t('iam.users.user')">
                <template #body="{ data }"><strong>{{ data.fullName }}</strong></template>
              </pv-column>
              <pv-column :header="t('iam.users.profile')">
                <template #body="{ data }">{{ t(`roles.${data.role}`) }}</template>
              </pv-column>
              <pv-column field="facility" :header="t('iam.users.facility')"/>
              <pv-column :header="t('iam.users.status')">
                <template #body="{ data }">
                  <span class="chip" :class="data.status === 'active' ? 'chip-success' : 'chip-info'">{{ t(`iam.status.${data.status}`) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>

        <pv-card>
          <template #title>{{ t('organizations.overview.facilities') }}</template>
          <template #content>
            <pv-data-table :value="sites" data-key="key" scrollable :aria-label="t('organizations.overview.facilities')"
                           :row-class="site => ({ highlight: site.organization })">
              <pv-column :header="t('organizations.overview.org-facility')">
                <template #body="{ data }">
                  <strong :class="{ code: data.organization }">{{ data.name }}</strong>
                  <span class="sub">{{ data.detail }}</span>
                </template>
              </pv-column>
              <pv-column field="region" :header="t('organizations.overview.region')"/>
              <pv-column field="owner" :header="t('organizations.overview.owner')"/>
              <pv-column :header="t('iam.users.status')">
                <template #body="{ data }"><span class="chip chip-success">{{ t(`organizations.status.${data.status}`) }}</span></template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <aside class="stack">
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('organizations.overview.account-health') }}</h2>
            <div class="health ok">
              <strong>{{ t('organizations.overview.plan-active', { plan: subscriptionsStore.currentPlan?.name }) }}</strong>
              <span>{{ t('organizations.overview.plan-active-text', { count: iamStore.activeUsers.length }) }}</span>
            </div>
            <div class="health ok">
              <strong>{{ t('organizations.overview.two-factor') }}</strong>
              <span>{{ t('organizations.overview.two-factor-text') }}</span>
            </div>
            <div class="health warning">
              <strong>{{ t('organizations.overview.access-review') }}</strong>
              <span>{{ t('organizations.overview.access-review-text', { count: invitedUsers.length + 1 }) }}</span>
            </div>
          </template>
        </pv-card>

        <pv-card class="panel">
          <template #content>
            <h2>{{ t('organizations.overview.activity') }}</h2>
            <ol class="timeline">
              <li v-for="activity in store.activities" :key="activity.id">
                <strong>{{ activity.title }}</strong>
                <span>{{ activity.actor }} · {{ formatDateTime(activity.occurredAt, locale) }} UTC</span>
              </li>
            </ol>
          </template>
        </pv-card>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.stat-note {
  color: var(--muted);
  font-size: 12px;
}

.code {
  color: var(--teal);
}

.declined {
  border-color: var(--danger-border);
  border-left: 4px solid var(--danger);
  background: var(--danger-bg);
  color: var(--danger-dark);
}

.health {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px 12px 34px;
  border-radius: 8px;
  font-size: 13px;
}

.health strong {
  position: relative;
}

.health strong::before {
  content: "";
  position: absolute;
  top: 5px;
  left: -20px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.health.ok { background: var(--mint); }
.health.ok strong::before { background: #22c55e; }
.health.warning { background: #fef9c3; }
.health.warning strong::before { background: var(--warning-strong); }

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0 0 0 20px;
  border-left: 1px solid var(--border);
  list-style: none;
}

.timeline li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}

.timeline li::before {
  content: "";
  position: absolute;
  top: 5px;
  left: -24px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--teal);
}

.timeline span {
  color: var(--muted);
  font-size: 12px;
}
</style>
