import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * Flood - Web Component for flood filter nodes
 */
export class Flood extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Flood';
        this.inputs = {};
        this.outputs = { result: 'result' };
        this.params = {
            floodColor: '#000000',
            floodOpacity: 1
        };
    }

    init(x, y) {
        this.x = x;
        this.y = y;
        this.updatePosition();
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    render() {
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
        result.setAttribute('flood-color', this.params.floodColor);
        result.setAttribute('flood-opacity', this.params.floodOpacity);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const colorParam = new Params.Text('floodColor', 'Color', this.params.floodColor);
        result.appendChild(colorParam);

        const opacityParam = new Params.Number('floodOpacity', 'Opacity', this.params.floodOpacity, 0.01, 0, 1);
        result.appendChild(opacityParam);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = event.target.value;
        });

        return result;
    }
}

Flood.register('flood-filter-node');
