<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";

/**
 * Controlled documents: the version in review, its approval workflow with separation of duties and the version history.
 */
const { t, locale } = useI18n();
const store = useQualityStore();
const iamStore = useIamStore();

/** Code of the document shown. */
const code = ref('SOP-QA-014');
/** Codes of every controlled document. */
const codes = computed(() => [...new Set(store.documents.map(item => item.code))]);
/** Versions of the document, newest first. */
const versions = computed(() => store.versionsOf(code.value));
/** Newest version of the document. */
const latest = computed(() => versions.value[0]);
/** Effective (approved) version. */
const effective = computed(() => versions.value.find(item => item.status === 'approved'));
/** Whether the signed-in user wrote the version in review. */
const isAuthor = computed(() => latest.value?.author === iamStore.currentUser?.fullName);
/** Message after trying to sign: blocked or approved. */
const signResult = ref(null);

/**
 * Color of a version status chip.
 * @param {string} status - Version status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({ approved: 'chip-success', 'in-review': 'chip-warning', obsolete: 'chip-neutral' })[status] ?? 'chip-info';

/** Shows another document. */
const choose = (value) => {
  code.value = value;
  signResult.value = null;
};

/** Reviews and signs the version in review. */
const sign = () => {
  if (latest.value?.status !== 'in-review') return;
  signResult.value = store.approveDocument(latest.value) ? 'approved' : 'blocked';
};
</script>

<template>
  <section class="page">
    <template v-if="latest">
      <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('nav.quality-documents')]"
                   :title="t('nav.quality-documents')" :subtitle="`${latest.code} · ${latest.title} · ${t('quality.documents.controlled')}`">
        <pv-select :model-value="code" :options="codes" :aria-label="t('nav.quality-documents')" @update:model-value="choose"/>
      </page-header>

      <div v-if="latest.status === 'in-review'" class="alert info" role="status">
        <div>
          <strong>{{ t('quality.documents.awaiting', { version: latest.version }) }}</strong>
          <p>{{ t('quality.documents.awaiting-text', { effective: effective?.version ?? '—', version: latest.version, approver: latest.approver }) }}</p>
        </div>
      </div>
      <div v-if="signResult === 'blocked'" class="alert danger-alert" role="alert">
        <strong>{{ t('quality.documents.self-approval', { author: latest.author }) }}</strong>
      </div>
      <div v-if="signResult === 'approved'" class="alert info" role="status">
        <strong>{{ t('quality.documents.approved', { version: latest.version }) }}</strong>
      </div>

      <div class="columns">
        <pv-card class="panel">
          <template #content>
            <div class="row justify-content-between">
              <h2>{{ latest.code }} · {{ t('quality.documents.version') }} {{ latest.version }}</h2>
              <span class="chip" :class="toneOf(latest.status)">{{ t(`quality.document-status.${latest.status}`) }}</span>
            </div>
            <p class="section-title">1. {{ t('quality.documents.purpose') }}</p><p>{{ latest.purpose }}</p>
            <p class="section-title">2. {{ t('quality.documents.scope') }}</p><p>{{ latest.scope }}</p>
            <p class="section-title">3. {{ t('quality.documents.procedure') }}</p><p>{{ latest.procedure }}</p>
            <div class="revision">
              <p class="section-title">{{ t('quality.documents.revision-summary') }}</p>
              <p>{{ latest.revisionSummary }} {{ t('quality.documents.author') }}: {{ latest.author }}.</p>
            </div>
            <p v-if="latest.status !== 'approved'" class="danger">
              <i class="pi pi-exclamation-triangle" aria-hidden="true"></i> {{ t('quality.documents.not-operational') }}
            </p>
          </template>
        </pv-card>

        <pv-card class="panel workflow">
          <template #content>
            <h2>{{ t('quality.documents.workflow') }}</h2>
            <ol>
              <li class="done"><strong>{{ t('quality.documents.step-draft') }}</strong><span>{{ latest.author }} · {{ formatDate(latest.changedAt, locale) }}</span></li>
              <li class="done"><strong>{{ t('quality.documents.step-technical') }}</strong><span>{{ latest.technicalReviewer }}</span></li>
              <li :class="{ done: latest.status === 'approved', current: latest.status === 'in-review' }">
                <strong>{{ t('quality.documents.step-approval') }}</strong><span>{{ latest.approver }}</span>
              </li>
              <li :class="{ done: latest.status === 'approved' }">
                <strong>{{ t('quality.documents.step-publish') }}</strong><span>{{ t('quality.documents.after-signature') }}</span>
              </li>
            </ol>
            <p v-if="isAuthor && latest.status === 'in-review'" class="warning">
              <i class="pi pi-exclamation-triangle" aria-hidden="true"></i> {{ t('quality.documents.self-approval', { author: latest.author }) }}
            </p>
            <pv-button :label="`${t('quality.documents.review-sign')} →`" fluid :disabled="latest.status !== 'in-review'" @click="sign"/>
          </template>
        </pv-card>
      </div>

      <pv-card>
        <template #title>{{ t('quality.documents.history') }}</template>
        <template #content>
          <pv-data-table :value="versions" data-key="id" scrollable :aria-label="t('quality.documents.history')"
                         :row-class="version => ({ highlight: version.id === latest.id })">
            <pv-column :header="t('quality.documents.version')">
              <template #body="{ data }"><strong>{{ data.version }}</strong></template>
            </pv-column>
            <pv-column field="author" :header="t('quality.documents.changed-by')"/>
            <pv-column :header="t('quality.documents.date')">
              <template #body="{ data }">{{ formatDate(data.changedAt, locale) }}</template>
            </pv-column>
            <pv-column :header="t('shell.status')">
              <template #body="{ data }"><span class="chip" :class="toneOf(data.status)">{{ t(`quality.document-status.${data.status}`) }}</span></template>
            </pv-column>
          </pv-data-table>
        </template>
      </pv-card>
    </template>
  </section>
</template>

<style scoped>
.info {
  border-color: #99f6e4;
  background: var(--mint);
  color: var(--teal);
}

.danger-alert {
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger-dark);
}

.section-title {
  margin-top: 8px;
  color: var(--teal);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.revision {
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--mint);
}

.danger {
  color: var(--danger);
}

.warning {
  padding: 10px 12px;
  border-radius: 6px;
  background: #fef3c7;
  color: #92400e;
}

.workflow ol {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 8px 0;
  padding: 0;
  list-style: none;
}

.workflow li {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-left: 32px;
}

.workflow li::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
}

.workflow li.done::before {
  content: "✓";
  border-color: #22c55e;
  background: #22c55e;
  color: #fff;
  font-size: 11px;
  text-align: center;
}

.workflow li.current::before {
  border-color: var(--warning-strong);
  background: #fde68a;
}

.workflow li span {
  color: var(--muted);
  font-size: 13px;
}
</style>
