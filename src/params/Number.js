import { Param } from "./Param.js";

export class Number extends Param {
	constructor(name, label, value, step = 0.1) {
		super(name, label, value);
		this.step = step;
		this.adoptFunctions({dom: Number.dom});
	}

	static dom = {
		main: function() {
			let input = document.createElement('input');
			input.size = 5;
			input.type = 'number';
			input.value = this.value;
			input.step = this.step;
			input.dataset.param = this.name;
			let result = Param.dom.main.call(this, input);
			return result;
		}
	};
}

Number.register('param-number');

export default Number;