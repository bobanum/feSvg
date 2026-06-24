import { Component } from "../Component.js";

export class Param extends Component {
	constructor(name, label, value) {
		super();
		this.internals_ = this.attachInternals();
		this.name = name;
		this.label = label;
		this.value = value;
	}
	static dom = {
		style: function () {
			const result = document.createElement('link');
			result.rel = 'stylesheet';
			result.href = '/css/params.css';
			return result;
		},
		main: function (input) {
			let result = document.createDocumentFragment();
			result.appendChild(Param.dom.style());
			let label = document.createElement('label');
			label.textContent = this.label;
			result.appendChild(label);

			result.appendChild(input);
			return result;
		}
	};
}