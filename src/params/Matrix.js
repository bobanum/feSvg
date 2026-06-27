import { Param } from "./Param.js";

export class Matrix extends Param {
	static IDENTITY = [
		[1, 0, 0, 0, 0],
		[0, 1, 0, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 0, 1, 0]
	];

	constructor(name, label, value = Matrix.IDENTITY) {
		const normalized = Matrix.normalizeValues(value);
		super(name, label, Matrix.valuesToString(normalized));
		this._matrixValues = normalized;
		this.adoptFunctions({ dom: Matrix.dom });
		this._boundSyncValueFromControl = this.syncValueFromControl.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		this.shadowRoot?.addEventListener("input", this._boundSyncValueFromControl);
		this.shadowRoot?.addEventListener("change", this._boundSyncValueFromControl);
	}

	disconnectedCallback() {
		this.shadowRoot?.removeEventListener("input", this._boundSyncValueFromControl);
		this.shadowRoot?.removeEventListener("change", this._boundSyncValueFromControl);
	}

	getValues() {
		return this._matrixValues.map((row) => [...row]);
	}

	setValues(values) {
		this._matrixValues = Matrix.normalizeValues(values);
		this.value = Matrix.valuesToString(this._matrixValues);
		this.updateControls();
		return this;
	}

	resetIdentity() {
		return this.setValues(Matrix.IDENTITY);
	}

	applySaturation(amount = 1) {
		const s = Number(amount);
		return this.setValues([
			0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0, 0,
			0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0, 0,
			0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	applyBrightness(amount = 1) {
		const b = Number(amount);
		return this.setValues([
			b, 0, 0, 0, 0,
			0, b, 0, 0, 0,
			0, 0, b, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	applyContrast(amount = 1) {
		const c = Number(amount);
		const t = (1 - c) * 0.5;
		return this.setValues([
			c, 0, 0, 0, t,
			0, c, 0, 0, t,
			0, 0, c, 0, t,
			0, 0, 0, 1, 0
		]);
	}

	applyHueRotate(angle = 0) {
		const a = Number(angle) * (Math.PI / 180);
		const cosA = Math.cos(a);
		const sinA = Math.sin(a);

		return this.setValues([
			0.213 + cosA * 0.787 - sinA * 0.213, 0.715 - cosA * 0.715 - sinA * 0.715, 0.072 - cosA * 0.072 + sinA * 0.928, 0, 0,
			0.213 - cosA * 0.213 + sinA * 0.143, 0.715 + cosA * 0.285 + sinA * 0.14, 0.072 - cosA * 0.072 - sinA * 0.283, 0, 0,
			0.213 - cosA * 0.213 - sinA * 0.787, 0.715 - cosA * 0.715 + sinA * 0.715, 0.072 + cosA * 0.928 + sinA * 0.072, 0, 0,
			0, 0, 0, 1, 0
		]);
	}

	generateSVG(attributes = {}) {
		const element = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
		element.setAttribute("type", "matrix");
		element.setAttribute("values", Matrix.valuesToString(this._matrixValues));

		for (const [key, value] of Object.entries(attributes)) {
			element.setAttribute(key, String(value));
		}

		return element;
	}

	toSVGString(attributes = {}) {
		return this.generateSVG(attributes).outerHTML;
	}

	updateControls() {
		const inputs = this.shadowRoot?.querySelectorAll("input[data-index]");
		if (!inputs) return;

		const flatValues = Matrix.toFlatValues(this._matrixValues);

		inputs.forEach((input, index) => {
			input.value = String(flatValues[index] ?? 0);
		});
	}

	syncValueFromControl(event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		const index = Number(target.dataset.index);
		if (Number.isNaN(index)) {
			return;
		}
		const row = Math.floor(index / 5);
		const col = index % 5;
		if (!this._matrixValues[row]) {
			return;
		}

		this._matrixValues[row][col] = Number(target.value) || 0;
		this.value = Matrix.valuesToString(this._matrixValues);
	}

	static normalizeValues(values) {
		if (Array.isArray(values) && values.length === 4 && Array.isArray(values[0])) {
			const isValidShape = values.every((row) => Array.isArray(row) && row.length === 5);
			if (!isValidShape) {
				return Matrix.normalizeValues(Matrix.IDENTITY);
			}

			return values.map((row) => row.map((value) => Number(value) || 0));
		}

		let flatValues = [];
		if (Array.isArray(values)) {
			flatValues = values.map((value) => Number(value) || 0);
		} else if (typeof values === "string") {
			flatValues = values.trim().split(/\s+/).map((value) => Number(value) || 0);
		}

		if (flatValues.length !== 20) {
			return Matrix.normalizeValues(Matrix.IDENTITY);
		}

		const rows = [];
		for (let row = 0; row < 4; row++) {
			rows.push(flatValues.slice(row * 5, row * 5 + 5));
		}

		return rows;
	}

	static valuesToString(values) {
		return Matrix.toFlatValues(Matrix.normalizeValues(values))
			.map((value) => String(value))
			.join(" ");
	}

	static toFlatValues(values) {
		return Matrix.normalizeValues(values).flat();
	}

	static dom = {
		main: function () {
			return Param.dom.main.call(this, this.dom.grid());
		},
		grid: function () {
			const container = document.createElement("div");
			container.classList.add("matrix-param-grid");
			const corner = document.createElement("div");
			corner.classList.add("corner");
			container.appendChild(corner);
			const labels = ["R", "G", "B", "A", "O",];
			const span = (text, row, col) => {
				const spanElement = document.createElement("span");
				spanElement.style.gridColumn = col;
				spanElement.style.gridRow = row;
				spanElement.textContent = text;
				return spanElement;
			};
			for (let col = 0; col < 5; col++) {
				container.appendChild(span(labels[col], 1, col + 2));
			}
			for (let row = 0; row < 4; row++) {
				container.appendChild(span(labels[row] + "'", row + 2, 1));
				for (let col = 0; col < 5; col++) {
					const index = row * 5 + col;
					const input = document.createElement("input");
					input.type = "number";
					input.step = "0.1";
					input.size = 2;
					input.value = String(this._matrixValues[row][col]);
					input.dataset.index = String(index);
					input.dataset.param = this.name;
					container.appendChild(input);
				}
			}

			return container;
		}
	};
}

Matrix.register("matrix-param");

export default Matrix;