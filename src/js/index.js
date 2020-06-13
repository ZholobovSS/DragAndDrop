import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import '../css/main.css'
import { v4 as uuidv4 } from 'uuid'
import * as ACTIONS from './redux/actions'

import store from './redux/index'
import {Element, FormElement, validationsCond, CardsWr, Card} from './cards'


const addButton = new Element('[data-add]')
const titleField = new FormElement('[data-title]')
const textField = new FormElement('[data-text]')
const cardsWr1 = new CardsWr('[data-cards]')


titleField.addHandler( 'input', () => {
    titleField.checkValid(validationsCond.title.func)
    !titleField.valid ? titleField.addClass('is-invalid') : titleField.removeClass('is-invalid')
    titleField.showMessage(validationsCond.title.message[titleField.valid])
    addButton.checkDisabled(() => titleField.valid && textField.valid)
})

textField.addHandler( 'input', () => {
    textField.checkValid(validationsCond.text.func)
    !textField.valid ? textField.addClass('is-invalid') : textField.removeClass('is-invalid')
    textField.showMessage(validationsCond.text.message[textField.valid])
    addButton.checkDisabled(() => titleField.valid && textField.valid)
})

addButton.addHandler('click', () => {
    store.dispatch( ACTIONS.ADD_NEW(
        new Card(1, titleField.$el.value, textField.$el.value, uuidv4())
    ))

    titleField.clear()
    textField.clear()
    addButton.setDisabled(true)
})

store.subscribe( () => {
    let newCards = store.getState().newCards
    cardsWr1.clear()
    newCards.forEach( el => {
        cardsWr1.addCard(el.$el)
    } )
} )