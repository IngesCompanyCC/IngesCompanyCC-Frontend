<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import useIamStore from "../../application/iam.store.js";
import {Invitation} from "../../domain/model/invitation.entity.js";

/**
 * Invitation of a new member of the team (US55): profile, facility, permission preview and the states of an invitation.
 */
const { t } = useI18n();
const router = useRouter();
const store = useIamStore();

/** Facilities the invited person can access. */
const facilities = ['Ate manufacturing', 'Lima', 'All facilities'];
const form = reactive({ fullName: '', email: '', role: 'internal-auditor', facility: 'Ate manufacturing', note: '' });
const submitted = ref(false);
/** Whether a user or a pending invitation already uses the email. */
const duplicateEmail = ref(false);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const errors = computed(() => ({
  fullName: submitted.value && !form.fullName.trim(),
  email: submitted.value && !EMAIL_PATTERN.test(form.email.trim())
}));
const profileOptions = computed(() => store.roleProfiles.map(profile => ({ value: profile.key, label: t(`roles.${profile.key}`) })));
const selectedProfile = computed(() => store.roleProfiles.find(profile => profile.key === form.role));

/**
 * Translation key of a permission text (e.g. "Release if authorized" -> release-if-authorized).
 * @param {string} value - Permission text of the profile.
 * @returns {string} Normalized key.
 */
const normalizeKey = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Translated list of the records the selected profile can create and edit. */
const createEdit = computed(() => selectedProfile.value?.createEdit.length
    ? selectedProfile.value.createEdit.map(item => t(`iam.users.permissions.${item.toLowerCase()}`)).join(', ')
    : t('iam.users.none'));

/** Sends the invitation when the form is valid and the email is not taken. */
const submit = () => {
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  duplicateEmail.value = store.isEmailTaken(form.email);
  if (duplicateEmail.value) return;
  store.addInvitation(new Invitation({
    fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), role: form.role, facility: form.facility,
    note: form.note.trim(), status: 'pending', sentAt: new Date().toISOString()
  }), router);
};

onMounted(() => {
  if (!store.roleProfiles.length) store.fetchDirectory();
});
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.administration.short'), t('iam.invite.title')]"
                 :title="t('iam.invite.title')" :subtitle="t('iam.invite.subtitle')"/>

    <pv-card class="summary">
      <template #content>
        <div><p class="value">{{ store.users.length }}</p><p class="stat-label">{{ t('iam.invite.active-users') }}</p></div>
        <div><p class="value"><i class="pi pi-sync" aria-hidden="true"></i></p><p class="stat-label">{{ t('iam.invite.user-limit') }}</p></div>
        <div><p class="value">{{ store.pendingInvitations.length }}</p><p class="stat-label">{{ t('iam.invite.pending') }}</p></div>
        <div><p class="value">7 {{ t('iam.invite.days') }}</p><p class="stat-label">{{ t('iam.invite.expiry') }}</p></div>
      </template>
    </pv-card>

    <div class="columns">
      <pv-card class="panel">
        <template #title>{{ t('iam.invite.details') }}</template>
        <template #content>
          <form class="flex flex-column gap-3" novalidate @submit.prevent="submit">
            <div class="field">
              <label for="invite-name">{{ t('iam.invite.full-name') }} *</label>
              <pv-input-text id="invite-name" v-model="form.fullName" autocomplete="name" fluid :invalid="errors.fullName"/>
              <small v-if="errors.fullName" class="error">{{ t('iam.invite.full-name-error') }}</small>
            </div>
            <div class="field">
              <label for="invite-email">{{ t('iam.invite.email') }} *</label>
              <pv-input-text id="invite-email" v-model="form.email" type="email" autocomplete="email" fluid
                             :invalid="errors.email || duplicateEmail" @input="duplicateEmail = false"/>
              <small v-if="errors.email" class="error">{{ t('iam.invite.email-error') }}</small>
            </div>
            <p v-if="duplicateEmail" class="duplicate" role="alert"><i class="pi pi-exclamation-circle" aria-hidden="true"></i>{{ t('iam.invite.duplicate') }}</p>
            <div class="field">
              <label for="invite-role">{{ t('iam.invite.profile') }} *</label>
              <pv-select input-id="invite-role" v-model="form.role" :options="profileOptions" option-label="label" option-value="value" fluid/>
            </div>
            <div class="field">
              <label for="invite-facility">{{ t('iam.invite.facility') }} *</label>
              <pv-select input-id="invite-facility" v-model="form.facility" :options="facilities" fluid/>
            </div>
            <div class="field">
              <label for="invite-note">{{ t('iam.invite.note') }}</label>
              <pv-textarea id="invite-note" v-model="form.note" rows="3" fluid/>
            </div>
            <p v-if="selectedProfile" class="restriction"><i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
              {{ t(`iam.users.permissions.${normalizeKey(selectedProfile.restriction)}`) }}</p>
            <div class="row actions">
              <pv-button type="submit" :label="t('iam.invite.send')" :loading="store.loading"/>
              <router-link to="/administration/users">{{ t('iam.invite.cancel') }} →</router-link>
            </div>
          </form>
        </template>
      </pv-card>

      <aside class="stack">
        <pv-card v-if="selectedProfile" class="panel">
          <template #title>{{ t('iam.invite.preview') }}</template>
          <template #subtitle>{{ t(`roles.${selectedProfile.key}`) }} · {{ form.facility }}</template>
          <template #content>
            <div class="stack">
              <div class="permission allowed"><strong>{{ t('iam.users.can-create') }}</strong><span class="sub">{{ createEdit }}</span></div>
              <div class="permission allowed"><strong>{{ t('iam.users.can-approve') }}</strong>
                <span class="sub">{{ t(`iam.users.permissions.${normalizeKey(selectedProfile.approveSign)}`) }}</span></div>
              <div class="permission denied"><strong>{{ t('iam.users.restriction') }}</strong>
                <span class="sub">{{ t(`iam.users.permissions.${normalizeKey(selectedProfile.restriction)}`) }}</span></div>
            </div>
          </template>
        </pv-card>
        <pv-card class="panel">
          <template #title>{{ t('iam.invite.states') }}</template>
          <template #content>
            <div class="stack">
              <div class="state pending"><span class="chip chip-warning">{{ t('iam.status.pending') }}</span><p class="small">{{ t('iam.invite.state-pending') }}</p></div>
              <div class="state duplicate-state"><span class="chip chip-danger">{{ t('iam.invite.duplicate-email') }}</span><p class="small">{{ t('iam.invite.duplicate') }}</p></div>
              <div class="state sent"><span class="chip chip-success">{{ t('iam.invite.sent') }}</span><p class="small">{{ t('iam.invite.state-sent') }}</p></div>
            </div>
          </template>
        </pv-card>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.value {
  display: flex;
  align-items: center;
  min-height: 32px;
  font-size: 22px;
  font-weight: 700;
}

.value .pi {
  color: var(--teal);
  font-size: 20px;
}

.duplicate,
.restriction {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--danger-border);
  border-radius: 6px;
  background: var(--danger-bg);
  color: var(--danger-dark);
  font-size: 13px;
}

.actions {
  gap: 24px;
}

.permission,
.state {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 8px;
}

.permission.allowed { background: var(--mint); }
.permission.denied { background: var(--danger-bg); }

.state {
  align-items: flex-start;
  border: 1px solid;
}

.state.pending { border-color: var(--warning-border); background: var(--warning-bg); color: var(--warning); }
.state.duplicate-state { border-color: var(--danger-border); background: var(--danger-bg); color: var(--danger-dark); }
.state.sent { border-color: #bbf7d0; background: #f0fdf4; color: var(--success); }

</style>
