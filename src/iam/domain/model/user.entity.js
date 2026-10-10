/**
 * Represents a user account of a laboratory in the IAM domain model.
 *
 * @class User
 */
export class User {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique user identifier.
     * @param {string} params.fullName - Full name of the user.
     * @param {string} params.initials - Initials shown in the avatar.
     * @param {string} params.email - Work email used to sign in.
     * @param {string} params.role - Role key assigned by the laboratory administrator.
     * @param {string} params.environment - Environment the role grants access to (qa, production or administration).
     * @param {string} params.facility - Facilities the user can access.
     * @param {string} params.status - Account status (active or invited).
     * @param {number} params.organizationId - Identifier of the organization the user belongs to.
     * @param {string} params.organizationName - Name of the laboratory organization.
     * @param {string} params.plant - Plant where the user works.
     * @param {string} params.privilege - Special privilege shown in the workspace.
     */
    constructor({id = 0, fullName = '', initials = '', email = '', role = '', environment = '', facility = '', status = 'active',
                    organizationId = 0, organizationName = '', plant = '', privilege = 'none'}) {
        this.id = id;
        this.fullName = fullName;
        this.initials = initials;
        this.email = email;
        this.role = role;
        this.environment = environment;
        this.facility = facility;
        this.status = status;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.plant = plant;
        this.privilege = privilege;
    }
}
