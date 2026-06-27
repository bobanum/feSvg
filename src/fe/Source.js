import { FilterNode } from "../FilterNode.js";

/**
 * Source - Web Component for source nodes in the editor
 */
export class Source extends FilterNode {
    static idCounter = 0;

    constructor() {
        super();
        this.name = 'Source';
        this.inputs = {};
        this.outputs = { result: null };
        this.params = {
            source: 'SourceGraphic'
        };
    }

    /**
     * Initialize the node with type and position
     */
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

    getOutputValue(portId = 'result') {
        if (portId !== 'result') {
            return super.getOutputValue(portId);
        }
        return this.params.source || 'SourceGraphic';
    }

    render() {
        return document.createDocumentFragment(); // Source node does not render any filter primitive
    }
    renderPreview() {
        const source = this.params.source || 'SourceGraphic';

        if (source === 'SourceAlpha') {
            // Rend SourceAlpha visible en blanc tout en gardant l'alpha.
            return this.createSvg('feColorMatrix', {
                in: 'SourceAlpha',
                type: 'matrix',
                values: '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'
            });
        }

        return this.createSvg('feOffset', {
            in: source,
            dx: '0',
            dy: '0'
        });
    }
    /**
     * Create HTML for node parameters
     */
    createParamsHTML() {
        const result = document.createElement('fieldset');
        result.classList.add('node-params');

        // let source = new Params.Choice('source', 'Source', this.params.source, 1);
        let source = document.createElement('choice-param');
        source.choices = ['SourceGraphic', 'SourceAlpha'];
        source.value = this.params.source;
        source.label = 'Source';
        source.addEventListener('input', (event) => {
            this.params.source = event.target.value;
            this.notifyChanged();
        });

        result.appendChild(source);

        return result;
    }
}

Source.register('source-node');
