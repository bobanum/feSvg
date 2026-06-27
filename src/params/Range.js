import { Param } from "./Param.js";

export class Range extends Param {
	constructor(name, label, value, step = 0.1, min = 0, max = 100) {
		super(name, label, value);
		this.step = step;
		this.min = min;
		this.max = max;
		this.adoptFunctions({ dom: Range.dom });
		this._boundSyncInputs = this.syncInputs.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		this.shadowRoot?.addEventListener("input", this._boundSyncInputs);
		this.shadowRoot?.addEventListener("change", this._boundSyncInputs);
	}

	disconnectedCallback() {
		this.shadowRoot?.removeEventListener("input", this._boundSyncInputs);
		this.shadowRoot?.removeEventListener("change", this._boundSyncInputs);
	}

	syncInputs(event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		const rangeInput = this.shadowRoot?.querySelector('input[data-role="range"]');
		const numberInput = this.shadowRoot?.querySelector('input[data-role="number"]');

		if (!(rangeInput instanceof HTMLInputElement) || !(numberInput instanceof HTMLInputElement)) {
			return;
		}

		if (target.dataset.role === "range") {
			numberInput.value = rangeInput.value;
		} else if (target.dataset.role === "number") {
			rangeInput.value = numberInput.value;
		}

		this.value = target.value;
	}

	static dom = {
		main: function () {
			return Param.dom.main.call(this, this.dom.input());
		},
		input: function () {
			const container = document.createElement("div");
			container.classList.add("range-input-group");

			const rangeInput = document.createElement("input");
			rangeInput.type = "range";
			rangeInput.value = this.value;
			rangeInput.step = this.step;
			rangeInput.min = this.min;
			rangeInput.max = this.max;
			rangeInput.dataset.param = this.name;
			rangeInput.dataset.role = "range";

			const numberInput = document.createElement("input");
			numberInput.type = "number";
			numberInput.size = 5;
			numberInput.value = this.value;
			numberInput.step = this.step;
			numberInput.min = this.min;
			numberInput.max = this.max;
			numberInput.dataset.param = this.name;
			numberInput.dataset.role = "number";

			container.appendChild(rangeInput);
			container.appendChild(numberInput);
			return container;
		}
	};
}

Range.register("range-param");

export default Range;