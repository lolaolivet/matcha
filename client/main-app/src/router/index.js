import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Chat from '@/components/chat/Chat';
import Loader from '@/components/Loader';
import NotFound from '@/components/NotFound';
import Swipper from '@/components/matcher/Swipper';
import Matcher from '@/components/matcher/Matcher';
import Profile from '@/components/profile/Profile';
import Preferences from '@/components/matcher/Preferences';
import PawPage from '@/components/paw/PawPage';
import Stats from '@/components/matcher/Stats';
import ProfileEdit from '@/components/profile-edit/ProfileEdit';
import { config } from '../config';
import { store } from '@/vuex/store';

Vue.use(Router);

const TITLE_BEG = 'Matcha';
const TITLE_MID = ' - ';
const writeTitle = (end) => TITLE_BEG + TITLE_MID + end;

const router = new Router({
  mode: 'history',
  base: config.scope,
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: { name: 'Swipper' },
      component: Home,
      meta: {
        title: writeTitle('Home')
      }
    },
    {
      path: '/paw',
      alias: ['/set-paw'],
      name: 'PawPage',
      component: PawPage,
      meta: {
        title: writeTitle('P.A.W.')
      }
    },
    {
      path: '/edit',
      name: 'Edit',
      component: ProfileEdit,
      meta: {
        title: writeTitle('Edit')
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        title: writeTitle('profile')
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
      path: '/chat',
      name: 'Chat',
      component: Chat,
      meta: {
        title: writeTitle('Chat')
      }
    },
    {
      path: '/swipper',
      name: 'Swipper',
      component: Swipper,
      meta: {
        title: writeTitle('Swipper')
      }
    },
    {
      path: '/matcher',
      name: 'Matcher',
      component: Matcher,
      meta: {
        title: writeTitle('Matcher')
      }
    },
    {
      path: '/pref',
      name: 'Preferences',
      component: Preferences,
      meta: {
        title: writeTitle('preferences')
      }
    },
    {
      path: '/stats',
      name: 'Stats',
      component: Stats,
      meta: {
        title: writeTitle('statistiques')
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
  store.dispatch('checkAuth');

  // Force to edit profile if not complete
  // if (
  //   (store.state.profile.loaded && store.state.images.loaded &&
  //     (store.getters.incompleteProfile || store.getters.noProfileImage)) &&
  //   to.name &&
  //   !(to.name === 'Edit' || to.name === 'Home')
  // ) {
  //   store.dispatch('temporaryFlag', { message: 'Please fill your profile to continue!', type: 'negative' });
  //   return (next({ name: 'Edit' }));
  // } else if (store.state.paw.loaded === undefined && to.name && !(to.name === 'SetPaw' || to.name === 'Home' || to.name === 'Edit')) {
  //   // Force to edit paw if not set
  //   store.dispatch('temporaryFlag', { message: 'Please fill that to continue!', type: 'negative' });
  //   return (next({ name: 'SetPaw' }));
  // }
  next(); // beforeEach must finish with a next() for the component to be rendered.
});

export default router;
