import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the IAM endpoints.
 *
 * @class IamApi
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    #usersEndpoint;

    /** Creates the endpoint client for users. */
    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
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
     * Retrieves the users of the organization.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with the user resources.
     */
    getUsers() {
        return this.#usersEndpoint.getAll();
    }
}
