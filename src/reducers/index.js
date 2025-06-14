import { combineReducers } from 'redux';
import loginReducer from './login';

//debugger

const allReducers = combineReducers({
    loginReducer,
});

export default allReducers;