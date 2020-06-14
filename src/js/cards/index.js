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

    onDrop() {
        this.addHandler('drop', ev => {
            ev.preventDefault()
            let $dragEl = store.getState().cards.find( el => el.id === ev.dataTransfer.getData('id'))?.el
            this.$el.appendChild($dragEl)
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
                <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>` 
        
        this.render()
        this.writeToStore()
    }

    render() {
        this.$el.classList.add("card","my-3")
        this.$el.insertAdjacentHTML('beforeend', this.template)
        this.onDragStart(this.id)
        this.onDragEnd()
    }

    writeToStore() {

        store.dispatch( ACTIONS.ADD_NEW({
            el: this.$el,
            type: this.type,
            title: this.title,
            text: this.text,
            id: this.id
        }))
    }
}

export class CardsWr extends Draggable {
    constructor (selector) {
        super(selector)
        this.type = +this.$el.dataset.cards
        this.contains = []
        this.setDraggableHandler()
        this.subscribeToStore()
    }

    setDraggableHandler() {
        this.onDragOver()
        this.onDrop()
    }

    addCard(card) {
        this.$el.append(card)
    }

    clear() {
        this.$el.innerHTML = ''
    }

    subscribeToStore() {
        store.subscribe( () => {
            let cards = store.getState().cards
            this.clear()
            cards.forEach( el => {
                el.type === this.type && this.addCard(el.el)
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
