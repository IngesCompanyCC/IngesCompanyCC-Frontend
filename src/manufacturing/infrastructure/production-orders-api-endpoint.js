/**
 * Endpoint client for production order CRUD operations.
 */
export class ProductionOrdersApiEndpoint Endpoint {
  /**
   * Creates an instance of ProductionOrdersApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderProductionOrdersEndpointPath}`, new ProductionOrderAssembler());
  }
}