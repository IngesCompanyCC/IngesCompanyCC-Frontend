<script setup>
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";

const route = useRoute();
const unavailableRoute = route.path;
const { t } = useI18n();
</script>

<template>
  <pv-card class="not-found">
    <template #content>
      <div class="flex flex-column align-items-center gap-3 text-center">
        <i class="pi pi-search text-5xl text-primary" aria-hidden="true"></i>
        <h1>{{ t('page-not-found.title') }}</h1>
        <p class="muted">{{ t('page-not-found.content', { 'unavailable-route': unavailableRoute }) }}</p>
        <pv-button as-child v-slot="slotProps">
          <router-link to="/" :class="slotProps['class']">{{ t('page-not-found.go-home') }}</router-link>
        </pv-button>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.not-found {
  max-width: 560px;
  margin: 48px auto;
}
</style>
