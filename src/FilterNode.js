import { Node } from "./Node.js";
import { Preview } from "./Preview.js";

/**
 * FilterNode - Web Component for filter nodes in the editor
 */
export class FilterNode extends Node {
    static idCounter = 0;

    constructor(x, y, inputs = { in: null }, outputs = { result: null }) {
        super(x, y, inputs, outputs);
        this.adoptFunctions({ dom: Node.dom });
    }

    /**
     * Initialize the node position
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.updatePosition();

        return this;
    }

    connectedCallback() {
        super.connectedCallback();
        this.appendChild(this.createParamsHTML());
        this.shadowRoot.appendChild(new Preview());

        this.shadowRoot.appendChild(this.dom.ports());

    }

    /**
     * Create HTML for node parameters
     */
    createParamsHTML() {
        if (Object.keys(this.params).length === 0) {
            return document.createDocumentFragment(); // Return empty fragment if no params
        }

        const result = document.createElement('div');
        result.classList.add('node-params');

        for (const [key, value] of Object.entries(this.params)) {
            let paramGroup = document.createElement('div');
            paramGroup.classList.add('param-group');
            let label = document.createElement('label');
            label.textContent = key;
            paramGroup.appendChild(label);
            if (typeof value === 'number') {
                let input = document.createElement('input');
                input.type = 'number';
                input.value = value;
                input.dataset.param = key;
                input.step = 0.1;
                input.size = 5;
                paramGroup.appendChild(input);
            } else if (typeof value === 'string') {
                let input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.dataset.param = key;
                input.size = 5;
                paramGroup.appendChild(input);
            }
            result.appendChild(paramGroup);
        }
        return result;
    }

	createSvg(tagName, attributes = {}) {
		const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		for (const [key, value] of Object.entries(attributes)) {
			element.setAttribute(key, value);
		}
		return element;
	}

}

FilterNode.register('filter-node');
