/* eslint-disable */

export default usrUtils;

function usrUtils() {}

usrUtils.parseHtmlStr = function (htmlStr) {
	if (htmlStr && usrUtils.isString(htmlStr)) {
		-1 == htmlStr.indexOf('<') && (htmlStr = '<div>' + htmlStr + '</div>');
		var div = document.createElement('div');
		return (div.innerHTML = htmlStr), div.childNodes[0];
	}
	return null;
};
usrUtils.isString = function (str) {
	return 'string' == typeof str;
};
usrUtils.parseStyleStr = function (oneCell) {
	for (var result = {}, styles = oneCell.getStyle().split(';'), i = 0; i < styles.length; i++) {
		var style = styles[i];
		if (style.indexOf('=') > -1 && -1 === style.indexOf('eventValues')) result[(arr = style.split('='))[0]] = arr[1];
		else if (style.indexOf('=') > -1 && style.indexOf('eventValues') > -1) {
			var arr;
			result[(arr = style.split('eventValues='))[0]] = arr[1];
		} else result[style] = !0;
	}
	return result;
};
usrUtils.valueBetween = function (value, min, max) {
	return (value = parseFloat(value)), (min = parseFloat(min)), (max = parseFloat(max)), value >= min && value < max;
};
usrUtils.getCookie = function (c_name) {
	var c_start = '';
	var c_end = '';
	return document.cookie.length > 0 && ((c_start = document.cookie.indexOf(c_name + '=')), -1 != c_start) ? ((c_start = c_start + c_name.length + 1), (c_end = document.cookie.indexOf(';', c_start)), -1 == c_end && (c_end = document.cookie.length), unescape(decodeURI(document.cookie.substring(c_start, c_end)))) : '';
};
usrUtils.setCookie = function (name, value) {
	var exp = new Date();
	exp.setTime(exp.getTime() + 2592e6), (document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString() + '; path=/');
};
usrUtils.isNumber = function (val) {
	return !(!/^\d+(\.\d+)?$/.test(val) && !/^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/.test(val));
};
usrUtils.moneyLt = function (number1, number2) {
	return 1e3 * parseFloat(number1) > 1e3 * parseFloat(number2);
};
usrUtils.cssForFontStyle = function (fontStyle) {
	return 1 == fontStyle ? (fontStyle = 'font-weight:bold;font-style:normal;text-decoration:normal;') : 2 == fontStyle ? (fontStyle = 'font-weight:normal;font-style:italic;text-decoration:normal;') : 3 == fontStyle ? (fontStyle = 'font-weight:bold;font-style:italic;text-decoration:normal;') : 4 == fontStyle ? (fontStyle = 'font-weight:normal;font-style:normal;text-decoration:underline;') : 5 == fontStyle ? (fontStyle = 'font-weight:bold;font-style:normal;text-decoration:underline;') : 6 == fontStyle ? (fontStyle = 'font-weight:normal;font-style:italic;text-decoration:underline;') : 7 == fontStyle && (fontStyle = 'font-weight:bold;font-style:italic;text-decoration:underline;'), fontStyle;
};
var handleIntroIndex = 0;
usrUtils.handleIntro = function (type, dom) {
	'toolbarContainer' == type ? (dom.setAttribute('data-step', '' + ++handleIntroIndex), dom.setAttribute('data-intro', mxResources.get('AreaEntireDditor'))) : 'UsrPageDditor' == type ? (dom.setAttribute('data-step', '' + ++handleIntroIndex), dom.setAttribute('data-intro', mxResources.get('UsrPageDditor'))) : 'ComponentLibraryDditor' == type ? (dom.setAttribute('data-step', '' + ++handleIntroIndex), dom.setAttribute('data-intro', mxResources.get('ComponentLibraryDditor'))) : 'GalleryLibraryDditor' == type ? (dom.setAttribute('data-step', '' + ++handleIntroIndex), dom.setAttribute('data-intro', mxResources.get('GalleryLibraryDditor'))) : 'CanvasDditor' == type ? (dom.setAttribute('data-step', '' + ++handleIntroIndex), dom.setAttribute('data-intro', mxResources.get('CanvasDditor'))) : 'ConfigurationDditor' == type && (dom.setAttribute('data-step', '' + ++handleIntroIndex), dom.setAttribute('data-intro', mxResources.get('ConfigurationDditor')));
};
usrUtils.isTestEnv = function () {
	return location.host.indexOf('192.168') > -1 || location.host.indexOf('127.0.0.1') > -1 || location.host.indexOf('localhost') > -1;
};
usrUtils.isEnv_guangdalianhe = function () {
	return location.host.indexOf('guangdalianhe.cn') > -1;
};
usrUtils.isEnv_zboxes = function () {
	return location.host.indexOf('zboxes.cn') > -1;
};
usrUtils.isEnv_shengdajieshui = function () {
	return location.host.indexOf('sdjieshui.cn') > -1 || location.host.indexOf('192.168.0.31') > -1;
};
usrUtils.isEnv_mengte = function () {
	return location.host.indexOf('mcc.i-munters') > -1;
};
usrUtils.isEnv_gantianlin = function () {
	return location.host.indexOf('gantianlin') > -1 || location.host.indexOf('ryy.lztlkj.') > -1;
};
usrUtils.isEnv_taihuwater = function () {
	return location.host.indexOf('taihuwater') > -1 || location.host.indexOf('47.103.38.240') > -1 || location.host.indexOf('153.35.131.238') > -1;
};
usrUtils.isEnv_luhong = function () {
	return location.host.indexOf('luhong') > -1 || location.host.indexOf('47.103.38.240') > -1;
};
usrUtils.secret_Key = function (str, pwd, type) {
	var b = Base64;
	if ('encryption' == type) {
		str = b.encode(str);
		for (var prand = '', i = 0; i < pwd.length; i++) prand += pwd.charCodeAt(i).toString();
		var sPos = Math.floor(prand.length / 5),
			mult = parseInt(prand.charAt(sPos) + prand.charAt(2 * sPos) + prand.charAt(3 * sPos) + prand.charAt(4 * sPos) + prand.charAt(5 * sPos)),
			incr = Math.ceil(pwd.length / 2),
			modu = Math.pow(2, 31) - 1;
		if (mult < 2) return alert('Please choose a more complex or longer password.'), null;
		for (prand += salt = 27372303; prand.length > 10; ) prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
		prand = (mult * prand + incr) % modu;
		var enc_chr = '',
			enc_str = '';
		for (i = 0; i < str.length; i++) (enc_str += (enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255))) < 16 ? '0' + enc_chr.toString(16) : enc_chr.toString(16)), (prand = (mult * prand + incr) % modu);
		for (salt = salt.toString(16); salt.length < 8; ) salt = '0' + salt;
		return (enc_str += salt);
	}
	if ('decryption' == type) {
		for (prand = '', i = 0; i < pwd.length; i++) prand += pwd.charCodeAt(i).toString();
		(sPos = Math.floor(prand.length / 5)), (mult = parseInt(prand.charAt(sPos) + prand.charAt(2 * sPos) + prand.charAt(3 * sPos) + prand.charAt(4 * sPos) + prand.charAt(5 * sPos))), (incr = Math.round(pwd.length / 2)), (modu = Math.pow(2, 31) - 1);
		var salt = parseInt(str.substring(str.length - 8, str.length), 16);
		for (str = str.substring(0, str.length - 8), prand += salt; prand.length > 10; ) prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
		prand = (mult * prand + incr) % modu;
		for (enc_chr = '', enc_str = '', i = 0; i < str.length; i += 2) (enc_chr = parseInt(parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255))), (enc_str += String.fromCharCode(enc_chr)), (prand = (mult * prand + incr) % modu);
		return b.decode(enc_str);
	}
};
usrUtils.deteleObject = function (obj) {
	for (var uniques = [], stringify = {}, i = 0; i < obj.length; i++) {
		var keys = Object.keys(obj[i]);
		keys.sort(function (a, b) {
			return Number(a) - Number(b);
		});
		for (var str = '', j = 0; j < keys.length; j++) (str += JSON.stringify(keys[j])), (str += JSON.stringify(obj[i][keys[j]]));
		stringify.hasOwnProperty(str) || (uniques.push(obj[i]), (stringify[str] = !0));
	}
	return uniques;
};
usrUtils.timestampToTime = function (timestamp) {
	var date = new Date(1e3 * timestamp);
	return date.getFullYear() + '-' + ((date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-') + ((date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ') + ((date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':') + ((date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':') + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
};
usrUtils.openLink = function (link, target) {
	target = target || '_blank';
	var a = document.createElement('a');
	(a.href = link), (a.style.display = 'none'), (a.target = target), document.body.appendChild(a), a.click(), document.body.removeChild(a);
};
usrUtils.is360Browser = function () {
	var is360 = !1,
		isIE = !1;
	return -1 != window.navigator.appName.indexOf('Microsoft') && (isIE = !0), isIE && window.navigator.userProfile + '' == 'null' && (is360 = !0), is360;
};
usrUtils.reviseInternationalTime = function (time, dataType) {
	dataType || (dataType = 'YYYY-MM-DD HH:mm:ss');
	var EnCountry = 'Asia/Shanghai';
	if (usrUtils.getCookie('Admin-UserInfo')) {
		var UserInfo = JSON.parse(usrUtils.getCookie('Admin-UserInfo'));
		UserInfo.timeZone && (EnCountry = UserInfo.timeZone.enCountry || 'Asia/Shanghai');
	}
	var zone = EnCountry;
	if (/^\d+$/gi.test(time)) return moment.tz(time, zone).format(dataType);
	var east8Stamp = moment.tz(time, 'Asia/Shanghai').valueOf();
	return moment.tz(east8Stamp, zone).format(dataType);
};
usrUtils.postInternationalTime = function (time) {
	var EnCountry = 'Asia/Shanghai';
	if (usrUtils.getCookie('Admin-UserInfo')) {
		var UserInfo = JSON.parse(usrUtils.getCookie('Admin-UserInfo'));
		UserInfo.timeZone && (EnCountry = UserInfo.timeZone.enCountry || 'Asia/Shanghai');
	}
	var zone = EnCountry,
		zoneRegTime = moment(time).format('YYYY-MM-DD HH:mm:ss');
	return moment.tz(zoneRegTime, zone).valueOf();
};
usrUtils.ChangeImgAddress = function (imgAddr, directory) {
	return directory || (directory = '/uploads/'), imgAddr ? (/(http|https):\/\/([\w.]+\/?)\S*/.test(imgAddr) ? imgAddr : 'https://ruochen.com' + directory + imgAddr) : imgAddr;
};
usrUtils.createPanelDiv = function (div, name, outerDiv, btn) {
	(div.style.padding = '0'), (div.style.border = 'none'), (outerDiv.style.width = '100%'), (outerDiv.style.lineHeight = '30px'), (outerDiv.style.padding = '10px 10px 0px 10px'), mxUtils.write(outerDiv, name), (outerDiv.style.fontSize = '14px'), (outerDiv.style.color = '#1E2426'), (outerDiv.style.fontWeight = '600'), (outerDiv.style.backgroundColor = '#ffffff');
	var buttons = document.createElement('div');
	(buttons.style.cssFloat = 'right'), (buttons.style.marginRight = '10px'), (btn.className = 'public_btn'), buttons.appendChild(btn), outerDiv.appendChild(buttons), div.appendChild(outerDiv);
};
usrUtils.getDataLength = function (data) {
	for (var intLength = 0, i = 0; i < data.length; i++) data.charCodeAt(i) < 0 || data.charCodeAt(i) > 255 ? (intLength += 2) : (intLength += 1);
	return intLength;
};
usrUtils.trim = function (str) {
	return str.replace(/(^\s*)|(\s*$)/g, '');
};
usrUtils.isEmpty = function (str) {
	return void 0 === str || null == str || '' == usrUtils.trim(str);
};
usrUtils.color16 = function () {
	var r = Math.floor(256 * Math.random()),
		g = Math.floor(256 * Math.random()),
		b = Math.floor(256 * Math.random());
	return '#' + r.toString(16) + g.toString(16) + b.toString(16);
};
usrUtils.colorRgb = function () {
	return '(' + Math.floor(256 * Math.random()) + ',' + Math.floor(256 * Math.random()) + ',' + Math.floor(256 * Math.random()) + ')';
};
usrUtils.isNumber = function (value) {
	if (void 0 === value || null === value || '' === value) return !1;
	if ('string' == typeof value) {
		return /^\d+$/.test(value) || /^-\d+$/.test(value) || /^[1-9]\d*[.]\d+$/.test(value) || /^0[.]\d+$/.test(value) || /^-[1-9]\d*[.]\d+$/.test(value) || /^-0[.]\d+$/.test(value);
	}
	return 'number' == typeof value;
};
usrUtils.judgeAppleX = function () {
	var isAppX = !0;
	/iPhone|iPod/i.test(navigator.userAgent) || (isAppX = !1);
	var events = navigator.userAgent;
	return /iPhone|iPod/i.test(events) && (isAppX = (736 != screen.height || 414 != screen.width) && (667 != screen.height || 375 != screen.width) && (568 != screen.height || 320 != screen.width)), isAppX;
};
usrUtils.getImageType = function (dataurl) {
	return dataurl.split(',')[0].match(/:(.*?);/)[1];
};
usrUtils.dataURItoBlob = function (dataurl, filename) {
	for (var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n); n--; ) u8arr[n] = bstr.charCodeAt(n);
	return new File([u8arr], filename, {
		type: mime,
	});
};
usrUtils.blobToFile = function (theBlob, fileName) {
	return (theBlob.lastModifiedDate = new Date()), (theBlob.name = fileName), theBlob;
};
usrUtils.jssdkError = function (error) {
	return 1 == error ? mxResources.get('NoResponseFromSlave') : 2 == error ? mxResources.get('TheSlaveMachineGaveErrorReply') : 3 == error ? mxResources.get('UnableConnect') : 4 == error ? mxResources.get('WithoutKey') : 5 == error ? mxResources.get('InvalidNumber') : 6 == error ? mxResources.get('NegativeInvalidNumber') : 7 == error ? mxResources.get('Infinity') : 8 == error ? mxResources.get('NegativeInfinity') : 20 == error ? mxResources.get('CRCCheckFailure') : 21 == error ? mxResources.get('ModbusExceptionResponseCode') : 22 == error ? mxResources.get('IllegalDataValue') : 23 == error ? mxResources.get('SlaveDeviceFailure') : 24 == error ? mxResources.get('SlaveDeviceIsBusy') : null;
};
usrUtils.modelMatching = function (isOpenAdapter) {
	isOpenAdapter ? /iPhone|iPod|Android|webOS|BlackBerry/i.test(navigator.userAgent) && $("meta[name='viewport']").attr('content', 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1') : /iPhone|iPod|Android|webOS|BlackBerry/i.test(navigator.userAgent) && $("meta[name='viewport']").attr('content', 'width=device-width, initial-scale=1.0, maximum-scale=100.0, user-scalable=yes');
};
usrUtils.apiCache = function (name) {
	return localStorage.getItem(name) ? JSON.parse(localStorage.getItem(name)) : null;
};
usrUtils.removeLoaclStorage = function (name, time) {
	window[name + '_interval'] = window.setInterval(function () {
		localStorage.removeItem(name), window.clearInterval(name + '_interval');
	}, 12e4);
};
usrUtils.changeRatio = function () {
	var ratio = 0,
		screen = window.screen,
		ua = navigator.userAgent.toLowerCase();
	return void 0 !== window.devicePixelRatio ? (ratio = window.devicePixelRatio) : ~ua.indexOf('msie') ? screen.deviceXDPI && screen.logicalXDPI && (ratio = screen.deviceXDPI / screen.logicalXDPI) : void 0 !== window.outerWidth && void 0 !== window.innerWidth && (ratio = window.outerWidth / window.innerWidth), ratio;
};
usrUtils.isExactNumber = function (val) {
	return /^(0|(-?([1-9]+\d*|[1-9]+\d*\.\d+|0\.\d+)))$/.test(val);
};
usrUtils.isDecimalNumber = function (val) {
	return /^(-?([1-9]+\d*\.\d+|0\.\d+))$/.test(val);
};
usrUtils.isLegalRangeByDataType = function (val, type, dataType) {
	var isNumber = this.isExactNumber(val),
		isDecimalNumberRes = this.isDecimalNumber(val);
	if ('1' == dataType) return 0 == val || 1 == val;
	if ('4' == dataType) return (val = val.replace(/[^\x00-\xff]/g, 'xx')).length <= 256;
	if ('ushort' === type) return val <= 65535 && val >= 0 && isNumber && !isDecimalNumberRes;
	if ('short' === type) return val <= 32767 && val >= -32767 && isNumber && !isDecimalNumberRes;
	if ('16bcd' === type) return val <= 9999 && val >= 0 && isNumber && !isDecimalNumberRes;
	if (['ulong', 'ulong-ABCD', 'ulong-CDAB', 'ulong-DCBA'].includes(type)) return val <= 4294967295 && val >= 0 && isNumber && !isDecimalNumberRes;
	if (['long', 'long-ABCD', 'long-CDAB', 'long-DCBA'].includes(type)) return val <= 2147483647 && val >= -2147483648 && isNumber && !isDecimalNumberRes;
	if ('32bcd' === type) return val <= 99999999 && val >= 0 && isNumber && !isDecimalNumberRes;
	if (['float', 'float-ABCD', 'float-DCBA', 'float-CDAB'].includes(type)) {
		var isLessEqual = new _big2.default(val).lte(new _big2.default(3.4028234663852886e38)),
			isGreaterEqual = new _big2.default(val).gte(new _big2.default(-3.4028234663852886e38));
		return isLessEqual && isGreaterEqual && isNumber;
	}
	if (['double', 'double-CDAB'].includes(type)) {
		var _isLessEqual = new _big2.default(val).lte(new _big2.default(1.79e308)),
			_isGreaterEqual = new _big2.default(val).gte(new _big2.default(-1.79e308));
		return _isLessEqual && _isGreaterEqual && isNumber;
	}
	return !0;
};
usrUtils.updataCellCursor = function (oneCell) {
	var thisG = document.getElementById(oneCell.getId());
	thisG.style.cursor = 'pointer';
	var thisGofSon = thisG.nextSibling;
	if (thisGofSon && !thisGofSon.getAttribute('id')) {
		var thisGofDiv = thisGofSon.querySelector('div');
		thisGofDiv && (thisGofDiv.style.cursor = 'pointer');
	}
};
usrUtils.createShapeHtml = function (style, width, height) {
	var cells = [new mxCell('', new mxGeometry(0, 0, width, height), style)];
	(cells[0].vertex = !0), (window.cellToHtml.graph.labelsVisible = !1);
	var fo = mxClient.NO_FO;
	(mxClient.NO_FO = Editor.prototype.originalNoForeignObject), window.cellToHtml.graph.view.scaleAndTranslate(1, 0, 0), window.cellToHtml.graph.addCells(cells);
	var bounds = window.cellToHtml.graph.getGraphBounds(),
		s = Math.floor(100 * Math.min(width / bounds.width, height / bounds.height)) / 100;
	window.cellToHtml.graph.view.scaleAndTranslate(s, Math.floor((width - bounds.width * s) / 2 / s - bounds.x), Math.floor((height - bounds.height * s) / 2 / s - bounds.y));
	var node = null;
	return window.cellToHtml.graph.dialect != mxConstants.DIALECT_SVG || mxClient.NO_FO ? (((node = window.cellToHtml.graph.container.cloneNode(!1)).innerHTML = window.cellToHtml.graph.container.innerHTML), (mxClient.IS_QUIRKS || 8 == document.documentMode) && (node.firstChild.style.overflow = 'visible')) : (node = window.cellToHtml.graph.view.getCanvas().ownerSVGElement.cloneNode(!0)), window.cellToHtml.graph.getModel().clear(), (mxClient.NO_FO = fo), node;
};
usrUtils.getDefaultQueryCycle = function () {
	return [
		{
			value: '1',
			type: 'hs',
			title: '15' + mxResources.get('minute'),
		},
		{
			value: '2',
			type: 'hs',
			title: '30' + mxResources.get('minute'),
		},
		{
			value: '3',
			type: 'hs',
			title: '1' + mxResources.get('hours'),
		},
		{
			value: '4',
			type: 'hs',
			title: '6' + mxResources.get('hours'),
		},
		{
			value: '5',
			type: 'hs',
			title: '12' + mxResources.get('hours'),
		},
		{
			value: '6',
			type: 'hs',
			title: '1' + mxResources.get('days'),
		},
		{
			value: '7',
			type: 'hs',
			title: '2' + mxResources.get('days'),
		},
		{
			value: '8',
			type: 'hs',
			title: '3' + mxResources.get('days'),
		},
	];
};
usrUtils.timeDataConfigTable = function (selectionCell) {
	return [
		{
			name: mxResources.get('Number'),
			id: 'Number',
			column: 'index',
			class: 'index',
			value: selectionCell.getAttribute('tdNumberRename') || '',
			isVisible: selectionCell.getAttribute('tdNumberVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('Device'),
			id: 'Equipment',
			column: 'record.devName',
			class: 'devName',
			value: selectionCell.getAttribute('tdEquipmentRename') || '',
			isVisible: selectionCell.getAttribute('tdEquipmentVisible') || !0,
			type: '1',
		},
		{
			name: mxResources.get('ProductsScenario'),
			id: 'ProductsScenario',
			column: 'record.sceneName',
			class: 'sceneName',
			value: selectionCell.getAttribute('tdProductsScenarioRename') || '',
			isVisible: selectionCell.getAttribute('tdProductsScenarioVisible') || !0,
			type: '2',
		},
		{
			name: mxResources.get('Slave'),
			id: 'Slave',
			column: 'record.slaveName',
			class: 'slaveName',
			value: selectionCell.getAttribute('tdSlaveRename') || '',
			isVisible: selectionCell.getAttribute('tdSlaveVisible') || !0,
			type: '1',
		},
		{
			name: mxResources.get('DataSources'),
			id: 'DataSource',
			column: 'record.dataSourceName',
			class: 'dataSourceName',
			value: selectionCell.getAttribute('tdDataSourceRename') || '',
			isVisible: selectionCell.getAttribute('tdDataSourceVisible') || !0,
			type: '2',
		},
		{
			name: mxResources.get('DataPoint'),
			id: 'DataPoint',
			column: 'record.dataName',
			class: 'dataName',
			value: selectionCell.getAttribute('tdDataPointRename') || '',
			isVisible: selectionCell.getAttribute('tdDataPointVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('UpdateTime'),
			id: 'UpdateTime',
			column: 'record.dataTime',
			class: 'dataTime',
			value: selectionCell.getAttribute('tdUpdateTimeRename') || '',
			isVisible: selectionCell.getAttribute('tdUpdateTimeVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('CurrentValue'),
			id: 'CurrentValue',
			column: 'record.value',
			class: 'value',
			value: selectionCell.getAttribute('tdCurrentValueRename') || '',
			isVisible: selectionCell.getAttribute('tdCurrentValueVisible') || !0,
			type: '0',
		},
	];
};
usrUtils.alarmConfigTable = function (selectionCell) {
	return [
		{
			name: mxResources.get('Number'),
			id: 'Number',
			column: 'index',
			value: selectionCell.getAttribute('tdNumberRename') || '',
			isVisible: selectionCell.getAttribute('tdNumberVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('Device'),
			id: 'Equipment',
			column: 'record.devName',
			value: selectionCell.getAttribute('tdEquipmentRename') || '',
			isVisible: selectionCell.getAttribute('tdEquipmentVisible') || !0,
			type: '1',
		},
		{
			name: mxResources.get('ProductsScenario'),
			id: 'ProductsScenario',
			column: 'record.sceneName',
			class: 'sceneName',
			value: selectionCell.getAttribute('tdProductsScenarioRename') || '',
			isVisible: selectionCell.getAttribute('tdProductsScenarioVisible') || !0,
			type: '2',
		},
		{
			name: mxResources.get('Slave'),
			id: 'Slave',
			column: 'record.slaveName',
			value: selectionCell.getAttribute('tdSlaveRename') || '',
			isVisible: selectionCell.getAttribute('tdSlaveVisible') || !0,
			type: '1',
		},
		{
			name: mxResources.get('DataSources'),
			id: 'DataSource',
			column: 'record.dataSourceName',
			class: 'dataSourceName',
			value: selectionCell.getAttribute('tdDataSourceRename') || '',
			isVisible: selectionCell.getAttribute('tdDataSourceVisible') || !0,
			type: '2',
		},
		{
			name: mxResources.get('DataPoint'),
			id: 'DataPoint',
			column: 'record.dataName',
			value: selectionCell.getAttribute('tdDataPointRename') || '',
			isVisible: selectionCell.getAttribute('tdDataPointVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('AlarmValue'),
			id: 'AlarmValue',
			column: 'record.alarmValue',
			value: selectionCell.getAttribute('tdAlarmValueRename') || '',
			isVisible: selectionCell.getAttribute('tdAlarmValueVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('AlarmContent'),
			id: 'AlarmContent',
			column: 'record.content',
			value: selectionCell.getAttribute('tdAlarmContentRename') || '',
			isVisible: selectionCell.getAttribute('tdAlarmContentVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('AlarmTime'),
			id: 'AlarmTime',
			column: 'record._alarmTime',
			value: selectionCell.getAttribute('tdAlarmTimeRename') || '',
			isVisible: selectionCell.getAttribute('tdAlarmTimeVisible') || !0,
			type: '0',
		},
	];
};
usrUtils.alarmConfigTimeTable = function (selectionCell) {
	return [
		{
			name: mxResources.get('Number'),
			id: 'Number',
			column: 'index',
			value: selectionCell.getAttribute('tdNumberRename') || '',
			isVisible: selectionCell.getAttribute('tdNumberVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('Device'),
			id: 'Equipment',
			column: 'record.devName',
			value: selectionCell.getAttribute('tdEquipmentRename') || '',
			isVisible: selectionCell.getAttribute('tdEquipmentVisible') || !0,
			type: '1',
		},
		{
			name: mxResources.get('ProductsScenario'),
			id: 'ProductsScenario',
			column: 'record.sceneName',
			class: 'sceneName',
			value: selectionCell.getAttribute('tdProductsScenarioRename') || '',
			isVisible: selectionCell.getAttribute('tdProductsScenarioVisible') || !0,
			type: '2',
		},
		{
			name: mxResources.get('Slave'),
			id: 'Slave',
			column: 'record.slaveName',
			value: selectionCell.getAttribute('tdSlaveRename') || '',
			isVisible: selectionCell.getAttribute('tdSlaveVisible') || !0,
			type: '1',
		},
		{
			name: mxResources.get('DataSources'),
			id: 'DataSource',
			column: 'record.dataSourceName',
			class: 'dataSourceName',
			value: selectionCell.getAttribute('tdDataSourceRename') || '',
			isVisible: selectionCell.getAttribute('tdDataSourceVisible') || !0,
			type: '2',
		},
		{
			name: mxResources.get('DataPoint'),
			id: 'DataPoint',
			column: 'record.dataName',
			value: selectionCell.getAttribute('tdDataPointRename') || '',
			isVisible: selectionCell.getAttribute('tdDataPointVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('AlarmValue'),
			id: 'AlarmValue',
			column: 'record.value',
			value: selectionCell.getAttribute('tdAlarmValueRename') || '',
			isVisible: selectionCell.getAttribute('tdAlarmValueVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('AlarmContent'),
			id: 'AlarmContent',
			column: 'record.content',
			value: selectionCell.getAttribute('tdAlarmContentRename') || '',
			isVisible: selectionCell.getAttribute('tdAlarmContentVisible') || !0,
			type: '0',
		},
		{
			name: mxResources.get('AlarmTime'),
			id: 'AlarmTime',
			column: 'record._alarmTime',
			value: selectionCell.getAttribute('tdAlarmTimeRename') || '',
			isVisible: selectionCell.getAttribute('tdAlarmTimeVisible') || !0,
			type: '0',
		},
	];
};
usrUtils.compareTimeData = function (d1, d2) {
	return new Date(d1.replace(/-/g, '/')) > new Date(d2.replace(/-/g, '/'));
};
usrUtils.calculateTime = function (d1, d2) {
	var day1 = new Date(d1);
	return (new Date(d2) - day1) / 864e5;
};
