/**
 * Endpoint client for product CRUD operations.
 */
export class ProductsApiEndpoint Endpoint {
  /**
   * Creates an instance of ProductsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderProductsEndpointPath}`, new ProductAssembler());
  }
}