/* eslint-disable */
import { mxConstants, mxResources, mxEventObject, mxEvent, mxUtils, mxDictionary, mxClient, mxRectangle, mxPopupMenu, mxPoint, mxKeyHandler, mxGraphModel, mxImage, mxOutline, mxClipboard, mxStackLayout, mxEventSource, mxObjectCodec, mxObjectIdentity, mxCodecRegistry, mxMorphing } from '../core/mxgraph';
import { EditorUi, ChangePageSetup } from './EditorUi';
import { Graph } from './Graph';
import { Editor } from './Editor';

// export { DiagramPage, RenamePage, MovePage, SelectPage, ChangePage };

function DiagramPage(node) {
	this.node = node;
	// console.log('this.node.hasAttribute', this.node.hasAttribute);
	// if ((!this.node.hasAttribute && !this.node.getAttribute('id')) || (this.node.hasAttribute && !this.node.hasAttribute('id'))) {
	// 	this.node.setAttribute('id', Editor.guid());
	// }
}
DiagramPage.prototype.node = null;
DiagramPage.prototype.root = null;
DiagramPage.prototype.viewState = null;
DiagramPage.prototype.getPageId = function () {
	return this.node.getAttribute('pageid');
};
DiagramPage.prototype.setPageId = function (value) {
	null == value ? this.node.removeAttribute('pageid') : this.node.setAttribute('pageid', value);
};

DiagramPage.prototype.getPageName = function () {
	return this.node.getAttribute('pagename');
};
DiagramPage.prototype.setPageName = function (value) {
	null == value ? this.node.removeAttribute('pagename') : this.node.setAttribute('pagename', value);
};

DiagramPage.prototype.getPageType = function () {
	return this.node.getAttribute('pagetype');
};
DiagramPage.prototype.setPageType = function (value) {
	null == value ? this.node.removeAttribute('pagetype') : this.node.setAttribute('pagetype', value);
};
DiagramPage.prototype.getSourceId = function () {
	return this.node.getAttribute('sourceid');
};
DiagramPage.prototype.setSourceId = function (value) {
	null == value ? this.node.removeAttribute('sourceid') : this.node.setAttribute('sourceid', value);
};
DiagramPage.prototype.getTempleteId = function () {
	return this.node.getAttribute('templeteid');
};
DiagramPage.prototype.setTempleteId = function (value) {
	null == value ? this.node.removeAttribute('templeteid') : this.node.setAttribute('templeteid', value);
};
DiagramPage.prototype.getThumbSrc = function () {
	return this.node.getAttribute('thumbsrc');
};
DiagramPage.prototype.setThumbSrc = function (value) {
	null == value ? this.node.removeAttribute('thumbsrc') : this.node.setAttribute('thumbsrc', value);
};


DiagramPage.prototype.getPassword = function () {
	return this.node.getAttribute('password');
};
DiagramPage.prototype.setPassword = function (value) {
	null == value ? this.node.removeAttribute('password') : this.node.setAttribute('password', value);
};

function RenamePage(editorUi, page, name) {
	this.editorUi = editorUi;
	this.page = page;
	this.name = name;
	this.previous = name;
}
RenamePage.prototype.execute = function () {
	var tmp = this.page.getPageName();
	this.page.setPageName(this.previous);
	this.name = this.previous;
	this.previous = tmp;
	this.editorUi.editor.graph.updatePlaceholders();
	this.editorUi.editor.fireEvent(new mxEventObject('pageRenamed'));
};

function SetPasswordPage(editorUi, page, password) {
	var tmp = page.getPassword();
	if ((page.setPassword(password), (this.previous = tmp), (this.password = password), tmp !== password && (ui.editor.setStatus('<div class="geStatusAlert" style="cursor:pointer;overflow:hidden;">' + mxUtils.htmlEntities(mxResources.get('unsavedChangesClickHereToSave')) + '</div>'), null != ui.statusContainer))) {
		var links = editorUi.statusContainer.getElementsByTagName('div');
		links.length > 0 &&
			(clearInterval(window.interval),
			(window.interval = setInterval(function () {
				editorUi.actions.get('save').funct();
			}, 6e5)),
			mxEvent.addListener(
				links[0],
				'click',
				mxUtils.bind(this, function () {
					editorUi.actions.get('save').funct();
				})
			));
	}
}

function MovePage(editorUi, oldIndex, newIndex) {
	(this.editorUi = editorUi), (this.oldIndex = oldIndex), (this.newIndex = newIndex);
}
MovePage.prototype.execute = function () {
	this.editorUi.pages.splice(this.newIndex, 0, this.editorUi.pages.splice(this.oldIndex, 1)[0]);
	var tmp = this.oldIndex;
	(this.oldIndex = this.newIndex), (this.newIndex = tmp), this.editorUi.editor.graph.updatePlaceholders(), this.ui.editor.fireEvent(new mxEventObject('pageMoved'));
};

function SelectPage(editorUi, page) {
	this.editorUi = editorUi;
	this.page = page;
	if (null != page) {
		this.editorUi.updatePageRoot(page);
	}
	this.neverShown = true;
}
SelectPage.prototype.execute = function () {
	let selectIndex = -1;
	if(this.editorUi.pages && this.editorUi.pages.length > 0){
		selectIndex = this.editorUi.pages.map(item => item.getPageId()).indexOf(this.page.getPageId());
	}
	if(selectIndex > -1){
		var editor = this.editorUi.editor;
		var graph = editor.graph;

		if(this.editorUi.currentPage && this.editorUi.currentPage.getPageId()){
			var data = graph.compress(graph.zapGremlins(mxUtils.getXml(editor.getGraphXml(true))));
			mxUtils.setTextContent(this.editorUi.currentPage.node, data);
			this.editorUi.currentPage.viewState = graph.getViewState();
			this.editorUi.currentPage.root = graph.model.root;
		}
		graph.view.clear(graph.model.root, true);
		graph.clearSelection();
		this.editorUi.currentPage = this.page;

		graph.model.rootChanged(this.editorUi.currentPage.root);
		graph.setViewState(this.editorUi.currentPage.viewState);
		editor.fireEvent(new mxEventObject('setViewState', 'change', this));
		graph.gridEnabled = graph.gridEnabled && !editor.isChromelessView();
		editor.updateGraphComponents();
		graph.view.validate();
		graph.sizeDidChange();
		if (this.neverShown) {
			this.neverShown = false;
			graph.selectUnlockedLayer();
		}
		editor.fireEvent(new mxEventObject(mxEvent.ROOT));
		editor.fireEvent(new mxEventObject('pageSelected', 'change', this));

	}
};

function ChangePage(ui, page, select, index) {
	SelectPage.call(this, ui, select);
	this.relatedPage = page;
	this.index = index;
	this.previousIndex = null;
}
mxUtils.extend(ChangePage, SelectPage);

ChangePage.prototype.execute = function () {
	this.editorUi.editor.fireEvent(new mxEventObject('beforePageChange', 'change', this));
	this.previousIndex = this.index;
	if (null == this.index) {
		var tmp = mxUtils.indexOf(this.editorUi.pages, this.relatedPage);
		this.editorUi.pages.splice(tmp, 1);
		this.index = tmp;
	} else {
		this.ui.pages.splice(this.index, 0, this.relatedPage);
		this.index = null;
	}
	SelectPage.prototype.execute.apply(this, arguments);
};

var editorUiRefresh = EditorUi.prototype.refresh;
EditorUi.prototype.refresh = function (sizeDidChange) {
	editorUiRefresh.apply(this, arguments);
	this.updateTabContainer();
};
mxCodecRegistry.getCodec(ChangePageSetup).exclude.push('page');
let codec;
(codec = new mxObjectCodec(new MovePage(), ['ui'])).beforeDecode = function (dec, node, obj) {
	return (obj.ui = dec.ui), node;
};
mxCodecRegistry.register(codec);
(function () {
	var codec = new mxObjectCodec(new RenamePage(), ['ui', 'page']);
	codec.beforeDecode = function (dec, node, obj) {
		console.log(`var codec = new mxObjectCodec(new RenamePage(), ['ui', 'page']);codec.beforeDecode`);
		return (obj.ui = dec.ui), node;
	};
	codec.afterDecode = function (dec, node, obj) {
		console.log(`var codec = new mxObjectCodec(new RenamePage(), ['ui', 'page']);codec.afterDecode`);
		var tmp = obj.previous;
		return (obj.previous = obj.name), (obj.name = tmp), obj;
	};
	mxCodecRegistry.register(codec);
})();
(function () {
	var codec = new mxObjectCodec(new ChangePage(), ['ui', 'relatedPage', 'index', 'neverShown', 'page', 'previousPage']);
	var viewStateIgnored = ['defaultParent', 'currentRoot', 'scrollLeft', 'scrollTop', 'scale', 'translate', 'lastPasteXml', 'pasteCounter'];
	codec.afterEncode = function (enc, obj, node) {
		console.log(`var codec = new mxObjectCodec(new ChangePage(), ['ui', 'page']);codec.afterEncode`);
		node.setAttribute('relatedPage', obj.relatedPage.getId());
		if (null == obj.index) {
			node.setAttribute('name', obj.relatedPage.getName());
			if (null != obj.relatedPage.viewState) {
				node.setAttribute(
					'viewState',
					JSON.stringify(obj.relatedPage.viewState, function (key, value) {
						return mxUtils.indexOf(viewStateIgnored, key) < 0 ? value : void 0;
					})
				);
			}
			if (null != obj.relatedPage.root) {
				enc.encodeCell(obj.relatedPage.root, node);
			}
		}
		return node;
	};
	codec.beforeDecode = function (dec, node, obj) {
		console.log(`var codec = new mxObjectCodec(new ChangePage(), ['ui', 'page']);codec.beforeDecode`);
		obj.ui = dec.ui;
		obj.relatedPage = obj.ui.getPageById(node.getAttribute('relatedPage'));
		if (null == obj.relatedPage) {
			var temp = node.ownerDocument.createElement('diagram');
			temp.setAttribute('id', node.getAttribute('relatedPage'));
			temp.setAttribute('name', node.getAttribute('name'));
			obj.relatedPage = new DiagramPage(temp);
			var vs = node.getAttribute('viewState');
			if (null != vs) {
				obj.relatedPage.viewState = JSON.parse(vs);
				node.removeAttribute('viewState');
			}
			node = node.cloneNode(true);
			var tmp = node.firstChild;
			if (null != tmp) {
				obj.relatedPage.root = dec.decodeCell(tmp, !1);
				var tmp2 = tmp.nextSibling;
				for (tmp.parentNode.removeChild(tmp), tmp = tmp2; null != tmp; ) {
					if (((tmp2 = tmp.nextSibling), tmp.nodeType == mxConstants.NODETYPE_ELEMENT)) {
						var id = tmp.getAttribute('id');
						null == dec.lookup(id) && dec.decodeCell(tmp);
					}
					tmp.parentNode.removeChild(tmp);
					tmp = tmp2;
				}
			}
		}
		return node;
	};
	codec.afterDecode = function (dec, node, obj) {
		console.log(`var codec = new mxObjectCodec(new ChangePage(), ['ui', 'page']);codec.afterDecode`);
		obj.index = obj.previousIndex;
		return obj;
	};
	mxCodecRegistry.register(codec);
})();
