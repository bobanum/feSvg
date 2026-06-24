import { Param } from "./Param.js";

export class Choice extends Param {
	static observedAttributes = ['type'];
	constructor(name, label, value, step = 0.1) {
		super(name, label, value);
		this.step = step;
		this._type = 'select';
		this.multiple = false;
		this.adoptFunctions({ dom: Choice.dom });
		this.choices = [];
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
		console.log(oldValue, newValue);

		this[name] = newValue;
	}
	connectedCallback() {
		super.connectedCallback();
		this.appendChild(this.dom.input());
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