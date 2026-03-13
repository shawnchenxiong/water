/* eslint-disable */
import mx from './build';
import {mxBasePath, mxImageBasePath, mxRemoteServerRoot, mxRemoteImageRoot} from '../constant';

import Toast from '../js/utils/toast';

window.isLocalStorage = window.isLocalStorage || !1;

window.mxBasePath = 'static';
window.mxLoadResources = false;
window.mxForceIncludes = false;
window.mxLoadStylesheets = false;
window.mxResourceExtension = '.txt';


const mxgraph = mx();
Object.keys(mxgraph).forEach((key) => {
	window[key] = mxgraph[key];
});
// 需要用到的再引用 实际上还是把所有的包都打进来了
export const { mxGraph, mxCodec, mxConstants, mxSvgCanvas2D, mxImageExport, mxEventSource, mxResources, mxEventObject, mxEvent, mxUtils, mxClient, mxRectangle, mxDivResizer, mxPopupMenu, mxPoint, mxGraphView, mxMouseEvent, mxPolyline, mxGraphHandler, mxConnectionHandler, mxCellMarker, mxRectangleShape, mxPopupMenuHandler, mxUndoManager, mxText, mxRubberband, mxGraphModel, mxShape, mxEdgeStyle, mxSelectionCellsHandler, mxClipboard, mxEdgeHandler, mxCellRenderer, mxDragSource, mxGuide, mxImage, mxGraphLayout, mxObjectCodec, mxCellHighlight, mxLayoutManager, mxCompactTreeLayout, mxHierarchicalLayout, mxCircleLayout, mxFastOrganicLayout, mxStencilRegistry, mxStencil, mxConstraintHandler, mxEllipse, mxCellState, mxObjectIdentity, mxDictionary, mxConnectionConstraint, mxCellEditor, mxVertexHandler, mxOutline, mxPanningHandler, mxElbowEdgeHandler, mxImageShape, mxStackLayout, mxConnector, mxStyleRegistry, mxKeyHandler, mxCell, mxGeometry, mxXmlRequest, mxXmlCanvas2D, mxForm, mxWindow, mxMorphing, mxRadialTreeLayout, mxActor, mxMarker, mxCylinder, mxRhombus, mxPerimeter, mxArrowConnector, mxDoubleEllipse, mxHexagon, mxSwimlane, mxLabel, mxHandle, mxLine, mxTriangle, mxCloud, mxArrow, mxCodecRegistry, mxLanguage } = mxgraph;

mxUtils.alert = function (msg) {
	Toast(msg ? msg : '', 1000);
};

mxUtils.fixImg = function (url) {
	if(mxUtils.isNullOrUndefined(url) || typeof url != 'string') return null;
	if(url.startsWith('/rcscada/')){
		return mxUtils.staticImg(url);
	}
	return mxUtils.remoteImg(url);
};
mxUtils.staticImg = function (url) {
	if(mxUtils.isNullOrUndefined(url) || typeof url != 'string') return null;
	return mxBasePath + (url.startsWith('/') ? url : '/' + url);
};
mxUtils.remoteImg = function (url) {
	if(mxUtils.isNullOrUndefined(url) || typeof url != 'string') return null;
	if(url.startsWith('http')) return url;
	return mxRemoteImageRoot + (url.startsWith('/') ? url : '/' + url);
};
mxUtils.isNullOrUndefined = function (v) {
	return v == undefined || v == null;
};
mxUtils.isNotNullOrUndefined = function (v) {
	return !mxUtils.isNullOrUndefined(v);
};
mxUtils.getCellStyleWithStr = function (str) {
	const style = {};
	if(mxUtils.isNotNullOrUndefined(str)){
		let params = str.split(';');
		if(params.length > 0){
			params.map(item => {
				let pa = item.split('=');
				if(pa.length === 2){
					style[pa[0]] = pa[1];
				}
			});
		}
	}
	return style;
};

mxUtils.uuid = function () {
	let s = [];
	let hexDigits = '0123456789abcdef';
	for (let i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = '-';
	let uid = s.join('').replaceAll('-', '');
	return uid;
};


mxUtils.splitDynamicParams = function(targetStr){
	let matchs = [];
    let match = null;
	let regex = /\$\{(\w+)=\{\{(\w+)\}\}\}/g; // 匹配动态设置参数 
	let replaces = [];
	while ((match = regex.exec(targetStr)) !== null) {
		let v = `{{${match[2]}}}`;
		replaces.push(v)
        matchs.push({key: match[1], value: v});
    }
	replaces.map(item => {
		targetStr.replaceAll(item, '');
	})
	regex = /\$\{(\w+)=(\w+)\}/g; // 匹配动态设置参数 
	while ((match = regex.exec(targetStr)) !== null) {
        matchs.push({key: match[1], value: match[2]});
    }
    return matchs;
}

/* 
mxUtils.splitDynamicParams = function splitDynamicParams(targetStr){
    let matchs = [];
    // if(mxUtils.isNullOrUndefined(targetStr)) return matchs;
    if(targetStr.length <= 0) return matchs;
    let regex = /\$\{(.+?)\}/g; // 匹配动态设置参数 //${xxx}
    let match = null;
    while ((match = regex.exec(targetStr)) !== null) {
        let ps = match[1];
        ps = ps.split('=');
        matchs.push({key: ps[0], value: ps[1]});
    }

	regex = /\$\{(\w+)=\{\{(\w+)\}\}\}/g; // 匹配动态设置参数 
    match = null;
	while ((match = regex.exec(targetStr)) !== null) {
        let ps = match[1];
        ps = ps.split('=');
        matchs.push({key: ps[0], value: ps[1]});
    }
    return matchs;
};

function splitDynamicParams(targetStr){
    let matchs = [];
    let match = null;
	let regex = /\$\{(\w+)=\{\{(\w+)\}\}\}/g; // 匹配动态设置参数 
	while ((match = regex.exec(targetStr)) !== null) {
		console.log(match);
        let ps = match[1];
        ps = ps.split('=');
        matchs.push({key: ps[0], value: ps[1]});
    }
    return matchs;
} */

mxUtils.replaceDynamicParams = function(targetStr, editorUi){
    if(mxUtils.isNullOrUndefined(targetStr)) return targetStr;
	const targetObj = editorUi.GLOBAL_CONFIG
    if(targetStr.length <= 0) return targetStr;
    let regex = /{{(\w+)}}/g; // 匹配动态设置参数 {{xxx}}
    let match = null;
    let matchs = [];
    while ((match = regex.exec(targetStr)) !== null) {
        matchs.push({str: match[0], key: match[1]});
    }
    if(matchs.length > 0){
        for (let i = 0; i < matchs.length; i++) {
            let v = targetObj[matchs[i].key];
            v = v ? v : '';
            targetStr = targetStr.replaceAll(matchs[i].str, v);
        }
    }
    return targetStr;
};

mxUtils.isJSON = function (str) {
    if (typeof str !== 'string') {
        return false;
    }
    str = str.trim();
    if ((str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'))) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            console.log('mxUtils.isJSON', e);
            return false;
        }
    }
    return false;
};

mxUtils.createTag = function (tagName, className) {
    const tag = document.createElement(tagName);
    if (className) tag.className = className;
    return tag;
};

mxUtils.visitNodes = function(node, visitor) {
	if (node.nodeType == mxConstants.NODETYPE_ELEMENT){
		visitor(node);
		node = node.firstChild;
		while (node != null){
			mxUtils.visitNodes(node, visitor);
			node = node.nextSibling;
		}
	}
};
mxUtils.stringToByte = function (str) {
	var bytes = new Array();
	var len, c;
	len = str.length;
	for (var i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if (c >= 0x010000 && c <= 0x10ffff) {
			bytes.push(((c >> 18) & 0x07) | 0xf0);
			bytes.push(((c >> 12) & 0x3f) | 0x80);
			bytes.push(((c >> 6) & 0x3f) | 0x80);
			bytes.push((c & 0x3f) | 0x80);
		} else if (c >= 0x000800 && c <= 0x00ffff) {
			bytes.push(((c >> 12) & 0x0f) | 0xe0);
			bytes.push(((c >> 6) & 0x3f) | 0x80);
			bytes.push((c & 0x3f) | 0x80);
		} else if (c >= 0x000080 && c <= 0x0007ff) {
			bytes.push(((c >> 6) & 0x1f) | 0xc0);
			bytes.push((c & 0x3f) | 0x80);
		} else {
			bytes.push(c & 0xff);
		}
	}
	return bytes;
};
mxUtils.byteToString = function (arr) {
	if (typeof arr === 'string') {
		return arr;
	}
	var str = '',
		_arr = arr;
	for (var i = 0; i < _arr.length; i++) {
		var one = _arr[i].toString(2),
			v = one.match(/^1+?(?=0)/);
		if (v && one.length == 8) {
			var bytesLength = v[0].length;
			var store = _arr[i].toString(2).slice(7 - bytesLength);
			for (var st = 1; st < bytesLength; st++) {
				store += _arr[st + i].toString(2).slice(2);
			}
			str += String.fromCharCode(parseInt(store, 2));
			i += bytesLength - 1;
		} else {
			str += String.fromCharCode(_arr[i]);
		}
	}
	return str;
};

mxUtils.utf8ByteToUnicodeStr = function (utf8Bytes) {
	var unicodeStr = '';
	for (var pos = 0; pos < utf8Bytes.length; ) {
		var flag = utf8Bytes[pos];
		var unicode = 0;
		if (flag >>> 7 === 0) {
			unicodeStr += String.fromCharCode(utf8Bytes[pos]);
			pos += 1;
		} else if ((flag & 0xfc) === 0xfc) {
			unicode = (utf8Bytes[pos] & 0x3) << 30;
			unicode |= (utf8Bytes[pos + 1] & 0x3f) << 24;
			unicode |= (utf8Bytes[pos + 2] & 0x3f) << 18;
			unicode |= (utf8Bytes[pos + 3] & 0x3f) << 12;
			unicode |= (utf8Bytes[pos + 4] & 0x3f) << 6;
			unicode |= utf8Bytes[pos + 5] & 0x3f;
			unicodeStr += String.fromCharCode(unicode);
			pos += 6;
		} else if ((flag & 0xf8) === 0xf8) {
			unicode = (utf8Bytes[pos] & 0x7) << 24;
			unicode |= (utf8Bytes[pos + 1] & 0x3f) << 18;
			unicode |= (utf8Bytes[pos + 2] & 0x3f) << 12;
			unicode |= (utf8Bytes[pos + 3] & 0x3f) << 6;
			unicode |= utf8Bytes[pos + 4] & 0x3f;
			unicodeStr += String.fromCharCode(unicode);
			pos += 5;
		} else if ((flag & 0xf0) === 0xf0) {
			unicode = (utf8Bytes[pos] & 0xf) << 18;
			unicode |= (utf8Bytes[pos + 1] & 0x3f) << 12;
			unicode |= (utf8Bytes[pos + 2] & 0x3f) << 6;
			unicode |= utf8Bytes[pos + 3] & 0x3f;
			unicodeStr += String.fromCharCode(unicode);
			pos += 4;
		} else if ((flag & 0xe0) === 0xe0) {
			unicode = (utf8Bytes[pos] & 0x1f) << 12;
			unicode |= (utf8Bytes[pos + 1] & 0x3f) << 6;
			unicode |= utf8Bytes[pos + 2] & 0x3f;
			unicodeStr += String.fromCharCode(unicode);
			pos += 3;
		} else if ((flag & 0xc0) === 0xc0) {
			//110
			unicode = (utf8Bytes[pos] & 0x3f) << 6;
			unicode |= utf8Bytes[pos + 1] & 0x3f;
			unicodeStr += String.fromCharCode(unicode);
			pos += 2;
		} else {
			unicodeStr += String.fromCharCode(utf8Bytes[pos]);
			pos += 1;
		}
	}
	return unicodeStr;
};


mxUtils.convertBlobValue = function (obj, typeKey, valueKey) {
	if (obj[valueKey] && obj[valueKey].length > 0) {
		if (obj[typeKey] <= 2) {
			// 整型 浮点型 字符串 blob
			let v = mxUtils.utf8ByteToUnicodeStr(obj[valueKey]);
			if (obj[typeKey] == 0) {
				try {
					v = parseInt(v);
				} catch (error) {
					v = null;
				}
			} else if (obj[typeKey] == 1) {
				try {
					v = parseFloat(v);
				} catch (error) {
					v = null;
				}
			}
			obj[valueKey] = v;
		}
	} else {
		obj[valueKey] = null;
	}
	return obj;
};
mxUtils.convertDefaultValue = function (defaultValue, valueType) {
	let val = null;
	if(mxUtils.isNotNullOrUndefined(defaultValue) && mxUtils.isNotNullOrUndefined(valueType)){
		if(valueType == 0){
			if(mxUtils.isInteger(defaultValue)) val = parseInt(defaultValue + '');
		}else if(valueType == 1){
			if(mxUtils.isNumeric(defaultValue)) val = parseFloat(defaultValue + '');
		}else{
			val = defaultValue;
		}
	}
	return val;
};

mxUtils.getConditionValue = function (conditions, outputValue) {
	/*"cot": 1,"label": "显示","min": "0","max": "","val": 1
	{key: 0, title: '等于'},
	{key: 1, title: '不等于'},
	{key: 2, title: '小于等于'},
	{key: 3, title: '介于之间'},
	{key: 4, title: '大于等于'},
	{key: 5, title: '外包含'},
	{key: 6, title: '不外包含'},
	{key: 7, title: '内包含'},
	{key: 8, title: '不包含'},*/
	let retVal = null;
	try{
		for (let i = 0; i < conditions.length; i++) {
			let con = conditions[i];
			if(con.cot === 0){
				if(outputValue == con.min){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 1){
				if(outputValue != con.min){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 2){
				if(outputValue <= con.min){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 3){
				if(con.min <= outputValue && outputValue <= con.max){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 4){
				if(outputValue >= con.min){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 5){
				if(outputValue.indexOf(con.min) !== -1){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 6){
				if(outputValue.indexOf(con.min) === -1){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 7){
				if(con.min.indexOf(outputValue) !== -1){
					retVal = con.val;
					break;
				}
			}else if(con.cot === 8){
				if(con.min.indexOf(outputValue) === -1){
					retVal = con.val;
					break;
				}
			}
		}
	}catch (e) {
		console.error('getConditionValue-----', e);
	}
	return retVal;
};

mxUtils.format = function (a) {
	return parseFloat(parseFloat(a).toFixed(2));
};

mxCodec.prototype.decode = function (node, into) {
	this.updateElements();
	let obj = null;
	if (node && node.nodeType == mxConstants.NODETYPE_ELEMENT) {
		let ctor = null;
		try {
			ctor = mx[node.nodeName] || window[node.nodeName];
		} catch (error) {
			console.log(`NODE ${node.nodeName} IS NOT FOUND`, error);
		}
		const dec = mxCodecRegistry.getCodec(ctor);
		if (dec) {
			obj = dec.decode(this, node, into);
		} else {
			obj = node.cloneNode(true);
			obj && obj.removeAttribute('as');
		}
	}
	return obj;
};

mxUtils.getScrollOrigin = function (node, includeAncestors, includeDocument) {
	includeAncestors = includeAncestors != null ? includeAncestors : false;
	includeDocument = includeDocument != null ? includeDocument : false;
	const doc = node != null ? node.ownerDocument : document;
	const b = doc.body;
	const d = doc.documentElement;
	const result = new mxPoint();
	let fixed = false;
	while (node != null && node != b && node != d) {
		if (!isNaN(node.scrollLeft) && !isNaN(node.scrollTop)) {
			result.x += node.scrollLeft;
			result.y += node.scrollTop;
		}
		const style = mxUtils.getCurrentStyle(node);
		if (style != null) {
			fixed = fixed || style.position == 'fixed';
		}
		node = includeAncestors ? node.parentNode : null;
	}
	if (!fixed && includeDocument) {
		const origin = mxUtils.getDocumentScrollOrigin(doc);
		result.x += origin.x;
		result.y += origin.y;
	}
	return result;
};

mxSvgCanvas2D.prototype.createClip = function (x2, y2, w3, h3) {
	x2 = Math.round(x2);
	y2 = Math.round(y2);
	w3 = Math.round(w3);
	h3 = Math.round(h3);
	const id = 'mx-clip-' + x2 + '-' + y2 + '-' + w3 + '-' + h3;
	let counter = 0;
	let tmp = id + '-' + counter;
	while (document.getElementById(tmp) != null) {
		tmp = id + '-' + ++counter;
	}
	const clip = this.createElement('clipPath');
	clip.setAttribute('id', tmp);
	const rect = this.createElement('rect');
	rect.setAttribute('x', x2.toString());
	rect.setAttribute('y', y2.toString());
	rect.setAttribute('width', w3.toString());
	rect.setAttribute('height', h3.toString());
	clip.appendChild(rect);
	return clip;
};

mxPopupMenu.prototype.createSubmenu = function (parent) {
	parent.table = document.createElement('table');
	parent.table.className = 'mxPopupMenu';
	parent.tbody = document.createElement('tbody');
	parent.table.appendChild(parent.tbody);
	parent.div = document.createElement('div');
	parent.div.className = 'mxPopupMenu';
	parent.div.style.position = 'absolute';
	parent.div.style.display = 'inline';
	parent.div.style.zIndex = this.zIndex.toString();
	parent.div.appendChild(parent.table);
	const img = document.createElement('img');
	img.setAttribute('src', this.submenuImage);
	const td = parent.firstChild.nextSibling.nextSibling;
	td.appendChild(img);
};

mxUtils.showElement = function (element, clz) {
	mxUtils.removeStyleClass(element, 'rcui-hide');
};
mxUtils.hideElement = function (element, clz) {
	mxUtils.addStyleClass(element, 'rcui-hide');
};

mxUtils.showOrHideElement = function (element, isShow) {
	if(isShow) {
		mxUtils.showElement(element)
	} else {
		mxUtils.hideElement(element);
	}
};
mxUtils.addStyleClass = function (element, clz) {
	if (element && clz){
		let oldClz = element.className;
		if(mxUtils.isNotNullOrUndefined(oldClz)){
			oldClz = oldClz.split(' ');
			if(oldClz.indexOf(clz) < 0){
				oldClz.push(clz);
				element.className = oldClz.join(' ');
			}
		}else{
			element.className = clz;
		}
	}
};
mxUtils.removeStyleClass = function (element, clz) {
	if (element && clz){
		let oldClz = element.className;
		if(mxUtils.isNotNullOrUndefined(oldClz)){
			oldClz = oldClz.split(' ');
			let i = -1;
			if((i = oldClz.indexOf(clz)) > -1){
				oldClz.splice(i, 1);
				element.className = oldClz.join(' ');
			}
		}
	}
};
mxUtils.hasStyleClass = function (element, clz) {
	if (element && clz){
		let oldClz = element.className;
		if(mxUtils.isNotNullOrUndefined(oldClz)){
			oldClz = oldClz.split(' ');
			return oldClz.indexOf(clz) > -1;
		}
	}
	return false;
};

mxUtils.cssForFontStyle = function (fontStyle) {
    if(1 == fontStyle){
        return  'font-weight:bold;font-style:normal;text-decoration:normal;';
    }
    if(2 == fontStyle){
        return 'font-weight:normal;font-style:italic;text-decoration:normal;';
    }
    if(3 == fontStyle){
        return 'font-weight:bold;font-style:italic;text-decoration:normal;';
    }
    if(4 == fontStyle){
        return 'font-weight:normal;font-style:normal;text-decoration:underline;';
    }
    if(5 == fontStyle){
        return 'font-weight:bold;font-style:normal;text-decoration:underline;';
    }
    if(6 == fontStyle){
        return 'font-weight:normal;font-style:italic;text-decoration:underline;';
    }
    if(7 == fontStyle){
        return 'font-weight:bold;font-style:italic;text-decoration:underline;';
    }
    return '';
};