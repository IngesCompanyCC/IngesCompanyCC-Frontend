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

router.beforeEach((to, from) => {
    let baseTitle = 'IngesCompany';
    document.title = ` - `;
    return true;
});

export default router;
