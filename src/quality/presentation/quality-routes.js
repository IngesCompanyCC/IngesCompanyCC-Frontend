const qualityOverview = () => import('./views/quality-overview/quality-overview.vue');
const qualityIndicators = () => import('./views/quality-indicators/quality-indicators.vue');
/**
 * Routes shared by every environment: audit trail and tasks.
 */
export const qualitySharedRoutes = [];

/**
 * QA/QC routes of the Quality & Compliance bounded context.
 */
export const qualityRoutes = [
    { path: 'overview', component: qualityOverview, meta: { title: 'Quality overview' } },
    { path: 'indicators', component: qualityIndicators, meta: { title: 'Quality indicators' } }
];
