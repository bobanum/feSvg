import { Component } from "../Component.js";

export class Param extends Component {
	constructor(name, label, value) {
		super();
		this.name = name;
		this.label = label;
		this.value = value;
	}
	static dom = {
		style: function () {
			const result = document.createElement('style');
			result.textContent = `
			:host {
				display: grid;
				grid-template: subgrid / subgrid;
				grid-column: span 2;
			}
			`;
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