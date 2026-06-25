import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * Morphology - Web Component for morphology filter nodes
 */
export class Morphology extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Morphology';
        this.inputs = { in: null };
        this.outputs = { result: [] };
        this.params = {
            operator: 'erode',
            radius: 1
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
        result.setAttribute('operator', this.params.operator);
        result.setAttribute('radius', this.params.radius);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const operatorParam = new Params.Choice('operator', 'Operator', this.params.operator,
            ['erode', 'dilate']);
        result.appendChild(operatorParam);

        const radiusParam = new Params.Number('radius', 'Radius', this.params.radius, 0.1);
        result.appendChild(radiusParam);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = event.target.value;
        });

        return result;
    }
}

Morphology.register('morphology-filter-node');
