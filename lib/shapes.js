class Shape {
	constructor(map) {
		if (!Array.isArray(map)) {
			throw new Error('circle map must be an array');
		}

		map.forEach(marker => {
			if (typeof marker !== 'object') {
				throw new Error('circle markers must be objects');
			}

			if (typeof marker.pos !== 'number') {
				throw new Error('marker position must be a number');
			}
		});

		map.sort((a, b) => a.pos - b.pos);

		this.map = map;
	}
}

class Circle extends Shape {
	constructor(map) {
		super(map);

		map = map.map((m) => {
			const marker = m;

			const stringFields = ['x', 'y', 'r'];
			stringFields.forEach((f) => {
				if (typeof marker[f] !== 'string') {
					throw new Error('circle markers must contain the keys \'pos\', \'x\', \'y\', \'r\'');
				}
			});

			const distanceFields = ['x','y','r'];
			distanceFields.forEach((f) => {
				marker[f] = parseDistance(marker[f]);
			});

			return marker;
		});
	}

	render(ctx, canvasPos, canvasW, canvasH) {
		const [m1, m2] = binarySearch(this.map, 'pos', canvasPos);

		// don't render if outside bounds
		if (!m1 || !m2) return;

		const relPos = m1.pos === m2.pos ? m1.pos : (canvasPos - m1.pos) / (m2.pos - m1.pos);

		const computed = {};
		const distanceFields = ['x','y','r'];
		distanceFields.forEach((f) => {
			if (m1.pos === m2.pos) {
				computed[f] = computeDistance(m1[f], canvasW, canvasH);
			} else {
				const v1 = computeDistance(m1[f], canvasW, canvasH);
				const v2 = computeDistance(m2[f], canvasW, canvasH);

				computed[f] = computeMerge(v1, v2, relPos);
			}
		});

		ctx.beginPath();
		ctx.arc(computed.x, computed.y, computed.r, 0, 2 * Math.PI);

		if (m1.fill) {
			ctx.fillStyle = mergeColors(m1.fillColor, m2.fillColor, relPos);
			ctx.closePath();
			ctx.fill();
		}

		ctx.strokeStyle = mergeColors(m1.borderColor, m2.borderColor, relPos);

		ctx.stroke();
	}
}

class Rectangle extends Shape {
	constructor(map) {
		super(map);

		map = map.map((m) => {
			const marker = m;

			const stringFields = ['x', 'y', 'w', 'h'];
			stringFields.forEach((f) => {
				if (typeof marker[f] !== 'string') {
					throw new Error('rectangle markers must contain the keys \'pos\', \'x\', \'y\', \'w\', \'h\'');
				}
			});

			const distanceFields = ['x','y','w', 'h'];
			distanceFields.forEach((f) => {
				marker[f] = parseDistance(marker[f]);
			});

			return marker;
		});
	}

	render(ctx, canvasPos, canvasW, canvasH) {
		const [m1, m2] = binarySearch(this.map, 'pos', canvasPos);

		// don't render if outside bounds
		if (!m1 || !m2) return;

		const relPos = m1.pos === m2.pos ? m1.pos : (canvasPos - m1.pos) / (m2.pos - m1.pos);

		const computed = {};
		const distanceFields = ['x', 'y', 'w', 'h'];
		distanceFields.forEach((f) => {
			if (m1.pos === m2.pos) {
				computed[f] = computeDistance(m1[f], canvasW, canvasH);
			} else {
				const v1 = computeDistance(m1[f], canvasW, canvasH);
				const v2 = computeDistance(m2[f], canvasW, canvasH);

				computed[f] = computeMerge(v1, v2, relPos);
			}
		});

		ctx.beginPath();
		ctx.rect(computed.x, computed.y, computed.w, computed.h);

		if (m1.fill) {
			ctx.fillStyle = mergeColors(m1.fillColor, m2.fillColor, relPos);
			ctx.closePath();
			ctx.fill();
		}

		ctx.strokeStyle = mergeColors(m1.borderColor, m2.borderColor, relPos);

		ctx.stroke();
	}
}

class TextBox extends Shape {
	constructor(map) {
		super(map);

		map = map.map((m) => {
			const marker = m;

			const stringFields = ['x', 'y', 'fontSize'];
			stringFields.forEach((f) => {
				if (typeof marker[f] !== 'string') {
					throw new Error('rectangle markers must contain the keys \'pos\', \'x\', \'y\'');
				}
			});

			const distanceFields = ['x','y', 'fontSize'];
			distanceFields.forEach((f) => {
				marker[f] = parseDistance(marker[f]);
			});

			return marker;
		});
	}

	render(ctx, canvasPos, canvasW, canvasH) {
		const [m1, m2] = binarySearch(this.map, 'pos', canvasPos);

		// don't render if outside bounds
		if (!m1 || !m2) return;

		const relPos = m1.pos === m2.pos ? m1.pos : (canvasPos - m1.pos) / (m2.pos - m1.pos);

		const computed = {};
		const distanceFields = ['x', 'y', 'fontSize'];
		distanceFields.forEach((f) => {
			if (m1.pos === m2.pos) {
				computed[f] = computeDistance(m1[f], canvasW, canvasH);
			} else {
				const v1 = computeDistance(m1[f], canvasW, canvasH);
				const v2 = computeDistance(m2[f], canvasW, canvasH);

				computed[f] = computeMerge(v1, v2, relPos);
			}
		});

		if (m1.pos === m2.pos) {
			computed.text = m1.text;
		} else {
			computed.text = computeMergeText(m1.text, m2.text, relPos);
		}

		ctx.beginPath();

		ctx.font = `${computed.fontSize}px Arial`;

		if (m1.fill) {
			ctx.fillStyle = mergeColors(m1.fillColor, m2.fillColor, relPos);
			ctx.fillText(computed.text, computed.x, computed.y);
		} else {
			ctx.strokeStyle = mergeColors(m1.borderColor, m2.borderColor, relPos);
			ctx.strokeText(computed.text, computed.x, computed.y);
		}
	}
}

class Path extends Shape {
	constructor(map) {
		super(map);

		// paths for all markers should have an equal number of points
		// and each point should have equal types
		let pointCount = null;
		let pointTypes = null;
		if (map.length > 0) {
			const arrayFields = ['path'];
			arrayFields.forEach((f) => {
				if (!Array.isArray(map[0][f])) {
					throw new Error(`path markers must include the key '${f}' as an array`);
				}
			});

			pointCount = map[0].path.length;
			if (pointCount < 2) {
				throw new Error('path markers must have more than two points');
			}

			pointTypes = map[0].path.map((p) => {
				if (!p.type || typeof p.type !== 'string') {
					throw new Error('point types must be a string');
				}

				const pTypes = ['l', 'q', 'b'];
				if (!pTypes.includes(p.type)) {
					throw new Error('point types must be one of \'l\', \'q\', \'b\'');
				}

				return p.type;
			});
		}

		map = map.map((m) => {
			const marker = m;

			const { path } = m;
			marker.path = path.map((p, i) => {
				const { type, x, y, p1x, p1y, p2x, p2y } = p;

				if (type !== pointTypes[i]) {
					throw new Error(`expected point of type '${pointTypes[i]}' at position ${i}`);
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

				const pObj = {
					type,
					x: parseDistance(x),
					y: parseDistance(y)
				};

				if (type === 'q' || type === 'b') {
					pObj.p1x = parseDistance(p1x);
					pObj.p1y = parseDistance(p1y);
				}

				if (type === 'b') {
					pObj.p2x = parseDistance(p2x);
					pObj.p2y = parseDistance(p2y);
				}

				return pObj;
			});

			if (path.length !== pointCount) {
				throw new Error('all paths must have the same number of lines');
			}

			const stringFields = ['x', 'y'];
			stringFields.forEach((f) => {
				if (typeof marker[f] !== 'string') {
					throw new Error('path markers must contain the keys \'x\', \'y\'');
				}
			});

			const distanceFields = ['x','y'];
			distanceFields.forEach((f) => {
				marker[f] = parseDistance(marker[f]);
			});

			const boolFields = ['fill'];
			boolFields.forEach((f) => {
				if (marker[f] !== null && marker[f] !== undefined && typeof marker[f] !== 'boolean') {
					throw new Error(`path markers key '${f}' must be a boolean`);
				}
			});

			return marker;
		});
	}

	render(ctx, canvasPos, canvasW, canvasH) {
		const [m1, m2] = binarySearch(this.map, 'pos', canvasPos);

		// don't render if outside bounds
		if (!m1 || !m2) return;

		const relPos = m1.pos === m2.pos ? m1.pos : (canvasPos - m1.pos) / (m2.pos - m1.pos);

		const computed = {};
		const distanceFields = ['x', 'y'];
		distanceFields.forEach((f) => {
			if (m1.pos === m2.pos) {
				computed[f] = computeDistance(m1[f], canvasW, canvasH);
			} else {
				const v1 = computeDistance(m1[f], canvasW, canvasH);
				const v2 = computeDistance(m2[f], canvasW, canvasH);

				computed[f] = computeMerge(v1, v2, relPos);
			}
		});

		ctx.beginPath();
		ctx.moveTo(computed.x, computed.y);

		let pathComputed = [];
		let currentX = computed.x;
		let currentY = computed.y;
		if (m1.pos === m2.pos) {
			pathComputed = m1.path.forEach((p) => {
				const line = {};

				// calculate
				if (p.type === 'q' || p.type === 'b') {
					line.p1x = currentX + computeDistance(p.p1x, canvasW, canvasH);
					line.p1y = currentY + computeDistance(p.p1y, canvasW, canvasH);
				}

				line.x = currentX = currentX + computeDistance(p.x, canvasW, canvasH);
				line.y = currentY = currentY + computeDistance(p.y, canvasW, canvasH);

				if (p.type === 'b') {
					line.p2x = currentX + computeDistance(p.p2x, canvasW, canvasH);
					line.p2y = currentY + computeDistance(p.p2y, canvasW, canvasH);
				}

				// draw
				if (p.type === 'b') {
					ctx.bezierCurveTo(line.x, line.y, line.p1x, line.p1y, line.p2x, line.p2y);
				} else if (p.type === 'q') {
					ctx.quadraticCurveTo(line.x, line.y, line.p1x, line.p1y);
				} else {
					ctx.lineTo(line.x, line.y);
				}
			});
		} else {
			for (let i = 0; i < m1.path.length; i += 1) {
				const p1 = m1.path[i];
				const p2 = m2.path[i];

				// calculate
				const line = {};
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

				// draw
				if (p1.type === 'b') {
					ctx.bezierCurveTo(line.x, line.y, line.p1x, line.p1y, line.p2x, line.p2y);
				} else if (p1.type === 'q') {
					ctx.quadraticCurveTo(line.x, line.y, line.p1x, line.p1y);
				} else {
					ctx.lineTo(line.x, line.y);
				}
			}
		}

		if (m1.fill) {
			ctx.fillStyle = mergeColors(m1.fillColor, m2.fillColor, relPos);
			ctx.closePath();
			ctx.fill();
		}

		ctx.strokeStyle = mergeColors(m1.borderColor, m2.borderColor, relPos);

		// ctx.rect(computed.x, computed.y, 4, 3);
		ctx.stroke();
	}
}
