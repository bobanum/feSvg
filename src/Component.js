export class Component extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (this.dom?.main) {
            this.shadowRoot.appendChild(this.dom.main());
        } else if (this.constructor.dom?.main) {
            this.shadowRoot.appendChild(this.constructor.dom.main.call(this));
        }
    }

    adoptFunctions(functions) {
        for (const [key, fn] of Object.entries(functions)) {
            this[key] = Object.fromEntries(Object.entries(fn).map(([subKey, subFn]) => [subKey, subFn.bind(this)]));
        }
    }

    createSlot(name, defaultContent) {
        const slot = document.createElement('slot');
        if (name) slot.name = name;
        if (defaultContent) {
            if (typeof defaultContent === 'string') {
                slot.innerHTML = defaultContent;
            } else {
                slot.appendChild(defaultContent);
            }
        }
        return slot;
    }

    static toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static register(tag) {
        this.tag = tag || `${this.toKebabCase(this.name)}`;
        customElements.define(this.tag, this);
    }
}
