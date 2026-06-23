import { FilterNode } from "../FilterNode.js";

/**
 * SourceAlpha - Web Component for source alpha nodes in the editor
 */
export class SourceAlpha extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Source Alpha';
        this.inputs = {};
        this.outputs = { result: 'result' };
        this.params = {};
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feSourceAlpha');
        return result;
    }
    /**
     * Create HTML for node parameters
     */
    createParamsHTML() {
        return document.createDocumentFragment(); // Return empty fragment if no params
    }
}

SourceAlpha.register('source-alpha-node');
