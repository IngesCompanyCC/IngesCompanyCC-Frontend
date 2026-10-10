const productionOverview = () => import('./views/production-overview/production-overview.vue');
const orderList = () => import('./views/order-list/order-list.vue');
const orderDetail = () => import('./views/order-detail/order-detail.vue');
const productCatalog = () => import('./views/product-catalog/product-catalog.vue');
const batchList = () => import('./views/batch-list/batch-list.vue');
const batchDetail = () => import('./views/batch-detail/batch-detail.vue');
const materialReceipt = () => import('./views/material-receipt/material-receipt.vue');

export default [
  { path: 'overview', component: productionOverview, meta: { title: 'Production overview' } },
  { path: 'orders', component: orderList, meta: { title: 'Production orders' } },
  { path: 'orders/:code', component: orderDetail, meta: { title: 'Production order' }, props: true },
  { path: 'products', component: productCatalog, meta: { title: 'Products & formulas' } },
  { path: 'batches', component: batchList, meta: { title: 'Batches' } },
  { path: 'batches/:code', component: batchDetail, meta: { title: 'Batch detail' }, props: true },
  { path: 'raw-materials', component: materialReceipt, meta: { title: 'Raw-material receipt' } },
];
