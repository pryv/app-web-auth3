import Vue from 'vue';
import VueRouter from 'vue-router';
import RegisterUser from '@/components/views/RegisterUser';
import ResetPassword from '@/components/views/ResetPassword';
import Authorization from '@/components/views/Authorization';
import Context from '../Context.js';

Vue.use(VueRouter);

let Router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Authorization,
    },
    {
      path: '*/access.html',
      redirect: {name: 'Authorization'},
    },
    {
      path: '*/register.html',
      redirect: {name: 'RegisterUser'},
    },
    {
      path: '*/reset-password.html',
      redirect: {name: 'ResetPassword'},
    },
    {
      path: '/auth',
      name: 'Authorization',
      component: Authorization,
    },
    {
      path: '/register',
      name: 'RegisterUser',
      component: RegisterUser,
    },
    {
      path: '/reset',
      name: 'ResetPassword',
      component: ResetPassword,
      props: (route) => ({
        resetToken: route.query.resetToken,
      }),
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
