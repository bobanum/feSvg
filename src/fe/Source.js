import { FilterNode } from "../FilterNode.js";

/**
 * Source - Web Component for source nodes in the editor
 */
export class Source extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Source';
        this.inputs = {};
        this.outputs = { result: 'result' };
        this.params = {
            source: 'SourceGraphic'
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feSourceGraphic');
        return result;
    }
    /**
     * Create HTML for node parameters
     */
    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        // let source = new Params.Choice('source', 'Source', this.params.source, 1);
        let source = document.createElement('choice-param');
        source.choices = ['SourceGraphic', 'SourceAlpha'];
        source.value = this.params.source;
        source.label = 'Source';

        result.appendChild(source);

        return result;
    }
}

Source.register('source-node');
