/**
 * Infrastructure facade for the Manufacturing & Batch Management endpoints.
 */

export class ManufacturingApi  {
  http = null;
  private readonly productsEndpoint = new ProductsApiEndpoint(this.http);
  private readonly formulasEndpoint = new MasterFormulasApiEndpoint(this.http);
  private readonly formulaItemsEndpoint = new FormulaItemsApiEndpoint(this.http);
  private readonly ordersEndpoint = new ProductionOrdersApiEndpoint(this.http);
  private readonly operationsEndpoint = new OperationsApiEndpoint(this.http);
  private readonly batchesEndpoint = new BatchesApiEndpoint(this.http);
  private readonly batchEventsEndpoint = new BatchEventsApiEndpoint(this.http);
  private readonly materialLotsEndpoint = new MaterialLotsApiEndpoint(this.http);

  /** Retrieves the product catalog. */
  getProducts = () => this.productsEndpoint.getAll();

  /** Registers a product. */
  createProduct = (product) => this.productsEndpoint.create(product);

  /** Retrieves all master formula versions. */
  getMasterFormulas = () => this.formulasEndpoint.getAll();

  /** Retrieves the components and parameters of all master formulas. */
  getFormulaItems = () => this.formulaItemsEndpoint.getAll();

  /** Retrieves the production orders. */
  getProductionOrders = () => this.ordersEndpoint.getAll();

  /** Creates a production order. */
  createProductionOrder = (order) => this.ordersEndpoint.create(order);

  /** Retrieves the operations of all orders. */
  getOperations = () => this.operationsEndpoint.getAll();

  /** Updates an operation. */
  updateOperation = (operation) => this.operationsEndpoint.update(operation, operation.id);

  /** Retrieves the batches. */
  getBatches = () => this.batchesEndpoint.getAll();

  /** Creates a batch. */
  createBatch = (batch) => this.batchesEndpoint.create(batch);

  /** Updates a batch. */
  updateBatch = (batch) => this.batchesEndpoint.update(batch, batch.id);

  /** Retrieves the status history of all batches. */
  getBatchEvents = () => this.batchEventsEndpoint.getAll();

  /** Adds an entry to the status history of a batch. */
  createBatchEvent = (event) => this.batchEventsEndpoint.create(event);

  /** Retrieves the raw-material lots. */
  getMaterialLots = () => this.materialLotsEndpoint.getAll();

  /** Records a raw-material receipt. */
  createMaterialLot = (lot) => this.materialLotsEndpoint.create(lot);

  /** Updates a raw-material lot. */
  updateMaterialLot = (lot) => this.materialLotsEndpoint.update(lot, lot.id);
}