/**
 * FilterNode - Web Component for filter nodes in the editor
 */
export class Node extends HTMLElement {
    static idCounter = 0;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
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

        this.dom = Object.fromEntries(Object.entries(Node.dom).map(([key, fn]) => [key, fn.bind(this)]));
        this.evt = Object.fromEntries(Object.entries(Node.evt).map(([key, fn]) => [key, fn.bind(this)]));
    }

    connectedCallback() {
        if (this.dom.main) {
            this.shadowRoot.appendChild(this.dom.main());
        }
        this.classList.add('node');
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
        const portDot = this.querySelector(`[data-port="${portId}"]`);

        if (!portDot) return null;

        const rect = portDot.getBoundingClientRect();
        const editorRect = document.getElementById('editor-container').getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2 - editorRect.left,
            y: rect.top + rect.height / 2 - editorRect.top
        };
    }
    createSlot(name) {
        const slot = document.createElement('slot');
        if (name) slot.name = name;
        return slot;
    }
    static dom = {
        main: function () {
            const result = document.createDocumentFragment();
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = '/styles/node.css';
            result.appendChild(style);
            result.appendChild(this.dom.header());
            const body = document.createElement('main');
            body.appendChild(this.createSlot());
            result.appendChild(body);
            // result.appendChild(this.dom.ports());
            result.appendChild(this.createSlot('ports'));
            return result;
        },
        ports: function () {
            const result = document.createElement('div');
            result.classList.add('node-ports');
            const portsLeft = document.createElement('div');
            portsLeft.classList.add('ports-left');
            console.log(this.inputs, this.outputs);

            this.inputs.forEach(input => {
                const port = this.dom.port(input);
                port.classList.add('port-input');
                portsLeft.appendChild(port);
            });
            result.appendChild(portsLeft);
            const portsRight = document.createElement('div');
            portsRight.classList.add('ports-right');
            this.outputs.forEach(output => {
                const port = this.dom.port(output);
                port.classList.add('port-output');
                portsRight.appendChild(port);
            });
            result.appendChild(portsRight);
            return result;
        },
        header: function () {
            const header = document.createElement('header');
            const title = document.createElement('span');
            title.classList.add('node-title');
            title.textContent = this.name;
            const menuBtn = document.createElement('button');
            menuBtn.classList.add('node-menu-btn');
            menuBtn.textContent = '⋮';
            header.appendChild(title);
            header.appendChild(menuBtn);
            console.log(this);

            header.addEventListener('mousedown', this.evt.header_mouseDown.bind(this));
            return header;
        },
        port: function (port) {
            const result = document.createElement('div');
            result.classList.add('port');
            result.dataset.portId = port.id;
            const label = document.createElement('span');
            label.textContent = port.name;
            const portDot = document.createElement('div');
            portDot.classList.add('port-dot');
            portDot.dataset.port = port.id;
            result.appendChild(label);
            result.appendChild(portDot);
            return result;
        }
    };
    static evt = {

        // Node selection
        click: function (e) {
            if (e.target.classList.contains('port-dot')) return;

            document.querySelectorAll('filter-node.selected').forEach(n => {
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
            document.addEventListener('mousemove', this.evt.document_mouseMove);
            document.addEventListener('mouseup', this.evt.document_mouseUp);

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
                document.removeEventListener('mousemove', this.evt.document_mouseMove);
                document.removeEventListener('mouseup', this.evt.document_mouseUp);
            }
        },
    };

    static toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static register(tag) {
        this.tag = tag || `${this.toKebabCase(this.name)}`;
        customElements.define(this.tag, this);
    }
}
