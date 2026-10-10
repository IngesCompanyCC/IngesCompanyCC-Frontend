<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatNumber} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";
import useManufacturingStore from "../../../../manufacturing/application/manufacturing.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";

/**
 * Batch release: the six readiness checks of a batch and the QA electronic signature with re-authentication.
 */
const { t, locale } = useI18n();
const store = useQualityStore();
const manufacturingStore = useManufacturingStore();
const iamStore = useIamStore();

/** Batches waiting for a QA decision, blocked or released. */
const queue = computed(() => manufacturingStore.batches
    .filter(batch => batch.status === 'release-requested' || batch.status === 'on-hold' || batch.status === 'released'));
const queueOptions = computed(() => queue.value.map(item => ({ label: `${item.code} · ${t(`manufacturing.batch-status.${item.status}`)}`, value: item.code })));

/** Code of the batch shown. */
const code = ref('B-26038');
const batch = computed(() => manufacturingStore.batchByCode(code.value));
/** Readiness checks of the batch. */
const checks = computed(() => store.releaseChecks(code.value));
const passed = computed(() => checks.value.filter(check => check.passed).length);
const ready = computed(() => passed.value === checks.value.length);
/** Whether the signed-in user has the QA release privilege. */
const canSign = computed(() => iamStore.currentUser?.privilege === 'qa-release');

/** Result of the last signature attempt: released, invalid-password or not-ready. */
const result = ref(null);
/** Password re-entered to sign. */
const password = ref('');
const passwordTouched = ref(false);
const signing = ref(false);

/** Shows another batch. */
const select = (value) => {
  code.value = value;
  result.value = null;
  password.value = '';
  passwordTouched.value = false;
};

/** Signs the release with the re-entered password. */
const sign = async () => {
  passwordTouched.value = true;
  if (!password.value) return;
  signing.value = true;
  result.value = await store.signRelease(code.value, password.value);
  signing.value = false;
  if (result.value === 'released') password.value = '';
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.qa.short'), t('nav.batch-release')]"
                 :title="t('nav.batch-release')"
                 :subtitle="batch ? `${batch.code} · ${manufacturingStore.productByCode(batch.productCode)?.name ?? ''} · ${formatNumber(batch.quantity, locale)} ${t('manufacturing.units')}` : ''">
      <pv-select :model-value="code" :options="queueOptions" option-label="label" option-value="value"
                 :aria-label="t('nav.batch-release')" @update:model-value="select"/>
    </page-header>

    <div v-if="batch?.status === 'released'" class="alert alert-info" role="status">
      <i class="pi pi-check-circle" aria-hidden="true"></i><strong>{{ t('quality.release.released', { code }) }}</strong>
    </div>
    <div v-else-if="ready" class="alert alert-info" role="status">
      <i class="pi pi-check-circle" aria-hidden="true"></i>
      <div><strong>{{ t('quality.release.ready') }}</strong><p>{{ t('quality.release.ready-text') }}</p></div>
    </div>
    <div v-else class="alert alert-danger" role="alert">
      <div><strong>{{ t('quality.release.blocked', { code }) }}</strong><p>{{ t('quality.release.blocked-text') }}</p></div>
    </div>

    <div class="columns">
      <pv-card>
        <template #title>
          <div class="row justify-content-between">
            <span>{{ t('quality.release.readiness') }}</span>
            <span class="chip" :class="ready ? 'chip-teal' : 'chip-danger'">{{ t('quality.release.passed', { passed, total: checks.length }) }}</span>
          </div>
        </template>
        <template #content>
          <pv-data-table :value="checks" data-key="key" scrollable :aria-label="t('quality.release.readiness')"
                         :row-class="check => ({ failed: !check.passed })">
            <pv-column header="#">
              <template #body="{ index }">{{ index + 1 }}</template>
            </pv-column>
            <pv-column :header="t('quality.release.check')">
              <template #body="{ data }">
                <strong>{{ t(`quality.release.checks.${data.key}`) }}</strong>
                <span class="sub">{{ t(`quality.release.checks.${data.key}-text`) }}</span>
              </template>
            </pv-column>
            <pv-column :header="t('quality.capa.evidence')">
              <template #body="{ data }"><span class="code">{{ data.evidence }}</span></template>
            </pv-column>
            <pv-column :header="t('shell.status')">
              <template #body="{ data }">
                <span class="chip" :class="data.passed ? 'chip-success' : 'chip-danger'">
                  {{ t(data.passed ? 'quality.release.check-passed' : 'quality.release.check-failed') }}
                </span>
              </template>
            </pv-column>
          </pv-data-table>
        </template>
      </pv-card>

      <aside class="stack">
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('quality.release.sign') }}</h2>
            <div class="approver">
              <p class="small strong teal">{{ t('quality.release.authenticated') }}</p>
              <p><strong>{{ iamStore.currentUser?.fullName }}</strong></p>
              <p class="small teal">{{ t(`privileges.${iamStore.currentUser?.privilege}`) }} · {{ iamStore.currentUser?.plant }}</p>
            </div>
            <div class="field">
              <label for="signature-meaning">{{ t('quality.release.meaning') }}</label>
              <pv-input-text id="signature-meaning" :model-value="t('quality.release.meaning-value')" disabled fluid/>
              <small class="muted">{{ t('quality.release.meaning-fixed') }}</small>
            </div>
            <div class="field">
              <label for="signature-password">{{ t('quality.release.password') }} *</label>
              <pv-password input-id="signature-password" v-model="password" :feedback="false" toggle-mask fluid autocomplete="current-password"
                           :invalid="(passwordTouched && !password) || result === 'invalid-password'"/>
              <small v-if="result === 'invalid-password'" class="error" role="alert">{{ t('quality.release.wrong-password') }}</small>
            </div>
            <p class="small muted">{{ t('quality.release.record') }}: <strong>{{ code }} · {{ t('quality.release.release-record') }}</strong></p>
            <small v-if="!canSign" class="error">{{ t('quality.release.no-privilege') }}</small>
            <pv-button :label="t('quality.release.sign-button')" fluid :loading="signing"
                       :disabled="!ready || !canSign || batch?.status === 'released'" @click="sign"/>
            <p class="small muted">{{ t('quality.release.sign-note') }}</p>
          </template>
        </pv-card>
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('quality.release.context') }}</h2>
            <p class="label">{{ t('quality.release.approver-privilege') }}</p>
            <p class="small muted">{{ t('quality.release.approver-text') }}</p>
            <p class="label">{{ t('quality.release.attribution') }}</p>
            <p class="small muted">{{ t('quality.release.attribution-text') }}</p>
          </template>
        </pv-card>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.approver {
  padding: 14px 16px;
  border: 1px solid var(--teal);
  border-radius: 8px;
  background: var(--mint);
}

.teal {
  color: var(--teal);
}

.strong {
  font-weight: 700;
}

.code {
  color: var(--teal);
  font-weight: 600;
}

.label {
  color: var(--slate);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

:deep(tr.failed > td) {
  background: var(--danger-bg);
}
</style>
