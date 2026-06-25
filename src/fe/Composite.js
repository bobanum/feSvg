import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * Composite - Web Component for composite filter nodes
 */
export class Composite extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Composite';
        this.inputs = { in: null, in2: null };
        this.outputs = { result: [] };
        this.params = {
            operator: 'over',
            k1: 0,
            k2: 0,
            k3: 0,
            k4: 0
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        result.setAttribute('operator', this.params.operator);
        if (this.params.operator === 'arithmetic') {
            result.setAttribute('k1', this.params.k1);
            result.setAttribute('k2', this.params.k2);
            result.setAttribute('k3', this.params.k3);
            result.setAttribute('k4', this.params.k4);
        }
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const operatorParam = new Params.Choice('operator', 'Operator', this.params.operator,
            ['over', 'in', 'out', 'atop', 'xor', 'arithmetic']);
        result.appendChild(operatorParam);

        const k1Param = new Params.Number('k1', 'K1', this.params.k1, 0.1);
        const k2Param = new Params.Number('k2', 'K2', this.params.k2, 0.1);
        const k3Param = new Params.Number('k3', 'K3', this.params.k3, 0.1);
        const k4Param = new Params.Number('k4', 'K4', this.params.k4, 0.1);
        
        result.appendChild(k1Param);
        result.appendChild(k2Param);
        result.appendChild(k3Param);
        result.appendChild(k4Param);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = parseFloat(event.target.value);
        });

        return result;
    }
}

Composite.register('composite-filter-node');
