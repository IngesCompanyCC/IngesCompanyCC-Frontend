<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate, formatDateTime, formatNumber, formatTime} from "../../../../shared/presentation/format.js";
import useManufacturingStore from "../../../application/manufacturing.store.js";

/**
 * Production order: manufacturing execution against the effective master formula and the order context.
 */
const props = defineProps({
  /** Order code from the route. */
  code: { type: String, required: true }
});

const { t, locale } = useI18n();
const store = useManufacturingStore();

const order = computed(() => store.orderByCode(props.code));
const product = computed(() => store.productByCode(order.value?.productCode));
/** Master formula of the order. */
const formula = computed(() => store.formulas.find(item => item.id === order.value?.formulaId));
/** Components and parameters of the formula. */
const items = computed(() => formula.value ? store.itemsOfFormula(formula.value.id) : []);
/** Operations of the order, in sequence. */
const operations = computed(() => order.value ? store.operationsOfOrder(order.value.id) : []);
/** Operation on hold, if any. While it exists no other operation can be recorded. */
const heldOperation = computed(() => operations.value.find(operation => operation.status === 'on-hold'));

/**
 * Color of an operation status chip.
 * @param {string} status - Operation status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({ complete: 'chip-success', 'on-hold': 'chip-danger', 'in-progress': 'chip-teal' })[status] ?? 'chip-neutral';

/**
 * Color of the order status chip.
 * @param {string} status - Order status.
 * @returns {string} Chip class.
 */
const orderToneOf = (status) => status === 'on-hold' ? 'chip-danger' : status === 'planned' ? 'chip-neutral' : 'chip-success';

/** Records progress on the next operation of the order. */
const recordOperation = () => {
  if (order.value) store.recordOperation(order.value.id);
};
</script>

<template>
  <section class="page">
    <template v-if="order">
      <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.production-orders'), order.code]"
                   :title="`${t('manufacturing.orders.order-title')} ${order.code}`"
                   :subtitle="`${product?.name ?? ''} (${order.productCode}) · MFR-${order.productCode} ${formula?.version ?? ''} · ${order.batchCode}`">
        <pv-button :label="t('manufacturing.orders.record')" :disabled="!!heldOperation" @click="recordOperation"/>
      </page-header>

      <div v-if="heldOperation" class="alert" role="status">
        <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
        <strong>{{ t('manufacturing.orders.hold-alert', { operation: heldOperation.name, reference: heldOperation.reference }) }}</strong>
      </div>

      <div class="columns">
        <div class="stack">
          <pv-card>
            <template #title>{{ t('manufacturing.orders.execution') }} · {{ order.batchCode }}</template>
            <template #subtitle>{{ t('manufacturing.orders.execution-text') }}</template>
            <template #content>
              <pv-data-table :value="operations" data-key="id" scrollable :aria-label="t('manufacturing.orders.execution')"
                             :row-class="operation => ({ highlight: operation.status === 'on-hold' })">
                <pv-column :header="t('manufacturing.orders.operation')">
                  <template #body="{ data }"><strong>{{ data.name }}</strong></template>
                </pv-column>
                <pv-column field="equipment" :header="t('manufacturing.orders.equipment')"/>
                <pv-column :header="t('manufacturing.orders.progress')">
                  <template #body="{ data }">{{ data.progress }} %</template>
                </pv-column>
                <pv-column :header="t('manufacturing.products.status')">
                  <template #body="{ data }">
                    <span class="chip chip-dot" :class="toneOf(data.status)">
                      {{ t(`manufacturing.operation-status.${data.status}`) }}<template v-if="data.reference"> · {{ data.reference }}</template>
                    </span>
                  </template>
                </pv-column>
              </pv-data-table>
            </template>
          </pv-card>

          <pv-card v-if="formula">
            <template #title>{{ t('manufacturing.orders.formula') }} · MFR-{{ formula.productCode }} {{ formula.version }}</template>
            <template #subtitle>{{ t('manufacturing.orders.formula-text') }} {{ formatDate(formula.approvedAt, locale) }}</template>
            <template #content>
              <pv-data-table :value="items" data-key="id" scrollable :aria-label="t('manufacturing.orders.formula')">
                <pv-column :header="t('manufacturing.orders.ingredient')">
                  <template #body="{ data }"><span :class="{ strong: data.role === 'Active ingredient' }">{{ data.name }}</span></template>
                </pv-column>
                <pv-column field="target" :header="t('manufacturing.orders.target')"/>
                <pv-column field="tolerance" :header="t('manufacturing.orders.tolerance')"/>
                <pv-column field="control" :header="t('manufacturing.orders.control')"/>
              </pv-data-table>
            </template>
          </pv-card>
        </div>

        <pv-card class="context">
          <template #content>
            <h2>{{ t('manufacturing.orders.context') }}</h2>
            <p class="label">{{ t('manufacturing.orders.status') }}</p>
            <span class="chip chip-dot" :class="orderToneOf(order.status)">{{ t(`manufacturing.order-status.${order.status}`) }}</span>
            <p class="label">{{ t('manufacturing.products.product') }}</p>
            <p>{{ product?.name }} · {{ order.productCode }}</p>
            <p class="label">{{ t('manufacturing.orders.planned-quantity') }}</p>
            <p>{{ formatNumber(order.plannedQuantity, locale) }} {{ t('manufacturing.units') }}</p>
            <p class="label">{{ t('manufacturing.orders.formula') }}</p>
            <p>MFR-{{ order.productCode }} {{ formula?.version }} · {{ t('manufacturing.formula-status.locked') }}</p>
            <p class="label">{{ t('manufacturing.orders.approved') }}</p>
            <p>{{ formatDate(formula?.approvedAt, locale) }} · {{ formula?.approvedBy }}</p>
            <p class="label">{{ t('manufacturing.orders.planned-execution') }}</p>
            <p>{{ formatDateTime(order.plannedStart, locale) }}–{{ formatTime(order.plannedEnd, locale) }} · {{ order.line }}</p>
            <router-link :to="`/production/batches/${order.batchCode}`">{{ t('manufacturing.batches.view-genealogy') }} →</router-link>
          </template>
        </pv-card>
      </div>
    </template>
    <p v-else-if="!store.loading" class="muted">{{ t('manufacturing.orders.not-found') }}</p>
  </section>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border: 1px solid var(--warning-border);
  border-radius: var(--radius);
  background: var(--warning-bg);
  color: var(--warning);
}

.context :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.label {
  margin-top: 10px;
  color: var(--slate);
  font-size: 12px;
}

.strong {
  font-weight: 700;
}
</style>
