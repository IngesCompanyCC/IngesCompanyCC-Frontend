import {createRouter, createWebHistory} from "vue-router";
import manufacturingRoutes from "./manufacturing/presentation/manufacturing-routes.js";

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    { path: '/production', name: 'production', children: manufacturingRoutes },
    { path: '/', redirect: '/production/overview' },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'Page Not Found' } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

/**
 * Global navigation guard that sets the document title from the route meta.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @returns {boolean} True to allow navigation.
 */
router.beforeEach((to) => {
    const baseTitle = 'DoofPlus';
    document.title = to.meta['title'] ? `${baseTitle} - ${to.meta['title']}` : baseTitle;
    return true;
});

export default router;
