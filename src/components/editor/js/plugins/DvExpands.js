/* eslint-disable */

import { mxUtils } from '../../core/mxgraph';

export { DvDecoration1, DvDecoration2, DvDecoration3, DvDecoration4, DvDecoration5, DvDecoration6, DvDecoration7, DvDecoration8, DvDecoration9, DvDecoration10, DvDecoration11, DvDecoration12,
	DvBorderBox1, DvBorderBox2, DvBorderBox3, DvBorderBox4, DvBorderBox5, DvBorderBox6, DvBorderBox7,
	DvBorderBox8, DvBorderBox9, DvBorderBox10, DvBorderBox11, DvBorderBox12, DvBorderBox13};

function DvExpands(width, height) {
	this.width = width;
	this.height = height;
}
DvExpands.prototype.getCircleRadianPoint = function (x, y, radius, radian) {
	return [x + Math.cos(radian) * radius, y + Math.sin(radian) * radius];
};
DvExpands.prototype.fade = function (r, t = 100) {
	const e = this.getRgbValue(r);
	return this.getColorFromRgbValue([...e, t / 100]);
};
DvExpands.prototype.getRgbValue = function (r) {
	const e = this.g(r).toLowerCase();
	return this.i(e) ? this.m(e) : this.R(e);
};
DvExpands.prototype.i = function (r) {
	return typeof r != 'string' ? !1 : ((r = r.toLowerCase()), /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(r));
};
DvExpands.prototype.isRgbOrRgba = function (r) {
	return /^(rgb|rgba|RGB|RGBA)/.test(r);
};
var a = ((f) => (
	(f.transparent = 'rgba(0,0,0,0)'),
	(f.black = '#000000'),
	(f.silver = '#C0C0C0'),
	(f.gray = '#808080'),
	(f.white = '#FFFFFF'),
	(f.maroon = '#800000'),
	(f.red = '#FF0000'),
	(f.purple = '#800080'),
	(f.fuchsia = '#FF00FF'),
	(f.green = '#008000'),
	(f.lime = '#00FF00'),
	(f.olive = '#808000'),
	(f.yellow = '#FFFF00'),
	(f.navy = '#000080'),
	(f.blue = '#0000FF'),
	(f.teal = '#008080'),
	(f.aqua = '#00FFFF'),
	(f.aliceblue = '#f0f8ff'),
	(f.antiquewhite = '#faebd7'),
	(f.aquamarine = '#7fffd4'),
	(f.azure = '#f0ffff'),
	(f.beige = '#f5f5dc'),
	(f.bisque = '#ffe4c4'),
	(f.blanchedalmond = '#ffebcd'),
	(f.blueviolet = '#8a2be2'),
	(f.brown = '#a52a2a'),
	(f.burlywood = '#deb887'),
	(f.cadetblue = '#5f9ea0'),
	(f.chartreuse = '#7fff00'),
	(f.chocolate = '#d2691e'),
	(f.coral = '#ff7f50'),
	(f.cornflowerblue = '#6495ed'),
	(f.cornsilk = '#fff8dc'),
	(f.crimson = '#dc143c'),
	(f.cyan = '#00ffff'),
	(f.darkblue = '#00008b'),
	(f.darkcyan = '#008b8b'),
	(f.darkgoldenrod = '#b8860b'),
	(f.darkgray = '#a9a9a9'),
	(f.darkgreen = '#006400'),
	(f.darkgrey = '#a9a9a9'),
	(f.darkkhaki = '#bdb76b'),
	(f.darkmagenta = '#8b008b'),
	(f.darkolivegreen = '#556b2f'),
	(f.darkorange = '#ff8c00'),
	(f.darkorchid = '#9932cc'),
	(f.darkred = '#8b0000'),
	(f.darksalmon = '#e9967a'),
	(f.darkseagreen = '#8fbc8f'),
	(f.darkslateblue = '#483d8b'),
	(f.darkslategray = '#2f4f4f'),
	(f.darkslategrey = '#2f4f4f'),
	(f.darkturquoise = '#00ced1'),
	(f.darkviolet = '#9400d3'),
	(f.deeppink = '#ff1493'),
	(f.deepskyblue = '#00bfff'),
	(f.dimgray = '#696969'),
	(f.dimgrey = '#696969'),
	(f.dodgerblue = '#1e90ff'),
	(f.firebrick = '#b22222'),
	(f.floralwhite = '#fffaf0'),
	(f.forestgreen = '#228b22'),
	(f.gainsboro = '#dcdcdc'),
	(f.ghostwhite = '#f8f8ff'),
	(f.gold = '#ffd700'),
	(f.goldenrod = '#daa520'),
	(f.greenyellow = '#adff2f'),
	(f.grey = '#808080'),
	(f.honeydew = '#f0fff0'),
	(f.hotpink = '#ff69b4'),
	(f.indianred = '#cd5c5c'),
	(f.indigo = '#4b0082'),
	(f.ivory = '#fffff0'),
	(f.khaki = '#f0e68c'),
	(f.lavender = '#e6e6fa'),
	(f.lavenderblush = '#fff0f5'),
	(f.lawngreen = '#7cfc00'),
	(f.lemonchiffon = '#fffacd'),
	(f.lightblue = '#add8e6'),
	(f.lightcoral = '#f08080'),
	(f.lightcyan = '#e0ffff'),
	(f.lightgoldenrodyellow = '#fafad2'),
	(f.lightgray = '#d3d3d3'),
	(f.lightgreen = '#90ee90'),
	(f.lightgrey = '#d3d3d3'),
	(f.lightpink = '#ffb6c1'),
	(f.lightsalmon = '#ffa07a'),
	(f.lightseagreen = '#20b2aa'),
	(f.lightskyblue = '#87cefa'),
	(f.lightslategray = '#778899'),
	(f.lightslategrey = '#778899'),
	(f.lightsteelblue = '#b0c4de'),
	(f.lightyellow = '#ffffe0'),
	(f.limegreen = '#32cd32'),
	(f.linen = '#faf0e6'),
	(f.magenta = '#ff00ff'),
	(f.mediumaquamarine = '#66cdaa'),
	(f.mediumblue = '#0000cd'),
	(f.mediumorchid = '#ba55d3'),
	(f.mediumpurple = '#9370db'),
	(f.mediumseagreen = '#3cb371'),
	(f.mediumslateblue = '#7b68ee'),
	(f.mediumspringgreen = '#00fa9a'),
	(f.mediumturquoise = '#48d1cc'),
	(f.mediumvioletred = '#c71585'),
	(f.midnightblue = '#191970'),
	(f.mintcream = '#f5fffa'),
	(f.mistyrose = '#ffe4e1'),
	(f.moccasin = '#ffe4b5'),
	(f.navajowhite = '#ffdead'),
	(f.oldlace = '#fdf5e6'),
	(f.olivedrab = '#6b8e23'),
	(f.orange = '#ffa500'),
	(f.orangered = '#ff4500'),
	(f.orchid = '#da70d6'),
	(f.palegoldenrod = '#eee8aa'),
	(f.palegreen = '#98fb98'),
	(f.paleturquoise = '#afeeee'),
	(f.palevioletred = '#db7093'),
	(f.papayawhip = '#ffefd5'),
	(f.peachpuff = '#ffdab9'),
	(f.peru = '#cd853f'),
	(f.pink = '#ffc0cb'),
	(f.plum = '#dda0dd'),
	(f.powderblue = '#b0e0e6'),
	(f.rosybrown = '#bc8f8f'),
	(f.royalblue = '#4169e1'),
	(f.saddlebrown = '#8b4513'),
	(f.salmon = '#fa8072'),
	(f.sandybrown = '#f4a460'),
	(f.seagreen = '#2e8b57'),
	(f.seashell = '#fff5ee'),
	(f.sienna = '#a0522d'),
	(f.skyblue = '#87ceeb'),
	(f.slateblue = '#6a5acd'),
	(f.slategray = '#708090'),
	(f.snow = '#fffafa'),
	(f.springgreen = '#00ff7f'),
	(f.steelblue = '#4682b4'),
	(f.tan = '#d2b48c'),
	(f.thistle = '#d8bfd8'),
	(f.tomato = '#ff6347'),
	(f.turquoise = '#40e0d0'),
	(f.violet = '#ee82ee'),
	(f.wheat = '#f5deb3'),
	(f.whitesmoke = '#f5f5f5'),
	(f.yellowgreen = '#9acd32'),
	f
))(a || {});
DvExpands.prototype.s = a;
DvExpands.prototype.p = function (r) {
	return this.s[r];
};
DvExpands.prototype.g = function (r) {
	if (this.i(r) || this.isRgbOrRgba(r)) return r;
	const t = this.p(r);
	if (!t) throw new Error(`Color: Invalid Input of ${r}`);
	return t;
};
DvExpands.prototype.m = function (r) {
	(r = r.replace('#', '')),
		r.length === 3 &&
			(r = Array.from(r)
				.map((e) => e + e)
				.join(''));
	const t = r.split('');
	return new Array(3).fill(0).map((e, n) => parseInt(`0x${t[n * 2]}${t[n * 2 + 1]}`));
};
DvExpands.prototype.R = function (r) {
	return r
		.replace(/rgb\(|rgba\(|\)/g, '')
		.split(',')
		.slice(0, 3)
		.map((t) => parseInt(t));
};
DvExpands.prototype.getColorFromRgbValue = function (r) {
	if (!Array.isArray(r)) throw new Error(`getColorFromRgbValue: ${r} is not an array`);
	const { length: t } = r;
	if (t !== 3 && t !== 4) throw new Error('getColorFromRgbValue: value length should be 3 or 4');
	return (t === 3 ? 'rgb(' : 'rgba(') + r.join(',') + ')';
};

DvExpands.prototype.deepMerge = function (target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();
	if (this.isObject(target) && this.isObject(source)) {
		for (const key in source) {
			if (this.isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				this.deepMerge(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}
	return this.deepMerge(target, ...sources);
};

DvExpands.prototype.isObject = function (item) {
	return item && typeof item === 'object' && !Array.isArray(item);
};

DvExpands.prototype.deepClone = function (obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	const cloned = Array.isArray(obj) ? [] : {};
	for (let key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			cloned[key] = this.deepClone(obj[key]);
		}
	}
	return cloned;
};

DvExpands.prototype.onResize = function () {
	if (this.calcSVGData) {
		this.calcSVGData();
	}
};
DvExpands.prototype.randomExtend = function (minNum, maxNum) {
	if (arguments.length === 1) {
		return parseInt(Math.random() * minNum + 1, 10);
	} else {
		return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
	}
};
DvExpands.prototype.filterNonNumber = function (array) {
	return array.filter(function (n) {
		return typeof n === 'number';
	});
};
DvExpands.prototype.mergeColor = function () {
	this.mergedColor = this.deepMerge(this.deepClone(this.defaultColor, true), this.color || []);
};
DvExpands.prototype.mulAdd = function (nums) {
	nums = this.filterNonNumber(nums);
	return nums.reduce(function (all, num) {
		return all + num;
	}, 0);
};
DvExpands.prototype.getTwoPointDistance = function (pointOne, pointTwo) {
	var minusX = Math.abs(pointOne[0] - pointTwo[0]);
	var minusY = Math.abs(pointOne[1] - pointTwo[1]);
	return Math.sqrt(minusX * minusX + minusY * minusY);
};
DvExpands.prototype.iterableToArray = function (iter) {
	if ((typeof Symbol !== 'undefined' && iter[Symbol.iterator] != null) || iter['@@iterator'] != null) return Array.from(iter);
};
DvExpands.prototype.arrayLikeToArray = function (arr, len) {
	if (len == null || len > arr.length) len = arr.length;
	for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
	return arr2;
};
DvExpands.prototype.arrayWithoutHoles = function (arr) {
	if (Array.isArray(arr)) return this.arrayLikeToArray(arr);
};
DvExpands.prototype.unsupportedIterableToArray = function (o, minLen) {
	if (!o) return;
	if (typeof o === 'string') return this.arrayLikeToArray(o, minLen);
	var n = Object.prototype.toString.call(o).slice(8, -1);
	if (n === 'Object' && o.constructor) n = o.constructor.name;
	if (n === 'Map' || n === 'Set') return Array.from(o);
	if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return this.arrayLikeToArray(o, minLen);
};
DvExpands.prototype.toConsumableArray = function (arr) {
	return this.arrayWithoutHoles(arr) || this.iterableToArray(arr) || this.unsupportedIterableToArray(arr);
};
DvExpands.prototype.getPolylineLength = function (points) {
	var lineSegments = new Array(points.length - 1).fill(0).map(function (foo, i) {
		return [points[i], points[i + 1]];
	});
	var lengths = lineSegments.map((item) => {
		return this.getTwoPointDistance.apply(void 0, this.toConsumableArray(item));
	});
	return this.mulAdd(lengths);
};


function DvBorderBox1(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox1, DvExpands);
DvBorderBox1.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#6586ec', '#2cf7fe'];
	this.mergedColor = [];
	this.mergeColor();

	this.content = `
	<div class="dv-border-box-13" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <path
        fill="${this.backgroundColor}"
        stroke="${this.mergedColor[0]}"
        d="M 5 20 L 5 10 L 12 3  L 60 3 L 68 10
          L ${this.width - 20} 10 L ${this.width - 5} 25
          L ${this.width - 5} ${this.height - 5} L 20 ${this.height - 5}
          L 5 ${this.height - 20} L 5 20"/>
      <path
        fill="transparent"
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="10, 5"
        stroke="${this.mergedColor[0]}"
        d="M 16 9 L 61 9"/>

      <path
        fill="transparent"
        stroke="${this.mergedColor[1]}"
        d="M 5 20 L 5 10 L 12 3  L 60 3 L 68 10"/>
      <path
        fill="transparent"
        stroke="${this.mergedColor[1]}"
        d="M ${this.width - 5} ${this.height - 30} L ${this.width - 5} ${this.height - 5} L ${this.width - 30} ${this.height - 5}"
      />
    </svg>
    <div class="border-box-content">
    </div>
  </div>`;
}

function DvBorderBox2(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox2, DvExpands);
DvBorderBox2.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#fff', 'rgba(255, 255, 255, 0.6)'];
	this.mergedColor = [];
	this.mergeColor();

	this.content = `
	<div class="dv-border-box-2" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <polygon fill="${this.backgroundColor}" points="7, 7 ${this.width - 7}, 7 ${this.width - 7}, ${this.height - 7} 7, ${this.height - 7}" />
      <polyline
        stroke="${this.mergedColor[0]}"
        points="2, 2 ${this.width - 2} ,2 ${this.width - 2}, ${this.height - 2} 2, ${this.height - 2} 2, 2" />
      <polyline
        stroke="${this.mergedColor[1]}"
        points="6, 6 ${this.width - 6}, 6 ${this.width - 6}, ${this.height - 6} 6, ${this.height - 6} 6, 6" />
      <circle fill="${this.mergedColor[0]}" cx="11" cy="11" r="1" />
      <circle fill="${this.mergedColor[0]}" cx="${this.width - 11}" cy="11" r="1" />
      <circle fill="${this.mergedColor[0]}" cx="${this.width - 11}" cy="${this.height - 11}" r="1" />
      <circle fill="${this.mergedColor[0]}" cx="11" cy="${this.height - 11}" r="1" />
    </svg>
    <div class="border-box-content">

    </div>
  </div>`;
}

function DvBorderBox3(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox3, DvExpands);
DvBorderBox3.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#2862b7', '#2862b7'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-border-box-3" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <polygon fill="${this.backgroundColor}" points="23, 23 ${this.width - 24}, 23 ${this.width - 24}, ${this.height - 24} 23, ${this.height - 24}" />
      <polyline class="dv-bb3-line1"
        stroke="${this.mergedColor[0]}"
        points="4, 4 ${this.width - 22} ,4 ${this.width - 22}, ${this.height - 22} 4, ${this.height - 22} 4, 4"
      />
      <polyline class="dv-bb3-line2"
        stroke="${this.mergedColor[1]}"
        points="10, 10 ${this.width - 16}, 10 ${this.width - 16}, ${this.height - 16} 10, ${this.height - 16} 10, 10"
      />
      <polyline class="dv-bb3-line2"
        stroke="${this.mergedColor[1]}"
        points="16, 16 ${this.width - 10}, 16 ${this.width - 10}, ${this.height - 10} 16, ${this.height - 10} 16, 16"
      />
      <polyline class="dv-bb3-line2"
        stroke="${this.mergedColor[1]}"
        points="22, 22 ${this.width - 4}, 22 ${this.width - 4}, ${this.height - 4} 22, ${this.height - 4} 22, 22"
      />
    </svg>
    <div class="border-box-content">
    </div>
  </div>`;
}

function DvBorderBox4(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox4, DvExpands);
DvBorderBox4.prototype.init = function (options) {
	this.reverse = options.reverse ? true : false;
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['red', 'rgba(0,0,255,0.8)'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-border-box-4" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container ${this.reverse && 'dv-reverse'}" width="${this.width}" height="${this.height}">
      <polygon fill="${this.backgroundColor}" points="${this.width - 15}, 22 170, 22 150, 7 40, 7 28, 21 32, 24 16, 42 16, ${this.height - 32} 41, ${this.height - 7} ${this.width - 15}, ${this.height - 7}" />
      <polyline class="dv-bb4-line-1"
        stroke="${this.mergedColor[0]}"
        points="145, ${this.height - 5} 40, ${this.height - 5} 10, ${this.height - 35} 10, 40 40, 5 150, 5 170, 20 ${this.width - 15}, 20"
      />
      <polyline
        stroke="${this.mergedColor[1]}"
        class="dv-bb4-line-2" points="245, ${this.height - 1} 36, ${this.height - 1} 14, ${this.height - 23} 14, ${this.height - 100}"
      />
      <polyline class="dv-bb4-line-3" stroke="${this.mergedColor[0]}" points="7, ${this.height - 40} 7, ${this.height - 75}" />
      <polyline class="dv-bb4-line-4" stroke="${this.mergedColor[0]}" points="28, 24 13, 41 13, 64" />
      <polyline class="dv-bb4-line-5" stroke="${this.mergedColor[0]}" points="5, 45 5, 140" />
      <polyline class="dv-bb4-line-6" stroke="${this.mergedColor[1]}" points="14, 75 14, 180" />
      <polyline class="dv-bb4-line-7" stroke="${this.mergedColor[1]}" points="55, 11 147, 11 167, 26 250, 26" />
      <polyline class="dv-bb4-line-8" stroke="${this.mergedColor[1]}" points="158, 5 173, 16" />
      <polyline class="dv-bb4-line-9" stroke="${this.mergedColor[1]}" points="200, 17 ${this.width - 10}, 17" />
      <polyline class="dv-bb4-line-10" stroke="${this.mergedColor[1]}" points="385, 17 ${this.width - 10}, 17" />
    </svg>
    <div class="border-box-content">
    </div>
  </div>`;
}

function DvBorderBox5(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox5, DvExpands);
DvBorderBox5.prototype.init = function (options) {
	this.reverse = options.reverse ? true : false;
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.20)'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-border-box-5" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container  ${this.reverse && 'dv-reverse'}"  width="${this.width}" height="${this.height}">
      <polygon fill="${this.backgroundColor}" points="10, 22 ${this.width - 22}, 22 ${this.width - 22}, ${this.height - 86} ${this.width - 84}, ${this.height - 24} 10, ${this.height - 24}" />
      <polyline
        class="dv-bb5-line-1"
        stroke="${this.mergedColor[0]}"
        points="8, 5 ${this.width - 5}, 5 ${this.width - 5}, ${this.height - 100} ${this.width - 100}, ${this.height - 5} 8, ${this.height - 5} 8, 5"
      />
      <polyline
        class="dv-bb5-line-2"
        stroke="${this.mergedColor[1]}"
        points="3, 5 ${this.width - 20}, 5 ${this.width - 20}, ${this.height - 60} ${this.width - 74}, ${this.height - 5} 3, ${this.height - 5} 3, 5"
      />
      <polyline class="dv-bb5-line-3" stroke="${this.mergedColor[1]}"
      	points="50, 13 ${this.width - 35}, 13" />
      <polyline class="dv-bb5-line-4" stroke="${this.mergedColor[1]}"
      	points="15, 20 ${this.width - 35}, 20" />
      <polyline class="dv-bb5-line-5" stroke="${this.mergedColor[1]}"
      points="15, ${this.height - 20} ${this.width - 110}, ${this.height - 20}" />
      <polyline class="dv-bb5-line-6" stroke="${this.mergedColor[1]}"
      points="15, ${this.height - 13} ${this.width - 110}, ${this.height - 13}" />
    </svg>
    <div class="border-box-content">
    </div>
  </div>`;
}

function DvBorderBox6(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox6, DvExpands);
DvBorderBox6.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['rgba(255, 255, 255, 0.35)', 'gray'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-border-box-6" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <polygon fill="${this.backgroundColor}" points="9, 7 ${this.width - 9}, 7 ${this.width - 9}, ${this.height - 7} 9, ${this.height - 7}" />
      <circle stroke="${this.mergedColor[1]}" cx="5" cy="5" r="2"/>
      <circle stroke="${this.mergedColor[1]}" cx="${this.width - 5}" cy="5" r="2" />
      <circle stroke="${this.mergedColor[1]}" cx="${this.width - 5}" cy="${this.height - 5}" r="2" />
      <circle stroke="${this.mergedColor[1]}" cx="5" cy="${this.height - 5}" r="2" />
      <polyline stroke="${this.mergedColor[0]}" points="10, 4 ${this.width - 10}, 4" />
      <polyline stroke="${this.mergedColor[0]}" points="10, ${this.height - 4} ${this.width - 10}, ${this.height - 4}" />
      <polyline stroke="${this.mergedColor[0]}" points="5, 70 5, ${this.height - 70}" />
      <polyline stroke="${this.mergedColor[0]}" points="${this.width - 5}, 70 ${this.width - 5}, ${this.height - 70}" />
      <polyline stroke="${this.mergedColor[0]}" points="3, 10, 3, 50" />
      <polyline stroke="${this.mergedColor[0]}" points="7, 30 7, 80" />
      <polyline stroke="${this.mergedColor[0]}" points="${this.width - 3}, 10 ${this.width - 3}, 50" />
      <polyline stroke="${this.mergedColor[0]}" points="${this.width - 7}, 30 ${this.width - 7}, 80" />
      <polyline stroke="${this.mergedColor[0]}" points="3, ${this.height - 10} 3, ${this.height - 50}" />
      <polyline stroke="${this.mergedColor[0]}" points="7, ${this.height - 30} 7, ${this.height - 80}" />
      <polyline stroke="${this.mergedColor[0]}" points="${this.width - 3}, ${this.height - 10} ${this.width - 3}, ${this.height - 50}" />
      <polyline stroke="${this.mergedColor[0]}" points="${this.width - 7}, ${this.height - 30} ${this.width - 7}, ${this.height - 80}" />
    </svg>
    <div class="border-box-content">
    </div>`;
}

function DvBorderBox7(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox7, DvExpands);
DvBorderBox7.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['rgba(128,128,128,0.3)', 'rgba(128,128,128,0.5)'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-border-box-7" style="width: ${this.width}px; height: ${this.height}px;box-shadow: inset 0 0 40px ${this.mergedColor[0]}; border: 1px solid ${this.mergedColor[0]}; background-color: ${this.backgroundColor}">
		<svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
		  <polyline class="dv-bb7-line-width-2" stroke="${this.mergedColor[0]}" points="0, 25 0, 0 25, 0" />
		  <polyline class="dv-bb7-line-width-2" stroke="${this.mergedColor[0]}" points="${this.width - 25}, 0 ${this.width}, 0 ${this.width}, 25" />
		  <polyline class="dv-bb7-line-width-2" stroke="${this.mergedColor[0]}" points="${this.width - 25}, ${this.height} ${this.width}, ${this.height} ${this.width}, ${this.height - 25}" />
		  <polyline class="dv-bb7-line-width-2" stroke="${this.mergedColor[0]}" points="0, ${this.height - 25} 0, ${this.height} 25, ${this.height}" />
		  <polyline class="dv-bb7-line-width-5" stroke="${this.mergedColor[1]}" points="0, 10 0, 0 10, 0" />
		  <polyline class="dv-bb7-line-width-5" stroke="${this.mergedColor[1]}" points="${this.width - 10}, 0 ${this.width}, 0 ${this.width}, 10" />
		  <polyline class="dv-bb7-line-width-5" stroke="${this.mergedColor[1]}" points="${this.width - 10}, ${this.height} ${this.width}, ${this.height} ${this.width}, ${this.height - 10}" />
		  <polyline class="dv-bb7-line-width-5" stroke="${this.mergedColor[1]}" points="0, ${this.height - 10} 0, ${this.height} 10, ${this.height}" />
		</svg>
		<div class="border-box-content">
		</div>
  </div>`;
}

function DvBorderBox8(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox8, DvExpands);
DvBorderBox8.prototype.length = function (){
	return (this.width + this.height - 5) * 2;
};
DvBorderBox8.prototype.pathD = function () {
	const { reverse, width, height } = this
	if (reverse) return `M 2.5, 2.5 L 2.5, ${this.height - 2.5} L ${this.width - 2.5}, ${this.height - 2.5} L ${this.width - 2.5}, 2.5 L 2.5, 2.5`;
	return `M2.5, 2.5 L${this.width - 2.5}, 2.5 L${this.width - 2.5}, ${this.height - 2.5} L2.5, ${this.height - 2.5} L2.5, 2.5`;
};
DvBorderBox8.prototype.init = function (options) {
	this.dur = options.dur ? options.dur : 3;
	this.reverse = options.reverse ? true : false;
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#235fa7', '#4fd2dd'];
	this.mergedColor = [];
	this.mergeColor();
	const id = mxUtils.uuid();
	this.path = `border-box-8-path-${id}`;
	this.gradient = `border-box-8-gradient-${id}`;
	this.mask = `border-box-8-mask-${id}`;
	this.content = `
	<div class="dv-border-box-8" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <defs>
        <path
          id="${this.path}"
          d="${this.pathD()}"
          fill="transparent"
        />
        <radialGradient
          id="${this.gradient}"
          cx="50%" cy="50%" r="50%"
        >
          <stop
            offset="0%" stop-color="#fff"
            stop-opacity="1"
          />
          <stop
            offset="100%" stop-color="#fff"
            stop-opacity="0"
          />
        </radialGradient>

        <mask id="${this.mask}">
          <circle cx="0" cy="0" r="150" fill="url(#${this.gradient})">
            <animateMotion
              dur="${this.dur}s"
              path="${this.pathD()}"
              rotate="auto"
              repeatCount="indefinite"
            />
          </circle>
        </mask>
      </defs>

      <polygon fill="${this.backgroundColor}" points="5, 5 ${this.width - 5}, 5 ${this.width - 5} ${this.height - 5} 5, ${this.height - 5}" />

      <use
        stroke="${this.mergedColor[0]}"
        stroke-width="1"
        xlink:href="#${this.path}"
      />

      <use
        stroke="${this.mergedColor[1]}"
        stroke-width="3"
        xlink:href="#${this.path}"
        mask="url(#${this.mask})"
      >
        <animate
          attributeName="stroke-dasharray"
          from="0, ${this.length()}"
          to="${this.length()}, 0"
          dur="${this.dur}s"
          repeatCount="indefinite"
        />
      </use>
    </svg>
    <div class="border-box-content">
    </div>
  </div>`;
}

function DvBorderBox9(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox9, DvExpands);
DvBorderBox9.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#11eefd', '#0078d2'];
	this.mergedColor = [];
	this.mergeColor();
	const id = mxUtils.uuid();
	this.gradientId = `border-box-9-gradient-${id}`;
	this.maskId = `border-box-9-mask-${id}`;
	this.content = `
	<div class="dv-border-box-9" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <defs>
        <linearGradient id="${this.gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <animate attributeName="x1" values="0%;100%;0%" dur="10s" begin="0s" repeatCount="indefinite" />
          <animate attributeName="x2" values="100%;0%;100%" dur="10s" begin="0s" repeatCount="indefinite" />
          <stop offset="0%" stroke="${this.mergedColor[0]}">
            <animate attributeName="stop-color" values="${this.mergedColor[0]};${this.mergedColor[1]};${this.mergedColor[0]}" dur="10s"  begin="0s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stroke="${this.mergedColor[1]}">
            <animate attributeName="stop-color" values="${this.mergedColor[1]};${this.mergedColor[0]};${this.mergedColor[1]}" dur="10s" begin="0s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
        <mask id="${this.maskId}">
          <polyline stroke="#fff" stroke-width="3" fill="transparent" points="8, ${this.height * 0.4} 8, 3, ${this.width * 0.4 + 7}, 3" />
          <polyline fill="#fff" points="8, ${this.height * 0.15} 8, 3, ${this.width * 0.1 + 7}, 3 ${this.width * 0.1}, 8 14, 8 14, ${this.height * 0.15 - 7}"/>
          <polyline
            stroke="#fff"
            stroke-width="3"
            fill="transparent"
            points="${this.width * 0.5}, 3 ${this.width - 3}, 3, ${this.width - 3}, ${this.height * 0.25}"
          />
          <polyline
            fill="#fff"
            points="${this.width * 0.52}, 3 ${this.width * 0.58}, 3 ${this.width * 0.58 - 7}, 9 ${this.width * 0.52 + 7}, 9"
          />
          <polyline
            fill="#fff"
            points="${this.width * 0.9}, 3 ${this.width - 3}, 3 ${this.width - 3}, ${this.height * 0.1} ${this.width - 9}, ${this.height * 0.1 - 7} ${this.width - 9}, 9 ${this.width * 0.9 + 7}, 9"
          />

          <polyline
            stroke="#fff"
            stroke-width="3"
            fill="transparent"
            points="8, ${this.height * 0.5} 8, ${this.height - 3} ${this.width * 0.3 + 7}, ${this.height - 3}"
          />
          <polyline
            fill="#fff"
            points="8, ${this.height * 0.55} 8, ${this.height * 0.7} 2, ${this.height * 0.7 - 7} 2, ${this.height * 0.55 + 7}"
          />

          <polyline
            stroke="#fff"
            stroke-width="3"
            fill="transparent"
            points="${this.width * 0.35}, ${this.height - 3} ${this.width - 3}, ${this.height - 3} ${this.width - 3}, ${this.height * 0.35}"
          />
          <polyline
            fill="#fff"
            points="${this.width * 0.92}, ${this.height - 3} ${this.width - 3}, ${this.height - 3} ${this.width - 3}, ${this.height * 0.8} ${this.width - 9}, ${this.height * 0.8 + 7} ${this.width - 9}, ${this.height - 9} ${this.width * 0.92 + 7}, ${this.height - 9}"
          />
        </mask>
      </defs>
      <polygon fill="${this.backgroundColor}" points="15, 9 ${this.width * 0.1 + 1}, 9 ${this.width * 0.1 + 4}, 6 ${this.width * 0.52 + 2}, 6 ${this.width * 0.52 + 6}, 10 ${this.width * 0.58 - 7}, 10 ${this.width * 0.58 - 2}, 6 ${this.width * 0.9 + 2}, 6 ${this.width * 0.9 + 6}, 10 ${this.width - 10}, 10 ${this.width - 10}, ${this.height * 0.1 - 6} ${this.width - 6}, ${this.height * 0.1 - 1} ${this.width - 6}, ${this.height * 0.8 + 1} ${this.width - 10}, ${this.height * 0.8 + 6} ${this.width - 10}, ${this.height - 10} ${this.width * 0.92 + 7}, ${this.height - 10}  ${this.width * 0.92 + 2}, ${this.height - 6} 11, ${this.height - 6} 11, ${this.height * 0.15 - 2} 15, ${this.height * 0.15 - 7}" />
      <rect x="0" y="0" width="${this.width}" height="${this.height}" fill="url(#${this.gradientId})" mask="url(#${this.maskId})" />
    </svg>

    <div class="border-box-content">
      <slot></slot>
    </div>
  </div>`;
}

function DvBorderBox10(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox10, DvExpands);
DvBorderBox10.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#1d48c4', '#d3e1f8'];
	this.mergedColor = [];
	this.mergeColor();
	this.border = ['left-top', 'right-top', 'left-bottom', 'right-bottom'];
	this.content = `
	<div class="dv-border-box-10" style="box-shadow: inset 0 0 25px 3px ${this.mergedColor[0]}; width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <polygon fill="${this.backgroundColor}" points="
        4, 0 ${this.width - 4}, 0 ${this.width}, 4 ${this.width}, ${this.height - 4} ${this.width - 4}, ${this.height}
        4, ${this.height} 0, ${this.height - 4} 0, 4
      " />
    </svg>
	${
		this.border.reduce((t, item, i) => {
			return t += `
			<svg
			  width="150px"
			  height="150px"
			  class="${item} dv-border-svg-container"
			>
			  <polygon
				fill="${this.mergedColor[1]}"
				points="40, 0 5, 0 0, 5 0, 16 3, 19 3, 7 7, 3 35, 3"
			  />
			</svg>`;
		}, '')
	}
    <div class="border-box-content">
    </div>
  </div>`;
}

function DvBorderBox11(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox11, DvExpands);
DvBorderBox11.prototype.init = function (options) {
	this.titleWidth = options.titleWidth ? options.titleWidth : 250;
	this.title = options.title ? options.title : '';
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#8aaafb', '#1f33a2'];
	this.mergedColor = [];
	this.mergeColor();
	const id = mxUtils.uuid();
	this.filterId = `border-box-11-filterId-${id}`;
	this.content = `
	<div class="dv-border-box-11" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <defs>
        <filter id="${this.filterId}" height="150%" width="150%" x="-25%" y="-25%">
          <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thicken" />
          <feGaussianBlur in="thicken" stdDeviation="3" result="blurred" />
          <feFlood flood-color="${this.mergedColor[1]}" result="glowColor" />
          <feComposite in="glowColor" in2="blurred" operator="in" result="softGlowColored" />
          <feMerge>
            <feMergeNode in="softGlowColored"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <polygon fill="${this.backgroundColor}" points="
        20, 32 ${this.width * 0.5 - this.titleWidth / 2}, 32 ${this.width * 0.5 - this.titleWidth / 2 + 20}, 53
        ${this.width * 0.5 + this.titleWidth / 2 - 20}, 53 ${this.width * 0.5 + this.titleWidth / 2}, 32
        ${this.width - 20}, 32 ${this.width - 8}, 48 ${this.width - 8}, ${this.height - 25} ${this.width - 20}, ${this.height - 8}
        20, ${this.height - 8} 8, ${this.height - 25} 8, 50
      " />

      <polyline
        stroke="${this.mergedColor[0]}"
        filter="url(#${this.filterId})"
        points="
          ${(this.width - this.titleWidth) / 2}, 30
          20, 30 7, 50 7, ${50 + (this.height - 167) / 2}
          13, ${55 + (this.height - 167) / 2} 13, ${135 + (this.height - 167) / 2}
          7, ${140 + (this.height - 167) / 2} 7, ${this.height - 27}
          20, ${this.height - 7} ${this.width - 20}, ${this.height - 7} ${this.width - 7}, ${this.height - 27}
          ${this.width - 7}, ${140 + (this.height - 167) / 2} ${this.width - 13}, ${135 + (this.height - 167) / 2}
          ${this.width - 13}, ${55 + (this.height - 167) / 2} ${this.width - 7}, ${50 + (this.height - 167) / 2}
          ${this.width - 7}, 50 ${this.width - 20}, 30 ${(this.width + this.titleWidth) / 2}, 30
          ${(this.width + this.titleWidth) / 2 - 20}, 7 ${(this.width - this.titleWidth) / 2 + 20}, 7
          ${(this.width - this.titleWidth) / 2}, 30 ${(this.width - this.titleWidth) / 2 + 20}, 52
          ${(this.width + this.titleWidth) / 2 - 20}, 52 ${(this.width + this.titleWidth) / 2}, 30
        "
      />

      <polygon
        stroke="${this.mergedColor[0]}"
        fill="transparent"
        points="
          ${(this.width + this.titleWidth) / 2 - 5}, 30 ${(this.width + this.titleWidth) / 2 - 21}, 11
          ${(this.width + this.titleWidth) / 2 - 27}, 11 ${(this.width + this.titleWidth) / 2 - 8}, 34
        "
      />

      <polygon
        stroke="${this.mergedColor[0]}"
        fill="transparent"
        points="
          ${(this.width - this.titleWidth) / 2 + 5}, 30 ${(this.width - this.titleWidth) / 2 + 22}, 49
          ${(this.width - this.titleWidth) / 2 + 28}, 49 ${(this.width - this.titleWidth) / 2 + 8}, 26
        "
      />

      <polygon
        stroke="${this.mergedColor[0]}"
        fill="${this.fade(this.mergedColor[1] || this.defaultColor[1], 30)}"
        filter="url(#${this.filterId})"
        points="
          ${(this.width + this.titleWidth) / 2 - 11}, 37 ${(this.width + this.titleWidth) / 2 - 32}, 11
          ${(this.width - this.titleWidth) / 2 + 23}, 11 ${(this.width - this.titleWidth) / 2 + 11}, 23
          ${(this.width - this.titleWidth) / 2 + 33}, 49 ${(this.width + this.titleWidth) / 2 - 22}, 49
        "
      />

      <polygon
        filter="url(#${this.filterId})"
        fill="${this.mergedColor[0]}"
        opacity="1"
        points="
          ${(this.width - this.titleWidth) / 2 - 10}, 37 ${(this.width - this.titleWidth) / 2 - 31}, 37
          ${(this.width - this.titleWidth) / 2 - 25}, 46 ${(this.width - this.titleWidth) / 2 - 4}, 46
        "
      >
        <animate
          attributeName="opacity"
          values="1;0.7;1"
          dur="2s"
          begin="0s"
          repeatCount="indefinite"
        />
      </polygon>


      <polygon
        filter="url(#${this.filterId})"
        fill="${this.mergedColor[0]}"
        opacity="0.7"
        points="
          ${(this.width - this.titleWidth) / 2 - 40}, 37 ${(this.width - this.titleWidth) / 2 - 61}, 37
          ${(this.width - this.titleWidth) / 2 - 55}, 46 ${(this.width - this.titleWidth) / 2 - 34}, 46
        "
      >
        <animate
          attributeName="opacity"
          values="0.7;0.4;0.7"
          dur="2s"
          begin="0s"
          repeatCount="indefinite"
        />
      </polygon>
      <polygon
        filter="url(#${this.filterId})"
        fill="${this.mergedColor[0]}"
        opacity="0.5"
        points="
          ${(this.width - this.titleWidth) / 2 - 70}, 37 ${(this.width - this.titleWidth) / 2 - 91}, 37
          ${(this.width - this.titleWidth) / 2 - 85}, 46 ${(this.width - this.titleWidth) / 2 - 64}, 46
        ">
        <animate
          attributeName="opacity"
          values="0.5;0.2;0.5"
          dur="2s"
          begin="0s"
          repeatCount="indefinite"
        />
      </polygon>
      <polygon
        filter="url(#${this.filterId})"
        fill="${this.mergedColor[0]}"
        opacity="1"
        points="
          ${(this.width + this.titleWidth) / 2 + 30}, 37 ${(this.width + this.titleWidth) / 2 + 9}, 37
          ${(this.width + this.titleWidth) / 2 + 3}, 46 ${(this.width + this.titleWidth) / 2 + 24}, 46
        ">
        <animate
          attributeName="opacity"
          values="1;0.7;1"
          dur="2s"
          begin="0s"
          repeatCount="indefinite"
        />
      </polygon>
      <polygon
        filter="url(#${this.filterId})"
        fill="${this.mergedColor[0]}"
        opacity="0.7"
        points="
          ${(this.width + this.titleWidth) / 2 + 60}, 37 ${(this.width + this.titleWidth) / 2 + 39}, 37
          ${(this.width + this.titleWidth) / 2 + 33}, 46 ${(this.width + this.titleWidth) / 2 + 54}, 46
        ">
        <animate
          attributeName="opacity"
          values="0.7;0.4;0.7"
          dur="2s"
          begin="0s"
          repeatCount="indefinite"
        />
      </polygon>
      <polygon
        filter="url(#${this.filterId})"
        fill="${this.mergedColor[0]}"
        opacity="0.5"
        points="
          ${(this.width + this.titleWidth) / 2 + 90}, 37 ${(this.width + this.titleWidth) / 2 + 69}, 37
          ${(this.width + this.titleWidth) / 2 + 63}, 46 ${(this.width + this.titleWidth) / 2 + 84}, 46
        ">
        <animate
          attributeName="opacity"
          values="0.5;0.2;0.5"
          dur="2s"
          begin="0s"
          repeatCount="indefinite"
        />
      </polygon>
      <text
        class="dv-border-box-11-title"
        x="${this.width / 2}"
        y="32"
        fill="#fff"
        font-size="18"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${this.title}
      </text>
      <polygon
        fill="${this.mergedColor[0]}"
        filter="url(#${this.filterId})"
        points="
          7, ${53 + (this.height - 167) / 2} 11, ${57 + (this.height - 167) / 2}
          11, ${133 + (this.height - 167) / 2} 7, ${137 + (this.height - 167) / 2}
        "
      />
      <polygon
        fill="${this.mergedColor[0]}"
        filter="url(#${this.filterId})"
        points="
          ${this.width - 7}, ${53 + (this.height - 167) / 2} ${this.width - 11}, ${57 + (this.height - 167) / 2}
          ${this.width - 11}, ${133 + (this.height - 167) / 2} ${this.width - 7}, ${137 + (this.height - 167) / 2}
        "
      />
    </svg>
    <div class="border-box-content">
    </div>
  </div>`;
}

function DvBorderBox12(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox12, DvExpands);
DvBorderBox12.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#2e6099', '#7ce7fd'];
	this.mergedColor = [];
	this.mergeColor();
	const id = mxUtils.uuid();
	this.filterId = `border-box-12-filterId-${id}`;
	this.content = `
	<div class="dv-border-box-12" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <defs>
        <filter id="${this.filterId}" height="150%" width="150%" x="-25%" y="-25%">
          <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
          <feGaussianBlur in="thicken" stdDeviation="2" result="blurred" />
          <feFlood flood-color="${this.fade(this.mergedColor[1] || this.defaultColor[1], 70)}" result="glowColor">
            <animate
              attributeName="flood-color"
              values="
                ${this.fade(this.mergedColor[1] || this.defaultColor[1], 70)};
                ${this.fade(this.mergedColor[1] || this.defaultColor[1], 30)};
                ${this.fade(this.mergedColor[1] || this.defaultColor[1], 70)};
              "
              dur="3s"
              begin="0s"
              repeatCount="indefinite"
            />
          </feFlood>
          <feComposite in="glowColor" in2="blurred" operator="in" result="softGlowColored" />
          <feMerge>
            <feMergeNode in="softGlowColored"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <path
        v-if="width && height"
        fill="${this.backgroundColor}"
        stroke-width="2"
        stroke="${this.mergedColor[0]}"
        d="
          M15 5 L ${this.width - 15} 5 Q ${this.width - 5} 5, ${this.width - 5} 15
          L ${this.width - 5} ${this.height - 15} Q ${this.width - 5} ${this.height - 5}, ${this.width - 15} ${this.height - 5}
          L 15, ${this.height - 5} Q 5 ${this.height - 5} 5 ${this.height - 15} L 5 15
          Q 5 5 15 5
        "
      />

      <path
        stroke-width="2"
        fill="transparent"
        stroke-linecap="round"
        filter="url(#${this.filterId})"
        stroke="${this.mergedColor[1]}"
        d="M 20 5 L 15 5 Q 5 5 5 15 L 5 20"
      />

      <path
        stroke-width="2"
        fill="transparent"
        stroke-linecap="round"
        filter="url(#${this.filterId})"
        stroke="${this.mergedColor[1]}"
        d="M ${this.width - 20} 5 L ${this.width - 15} 5 Q ${this.width - 5} 5 ${this.width - 5} 15 L ${this.width - 5} 20"
      />

      <path
        stroke-width="2"
        fill="transparent"
        stroke-linecap="round"
        filter="url(#${this.filterId})"
        stroke="${this.mergedColor[1]}"
        d="
          M ${this.width - 20} ${this.height - 5} L ${this.width - 15} ${this.height - 5}
          Q ${this.width - 5} ${this.height - 5} ${this.width - 5} ${this.height - 15}
          L ${this.width - 5} ${this.height - 20}
        "
      />

      <path
        stroke-width="2"
        fill="transparent"
        stroke-linecap="round"
        filter="url(#${this.filterId})"
        stroke="${this.mergedColor[1]}"
        d="
          M 20 ${this.height - 5} L 15 ${this.height - 5}
          Q 5 ${this.height - 5} 5 ${this.height - 15}
          L 5 ${this.height - 20}
        "
      />
    </svg>

    <div class="border-box-content">
      <slot></slot>
    </div>
  </div>`;
}

function DvBorderBox13(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvBorderBox13, DvExpands);
DvBorderBox13.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'transparent';
	this.defaultColor = ['#6586ec', '#2cf7fe'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-border-box-13" style="width: ${this.width}px; height: ${this.height}px;">
    <svg class="dv-border-svg-container" width="${this.width}" height="${this.height}">
      <path
        fill="${this.backgroundColor}"
        stroke="${this.mergedColor[0]}"
        d="
          M 5 20 L 5 10 L 12 3  L 60 3 L 68 10
          L ${this.width - 20} 10 L ${this.width - 5} 25
          L ${this.width - 5} ${this.height - 5} L 20 ${this.height - 5}
          L 5 ${this.height - 20} L 5 20
        "
      />

      <path
        fill="transparent"
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="10, 5"
        stroke="${this.mergedColor[0]}"
        d="M 16 9 L 61 9"
      />

      <path
        fill="transparent"
        stroke="${this.mergedColor[1]}"
        d="M 5 20 L 5 10 L 12 3  L 60 3 L 68 10"
      />

      <path
        fill="transparent"
        stroke="${this.mergedColor[1]}"
        d="M ${this.width - 5} ${this.height - 30} L ${this.width - 5} ${this.height - 5} L ${this.width - 30} ${this.height - 5}"
      />
    </svg>

    <div class="border-box-content">
      <slot></slot>
    </div>
  </div>`;
}















function DvDecoration1(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}

mxUtils.extend(DvDecoration1, DvExpands);

DvDecoration1.prototype.init = function (options) {
	this.svgWH = [this.width, this.height];
	this.svgScale = options.svgScale ? options.svgScale : [1, 1];

	this.rowNum = this.rowNum ? this.rowNum : 4;
	this.rowPoints = this.rowPoints ? this.rowPoints : 20;
	this.pointSideLength = this.pointSideLength ? this.pointSideLength : 20;

	this.pointSideLength = 2.5;
	this.halfPointSideLength = this.pointSideLength / 2;

	this.color = [];
	this.points = [];
	this.rects = [];
	this.defaultColor = this.defaultColor ? this.defaultColor : ['#fff', '#0de7c2'];
	this.mergedColor = this.mergedColor ? this.mergedColor : [];
	this.mergeColor();
	this.calcSVGData();
	let rectPoints = '';
	for (let i = 0; i < this.points.length; i++) {
		const point = this.points[i];
		const r = Math.random();
		const r2 = Math.random();
		var rectPoints2 =
			r2 > 0.6
				? `
        <animate
        attributeName="fill"
        values="${this.mergedColor[0]};transparent"
        dur="1s"
        begin="${Math.random() * 2}"
        repeatCount="indefinite"
      />
        `
				: '';
		rectPoints +=
			r > 0.6
				? `
        <rect
          fill="${this.mergedColor[0]}"
          x="${point[0] - this.halfPointSideLength}"
          y="${point[1] - this.halfPointSideLength}"
          width="${this.pointSideLength}"
          height="${this.pointSideLength}"
        >
          ${rectPoints2}
        </rect>
        `
				: '';
	}
	let temp1 = this.rects[0]
		? `<rect
    fill="${this.mergedColor[1]}"
    x="${this.rects[0][0] - this.pointSideLength}"
    y="${this.rects[0][1] - this.pointSideLength}"
    width="${this.pointSideLength * 2}"
    height="${this.pointSideLength * 2}"
  >
    <animate
      attributeName="width"
      values="0;${this.pointSideLength * 2}"
      dur="2s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="height"
      values="0;${this.pointSideLength * 2}"
      dur="2s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="x"
      values="${this.rects[0][0]};${this.rects[0][0] - this.pointSideLength}"
      dur="2s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="y"
      values="${this.rects[0][1]};${this.rects[0][1] - this.pointSideLength}"
      dur="2s"
      repeatCount="indefinite"
    />
  </rect>`
		: '';
	let temp2 = this.rects[1]
		? `<rect
        fill="${this.mergedColor[1]}"
        x="${this.rects[1][0] - 40}"
        y="${this.rects[1][1] - this.pointSideLength}"
        width="40"
        height="${this.pointSideLength * 2}"
        >
        <animate
            attributeName="width"
            values="0;40;0"
            dur="2s"
            repeatCount="indefinite"
        />
        <animate
            attributeName="x"
            values="${this.rects[1][0]};${this.rects[1][0] - 40};${this.rects[1][0]}"
            dur="2s"
            repeatCount="indefinite"
        />
        </rect>`
		: '';
	let html = `
    <div class="dv-decoration-1" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.svgWH[0]}" height="${this.svgWH[1]}" style="transform:scale(${this.svgScale[0]},${this.svgScale[1]});">
    ${rectPoints}
    ${temp1}
    ${temp2}
    </svg>
  </div>`;
	this.content = html;
};
DvDecoration1.prototype.calcSVGData = function () {
	this.calcPointsPosition();

	this.calcRectsPosition();

	this.calcScale();
};
DvDecoration1.prototype.calcPointsPosition = function () {
	const [w, h] = this.svgWH;
	const horizontalGap = w / (this.rowPoints + 1);
	const verticalGap = h / (this.rowNum + 1);
	let points = new Array(this.rowNum).fill(0).map((foo, i) => new Array(this.rowPoints).fill(0).map((foo, j) => [horizontalGap * (j + 1), verticalGap * (i + 1)]));
	this.points = points.reduce((all, item) => [...all, ...item], []);
};
DvDecoration1.prototype.calcRectsPosition = function () {
	const rect1 = this.points[this.rowPoints * 2 - 1];
	const rect2 = this.points[this.rowPoints * 2 - 3];
	this.rects = [rect1, rect2];
};
DvDecoration1.prototype.calcScale = function () {
	const [w, h] = this.svgWH;
	this.svgScale = [this.width / w, this.height / h];
};

function DvDecoration2(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration2, DvExpands);
DvDecoration2.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.reverse = options.reverse ? true : false;
	this.dur = options.dur ? options.dur : 6;
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.defaultColor = ['#3faacb', '#fff'];
	this.mergedColor = [];

	this.mergeColor();
	this.calcSVGData();

	this.content = `
	<div class="dv-decoration-2" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.width}" height="${this.height}">
      <rect x="${this.x}" y="${this.y}" width="${this.w}" height="${this.h}" fill="${this.mergedColor[0]}">
        <animate
          attributeName="${this.reverse ? 'height' : 'width'}"
          from="0"
          to="${this.reverse ? this.height : this.width}"
          dur="${this.dur}s"
          calcMode="spline"
          keyTimes="0;1"
          keySplines=".42,0,.58,1"
          repeatCount="indefinite"
        />
      </rect>

      <rect x="${this.x}" y="${this.y}" width="1" height="1" fill="${this.mergedColor[1]}">
        <animate
          attributeName="${this.reverse ? 'y' : 'x'}"
          from="0"
          to="${this.reverse ? this.height : this.width}"
          dur="${this.dur}s"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.42,0,0.58,1"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  </div>
	`;
};

DvDecoration2.prototype.calcSVGData = function () {
	if (this.reverse) {
		this.w = 2;
		this.h = this.height;
		this.x = this.width / 2;
		this.y = 0;
	} else {
		this.w = this.width;
		this.h = 2;
		this.x = 0;
		this.y = this.height / 2;
	}
};

function DvDecoration3(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration3, DvExpands);
DvDecoration3.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.svgWH = [this.width, this.height];
	this.svgScale = [1, 1];
	this.rowNum = options.rowNum ? options.rowNum : 2;
	this.rowPoints = options.rowPoints ? options.rowPoints : 25;
	this.pointSideLength = options.pointSideLength ? options.pointSideLength : 7;
	this.halfPointSideLength = this.pointSideLength / 2;
	this.points = [];
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#7acaec', 'transparent'];
	this.mergedColor = [];
	this.mergeColor();
	this.calcSVGData();

	var temp = '';
	for (let i = 0; i < this.points.length; i++) {
		const point = this.points[i];
		temp += `
		<rect
          fill="${this.mergedColor[0]}"
          x="${point[0] - this.halfPointSideLength}"
          y="${point[1] - this.halfPointSideLength}"
          width="${this.pointSideLength}"
          height="${this.pointSideLength}"
        > ${
			Math.random() > 0.6
				? `<animate
			attributeName="fill"
			values="${this.mergedColor.join(';')}"
			dur="${Math.random() + 1 + 's'}"
			begin="${Math.random() * 2}"
			repeatCount="indefinite"
		/>`
				: ''
		}
        </rect>`;
	}

	this.content = `
	<div class="dv-decoration-3" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.svgWH[0]}" height="${this.svgWH[1]}" style="transform:scale(${this.svgScale[0]},${this.svgScale[1]});">
      ${temp}
    </svg>
  </div>
	`;
};
DvDecoration3.prototype.calcSVGData = function () {
	this.calcPointsPosition();
	this.calcScale();
};
DvDecoration3.prototype.calcPointsPosition = function () {
	const [w, h] = this.svgWH;
	const horizontalGap = w / (this.rowPoints + 1);
	const verticalGap = h / (this.rowNum + 1);
	let points = new Array(this.rowNum).fill(0).map((foo, i) => new Array(this.rowPoints).fill(0).map((foo, j) => [horizontalGap * (j + 1), verticalGap * (i + 1)]));
	this.points = points.reduce((all, item) => [...all, ...item], []);
};
DvDecoration3.prototype.calcScale = function () {
	const [w, h] = this.svgWH;
	this.svgScale = [this.width / w, this.height / h];
};

function DvDecoration4(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration4, DvExpands);
DvDecoration4.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.reverse = options.reverse ? true : false;
	this.dur = options.dur ? options.dur : 3;
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#7acaec', 'transparent'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-decoration-4" style="width: ${this.width}px; height: ${this.height}px;">
    <div
      class="container ${this.reverse ? 'reverse' : 'normal'}"
      style="${this.reverse ? `width:${this.width}px;height:5px;animation-duration:${this.dur}s` : `width:5px;height:${this.height}px;animation-duration:${this.dur}s`}"
    >
      <svg width="${this.reverse ? this.width : 5}" :height="${this.reverse ? 5 : this.height}">
        <polyline
          stroke="${this.mergedColor[0]}"
          points="${this.reverse ? `0, 2.5 ${this.width}, 2.5` : `2.5, 0 2.5, ${this.height}`}"
        />
        <polyline
          class="bold-line"
          stroke="${this.mergedColor[1]}"
          stroke-width="3"
          stroke-dasharray="20, 80"
          stroke-dashoffset="-30"
          points="${this.reverse ? `0, 2.5 ${this.width}, 2.5` : `2.5, 0 2.5, ${this.height}`}"
        />
      </svg>
    </div>
  </div>
	`;
};

function DvDecoration5(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration5, DvExpands);
DvDecoration5.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.dur = options.dur ? options.dur : 1.2;
	this.line1Points = '';
	this.line2Points = '';

	this.line1Length = 0;
	this.line2Length = 0;

	this.defaultColor = options.defaultColor ? options.defaultColor : ['#3f96a5', '#3f96a5'];
	this.mergedColor = [];
	this.mergeColor();
	this.calcSVGData();
	this.content = `
    <div class="dv-decoration-5" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.width}" height="${this.height}">
      <polyline
        fill="transparent"
        stroke="${this.mergedColor[0]}"
        stroke-width="3"
        points="${this.line1Points}"
      >
        <animate
          attributeName="stroke-dasharray"
          attributeType="XML"
          from="0, ${this.line1Length / 2}, 0, ${this.line1Length / 2}"
          to="0, 0, ${this.line1Length}, 0"
          dur="${this.dur}s"
          begin="0s"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.4,1,0.49,0.98"
          repeatCount="indefinite"
        />
      </polyline>
      <polyline
        fill="transparent"
        stroke="${this.mergedColor[1]}"
        stroke-width="2"
        points="${this.line2Points}"
      >
        <animate
          attributeName="stroke-dasharray"
          attributeType="XML"
          from="0, ${this.line2Length / 2}, 0, ${this.line2Length / 2}"
          to="0, 0, ${this.line2Length}, 0"
          dur="${this.dur}s"
          begin="0s"
          calcMode="spline"
          keyTimes="0;1"
          keySplines=".4,1,.49,.98"
          repeatCount="indefinite"
        />
      </polyline>
    </svg>
  </div>
	`;
};
DvDecoration5.prototype.calcSVGData = function () {
	let line1Points = [
		[0, this.height * 0.2],
		[this.width * 0.18, this.height * 0.2],
		[this.width * 0.2, this.height * 0.4],
		[this.width * 0.25, this.height * 0.4],
		[this.width * 0.27, this.height * 0.6],
		[this.width * 0.72, this.height * 0.6],
		[this.width * 0.75, this.height * 0.4],
		[this.width * 0.8, this.height * 0.4],
		[this.width * 0.82, this.height * 0.2],
		[this.width, this.height * 0.2],
	];
	let line2Points = [
		[this.width * 0.3, this.height * 0.8],
		[this.width * 0.7, this.height * 0.8],
	];

	const line1Length = this.getPolylineLength(line1Points);
	const line2Length = this.getPolylineLength(line2Points);

	line1Points = line1Points.map((point) => point.join(',')).join(' ');
	line2Points = line2Points.map((point) => point.join(',')).join(' ');

	this.line1Points = line1Points;
	this.line2Points = line2Points;

	this.line1Length = line1Length;
	this.line2Length = line2Length;
};

function DvDecoration6(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}

mxUtils.extend(DvDecoration6, DvExpands);
DvDecoration6.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.svgWH = [this.width, this.height];
	this.svgScale = [1, 1];
	this.rowNum = 1;
	this.rowPoints = 40;

	this.rectWidth = 7;
	this.halfRectWidth = this.rectWidth / 2;
	this.points = [];
	this.heights = [];
	this.minHeights = [];
	this.randoms = [];
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#7acaec', '#7acaec'];
	this.mergedColor = [];
	this.mergeColor();
	this.calcSVGData();
	this.content = `
    <div class="dv-decoration-6" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.svgWH[0]}" height="${this.svgWH[1]}" style="transform:scale(${this.svgScale[0]},${this.svgScale[1]});">
	${this.points.reduce((t, point, i) => {
		return (
			t +
			`<rect
		fill="${this.mergedColor[Math.random() > 0.5 ? 0 : 1]}"
		x="${point[0] - this.halfRectWidth}"
		y="${point[1] - this.heights[i] / 2}"
		width="${this.rectWidth}"
		height="${this.heights[i]}">
		<animate
		  attributeName="y"
		  values="${point[1] - this.minHeights[i] / 2};${point[1] - this.heights[i] / 2};${point[1] - this.minHeights[i] / 2}"
		  dur="${this.randoms[i]}s"
		  keyTimes="0;0.5;1"
		  calcMode="spline"
		  keySplines="0.42,0,0.58,1;0.42,0,0.58,1"
		  begin="0s"
		  repeatCount="indefinite"
		/>
		<animate
		  attributeName="height"
		  values="${this.minHeights[i]};${this.heights[i]};${this.minHeights[i]}"
		  dur="${this.randoms[i]}s"
		  keyTimes="0;0.5;1"
		  calcMode="spline"
		  keySplines="0.42,0,0.58,1;0.42,0,0.58,1"
		  begin="0s"
		  repeatCount="indefinite"
		/>
	  </rect>`
		);
	}, '')}
    </svg>
  </div>
	`;
};
DvDecoration6.prototype.calcSVGData = function () {
	this.calcPointsPosition();
	this.calcScale();
};
DvDecoration6.prototype.calcPointsPosition = function () {
	const [w, h] = this.svgWH;
	const horizontalGap = w / (this.rowPoints + 1);
	const verticalGap = h / (this.rowNum + 1);
	let points = new Array(this.rowNum).fill(0).map((foo, i) => new Array(this.rowPoints).fill(0).map((foo, j) => [horizontalGap * (j + 1), verticalGap * (i + 1)]));
	this.points = points.reduce((all, item) => [...all, ...item], []);
	const heights = (this.heights = new Array(this.rowNum * this.rowPoints).fill(0).map((foo) => (Math.random() > 0.8 ? this.randomExtend(0.7 * h, h) : this.randomExtend(0.2 * h, 0.5 * h))));
	this.minHeights = new Array(this.rowNum * this.rowPoints).fill(0).map((foo, i) => heights[i] * Math.random());
	this.randoms = new Array(this.rowNum * this.rowPoints).fill(0).map((foo) => Math.random() + 1.5);
};
DvDecoration6.prototype.calcScale = function () {
	const [w, h] = this.svgWH;
	this.svgScale = [this.width / w, this.height / h];
};

function DvDecoration7(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration7, DvExpands);
DvDecoration7.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#1dc1f5', '#1dc1f5'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-decoration-7" style="width: ${this.width}px; height: ${this.height}px;">
		<svg width="21px" height="20px">
			<polyline
				stroke-width="4"
				fill="transparent"
				stroke="${this.mergedColor[0]}"
				points="10, 0 19, 10 10, 20"
			/>
			<polyline
				stroke-width="2"
				fill="transparent"
				stroke="${this.mergedColor[1]}"
				points="2, 0 11, 10 2, 20"
			/>
		</svg>
		<div style="width: ${this.width - 2 * 21}px; height: ${this.height}px;"></div>
		<svg width="21px" height="20px">
			<polyline
				stroke-width="4"
				fill="transparent"
				stroke="${this.mergedColor[0]}"
				points="11, 0 2, 10 11, 20"
			/>
			<polyline
				stroke-width="2"
				fill="transparent"
				stroke="${this.mergedColor[1]}"
				points="19, 0 10, 10 19, 20"
			/>
		</svg>
  	</div>
	`;
};

function DvDecoration8(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration8, DvExpands);
DvDecoration8.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.reverse = options.reverse ? true : false;
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#3f96a5', '#3f96a5'];
	this.mergedColor = [];
	this.mergeColor();

	this.content = `
	<div class="dv-decoration-8" style="width: ${this.width}px; height: ${this.height}px;">
		<svg width="${this.width}" height="${this.height}">
			<polyline
				stroke="${this.mergedColor[0]}"
				stroke-width="2"
				fill="transparent"
				points="${this.xPos(0)}, 0 ${this.xPos(30)}, ${this.height / 2}"/>
			<polyline
				stroke="${this.mergedColor[0]}"
				stroke-width="2"
				fill="transparent"
				points="${this.xPos(20)}, 0 ${this.xPos(50)}, ${this.height / 2} ${this.xPos(this.width)}, ${this.height / 2}"/>
			<polyline
				stroke="${this.mergedColor[1]}"
				fill="transparent"
				stroke-width="3"
				points="${this.xPos(0)}, ${this.height - 3}, ${this.xPos(200)}, ${this.height - 3}"/>
		</svg>
	</div>`;
};
DvDecoration8.prototype.xPos = function (pos) {
	if (!this.reverse) return pos;
	return this.width - pos;
};

function DvDecoration9(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration9, DvExpands);
DvDecoration9.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.dur = options.dur ? options.dur : 3;
	this.polygonId = `decoration-9-polygon-${mxUtils.uuid()}`;
	this.svgWH = [this.width, this.height];
	this.svgScale = [1, 1];
	this.calcScale()
	this.defaultColor = ['rgba(3, 166, 224, 0.8)', 'rgba(3, 166, 224, 0.5)'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-decoration-9" style="width: ${this.width}px; height: ${this.height}px;">
		<svg width="${this.svgWH[0]}" height="${this.svgWH[1]}" style="transform:scale(${this.svgScale[0]},${this.svgScale[1]});">
		<defs>
			<polygon id="${this.polygonId}" points="15, 46.5, 21, 47.5, 21, 52.5, 15, 53.5" />
		</defs>
		<circle
			cx="50"
			cy="50"
			r="45"
			fill="transparent"
			stroke="${this.mergedColor[1]}"
			stroke-width="10"
			stroke-dasharray="80, 100, 30, 100"
		>
			<animateTransform
			attributeName="transform"
			type="rotate"
			values="0 50 50;360 50 50"
			dur="${this.dur}s"
			repeatCount="indefinite"
			/>
		</circle>

		<circle
			cx="50"
			cy="50"
			r="45"
			fill="transparent"
			stroke="${this.mergedColor[0]}"
			stroke-width="6"
			stroke-dasharray="50, 66, 100, 66"
		>
			<animateTransform
			attributeName="transform"
			type="rotate"
			values="0 50 50;-360 50 50"
			dur="${this.dur}s"
			repeatCount="indefinite"
			/>
		</circle>

		<circle
			cx="50"
			cy="50"
			r="38"
			fill="transparent"
			stroke="${this.fade(this.mergedColor[1] || this.defaultColor[1], 30)}"
			stroke-width="1"
			stroke-dasharray="5, 1"
		/>
		${new Array(20).fill(0).reduce((t, item, i) => {
			return t + `<use
				xlink:href="#${this.polygonId}"
				stroke="${this.mergedColor[1]}"
				fill="${Math.random() > 0.4 ? 'transparent' : this.mergedColor[0]}">
				<animateTransform
					attributeName="transform"
					type="rotate"
					values="0 50 50;360 50 50"
					dur="${this.dur}s"
					begin="${(i * this.dur) / 20}s"
					repeatCount="indefinite" />
			</use>`;
		}, '')}
		<circle
			cx="50"
			cy="50"
			r="26"
			fill="transparent"
			stroke="${this.fade(this.mergedColor[1] || this.defaultColor[1], 30)}"
			stroke-width="1"
			stroke-dasharray="5, 1"/>
		</svg>
	</div>`;
};
DvDecoration9.prototype.calcScale = function () {
	const [w, h] = this.svgWH;
	this.svgScale = [this.width / w, this.height / h];
};

function DvDecoration10(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration10, DvExpands);
DvDecoration10.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	const id = mxUtils.uuid();
	this.animationId1 = `d10ani1${id}`;
	this.animationId2 = `d10ani2${id}`;
	this.animationId3 = `d10ani3${id}`;
	this.animationId4 = `d10ani4${id}`;
	this.animationId5 = `d10ani5${id}`;
	this.animationId6 = `d10ani6${id}`;
	this.animationId7 = `d10ani7${id}`;
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#00c2ff', 'rgba(0, 194, 255, 0.3)'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-decoration-10" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.width}" height="${this.height}">
      <polyline
        stroke="${this.mergedColor[1]}"
        stroke-width="2"
        points="0, ${this.height / 2} ${this.width}, ${this.height / 2}"/>
      <polyline
        stroke="${this.mergedColor[0]}"
        stroke-width="2"
        points="5, ${this.height / 2} ${this.width * 0.2 - 3}, ${this.height / 2}"
        stroke-dasharray="0, ${this.width * 0.2}"
        fill="freeze">
	  <animate
          id="${this.animationId2}"
          attributeName="stroke-dasharray"
          values="0, ${this.width * 0.2};${this.width * 0.2}, 0;"
          dur="3s"
          begin="${this.animationId1}.end"
          fill="freeze"/>
        <animate
          attributeName="stroke-dasharray"
          values="${this.width * 0.2}, 0;0, ${this.width * 0.2}"
          dur="0.01s"
          begin="${this.animationId7}.end"
          fill="freeze"/>
      </polyline>

      <polyline
        stroke="${this.mergedColor[0]}"
        stroke-width="2"
        points="${this.width * 0.2 + 3}, ${this.height / 2} ${this.width * 0.8 - 3}, ${this.height / 2}"
        stroke-dasharray="0, ${this.width * 0.6}">
        <animate
          id="${this.animationId4}"
          attributeName="stroke-dasharray"
          values="0, ${this.width * 0.6};${this.width * 0.6}, 0"
          dur="3s"
          begin="${this.animationId3}.end + 1s"
          fill="freeze"/>
        <animate
          attributeName="stroke-dasharray"
          values="${this.width * 0.6}, 0;0, ${this.width * 0.6}"
          dur="0.01s"
          begin="${this.animationId7}.end"
          fill="freeze"/>
      </polyline>

      <polyline
        stroke="${this.mergedColor[0]}"
        stroke-width="2"
        points="${this.width * 0.8 + 3}, ${this.height / 2} ${this.width - 5}, ${this.height / 2}"
        stroke-dasharray="0, ${this.width * 0.2}">
        <animate
          id="${this.animationId6}"
          attributeName="stroke-dasharray"
          values="0, ${this.width * 0.2};${this.width * 0.2}, 0"
          dur="3s"
          begin="${this.animationId5}.end + 1s"
          fill="freeze"/>
        <animate
          attributeName="stroke-dasharray"
          values="${this.width * 0.2}, 0;0, ${this.width * 0.3}"
          dur="0.01s"
          begin="${this.animationId7}.end"
          fill="freeze"/>
      </polyline>

      <circle cx="2" cy="${this.height / 2}" r="2" fill="${this.mergedColor[1]}">
        <animate
          id="${this.animationId1}"
          attributeName="fill"
          values="${this.mergedColor[1]};${this.mergedColor[0]}"
          begin="0s;${this.animationId7}.end"
          dur="0.3s"
          fill="freeze"/>
      </circle>

      <circle cx="${this.width * 0.2}" cy="${this.height / 2}" r="2" fill="${this.mergedColor[1]}">
        <animate
          id="${this.animationId3}"
          attributeName="fill"
          values="${this.mergedColor[1]};${this.mergedColor[0]}"
          begin="${this.animationId2}.end"
          dur="0.3s"
          fill="freeze"/>
        <animate
          attributeName="fill"
          values="${this.mergedColor[1]};${this.mergedColor[1]}"
          dur="0.01s"
          begin="${this.animationId7}.end"
          fill="freeze"/>
      </circle>

      <circle cx="${this.width * 0.8}" cy="${this.height / 2}" r="2" fill="${this.mergedColor[1]}">
        <animate
          id="${this.animationId5}"
          attributeName="fill"
          values="${this.mergedColor[1]};${this.mergedColor[0]}"
          begin="${this.animationId4}.end"
          dur="0.3s"
          fill="freeze"/>
        <animate
          attributeName="fill"
          values="${this.mergedColor[1]};${this.mergedColor[1]}"
          dur="0.01s"
          begin="${this.animationId7}.end"
          fill="freeze"/>
      </circle>

      <circle cx="${this.width - 2}" cy="${this.height / 2}" r="2" fill="${this.mergedColor[1]}">
        <animate
          id="${this.animationId7}"
          attributeName="fill"
          values="${this.mergedColor[1]};${this.mergedColor[0]}"
          begin="${this.animationId6}.end"
          dur="0.3s"
          fill="freeze"/>
        <animate
          attributeName="fill"
          values="${this.mergedColor[1]};${this.mergedColor[1]}"
          dur="0.01s"
          begin="${this.animationId7}.end"
          fill="freeze"/>
      </circle>
    </svg>
  </div>`;
};

function DvDecoration11(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration11, DvExpands);
DvDecoration11.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#1a98fc', '#2cf7fe'];
	this.mergedColor = [];
	this.mergeColor();
	this.content = `
	<div class="dv-decoration-11" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.width}" height="${this.height}">
		<polygon
			fill="${this.fade(this.mergedColor[1] || this.defaultColor[1], 10)}"
			stroke="${this.mergedColor[1]}"
			points="20 10, 25 4, 55 4 60 10"/>
		<polygon
			fill="${this.fade(this.mergedColor[1] || this.defaultColor[1], 10)}"
			stroke="${this.mergedColor[1]}"
			points="20 ${this.height - 10}, 25 ${this.height - 4}, 55 ${this.height - 4} 60 ${this.height - 10}"/>
		<polygon
			fill="${this.fade(this.mergedColor[1] || this.defaultColor[1], 10)}"
			stroke="${this.mergedColor[1]}"
			points="${this.width - 20} 10, ${this.width - 25} 4, ${this.width - 55} 4 ${this.width - 60} 10"/>
		<polygon
			fill="${this.fade(this.mergedColor[1] || this.defaultColor[1], 10)}"
			stroke="${this.mergedColor[1]}"
			points="${this.width - 20} ${this.height - 10}, ${this.width - 25} ${this.height - 4}, ${this.width - 55} ${this.height - 4} ${this.width - 60} ${this.height - 10}"/>
		<polygon
			fill="${this.fade(this.mergedColor[0] || this.defaultColor[0], 20)}"
			stroke="${this.mergedColor[0]}"
			points="20 10, 5 ${this.height / 2} 20 ${this.height - 10} ${this.width - 20} ${this.height - 10} ${this.width - 5} ${this.height / 2} ${this.width - 20} 10"/>
		<polyline
			fill="transparent"
			stroke="${this.fade(this.mergedColor[0] || this.defaultColor[0], 70)}"
			points="25 18, 15 ${this.height / 2} 25 ${this.height - 18}"/>
		<polyline
			fill="transparent"
			stroke="${this.fade(this.mergedColor[0] || this.defaultColor[0], 70)}"
			points="${this.width - 25} 18, ${this.width - 15} ${this.height / 2} ${this.width - 25} ${this.height - 18}"/>
	</svg>
	<div class="decoration-content">

	</div>
	</div>`;
};

function DvDecoration12(w, h, options = {}) {
	DvExpands.call(this, w, h);
	this.init(options);
}
mxUtils.extend(DvDecoration12, DvExpands);
DvDecoration12.prototype.init = function (options) {
	this.color = options.color ? options.color : [];
	this.defaultColor = options.defaultColor ? options.defaultColor : ['#2783ce', '#2cf7fe'];
	this.mergedColor = [];
	this.mergeColor();
	this.scanDur = options.scanDur ? options.scanDur : 3;
	this.haloDur = options.haloDur ? options.haloDur : 2;
	const id = mxUtils.uuid();
	this.gId = `decoration-12-g-${id}`;
	this.gradientId = `decoration-12-gradient-${id}`;
	this.pathD = [];
	this.pathColor = [];
	this.circleR = [];
	this.splitLinePoints = [];
	this.arcD = [];
	this.segment = 30;
	this.sectorAngle = Math.PI / 3;
	this.ringNum = 3;
	this.ringWidth = 1;
	this.showSplitLine = true;
	this.x = this.width / 2;
	this.y = this.height / 2;
	this.calcPathD();
	this.calcPathColor();
	this.calcCircleR();
	this.calcSplitLinePoints();
	this.calcArcD();
	this.content = `
	<div class="dv-decoration-12" style="width: ${this.width}px; height: ${this.height}px;">
    <svg width="${this.width}px" height="${this.height}px">
      <defs>
	  	<g id="${this.gId}">
          ${this.pathD.reduce((t, d, i) => {
				return (
					t +
					`<path
            stroke="${this.pathColor[i]}"
            stroke-width="${this.width / 2}"
            fill="transparent"
            d="${d}"
          />`
				);
			}, '')}
        </g>
		<radialGradient id="${this.gradientId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="transparent" stop-opacity="1" />
          <stop offset="100%" stop-color="${this.fade(this.mergedColor[1] || this.defaultColor[1], 30)}" stop-opacity="1" />
        </radialGradient>
	  </defs>
	  ${this.circleR.reduce((t, r, i) => {
			return (
				t +
				`<circle
        r="${r}"
        cx="${this.x}"
        cy="${this.y}"
        stroke="${this.mergedColor[1]}"
        stroke-width="0.5"
        fill="transparent"
      />`
			);
		}, '')}
	  <circle
        r="1"
        cx="${this.x}"
        cy="${this.y}"
        stroke="transparent"
        fill="url(#${this.gradientId})">
		<animate
          attributeName="r"
          values="1;${this.width / 2}"
          dur="${this.haloDur}s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0"
          dur="${this.haloDur}s"
          repeatCount="indefinite"
        />
	</circle>
	<circle
        r="2"
        cx="${this.x}"
        cy="${this.y}"
        fill="${this.mergedColor[1]}"/>
	${
		this.showSplitLine
			? `
	<g>
		${this.splitLinePoints.reduce((t, p, i) => {
			return (
				t +
				`
			<polyline
			points="${p}"
			stroke="${this.mergedColor[1]}"
			stroke-width="0.5"
			opacity="0.5"/>`
			);
		}, '')}
	</g>`
			: ''
	}
	${this.arcD.reduce((t, d, i) => {
		return (
			t +
			`
		<path
			d="${d}"
			stroke="${this.mergedColor[1]}"
			stroke-width="2"
			fill="transparent"
		/>`
		);
	}, '')}
	<use :xlink:href="#${this.gId}">
	  <animateTransform
		attributeName="transform"
		type="rotate"
		values="0, ${this.x} ${this.y};360, ${this.x} ${this.y}"
		dur="${this.scanDur}s"
		repeatCount="indefinite"
	  />
	</use>
	</svg>
    <div class="decoration-content">
    </div>
	</div>`;
};
DvDecoration12.prototype.calcPathD = function () {
	const { x, y, width, segment, sectorAngle } = this;
	const startAngle = -Math.PI / 2;
	const angleGap = sectorAngle / segment;
	const r = width / 4;
	let lastEndPoints = this.getCircleRadianPoint(x, y, r, startAngle);
	this.pathD = new Array(segment).fill('').map((_, i) => {
		const endPoints = this.getCircleRadianPoint(x, y, r, startAngle - (i + 1) * angleGap).map((_) => _.toFixed(5));
		const d = `M${lastEndPoints.join(',')} A${r}, ${r} 0 0 0 ${endPoints.join(',')}`;
		lastEndPoints = endPoints;

		return d;
	});
};
DvDecoration12.prototype.calcPathColor = function () {
	const {
		mergedColor: [color],
		segment,
	} = this;
	const colorGap = 100 / (segment - 1);
	this.pathColor = new Array(segment).fill(color).map((_, i) => this.fade(color, 100 - i * colorGap));
};
DvDecoration12.prototype.calcCircleR = function () {
	const { segment, ringNum, width, ringWidth } = this;
	const radiusGap = (width / 2 - ringWidth / 2) / ringNum;
	this.circleR = new Array(ringNum).fill(0).map((_, i) => radiusGap * (i + 1));
};
DvDecoration12.prototype.calcSplitLinePoints = function () {
	const { x, y, width } = this;
	const angleGap = Math.PI / 6;
	const r = width / 2;
	this.splitLinePoints = new Array(6).fill('').map((_, i) => {
		const startAngle = angleGap * (i + 1);
		const endAngle = startAngle + Math.PI;
		const startPoint = this.getCircleRadianPoint(x, y, r, startAngle);
		const endPoint = this.getCircleRadianPoint(x, y, r, endAngle);
		return `${startPoint.join(',')} ${endPoint.join(',')}`;
	});
};
DvDecoration12.prototype.calcArcD = function () {
	const { x, y, width } = this;
	const angleGap = Math.PI / 6;
	const r = width / 2 - 1;
	this.arcD = new Array(4).fill('').map((_, i) => {
		const startAngle = angleGap * (3 * i + 1);
		const endAngle = startAngle + angleGap;
		const startPoint = this.getCircleRadianPoint(x, y, r, startAngle);
		const endPoint = this.getCircleRadianPoint(x, y, r, endAngle);
		return `M${startPoint.join(',')} A${x}, ${y} 0 0 1 ${endPoint.join(',')}`;
	});
};



