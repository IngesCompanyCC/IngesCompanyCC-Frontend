/**
 * Maps master formula entities to and from API resources.
 */
export class MasterFormulaAssembler  {
  /**
   * Converts a MasterFormulasResponse to an array of MasterFormula entities.
   * @param response - The API response containing master formula resources.
   * @returns An array of MasterFormula entities.
   */
  toEntitiesFromResponse = (response) =>
    response.masterFormulas.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a MasterFormulaResource to a MasterFormula entity.
   * @param resource - The resource to convert.
   * @returns The converted MasterFormula entity.
   */
  toEntityFromResource = (resource) =>
    new MasterFormula({
      id: resource.id,
      productCode: resource.productCode,
      version: resource.version,
      status: resource.status,
      approvedBy: resource.approvedBy,
      approvedAt: resource.approvedAt,
      batchSize: resource.batchSize
    });

  /**
   * Converts a MasterFormula entity to a MasterFormulaResource.
   * @param entity - The entity to convert.
   * @returns The converted MasterFormulaResource.
   */
  toResourceFromEntity = (entity) =>
    ({
      id: entity.id,
      productCode: entity.productCode,
      version: entity.version,
      status: entity.status,
      approvedBy: entity.approvedBy,
      approvedAt: entity.approvedAt,
      batchSize: entity.batchSize
    } as MasterFormulaResource);
}