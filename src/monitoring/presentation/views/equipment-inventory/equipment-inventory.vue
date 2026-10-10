<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import PageHeader from "../../../../shared/presentation/components/page-header.vue";
import {formatDate} from "../../../../shared/presentation/format.js";
import useMonitoringStore from "../../../application/monitoring.store.js";
import {Sensor} from "../../../domain/model/sensor.entity.js";

/**
 * Equipment inventory, the IoT sensors of the selected equipment, sensor registration,
 * and the calibration and preventive maintenance of equipment that needs attention.
 */
const { t, locale } = useI18n();
const store = useMonitoringStore();

/** Unit, limits and code prefix of each sensor type. */
const sensorTypes = {
  temperature: { unit: '°C', lower: 18, upper: 25, prefix: 'T' },
  humidity: { unit: '%RH', lower: 0, upper: 55, prefix: 'H' },
  pressure: { unit: 'Pa', lower: 10, upper: 15, prefix: 'P' }
};
const typeOptions = computed(() => Object.keys(sensorTypes).map(value => ({ label: t(`monitoring.type.${value}`), value })));
const equipmentOptions = computed(() => store.equipment.map(item => ({ label: `${item.code} · ${item.name}`, value: item.code })));

/** Equipment whose sensors are shown. */
const selectedCode = ref('EQ-COAT-02');
const sensors = computed(() => store.sensorsOf(selectedCode.value));
/** First piece of equipment that is not fit for use, shown in the calibration and maintenance cards. */
const attention = computed(() => store.equipment.find(item => item.calibrationStatus === 'not-fit')
    ?? store.equipment.find(item => item.calibrationStatus === 'due'));

const deviceId = ref('');
const type = ref('temperature');
const equipmentCode = ref('EQ-COAT-02');
/** Whether the form was submitted once, to show the validation messages. */
const submitted = ref(false);
/** Whether the device ID entered is already registered. */
const duplicateDevice = ref(false);
const deviceError = computed(() => submitted.value && !/^tb-[\w-]+$/.test(deviceId.value.trim()));

/**
 * Color of a calibration status chip.
 * @param {string} status - Calibration status.
 * @returns {string} Chip class.
 */
const calibrationTone = (status) => status === 'fit' ? 'chip-success' : status === 'due' ? 'chip-warning' : 'chip-danger';

/** Registers the sensor when the ThingsBoard device ID is new. */
const registerSensor = () => {
  submitted.value = true;
  if (deviceError.value) return;
  const settings = sensorTypes[type.value];
  const added = store.addSensor(new Sensor({
    code: `${settings.prefix}-${100 + store.sensors.length + 1}`, deviceId: deviceId.value.trim(), type: type.value, unit: settings.unit,
    equipmentCode: equipmentCode.value, lowerLimit: settings.lower, upperLimit: settings.upper, status: 'active', assignedBatch: ''
  }));
  duplicateDevice.value = !added;
  if (!added) return;
  selectedCode.value = equipmentCode.value;
  deviceId.value = '';
  submitted.value = false;
};
</script>

<template>
  <section class="page">
    <page-header :breadcrumb="[t('shell.workspace'), t('environments.production.short'), t('nav.equipment-sensors')]"
                 :title="t('monitoring.equipment.title')" :subtitle="t('monitoring.equipment.subtitle')"/>

    <pv-card>
      <template #title>{{ t('monitoring.equipment.inventory') }}</template>
      <template #subtitle>{{ t('monitoring.equipment.inventory-text') }}</template>
      <template #content>
        <pv-data-table :value="store.equipment" data-key="id" scrollable row-hover :aria-label="t('monitoring.equipment.inventory')"
                       :row-class="item => ({ highlight: item.code === selectedCode })" @row-click="event => selectedCode = event.data.code">
          <pv-column :header="t('monitoring.equipment.code')">
            <template #body="{ data }"><strong>{{ data.code }}</strong></template>
          </pv-column>
          <pv-column field="name" :header="t('monitoring.equipment.equipment')"/>
          <pv-column field="model" :header="t('monitoring.equipment.model')"/>
          <pv-column field="location" :header="t('monitoring.equipment.location')"/>
          <pv-column :header="t('monitoring.equipment.calibration')">
            <template #body="{ data }">
              <span class="chip chip-dot" :class="calibrationTone(data.calibrationStatus)">{{ t(`monitoring.calibration.${data.calibrationStatus}`) }}</span>
            </template>
          </pv-column>
          <pv-column :header="t('monitoring.equipment.next-maintenance')">
            <template #body="{ data }">
              <span :class="{ overdue: data.calibrationStatus === 'not-fit' }">{{ formatDate(data.nextMaintenance, locale) }}</span>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <div class="columns">
      <pv-card>
        <template #title>{{ t('monitoring.equipment.sensors') }} · {{ selectedCode }}</template>
        <template #subtitle>{{ t('monitoring.equipment.sensors-text') }}</template>
        <template #content>
          <pv-data-table :value="sensors" data-key="id" scrollable :aria-label="t('monitoring.equipment.sensors')">
            <pv-column :header="t('monitoring.equipment.sensor')">
              <template #body="{ data }"><router-link :to="`/production/sensors/${data.code}`">{{ data.code }}</router-link></template>
            </pv-column>
            <pv-column :header="t('monitoring.equipment.device-id')">
              <template #body="{ data }"><span class="mono">{{ data.deviceId }}</span></template>
            </pv-column>
            <pv-column :header="t('monitoring.equipment.type')">
              <template #body="{ data }">{{ t(`monitoring.type.${data.type}`) }}</template>
            </pv-column>
            <pv-column :header="t('monitoring.equipment.limits')">
              <template #body="{ data }">{{ data.lowerLimit }}–{{ data.upperLimit }} {{ data.unit }}</template>
            </pv-column>
            <pv-column :header="t('monitoring.status')">
              <template #body="{ data }">
                <span class="chip chip-dot" :class="data.status === 'active' ? 'chip-success' : 'chip-danger'">{{ t(`monitoring.sensor-status.${data.status}`) }}</span>
              </template>
            </pv-column>
            <template #empty><span class="muted">{{ t('monitoring.equipment.no-sensors') }}</span></template>
          </pv-data-table>
        </template>
      </pv-card>

      <pv-card class="panel">
        <template #content>
          <form class="flex flex-column gap-3" novalidate @submit.prevent="registerSensor">
            <div>
              <h2>{{ t('monitoring.equipment.register-sensor') }}</h2>
              <p class="small muted">{{ t('monitoring.equipment.register-text') }}</p>
            </div>
            <div class="field">
              <label for="device-id">{{ t('monitoring.equipment.device-id') }} *</label>
              <pv-input-text id="device-id" v-model="deviceId" placeholder="tb-7f3a2c91-coat02-temp" fluid
                             :invalid="deviceError || duplicateDevice" @input="duplicateDevice = false"/>
              <small v-if="deviceError" class="error">{{ t('monitoring.equipment.device-error') }}</small>
              <small v-if="duplicateDevice" class="error" role="alert">{{ t('monitoring.equipment.device-duplicate') }}</small>
            </div>
            <div class="field">
              <label for="sensor-type">{{ t('monitoring.equipment.type') }}</label>
              <pv-select input-id="sensor-type" v-model="type" :options="typeOptions" option-label="label" option-value="value" fluid/>
            </div>
            <div class="field">
              <label for="sensor-equipment">{{ t('monitoring.equipment.equipment') }}</label>
              <pv-select input-id="sensor-equipment" v-model="equipmentCode" :options="equipmentOptions" option-label="label" option-value="value" fluid/>
            </div>
            <pv-button type="submit" :label="t('monitoring.equipment.register-sensor')" fluid/>
          </form>
        </template>
      </pv-card>
    </div>

    <div v-if="attention" class="grid-2">
      <pv-card class="panel">
        <template #content>
          <h2>{{ t('monitoring.equipment.calibration') }} · {{ attention.code }}</h2>
          <p class="small muted">{{ t('monitoring.equipment.calibration-due') }} {{ formatDate(attention.calibrationDue, locale) }}</p>
          <span class="chip chip-dot align-self-start" :class="calibrationTone(attention.calibrationStatus)">{{ t(`monitoring.calibration.${attention.calibrationStatus}`) }}</span>
          <p>{{ t('monitoring.equipment.calibration-text') }}</p>
          <pv-button class="align-self-start" :label="t('monitoring.equipment.record-calibration')" @click="store.recordCalibration(attention)"/>
        </template>
      </pv-card>
      <pv-card class="panel">
        <template #content>
          <h2>{{ t('monitoring.equipment.maintenance') }} · {{ attention.code }}</h2>
          <p class="small muted">{{ t('monitoring.equipment.next-maintenance') }}: {{ formatDate(attention.nextMaintenance, locale) }} · {{ t('monitoring.equipment.every-90') }}</p>
          <span v-if="attention.workOrder" class="chip chip-dot chip-warning align-self-start">{{ attention.workOrder }} · {{ attention.maintenanceOwner }}</span>
          <p>{{ t('monitoring.equipment.maintenance-text') }}</p>
          <pv-button class="align-self-start" :label="t('monitoring.equipment.record-maintenance')" @click="store.recordMaintenance(attention)"/>
        </template>
      </pv-card>
    </div>
  </section>
</template>

<style scoped>
.overdue {
  color: var(--danger);
  font-weight: 600;
}

.mono {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 13px;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
