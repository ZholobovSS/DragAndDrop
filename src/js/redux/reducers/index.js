import { combineReducers } from 'redux'
import cards from './cards'
import cardsInfo from './cardsInfo'

const rootReducer = combineReducers({
    cards,
    cardsInfo
})

export default rootReducer

