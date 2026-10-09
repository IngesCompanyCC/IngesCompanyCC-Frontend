
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
 * List of production orders with their product, batch, line and status.
 */


  const store = inject(ManufacturingStore);

  /**
   * Columns of the order table.
   */
  const columns = ['order', 'product', 'quantity', 'line', 'planned', 'status'];

  /**
   * Color of an order status chip.
   * @param status - Order status.
   */
  const toneOf = (status) => {
    return status === 'on-hold' ? 'chip-danger' : status === 'planned' ? 'chip-neutral' : 'chip-success';}

</script>
