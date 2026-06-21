/**
 * Node class - Represents a filter node in the editor
 */
export class Node {
  static idCounter = 0;

  constructor(type, x, y) {
    this.id = `node-${Node.idCounter++}`;
    this.type = type;
    this.x = x;
    this.y = y;
    this.inputs = [];
    this.outputs = [];
    this.params = {};
    this.element = null;
    
    this.initializeByType();
    this.createElement();
    this.attachEventListeners();
  }

  /**
   * Initialize node properties based on type
   */
  initializeByType() {
    switch (this.type) {
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
   * Create the DOM element for the node
   */
  createElement() {
    const node = document.createElement('div');
    node.className = 'node';
    node.id = this.id;
    node.style.left = `${this.x}px`;
    node.style.top = `${this.y}px`;

    // Header
    const header = document.createElement('div');
    header.className = 'node-header';
    header.innerHTML = `
      <span class="node-title">${this.name}</span>
      <button class="node-menu-btn">⋮</button>
    `;
    node.appendChild(header);

    // Body with parameters
    const body = document.createElement('div');
    body.className = 'node-body';
    body.innerHTML = this.createParamsHTML();
    node.appendChild(body);

    // Ports
    const ports = document.createElement('div');
    ports.className = 'node-ports';
    
    // Input ports
    const portsLeft = document.createElement('div');
    portsLeft.className = 'ports-left';
    this.inputs.forEach(input => {
      const port = document.createElement('div');
      port.className = 'port port-input';
      port.dataset.portId = input.id;
      port.innerHTML = `
        <div class="port-dot" data-port="${input.id}"></div>
        <span>${input.name}</span>
      `;
      portsLeft.appendChild(port);
    });
    ports.appendChild(portsLeft);

    // Output ports
    const portsRight = document.createElement('div');
    portsRight.className = 'ports-right';
    this.outputs.forEach(output => {
      const port = document.createElement('div');
      port.className = 'port port-output';
      port.dataset.portId = output.id;
      port.innerHTML = `
        <span>${output.name}</span>
        <div class="port-dot" data-port="${output.id}"></div>
      `;
      portsRight.appendChild(port);
    });
    ports.appendChild(portsRight);

    node.appendChild(ports);
    this.element = node;
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
    const header = this.element.querySelector('.node-header');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.element.classList.add('dragging');
      startX = e.clientX;
      startY = e.clientY;
      initialX = this.x;
      initialY = this.y;
      
      // Bring to front
      this.element.style.zIndex = 100;
      
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      this.x = initialX + dx;
      this.y = initialY + dy;
      
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
      
      // Dispatch event for connection updates
      this.element.dispatchEvent(new CustomEvent('node-moved', {
        bubbles: true,
        detail: { nodeId: this.id }
      }));
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.element.classList.remove('dragging');
        this.element.style.zIndex = '';
      }
    });

    // Parameter changes
    const paramInputs = this.element.querySelectorAll('[data-param]');
    paramInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const paramName = e.target.dataset.param;
        const value = e.target.type === 'number' 
          ? parseFloat(e.target.value) 
          : e.target.value;
        this.params[paramName] = value;
        
        // Dispatch event for filter updates
        this.element.dispatchEvent(new CustomEvent('param-changed', {
          bubbles: true,
          detail: { nodeId: this.id, param: paramName, value }
        }));
      });
    });

    // Node selection
    this.element.addEventListener('click', (e) => {
      if (e.target.classList.contains('port-dot')) return;
      
      document.querySelectorAll('.node.selected').forEach(n => {
        if (n !== this.element) n.classList.remove('selected');
      });
      this.element.classList.add('selected');
    });
  }

  /**
   * Get the position of a port in screen coordinates
   */
  getPortPosition(portId, isOutput = false) {
    const portDot = this.element.querySelector(
      `[data-port="${portId}"]`
    );
    
    if (!portDot) return null;
    
    const rect = portDot.getBoundingClientRect();
    const editorRect = document.getElementById('editor-container').getBoundingClientRect();
    
    return {
      x: rect.left + rect.width / 2 - editorRect.left,
      y: rect.top + rect.height / 2 - editorRect.top
    };
  }

  /**
   * Remove the node from the DOM
   */
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
