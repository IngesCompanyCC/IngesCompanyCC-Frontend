<script setup>
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import axios from "axios";
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
import {formatDate} from "../format.js";
import useIamStore from "../../../iam/application/iam.store.js";
import {homeOf, workspaceEnvironments} from "../workspace-environments.js";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useIamStore();
const toast = useToast();

/** Environment of the workspace, from the route meta. */
const environment = computed(() => route.meta['environment']);
/** Sidebar links of the environment. */
const items = computed(() => workspaceEnvironments[environment.value]?.navigation ?? []);
const home = computed(() => homeOf(environment.value));
/** Landing Page of DoofPlus, whose FAQ answers the questions about the workspace. */
const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL;
/** Date of today, shown in the session status of the footer. */
const today = computed(() => formatDate(new Date().toISOString(), locale.value));

/** Collections searched from the top bar in this environment. */
const searchTargets = computed(() => workspaceEnvironments[environment.value]?.search ?? []);
const searchPlaceholder = computed(() => t(`shell.search-${environment.value}`));
const searchQuery = ref('');

/**
 * Opens the record whose code matches the search exactly, looking in the collections of the environment in order.
 * When nothing matches, a message suggests the expected format.
 */
const search = async () => {
  const code = searchQuery.value.trim().toUpperCase();
  if (!code) return;
  const baseUrl = import.meta.env.VITE_PLATFORM_API_URL;
  for (const target of searchTargets.value) {
    try {
      const url = `${baseUrl}${target.endpoint}`;
      const response = await axios.get(url, { params: { code } });
      const found = response.data;
      if (Array.isArray(found) && found.length) {
        searchQuery.value = '';
        const targetRoute = target.route.replace('{code}', encodeURIComponent(found[0].code));
        await router.push(targetRoute);
        return;
      }
    } catch {
      // try next target
    }
  }
  const example = workspaceEnvironments[environment.value]?.searchExample;
  toast.add({
    severity: 'info',
    summary: t('shell.search-empty', { code, example }),
    life: 5000
  });
};

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
  { label: t('shell.profile'), icon: 'pi pi-user-edit', command: () => router.push(`/${environment.value}/profile`) },
  { separator: true },
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
      <a class="help" :href="`${landingPageUrl}#faq`" target="_blank" rel="noopener">
        {{ t('shell.help') }}<i class="pi pi-external-link" aria-hidden="true"></i>
      </a>
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
          <form v-if="searchTargets.length" class="search hidden sm:block" role="search" @submit.prevent="search">
            <pv-icon-field>
              <pv-input-icon class="pi pi-search"/>
              <pv-input-text v-model="searchQuery" type="search" :placeholder="searchPlaceholder" :aria-label="searchPlaceholder"/>
            </pv-icon-field>
          </form>
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
      <footer-content>
        <template v-if="store.currentUser">
          {{ store.currentUser.organizationName }} · {{ store.currentUser.plant }} · {{ today }} · {{ t('shell.utc') }} · {{ t('shell.role-based') }}
        </template>
      </footer-content>
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

.help {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding: 10px 12px;
  color: #cbd5e1;
  font-size: 13px;
}

.help:hover {
  color: #fff;
}

.help .pi {
  font-size: 12px;
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

.search :deep(input) {
  width: 340px;
  border-radius: 999px;
}
</style>
