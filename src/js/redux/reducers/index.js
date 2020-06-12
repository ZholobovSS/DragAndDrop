import { combineReducers } from 'redux'
import doneCards from './doneCards'
import progressCards from './progressCards'
import newCards from './newCards'

const rootReducer = combineReducers({
    newCards,
    progressCards,
    doneCards
})

export default rootReducer

