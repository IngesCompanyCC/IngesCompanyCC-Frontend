const organizationRegistration = () => import('./views/organization-registration/organization-registration.vue');
const administrationOverview = () => import('./views/administration-overview/administration-overview.vue');
const profilePreferences = () => import('./views/profile-preferences/profile-preferences.vue');

/**
 * Public route of the organization registration.
 */
export const organizationsPublicRoutes = [
    { path: '', name: 'organization-registration', component: organizationRegistration, meta: { title: 'Organization registration' } }
];

/**
 * Administration routes of the Organization Management bounded context.
 */
export const organizationsAdministrationRoutes = [
    { path: 'overview', component: administrationOverview, meta: { title: 'Administration overview' } }
];

/**
 * Profile route available in every environment.
 */
export const profileRoutes = [
    { path: 'profile', component: profilePreferences, meta: { title: 'Profile & preferences' } }
];
