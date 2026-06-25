import { Connection } from './Connection.js';
import './fe/index.js';

/**
 * NodeEditor class - Main controller for the node-based editor
 */
export class NodeEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.nodes = new Map();
        this.connections = new Map();

        this.connectionStart = null; // For tracking connection creation
        this.tempConnection = null;   // Temporary visual connection while dragging

        this.init();
    }

    /**
     * Initialize the editor
     */
    init() {
        this.setupEventListeners();

        // Create an initial source node
        this.addNode(document.createElement('source-node'), 100, 100);
        // this.addNode(document.createElement('blur-filter-node'), 400, 100);
        // this.addNode(document.createElement('offset-filter-node'), 700, 100);
        // this.addNode(document.createElement('blend-filter-node'), 1000, 100);
    }

    createNodeElement(type) {
        if (type === 'source') {
            return document.createElement('source-node');
        }

        const tagName = `${type}-filter-node`;
        if (customElements.get(tagName)) {
            return document.createElement(tagName);
        }

        switch (type) {
            default:
                return null;
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Library panel drag and drop
        const libraryItems = document.querySelectorAll('.library-item');
        const editorContainer = document.getElementById('editor-container');

        libraryItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('node-type', e.target.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        editorContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        editorContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('node-type');
            if (type) {
                const rect = editorContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addNode(type, x, y);
            }
        });

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Clear all nodes and connections?')) {
                this.clear();
            }
        });

        // Port connection handling
        document.addEventListener('mousedown', this.handlePortMouseDown.bind(this));
        document.addEventListener('mousemove', this.handlePortMouseMove.bind(this));
        document.addEventListener('mouseup', this.handlePortMouseUp.bind(this));

        // Node movement updates connections
        document.addEventListener('node-moved', (e) => {
            this.updateConnectionsForNode(e.detail.nodeId);
        });

        // Delete key to remove selected items
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
            }
        });

        document.addEventListener('node-changed', (e) => {
            const node = this.nodes.get(e.detail.nodeId);
            if (node) {
                node.refreshPreview();
            }
        });
    }

    /**
     * Add a new node to the editor
     */
    addNode(node, x, y) {
        const container = document.getElementById('nodes-container');

        if (typeof node === 'string') {
            node = this.createNodeElement(node);
            if (!node) return null;
        }

        node.init(x, y);
        container.appendChild(node);
        this.nodes.set(node.id, node);

        this.autoConnectNode(node);
        node.refreshPreview();

        return node;
    }

    /**
     * Automatically connect a new node to the nearest node with an available output
     */
    autoConnectNode(newNode) {
        // Skip if node has no inputs
        if (!newNode.inputs || Object.keys(newNode.inputs).length === 0) {
            return;
        }

        let nearestNode = null;
        let minDistance = Infinity;

        // Find the nearest node with an output port
        this.nodes.forEach(node => {
            if (node.id === newNode.id) return; // Skip self
            if (!node.outputs || Object.keys(node.outputs).length === 0) return; // Skip nodes without outputs

            const distance = Math.sqrt(
                Math.pow(node.x - newNode.x, 2) + 
                Math.pow(node.y - newNode.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = node;
            }
        });

        // Connect to the nearest node if found and within reasonable distance
        if (nearestNode && minDistance < 600) {
            const sourcePortId = Object.keys(nearestNode.outputs)[0];
            const targetPortId = Object.keys(newNode.inputs)[0];
            
            // Wait a bit for the DOM to be fully ready
            setTimeout(() => {
                this.createConnection(nearestNode, sourcePortId, newNode, targetPortId);
            }, 50);
        }
    }

    /**
     * Handle mouse down on a port (start connection)
     */
    handlePortMouseDown(e) {
        const portDot = e.composedPath().find(target => target instanceof HTMLElement && target.classList?.contains('dot'));
        if (!portDot) return;

        const portElement = e.composedPath().find(target => target instanceof HTMLElement && target.classList?.contains('port'));
        const nodeElement = e.composedPath().find(target => target instanceof HTMLElement && target.classList?.contains('node'));
        if (!portElement || !nodeElement) return;

        const node = this.nodes.get(nodeElement.id);
        if (!node) return;
        const portId = portDot.dataset.port;
        const isOutput = portElement.classList.contains('output');

        // Only start connections from output ports
        if (!isOutput) return;

        e.preventDefault();
        e.stopPropagation();

        this.connectionStart = {
            node,
            portId,
            isOutput
        };

        // Create temporary connection line
        const svg = document.getElementById('connections-svg');
        this.tempConnection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tempConnection.classList.add('connection');
        this.tempConnection.style.opacity = '0.4';
        svg.appendChild(this.tempConnection);
    }

    /**
     * Handle mouse move while creating connection
     */
    handlePortMouseMove(e) {
        if (!this.connectionStart || !this.tempConnection) return;

        const start = this.connectionStart.node.getPortPosition(
            this.connectionStart.portId,
            this.connectionStart.isOutput
        );

        const editorRect = document.getElementById('editor-container').getBoundingClientRect();
        const end = {
            x: e.clientX - editorRect.left,
            y: e.clientY - editorRect.top
        };

        // Draw temporary connection
        const dx = end.x - start.x;
        const offset = Math.abs(dx) * 0.5;

        const pathData = `
      M ${start.x} ${start.y}
      C ${start.x + offset} ${start.y},
        ${end.x - offset} ${end.y},
        ${end.x} ${end.y}
    `;

        this.tempConnection.setAttribute('d', pathData.trim());
    }

    /**
     * Handle mouse up (complete connection)
     */
    handlePortMouseUp(e) {
        if (!this.connectionStart) return;

        // Remove temporary connection
        if (this.tempConnection && this.tempConnection.parentNode) {
            this.tempConnection.parentNode.removeChild(this.tempConnection);
            this.tempConnection = null;
        }

        const portDot = e.composedPath().find(target => target instanceof HTMLElement && target.classList?.contains('dot'));
        if (portDot) {
            const portElement = e.composedPath().find(target => target instanceof HTMLElement && target.classList?.contains('port'));
            const nodeElement = e.composedPath().find(target => target instanceof HTMLElement && target.classList?.contains('node'));
            if (!portElement || !nodeElement) {
                this.connectionStart = null;
                return;
            }

            const targetNode = this.nodes.get(nodeElement.id);
            if (!targetNode) {
                this.connectionStart = null;
                return;
            }
            const targetPortId = portDot.dataset.port;
            const isInput = portElement.classList.contains('input');

            // Only connect to input ports
            if (isInput && targetNode.id !== this.connectionStart.node.id) {
                this.createConnection(
                    this.connectionStart.node,
                    this.connectionStart.portId,
                    targetNode,
                    targetPortId
                );
            }
        }

        this.connectionStart = null;
    }

    /**
     * Create a connection between two nodes
     */
    createConnection(sourceNode, sourcePort, targetNode, targetPort) {
        const duplicateConnection = [...this.connections.values()].find((connection) => (
            connection.sourceNode.id === sourceNode.id
            && connection.sourcePort === sourcePort
            && connection.targetNode.id === targetNode.id
            && connection.targetPort === targetPort
        ));
        if (duplicateConnection) {
            return duplicateConnection;
        }

        const existingInputConnection = [...this.connections.entries()].find(([, connection]) => (
            connection.targetNode.id === targetNode.id && connection.targetPort === targetPort
        ));
        if (existingInputConnection) {
            const [connectionId] = existingInputConnection;
            this.removeConnection(connectionId);
        }

        const connection = new Connection(sourceNode, sourcePort, targetNode, targetPort);
        this.connections.set(connection.id, connection);
        sourceNode.addOutputConnection(sourcePort, connection.id);
        targetNode.inputs[targetPort] = sourceNode;

        targetNode.setInputValue(targetPort, sourceNode.getOutputValue(sourcePort));
        targetNode.refreshPreview();

        console.log(`Connected ${sourceNode.name}.${sourcePort} -> ${targetNode.name}.${targetPort}`);
        return connection;
    }

    removeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        connection.sourceNode.removeOutputConnection(connection.sourcePort, connection.id);
        connection.targetNode.inputs[connection.targetPort] = null;
        connection.targetNode.clearInputValue(connection.targetPort);
        connection.targetNode.refreshPreview();
        connection.remove();
        this.connections.delete(connectionId);
    }

    /**
     * Update all connections for a specific node
     */
    updateConnectionsForNode(nodeId) {
        this.connections.forEach(connection => {
            if (connection.sourceNode.id === nodeId || connection.targetNode.id === nodeId) {
                connection.updatePosition();
            }
        });
    }

    /**
     * Delete selected nodes and connections
     */
    deleteSelected() {
        const selectedNode = document.querySelector('.node.selected');
        if (selectedNode) {
            const nodeId = selectedNode.id;
            const node = this.nodes.get(nodeId);

            // Remove all connections involving this node
            const connectionsToRemove = [];
            this.connections.forEach((connection, id) => {
                if (connection.sourceNode.id === nodeId || connection.targetNode.id === nodeId) {
                    connectionsToRemove.push(id);
                }
            });

            connectionsToRemove.forEach(id => {
                this.removeConnection(id);
            });

            // Remove node
            node.remove();
            this.nodes.delete(nodeId);
            return;
        }

        const selectedConnection = document.querySelector('.connection.active');
        if (selectedConnection) {
            const connectionId = selectedConnection.id;
            this.removeConnection(connectionId);
        }
    }

    /**
     * Clear all nodes and connections
     */
    clear() {
        this.connections.forEach((connection) => connection.remove());
        this.connections.clear();

        this.nodes.forEach(node => node.remove());
        this.nodes.clear();

        // Add back a source node
        this.addNode('source', 100, 100);
    }

    /**
     * Export the current graph as JSON
     */
    exportGraph() {
        const graph = {
            nodes: [],
            connections: []
        };

        this.nodes.forEach(node => {
            graph.nodes.push({
                id: node.id,
                type: node.filterType,
                x: node.x,
                y: node.y,
                params: node.params
            });
        });

        this.connections.forEach(connection => {
            graph.connections.push({
                source: connection.sourceNode.id,
                sourcePort: connection.sourcePort,
                target: connection.targetNode.id,
                targetPort: connection.targetPort
            });
        });

        return graph;
    }
}
