import * as ACTIONS from '../redux/actions'
import store from '../redux/index'
import { debounce, setFlySort } from './addFuncs'

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
            store.dispatch(ACTIONS.RERENDER(false))
            store.dispatch(ACTIONS.UPDATE_INFO({
                id: id,
                draggable: true,
            }))
        })
    }

    onDragOver(type) {
        this.addHandler('dragover', ev => {
            ev.preventDefault()
            setFlySort(ev, this, type, store)
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
            ev.dataTransfer.clearData()
        })
    }

    updateOnDrop(type, ev) {
        let dragID = ev.dataTransfer.getData('id')
        store.dispatch(ACTIONS.UPDATE_INFO({
                id: dragID,
                type: type,
                draggable: false,
        }))
        store.dispatch(ACTIONS.RERENDER(true))
    }
}

export class Card extends Draggable {
    constructor(type, title, text, id) {
        super(document.createElement('div'))
        this.title = title
        this.text = text
        this.type = type
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
       
        this.render()
        this.setDefaultBtn()
        this.writeToStore()
        this.unsubscribe = this.subscribeToStore()
    }

    async render() {
        this.$el.classList.add("card","my-3")
        this.$el.insertAdjacentHTML('beforeend', this.template)
        this.registerBtn()
    }

    registerBtn() {
        this.setDefaultBtn()
        this.setBtnPermissions()
        this.setDefaulBtntHandlers()
    }

    setDefaulBtntHandlers() {
        this.onDragStart(this.id)
        this.onDragEnd()

        this.nextBtn.addHandler('click', ev => {
            ev.preventDefault()
            store.dispatch(ACTIONS.UPDATE_INFO({
                id: this.id,
                type: this.type + 1,
                sort: this.getBtnSort(this.type + 1)
            }))
            store.dispatch(ACTIONS.RERENDER(true))
        })

        this.prevBtn.addHandler('click', ev => {
            ev.preventDefault()
            store.dispatch(ACTIONS.UPDATE_INFO({
                id: this.id,
                type: this.type - 1,
                sort: this.getBtnSort(this.type - 1)
            }))
            store.dispatch(ACTIONS.RERENDER(true))
        })
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

    setDefaultBtn() {
        this.nextBtn = new Element(this.$el.querySelector('[data-next]'))
        this.prevBtn = new Element(this.$el.querySelector('[data-previous]'))
    }

    getBtnSort(type) {
        return Math.max(...store.getState().cardsInfo.filter( el => el.type === type ).map(el => el?.sort), 0) + 1
    }

    getDefaultSort() {
        return Math.max(...store.getState().cardsInfo.filter( el => el.type === this.type ).map(el => el?.sort), 0) + 1 
    }

    writeToStore() {
        store.dispatch(ACTIONS.ADD_NEW_CLASS(this))
        store.dispatch(ACTIONS.ADD_NEW_INFO({
            id: this.id,
            type: this.type,
            sort: this.getDefaultSort(),
            draggable: false,
            rerender: true,
        }))
    }

    update(type) {
        this.type = type
        this.setBtnPermissions()
    }

    subscribeToStore() {
        return store.subscribe( () => {
            let {cardsInfo, rerender} = store.getState()
            if (rerender) {
                let currentCardInfo = cardsInfo.find( el => el.id === this.id && el.rerender)
                currentCardInfo && this.update(currentCardInfo.type)
            }
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
        this.onDragOver(this.type)
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
            let { cards, cardsInfo, rerender } = store.getState()
            if (rerender) {
                this.clear()
                cardsInfo.filter(el => el.type === this.type)
                .sort((a,b) => a.sort - b.sort)
                .forEach( el => {
                    this.addCard(cards.find( cardsEl => cardsEl.id === el.id).$el)
            })
            }
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
