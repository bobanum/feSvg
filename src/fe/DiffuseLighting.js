import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * DiffuseLighting - Web Component for diffuse lighting filter nodes
 */
export class DiffuseLighting extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Diffuse Lighting';
        this.inputs = { in: null };
        this.outputs = { result: [] };
        this.params = {
            surfaceScale: 1,
            diffuseConstant: 1,
            lightingColor: '#ffffff'
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feDiffuseLighting');
        result.setAttribute('surfaceScale', this.params.surfaceScale);
        result.setAttribute('diffuseConstant', this.params.diffuseConstant);
        result.setAttribute('lighting-color', this.params.lightingColor);
        
        // Add a point light source
        const pointLight = document.createElementNS('http://www.w3.org/2000/svg', 'fePointLight');
        pointLight.setAttribute('x', 50);
        pointLight.setAttribute('y', 50);
        pointLight.setAttribute('z', 50);
        result.appendChild(pointLight);
        
        return result;
    }

    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        const scaleParam = new Params.Number('surfaceScale', 'Surface Scale', this.params.surfaceScale, 0.1);
        result.appendChild(scaleParam);

        const constantParam = new Params.Number('diffuseConstant', 'Diffuse Constant', this.params.diffuseConstant, 0.1);
        result.appendChild(constantParam);

        const colorParam = new Params.Text('lightingColor', 'Lighting Color', this.params.lightingColor);
        result.appendChild(colorParam);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = event.target.value;
        });

        return result;
    }
}

DiffuseLighting.register('diffuselighting-filter-node');
