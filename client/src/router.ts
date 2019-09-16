import Vue from 'vue';
import Router from 'vue-router';
import StudyNoteOverview from '@/views/StudyNoteOverview.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '#/',
      name: 'home',
      component: StudyNoteOverview,
    },
  ],
});
