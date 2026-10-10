<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "../../../../shared/presentation/components/language-switcher.vue";
import {formatCurrency} from "../../../../shared/presentation/format.js";
import useOrganizationsStore from "../../../application/organizations.store.js";
import useSubscriptionsStore from "../../../../subscriptions/application/subscriptions.store.js";
import {RegisterOrganizationCommand} from "../../../domain/model/register-organization.command.js";

/**
 * Public form to register a laboratory, choose its plan and designate its first administrator.
 */
const { t, locale } = useI18n();
const store = useOrganizationsStore();
const subscriptionsStore = useSubscriptionsStore();

const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL;

/** Items of the introduction panel. */
const introItems = ['qa', 'production', 'access', 'permissions'];
/** Plants offered as primary plant. */
const plants = ['Ate plant · Lima, Peru', 'Lima QC laboratory · Lima, Peru', 'Arequipa plant · Arequipa, Peru'];

/** Registration form. */
const form = reactive({
  legalName: '', ruc: '', facilityName: plants[0], planKey: 'standard-lab', billingCycle: 'monthly',
  administratorName: '', administratorEmail: '', password: '', accepted: false
});
/** Whether the form was submitted once, to show the validation messages. */
const submitted = ref(false);
/** Whether the plan options are open. */
const choosingPlan = ref(false);

/** Plans and billing cycles offered when the plan is changed. */
const planOptions = computed(() => subscriptionsStore.plans.flatMap(plan => ['monthly', 'annual']
    .map(cycle => ({ plan, cycle, price: cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice }))));
/** Plan selected in the form. */
const selectedPlan = computed(() => subscriptionsStore.plans.find(plan => plan.key === form.planKey));
/** Price of the selected plan in the selected billing cycle. */
const selectedPrice = computed(() => !selectedPlan.value ? 0
    : form.billingCycle === 'annual' ? selectedPlan.value.annualPrice : selectedPlan.value.monthlyPrice);

/** Password rule of the mock-up: at least 12 characters, with a number and a symbol. */
const strongPassword = computed(() => form.password.length >= 12 && /\d/.test(form.password) && /[^A-Za-z0-9]/.test(form.password));
/** Strength of the password from 0 to 4. */
const passwordStrength = computed(() => [form.password.length >= 8, form.password.length >= 12, /\d/.test(form.password),
  /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length);
/** Email shown in the notices. */
const administratorEmail = computed(() => form.administratorEmail || t('organizations.registration.your-email'));

const errors = computed(() => ({
  legalName: submitted.value && !form.legalName.trim(),
  ruc: submitted.value && !/^(10|20)\d{9}$/.test(form.ruc),
  administratorName: submitted.value && !form.administratorName.trim(),
  administratorEmail: submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.administratorEmail.trim()),
  password: submitted.value && !strongPassword.value,
  accepted: submitted.value && !form.accepted
}));
const rucRegistered = computed(() => store.registrationStep === 'ruc-registered');

/** Starts the registration at the form. */
onMounted(() => store.resetRegistration());

/**
 * Chooses a plan and billing cycle.
 * @param {string} planKey - Key of the plan.
 * @param {string} billingCycle - Billing cycle.
 */
const choosePlan = (planKey, billingCycle) => {
  form.planKey = planKey;
  form.billingCycle = billingCycle;
  choosingPlan.value = false;
};

/** Clears the RUC error when the RUC changes. */
const rucChanged = () => {
  if (rucRegistered.value) store.resetRegistration();
};

/** Registers the organization when the form is valid. */
const submit = () => {
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  store.register(new RegisterOrganizationCommand({
    legalName: form.legalName.trim(), ruc: form.ruc, facilityName: form.facilityName.split(' · ')[0],
    planKey: form.planKey, billingCycle: form.billingCycle, administratorName: form.administratorName.trim(),
    administratorEmail: form.administratorEmail.trim().toLowerCase(), password: form.password
  }));
};
</script>

<template>
  <div class="page-shell">
    <header class="top">
      <router-link to="/sign-in" :aria-label="t('shell.home')"><img src="/doofplus-wordmark.png" alt="DoofPlus"></router-link>
      <language-switcher/>
    </header>

    <div class="registration">
      <aside class="intro">
        <p class="headline">{{ t('organizations.registration.headline') }}</p>
        <span class="rule"></span>
        <div v-for="item in introItems" :key="item">
          <p class="intro-label">{{ t(`organizations.registration.intro.${item}-title`) }}</p>
          <p>{{ t(`organizations.registration.intro.${item}-text`) }}</p>
        </div>
        <nav class="intro-links" :aria-label="t('shell.legal')">
          <a :href="`${landingPageUrl}privacy.html`">{{ t('footer.privacy') }}</a>
          <a :href="`${landingPageUrl}terms.html`">{{ t('footer.terms') }}</a>
        </nav>
      </aside>

      <main id="content" class="content">
        <ol class="stepper">
          <li :class="{ current: store.registrationStep !== 'verification' }"><span>1</span>{{ t('organizations.registration.step-organization') }}</li>
          <li :class="{ current: store.registrationStep !== 'verification' }"><span>2</span>{{ t('organizations.registration.step-administrator') }}</li>
          <li :class="{ current: store.registrationStep === 'verification' }"><span>3</span>{{ t('organizations.registration.step-verification') }}</li>
        </ol>

        <section v-if="store.registrationStep === 'verification'" class="verification">
          <span class="mail" aria-hidden="true"><i class="pi pi-envelope"></i></span>
          <h1>{{ t('organizations.registration.verify-title') }}</h1>
          <p class="muted">{{ t('organizations.registration.verify-text', { email: administratorEmail }) }}</p>
          <pv-button as-child v-slot="slotProps">
            <router-link to="/sign-in/administration" :class="slotProps['class']">{{ t('organizations.registration.go-sign-in') }}</router-link>
          </pv-button>
        </section>

        <template v-else>
          <p class="overline">{{ t('organizations.registration.overline') }}</p>
          <h1 class="title">{{ t('organizations.registration.title') }}</h1>
          <p class="muted lead">{{ t('organizations.registration.subtitle') }}</p>

          <form class="flex flex-column gap-2" novalidate @submit.prevent="submit">
            <p class="group">{{ t('organizations.registration.organization-details') }}</p>
            <div class="field">
              <label class="label" for="legal-name">{{ t('organizations.registration.legal-name') }} *</label>
              <pv-input-text id="legal-name" v-model="form.legalName" autocomplete="organization" fluid :invalid="errors.legalName"/>
              <small v-if="errors.legalName" class="error">{{ t('organizations.registration.legal-name-error') }}</small>
            </div>
            <div class="field">
              <label class="label" for="ruc">RUC *</label>
              <pv-input-text id="ruc" v-model="form.ruc" inputmode="numeric" maxlength="11" fluid
                             :invalid="errors.ruc || rucRegistered" @input="rucChanged"/>
              <small v-if="errors.ruc" class="error">{{ t('organizations.registration.ruc-error') }}</small>
              <small v-if="rucRegistered" class="error" role="alert">{{ t('organizations.registration.ruc-registered') }}</small>
            </div>
            <div class="field">
              <label class="label" for="plant">{{ t('organizations.registration.primary-plant') }} *</label>
              <pv-select input-id="plant" v-model="form.facilityName" :options="plants" fluid/>
            </div>

            <p class="group">{{ t('organizations.registration.plan') }}</p>
            <div v-if="selectedPlan" class="plan">
              <div>
                <strong>{{ selectedPlan.name }} · {{ t(`subscriptions.cycle.${form.billingCycle}`) }} · {{ formatCurrency(selectedPrice, locale) }}</strong>
                <p class="small muted">
                  {{ t(selectedPlan.userLimit ? 'organizations.registration.plan-limits' : 'organizations.registration.plan-unlimited',
                      { devices: selectedPlan.iotDeviceLimit, users: selectedPlan.userLimit }) }}
                </p>
              </div>
              <pv-button type="button" :label="t('organizations.registration.change-plan')" text
                         :aria-expanded="choosingPlan" @click="choosingPlan = !choosingPlan"/>
            </div>
            <div v-if="choosingPlan" class="plan-options">
              <button v-for="option in planOptions" :key="option.plan.key + option.cycle" type="button" class="plan-option"
                      @click="choosePlan(option.plan.key, option.cycle)">
                <strong>{{ option.plan.name }}</strong>
                <span>{{ t(`subscriptions.cycle.${option.cycle}`) }} · {{ formatCurrency(option.price, locale) }}</span>
              </button>
            </div>

            <p class="group">{{ t('organizations.registration.administrator') }}</p>
            <div class="field">
              <label class="label" for="administrator-name">{{ t('organizations.registration.administrator-name') }} *</label>
              <pv-input-text id="administrator-name" v-model="form.administratorName" autocomplete="name" fluid :invalid="errors.administratorName"/>
              <small v-if="errors.administratorName" class="error">{{ t('organizations.registration.administrator-name-error') }}</small>
            </div>
            <div class="field">
              <label class="label" for="administrator-email">{{ t('organizations.registration.email') }} *</label>
              <pv-input-text id="administrator-email" v-model="form.administratorEmail" type="email" autocomplete="email" fluid
                             :invalid="errors.administratorEmail"/>
              <small v-if="errors.administratorEmail" class="error">{{ t('organizations.registration.email-error') }}</small>
            </div>
            <div class="field">
              <label class="label" for="new-password">{{ t('iam.sign-in.password') }} *</label>
              <pv-password input-id="new-password" v-model="form.password" :feedback="false" toggle-mask fluid
                           autocomplete="new-password" :invalid="errors.password"/>
              <small class="hint" :class="{ error: errors.password }">
                <i class="pi pi-info-circle" aria-hidden="true"></i> {{ t('organizations.registration.password-rule') }}
              </small>
              <span class="strength" :data-level="passwordStrength">
                <i></i><i></i><i></i><i></i>
                <em>{{ t(`organizations.registration.strength.${passwordStrength}`) }}</em>
              </span>
            </div>

            <p class="notice"><i class="pi pi-envelope" aria-hidden="true"></i>{{ t('organizations.registration.notice', { email: administratorEmail }) }}</p>

            <div class="accept" :class="{ invalid: errors.accepted }">
              <pv-checkbox v-model="form.accepted" input-id="accepted" binary :invalid="errors.accepted"/>
              <label for="accepted">
                {{ t('organizations.registration.accept-1') }}
                <a :href="`${landingPageUrl}terms.html`" target="_blank" rel="noopener">{{ t('footer.terms') }}</a>
                {{ t('organizations.registration.accept-2') }}
                <a :href="`${landingPageUrl}privacy.html`" target="_blank" rel="noopener">{{ t('footer.privacy') }}</a>.
                {{ t('organizations.registration.accept-3') }}
              </label>
            </div>

            <div class="row actions">
              <pv-button type="submit" class="submit" :label="t('organizations.registration.create')" :loading="store.loading"/>
              <span class="muted">{{ t('organizations.registration.create-note') }}</span>
            </div>
            <p class="small">* {{ t('organizations.registration.required') }}</p>
          </form>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 64px;
  border-bottom: 1px solid var(--border);
}

.top img {
  display: block;
  height: 30px;
}

.registration {
  display: grid;
  flex: 1;
  grid-template-columns: 440px minmax(0, 1fr);
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 64px 40px 40px 48px;
  border-left: 4px solid var(--teal);
  background: var(--navy);
  color: #cbd5e1;
}

.headline {
  color: #fff;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
}

.rule {
  width: 48px;
  height: 2px;
  margin: 18px 0;
  background: var(--teal);
}

.intro-label {
  margin-bottom: 4px;
  color: #2dd4bf;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.intro-links {
  display: flex;
  gap: 18px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--navy-soft);
}

.intro-links a {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.content {
  max-width: 940px;
  padding: 32px 64px 40px 96px;
}

.stepper {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 0 0 32px;
  padding: 0;
  list-style: none;
}

.stepper li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stepper li + li::before {
  content: "";
  width: 48px;
  height: 1px;
  margin-right: 10px;
  background: #cbd5e1;
}

.stepper span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}

.stepper .current {
  color: var(--teal);
  font-weight: 600;
}

.stepper .current span {
  background: var(--teal);
  color: #fff;
}

.overline {
  color: var(--teal);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.title {
  margin: 8px 0 12px;
  font-size: 34px;
}

.lead {
  margin-bottom: 8px;
  font-size: 16px;
}

.group {
  margin: 16px 0 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  color: var(--teal);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.field .label {
  color: var(--slate);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hint {
  color: var(--muted);
  font-size: 12px;
}

.hint.error {
  color: var(--danger-dark);
}

.plan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  background: var(--mint);
}

.plan-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.plan-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.plan-option:hover {
  border-color: var(--teal);
}

.strength {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 8px;
}

.strength i {
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
}

.strength em {
  margin-left: 8px;
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  text-transform: uppercase;
}

.strength[data-level="1"] i:nth-child(-n+1),
.strength[data-level="2"] i:nth-child(-n+2) { background: #f59e0b; }
.strength[data-level="3"] i:nth-child(-n+2) { background: #22c55e; }
.strength[data-level="3"] i:nth-child(3) { background: #f59e0b; }
.strength[data-level="4"] i { background: #16a34a; }

.notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
  padding: 16px;
  border: 1px solid var(--teal);
  border-radius: 6px;
  background: var(--mint);
  color: var(--teal);
  font-size: 13px;
}

.accept {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--muted);
  font-size: 14px;
}

.accept.invalid {
  color: var(--danger-dark);
}

.accept a {
  font-weight: 500;
  text-decoration: underline;
}

.actions {
  gap: 16px;
  margin: 12px 0;
}

.submit {
  padding: 14px 28px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.verification {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 560px;
}

.mail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--mint);
  color: var(--teal);
}

.mail i {
  font-size: 24px;
}

@media (max-width: 1000px) {
  .registration {
    grid-template-columns: minmax(0, 1fr);
  }

  .intro {
    display: none;
  }

  .top,
  .content {
    padding-right: 16px;
    padding-left: 16px;
  }

  .stepper li + li::before {
    width: 16px;
  }

  .strength i {
    width: 48px;
  }
}

@media (max-width: 600px) {
  .plan,
  .plan-options {
    grid-template-columns: 1fr;
  }

  .plan {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
