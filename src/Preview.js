import { Component } from "./Component.js";

/**
 * Preview component - builds the preview DOM for a filter node
 */
export class Preview extends Component {
	constructor() {
		super();
		this.adoptFunctions({ dom: Preview.dom });
	}
	createElement(tagName, attributes = {}) {
		const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		for (const [key, value] of Object.entries(attributes)) {
			element.setAttribute(key, value);
		}
		return element;
	}
	static dom = {
		main: function () {

			const result = document.createDocumentFragment();

			const svg = this.createElement('svg', {
				width: '100%',
				height: '100%',
				viewBox: '0 0 128 128'
			});

			const defs = this.createElement('defs');
			// const filter = this.createElement('filter', { id: 'glow' });
			this.filter = this.dom.filter();

			const gaussianBlur = this.createElement('feGaussianBlur', {
				stdDeviation: '2',
				result: 'coloredBlur'
			});

			const merge = this.createElement('feMerge');
			const mergeNodeBlur = this.createElement('feMergeNode', { in: 'coloredBlur' });
			const mergeNodeSource = this.createElement('feMergeNode', { in: 'SourceGraphic' });

			merge.appendChild(mergeNodeBlur);
			merge.appendChild(mergeNodeSource);
			this.filter.appendChild(gaussianBlur);
			this.filter.appendChild(merge);
			defs.appendChild(this.filter);

			const use = this.createElement('use', {
				href: '/img/previews.svg#abc',
				x: '0',
				y: '0',
				width: '100%',
				height: '100%',
				filter: 'url(#glow)'
			});

			svg.appendChild(defs);
			svg.appendChild(use);
			result.appendChild(svg);

			return result;
		},
		filter: function () {
			const result = this.createElement('filter', { id: 'glow' });
			// result.appendChild(this.createSlot());
			// result.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'slot'));
			return result;
		}
	};
}

Preview.register('node-preview');