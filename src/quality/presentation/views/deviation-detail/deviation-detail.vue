<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDateTime} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";

/**
 * Deviation investigation: summary, classification, containment, risk priority number, evidence and disposition.
 */
const { t, locale } = useI18n();
const route = useRoute();
const store = useQualityStore();

/** Code of the deviation shown; another page can open one with ?code=. */
const code = ref(route.query.code ?? 'DEV-26017');
const deviationOptions = computed(() => store.deviations.map(item => item.code));
const deviation = computed(() => store.deviations.find(item => item.code === code.value));
const evidence = computed(() => store.evidenceOf(code.value));
/** Message after submitting: blocked or submitted. */
const submitResult = ref(null);
/** Scores offered for severity, likelihood and detectability. */
const scores = [1, 2, 3, 4, 5];
const factors = ['severity', 'likelihood', 'detectability'];
const classificationOptions = computed(() => ['minor', 'major', 'critical'].map(value => ({ label: t(`quality.classification.${value}`), value })));

/** Investigation form. */
const form = reactive({ summary: '', classification: 'major', containment: '', severity: 1, likelihood: 1, detectability: 1 });
const submitted = ref(false);
const errors = computed(() => ({
  summary: submitted.value && !form.summary.trim(),
  containment: submitted.value && !form.containment.trim()
}));
/** Risk priority number: severity × likelihood × detectability. */
const rpn = computed(() => form.severity * form.likelihood * form.detectability);

/** Fills the form with the deviation. */
watch(deviation, current => {
  if (!current) return;
  Object.assign(form, {
    summary: current.summary, classification: current.classification, containment: current.containment,
    severity: current.severity, likelihood: current.likelihood, detectability: current.detectability
  });
  submitted.value = false;
}, { immediate: true });

/** Shows another deviation. */
const choose = (value) => {
  code.value = value;
  submitResult.value = null;
};

/** Submits the risk assessment when the form is valid and the evidence is reviewed. */
const submit = () => {
  if (!deviation.value) return;
  submitted.value = true;
  if (errors.value.summary || errors.value.containment) return;
  submitResult.value = store.submitAssessment(deviation.value, {
    summary: form.summary.trim(), classification: form.classification, containment: form.containment.trim(),
    severity: form.severity, likelihood: form.likelihood, detectability: form.detectability
  }) ? 'submitted' : 'blocked';
};

const evidenceInput = ref();
/**
 * Attaches a file as evidence.
 * @param {Event} event - Change event of the file input.
 */
const attach = (event) => {
  const file = event.target.files?.[0];
  if (file) store.attachEvidence(code.value, file.name);
  event.target.value = '';
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('quality.deviations.title')]"
                 :title="t('quality.deviations.title')"
                 :subtitle="deviation ? `${deviation.code} · ${deviation.title} · ${t('quality.deviations.linked-to')} ${deviation.batchCode}` : ''">
      <pv-select :model-value="code" :options="deviationOptions" :aria-label="t('quality.deviations.title')" @update:model-value="choose"/>
    </page-header>

    <template v-if="deviation">
      <div class="row">
        <span class="chip chip-warning">{{ t(`quality.classification.${deviation.classification}`) }} · RPN {{ rpn }}</span>
        <span class="chip chip-neutral">{{ t(`quality.deviation-status.${deviation.status}`) }}</span>
        <span class="small muted ml-auto">{{ t('quality.deviations.routes') }}</span>
      </div>
      <div v-if="submitResult === 'blocked'" class="alert danger-alert" role="alert"><strong>{{ t('quality.deviations.evidence-required') }}</strong></div>
      <div v-if="submitResult === 'submitted'" class="alert info" role="status"><strong>{{ t('quality.deviations.submitted') }}</strong></div>

      <div class="columns">
        <pv-card class="panel">
          <template #content>
            <form class="flex flex-column gap-3" novalidate @submit.prevent="submit">
              <div>
                <h2>{{ t('quality.deviations.investigation') }}</h2>
                <p class="small muted">* {{ t('quality.deviations.required') }}</p>
              </div>
              <div class="field">
                <label for="deviation-summary">{{ t('quality.deviations.summary') }} *</label>
                <pv-textarea id="deviation-summary" v-model="form.summary" rows="2" fluid :invalid="errors.summary"/>
              </div>
              <div class="row">
                <div class="field flex-1">
                  <label for="deviation-affected">{{ t('quality.deviations.affected') }}</label>
                  <pv-input-text id="deviation-affected" :model-value="`${deviation.batchCode} / ${deviation.orderCode}`" disabled fluid/>
                </div>
                <span class="chip chip-danger align-self-end">{{ t('quality.deviations.batch-held') }}</span>
              </div>
              <div class="field">
                <label for="deviation-classification">{{ t('quality.deviations.classification') }}</label>
                <pv-select input-id="deviation-classification" v-model="form.classification" :options="classificationOptions"
                           option-label="label" option-value="value" fluid/>
                <small v-if="form.classification !== 'minor'" class="error">{{ t('quality.deviations.impact-required') }}</small>
              </div>
              <div class="field">
                <label for="deviation-containment">{{ t('quality.deviations.containment') }} *</label>
                <pv-input-text id="deviation-containment" v-model="form.containment" fluid :invalid="errors.containment"/>
              </div>
              <p class="field-label">{{ t('quality.deviations.risk') }} *</p>
              <div class="rpn">
                <template v-for="(factor, index) in factors" :key="factor">
                  <div class="field flex-1">
                    <label :for="`deviation-${factor}`">{{ t(`quality.deviations.${factor}`) }}</label>
                    <pv-select :input-id="`deviation-${factor}`" v-model="form[factor]" :options="scores" fluid/>
                  </div>
                  <span v-if="index < factors.length - 1" class="times" aria-hidden="true">×</span>
                </template>
              </div>
              <p class="calculated">
                {{ t('quality.deviations.calculated') }}: <strong>{{ rpn }}</strong>
                ({{ form.severity }} × {{ form.likelihood }} × {{ form.detectability }})
              </p>
              <p class="warning"><i class="pi pi-exclamation-triangle" aria-hidden="true"></i> {{ t('quality.deviations.all-evidence') }}</p>
              <template v-if="deviation.capaCode">
                <p class="field-label">{{ t('quality.deviations.linked-capa') }}</p>
                <router-link to="/qa/capa">{{ deviation.capaCode }}</router-link>
              </template>
              <pv-button type="submit" class="align-self-start" :label="t('quality.deviations.submit')"/>
            </form>
          </template>
        </pv-card>

        <aside class="stack">
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('quality.deviations.evidence') }}</h2>
              <p class="small muted">{{ t('quality.deviations.files', { count: evidence.length }) }}</p>
              <div v-for="item in evidence" :key="item.id" class="evidence" :class="{ pending: item.status === 'pending-review' }">
                <div><strong>{{ item.fileName }}</strong><span class="small muted">{{ item.detail }}</span></div>
                <pv-button v-if="item.status === 'pending-review'" :label="t('quality.deviations.mark-reviewed')" severity="secondary" outlined size="small"
                           @click="store.reviewEvidence(item)"/>
                <span v-else class="chip chip-success">{{ t(`quality.evidence-status.${item.status}`) }}</span>
              </div>
              <input ref="evidenceInput" type="file" accept=".csv,.jpg,.pdf,.xlsx" hidden @change="attach">
              <pv-button icon="pi pi-paperclip" :label="t('quality.deviations.attach')" text class="align-self-start" @click="evidenceInput.click()"/>
              <p class="small muted">{{ t('quality.deviations.supported') }}</p>
            </template>
          </pv-card>
          <pv-card class="panel disposition">
            <template #content>
              <h2>{{ t('quality.deviations.disposition') }} — {{ t(`quality.deviation-status.${deviation.status}`) }}</h2>
              <p>{{ t('quality.deviations.disposition-text') }}</p>
              <span class="chip chip-danger align-self-start"><i class="pi pi-lock" aria-hidden="true"></i>{{ t('quality.deviations.release-blocked') }}</span>
            </template>
          </pv-card>
          <pv-card class="panel">
            <template #content>
              <h2>{{ t('quality.deviations.timeline') }}</h2>
              <p><strong>{{ t('quality.deviations.reported') }}</strong>
                <span class="small muted block">{{ deviation.reportedBy }} · {{ formatDateTime(deviation.reportedAt, locale) }} UTC</span></p>
              <p><strong>{{ t('quality.deviations.assessment') }}</strong>
                <span class="small muted block">{{ deviation.owner }} · {{ formatDateTime(deviation.dueAt, locale) }} UTC</span></p>
              <p v-if="deviation.capaCode"><strong>{{ t('quality.deviations.capa-linked') }} · {{ deviation.capaCode }}</strong></p>
              <p class="danger"><strong>{{ t('quality.deviations.release-decision') }}</strong> · {{ t('quality.deviations.blocked-until') }}</p>
            </template>
          </pv-card>
        </aside>
      </div>
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

.field-label {
  font-weight: 600;
}

.rpn {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.times {
  padding-bottom: 12px;
}

.calculated {
  padding: 12px 14px;
  border: 1px solid var(--teal);
  border-radius: 6px;
  background: var(--mint);
  color: var(--teal);
}

.warning {
  padding: 12px 14px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
  color: #c2410c;
}

.evidence {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-left: 4px solid #22c55e;
  border-radius: 6px;
  background: var(--gray-bg);
}

.evidence.pending {
  border-color: var(--warning-strong);
  background: #fff7ed;
}

.evidence > div {
  display: flex;
  flex-direction: column;
}

.disposition {
  border: 1px solid var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger-dark);
}

.danger {
  color: var(--danger);
}

.block {
  display: block;
}

@media (max-width: 600px) {
  .rpn {
    flex-direction: column;
    align-items: stretch;
  }

  .times {
    display: none;
  }
}
</style>
