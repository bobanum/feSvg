import { Param } from "./Param.js";

export class Choice extends Param {
	constructor(name, label, value, step = 0.1) {
		super(name, label, value);
		this.step = step;
		this.adoptFunctions({ dom: Choice.dom });
		this.choices = [];
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
			let select = document.createElement('select');
			this.choices.forEach(choice => {
				let option = document.createElement('option');
				if (typeof choice === 'object') {
					option.value = choice.value;
					option.textContent = choice.label;
				} else {
					option.value = choice;
					option.textContent = choice;
				}
				select.appendChild(option);
			});
			select.value = this.value;
			select.dataset.param = this.name;
			return select;
		}
	};
}

Choice.register('choice-param');
	
export default Choice;