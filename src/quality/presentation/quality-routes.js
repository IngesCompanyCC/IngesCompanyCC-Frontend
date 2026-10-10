const qualityOverview = () => import('./views/quality-overview/quality-overview.vue');
const qualityIndicators = () => import('./views/quality-indicators/quality-indicators.vue');
const documentManagement = () => import('./views/document-management/document-management.vue');
const deviationDetail = () => import('./views/deviation-detail/deviation-detail.vue');
const capaManagement = () => import('./views/capa-management/capa-management.vue');
const batchRelease = () => import('./views/batch-release/batch-release.vue');
const analyticalResults = () => import('./views/analytical-results/analytical-results.vue');
/**
 * Routes shared by every environment: audit trail and tasks.
 */
export const qualitySharedRoutes = [];

/**
 * QA/QC routes of the Quality & Compliance bounded context.
 */
export const qualityRoutes = [
    { path: 'overview', component: qualityOverview, meta: { title: 'Quality overview' } },
    { path: 'indicators', component: qualityIndicators, meta: { title: 'Quality indicators' } },
    { path: 'documents', component: documentManagement, meta: { title: 'Quality documents' } },
    { path: 'deviations', component: deviationDetail, meta: { title: 'Deviations' } },
    { path: 'capa', component: capaManagement, meta: { title: 'CAPA plans' } },
    { path: 'batch-release', component: batchRelease, meta: { title: 'Batch release' } },
    { path: 'analytical-results', component: analyticalResults, meta: { title: 'Analytical results' } }
];
