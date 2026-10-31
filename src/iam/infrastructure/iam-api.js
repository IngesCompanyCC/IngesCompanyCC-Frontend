import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const roleProfilesEndpointPath = import.meta.env.VITE_ROLE_PROFILES_ENDPOINT_PATH;
const invitationsEndpointPath = import.meta.env.VITE_INVITATIONS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the IAM endpoints.
 *
 * @class IamApi
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    #usersEndpoint;
    #roleProfilesEndpoint;
    #invitationsEndpoint;

    /** Creates the endpoint clients for users, role profiles and invitations. */
    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
        this.#roleProfilesEndpoint = new BaseEndpoint(this, roleProfilesEndpointPath);
        this.#invitationsEndpoint = new BaseEndpoint(this, invitationsEndpointPath);
    }

    /**
     * Finds the users that match the credentials of the command.
     * The fake API filters users by query parameters; the DoofPlus RESTful API will expose a sign-in endpoint.
     * @param {import('../domain/model/sign-in.command.js').SignInCommand} signInCommand - Email and password.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the matching users.
     */
    findUsersByCredentials(signInCommand) {
        return this.http.get(usersEndpointPath, {params: {email: signInCommand.email, password: signInCommand.password}});
    }

    /**
     * Finds the user with the given identifier and two-factor code.
     * @param {number} userId - Identifier of the user that is signing in.
     * @param {string} code - Six-digit code from the authenticator app.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the user when the code is valid.
     */
    findUsersByTwoFactorCode(userId, code) {
        return this.http.get(usersEndpointPath, {params: {id: userId, twoFactorCode: code}});
    }

    /**
     * Creates a user account with its password.
     * The fake API stores the password with the user; the DoofPlus RESTful API will hash it in a sign-up endpoint.
     * @param {Object} resource - User resource built by the UserAssembler, with the password.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the created user.
     */
    createUser(resource) {
        return this.#usersEndpoint.create(resource);
    }

    /**
     * Retrieves the users of the organization.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the user resources.
     */
    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    /**
     * Retrieves the role profiles of the role-based access control.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the role profile resources.
     */
    getRoleProfiles() {
        return this.#roleProfilesEndpoint.getAll();
    }

    /**
     * Retrieves the invitations sent by the administrator.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the invitation resources.
     */
    getInvitations() {
        return this.#invitationsEndpoint.getAll();
    }

    /**
     * Sends an invitation to a new member of the team.
     * @param {Object} resource - Invitation resource built by the InvitationAssembler.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the created invitation.
     */
    createInvitation(resource) {
        return this.#invitationsEndpoint.create(resource);
    }
}
