<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate} from "../../../../shared/presentation/format.js";
import useManufacturingStore from "../../../application/manufacturing.store.js";
import {MaterialLot} from "../../../domain/model/material-lot.entity.js";

/**
 * Raw-material receipt: the lot enters quarantine, moves to sampling and waits for the QC inspection.
 */
const { t, locale } = useI18n();
const store = useManufacturingStore();

/** Steps of the receipt flow. */
const steps = ['receipt', 'sampling', 'inspection', 'disposition'];

/** Code of the lot shown in the checklist. */
const selectedCode = ref(null);

/** Newest lot that is not approved yet. */
const newestLot = computed(() =>
    [...store.materialLots].sort((a, b) => b.code.localeCompare(a.code)).find(lot => lot.status !== 'approved'));

/** Lot shown in the checklist: the selected one or the newest. */
const selected = computed(() => store.materialLots.find(lot => lot.code === selectedCode.value) ?? newestLot.value);

/** Index of the current step of the selected lot. */
const stepIndex = computed(() => ({ quarantine: 0, sampling: 1, inspection: 2 })[selected.value?.status] ?? 3);

const emptyForm = () => ({
  material: 'Paracetamol (API)', supplier: 'Meridian Ingredients', supplierLot: '', code: '', quantity: '',
  expiryDate: '', storageLocation: 'Q-A12 · Quarantine zone', certificate: ''
});
/** Receipt form. */
const form = reactive(emptyForm());
/** Whether the form was submitted once, to show the validation messages. */
const submitted = ref(false);
/** Whether the internal lot code already exists. */
const duplicateLot = ref(false);
const certificateInput = ref();

const missing = (field) => submitted.value && !String(form[field]).trim();
const codeError = computed(() => submitted.value && !/^RM-\d{5}$/.test(form.code.trim()));
const invalid = computed(() => codeError.value
    || ['material', 'supplier', 'supplierLot', 'quantity', 'expiryDate', 'storageLocation', 'certificate'].some(missing));

/**
 * Stores the name of the attached certificate of analysis.
 * @param {Event} event - Change event of the file input.
 */
const attachCertificate = (event) => {
  form.certificate = event.target.files?.[0]?.name ?? '';
};

/**
 * Color of a lot disposition chip.
 * @param {string} status - Lot status.
 * @returns {string} Chip class.
 */
const dispositionTone = (status) => status === 'approved' ? 'chip-success' : status === 'rejected' ? 'chip-danger' : 'chip-warning';

/** Records the receipt: the lot enters quarantine and moves to sampling. */
const record = () => {
  submitted.value = true;
  if (invalid.value) return;
  const code = form.code.trim();
  duplicateLot.value = store.materialLots.some(lot => lot.code === code);
  if (duplicateLot.value) return;
  store.addMaterialLot(new MaterialLot({
    code, receiptCode: code.replace('RM-', 'RCV-'), material: form.material,
    category: form.material.includes('API') ? 'api' : 'excipient', supplier: form.supplier, supplierLot: form.supplierLot,
    quantity: form.quantity, expiryDate: form.expiryDate, storageLocation: form.storageLocation, certificate: form.certificate,
    status: 'sampling', packagingVerified: true, identityVerified: true, samplingStatus: 'pending', allocatedBatch: ''
  }));
  selectedCode.value = code;
  Object.assign(form, emptyForm());
  submitted.value = false;
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('manufacturing.receipt.title')]"
                 :title="t('manufacturing.receipt.title')"
                 :subtitle="selected ? `${selected.receiptCode} · ${selected.material} · ${t('manufacturing.receipt.subtitle')}` : ''"/>

    <div class="alert" role="status">
      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
      <strong>{{ t('manufacturing.receipt.alert') }}</strong>
    </div>

    <ol class="stepper">
      <li v-for="(step, index) in steps" :key="step" :class="{ done: index < stepIndex, current: index === stepIndex }"
          :aria-current="index === stepIndex ? 'step' : undefined">
        <span><i v-if="index < stepIndex" class="pi pi-check" aria-hidden="true"></i><template v-else>{{ index + 1 }}</template></span>
        {{ t(`manufacturing.receipt.step.${step}`) }}
      </li>
    </ol>

    <div class="columns">
      <div class="stack">
        <pv-card class="panel">
          <template #content>
            <form class="flex flex-column gap-3" novalidate @submit.prevent="record">
              <div>
                <h2>{{ t('manufacturing.receipt.details') }}</h2>
                <p class="small muted">* {{ t('manufacturing.receipt.required') }}</p>
              </div>
              <div class="form-grid">
                <div class="field">
                  <label for="receipt-material">{{ t('manufacturing.receipt.material') }} *</label>
                  <pv-input-text id="receipt-material" v-model="form.material" fluid :invalid="missing('material')"/>
                </div>
                <div class="field">
                  <label for="receipt-supplier">{{ t('manufacturing.receipt.supplier') }} *</label>
                  <pv-input-text id="receipt-supplier" v-model="form.supplier" fluid :invalid="missing('supplier')"/>
                </div>
                <div class="field">
                  <label for="receipt-supplier-lot">{{ t('manufacturing.receipt.supplier-lot') }} *</label>
                  <pv-input-text id="receipt-supplier-lot" v-model="form.supplierLot" placeholder="MI-AC-0926" fluid :invalid="missing('supplierLot')"/>
                </div>
                <div class="field">
                  <label for="receipt-code">{{ t('manufacturing.receipt.internal-lot') }} *</label>
                  <pv-input-text id="receipt-code" v-model="form.code" placeholder="RM-26105" fluid
                                 :invalid="codeError || duplicateLot" @input="duplicateLot = false"/>
                  <small v-if="codeError" class="error">{{ t('manufacturing.receipt.lot-error') }}</small>
                  <small v-if="duplicateLot" class="error" role="alert">{{ t('manufacturing.receipt.lot-duplicate') }}</small>
                </div>
                <div class="field">
                  <label for="receipt-quantity">{{ t('manufacturing.receipt.quantity') }} *</label>
                  <pv-input-text id="receipt-quantity" v-model="form.quantity" placeholder="500 kg · 20 sealed drums" fluid :invalid="missing('quantity')"/>
                </div>
                <div class="field">
                  <label for="receipt-expiry">{{ t('manufacturing.receipt.expiry') }} *</label>
                  <pv-input-text id="receipt-expiry" v-model="form.expiryDate" type="date" fluid :invalid="missing('expiryDate')"/>
                </div>
                <div class="field full">
                  <label for="receipt-location">{{ t('manufacturing.receipt.location') }} *</label>
                  <pv-input-text id="receipt-location" v-model="form.storageLocation" fluid :invalid="missing('storageLocation')"/>
                </div>
                <div class="field full">
                  <span class="upload-label" :class="{ invalid: missing('certificate') }">{{ t('manufacturing.receipt.certificate') }} *</span>
                  <input ref="certificateInput" type="file" accept=".pdf" hidden @change="attachCertificate">
                  <div class="row">
                    <pv-button type="button" icon="pi pi-upload" label="PDF" severity="secondary" outlined @click="certificateInput.click()"/>
                    <span v-if="form.certificate" class="attached">
                      <i class="pi pi-paperclip" aria-hidden="true"></i>{{ form.certificate }}
                      <span class="chip chip-success">{{ t('manufacturing.receipt.attached') }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div class="row">
                <pv-button type="submit" :label="t('manufacturing.receipt.record')" :loading="store.loading"/>
                <span class="small muted">{{ t('manufacturing.receipt.record-note') }}</span>
              </div>
            </form>
          </template>
        </pv-card>

        <pv-card>
          <template #title>{{ t('manufacturing.receipt.lots') }}</template>
          <template #content>
            <pv-data-table :value="store.materialLots" data-key="id" scrollable row-hover :aria-label="t('manufacturing.receipt.lots')"
                           :row-class="lot => ({ highlight: lot.code === selected?.code })"
                           @row-click="event => selectedCode = event.data.code">
              <pv-column :header="t('manufacturing.receipt.internal-lot')">
                <template #body="{ data }"><strong>{{ data.code }}</strong><span class="sub">{{ data.receiptCode }}</span></template>
              </pv-column>
              <pv-column :header="t('manufacturing.receipt.material')">
                <template #body="{ data }">{{ data.material }}<span class="sub">{{ data.supplier }}</span></template>
              </pv-column>
              <pv-column :header="t('manufacturing.receipt.expiry')">
                <template #body="{ data }">{{ formatDate(data.expiryDate, locale) }}</template>
              </pv-column>
              <pv-column :header="t('manufacturing.receipt.disposition')">
                <template #body="{ data }">
                  <span class="chip chip-dot" :class="dispositionTone(data.status)">{{ t(`manufacturing.lot-status.${data.status}`) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <aside v-if="selected" class="stack">
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('manufacturing.receipt.checklist') }} · {{ selected.code }}</h2>
            <div class="check">
              <strong>{{ t('manufacturing.receipt.packaging') }}</strong>
              <span class="chip chip-dot" :class="selected.packagingVerified ? 'chip-success' : 'chip-warning'">
                {{ t(selected.packagingVerified ? 'manufacturing.receipt.verified' : 'manufacturing.receipt.pending') }}
              </span>
            </div>
            <div class="check">
              <strong>{{ t('manufacturing.receipt.identity') }}</strong>
              <span class="chip chip-dot" :class="selected.identityVerified ? 'chip-success' : 'chip-warning'">
                {{ t(selected.identityVerified ? 'manufacturing.receipt.verified' : 'manufacturing.receipt.pending') }}
              </span>
            </div>
            <div class="check">
              <strong>{{ t('manufacturing.receipt.sampling') }}</strong>
              <span class="chip chip-dot" :class="selected.samplingStatus === 'done' ? 'chip-success' : 'chip-warning'">
                {{ t(`manufacturing.sampling-status.${selected.samplingStatus}`) }}
              </span>
            </div>
            <div class="check">
              <span class="flex flex-column">
                <strong>{{ t('manufacturing.receipt.quality-approval') }}</strong>
                <span class="small muted">{{ t('manufacturing.receipt.quality-approval-text') }}</span>
              </span>
              <span class="chip chip-dot chip-neutral">{{ t(`manufacturing.lot-status.${selected.status}`) }}</span>
            </div>
            <pv-button :label="t('manufacturing.receipt.request-inspection')" fluid
                       :disabled="selected.samplingStatus !== 'pending' || selected.status === 'approved' || selected.status === 'rejected'"
                       @click="store.requestInspection(selected)"/>
          </template>
        </pv-card>
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('manufacturing.receipt.disposition') }}</h2>
            <span class="chip chip-dot chip-warning align-self-start">{{ t(`manufacturing.lot-status.${selected.status}`) }}</span>
            <p class="small muted">{{ t('manufacturing.receipt.disposition-text') }}</p>
          </template>
        </pv-card>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.stepper {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stepper li {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  color: var(--slate);
}

.stepper li > span {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1.5px solid #cbd5e1;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.stepper li.done > span {
  border-color: var(--teal);
  background: var(--teal);
  color: #fff;
}

.stepper li.current {
  color: var(--teal);
  font-weight: 600;
}

.stepper li.current > span {
  border-color: var(--teal);
}

.upload-label {
  color: var(--slate);
  font-size: 13px;
  font-weight: 600;
}

.upload-label.invalid {
  color: var(--danger-dark);
}

.attached {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  background: var(--mint);
  font-weight: 500;
}

.check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

@media (max-width: 800px) {
  .stepper {
    flex-direction: column;
  }
}
</style>
