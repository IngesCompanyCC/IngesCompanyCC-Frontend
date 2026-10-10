<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import useQualityStore from "../../../application/quality.store.js";

/**
 * Quality indicators: complete batch records, traceability gaps and closed deviations by root cause.
 */
const { t } = useI18n();
const store = useQualityStore();

/** Closed batches of the quarter. */
const closedBatches = 50;
/** Gap selected in the table. */
const selectedGap = ref('B-26029');
const selected = computed(() => store.gaps.find(gap => gap.batchCode === selectedGap.value));

/** Months of the trend, oldest first. */
const months = computed(() => [...new Set(store.trends.map(item => item.month))].sort());
/** Root causes of the trend. */
const causes = computed(() => [...new Set(store.trends.map(item => item.rootCause))]);
/** Deviations closed in the quarter. */
const closedDeviations = computed(() => store.trends.reduce((total, item) => total + item.count, 0));

/**
 * Deviations of a root cause in a month.
 * @param {string} cause - Root cause.
 * @param {string} month - Month.
 * @returns {number} Number of deviations.
 */
const countOf = (cause, month) => store.trends.find(item => item.rootCause === cause && item.month === month)?.count ?? 0;

/**
 * Deviations of a root cause in the quarter.
 * @param {string} cause - Root cause.
 * @returns {number} Number of deviations.
 */
const totalOf = (cause) => store.trends.filter(item => item.rootCause === cause).reduce((total, item) => total + item.count, 0);

/** Root causes repeated three or more times in the quarter. */
const recurrent = computed(() => causes.value.filter(cause => totalOf(cause) >= 3));

/** Exports the indicators as CSV. */
const exportCsv = () => {
  const rows = ['root_cause,month,closed_deviations', ...store.trends.map(item => `"${item.rootCause}",${item.month},${item.count}`)];
  const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quality-indicators.csv';
  link.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('nav.quality-indicators')]"
                 :title="t('nav.quality-indicators')" :subtitle="t('quality.indicators.subtitle')">
      <pv-button icon="pi pi-download" :label="t('quality.indicators.export')" @click="exportCsv"/>
    </page-header>

    <div class="stats">
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.indicators.complete') }}</p>
        <p class="stat-value">{{ (closedBatches - store.gaps.length) * 100 / closedBatches }} %</p>
        <p class="stat-note">{{ t('quality.indicators.complete-note', { done: closedBatches - store.gaps.length, total: closedBatches }) }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.indicators.missing') }}</p>
        <p class="stat-value">{{ store.gaps.length }}</p>
        <p class="stat-note">{{ t('quality.indicators.missing-note') }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.indicators.closed') }}</p>
        <p class="stat-value">{{ closedDeviations }}</p>
        <p class="stat-note">{{ t('quality.indicators.closed-note') }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.indicators.recurrent') }}</p>
        <p class="stat-value">{{ recurrent.length }}</p>
        <p class="stat-note">{{ t('quality.indicators.recurrent-note') }}</p>
      </template></pv-card>
    </div>

    <div class="grid-2">
      <pv-card>
        <template #title>{{ t('quality.indicators.gaps') }}</template>
        <template #subtitle>{{ t('quality.indicators.gaps-text') }}</template>
        <template #content>
          <pv-data-table :value="store.gaps" data-key="id" scrollable row-hover :aria-label="t('quality.indicators.gaps')"
                         :row-class="gap => ({ highlight: gap.batchCode === selectedGap })" @row-click="event => selectedGap = event.data.batchCode">
            <pv-column :header="t('quality.results.batch')">
              <template #body="{ data }"><strong>{{ data.batchCode }}</strong></template>
            </pv-column>
            <pv-column field="product" :header="t('manufacturing.products.product')"/>
            <pv-column field="missingRecord" :header="t('quality.indicators.missing-records')"/>
          </pv-data-table>
          <p v-if="selected" class="detail">{{ selected.batchCode }} · {{ selected.detail }}</p>
        </template>
      </pv-card>

      <pv-card class="panel">
        <template #content>
          <h2>{{ t('quality.indicators.by-cause') }}</h2>
          <p class="small muted">{{ t('quality.indicators.by-cause-text') }}</p>
          <div class="heat" :style="{ gridTemplateColumns: `minmax(120px, 180px) repeat(${months.length}, 1fr)` }" role="table"
               :aria-label="t('quality.indicators.by-cause')">
            <span></span>
            <span v-for="month in months" :key="month" class="month">{{ month }}</span>
            <template v-for="cause in causes" :key="cause">
              <span class="cause">{{ cause }}</span>
              <span v-for="month in months" :key="`${cause}-${month}`" class="cell">
                <i :style="{ height: `${4 + countOf(cause, month) * 8}px` }" :class="{ hot: recurrent.includes(cause) }"></i>
                <small>{{ countOf(cause, month) }}</small>
              </span>
            </template>
          </div>
          <p v-for="cause in recurrent" :key="cause" class="small danger">{{ t('quality.indicators.recurrent-text', { cause, count: totalOf(cause) }) }}</p>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.detail {
  padding-top: 14px;
  color: var(--danger);
  font-size: 13px;
}

.heat {
  display: grid;
  gap: 14px 10px;
  align-items: end;
}

.month {
  color: var(--slate);
  font-size: 12px;
  text-align: center;
}

.cause {
  font-size: 13px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.cell i {
  display: block;
  width: 26px;
  border-radius: 3px;
  background: var(--teal);
}

.cell i.hot {
  background: var(--danger);
}

.cell small {
  color: var(--slate);
}

.danger {
  color: var(--danger);
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
