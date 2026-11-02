/**
 * Represents an inquiry sent by a visitor from the Contact us form of the Web Application.
 *
 * @class ContactInquiry
 */
export class ContactInquiry {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the inquiry.
     * @param {string} params.fullName - Full name of the visitor.
     * @param {string} params.email - Email where the team answers the inquiry.
     * @param {string} params.message - Question of the visitor.
     * @param {string} params.status - Status of the inquiry (received or answered).
     * @param {string} params.receivedAt - ISO 8601 date and time when the inquiry was received.
     */
    constructor({id = 0, fullName = '', email = '', message = '', status = 'received', receivedAt = ''}) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.message = message;
        this.status = status;
        this.receivedAt = receivedAt;
    }
}
