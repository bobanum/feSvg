import { Param } from "./Param.js";

export class Number extends Param {
	constructor(name, label, value, step = 0.1) {
		super(name, label, value);
		this.step = step;
		this.adoptFunctions({ dom: Number.dom });
	}
	connectedCallback() {
		super.connectedCallback();
		this.appendChild(this.dom.input());
	}

	static dom = {
		main: function () {
			return Param.dom.main.call(this, this.dom.input());
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