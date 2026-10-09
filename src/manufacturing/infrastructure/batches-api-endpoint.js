/**
 * Endpoint client for batch CRUD operations.
 */
export class BatchesApiEndpoint Endpoint {
  /**
   * Creates an instance of BatchesApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderBatchesEndpointPath}`, new BatchAssembler());
  }
}