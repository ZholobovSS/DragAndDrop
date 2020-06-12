export class Element {
    constructor (selector) {
        this.$el = document.querySelector(selector)
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

export class CardsWr extends Element {
    constructor (selector) {
        super(selector)
        this.type = +this.$el.dataset.cards
    }

    addCards(title, text) {
        let template = `
            <div class="card my-3">
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${text}</p>
                    <a href="#" class="btn btn-primary">Go somewhere</a>
                </div>
            </div>`
        this.$el.insertAdjacentHTML('beforeend', template)
    }
}

export const validationsCond = {
    title: {
        func: e => e.value.trim().length > 3,
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
