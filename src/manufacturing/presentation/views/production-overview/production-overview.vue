<template>
﻿<section class="page">
  <app-page-header
    [breadcrumb]="['shell.workspace' , 'environments.production.short' , 'nav.production-overview' ]"
    :title="$t('nav.production-overview' )"
    :subtitle="$t('manufacturing.overview.subtitle' , {name: firstName})">
    <router-link class="p-button p-component" to="/production/batches">+ {{ $t('manufacturing.overview.create-order') }}</router-link>
  </app-page-header>

  <div class="stats">
    <pv-card>
      <p class="stat-label">{{ $t('manufacturing.overview.orders') }}</p>
      <p class="stat-value">{{ store.orders.length }}</p>
      <p class="stat-note">{{ $t('manufacturing.overview.orders-note', {running: (store.batchCounts['in-progress'] ?? 0), held: (store.batchCounts['on-hold'] ?? 0)}) }}</p>
    </pv-card>
    <pv-card>
      <p class="stat-label">{{ $t('manufacturing.overview.output') }}</p>
      <p class="stat-value">{{ output() }}</p>
      <p class="stat-note">{{ $t('manufacturing.overview.output-note') }}</p>
    </pv-card>
    <pv-card>
      <p class="stat-label">{{ $t('manufacturing.overview.batches') }}</p>
      <p class="stat-value">{{ (store.batchCounts['in-progress'] ?? 0) + (store.batchCounts['on-hold'] ?? 0) }}</p>
      <p class="stat-note">{{ $t('manufacturing.overview.batches-note') }}</p>
    </pv-card>
    <pv-card>
      <p class="stat-label">{{ $t('manufacturing.overview.incidents') }}</p>
      <p class="stat-value">{{ monitoringStore.activeAlerts.length }}</p>
      <p class="stat-note">{{ $t('manufacturing.overview.incidents-note') }}</p>
    </pv-card>
  </div>

  @if (heldBatch(); as held) {
    <div class="alert alert-danger">
      <div><strong><mat-icon class="inline">error_outline</mat-icon>{{ held.line }} · {{ held.code }} · {{ held.incident }}</strong></div>
      <a mat-stroked-button :to="['/production/batches', held.code, 'iot']">{{ $t('manufacturing.overview.view-evidence') }}</a>
    </div></template>
  <div class="columns">
    <div class="stack">
      <pv-card>
        <div class="card-title row"><div>
          <h2>{{ $t('manufacturing.overview.schedule') }}</h2><span class="spacer"></span>
          <p class="small muted">{{ $t('manufacturing.overview.schedule-text') }}</p></div>
        </div>
        <div class="table-scroll"><table pv-data-table [dataSource]="schedule()">
          <ng-container field="c0">
            <th th *matHeaderCellDef>{{ $t('manufacturing.orders.order') }}</th>
            <td td *matCellDef="let row"><a :to="['/production/orders', row.order.code]">{{ row.order.code }}</a><span class="sub">{{ row.order.batchCode }}</span></td>
          </ng-container>
          <ng-container field="c1">
            <th th *matHeaderCellDef>{{ $t('manufacturing.products.product') }}</th>
            <td td *matCellDef="let row">{{ row.product?.name }}</td>
          </ng-container>
          <ng-container field="c2">
            <th th *matHeaderCellDef>{{ $t('manufacturing.batches.line') }}</th>
            <td td *matCellDef="let row">{{ row.order.line }}</td>
          </ng-container>
          <ng-container field="c3">
            <th th *matHeaderCellDef>{{ $t('manufacturing.orders.progress') }}</th>
            <td td *matCellDef="let row">{{ row.batch?.progress ?? 0 }} %</td>
          </ng-container>
          <ng-container field="c4">
            <th th *matHeaderCellDef>{{ $t('manufacturing.products.status') }}</th>
            <td td *matCellDef="let row"><span class="chip chip-dot" :class="toneOf(row.batch?.status)">{{ 'manufacturing.batch-status.' + (row.batch?.status ?? 'planned')  }}</span></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['c0', 'c1', 'c2', 'c3', 'c4']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['c0', 'c1', 'c2', 'c3', 'c4']" :class="{'highlight': row.batch?.status === 'on-hold'}"></tr>
        </table></div>
      </pv-card>

      <pv-card>
        <h2 class="card-title">{{ $t('manufacturing.overview.readiness') }}</h2>
        <div class="table-scroll"><table pv-data-table [dataSource]="readiness()">
          <ng-container field="c0">
            <th th *matHeaderCellDef>{{ $t('manufacturing.overview.resource') }}</th>
            <td td *matCellDef="let item"><strong>{{ item.code }}</strong></td>
          </ng-container>
          <ng-container field="c1">
            <th th *matHeaderCellDef>{{ $t('manufacturing.overview.availability') }}</th>
            <td td *matCellDef="let item"><span class="chip chip-dot" :class="item.tone">{{ $t(item.label) }}</span></td>
          </ng-container>
          <ng-container field="c2">
            <th th *matHeaderCellDef>{{ $t('manufacturing.overview.assignment') }}</th>
            <td td *matCellDef="let item">{{ item.assignment }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['c0', 'c1', 'c2']"></tr>
          <tr mat-row *matRowDef="let item; columns: ['c0', 'c1', 'c2']"></tr>
        </table></div>
      </pv-card>
    </div>

    <aside class="stack">
      <pv-card>
        <h2>{{ $t('manufacturing.overview.priorities') }}</h2>
        <p class="small muted">{{ $t('manufacturing.overview.priorities-text') }}</p>
        <template v-for="alert in monitoringStore.activeAlerts" :key="alert.id">
          <a class="incident" :to="['/production/sensors', alert.sensorCode]">
            <strong>{{ alert.code }} · {{ alert.title }}</strong>
            <span class="small muted">{{ alert.sensorCode }} · {{ alert.equipmentCode }} {{ alert.linkedRecord ? '· ' + alert.linkedRecord : '' }}</span>
            <span class="chip chip-dot" :class="alert.severity === 'critical' ? 'chip-warning' : 'chip-neutral'">{{ $t('monitoring.alert-status.' + alert.status) }}</span>
          </a></template>
      </pv-card>
      <pv-card>
        <h2>{{ $t('manufacturing.overview.handover') }}</h2>
        <div><strong>{{ $t('manufacturing.overview.handover-1') }}</strong><p class="small muted">{{ $t('manufacturing.overview.handover-1-text') }}</p></div>
        <div><strong>{{ $t('manufacturing.overview.handover-2') }}</strong><p class="small muted">{{ $t('manufacturing.overview.handover-2-text') }}</p></div>
        <div><strong>{{ $t('manufacturing.overview.handover-3') }}</strong><p class="small muted">{{ $t('manufacturing.overview.handover-3-text') }}</p></div>
      </pv-card>
    </aside>
  </div>
</section>

</template>

<script setup>
/**
 * Production home: today's orders and batches, incidents, and equipment and material readiness.
 */


  const store = inject(ManufacturingStore);
  const monitoringStore = inject(MonitoringStore);
  const iamStore = inject(IamStore);

  /**
   * First name of the signed-in user.
   */
  const firstName = computed(
    () => this.iamStore.currentUser?.fullName.split(' ')[0] ?? '',
  );

  /**
   * Orders of the schedule with their batch.
   */
  const schedule = computed(() =>
    this.store.orders.map((order) => ({
      order,
      batch: this.store.batches.find((batch) => batch.code === order.batchCode),
      product: this.store.products.find((product) => product.code === order.productCode),
    })),
  );

  /**
   * Units of the batches in progress.
   */
  const output = computed(() =>
    this.store
      .batches()
      .filter((batch) => batch.status === 'in-progress' || batch.status === 'on-hold')
      .reduce((total, batch) => total + Math.round((batch.quantity * batch.progress) / 100), 0),
  );

  /**
   * Batch on hold, shown in the top alert.
   */
  const heldBatch = computed(() =>
    this.store.batches.find((batch) => batch.status === 'on-hold'),
  );

  /**
   * Equipment and material that need attention before they can be used.
   */
  const readiness = computed(() => [
    ...this.monitoringStore.equipment.map((item) => ({
      code: item.code,
      state: item.calibrationStatus,
      tone:
        item.calibrationStatus === 'fit'
          ? 'chip-success'
          : item.calibrationStatus === 'due'
            ? 'chip-warning'
            : 'chip-danger',
      label: 'monitoring.calibration.' + item.calibrationStatus,
      assignment: this.monitoringStore.sensorsOf(item.code)()[0]?.assignedBatch || '—',
    })),
    ...this.store
      .materialLots()
      .filter((lot) => lot.status !== 'approved')
      .map((lot) => ({
        code: `${lot.code} · ${lot.category.toUpperCase()}`,
        state: lot.status,
        tone: 'chip-warning',
        label: 'manufacturing.lot-status.' + lot.status,
        assignment: lot.allocatedBatch || '—',
      })),
  ]);

  /**
   * Color of a batch status chip.
   * @param status - Batch status.
   */
  const toneOf(status | undefined) {
    return (
      (
        {
          'on-hold': 'chip-danger',
          'in-progress': 'chip-success',
          planned: 'chip-neutral',
        } as Record<string, string>
      )[status ?? ''] ?? 'chip-teal'
    );</template>
</script>

<style scoped>
﻿.side {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;</template>
.incident {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-weight: 400;</template>
.incident:hover {
    border-color: var(--teal);
    text-decoration: none;</template>
</style>