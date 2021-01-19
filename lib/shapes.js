class Shape {
	constructor() {
		this.distanceFields = [];
		this.stringFields = [];
		this.boolFields = [];
		this.path = false;
	}

	validate(map) {
		// validate map
		if (!Array.isArray(map)) {
			throw new Error('circle map must be an array');
		}

		// validate markers
		map.forEach(marker => {
			if (typeof marker !== 'object') {
				throw new Error('circle markers must be objects');
			}

			if (typeof marker.pos !== 'number') {
				throw new Error('marker position must be a number');
			}
		});

		let lineTypes = null;
		if (this.path && map.length > 0) {
			map.forEach((marker) => {
				if (!Array.isArray(marker.path)) {
					throw new Error('markers must contain key \'path\'');
				}
			});

			// point types must be consistent throughout path
			lineTypes = map[0].path.map((line) => {
				const lTypes = ['l', 'q', 'b'];
				if (!lTypes.includes(line.type)) {
					throw new Error('point types must be one of \'l\', \'q\', \'b\'');
				}
				return line.type;
			});
		}

		// convert fields
		map = map.map((m) => {
			const marker = m;

			this.distanceFields.forEach((f) => {
				if (typeof marker[f] !== 'string') {
					throw new Error(`markers must contain the distance keys '${this.distanceFields.join('\', \'')}'`);
				}

				marker[f] = parseDistance(marker[f]);
			});

			this.boolFields.forEach((f) => {
				if (marker[f] !== null && marker[f] !== undefined && typeof marker[f] !== 'boolean') {
					throw new Error(`markers must contain the boolean keys '${this.distanceFields.join('\', \'')}'`);
				}
			});

			this.stringFields.forEach((f) => {
				if (marker[f] !== null && marker[f] !== undefined && typeof marker[f] !== 'string') {
					throw new Error(`markers must contain the string keys '${this.stringFields.join('\', \'')}'`);
				}
			});

			if (this.path && map.length > 0) {
				const { path } = m;

				if (marker.path.length !== lineTypes.length) {
					throw new Error('all paths must have same number of lines');
				}

				marker.path = path.map((line, i) => {
					const { type, x, y, p1x, p1y, p2x, p2y } = line;

					if (type !== lineTypes[i]) {
						throw new Error(`expected point of type '${lineTypes[i]}' at position ${i}`);
					}

					if (type === 'b' && (!p2x || !p2y)) {
						throw new Error(`line type ${type} requires fields 'p2x', 'p2y'`);
					}

					if ((type === 'q' || type === 'b') && (!p1x || !p1y)) {
						throw new Error(`line type ${type} requires fields 'p1x', 'p1y'`);
					}

					if (!x || !y) {
						throw new Error(`line type ${type} requires fields 'x', 'y'`);
					}

					const lineObj = {
						type,
						x: parseDistance(x),
						y: parseDistance(y)
					};

					if (type === 'q' || type === 'b') {
						lineObj.p1x = parseDistance(p1x);
						lineObj.p1y = parseDistance(p1y);
					}

					if (type === 'b') {
						lineObj.p2x = parseDistance(p2x);
						lineObj.p2y = parseDistance(p2y);
					}

					return lineObj;
				});
			}

			return marker;
		});

		map.sort((a, b) => a.pos - b.pos);

		this.map = map;
	}

	render(ctx, canvasPos, canvasW, canvasH) {
		const [m1, m2] = binarySearch(this.map, 'pos', canvasPos);

		// don't render if outside bounds
		if (!m1 || !m2) return;

		const relPos = m1.pos === m2.pos ? m1.pos : (canvasPos - m1.pos) / (m2.pos - m1.pos);

		const computed = {};
		this.distanceFields.forEach((f) => {
			if (m1.pos === m2.pos) {
				computed[f] = computeDistance(m1[f], canvasW, canvasH);
			} else {
				const v1 = computeDistance(m1[f], canvasW, canvasH);
				const v2 = computeDistance(m2[f], canvasW, canvasH);

				computed[f] = computeMerge(v1, v2, relPos);
			}
		});

		this.colorFields.forEach((f) => {
			if (m1.pos === m2.pos) {
				computed[f] = m1[f];
			} else {
				computed[f] = mergeColors(m1.color, m2.color, relPos);
			}
		});

		if (this.path) {
			computed.path = [];
			let currentY = computed.x;
			let currentX = computed.y;
			for (let i = 0; i < m1.path.length; i += 1) {
				const p1 = m1.path[i];
				const p2 = m2.path[i];

				if (m1.pos === m2.pos) {
					const line = { type: p1.type };

					// calculate
					if (p1.type === 'q' || p1.type === 'b') {
						line.p1x = currentX + computeDistance(p1.p1x, canvasW, canvasH);
						line.p1y = currentY + computeDistance(p1.p1y, canvasW, canvasH);
					}

					line.x = currentX = currentX + computeDistance(p1.x, canvasW, canvasH);
					line.y = currentY = currentY + computeDistance(p1.y, canvasW, canvasH);

					if (p1.type === 'b') {
						line.p2x = currentX + computeDistance(p1.p2x, canvasW, canvasH);
						line.p2y = currentY + computeDistance(p1.p2y, canvasW, canvasH);
					}

					computed.path.push(line);
				} else {
					// calculate
					const line = { type: p1.type };
					if (p1.type === 'q' || p1.type === 'b') {
						let v1 = computeDistance(p1.p1x, canvasW, canvasH);
						let v2 = computeDistance(p2.p1x, canvasW, canvasH);
						line.p1x = currentX + computeMerge(v1, v2, relPos);

						v1 = computeDistance(p1.p1y, canvasW, canvasH);
						v2 = computeDistance(p2.p1y, canvasW, canvasH);
						line.p1y = currentY + computeMerge(v1, v2, relPos);
					}

					let v1 = computeDistance(p1.x, canvasW, canvasH);
					let v2 = computeDistance(p2.x, canvasW, canvasH);
					line.x = currentX = currentX + computeMerge(v1, v2, relPos);

					v1 = computeDistance(p1.y, canvasW, canvasH);
					v2 = computeDistance(p2.y, canvasW, canvasH);
					line.y = currentY = currentY + computeMerge(v1, v2, relPos);

					if (p1.type === 'b') {
						v1 = computeDistance(p1.p2x, canvasW, canvasH);
						v2 = computeDistance(p2.p2x, canvasW, canvasH);
						line.p2x = currentX + computeMerge(v1, v2, relPos);

						v1 = computeDistance(p1.p2y, canvasW, canvasH);
						v2 = computeDistance(p2.p2y, canvasW, canvasH);
						line.p2y = currentY + computeMerge(v1, v2, relPos);
					}

					computed.path.push(line);
				}
			}
		}

		if (this.text) {
			if (m1.pos === m2.pos) {
				computed.text = m1.text;
			} else {
				computed.text = computeMergeText(m1.text, m2.text, relPos);
			}
		}

		ctx.beginPath();
		this.renderFn(ctx, computed);

		if (this.text) {
			if (m1.stroke) {
				ctx.strokeStyle = computed.color;
				ctx.strokeText(computed.text, computed.x, computed.y);
			} else {
				ctx.fillStyle = computed.color;
				ctx.fillText(computed.text, computed.x, computed.y);
			}
		} else {
			if (m1.fill) {
				ctx.fillStyle = computed.fillColor;
				ctx.fill();
			}
			if (m1.stroke != false) {
				ctx.strokeStyle = computed.borderColor;
				ctx.stroke();
			}
		}
	}
}

class Circle extends Shape {
	constructor(map) {
		super();

		this.distanceFields = ['x', 'y', 'r'];
		this.boolFields = ['fill', 'stroke'];
		this.colorFields = ['fillColor', 'borderColor'];

		this.validate(map);
	}

	renderFn(ctx, computed) {
		ctx.arc(computed.x, computed.y, computed.r, 0, 2 * Math.PI);
	}
}

class Rectangle extends Shape {
	constructor(map) {
		super();

		this.distanceFields = ['x', 'y', 'w', 'h'];
		this.boolFields = ['fill', 'stroke'];
		this.colorFields = ['fillColor', 'borderColor'];

		this.validate(map);
	}

	renderFn(ctx, computed) {
		ctx.rect(computed.x, computed.y, computed.w, computed.h);
	}
}

class Path extends Shape {
	constructor(map) {
		super();

		this.distanceFields = ['x', 'y'];
		this.boolFields = ['fill', 'stroke'];
		this.colorFields = ['fillColor', 'borderColor'];
		this.path = true;

		this.validate(map);
	}

	renderFn(ctx, computed) {
		ctx.moveTo(computed.x, computed.y);
		computed.path.forEach((line) => {
			if (line.type === 'b') {
				ctx.bezierCurveTo(line.x, line.y, line.p1x, line.p1y, line.p2x, line.p2y);
			} else if (line.type === 'q') {
				ctx.quadraticCurveTo(line.x, line.y, line.p1x, line.p1y);
			} else {
				ctx.lineTo(line.x, line.y);
			}
		});
	}
}

class TextBox extends Shape {
	constructor(map) {
		super();

		this.distanceFields = ['x', 'y', 'fontSize'];
		this.boolFields = ['fill', 'stroke'];
		this.colorFields = ['color'];
		this.text = true;

		this.validate(map);
	}

	renderFn(ctx, computed) {
		ctx.font = `${computed.fontSize}px Arial`;
	}
}
