import useIamStore from "../application/iam.store.js";
import {homeOf} from "../../shared/presentation/workspace-environments.js";

/**
 * Navigation guard that protects the workspace of each environment.
 * Without a session it opens the sign-in of that environment; when the role of the user belongs to
 * another environment it sends the user to the home of their own environment.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route. Its environment comes from the route meta.
 * @returns {boolean|string|Object} True to allow navigation, or the route to redirect to.
 */
export const authenticationGuard = (to) => {
    const environment = to.meta['environment'];
    if (!environment) return true;
    const store = useIamStore();
    const user = store.currentUser;
    if (!user) return { name: 'iam-sign-in', params: { environment } };
    if (user.environment !== environment) return homeOf(user.environment);
    return true;
};
