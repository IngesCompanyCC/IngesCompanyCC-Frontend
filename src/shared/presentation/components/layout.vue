<script setup>
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import useIamStore from "../../../iam/application/iam.store.js";
import {homeOf, workspaceEnvironments} from "../workspace-environments.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useIamStore();

/** Environment of the workspace, from the route meta. */
const environment = computed(() => route.meta['environment']);
/** Sidebar links of the environment. */
const items = computed(() => workspaceEnvironments[environment.value]?.navigation ?? []);
const home = computed(() => homeOf(environment.value));

/**
 * Whether a sidebar link is the current page, including its detail pages (such as a batch of the batch list).
 * @param {{to: string}} item - Sidebar link.
 * @returns {boolean} True when the route starts with the link.
 */
const isActive = (item) => route.path === item.to || route.path.startsWith(`${item.to}/`);

const drawer = ref(false);
/**
 * Toggles the navigation drawer used on small screens.
 */
const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const userMenu = ref();
const userMenuItems = computed(() => [
  { label: t('shell.sign-out'), icon: 'pi pi-sign-out', command: () => store.signOut(router) }
]);
</script>

<template>
  <a class="skip-link" href="#content">{{ t('shell.skip-to-content') }}</a>
  <div class="workspace">
    <aside class="sidebar hidden md:flex">
      <router-link :to="home" class="brand" :aria-label="t('shell.home')">
        <img src="/doofplus-wordmark.png" alt="DoofPlus">
      </router-link>
      <div v-if="store.currentUser" class="organization">
        <strong>{{ store.currentUser.organizationName }}</strong>
        <span>{{ store.currentUser.plant }} · {{ t(`environments.${environment}.short`) }}</span>
        <span class="privilege">{{ t(`privileges.${store.currentUser.privilege}`) }}</span>
      </div>
      <p class="section-title">{{ t('shell.workspace') }}</p>
      <nav :aria-label="t('shell.main-navigation')">
        <router-link v-for="item in items" :key="item.to" :to="item.to" class="nav-link" :class="{ active: isActive(item) }">{{ t(item.label) }}</router-link>
      </nav>
    </aside>

    <pv-drawer v-model:visible="drawer" :header="t('shell.workspace')" class="sidebar-drawer">
      <nav :aria-label="t('shell.main-navigation')" @click="drawer = false">
        <router-link v-for="item in items" :key="item.to" :to="item.to" class="nav-link" :class="{ active: isActive(item) }">{{ t(item.label) }}</router-link>
      </nav>
    </pv-drawer>

    <div class="main">
      <pv-toolbar class="topbar">
        <template #start>
          <pv-button class="md:hidden" icon="pi pi-bars" text rounded :aria-label="t('shell.menu')" @click="toggleDrawer"/>
        </template>
        <template #end>
          <div class="flex align-items-center gap-3">
            <language-switcher/>
            <template v-if="store.currentUser">
              <button type="button" class="user-button" aria-haspopup="true" aria-controls="user-menu"
                      :aria-label="`${t('shell.user-menu')}: ${store.currentUser.fullName}`" @click="userMenu.toggle($event)">
                <span class="avatar" aria-hidden="true">{{ store.currentUser.initials }}</span>
                <span class="user-text hidden sm:flex">
                  <strong>{{ store.currentUser.fullName }}</strong>
                  <span>{{ t(`roles.${store.currentUser.role}`) }}</span>
                </span>
              </button>
              <pv-menu id="user-menu" ref="userMenu" :model="userMenuItems" popup/>
            </template>
          </div>
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

.organization {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 12px;
  border-radius: 8px;
  background: var(--navy-soft);
}

.organization span {
  color: #cbd5e1;
  font-size: 13px;
}

.organization .privilege {
  margin-top: 14px;
  color: #fff;
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

.nav-link.active {
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

.sidebar-drawer .nav-link.active {
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

.user-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border: 0;
  border-radius: 999px;
  background: none;
  color: var(--navy);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.user-button:hover {
  background: var(--gray-bg);
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--teal);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.user-text {
  flex-direction: column;
  font-size: 13px;
}

.user-text span {
  color: var(--muted);
}

.content {
  flex: 1;
  padding: 24px;
  outline: none;
}
</style>
