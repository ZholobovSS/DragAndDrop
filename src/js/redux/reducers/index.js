import { combineReducers } from 'redux'
import cards from './cards'
import cardsInfo from './cardsInfo'
import rerender from './rerender'

const rootReducer = combineReducers({
    cards,
    cardsInfo,
    rerender
})

export default rootReducer

