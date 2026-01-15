import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { BrowserRouter } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import { createStore } from 'redux';
import allReducers from './reducers';
import { Provider } from 'react-redux';

const store = createStore(allReducers);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    {/* <BrowserRouter> */}
    {/* <BrowserRouter basename="/Thang6.FE">
      <App />
    </BrowserRouter> */}
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
