<script setup>
import { useI18n } from "vue-i18n";

/**
 * Translation function provided by Vue I18n.
 * @type {import('vue-i18n').Composer['t']}
 */
const { t } = useI18n();

/**
 * Base URL for external landing page resources retrieved from environment variables.
 * @type {string}
 */
const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL;
</script>

<template>
  <!-- Main footer section with responsive layout and padding -->
  <footer class="footer flex flex-column md:flex-row justify-content-between gap-2 px-4 py-3">
    <!-- Copyright notice rendered using internationalization -->
    <p>{{ t('footer.copyright') }}</p>

    <!-- Legal links navigation container with dynamic accessibility label -->
    <nav class="flex gap-4" :aria-label="t('shell.legal')">
      <!-- External link to the Terms and Conditions page -->
      <a :href="`${landingPageUrl}terms.html`">{{ t('footer.terms') }}</a>

      <!-- External link to the Privacy Policy page -->
      <a :href="`${landingPageUrl}privacy.html`">{{ t('footer.privacy') }}</a>
    </nav>
  </footer>
</template>

<style scoped>
/**
 * Scoped styles for the footer container.
 */
.footer {
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
}

/**
 * Scoped styles for legal navigation anchor links within the footer.
 */
.footer a {
  color: var(--muted);
  font-weight: 500;
}
</style>