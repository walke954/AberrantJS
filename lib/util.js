const colorMap = { mediumvioletred: [199, 21, 133], deeppink: [255, 20, 147], palevioletred: [219, 112, 147], hotpink: [255, 105, 180], lightpink: [255, 182, 193], pink: [255, 192, 203], darkred: [139, 0, 0], red: [255, 0, 0], firebrick: [178, 34, 34], crimson: [220, 20, 60], indianred: [205, 92, 92], lightcoral: [240, 128, 128], salmon: [250, 128, 114], darksalmon: [233, 150, 122], lightsalmon: [255, 160, 122], orangered: [255, 69, 0], tomato: [255, 99, 71], darkorange: [255, 140, 0], coral: [255, 127, 80], orange: [255, 165, 0], darkkhaki: [189, 183, 107], gold: [255, 215, 0], khaki: [240, 230, 140], peachpuff: [255, 218, 185], yellow: [255, 255, 0], palegoldenrod: [238, 232, 170], moccasin: [255, 228, 181], papayawhip: [255, 239, 213], lightgoldenrodyellow: [250, 250, 210], lemonchiffon: [255, 250, 205], lightyellow: [255, 255, 224], maroon: [128, 0, 0], brown: [165, 42, 42], saddlebrown: [139, 69, 19], sienna: [160, 82, 45], chocolate: [210, 105, 30], darkgoldenrod: [184, 134, 11], peru: [205, 133, 63], rosybrown: [188, 143, 143], goldenrod: [218, 165, 32], sandybrown: [244, 164, 96], tan: [210, 180, 140], burlywood: [222, 184, 135], wheat: [245, 222, 179], navajowhite: [255, 222, 173], bisque: [255, 228, 196], blanchedalmond: [255, 235, 205], cornsilk: [255, 248, 220], darkgreen: [0, 100, 0], green: [0, 128, 0], darkolivegreen: [85, 107, 47], forestgreen: [34, 139, 34], seagreen: [46, 139, 87], olive: [128, 128, 0], oliveDrab: [107, 142, 35], mediumseagreen: [60, 179, 113], limegreen: [50, 205, 50], lime: [0, 255, 0], springgreen: [0, 255, 127], mediumspringgreen: [0, 250, 154], darkseagreen: [143, 188, 143], mediumaquamarine: [102, 205, 170], yellowgreen: [154, 205, 50], lawngreen: [124, 252, 0], chartreuse: [127, 255, 0], lightgreen: [144, 238, 144], greenyellow: [173, 255, 47], palegreen: [152, 251, 152], teal: [0, 128, 128], darkcyan: [0, 139, 139], lightseagreen: [32, 178, 170], cadetblue: [95, 158, 160], darkturquoise: [0, 206, 209], mediumturquoise: [72, 209, 204], turquoise: [64, 224, 208], aqua: [0, 255, 255], cyan: [0, 255, 255], aquamarine: [127, 255, 212], paleturquoise: [175, 238, 238], lightcyan: [224, 255, 255], navy: [0, 0, 128], darkblue: [0, 0, 139], mediumblue: [0, 0, 205], blue: [0, 0, 255], midnightblue: [25, 25, 112], royalblue: [65, 105, 225], steelblue: [70, 130, 180], dodgerblue: [30, 144, 255], deepskyblue: [0, 191, 255], cornflowerblue: [100, 149, 237], skyblue: [135, 206, 235], lightskyblue: [135, 206, 250], lightsteelblue: [176, 196, 222], lightblue: [173, 216, 230], powderblue: [176, 224, 230], indigo: [75, 0, 130], purple: [128, 0, 128], darkmagenta: [139, 0, 139], darkviolet: [148, 0, 211], darkslateblue: [72, 61, 139], blueviolet: [138, 43, 226], darkorchid: [153, 50, 204], fuchsia: [255, 0, 255], magenta: [255, 0, 255], slateblue: [106, 90, 205], mediumslateblue: [123, 104, 238], mediumorchid: [186, 85, 211], mediumpurple: [147, 112, 219], orchid: [218, 112, 214], violet: [238, 130, 238], plum: [221, 160, 221], thistle: [216, 191, 216], lavender: [230, 230, 250], mistyrose: [255, 228, 225], antiquewhite: [250, 235, 215], linen: [250, 240, 230], beige: [245, 245, 220], whitesmoke: [245, 245, 245], lavenderblush: [255, 240, 245], oldlace: [253, 245, 230], aliceblue: [240, 248, 255], seashell: [255, 245, 238], ghostwhite: [248, 248, 255], honeydew: [240, 255, 240], floralwhite: [255, 250, 240], azure: [240, 255, 255], mintcream: [245, 255, 250], snow: [255, 250, 250], ivory: [255, 255, 240], white: [255, 255, 255], black: [0, 0, 0], darkslategray: [47, 79, 79], dimgray: [105, 105, 105], slategray: [112, 128, 144], gray: [128, 128, 128], lightslategray: [119, 136, 153], darkgray: [169, 169, 169], silver: [192, 192, 192], lightgray: [211, 211, 211], gainsboro: [220, 220, 220] };

function computeDistance(val, canvasW, canvasH) {
	const { type, amount } = val;

	if (type === 'w') {
		return (amount / 100) * canvasW;
	}
	if (type === 'h') {
		return (amount / 100) * canvasH;
	}

	return amount;
}

function computeMerge(v1, v2, relPos) {
	return v1 + ((v2 - v1) * relPos);
}

function computeMergeText(t1, t2, relPos) {
	let shortText = null;
	let longText = null;

	if (t1.length < t2.length) {
		shortText = t1;
		longText = t2;
	} else {
		longText = t1;
		shortText = t2;
	}

	const length = Math.floor(t1.length + ((t2.length - t1.length) * relPos));

	return longText.slice(0, length);
}

function mergeColors(c1 = [0, 0, 0], c2 = [0, 0, 0], relPos) {
	if (typeof c1 === 'string') {
		c1 = colorMap[c1.toLowerCase()] || [0, 0, 0];
	}
	if (typeof c2 === 'string') {
		c2 = colorMap[c2.toLowerCase()] || [0, 0, 0];
	}

	const mergeColor = [];
	for (let i = 0; i < 3; i += 1) {
		mergeColor.push(c1[i] + ((c2[i] - c1[i]) * relPos));
	}
	return `rgb(${mergeColor.join(',')})`;
}

function parseDistance(d) {
	if (typeof d !== 'string') {
		throw new Error('distance value must be a string');
	}

	const valueErrorMsg = 'distance value must contain a number and a type \'p\', \'w\', \'h\'';

	const validTypes = ['p','w','h'];
	if (d.length < 2) {
		throw new Error(valueErrorMsg);
	}

	let dec = false;
	for (let i = 0; i < d.length; i += 1) {
		const char = d.charAt(i);

		if (i === d.length - 1 && !validTypes.includes(char)) {
			throw new Error(valueErrorMsg);
		}

		if (dec && char === '.') {
			throw new Error(valueErrorMsg);
		}

		if (i === 0 && char === '-') {
			continue;
		}

		if (char === '.') {
			dec = true;
			continue;
		}

		if (char.charCode < 48 || char.charCode > 57) {
			throw new Error(valueErrorMsg);
		}
	}

	return { type: d.charAt(d.length - 1), amount: parseFloat(d, 10) };
}

function binarySearch(list, field, val) {
	if (list[0][field] > val) {
		return [null, list[0]];
	}

	if (list[list.length - 1][field] < val) {
		return [list[list.length - 1][field], null];
	}

	// highest index possible
	let searchCeil = list.length - 1;
	// lowest index possible
	let searchFloor = 0;

	// index we compare with
	let searchIndex = Math.floor((searchCeil - searchFloor) / 2) + searchFloor;
	let searchVal = list[searchIndex][field];
	let nextVal = list[searchIndex + 1][field];

	while (true) {
		if (searchVal === val) {
			return [list[searchIndex], list[searchIndex]];
		} else if (nextVal === val) {
			return [list[searchIndex + 1], list[searchIndex + 1]];
		} else if (searchCeil - searchFloor === 1) {
			return [list[searchIndex], list[searchIndex + 1]];
		} else if (searchVal < val) {
			searchFloor = searchIndex;
		} else {
			searchCeil = searchIndex;
		}

		searchIndex = Math.floor((searchCeil - searchFloor) / 2) + searchFloor;
		searchVal = list[searchIndex][field];
		nextVal = list[searchIndex + 1][field];
	}
}
