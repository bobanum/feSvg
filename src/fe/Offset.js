import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * OffsetFilterNode - Web Component for offset filter nodes in the editor
 */
export class Offset extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Offset';
        this.inputs = { in: 'in' };
        this.outputs = { result: 'result' };
        this.params = {
            dx: 0,
            dy: 0
        };
    }

    /**
     * Initialize the node with type and position
     */
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

        let dX = new Params.Number('dx', 'Delta X', this.params.dx, 1);
        result.appendChild(dX);

        let dY = new Params.Number('dy', 'Delta Y', this.params.dy, 1);
        result.appendChild(dY);

        result.addEventListener('input', (event) => {
            console.log(event);
            this.params.dx = event.target.value;
        });

        return result;
    }
}

Offset.register('offset-filter-node');
