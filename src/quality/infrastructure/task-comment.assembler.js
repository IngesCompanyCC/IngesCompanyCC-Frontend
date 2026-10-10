import {TaskComment} from "../domain/model/task-comment.entity.js";

/**
 * Maps task comments resources of the API to and from TaskComment entities.
 *
 * @class TaskCommentAssembler
 */
export class TaskCommentAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {TaskComment} The entity.
     */
    static toEntityFromResource(resource) {
        return new TaskComment({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<TaskComment>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {TaskComment} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            recordCode: entity.recordCode,
            author: entity.author,
            initials: entity.initials,
            postedAt: entity.postedAt,
            text: entity.text
        };
    }
}
