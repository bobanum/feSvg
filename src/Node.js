/**
 * FilterNode - Web Component for filter nodes in the editor
 */
export class FilterNode extends HTMLElement {
  static idCounter = 0;

  constructor() {
    super();
    this.id = `node-${FilterNode.idCounter++}`;
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
    this.render();
    this.updatePosition();
    this.attachEventListeners();
    
    return this;
  }

  connectedCallback() {
    this.className = 'node';
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
   * Render the node content
   */
  render() {
    this.innerHTML = `
      <div class="node-header">
        <span class="node-title">${this.name}</span>
        <button class="node-menu-btn">⋮</button>
      </div>
      <div class="node-body">
        ${this.createParamsHTML()}
      </div>
      <div class="node-ports">
        <div class="ports-left">
          ${this.inputs.map(input => `
            <div class="port port-input" data-port-id="${input.id}">
              <div class="port-dot" data-port="${input.id}"></div>
              <span>${input.name}</span>
            </div>
          `).join('')}
        </div>
        <div class="ports-right">
          ${this.outputs.map(output => `
            <div class="port port-output" data-port-id="${output.id}">
              <span>${output.name}</span>
              <div class="port-dot" data-port="${output.id}"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Create HTML for node parameters
   */
  createParamsHTML() {
    if (Object.keys(this.params).length === 0) {
      return '';
    }

    let html = '<div class="node-params">';
    
    for (const [key, value] of Object.entries(this.params)) {
      if (typeof value === 'number') {
        html += `
          <div class="param-group">
            <label>${key}</label>
            <input type="number" data-param="${key}" value="${value}" step="0.1">
          </div>
        `;
      } else if (typeof value === 'string') {
        html += `
          <div class="param-group">
            <label>${key}</label>
            <input type="text" data-param="${key}" value="${value}">
          </div>
        `;
      }
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Attach event listeners to the node element
   */
  attachEventListeners() {
    // Drag and drop
    const header = this.querySelector('.node-header');

    const onMouseDown = (e) => {
      this._isDragging = true;
      this.classList.add('dragging');
      this._dragStart.x = e.clientX;
      this._dragStart.y = e.clientY;
      this._initialPos.x = this.x;
      this._initialPos.y = this.y;
      
      // Bring to front
      this.style.zIndex = '100';
      
      e.preventDefault();
    };

    const onMouseMove = (e) => {
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
    };

    const onMouseUp = () => {
      if (this._isDragging) {
        this._isDragging = false;
        this.classList.remove('dragging');
        this.style.zIndex = '';
      }
    };

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Store handlers for cleanup if needed
    this._eventHandlers = { onMouseMove, onMouseUp };

    // Parameter changes
    const paramInputs = this.querySelectorAll('[data-param]');
    paramInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const paramName = e.target.dataset.param;
        const value = e.target.type === 'number' 
          ? parseFloat(e.target.value) 
          : e.target.value;
        this.params[paramName] = value;
        
        // Dispatch event for filter updates
        this.dispatchEvent(new CustomEvent('param-changed', {
          bubbles: true,
          detail: { nodeId: this.id, param: paramName, value }
        }));
      });
    });

    // Node selection
    this.addEventListener('click', (e) => {
      if (e.target.classList.contains('port-dot')) return;
      
      document.querySelectorAll('filter-node.selected').forEach(n => {
        if (n !== this) n.classList.remove('selected');
      });
      this.classList.add('selected');
    });
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
      document.removeEventListener('mousemove', this._eventHandlers.onMouseMove);
      document.removeEventListener('mouseup', this._eventHandlers.onMouseUp);
    }
  }
}

// Register the custom element only if not already defined
if (!customElements.get('filter-node')) {
  customElements.define('filter-node', FilterNode);
}

