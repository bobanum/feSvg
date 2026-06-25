import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * DisplacementMap - Web Component for displacement map filter nodes
 */
export class DisplacementMap extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Displacement Map';
        this.inputs = { in: null, in2: null };
        this.outputs = { result: [] };
        this.params = {
            scale: 10,
            xChannelSelector: 'R',
            yChannelSelector: 'G'
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        result.setAttribute('scale', this.params.scale);
        result.setAttribute('xChannelSelector', this.params.xChannelSelector);
        result.setAttribute('yChannelSelector', this.params.yChannelSelector);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const scaleParam = new Params.Number('scale', 'Scale', this.params.scale, 1);
        result.appendChild(scaleParam);

        const xChannelParam = new Params.Choice('xChannelSelector', 'X Channel', this.params.xChannelSelector,
            ['R', 'G', 'B', 'A']);
        result.appendChild(xChannelParam);

        const yChannelParam = new Params.Choice('yChannelSelector', 'Y Channel', this.params.yChannelSelector,
            ['R', 'G', 'B', 'A']);
        result.appendChild(yChannelParam);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = event.target.value;
        });

        return result;
    }
}

DisplacementMap.register('displacementmap-filter-node');
