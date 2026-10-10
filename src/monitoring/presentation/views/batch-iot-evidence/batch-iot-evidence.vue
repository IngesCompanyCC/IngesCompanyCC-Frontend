<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import TelemetryChart from "../../components/telemetry-chart.vue";
import {formatDateTime} from "../../../../shared/presentation/format.js";
import useMonitoringStore from "../../../application/monitoring.store.js";
import useManufacturingStore from "../../../../manufacturing/application/manufacturing.store.js";

/**
 * IoT evidence of a batch: equipment association, the critical parameter chart and the readings recorded during the batch.
 */
const props = defineProps({
  /** Batch code from the route. */
  code: { type: String, required: true }
});

const { t, locale } = useI18n();
const store = useMonitoringStore();
const manufacturingStore = useManufacturingStore();

const batch = computed(() => manufacturingStore.batchByCode(props.code));
/** Reasons why the last association was rejected, by equipment code. */
const rejections = ref({});
/** Readings linked to the batch, newest first. */
const readings = computed(() => store.readingsOfBatch(props.code));
/** Whether every reading is listed, or only the latest ones. */
const showAll = ref(false);
/** Listed readings with their sensor and whether they are out of range. */
const evidenceRows = computed(() => (showAll.value ? readings.value : readings.value.slice(0, 8))
    .map(reading => ({ reading, sensor: store.sensorByCode(reading.sensorCode), outOfRange: store.isOutOfRange(reading) }))
    .filter(row => row.sensor));
/** Main sensor of the batch: the one of the latest reading. */
const mainSensor = computed(() => store.sensorByCode(readings.value[0]?.sensorCode));
/** Readings of the main sensor, oldest first. */
const mainReadings = computed(() => readings.value.filter(reading => reading.sensorCode === mainSensor.value?.code).reverse());
/** Open alert raised during the batch. */
const alert = computed(() => store.alerts.find(item => item.batchCode === props.code && item.status !== 'closed'));
/** Equipment shown for association: with sensors, or not fit for use. */
const candidates = computed(() => store.equipment.filter(item => store.sensorsOf(item.code).length || item.calibrationStatus === 'not-fit'));

/**
 * Whether a piece of equipment feeds this batch.
 * @param {string} equipmentCode - Code of the equipment.
 * @returns {boolean} True when one of its sensors is assigned to the batch.
 */
const isAssociated = (equipmentCode) => store.sensorsOf(equipmentCode).some(sensor => sensor.assignedBatch === props.code);

/**
 * Batch that is using the sensors of a piece of equipment, if it is another one.
 * @param {string} equipmentCode - Code of the equipment.
 * @returns {string|undefined} Code of the other batch.
 */
const busyWith = (equipmentCode) =>
    store.sensorsOf(equipmentCode).find(sensor => sensor.assignedBatch && sensor.assignedBatch !== props.code)?.assignedBatch;

/**
 * Codes of the sensors of a piece of equipment.
 * @param {string} equipmentCode - Code of the equipment.
 * @returns {string} Sensor codes separated by dots.
 */
const sensorCodes = (equipmentCode) => store.sensorsOf(equipmentCode).map(sensor => sensor.code).join(' · ') || '—';

/**
 * Associates a piece of equipment, or shows why it cannot be associated.
 * @param {string} equipmentCode - Code of the equipment.
 */
const associate = (equipmentCode) => {
  const reasons = store.validateAssociation(equipmentCode, props.code);
  rejections.value = { ...rejections.value, [equipmentCode]: reasons };
  if (!reasons.length) store.associateEquipment(equipmentCode, props.code);
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.batches'), code]"
                 :title="`${code} · ${t('monitoring.evidence.title')}`"
                 :subtitle="`${manufacturingStore.productByCode(batch?.productCode)?.name ?? ''} · ${batch?.orderCode ?? ''}`">
      <pv-button as-child v-slot="slotProps">
        <router-link :to="`/production/batches/${code}`" :class="slotProps['class']">{{ t('monitoring.evidence.batch-record') }}</router-link>
      </pv-button>
    </page-header>

    <div class="evidence-grid">
      <pv-card class="panel">
        <template #content>
          <h2>{{ t('monitoring.evidence.associate') }}</h2>
          <p class="small muted">{{ t('monitoring.evidence.associate-text') }}</p>
          <div v-for="item in candidates" :key="item.id" class="equipment" :class="{ associated: isAssociated(item.code) }">
            <strong>{{ item.code }} · {{ item.name }}</strong>
            <span class="small muted">{{ t('monitoring.evidence.sensors') }}: {{ sensorCodes(item.code) }}</span>
            <span v-if="isAssociated(item.code)" class="chip chip-dot chip-success">{{ t('monitoring.evidence.associated') }}</span>
            <span v-else-if="item.calibrationStatus === 'not-fit'" class="chip chip-dot chip-danger">{{ t('monitoring.calibration.not-fit') }}</span>
            <span v-else-if="busyWith(item.code)" class="chip chip-dot chip-danger">{{ t('monitoring.evidence.in-use', { batch: busyWith(item.code) }) }}</span>
            <pv-button v-if="!isAssociated(item.code)" :label="`+ ${t('monitoring.evidence.associate-button')}`" severity="secondary" outlined size="small"
                       @click="associate(item.code)"/>
            <small v-for="reason in rejections[item.code] ?? []" :key="reason" class="error" role="alert">
              {{ t(`monitoring.evidence.rejected.${reason}`, { code: item.code }) }}
            </small>
          </div>
        </template>
      </pv-card>

      <pv-card class="panel">
        <template #content>
          <template v-if="mainSensor">
            <h2>{{ t('monitoring.evidence.critical') }} · {{ mainSensor.equipmentCode }}</h2>
            <p class="small muted">
              {{ t(`monitoring.type.${mainSensor.type}`) }} {{ mainSensor.code }} ·
              {{ t('monitoring.range', { lower: mainSensor.lowerLimit, upper: mainSensor.upperLimit, unit: mainSensor.unit }) }}
            </p>
            <telemetry-chart :readings="mainReadings" :lower="mainSensor.lowerLimit" :upper="mainSensor.upperLimit" :unit="mainSensor.unit"
                             :label="`${mainSensor.code} · ${t(`monitoring.type.${mainSensor.type}`)}`" :empty-text="t('monitoring.no-data')"/>
            <p class="small muted">{{ t('monitoring.evidence.recorded') }}</p>
          </template>
          <template v-else>
            <h2>{{ t('monitoring.evidence.critical') }}</h2>
            <p class="muted empty">{{ t('monitoring.no-data') }}</p>
          </template>
        </template>
      </pv-card>
    </div>

    <pv-card>
      <template #title>{{ t('monitoring.evidence.readings') }}</template>
      <template #subtitle>{{ t('monitoring.evidence.readings-text') }}</template>
      <template #content>
        <pv-data-table :value="evidenceRows" :data-key="row => row.reading.id" scrollable :aria-label="t('monitoring.evidence.readings')"
                       :row-class="row => ({ highlight: row.outOfRange })">
          <pv-column :header="t('monitoring.evidence.timestamp')">
            <template #body="{ data }">{{ formatDateTime(data.reading.recordedAt, locale) }}</template>
          </pv-column>
          <pv-column :header="t('monitoring.equipment.sensor')">
            <template #body="{ data }">{{ data.sensor.code }}</template>
          </pv-column>
          <pv-column :header="t('monitoring.evidence.variable')">
            <template #body="{ data }">{{ t(`monitoring.type.${data.sensor.type}`) }}</template>
          </pv-column>
          <pv-column :header="t('monitoring.evidence.value')">
            <template #body="{ data }"><span :class="{ out: data.outOfRange }">{{ data.reading.value }} {{ data.sensor.unit }}</span></template>
          </pv-column>
          <pv-column :header="t('monitoring.equipment.limits')">
            <template #body="{ data }">{{ data.sensor.lowerLimit }}–{{ data.sensor.upperLimit }} {{ data.sensor.unit }}</template>
          </pv-column>
          <pv-column :header="t('monitoring.evidence.source')">
            <template #body="{ data }">{{ data.reading.source }}</template>
          </pv-column>
          <pv-column :header="t('monitoring.evidence.result')">
            <template #body="{ data }">
              <span class="chip chip-dot" :class="data.outOfRange ? 'chip-danger' : 'chip-success'">
                {{ t(data.outOfRange ? 'monitoring.evidence.out-alert' : 'monitoring.within-range') }}
              </span>
            </template>
          </pv-column>
          <template #empty><span class="muted">{{ t('monitoring.no-data') }}</span></template>
        </pv-data-table>
        <pv-button v-if="readings.length > 8" class="mt-3" severity="secondary" outlined
                   :label="t(showAll ? 'monitoring.evidence.show-latest' : 'monitoring.evidence.show-all', { count: readings.length })"
                   @click="showAll = !showAll"/>
      </template>
    </pv-card>

    <div v-if="alert" class="alert" role="status">
      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
      <strong class="flex-1">{{ alert.code }} · {{ alert.detail }}</strong>
      <pv-button as-child v-slot="slotProps">
        <router-link :to="`/production/sensors/${alert.sensorCode}`" :class="slotProps['class']">{{ t('monitoring.evidence.view-alert') }}</router-link>
      </pv-button>
    </div>
  </section>
</template>

<style scoped>
.evidence-grid {
  display: grid;
  grid-template-columns: minmax(0, 440px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.equipment {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.equipment.associated {
  border-color: var(--teal);
  background: var(--mint);
}

.out {
  color: var(--danger);
  font-weight: 700;
}

.empty {
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 1000px) {
  .evidence-grid {
    grid-template-columns: 1fr;
  }
}
</style>
