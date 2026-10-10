<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDateTime, formatNumber} from "../../../../shared/presentation/format.js";
import useManufacturingStore from "../../../application/manufacturing.store.js";

/**
 * Batch genealogy from the input lots to the finished goods, with the status history of the batch.
 */
const props = defineProps({
  /** Batch code from the route. */
  code: { type: String, required: true }
});

const { t, locale } = useI18n();
const store = useManufacturingStore();

const batch = computed(() => store.batchByCode(props.code));
const product = computed(() => store.productByCode(batch.value?.productCode));
const order = computed(() => store.orderByCode(batch.value?.orderCode));
/** Master formula of the order. */
const formula = computed(() => store.formulas.find(item => item.id === order.value?.formulaId));
/** Input lots allocated to the batch. */
const lots = computed(() => store.lotsOfBatch(props.code));
/** Operations of the order, summarized as a flow. */
const operations = computed(() => order.value ? store.operationsOfOrder(order.value.id) : []);
/** Status history of the batch. */
const events = computed(() => store.eventsOfBatch(props.code));
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('manufacturing.detail.title')]"
                 :title="t('manufacturing.detail.title')"
                 :subtitle="`${code} · ${product?.name ?? ''} · ${t('manufacturing.detail.subtitle')}`">
      <pv-button as-child v-slot="slotProps" severity="secondary" outlined>
        <router-link to="/production/batches" :class="slotProps['class']">← {{ t('nav.batches') }}</router-link>
      </pv-button>
    </page-header>

    <div v-if="batch" class="columns">
      <pv-card class="genealogy">
        <template #content>
          <h2>{{ t('manufacturing.detail.genealogy') }}</h2>
          <p class="label">{{ t('manufacturing.detail.input-lots') }}</p>
          <div class="lots">
            <div v-for="lot in lots" :key="lot.id" class="node">
              <strong>{{ lot.code }}</strong>
              <span>{{ t(`manufacturing.category.${lot.category}`) }} · {{ lot.material }}</span>
            </div>
            <p v-if="!lots.length" class="muted">{{ t('manufacturing.detail.no-lots') }}</p>
          </div>
          <span class="arrow" aria-hidden="true">↓</span>
          <template v-if="order">
            <router-link class="node order" :to="`/production/orders/${order.code}`">
              <strong>{{ order.code }} · MFR-{{ order.productCode }} {{ formula?.version }}</strong>
              <span>{{ t('manufacturing.detail.allocated') }}</span>
            </router-link>
            <span class="arrow" aria-hidden="true">↓</span>
          </template>
          <div class="node batch">
            <div>
              <strong class="batch-code">{{ batch.code }} · {{ product?.name }}</strong>
              <p class="flow">
                <template v-for="(operation, index) in operations" :key="operation.id">
                  {{ operation.name }} {{ t(`manufacturing.operation-status.${operation.status}`) }}<template v-if="index < operations.length - 1"> → </template>
                </template>
              </p>
              <span class="small">{{ t('manufacturing.detail.target', { quantity: formatNumber(batch.quantity, locale), line: batch.line, owner: batch.owner }) }}</span>
            </div>
            <div class="batch-state">
              <span class="chip">{{ t(`manufacturing.batch-status.${batch.status}`) }}</span>
              <pv-progress-bar :value="batch.progress" :show-value="false" class="progress" :aria-label="t('manufacturing.orders.progress')"/>
              <span class="small">{{ batch.progress }}%</span>
            </div>
          </div>
          <span class="arrow" aria-hidden="true">↓</span>
          <div class="node finished">
            FG-{{ batch.code.slice(2) }} ·
            {{ t(batch.status === 'released' ? 'manufacturing.detail.fg-released' : 'manufacturing.detail.fg-pending') }}
          </div>
        </template>
      </pv-card>

      <pv-card class="history">
        <template #content>
          <h2>{{ t('manufacturing.detail.history') }}</h2>
          <ol>
            <li v-for="event in events" :key="event.id" :class="event.tone">
              <strong>{{ event.title }}</strong>
              <span>{{ formatDateTime(event.occurredAt, locale) }} · {{ event.detail }}</span>
            </li>
            <li v-if="!events.length" class="muted">{{ t('manufacturing.detail.no-history') }}</li>
          </ol>
        </template>
      </pv-card>
    </div>
    <p v-else-if="!store.loading" class="muted">{{ t('manufacturing.batches.not-found') }}</p>
  </section>
</template>

<style scoped>
.genealogy :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.history :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.progress {
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

.history .warning strong { color: var(--warning); }
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

  .order {
    min-width: 0;
  }
}
</style>
