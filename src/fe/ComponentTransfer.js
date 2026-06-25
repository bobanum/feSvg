import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * ComponentTransfer - Web Component for component transfer filter nodes
 */
export class ComponentTransfer extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Component Transfer';
        this.inputs = { in: null };
        this.outputs = { result: [] };
        this.params = {
            type: 'identity',
            tableValues: '',
            slope: 1,
            intercept: 0,
            amplitude: 1,
            exponent: 1,
            offset: 0
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        const funcR = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncR');
        funcR.setAttribute('type', this.params.type);
        
        if (this.params.type === 'table' || this.params.type === 'discrete') {
            funcR.setAttribute('tableValues', this.params.tableValues);
        } else if (this.params.type === 'linear') {
            funcR.setAttribute('slope', this.params.slope);
            funcR.setAttribute('intercept', this.params.intercept);
        } else if (this.params.type === 'gamma') {
            funcR.setAttribute('amplitude', this.params.amplitude);
            funcR.setAttribute('exponent', this.params.exponent);
            funcR.setAttribute('offset', this.params.offset);
        }
        
        result.appendChild(funcR);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const typeParam = new Params.Choice('type', 'Type', this.params.type,
            ['identity', 'table', 'discrete', 'linear', 'gamma']);
        result.appendChild(typeParam);

        const tableParam = new Params.Text('tableValues', 'Table Values', this.params.tableValues);
        result.appendChild(tableParam);

        const slopeParam = new Params.Number('slope', 'Slope', this.params.slope, 0.1);
        result.appendChild(slopeParam);

        const interceptParam = new Params.Number('intercept', 'Intercept', this.params.intercept, 0.1);
        result.appendChild(interceptParam);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = event.target.value;
        });

        return result;
    }
}

ComponentTransfer.register('componenttransfer-filter-node');
