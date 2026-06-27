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
        this.inputs = { in: null };
        this.outputs = { result: [] };
        this.params = {
            type: 'matrix',
            values: {
                matrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0',
                saturation: 1,
                hueRotate: 0
            }
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
        this.refreshPreview();
    }

    render() {
        const attributes = {
            result: this.getOutputValue('result'),
            in: this.getInputValue('in') || 'SourceGraphic',
            type: this.params.type
        };

        if (this.params.type === 'matrix') {
            attributes.values = this.params.values.matrix;
        } else if (this.params.type === 'saturate') {
            attributes.values = String(Number(this.params.values.saturation) || 0);
        } else if (this.params.type === 'hueRotate') {
            attributes.values = String(Number(this.params.values.hueRotate) || 0);
        }

        const result = this.createSvg('feColorMatrix', attributes);
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const typeParam = new Params.Choice('type', 'Type', this.params.type,
            ['matrix', 'saturate', 'hueRotate', 'luminanceToAlpha']);
        result.appendChild(typeParam);

        const matrixParam = new Params.Matrix('values_matrix', 'Values', this.params.values.matrix);
        result.appendChild(matrixParam);

        const saturationParam = new Params.Number('values_saturation', 'Value', this.params.values.saturation, { min: 0, max: 2, step: 0.05 });
        result.appendChild(saturationParam);

        const hueRotateParam = new Params.Number('values_hueRotate', 'Value', this.params.values.hueRotate, { min: 0, max: 360, step: 1 });
        result.appendChild(hueRotateParam);

        const updateMatrixVisibility = () => {
            matrixParam.style.display = 'none';
            saturationParam.style.display = 'none';
            hueRotateParam.style.display = 'none';
            switch (this.params.type) {
                case 'matrix':
                    matrixParam.style.display = '';
                    break;
                case 'saturate':
                    saturationParam.style.display = '';
                    break;
                case 'hueRotate':
                    hueRotateParam.style.display = '';
                    break;
            }
        };

        typeParam.addEventListener('change', () => {
            console.log(this.params.type);
            
            this.params.type = typeParam.value;
            updateMatrixVisibility();
            this.notifyChanged();
        });

        matrixParam.addEventListener('input', () => {
            this.params.values.matrix = matrixParam.value;
            this.notifyChanged();
        });

        saturationParam.addEventListener('input', () => {
            this.params.values.saturation = saturationParam.value;
            this.notifyChanged();
        });

        hueRotateParam.addEventListener('input', () => {
            this.params.values.hueRotate = hueRotateParam.value;
            this.notifyChanged();
        });

        updateMatrixVisibility();

        return result;
    }
}

ColorMatrix.register('colormatrix-filter-node');
