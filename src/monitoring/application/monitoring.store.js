import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {MonitoringApi} from "../infrastructure/monitoring-api.js";
import {EquipmentAssembler} from "../infrastructure/equipment.assembler.js";
import {SensorAssembler} from "../infrastructure/sensor.assembler.js";
import {ReadingAssembler} from "../infrastructure/reading.assembler.js";
import {AlertAssembler} from "../infrastructure/alert.assembler.js";

const monitoringApi = new MonitoringApi();

/**
 * Application service store for the IoT Monitoring bounded context.
 * It holds the equipment, sensors, readings and alerts of the plant and applies the monitoring rules:
 * equipment fit for use, sensors linked to one batch at a time and unique ThingsBoard device IDs.
 *
 * @returns {Object} Store state and actions.
 */
const useMonitoringStore = defineStore('monitoring', () => {
    /** @type {import('vue').Ref<Array<import('../domain/model/equipment.entity.js').Equipment>>} */
    const equipment = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/sensor.entity.js').Sensor>>} */
    const sensors = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/reading.entity.js').Reading>>} */
    const readings = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/alert.entity.js').Alert>>} */
    const alerts = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether the collections are loading. */
    const loading = ref(false);
    /** @type {import('vue').Ref<Array<Error>>} Errors of the last requests. */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<Array>} Alerts that are not closed, critical first. */
    const activeAlerts = computed(() => alerts.value
        .filter(alert => alert.status !== 'closed')
        .sort((a, b) => Number(b.severity === 'critical') - Number(a.severity === 'critical')));
    /** @type {import('vue').ComputedRef<Array>} Sensors that are reporting. */
    const onlineSensors = computed(() => sensors.value.filter(sensor => sensor.status === 'active'));

    /**
     * Loads a collection of the fake API into a state array.
     * @param {Promise<import('axios').AxiosResponse>} request - Request that returns the collection.
     * @param {Object} assembler - Assembler that maps the response to entities.
     * @param {import('vue').Ref<Array>} target - State that stores the entities.
     */
    const load = (request, assembler, target) => request
        .then(response => target.value = assembler.toEntitiesFromResponse(response))
        .catch(error => errors.value.push(error));

    /** Loads all the monitoring collections. */
    function fetchAll() {
        loading.value = true;
        Promise.all([
            load(monitoringApi.getEquipment(), EquipmentAssembler, equipment),
            load(monitoringApi.getSensors(), SensorAssembler, sensors),
            load(monitoringApi.getReadings(), ReadingAssembler, readings),
            load(monitoringApi.getAlerts(), AlertAssembler, alerts)
        ]).finally(() => loading.value = false);
    }

    /** @param {string} code - Equipment code. @returns {Object|undefined} The equipment. */
    const equipmentByCode = (code) => equipment.value.find(item => item.code === code);

    /** @param {string} equipmentCode - Equipment code. @returns {Array} Sensors installed on the equipment. */
    const sensorsOf = (equipmentCode) => sensors.value.filter(item => item.equipmentCode === equipmentCode);

    /** @param {string} code - Sensor code. @returns {Object|undefined} The sensor. */
    const sensorByCode = (code) => sensors.value.find(item => item.code === code);

    /** @param {string} sensorCode - Sensor code. @returns {Array} Readings of the sensor, oldest first. */
    const readingsOf = (sensorCode) => readings.value
        .filter(item => item.sensorCode === sensorCode).sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

    /** @param {string} batchCode - Batch code. @returns {Array} Readings linked to the batch, newest first. */
    const readingsOfBatch = (batchCode) => readings.value
        .filter(item => item.batchCode === batchCode).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

    /** @param {string} code - Alert code. @returns {Object|undefined} The alert. */
    const alertByCode = (code) => alerts.value.find(item => item.code === code);

    /** @param {string} sensorCode - Sensor code. @returns {Object|undefined} Latest open alert of the sensor. */
    const alertOfSensor = (sensorCode) => alerts.value.find(item => item.sensorCode === sensorCode && item.status !== 'closed');

    /**
     * Whether a reading is outside the limits of its sensor.
     * @param {import('../domain/model/reading.entity.js').Reading} reading - Reading to check.
     * @returns {boolean} True when the value is below the lower limit or above the upper limit.
     */
    function isOutOfRange(reading) {
        const sensor = sensorByCode(reading.sensorCode);
        return !!sensor && (reading.value < sensor.lowerLimit || reading.value > sensor.upperLimit);
    }

    /**
     * Checks whether a piece of equipment can be associated with a batch: it must be fit for use
     * and its sensors cannot be feeding another batch in progress.
     * @param {string} equipmentCode - Code of the equipment.
     * @param {string} batchCode - Code of the batch.
     * @returns {Array<string>} Reasons why it cannot be associated (not-fit, sensor-in-use); empty when it can.
     */
    function validateAssociation(equipmentCode, batchCode) {
        const reasons = [];
        if (equipmentByCode(equipmentCode)?.calibrationStatus === 'not-fit') reasons.push('not-fit');
        if (sensorsOf(equipmentCode).some(sensor => sensor.assignedBatch && sensor.assignedBatch !== batchCode)) reasons.push('sensor-in-use');
        return reasons;
    }

    /**
     * Replaces an entity of a state array with the saved version returned by the API.
     * @param {import('vue').Ref<Array>} target - State that stores the entities.
     * @param {Object} assembler - Assembler that maps the response to an entity.
     * @returns {function(import('axios').AxiosResponse): void} Handler for the response.
     */
    const replaceIn = (target, assembler) => (response) => {
        const saved = assembler.toEntityFromResource(response.data);
        target.value = target.value.map(item => item.id === saved.id ? saved : item);
    };

    /**
     * Links the sensors of a piece of equipment to a batch, when allowed.
     * @param {string} equipmentCode - Code of the equipment.
     * @param {string} batchCode - Code of the batch.
     */
    function associateEquipment(equipmentCode, batchCode) {
        if (validateAssociation(equipmentCode, batchCode).length) return;
        sensorsOf(equipmentCode).forEach(sensor => monitoringApi
            .updateSensor({...SensorAssembler.toResourceFromEntity(sensor), assignedBatch: batchCode})
            .then(replaceIn(sensors, SensorAssembler))
            .catch(error => errors.value.push(error)));
    }

    /**
     * Registers a sensor when its ThingsBoard device ID is new.
     * @param {import('../domain/model/sensor.entity.js').Sensor} sensor - Sensor to register.
     * @returns {boolean} False when the device ID is already registered.
     */
    function addSensor(sensor) {
        if (sensors.value.some(item => item.deviceId === sensor.deviceId)) return false;
        const {id, ...resource} = SensorAssembler.toResourceFromEntity(sensor);
        monitoringApi.createSensor(resource)
            .then(response => sensors.value.push(SensorAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
        return true;
    }

    /**
     * Persists changes to a piece of equipment.
     * @param {import('../domain/model/equipment.entity.js').Equipment} item - Equipment to change.
     * @param {Object} changes - Fields to change.
     */
    function saveEquipment(item, changes) {
        monitoringApi.updateEquipment({...EquipmentAssembler.toResourceFromEntity(item), ...changes})
            .then(replaceIn(equipment, EquipmentAssembler))
            .catch(error => errors.value.push(error));
    }

    /**
     * Records a new calibration: the equipment becomes fit for use for one more year.
     * @param {import('../domain/model/equipment.entity.js').Equipment} item - Calibrated equipment.
     */
    function recordCalibration(item) {
        const due = new Date();
        due.setFullYear(due.getFullYear() + 1);
        const date = due.toISOString();
        saveEquipment(item, {
            calibrationStatus: 'fit', calibrationDue: date.slice(0, 10),
            certificate: `CAL-${item.code.split('-').pop()}-${date.slice(2, 4)}${date.slice(5, 7)}`
        });
    }

    /**
     * Records preventive maintenance: the next one is scheduled 90 days later.
     * @param {import('../domain/model/equipment.entity.js').Equipment} item - Maintained equipment.
     */
    function recordMaintenance(item) {
        const next = new Date();
        next.setDate(next.getDate() + 90);
        saveEquipment(item, {nextMaintenance: next.toISOString().slice(0, 10), workOrder: ''});
    }

    /**
     * Acknowledges an alert with the response note. Acknowledging does not close it.
     * @param {import('../domain/model/alert.entity.js').Alert} alert - Alert to acknowledge.
     * @param {string} note - Corrective actions taken.
     * @param {string} userName - Who acknowledges it.
     * @returns {Promise<void>} Resolves when the alert was saved.
     */
    function acknowledgeAlert(alert, note, userName) {
        const changes = {responseNote: note};
        if (alert.status === 'open') Object.assign(changes, {
            status: 'acknowledged', acknowledgedBy: userName, acknowledgedAt: new Date().toISOString()
        });
        return monitoringApi.updateAlert({...AlertAssembler.toResourceFromEntity(alert), ...changes})
            .then(replaceIn(alerts, AlertAssembler))
            .catch(error => errors.value.push(error));
    }

    /**
     * Links an alert to a deviation opened by Quality.
     * @param {string} alertCode - Code of the alert.
     * @param {string} deviationCode - Code of the deviation.
     */
    function linkDeviation(alertCode, deviationCode) {
        const alert = alertByCode(alertCode);
        if (!alert) return;
        monitoringApi.updateAlert({...AlertAssembler.toResourceFromEntity(alert), linkedRecord: deviationCode, status: 'under-investigation'})
            .then(replaceIn(alerts, AlertAssembler))
            .catch(error => errors.value.push(error));
    }

    fetchAll();

    return {
        equipment,
        sensors,
        readings,
        alerts,
        loading,
        errors,
        activeAlerts,
        onlineSensors,
        fetchAll,
        equipmentByCode,
        sensorsOf,
        sensorByCode,
        readingsOf,
        readingsOfBatch,
        alertByCode,
        alertOfSensor,
        isOutOfRange,
        validateAssociation,
        associateEquipment,
        addSensor,
        recordCalibration,
        recordMaintenance,
        acknowledgeAlert,
        linkDeviation
    };
});

export default useMonitoringStore;
