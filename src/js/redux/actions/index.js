import * as CONSTANTS from '../constants'

export const ADD_NEW = (card) => {
    return {
        type: CONSTANTS.ADD_NEW,
        payload: card
    }
}
