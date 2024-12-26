import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import { StateContextProvider } from './context';
import App from './App';
import './index.css';


import {ToastContainer} from 'react-toastify' 
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Router>
      <StateContextProvider>
      <ToastContainer position='top-center' autoClose='3000' theme='colored' />
        <App />
      </StateContextProvider>
    </Router>
)