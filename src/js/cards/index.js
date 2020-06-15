import * as ACTIONS from '../redux/actions'
import store from '../redux/index'

export class Element {
    constructor (data) {
        this.$el = (typeof data === 'object') ? data : document.querySelector(data)
        this.disabled = false
    }

    addClass(className) {
        this.$el.classList.add(className)
    }

    removeClass(className) {
        this.$el.classList.remove(className)
    }

    addHandler(type, func) {
        this.$el.addEventListener(type, func)
    }

    checkDisabled(func) {
        this.disabled = (!func()) ? true : false
        this.setDisabled()
    }

    setDisabled(flag) {
        this.$el.disabled = flag || this.disabled
    }
}

export class FormElement extends Element {
    constructor (selector) {
        super(selector)
        this.valid = false
    }

    checkValid(func) {
        this.valid = func(this.$el)
        return this.valid
    }

    clear() {
        this.$el.value = ''
    }

    showMessage (message) {
        let template = `<div class="invalid-feedback">${message}</div>`
        this.$el.nextElementSibling?.remove()
        message.length && this.$el.insertAdjacentHTML('afterend', template)
    }
}

class Draggable extends Element {
    constructor(data) {
        super(data)
        this.draggableClass = 'draggable'
    }

    onDragStart(id) {
        this.addHandler('dragstart', ev => {
            this.addClass(this.draggableClass)
            ev.dataTransfer.setData('id', id)
        })
    }

    onDragOver() {
        this.addHandler('dragover', ev => {
            ev.preventDefault()
        })
    }

    onDrop(type) {
        this.addHandler('drop', ev => {
            ev.preventDefault()
            let dragID = ev.dataTransfer.getData('id')
            let cards = store.getState().cards
            cards = cards.map( el => ((el.id !== dragID) ? el : {...el, type}))
            store.dispatch(ACTIONS.CHANGE_TYPE(cards))
        })
    }

    onDragEnd() {
        this.addHandler('dragend', ev => {
            this.removeClass('draggable')
        })
    }
}

export class Card extends Draggable {
    constructor(type, title, text, id) {
        super(document.createElement('div'))
        this.type = type
        this.title = title
        this.text = text
        this.id = id
        this.template = ` 
            <div draggable="true" class="card-body">
                <h5 class="card-title">${this.title = title}</h5>
                <p class="card-text">${this.text}</p>
                <div class="d-flex">
                    <button data-previous type="button" class="mr-1 btn btn-primary">Previous</button>
                    <button data-next data-next type="button" class="mx-2 btn btn-danger">Next</button>
                </div>
            </div>` 
        this.nextBtn
        this.prevBtn
        this.render()
        this.writeToStore()
        this.unsubscribe = this.subscribeToStore()
    }

    async render() {
        this.$el.classList.add("card","my-3")
        await this.$el.insertAdjacentHTML('beforeend', this.template)
        
        this.setDefaultBtn()
        this.setDefaultHandlers() 
    }

    setDefaultHandlers() {
        this.onDragStart(this.id)
        this.onDragEnd()

        this.nextBtn.addHandler('click', ev => {
            ev.preventDefault()
            let cards = store.getState().cards
            cards = cards.map( el => ((el.id !== this.id) ? el : {...el, type: this.type + 1}))
            store.dispatch(ACTIONS.CHANGE_TYPE(cards))
        })

        this.prevBtn.addHandler('click', ev => {
            ev.preventDefault()
            let cards = store.getState().cards
            cards = cards.map( el => ((el.id !== this.id) ? el : {...el, type: this.type - 1}))
            store.dispatch(ACTIONS.CHANGE_TYPE(cards))
        })
    }

    setDefaultBtn() {
        this.nextBtn = new Element('[data-next]')
        this.prevBtn = new Element('[data-previous]')
        this.prevBtn.setDisabled(true)
        
    }

    writeToStore() {
        store.dispatch(ACTIONS.ADD_NEW(this))
    }

    setBtnPermissions() {
        if (this.type === 1) {
            this.prevBtn.setDisabled(true)
            this.nextBtn.setDisabled(false)
        } else if (this.type === 2) {
            this.prevBtn.setDisabled(false)
            this.nextBtn.setDisabled(false)
        } else if (this.type === 3) {
            this.prevBtn.setDisabled(false)
            this.nextBtn.setDisabled(true)
        }
    }

    updateCard(newType) {
        this.type = newType
        this.setBtnPermissions()
    }

    subscribeToStore() {
        return store.subscribe(() => {
            let $currentCard = store.getState().cards.find( el => el.id === this.id )
            this.updateCard($currentCard.type)
        }) 
    }
}

export class CardsWr extends Draggable {
    constructor (selector) {
        super(selector)
        this.type = +this.$el.dataset.cards
        this.contains = []
        this.setDraggableHandler()
        this.unsubscribe = this.subscribeToStore()
    }

    setDraggableHandler() {
        this.onDragOver()
        this.onDrop(this.type)
    }

    addCard(card) {
        this.$el.appendChild(card)
    }

    clear() {
        this.$el.innerHTML = ''
    }

    subscribeToStore() {
        return store.subscribe( () => {
            let cards = store.getState().cards
            this.clear()
            cards.forEach( el => {
                el.type === this.type && this.addCard(el.$el)
            })
            
        })
    }
}

export const validationsCond = {
    title: {
        func: e => e.value.trim().length >= 3,
        message: {
            true: '',
            false: "Too short. Min 3 symbols."
        }
    },
    text: {
        func: e => e.value.trim().split(' ').length >= 3,
        message: {
            true: '',
            false: "Too short. Min 3 words."
        }
    }
}
