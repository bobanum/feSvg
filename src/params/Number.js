import { Param } from "./Param.js";

export class Number extends Param {
	constructor(name, label, value, attributes = {}) {
		super(name, label, value);
		this._attributes = attributes;
		this.adoptFunctions({ dom: Number.dom });
		this._boundSyncValueFromControl = this.syncValueFromControl.bind(this);
	}
	connectedCallback() {
		super.connectedCallback();
		this.shadowRoot?.addEventListener('input', this._boundSyncValueFromControl);
		this.shadowRoot?.addEventListener('change', this._boundSyncValueFromControl);
		for (const [key, value] of Object.entries(this._attributes)) {
			this.input[key] = value;
		}
	}
	disconnectedCallback() {
		this.shadowRoot?.removeEventListener('input', this._boundSyncValueFromControl);
		this.shadowRoot?.removeEventListener('change', this._boundSyncValueFromControl);
	}
	syncValueFromControl(event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		this.value = target.value;
		this.internals_?.setFormValue(this.value);
	}
	get min() {
		return this.input.min;
	}
	set min(value) {
		this.input.min = value;
	}
	get max() {
		return this.input.max;
	}
	set max(value) {
		this.input.max = value;
	}
	static dom = {
		main: function () {
			this.input = this.dom.input();
			return Param.dom.main.call(this, this.input);
		},
		input: function () {
			let input = document.createElement('input');
			input.size = 5;
			input.type = 'number';
			input.value = this.value;
			input.step = this.step;
			input.dataset.param = this.name;
			return input;
		}
	};
}

Number.register('number-param');

export default Number;