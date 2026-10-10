<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";
import {AuditFinding} from "../../../domain/model/audit-finding.entity.js";

/**
 * Audit in progress: the findings register, the selected finding, the audit plan and the evidence package.
 */
const { t, locale } = useI18n();
const store = useQualityStore();

/** Audit shown. */
const audit = computed(() => store.audits[0]);
const findings = computed(() => store.findingsOf(audit.value?.code ?? ''));
/** Findings already closed. */
const closedCount = computed(() => findings.value.filter(item => item.status === 'closed').length);
/** Code of the selected finding. */
const selectedCode = ref('F-01');
const selected = computed(() => findings.value.find(item => item.code === selectedCode.value));
/** Evidence of the audit. */
const evidence = computed(() => store.evidenceOf(audit.value?.code ?? ''));

/** Whether the new finding form is open. */
const adding = ref(false);
const emptyForm = () => ({ title: '', classification: 'minor', owner: '', observation: '' });
/** New finding form. */
const form = reactive(emptyForm());
const submitted = ref(false);
const errors = computed(() => ({
  title: submitted.value && !form.title.trim(),
  owner: submitted.value && !form.owner.trim(),
  observation: submitted.value && !form.observation.trim()
}));
const classificationOptions = computed(() => ['minor', 'major'].map(value => ({ label: t(`quality.classification.${value}`), value })));

/**
 * Color of a finding status chip.
 * @param {string} status - Finding status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({ 'evidence-pending': 'chip-warning', 'in-review': 'chip-info', closed: 'chip-success' })[status] ?? 'chip-neutral';

/** Adds the finding to the audit. */
const addFinding = () => {
  if (!audit.value) return;
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  const code = `F-0${findings.value.length + 1}`;
  store.addFinding(new AuditFinding({
    auditCode: audit.value.code, code, title: form.title.trim(), classification: form.classification, owner: form.owner.trim(),
    dueAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), status: 'evidence-pending', observation: form.observation.trim(),
    response: '', closureRequirement: 'Independent reviewer verifies the corrective evidence.'
  }));
  selectedCode.value = code;
  Object.assign(form, emptyForm());
  submitted.value = false;
  adding.value = false;
};
</script>

<template>
  <section class="page">
    <template v-if="audit">
      <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('quality.audits.title')]"
                   :title="t('quality.audits.title')" :subtitle="`${audit.code} · ${audit.title} · ${audit.period}`">
        <pv-button :label="`+ ${t('quality.audits.add')}`" :aria-expanded="adding" @click="adding = !adding"/>
      </page-header>

      <div class="stats">
        <pv-card class="stat"><template #content>
          <p class="stat-label">{{ t('quality.audits.findings') }}</p><p class="stat-value">{{ findings.length }}</p>
        </template></pv-card>
        <pv-card class="stat"><template #content>
          <p class="stat-label">{{ t('quality.audits.closed') }}</p><p class="stat-value">{{ closedCount }}</p>
        </template></pv-card>
        <pv-card class="stat"><template #content>
          <p class="stat-label">{{ t('quality.audits.pending') }}</p><p class="stat-value warn">{{ findings.length - closedCount }}</p>
        </template></pv-card>
        <pv-card class="stat"><template #content>
          <p class="stat-label">{{ t('quality.audits.progress') }}</p>
          <p class="stat-value teal">{{ audit.areasReviewed * 100 / audit.areasTotal }}%</p>
          <p class="stat-note">{{ t('quality.audits.areas', { done: audit.areasReviewed, total: audit.areasTotal }) }}</p>
        </template></pv-card>
      </div>

      <pv-card v-if="adding" class="panel">
        <template #content>
          <form class="flex flex-column gap-3" novalidate @submit.prevent="addFinding">
            <h2>{{ t('quality.audits.add') }}</h2>
            <div class="form-grid">
              <div class="field">
                <label for="finding-title">{{ t('quality.audits.finding') }} *</label>
                <pv-input-text id="finding-title" v-model="form.title" fluid :invalid="errors.title"/>
              </div>
              <div class="field">
                <label for="finding-class">{{ t('quality.audits.class') }}</label>
                <pv-select input-id="finding-class" v-model="form.classification" :options="classificationOptions" option-label="label" option-value="value" fluid/>
              </div>
              <div class="field">
                <label for="finding-owner">{{ t('manufacturing.batches.owner') }} *</label>
                <pv-input-text id="finding-owner" v-model="form.owner" fluid :invalid="errors.owner"/>
              </div>
              <div class="field full">
                <label for="finding-observation">{{ t('quality.audits.observation') }} *</label>
                <pv-textarea id="finding-observation" v-model="form.observation" rows="2" fluid :invalid="errors.observation"/>
              </div>
            </div>
            <div class="row">
              <pv-button type="submit" :label="t('quality.audits.save')"/>
              <pv-button type="button" :label="t('shell.cancel')" severity="secondary" outlined @click="adding = false"/>
            </div>
          </form>
        </template>
      </pv-card>

      <div class="columns">
        <div class="stack">
          <pv-card>
            <template #title>{{ t('quality.audits.register') }}</template>
            <template #content>
              <pv-data-table :value="findings" data-key="id" scrollable row-hover :aria-label="t('quality.audits.register')"
                             :row-class="finding => ({ highlight: finding.code === selectedCode })" @row-click="event => selectedCode = event.data.code">
                <pv-column :header="t('quality.audits.finding')">
                  <template #body="{ data }"><strong class="code">{{ data.code }}</strong> · {{ data.title }}</template>
                </pv-column>
                <pv-column :header="t('quality.audits.class')">
                  <template #body="{ data }">
                    <span class="chip" :class="data.classification === 'major' ? 'chip-danger' : 'chip-info'">{{ t(`quality.classification.${data.classification}`) }}</span>
                  </template>
                </pv-column>
                <pv-column :header="t('quality.audits.owner-due')">
                  <template #body="{ data }">{{ data.owner }} · {{ formatDate(data.dueAt, locale) }}</template>
                </pv-column>
                <pv-column :header="t('shell.status')">
                  <template #body="{ data }"><span class="chip" :class="toneOf(data.status)">{{ t(`quality.finding-status.${data.status}`) }}</span></template>
                </pv-column>
              </pv-data-table>
            </template>
          </pv-card>
          <pv-card v-if="selected" class="panel">
            <template #content>
              <div class="selected-head">
                <strong>{{ t('quality.audits.selected') }} · {{ selected.code }} · {{ selected.title }}</strong>
                <span class="chip" :class="selected.classification === 'major' ? 'chip-danger' : 'chip-info'">{{ t(`quality.classification.${selected.classification}`) }}</span>
              </div>
              <p class="label">{{ t('quality.audits.observation') }}</p><p>{{ selected.observation }}</p>
              <p class="label">{{ t('quality.audits.response') }}</p><p>{{ selected.response || '—' }}</p>
              <p class="label">{{ t('quality.audits.closure') }}</p><p>{{ selected.closureRequirement }}</p>
            </template>
          </pv-card>
        </div>

        <aside class="stack">
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('quality.audits.plan') }}</h2>
              <ol class="plan">
                <li class="done"><strong>{{ t('quality.audits.plan-opening') }}</strong></li>
                <li class="current"><strong>{{ t('quality.audits.plan-evidence') }}</strong></li>
                <li><strong>{{ t('quality.audits.plan-closing') }}</strong></li>
                <li><strong>{{ t('quality.audits.plan-report') }}</strong></li>
              </ol>
            </template>
          </pv-card>
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('quality.audits.package') }}</h2>
              <div v-for="item in evidence" :key="item.id" class="file">
                <span class="type">{{ item.fileName.split('.').pop()?.toUpperCase() }}</span>
                <div><strong>{{ item.fileName }}</strong><span class="small muted">{{ item.detail }}</span></div>
              </div>
            </template>
          </pv-card>
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.stat-value.warn { color: var(--warning); }
.stat-value.teal { color: var(--teal); }

.code {
  color: var(--teal);
}

.selected-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  background: var(--mint);
  color: var(--teal);
}

.label {
  margin-top: 6px;
  color: var(--teal);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.plan {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0;
  padding: 0 0 0 20px;
  border-left: 2px solid var(--border);
  list-style: none;
}

.plan li {
  position: relative;
}

.plan li::before {
  content: "";
  position: absolute;
  top: 4px;
  left: -26px;
  width: 10px;
  height: 14px;
  border-radius: 4px;
  background: #cbd5e1;
}

.plan li.done::before { background: #22c55e; }
.plan li.current::before { background: var(--warning-strong); }

.file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.file > div {
  display: flex;
  flex-direction: column;
}

.type {
  padding: 4px 6px;
  border-radius: 4px;
  background: var(--danger-bg);
  color: var(--danger);
  font-size: 11px;
  font-weight: 700;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
