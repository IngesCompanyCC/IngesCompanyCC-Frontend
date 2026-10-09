/**
 * Endpoint client for material lot CRUD operations.
 */
export class MaterialLotsApiEndpoint Endpoint {
  /**
   * Creates an instance of MaterialLotsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderMaterialLotsEndpointPath}`, new MaterialLotAssembler());
  }
}