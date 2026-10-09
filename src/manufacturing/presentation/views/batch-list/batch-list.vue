
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
 * Filters of the batch list.
 */
type BatchFilter = 'all' | 'in-progress' | 'on-hold' | 'released';


/**
 * Batch list with status counts, a summary of the selected batch, a lookup and the "create batch" dialog.
 */

  const store = inject(ManufacturingStore);
  router = inject(Router);
  dialog = inject(MatDialog);

  /**
   * Filter tabs.
   */
  const filters = ['all', 'in-progress', 'on-hold', 'released'];

  /**
   * Columns of the batch table.
   */
  const columns = ['batch', 'order', 'owner', 'status'];

  /**
   * Selected filter tab.
   */
  const filter = signal<BatchFilter>('all');

  /**
   * Code of the batch shown in the side panel.
   */
  const selectedCode = signal('B-26041');

  /**
   * Batches that match the filter, newest code first.
   */
  const visibleBatches = computed(() => {
    const filter = this.filter();
    return [...this.store.batches]
      .filter(batch => filter === 'all' || batch.status === filter)
      .sort((a, b) => b.code.localeCompare(a.code));
  });

  /**
   * Batch shown in the side panel.
   */
  const selected = computed(() => this.store.batches.find(batch => batch.code === this.selectedCode()));

  /**
   * Batch lookup code.
   */
  const lookup = new FormControl('B-26041', {nonNullable: true});

  /**
   * Whether the lookup found nothing.
   */
  const notFound = signal(false);

  /**
   * Color of a batch status chip.
   * @param status - Batch status.
   */
  const toneOf = (status) => {
    return ({'on-hold': 'chip-warning', 'in-progress': 'chip-teal', 'release-requested': 'chip-success', released: 'chip-success'} as Record<string, string>)[status] ?? 'chip-neutral';}
  /**
   * Opens the batch typed in the lookup.
   */
  const search(): void {
    const code = this.lookup.value.trim().toUpperCase();
    const found = this.store.batches.some(batch => batch.code === code);
    this.notFound.set(!found);
    if (found) this.router.navigate(['/production/batches', code]).then();}
  /**
   * Opens the create batch dialog and selects the new batch.
   */
  const openCreate(): void {
    this.dialog.open(BatchForm, {width: '560px', maxWidth: 'calc(100vw - 32px)'})
      .afterClosed().subscribe(code => {
        if (code) this.selectedCode.set(code);
      });}

</script>
