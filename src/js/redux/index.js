import { createStore, compose, applyMiddleware } from 'redux'
import initialState from './initialState'
import rootReducer from './reducers'
import thunk from 'redux-thunk'

const middleWare = applyMiddleware( thunk )

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose


const store = createStore(rootReducer, initialState, composeEnhancers(middleWare))

export default store