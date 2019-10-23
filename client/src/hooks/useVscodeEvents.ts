import cardStore from '../store/cardStore';
import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { StudyNote } from '../store/types';

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
        const data: StudyNote = payload;
        cards.setCurrentStudyNote(data);
        history.push("/info")
      }
    });
    if(vsCode) {
      vsCode.postMessage({ command: 'ready' });
    }
  }, [history, cards]);
}

export default useVscodeEvents;