import { Param } from "./Param.js";

export class Text extends Param {
	constructor(name, label, value) {
		super(name, label, value);
		this.adoptFunctions({ dom: Text.dom });
	}
	connectedCallback() {
		super.connectedCallback();
		this.appendChild(this.dom.input());
	}

	static dom = {
		main: function () {
			return Param.dom.main.call(this);
		},
		input: function () {
			let input = document.createElement('input');
			input.size = 5;
			input.type = 'text';
			input.value = this.value;
			input.dataset.param = this.name;
			return input;
		}
	};
}

Text.register('text-param');

export default Text;