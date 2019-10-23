import React, { FC, useContext } from 'react';
import cardsStore from '../store/cardStore';
import { observer } from 'mobx-react-lite';
import CardList from './CardsList';

const StudyNotesInfo: FC = () => {
    const cardsContext = useContext(cardsStore);

    if(cardsContext.currentStudyNote) {
        const { name, cards } = cardsContext.currentStudyNote;
        return (
            <div>
                <div className="flex flex-row">
                    <div className="px-4 py-2 font-bold"> Note: <span className="font-light">{name}</span> </div>
                    <div className="px-4 py-2 font-bold"> Last reviewed <span className="font-light">{ cardsContext.lastReviewedFromNow }</span> </div>
                </div>
                <CardList cards={cards} />
            </div>
        );
    } else {
        return (
            <div>No Study note selected</div>
        )
    }
   
}

export default observer(StudyNotesInfo);