<script setup>
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL;
</script>

<template>
  <footer class="footer flex flex-column md:flex-row justify-content-between gap-2 px-4 py-3">
    <p>{{ t('footer.copyright') }}</p>
    <nav class="flex gap-4" :aria-label="t('shell.legal')">
      <a :href="`${landingPageUrl}terms.html`">{{ t('footer.terms') }}</a>
      <a :href="`${landingPageUrl}privacy.html`">{{ t('footer.privacy') }}</a>
    </nav>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
}

.footer a {
  color: var(--muted);
  font-weight: 500;
}
</style>
