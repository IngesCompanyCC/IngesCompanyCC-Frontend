<template>
<section class="page">
  <app-page-header
    [breadcrumb]="['shell.workspace' | translate, 'environments.production.short' | translate, 'manufacturing.detail.title' | translate]"
    [title]="'manufacturing.detail.title' | translate"
    [subtitle]="code() + ' · ' + (product()?.name ?? '') + ' · ' + ('manufacturing.detail.subtitle' | translate)">
    <a mat-stroked-button routerLink="/production/batches">← {{ 'nav.batches' | translate }}</a>
    <a mat-flat-button [routerLink]="['/production/batches', code(), 'iot']">{{ 'manufacturing.detail.iot-evidence' | translate }}</a>
  </app-page-header>

  @if (batch(); as current) {
    <div class="columns">
      <div class="stack">
        <mat-card appearance="outlined" class="panel genealogy">
          <h2>{{ 'manufacturing.detail.genealogy' | translate }}</h2>
          <p class="label">{{ 'manufacturing.detail.input-lots' | translate }}</p>
          <div class="lots">
            @for (lot of lots(); track lot.id) {
              <div class="node lot">
                <strong>{{ lot.code }}</strong>
                <span>{{ 'manufacturing.category.' + lot.category | translate }} · {{ lot.material }}</span>
              </div>
            } @empty {
              <p class="muted">{{ 'manufacturing.detail.no-lots' | translate }}</p>
            }
          </div>
          <span class="arrow">↓</span>
          @if (order(); as po) {
            <a class="node order" [routerLink]="['/production/orders', po.code]">
              <strong>{{ po.code }} · MFR-{{ po.productCode }} {{ formula()?.version }}</strong>
              <span>{{ 'manufacturing.detail.allocated' | translate }}</span>
            </a>
            <span class="arrow">↓</span>
          }
          <div class="node batch">
            <div>
              <strong class="batch-code">{{ current.code }} · {{ product()?.name }}</strong>
              <p class="flow">
                @for (operation of operations(); track operation.id; let last = $last) {
                  {{ operation.name }} {{ 'manufacturing.operation-status.' + operation.status | translate }}@if (!last) { → }
                }
              </p>
              <span class="small">{{ 'manufacturing.detail.target' | translate: {quantity: (current.quantity | number), line: current.line, owner: current.owner} }}</span>
            </div>
            <div class="batch-state">
              <span class="chip" [class]="current.status === 'on-hold' ? 'chip-warning' : 'chip-teal'">{{ 'manufacturing.batch-status.' + current.status | translate }}</span>
              <mat-progress-bar mode="determinate" [value]="current.progress"/>
              <span class="small">{{ current.progress }}%</span>
            </div>
          </div>
          <span class="arrow">↓</span>
          <div class="node finished">
            FG-{{ current.code.slice(2) }} ·
            {{ (current.status === 'released' ? 'manufacturing.detail.fg-released' : 'manufacturing.detail.fg-pending') | translate }}
          </div>
        </mat-card>
      </div>

      <aside class="stack">
        <mat-card appearance="outlined" class="panel history">
          <h2>{{ 'manufacturing.detail.history' | translate }}</h2>
          <ol>
            @for (event of events(); track event.id) {
              <li [class]="event.tone">
                <strong>{{ event.title }}</strong>
                <span>{{ event.occurredAt | date: 'MMM dd, HH:mm' : 'UTC' }} · {{ event.detail }}</span>
              </li>
            } @empty {
              <li class="muted">{{ 'manufacturing.detail.no-history' | translate }}</li>
            }
          </ol>
        </mat-card>
      </aside>
    </div>
  } @else {
    <p class="muted">{{ 'manufacturing.batches.not-found' | translate }}</p>
  }
</section>

</template>

<script setup>
/**
 * Batch detail: material-to-finished-goods genealogy and status history.
 */


  protected store = inject(ManufacturingStore);

  /**
   * Batch code from the route.
   */
  code = input.required<string>();

  /**
   * The batch.
   */
  protected batch = computed(() => this.store.batches().find(batch => batch.code === this.code()));

  /**
   * Product of the batch.
   */
  protected product = computed(() => this.store.products().find(product => product.code === this.batch()?.productCode));

  /**
   * Production order of the batch.
   */
  protected order = computed(() => this.store.orders().find(order => order.code === this.batch()?.orderCode));

  /**
   * Master formula of the order.
   */
  protected formula = computed(() => this.store.formulas().find(formula => formula.id === this.order()?.formulaId));

  /**
   * Input lots allocated to the batch.
   */
  protected lots = computed(() => this.store.materialLots().filter(lot => lot.allocatedBatch === this.code()));

  /**
   * Operations of the order, summarized as a flow.
   */
  protected operations = computed(() => {
    const order = this.order();
    return order ? this.store.operationsOfOrder(order.id)() : [];
  });

  /**
   * Status history of the batch.
   */
  protected events = computed(() => this.store.eventsOfBatch(this.code())());
</script>

<style scoped>
.genealogy,
.history {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
}

.genealogy {
  align-items: center;
}

.genealogy h2,
.label {
  align-self: flex-start;
}

.label {
  color: var(--slate);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.lots {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

.node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--teal);
  border-radius: 6px;
  background: var(--mint);
}

.node strong {
  color: var(--teal);
}

.node span {
  color: var(--slate);
  font-size: 13px;
}

.order {
  min-width: 300px;
}

.order:hover {
  text-decoration: none;
}

.batch {
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  border: 0;
  background: var(--navy);
  color: #fff;
}

.batch .batch-code {
  color: #2dd4bf;
}

.batch span,
.flow {
  color: #fff;
}

.flow {
  margin: 8px 0 6px;
}

.batch-state {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 90px;
}

.batch-state .chip {
  background: var(--warning-strong);
  color: var(--navy);
}

.batch-state .progress {
  width: 90px;
  height: 8px;
}

.finished {
  border-style: dashed;
  border-color: var(--slate);
  background: #fff;
  color: var(--slate);
  font-size: 13px;
}

.arrow {
  color: var(--teal);
}

.history ol {
  margin: 8px 0 0;
  padding: 0 0 0 18px;
  border-left: 2px solid var(--border);
  list-style: none;
}

.history li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 0 22px 8px;
}

.history li::before {
  content: "";
  position: absolute;
  top: 4px;
  left: -25px;
  width: 10px;
  height: 14px;
  border-radius: 4px;
  background: var(--teal);
}

.history li span {
  color: var(--muted);
  font-size: 13px;
}

.history .warning strong { color: #b45309; }
.history .warning::before { background: var(--warning-strong); }
.history .danger strong { color: var(--danger); }
.history .danger::before { background: var(--danger); }

@media (max-width: 700px) {
  .lots {
    grid-template-columns: 1fr;
  }

  .batch {
    flex-direction: column;
  }
}

</style>