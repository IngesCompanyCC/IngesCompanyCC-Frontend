/**
 * Represents an invitation sent by the laboratory administrator to a new member of the team.
 *
 * @class Invitation
 */
export class Invitation {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique invitation identifier.
     * @param {string} params.fullName - Full name of the invited person.
     * @param {string} params.email - Work email that receives the invitation.
     * @param {string} params.role - Role key the invited person will have.
     * @param {string} params.facility - Facilities the invited person will access.
     * @param {string} params.note - Optional note for the invited person.
     * @param {string} params.status - Invitation status (pending or accepted).
     * @param {string} params.sentAt - ISO 8601 date and time when the invitation was sent.
     */
    constructor({id = 0, fullName = '', email = '', role = '', facility = '', note = '', status = 'pending', sentAt = ''}) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.facility = facility;
        this.note = note;
        this.status = status;
        this.sentAt = sentAt;
    }
}
