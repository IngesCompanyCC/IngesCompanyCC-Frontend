<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import useOrganizationsStore from "../../../application/organizations.store.js";

/**
 * Public Contact us form (US04): a visitor sends an inquiry to the DoofPlus team from the sign-in area.
 */
const { t } = useI18n();
const store = useOrganizationsStore();

/** Contact channels of the DoofPlus team, the same ones shown in the footer of the Landing Page. */
const channels = [
  { key: 'email', icon: 'pi pi-envelope', value: 'doofplus.inges@gmail.com', href: 'mailto:doofplus.inges@gmail.com' },
  { key: 'phone', icon: 'pi pi-phone', value: '+51 (1) 234-5678', href: 'tel:+5112345678' },
  { key: 'location', icon: 'pi pi-map-marker', value: 'Lima, Perú' }
];
/** Topics the visitor can ask about, shown in the side panel. */
const topics = ['plans', 'demo', 'compliance', 'support'];

const form = reactive({ fullName: '', email: '', message: '' });
/** Whether the form was submitted once, to show the validation messages. */
const submitted = ref(false);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const errors = computed(() => ({
  fullName: submitted.value && !form.fullName.trim(),
  email: submitted.value && !EMAIL_PATTERN.test(form.email.trim()),
  message: submitted.value && !form.message.trim()
}));

/** Sends the inquiry when the form is valid. */
const submit = () => {
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  store.sendContactInquiry({ fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), message: form.message.trim() });
};

/** Clears the form to send another inquiry. */
const sendAnother = () => {
  Object.assign(form, { fullName: '', email: '', message: '' });
  submitted.value = false;
  store.resetContact();
};

onMounted(() => store.resetContact());
</script>

<template>
  <section class="contact">
    <aside class="panel">
      <span class="panel-icon" aria-hidden="true"><i class="pi pi-comments"></i></span>
      <p class="panel-label">{{ t('organizations.contact.overline') }}</p>
      <h2>{{ t('organizations.contact.panel-title') }}</h2>
      <p class="panel-text">{{ t('organizations.contact.panel-text') }}</p>
      <ul class="topics">
        <li v-for="topic in topics" :key="topic">
          <i class="pi pi-check-circle" aria-hidden="true"></i>{{ t(`organizations.contact.topics.${topic}`) }}
        </li>
      </ul>
      <ul class="channels">
        <li v-for="channel in channels" :key="channel.key">
          <i :class="channel.icon" aria-hidden="true"></i>
          <span>
            <span class="channel-label">{{ t(`organizations.contact.channels.${channel.key}`) }}</span>
            <a v-if="channel.href" :href="channel.href">{{ channel.value }}</a>
            <span v-else>{{ channel.value }}</span>
          </span>
        </li>
      </ul>
    </aside>

    <pv-card class="form-card">
      <template #content>
        <div v-if="store.contactStep === 'sent'" class="flex flex-column gap-3 sent" role="status">
          <span class="sent-icon" aria-hidden="true"><i class="pi pi-check"></i></span>
          <h1>{{ t('organizations.contact.sent-title') }}</h1>
          <p class="muted">{{ t('organizations.contact.sent-text', { email: form.email.trim().toLowerCase() }) }}</p>
          <pv-button :label="t('organizations.contact.send-another')" class="submit" @click="sendAnother"/>
          <router-link :to="{ name: 'iam-environment-selection' }">{{ t('shell.back-to-sign-in') }} →</router-link>
        </div>

        <div v-else class="flex flex-column gap-3">
          <h1>{{ t('organizations.contact.title') }}</h1>
          <p class="muted">{{ t('organizations.contact.subtitle') }}</p>

          <form class="flex flex-column gap-3" novalidate @submit.prevent="submit">
            <div class="field">
              <label for="contact-name">{{ t('organizations.contact.full-name') }} *</label>
              <pv-input-text id="contact-name" v-model="form.fullName" autocomplete="name" fluid :invalid="errors.fullName"/>
              <small v-if="errors.fullName" class="error">{{ t('organizations.contact.full-name-error') }}</small>
            </div>
            <div class="field">
              <label for="contact-email">{{ t('organizations.contact.email') }} *</label>
              <pv-input-text id="contact-email" v-model="form.email" type="email" autocomplete="email"
                             placeholder="name@laboratory.com.pe" fluid :invalid="errors.email"/>
              <small v-if="errors.email" class="error">{{ t('organizations.contact.email-error') }}</small>
            </div>
            <div class="field">
              <label for="contact-message">{{ t('organizations.contact.message') }} *</label>
              <pv-textarea id="contact-message" v-model="form.message" rows="6" fluid :invalid="errors.message"
                           :placeholder="t('organizations.contact.message-placeholder')"/>
              <small v-if="errors.message" class="error">{{ t('organizations.contact.message-error') }}</small>
            </div>
            <pv-button type="submit" class="submit" :label="t('organizations.contact.send')" :loading="store.loading"/>
          </form>

          <p class="small muted">{{ t('organizations.contact.privacy') }}</p>
        </div>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.contact {
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
  padding: 40px;
  border-radius: var(--radius);
  background: var(--teal);
  color: #fff;
}

.panel-icon,
.sent-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
}

.panel-icon {
  background: rgba(255, 255, 255, 0.18);
}

.panel-icon i,
.sent-icon i {
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
  font-size: 28px;
}

.topics,
.channels {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.topics li,
.channels li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.channels {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.channels i {
  font-size: 18px;
}

.channels span {
  display: flex;
  flex-direction: column;
}

.channel-label {
  font-size: 12px;
  opacity: 0.8;
}

.channels a {
  color: #fff;
  font-weight: 600;
}

.form-card h1 {
  font-size: 30px;
}

.submit {
  justify-content: center;
  padding-block: 12px;
}

.sent {
  align-items: flex-start;
}

.sent-icon {
  background: var(--success-bg);
  color: var(--success);
}

@media (max-width: 1100px) {
  .contact {
    grid-template-columns: 1fr;
  }
}
</style>
