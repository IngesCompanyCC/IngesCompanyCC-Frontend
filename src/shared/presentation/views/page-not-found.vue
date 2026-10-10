<script setup>
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

/**
 * Represents the current active route location.
 * @type {import('vue-router').RouteLocationNormalizedLoaded}
 */
const route = useRoute();

/**
 * The non-existent or unavailable path attempted by the user.
 * @type {string}
 */
const unavailableRoute = route.path;

/**
 * Translation function provided by Vue I18n.
 * @type {import('vue-i18n').Composer['t']}
 */
const { t } = useI18n();
</script>

<template>
  <!-- Card component container for displaying the 404 page not found error -->
  <pv-card class="not-found">
    <template #content>
      <!-- Flex container centering content vertically and horizontally -->
      <div class="flex flex-column align-items-center gap-3 text-center">
        <!-- Decorative search icon with screen reader accessibility hidden -->
        <i class="pi pi-search text-5xl text-primary" aria-hidden="true"></i>

        <!-- Translated page title -->
        <h1>{{ t('page-not-found.title') }}</h1>

        <!-- Error message displaying the unavailable route dynamically -->
        <p class="muted">{{ t('page-not-found.content', { 'unavailable-route': unavailableRoute }) }}</p>

        <!-- PrimeVue button wrapper for router navigation -->
        <pv-button as-child v-slot="slotProps">
          <!-- Navigation link to redirect the user back to the home route -->
          <router-link to="/" :class="slotProps['class']">{{ t('page-not-found.go-home') }}</router-link>
        </pv-button>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
/**
 * Scoped styles for the Not Found container element.
 */
.not-found {
  max-width: 560px;
  margin: 48px auto;
}
</style>