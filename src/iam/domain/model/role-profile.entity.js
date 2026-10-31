/**
 * Represents the permissions of a role in the role-based access control of the laboratory.
 *
 * @class RoleProfile
 */
export class RoleProfile {
    /**
     * @param {Object} params - Entity attributes.
     * @param {number} params.id - Unique profile identifier.
     * @param {string} params.key - Role key (e.g. qa-specialist).
     * @param {string} params.name - Display name of the role.
     * @param {Array<string>} params.createEdit - Records the role can create and edit.
     * @param {string} params.approveSign - What the role can approve or sign.
     * @param {string} params.restriction - Main restriction of the role.
     * @param {string} params.tone - Color tone of the role chip.
     */
    constructor({id = 0, key = '', name = '', createEdit = [], approveSign = '', restriction = '', tone = 'neutral'}) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.createEdit = createEdit;
        this.approveSign = approveSign;
        this.restriction = restriction;
        this.tone = tone;
    }
}
