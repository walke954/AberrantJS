class AnimationStyleSheet {
	constructor() {
		this.style = document.createElement('style');
		this.style.type = 'text/css';

		document.getElementsByTagName('HEAD')[0].append(this.style);

		this.selectors = {};
	}

	addSelector(selector, properties = {}) {
		if (typeof selector !== 'string') {
			throw new Error('class selector must be a string');
		}

		if (!selector.length) {
			throw new Error('selector must have length');
		}

		if (typeof properties !== 'object') {
			throw new Error('class properties must be an object');
		}

		this.selectors[selector] = properties;

		return this;
	}

	removeSelector(selector) {
		delete this.selectors[selector];

		return this;
	}

	update() {
		let newStyle = '';

		Object.entries(this.selectors).forEach((selector) => {
			const [s, p] = selector;
			newStyle += `${s} { `;
			Object.entries(p).forEach((a) => {
				const [k, v] = a;
				newStyle += `${k}: ${v}; `;
			});
			newStyle += '} ';
		});

		this.style.innerHTML = newStyle;

		return this;
	}
}

class AnimationPane {
	constructor(paneId, stackHeight = 1) {
		if (typeof paneId !== 'string') {
			throw new Error('pane id must be a string');
		}

		this.pane = document.getElementById(paneId);

		if (!this.pane) {
			throw new Error(`could not find pane with id '${paneId}'`);
		}

		this.paneId = paneId;

		if (typeof stackHeight !== 'number') {
			throw new Error('stack height must be a number');
		}

		if (stackHeight < 1) {
			throw new Error('stack height must be greater than 1');
		}

		this.stackHeight = stackHeight;

		this.style = new AnimationStyleSheet();
 
		this.style
			.addSelector(
				`#${paneId}`,
				{ height: `${100 * stackHeight}vh`, position: 'relative' }
			)
			.update();

		this.paneContainer = document.createElement('div');
		this.paneContainer.classList = 'pane-container';

		this.paneCanvas = document.createElement('canvas');
		this.paneCanvas.classList = 'pane-canvas';

		this.paneCanvasContext = this.paneCanvas.getContext('2d');

		this.paneContainer.append(this.paneCanvas);
		this.pane.append(this.paneContainer);

		this.paneCanvas.width = this.paneContainer.clientWidth;
		this.paneCanvas.height = this.paneContainer.clientHeight;

		this.resizeEvent = null;
		window.addEventListener('resize', this.resizeFn.bind(this));
		document.addEventListener('scroll', this.scrollFn.bind(this));

		this.shapes = [];

		this.render();
	}

	resizeFn(e) {
		this.resizeEvent = e;
		const originalEvent = e;

		this.paneCanvas.width = 0;
		this.paneCanvas.height = 0;

		setTimeout(() => {
			if (this.resizeEvent === originalEvent) {
				this.paneCanvas.width = this.paneContainer.offsetWidth;
				this.paneCanvas.height = this.paneContainer.offsetHeight;
				this.render();
				this.resizeEvent = null;
			}
		}, 1000);
	}

	scrollFn(e) {
		this.render();
	}

	render() {
		const { paneCanvasContext: ctx } = this;

		ctx.fillStyle = 'white';
		ctx.lineWidth = '2';
		ctx.fillRect(0, 0, this.paneCanvas.width, this.paneCanvas.height);

		// translate for smoother line
		ctx.translate(0.5, 0.5);

		const paneY = this.pane.getBoundingClientRect().top;
		const pcH = this.paneContainer.offsetHeight;

		this.shapes.forEach(s => {
			s.render(ctx, -paneY / pcH, this.paneCanvas.width, this.paneCanvas.height);
		});

		// undo translate
		ctx.translate(-0.5, -0.5);
	}

	addShape(shape) {
		this.shapes.push(shape);
		return this;
	}
}
