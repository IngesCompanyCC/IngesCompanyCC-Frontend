/**
 * Represents the personal data and notification preferences of a user.
 *
 * @class UserProfile
 */
export class UserProfile {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique identifier of the user profile.
     * @param {number} params.userId - Identifier of the IAM user the profile belongs to.
     * @param {string} params.firstName - First name.
     * @param {string} params.lastName - Last name.
     * @param {string} params.email - Work email, managed by IAM.
     * @param {string} params.area - Area where the user works.
     * @param {string} params.site - Site where the user works.
     * @param {boolean} params.emailNotifications - Whether critical events are sent by email.
     * @param {boolean} params.inAppNotifications - Whether tasks and alerts appear in the notification bell.
     * @param {string} params.language - Preferred language (en or es).
     */
    constructor({id = 0, userId = 0, firstName = '', lastName = '', email = '', area = '', site = '', emailNotifications = false, inAppNotifications = false, language = ''}) {
        this.id = id;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.area = area;
        this.site = site;
        this.emailNotifications = emailNotifications;
        this.inAppNotifications = inAppNotifications;
        this.language = language;
    }
}
