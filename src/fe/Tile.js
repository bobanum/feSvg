import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * Tile - Web Component for tile filter nodes
 */
export class Tile extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Tile';
        this.inputs = { in: null };
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feTile');
        return result;
    }

    createParamsHTML() {
        return document.createDocumentFragment();
    }
}

Tile.register('tile-filter-node');
