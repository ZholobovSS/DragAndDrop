import * as CONSTANTS from '../../constants'

const newCards = ( state = [], action ) => {
    switch (action.type) {
        case CONSTANTS.ADD_NEW:
            return [ ...state, action.payload ]
        default:
            return state
    }
}

export default newCards