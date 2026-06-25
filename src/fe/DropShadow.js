import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * DropShadow - Web Component for drop shadow filter nodes
 */
export class DropShadow extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Drop Shadow';
        this.inputs = { in: 'in' };
        this.outputs = { result: 'result' };
        this.params = {
            dx: 2,
            dy: 2,
            stdDeviation: 2,
            floodColor: '#000000',
            floodOpacity: 0.5
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        result.setAttribute('dx', this.params.dx);
        result.setAttribute('dy', this.params.dy);
        result.setAttribute('stdDeviation', this.params.stdDeviation);
        result.setAttribute('flood-color', this.params.floodColor);
        result.setAttribute('flood-opacity', this.params.floodOpacity);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const dxParam = new Params.Number('dx', 'Offset X', this.params.dx, 0.1);
        result.appendChild(dxParam);

        const dyParam = new Params.Number('dy', 'Offset Y', this.params.dy, 0.1);
        result.appendChild(dyParam);

        const stdDevParam = new Params.Number('stdDeviation', 'Blur', this.params.stdDeviation, 0.1);
        result.appendChild(stdDevParam);

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

DropShadow.register('dropshadow-filter-node');
