const iotOverview = () => import('./views/iot-overview/iot-overview.vue');

const equipmentInventory = () => import('./views/equipment-inventory/equipment-inventory.vue');
const sensorDetail = () => import('./views/sensor-detail/sensor-detail.vue');
/**
 * Production routes of the IoT Monitoring bounded context.
 */
export default [
    { path: 'iot', component: iotOverview, meta: { title: 'IoT overview' } },
    { path: 'equipment', component: equipmentInventory, meta: { title: 'Equipment & sensors' } },
    { path: 'sensors/:code', component: sensorDetail, meta: { title: 'Sensor detail' }, props: true }
];
