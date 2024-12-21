import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '../pages/main-page.vue';
// import TrackerPage from '../pages/tracker-page.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MainPage
  },
  // {
  //   path: '/tracker',
  //   name: 'Tracker',
  //   component: TrackerPage
  // },
  {
    path: '/tracker',
    name: 'Tracker',
    component: () => import('../components/search-address.vue')
  }
  // 更多路由...
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;