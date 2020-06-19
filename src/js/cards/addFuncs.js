import * as ACTIONS from '../redux/actions'

export function debounce( f, ms ) {
    let isReady = true

    return function() {
        if (!isReady) return
            f.apply(this, arguments)
        isReady = false
        setTimeout( () => isReady = true, ms )
    }
}

let setFlySort = debounce((ev, that, type, store) => {

    let { cards, cardsInfo, rerender } = store.getState()
    let draggEl = cardsInfo.find( el => el.draggable )

    if (draggEl) {
        let draggID = draggEl?.id
        let cardsFilter = cards.filter(el => el.type === type && el.id !== draggID).sort( (a,b) => {
            return cardsInfo.find(el => el.id === a.id).sort - cardsInfo.find(el => el.id === b.id).sort
        } )

        let sortIndex = cardsFilter.reduce((acc, el) => {
            
            if ( el.$el.getBoundingClientRect().y + el.$el.offsetHeight / 2 < ev.clientY ) {
                return cardsInfo.find(currentEl => currentEl.id === el.id)?.sort + 1
            } else {
                return acc
            }
        }, Number.NEGATIVE_INFINITY)


        sortIndex = (sortIndex < 0) ? 1 : sortIndex 


        if ( sortIndex !== draggEl.sort || type !== draggEl.type ) {

            store.dispatch(ACTIONS.UPDATE_INFO({
                id: draggID,
                sort: sortIndex,
                type: type
            }))

            cardsInfo.filter( el => el.sort >= sortIndex && el.type === type && el.id !== draggID).forEach( el => {
                store.dispatch(ACTIONS.UPDATE_INFO({
                    id: el.id,
                    sort: el.sort + 1,
                }))
            })
        }
    }

}, 150)


export { setFlySort }