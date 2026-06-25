import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * ConvolveMatrix - Web Component for convolve matrix filter nodes
 */
export class ConvolveMatrix extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Convolve Matrix';
        this.inputs = { in: 'in' };
        this.outputs = { result: 'result' };
        this.params = {
            order: '3',
            kernelMatrix: '0 0 0  0 1 0  0 0 0',
            divisor: 1,
            bias: 0,
            edgeMode: 'duplicate'
        };
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feConvolveMatrix');
        result.setAttribute('order', this.params.order);
        result.setAttribute('kernelMatrix', this.params.kernelMatrix);
        result.setAttribute('divisor', this.params.divisor);
        result.setAttribute('bias', this.params.bias);
        result.setAttribute('edgeMode', this.params.edgeMode);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const orderParam = new Params.Text('order', 'Order (e.g., 3 or 3,3)', this.params.order);
        result.appendChild(orderParam);

        // Create matrix grid container
        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('matrix-grid');
        
        const rebuildMatrix = () => {
            matrixContainer.innerHTML = '';
            const order = this.params.order.split(',').map(v => parseInt(v.trim()) || 3);
            const rows = order.length === 2 ? order[0] : order[0];
            const cols = order.length === 2 ? order[1] : order[0];
            
            matrixContainer.style.cssText = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 4px; margin: 8px 0;`;
            
            // Parse current values
            const values = this.params.kernelMatrix.split(/\s+/).map(v => parseFloat(v) || 0);
            
            // Create matrix inputs
            for (let i = 0; i < rows * cols; i++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.step = '0.1';
                input.value = values[i] || 0;
                input.dataset.index = i;
                input.style.cssText = 'width: 45px; padding: 4px; font-size: 0.75rem;';
                
                input.addEventListener('input', () => {
                    this.updateKernelMatrix(matrixContainer);
                });
                
                matrixContainer.appendChild(input);
            }
        };

        rebuildMatrix();
        result.appendChild(matrixContainer);

        orderParam.addEventListener('input', (event) => {
            this.params.order = event.target.value;
            rebuildMatrix();
        });

        const divisorParam = new Params.Number('divisor', 'Divisor', this.params.divisor, 0.1);
        result.appendChild(divisorParam);

        const biasParam = new Params.Number('bias', 'Bias', this.params.bias, 0.1);
        result.appendChild(biasParam);

        const edgeModeParam = new Params.Choice('edgeMode', 'Edge Mode', this.params.edgeMode,
            ['duplicate', 'wrap', 'none']);
        result.appendChild(edgeModeParam);

        result.addEventListener('input', (event) => {
            if (event.target.name !== 'order') {
                this.params[event.target.name] = event.target.value;
            }
        });

        return result;
    }

    updateKernelMatrix(container) {
        const inputs = container.querySelectorAll('input');
        const values = Array.from(inputs).map(input => input.value);
        this.params.kernelMatrix = values.join(' ');
    }
}

ConvolveMatrix.register('convolvematrix-filter-node');
