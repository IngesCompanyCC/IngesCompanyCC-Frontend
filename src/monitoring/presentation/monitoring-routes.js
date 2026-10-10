const iotOverview = () => import('./views/iot-overview/iot-overview.vue');

/**
 * Production routes of the IoT Monitoring bounded context.
 */
export default [
    { path: 'iot', component: iotOverview, meta: { title: 'IoT overview' } }
];
