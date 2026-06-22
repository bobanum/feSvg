import { Node } from "./Node.js";

/**
 * FilterNode - Web Component for filter nodes in the editor
 */
export class FilterNode extends Node {
    static idCounter = 0;

    constructor() {
        super();
        this.id = `node-${this.constructor.idCounter++}`;
        this.filterType = '';
        this.x = 0;
        this.y = 0;
        this.inputs = [];
        this.outputs = [];
        this.params = {};
        this.name = '';

        this._isDragging = false;
        this._dragStart = { x: 0, y: 0 };
        this._initialPos = { x: 0, y: 0 };
    }

    /**
     * Initialize the node with type and position
     */
    init(type, x, y) {
        this.filterType = type;
        this.x = x;
        this.y = y;

        this.initializeByType();
        this.updatePosition();

        return this;
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.dom.main.call(this));
        this.appendChild(this.createParamsHTML());
        this.shadowRoot.appendChild(this.dom.ports.call(this));

    }
    /**
     * Update the node position in the DOM
     */
    updatePosition() {
        this.style.left = `${this.x}px`;
        this.style.top = `${this.y}px`;
    }

    /**
     * Initialize node properties based on type
     */
    initializeByType() {
        console.log(123);
        
        switch (this.filterType) {
            case 'source':
                this.name = 'SourceGraphic';
                this.outputs = [{ id: 'out', name: 'result' }];
                break;

            case 'blur':
                this.name = 'Gaussian Blur';
                this.inputs = [{ id: 'in', name: 'in' }];
                this.outputs = [{ id: 'out', name: 'result' }];
                this.params = {
                    stdDeviation: 5
                };
                break;

            case 'offset':
                this.name = 'Offset';
                this.inputs = [{ id: 'in', name: 'in' }];
                this.outputs = [{ id: 'out', name: 'result' }];
                this.params = {
                    dx: 0,
                    dy: 0
                };
                break;

            case 'blend':
                this.name = 'Blend';
                this.inputs = [
                    { id: 'in1', name: 'in' },
                    { id: 'in2', name: 'in2' }
                ];
                this.outputs = [{ id: 'out', name: 'result' }];
                this.params = {
                    mode: 'normal'
                };
                break;

            default:
                this.name = 'Unknown';
        }
    }


    /**
     * Create HTML for node parameters
     */
    createParamsHTML() {
        if (Object.keys(this.params).length === 0) {
            return document.createDocumentFragment(); // Return empty fragment if no params
        }
console.log(321);

        const result = document.createElement('div');
        result.classList.add('node-params');

        for (const [key, value] of Object.entries(this.params)) {
            let paramGroup = document.createElement('div');
            paramGroup.classList.add('param-group');
            let label = document.createElement('label');
            label.textContent = key;
            paramGroup.appendChild(label);
            if (typeof value === 'number') {
                let input = document.createElement('input');
                input.type = 'number';
                input.value = value;
                input.dataset.param = key;
                input.step = 0.1;
                input.size = 5;
                paramGroup.appendChild(input);
            } else if (typeof value === 'string') {
                let input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.dataset.param = key;
                input.size = 5;
                paramGroup.appendChild(input);
            }
            result.appendChild(paramGroup);
        }
        return result;
    }

    /**
     * Get the position of a port in screen coordinates
     */
    getPortPosition(portId, isOutput = false) {
        const portDot = this.querySelector(`[data-port="${portId}"]`);

        if (!portDot) return null;

        const rect = portDot.getBoundingClientRect();
        const editorRect = document.getElementById('editor-container').getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2 - editorRect.left,
            y: rect.top + rect.height / 2 - editorRect.top
        };
    }

    /**
     * Cleanup when node is removed
     */
    disconnectedCallback() {
        // Clean up event listeners if needed
        if (this._eventHandlers) {
            document.removeEventListener('mousemove', this._eventHandlers.mouseMove);
            document.removeEventListener('mouseup', this._eventHandlers.mouseUp);
        }
    }
}

FilterNode.register('filter-node');
