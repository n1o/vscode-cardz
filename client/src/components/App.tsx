import React from 'react';
import StudyNotesInfo from './StudyNotesInfo';
import { Route, Switch } from 'react-router-dom';
import useVscodeEvents from '../hooks/useVscodeEvents';

const App: React.FC = () => {
  useVscodeEvents();
  return (
    <div>
        <Switch>
          <Route path="/info">
            <StudyNotesInfo />
          </Route>
        </Switch>
    </div>
  );
}

export default App;