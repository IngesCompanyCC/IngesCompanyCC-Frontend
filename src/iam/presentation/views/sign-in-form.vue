<script setup>
import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIamStore from "../../application/iam.store.js";
import {SignInCommand} from "../../domain/model/sign-in.command.js";
import {workspaceEnvironments} from "../../../shared/presentation/workspace-environments.js";

const props = defineProps({
  /** Environment of the route (`/sign-in/:environment`). */
  environment: { type: String, required: true }
});

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();

/** Settings of the selected environment. */
const profile = computed(() => workspaceEnvironments[props.environment]);

const email = ref('');
const password = ref('');
const code = ref('');
/** Whether the credentials form was submitted once, to show the validation messages. */
const submitted = ref(false);

const emailError = computed(() => submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
const passwordError = computed(() => submitted.value && !password.value);
const invalidCredentials = computed(() => store.signInStep === 'invalid-credentials');
const twoFactor = computed(() => ['two-factor', 'invalid-code'].includes(store.signInStep));

/** Returns to the environment selection when the route has an unknown environment, and starts the flow. */
onMounted(() => {
  if (!profile.value) {
    router.replace({ name: 'iam-environment-selection' });
    return;
  }
  store.resetSignIn();
});

/** Validates the credentials form and starts the sign-in. */
const performSignIn = () => {
  submitted.value = true;
  if (emailError.value || passwordError.value) return;
  store.signIn(new SignInCommand({ email: email.value.trim(), password: password.value, environment: props.environment }));
};

/** Checks the two-factor code once the six digits were entered. */
const submitCode = () => {
  if (/^\d{6}$/.test(code.value)) store.verifyTwoFactorCode(code.value, router);
};

/** Returns to the credentials step. */
const backToCredentials = () => {
  code.value = '';
  password.value = '';
  submitted.value = false;
  store.resetSignIn();
};
</script>

<template>
  <pv-card v-if="profile && store.signInStep === 'not-authorized'" class="denied">
    <template #content>
      <div class="flex flex-column gap-3">
        <span class="role-chip" :class="`accent-${profile.accent}`">
          <i :class="profile.icon" aria-hidden="true"></i>{{ t(`environments.${environment}.role`) }}
        </span>
        <span class="denied-icon" aria-hidden="true"><i class="pi pi-ban"></i></span>
        <h1>{{ t('iam.sign-in.denied-title') }}</h1>
        <p class="muted">
          {{ t('iam.sign-in.denied-text', { role: t(`roles.${store.pendingUser?.role}`), environment: t(`environments.${environment}.name`) }) }}
        </p>
        <pv-button as-child v-slot="slotProps">
          <router-link :to="{ name: 'iam-environment-selection' }" :class="[slotProps['class'], 'submit']">
            {{ t('iam.sign-in.choose-another-environment') }}
          </router-link>
        </pv-button>
        <button type="button" class="link" @click="backToCredentials">{{ t('iam.sign-in.other-account') }} →</button>
      </div>
    </template>
  </pv-card>

  <section v-else-if="profile" class="sign-in" :class="`accent-${profile.accent}`">
    <aside class="panel">
      <span class="panel-icon" aria-hidden="true"><i :class="profile.icon"></i></span>
      <p class="panel-label">{{ t(`environments.${environment}.label`) }}</p>
      <h2>{{ t(`environments.${environment}.headline`) }}</h2>
      <p class="panel-text">{{ t(`environments.${environment}.description`) }}</p>
      <ul>
        <li v-for="feature in profile.features" :key="feature">
          <i class="pi pi-check-circle" aria-hidden="true"></i>{{ t(`environments.features.${feature}`) }}
        </li>
      </ul>
      <p class="panel-note">{{ t('iam.sign-in.access-note') }}</p>
    </aside>

    <pv-card class="form-card">
      <template #content>
        <div class="flex flex-column gap-3">
          <span class="role-chip">
            <i :class="profile.icon" aria-hidden="true"></i>{{ t(`environments.${environment}.role`) }}
          </span>

          <template v-if="twoFactor">
            <h1>{{ t('iam.sign-in.two-factor-title') }}</h1>
            <p class="muted">{{ t('iam.sign-in.two-factor-text', { name: store.pendingUser?.fullName, email: store.pendingUser?.email }) }}</p>
            <form class="flex flex-column gap-2" @submit.prevent="submitCode">
              <label class="field-label" for="code">{{ t('iam.sign-in.code') }} *</label>
              <pv-input-otp id="code" v-model="code" :length="6" integer-only :invalid="store.signInStep === 'invalid-code'"
                            :aria-label="t('iam.sign-in.code')"/>
              <p v-if="store.signInStep === 'invalid-code'" class="error" role="alert">{{ t('iam.sign-in.invalid-code') }}</p>
              <p class="small muted">{{ t('iam.sign-in.code-hint') }}</p>
              <pv-button type="submit" class="submit" :label="t('iam.sign-in.verify')" :disabled="code.length !== 6" :loading="store.loading"/>
            </form>
            <button type="button" class="link" @click="backToCredentials">
              <i class="pi pi-arrow-left" aria-hidden="true"></i>{{ t('iam.sign-in.back-to-sign-in') }}
            </button>
          </template>

          <template v-else>
            <h1>{{ t('iam.sign-in.title', { environment: t(`environments.${environment}.name`) }) }}</h1>
            <p class="muted">{{ t('iam.sign-in.subtitle') }}</p>

            <div v-if="invalidCredentials" class="alert" role="alert">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              <div>
                <strong>{{ t('iam.sign-in.invalid-title') }}</strong>
                <p>{{ t('iam.sign-in.invalid-text') }}</p>
              </div>
            </div>

            <form class="flex flex-column gap-2" novalidate @submit.prevent="performSignIn">
              <label class="field-label" for="email">{{ t('iam.sign-in.email') }} *</label>
              <pv-input-text id="email" v-model="email" type="email" autocomplete="email" placeholder="name@laboratory.com.pe"
                             :invalid="emailError || invalidCredentials" fluid/>
              <small v-if="emailError" class="error">{{ t('iam.sign-in.email-error') }}</small>

              <label class="field-label mt-2" for="password">{{ t('iam.sign-in.password') }} *</label>
              <pv-password input-id="password" v-model="password" :feedback="false" toggle-mask fluid
                           autocomplete="current-password" :invalid="passwordError || invalidCredentials"/>
              <small v-if="passwordError" class="error">{{ t('iam.sign-in.password-error') }}</small>

              <pv-button type="submit" class="submit" :label="t('iam.sign-in.continue')" :loading="store.loading"/>
            </form>

            <div class="links">
              <p>
                <strong>{{ t('iam.sign-in.not-your-environment') }}</strong>
                <router-link :to="{ name: 'iam-environment-selection' }">{{ t('iam.sign-in.choose-another') }} →</router-link>
              </p>
            </div>
          </template>
        </div>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.sign-in {
  display: grid;
  grid-template-columns: 520px minmax(0, 1fr);
  gap: 48px;
  align-items: start;
  max-width: 1312px;
  margin: 0 auto;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 600px;
  padding: 40px;
  border-radius: var(--radius);
  background: var(--accent);
  color: #fff;
}

.panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.panel-icon i {
  font-size: 28px;
}

.panel-label {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.panel h2 {
  font-size: 30px;
  line-height: 1.25;
}

.panel-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
}

.panel ul {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
}

.panel li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-note {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.form-card,
.denied {
  padding: 16px 22px;
}

.form-card h1,
.denied h1 {
  font-size: 30px;
}

.field-label {
  font-weight: 600;
}

.role-chip {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--accent-pale);
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.submit {
  justify-content: center;
  margin-top: 12px;
  padding-block: 14px;
  border-color: var(--accent);
  background: var(--accent);
}

.alert {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--danger-border);
  border-radius: 8px;
  background: var(--danger-bg);
}

.alert i {
  margin-top: 2px;
  color: var(--danger);
}

.alert p {
  font-size: 13px;
}

.error {
  color: var(--danger-dark);
  font-size: 13px;
}

.small {
  font-size: 12px;
}

.links {
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.links a {
  margin-left: 6px;
  color: var(--accent);
}

.link {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent, var(--teal));
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.denied {
  --accent: var(--teal);
  --accent-pale: var(--mint);
  max-width: 704px;
  margin: 8px auto;
}

.denied-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--danger-bg);
  color: var(--danger-dark);
}

.denied-icon i {
  font-size: 24px;
}

@media (max-width: 1100px) {
  .sign-in {
    grid-template-columns: 1fr;
  }

  .panel {
    min-height: 0;
  }
}
</style>
