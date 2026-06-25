import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * Turbulence - Web Component for turbulence filter nodes
 */
export class Turbulence extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Turbulence';
        this.inputs = {};
        this.outputs = { result: 'result' };
        this.params = {
            type: 'turbulence',
            baseFrequency: 0.05,
            numOctaves: 1,
            seed: 0
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
        result.setAttribute('type', this.params.type);
        result.setAttribute('baseFrequency', this.params.baseFrequency);
        result.setAttribute('numOctaves', this.params.numOctaves);
        result.setAttribute('seed', this.params.seed);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const typeParam = new Params.Choice('type', 'Type', this.params.type,
            ['turbulence', 'fractalNoise']);
        result.appendChild(typeParam);

        const freqParam = new Params.Number('baseFrequency', 'Base Frequency', this.params.baseFrequency, 0.001);
        result.appendChild(freqParam);

        const octavesParam = new Params.Number('numOctaves', 'Octaves', this.params.numOctaves, 1);
        result.appendChild(octavesParam);

        const seedParam = new Params.Number('seed', 'Seed', this.params.seed, 1);
        result.appendChild(seedParam);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = event.target.value;
        });

        return result;
    }
}

Turbulence.register('turbulence-filter-node');
