<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";

/**
 * Translation function provided by Vue I18n.
 * @type {import('vue-i18n').Composer['t']}
 */
const { t } = useI18n();
const route = useRoute();

/** Landing Page of DoofPlus: the local one while developing and the published one in production. */
const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL;

/**
 * Whether the current page is the sign-in entry page, where the user chooses the environment.
 * There the link goes back to the Landing Page; on the sign-in of each environment it goes back to the choice of environment.
 */
const isEntryPage = computed(() => route.path === '/sign-in');
</script>

<template>
  <!-- Skip link for keyboard accessibility (a11y) allowing users to bypass navigation -->
  <a class="skip-link" href="#content">{{ t('shell.skip-to-content') }}</a>

  <!-- Root wrapper for public layout views -->
  <div class="public">
    <!-- Top header navigation bar -->
    <header class="header flex align-items-center justify-content-between px-4">
      <!-- Brand logo redirecting to sign-in page -->
      <div class="flex align-items-center gap-5">
        <router-link to="/sign-in" :aria-label="t('shell.home')">
          <img src="/doofplus-wordmark.png" alt="DoofPlus" class="brand">
        </router-link>
        <!-- Link one level up: the Landing Page from the entry page, the choice of environment from each sign-in -->
        <a v-if="isEntryPage" :href="landingPageUrl" class="back"><i class="pi pi-arrow-left" aria-hidden="true"></i>{{ t('shell.back-to-doofplus') }}</a>
        <router-link v-else to="/sign-in" class="back"><i class="pi pi-arrow-left" aria-hidden="true"></i>{{ t('shell.all-environments') }}</router-link>
      </div>

      <div class="flex align-items-center gap-4">
        <!-- Contact us form of the DoofPlus team (US04) -->
        <router-link :to="{ name: 'contact-us' }" class="contact-link" :aria-label="t('shell.contact-us')"><i class="pi pi-envelope" aria-hidden="true"></i><span class="contact-label">{{ t('shell.contact-us') }}</span></router-link>
        <!-- Component for switching application language -->
        <language-switcher/>
      </div>
    </header>

    <!-- Main content container targeted by the skip link -->
    <main id="content" class="content" tabindex="-1">
      <!-- Dynamic router view placeholder for page rendering -->
      <router-view/>
    </main>

    <!-- Shared footer component -->
    <footer-content/>
  </div>
</template>

<style scoped>
/**
 * Scoped styles for the primary public layout container.
 */
.public {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/**
 * Scoped styles for the top application header.
 */
.header {
  height: 64px;
  border-bottom: 1px solid var(--border);
  background: #fff;
}

/**
 * Scoped styles for the brand mark image element.
 */
.brand {
  display: block;
  height: 30px;
}

/**
 * Scoped styles for the main router content wrapper.
 */
.content {
  flex: 1;
  padding: 40px 24px;
  outline: none;
}

.back,
.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

@media (max-width: 576px) {
  .back,
  .contact-label {
    display: none;
  }
}
</style>