<script setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import TelemetryChart from "../../components/telemetry-chart.vue";
import {formatDate, formatDateTime, formatTime} from "../../../../shared/presentation/format.js";
import useMonitoringStore from "../../../application/monitoring.store.js";
import useIamStore from "../../../../iam/application/iam.store.js";

/**
 * Sensor detail: telemetry with its acceptable range, the acknowledgment of its open alert and the equipment calibration.
 */
const props = defineProps({
  /** Sensor code from the route. */
  code: { type: String, required: true }
});

const { t, locale } = useI18n();
const store = useMonitoringStore();
const iamStore = useIamStore();

const sensor = computed(() => store.sensorByCode(props.code));
/** Equipment where the sensor is installed. */
const equipment = computed(() => store.equipmentByCode(sensor.value?.equipmentCode));
const readings = computed(() => store.readingsOf(props.code));
/** Open alert of the sensor. */
const alert = computed(() => store.alertOfSensor(props.code));
const lastReading = computed(() => readings.value.at(-1));

/** Response note of the acknowledgment. */
const note = ref('');
const noteTouched = ref(false);
/** Whether the note was saved and not changed since. */
const saved = ref(false);
const noteError = computed(() => noteTouched.value && !note.value.trim());

/** Fills the note with the saved response. */
watch(alert, current => {
  if (current && !noteTouched.value) note.value = current.responseNote;
}, { immediate: true });

/** Saves the response note and acknowledges the alert. */
const saveNote = () => {
  if (!alert.value) return;
  noteTouched.value = true;
  if (noteError.value) return;
  store.acknowledgeAlert(alert.value, note.value.trim(), iamStore.currentUser?.fullName ?? '').then(() => saved.value = true);
};
</script>

<template>
  <section class="page">
    <template v-if="sensor">
      <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('monitoring.detail.title')]"
                   :title="t('monitoring.detail.title')"
                   :subtitle="`${sensor.equipmentCode} · ${equipment?.name ?? ''} · ${t('monitoring.detail.sensor')} ${sensor.code} · ${equipment?.location ?? ''}`">
        <pv-button as-child v-slot="slotProps" severity="secondary" outlined>
          <router-link to="/production/equipment" :class="slotProps['class']">← {{ t('nav.equipment-sensors') }}</router-link>
        </pv-button>
      </page-header>

      <div v-if="alert" class="alert critical" role="status">
        <div class="flex-1">
          <p class="severity">{{ t(`monitoring.severity-level.${alert.severity}`) }}</p>
          <strong>{{ alert.code }} · {{ alert.title }}</strong>
          <p>{{ alert.detail }}</p>
        </div>
        <span class="chip" :class="alert.status === 'open' ? 'chip-info' : 'chip-teal'">{{ t(`monitoring.alert-status.${alert.status}`) }}</span>
      </div>

      <div class="columns">
        <div class="stack">
          <pv-card class="panel">
            <template #content>
              <h2>{{ sensor.code }} · {{ t('monitoring.detail.telemetry', { type: t(`monitoring.type.${sensor.type}`) }) }}</h2>
              <p v-if="lastReading" class="current" :class="{ out: store.isOutOfRange(lastReading) }">
                {{ lastReading.value }} {{ sensor.unit }} · {{ t(store.isOutOfRange(lastReading) ? 'monitoring.out-of-range' : 'monitoring.within-range') }}
                <span class="muted small">· {{ t('monitoring.detail.last-reading') }} {{ formatTime(lastReading.recordedAt, locale) }} UTC</span>
              </p>
              <p v-if="alert" class="small danger">{{ t('monitoring.detail.remains-open', { code: alert.code }) }}</p>
              <telemetry-chart :readings="readings" :lower="sensor.lowerLimit" :upper="sensor.upperLimit" :unit="sensor.unit"
                               :label="`${sensor.code} · ${t(`monitoring.type.${sensor.type}`)}`" :empty-text="t('monitoring.no-data')"/>
            </template>
          </pv-card>

          <pv-card v-if="alert" class="panel">
            <template #content>
              <h2>{{ t('monitoring.detail.acknowledgment') }}</h2>
              <template v-if="alert.acknowledgedBy">
                <p class="label">{{ t('monitoring.detail.acknowledged-by') }}</p>
                <p>{{ alert.acknowledgedBy }} · {{ formatDateTime(alert.acknowledgedAt, locale) }} UTC</p>
              </template>
              <div class="field">
                <label for="response-note">{{ t('monitoring.detail.response-note') }} *</label>
                <pv-textarea id="response-note" v-model="note" rows="3" fluid :invalid="noteError" @input="saved = false"/>
                <small class="muted">{{ t('monitoring.detail.response-hint') }}</small>
              </div>
              <template v-if="alert.linkedRecord">
                <p class="label">{{ t('monitoring.detail.linked') }}</p>
                <p class="link-text">{{ alert.linkedRecord }}</p>
              </template>
              <div class="row">
                <pv-button :label="t(alert.status === 'open' ? 'monitoring.detail.acknowledge' : 'monitoring.detail.save-note')" @click="saveNote"/>
                <span v-if="saved" class="chip chip-success" role="status">{{ t('monitoring.detail.saved') }}</span>
              </div>
            </template>
          </pv-card>
        </div>

        <aside class="stack">
          <pv-card v-if="equipment" class="panel">
            <template #content>
              <h2>{{ t('monitoring.detail.equipment-calibration') }}</h2>
              <p class="label">{{ t('monitoring.detail.asset') }}</p>
              <p>{{ equipment.code }} · {{ equipment.name }} · {{ equipment.location }}</p>
              <p class="label">{{ t('monitoring.detail.sensor') }} {{ sensor.code }}</p>
              <p>{{ t(`monitoring.type.${sensor.type}`) }} · {{ sensor.unit }} · <span class="mono">{{ sensor.deviceId }}</span></p>
              <p class="label">{{ t('monitoring.equipment.calibration-due') }}</p>
              <p>
                {{ formatDate(equipment.calibrationDue, locale) }}
                <span class="chip" :class="equipment.calibrationStatus === 'fit' ? 'chip-success' : 'chip-warning'">{{ t(`monitoring.calibration.${equipment.calibrationStatus}`) }}</span>
              </p>
              <p class="muted">{{ equipment.certificate }}</p>
              <p class="label">{{ t('monitoring.detail.maintenance-owner') }}</p>
              <p>{{ equipment.maintenanceOwner }}<template v-if="equipment.workOrder"> · {{ equipment.workOrder }}</template></p>
            </template>
          </pv-card>
          <pv-card v-if="alert" class="panel">
            <template #content>
              <h2>{{ t('monitoring.detail.workflow') }}</h2>
              <ol class="workflow">
                <li class="done">{{ t('monitoring.detail.step-threshold') }}</li>
                <li :class="{ done: alert.status !== 'open' }">{{ t('monitoring.detail.step-acknowledged') }}</li>
                <li :class="{ done: !!alert.linkedRecord }">{{ t('monitoring.detail.step-investigation') }}</li>
                <li :class="{ done: alert.status === 'closed' }">{{ t('monitoring.detail.step-disposition') }}</li>
              </ol>
              <p class="small note">{{ t('monitoring.rules.acknowledgment-text') }}</p>
            </template>
          </pv-card>
        </aside>
      </div>
    </template>
    <p v-else-if="!store.loading" class="muted">{{ t('monitoring.detail.not-found') }}</p>
  </section>
</template>

<style scoped>
.critical {
  border-left: 4px solid var(--warning-strong);
  color: var(--navy);
}

.severity {
  color: var(--danger);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.current {
  color: var(--teal);
  font-weight: 600;
}

.current.out,
.danger {
  color: var(--danger);
}

.label {
  margin-top: 6px;
  color: var(--slate);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.mono {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12px;
}

.link-text {
  color: var(--teal);
  font-weight: 600;
  text-decoration: underline;
}

.workflow {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}

.workflow li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--slate);
  counter-increment: step;
}

.workflow li::before {
  content: counter(step);
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--warning-strong);
  color: var(--navy);
  font-size: 12px;
  font-weight: 700;
}

.workflow li.done {
  color: var(--navy);
  font-weight: 600;
}

.workflow li.done::before {
  content: "✓";
  background: #22c55e;
  color: #fff;
}

.note {
  padding: 12px;
  border-radius: 6px;
  background: var(--mint);
  color: var(--teal);
}
</style>
