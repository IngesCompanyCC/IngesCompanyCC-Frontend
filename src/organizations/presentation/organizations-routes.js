const organizationRegistration = () => import('./views/organization-registration/organization-registration.vue');

/**
 * Public route of the organization registration.
 */
export const organizationsPublicRoutes = [
    { path: '', name: 'organization-registration', component: organizationRegistration, meta: { title: 'Organization registration' } }
];
