import { observable, action, configure, computed  } from 'mobx';
import { StudyNote } from './types';
import moment from 'moment';
import { createContext } from 'react';
configure({ enforceActions: "observed" });

class CardsStore {
    @observable public currentStudyNote: StudyNote = {
        name: "Bayesian machine learning",
        lastReviewed: new Date()
    }

    @action.bound
    async setCurrentStudyNote(note: StudyNote) {
        this.currentStudyNote = note;
    }

    @computed
    get lastReviewedFromNow(): string {
        if(this.currentStudyNote) {
            return moment(this.currentStudyNote.lastReviewed,'YYYYMMDD').fromNow();
        } else {
            return "";
        }
    }
}

export default createContext(new CardsStore());