import { Param } from "./Param.js";

export class Choice extends Param {
	static observedAttributes = ['type'];
	constructor(name, label, value, choices = []) {
		super(name, label, value);
		this._type = 'select';
		this.multiple = false;
		this.adoptFunctions({ dom: Choice.dom });
		this.choices = Array.isArray(choices) ? choices : [];
		this._boundSyncValueFromControl = this.syncValueFromControl.bind(this);
	}

	get type() {
		return this._type;
	}
	set type(value) {
		if (this._type === value) return;
		this._type = value;
		this.setAttribute('type', value);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		this[name] = newValue;
	}
	connectedCallback() {
		super.connectedCallback();
		this.shadowRoot?.addEventListener('input', this._boundSyncValueFromControl);
		this.shadowRoot?.addEventListener('change', this._boundSyncValueFromControl);
	}

	disconnectedCallback() {
		this.shadowRoot?.removeEventListener('input', this._boundSyncValueFromControl);
		this.shadowRoot?.removeEventListener('change', this._boundSyncValueFromControl);
	}

	syncValueFromControl(event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
			return;
		}

		if (target instanceof HTMLInputElement && target.type === 'checkbox') {
			const selectedValues = [...this.shadowRoot.querySelectorAll('input[type="checkbox"]:checked')]
				.map((input) => input.value);
			this.value = selectedValues;
			return;
		}

		if (target instanceof HTMLInputElement && target.type === 'radio' && !target.checked) {
			return;
		}

		this.value = target.value;
	}

	static dom = {
		main: function (input) {
			const result = Param.dom.main.call(this, this.dom.input());
			return result;
		},
		input: function () {
			if (this.type === 'select') {
				return this.dom.select();
			} else {
				return this.dom.buttons();
			}
		},
		select: function () {
			let result = document.createElement('select');
			this.choices.forEach(choice => {
				let option = document.createElement('option');
				if (typeof choice === 'object') {
					option.value = choice.value;
					option.textContent = choice.label;
				} else {
					option.value = choice;
					option.textContent = choice;
				}
				result.appendChild(option);
			});
			result.value = this.value;
			if (this.multiple) {
				result.multiple = true;
			}
			result.dataset.param = this.name;
			result.addEventListener('change', (e) => {
				console.log(e);
				
				if (this.multiple) {
					const selectedValues = [...result.selectedOptions].map(option => option.value);
					this.value = selectedValues;
				} else {
					this.value = result.value;
				}
				//bubble
				const changeEvent = new Event('change', { bubbles: true });
				this.dispatchEvent(changeEvent);
			});
			return result;
		},
		buttons: function () {
			let result = document.createElement('fieldset');
			this.choices.forEach(choice => {
				let label = document.createElement('label');
				let input = document.createElement('input');
				if (this.multiple) {
					input.type = 'checkbox';
				} else {
					input.type = 'radio';
				}
				input.name = this.name;
				let span = document.createElement('span');
				if (typeof choice === 'object') {
					span.textContent = choice.label;
					input.value = choice.value;
				} else {
					span.textContent = choice;
					input.value = choice;
				}
				label.appendChild(input);
				label.appendChild(span);
				result.appendChild(label);
			});
			return result;
		}
	};
}

Choice.register('choice-param');

export default Choice;