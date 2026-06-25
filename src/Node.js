import { Component } from "./Component.js";

/**
 * FilterNode - Web Component for filter nodes in the editor
 */
export class Node extends Component {
    static idCounter = 0;

    constructor(x = 0, y = 0, inputs = { in: null }, outputs = { result: null }) {
        super();
        this.filterType = '';
        this.x = x;
        this.y = y;
        this.inputs = inputs;
        this.outputs = outputs;
        this.inputValues = {};
        this.outputValues = {};
        this.params = {};
        this.name = '';

        this._isDragging = false;
        this._dragStart = { x: 0, y: 0 };
        this._initialPos = { x: 0, y: 0 };

        this.adoptFunctions({ dom: Node.dom, evt: Node.evt });
    }

    connectedCallback() {
        if (!this.id) {
            this.id = `node-${Node.idCounter++}`;
        }
        if (this.dom.main) {
            this.shadowRoot.appendChild(this.dom.main());
        }
        this.classList.add('node');
        this.initializePortValues();
        this.addEventListener('click', this.evt.click);
    }

    initializePortValues() {
        this.inputValues = Object.fromEntries(
            Object.keys(this.inputs || {}).map((key) => [key, null])
        );
        this.outputValues = Object.fromEntries(
            Object.keys(this.outputs || {}).map((key) => [key, `${this.id}-${key}`])
        );
    }

    getInputValue(portId) {
        return this.inputValues?.[portId] ?? null;
    }

    setInputValue(portId, value) {
        if (!(portId in this.inputValues)) return;
        this.inputValues[portId] = value;
    }

    clearInputValue(portId) {
        if (!(portId in this.inputValues)) return;
        this.inputValues[portId] = null;
    }

    getOutputValue(portId) {
        return this.outputValues?.[portId] ?? `${this.id}-${portId}`;
    }

    refreshPreview() {
        const preview = this.shadowRoot?.querySelector('node-preview');
        const filter = preview?.shadowRoot?.querySelector('filter');
        if (!filter || typeof this.renderPreview !== 'function') return;

        const primitive = this.renderPreview();
        filter.replaceChildren();
        if (primitive) {
            filter.appendChild(primitive);
        }
    }
    renderPreview() {
        const result = document.createDocumentFragment();
        for (const input in this.inputs) {
            if (!this.inputs[input]) continue;
            result.appendChild(this.inputs[input].renderPreview());
        }
        result.appendChild(this.render());
        return result;
    }

    notifyChanged() {
        this.refreshPreview();
        this.dispatchEvent(new CustomEvent('node-changed', {
            bubbles: true,
            composed: true,
            detail: { nodeId: this.id }
        }));
    }

    /**
     * Update the node position in the DOM
     */
    updatePosition() {
        this.style.left = `${this.x}px`;
        this.style.top = `${this.y}px`;
    }

    /**
     * Get the position of a port in screen coordinates
     */
    getPortPosition(portId, isOutput = false) {
        const portDot = this.shadowRoot?.querySelector(`[data-port="${portId}"]`);

        if (!portDot) return null;

        const rect = portDot.getBoundingClientRect();
        const editorRect = document.getElementById('editor-container').getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2 - editorRect.left,
            y: rect.top + rect.height / 2 - editorRect.top
        };
    }
    static dom = {
        main: function () {
            const result = document.createDocumentFragment();
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = '/css/node.css';
            result.appendChild(style);
            result.appendChild(this.dom.header());
            const body = document.createElement('main');
            body.appendChild(this.createSlot());
            result.appendChild(body);
            return result;
        },
        ports: function () {
            const result = document.createElement('div');
            result.classList.add('ports');
            const portsLeft = document.createElement('div');
            portsLeft.classList.add('ports-left');

            Object.entries(this.inputs).forEach(([id, name]) => {
                const port = this.dom.port(id, name);
                port.classList.add('input');
                portsLeft.appendChild(port);
            });
            result.appendChild(portsLeft);
            const portsRight = document.createElement('div');
            portsRight.classList.add('ports-right');
            Object.entries(this.outputs).forEach(([id, name]) => {
                const port = this.dom.port(id, name);
                port.classList.add('output');
                portsRight.appendChild(port);
            });
            result.appendChild(portsRight);
            return result;
        },
        header: function () {
            const header = document.createElement('header');
            const title = document.createElement('span');
            title.classList.add('title');
            title.textContent = this.name;
            const menuBtn = document.createElement('button');
            menuBtn.classList.add('menu-btn');
            menuBtn.textContent = '⋮';
            header.appendChild(title);
            header.appendChild(menuBtn);

            header.addEventListener('mousedown', this.evt.header_mouseDown.bind(this));
            return header;
        },
        port: function (id, name) {
            name = name || id;
            const result = document.createElement('div');
            result.classList.add('port');
            result.dataset.portId = id;
            const label = document.createElement('span');
            label.textContent = name;
            const portDot = document.createElement('div');
            portDot.classList.add('dot');
            portDot.dataset.port = id;
            result.appendChild(label);
            result.appendChild(portDot);
            return result;
        }
    };
    static evt = {

        // Node selection
        click: function (e) {
            if (e.target.classList.contains('dot')) return;

            document.querySelectorAll('.node.selected').forEach(n => {
                if (n !== this) n.classList.remove('selected');
            });
            this.classList.add('selected');
        },
        header_mouseDown: function (e) {
            this._isDragging = true;
            this.classList.add('dragging');
            this._dragStart.x = e.clientX;
            this._dragStart.y = e.clientY;
            this._initialPos.x = this.x;
            this._initialPos.y = this.y;

            // Bring to front
            this.style.zIndex = '100';
            
            // Bind the event handlers to maintain the correct 'this' context
            this._boundMouseMove = this.evt.document_mouseMove.bind(this);
            this._boundMouseUp = this.evt.document_mouseUp.bind(this);
            
            document.addEventListener('mousemove', this._boundMouseMove);
            document.addEventListener('mouseup', this._boundMouseUp);

            e.preventDefault();
        },
        document_mouseMove: function (e) {

            if (!this._isDragging) return;
            const dx = e.clientX - this._dragStart.x;
            const dy = e.clientY - this._dragStart.y;
            this.x = this._initialPos.x + dx;
            this.y = this._initialPos.y + dy;
            this.updatePosition();
            // Dispatch event for connection updates
            this.dispatchEvent(new CustomEvent('node-moved', {
                bubbles: true,
                detail: { nodeId: this.id }
            }));
        },
        document_mouseUp: function () {
            if (this._isDragging) {
                this._isDragging = false;
                this.classList.remove('dragging');
                this.style.zIndex = '';
                document.removeEventListener('mousemove', this._boundMouseMove);
                document.removeEventListener('mouseup', this._boundMouseUp);
            }
        },
    };
}
