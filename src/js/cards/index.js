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

export class Card extends Element{
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
    }

    render() {
        this.$el.classList.add("card","my-3")
        this.$el.insertAdjacentHTML('beforeend', this.template)
    }

    draggableOn() {
        this.$el.addEventListener()
    }
}

export class CardsWr extends Element {
    constructor (selector) {
        super(selector)
        this.type = +this.$el.dataset.cards
        this.contains = []
    }

    addCard(card) {
        this.$el.append(card)
    }

    clear() {
        this.$el.innerHTML = ''
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
