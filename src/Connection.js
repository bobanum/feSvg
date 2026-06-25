/**
 * Connection class - Represents a connection between two nodes
 */
export class Connection {
    static idCounter = 0;

    constructor(sourceNode, sourcePort, targetNode, targetPort) {
        this.id = `connection-${Connection.idCounter++}`;
        this.sourceNode = sourceNode;
        this.sourcePort = sourcePort;
        this.targetNode = targetNode;
        this.targetPort = targetPort;
        this.element = null;

        this.createSVGElement();
        this.updatePosition();
    }

    /**
     * Create the SVG path element for the connection
     */
    createSVGElement() {
        const svg = document.getElementById('connections-svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection');
        path.id = this.id;
        path.setAttribute('marker-start', 'url(#connection-end)');
        path.setAttribute('marker-end', 'url(#connection-end)');

        // Add click handler for selection/deletion
        path.addEventListener('click', (e) => {
            e.stopPropagation();
            this.select();
        });

        svg.appendChild(path);
        this.element = path;

        // Mark ports as connected
        this.updatePortStates();
    }

    /**
     * Update the visual state of connected ports
     */
    updatePortStates() {
        // Source port
        const sourceDot = this.sourceNode.shadowRoot?.querySelector(
            `[data-port="${this.sourcePort}"]`
        );
        if (sourceDot) sourceDot.classList.add('connected');

        // Target port
        const targetDot = this.targetNode.shadowRoot?.querySelector(
            `[data-port="${this.targetPort}"]`
        );
        if (targetDot) targetDot.classList.add('connected');
    }

    /**
     * Calculate and update the path between nodes
     */
    updatePosition() {
        if (!this.element) return;

        const start = this.sourceNode.getPortPosition(this.sourcePort, true);
        const end = this.targetNode.getPortPosition(this.targetPort, false);

        if (!start || !end) return;

        // Create a smooth bezier curve
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        // Control point offset (creates the curve)
        const offset = Math.abs(dx) * 0.5;

        const pathData = `
      M ${start.x} ${start.y}
      C ${start.x + offset} ${start.y},
        ${end.x - offset} ${end.y},
        ${end.x} ${end.y}
    `;

        this.element.setAttribute('d', pathData.trim());
    }

    /**
     * Select this connection
     */
    select() {
        document.querySelectorAll('.connection.active').forEach(c => {
            c.classList.remove('active');
        });
        this.element.classList.add('active');
    }

    /**
     * Remove the connection
     */
    remove() {
        // Remove connected state from ports
        const sourceDot = this.sourceNode.shadowRoot?.querySelector(
            `[data-port="${this.sourcePort}"]`
        );
        if (sourceDot && !this.sourceNode.hasOutputConnections(this.sourcePort)) {
            sourceDot.classList.remove('connected');
        }

        const targetDot = this.targetNode.shadowRoot?.querySelector(
            `[data-port="${this.targetPort}"]`
        );
        if (targetDot) targetDot.classList.remove('connected');

        // Remove SVG element
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
