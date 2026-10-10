import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ManufacturingApi } from '../infrastructure/manufacturing-api.js';

export const useManufacturingStore = defineStore('manufacturing', () => {
  const api = new ManufacturingApi();

  const products = ref([]);
  const formulas = ref([]);
  const formulaItems = ref([]);
  const orders = ref([]);
  const operations = ref([]);
  const batches = ref([]);
  const batchEvents = ref([]);
  const materialLots = ref([]);
  const loading = ref(false);
  const error = ref(null);

  function loadAll() {
    loading.value = true;
    error.value = null;
    Promise.all([
      api.getProducts(),
      api.getMasterFormulas(),
      api.getFormulaItems(),
      api.getProductionOrders(),
      api.getOperations(),
      api.getBatches(),
      api.getBatchEvents(),
      api.getMaterialLots()
    ]).then(([
      productsRes,
      formulasRes,
      formulaItemsRes,
      ordersRes,
      operationsRes,
      batchesRes,
      batchEventsRes,
      materialLotsRes
    ]) => {
      products.value = productsRes.data;
      formulas.value = formulasRes.data;
      formulaItems.value = formulaItemsRes.data;
      orders.value = ordersRes.data;
      operations.value = operationsRes.data;
      batches.value = batchesRes.data;
      batchEvents.value = batchEventsRes.data;
      materialLots.value = materialLotsRes.data;
    }).catch(e => {
      error.value = e.message || 'Failed to load manufacturing data';
      console.error(e);
    }).finally(() => {
      loading.value = false;
    });
  }

  function getBatchEvents(batchCode) {
    return batchEvents.value.filter(e => e.batchCode === batchCode);
  }

  return {
    products,
    formulas,
    formulaItems,
    orders,
    operations,
    batches,
    batchEvents,
    materialLots,
    loading,
    error,
    loadAll,
    getBatchEvents
  };
});
