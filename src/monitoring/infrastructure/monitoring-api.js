import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const equipmentEndpointPath = import.meta.env.VITE_EQUIPMENT_ENDPOINT_PATH;
const sensorsEndpointPath = import.meta.env.VITE_SENSORS_ENDPOINT_PATH;
const readingsEndpointPath = import.meta.env.VITE_READINGS_ENDPOINT_PATH;
const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the IoT Monitoring endpoints.
 *
 * @class MonitoringApi
 * @extends BaseApi
 */
export class MonitoringApi extends BaseApi {
    #equipmentEndpoint;
    #sensorsEndpoint;
    #readingsEndpoint;
    #alertsEndpoint;

    /** Creates one endpoint client per collection. */
    constructor() {
        super();
        this.#equipmentEndpoint = new BaseEndpoint(this, equipmentEndpointPath);
        this.#sensorsEndpoint = new BaseEndpoint(this, sensorsEndpointPath);
        this.#readingsEndpoint = new BaseEndpoint(this, readingsEndpointPath);
        this.#alertsEndpoint = new BaseEndpoint(this, alertsEndpointPath);
    }

    /**
     * Retrieves the equipment.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the equipment.
     */
    getEquipment() {
        return this.#equipmentEndpoint.getAll();
    }

    /**
     * Updates a equipment resource.
     * @param {Object} resource - Resource built by the EquipmentAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateEquipment(resource) {
        return this.#equipmentEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the sensors.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the sensors.
     */
    getSensors() {
        return this.#sensorsEndpoint.getAll();
    }

    /**
     * Creates a sensor resource.
     * @param {Object} resource - Resource built by the SensorAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    createSensor(resource) {
        return this.#sensorsEndpoint.create(resource);
    }

    /**
     * Updates a sensor resource.
     * @param {Object} resource - Resource built by the SensorAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateSensor(resource) {
        return this.#sensorsEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the readings.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the readings.
     */
    getReadings() {
        return this.#readingsEndpoint.getAll();
    }

    /**
     * Retrieves the alerts.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the alerts.
     */
    getAlerts() {
        return this.#alertsEndpoint.getAll();
    }

    /**
     * Updates a alert resource.
     * @param {Object} resource - Resource built by the AlertAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the saved resource.
     */
    updateAlert(resource) {
        return this.#alertsEndpoint.update(resource.id, resource);
    }
}
