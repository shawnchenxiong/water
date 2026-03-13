/* eslint-disable */

import { mxConstants, mxResources, mxEventObject, mxEvent, mxUtils, mxDictionary, mxClient, mxRectangle, mxPopupMenu, mxPoint, mxKeyHandler, mxGraphModel, mxImage, mxOutline, mxClipboard, mxStackLayout, mxEventSource, mxObjectCodec, mxObjectIdentity, mxCodecRegistry, mxMorphing } from '../../core/mxgraph';
import { EditorUi, ChangePageSetup } from '../EditorUi';
import { Graph } from '../Graph';
import { Editor } from '../Editor';

export { DiagramPage, RenamePage, MovePage, SelectPage, ChangePage,ReplaceDiagram };

function DiagramPage(node, id) {
	this.node = node;

	if (id != null) {
		this.node.setAttribute('id', id);
	} else if (this.getId() == null) {
		this.node.setAttribute('id', Editor.guid());
	}
}

DiagramPage.prototype.node = null;

DiagramPage.prototype.root = null;

DiagramPage.prototype.viewState = null;

DiagramPage.prototype.getId = function () {
	let id = this.node.getAttribute('id');
	if(!id){
		id = this.node.getAttribute('pageid');
		if(id) {
			this.node.setAttribute('id', id);
		}
	}
	return id;
};

DiagramPage.prototype.getName = function () {
	let name = this.node.getAttribute('name');
	if(!name){
		name = this.node.getAttribute('pagename');
		if(name) {
			this.node.setAttribute('name', name);
		}
	}
	return name;
};

DiagramPage.prototype.setName = function (value) {
	if (value == null) {
		this.node.removeAttribute('name');
	} else {
		this.node.setAttribute('name', value);
	}
};


DiagramPage.prototype.getBackgroundImage = function () {
	return this.node.getAttribute('backgroundimage');
};

DiagramPage.prototype.setBackgroundImage = function (value) {
	if (value == null) {
		this.node.removeAttribute('backgroundimage');
	} else {
		this.node.setAttribute('backgroundimage', value);
	}
};
DiagramPage.prototype.getBackgroundColor = function () {
	return this.node.getAttribute('backgroundcolor');
};

DiagramPage.prototype.setBackgroundColor = function (value) {
	if (value == null) {
		this.node.removeAttribute('backgroundcolor');
	} else {
		this.node.setAttribute('backgroundcolor', value);
	}
};

function RenamePage(ui, page, name) {
	this.editorUi = ui;
	this.page = page;
	this.name = name;
	this.previous = name;
}

RenamePage.prototype.execute = function () {
	var tmp = this.page.getName();
	this.page.setName(this.previous);
	this.name = this.previous;
	this.previous = tmp;

	// Required to update page name in placeholders
	this.editorUi.editor.graph.updatePlaceholders();
	this.editorUi.editor.fireEvent(new mxEventObject('pageRenamed'));
};

function MovePage(ui, oldIndex, newIndex) {
	this.editorUi = ui;
	this.oldIndex = oldIndex;
	this.newIndex = newIndex;
}

MovePage.prototype.execute = function () {
	this.editorUi.pages.splice(this.newIndex, 0, this.editorUi.pages.splice(this.oldIndex, 1)[0]);
	var tmp = this.oldIndex;
	this.oldIndex = this.newIndex;
	this.newIndex = tmp;

	// Required to update page numbers in placeholders
	this.editorUi.editor.graph.updatePlaceholders();
	this.editorUi.editor.fireEvent(new mxEventObject('pageMoved'));
};

function SelectPage(ui, page, viewState) {
	this.editorUi = ui;
	this.page = page;
	this.previousPage = page;
	if (page != null) {
		this.editorUi.updatePageRoot(page);
		if (viewState != null) {
			page.viewState = viewState;
		}
	}
}

SelectPage.prototype.execute = function () {
	var prevIndex = mxUtils.indexOf(this.editorUi.pages, this.previousPage);
	if (this.page != null && prevIndex >= 0) {
		var page = this.editorUi.currentPage;
		var editor = this.editorUi.editor;
		var graph = editor.graph;

		// Stores current diagram state in the page
		var data = Graph.compressNode(editor.getGraphXml(true), true);
		mxUtils.setTextContent(page.node, data);
		page.viewState = graph.getViewState();
		page.root = graph.model.root;

		if (page.model != null) {
			// Updates internal structures of offpage model
			page.model.rootChanged(page.root);
		}

		// Removes the previous cells and clears selection
		graph.view.clear(page.root, true);
		graph.clearSelection();

		// Switches the current page
		this.editorUi.currentPage = this.previousPage;
		this.previousPage = page;
		page = this.editorUi.currentPage;

		// Switches the root cell and sets the view state
		graph.model.prefix = Editor.guid() + '-';
		graph.model.rootChanged(page.root);
		graph.setViewState(page.viewState);

		// Handles grid state in chromeless mode which is stored in Editor instance
		graph.gridEnabled = graph.gridEnabled && !this.editorUi.editor.isChromelessView();

		// Fires events
		editor.graph.fireEvent(new mxEventObject(mxEvent.ROOT));
		editor.fireEvent(new mxEventObject('pageSelected', 'change', this));

	}
};

function ChangePage(ui, page, select, index, noSelect) {
	SelectPage.call(this, ui, select);
	this.relatedPage = page;
	this.index = index;
	this.previousIndex = null;
	this.noSelect = noSelect;
}

mxUtils.extend(ChangePage, SelectPage);

ChangePage.prototype.execute = function () {
	this.editorUi.editor.fireEvent(new mxEventObject('beforePageChange', 'change', this));
	this.previousIndex = this.index;

	if (this.index == null) {
		var tmp = mxUtils.indexOf(this.editorUi.pages, this.relatedPage);
		this.editorUi.pages.splice(tmp, 1);
		this.index = tmp;
	} else {
		this.editorUi.pages.splice(this.index, 0, this.relatedPage);
		this.index = null;
	}

	if (!this.noSelect) {
		SelectPage.prototype.execute.apply(this, arguments);
	}
};

function ReplaceDiagram(ui, data) {
	this.editorUi = ui;
	this.data = data;
}

ReplaceDiagram.prototype.execute = function () {
	var graph = this.editorUi.editor.graph;
	var data = this.editorUi.editor.getGraphXml();

	this.editorUi.editor.readGraphState(this.data);
	this.editorUi.editor.updateGraphComponents();

	var dec = new mxCodec(this.data.ownerDocument);
	var model = new mxGraphModel();
	dec.decode(this.data, model);

	this.data = data;

	if (this.editorUi.currentPage) {
		this.editorUi.currentPage.viewState = graph.getViewState();
		this.editorUi.currentPage.root = model.root;

		if (this.editorUi.currentPage.model != null) {
			// Updates internal structures of offpage model
			this.editorUi.currentPage.model.rootChanged(this.editorUi.currentPage.model.root);
		}
	}

	graph.view.clear(graph.model.root, true);
	graph.model.rootChanged(model.root);
	graph.fireEvent(new mxEventObject(mxEvent.ROOT));
};

//Overrides ChangePageSetup codec to exclude page
(function () {
	var codec = mxCodecRegistry.getCodec(ChangePageSetup);
	codec.exclude.push('page');
})();

//Registers codec for MovePage
(function () {
	var codec = new mxObjectCodec(new MovePage(), ['ui']);

	codec.beforeDecode = function (dec, node, obj) {
		obj.ui = dec.ui;

		return node;
	};

	codec.afterDecode = function (dec, node, obj) {
		var tmp = obj.oldIndex;
		obj.oldIndex = obj.newIndex;
		obj.newIndex = tmp;

		return obj;
	};

	mxCodecRegistry.register(codec);
})();

//Registers codec for RenamePage
(function () {
	var codec = new mxObjectCodec(new RenamePage(), ['ui', 'page']);

	codec.beforeDecode = function (dec, node, obj) {
		obj.ui = dec.ui;

		return node;
	};

	codec.afterDecode = function (dec, node, obj) {
		var tmp = obj.previous;
		obj.previous = obj.name;
		obj.name = tmp;

		return obj;
	};

	mxCodecRegistry.register(codec);
})();

//Registers codec for ChangePage
(function () {
	var codec = new mxObjectCodec(new ChangePage(), ['ui', 'relatedPage', 'index', 'page', 'previousPage']);

	codec.afterEncode = function (enc, obj, node) {
		node.setAttribute('relatedPage', obj.relatedPage.getId());

		if (obj.index == null) {
			node.setAttribute('name', obj.relatedPage.getName());

			if (obj.relatedPage.viewState != null) {
				node.setAttribute(
					'viewState',
					JSON.stringify(obj.relatedPage.viewState, function (key, value) {
						return mxUtils.indexOf(EditorUi.transientViewStateProperties, key) < 0 ? value : undefined;
					})
				);
			}

			if (obj.relatedPage.root != null) {
				enc.encodeCell(obj.relatedPage.root, node);
			}
		}

		return node;
	};

	codec.beforeDecode = function (dec, node, obj) {
		obj.ui = dec.ui;
		obj.relatedPage = obj.ui.getPageById(node.getAttribute('relatedPage'));

		if (obj.relatedPage == null) {
			var temp = node.ownerDocument.createElement('diagram');
			temp.setAttribute('id', node.getAttribute('relatedPage'));
			temp.setAttribute('name', node.getAttribute('name'));
			obj.relatedPage = new DiagramPage(temp);

			var vs = node.getAttribute('viewState');

			if (vs != null) {
				obj.relatedPage.viewState = JSON.parse(vs);
				node.removeAttribute('viewState');
			}

			// Makes sure the original node isn't modified
			node = node.cloneNode(true);
			var tmp = node.firstChild;

			if (tmp != null) {
				obj.relatedPage.root = dec.decodeCell(tmp, false);

				var tmp2 = tmp.nextSibling;
				tmp.parentNode.removeChild(tmp);
				tmp = tmp2;

				while (tmp != null) {
					tmp2 = tmp.nextSibling;

					if (tmp.nodeType == mxConstants.NODETYPE_ELEMENT) {
						// Ignores all existing cells because those do not need to
						// be re-inserted into the model. Since the encoded version
						// of these cells contains the new parent, this would leave
						// to an inconsistent state on the model (ie. a parent
						// change without a call to parentForCellChanged).
						var id = tmp.getAttribute('id');

						if (dec.lookup(id) == null) {
							dec.decodeCell(tmp);
						}
					}

					tmp.parentNode.removeChild(tmp);
					tmp = tmp2;
				}
			}
		}

		return node;
	};

	codec.afterDecode = function (dec, node, obj) {
		obj.index = obj.previousIndex;

		return obj;
	};

	mxCodecRegistry.register(codec);
})();
