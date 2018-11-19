import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './containers/app/App';
import { Provider } from 'react-redux';
import store from './store';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Provider store={store}>
    <div>
      <App/>
    </div>
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
