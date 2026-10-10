<script setup>
import {computed, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDateTime, formatNumber} from "../../../../shared/presentation/format.js";
import useManufacturingStore from "../../../application/manufacturing.store.js";
import BatchForm from "../batch-form/batch-form.vue";

/**
 * Batch list with status counts, a summary of the selected batch, a lookup and the "create batch" dialog.
 */
const { t, locale } = useI18n();
const router = useRouter();
const store = useManufacturingStore();

/** Filter tabs. */
const filters = ['all', 'in-progress', 'on-hold', 'released'];
const filterOptions = computed(() => filters.map(value => ({ value, label: t(`manufacturing.batches.tab.${value}`) })));
const filter = ref('all');

/** Code of the batch shown in the side panel. */
const selectedCode = ref('B-26041');
const createVisible = ref(false);

/** Batches that match the filter, newest code first. */
const visibleBatches = computed(() => [...store.batches]
    .filter(batch => filter.value === 'all' || batch.status === filter.value)
    .sort((a, b) => b.code.localeCompare(a.code)));

/** Batch shown in the side panel. */
const selected = computed(() => store.batchByCode(selectedCode.value));

/** Batch lookup code. */
const lookup = ref('B-26041');
/** Whether the lookup found nothing. */
const notFound = ref(false);

/**
 * Color of a batch status chip.
 * @param {string} status - Batch status.
 * @returns {string} Chip class.
 */
const toneOf = (status) => ({
  'on-hold': 'chip-warning', 'in-progress': 'chip-teal', 'release-requested': 'chip-success', released: 'chip-success'
})[status] ?? 'chip-neutral';

/** Opens the batch typed in the lookup. */
const search = () => {
  const code = lookup.value.trim().toUpperCase();
  notFound.value = !store.batchByCode(code);
  if (!notFound.value) router.push(`/production/batches/${code}`);
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.batches')]"
                 :title="t('nav.batches')" :subtitle="t('manufacturing.batches.subtitle')">
      <pv-button icon="pi pi-plus" :label="t('manufacturing.batches.create')" @click="createVisible = true"/>
    </page-header>

    <pv-card class="summary">
      <template #content>
        <div><p class="stat-label">{{ t('manufacturing.batch-status.in-progress') }}</p><p class="stat-value teal">{{ store.batchCounts['in-progress'] ?? 0 }}</p></div>
        <div><p class="stat-label">{{ t('manufacturing.batch-status.on-hold') }}</p><p class="stat-value warn">{{ store.batchCounts['on-hold'] ?? 0 }}</p></div>
        <div><p class="stat-label">{{ t('manufacturing.batch-status.release-requested') }}</p><p class="stat-value teal">{{ store.batchCounts['release-requested'] ?? 0 }}</p></div>
        <div><p class="stat-label">{{ t('manufacturing.batch-status.released') }}</p><p class="stat-value teal">{{ store.batchCounts['released'] ?? 0 }}</p></div>
      </template>
    </pv-card>

    <pv-select-button v-model="filter" :options="filterOptions" option-label="label" option-value="value"
                      :allow-empty="false" :aria-label="t('shell.filters')" class="filters"/>

    <div class="columns">
      <div class="stack">
        <pv-card>
          <template #content>
            <pv-data-table :value="visibleBatches" data-key="id" scrollable :aria-label="t('nav.batches')"
                           :row-class="batch => ({ highlight: batch.code === selectedCode })"
                           row-hover @row-click="event => selectedCode = event.data.code">
              <pv-column :header="t('manufacturing.batches.batch-product')">
                <template #body="{ data }">
                  <router-link :to="`/production/batches/${data.code}`" @click.stop>{{ data.code }}</router-link>
                  <span class="sub">{{ data.productCode }}</span>
                </template>
              </pv-column>
              <pv-column :header="t('manufacturing.batches.order-quantity')">
                <template #body="{ data }">
                  {{ data.orderCode }}
                  <span class="sub">{{ formatNumber(data.quantity, locale) }} {{ t('manufacturing.units') }}</span>
                </template>
              </pv-column>
              <pv-column field="owner" :header="t('manufacturing.batches.owner')"/>
              <pv-column :header="t('manufacturing.products.status')">
                <template #body="{ data }">
                  <span class="chip" :class="toneOf(data.status)">{{ t(`manufacturing.batch-status.${data.status}`) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
            <p class="footnote small muted">{{ t('manufacturing.batches.showing', { shown: visibleBatches.length, total: store.batches.length }) }}</p>
          </template>
        </pv-card>

        <pv-card class="panel">
          <template #content>
            <div>
              <h2>{{ t('manufacturing.batches.lookup') }}</h2>
              <p class="sub">{{ t('manufacturing.batches.lookup-text') }}</p>
            </div>
            <div class="row">
              <pv-input-text v-model="lookup" class="lookup" :aria-label="t('manufacturing.batches.lookup')" @keyup.enter="search"/>
              <pv-button :label="t('manufacturing.batches.search')" @click="search"/>
            </div>
            <p v-if="notFound" class="not-found" role="alert">{{ t('manufacturing.batches.not-found') }}</p>
          </template>
        </pv-card>
      </div>

      <aside class="stack">
        <pv-card v-if="selected" class="panel batch">
          <template #content>
            <p class="state" :class="`state-${selected.status}`">
              <i v-if="selected.status === 'on-hold'" class="pi pi-exclamation-triangle" aria-hidden="true"></i>
              {{ t(`manufacturing.batch-status.${selected.status}`) }}
            </p>
            <h2>{{ selected.code }}</h2>
            <p class="muted">{{ store.productByCode(selected.productCode)?.name }}</p>
            <p class="muted">{{ formatNumber(selected.quantity, locale) }} {{ t('manufacturing.units') }} · {{ selected.line }}</p>
            <template v-if="selected.incident">
              <p class="label danger">{{ t('manufacturing.batches.incident') }}</p>
              <p>{{ selected.incident }}</p>
            </template>
            <p class="label">{{ t('manufacturing.batches.last-activity') }}</p>
            <p>{{ formatDateTime(selected.lastActivityAt, locale) }} UTC</p>
            <p class="muted">{{ selected.lastActivity }}</p>
            <router-link :to="`/production/batches/${selected.code}`">{{ t('manufacturing.batches.view-genealogy') }} →</router-link>
          </template>
        </pv-card>
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('manufacturing.batches.definitions') }}</h2>
            <div>
              <strong>{{ t('manufacturing.batches.definition-hold') }}</strong>
              <p class="sub">{{ t('manufacturing.batches.definition-hold-text') }}</p>
            </div>
            <div>
              <strong>{{ t('manufacturing.batches.definition-release') }}</strong>
              <p class="sub">{{ t('manufacturing.batches.definition-release-text') }}</p>
            </div>
          </template>
        </pv-card>
      </aside>
    </div>

    <batch-form v-model:visible="createVisible" @created="code => selectedCode = code"/>
  </section>
</template>

<style scoped>
.stat-value.teal { color: var(--teal); }
.stat-value.warn { color: var(--warning); }

.filters {
  align-self: flex-start;
  flex-wrap: wrap;
}

.footnote {
  padding: 16px 4px 0;
}

.lookup {
  width: 320px;
  max-width: 100%;
}

.not-found {
  color: var(--danger-dark);
  font-size: 13px;
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

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
