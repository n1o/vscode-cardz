import React, { FC, useContext } from 'react';
import cardsStore from '../store/cardStore';
import { observer } from 'mobx-react-lite';

const StudyNotesInfo: FC = () => {
    const cards = useContext(cardsStore);

    if(cards.currentStudyNote) {
        const { name } = cards.currentStudyNote;
        return (
            <div className="flex flex-row">
                <div className="px-4 py-2 font-bold"> Note: <span className="font-light">{name}</span> </div>
                <div className="px-4 py-2 font-bold"> Last reviewed <span className="font-light">{ cards.lastReviewedFromNow }</span> </div>
            </div>
        );
    } else {
        return (
            <div>No Study note selected</div>
        )
    }
   
}

export default observer(StudyNotesInfo);