<script setup>
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDateTime, formatNumber} from "../../../../shared/presentation/format.js";
import useManufacturingStore from "../../../application/manufacturing.store.js";

/**
 * Production orders issued against approved master formulas.
 */
const { t, locale } = useI18n();
const store = useManufacturingStore();

/**
 * Color of an order status chip.
 * @param {string} status - Order status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => status === 'on-hold' ? 'chip-danger' : status === 'planned' ? 'chip-neutral' : 'chip-success';
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.production-orders')]"
                 :title="t('nav.production-orders')" :subtitle="t('manufacturing.orders.subtitle')">
      <pv-button as-child v-slot="slotProps">
        <router-link to="/production/batches" :class="slotProps['class']">
          <i class="pi pi-plus" aria-hidden="true"></i>{{ t('manufacturing.batches.create') }}
        </router-link>
      </pv-button>
    </page-header>

    <pv-card>
      <template #content>
        <pv-data-table :value="store.orders" data-key="id" scrollable :loading="store.loading" :aria-label="t('nav.production-orders')">
          <pv-column :header="t('manufacturing.orders.order')">
            <template #body="{ data }">
              <router-link :to="`/production/orders/${data.code}`">{{ data.code }}</router-link>
              <span class="sub">{{ data.batchCode }}</span>
            </template>
          </pv-column>
          <pv-column :header="t('manufacturing.products.product')">
            <template #body="{ data }">{{ store.productByCode(data.productCode)?.name }}</template>
          </pv-column>
          <pv-column :header="t('manufacturing.batches.quantity')">
            <template #body="{ data }">{{ formatNumber(data.plannedQuantity, locale) }}</template>
          </pv-column>
          <pv-column field="line" :header="t('manufacturing.batches.line')"/>
          <pv-column :header="t('manufacturing.orders.planned')">
            <template #body="{ data }">{{ formatDateTime(data.plannedStart, locale) }}</template>
          </pv-column>
          <pv-column :header="t('manufacturing.products.status')">
            <template #body="{ data }">
              <span class="chip chip-dot" :class="toneOf(data.status)">{{ t(`manufacturing.order-status.${data.status}`) }}</span>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.pi-plus {
  margin-right: 8px;
}
</style>
