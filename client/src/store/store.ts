import Vue from 'vue';
import Vuex from 'vuex';
import { State } from './types';

Vue.use(Vuex);

const state: State =  {
  currentStudyNote: {
    name: 'Bayesian Machine Learning',
    lastReviewed: new Date(),
  },
};

export default new Vuex.Store({ state });
