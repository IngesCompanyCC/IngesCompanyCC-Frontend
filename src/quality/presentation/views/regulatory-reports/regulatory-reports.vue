<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";
import {RegulatoryReport} from "../../../domain/model/regulatory-report.entity.js";

/**
 * Regulatory reports: the report library, the configuration of the selected report and its batch dossier.
 */
const { t, locale } = useI18n();
const store = useQualityStore();
const iamStore = useIamStore();

/** Code of the selected report. */
const selectedCode = ref('RPT-26012');
const selected = computed(() => store.reports.find(report => report.code === selectedCode.value));

/** Evidence of the batch dossier, derived from the quality records of the batch. */
const dossier = computed(() => {
  const batch = selected.value?.scope ?? '';
  const results = store.resultsOf(batch);
  const deviations = store.deviations.filter(item => item.batchCode === batch);
  return [
    { key: 'genealogy', state: 'linked', tone: 'chip-success' },
    { key: 'analytical', state: results.length && results.every(r => r.approval === 'approved') ? 'approved' : 'approval-pending', tone: 'chip-warning' },
    { key: 'deviation', state: deviations.every(d => d.status === 'dispositioned' || d.status === 'closed') ? 'approved' : 'missing-approval', tone: 'chip-danger' },
    { key: 'certificate', state: 'not-available', tone: 'chip-neutral' }
  ];
});

/**
 * Color of a report status chip.
 * @param {string} status - Report status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({ blocked: 'chip-danger', approved: 'chip-success', draft: 'chip-neutral' })[status] ?? 'chip-neutral';

/** Creates a batch dossier draft for the batch on hold. */
const createReport = () => {
  const code = store.nextCode('RPT', store.reports.map(report => report.code));
  store.addReport(new RegulatoryReport({
    code, type: 'Batch dossier', scope: 'B-26042', owner: iamStore.currentUser?.fullName ?? '', status: 'draft',
    template: 'Batch release dossier v1.2', format: 'PDF package + CSV appendix', createdAt: new Date().toISOString().slice(0, 10)
  }));
  selectedCode.value = code;
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('nav.regulatory-reports')]"
                 :title="t('nav.regulatory-reports')" :subtitle="t('quality.reports.subtitle')">
      <pv-button :label="`+ ${t('quality.reports.create')}`" @click="createReport"/>
    </page-header>

    <div class="columns">
      <pv-card>
        <template #title>{{ t('quality.reports.library') }}</template>
        <template #subtitle>{{ t('quality.reports.library-text', { count: store.reports.length }) }}</template>
        <template #content>
          <pv-data-table :value="store.reports" data-key="id" scrollable row-hover :aria-label="t('quality.reports.library')"
                         :row-class="report => ({ highlight: report.code === selectedCode })" @row-click="event => selectedCode = event.data.code">
            <pv-column :header="t('quality.reports.report')">
              <template #body="{ data }"><strong>{{ data.code }}</strong><span class="sub">{{ data.type }}</span></template>
            </pv-column>
            <pv-column field="scope" :header="t('quality.reports.scope')"/>
            <pv-column field="owner" :header="t('manufacturing.batches.owner')"/>
            <pv-column :header="t('shell.status')">
              <template #body="{ data }"><span class="chip chip-dot" :class="toneOf(data.status)">{{ t(`quality.report-status.${data.status}`) }}</span></template>
            </pv-column>
          </pv-data-table>
        </template>
      </pv-card>
      <pv-card v-if="selected" class="panel">
        <template #content>
          <h2>{{ t('quality.reports.configuration') }}</h2>
          <p class="label">{{ t('quality.reports.template') }}</p><p>{{ selected.template }}</p>
          <p class="label">{{ t('quality.reports.scope') }}</p><p>{{ selected.scope }}</p>
          <p class="label">{{ t('quality.reports.format') }}</p><p>{{ selected.format }}</p>
          <p class="label">{{ t('manufacturing.batches.owner') }}</p><p>{{ selected.owner }}</p>
          <p class="label">{{ t('quality.reports.created') }}</p><p>{{ formatDate(selected.createdAt, locale) }}</p>
        </template>
      </pv-card>
    </div>

    <div v-if="selected" class="columns">
      <pv-card class="panel">
        <template #content>
          <div class="row justify-content-between">
            <h2>{{ selected.type }} · {{ selected.code }}</h2>
            <span class="chip chip-dot" :class="toneOf(selected.status)">{{ t(`quality.report-status.${selected.status}`) }}</span>
          </div>
          <p class="small muted">{{ t('quality.reports.dossier-text') }}</p>
          <div v-for="item in dossier" :key="item.key" class="dossier-item">
            <strong>{{ t(`quality.reports.dossier.${item.key}`) }}</strong>
            <span class="chip chip-dot" :class="item.state === 'linked' || item.state === 'approved' ? 'chip-success' : item.tone">
              {{ t(`quality.reports.dossier-state.${item.state}`) }}
            </span>
          </div>
        </template>
      </pv-card>
      <pv-card class="panel">
        <template #content>
          <h2>{{ t('quality.reports.review') }}</h2>
          <strong>{{ t('quality.reports.completeness') }}</strong><p class="small muted">{{ t('quality.reports.completeness-text') }}</p>
          <strong>{{ t('quality.reports.no-certification') }}</strong><p class="small muted">{{ t('quality.reports.no-certification-text') }}</p>
          <strong>{{ t('quality.reports.permissions') }}</strong><p class="small muted">{{ t('quality.reports.permissions-text') }}</p>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.label {
  color: var(--slate);
  font-size: 12px;
}

.dossier-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
