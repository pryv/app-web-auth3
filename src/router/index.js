import Vue from 'vue';
import VueRouter from 'vue-router';
import RegisterUser from '@/components/views/RegisterUser';
import ResetPassword from '@/components/views/ResetPassword';
import Authorization from '@/components/views/Authorization';
import Context from '../Context.js';

Vue.use(VueRouter);

let Router = new VueRouter({
  mode: 'history',
  base: 'access',
  routes: [
    {
      path: '/',
      redirect: {name: 'Authorization'},
    },
    {
      path: '/auth',
      name: 'Authorization',
      component: Authorization,
      alias: '/access.html',
    },
    {
      path: '/register',
      name: 'RegisterUser',
      component: RegisterUser,
      alias: '/register.html',
    },
    {
      path: '/reset',
      name: 'ResetPassword',
      component: ResetPassword,
      props: (route) => ({
        resetToken: route.query.resetToken,
      }),
      alias: '/reset-password.html',
    },
  ],
});

Router.beforeEach((to, from, next) => {
  // When we first open a page ('from', the origin page, is empty)
  // init the app context with query parameters ('to' is the target page)
  if (from.name == null) {
    Context.init(to.query);
  }
  next();
});

export default Router;
