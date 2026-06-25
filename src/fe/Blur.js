import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * BlurFilterNode - Web Component for blur filter nodes in the editor
 */
export class Blur extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Gaussian Blur';
        this.inputs = { in: null };
        this.outputs = { result: null };
        this.params = {
            stdDeviation: 5
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
        this.refreshPreview();
    }

    render() {
        const attributes = {
            result: this.getOutputValue('result'),
            in: this.getInputValue('in') || 'SourceGraphic',
            stdDeviation: String(Number(this.params.stdDeviation) || 0)
        };
        const result = this.createSvg('feGaussianBlur', attributes);
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
            this.params.stdDeviation = Number(event.target.value);
            this.notifyChanged();
        });

        return result;
    }
}

Blur.register('blur-filter-node');
