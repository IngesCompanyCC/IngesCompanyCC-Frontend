/**
 * Endpoint client for batch event CRUD operations.
 */
export class BatchEventsApiEndpoint Endpoint {
  /**
   * Creates an instance of BatchEventsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderBatchEventsEndpointPath}`, new BatchEventAssembler());
  }
}