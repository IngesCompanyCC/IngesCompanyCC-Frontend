
<template>
  <div class="p-4">
    <pv-card>
      <template #title>Migration Status</template>
      <template #content>
        <p>This view has been stubbed because the automated Angular-to-Vue template migration produced incompatible ASTs.</p>
      </template>
    </pv-card>
  </div>
</template>

<script setup>

/**
 * Batch detail: material-to-finished-goods genealogy and status history.
 */


  const store = inject(ManufacturingStore);

  /**
   * Batch code from the route.
   */
  code = input.required<string>();

  /**
   * The batch.
   */
  const batch = computed(() => this.store.batches.find(batch => batch.code === this.code()));

  /**
   * Product of the batch.
   */
  const product = computed(() => this.store.products.find(product => product.code === this.batch()?.productCode));

  /**
   * Production order of the batch.
   */
  const order = computed(() => this.store.orders.find(order => order.code === this.batch()?.orderCode));

  /**
   * Master formula of the order.
   */
  const formula = computed(() => this.store.formulas.find(formula => formula.id === this.order()?.formulaId));

  /**
   * Input lots allocated to the batch.
   */
  const lots = computed(() => this.store.materialLots.filter(lot => lot.allocatedBatch === this.code()));

  /**
   * Operations of the order, summarized as a flow.
   */
  const operations = computed(() => {
    const order = this.order();
    return order ? this.store.operationsOfOrder(order.id)() : [];
  });

  /**
   * Status history of the batch.
   */
  const events = computed(() => this.store.eventsOfBatch(this.code())());

</script>
