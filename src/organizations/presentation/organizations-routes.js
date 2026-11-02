const organizationRegistration = () => import('./views/organization-registration/organization-registration.vue');
const administrationOverview = () => import('./views/administration-overview/administration-overview.vue');
const profilePreferences = () => import('./views/profile-preferences/profile-preferences.vue');
const contactUs = () => import('./views/contact-us/contact-us.vue');

/**
 * Public route of the organization registration.
 */
export const organizationsPublicRoutes = [
    { path: '', name: 'organization-registration', component: organizationRegistration, meta: { title: 'Organization registration' } }
];

/**
 * Public route of the Contact us form, shown in the public layout next to the sign-in.
 */
export const organizationsContactRoutes = [
    { path: '', name: 'contact-us', component: contactUs, meta: { title: 'Contact us' } }
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
