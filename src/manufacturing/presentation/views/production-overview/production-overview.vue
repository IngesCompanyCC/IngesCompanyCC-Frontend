<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatNumber} from "../../../../shared/presentation/format.js";
import useManufacturingStore from "../../../application/manufacturing.store.js";
import useMonitoringStore from "../../../../monitoring/application/monitoring.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";

/**
 * Production overview: the schedule of today, equipment and material readiness and the incident priorities.
 */
const { t, locale } = useI18n();
const store = useManufacturingStore();
const monitoringStore = useMonitoringStore();
const iamStore = useIamStore();

/** First name of the signed-in user. */
const firstName = computed(() => iamStore.currentUser?.fullName.split(' ')[0] ?? '');

/** Orders of the schedule with their batch and product. */
const schedule = computed(() => store.orders.map(order => ({
  order, batch: store.batchByCode(order.batchCode), product: store.productByCode(order.productCode)
})));

/** Units produced by the batches in progress or on hold. */
const output = computed(() => store.batches
    .filter(batch => batch.status === 'in-progress' || batch.status === 'on-hold')
    .reduce((total, batch) => total + Math.round(batch.quantity * batch.progress / 100), 0));

/** Batch on hold, shown in the top alert. */
const heldBatch = computed(() => store.batches.find(batch => batch.status === 'on-hold'));

/** Equipment and material that need attention before they can be used. */
const readiness = computed(() => [
  ...monitoringStore.equipment.map(item => ({
    code: item.code,
    tone: item.calibrationStatus === 'fit' ? 'chip-success' : item.calibrationStatus === 'due' ? 'chip-warning' : 'chip-danger',
    label: `monitoring.calibration.${item.calibrationStatus}`,
    assignment: monitoringStore.sensorsOf(item.code)[0]?.assignedBatch || '—'
  })),
  ...store.materialLots.filter(lot => lot.status !== 'approved').map(lot => ({
    code: `${lot.code} · ${lot.category.toUpperCase()}`, tone: 'chip-warning',
    label: `manufacturing.lot-status.${lot.status}`, assignment: lot.allocatedBatch || '—'
  }))
]);

/**
 * Color of a batch status chip.
 * @param {string|undefined} status - Batch status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({ 'on-hold': 'chip-danger', 'in-progress': 'chip-success', planned: 'chip-neutral' })[status ?? ''] ?? 'chip-teal';
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.production-overview')]"
                 :title="t('nav.production-overview')" :subtitle="t('manufacturing.overview.subtitle', { name: firstName })">
      <pv-button as-child v-slot="slotProps">
        <router-link to="/production/batches" :class="slotProps['class']">+ {{ t('manufacturing.overview.create-order') }}</router-link>
      </pv-button>
    </page-header>

    <div class="stats">
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('manufacturing.overview.orders') }}</p>
          <p class="stat-value">{{ store.orders.length }}</p>
          <p class="stat-note">{{ t('manufacturing.overview.orders-note', { running: store.batchCounts['in-progress'] ?? 0, held: store.batchCounts['on-hold'] ?? 0 }) }}</p>
        </template>
      </pv-card>
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('manufacturing.overview.output') }}</p>
          <p class="stat-value">{{ formatNumber(output, locale) }}</p>
          <p class="stat-note">{{ t('manufacturing.overview.output-note') }}</p>
        </template>
      </pv-card>
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('manufacturing.overview.batches') }}</p>
          <p class="stat-value">{{ (store.batchCounts['in-progress'] ?? 0) + (store.batchCounts['on-hold'] ?? 0) }}</p>
          <p class="stat-note">{{ t('manufacturing.overview.batches-note') }}</p>
        </template>
      </pv-card>
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('manufacturing.overview.incidents') }}</p>
          <p class="stat-value">{{ monitoringStore.activeAlerts.length }}</p>
          <p class="stat-note">{{ t('manufacturing.overview.incidents-note') }}</p>
        </template>
      </pv-card>
    </div>

    <div v-if="heldBatch" class="alert held" role="alert">
      <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
      <strong class="flex-1">{{ heldBatch.line }} · {{ heldBatch.code }} · {{ heldBatch.incident }}</strong>
      <pv-button as-child v-slot="slotProps" severity="secondary" outlined>
        <router-link :to="`/production/batches/${heldBatch.code}/iot`" :class="slotProps['class']">{{ t('manufacturing.overview.view-evidence') }}</router-link>
      </pv-button>
    </div>

    <div class="columns">
      <div class="stack">
        <pv-card>
          <template #title>{{ t('manufacturing.overview.schedule') }}</template>
          <template #subtitle>{{ t('manufacturing.overview.schedule-text') }}</template>
          <template #content>
            <pv-data-table :value="schedule" :data-key="row => row.order.id" scrollable :aria-label="t('manufacturing.overview.schedule')"
                           :row-class="row => ({ highlight: row.batch?.status === 'on-hold' })">
              <pv-column :header="t('manufacturing.orders.order')">
                <template #body="{ data }">
                  <router-link :to="`/production/orders/${data.order.code}`">{{ data.order.code }}</router-link>
                  <span class="sub">{{ data.order.batchCode }}</span>
                </template>
              </pv-column>
              <pv-column :header="t('manufacturing.products.product')">
                <template #body="{ data }">{{ data.product?.name }}</template>
              </pv-column>
              <pv-column :header="t('manufacturing.batches.line')">
                <template #body="{ data }">{{ data.order.line }}</template>
              </pv-column>
              <pv-column :header="t('manufacturing.orders.progress')">
                <template #body="{ data }">{{ data.batch?.progress ?? 0 }} %</template>
              </pv-column>
              <pv-column :header="t('manufacturing.products.status')">
                <template #body="{ data }">
                  <span class="chip chip-dot" :class="toneOf(data.batch?.status)">{{ t(`manufacturing.batch-status.${data.batch?.status ?? 'planned'}`) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>

        <pv-card>
          <template #title>{{ t('manufacturing.overview.readiness') }}</template>
          <template #content>
            <pv-data-table :value="readiness" data-key="code" scrollable :aria-label="t('manufacturing.overview.readiness')">
              <pv-column :header="t('manufacturing.overview.resource')">
                <template #body="{ data }"><strong>{{ data.code }}</strong></template>
              </pv-column>
              <pv-column :header="t('manufacturing.overview.availability')">
                <template #body="{ data }"><span class="chip chip-dot" :class="data.tone">{{ t(data.label) }}</span></template>
              </pv-column>
              <pv-column field="assignment" :header="t('manufacturing.overview.assignment')"/>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <aside class="stack">
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('manufacturing.overview.priorities') }}</h2>
            <p class="small muted">{{ t('manufacturing.overview.priorities-text') }}</p>
            <router-link v-for="alert in monitoringStore.activeAlerts" :key="alert.id" class="incident" :to="`/production/sensors/${alert.sensorCode}`">
              <strong>{{ alert.code }} · {{ alert.title }}</strong>
              <span class="small muted">{{ alert.sensorCode }} · {{ alert.equipmentCode }}{{ alert.linkedRecord ? ` · ${alert.linkedRecord}` : '' }}</span>
              <span class="chip chip-dot" :class="alert.severity === 'critical' ? 'chip-warning' : 'chip-neutral'">{{ t(`monitoring.alert-status.${alert.status}`) }}</span>
            </router-link>
          </template>
        </pv-card>
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('manufacturing.overview.handover') }}</h2>
            <div v-for="item in [1, 2, 3]" :key="item">
              <strong>{{ t(`manufacturing.overview.handover-${item}`) }}</strong>
              <p class="small muted">{{ t(`manufacturing.overview.handover-${item}-text`) }}</p>
            </div>
          </template>
        </pv-card>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-note {
  color: var(--muted);
  font-size: 12px;
}

.held {
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger-dark);
}

.incident {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--navy);
  font-weight: 400;
}

.incident:hover {
  border-color: var(--teal);
}
</style>
