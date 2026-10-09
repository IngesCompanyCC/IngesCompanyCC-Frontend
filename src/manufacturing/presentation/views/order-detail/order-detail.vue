<template>
<section class="page">
  @if (order(); as po) {
    <app-page-header
      [breadcrumb]="['shell.workspace' | translate, 'environments.production.short' | translate, 'nav.production-orders' | translate, po.code]"
      [title]="('manufacturing.orders.order-title' | translate) + ' ' + po.code"
      [subtitle]="(product()?.name ?? '') + ' (' + po.productCode + ') · MFR-' + po.productCode + ' ' + (formula()?.version ?? '') + ' · ' + po.batchCode">
      <button mat-flat-button type="button" (click)="recordOperation()" [disabled]="!!heldOperation()">{{ 'manufacturing.orders.record' | translate }}</button>
    </app-page-header>

    @if (heldOperation(); as held) {
      <div class="alert" role="status"><mat-icon>warning_amber</mat-icon><div><strong>{{ 'manufacturing.orders.hold-alert' | translate: {operation: held.name, reference: held.reference} }}</strong></div></div>
    }

    <div class="columns">
      <div class="stack">
        <mat-card appearance="outlined">
          <div class="card-title row"><div>
              <h2>{{ 'manufacturing.orders.execution' | translate }} · {{ po.batchCode }}</h2><span class="spacer"></span>
              <p class="small muted">{{ 'manufacturing.orders.execution-text' | translate }}</p></div>
          </div>
          <div class="table-scroll"><table mat-table [dataSource]="operations()" [attr.aria-label]="'manufacturing.orders.execution' | translate">
  <ng-container matColumnDef="c0">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.operation' | translate }}</th>
    <td mat-cell *matCellDef="let operation"><strong>{{ operation.name }}</strong></td>
  </ng-container>
  <ng-container matColumnDef="c1">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.equipment' | translate }}</th>
    <td mat-cell *matCellDef="let operation">{{ operation.equipment }}</td>
  </ng-container>
  <ng-container matColumnDef="c2">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.progress' | translate }}</th>
    <td mat-cell *matCellDef="let operation">{{ operation.progress }} %</td>
  </ng-container>
  <ng-container matColumnDef="c3">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.products.status' | translate }}</th>
    <td mat-cell *matCellDef="let operation"><span class="chip chip-dot" [class]="toneOf(operation.status)">
                    {{ 'manufacturing.operation-status.' + operation.status | translate }}@if (operation.reference) { · {{ operation.reference }} }</span></td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="['c0', 'c1', 'c2', 'c3']"></tr>
  <tr mat-row *matRowDef="let operation; columns: ['c0', 'c1', 'c2', 'c3']" [class.highlight]="operation.status === 'on-hold'"></tr>
</table></div>
        </mat-card>

        @if (formula(); as mfr) {
          <mat-card appearance="outlined">
            <div class="card-title row"><div>
                <h2>{{ 'manufacturing.orders.formula' | translate }} · MFR-{{ mfr.productCode }} {{ mfr.version }}</h2><span class="spacer"></span>
                <p class="small muted">{{ 'manufacturing.orders.formula-text' | translate }} {{ mfr.approvedAt | date: 'MMM dd, yyyy' }}</p></div>
            </div>
            <div class="table-scroll"><table mat-table [dataSource]="items()" [attr.aria-label]="'manufacturing.orders.formula' | translate">
  <ng-container matColumnDef="c0">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.ingredient' | translate }}</th>
    <td mat-cell *matCellDef="let item" [class.strong]="item.role === 'Active ingredient'">{{ item.name }}</td>
  </ng-container>
  <ng-container matColumnDef="c1">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.target' | translate }}</th>
    <td mat-cell *matCellDef="let item">{{ item.target }}</td>
  </ng-container>
  <ng-container matColumnDef="c2">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.tolerance' | translate }}</th>
    <td mat-cell *matCellDef="let item">{{ item.tolerance }}</td>
  </ng-container>
  <ng-container matColumnDef="c3">
    <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.orders.control' | translate }}</th>
    <td mat-cell *matCellDef="let item">{{ item.control }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="['c0', 'c1', 'c2', 'c3']"></tr>
  <tr mat-row *matRowDef="let item; columns: ['c0', 'c1', 'c2', 'c3']"></tr>
</table></div>
          </mat-card>
        }
      </div>

      <aside class="stack">
        <mat-card appearance="outlined" class="panel context">
          <h2>{{ 'manufacturing.orders.context' | translate }}</h2>
          <p class="label">{{ 'manufacturing.orders.status' | translate }}</p>
          <span class="chip chip-dot" [class]="po.status === 'on-hold' ? 'chip-danger' : po.status === 'planned' ? 'chip-neutral' : 'chip-success'">{{ 'manufacturing.order-status.' + po.status | translate }}</span>
          <p class="label">{{ 'manufacturing.products.product' | translate }}</p>
          <p>{{ product()?.name }} · {{ po.productCode }}</p>
          <p class="label">{{ 'manufacturing.orders.planned-quantity' | translate }}</p>
          <p>{{ po.plannedQuantity | number }} {{ 'manufacturing.units' | translate }}</p>
          <p class="label">{{ 'manufacturing.orders.formula' | translate }}</p>
          <p>MFR-{{ po.productCode }} {{ formula()?.version }} · {{ 'manufacturing.formula-status.locked' | translate }}</p>
          <p class="label">{{ 'manufacturing.orders.approved' | translate }}</p>
          <p>{{ formula()?.approvedAt | date: 'MMM dd, yyyy' }} · {{ formula()?.approvedBy }}</p>
          <p class="label">{{ 'manufacturing.orders.planned-execution' | translate }}</p>
          <p>{{ po.plannedStart | date: 'MMM dd, HH:mm' : 'UTC' }}–{{ po.plannedEnd | date: 'HH:mm' : 'UTC' }} · {{ po.line }}</p>
          <a [routerLink]="['/production/batches', po.batchCode]">{{ 'manufacturing.batches.view-genealogy' | translate }} →</a>
        </mat-card>
      </aside>
    </div>
  } @else {
    <p class="muted">{{ 'manufacturing.orders.not-found' | translate }}</p>
  }
</section>

</template>

<script setup>
/**
 * Production order: manufacturing execution, effective master formula and order context.
 */


  protected store = inject(ManufacturingStore);

  /**
   * Order code from the route.
   */
  code = input.required<string>();

  /**
   * The production order.
   */
  protected order = computed(() => this.store.orders().find(order => order.code === this.code()));

  /**
   * Product of the order.
   */
  protected product = computed(() => this.store.products().find(product => product.code === this.order()?.productCode));

  /**
   * Master formula of the order.
   */
  protected formula = computed(() => this.store.formulas().find(formula => formula.id === this.order()?.formulaId));

  /**
   * Components and parameters of the formula.
   */
  protected items = computed(() => this.store.formulaItems().filter(item => item.formulaId === this.formula()?.id));

  /**
   * Operations of the order.
   */
  protected operations = computed(() => {
    const order = this.order();
    return order ? this.store.operationsOfOrder(order.id)() : [];
  });

  /**
   * Operation on hold, if any.
   */
  protected heldOperation = computed(() => this.operations().find(operation => operation.status === 'on-hold'));

  /**
   * Color of an operation status chip.
   * @param status - Operation status.
   */
  protected toneOf(status) {
    return ({complete: 'chip-success', 'on-hold': 'chip-danger', 'in-progress': 'chip-teal'} as Record<string, string>)[status] ?? 'chip-neutral';
  }

  /**
   * Records progress on the next operation.
   */
  protected recordOperation(): void {
    const order = this.order();
    if (order) this.store.recordOperation(order.id);
  }
</script>

<style scoped>
.context {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 24px;
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