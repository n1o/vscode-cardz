import { StudyNote } from './types';
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import store from './store';

@Module({ dynamic: true, namespaced: true, store, name: 'note' })
export default class StudyNotesModule extends VuexModule {
  public currentStudyNote: StudyNote = {
    name: 'Bayesian Machine Learning',
    lastReviewed: new Date(),
  };

  @Action
  public setStudyNote(note: StudyNote) {
    this.context.commit('mutateStudyNote', note);
  }

  @Mutation
  private mutateStudyNote(note: StudyNote) {
    this.currentStudyNote = note;
  }
}
