<script setup>
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";

const { t } = useI18n();

const drawer = ref(false);
/**
 * Toggles the navigation drawer used on small screens.
 */
const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const items = [
  { label: 'nav.production-overview', to: '/production/overview' },
  { label: 'nav.production-orders', to: '/production/orders' },
  { label: 'nav.products-formulas', to: '/production/products' },
  { label: 'nav.batches', to: '/production/batches' },
  { label: 'nav.raw-materials', to: '/production/raw-materials' }
];
</script>

<template>
  <a class="skip-link" href="#content">{{ t('shell.skip-to-content') }}</a>
  <pv-toast/>
  <pv-confirm-dialog/>
  <div class="workspace">
    <aside class="sidebar hidden md:flex">
      <router-link :to="items[0].to" class="brand" :aria-label="t('shell.home')">
        <img src="/doofplus-wordmark.png" alt="DoofPlus">
      </router-link>
      <p class="section-title">{{ t('shell.workspace') }}</p>
      <nav :aria-label="t('shell.main-navigation')">
        <router-link v-for="item in items" :key="item.to" :to="item.to" class="nav-link">{{ t(item.label) }}</router-link>
      </nav>
    </aside>

    <pv-drawer v-model:visible="drawer" :header="t('shell.workspace')" class="sidebar-drawer">
      <nav :aria-label="t('shell.main-navigation')" @click="drawer = false">
        <router-link v-for="item in items" :key="item.to" :to="item.to" class="nav-link">{{ t(item.label) }}</router-link>
      </nav>
    </pv-drawer>

    <div class="main">
      <pv-toolbar class="topbar">
        <template #start>
          <pv-button class="md:hidden" icon="pi pi-bars" text rounded :aria-label="t('shell.menu')" @click="toggleDrawer"/>
        </template>
        <template #end>
          <language-switcher/>
        </template>
      </pv-toolbar>
      <main id="content" class="content" tabindex="-1">
        <router-view/>
      </main>
      <footer-content/>
    </div>
  </div>
</template>

<style scoped>
.workspace {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  flex-direction: column;
  flex-shrink: 0;
  width: 240px;
  padding: 20px 12px 24px;
  background: var(--navy);
  color: #fff;
}

.brand {
  padding: 2px 12px 18px;
}

.brand img {
  height: 34px;
  filter: brightness(0) invert(1);
}

.section-title {
  margin: 30px 12px 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  padding: 10px 12px;
  border-radius: 999px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
}

.nav-link:hover {
  color: #fff;
  background: var(--navy-soft);
}

.nav-link.router-link-active {
  color: #fff;
  background: var(--teal);
}

.sidebar-drawer .nav-link {
  color: var(--slate);
}

.sidebar-drawer .nav-link:hover {
  color: var(--navy);
  background: var(--mint);
}

.sidebar-drawer .nav-link.router-link-active {
  color: #fff;
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.topbar {
  border: 0;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
  background: #fff;
}

.content {
  flex: 1;
  padding: 24px;
  outline: none;
}
</style>
