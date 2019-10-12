import cardStore from '../store/cardStore';
import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';

const vsCodeFunction = Function(`
  if (typeof acquireVsCodeApi === 'function') {
    return acquireVsCodeApi();
  } else {
    return undefined;
  }`
);

function useVscodeEvents(){
  const history = useHistory();
  const cards = useContext(cardStore)

  useEffect(() => {

    const vsCode = vsCodeFunction();
  
    window.addEventListener('message', (event: any) => {
      const { command, payload } = event.data;
      if (command === 'study_note') {
        const { name, lastReview } = payload;
        cards.setCurrentStudyNote({ name, lastReviewed: lastReview });
        history.push("/info")
      }
    });
    if(vsCode) {
      vsCode.postMessage({ command: 'ready' });
    }
  }, [history, cards]);
}

export default useVscodeEvents;