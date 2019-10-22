import { observable, action, configure, computed  } from 'mobx';
import { StudyNote } from './types';
import moment from 'moment';
import { createContext } from 'react';
configure({ enforceActions: "observed" });

class CardsStore {
    @observable public currentStudyNote: StudyNote = {
        name: "Bayesian machine learning",
        lastReview: new Date(),
        cards: [
            {
                title: "Card1",
                deck: "Deck1"
            },
            {
                title: "Card2",
                deck: "Deck1"
            },
            {
                title: "Card3",
                deck: "Deck2"
            },
        ]
    }

    @action.bound
    async setCurrentStudyNote(note: StudyNote) {
        this.currentStudyNote = note;
    }

    @computed
    get lastReviewedFromNow(): string {
        if(this.currentStudyNote && this.currentStudyNote.lastReview) {
            return moment(this.currentStudyNote.lastReview,'YYYYMMDD').fromNow();
        } else {
            return "Never";
        }
    }
}
export { CardsStore };

export default createContext(new CardsStore());