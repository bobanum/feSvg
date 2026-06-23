import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * BlendFilterNode - Web Component for blend filter nodes in the editor
 */
export class Blend extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Blend';
        this.inputs = { in: 'in', in2: 'in2' };
        this.outputs = { result: 'result' };
    }

    /**
     * Initialize the node with type and position
     */
    init(x, y) {
        this.x = x;
        this.y = y;

        this.params = {
            stdDeviation: 5
        };
        this.updatePosition();

        return this;
    }

    connectedCallback() {
        super.connectedCallback();
    }
    render() {
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        result.setAttribute('stdDeviation', this.params.stdDeviation);
        return result;
    }
    /**
     * Create HTML for node parameters
     */
    createParamsHTML() {
        if (Object.keys(this.params).length === 0) {
            return document.createDocumentFragment(); // Return empty fragment if no params
        }

        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        let stdDeviationParam = new Params.Number('stdDeviation', 'Standard Deviation', this.params.stdDeviation, 0.1);
        result.appendChild(stdDeviationParam);
        
        result.addEventListener('input', (event) => {
            console.log(event);
            this.params.stdDeviation = event.target.value;
        });

        return result;
    }
}

Blend.register('blend-filter-node');
