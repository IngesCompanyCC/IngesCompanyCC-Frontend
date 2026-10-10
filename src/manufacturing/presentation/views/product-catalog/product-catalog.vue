<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate, formatNumber} from "../../../../shared/presentation/format.js";
import useManufacturingStore from "../../../application/manufacturing.store.js";
import {Product} from "../../../domain/model/product.entity.js";

/**
 * Product catalog, the registration of new products and the master formula of the selected product.
 */
const { t, locale } = useI18n();
const store = useManufacturingStore();

/** Code of the product whose formula is shown. */
const selectedCode = ref('AC500');

/** Effective master formula of the selected product, or its latest version when none is approved. */
const formula = computed(() =>
    store.effectiveFormula(selectedCode.value) ?? store.formulas.find(item => item.productCode === selectedCode.value));

/** Components of the selected formula. */
const components = computed(() => formula.value
    ? store.itemsOfFormula(formula.value.id).filter(item => item.kind === 'component')
    : []);

/** Dosage forms offered in the form. */
const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injectable'];

const code = ref('');
const name = ref('');
const dosageForm = ref('Tablet');
/** Whether the form was submitted once, to show the validation messages. */
const submitted = ref(false);
/** Code entered when it already exists. */
const duplicateCode = ref(null);

const codeError = computed(() => submitted.value && !/^[A-Za-z]{2}\d{3}$/.test(code.value.trim()));
const nameError = computed(() => submitted.value && !name.value.trim());

/**
 * Color of the formula status chip.
 * @param {string} status - Formula status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => status === 'approved' ? 'chip-success' : status === 'pending' ? 'chip-warning' : 'chip-neutral';

/** Registers the product when the form is valid and the code is unique. */
const register = () => {
  submitted.value = true;
  if (codeError.value || nameError.value) return;
  const productCode = code.value.trim().toUpperCase();
  const added = store.addProduct(new Product({
    code: productCode, name: name.value.trim(), dosageForm: dosageForm.value, formulaVersion: '', formulaStatus: 'none'
  }));
  duplicateCode.value = added ? null : productCode;
  if (!added) return;
  code.value = '';
  name.value = '';
  dosageForm.value = 'Tablet';
  submitted.value = false;
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.products-formulas')]"
                 :title="t('manufacturing.products.title')" :subtitle="t('manufacturing.products.subtitle')"/>

    <div class="columns">
      <pv-card>
        <template #title>{{ t('manufacturing.products.catalog') }}</template>
        <template #subtitle>{{ t('manufacturing.products.catalog-text', { count: store.products.length }) }}</template>
        <template #content>
          <pv-data-table :value="store.products" data-key="id" scrollable row-hover :aria-label="t('manufacturing.products.catalog')"
                         :row-class="product => ({ highlight: product.code === selectedCode })"
                         @row-click="event => selectedCode = event.data.code">
            <pv-column :header="t('manufacturing.products.code')">
              <template #body="{ data }"><strong>{{ data.code }}</strong></template>
            </pv-column>
            <pv-column field="name" :header="t('manufacturing.products.product')"/>
            <pv-column field="dosageForm" :header="t('manufacturing.products.dosage-form')"/>
            <pv-column :header="t('manufacturing.products.formula')">
              <template #body="{ data }">{{ data.formulaVersion || '—' }}</template>
            </pv-column>
            <pv-column :header="t('manufacturing.products.status')">
              <template #body="{ data }">
                <span class="chip chip-dot" :class="toneOf(data.formulaStatus)">{{ t(`manufacturing.formula-status.${data.formulaStatus}`) }}</span>
              </template>
            </pv-column>
          </pv-data-table>
        </template>
      </pv-card>

      <pv-card class="panel">
        <template #content>
          <form class="flex flex-column gap-3" novalidate @submit.prevent="register">
            <div>
              <h2>{{ t('manufacturing.products.new') }}</h2>
              <p class="small muted">{{ t('manufacturing.products.new-text') }}</p>
            </div>
            <div class="field">
              <label for="product-code">{{ t('manufacturing.products.code') }} *</label>
              <pv-input-text id="product-code" v-model="code" maxlength="5" placeholder="AC500" fluid
                             :invalid="codeError || !!duplicateCode" @input="duplicateCode = null"/>
              <small v-if="codeError" class="error">{{ t('manufacturing.products.code-error') }}</small>
              <small v-if="duplicateCode" class="error" role="alert">{{ t('manufacturing.products.duplicate', { code: duplicateCode }) }}</small>
            </div>
            <div class="field">
              <label for="product-name">{{ t('manufacturing.products.name') }} *</label>
              <pv-input-text id="product-name" v-model="name" placeholder="Paracetamol 500 mg" fluid :invalid="nameError"/>
            </div>
            <div class="field">
              <label for="product-form">{{ t('manufacturing.products.dosage-form') }} *</label>
              <pv-select input-id="product-form" v-model="dosageForm" :options="dosageForms" fluid/>
            </div>
            <pv-button type="submit" :label="t('manufacturing.products.register')" fluid/>
          </form>
        </template>
      </pv-card>
    </div>

    <pv-card v-if="formula">
      <template #title>
        <div class="row">
          <span>{{ t('manufacturing.products.formula-title', { code: formula.productCode, version: formula.version }) }}</span>
          <span class="chip chip-dot" :class="formula.status === 'approved' ? 'chip-success' : 'chip-warning'">
            {{ t(`manufacturing.formula-status.${formula.status === 'approved' ? 'locked' : 'draft'}`) }}
          </span>
        </div>
      </template>
      <template #subtitle>
        {{ t('manufacturing.products.formula-text', { by: formula.approvedBy, size: formatNumber(formula.batchSize, locale) }) }} · {{ formatDate(formula.approvedAt, locale) }}
      </template>
      <template #content>
        <pv-data-table :value="components" data-key="id" scrollable :aria-label="t('manufacturing.products.formula')">
          <pv-column header="#">
            <template #body="{ index }">{{ index + 1 }}</template>
          </pv-column>
          <pv-column field="name" :header="t('manufacturing.products.component')"/>
          <pv-column field="role" :header="t('manufacturing.products.function')"/>
          <pv-column field="target" :header="t('manufacturing.products.quantity')"/>
          <pv-column field="control" :header="t('manufacturing.products.supplier')"/>
          <template #empty><span class="muted">{{ t('manufacturing.products.no-components') }}</span></template>
        </pv-data-table>
        <p class="small muted protected"><i class="pi pi-lock" aria-hidden="true"></i> {{ t('manufacturing.products.protected') }}</p>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.protected {
  padding-top: 16px;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
