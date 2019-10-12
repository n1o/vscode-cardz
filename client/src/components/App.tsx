import React, { useEffect, useContext } from 'react';
import StudyNotesInfo from './StudyNotesInfo';
import cardStore, { CardsStore } from '../store/cardStore';

const App: React.FC = () => {
  const cards = useContext(cardStore)

  useVscodeEvents(cards);

  return (
    <div>
      <StudyNotesInfo />
    </div>
  );
}

export default App;


const vsCodeFunction = Function(`
  if (typeof acquireVsCodeApi === 'function') {
    return acquireVsCodeApi();
  } else {
    return undefined;
  }`
);

function useVscodeEvents(cards: CardsStore){

  useEffect(() => {

    const vsCode = vsCodeFunction();
  
    window.addEventListener('message', (event: any) => {
      const { command, payload } = event.data;
      if (command === 'study_note') {
        const { path, name, lastReview } = payload;
        cards.setCurrentStudyNote({ name, lastReviewed: lastReview });
      }
    });
    if(vsCode) {
      vsCode.postMessage({ command: 'ready' });
    }
  }, []);
}