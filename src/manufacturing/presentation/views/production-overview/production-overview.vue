<template>
﻿<section class="page">
  <app-page-header
    [breadcrumb]="['shell.workspace' | translate, 'environments.production.short' | translate, 'nav.production-overview' | translate]"
    [title]="'nav.production-overview' | translate"
    [subtitle]="'manufacturing.overview.subtitle' | translate: {name: firstName()}">
    <a mat-flat-button routerLink="/production/batches">+ {{ 'manufacturing.overview.create-order' | translate }}</a>
  </app-page-header>

  <div class="stats">
    <mat-card appearance="outlined" class="stat">
      <p class="stat-label">{{ 'manufacturing.overview.orders' | translate }}</p>
      <p class="stat-value">{{ store.orders().length }}</p>
      <p class="stat-note">{{ 'manufacturing.overview.orders-note' | translate: {running: (store.batchCounts()['in-progress'] ?? 0), held: (store.batchCounts()['on-hold'] ?? 0)} }}</p>
    </mat-card>
    <mat-card appearance="outlined" class="stat">
      <p class="stat-label">{{ 'manufacturing.overview.output' | translate }}</p>
      <p class="stat-value">{{ output() | number }}</p>
      <p class="stat-note">{{ 'manufacturing.overview.output-note' | translate }}</p>
    </mat-card>
    <mat-card appearance="outlined" class="stat">
      <p class="stat-label">{{ 'manufacturing.overview.batches' | translate }}</p>
      <p class="stat-value">{{ (store.batchCounts()['in-progress'] ?? 0) + (store.batchCounts()['on-hold'] ?? 0) }}</p>
      <p class="stat-note">{{ 'manufacturing.overview.batches-note' | translate }}</p>
    </mat-card>
    <mat-card appearance="outlined" class="stat">
      <p class="stat-label">{{ 'manufacturing.overview.incidents' | translate }}</p>
      <p class="stat-value">{{ monitoringStore.activeAlerts().length }}</p>
      <p class="stat-note">{{ 'manufacturing.overview.incidents-note' | translate }}</p>
    </mat-card>
  </div>

  @if (heldBatch(); as held) {
    <div class="alert alert-danger">
      <div><strong><mat-icon class="inline">error_outline</mat-icon>{{ held.line }} · {{ held.code }} · {{ held.incident }}</strong></div>
      <a mat-stroked-button [routerLink]="['/production/batches', held.code, 'iot']">{{ 'manufacturing.overview.view-evidence' | translate }}</a>
    </div>
  }

  <div class="columns">
    <div class="stack">
      <mat-card appearance="outlined">
        <div class="card-title row"><div>
          <h2>{{ 'manufacturing.overview.schedule' | translate }}</h2><span class="spacer"></span>
          <p class="small muted">{{ 'manufacturing.overview.schedule-text' | translate }}</p></div>
        </div>
        <div class="table-scroll"><table mat-table [dataSource]="schedule()">
          <ng-container matColumnDef="c0">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.order' | translate }}</th>
            <td mat-cell *matCellDef="let row"><a [routerLink]="['/production/orders', row.order.code]">{{ row.order.code }}</a><span class="sub">{{ row.order.batchCode }}</span></td>
          </ng-container>
          <ng-container matColumnDef="c1">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.products.product' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.product?.name }}</td>
          </ng-container>
          <ng-container matColumnDef="c2">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.batches.line' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.order.line }}</td>
          </ng-container>
          <ng-container matColumnDef="c3">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.progress' | translate }}</th>
            <td mat-cell *matCellDef="let row">{{ row.batch?.progress ?? 0 }} %</td>
          </ng-container>
          <ng-container matColumnDef="c4">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.products.status' | translate }}</th>
            <td mat-cell *matCellDef="let row"><span class="chip chip-dot" [class]="toneOf(row.batch?.status)">{{ 'manufacturing.batch-status.' + (row.batch?.status ?? 'planned') | translate }}</span></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['c0', 'c1', 'c2', 'c3', 'c4']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['c0', 'c1', 'c2', 'c3', 'c4']" [class.highlight]="row.batch?.status === 'on-hold'"></tr>
        </table></div>
      </mat-card>

      <mat-card appearance="outlined">
        <h2 class="card-title">{{ 'manufacturing.overview.readiness' | translate }}</h2>
        <div class="table-scroll"><table mat-table [dataSource]="readiness()">
          <ng-container matColumnDef="c0">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.overview.resource' | translate }}</th>
            <td mat-cell *matCellDef="let item"><strong>{{ item.code }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="c1">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.overview.availability' | translate }}</th>
            <td mat-cell *matCellDef="let item"><span class="chip chip-dot" [class]="item.tone">{{ item.label | translate }}</span></td>
          </ng-container>
          <ng-container matColumnDef="c2">
            <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.overview.assignment' | translate }}</th>
            <td mat-cell *matCellDef="let item">{{ item.assignment }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['c0', 'c1', 'c2']"></tr>
          <tr mat-row *matRowDef="let item; columns: ['c0', 'c1', 'c2']"></tr>
        </table></div>
      </mat-card>
    </div>

    <aside class="stack">
      <mat-card appearance="outlined" class="panel side">
        <h2>{{ 'manufacturing.overview.priorities' | translate }}</h2>
        <p class="small muted">{{ 'manufacturing.overview.priorities-text' | translate }}</p>
        @for (alert of monitoringStore.activeAlerts(); track alert.id) {
          <a class="incident" [routerLink]="['/production/sensors', alert.sensorCode]">
            <strong>{{ alert.code }} · {{ alert.title }}</strong>
            <span class="small muted">{{ alert.sensorCode }} · {{ alert.equipmentCode }} {{ alert.linkedRecord ? '· ' + alert.linkedRecord : '' }}</span>
            <span class="chip chip-dot" [class]="alert.severity === 'critical' ? 'chip-warning' : 'chip-neutral'">{{ 'monitoring.alert-status.' + alert.status | translate }}</span>
          </a>
        }
      </mat-card>
      <mat-card appearance="outlined" class="panel side">
        <h2>{{ 'manufacturing.overview.handover' | translate }}</h2>
        <div><strong>{{ 'manufacturing.overview.handover-1' | translate }}</strong><p class="small muted">{{ 'manufacturing.overview.handover-1-text' | translate }}</p></div>
        <div><strong>{{ 'manufacturing.overview.handover-2' | translate }}</strong><p class="small muted">{{ 'manufacturing.overview.handover-2-text' | translate }}</p></div>
        <div><strong>{{ 'manufacturing.overview.handover-3' | translate }}</strong><p class="small muted">{{ 'manufacturing.overview.handover-3-text' | translate }}</p></div>
      </mat-card>
    </aside>
  </div>
</section>

</template>

<script setup>
/**
 * Production home: today's orders and batches, incidents, and equipment and material readiness.
 */


  protected store = inject(ManufacturingStore);
  protected monitoringStore = inject(MonitoringStore);
  protected iamStore = inject(IamStore);

  /**
   * First name of the signed-in user.
   */
  protected firstName = computed(
    () => this.iamStore.currentUser()?.fullName.split(' ')[0] ?? '',
  );

  /**
   * Orders of the schedule with their batch.
   */
  protected schedule = computed(() =>
    this.store.orders().map((order) => ({
      order,
      batch: this.store.batches().find((batch) => batch.code === order.batchCode),
      product: this.store.products().find((product) => product.code === order.productCode),
    })),
  );

  /**
   * Units of the batches in progress.
   */
  protected output = computed(() =>
    this.store
      .batches()
      .filter((batch) => batch.status === 'in-progress' || batch.status === 'on-hold')
      .reduce((total, batch) => total + Math.round((batch.quantity * batch.progress) / 100), 0),
  );

  /**
   * Batch on hold, shown in the top alert.
   */
  protected heldBatch = computed(() =>
    this.store.batches().find((batch) => batch.status === 'on-hold'),
  );

  /**
   * Equipment and material that need attention before they can be used.
   */
  protected readiness = computed(() => [
    ...this.monitoringStore.equipment().map((item) => ({
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
  protected toneOf(status | undefined) {
    return (
      (
        {
          'on-hold': 'chip-danger',
          'in-progress': 'chip-success',
          planned: 'chip-neutral',
        } as Record<string, string>
      )[status ?? ''] ?? 'chip-teal'
    );
  }
</script>

<style scoped>
﻿.side {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
}

.incident {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-weight: 400;
}

.incident:hover {
    border-color: var(--teal);
    text-decoration: none;
}

</style>