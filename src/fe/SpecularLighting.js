import { FilterNode } from "../FilterNode.js";
import * as Params from "../params/index.js";

/**
 * SpecularLighting - Web Component for specular lighting filter nodes
 */
export class SpecularLighting extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Specular Lighting';
        this.inputs = { in: null };
        this.outputs = { result: [] };
        this.params = {
            surfaceScale: 1,
            specularConstant: 1,
            specularExponent: 1,
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
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
        result.setAttribute('surfaceScale', this.params.surfaceScale);
        result.setAttribute('specularConstant', this.params.specularConstant);
        result.setAttribute('specularExponent', this.params.specularExponent);
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

        const constantParam = new Params.Number('specularConstant', 'Specular Constant', this.params.specularConstant, 0.1);
        result.appendChild(constantParam);

        const exponentParam = new Params.Number('specularExponent', 'Specular Exponent', this.params.specularExponent, 0.1);
        result.appendChild(exponentParam);

        const colorParam = new Params.Text('lightingColor', 'Lighting Color', this.params.lightingColor);
        result.appendChild(colorParam);

        result.addEventListener('input', (event) => {
            this.params[event.target.name] = event.target.value;
        });

        return result;
    }
}

SpecularLighting.register('specularlighting-filter-node');
