import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * BlurFilterNode - Web Component for blur filter nodes in the editor
 */
export class Blur extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
    }

    /**
     * Initialize the node with type and position
     */
    init(x, y) {
        this.filterType = 'blur';
        this.x = x;
        this.y = y;

        this.name = 'Gaussian Blur';
        this.inputs = [{ id: 'in', name: 'in' }];
        this.outputs = [{ id: 'out', name: 'result' }];
        this.params = {
            stdDeviation: 5
        };
        this.updatePosition();

        return this;
    }

    connectedCallback() {
        super.connectedCallback();
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
console.log(Params, Params.Number);

        let stdDeviationParam = new Params.Number('stdDeviation', 'Standard Deviation', this.params.stdDeviation, 0.1);
        result.appendChild(stdDeviationParam);
        // for (const [key, value] of Object.entries(this.params)) {
        //     let paramGroup = document.createElement('div');
        //     paramGroup.classList.add('param-group');
        //     let label = document.createElement('label');
        //     label.textContent = key;
        //     paramGroup.appendChild(label);
        //     if (typeof value === 'number') {
        //         let input = document.createElement('input');
        //         input.type = 'number';
        //         input.value = value;
        //         input.dataset.param = key;
        //         input.step = 0.1;
        //         input.size = 5;
        //         paramGroup.appendChild(input);
        //     } else if (typeof value === 'string') {
        //         let input = document.createElement('input');
        //         input.type = 'text';
        //         input.value = value;
        //         input.dataset.param = key;
        //         input.size = 5;
        //         paramGroup.appendChild(input);
        //     }
        //     result.appendChild(paramGroup);
        // }
        return result;
    }
}

Blur.register('blur-filter-node');
