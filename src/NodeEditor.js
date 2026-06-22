import { FilterNode } from './FilterNode.js';
import { Connection } from './Connection.js';

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
    this.addNode('source', 100, 100);
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Add node button
    const addBtn = document.getElementById('add-node-btn');
    const nodeMenu = document.getElementById('node-menu');
    
    addBtn.addEventListener('click', (e) => {
      nodeMenu.style.left = `${e.clientX}px`;
      nodeMenu.style.top = `${e.clientY}px`;
      nodeMenu.classList.toggle('hidden');
    });

    // Node menu selection
    const menuItems = nodeMenu.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        const x = Math.random() * 400 + 200;
        const y = Math.random() * 300 + 150;
        this.addNode(type, x, y);
        nodeMenu.classList.add('hidden');
      });
    });

    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
      if (confirm('Clear all nodes and connections?')) {
        this.clear();
      }
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!nodeMenu.contains(e.target) && e.target !== addBtn) {
        nodeMenu.classList.add('hidden');
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
  }

  /**
   * Add a new node to the editor
   */
  addNode(type, x, y) {
    // const node = document.createElement('filter-node');
    const node = new FilterNode();
    
    // Add to DOM first (required for custom elements)
    const container = document.getElementById('nodes-container');
    
    // Then initialize
    node.init(type, x, y);
    this.nodes.set(node.id, node);
    container.appendChild(node);
    
    return node;
  }

  /**
   * Handle mouse down on a port (start connection)
   */
  handlePortMouseDown(e) {
    const portDot = e.target;
    if (!portDot.classList.contains('port-dot')) return;

    const portElement = portDot.parentElement;
    const nodeElement = portDot.closest('filter-node');
    const node = this.nodes.get(nodeElement.id);
    const portId = portDot.dataset.port;
    const isOutput = portElement.classList.contains('port-output');

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

    const portDot = e.target;
    if (portDot.classList.contains('port-dot')) {
      const portElement = portDot.parentElement;
      const nodeElement = portDot.closest('filter-node');
      const targetNode = this.nodes.get(nodeElement.id);
      const targetPortId = portDot.dataset.port;
      const isInput = portElement.classList.contains('port-input');

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
    // Check if connection already exists
    const existingKey = `${sourceNode.id}-${sourcePort}-${targetNode.id}-${targetPort}`;
    if (this.connections.has(existingKey)) {
      console.log('Connection already exists');
      return null;
    }

    const connection = new Connection(sourceNode, sourcePort, targetNode, targetPort);
    this.connections.set(connection.id, connection);
    
    console.log(`Connected ${sourceNode.name}.${sourcePort} -> ${targetNode.name}.${targetPort}`);
    return connection;
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
    const selectedNode = document.querySelector('filter-node.selected');
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
        const connection = this.connections.get(id);
        connection.remove();
        this.connections.delete(id);
      });
      
      // Remove node
      node.remove();
      this.nodes.delete(nodeId);
      return;
    }

    const selectedConnection = document.querySelector('.connection.active');
    if (selectedConnection) {
      const connectionId = selectedConnection.id;
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.remove();
        this.connections.delete(connectionId);
      }
    }
  }

  /**
   * Clear all nodes and connections
   */
  clear() {
    this.connections.forEach(connection => connection.remove());
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
