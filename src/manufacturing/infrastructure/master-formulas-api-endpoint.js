/**
 * Endpoint client for master formula CRUD operations.
 */
export class MasterFormulasApiEndpoint Endpoint {
  /**
   * Creates an instance of MasterFormulasApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor() {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderMasterFormulasEndpointPath}`, new MasterFormulaAssembler());
  }
}