<template>
<section class="page">
  <app-page-header
    [breadcrumb]="['shell.workspace' | translate, 'environments.production.short' | translate, 'nav.batches' | translate]"
    [title]="'nav.batches' | translate"
    [subtitle]="'manufacturing.batches.subtitle' | translate">
    <button mat-flat-button type="button" (click)="openCreate()"><mat-icon>add</mat-icon>{{ 'manufacturing.batches.create' | translate }}</button>
  </app-page-header>

  <mat-card appearance="outlined" class="summary">
    <div><p class="stat-label">{{ 'manufacturing.batch-status.in-progress' | translate }}</p><p class="stat-value teal">{{ store.batchCounts()['in-progress'] ?? 0 }}</p></div>
    <div><p class="stat-label">{{ 'manufacturing.batch-status.on-hold' | translate }}</p><p class="stat-value warn">{{ store.batchCounts()['on-hold'] ?? 0 }}</p></div>
    <div><p class="stat-label">{{ 'manufacturing.batch-status.release-requested' | translate }}</p><p class="stat-value teal">{{ store.batchCounts()['release-requested'] ?? 0 }}</p></div>
    <div><p class="stat-label">{{ 'manufacturing.batch-status.released' | translate }}</p><p class="stat-value teal">{{ store.batchCounts()['released'] ?? 0 }}</p></div>
  </mat-card>

  <nav mat-tab-nav-bar [tabPanel]="panel" mat-stretch-tabs="false" mat-align-tabs="start" class="tabs" [attr.aria-label]="'shell.filters' | translate">
    @for (tab of filters; track tab) {
      <a mat-tab-link [active]="filter() === tab" (click)="filter.set(tab)">{{ 'manufacturing.batches.tab.' + tab | translate }}</a>
    }
  </nav>

  <mat-tab-nav-panel #panel>
    <div class="columns">
      <div class="stack">
        <mat-card appearance="outlined">
          <div class="table-scroll">
            <table mat-table [dataSource]="visibleBatches()" [attr.aria-label]="'nav.batches' | translate">
              <ng-container matColumnDef="batch">
                <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.batches.batch-product' | translate }}</th>
                <td mat-cell *matCellDef="let batch">
                  <a [routerLink]="['/production/batches', batch.code]" (click)="$event.stopPropagation()">{{ batch.code }}</a>
                  <span class="sub">{{ batch.productCode }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="order">
                <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.batches.order-quantity' | translate }}</th>
                <td mat-cell *matCellDef="let batch">{{ batch.orderCode }}<span class="sub">{{ batch.quantity | number }} {{ 'manufacturing.units' | translate }}</span></td>
              </ng-container>
              <ng-container matColumnDef="owner">
                <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.batches.owner' | translate }}</th>
                <td mat-cell *matCellDef="let batch">{{ batch.owner }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ 'manufacturing.products.status' | translate }}</th>
                <td mat-cell *matCellDef="let batch"><span class="chip" [class]="toneOf(batch.status)">{{ 'manufacturing.batch-status.' + batch.status | translate }}</span></td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let batch; columns: columns" class="clickable"
                  [class.highlight]="batch.code === selectedCode()" (click)="selectedCode.set(batch.code)"></tr>
            </table>
          </div>
          <p class="footnote small muted">{{ 'manufacturing.batches.showing' | translate: {shown: visibleBatches().length, total: store.batches().length} }}</p>
        </mat-card>

        <mat-card appearance="outlined" class="panel">
          <div>
            <h2>{{ 'manufacturing.batches.lookup' | translate }}</h2>
            <p class="sub">{{ 'manufacturing.batches.lookup-text' | translate }}</p>
          </div>
          <div class="row lookup">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <input matInput [formControl]="lookup" (keyup.enter)="search()" [attr.aria-label]="'manufacturing.batches.lookup' | translate">
            </mat-form-field>
            <button mat-flat-button type="button" (click)="search()">{{ 'manufacturing.batches.search' | translate }}</button>
          </div>
          @if (notFound()) {
            <p class="not-found" role="alert">{{ 'manufacturing.batches.not-found' | translate }}</p>
          }
        </mat-card>
      </div>

      <aside class="stack">
        @if (selected(); as batch) {
          <mat-card appearance="outlined" class="panel batch">
            <p class="state" [class]="'state-' + batch.status">
              @if (batch.status === 'on-hold') { <mat-icon>warning</mat-icon> }
              {{ 'manufacturing.batch-status.' + batch.status | translate }}
            </p>
            <h2>{{ batch.code }}</h2>
            <p class="muted">{{ store.productByCode(batch.productCode)()?.name }}</p>
            <p class="muted">{{ batch.quantity | number }} {{ 'manufacturing.units' | translate }} · {{ batch.line }}</p>
            @if (batch.incident) {
              <p class="label danger">{{ 'manufacturing.batches.incident' | translate }}</p>
              <p>{{ batch.incident }}</p>
            }
            <p class="label">{{ 'manufacturing.batches.last-activity' | translate }}</p>
            <p>{{ batch.lastActivityAt | date: 'MMM dd, HH:mm' : 'UTC' }} UTC</p>
            <p class="muted">{{ batch.lastActivity }}</p>
            <a [routerLink]="['/production/batches', batch.code]">{{ 'manufacturing.batches.view-genealogy' | translate }} →</a>
          </mat-card>
        }
        <mat-card appearance="outlined" class="panel">
          <h2>{{ 'manufacturing.batches.definitions' | translate }}</h2>
          <div>
            <strong>{{ 'manufacturing.batches.definition-hold' | translate }}</strong>
            <p class="sub">{{ 'manufacturing.batches.definition-hold-text' | translate }}</p>
          </div>
          <div>
            <strong>{{ 'manufacturing.batches.definition-release' | translate }}</strong>
            <p class="sub">{{ 'manufacturing.batches.definition-release-text' | translate }}</p>
          </div>
        </mat-card>
      </aside>
    </div>
  </mat-tab-nav-panel>
</section>

</template>

<script setup>
/**
 * Filters of the batch list.
 */
type BatchFilter = 'all' | 'in-progress' | 'on-hold' | 'released';


/**
 * Batch list with status counts, a summary of the selected batch, a lookup and the "create batch" dialog.
 */

  protected store = inject(ManufacturingStore);
  router = inject(Router);
  dialog = inject(MatDialog);

  /**
   * Filter tabs.
   */
  protected filters = ['all', 'in-progress', 'on-hold', 'released'];

  /**
   * Columns of the batch table.
   */
  protected columns = ['batch', 'order', 'owner', 'status'];

  /**
   * Selected filter tab.
   */
  protected filter = signal<BatchFilter>('all');

  /**
   * Code of the batch shown in the side panel.
   */
  protected selectedCode = signal('B-26041');

  /**
   * Batches that match the filter, newest code first.
   */
  protected visibleBatches = computed(() => {
    const filter = this.filter();
    return [...this.store.batches()]
      .filter(batch => filter === 'all' || batch.status === filter)
      .sort((a, b) => b.code.localeCompare(a.code));
  });

  /**
   * Batch shown in the side panel.
   */
  protected selected = computed(() => this.store.batches().find(batch => batch.code === this.selectedCode()));

  /**
   * Batch lookup code.
   */
  protected lookup = new FormControl('B-26041', {nonNullable: true});

  /**
   * Whether the lookup found nothing.
   */
  protected notFound = signal(false);

  /**
   * Color of a batch status chip.
   * @param status - Batch status.
   */
  protected toneOf(status) {
    return ({'on-hold': 'chip-warning', 'in-progress': 'chip-teal', 'release-requested': 'chip-success', released: 'chip-success'} as Record<string, string>)[status] ?? 'chip-neutral';
  }

  /**
   * Opens the batch typed in the lookup.
   */
  protected search(): void {
    const code = this.lookup.value.trim().toUpperCase();
    const found = this.store.batches().some(batch => batch.code === code);
    this.notFound.set(!found);
    if (found) this.router.navigate(['/production/batches', code]).then();
  }

  /**
   * Opens the create batch dialog and selects the new batch.
   */
  protected openCreate(): void {
    this.dialog.open(BatchForm, {width: '560px', maxWidth: 'calc(100vw - 32px)'})
      .afterClosed().subscribe(code => {
        if (code) this.selectedCode.set(code);
      });
  }
</script>

<style scoped>
.stat-label {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stat-value.teal { color: var(--teal); }
.stat-value.warn { color: var(--warning); }

.footnote {
  padding: 16px 20px;
}

.lookup .mat-mdc-form-field {
  width: 320px;
  max-width: 100%;
}

.not-found {
  color: var(--danger-dark);
  font-size: 13px;
}

.batch {
  gap: 8px;
}

.state {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 700;
  text-transform: uppercase;
}

.state .mat-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
}

.state-on-hold { background: var(--warning-bg); color: var(--warning); }
.state-in-progress, .state-planned { background: var(--mint); color: var(--teal); }
.state-release-requested, .state-released { background: var(--success-bg); color: var(--success); }

.batch h2 {
  font-size: 26px;
}

.label {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.label.danger {
  color: var(--danger);
}

</style>