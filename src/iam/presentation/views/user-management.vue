<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import useIamStore from "../../application/iam.store.js";

/**
 * Users and profiles of the laboratory (US55): user directory, permission matrix by role and the invitations
 * sent by the administrator.
 */
const { t } = useI18n();
const route = useRoute();
const store = useIamStore();

/** Email of the invitation that was just sent, shown in the confirmation. */
const sent = computed(() => route.query.sent ?? '');
/** Selected tab: users, profiles or invitations. */
const selectedTab = ref(['users', 'profiles', 'invitations'].includes(route.query.tab) ? route.query.tab : 'users');
/** Role whose permissions are shown on the right. */
const selectedRole = ref('qa-specialist');
const selectedProfile = computed(() => store.roleProfiles.find(profile => profile.key === selectedRole.value));

const tabs = computed(() => [
  { value: 'users', label: t('iam.users.tab-users'), count: store.users.length, tone: '' },
  { value: 'profiles', label: t('iam.users.tab-profiles'), count: store.roleProfiles.length, tone: 'neutral' },
  { value: 'invitations', label: t('iam.users.tab-invitations'), count: store.pendingInvitations.length, tone: 'warning' }
]);

/**
 * Color tone of a role chip.
 * @param {string} role - Role key.
 * @returns {string} Tone of the role profile.
 */
const toneOf = (role) => store.roleProfiles.find(profile => profile.key === role)?.tone ?? 'neutral';

/**
 * Translation key of a permission text (e.g. "Release if authorized" -> release-if-authorized).
 * @param {string} value - Permission text of the profile.
 * @returns {string} Normalized key.
 */
const normalizeKey = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Translated list of the records a profile can create and edit.
 * @param {import('../../domain/model/role-profile.entity.js').RoleProfile} profile - The role profile.
 * @returns {string} Comma separated records, or "None".
 */
const createEditOf = (profile) => profile.createEdit.length
    ? profile.createEdit.map(item => t(`iam.users.permissions.${item.toLowerCase()}`)).join(', ')
    : t('iam.users.none');

onMounted(() => store.fetchDirectory());
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.administration.short'), t('nav.users-profiles')]"
                 :title="t('nav.users-profiles')" :subtitle="t('iam.users.subtitle')">
      <pv-button as-child v-slot="slotProps">
        <router-link to="/administration/users/invite" :class="slotProps['class']">
          <i class="pi pi-user-plus" aria-hidden="true"></i>{{ t('iam.users.invite') }}
        </router-link>
      </pv-button>
    </page-header>

    <pv-select-button v-model="selectedTab" :options="tabs" option-label="label" option-value="value"
                      :allow-empty="false" :aria-label="t('shell.filters')" class="tabs">
      <template #option="{ option }">
        {{ option.label }} <span class="count" :class="option.tone">{{ option.count }}</span>
      </template>
    </pv-select-button>

    <div v-if="sent" class="alert alert-info" role="status">
      <i class="pi pi-envelope" aria-hidden="true"></i>
      <div><strong>{{ t('iam.users.sent-title') }}</strong> <span>{{ t('iam.users.sent-text', { email: sent }) }}</span></div>
    </div>

    <div class="columns">
      <div class="stack">
        <pv-card v-if="selectedTab === 'invitations'">
          <template #title>{{ t('iam.users.tab-invitations') }}</template>
          <template #content>
            <pv-data-table :value="store.invitations" data-key="id" scrollable :aria-label="t('iam.users.tab-invitations')"
                           :row-class="invitation => ({ highlight: invitation.email === sent })">
              <pv-column :header="t('iam.users.user')">
                <template #body="{ data }"><strong>{{ data.fullName }}</strong><span class="sub">{{ data.email }}</span></template>
              </pv-column>
              <pv-column :header="t('iam.users.profile')">
                <template #body="{ data }"><span class="chip" :class="`chip-${toneOf(data.role)}`">{{ t(`roles.${data.role}`) }}</span></template>
              </pv-column>
              <pv-column field="facility" :header="t('iam.users.facility')"/>
              <pv-column :header="t('iam.users.status')">
                <template #body="{ data }"><span class="chip chip-dot chip-warning">{{ t(`iam.status.${data.status}`) }}</span></template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>

        <pv-card v-else-if="selectedTab === 'users'">
          <template #title>
            <div class="row">{{ t('iam.users.directory') }}<span class="spacer"></span>
              <span class="muted small">{{ t('iam.users.shown', { count: store.users.length }) }}</span></div>
          </template>
          <template #content>
            <pv-data-table :value="store.users" data-key="id" scrollable :aria-label="t('iam.users.directory')"
                           :row-class="user => ({ highlight: user.role === selectedRole, clickable: true })"
                           @row-click="event => selectedRole = event.data.role">
              <pv-column :header="t('iam.users.user')">
                <template #body="{ data }">
                  <span class="row"><span class="avatar" :class="`chip-${toneOf(data.role)}`">{{ data.initials }}</span><strong>{{ data.fullName }}</strong></span>
                </template>
              </pv-column>
              <pv-column :header="t('iam.users.profile')">
                <template #body="{ data }"><span class="chip" :class="`chip-${toneOf(data.role)}`">{{ t(`roles.${data.role}`) }}</span></template>
              </pv-column>
              <pv-column field="facility" :header="t('iam.users.facility')"/>
              <pv-column :header="t('iam.users.status')">
                <template #body="{ data }">
                  <span class="chip chip-dot" :class="data.status === 'active' ? 'chip-success' : 'chip-warning'">{{ t(`iam.status.${data.status}`) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>

        <pv-card>
          <template #title>{{ t('iam.users.matrix') }}</template>
          <template #content>
            <pv-data-table :value="store.roleProfiles" data-key="id" scrollable :aria-label="t('iam.users.matrix')"
                           :row-class="profile => ({ highlight: selectedTab === 'profiles' && profile.key === selectedRole, clickable: true })"
                           @row-click="event => selectedRole = event.data.key">
              <pv-column :header="t('iam.users.profile')">
                <template #body="{ data }"><span class="chip" :class="`chip-${data.tone}`">{{ t(`roles.${data.key}`) }}</span></template>
              </pv-column>
              <pv-column :header="t('iam.users.create-edit')">
                <template #body="{ data }">
                  <span class="chips">
                    <span v-for="record in data.createEdit" :key="record" class="chip chip-info">{{ t(`iam.users.permissions.${record.toLowerCase()}`) }}</span>
                    <template v-if="!data.createEdit.length">{{ t('iam.users.none') }}</template>
                  </span>
                </template>
              </pv-column>
              <pv-column :header="t('iam.users.approve-sign')">
                <template #body="{ data }">{{ t(`iam.users.permissions.${normalizeKey(data.approveSign)}`) }}</template>
              </pv-column>
              <pv-column :header="t('iam.users.restrictions')">
                <template #body="{ data }">
                  <span class="chip" :class="['internal-auditor', 'administrator'].includes(data.key) ? 'chip-warning' : 'chip-danger'">
                    {{ t(`iam.users.permissions.${normalizeKey(data.restriction)}`) }}
                  </span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <aside class="stack">
        <pv-card v-if="selectedProfile" class="selected">
          <template #header>
            <header>
              <p>{{ t('iam.users.selected-profile') }}</p>
              <h2>{{ t(`roles.${selectedProfile.key}`) }}</h2>
            </header>
          </template>
          <template #content>
            <ul>
              <li>
                <span class="item-icon allowed"><i class="pi pi-pencil" aria-hidden="true"></i></span>
                <div><strong>{{ t('iam.users.can-create') }}</strong><span class="sub">{{ createEditOf(selectedProfile) }}</span></div>
              </li>
              <li>
                <span class="item-icon approve"><i class="pi pi-verified" aria-hidden="true"></i></span>
                <div><strong>{{ t('iam.users.can-approve') }}</strong>
                  <span class="sub">{{ t(`iam.users.permissions.${normalizeKey(selectedProfile.approveSign)}`) }}</span></div>
              </li>
              <li>
                <span class="item-icon denied"><i class="pi pi-ban" aria-hidden="true"></i></span>
                <div><strong>{{ t('iam.users.restriction') }}</strong>
                  <span class="sub">{{ t(`iam.users.permissions.${normalizeKey(selectedProfile.restriction)}`) }}</span></div>
              </li>
            </ul>
          </template>
        </pv-card>

        <pv-card class="policy">
          <template #title><span class="row"><i class="pi pi-shield" aria-hidden="true"></i>{{ t('iam.users.access-policy') }}</span></template>
          <template #content>
            <div class="policy-item">
              <span class="item-icon allowed"><i class="pi pi-lock" aria-hidden="true"></i></span>
              <div>
                <strong>{{ t('iam.users.two-factor') }}</strong> <span class="chip chip-success">{{ t('iam.users.all-users') }}</span>
                <p class="sub">{{ t('iam.users.two-factor-text') }}</p>
              </div>
            </div>
            <div class="policy-item">
              <span class="item-icon approve"><i class="pi pi-history" aria-hidden="true"></i></span>
              <div>
                <strong>{{ t('iam.users.deactivation') }}</strong>
                <p class="sub">{{ t('iam.users.deactivation-text') }}</p>
              </div>
            </div>
          </template>
        </pv-card>

        <div class="alert alert-info" role="status">
          <i class="pi pi-info-circle" aria-hidden="true"></i>
          <div>
            <strong>{{ t('iam.users.rbac') }}</strong>
            <p class="small">{{ t('iam.users.rbac-text') }}</p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.tabs {
  align-self: flex-start;
}

.count {
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--teal);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.count.neutral {
  background: #e2e8f0;
  color: var(--slate);
}

.count.warning {
  background: var(--warning-bg);
  color: var(--warning);
}

.spacer {
  flex: 1 1 auto;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 170px;
}

.selected {
  overflow: hidden;
}

.selected header {
  padding: 18px 20px;
  background: var(--teal);
  color: #fff;
}

.selected header p {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.selected ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.selected li,
.policy-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
}

.item-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.item-icon.allowed { background: var(--mint); color: var(--teal); }
.item-icon.approve { background: var(--warning-bg); color: var(--warning); }
.item-icon.denied { background: var(--danger-bg); color: var(--danger); }

.policy .row {
  gap: 8px;
}

.policy .pi-shield,
.alert-info .pi {
  color: var(--teal);
}

:deep(.clickable) {
  cursor: pointer;
}
</style>
