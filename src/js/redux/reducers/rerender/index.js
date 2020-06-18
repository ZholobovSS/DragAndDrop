import * as CONSTANTS from '../../constants'

const rerender = ( state = true, action ) => {
    switch (action.type) {
        case CONSTANTS.RERENDER:
            return action.payload
        default:
            return state
    }
}

export default rerender