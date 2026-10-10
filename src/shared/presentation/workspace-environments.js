/**
 * Environments of the Web Application. Each role signs in to one of them and sees its own navigation.
 * Each bounded context adds its pages to the navigation of the environment that uses them.
 */
export const workspaceEnvironments = {
    qa: {
        key: 'qa',
        accent: 'teal',
        icon: 'pi pi-verified',
        features: ['documents', 'analytical-results', 'deviations-capa', 'batch-release', 'audits'],
        navigation: []
    },
    production: {
        key: 'production',
        accent: 'blue',
        icon: 'pi pi-cog',
        features: ['products-formulas', 'production-orders', 'batch-execution', 'raw-material-receipt'],
        navigation: [
            { to: '/production/orders', label: 'nav.production-orders' },
            { to: '/production/products', label: 'nav.products-formulas' },
            { to: '/production/batches', label: 'nav.batches' },
            { to: '/production/raw-materials', label: 'nav.raw-materials' }
        ]
    },
    administration: {
        key: 'administration',
        accent: 'slate',
        icon: 'pi pi-shield',
        features: ['organization-plants', 'users-roles', 'subscription-payments', 'profile-preferences'],
        navigation: [
            { to: '/administration/subscription', label: 'nav.subscription-payments' }
        ]
    }
};

/**
 * Returns the first page of an environment, where the user lands after signing in.
 * @param {string} environment - Environment key.
 * @returns {string} Route of the first page.
 */
export const homeOf = (environment) => workspaceEnvironments[environment]?.navigation[0]?.to ?? `/${environment}`;
