import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/store';
import fromNow from './filters/fromNow';

Vue.config.productionTip = false;

Vue.filter('fromNow', fromNow);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
