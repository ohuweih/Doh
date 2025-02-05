import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './styles/toolbar.css';
import './styles/tablemodal.css';
import './styles/linkmodal.css';
import './styles/justify.css';
import './styles/exportmodal.css';
import './styles/admonitions.css';
import './styles/underline.css';
import './styles/strikethrough.css';
import './styles/collapiblebase64.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
