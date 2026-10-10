import {createRouter, createWebHistory} from "vue-router";
import iamRoutes from "./iam/presentation/iam-routes.js";
import manufacturingRoutes from "./manufacturing/presentation/manufacturing-routes.js";
import subscriptionsRoutes from "./subscriptions/presentation/subscriptions-routes.js";
import {authenticationGuard} from "./iam/infrastructure/authentication.guard.js";
import useIamStore from "./iam/application/iam.store.js";
import {homeOf} from "./shared/presentation/workspace-environments.js";

const layout = () => import('./shared/presentation/components/layout.vue');
const publicLayout = () => import('./shared/presentation/components/public-layout.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

/** Page not found inside a workspace, so unknown pages keep the sidebar of the environment. */
const notFound = { path: ':pathMatch(.*)*', component: pageNotFound, meta: { title: 'Page Not Found' } };

const routes = [
    { path: '/sign-in',          component: publicLayout, children: iamRoutes },
    { path: '/qa',               component: layout,       meta: { environment: 'qa' },             children: [notFound] },
    { path: '/production',       component: layout,       meta: { environment: 'production' },     children: [...manufacturingRoutes, notFound] },
    { path: '/administration',   component: layout,       meta: { environment: 'administration' }, children: [...subscriptionsRoutes, notFound] },
    { path: '/',                 redirect: () => {
        const user = useIamStore().currentUser;
        return user ? homeOf(user.environment) : '/sign-in';
    }},
    { path: '/:pathMatch(.*)*',  component: publicLayout, children: [
        { path: '', name: 'not-found', component: pageNotFound, meta: { title: 'Page Not Found' } }
    ]}
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

/**
 * Global navigation guard that sets the document title from the route meta and protects the workspaces.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @returns {boolean|string|Object} True to allow navigation, or the route to redirect to.
 */
router.beforeEach((to) => {
    const baseTitle = 'DoofPlus';
    document.title = to.meta['title'] ? `${baseTitle} - ${to.meta['title']}` : baseTitle;
    return authenticationGuard(to);
});

export default router;
