<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDateTime} from "../../../../shared/presentation/format.js";
import useMonitoringStore from "../../../application/monitoring.store.js";

/**
 * IoT incidents: active alerts, or every alert including the closed ones.
 */
const { t, locale } = useI18n();
const store = useMonitoringStore();

/** Whether closed alerts are shown. */
const showClosed = ref(false);
const filterOptions = computed(() => [
  { label: t('monitoring.incidents.active'), value: false },
  { label: t('monitoring.incidents.all'), value: true }
]);
/** Alerts shown in the table. */
const visible = computed(() => showClosed.value ? store.alerts : store.activeAlerts);
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.incidents')]"
                 :title="t('nav.incidents')" :subtitle="t('monitoring.incidents.subtitle')"/>

    <pv-select-button v-model="showClosed" :options="filterOptions" option-label="label" option-value="value"
                      :allow-empty="false" :aria-label="t('shell.filters')" class="align-self-start"/>

    <div class="alert" role="status">
      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
      <strong>{{ t('monitoring.acknowledgment-rule') }}</strong>
    </div>

    <pv-card>
      <template #content>
        <pv-data-table :value="visible" data-key="id" scrollable :aria-label="t('nav.incidents')">
          <pv-column :header="t('monitoring.alert-sensor')">
            <template #body="{ data }">
              <router-link :to="`/production/sensors/${data.sensorCode}`">{{ data.code }}</router-link>
              <span class="sub">{{ data.sensorCode }} · {{ data.equipmentCode }}</span>
            </template>
          </pv-column>
          <pv-column :header="t('monitoring.incidents.what')">
            <template #body="{ data }">
              {{ data.title }}
              <span v-if="data.acknowledgedAt" class="sub">{{ formatDateTime(data.acknowledgedAt, locale) }} UTC · {{ data.acknowledgedBy }}</span>
            </template>
          </pv-column>
          <pv-column :header="t('monitoring.severity')">
            <template #body="{ data }">
              <span class="chip" :class="data.severity === 'critical' ? 'chip-danger' : 'chip-warning'">{{ t(`monitoring.severity-level.${data.severity}`) }}</span>
            </template>
          </pv-column>
          <pv-column :header="t('monitoring.status')">
            <template #body="{ data }"><span class="chip chip-neutral">{{ t(`monitoring.alert-status.${data.status}`) }}</span></template>
          </pv-column>
          <pv-column :header="t('monitoring.detail.linked')">
            <template #body="{ data }">{{ data.linkedRecord || '—' }}</template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </section>
</template>
