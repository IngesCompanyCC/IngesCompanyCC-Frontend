/**
 * Maps production order entities to and from API resources.
 */
export class ProductionOrderAssembler  {
  /**
   * Converts a ProductionOrdersResponse to an array of ProductionOrder entities.
   * @param response - The API response containing production order resources.
   * @returns An array of ProductionOrder entities.
   */
  toEntitiesFromResponse = (response) =>
    response.productionOrders.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a ProductionOrderResource to a ProductionOrder entity.
   * @param resource - The resource to convert.
   * @returns The converted ProductionOrder entity.
   */
  toEntityFromResource = (resource) =>
    new ProductionOrder({
      id: resource.id,
      code: resource.code,
      productCode: resource.productCode,
      formulaId: resource.formulaId,
      batchCode: resource.batchCode,
      plannedQuantity: resource.plannedQuantity,
      line: resource.line,
      status: resource.status,
      plannedStart: resource.plannedStart,
      plannedEnd: resource.plannedEnd
    });

  /**
   * Converts a ProductionOrder entity to a ProductionOrderResource.
   * @param entity - The entity to convert.
   * @returns The converted ProductionOrderResource.
   */
  toResourceFromEntity = (entity) =>
    ({
      id: entity.id,
      code: entity.code,
      productCode: entity.productCode,
      formulaId: entity.formulaId,
      batchCode: entity.batchCode,
      plannedQuantity: entity.plannedQuantity,
      line: entity.line,
      status: entity.status,
      plannedStart: entity.plannedStart,
      plannedEnd: entity.plannedEnd
    } as ProductionOrderResource);
}