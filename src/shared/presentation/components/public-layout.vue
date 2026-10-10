<script setup>
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";

/**
 * Translation function provided by Vue I18n.
 * @type {import('vue-i18n').Composer['t']}
 */
const { t } = useI18n();
</script>

<template>
  <!-- Skip link for keyboard accessibility (a11y) allowing users to bypass navigation -->
  <a class="skip-link" href="#content">{{ t('shell.skip-to-content') }}</a>

  <!-- Root wrapper for public layout views -->
  <div class="public">
    <!-- Top header navigation bar -->
    <header class="header flex align-items-center justify-content-between px-4">
      <!-- Brand logo redirecting to sign-in page -->
      <router-link to="/sign-in" :aria-label="t('shell.home')">
        <img src="/doofplus-wordmark.png" alt="DoofPlus" class="brand">
      </router-link>

      <!-- Component for switching application language -->
      <language-switcher/>
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
</style>