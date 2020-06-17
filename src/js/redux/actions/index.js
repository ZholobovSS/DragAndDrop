import * as CONSTANTS from '../constants'

export const ADD_NEW_CLASS = (card) => {
    return {
        type: CONSTANTS.ADD_NEW_CLASS,
        payload: card
    }
}

export const ADD_NEW_INFO = (card) => {
    return {
        type: CONSTANTS.ADD_NEW_INFO,
        payload: card
    }
}

export const UPDATE_INFO = (newCardInfo) => {
    return {
        type: CONSTANTS.UPDATE_INFO,
        payload: newCardInfo
    }
}
