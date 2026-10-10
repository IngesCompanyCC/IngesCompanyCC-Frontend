<script setup>
import {watchEffect} from "vue";
import {useI18n} from "vue-i18n";

const { locale, availableLocales, t } = useI18n();

// Keep the document language in sync so screen readers read the page in the selected language, and remember it.
watchEffect(() => {
  document.documentElement.lang = locale.value;
  localStorage.setItem('language', locale.value);
});
</script>

<template>
  <pv-select-button v-model="locale" :options="availableLocales" :allow-empty="false" :aria-label="t('shell.language')">
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>
