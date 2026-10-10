<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDateTime} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";
import useManufacturingStore from "../../../../manufacturing/application/manufacturing.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";

/**
 * Quality overview: open deviations and CAPA, audits, the release queue and the tasks of the signed-in user.
 */
const { t, locale } = useI18n();
const store = useQualityStore();
const manufacturingStore = useManufacturingStore();
const iamStore = useIamStore();

/** First name of the signed-in user. */
const firstName = computed(() => iamStore.currentUser?.fullName.split(' ')[0] ?? '');
/** Batches waiting for a release decision. */
const releaseQueue = computed(() => manufacturingStore.batches.filter(batch => batch.status === 'release-requested' || batch.status === 'on-hold'));
/** Batches of the queue that are blocked. */
const blocked = computed(() => releaseQueue.value.filter(batch => batch.status === 'on-hold'));
/** Findings that still need evidence. */
const pendingFindings = computed(() => store.findings.filter(item => item.status !== 'closed'));

/** Audits and CAPA plans in progress, as rows of the process table. */
const processes = computed(() => [
  ...store.audits.map(audit => ({
    key: audit.code, title: audit.title, detail: audit.code, owner: 'María México',
    progress: t('quality.overview.findings-closed', { closed: store.findings.length - pendingFindings.value.length, total: store.findings.length })
  })),
  ...store.capaPlans.map(plan => ({
    key: plan.code, title: plan.code, detail: plan.title, owner: plan.owner, progress: t(`quality.capa-status.${plan.status}`)
  }))
]);

/** Tasks of the signed-in user, by due date. */
const priorityQueue = computed(() => store.tasks
    .filter(task => task.owner === iamStore.currentUser?.fullName && task.status !== 'done')
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt)));

/**
 * Page where the record of a task is handled.
 * @param {string} recordCode - Linked record.
 * @returns {string} Route of the page.
 */
const linkOf = (recordCode) => {
  if (recordCode.startsWith('DEV')) return '/qa/deviations';
  if (recordCode.startsWith('CAPA')) return '/qa/capa';
  if (recordCode.startsWith('SOP')) return '/qa/documents';
  if (recordCode.startsWith('B-')) return '/qa/batch-release';
  return '/qa/tasks';
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('nav.quality-overview')]"
                 :title="t('nav.quality-overview')" :subtitle="t('quality.overview.subtitle', { name: firstName })">
      <pv-button as-child v-slot="slotProps">
        <router-link to="/qa/deviations" :class="slotProps['class']">+ {{ t('quality.overview.report-deviation') }}</router-link>
      </pv-button>
    </page-header>

    <div class="stats">
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.overview.open-deviations') }}</p>
        <p class="stat-value">{{ store.openDeviations.length }}</p>
        <p class="stat-note danger">{{ t('quality.overview.deviations-note') }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.overview.capa') }}</p>
        <p class="stat-value">{{ store.openActions.length }}</p>
        <p class="stat-note danger">{{ t('quality.overview.capa-note') }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.overview.audits') }}</p>
        <p class="stat-value">{{ store.audits.length }}</p>
        <p class="stat-note">{{ t('quality.overview.audits-note', { count: pendingFindings.length }) }}</p>
      </template></pv-card>
      <pv-card class="stat"><template #content>
        <p class="stat-label">{{ t('quality.overview.release-queue') }}</p>
        <p class="stat-value">{{ releaseQueue.length }}</p>
        <p class="stat-note danger">{{ t('quality.overview.release-note', { blocked: blocked.length, ready: releaseQueue.length - blocked.length }) }}</p>
      </template></pv-card>
    </div>

    <div v-for="batch in blocked" :key="batch.id" class="alert" role="status">
      <div class="flex-1">
        <strong>{{ t('quality.overview.blocked', { code: batch.code }) }}</strong>
        <p>{{ batch.incident }}</p>
      </div>
      <pv-button as-child v-slot="slotProps" severity="warn">
        <router-link to="/qa/deviations" :class="slotProps['class']">{{ t('quality.overview.review') }} →</router-link>
      </pv-button>
    </div>

    <div class="columns">
      <div class="stack">
        <pv-card>
          <template #title>
            <div class="row justify-content-between">
              <span>{{ t('quality.overview.priority') }}</span>
              <span class="chip chip-teal">{{ priorityQueue.length }}</span>
            </div>
          </template>
          <template #content>
            <pv-data-table :value="priorityQueue" data-key="id" scrollable :aria-label="t('quality.overview.priority')">
              <pv-column :header="t('quality.tasks.record')">
                <template #body="{ data }"><strong class="code">{{ data.recordCode.split(' ')[0] }}</strong></template>
              </pv-column>
              <pv-column field="title" :header="t('quality.overview.activity')"/>
              <pv-column :header="t('quality.capa.due')">
                <template #body="{ data }">{{ formatDateTime(data.dueAt, locale) }}</template>
              </pv-column>
              <pv-column :header="t('shell.status')">
                <template #body="{ data }"><span class="chip chip-warning">{{ t(`quality.task-status.${data.status}`) }}</span></template>
              </pv-column>
              <pv-column>
                <template #body="{ data }">
                  <pv-button as-child v-slot="slotProps" size="small">
                    <router-link :to="linkOf(data.recordCode)" :class="slotProps['class']">{{ t('quality.overview.open') }} →</router-link>
                  </pv-button>
                </template>
              </pv-column>
              <template #empty><span class="muted">{{ t('quality.overview.no-tasks') }}</span></template>
            </pv-data-table>
          </template>
        </pv-card>

        <pv-card>
          <template #title>{{ t('quality.overview.operations') }}</template>
          <template #content>
            <pv-data-table :value="processes" data-key="key" scrollable :aria-label="t('quality.overview.operations')">
              <pv-column :header="t('quality.overview.process')">
                <template #body="{ data }"><strong>{{ data.title }}</strong><span class="sub">{{ data.detail }}</span></template>
              </pv-column>
              <pv-column field="owner" :header="t('manufacturing.batches.owner')"/>
              <pv-column field="progress" :header="t('quality.overview.progress')"/>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <pv-card class="panel">
        <template #content>
          <h2>{{ t('quality.overview.decisions') }}</h2>
          <div v-for="batch in releaseQueue" :key="batch.id" class="decision" :class="{ risk: batch.status === 'on-hold' }">
            <strong>{{ t(batch.status === 'on-hold' ? 'quality.overview.risk-review' : 'quality.overview.release-review') }} · {{ batch.code }}</strong>
            <span class="small">{{ batch.lastActivity }}</span>
            <router-link :to="batch.status === 'on-hold' ? '/qa/deviations' : '/qa/batch-release'">{{ t('quality.overview.review') }} →</router-link>
          </div>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.danger {
  color: var(--danger);
}

.code {
  color: var(--teal);
}

.decision {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-left: 4px solid var(--teal);
  background: var(--mint);
}

.decision.risk {
  border-color: var(--danger);
  background: var(--danger-bg);
}
</style>
