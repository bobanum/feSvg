import { Node } from "./Node.js";
import { Preview } from "./Preview.js";

/**
 * FilterNode - Web Component for filter nodes in the editor
 */
export class FilterNode extends Node {
    static idCounter = 0;

    constructor(x, y, inputs = { in: null }, outputs = { result: null }) {
        super(x, y, inputs, outputs);
        this.adoptFunctions({ dom: Node.dom });
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
        super.connectedCallback();
        this.appendChild(this.createParamsHTML());
        this.shadowRoot.appendChild(new Preview());

        this.shadowRoot.appendChild(this.dom.ports());

    }

    /**
     * Initialize node properties based on type
     */
    initializeByType() {
        switch (this.filterType) {
            case 'source':
                this.name = 'SourceGraphic';
                this.inputs = {};
                this.outputs = { out: 'result' };
                break;

            case 'blur':
                this.name = 'Gaussian Blur';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    stdDeviation: 5
                };
                break;

            case 'offset':
                this.name = 'Offset';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    dx: 0,
                    dy: 0
                };
                break;

            case 'blend':
                this.name = 'Blend';
                this.inputs = {
                    in1: 'in',
                    in2: 'in2'
                };
                this.outputs = { out: 'result' };
                this.params = {
                    mode: 'normal'
                };
                break;

            case 'colormatrix':
                this.name = 'Color Matrix';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    type: 'matrix',
                    values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'
                };
                break;

            case 'composite':
                this.name = 'Composite';
                this.inputs = {
                    in1: 'in',
                    in2: 'in2'
                };
                this.outputs = { out: 'result' };
                this.params = {
                    operator: 'over'
                };
                break;

            case 'morphology':
                this.name = 'Morphology';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    operator: 'erode',
                    radius: 1
                };
                break;

            case 'flood':
                this.name = 'Flood';
                this.inputs = {};
                this.outputs = { out: 'result' };
                this.params = {
                    floodColor: '#000000',
                    floodOpacity: 1
                };
                break;

            case 'turbulence':
                this.name = 'Turbulence';
                this.inputs = {};
                this.outputs = { out: 'result' };
                this.params = {
                    type: 'turbulence',
                    baseFrequency: 0.05,
                    numOctaves: 1
                };
                break;

            case 'displacementmap':
                this.name = 'Displacement Map';
                this.inputs = {
                    in1: 'in',
                    in2: 'in2'
                };
                this.outputs = { out: 'result' };
                this.params = {
                    scale: 10,
                    xChannelSelector: 'R',
                    yChannelSelector: 'G'
                };
                break;

            case 'convolvematrix':
                this.name = 'Convolve Matrix';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    order: '3',
                    kernelMatrix: '0 0 0  0 1 0  0 0 0'
                };
                break;

            case 'componenttransfer':
                this.name = 'Component Transfer';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    type: 'identity'
                };
                break;

            case 'diffuselighting':
                this.name = 'Diffuse Lighting';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    surfaceScale: 1,
                    diffuseConstant: 1
                };
                break;

            case 'specularlighting':
                this.name = 'Specular Lighting';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    surfaceScale: 1,
                    specularConstant: 1,
                    specularExponent: 1
                };
                break;

            case 'tile':
                this.name = 'Tile';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                break;

            case 'merge':
                this.name = 'Merge';
                this.inputs = {
                    in1: 'in',
                    in2: 'in2'
                };
                this.outputs = { out: 'result' };
                break;

            case 'dropshadow':
                this.name = 'Drop Shadow';
                this.inputs = { in: 'in' };
                this.outputs = { out: 'result' };
                this.params = {
                    dx: 2,
                    dy: 2,
                    stdDeviation: 2
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

        const result = document.createElement('div');
        result.classList.add('node-params');

        // Special handling for colormatrix
        if (this.filterType === 'colormatrix') {
            return this.createColorMatrixParams();
        }

        // Special handling for convolvematrix
        if (this.filterType === 'convolvematrix') {
            return this.createConvolveMatrixParams();
        }

        // Default parameter rendering
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
     * Create Color Matrix specific parameters
     */
    createColorMatrixParams() {
        const result = document.createElement('div');
        result.classList.add('node-params');

        // Type selector
        const typeGroup = document.createElement('div');
        typeGroup.classList.add('param-group');
        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Type';
        typeGroup.appendChild(typeLabel);
        
        const typeSelect = document.createElement('select');
        typeSelect.dataset.param = 'type';
        ['matrix', 'saturate', 'hueRotate', 'luminanceToAlpha'].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            option.selected = this.params.type === opt;
            typeSelect.appendChild(option);
        });
        typeGroup.appendChild(typeSelect);
        result.appendChild(typeGroup);

        // Matrix grid container
        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('matrix-grid');
        matrixContainer.style.cssText = 'display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin: 8px 0;';

        // Parse current values
        const values = this.params.values.split(/\s+/).map(v => parseFloat(v) || 0);
        
        // Create 4x5 matrix inputs
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.1';
                input.value = values[row * 5 + col] || (row === col ? 1 : 0);
                input.dataset.row = row;
                input.dataset.col = col;
                input.style.cssText = 'width: 50px; padding: 4px; font-size: 0.75rem;';
                
                input.addEventListener('input', () => {
                    const inputs = matrixContainer.querySelectorAll('input');
                    const vals = Array.from(inputs).map(inp => inp.value);
                    this.params.values = vals.join(' ');
                });
                
                matrixContainer.appendChild(input);
            }
        }

        result.appendChild(matrixContainer);

        // Add labels
        const labelsDiv = document.createElement('div');
        labelsDiv.style.cssText = 'font-size: 0.7rem; color: #999; margin-top: 4px;';
        labelsDiv.innerHTML = '<div>R G B A Offset</div>';
        result.appendChild(labelsDiv);

        typeSelect.addEventListener('change', (event) => {
            this.params.type = event.target.value;
            const isMatrix = event.target.value === 'matrix';
            matrixContainer.style.display = isMatrix ? 'grid' : 'none';
            labelsDiv.style.display = isMatrix ? 'block' : 'none';
        });

        return result;
    }

    /**
     * Create Convolve Matrix specific parameters
     */
    createConvolveMatrixParams() {
        const result = document.createElement('div');
        result.classList.add('node-params');

        // Order input
        const orderGroup = document.createElement('div');
        orderGroup.classList.add('param-group');
        const orderLabel = document.createElement('label');
        orderLabel.textContent = 'Order';
        orderGroup.appendChild(orderLabel);
        
        const orderInput = document.createElement('input');
        orderInput.type = 'text';
        orderInput.value = this.params.order;
        orderInput.dataset.param = 'order';
        orderInput.placeholder = '3 or 3,3';
        orderGroup.appendChild(orderInput);
        result.appendChild(orderGroup);

        // Matrix grid container
        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('matrix-grid');
        
        const rebuildMatrix = () => {
            matrixContainer.innerHTML = '';
            const order = this.params.order.split(',').map(v => parseInt(v.trim()) || 3);
            const rows = order.length === 2 ? order[0] : order[0];
            const cols = order.length === 2 ? order[1] : order[0];
            
            matrixContainer.style.cssText = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 4px; margin: 8px 0;`;
            
            const values = this.params.kernelMatrix.split(/\s+/).map(v => parseFloat(v) || 0);
            
            for (let i = 0; i < rows * cols; i++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.1';
                input.value = values[i] || 0;
                input.dataset.index = i;
                input.style.cssText = 'width: 45px; padding: 4px; font-size: 0.75rem;';
                
                input.addEventListener('input', () => {
                    const inputs = matrixContainer.querySelectorAll('input');
                    const vals = Array.from(inputs).map(inp => inp.value);
                    this.params.kernelMatrix = vals.join(' ');
                });
                
                matrixContainer.appendChild(input);
            }
        };

        rebuildMatrix();
        result.appendChild(matrixContainer);

        orderInput.addEventListener('input', (event) => {
            this.params.order = event.target.value;
            rebuildMatrix();
        });

        // Other params
        ['divisor', 'bias'].forEach(paramName => {
            const group = document.createElement('div');
            group.classList.add('param-group');
            const label = document.createElement('label');
            label.textContent = paramName;
            group.appendChild(label);
            
            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.1';
            input.value = this.params[paramName];
            input.dataset.param = paramName;
            input.addEventListener('input', (e) => {
                this.params[paramName] = parseFloat(e.target.value);
            });
            group.appendChild(input);
            result.appendChild(group);
        });

        // Edge mode
        const edgeModeGroup = document.createElement('div');
        edgeModeGroup.classList.add('param-group');
        const edgeModeLabel = document.createElement('label');
        edgeModeLabel.textContent = 'Edge Mode';
        edgeModeGroup.appendChild(edgeModeLabel);
        
        const edgeModeSelect = document.createElement('select');
        edgeModeSelect.dataset.param = 'edgeMode';
        ['duplicate', 'wrap', 'none'].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            option.selected = this.params.edgeMode === opt;
            edgeModeSelect.appendChild(option);
        });
        edgeModeSelect.addEventListener('change', (e) => {
            this.params.edgeMode = e.target.value;
        });
        edgeModeGroup.appendChild(edgeModeSelect);
        result.appendChild(edgeModeGroup);

        return result;
    }
	createSvg(tagName, attributes = {}) {
		const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		for (const [key, value] of Object.entries(attributes)) {
			element.setAttribute(key, value);
		}
		return element;
	}

}

FilterNode.register('filter-node');
