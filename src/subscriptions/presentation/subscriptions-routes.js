const subscriptionManagement = () => import('./views/subscription-management/subscription-management.vue');

/**
 * Administration routes of the Subscriptions & Payments bounded context.
 */
const subscriptionsRoutes = [
    { path: 'subscription', component: subscriptionManagement, meta: { title: 'Subscriptions & payments' } }
];

export default subscriptionsRoutes;
