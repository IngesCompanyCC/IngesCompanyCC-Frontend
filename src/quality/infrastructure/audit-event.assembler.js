import {AuditEvent} from "../domain/model/audit-event.entity.js";

/**
 * Maps audit events resources of the API to and from AuditEvent entities.
 *
 * @class AuditEventAssembler
 */
export class AuditEventAssembler {
    /**
     * @param {Object} resource - Resource from the API.
     * @returns {AuditEvent} The entity.
     */
    static toEntityFromResource(resource) {
        return new AuditEvent({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>>} response - HTTP response with the resources.
     * @returns {Array<AuditEvent>} The entities, or an empty array when the response failed.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {AuditEvent} entity - The entity.
     * @returns {Object} The resource sent to the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            eventCode: entity.eventCode,
            occurredAt: entity.occurredAt,
            actor: entity.actor,
            actorRole: entity.actorRole,
            event: entity.event,
            record: entity.record,
            result: entity.result,
            field: entity.field,
            before: entity.before,
            after: entity.after,
            reason: entity.reason
        };
    }
}
