/**
 * Endpoint client for formula item CRUD operations.
 */
export class FormulaItemsApiEndpoint Endpoint {
  /**
   * Creates an instance of FormulaItemsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderFormulaItemsEndpointPath}`, new FormulaItemAssembler());
  }
}