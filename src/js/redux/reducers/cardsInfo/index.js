import * as CONSTANTS from '../../constants'

const cardsInfo = ( state = [], action ) => {
    switch (action.type) {
        case CONSTANTS.ADD_NEW_INFO:
            return [ ...state, action.payload ]
        case CONSTANTS.UPDATE_INFO:
            console.log(action.payload)
            return state.map( el => {
                if (el.id === action.payload.id) {
                    return { ...el, ...action.payload }
                }
            } )
        default:
            return state
    }
}

export default cardsInfo