import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './styles/tailwind.css';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

ReactDOM.render(
    <MemoryRouter>
        <App />
    </MemoryRouter>,
    document.getElementById('root')
);