import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Login from '@/components/Login';
import Register from '@/components/Register';
import Contact from '@/components/Contact';
import Loader from '@/components/Loader';
import ForgotPassword from '@/components/ForgotPassword';
import ReinitializePwd from '@/components/ReinitializePwd';
import NotFound from '@/components/NotFound';
import Confirm from '@/components/Confirm';
import { store } from '@/vuex/store';

Vue.use(Router);

const TITLE_BEG = 'Matcha';
const TITLE_MID = ' - ';
const writeTitle = (end) => TITLE_BEG + TITLE_MID + end;

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: { name: 'Login' },
      component: Home,
      meta: {
        title: writeTitle('Login')
      }
    },
    {
      path: '/login',
      alias: ['/connexion', '/connection'],
      name: 'Login',
      component: Login,
      meta: {
        title: writeTitle('Login')
      }
    },
    {
      path: '/register',
      alias: ['/new-account'],
      name: 'Register',
      component: Register,
      meta: {
        title: writeTitle('Register')
      }
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact,
      meta: {
        title: writeTitle('Contact')
      }
    },
    {
      path: '/loader',
      name: 'Loader',
      component: Loader,
      meta: {
        title: writeTitle('woohoo!')
      }
    },
    {
      path: '/new-pwd',
      name: 'ReinitializePwd',
      component: ReinitializePwd,
      meta: {
        title: writeTitle('reinitialize password')
      }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword,
      meta: {
        title: writeTitle('forgot password')
      }
    },
    {
      path: '/confirm',
      name: 'Confirm',
      component: Confirm,
      meta: {
        title: writeTitle('confirmation')
      }
    },
    {
      path: '*',
      name: '404',
      component: NotFound,
      meta: {
        title: writeTitle('404')
      }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    /* Pattern for special cases : */
    // let travellingBetweenArchives =
    //   from.name === 'ArchiveSingle' && to.name === 'ArchiveSingle';
    // if (savedPosition || travellingBetweenArchives)
    //   return savedPosition;
    // else

    return { x: 0, y: 0 };
  }
});

router.beforeEach((to, from, next) => {
  // Write the title
  document.title = to.meta.title;

  /* Concatenate params with this : */
  if (to.params && to.params.name)
    document.title += ' - ' + to.params.name;

  // Reset loading
  store.commit('LOADING_OFF');
  store.commit('LOCAL_LOADING_OFF');
  next(); // beforeEach must finish with a next() for the component to be rendered.
});

export default router;
