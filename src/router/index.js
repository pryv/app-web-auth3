import Vue from 'vue';
import VueRouter from 'vue-router';
import Main from '@/components/views/Main';

Vue.use(VueRouter);

const Router = new VueRouter({
  routes: [
    {
      path: '/access',
      name: 'Main',
      component: Main,
      props: route => Object.assign({}, route.params, route.query),
    },
  ],
});

export default Router;
