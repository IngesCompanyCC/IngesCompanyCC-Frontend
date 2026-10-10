<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDateTime, formatTime} from "../../../../shared/presentation/format.js";
import useQualityStore from "../../../application/quality.store.js";

/**
 * Audit trail shared by every environment: attributed events with filters, the selected change and a CSV export.
 */
const { t, locale } = useI18n();
const store = useQualityStore();

/** Record and actor filters. */
const recordFilter = ref('');
const actorFilter = ref('');
/** Events that match the filters. */
const visible = computed(() => store.events.filter(event =>
    event.record.toLowerCase().includes(recordFilter.value.toLowerCase())
    && event.actor.toLowerCase().includes(actorFilter.value.toLowerCase())));
/** Code of the selected event. */
const selectedCode = ref(null);
/** Selected event: the chosen one or the first with a field change. */
const selected = computed(() => visible.value.find(event => event.eventCode === selectedCode.value) ?? visible.value.find(event => event.field));
/** Distinct actors, for the actor filter. */
const actorOptions = computed(() => [
  { label: t('quality.trail.all-actors'), value: '' },
  ...[...new Set(store.events.map(event => event.actor))].map(actor => ({ label: actor, value: actor }))
]);

/** Downloads the filtered events as CSV and records the export in the audit trail. */
const exportCsv = () => {
  const header = 'event,utc,actor,role,event_type,record,result';
  const rows = visible.value.map(e => [e.eventCode, e.occurredAt, e.actor, e.actorRole, e.event, e.record, e.result]
      .map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));
  const url = URL.createObjectURL(new Blob([[header, ...rows].join('\n')], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  store.log('Audit trail exported', `${visible.value.length} events`, 'Exported');
};

/** Clears the filters. */
const clearFilters = () => {
  recordFilter.value = '';
  actorFilter.value = '';
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('nav.audit-trail')]" :title="t('nav.audit-trail')" :subtitle="t('quality.trail.subtitle')">
      <pv-button icon="pi pi-download" :label="t('quality.trail.export')" @click="exportCsv"/>
    </page-header>

    <pv-card>
      <template #content>
        <div class="filters">
          <pv-icon-field>
            <pv-input-icon class="pi pi-search"/>
            <pv-input-text v-model="recordFilter" type="search" :placeholder="t('quality.trail.record-filter')" :aria-label="t('quality.trail.record-filter')"/>
          </pv-icon-field>
          <pv-select v-model="actorFilter" :options="actorOptions" option-label="label" option-value="value" :aria-label="t('quality.trail.all-actors')"/>
          <pv-button :label="t('quality.trail.clear')" severity="secondary" outlined @click="clearFilters"/>
          <span class="muted small ml-auto">UTC</span>
        </div>
      </template>
    </pv-card>

    <pv-card>
      <template #title>
        <div class="row justify-content-between">
          <span>{{ t('quality.trail.log') }}</span>
          <span class="chip chip-teal">{{ t('quality.trail.events', { count: visible.length }) }}</span>
        </div>
      </template>
      <template #content>
        <pv-data-table :value="visible" data-key="id" scrollable row-hover :aria-label="t('quality.trail.log')"
                       :row-class="event => ({ blocked: event.result === 'Blocked', highlight: event.eventCode === selected?.eventCode })"
                       @row-click="event => selectedCode = event.data.eventCode">
          <pv-column header="UTC">
            <template #body="{ data }">{{ formatDateTime(data.occurredAt, locale) }}</template>
          </pv-column>
          <pv-column :header="t('quality.trail.actor')">
            <template #body="{ data }"><strong>{{ data.actor }}</strong><span class="sub">{{ t(`roles.${data.actorRole}`) }}</span></template>
          </pv-column>
          <pv-column field="event" :header="t('quality.trail.event')"/>
          <pv-column :header="t('quality.trail.record')">
            <template #body="{ data }"><span class="code">{{ data.record }}</span></template>
          </pv-column>
          <pv-column :header="t('quality.trail.result')">
            <template #body="{ data }"><span class="chip" :class="data.result === 'Blocked' ? 'chip-danger' : 'chip-teal'">{{ data.result }}</span></template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <div v-if="selected" class="columns">
      <pv-card>
        <template #title>{{ t('quality.trail.selected') }} · {{ selected.event }}</template>
        <template #subtitle>{{ selected.eventCode }} · {{ formatTime(selected.occurredAt, locale) }} UTC</template>
        <template #content>
          <pv-data-table :value="[selected]" data-key="id" scrollable :aria-label="t('quality.trail.selected')">
            <pv-column :header="t('quality.trail.field')"><template #body="{ data }">{{ data.field || '—' }}</template></pv-column>
            <pv-column :header="t('quality.trail.before')"><template #body="{ data }">{{ data.before || '—' }}</template></pv-column>
            <pv-column :header="t('quality.trail.after')"><template #body="{ data }">{{ data.after || '—' }}</template></pv-column>
            <pv-column :header="t('quality.trail.reason')"><template #body="{ data }">{{ data.reason || '—' }}</template></pv-column>
          </pv-data-table>
        </template>
      </pv-card>
      <pv-card class="panel">
        <template #content>
          <h2>{{ t('quality.trail.provenance') }}</h2>
          <span class="chip chip-teal align-self-start">{{ t('quality.trail.immutable') }}</span>
          <p class="label">{{ t('quality.trail.event-id') }}</p>
          <p>{{ selected.eventCode }} · {{ formatDateTime(selected.occurredAt, locale) }} UTC</p>
          <p class="label">{{ t('quality.trail.retention') }}</p>
          <p class="small muted">{{ t('quality.trail.retention-text') }}</p>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.code {
  color: var(--teal);
  font-weight: 600;
}

.label {
  color: var(--slate);
  font-size: 12px;
  font-weight: 700;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(tr.blocked > td) {
  background: var(--danger-bg);
}
</style>
