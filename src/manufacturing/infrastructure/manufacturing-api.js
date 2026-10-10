import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const productsEndpointPath = import.meta.env.VITE_PRODUCTS_ENDPOINT_PATH;
const masterFormulasEndpointPath = import.meta.env.VITE_MASTER_FORMULAS_ENDPOINT_PATH;
const formulaItemsEndpointPath = import.meta.env.VITE_FORMULA_ITEMS_ENDPOINT_PATH;
const productionOrdersEndpointPath = import.meta.env.VITE_PRODUCTION_ORDERS_ENDPOINT_PATH;
const operationsEndpointPath = import.meta.env.VITE_OPERATIONS_ENDPOINT_PATH;
const batchesEndpointPath = import.meta.env.VITE_BATCHES_ENDPOINT_PATH;
const batchEventsEndpointPath = import.meta.env.VITE_BATCH_EVENTS_ENDPOINT_PATH;
const materialLotsEndpointPath = import.meta.env.VITE_MATERIAL_LOTS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the Manufacturing & Batch Management endpoints.
 *
 * @class ManufacturingApi
 * @extends BaseApi
 */
export class ManufacturingApi extends BaseApi {
    #productsEndpoint;
    #masterFormulasEndpoint;
    #formulaItemsEndpoint;
    #productionOrdersEndpoint;
    #operationsEndpoint;
    #batchesEndpoint;
    #batchEventsEndpoint;
    #materialLotsEndpoint;

    /** Creates one endpoint client per manufacturing collection. */
    constructor() {
        super();
        this.#productsEndpoint = new BaseEndpoint(this, productsEndpointPath);
        this.#masterFormulasEndpoint = new BaseEndpoint(this, masterFormulasEndpointPath);
        this.#formulaItemsEndpoint = new BaseEndpoint(this, formulaItemsEndpointPath);
        this.#productionOrdersEndpoint = new BaseEndpoint(this, productionOrdersEndpointPath);
        this.#operationsEndpoint = new BaseEndpoint(this, operationsEndpointPath);
        this.#batchesEndpoint = new BaseEndpoint(this, batchesEndpointPath);
        this.#batchEventsEndpoint = new BaseEndpoint(this, batchEventsEndpointPath);
        this.#materialLotsEndpoint = new BaseEndpoint(this, materialLotsEndpointPath);
    }

    /**
     * Retrieves the products.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the products.
     */
    getProducts() {
        return this.#productsEndpoint.getAll();
    }

    /**
     * Creates a product resource.
     * @param {Object} resource - Resource to create, built by the ProductAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the created resource.
     */
    createProduct(resource) {
        return this.#productsEndpoint.create(resource);
    }

    /**
     * Retrieves the master formulas.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the master formulas.
     */
    getMasterFormulas() {
        return this.#masterFormulasEndpoint.getAll();
    }

    /**
     * Retrieves the formula items.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the formula items.
     */
    getFormulaItems() {
        return this.#formulaItemsEndpoint.getAll();
    }

    /**
     * Retrieves the production orders.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the production orders.
     */
    getProductionOrders() {
        return this.#productionOrdersEndpoint.getAll();
    }

    /**
     * Creates a productionOrder resource.
     * @param {Object} resource - Resource to create, built by the ProductionOrderAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the created resource.
     */
    createProductionOrder(resource) {
        return this.#productionOrdersEndpoint.create(resource);
    }

    /**
     * Retrieves the operations.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the operations.
     */
    getOperations() {
        return this.#operationsEndpoint.getAll();
    }

    /**
     * Updates a operation resource.
     * @param {Object} resource - Resource to update, built by the OperationAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the updated resource.
     */
    updateOperation(resource) {
        return this.#operationsEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the batches.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the batches.
     */
    getBatches() {
        return this.#batchesEndpoint.getAll();
    }

    /**
     * Creates a batch resource.
     * @param {Object} resource - Resource to create, built by the BatchAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the created resource.
     */
    createBatch(resource) {
        return this.#batchesEndpoint.create(resource);
    }

    /**
     * Updates a batch resource.
     * @param {Object} resource - Resource to update, built by the BatchAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the updated resource.
     */
    updateBatch(resource) {
        return this.#batchesEndpoint.update(resource.id, resource);
    }

    /**
     * Retrieves the batch events.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the batch events.
     */
    getBatchEvents() {
        return this.#batchEventsEndpoint.getAll();
    }

    /**
     * Creates a batchEvent resource.
     * @param {Object} resource - Resource to create, built by the BatchEventAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the created resource.
     */
    createBatchEvent(resource) {
        return this.#batchEventsEndpoint.create(resource);
    }

    /**
     * Retrieves the material lots.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the material lots.
     */
    getMaterialLots() {
        return this.#materialLotsEndpoint.getAll();
    }

    /**
     * Creates a materialLot resource.
     * @param {Object} resource - Resource to create, built by the MaterialLotAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the created resource.
     */
    createMaterialLot(resource) {
        return this.#materialLotsEndpoint.create(resource);
    }

    /**
     * Updates a materialLot resource.
     * @param {Object} resource - Resource to update, built by the MaterialLotAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the updated resource.
     */
    updateMaterialLot(resource) {
        return this.#materialLotsEndpoint.update(resource.id, resource);
    }
}
