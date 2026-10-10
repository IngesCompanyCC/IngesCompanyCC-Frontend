import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ManufacturingApi} from "../infrastructure/manufacturing-api.js";
import {ProductAssembler} from "../infrastructure/product.assembler.js";
import {MasterFormulaAssembler} from "../infrastructure/master-formula.assembler.js";
import {FormulaItemAssembler} from "../infrastructure/formula-item.assembler.js";
import {ProductionOrderAssembler} from "../infrastructure/production-order.assembler.js";
import {OperationAssembler} from "../infrastructure/operation.assembler.js";
import {BatchAssembler} from "../infrastructure/batch.assembler.js";
import {BatchEventAssembler} from "../infrastructure/batch-event.assembler.js";
import {MaterialLotAssembler} from "../infrastructure/material-lot.assembler.js";
import {ProductionOrder} from "../domain/model/production-order.entity.js";
import {BatchEvent} from "../domain/model/batch-event.entity.js";

const manufacturingApi = new ManufacturingApi();

/**
 * Application service store for the Manufacturing & Batch Management bounded context.
 * It holds products, master formulas, production orders, batches and raw-material lots, and applies
 * the manufacturing rules: unique batch codes, approved master formulas and operations in sequence.
 *
 * @returns {Object} Store state and actions.
 */
const useManufacturingStore = defineStore('manufacturing', () => {
    /** @type {import('vue').Ref<Array<import('../domain/model/product.entity.js').Product>>} */
    const products = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/master-formula.entity.js').MasterFormula>>} */
    const formulas = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/formula-item.entity.js').FormulaItem>>} */
    const formulaItems = ref([]);
    /** @type {import('vue').Ref<Array<ProductionOrder>>} */
    const orders = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/operation.entity.js').Operation>>} */
    const operations = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/batch.entity.js').Batch>>} */
    const batches = ref([]);
    /** @type {import('vue').Ref<Array<BatchEvent>>} */
    const batchEvents = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/model/material-lot.entity.js').MaterialLot>>} */
    const materialLots = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether a request is running. */
    const loading = ref(false);
    /** @type {import('vue').Ref<Array<Error>>} Errors of the last requests. */
    const errors = ref([]);

    /** @type {import('vue').ComputedRef<Object<string, number>>} Number of batches in each status. */
    const batchCounts = computed(() => batches.value.reduce((counts, batch) => {
        counts[batch.status] = (counts[batch.status] ?? 0) + 1;
        return counts;
    }, {}));

    /**
     * Loads a collection of the fake API into a state array.
     * @param {Promise<import('axios').AxiosResponse>} request - Request that returns the collection.
     * @param {Object} assembler - Assembler that maps the response to entities.
     * @param {import('vue').Ref<Array>} target - State that stores the entities.
     */
    const load = (request, assembler, target) => request
        .then(response => target.value = assembler.toEntitiesFromResponse(response))
        .catch(error => errors.value.push(error));

    /** Loads all the manufacturing collections. */
    function fetchAll() {
        loading.value = true;
        Promise.all([
            load(manufacturingApi.getProducts(), ProductAssembler, products),
            load(manufacturingApi.getMasterFormulas(), MasterFormulaAssembler, formulas),
            load(manufacturingApi.getFormulaItems(), FormulaItemAssembler, formulaItems),
            load(manufacturingApi.getProductionOrders(), ProductionOrderAssembler, orders),
            load(manufacturingApi.getOperations(), OperationAssembler, operations),
            load(manufacturingApi.getBatches(), BatchAssembler, batches),
            load(manufacturingApi.getBatchEvents(), BatchEventAssembler, batchEvents),
            load(manufacturingApi.getMaterialLots(), MaterialLotAssembler, materialLots)
        ]).finally(() => loading.value = false);
    }

    /** @param {string} code - Product code. @returns {Object|undefined} The product. */
    const productByCode = (code) => products.value.find(item => item.code === code);

    /** @param {string} productCode - Product code. @returns {Object|undefined} The approved (effective) master formula of the product. */
    const effectiveFormula = (productCode) =>
        formulas.value.find(formula => formula.productCode === productCode && formula.status === 'approved');

    /** @param {number} formulaId - Master formula identifier. @returns {Array} Components and parameters of the formula. */
    const itemsOfFormula = (formulaId) => formulaItems.value.filter(item => item.formulaId === formulaId);

    /** @param {string} code - Order code. @returns {ProductionOrder|undefined} The production order. */
    const orderByCode = (code) => orders.value.find(item => item.code === code);

    /** @param {number} orderId - Order identifier. @returns {Array} Operations of the order, in sequence. */
    const operationsOfOrder = (orderId) =>
        operations.value.filter(item => item.orderId === orderId).sort((a, b) => a.sequence - b.sequence);

    /** @param {string} code - Batch code. @returns {Object|undefined} The batch. */
    const batchByCode = (code) => batches.value.find(item => item.code === code);

    /** @param {string} batchCode - Batch code. @returns {Array<BatchEvent>} Status history of the batch, oldest first. */
    const eventsOfBatch = (batchCode) =>
        batchEvents.value.filter(item => item.batchCode === batchCode).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

    /** @param {string} batchCode - Batch code. @returns {Array} Raw-material lots allocated to the batch. */
    const lotsOfBatch = (batchCode) => materialLots.value.filter(item => item.allocatedBatch === batchCode);

    /**
     * Registers a product when its code is unique.
     * @param {import('../domain/model/product.entity.js').Product} product - Product to register.
     * @returns {boolean} False when the code already exists.
     */
    function addProduct(product) {
        if (products.value.some(item => item.code.toUpperCase() === product.code.toUpperCase())) return false;
        const {id, ...resource} = ProductAssembler.toResourceFromEntity(product);
        manufacturingApi.createProduct(resource)
            .then(response => products.value.push(ProductAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
        return true;
    }

    /**
     * Checks the rules to create a batch: a unique code and an approved master formula.
     * @param {string} code - Batch code.
     * @param {string} productCode - Code of the product.
     * @returns {Array<string>} Reasons why the batch cannot be created (duplicate-code, formula-not-approved); empty when it can.
     */
    function validateBatch(code, productCode) {
        const reasons = [];
        if (batches.value.some(batch => batch.code.toUpperCase() === code.toUpperCase())) reasons.push('duplicate-code');
        if (!effectiveFormula(productCode)) reasons.push('formula-not-approved');
        return reasons;
    }

    /**
     * Adds an entry to the status history of a batch.
     * @param {string} batchCode - Code of the batch.
     * @param {string} title - What happened.
     * @param {string} detail - Who or what was involved.
     * @param {string} tone - Color of the entry.
     */
    function addEvent(batchCode, title, detail, tone) {
        const event = new BatchEvent({batchCode, title, detail, occurredAt: new Date().toISOString(), tone});
        const {id, ...resource} = BatchEventAssembler.toResourceFromEntity(event);
        manufacturingApi.createBatchEvent(resource)
            .then(response => batchEvents.value.push(BatchEventAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
    }

    /**
     * Creates a planned batch and its production order with the effective master formula.
     * @param {import('../domain/model/batch.entity.js').Batch} batch - Batch to create.
     * @returns {Promise<void>} Resolves when the batch was created.
     */
    function addBatch(batch) {
        const formula = effectiveFormula(batch.productCode);
        if (!formula) return Promise.resolve();
        loading.value = true;
        const {id, ...batchResource} = BatchAssembler.toResourceFromEntity(batch);
        const order = new ProductionOrder({
            code: batch.orderCode, productCode: batch.productCode, formulaId: formula.id, batchCode: batch.code,
            plannedQuantity: batch.quantity, line: batch.line, status: 'planned',
            plannedStart: new Date().toISOString(), plannedEnd: new Date().toISOString()
        });
        const {id: orderId, ...orderResource} = ProductionOrderAssembler.toResourceFromEntity(order);
        return Promise.all([
            manufacturingApi.createBatch(batchResource).then(response => {
                const created = BatchAssembler.toEntityFromResource(response.data);
                batches.value.unshift(created);
                addEvent(created.code, 'Created & materials allocated', created.owner, 'normal');
            }),
            manufacturingApi.createProductionOrder(orderResource)
                .then(response => orders.value.push(ProductionOrderAssembler.toEntityFromResource(response.data)))
        ]).catch(error => errors.value.push(error)).finally(() => loading.value = false);
    }

    /**
     * Records progress on the next pending operation of an order. Not allowed while an operation is on hold.
     * @param {number} orderId - Identifier of the order.
     */
    function recordOperation(orderId) {
        const sequence = operationsOfOrder(orderId);
        if (sequence.some(operation => operation.status === 'on-hold')) return;
        const next = sequence.find(operation => operation.status !== 'complete');
        if (!next) return;
        const resource = {...OperationAssembler.toResourceFromEntity(next), progress: 100, status: 'complete'};
        manufacturingApi.updateOperation(resource)
            .then(response => Object.assign(next, OperationAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
    }

    /**
     * Releases a batch after the QA electronic signature.
     * @param {string} batchCode - Code of the batch.
     */
    function releaseBatch(batchCode) {
        const batch = batchByCode(batchCode);
        if (!batch) return;
        const resource = {
            ...BatchAssembler.toResourceFromEntity(batch),
            status: 'released', lastActivity: 'Released by QA', lastActivityAt: new Date().toISOString()
        };
        manufacturingApi.updateBatch(resource)
            .then(response => Object.assign(batch, BatchAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
        addEvent(batchCode, 'Released for distribution', 'QA electronic signature', 'normal');
    }

    /**
     * Records a raw-material receipt; the lot enters quarantine and waits for sampling.
     * @param {import('../domain/model/material-lot.entity.js').MaterialLot} lot - Lot received.
     * @returns {Promise<void>} Resolves when the receipt was recorded.
     */
    function addMaterialLot(lot) {
        loading.value = true;
        const {id, ...resource} = MaterialLotAssembler.toResourceFromEntity(lot);
        return manufacturingApi.createMaterialLot(resource)
            .then(response => materialLots.value.unshift(MaterialLotAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error))
            .finally(() => loading.value = false);
    }

    /**
     * Requests the QC inspection of a lot in quarantine.
     * @param {import('../domain/model/material-lot.entity.js').MaterialLot} lot - Lot to inspect.
     */
    function requestInspection(lot) {
        const resource = {...MaterialLotAssembler.toResourceFromEntity(lot), samplingStatus: 'requested', status: 'inspection'};
        manufacturingApi.updateMaterialLot(resource)
            .then(response => Object.assign(lot, MaterialLotAssembler.toEntityFromResource(response.data)))
            .catch(error => errors.value.push(error));
    }

    fetchAll();

    return {
        products,
        formulas,
        formulaItems,
        orders,
        operations,
        batches,
        batchEvents,
        materialLots,
        loading,
        errors,
        batchCounts,
        fetchAll,
        productByCode,
        effectiveFormula,
        itemsOfFormula,
        orderByCode,
        operationsOfOrder,
        batchByCode,
        eventsOfBatch,
        lotsOfBatch,
        addProduct,
        validateBatch,
        addBatch,
        recordOperation,
        releaseBatch,
        addMaterialLot,
        requestInspection
    };
});

export default useManufacturingStore;
