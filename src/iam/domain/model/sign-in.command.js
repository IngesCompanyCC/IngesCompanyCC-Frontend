/**
 * Command with the credentials a user enters to sign in to an environment.
 *
 * @class SignInCommand
 */
export class SignInCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.email - Work email of the user.
     * @param {string} params.password - Password of the user.
     * @param {string} params.environment - Environment the user wants to enter.
     */
    constructor({email, password, environment}) {
        this.email = email;
        this.password = password;
        this.environment = environment;
    }
}
