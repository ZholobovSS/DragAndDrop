
export function debounce( f, ms ) {
    let isReady = true

    return function() {
        if (!isReady) return
        f.apply(this, arguments)
        isReady = false
        setTimeout( () => isReady = true, ms )
    }
}

let testFunc = debounce((ev, that, type, store) => {

    console.log(id)
    let cards = store.getState().cards.filter(el => el.type === type && el.id !== id)



    let sortIndex = cards.reduce( (acc, el) => {
        if ( el.$el.getBoundingClientRect().y + el.$el.offsetHeight / 2 < ev.clientY ) {
            acc = el.sort + 1
        }
    }, Number.NEGATIVE_INFINITY)

    sortIndex = (sortIndex < 0 || !sortIndex) ? 1 : sortIndex 


},500)


export {testFunc}