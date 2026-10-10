<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import useOrganizationsStore from "../../../application/organizations.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";
import {UserProfile} from "../../../domain/model/user-profile.entity.js";

/**
 * Profile and notification preferences of the signed-in user, available in every environment.
 */
const { t, locale } = useI18n();
const store = useOrganizationsStore();
const iamStore = useIamStore();

/** Profile form. */
const form = reactive({ firstName: '', lastName: '', area: '', emailNotifications: true, inAppNotifications: true, language: 'en' });
/** Whether the form was submitted once, to show the validation messages. */
const submitted = ref(false);
/** Whether the last changes were saved and nothing changed since. */
const saved = ref(false);

const errors = computed(() => ({
  firstName: submitted.value && !form.firstName.trim(),
  lastName: submitted.value && !form.lastName.trim(),
  area: submitted.value && !form.area.trim()
}));
const languageOptions = [{ label: 'EN', value: 'en' }, { label: 'ES', value: 'es' }];

/** Fills the form when the profile is loaded. */
watch(() => store.currentProfile, profile => {
  if (!profile) return;
  Object.assign(form, {
    firstName: profile.firstName, lastName: profile.lastName, area: profile.area,
    emailNotifications: profile.emailNotifications, inAppNotifications: profile.inAppNotifications, language: profile.language
  });
}, { immediate: true });

/** Any change hides the saved message. */
watch(form, () => saved.value = false, { deep: true });

/** Loads the profiles. */
onMounted(() => store.fetchProfiles());

/**
 * Applies the chosen language right away and remembers it.
 * @param {string} language - Language code.
 */
const chooseLanguage = (language) => {
  if (!language) return;
  locale.value = language;
  localStorage.setItem('language', language);
};

/** Saves the profile when the form is valid. */
const save = () => {
  const profile = store.currentProfile;
  if (!profile) return;
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  store.updateProfile(new UserProfile({
    id: profile.id, userId: profile.userId, email: profile.email, site: profile.site,
    firstName: form.firstName.trim(), lastName: form.lastName.trim(), area: form.area.trim(),
    emailNotifications: form.emailNotifications, inAppNotifications: form.inAppNotifications, language: form.language
  })).then(() => saved.value = true);
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('organizations.profile.my-account'), t('shell.profile')]"
                 :title="t('shell.profile')" :subtitle="t('organizations.profile.subtitle')">
      <pv-button :label="t('organizations.profile.save')" :loading="store.loading" @click="save"/>
    </page-header>

    <div v-if="saved" class="alert saved" role="status">
      <i class="pi pi-check-circle" aria-hidden="true"></i>
      <strong>{{ t('organizations.profile.saved') }}</strong>
    </div>

    <template v-if="store.currentProfile">
      <div class="grid-2">
        <pv-card class="panel">
          <template #content>
            <div>
              <h2>{{ t('organizations.profile.personal-data') }}</h2>
              <p class="sub">{{ t('organizations.profile.personal-data-text') }}</p>
            </div>
            <div class="identity">
              <span class="avatar" aria-hidden="true">{{ iamStore.currentUser?.initials }}</span>
              <div>
                <strong>{{ store.currentProfile.firstName }} {{ store.currentProfile.lastName }}</strong>
                <p class="sub">{{ t(`roles.${iamStore.currentUser?.role}`) }} · {{ store.currentProfile.site }}</p>
              </div>
            </div>
            <div class="form-grid">
              <div class="field">
                <label for="first-name">{{ t('organizations.profile.first-name') }} *</label>
                <pv-input-text id="first-name" v-model="form.firstName" autocomplete="given-name" fluid :invalid="errors.firstName"/>
              </div>
              <div class="field">
                <label for="last-name">{{ t('organizations.profile.last-name') }} *</label>
                <pv-input-text id="last-name" v-model="form.lastName" autocomplete="family-name" fluid :invalid="errors.lastName"/>
              </div>
              <div class="field full">
                <label for="profile-email">{{ t('organizations.profile.email') }}</label>
                <pv-input-text id="profile-email" :model-value="store.currentProfile.email" type="email" disabled fluid/>
              </div>
              <div class="field full">
                <label for="area">{{ t('organizations.profile.area') }} *</label>
                <pv-input-text id="area" v-model="form.area" fluid :invalid="errors.area"/>
              </div>
            </div>
            <p class="sub">{{ t('organizations.profile.email-note') }}</p>
          </template>
        </pv-card>

        <pv-card class="panel">
          <template #content>
            <div>
              <h2>{{ t('organizations.profile.notifications') }}</h2>
              <p class="sub">{{ t('organizations.profile.notifications-text') }}</p>
            </div>
            <div class="preference">
              <div>
                <strong id="email-notifications">{{ t('organizations.profile.email-notifications') }}</strong>
                <p class="sub">{{ t('organizations.profile.email-notifications-text') }}</p>
              </div>
              <pv-toggle-switch v-model="form.emailNotifications" aria-labelledby="email-notifications"/>
            </div>
            <div class="preference">
              <div>
                <strong id="in-app-notifications">{{ t('organizations.profile.in-app') }}</strong>
                <p class="sub">{{ t('organizations.profile.in-app-text') }}</p>
              </div>
              <pv-toggle-switch v-model="form.inAppNotifications" aria-labelledby="in-app-notifications"/>
            </div>
            <div class="preference">
              <strong id="preferred-language">{{ t('organizations.profile.language') }}</strong>
              <pv-select-button v-model="form.language" :options="languageOptions" option-label="label" option-value="value"
                                :allow-empty="false" aria-labelledby="preferred-language" @update:model-value="chooseLanguage"/>
            </div>
            <p class="sub">{{ t('organizations.profile.language-text') }}</p>
          </template>
        </pv-card>
      </div>

      <pv-card>
        <template #content>
          <div class="security">
            <i class="pi pi-shield" aria-hidden="true"></i>
            <p>{{ t('organizations.profile.security') }}</p>
          </div>
        </template>
      </pv-card>
    </template>
  </section>
</template>

<style scoped>
.saved {
  border-color: #99f6e4;
  background: var(--mint);
  color: var(--teal);
}

.identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--teal);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.identity strong {
  font-size: 18px;
}

.preference {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.security {
  display: flex;
  align-items: center;
  gap: 16px;
}

.security i {
  color: var(--teal);
  font-size: 22px;
}
</style>
