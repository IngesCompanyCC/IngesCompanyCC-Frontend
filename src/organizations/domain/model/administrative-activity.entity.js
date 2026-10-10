/**
 * Represents an administrative event of the organization, such as an invitation or a profile change.
 *
 * @class AdministrativeActivity
 */
export class AdministrativeActivity {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the administrative activity.
     * @param {string} params.title - Description of the event.
     * @param {string} params.actor - Person or system that performed the event.
     * @param {string} params.occurredAt - Date and time of the event (ISO 8601).
     */
    constructor({id = 0, title = '', actor = '', occurredAt = ''}) {
        this.id = id;
        this.title = title;
        this.actor = actor;
        this.occurredAt = occurredAt;
    }
}
