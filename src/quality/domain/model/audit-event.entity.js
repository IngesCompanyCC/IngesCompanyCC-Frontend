/**
 * Represents an immutable, attributed event of the audit trail.
 *
 * @class AuditEvent
 */
export class AuditEvent {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the audit event.
     * @param {string} params.eventCode - Event identifier, such as EVT-89412.
     * @param {string} params.occurredAt - When it happened (ISO 8601, UTC).
     * @param {string} params.actor - Who or what performed it.
     * @param {string} params.actorRole - Role of the actor.
     * @param {string} params.event - What happened.
     * @param {string} params.record - Affected record.
     * @param {string} params.result - Result of the event.
     * @param {string} params.field - Changed field, if any.
     * @param {string} params.before - Value before the change.
     * @param {string} params.after - Value after the change.
     * @param {string} params.reason - Reason of the change.
     */
    constructor({id = 0, eventCode = '', occurredAt = '', actor = '', actorRole = '', event = '', record = '', result = '', field = '', before = '', after = '', reason = ''}) {
        this.id = id;
        this.eventCode = eventCode;
        this.occurredAt = occurredAt;
        this.actor = actor;
        this.actorRole = actorRole;
        this.event = event;
        this.record = record;
        this.result = result;
        this.field = field;
        this.before = before;
        this.after = after;
        this.reason = reason;
    }
}
