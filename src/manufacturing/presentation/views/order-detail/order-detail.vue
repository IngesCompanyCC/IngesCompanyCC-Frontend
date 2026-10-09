
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
 * Production order: manufacturing execution, effective master formula and order context.
 */


  const store = inject(ManufacturingStore);

  /**
   * Order code from the route.
   */
  code = input.required<string>();

  /**
   * The production order.
   */
  const order = computed(() => this.store.orders.find(order => order.code === this.code()));

  /**
   * Product of the order.
   */
  const product = computed(() => this.store.products.find(product => product.code === this.order()?.productCode));

  /**
   * Master formula of the order.
   */
  const formula = computed(() => this.store.formulas.find(formula => formula.id === this.order()?.formulaId));

  /**
   * Components and parameters of the formula.
   */
  const items = computed(() => this.store.formulaItems.filter(item => item.formulaId === this.formula()?.id));

  /**
   * Operations of the order.
   */
  const operations = computed(() => {
    const order = this.order();
    return order ? this.store.operationsOfOrder(order.id)() : [];
  });

  /**
   * Operation on hold, if any.
   */
  const heldOperation = computed(() => this.operations().find(operation => operation.status === 'on-hold'));

  /**
   * Color of an operation status chip.
   * @param status - Operation status.
   */
  const toneOf(status) {
    return ({complete: 'chip-success', 'on-hold': 'chip-danger', 'in-progress': 'chip-teal'} as Record<string, string>)[status] ?? 'chip-neutral';}
  /**
   * Records progress on the next operation.
   */
  const recordOperation(): void {
    const order = this.order();
    if (order) this.store.recordOperation(order.id);}

</script>
