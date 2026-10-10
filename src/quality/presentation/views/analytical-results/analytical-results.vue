<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import useQualityStore from "../../../application/quality.store.js";
import useManufacturingStore from "../../../../manufacturing/application/manufacturing.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";
import {Deviation} from "../../../domain/model/deviation.entity.js";

/**
 * Analytical results of a batch, the assay calculated with the protocol formula and the out-of-specification handling.
 */
const { t } = useI18n();
const store = useQualityStore();
const manufacturingStore = useManufacturingStore();
const iamStore = useIamStore();

/** Batches with results. */
const batches = computed(() => [...new Set(store.results.map(result => result.batchCode))]);
/** Batch shown. */
const batchCode = ref('B-26041');
const results = computed(() => store.resultsOf(batchCode.value));
const product = computed(() => manufacturingStore.productByCode(manufacturingStore.batchByCode(batchCode.value)?.productCode));
/** First out-of-specification result. */
const oos = computed(() => results.value.find(result => result.status === 'oos'));
/** Deviation already registered for the batch. */
const linkedDeviation = computed(() => store.deviations.find(item => item.batchCode === batchCode.value && item.title.includes('OOS')));

/** Inputs of the assay formula of PRT-QC-012: Assay % = (As / Ast) × (Cst / Cs) × P. */
const inputs = [['sampleArea', 'As'], ['standardArea', 'Ast'], ['standardConcentration', 'Cst'], ['sampleConcentration', 'Cs'], ['purity', 'P']];
const form = reactive({ sampleArea: 1482350, standardArea: 1500120, standardConcentration: 0.1, sampleConcentration: 0.1, purity: 99.9 });
const minimums = { sampleArea: 1, standardArea: 1, standardConcentration: 0.001, sampleConcentration: 0.001, purity: 1 };
const submitted = ref(false);
/** Inputs that are empty or out of range. */
const invalid = computed(() => Object.fromEntries(inputs.map(([key]) => [key,
  submitted.value && (!(form[key] >= minimums[key]) || (key === 'purity' && form[key] > 100))])));
/** Calculated assay, or null before calculating. */
const assay = ref(null);
const withinSpec = computed(() => assay.value !== null && assay.value >= 95 && assay.value <= 105);

/** Shows another batch. */
const choose = (value) => {
  batchCode.value = value;
  assay.value = null;
};

/** Calculates the assay with the protocol formula. */
const calculate = () => {
  submitted.value = true;
  if (Object.values(invalid.value).some(Boolean)) return;
  assay.value = Math.round((form.sampleArea / form.standardArea) * (form.standardConcentration / form.sampleConcentration) * form.purity * 10) / 10;
};

/** Saves the calculated assay in the result of the batch. */
const save = () => {
  const result = results.value.find(item => item.test.startsWith('Assay'));
  if (assay.value === null || !result) return;
  store.saveResult(result, {
    result: `${assay.value} %`, analyst: iamStore.currentUser?.fullName ?? result.analyst, status: withinSpec.value ? 'within' : 'oos'
  });
};

/** Registers the deviation required by an out-of-specification result. */
const registerDeviation = () => {
  const batch = manufacturingStore.batchByCode(batchCode.value);
  const user = iamStore.currentUser;
  if (!oos.value || !batch || !user) return;
  const now = new Date();
  store.registerDeviation(new Deviation({
    code: store.nextCode('DEV', store.deviations.map(item => item.code)), title: `OOS · ${oos.value.test}`,
    batchCode: batch.code, orderCode: batch.orderCode,
    summary: `${oos.value.test}: ${oos.value.result} outside ${oos.value.specification} (${oos.value.protocol}).`, classification: 'major',
    containment: 'Batch kept in quarantine; release blocked.', severity: 3, likelihood: 2, detectability: 2, status: 'open',
    reportedBy: user.fullName, reportedAt: now.toISOString(), owner: user.fullName, dueAt: new Date(now.getTime() + 2 * 86400000).toISOString()
  }));
};

/**
 * Color of a result status chip.
 * @param {string} status - Result status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => status === 'within' ? 'chip-success' : status === 'oos' ? 'chip-danger' : 'chip-neutral';
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('nav.analytical-results')]"
                 :title="t('nav.analytical-results')" :subtitle="t('quality.results.subtitle')">
      <pv-select :model-value="batchCode" :options="batches" :aria-label="t('quality.results.batch')" @update:model-value="choose"/>
    </page-header>

    <pv-card>
      <template #title>{{ t('quality.results.results') }} · {{ batchCode }} · {{ product?.name }}</template>
      <template #subtitle>{{ results[0]?.sampleCode }} · {{ results[0]?.reportCode }}</template>
      <template #content>
        <pv-data-table :value="results" data-key="id" scrollable :aria-label="t('quality.results.results')"
                       :row-class="result => ({ highlight: result.test.startsWith('Assay') })">
          <pv-column :header="t('quality.results.test')">
            <template #body="{ data }"><strong>{{ data.test }}</strong></template>
          </pv-column>
          <pv-column field="protocol" :header="t('quality.results.protocol')"/>
          <pv-column :header="t('quality.results.calculated')">
            <template #body="{ data }">{{ data.result || '—' }}</template>
          </pv-column>
          <pv-column field="specification" :header="t('quality.results.specification')"/>
          <pv-column :header="t('quality.results.analyst')">
            <template #body="{ data }">{{ data.analyst || '—' }}</template>
          </pv-column>
          <pv-column :header="t('shell.status')">
            <template #body="{ data }"><span class="chip chip-dot" :class="toneOf(data.status)">{{ t(`quality.result-status.${data.status}`) }}</span></template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <div class="grid-2">
      <pv-card class="panel">
        <template #content>
          <form class="flex flex-column gap-3" novalidate @submit.prevent="calculate">
            <div>
              <h2>{{ t('quality.results.calculation') }} · Assay (HPLC)</h2>
              <p class="small muted">{{ t('quality.results.formula-from') }}</p>
            </div>
            <div v-for="[key, symbol] in inputs" :key="key" class="input-row">
              <label :for="`input-${key}`">{{ t(`quality.results.inputs.${key}`) }} ({{ symbol }})</label>
              <pv-input-number :input-id="`input-${key}`" v-model="form[key]" :min-fraction-digits="0" :max-fraction-digits="4"
                               :invalid="invalid[key]" class="number"/>
            </div>
            <p class="formula">
              Assay % = (As / Ast) × (Cst / Cs) × P
              <template v-if="assay !== null"><br>= {{ assay }} %</template>
            </p>
            <span v-if="assay !== null" class="chip chip-dot align-self-start" :class="withinSpec ? 'chip-success' : 'chip-danger'" role="status">
              {{ assay }} % · {{ t('quality.results.spec-range') }}
            </span>
            <div class="row">
              <pv-button type="submit" :label="t('quality.results.calculate')"/>
              <pv-button type="button" :label="t('quality.results.save')" severity="secondary" outlined :disabled="assay === null" @click="save"/>
            </div>
          </form>
        </template>
      </pv-card>

      <pv-card class="panel">
        <template #content>
          <template v-if="oos">
            <h2>{{ t('quality.results.oos-title') }} · {{ oos.test }}</h2>
            <p class="small muted">{{ t('quality.results.oos-subtitle') }}</p>
            <div class="alert alert-danger" role="alert"><p>{{ t('quality.results.oos-text', { result: oos.result, spec: oos.specification }) }}</p></div>
            <dl>
              <dt>{{ t('quality.results.batch') }}</dt><dd>{{ batchCode }} · {{ t('quality.results.quarantine') }}</dd>
              <dt>{{ t('quality.results.linked-deviation') }}</dt>
              <dd>
                <router-link v-if="linkedDeviation" :to="{ path: '/qa/deviations', query: { code: linkedDeviation.code } }">{{ linkedDeviation.code }}</router-link>
                <template v-else>{{ t('quality.results.not-registered') }}</template>
              </dd>
              <dt>{{ t('quality.results.release') }}</dt><dd>{{ t('quality.results.release-blocked') }}</dd>
            </dl>
            <pv-button :label="t('quality.results.register-deviation')" fluid :disabled="!!linkedDeviation" @click="registerDeviation"/>
          </template>
          <template v-else>
            <h2>{{ t('quality.results.no-oos') }}</h2>
            <p class="muted">{{ t('quality.results.no-oos-text') }}</p>
          </template>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.number :deep(input) {
  width: 160px;
}

.formula {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--gray-bg);
  font-size: 13px;
}

dl {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 10px;
  margin: 0;
}

dt {
  color: var(--slate);
}

dd {
  margin: 0;
  font-weight: 600;
}

@media (max-width: 600px) {
  .input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .number :deep(input) {
    width: 100%;
  }

  dl {
    grid-template-columns: 1fr;
  }
}
</style>
