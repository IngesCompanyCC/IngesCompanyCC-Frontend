<script setup>
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";

const { t } = useI18n();
</script>

<template>
  <a class="skip-link" href="#content">{{ t('shell.skip-to-content') }}</a>
  <div class="public">
    <header class="header flex align-items-center justify-content-between px-4">
      <router-link to="/sign-in" :aria-label="t('shell.home')">
        <img src="/doofplus-wordmark.png" alt="DoofPlus" class="brand">
      </router-link>
      <language-switcher/>
    </header>
    <main id="content" class="content" tabindex="-1">
      <router-view/>
    </main>
    <footer-content/>
  </div>
</template>

<style scoped>
.public {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  height: 64px;
  border-bottom: 1px solid var(--border);
  background: #fff;
}

.brand {
  display: block;
  height: 30px;
}

.content {
  flex: 1;
  padding: 40px 24px;
  outline: none;
}
</style>
