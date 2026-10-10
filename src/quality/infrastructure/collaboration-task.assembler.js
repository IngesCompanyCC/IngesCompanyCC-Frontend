import {CollaborationTask} from "../domain/model/collaboration-task.entity.js";

/**
 * Maps collaboration tasks resources of the API to and from CollaborationTask entities.
 *
 * @class CollaborationTaskAssembler
 */
export class CollaborationTaskAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {CollaborationTask} The entity.
     */
    static toEntityFromResource(resource) {
        return new CollaborationTask({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<CollaborationTask>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {CollaborationTask} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            title: entity.title,
            recordCode: entity.recordCode,
            detail: entity.detail,
            owner: entity.owner,
            dueAt: entity.dueAt,
            status: entity.status
        };
    }
}
