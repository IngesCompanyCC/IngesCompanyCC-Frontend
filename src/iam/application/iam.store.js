import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {IamApi} from "../infrastructure/iam-api.js";
import {UserAssembler} from "../infrastructure/user.assembler.js";
import {homeOf} from "../../shared/presentation/workspace-environments.js";

const iamApi = new IamApi();
const SESSION_KEY = 'doofplus-session';

/**
 * Restores the session saved in local storage.
 * @returns {import('../domain/model/user.entity.js').User|null} The saved user, or null.
 */
const restoreSession = () => {
    try {
        const saved = localStorage.getItem(SESSION_KEY);
        return saved ? UserAssembler.toEntityFromResource(JSON.parse(saved)) : null;
    } catch {
        return null;
    }
};

/**
 * Application service store for the IAM bounded context.
 * It runs the sign-in flow (credentials, two-factor code and environment check) and keeps the session.
 *
 * @returns {Object} Store state and actions.
 */
const useIamStore = defineStore('iam', () => {
    /** @type {import('vue').Ref<import('../domain/model/user.entity.js').User|null>} User with an active session. */
    const currentUser = ref(restoreSession());
    /** @type {import('vue').Ref<import('../domain/model/user.entity.js').User|null>} User whose credentials were accepted. */
    const pendingUser = ref(null);
    /** @type {import('vue').Ref<string|null>} Environment the user asked to enter. */
    const requestedEnvironment = ref(null);
    /**
     * Current step of the sign-in flow: credentials, invalid-credentials, two-factor, invalid-code or not-authorized.
     * @type {import('vue').Ref<string>}
     */
    const signInStep = ref('credentials');
    /** @type {import('vue').Ref<boolean>} Whether a request is running. */
    const loading = ref(false);
    /** @type {import('vue').Ref<Array<Error>>} Errors of the last requests. */
    const errors = ref([]);
    /** @type {import('vue').ComputedRef<boolean>} Whether a user is signed in. */
    const isSignedIn = computed(() => currentUser.value !== null);

    /**
     * Validates the credentials of the command. A valid user continues to the two-factor step.
     * @param {import('../domain/model/sign-in.command.js').SignInCommand} signInCommand - Credentials and requested environment.
     */
    function signIn(signInCommand) {
        loading.value = true;
        iamApi.findUsersByCredentials(signInCommand)
            .then(response => {
                const [user] = UserAssembler.toEntitiesFromResponse(response);
                if (!user) {
                    signInStep.value = 'invalid-credentials';
                    return;
                }
                pendingUser.value = user;
                requestedEnvironment.value = signInCommand.environment;
                signInStep.value = 'two-factor';
                errors.value = [];
            })
            .catch(error => errors.value.push(error))
            .finally(() => loading.value = false);
    }

    /**
     * Checks the two-factor code. The session opens only if the role of the user belongs to the requested environment.
     * @param {string} code - Six-digit code from the authenticator app.
     * @param {import('vue-router').Router} router - Router used to open the workspace.
     */
    function verifyTwoFactorCode(code, router) {
        const user = pendingUser.value;
        if (!user) {
            signInStep.value = 'credentials';
            return;
        }
        loading.value = true;
        iamApi.findUsersByTwoFactorCode(user.id, code)
            .then(response => {
                if (!UserAssembler.toEntitiesFromResponse(response).length) {
                    signInStep.value = 'invalid-code';
                    return;
                }
                if (user.environment !== requestedEnvironment.value) {
                    signInStep.value = 'not-authorized';
                    return;
                }
                currentUser.value = user;
                localStorage.setItem(SESSION_KEY, JSON.stringify(UserAssembler.toResourceFromEntity(user)));
                resetSignIn();
                router.push(homeOf(user.environment));
            })
            .catch(error => errors.value.push(error))
            .finally(() => loading.value = false);
    }

    /** Returns the sign-in flow to the credentials step. */
    function resetSignIn() {
        pendingUser.value = null;
        requestedEnvironment.value = null;
        signInStep.value = 'credentials';
    }

    /**
     * Closes the session and returns to the environment selection.
     * @param {import('vue-router').Router} router - Router used to leave the workspace.
     */
    function signOut(router) {
        localStorage.removeItem(SESSION_KEY);
        currentUser.value = null;
        resetSignIn();
        router.push({name: 'iam-environment-selection'});
    }

    return {
        currentUser,
        pendingUser,
        signInStep,
        loading,
        errors,
        isSignedIn,
        signIn,
        verifyTwoFactorCode,
        resetSignIn,
        signOut
    };
});

export default useIamStore;
