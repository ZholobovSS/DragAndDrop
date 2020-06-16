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
            this.updateOnDrop(type, ev)
        })
    }

    onDragEnd() {
        this.addHandler('dragend', ev => {
            this.removeClass('draggable')
        })
    }

    updateOnDrop(type, ev) {
        let dragID = ev.dataTransfer.getData('id')
        let cards = store.getState().cards
        cards = cards.map( el => ((el.id !== dragID) ? el : el.updateCardType(type)))
        store.dispatch(ACTIONS.CHANGE_TYPE(cards))
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
                <div data-btnwr class="d-flex">
                    <button data-previous type="button" class="mr-1 btn btn-primary">Previous</button>
                    <button data-next data-next type="button" class="mx-2 btn btn-danger">Next</button>
                </div>
            </div>` 
        this.nextBtn
        this.prevBtn
        this.sort = 1
        this.render()
        this.writeToStore()
    }

    async render() {
        this.$el.classList.add("card","my-3")
        this.$el.insertAdjacentHTML('beforeend', this.template)
        
        this.setDefaultBtn()
        this.setBtnPermissions()
        this.setDefaultHandlers() 
        this.setSort()
    }

    setDefaultHandlers() {
        this.onDragStart(this.id)
        this.onDragEnd()

        this.nextBtn.addHandler('click', ev => {
            ev.preventDefault()
            let cards = store.getState().cards
            cards = cards.map( el => ((el.id !== this.id) ? el : this.updateCardType(this.type + 1)))
            store.dispatch(ACTIONS.CHANGE_TYPE(cards))
        })

        this.prevBtn.addHandler('click', ev => {
            ev.preventDefault()
            let cards = store.getState().cards
            cards = cards.map( el => ((el.id !== this.id) ? el : this.updateCardType(this.type - 1)))
            store.dispatch(ACTIONS.CHANGE_TYPE(cards))
        })
    }

    setDefaultBtn() {
        this.nextBtn = new Element(this.$el.querySelector('[data-next]'))
        this.prevBtn = new Element(this.$el.querySelector('[data-previous]'))
    }

    setSort() {
        let cards = store.getState().cards.filter(el => el.type === this.type && el.id !== this.id )
        if (!cards.length) {
            this.sort = 1
        } else {
            let sortIndex = cards.reduce((acc, el) => ( (el.sort > acc) ? acc = el.sort + 1 : acc ), Number.NEGATIVE_INFINITY)
            this.sort = sortIndex
        }
        
    }

    writeToStore() {
        
        store.dispatch(ACTIONS.ADD_NEW(this))
    }

    setBtnPermissions() {
        switch (this.type) {
            case 1:
                this.prevBtn.setDisabled(true)
                this.nextBtn.setDisabled(false)
                break
            case 2:
                this.prevBtn.setDisabled(false)
                this.nextBtn.setDisabled(false)
                break
            case 3:
                this.prevBtn.setDisabled(false)
                this.nextBtn.setDisabled(true)
            default:
                break
        }
    }

    updateCardType(newType) {
        this.type = newType
        this.setBtnPermissions()
        this.setSort()
        return this
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
            cards.filter(el => el.type === this.type).sort((a,b) => a.sort - b.sort)
            .forEach( el => {
                this.addCard(el.$el)
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
