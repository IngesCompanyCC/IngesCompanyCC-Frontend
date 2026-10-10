<script setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import useManufacturingStore from "../../../application/manufacturing.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";
import {Batch} from "../../../domain/model/batch.entity.js";

/**
 * Dialog that registers a new batch. A batch is rejected when its number already exists or when
 * the master formula of the product is not approved.
 */
const visible = defineModel('visible', { type: Boolean, default: false });
const emit = defineEmits(['created']);

const { t } = useI18n();
const store = useManufacturingStore();
const iamStore = useIamStore();

/** Production lines of the plant. */
const lines = ['Line 01', 'Line 02', 'Line 03'];

const code = ref('');
const productCode = ref('AC500');
const quantity = ref(120000);
const line = ref('Line 01');
/** Whether the form was submitted once, to show the validation messages. */
const submitted = ref(false);
/** Reasons why the last batch could not be registered. */
const rejection = ref([]);

const codeError = computed(() => submitted.value && !/^B-\d{5}$/.test(code.value.trim()));
const productOptions = computed(() => store.products.map(product => ({ label: `${product.code} · ${product.name}`, value: product.code })));

/** Starts with an empty form every time the dialog opens. */
watch(visible, open => {
  if (!open) return;
  code.value = '';
  submitted.value = false;
  rejection.value = [];
});

/** Registers the batch and closes the dialog with its code, or shows why it cannot be registered. */
const saveBatch = () => {
  submitted.value = true;
  if (codeError.value || !productCode.value || !(quantity.value > 0)) return;
  const batchCode = code.value.trim();
  rejection.value = store.validateBatch(batchCode, productCode.value);
  if (rejection.value.length) return;
  store.addBatch(new Batch({
    code: batchCode, productCode: productCode.value, orderCode: batchCode.replace('B-', 'PO-'),
    quantity: quantity.value, line: line.value, owner: iamStore.currentUser?.fullName ?? '', status: 'planned',
    progress: 0, incident: '', lastActivity: 'Created', lastActivityAt: new Date().toISOString()
  }));
  visible.value = false;
  emit('created', batchCode);
};
</script>

<template>
  <pv-dialog v-model:visible="visible" modal :header="rejection.length ? undefined : t('manufacturing.batches.create')"
             :style="{ width: '560px' }" :breakpoints="{ '640px': 'calc(100vw - 32px)' }">
    <div v-if="rejection.length" class="flex flex-column gap-3">
      <span class="dialog-icon" aria-hidden="true"><i class="pi pi-exclamation-circle"></i></span>
      <h2>{{ t('manufacturing.batches.rejected-title') }}</h2>
      <p class="muted">
        <span v-for="reason in rejection" :key="reason">
          {{ t(`manufacturing.batches.rejected.${reason}`, { code, product: productCode }) }}
        </span>
      </p>
      <div class="actions">
        <pv-button :label="t('shell.cancel')" severity="secondary" outlined @click="visible = false"/>
        <pv-button :label="t('manufacturing.batches.change-data')" @click="rejection = []"/>
      </div>
    </div>

    <form v-else class="flex flex-column gap-3 pt-1" novalidate @submit.prevent="saveBatch">
      <div class="field">
        <label for="batch-code">{{ t('manufacturing.batches.batch-code') }} *</label>
        <pv-input-text id="batch-code" v-model="code" placeholder="B-26045" :invalid="codeError" fluid/>
        <small v-if="codeError" class="error">{{ t('manufacturing.batches.code-error') }}</small>
      </div>
      <div class="field">
        <label for="batch-product">{{ t('manufacturing.products.product') }} *</label>
        <pv-select input-id="batch-product" v-model="productCode" :options="productOptions" option-label="label" option-value="value" fluid/>
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="batch-quantity">{{ t('manufacturing.batches.quantity') }} *</label>
          <pv-input-number input-id="batch-quantity" v-model="quantity" :min="1" fluid/>
        </div>
        <div class="field">
          <label for="batch-line">{{ t('manufacturing.batches.line') }} *</label>
          <pv-select input-id="batch-line" v-model="line" :options="lines" fluid/>
        </div>
      </div>
      <div class="actions">
        <pv-button type="button" :label="t('shell.cancel')" severity="secondary" outlined @click="visible = false"/>
        <pv-button type="submit" :label="t('manufacturing.batches.create')" :loading="store.loading"/>
      </div>
    </form>
  </pv-dialog>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.error {
  color: var(--danger-dark);
}

.dialog-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--danger-bg);
  color: var(--danger);
}

.dialog-icon i {
  font-size: 22px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
