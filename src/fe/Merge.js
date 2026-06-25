import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * Merge - Web Component for merge filter nodes
 */
export class Merge extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Merge';
        this.inputs = { in: null, in2: null };
        this.outputs = { result: [] };
        this.params = {};
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        result.appendChild(mergeNode1);
        result.appendChild(mergeNode2);
        return result;
    }

    createParamsHTML() {
        return document.createDocumentFragment();
    }
}

Merge.register('merge-filter-node');
