/**
 * Endpoint client for operation CRUD operations.
 */
export class OperationsApiEndpoint Endpoint {
  /**
   * Creates an instance of OperationsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderOperationsEndpointPath}`, new OperationAssembler());
  }
}