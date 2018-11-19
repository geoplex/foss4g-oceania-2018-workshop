import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './modules';

const initialState = {};
const enhancers = [];
const middleware = [thunk];

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

export default createStore(rootReducer, initialState, composedEnhancers);
