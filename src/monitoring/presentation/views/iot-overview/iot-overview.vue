<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import TelemetryChart from "../../components/telemetry-chart.vue";
import useMonitoringStore from "../../../application/monitoring.store.js";

/**
 * IoT overview: sensors online, equipment health, the live chart of a sensor and the alert queue.
 */
const { t } = useI18n();
const store = useMonitoringStore();

/** Sensor shown in the live chart. */
const sensorCode = ref('T-204');
const sensorOptions = computed(() => store.onlineSensors.map(item => ({ label: `${item.code} · ${item.equipmentCode}`, value: item.code })));
const sensor = computed(() => store.sensorByCode(sensorCode.value));
/** Readings of the sensor shown. */
const readings = computed(() => store.readingsOf(sensorCode.value));
/** Last reading of the sensor shown. */
const lastReading = computed(() => readings.value.at(-1));
const openAlert = computed(() => sensor.value ? store.alertOfSensor(sensor.value.code) : undefined);
/** Number of active critical alerts. */
const criticalCount = computed(() => store.activeAlerts.filter(alert => alert.severity === 'critical').length);

/**
 * Color of the alert status chip.
 * @param {string} status - Alert status.
 * @returns {string} Chip class.
 */
const statusTone = (status) => ({
  open: 'chip-info', acknowledged: 'chip-teal', 'under-investigation': 'chip-purple', closed: 'chip-success'
})[status] ?? 'chip-neutral';
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.iot-overview')]"
                 :title="t('nav.iot-overview')" :subtitle="t('monitoring.overview.subtitle')">
      <pv-button as-child v-slot="slotProps">
        <router-link to="/production/incidents" :class="slotProps['class']">{{ t('monitoring.overview.view-alerts') }}</router-link>
      </pv-button>
    </page-header>

    <div class="stats">
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('monitoring.overview.sensors-online') }}</p>
          <p class="stat-value">{{ store.onlineSensors.length }} / {{ store.sensors.length }}</p>
          <p class="stat-note">{{ t('monitoring.overview.offline', { count: store.sensors.length - store.onlineSensors.length }) }}</p>
        </template>
      </pv-card>
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('monitoring.overview.equipment') }}</p>
          <p class="stat-value">{{ store.equipment.length }}</p>
          <p class="stat-note">{{ t('monitoring.overview.equipment-note') }}</p>
        </template>
      </pv-card>
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('monitoring.overview.active-alerts') }}</p>
          <p class="stat-value danger">{{ store.activeAlerts.length }}</p>
          <span class="chip chip-danger">{{ t('monitoring.overview.critical', { count: criticalCount }) }}</span>
        </template>
      </pv-card>
      <pv-card class="stat">
        <template #content>
          <p class="stat-label">{{ t('monitoring.overview.availability') }}</p>
          <p class="stat-value teal">99.8%</p>
          <p class="stat-note">{{ t('monitoring.overview.past-day') }}</p>
        </template>
      </pv-card>
    </div>

    <div class="columns">
      <div class="stack">
        <pv-card v-if="sensor" class="panel">
          <template #content>
            <div class="row justify-content-between">
              <h2>{{ sensor.equipmentCode }} · {{ t(`monitoring.type.${sensor.type}`) }}</h2>
              <pv-select v-model="sensorCode" :options="sensorOptions" option-label="label" option-value="value"
                         :aria-label="t('monitoring.equipment.sensor')"/>
            </div>
            <p class="muted">{{ sensor.code }} · {{ t('monitoring.range', { lower: sensor.lowerLimit, upper: sensor.upperLimit, unit: sensor.unit }) }}</p>
            <p v-if="lastReading" class="current" :class="{ out: store.isOutOfRange(lastReading) }">
              {{ lastReading.value }} {{ sensor.unit }} · {{ t(store.isOutOfRange(lastReading) ? 'monitoring.out-of-range' : 'monitoring.within-range') }}
              <span v-if="openAlert" class="alert-flag">{{ t('monitoring.alert-open') }} · {{ openAlert.code }}</span>
            </p>
            <telemetry-chart :readings="readings" :lower="sensor.lowerLimit" :upper="sensor.upperLimit" :unit="sensor.unit"
                             :label="`${sensor.code} · ${t(`monitoring.type.${sensor.type}`)}`" :empty-text="t('monitoring.no-data')"/>
            <router-link :to="`/production/sensors/${sensor.code}`">{{ t('monitoring.overview.sensor-detail') }} →</router-link>
          </template>
        </pv-card>

        <pv-card>
          <template #title>{{ t('monitoring.overview.alert-queue') }}</template>
          <template #content>
            <div class="alert mb-3" role="status">
              <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
              <strong>{{ t('monitoring.acknowledgment-rule') }}</strong>
            </div>
            <pv-data-table :value="store.activeAlerts" data-key="id" scrollable :aria-label="t('monitoring.overview.alert-queue')">
              <pv-column :header="t('monitoring.alert-sensor')">
                <template #body="{ data }">
                  <router-link :to="`/production/sensors/${data.sensorCode}`">{{ data.code }} · {{ data.sensorCode }}</router-link>
                </template>
              </pv-column>
              <pv-column field="equipmentCode" :header="t('monitoring.equipment-column')"/>
              <pv-column :header="t('monitoring.severity')">
                <template #body="{ data }">
                  <span class="chip" :class="data.severity === 'critical' ? 'chip-danger' : 'chip-warning'">{{ t(`monitoring.severity-level.${data.severity}`) }}</span>
                </template>
              </pv-column>
              <pv-column :header="t('monitoring.status')">
                <template #body="{ data }">
                  <span class="chip" :class="statusTone(data.status)">{{ t(`monitoring.alert-status.${data.status}`) }}</span>
                </template>
              </pv-column>
            </pv-data-table>
          </template>
        </pv-card>
      </div>

      <aside class="stack">
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('monitoring.overview.health') }}</h2>
            <router-link v-for="item in store.equipment" :key="item.id" class="health" :class="`health-${item.calibrationStatus}`"
                         to="/production/equipment">
              <strong>{{ item.code }} · {{ t(`monitoring.calibration.${item.calibrationStatus}`) }}</strong>
              <span>{{ item.healthNote }}</span>
            </router-link>
          </template>
        </pv-card>
        <pv-card class="panel">
          <template #content>
            <h2>{{ t('monitoring.overview.rules') }}</h2>
            <div class="rule teal"><strong>{{ t('monitoring.rules.threshold') }}</strong><span>{{ t('monitoring.rules.threshold-text') }}</span></div>
            <div class="rule blue"><strong>{{ t('monitoring.rules.offline') }}</strong><span>{{ t('monitoring.rules.offline-text') }}</span></div>
            <div class="rule yellow"><strong>{{ t('monitoring.rules.acknowledgment') }}</strong><span>{{ t('monitoring.rules.acknowledgment-text') }}</span></div>
          </template>
        </pv-card>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat .chip {
  align-self: flex-start;
}

.stat-note {
  color: var(--muted);
  font-size: 12px;
}

.stat-value.danger { color: var(--danger); }
.stat-value.teal { color: var(--teal); }

.current {
  color: var(--teal);
  font-weight: 600;
}

.current.out {
  color: var(--danger);
}

.alert-flag {
  margin-left: 16px;
  color: var(--danger);
}

.health {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-left: 4px solid #22c55e;
  border-radius: 6px;
  background: var(--gray-bg);
  color: var(--navy);
  font-weight: 400;
}

.health span {
  color: var(--slate);
  font-size: 13px;
}

.health-due { border-color: var(--warning-strong); background: #fef9c3; }
.health-not-fit { border-color: var(--danger); background: var(--danger-bg); }

.rule {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 13px;
}

.rule.teal { border-color: var(--teal); background: var(--mint); color: var(--teal); }
.rule.blue { border-color: #93c5fd; background: #eff6ff; color: var(--blue); }
.rule.yellow { border-color: var(--warning-strong); background: var(--warning-bg); color: #854d0e; }
</style>
