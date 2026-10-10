<template>
  <div class="page">
    <div class="p-mb-4">
      <h2>{{ $t('nav.production-overview') }}</h2>
      <p>{{ $t('manufacturing.overview.subtitle', { name: firstName }) }}</p>
    </div>

    <div class="p-grid">
      <!-- Schedule -->
      <div class="p-col-12 p-md-8">
        <pv-card class="p-mb-4">
          <template #title>{{ $t('manufacturing.overview.schedule') }}</template>
          <template #content>
            <pv-data-table :value="schedule" responsiveLayout="scroll">
              <pv-column field="order.code" :header="$t('manufacturing.orders.order')"></pv-column>
              <pv-column field="product.name" :header="$t('manufacturing.products.product')"></pv-column>
              <pv-column field="order.line" :header="$t('manufacturing.batches.line')"></pv-column>
              <pv-column :header="$t('manufacturing.orders.progress')">
                <template #body="{ data }">
                  {{ data.batch?.progress || 0 }} %
                </template>
              </pv-column>
              <pv-column :header="$t('manufacturing.products.status')">
                <template #body="{ data }">
                  <span class="chip" :class="toneOf(data.batch?.status)">
                    {{ $t('manufacturing.batch-status.' + (data.batch?.status || 'planned')) }}
                  </span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <!-- Readiness -->
      <div class="p-col-12 p-md-4">
        <pv-card>
          <template #title>{{ $t('manufacturing.overview.readiness') }}</template>
          <template #content>
            <p class="p-text-secondary">{{ $t('manufacturing.overview.readiness-text', 'Check equipment and materials before start.') }}</p>
            <pv-data-table :value="readiness" responsiveLayout="scroll">
              <pv-column field="code" :header="$t('manufacturing.overview.resource')"></pv-column>
              <pv-column :header="$t('manufacturing.overview.availability')">
                <template #body="{ data }">
                  <span class="chip" :class="data.tone">{{ $t(data.label) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useManufacturingStore } from '../../../application/manufacturing.store.js';
import useIamStore from '../../../../iam/application/iam.store.js';

const store = useManufacturingStore();
const iamStore = useIamStore();

const firstName = computed(() => iamStore.currentUsername?.split(' ')[0] || 'User');

const schedule = computed(() => {
  return store.orders.map((order) => ({
    order,
    batch: store.batches.find((b) => b.code === order.batchCode),
    product: store.products.find((p) => p.code === order.productCode),
  }));
});

const readiness = computed(() => {
  return store.materialLots
    .filter((lot) => lot.status !== 'approved')
    .map((lot) => ({
      code: `${lot.code} - ${lot.category}`,
      tone: 'chip-warning',
      label: 'manufacturing.lot-status.' + lot.status,
    }));
});

const toneOf = (status) => {
  const tones = {
    'on-hold': 'chip-danger',
    'in-progress': 'chip-success',
    'planned': 'chip-neutral',
  };
  return tones[status] || 'chip-neutral';
};

onMounted(() => {
  store.loadAll();
});
</script>

<style scoped>
.page {
  padding: 1.5rem;
}
.chip {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}
.chip-success { background-color: #C8E6C9; color: #256029; }
.chip-warning { background-color: #FFD8B2; color: #805B36; }
.chip-danger { background-color: #FFCDD2; color: #C63737; }
.chip-neutral { background-color: #E0E0E0; color: #424242; }
</style>
