import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * ColorMatrix - Web Component for color matrix filter nodes
 */
export class ColorMatrix extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Color Matrix';
        this.inputs = { in: 'in' };
        this.outputs = { result: 'result' };
        this.params = {
            type: 'matrix',
            values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        result.setAttribute('type', this.params.type);
        if (this.params.type === 'matrix') {
            result.setAttribute('values', this.params.values);
        }
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const typeParam = new Params.Choice('type', 'Type', this.params.type, 
            ['matrix', 'saturate', 'hueRotate', 'luminanceToAlpha']);
        result.appendChild(typeParam);

        // Create matrix grid container
        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('matrix-grid');
        matrixContainer.style.cssText = 'display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin: 8px 0;';

        // Parse current values
        const values = this.params.values.split(/\s+/).map(v => parseFloat(v) || 0);
        
        // Create 4x5 matrix inputs (color matrix is 4x5)
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
                    this.updateMatrixValues(matrixContainer);
                });
                
                matrixContainer.appendChild(input);
            }
        }

        result.appendChild(matrixContainer);

        // Add labels
        const labelsDiv = document.createElement('div');
        labelsDiv.style.cssText = 'font-size: 0.7rem; color: #999; margin-top: 4px;';
        labelsDiv.innerHTML = '<div>R G B A Offset</div>';
        result.insertBefore(labelsDiv, matrixContainer.nextSibling);

        typeParam.addEventListener('change', (event) => {
            this.params.type = event.target.value;
            matrixContainer.style.display = event.target.value === 'matrix' ? 'grid' : 'none';
            labelsDiv.style.display = event.target.value === 'matrix' ? 'block' : 'none';
        });

        return result;
    }

    updateMatrixValues(container) {
        const inputs = container.querySelectorAll('input');
        const values = Array.from(inputs).map(input => input.value);
        this.params.values = values.join(' ');
    }
}

ColorMatrix.register('colormatrix-filter-node');
