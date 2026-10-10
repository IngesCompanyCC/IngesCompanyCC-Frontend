const environmentSelection = () => import('./views/environment-selection.vue');
const signInForm = () => import('./views/sign-in-form.vue');

/**
 * Public IAM routes: environment selection and sign-in to one environment.
 */
const iamRoutes = [
    { path: '',             name: 'iam-environment-selection', component: environmentSelection, meta: { title: 'Sign in' } },
    { path: ':environment', name: 'iam-sign-in',               component: signInForm,           meta: { title: 'Sign in' }, props: true }
];

export default iamRoutes;
