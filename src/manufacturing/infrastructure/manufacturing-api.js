import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

/**
 * Infrastructure facade for the Manufacturing & Batch Management endpoints.
 */
export class ManufacturingApi extends BaseApi {
  constructor() {
    super();
    this.productsEndpoint = new BaseEndpoint(this, '/products');
    this.formulasEndpoint = new BaseEndpoint(this, '/master-formulas');
    this.formulaItemsEndpoint = new BaseEndpoint(this, '/formula-items');
    this.ordersEndpoint = new BaseEndpoint(this, '/production-orders');
    this.operationsEndpoint = new BaseEndpoint(this, '/operations');
    this.batchesEndpoint = new BaseEndpoint(this, '/batches');
    this.batchEventsEndpoint = new BaseEndpoint(this, '/batch-events');
    this.materialLotsEndpoint = new BaseEndpoint(this, '/material-lots');
  }

  getProducts() { return this.productsEndpoint.getAll(); }
  createProduct(product) { return this.productsEndpoint.create(product); }
  getMasterFormulas() { return this.formulasEndpoint.getAll(); }
  getFormulaItems() { return this.formulaItemsEndpoint.getAll(); }
  getProductionOrders() { return this.ordersEndpoint.getAll(); }
  createProductionOrder(order) { return this.ordersEndpoint.create(order); }
  getOperations() { return this.operationsEndpoint.getAll(); }
  updateOperation(operation) { return this.operationsEndpoint.update(operation.id, operation); }
  getBatches() { return this.batchesEndpoint.getAll(); }
  createBatch(batch) { return this.batchesEndpoint.create(batch); }
  updateBatch(batch) { return this.batchesEndpoint.update(batch.id, batch); }
  getBatchEvents() { return this.batchEventsEndpoint.getAll(); }
  createBatchEvent(event) { return this.batchEventsEndpoint.create(event); }
  getMaterialLots() { return this.materialLotsEndpoint.getAll(); }
  createMaterialLot(lot) { return this.materialLotsEndpoint.create(lot); }
  updateMaterialLot(lot) { return this.materialLotsEndpoint.update(lot.id, lot); }
}
