import { Component } from "./Component.js";

const PREVIEW_BACKGROUNDS = [
	{ id: 'light-checker', label: 'Grille', style: 'background-image: repeating-conic-gradient(#EEE 0turn 0.25turn, #FFF 0.25turn 0.5turn);' },
	{ id: 'dark-checker', label: 'Grille sombre', style: 'background-image: repeating-conic-gradient(#333 0turn 0.25turn, #000 0.25turn 0.5turn);' },
	{ id: 'light', label: 'Clair', style: 'background-color: #eee;' },
	{ id: 'dark', label: 'Sombre', style: 'background-color: #222;' },
	{ id: 'magenta', label: 'Magenta', style: 'background-color: magenta;' },
	{ id: 'cyan', label: 'Cyan', style: 'background-color: cyan;' },
	{ id: 'yellow', label: 'Jaune', style: 'background-color: yellow;' },
];

const PREVIEW_SHAPES = [
	{ id: 'logo', label: 'Logo' },
	{ id: 'abc', label: 'ABC' },
	{ id: 'cat', label: 'Chat' },
	{ id: 'flower', label: 'Fleur' },
	{ id: 'clothing-button', label: 'Bouton' },
];

/**
 * Preview component - builds the preview DOM for a filter node
 */
export class Preview extends Component {
	constructor() {
		super();
		this.state = {
			background: 'light-checker',
			shape: PREVIEW_SHAPES[0].id,
		};
		this.adoptFunctions({ dom: Preview.dom });
	}

	createSvg(tagName, attributes = {}) {
		const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
		for (const [key, value] of Object.entries(attributes)) {
			element.setAttribute(key, value);
		}
		return element;
	}

	getShapeHref(shape = this.state.shape) {
		return `/img/previews.svg#${shape}`;
	}

	applyState() {
		if (this.previewSvg) {
			const background = PREVIEW_BACKGROUNDS.find((item) => item.id === this.state.background);
			this.previewSvg.style.cssText = background?.style || '';
		}

		if (this.previewUse) {
			const href = this.getShapeHref();
			this.previewUse.setAttribute('href', href);
			this.previewUse.setAttribute('xlink:href', href);
		}

		this.shadowRoot?.querySelectorAll('[data-background-radio]').forEach((input) => {
			input.checked = input.value === this.state.background;
		});

		this.shadowRoot?.querySelectorAll('[data-shape-radio]').forEach((input) => {
			input.checked = input.value === this.state.shape;
		});
	}

	static dom = {
		main: function () {

			const result = document.createDocumentFragment();

			const style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = '/css/preview.css';
			result.appendChild(style);
			result.appendChild(this.dom.toolbar());

			const svg = this.createSvg('svg', {
				class: 'svg',
				width: '100%',
				height: '100%',
				viewBox: '0 0 128 128'
			});
			this.previewSvg = svg;

			const defs = this.createSvg('defs');
			this.filter = this.createSvg('filter', { id: 'preview' });

			defs.appendChild(this.filter);

			const use = this.createSvg('use', {
				href: this.getShapeHref(),
				x: '0',
				y: '0',
				width: '100%',
				height: '100%',
				filter: 'url(#preview)'
			});

			this.previewUse = use;

			svg.appendChild(defs);
			svg.appendChild(use);
			result.appendChild(svg);
			this.applyState();

			return result;
		},
		toolbar: function () {
			const toolbar = document.createElement('div');
			toolbar.classList.add('toolbar');

			toolbar.appendChild(this.dom.backgroundGroup());
			toolbar.appendChild(this.dom.shapeMenu());

			return toolbar;
		},
		backgroundGroup: function () {
			const fieldset = document.createElement('fieldset');
			fieldset.classList.add('toolbar-group', 'toolbar-radio-group');

			for (const option of PREVIEW_BACKGROUNDS) {
				const label = document.createElement('label');

				const input = document.createElement('input');
				input.type = 'radio';
				input.name = 'background';
				input.value = option.id;
				input.dataset.backgroundRadio = 'true';
				input.checked = this.state.background === option.id;
				
				const text = document.createElement('span');
				label.style = option.style;
				label.appendChild(input);
				label.appendChild(text);
				fieldset.appendChild(label);
			}
			fieldset.addEventListener('change', (e) => {
				this.state.background = e.target.value;
				this.applyState();
			});

			return fieldset;
		},
		shapeMenu: function () {
			const menu = document.createElement('div');
			menu.classList.add('toolbar-group', 'toolbar-shape-menu');

			const trigger = document.createElement('div');
			trigger.classList.add('trigger');
			trigger.title = 'Choisir une forme';
			menu.tabIndex = 0;
			const triggerIcon = this.createSvg('svg', {
				viewBox: '0 0 128 128',
			});
			const triggerUse = this.createSvg('use', {
				href: '/img/icons.svg#shape',
				x: '0',
				y: '0',
				width: '100%',
				height: '100%'
			});
			triggerIcon.appendChild(triggerUse);
			trigger.appendChild(triggerIcon);

			const panel = document.createElement('fieldset');
			panel.classList.add('toolbar-radio-group', 'toolbar-shape-panel');

			for (const option of PREVIEW_SHAPES) {
				const label = document.createElement('label');
				label.classList.add('shape-option');
				label.title = option.label;

				const input = document.createElement('input');
				input.type = 'radio';
				input.name = 'shape';
				input.value = option.id;
				input.dataset.shapeRadio = 'true';
				input.checked = this.state.shape === option.id;

				const icon = this.createSvg('svg', {
					class: 'shape-icon',
					viewBox: '0 0 128 128',
					'aria-hidden': 'true'
				});
				const use = this.createSvg('use', {
					href: this.getShapeHref(option.id),
					x: '0',
					y: '0',
					width: '100%',
					height: '100%'
				});
				icon.appendChild(use);

				label.appendChild(input);
				label.appendChild(icon);
				panel.appendChild(label);
			}
			panel.addEventListener('change', (e) => {
				console.log(e);
				
				this.state.shape = e.target.value;
				this.applyState();
			});

			menu.appendChild(trigger);
			menu.appendChild(panel);

			return menu;
		},
	};
}

Preview.register('node-preview');