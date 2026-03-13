/* eslint-disable*/
/**
 * 转化为vue
 */
import { mxEventSource, mxResources, mxEventObject, mxEvent, mxUtils, mxClient, mxGraph, mxCodec, mxRectangle, mxDivResizer, mxPopupMenu, mxPoint, mxConstants, mxGraphView, mxMouseEvent, mxPolyline, mxGraphHandler, mxConnectionHandler, mxCellMarker, mxRectangleShape, mxPopupMenuHandler, mxUndoManager } from '../core/mxgraph';

import pako from './utils/pako/pako';

import { EditorUi, ChangePageSetup } from './EditorUi';
import { Graph } from './Graph';
import { noColorImage, moveImage, rowMoveImage, helpImage, checkmarkImage, closeImage, clearImage, lockedImage, unlockedImage, transparentImage } from '../images/base64';

export { Editor, ErrorDialog, Dialog, FilenameDialog, PageSetupDialog };

/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Editor constructor executed on page load.
 */
function Editor(chromeless, themes, model, graph, editable) {
	mxEventSource.call(this);
	this.chromeless = chromeless != null ? chromeless : this.chromeless;
	this.initStencilRegistry();
	this.graph = graph || this.createGraph(themes, model);
	this.graph.isChromeless = chromeless;
	this.editable = editable != null ? editable : !chromeless;
	this.undoManager = this.createUndoManager();
	this.status = '';

	this.getOrCreateFilename = function () {
		return this.filename || mxResources.get('drawing', [Editor.pageCounter]) + '.xml';
	};

	this.getFilename = function () {
		return this.filename;
	};

	// Sets the status and fires a statusChanged event
	this.setStatus = (value) => {
		// + Bind Editor(this)
		this.status = value;
		this.fireEvent(new mxEventObject('statusChanged'));
	};

	// Returns the current status
	this.getStatus = function () {
		return this.status;
	};

	// 如果图形更改则更新修改状态
	this.graphChangeListener = function (sender, eventObject) {
		const edit = eventObject != null ? eventObject.getProperty('edit') : null;

		if (edit == null || !edit.ignoreEdit) {
			this.setModified(true);
		}
	};

	this.graph.getModel().addListener(
		mxEvent.CHANGE,
		mxUtils.bind(this, function () {
			this.graphChangeListener.apply(this, arguments);
		})
	);

	// Sets persistent graph state defaults
	this.graph.resetViewOnRootChange = false;
	this.init();
}

/**
 * Counts open editor tabs (must be global for cross-window access)
 */
Editor.pageCounter = 0;

// Cross-domain window access is not allowed in FF, so if we
// were opened from another domain then this will fail.
(function () {
	try {
		let op = window;

		while (
			op.opener != null &&
			typeof op.opener.Editor !== 'undefined' &&
			!isNaN(op.opener.Editor.pageCounter) &&
			// Workaround for possible infinite loop in FF https://drawio.atlassian.net/browse/DS-795
			op.opener != op
		) {
			op = op.opener;
		}

		// Increments the counter in the first opener in the chain
		if (op != null) {
			op.Editor.pageCounter++;
			Editor.pageCounter = op.Editor.pageCounter;
		}
	} catch (e) {
		// ignore
	}
})();

/**
 * Specifies if local storage should be used (eg. on the iPad which has no filesystem)
 */
Editor.useLocalStorage = typeof Storage != 'undefined' && mxClient.IS_IOS;

/**
 *
 */
Editor.moveImage = moveImage;

/**
 *
 */
Editor.rowMoveImage = rowMoveImage;

/**
 * Images below are for lightbox and embedding toolbars.
 */
Editor.helpImage = helpImage;

/**
 * Sets the default font size.
 */
Editor.checkmarkImage = checkmarkImage;

/**
 * Specifies the image URL to be used for the transparent background.
 */
Editor.ctrlKey = mxClient.IS_MAC ? 'Cmd' : 'Ctrl';

/**
 * Specifies the image URL to be used for the transparent background.
 */
Editor.hintOffset = 20;

/**
 * Specifies if the diagram should be saved automatically if possible. Default
 * is true.
 */
Editor.popupsAllowed = true;

/**
 * Editor inherits from mxEventSource
 */
mxUtils.extend(Editor, mxEventSource);

/**
 * Stores initial state of mxClient.NO_FO.
 */
Editor.prototype.originalNoForeignObject = mxClient.NO_FO;

/**
 * Specifies the image URL to be used for the transparent background.
 */
Editor.prototype.transparentImage = transparentImage;

/**
 * Specifies if the canvas should be extended in all directions. Default is true.
 */
Editor.prototype.extendCanvas = true;

/**
 * Specifies if the app should run in chromeless mode. Default is false.
 * This default is only used if the contructor argument is null.
 */
Editor.prototype.chromeless = false;

/**
 * Specifies the order of OK/Cancel buttons in dialogs. Default is true.
 * Cancel first is used on Macs, Windows/Confluence uses cancel last.
 */
Editor.prototype.cancelFirst = true;

/**
 * Specifies if the editor is enabled. Default is true.
 */
Editor.prototype.enabled = true;

/**
 * Contains the name which was used for the last save. Default value is null.
 */
Editor.prototype.filename = null;

/**
 * Contains the current modified state of the diagram. This is false for
 * new diagrams and after the diagram was saved.
 */
Editor.prototype.modified = false;

/**
 * Specifies if the diagram should be saved automatically if possible. Default
 * is true.
 */
Editor.prototype.autosave = false;

/**
 * Specifies the top spacing for the initial page view. Default is 0.
 */
Editor.prototype.initialTopSpacing = 0;

/**
 * Specifies the app name. Default is document.title.
 */
Editor.prototype.appName = document.title;

/**
 *
 */
Editor.prototype.editBlankUrl = window.location.protocol + '//' + window.location.host + '/';

/**
 * Default value for the graph container overflow style.
 */
Editor.prototype.defaultGraphOverflow = 'hidden';

/**
 * Dynamic change of dark mode for minimal and sketch theme.
 */
Editor.darkColor = Editor.enableCssDarkMode ? '#121212' : '#18141D';

/**
 * Dynamic change of dark mode for minimal and sketch theme.
 */
Editor.lightColor = '#f0f0f0';

/**
 * Definitions for sketch font styles.
 */
Editor.sketchFontFamily = 'Architects Daughter';
Editor.sketchFontSource = 'https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter';
Editor.sketchFonts = [{ fontFamily: Editor.sketchFontFamily, fontUrl: decodeURIComponent(Editor.sketchFontSource) }];
Editor.sketchDefaultCurveFitting = '1';
Editor.sketchDefaultJiggle = '2';

/**
 * Icons for new UI style exported from https://fonts.google.com/icons (FFill: 0 Weight: 300 Grade: 0 Optical size: 48).
 */
Editor.thinCommentImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTEyLjUgMjcuNWgyM3YtMi4yNWgtMjNabTAtNi4zNWgyM3YtMi4zaC0yM1ptMC02LjRoMjNWMTIuNWgtMjNaTTQzIDQyLjEgMzUuOSAzNWgtMjhxLTEuMTUgMC0yLjAyNS0uODc1VDUgMzIuMVY3LjlxMC0xLjE1Ljg3NS0yLjAyNVQ3LjkgNWgzMi4ycTEuMiAwIDIuMDUuODc1UTQzIDYuNzUgNDMgNy45Wk03LjI1IDcuOXYyNC44NUgzNi45bDMuODUgMy44NVY3LjlxMC0uMy0uMTc1LS40NzVUNDAuMSA3LjI1SDcuOXEtLjMgMC0uNDc1LjE3NVQ3LjI1IDcuOVptMCAwdjI4LjdWNy4yNSA3LjlaIi8+PC9zdmc+';
Editor.thinDesignImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0ibTM2LjUgMTguMzUtNi44NS02Ljg1IDMuMjUtMy4ycS44NS0uODUgMi4wMjUtLjg1IDEuMTc1IDAgMi4wMjUuODVsMi43NSAyLjhxLjg1LjguODUgMnQtLjg1IDJaTTYuODUgNDEuMXYtNi45bDkuNTUtOS41NUw1LjUgMTMuN2w3LjgtNy44NSAxMSAxMSA1LjM1LTUuMzUgNi44NSA2Ljg1LTUuMzUgNS4zNSAxMSAxMS03Ljg1IDcuNzUtMTAuOTUtMTAuOS05LjYgOS41NVptMTEuMi0xOC4wNSA0LjY1LTQuNi00LjA1LTQuMDUtMi4zNSAyLjQtMS42LTEuNiAyLjM1LTIuNC0zLjc1LTMuNzUtNC42IDQuNjVabTE2LjIgMTYuMjUgNC42NS00LjY1LTMuNzUtMy43NS0yLjQgMi40LTEuNi0xLjYgMi40LTIuNC00LjA1LTQtNC42IDQuNjVabS0yNS4xLS40NWgzLjZsMjAuNS0yMC40NS0zLjY1LTMuNjVMOS4xNSAzNS4yWiIvPjwvc3ZnPg==';
Editor.thinGestureImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI4IDQxLjZxLTIuNSAwLTQuMDc1LTEuNjUtMS41NzUtMS42NS0xLjU3NS00LjM1IDAtMi4zNSAxLjEtNC4xIDEuMS0xLjc1IDIuODI1LTIuOTUgMS43MjUtMS4yIDMuNy0xLjgyNVQzMy42NSAyNnEtLjE1LTMuMDUtMS4yNS00LjQyNVQyOS4yNSAyMC4ycS0yLjMgMC00LjE3NSAxLjV0LTQuNDI1IDQuOTVxLTIuNjUgMy40NS00LjYgNS4xLTEuOTUgMS42NS00LjM1IDEuNjUtMi4xIDAtMy42NS0xLjM3NVE2LjUgMzAuNjUgNi41IDI3LjQ1cTAtMiAxLjItNC41MjUgMS4yLTIuNTI1IDMuNS02LjE3NSAxLjMtMS44NSAxLjk3NS0zLjIyNXQuNjc1LTIuMzc1cTAtLjctLjM1LTEuMDUtLjM1LS4zNS0xLjA1LS4zNS0uNzUgMC0xLjYuNDc1UTEwIDEwLjcgOSAxMS45TDcgOS44cTEuMzUtMS41NSAyLjcyNS0yLjI3NVExMS4xIDYuOCAxMi41IDYuOHExLjkgMCAzLjEgMS4yNSAxLjIgMS4yNSAxLjIgMy4yIDAgMS44LS45NzUgMy41NzVRMTQuODUgMTYuNiAxMy4wNSAxOS4zcS0xLjk1IDIuOTUtMi43NzUgNC43dC0uODI1IDMuNjVxMCAxLjYuNzUgMi4yLjc1LjYgMS43NS42IDEuNDUgMCAyLjgyNS0xLjMgMS4zNzUtMS4zIDMuNTc1LTQuMTUgMi45NS0zLjggNS41MjUtNS43NzUgMi41NzUtMS45NzUgNS42NzUtMS45NzUgMy4xNSAwIDUgMi4zMjVUMzYuNiAyNS45aDQuOXYyLjk1aC00LjlxLS40NSA3LjM1LTMuMiAxMC4wNS0yLjc1IDIuNy01LjQgMi43Wm0uMS0yLjk1cTEuODUgMCAzLjY1LTIuMjUgMS44LTIuMjUgMi03LjUtMi44LjE1LTUuNjI1IDIuMDI1VDI1LjMgMzUuOXEwIDEuMy43NSAyLjAyNS43NS43MjUgMi4wNS43MjVaIi8+PC9zdmc+';
Editor.thinShapesImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI5Ljc1IDI5Ljc1Wm0tMTMgNS40NXEuNC4wNS43NS4wNUgxOS4wNXY0LjY1cTAgLjI1LjE3NS40MjV0LjQyNS4xNzVIMzkuOXEuMjUgMCAuNDI1LS4xNzV0LjE3NS0uNDI1VjE5LjY1cTAtLjI1LS4xNzUtLjQyNXQtLjQyNS0uMTc1aC00LjY1VjE3LjVxMC0uMzUtLjA1LS43NWg0LjdxMS4xNSAwIDIgLjg3NS44NS44NzUuODUgMi4wMjVWMzkuOXEwIDEuMTUtLjg1IDItLjg1Ljg1LTIgLjg1SDE5LjY1cS0xLjE1IDAtMi4wMjUtLjg1dC0uODc1LTJabTEuNS0zLjk1cS01LjQ1IDAtOS4yMjUtMy44LTMuNzc1LTMuOC0zLjc3NS05LjIgMC01LjQ1IDMuNzc1LTkuMjI1UTEyLjggNS4yNSAxOC4yNSA1LjI1cTUuNCAwIDkuMiAzLjc3NSAzLjggMy43NzUgMy44IDkuMjI1IDAgNS40LTMuOCA5LjItMy44IDMuOC05LjIgMy44Wm0tLjA1LTIuM3E0LjQ1IDAgNy42LTMuMTI1IDMuMTUtMy4xMjUgMy4xNS03LjU3NXQtMy4xMjUtNy42UTIyLjcgNy41IDE4LjI1IDcuNXQtNy42IDMuMTI1UTcuNSAxMy43NSA3LjUgMTguMnQzLjEyNSA3LjZxMy4xMjUgMy4xNSA3LjU3NSAzLjE1Wm0uMDUtMTAuN1oiLz48L3N2Zz4=';
Editor.thinUndoImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTE0LjQgMzcuNXYtMi4yNWgxMy45cTMuNiAwIDYuMjI1LTIuMzc1UTM3LjE1IDMwLjUgMzcuMTUgMjYuOXEwLTMuNTUtMi42MjUtNS45LTIuNjI1LTIuMzUtNi4yMjUtMi4zNUgxMi45NUwxOSAyNC43bC0xLjYgMS42LTguOC04LjggOC44LTguOCAxLjYgMS42LTYuMDUgNi4wNWgxNS4zcTQuNTUgMCA3Ljg1IDMuMDV0My4zIDcuNXEwIDQuNS0zLjMgNy41NXQtNy44NSAzLjA1WiIvPjwvc3ZnPg==';
Editor.thinRedoImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTE5Ljc1IDM3LjVxLTQuNTUgMC03Ljg1LTMuMDVUOC42IDI2LjlxMC00LjQ1IDMuMy03LjV0Ny44NS0zLjA1aDE1LjNMMjkgMTAuM2wxLjYtMS42IDguOCA4LjgtOC44IDguOC0xLjYtMS42IDYuMDUtNi4wNUgxOS43cS0zLjYgMC02LjIyNSAyLjM1LTIuNjI1IDIuMzUtMi42MjUgNS45IDAgMy42IDIuNjI1IDUuOTc1UTE2LjEgMzUuMjUgMTkuNyAzNS4yNWgxMy45djIuMjVaIi8+PC9zdmc+';
Editor.thinDoubleArrowRightImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0ibTEzIDM1LjMtMS42LTEuNiA5Ljc1LTkuNzUtOS43NS05LjcgMS42LTEuNiAxMS4zNSAxMS4zWm0xMi4zIDAtMS42LTEuNiA5Ljc1LTkuNzUtOS43NS05LjcgMS42LTEuNiAxMS4zIDExLjNaIi8+PC9zdmc+';
Editor.thinNoteImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgOTYgOTYwIDk2MCIgd2lkdGg9IjQ4Ij48cGF0aCBkPSJNMjM3LjY5NCA5NTUuOTk5cS0yMy41MjkgMC00MC42MTEtMTcuMDgyLTE3LjA4Mi0xNy4wODItMTcuMDgyLTQwLjYxMVYyNTMuNjk0cTAtMjMuNTI5IDE3LjA4Mi00MC42MTEgMTcuMDgyLTE3LjA4MiA0MC42MTEtMTcuMDgyaDM0Ny41MzdsMTk0Ljc2OCAxOTQuNzY4djUwNy41MzdxMCAyMy41MjktMTcuMDgyIDQwLjYxMS0xNy4wODIgMTcuMDgyLTQwLjYxMSAxNy4wODJIMjM3LjY5NFpNNTYyLjUzOSA0MTEuMjNWMjQxLjM4NUgyMzcuNjk0cS00LjYxNiAwLTguNDYzIDMuODQ2LTMuODQ2IDMuODQ3LTMuODQ2IDguNDYzdjY0NC42MTJxMCA0LjYxNiAzLjg0NiA4LjQ2MyAzLjg0NyAzLjg0NiA4LjQ2MyAzLjg0Nmg0ODQuNjEycTQuNjE2IDAgOC40NjMtMy44NDYgMy44NDYtMy44NDcgMy44NDYtOC40NjNWNDExLjIzSDU2Mi41MzlaTTIyNS4zODUgMjQxLjM4NVY0MTEuMjMgMjQxLjM4NXY2NjkuMjNWMjQxLjM4NVoiLz48L3N2Zz4=';
Editor.thinTableImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTcgNDFWN2gzNHYzNFptMi4yNS0yMy42aDI5LjVWOS4yNUg5LjI1Wm0xMC42IDEwLjdoOC4zdi04LjRoLTguM1ptMCAxMC42NWg4LjN2LTguNGgtOC4zWk05LjI1IDI4LjFoOC4zNXYtOC40SDkuMjVabTIxLjE1IDBoOC4zNXYtOC40SDMwLjRaTTkuMjUgMzguNzVoOC4zNXYtOC40SDkuMjVabTIxLjE1IDBoOC4zNXYtOC40SDMwLjRaIi8+PC9zdmc+';
Editor.thinAddCircleImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTIzIDMzLjVoMi4yNXYtOC4yaDguMjVWMjNoLTguMjV2LTguNUgyM1YyM2gtOC41djIuM0gyM1ptMSA5LjVxLTMuOTUgMC03LjQtMS41dC02LjAyNS00LjA3NVE4IDM0Ljg1IDYuNSAzMS40VDUgMjRxMC0zLjk1IDEuNS03LjQyNVE4IDEzLjEgMTAuNTc1IDEwLjU1IDEzLjE1IDggMTYuNiA2LjVUMjQgNXEzLjk1IDAgNy40MjUgMS41UTM0LjkgOCAzNy40NSAxMC41NSA0MCAxMy4xIDQxLjUgMTYuNTc1IDQzIDIwLjA1IDQzIDI0cTAgMy45NS0xLjUgNy40dC00LjA1IDYuMDI1UTM0LjkgNDAgMzEuNDI1IDQxLjUgMjcuOTUgNDMgMjQgNDNabS4wNS0yLjI1cTYuOTUgMCAxMS44MjUtNC45IDQuODc1LTQuOSA0Ljg3NS0xMS45IDAtNi45NS00Ljg3NS0xMS44MjVRMzEgNy4yNSAyNCA3LjI1cS02Ljk1IDAtMTEuODUgNC44NzVRNy4yNSAxNyA3LjI1IDI0cTAgNi45NSA0LjkgMTEuODUgNC45IDQuOSAxMS45IDQuOVpNMjQgMjRaIi8+PC9zdmc+';
Editor.thinArrowLeftImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI4LjA1IDM1LjMgMTYuNyAyMy45NSAyOC4wNSAxMi42bDEuNiAxLjY1LTkuNyA5LjcgOS43IDkuNzVaIi8+PC9zdmc+';
Editor.thinArrowRightImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0ibTE4Ljc1IDM1LjMtMS42LTEuNiA5LjctOS43NS05LjctOS43IDEuNi0xLjY1TDMwLjEgMjMuOTVaIi8+PC9zdmc+';
Editor.thinVerticalDotsImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI0LjA1IDQxLjdxLTEuMjUgMC0yLjEyNS0uODc1dC0uODc1LTIuMDc1cTAtMS4yLjg3NS0yLjEuODc1LS45IDIuMDc1LS45IDEuMjUgMCAyLjEuOS44NS45Ljg1IDIuMSAwIDEuMi0uODUgMi4wNzUtLjg1Ljg3NS0yLjA1Ljg3NVptMC0xNC43NXEtMS4yNSAwLTIuMTI1LS44NzVUMjEuMDUgMjRxMC0xLjI1Ljg3NS0yLjEuODc1LS44NSAyLjA3NS0uODUgMS4yNSAwIDIuMS44NS44NS44NS44NSAyLjA1IDAgMS4yNS0uODUgMi4xMjV0LTIuMDUuODc1Wm0wLTE0LjdxLTEuMjUgMC0yLjEyNS0uODc1VDIxLjA1IDkuMjVxMC0xLjI1Ljg3NS0yLjEyNVQyNCA2LjI1cTEuMjUgMCAyLjEuODc1Ljg1Ljg3NS44NSAyLjEyNXQtLjg1IDIuMTI1cS0uODUuODc1LTIuMDUuODc1WiIvPjwvc3ZnPg==';
Editor.thinDeleteImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTEzLjkgNDFxLTEuMTUgMC0yLS44NS0uODUtLjg1LS44NS0yLjA1VjEwLjlIOVY4LjY1aDguNTV2LTEuNGgxMi45djEuNEgzOXYyLjI1aC0yLjA1djI3LjJxMCAxLjItLjg1IDIuMDUtLjg1Ljg1LTIgLjg1Wm0yMC44LTMwLjFIMTMuM3YyNy4ycTAgLjMuMTc1LjQ3NXQuNDI1LjE3NWgyMC4ycS4yIDAgLjQtLjJ0LjItLjQ1Wk0xOS4wNSAzNC41aDIuM1YxNS4xaC0yLjNabTcuNiAwaDIuM1YxNS4xaC0yLjNaTTEzLjMgMTAuOXYyNy44NVYzOC4xWiIvPjwvc3ZnPg==';
Editor.thinLightImage =
	'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI0IDMwLjc1cTIuOCAwIDQuNzc1LTEuOTc1UTMwLjc1IDI2LjggMzAuNzUgMjRxMC0yLjgtMS45NzUtNC43NzVRMjYuOCAxNy4yNSAyNCAxNy4yNXEtMi44IDAtNC43NzUgMS45NzVRMTcuMjUgMjEuMiAxNy4yNSAyNHEwIDIuOCAxLjk3NSA0Ljc3NVEyMS4yIDMwLjc1IDI0IDMwLjc1Wk0yNCAzM3EtMy43NSAwLTYuMzc1LTIuNjI1VDE1IDI0cTAtMy43NSAyLjYyNS02LjM3NVQyNCAxNXEzLjc1IDAgNi4zNzUgMi42MjVUMzMgMjRxMCAzLjc1LTIuNjI1IDYuMzc1VDI0IDMzWk0zLjY1IDI1LjE1cS0uNSAwLS44MjUtLjMyNVEyLjUgMjQuNSAyLjUgMjRxMC0uNS4zMjUtLjgyNS4zMjUtLjMyNS44MjUtLjMyNWg1LjJxLjUgMCAuODI1LjMyNVExMCAyMy41IDEwIDI0cTAgLjUtLjMyNS44MjUtLjMyNS4zMjUtLjgyNS4zMjVabTM1LjUgMHEtLjUgMC0uODI1LS4zMjVRMzggMjQuNSAzOCAyNHEwLS41LjMyNS0uODI1LjMyNS0uMzI1LjgyNS0uMzI1aDUuMnEuNSAwIC44MjUuMzI1LjMyNS4zMjUuMzI1LjgyNSAwIC41LS4zMjUuODI1LS4zMjUuMzI1LS44MjUuMzI1Wk0yNCAxMHEtLjUgMC0uODI1LS4zMjUtLjMyNS0uMzI1LS4zMjUtLjgyNXYtNS4ycTAtLjUuMzI1LS44MjVRMjMuNSAyLjUgMjQgMi41cS41IDAgLjgyNS4zMjUuMzI1LjMyNS4zMjUuODI1djUuMnEwIC41LS4zMjUuODI1UTI0LjUgMTAgMjQgMTBabTAgMzUuNXEtLjUgMC0uODI1LS4zMjUtLjMyNS0uMzI1LS4zMjUtLjgyNXYtNS4ycTAtLjUuMzI1LS44MjVRMjMuNSAzOCAyNCAzOHEuNSAwIC44MjUuMzI1LjMyNS4zMjUuMzI1LjgyNXY1LjJxMCAuNS0uMzI1LjgyNS0uMzI1LjMyNS0uODI1LjMyNVpNMTIuNSAxNC4xbC0zLTIuOTVxLS4zNS0uMzUtLjMyNS0uODI1UTkuMiA5Ljg1IDkuNSA5LjVxLjM1LS4zNS44LS4zNS40NSAwIC44NS4zNWwyLjk1IDNxLjMuMzUuMy44IDAgLjQ1LS4zLjgtLjMuMy0uNzc1LjMtLjQ3NSAwLS44MjUtLjNabTI0LjM1IDI0LjQtMi45NS0zcS0uMy0uMzUtLjMtLjggMC0uNDUuMzUtLjguMjUtLjM1LjcyNS0uMzV0LjgyNS4zNWwzIDIuOTVxLjM1LjM1LjMyNS44MjUtLjAyNS40NzUtLjMyNS44MjUtLjM1LjM1LS44LjM1LS40NSAwLS44NS0uMzVaTTMzLjkgMTQuMXEtLjM1LS4zNS0uMzUtLjggMC0uNDUuMzUtLjhsMi45NS0zcS4zNS0uMzUuODI1LS4zMjUuNDc1LjAyNS44MjUuMzI1LjM1LjM1LjM1LjggMCAuNDUtLjM1Ljg1bC0zIDIuOTVxLS4zLjMtLjc3NS4zLS40NzUgMC0uODI1LS4zWk05LjUgMzguNXEtLjM1LS4zNS0uMzUtLjggMC0uNDUuMzUtLjg1bDMtMi45NXEuMzUtLjM1LjgtLjM1LjQ1IDAgLjguMzUuMzUuMy4zMjUuNzc1LS4wMjUuNDc1LS4zMjUuODI1bC0yLjk1IDNxLS40LjM1LS44NS4zNS0uNDUgMC0uOC0uMzVaTTI0IDI0WiIvPjwvc3ZnPg==';
Editor.thinDarkImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI0LjA1IDQxcS03LjEgMC0xMi4wNS00Ljk1UTcuMDUgMzEuMSA3LjA1IDI0cTAtNi44IDQuNi0xMS42NSA0LjYtNC44NSAxMS4zLTUuMjUuMiAwIC40NS4wMjV0LjcuMDI1UTIyLjc1IDguNyAyMiAxMC43MjVxLS43NSAyLjAyNS0uNzUgNC4yNzUgMCA0LjkgMy40NSA4LjM1IDMuNDUgMy40NSA4LjM1IDMuNDUgMi4yIDAgNC4yNzUtLjY3NVQ0MC45IDI0LjJxMCAuMzUuMDI1LjU1LjAyNS4yLjAyNS4zNS0uNCA2LjctNS4yNSAxMS4zUTMwLjg1IDQxIDI0LjA1IDQxWm0wLTIuMjVxNS4xNSAwIDkuMDc1LTMuMTI1UTM3LjA1IDMyLjUgMzguMiAyOC4xcS0xLjIuNS0yLjUuNzI1LTEuMy4yMjUtMi42NS4yMjUtNS44NSAwLTkuOTUtNC4xVDE5IDE1cTAtMS4xNS4yMjUtMi40MjVUMjAgOS43NXEtNC42NSAxLjQtNy42NSA1LjM3NVQ5LjM1IDI0cTAgNi4xNSA0LjI3NSAxMC40NSA0LjI3NSA0LjMgMTAuNDI1IDQuM1ptLS4yNS0xNC41WiIvPjwvc3ZnPg==';
Editor.thinCommentImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTEyLjUgMjcuNWgyM3YtMi4yNWgtMjNabTAtNi4zNWgyM3YtMi4zaC0yM1ptMC02LjRoMjNWMTIuNWgtMjNaTTQzIDQyLjEgMzUuOSAzNWgtMjhxLTEuMTUgMC0yLjAyNS0uODc1VDUgMzIuMVY3LjlxMC0xLjE1Ljg3NS0yLjAyNVQ3LjkgNWgzMi4ycTEuMiAwIDIuMDUuODc1UTQzIDYuNzUgNDMgNy45Wk03LjI1IDcuOXYyNC44NUgzNi45bDMuODUgMy44NVY3LjlxMC0uMy0uMTc1LS40NzVUNDAuMSA3LjI1SDcuOXEtLjMgMC0uNDc1LjE3NVQ3LjI1IDcuOVptMCAwdjI4LjdWNy4yNSA3LjlaIi8+PC9zdmc+';
Editor.thinMenuImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTEzLjUgMjYuMTVxLjkgMCAxLjUyNS0uNjI1LjYyNS0uNjI1LjYyNS0xLjUyNSAwLS45LS42MjUtMS41MjUtLjYyNS0uNjI1LTEuNTI1LS42MjUtLjkgMC0xLjUyNS42MjUtLjYyNS42MjUtLjYyNSAxLjUyNSAwIC45LjYyNSAxLjUyNS42MjUuNjI1IDEuNTI1LjYyNVptMTAuNSAwcS45IDAgMS41MjUtLjYyNS42MjUtLjYyNS42MjUtMS41MjUgMC0uOS0uNjI1LTEuNTI1UTI0LjkgMjEuODUgMjQgMjEuODVxLS45IDAtMS41MjUuNjI1LS42MjUuNjI1LS42MjUgMS41MjUgMCAuOS42MjUgMS41MjUuNjI1LjYyNSAxLjUyNS42MjVabTEwLjUgMHEuODUgMCAxLjQ3NS0uNjI1UTM2LjYgMjQuOSAzNi42IDI0cTAtLjktLjYyNS0xLjUyNS0uNjI1LS42MjUtMS41MjUtLjYyNS0uODUgMC0xLjQ3NS42MjUtLjYyNS42MjUtLjYyNSAxLjUyNSAwIC45LjYyNSAxLjUyNS42MjUuNjI1IDEuNTI1LjYyNVpNMjQgNDNxLTMuOTUgMC03LjQtMS41dC02LjAyNS00LjA3NVE4IDM0Ljg1IDYuNSAzMS40VDUgMjRxMC0zLjk1IDEuNS03LjQyNVE4IDEzLjEgMTAuNTc1IDEwLjU1IDEzLjE1IDggMTYuNiA2LjVUMjQgNXEzLjk1IDAgNy40MjUgMS41UTM0LjkgOCAzNy40NSAxMC41NSA0MCAxMy4xIDQxLjUgMTYuNTc1IDQzIDIwLjA1IDQzIDI0cTAgMy45NS0xLjUgNy40dC00LjA1IDYuMDI1UTM0LjkgNDAgMzEuNDI1IDQxLjUgMjcuOTUgNDMgMjQgNDNabTAtMi4yNXE3IDAgMTEuODc1LTQuOVQ0MC43NSAyNHEwLTctNC44NzUtMTEuODc1VDI0IDcuMjVxLTYuOTUgMC0xMS44NSA0Ljg3NVE3LjI1IDE3IDcuMjUgMjRxMCA2Ljk1IDQuOSAxMS44NSA0LjkgNC45IDExLjg1IDQuOVpNMjQgMjRaIi8+PC9zdmc+';
Editor.thinViewImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTUgMzlWOWgzOHYzMFptMjguNTUtMjAuNmg3LjJ2LTcuMTVoLTcuMlptMCA4Ljk1aDcuMnYtNi43aC03LjJabS0yNi4zIDkuNEgzMS4zdi0yNS41SDcuMjVabTI2LjMgMGg3LjJWMjkuNmgtNy4yWiIvPjwvc3ZnPg==';
Editor.thinUserAddImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTM2LjYgMjcuNXYtNi4zNWgtNi4zNXYtMi4zaDYuMzVWMTIuNWgyLjN2Ni4zNWg2LjM1djIuM0gzOC45djYuMzVaTTE4IDIzLjM1cS0yLjkgMC00Ljc3NS0xLjg3NVExMS4zNSAxOS42IDExLjM1IDE2LjdxMC0yLjkgMS44NzUtNC43NVQxOCAxMC4xcTIuOSAwIDQuNzc1IDEuODUgMS44NzUgMS44NSAxLjg3NSA0Ljc1dC0xLjg3NSA0Ljc3NVEyMC45IDIzLjM1IDE4IDIzLjM1Wk0zIDM4LjZ2LTMuOHEwLTEuNS44LTIuNzV0Mi4yNS0xLjlxMy40NS0xLjUgNi4yNzUtMi4xNSAyLjgyNS0uNjUgNS42NzUtLjY1IDIuODUgMCA1LjY1LjY1IDIuOC42NSA2LjI1IDIuMTUgMS40NS43IDIuMjc1IDEuOTI1VDMzIDM0Ljh2My44Wm0yLjI1LTIuMjVoMjUuNVYzNC44cTAtLjc1LS41LTEuNDc1LS41LS43MjUtMS4zLTEuMTI1LTMuMi0xLjUtNS42NzUtMi4wNVEyMC44IDI5LjYgMTggMjkuNnEtMi44IDAtNS4zLjU1VDcgMzIuMnEtLjguNC0xLjI3NSAxLjEyNS0uNDc1LjcyNS0uNDc1IDEuNDc1Wk0xOCAyMS4xcTEuODUgMCAzLjEtMS4yNXQxLjI1LTMuMTVxMC0xLjg1LTEuMjUtMy4xVDE4IDEyLjM1cS0xLjg1IDAtMy4xIDEuMjV0LTEuMjUgMy4xcTAgMS45IDEuMjUgMy4xNVQxOCAyMS4xWm0wLTQuNFptMCAxOS42NVoiLz48L3N2Zz4=';
Editor.thinUserFlashImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTkgMzguNnYtMy44cTAtMS42Ljg1LTIuOC44NS0xLjIgMi4yLTEuODUgMy4yLTEuNCA2LjEyNS0yLjEgMi45MjUtLjcgNS44MjUtLjcgMS40NSAwIDIuOS4xNzV0Mi45LjUyNXYyLjJxLTEuNDUtLjM1LTIuODc1LS41UTI1LjUgMjkuNiAyNCAyOS42cS0yLjc1IDAtNS40LjYtMi42NS42LTUuNiAyLS43NS40LTEuMjUgMS4xMjV0LS41IDEuNDc1djEuNTVIMjkuOHYyLjI1Wm0yLjI1LTIuMjVIMjkuOFptMTIuNzUtMTNxLTIuOSAwLTQuNzc1LTEuODc1UTE3LjM1IDE5LjYgMTcuMzUgMTYuN3EwLTIuOSAxLjg3NS00Ljc1VDI0IDEwLjFxMi45IDAgNC43NzUgMS44NSAxLjg3NSAxLjg1IDEuODc1IDQuNzV0LTEuODc1IDQuNzc1UTI2LjkgMjMuMzUgMjQgMjMuMzVabTAtMi4yNXExLjg1IDAgMy4xLTEuMjV0MS4yNS0zLjE1cTAtMS44NS0xLjI1LTMuMVQyNCAxMi4zNXEtMS44NSAwLTMuMSAxLjI1dC0xLjI1IDMuMXEwIDEuOSAxLjI1IDMuMTVUMjQgMjEuMVptMC00LjRabTEyLjg1IDI4LjA1di03LjhoLTMuNHYtMTAuMWg5LjE1bC0zLjggNy42NWgzLjdaIi8+PC9zdmc+';
Editor.thinShareImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTExLjkgNDVxLTEuMiAwLTIuMDUtLjg1UTkgNDMuMyA5IDQyLjFWMTguOHEwLTEuMTUuODUtMiAuODUtLjg1IDIuMDUtLjg1aDYuOXYyLjI1aC02LjlxLS4yNSAwLS40NS4ydC0uMi40djIzLjNxMCAuMjUuMi40NXQuNDUuMmgyNC4ycS4yNSAwIC40NS0uMnQuMi0uNDVWMTguOHEwLS4yLS4yLS40dC0uNDUtLjJoLTYuOTV2LTIuMjVoNi45NXExLjIgMCAyLjA1Ljg1Ljg1Ljg1Ljg1IDJ2MjMuM3EwIDEuMi0uODUgMi4wNS0uODUuODUtMi4wNS44NVptMTAuOTUtMTQuNVY4LjFsLTQuNiA0LjU1LTEuNjUtMS42IDcuMzUtNy4zNSA3LjM1IDcuMzUtMS42IDEuNi00LjYtNC41NXYyMi40WiIvPjwvc3ZnPg==';
Editor.thinTextImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTMuNCA0NC42di05LjI1aDMuNTV2LTIyLjdIMy40VjMuNGg5LjI1djMuNTVoMjIuN1YzLjRoOS4yNXY5LjI1aC0zLjU1djIyLjdoMy41NXY5LjI1aC05LjI1di0zLjU1aC0yMi43djMuNTVabTkuMjUtNS44NWgyMi43di0zLjRoMy40di0yMi43aC0zLjR2LTMuNGgtMjIuN3YzLjRoLTMuNHYyMi43aDMuNFptMy4xNS02LjI1IDcuMzUtMTkuMTVoMS42NWw3LjQ1IDE5LjE1aC0yLjFMMjggMjdoLTcuODVsLTIuMSA1LjVabTQuOTUtNy4zNWg2LjVMMjQuMSAxNi44aC0uM1ptLTE1LjEtMTQuOGg0Ljd2LTQuN2gtNC43Wm0zMiAwaDQuN3YtNC43aC00LjdabTAgMzJoNC43di00LjdoLTQuN1ptLTMyIDBoNC43di00LjdoLTQuN1ptMzItMzJabTAgMjcuM1ptLTI3LjMgMFptMC0yNy4zWiIvPjwvc3ZnPg==';
Editor.thinRectangleImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTUgMzlWOWgzOHYzMFptMi4yNS0yLjI1aDMzLjV2LTI1LjVINy4yNVptMCAwdi0yNS41IDI1LjVaIi8+PC9zdmc+';
Editor.thinDataImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI4Ljg1IDM5LjF2LTIuMjVIMzRxMS4yIDAgMi4wMjUtLjgyNVQzNi44NSAzNHYtNC45cTAtMS43NSAxLjA3NS0zLjEyNXQyLjcyNS0xLjgyNXYtLjNxLTEuNjUtLjQ1LTIuNzI1LTEuODI1UTM2Ljg1IDIwLjY1IDM2Ljg1IDE4LjlWMTRxMC0xLjItLjgyNS0yLjAyNVQzNCAxMS4xNWgtNS4xNVY4LjlIMzRxMi4xNSAwIDMuNjI1IDEuNVQzOS4xIDE0djQuOXEwIDEuMjUuODUgMi4wNzUuODUuODI1IDIuMS44MjVoLjg1djQuNGgtLjg1cS0xLjI1IDAtMi4xLjgyNS0uODUuODI1LS44NSAyLjA3NVYzNHEwIDIuMS0xLjUgMy42VDM0IDM5LjFaTTE0IDM5LjFxLTIuMTUgMC0zLjYyNS0xLjVUOC45IDM0di00LjlxMC0xLjI1LS44NS0yLjA3NS0uODUtLjgyNS0yLjEtLjgyNUg1LjF2LTQuNGguODVxMS4yNSAwIDIuMS0uODI1Ljg1LS44MjUuODUtMi4wNzVWMTRxMC0yLjEgMS41LTMuNlQxNCA4LjloNS4xNXYyLjI1SDE0cS0xLjIgMC0yLjAyNS44MjVUMTEuMTUgMTR2NC45cTAgMS43NS0xLjA3NSAzLjEyNVQ3LjM1IDIzLjg1di4zcTEuNjUuNDUgMi43MjUgMS44MjVRMTEuMTUgMjcuMzUgMTEuMTUgMjkuMVYzNHEwIDEuMi44MjUgMi4wMjVUMTQgMzYuODVoNS4xNXYyLjI1WiIvPjwvc3ZnPg==';
Editor.thinExpandImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTI0IDMwLjEgMTIuNyAxOC43NWwxLjYtMS42IDkuNyA5LjcgOS43LTkuNyAxLjYgMS42NVoiLz48L3N2Zz4=';
Editor.thinGridImage =
	'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iNDgiPjxwYXRoIGQ9Ik0yMjMuMjkxLTE1NC41cS0yOS4xMTcgMC00OC45NTQtMTkuODM3VDE1NC41LTIyMy4yOTFxMC0yOS4xMTggMTkuODM3LTQ4LjkxM1ExOTQuMTc0LTI5MiAyMjMuMjkxLTI5MnEyOS4xMTggMCA0OC45MTMgMTkuNzk2UTI5Mi0yNTIuNDA5IDI5Mi0yMjMuMjkxcTAgMjkuMTE3LTE5Ljc5NiA0OC45NTQtMTkuNzk1IDE5LjgzNy00OC45MTMgMTkuODM3Wm0yNTYuOCAwcS0yOS4wNDggMC00OC44ODUtMTkuODM3LTE5LjgzNi0xOS44MzctMTkuODM2LTQ4Ljk1NCAwLTI5LjExOCAxOS43NDUtNDguOTEzUTQ1MC44NjEtMjkyIDQ3OS45MDktMjkydDQ4Ljg4NSAxOS43OTZxMTkuODM2IDE5Ljc5NSAxOS44MzYgNDguOTEzIDAgMjkuMTE3LTE5Ljc0NSA0OC45NTQtMTkuNzQ2IDE5LjgzNy00OC43OTQgMTkuODM3Wm0yNTYuNjE4IDBxLTI5LjExOCAwLTQ4LjkxMy0xOS44MzdRNjY4LTE5NC4xNzQgNjY4LTIyMy4yOTFxMC0yOS4xMTggMTkuNzk2LTQ4LjkxM1E3MDcuNTkxLTI5MiA3MzYuNzA5LTI5MnEyOS4xMTcgMCA0OC45NTQgMTkuNzk2IDE5LjgzNyAxOS43OTUgMTkuODM3IDQ4LjkxMyAwIDI5LjExNy0xOS44MzcgNDguOTU0VDczNi43MDktMTU0LjVaTTIyMy4yOTEtNDExLjM3cS0yOS4xMTcgMC00OC45NTQtMTkuNzQ1LTE5LjgzNy0xOS43NDYtMTkuODM3LTQ4Ljc5NHQxOS44MzctNDguODg1cTE5LjgzNy0xOS44MzYgNDguOTU0LTE5LjgzNiAyOS4xMTggMCA0OC45MTMgMTkuNzQ1UTI5Mi01MDkuMTM5IDI5Mi00ODAuMDkxdC0xOS43OTYgNDguODg1cS0xOS43OTUgMTkuODM2LTQ4LjkxMyAxOS44MzZabTI1Ni44IDBxLTI5LjA0OCAwLTQ4Ljg4NS0xOS43NDUtMTkuODM2LTE5Ljc0Ni0xOS44MzYtNDguNzk0dDE5Ljc0NS00OC44ODVxMTkuNzQ2LTE5LjgzNiA0OC43OTQtMTkuODM2dDQ4Ljg4NSAxOS43NDVxMTkuODM2IDE5Ljc0NiAxOS44MzYgNDguNzk0dC0xOS43NDUgNDguODg1cS0xOS43NDYgMTkuODM2LTQ4Ljc5NCAxOS44MzZabTI1Ni42MTggMHEtMjkuMTE4IDAtNDguOTEzLTE5Ljc0NVE2NjgtNDUwLjg2MSA2NjgtNDc5LjkwOXQxOS43OTYtNDguODg1cTE5Ljc5NS0xOS44MzYgNDguOTEzLTE5LjgzNiAyOS4xMTcgMCA0OC45NTQgMTkuNzQ1IDE5LjgzNyAxOS43NDYgMTkuODM3IDQ4Ljc5NHQtMTkuODM3IDQ4Ljg4NXEtMTkuODM3IDE5LjgzNi00OC45NTQgMTkuODM2Wk0yMjMuMjkxLTY2OHEtMjkuMTE3IDAtNDguOTU0LTE5Ljc5Ni0xOS44MzctMTkuNzk1LTE5LjgzNy00OC45MTMgMC0yOS4xMTcgMTkuODM3LTQ4Ljk1NHQ0OC45NTQtMTkuODM3cTI5LjExOCAwIDQ4LjkxMyAxOS44MzdRMjkyLTc2NS44MjYgMjkyLTczNi43MDlxMCAyOS4xMTgtMTkuNzk2IDQ4LjkxM1EyNTIuNDA5LTY2OCAyMjMuMjkxLTY2OFptMjU2LjggMHEtMjkuMDQ4IDAtNDguODg1LTE5Ljc5Ni0xOS44MzYtMTkuNzk1LTE5LjgzNi00OC45MTMgMC0yOS4xMTcgMTkuNzQ1LTQ4Ljk1NCAxOS43NDYtMTkuODM3IDQ4Ljc5NC0xOS44Mzd0NDguODg1IDE5LjgzN3ExOS44MzYgMTkuODM3IDE5LjgzNiA0OC45NTQgMCAyOS4xMTgtMTkuNzQ1IDQ4LjkxM1E1MDkuMTM5LTY2OCA0ODAuMDkxLTY2OFptMjU2LjYxOCAwcS0yOS4xMTggMC00OC45MTMtMTkuNzk2UTY2OC03MDcuNTkxIDY2OC03MzYuNzA5cTAtMjkuMTE3IDE5Ljc5Ni00OC45NTQgMTkuNzk1LTE5LjgzNyA0OC45MTMtMTkuODM3IDI5LjExNyAwIDQ4Ljk1NCAxOS44Mzd0MTkuODM3IDQ4Ljk1NHEwIDI5LjExOC0xOS44MzcgNDguOTEzUTc2NS44MjYtNjY4IDczNi43MDktNjY4WiIvPjwvc3ZnPg==';
Editor.selectImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTkgNDJxLTEuMjUgMC0yLjEyNS0uODc1VDYgMzlWOXEwLTEuMjUuODc1LTIuMTI1VDkgNmgzMHEuNyAwIDEuMjc1LjN0LjkyNS43TDM5IDkuMlY5SDl2MzBoMzBWMjEuODVsMy0zVjM5cTAgMS4yNS0uODc1IDIuMTI1VDM5IDQyWm0xNC4wNS04LjQtMTEuMS0xMS4xIDIuMS0yLjEgOSA5IDE5LjEtMTkuMSAyLjEgMi4xWiIvPjwvc3ZnPg==';
Editor.printLargeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAXVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9RKvvlAAAAHnRSTlMAydnl77qbMLT093H7K4Nd4Ktn082+lYt5bkklEgP44nQSAAAApUlEQVQ4y73P2Q6DIBRF0cOgbRHHzhP//5m9mBAQKjG1cT0Yc7ITAMu1LNQgUZiQ2DYoNQ0sCQb6qgHAfRx48opq3J9AZ6xuF7uOew8Ik1OsCZRS2UAC9V+D9a+QZYxNA45YFQftPtSkATOhw7dAc0vPBwKWiIOjP0JZ0yMuQJ27g36DipOUsqRAM0dR8KD1/ILHaHSE/w8DIx09E3g/BTce6rHUB5sAPKvfF+JdAAAAAElFTkSuQmCC';
Editor.layersLargeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAmVBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v7///+bnZkkAAAAMnRSTlMABPr8ByiD88KsTi/rvJb272mjeUA1CuPe1M/KjVxYHxMP6KZ0S9nYzGRGGRaznpGIbzaGUf0AAAHESURBVDjLbZLZYoIwEEVDgLCjbKIgAlqXqt3m/z+uNwu1rcyDhjl3ktnYL7OY254C0VX3yWFZfzDrOClbbgKxi0YDHjwl4jbnRkXxJS/C1YP3DbBhD1n7Ex4uaAqdVDb3yJ/4J/3nJD2to/ngQz/DfUvzMp4JJ5sSCaF5oXmemgQDfDxzbi+Kq4sU+vNcuAmx94JtyOP2DD4Epz2asWSCz4Z/4fECxyNj9zC9xNLHcdPEO+awDKeSaUu0W4twZQiO2hYVisTR3RCtK/c1X6t4xMEpiGqXqVntEBLolkZZsKY4QtwH6jzq67dEHlJysB1aNOD3XT7n1UkasQN59L4yC2RELMDSeCRtz3yV22Ub3ozIUTknYx8JWqDdQxbUes98cR2kZtUSveF/bAhcedwEWmlxIkpZUy4XOCb6VBjjxHvbwo/1lBAHHi2JCr0NI570QhyHq/DhJoE2lLgyA4RVe6KmZ47O/3b86MCP0HWa73A8/C3SUc5Qc1ajt6fgpXJ+RGpMvDSchepZDOOQRcZVIKcK90x2D7etqtI+56+u6n3sPriO6nfphitR4+O2m3EbM7lh3me1FM1o+LMI887rN+s3/wZdTFlpNVJiOAAAAABJRU5ErkJggg==';
Editor.closeLargeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAUVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////8IN+deAAAAGnRSTlMAuvAIg/dDM/QlOeuFhj0S5s4vKgzjxJRQNiLSey0AAADNSURBVDjLfZLbEoMgDEQjRRRs1XqX///QNmOHJSnjPkHOGR7IEmeoGtJZstnwjqbRfIsmgEdtPCqe9Ynz7ZSc07rE2QiSc+qv8TvjRXA2PDUm3dpe82iJhOEUfxJJo3aCv+jKmRmH4lcCjCjeh9GWOdL/GZZkXH3PYYDrHBnfc4D/RVZf5sjoC1was+Y6HQxwaUxFvq/a0Pv343VCTxfBSRiB+ab3M3eiQZXmMNBJ3Y8pGRZtYQ7DgHMXJEdPLTaN/qBjzJOBc3nmNcbsA16bMR0oLqf+AAAAAElFTkSuQmCC';
Editor.editLargeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAgVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9d3yJTAAAAKnRSTlMA+hzi3nRQWyXzkm0h2j3u54gzEgSXjlYoTBgJxL2loGpAOS3Jt7Wxm35Ga7gRAAAA6UlEQVQ4y63Q2XaCMBSF4Q0JBasoQ5DJqbXjfv8HbCK2BZNwo/8FXHx7rcMC7lQu0iX8qU/qtvAWCpoqH8dYzS0SwaV5eK/UAf8X9pd2CWKzuF5Jrftp1owXwnIGLUaL3PYndOHf4kNNXWrXK/m7CHunk7K8LE6YtBpcknwG9GKxnroY+ylBXcx4xKyx/u/EuXi509cP9V7OO1oyHnzrdFTcqLG/4ibBA5pIMr/4xvKzuQDkVy9wW8SgBFD6HDvuzMvrZcC9QlkfMzI7w64m+b4PqBMNHB05lH21PVxJo2/fBXxV4hB38PcD+5AkI4FuETsAAAAASUVORK5CYII=';
Editor.previousLargeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAPFBMVEUAAAD////////////////////////////////////////////////////////////////////////////YSWgTAAAAE3RSTlMA7fci493c0MW8uJ6CZks4MxQHEZL6ewAAAFZJREFUOMvdkskRgDAMA4lDwg2B7b9XOlge/KKvdsa25KFb5XlRvxXC/DNBEv8IFNjBgGdDgXtFgTyhwDXiQAUHCvwa4Uv6mR6UR+1led2mVonvl+tML45qCQNQLIx7AAAAAElFTkSuQmCC';
Editor.nextLargeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAPFBMVEUAAAD////////////////////////////////////////////////////////////////////////////YSWgTAAAAE3RSTlMA7fci493c0MW8uJ6CZks4MxQHEZL6ewAAAFRJREFUOMvd0skRgCAQBVEFwQ0V7fxzNQP6wI05v6pZ/kyj1b7FNgik2gQzzLcAwiUAigHOTwDHK4A1CmB5BJANJG1hQ9qafYcqFlZP3IFc9eVGrR+iIgkDQRUXIAAAAABJRU5ErkJggg==';

Editor.styles = [
	{},
	{
		commonStyle: { fontColor: '#393C56', strokeColor: '#E07A5F', fillColor: '#F2CC8F' },
		graph: { background: '#F4F1DE', gridColor: '#D4D0C0' },
	},
	{
		vertexStyle: { strokeColor: '#BAC8D3', fillColor: '#09555B', fontColor: '#EEEEEE' },
		edgeStyle: { strokeColor: '#0B4D6A' },
	},
	{
		vertexStyle: { strokeColor: '#FFFFFF', fillColor: '#182E3E', fontColor: '#FFFFFF' },
		edgeStyle: { strokeColor: '#23445D' },
		graph: { background: '#FCE7CD', gridColor: '#CFBDA8' },
	},
	{
		vertexStyle: { strokeColor: '#D0CEE2', fillColor: '#5D7F99' },
		edgeStyle: { strokeColor: '#736CA8' },
		commonStyle: { fontColor: '#1A1A1A' },
	},
	{ commonStyle: { fontColor: '#46495D', strokeColor: '#788AA3', fillColor: '#B2C9AB' } },
	{ commonStyle: { fontColor: '#5AA9E6', strokeColor: '#FF6392', fillColor: '#FFE45E' } },
	{
		commonStyle: { fontColor: '#E4FDE1', strokeColor: '#028090', fillColor: '#F45B69' },
		graph: { background: '#114B5F', gridColor: '#0B3240' },
	},
	{
		commonStyle: { fontColor: '#FEFAE0', strokeColor: '#DDA15E', fillColor: '#BC6C25' },
		graph: { background: '#283618', gridColor: '#48632C' },
	},
	{
		commonStyle: { fontColor: '#143642', strokeColor: '#0F8B8D', fillColor: '#FAE5C7' },
		edgeStyle: { strokeColor: '#A8201A' },
		graph: { background: '#DAD2D8', gridColor: '#ABA4A9' },
	},
	{},
	{
		vertexStyle: { strokeColor: '#D0CEE2', fillColor: '#FAD9D5' },
		edgeStyle: { strokeColor: '#09555B' },
		commonStyle: { fontColor: '#1A1A1A' },
	},
	{
		commonStyle: { fontColor: '#1D3557', strokeColor: '#457B9D', fillColor: '#A8DADC' },
		graph: { background: '#F1FAEE' },
	},
	{
		commonStyle: { fontColor: '#095C86', strokeColor: '#AF45ED', fillColor: '#F694C1' },
		edgeStyle: { strokeColor: '#60E696' },
	},
	{ commonStyle: { fontColor: '#5C5C5C', strokeColor: '#006658', fillColor: '#21C0A5' } },
	{
		vertexStyle: { strokeColor: '#FFFFFF', fillColor: '#F08E81' },
		edgeStyle: { strokeColor: '#182E3E' },
		commonStyle: { fontColor: '#1A1A1A' },
		graph: { background: '#B0E3E6', gridColor: '#87AEB0' },
	},
	{
		vertexStyle: { strokeColor: '#909090', fillColor: '#F5AB50' },
		edgeStyle: { strokeColor: '#182E3E' },
		commonStyle: { fontColor: '#1A1A1A' },
		graph: { background: '#EEEEEE' },
	},
	{
		vertexStyle: { strokeColor: '#BAC8D3', fillColor: '#B1DDF0', fontColor: '#182E3E' },
		edgeStyle: { strokeColor: '#EEEEEE', fontColor: '#FFFFFF' },
		graph: { background: '#09555B', gridColor: '#13B4C2' },
	},
	{
		vertexStyle: { strokeColor: '#EEEEEE', fillColor: '#56517E', fontColor: '#FFFFFF' },
		edgeStyle: { strokeColor: '#182E3E' },
		graph: { background: '#FAD9D5', gridColor: '#BFA6A3' },
	},
	{
		vertexStyle: { fillColor: '#EEEEEE', fontColor: '#1A1A1A' },
		edgeStyle: { fontColor: '#FFFFFF' },
		commonStyle: { strokeColor: '#FFFFFF' },
		graph: { background: '#182E3E', gridColor: '#4D94C7' },
	},
];

Editor.logoImage =
	'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIKICAgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMzA2LjE4NSAxMjAuMjk2IgogICB2aWV3Qm94PSIyNCAyNiA2OCA2OCIKICAgeT0iMHB4IgogICB4PSIwcHgiCiAgIHZlcnNpb249IjEuMSI+CiAgIAkgPGc+PGxpbmUKICAgICAgIHkyPSI3Mi4zOTQiCiAgICAgICB4Mj0iNDEuMDYxIgogICAgICAgeTE9IjQzLjM4NCIKICAgICAgIHgxPSI1OC4wNjkiCiAgICAgICBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiCiAgICAgICBzdHJva2Utd2lkdGg9IjMuNTUyOCIKICAgICAgIHN0cm9rZT0iI0ZGRkZGRiIKICAgICAgIGZpbGw9Im5vbmUiIC8+PGxpbmUKICAgICAgIHkyPSI3Mi4zOTQiCiAgICAgICB4Mj0iNzUuMDc2IgogICAgICAgeTE9IjQzLjM4NCIKICAgICAgIHgxPSI1OC4wNjgiCiAgICAgICBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiCiAgICAgICBzdHJva2Utd2lkdGg9IjMuNTAwOCIKICAgICAgIHN0cm9rZT0iI0ZGRkZGRiIKICAgICAgIGZpbGw9Im5vbmUiIC8+PGc+PHBhdGgKICAgICAgICAgZD0iTTUyLjc3Myw3Ny4wODRjMCwxLjk1NC0xLjU5OSwzLjU1My0zLjU1MywzLjU1M0gzNi45OTljLTEuOTU0LDAtMy41NTMtMS41OTktMy41NTMtMy41NTN2LTkuMzc5ICAgIGMwLTEuOTU0LDEuNTk5LTMuNTUzLDMuNTUzLTMuNTUzaDEyLjIyMmMxLjk1NCwwLDMuNTUzLDEuNTk5LDMuNTUzLDMuNTUzVjc3LjA4NHoiCiAgICAgICAgIGZpbGw9IiNGRkZGRkYiIC8+PC9nPjxnCiAgICAgICBpZD0iZzM0MTkiPjxwYXRoCiAgICAgICAgIGQ9Ik02Ny43NjIsNDguMDc0YzAsMS45NTQtMS41OTksMy41NTMtMy41NTMsMy41NTNINTEuOTg4Yy0xLjk1NCwwLTMuNTUzLTEuNTk5LTMuNTUzLTMuNTUzdi05LjM3OSAgICBjMC0xLjk1NCwxLjU5OS0zLjU1MywzLjU1My0zLjU1M0g2NC4yMWMxLjk1NCwwLDMuNTUzLDEuNTk5LDMuNTUzLDMuNTUzVjQ4LjA3NHoiCiAgICAgICAgIGZpbGw9IiNGRkZGRkYiIC8+PC9nPjxnPjxwYXRoCiAgICAgICAgIGQ9Ik04Mi43NTIsNzcuMDg0YzAsMS45NTQtMS41OTksMy41NTMtMy41NTMsMy41NTNINjYuOTc3Yy0xLjk1NCwwLTMuNTUzLTEuNTk5LTMuNTUzLTMuNTUzdi05LjM3OSAgICBjMC0xLjk1NCwxLjU5OS0zLjU1MywzLjU1My0zLjU1M2gxMi4yMjJjMS45NTQsMCwzLjU1MywxLjU5OSwzLjU1MywzLjU1M1Y3Ny4wODR6IgogICAgICAgICBmaWxsPSIjRkZGRkZGIiAvPjwvZz48L2c+PC9zdmc+';
Editor.saveImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTkgMTJ2N0g1di03SDN2N2MwIDEuMS45IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0ydi03aC0yem0tNiAuNjdsMi41OS0yLjU4TDE3IDExLjVsLTUgNS01LTUgMS40MS0xLjQxTDExIDEyLjY3VjNoMnoiLz48L3N2Zz4=';
Editor.globeImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTEuOTkgMkM2LjQ3IDIgMiA2LjQ4IDIgMTJzNC40NyAxMCA5Ljk5IDEwQzE3LjUyIDIyIDIyIDE3LjUyIDIyIDEyUzE3LjUyIDIgMTEuOTkgMnptNi45MyA2aC0yLjk1Yy0uMzItMS4yNS0uNzgtMi40NS0xLjM4LTMuNTYgMS44NC42MyAzLjM3IDEuOTEgNC4zMyAzLjU2ek0xMiA0LjA0Yy44MyAxLjIgMS40OCAyLjUzIDEuOTEgMy45NmgtMy44MmMuNDMtMS40MyAxLjA4LTIuNzYgMS45MS0zLjk2ek00LjI2IDE0QzQuMSAxMy4zNiA0IDEyLjY5IDQgMTJzLjEtMS4zNi4yNi0yaDMuMzhjLS4wOC42Ni0uMTQgMS4zMi0uMTQgMiAwIC42OC4wNiAxLjM0LjE0IDJINC4yNnptLjgyIDJoMi45NWMuMzIgMS4yNS43OCAyLjQ1IDEuMzggMy41Ni0xLjg0LS42My0zLjM3LTEuOS00LjMzLTMuNTZ6bTIuOTUtOEg1LjA4Yy45Ni0xLjY2IDIuNDktMi45MyA0LjMzLTMuNTZDOC44MSA1LjU1IDguMzUgNi43NSA4LjAzIDh6TTEyIDE5Ljk2Yy0uODMtMS4yLTEuNDgtMi41My0xLjkxLTMuOTZoMy44MmMtLjQzIDEuNDMtMS4wOCAyLjc2LTEuOTEgMy45NnpNMTQuMzQgMTRIOS42NmMtLjA5LS42Ni0uMTYtMS4zMi0uMTYtMiAwLS42OC4wNy0xLjM1LjE2LTJoNC42OGMuMDkuNjUuMTYgMS4zMi4xNiAyIDAgLjY4LS4wNyAxLjM0LS4xNiAyem0uMjUgNS41NmMuNi0xLjExIDEuMDYtMi4zMSAxLjM4LTMuNTZoMi45NWMtLjk2IDEuNjUtMi40OSAyLjkzLTQuMzMgMy41NnpNMTYuMzYgMTRjLjA4LS42Ni4xNC0xLjMyLjE0LTIgMC0uNjgtLjA2LTEuMzQtLjE0LTJoMy4zOGMuMTYuNjQuMjYgMS4zMS4yNiAycy0uMSAxLjM2LS4yNiAyaC0zLjM4eiIvPjwvc3ZnPg==';
Editor.commentImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjEuOTkgNGMwLTEuMS0uODktMi0xLjk5LTJINGMtMS4xIDAtMiAuOS0yIDJ2MTJjMCAxLjEuOSAyIDIgMmgxNGw0IDQtLjAxLTE4ek0xOCAxNEg2di0yaDEydjJ6bTAtM0g2VjloMTJ2MnptMC0zSDZWNmgxMnYyeiIvPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
Editor.userImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+';
Editor.shareImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTggMTYuMDhjLS43NiAwLTEuNDQuMy0xLjk2Ljc3TDguOTEgMTIuN2MuMDUtLjIzLjA5LS40Ni4wOS0uN3MtLjA0LS40Ny0uMDktLjdsNy4wNS00LjExYy41NC41IDEuMjUuODEgMi4wNC44MSAxLjY2IDAgMy0xLjM0IDMtM3MtMS4zNC0zLTMtMy0zIDEuMzQtMyAzYzAgLjI0LjA0LjQ3LjA5LjdMOC4wNCA5LjgxQzcuNSA5LjMxIDYuNzkgOSA2IDljLTEuNjYgMC0zIDEuMzQtMyAzczEuMzQgMyAzIDNjLjc5IDAgMS41LS4zMSAyLjA0LS44MWw3LjEyIDQuMTZjLS4wNS4yMS0uMDguNDMtLjA4LjY1IDAgMS42MSAxLjMxIDIuOTIgMi45MiAyLjkyIDEuNjEgMCAyLjkyLTEuMzEgMi45Mi0yLjkycy0xLjMxLTIuOTItMi45Mi0yLjkyeiIvPjwvc3ZnPg==';
Editor.syncImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgNFYxTDggNWw0IDRWNmMzLjMxIDAgNiAyLjY5IDYgNiAwIDEuMDEtLjI1IDEuOTctLjcgMi44bDEuNDYgMS40NkMxOS41NCAxNS4wMyAyMCAxMy41NyAyMCAxMmMwLTQuNDItMy41OC04LTgtOHptMCAxNGMtMy4zMSAwLTYtMi42OS02LTYgMC0xLjAxLjI1LTEuOTcuNy0yLjhMNS4yNCA3Ljc0QzQuNDYgOC45NyA0IDEwLjQzIDQgMTJjMCA0LjQyIDMuNTggOCA4IDh2M2w0LTQtNC00djN6Ii8+PC9zdmc+';
Editor.cloudImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyIDZjMi42MiAwIDQuODggMS44NiA1LjM5IDQuNDNsLjMgMS41IDEuNTMuMTFjMS41Ni4xIDIuNzggMS40MSAyLjc4IDIuOTYgMCAxLjY1LTEuMzUgMy0zIDNINmMtMi4yMSAwLTQtMS43OS00LTQgMC0yLjA1IDEuNTMtMy43NiAzLjU2LTMuOTdsMS4wNy0uMTEuNS0uOTVDOC4wOCA3LjE0IDkuOTQgNiAxMiA2bTAtMkM5LjExIDQgNi42IDUuNjQgNS4zNSA4LjA0IDIuMzQgOC4zNiAwIDEwLjkxIDAgMTRjMCAzLjMxIDIuNjkgNiA2IDZoMTNjMi43NiAwIDUtMi4yNCA1LTUgMC0yLjY0LTIuMDUtNC43OC00LjY1LTQuOTZDMTguNjcgNi41OSAxNS42NCA0IDEyIDR6Ii8+PC9zdmc+';
Editor.cloudOffImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTI0IDE1YzAtMi42NC0yLjA1LTQuNzgtNC42NS00Ljk2QzE4LjY3IDYuNTkgMTUuNjQgNCAxMiA0Yy0xLjMzIDAtMi41Ny4zNi0zLjY1Ljk3bDEuNDkgMS40OUMxMC41MSA2LjE3IDExLjIzIDYgMTIgNmMzLjA0IDAgNS41IDIuNDYgNS41IDUuNXYuNUgxOWMxLjY2IDAgMyAxLjM0IDMgMyAwIC45OS0uNDggMS44NS0xLjIxIDIuNGwxLjQxIDEuNDFjMS4wOS0uOTIgMS44LTIuMjcgMS44LTMuODF6TTQuNDEgMy44NkwzIDUuMjdsMi43NyAyLjc3aC0uNDJDMi4zNCA4LjM2IDAgMTAuOTEgMCAxNGMwIDMuMzEgMi42OSA2IDYgNmgxMS43M2wyIDIgMS40MS0xLjQxTDQuNDEgMy44NnpNNiAxOGMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNGgxLjczbDggOEg2eiIvPjwvc3ZnPg==';
Editor.calendarImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIGZpbGw9IiMwMDAwMDAiPjxnPjxwYXRoIGQ9Ik0wLDBoMjR2MjRIMFYweiIgZmlsbD0ibm9uZSIvPjwvZz48Zz48cGF0aCBkPSJNMjAsNEg0QzIuOSw0LDIsNC45LDIsNnYxMmMwLDEuMSwwLjksMiwyLDJoMTZjMS4xLDAsMi0wLjksMi0yVjZDMjIsNC45LDIxLjEsNCwyMCw0eiBNOCwxMUg0VjZoNFYxMXogTTE0LDExaC00VjZoNFYxMXogTTIwLDExaC00VjZoNFYxMXogTTgsMThINHYtNWg0VjE4eiBNMTQsMThoLTR2LTVoNFYxOHogTTIwLDE4aC00di01aDRWMTh6Ii8+PC9nPjwvc3ZnPg==';
Editor.syncProblemImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyAxMmMwIDIuMjEuOTEgNC4yIDIuMzYgNS42NEwzIDIwaDZ2LTZsLTIuMjQgMi4yNEM1LjY4IDE1LjE1IDUgMTMuNjYgNSAxMmMwLTIuNjEgMS42Ny00LjgzIDQtNS42NVY0LjI2QzUuNTUgNS4xNSAzIDguMjcgMyAxMnptOCA1aDJ2LTJoLTJ2MnpNMjEgNGgtNnY2bDIuMjQtMi4yNEMxOC4zMiA4Ljg1IDE5IDEwLjM0IDE5IDEyYzAgMi42MS0xLjY3IDQuODMtNCA1LjY1djIuMDljMy40NS0uODkgNi00LjAxIDYtNy43NCAwLTIuMjEtLjkxLTQuMi0yLjM2LTUuNjRMMjEgNHptLTEwIDloMlY3aC0ydjZ6Ii8+PC9zdmc+';
Editor.tailSpin = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9Ii0yIC0yIDQ0IDQ0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSI4LjA0MiUiIHkxPSIwJSIgeDI9IjY1LjY4MiUiIHkyPSIyMy44NjUlIiBpZD0iYSI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM4MDgwODAiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIwJSIvPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjODA4MDgwIiBzdG9wLW9wYWNpdHk9Ii42MzEiIG9mZnNldD0iNjMuMTQ2JSIvPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjODA4MDgwIiBvZmZzZXQ9IjEwMCUiLz4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxIDEpIj4KICAgICAgICAgICAgPHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4IiBzdHJva2U9InVybCgjYSkiIHN0cm9rZS13aWR0aD0iNiI+CiAgICAgICAgICAgICAgICA8YW5pbWF0ZVRyYW5zZm9ybQogICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIKICAgICAgICAgICAgICAgICAgICB0eXBlPSJyb3RhdGUiCiAgICAgICAgICAgICAgICAgICAgZnJvbT0iMCAxOCAxOCIKICAgICAgICAgICAgICAgICAgICB0bz0iMzYwIDE4IDE4IgogICAgICAgICAgICAgICAgICAgIGR1cj0iMC45cyIKICAgICAgICAgICAgICAgICAgICByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz4KICAgICAgICAgICAgPC9wYXRoPgogICAgICAgICAgICA8Y2lyY2xlIGZpbGw9IiM4MDgwODAiIGN4PSIzNiIgY3k9IjE4IiByPSIxIj4KICAgICAgICAgICAgICAgIDxhbmltYXRlVHJhbnNmb3JtCiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIgogICAgICAgICAgICAgICAgICAgIHR5cGU9InJvdGF0ZSIKICAgICAgICAgICAgICAgICAgICBmcm9tPSIwIDE4IDE4IgogICAgICAgICAgICAgICAgICAgIHRvPSIzNjAgMTggMTgiCiAgICAgICAgICAgICAgICAgICAgZHVyPSIwLjlzIgogICAgICAgICAgICAgICAgICAgIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICAgICAgICA8L2NpcmNsZT4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPgo=';
Editor.mailImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIyIDZjMC0xLjEtLjktMi0yLTJINGMtMS4xIDAtMiAuOS0yIDJ2MTJjMCAxLjEuOSAyIDIgMmgxNmMxLjEgMCAyLS45IDItMlY2em0tMiAwbC04IDQuOTlMNCA2aDE2em0wIDEySDRWOGw4IDUgOC01djEweiIvPjwvc3ZnPg==';
Editor.cameraImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE0LjEyIDRsMS44MyAySDIwdjEySDRWNmg0LjA1bDEuODMtMmg0LjI0TTE1IDJIOUw3LjE3IDRINGMtMS4xIDAtMiAuOS0yIDJ2MTJjMCAxLjEuOSAyIDIgMmgxNmMxLjEgMCAyLS45IDItMlY2YzAtMS4xLS45LTItMi0yaC0zLjE3TDE1IDJ6bS0zIDdjMS42NSAwIDMgMS4zNSAzIDNzLTEuMzUgMy0zIDMtMy0xLjM1LTMtMyAxLjM1LTMgMy0zbTAtMmMtMi43NiAwLTUgMi4yNC01IDVzMi4yNCA1IDUgNSA1LTIuMjQgNS01LTIuMjQtNS01LTV6Ii8+PC9zdmc+';
Editor.tagsImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjE4cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE4cHgiIGZpbGw9IiMwMDAwMDAiPjxnPjxwYXRoIGQ9Ik0wLDBoMjR2MjRIMFYweiIgZmlsbD0ibm9uZSIvPjwvZz48Zz48Zz48cGF0aCBkPSJNMjEuNDEsMTEuNDFsLTguODMtOC44M0MxMi4yMSwyLjIxLDExLjcsMiwxMS4xNywySDRDMi45LDIsMiwyLjksMiw0djcuMTdjMCwwLjUzLDAuMjEsMS4wNCwwLjU5LDEuNDFsOC44Myw4LjgzIGMwLjc4LDAuNzgsMi4wNSwwLjc4LDIuODMsMGw3LjE3LTcuMTdDMjIuMiwxMy40NiwyMi4yLDEyLjIsMjEuNDEsMTEuNDF6IE0xMi44MywyMEw0LDExLjE3VjRoNy4xN0wyMCwxMi44M0wxMi44MywyMHoiLz48Y2lyY2xlIGN4PSI2LjUiIGN5PSI2LjUiIHI9IjEuNSIvPjwvZz48L2c+PC9zdmc+';
Editor.darkModeImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0iTTEyIDIxcS0zLjc1IDAtNi4zNzUtMi42MjVUMyAxMnEwLTMuNzUgMi42MjUtNi4zNzVUMTIgM3EuMzUgMCAuNjg4LjAyNS4zMzcuMDI1LjY2Mi4wNzUtMS4wMjUuNzI1LTEuNjM3IDEuODg3UTExLjEgNi4xNSAxMS4xIDcuNXEwIDIuMjUgMS41NzUgMy44MjVRMTQuMjUgMTIuOSAxNi41IDEyLjlxMS4zNzUgMCAyLjUyNS0uNjEzIDEuMTUtLjYxMiAxLjg3NS0xLjYzNy4wNS4zMjUuMDc1LjY2MlEyMSAxMS42NSAyMSAxMnEwIDMuNzUtMi42MjUgNi4zNzVUMTIgMjFabTAtMnEyLjIgMCAzLjk1LTEuMjEyIDEuNzUtMS4yMTMgMi41NS0zLjE2My0uNS4xMjUtMSAuMi0uNS4wNzUtMSAuMDc1LTMuMDc1IDAtNS4yMzgtMi4xNjJROS4xIDEwLjU3NSA5LjEgNy41cTAtLjUuMDc1LTF0LjItMXEtMS45NS44LTMuMTYyIDIuNTVRNSA5LjggNSAxMnEwIDIuOSAyLjA1IDQuOTVROS4xIDE5IDEyIDE5Wm0tLjI1LTYuNzVaIi8+PC9zdmc+';
Editor.lightModeImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0iTTEyIDE1cTEuMjUgMCAyLjEyNS0uODc1VDE1IDEycTAtMS4yNS0uODc1LTIuMTI1VDEyIDlxLTEuMjUgMC0yLjEyNS44NzVUOSAxMnEwIDEuMjUuODc1IDIuMTI1VDEyIDE1Wm0wIDJxLTIuMDc1IDAtMy41MzctMS40NjNRNyAxNC4wNzUgNyAxMnQxLjQ2My0zLjUzOFE5LjkyNSA3IDEyIDd0My41MzggMS40NjJRMTcgOS45MjUgMTcgMTJxMCAyLjA3NS0xLjQ2MiAzLjUzN1ExNC4wNzUgMTcgMTIgMTdaTTIgMTNxLS40MjUgMC0uNzEyLS4yODhRMSAxMi40MjUgMSAxMnQuMjg4LS43MTNRMS41NzUgMTEgMiAxMWgycS40MjUgMCAuNzEzLjI4N1E1IDExLjU3NSA1IDEydC0uMjg3LjcxMlE0LjQyNSAxMyA0IDEzWm0xOCAwcS0uNDI1IDAtLjcxMi0uMjg4UTE5IDEyLjQyNSAxOSAxMnQuMjg4LS43MTNRMTkuNTc1IDExIDIwIDExaDJxLjQyNSAwIC43MTIuMjg3LjI4OC4yODguMjg4LjcxM3QtLjI4OC43MTJRMjIuNDI1IDEzIDIyIDEzWm0tOC04cS0uNDI1IDAtLjcxMi0uMjg4UTExIDQuNDI1IDExIDRWMnEwLS40MjUuMjg4LS43MTNRMTEuNTc1IDEgMTIgMXQuNzEzLjI4N1ExMyAxLjU3NSAxMyAydjJxMCAuNDI1LS4yODcuNzEyUTEyLjQyNSA1IDEyIDVabTAgMThxLS40MjUgMC0uNzEyLS4yODhRMTEgMjIuNDI1IDExIDIydi0ycTAtLjQyNS4yODgtLjcxMlExMS41NzUgMTkgMTIgMTl0LjcxMy4yODhRMTMgMTkuNTc1IDEzIDIwdjJxMCAuNDI1LS4yODcuNzEyUTEyLjQyNSAyMyAxMiAyM1pNNS42NSA3LjA1IDQuNTc1IDZxLS4zLS4yNzUtLjI4OC0uNy4wMTMtLjQyNS4yODgtLjcyNS4zLS4zLjcyNS0uM3QuNy4zTDcuMDUgNS42NXEuMjc1LjMuMjc1LjcgMCAuNC0uMjc1LjctLjI3NS4zLS42ODcuMjg3LS40MTMtLjAxMi0uNzEzLS4yODdaTTE4IDE5LjQyNWwtMS4wNS0xLjA3NXEtLjI3NS0uMy0uMjc1LS43MTIgMC0uNDEzLjI3NS0uNjg4LjI3NS0uMy42ODgtLjI4Ny40MTIuMDEyLjcxMi4yODdMMTkuNDI1IDE4cS4zLjI3NS4yODguNy0uMDEzLjQyNS0uMjg4LjcyNS0uMy4zLS43MjUuM3QtLjctLjNaTTE2Ljk1IDcuMDVxLS4zLS4yNzUtLjI4Ny0uNjg4LjAxMi0uNDEyLjI4Ny0uNzEyTDE4IDQuNTc1cS4yNzUtLjMuNy0uMjg4LjQyNS4wMTMuNzI1LjI4OC4zLjMuMy43MjV0LS4zLjdMMTguMzUgNy4wNXEtLjMuMjc1LS43LjI3NS0uNCAwLS43LS4yNzVaTTQuNTc1IDE5LjQyNXEtLjMtLjMtLjMtLjcyNXQuMy0uN2wxLjA3NS0xLjA1cS4zLS4yNzUuNzEzLS4yNzUuNDEyIDAgLjY4Ny4yNzUuMy4yNzUuMjg4LjY4OC0uMDEzLjQxMi0uMjg4LjcxMkw2IDE5LjQyNXEtLjI3NS4zLS43LjI4Ny0uNDI1LS4wMTItLjcyNS0uMjg3Wk0xMiAxMloiLz48L3N2Zz4=';
Editor.spinImage =
	'data:image/gif;base64,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';
Editor.errorImage = 'data:image/gif;base64,R0lGODlhEAAQAPcAAADGAIQAAISEhP8AAP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yH5BAEAAAAALAAAAAAQABAAAAhoAAEIFBigYMGBCAkGGMCQ4cGECxtKHBAAYUQCEzFSHLiQgMeGHjEGEAAg4oCQJz86LCkxpEqHAkwyRClxpEyXGmGaREmTIsmOL1GO/DkzI0yOE2sKIMlRJsWhCQHENDiUaVSpS5cmDAgAOw==';
Editor.smallPlusImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDdCMTdENjVCOEM4MTFFNDlCRjVBNDdCODU5NjNBNUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDdCMTdENjZCOEM4MTFFNDlCRjVBNDdCODU5NjNBNUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowN0IxN0Q2M0I4QzgxMUU0OUJGNUE0N0I4NTk2M0E1QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowN0IxN0Q2NEI4QzgxMUU0OUJGNUE0N0I4NTk2M0E1QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtjrjmgAAAAtSURBVHjaYvz//z8DMigvLwcLdHZ2MiKLMzEQCaivkLGsrOw/dU0cAr4GCDAARQsQbTFrv10AAAAASUVORK5CYII=';
Editor.hiResImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA+CAMAAACLMWy1AAAAh1BMVEUAAABMTExERERBQUFBQUFFRUVAQEBCQkJAQEA6OjpDQ0NKSkpBQUFBQUFERERERERBQUFCQkJCQkJCQkJJSUlBQUFCQkJDQ0NDQ0NCQkJDQ0NBQUFBQUFCQkJBQUFCQkJCQkJDQ0NCQkJHR0dBQUFCQkJCQkJAQEBCQkJDQ0NAQEBERERCQkIk1hS2AAAAKnRSTlMAAjj96BL7PgQFRwfu3TYazKuVjRXl1V1DPCn1uLGjnWNVIgy9hU40eGqPkM38AAACG0lEQVRYw+2X63KbMBCFzwZblgGDceN74muatpLe//m6MHV3gHGFAv2RjM94MAbxzdnVsQbBDKwH8AH8MDAyafzjqYeyOG04XE7RS8nIRDXg6BlT+rA0nmtAPh+NQRDxIASIMG44rAMrGunBgHwy3uUldxggIStGKp2f+DQc2O4h4eQsX3O2IFB/oEbsjOKbStnjAEA+zJ0ylZTbgvoDn8xNyn6Dbj5Kd4GsNpABa6duQPfSdEj88TgMAhKuCWjAkgmFXPLnsD0pWd3OFGdrMugQII/eOMPEiGOzqPMIeWrcSoMCg71W1pXBPvCP+gS/OdXqQ3uW23+93XGWLl/OaBb805bNcBPoEIcVJsnHzcxpZH86u5KZ9gDby5dQCcnKqdbke4ItI4Tzd7IW9hZQt4EO6GG9b9sYuuK9Wwn8TIr2xKbF2+3Nhr+qxChJ/AI6pIfCu4z4Zowp4ZUNihz79vewzctnHDwTvQO/hCdFBzrUGDOPn2Y/F8YKT4oOATLvlhOznzmBSdFBJWtc58y7r+UVFOCQczy3wpN6pegDqHtsCPTGvH9JuTO0Dyg8icldYPk+RB6g8Aofj4m2EKBvtTmUPD9xDd1pPcSReV2U5iD/ik2yrngtvvqBfPzOvKiDTKTsCdoHZJ7pLLffgTwlJ5vJdtJV2/jiAYaLvLGhMAEDO5QcDg2M/jOw/8Zn+K3ZwJvHT7ZffgC/NvA3zcybTeIfE4EAAAAASUVORK5CYII=';
Editor.loResImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA+CAMAAACLMWy1AAAAS1BMVEVAQEAAAAA1NTVBQUFDQ0NDQ0NFRUVERERBQUFBQUFBQUFAQEBBQUFBQUFCQkJCQkJCQkJBQUFCQkJDQ0NDQ0NCQkJCQkJCQkJGRkb5/XqTAAAAGXRSTlP+AAWODlASCsesX+Lc2LyWe3pwa1tCPjohjSJfoAAAAI1JREFUWMPt1MkKhTAMRuG0anvneXr/J71nUypKcdqI/N8yhLMKMZE1CahnClDQzMPB44ED3EgeCubgDWnWQMHpwTtKwTe+UHD4sJ94wbUEHHFGhILlYDeSnsQeabeCgsPBgB0MOZZ9oGA5GJFiJSfUULAfjLjARrhCwX7wh2YCDwVbwZkUBKqFFJRN+wOcwSgR2sREcgAAAABJRU5ErkJggg==';
Editor.blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
// Editor.facebookImage = IMAGE_PATH + '/facebook.png';
// Editor.tweetImage = IMAGE_PATH + '/tweet.png';

/**
 *
 */
Editor.lightCheckmarkImage = 'data:image/gif;base64,R0lGODlhFQAVAMQfAGxsbHx8fIqKioaGhvb29nJycvr6+sDAwJqamltbW5OTk+np6YGBgeTk5Ly8vJiYmP39/fLy8qWlpa6ursjIyOLi4vj4+N/f3+3t7fT09LCwsHZ2dubm5r6+vmZmZv///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEY4NTZERTQ5QUFBMTFFMUE5MTVDOTM5MUZGMTE3M0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEY4NTZERTU5QUFBMTFFMUE5MTVDOTM5MUZGMTE3M0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4Rjg1NkRFMjlBQUExMUUxQTkxNUM5MzkxRkYxMTczRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4Rjg1NkRFMzlBQUExMUUxQTkxNUM5MzkxRkYxMTczRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAEAAB8ALAAAAAAVABUAAAVI4CeOZGmeaKqubKtylktSgCOLRyLd3+QJEJnh4VHcMoOfYQXQLBcBD4PA6ngGlIInEHEhPOANRkaIFhq8SuHCE1Hb8Lh8LgsBADs=';
Editor.darkCheckmarkImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAMAAACeyVWkAAAARVBMVEUAAACZmZkICAgEBASNjY2Dg4MYGBiTk5N5eXl1dXVmZmZQUFBCQkI3NzceHh4MDAykpKSJiYl+fn5sbGxaWlo/Pz8SEhK96uPlAAAAAXRSTlMAQObYZgAAAE5JREFUGNPFzTcSgDAQQ1HJGUfy/Y9K7V1qeOUfzQifCQZai1XHaz11LFysbDbzgDSSWMZiETz3+b8yNUc/MMsktxuC8XQBSncdLwz+8gCCggGXzBcozAAAAABJRU5ErkJggg==';
Editor.darkHelpImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAP1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////9Du/pqAAAAFXRSTlMAT30qCJRBboyDZyCgRzUUdF46MJlgXETgAAAAeklEQVQY022O2w4DIQhEQUURda/9/28tUO2+7CQS5sgQ4F1RapX78YUwRqQjTU8ILqQfKerTKTvACJ4nLX3krt+8aS82oI8aQC4KavRgtvEW/mDvsICgA03PSGRr79MqX1YPNIxzjyqtw8ZnnRo4t5a5undtJYRywau+ds4Cyza3E6YAAAAASUVORK5CYII=';
Editor.lightHelpImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+PHBhdGggZD0iTTExIDE4aDJ2LTJoLTJ2MnptMS0xNkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6bTAtMTRjLTIuMjEgMC00IDEuNzktNCA0aDJjMC0xLjEuOS0yIDItMnMyIC45IDIgMmMwIDItMyAxLjc1LTMgNWgyYzAtMi4yNSAzLTIuNSAzLTUgMC0yLjIxLTEuNzktNC00LTR6Ii8+PC9zdmc+';
Editor.menuImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTMgMThoMTh2LTJIM3Yyem0wLTVoMTh2LTJIM3Yyem0wLTd2MmgxOFY2SDN6Ii8+PC9zdmc+';
Editor.moveImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI4cHgiIGhlaWdodD0iMjhweCI+PGc+PC9nPjxnPjxnPjxnPjxwYXRoIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIuNCwyLjQpc2NhbGUoMC44KXJvdGF0ZSg0NSwxMiwxMikiIHN0cm9rZT0iIzI5YjZmMiIgZmlsbD0iIzI5YjZmMiIgZD0iTTE1LDNsMi4zLDIuM2wtMi44OSwyLjg3bDEuNDIsMS40MkwxOC43LDYuN0wyMSw5VjNIMTV6IE0zLDlsMi4zLTIuM2wyLjg3LDIuODlsMS40Mi0xLjQyTDYuNyw1LjNMOSwzSDNWOXogTTksMjEgbC0yLjMtMi4zbDIuODktMi44N2wtMS40Mi0xLjQyTDUuMywxNy4zTDMsMTV2Nkg5eiBNMjEsMTVsLTIuMywyLjNsLTIuODctMi44OWwtMS40MiwxLjQybDIuODksMi44N0wxNSwyMWg2VjE1eiIvPjwvZz48L2c+PC9nPjwvc3ZnPgo=';
Editor.zoomInImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTUuNSAxNGgtLjc5bC0uMjgtLjI3QzE1LjQxIDEyLjU5IDE2IDExLjExIDE2IDkuNSAxNiA1LjkxIDEzLjA5IDMgOS41IDNTMyA1LjkxIDMgOS41IDUuOTEgMTYgOS41IDE2YzEuNjEgMCAzLjA5LS41OSA0LjIzLTEuNTdsLjI3LjI4di43OWw1IDQuOTlMMjAuNDkgMTlsLTQuOTktNXptLTYgMEM3LjAxIDE0IDUgMTEuOTkgNSA5LjVTNy4wMSA1IDkuNSA1IDE0IDcuMDEgMTQgOS41IDExLjk5IDE0IDkuNSAxNHptMi41LTRoLTJ2Mkg5di0ySDdWOWgyVjdoMXYyaDJ2MXoiLz48L3N2Zz4=';
Editor.zoomOutImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTUuNSAxNGgtLjc5bC0uMjgtLjI3QzE1LjQxIDEyLjU5IDE2IDExLjExIDE2IDkuNSAxNiA1LjkxIDEzLjA5IDMgOS41IDNTMyA1LjkxIDMgOS41IDUuOTEgMTYgOS41IDE2YzEuNjEgMCAzLjA5LS41OSA0LjIzLTEuNTdsLjI3LjI4di43OWw1IDQuOTlMMjAuNDkgMTlsLTQuOTktNXptLTYgMEM3LjAxIDE0IDUgMTEuOTkgNSA5LjVTNy4wMSA1IDkuNSA1IDE0IDcuMDEgMTQgOS41IDExLjk5IDE0IDkuNSAxNHpNNyA5aDV2MUg3eiIvPjwvc3ZnPg==';
Editor.fullscreenImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA1djRoMlY1aDRWM0g1Yy0xLjEgMC0yIC45LTIgMnptMiAxMEgzdjRjMCAxLjEuOSAyIDIgMmg0di0ySDV2LTR6bTE0IDRoLTR2Mmg0YzEuMSAwIDItLjkgMi0ydi00aC0ydjR6bTAtMTZoLTR2Mmg0djRoMlY1YzAtMS4xLS45LTItMi0yeiIvPjwvc3ZnPg==';
Editor.fullscreenExitImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTUgMTZoM3YzaDJ2LTVINXYyem0zLThINXYyaDVWNUg4djN6bTYgMTFoMnYtM2gzdi0yaC01djV6bTItMTFWNWgtMnY1aDVWOGgtM3oiLz48L3N2Zz4=';
Editor.zoomFitImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTUgMTVIM3Y0YzAgMS4xLjkgMiAyIDJoNHYtMkg1di00ek01IDVoNFYzSDVjLTEuMSAwLTIgLjktMiAydjRoMlY1em03IDNjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNC00em0wIDZjLTEuMSAwLTItLjktMi0ycy45LTIgMi0yIDIgLjkgMiAyLS45IDItMiAyem03LTExaC00djJoNHY0aDJWNWMwLTEuMS0uOS0yLTItMnptMCAxNmgtNHYyaDRjMS4xIDAgMi0uOSAyLTJ2LTRoLTJ2NHoiLz48L3N2Zz4=';
Editor.layersImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTExLjk5IDE4LjU0bC03LjM3LTUuNzNMMyAxNC4wN2w5IDcgOS03LTEuNjMtMS4yN3pNMTIgMTZsNy4zNi01LjczTDIxIDlsLTktNy05IDcgMS42MyAxLjI3TDEyIDE2em0wLTExLjQ3TDE3Ljc0IDkgMTIgMTMuNDcgNi4yNiA5IDEyIDQuNTN6Ii8+PC9zdmc+';
Editor.previousImage = 'data:image/png;base64,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';
Editor.nextImage = 'data:image/png;base64,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';
Editor.editImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE0LjA2IDkuMDJsLjkyLjkyTDUuOTIgMTlINXYtLjkybDkuMDYtOS4wNk0xNy42NiAzYy0uMjUgMC0uNTEuMS0uNy4yOWwtMS44MyAxLjgzIDMuNzUgMy43NSAxLjgzLTEuODNjLjM5LS4zOS4zOS0xLjAyIDAtMS40MWwtMi4zNC0yLjM0Yy0uMi0uMi0uNDUtLjI5LS43MS0uMjl6bS0zLjYgMy4xOUwzIDE3LjI1VjIxaDMuNzVMMTcuODEgOS45NGwtMy43NS0zLjc1eiIvPjwvc3ZnPg==';
Editor.duplicateImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE2IDFINGMtMS4xIDAtMiAuOS0yIDJ2MTRoMlYzaDEyVjF6bTMgNEg4Yy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDIgMiAyaDExYzEuMSAwIDItLjkgMi0yVjdjMC0xLjEtLjktMi0yLTJ6bTAgMTZIOFY3aDExdjE0eiIvPjwvc3ZnPg==';
Editor.addImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE5IDEzaC02djZoLTJ2LTZINXYtMmg2VjVoMnY2aDZ2MnoiLz48L3N2Zz4=';
Editor.crossImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE5IDYuNDFMMTcuNTkgNSAxMiAxMC41OSA2LjQxIDUgNSA2LjQxIDEwLjU5IDEyIDUgMTcuNTkgNi40MSAxOSAxMiAxMy40MSAxNy41OSAxOSAxOSAxNy41OSAxMy40MSAxMiAxOSA2LjQxeiIvPjwvc3ZnPg==';
Editor.verticalDotsImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyIDhjMS4xIDAgMi0uOSAyLTJzLS45LTItMi0yLTIgLjktMiAyIC45IDIgMiAyem0wIDJjLTEuMSAwLTIgLjktMiAycy45IDIgMiAyIDItLjkgMi0yLS45LTItMi0yem0wIDZjLTEuMSAwLTIgLjktMiAycy45IDIgMiAyIDItLjkgMi0yLS45LTItMi0yeiIvPjwvc3ZnPg==';
Editor.trashImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE2IDl2MTBIOFY5aDhtLTEuNS02aC01bC0xIDFINXYyaDE0VjRoLTMuNWwtMS0xek0xOCA3SDZ2MTJjMCAxLjEuOSAyIDIgMmg4YzEuMSAwIDItLjkgMi0yVjd6Ii8+PC9zdmc+';
Editor.hiddenImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6bTAgMGgyNHYyNEgwVjB6bTAgMGgyNHYyNEgwVjB6bTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyIDZjMy43OSAwIDcuMTcgMi4xMyA4LjgyIDUuNS0uNTkgMS4yMi0xLjQyIDIuMjctMi40MSAzLjEybDEuNDEgMS40MWMxLjM5LTEuMjMgMi40OS0yLjc3IDMuMTgtNC41M0MyMS4yNyA3LjExIDE3IDQgMTIgNGMtMS4yNyAwLTIuNDkuMi0zLjY0LjU3bDEuNjUgMS42NUMxMC42NiA2LjA5IDExLjMyIDYgMTIgNnptLTEuMDcgMS4xNEwxMyA5LjIxYy41Ny4yNSAxLjAzLjcxIDEuMjggMS4yOGwyLjA3IDIuMDdjLjA4LS4zNC4xNC0uNy4xNC0xLjA3QzE2LjUgOS4wMSAxNC40OCA3IDEyIDdjLS4zNyAwLS43Mi4wNS0xLjA3LjE0ek0yLjAxIDMuODdsMi42OCAyLjY4QzMuMDYgNy44MyAxLjc3IDkuNTMgMSAxMS41IDIuNzMgMTUuODkgNyAxOSAxMiAxOWMxLjUyIDAgMi45OC0uMjkgNC4zMi0uODJsMy40MiAzLjQyIDEuNDEtMS40MUwzLjQyIDIuNDUgMi4wMSAzLjg3em03LjUgNy41bDIuNjEgMi42MWMtLjA0LjAxLS4wOC4wMi0uMTIuMDItMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjUgMC0uMDUuMDEtLjA4LjAxLS4xM3ptLTMuNC0zLjRsMS43NSAxLjc1Yy0uMjMuNTUtLjM2IDEuMTUtLjM2IDEuNzggMCAyLjQ4IDIuMDIgNC41IDQuNSA0LjUuNjMgMCAxLjIzLS4xMyAxLjc3LS4zNmwuOTguOThjLS44OC4yNC0xLjguMzgtMi43NS4zOC0zLjc5IDAtNy4xNy0yLjEzLTguODItNS41LjctMS40MyAxLjcyLTIuNjEgMi45My0zLjUzeiIvPjwvc3ZnPg==';
Editor.visibleImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyIDZjMy43OSAwIDcuMTcgMi4xMyA4LjgyIDUuNUMxOS4xNyAxNC44NyAxNS43OSAxNyAxMiAxN3MtNy4xNy0yLjEzLTguODItNS41QzQuODMgOC4xMyA4LjIxIDYgMTIgNm0wLTJDNyA0IDIuNzMgNy4xMSAxIDExLjUgMi43MyAxNS44OSA3IDE5IDEyIDE5czkuMjctMy4xMSAxMS03LjVDMjEuMjcgNy4xMSAxNyA0IDEyIDR6bTAgNWMxLjM4IDAgMi41IDEuMTIgMi41IDIuNVMxMy4zOCAxNCAxMiAxNHMtMi41LTEuMTItMi41LTIuNVMxMC42MiA5IDEyIDltMC0yYy0yLjQ4IDAtNC41IDIuMDItNC41IDQuNVM5LjUyIDE2IDEyIDE2czQuNS0yLjAyIDQuNS00LjVTMTQuNDggNyAxMiA3eiIvPjwvc3ZnPg==';
Editor.lockedImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PGcgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6Ii8+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBvcGFjaXR5PSIuODciLz48L2c+PHBhdGggZD0iTTE4IDhoLTFWNmMwLTIuNzYtMi4yNC01LTUtNVM3IDMuMjQgNyA2djJINmMtMS4xIDAtMiAuOS0yIDJ2MTBjMCAxLjEuOSAyIDIgMmgxMmMxLjEgMCAyLS45IDItMlYxMGMwLTEuMS0uOS0yLTItMnpNOSA2YzAtMS42NiAxLjM0LTMgMy0zczMgMS4zNCAzIDN2Mkg5VjZ6bTkgMTRINlYxMGgxMnYxMHptLTYtM2MxLjEgMCAyLS45IDItMnMtLjktMi0yLTItMiAuOS0yIDIgLjkgMiAyIDJ6Ii8+PC9zdmc+';
Editor.unlockedImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE4IDhoLTFWNmMwLTIuNzYtMi4yNC01LTUtNVM3IDMuMjQgNyA2aDJjMC0xLjY2IDEuMzQtMyAzLTNzMyAxLjM0IDMgM3YySDZjLTEuMSAwLTIgLjktMiAydjEwYzAgMS4xLjkgMiAyIDJoMTJjMS4xIDAgMi0uOSAyLTJWMTBjMC0xLjEtLjktMi0yLTJ6bTAgMTJINlYxMGgxMnYxMHptLTYtM2MxLjEgMCAyLS45IDItMnMtLjktMi0yLTItMiAuOS0yIDIgLjkgMiAyIDJ6Ii8+PC9zdmc+';
Editor.printImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE5IDhoLTFWM0g2djVINWMtMS42NiAwLTMgMS4zNC0zIDN2Nmg0djRoMTJ2LTRoNHYtNmMwLTEuNjYtMS4zNC0zLTMtM3pNOCA1aDh2M0g4VjV6bTggMTJ2Mkg4di00aDh2MnptMi0ydi0ySDZ2Mkg0di00YzAtLjU1LjQ1LTEgMS0xaDE0Yy41NSAwIDEgLjQ1IDEgMXY0aC0yeiIvPjxjaXJjbGUgY3g9IjE4IiBjeT0iMTEuNSIgcj0iMSIvPjwvc3ZnPg==';
Editor.refreshImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE3LjY1IDYuMzVDMTYuMiA0LjkgMTQuMjEgNCAxMiA0Yy00LjQyIDAtNy45OSAzLjU4LTcuOTkgOHMzLjU3IDggNy45OSA4YzMuNzMgMCA2Ljg0LTIuNTUgNy43My02aC0yLjA4Yy0uODIgMi4zMy0zLjA0IDQtNS42NSA0LTMuMzEgMC02LTIuNjktNi02czIuNjktNiA2LTZjMS42NiAwIDMuMTQuNjkgNC4yMiAxLjc4TDEzIDExaDdWNGwtMi4zNSAyLjM1eiIvPjwvc3ZnPg==';
Editor.backImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIiBvcGFjaXR5PSIuODciLz48cGF0aCBkPSJNMTcuNTEgMy44N0wxNS43MyAyLjEgNS44NCAxMmw5LjkgOS45IDEuNzctMS43N0w5LjM4IDEybDguMTMtOC4xM3oiLz48L3N2Zz4=';
Editor.closeImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIiBvcGFjaXR5PSIuODciLz48cGF0aCBkPSJNMTIgMkM2LjQ3IDIgMiA2LjQ3IDIgMTJzNC40NyAxMCAxMCAxMCAxMC00LjQ3IDEwLTEwUzE3LjUzIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6bTMuNTktMTNMMTIgMTAuNTkgOC40MSA3IDcgOC40MSAxMC41OSAxMiA3IDE1LjU5IDguNDEgMTcgMTIgMTMuNDEgMTUuNTkgMTcgMTcgMTUuNTkgMTMuNDEgMTIgMTcgOC40MXoiLz48L3N2Zz4=';
Editor.closeBlackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjZweCI+PGVsbGlwc2UgY3g9IjEyIiBjeT0iMTIiIHJ4PSI5IiByeT0iOSIgc3Ryb2tlPSJub25lIiBmaWxsPSIjMDAwIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE0LjU5IDhMMTIgMTAuNTkgOS40MSA4IDggOS40MSAxMC41OSAxMiA4IDE0LjU5IDkuNDEgMTYgMTIgMTMuNDEgMTQuNTkgMTYgMTYgMTQuNTkgMTMuNDEgMTIgMTYgOS40MSAxNC41OSA4ek0xMiAyQzYuNDcgMiAyIDYuNDcgMiAxMnM0LjQ3IDEwIDEwIDEwIDEwLTQuNDcgMTAtMTBTMTcuNTMgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=';
Editor.minusImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTEwIDI1LjV2LTNoMjh2M1oiLz48L3N2Zz4=';
Editor.plusImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgMTNoLTZ2NmgtMnYtNkg1di0yaDZWNWgydjZoNnYyeiIvPjwvc3ZnPg==';
Editor.addBoxImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0iTTExIDE3aDJ2LTRoNHYtMmgtNFY3aC0ydjRIN3YyaDRabS02IDRxLS44MjUgMC0xLjQxMy0uNTg3UTMgMTkuODI1IDMgMTlWNXEwLS44MjUuNTg3LTEuNDEzUTQuMTc1IDMgNSAzaDE0cS44MjUgMCAxLjQxMy41ODdRMjEgNC4xNzUgMjEgNXYxNHEwIC44MjUtLjU4NyAxLjQxM1ExOS44MjUgMjEgMTkgMjFabTAtMmgxNFY1SDV2MTRaTTUgNXYxNFY1WiIvPjwvc3ZnPg==';
Editor.shapesImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0iTTE1IDE1Wm0tNyAyLjk1cS4yNS4wMjUuNDg4LjAzOFE4LjcyNSAxOCA5IDE4dC41MTItLjAxMnEuMjM4LS4wMTMuNDg4LS4wMzhWMjBoMTBWMTBoLTIuMDVxLjAyNS0uMjUuMDM4LS40ODhRMTggOS4yNzUgMTggOXQtLjAxMi0uNTEyUTE3Ljk3NSA4LjI1IDE3Ljk1IDhIMjBxLjgyNSAwIDEuNDEzLjU4N1EyMiA5LjE3NSAyMiAxMHYxMHEwIC44MjUtLjU4NyAxLjQxM1EyMC44MjUgMjIgMjAgMjJIMTBxLS44MjUgMC0xLjQxMi0uNTg3UTggMjAuODI1IDggMjBaTTkgMTZxLTIuOTI1IDAtNC45NjMtMi4wMzhRMiAxMS45MjUgMiA5dDIuMDM3LTQuOTYzUTYuMDc1IDIgOSAycTIuOTI1IDAgNC45NjMgMi4wMzdRMTYgNi4wNzUgMTYgOXEwIDIuOTI1LTIuMDM3IDQuOTYyUTExLjkyNSAxNiA5IDE2Wm0wLTJxMi4wNzUgMCAzLjUzOC0xLjQ2M1ExNCAxMS4wNzUgMTQgOXQtMS40NjItMy41MzdRMTEuMDc1IDQgOSA0IDYuOTI1IDQgNS40NjMgNS40NjMgNCA2LjkyNSA0IDl0MS40NjMgMy41MzdRNi45MjUgMTQgOSAxNFptMC01WiIvPjwvc3ZnPg==';
Editor.formatImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0iTTExIDIycS0uODI1IDAtMS40MTItLjU4N1E5IDIwLjgyNSA5IDIwdi00SDZxLS44MjUgMC0xLjQxMi0uNTg4UTQgMTQuODI1IDQgMTRWN3EwLTEuNjUgMS4xNzUtMi44MjVRNi4zNSAzIDggM2gxMnYxMXEwIC44MjUtLjU4NyAxLjQxMlExOC44MjUgMTYgMTggMTZoLTN2NHEwIC44MjUtLjU4NyAxLjQxM1ExMy44MjUgMjIgMTMgMjJaTTYgMTBoMTJWNWgtMXY0aC0yVjVoLTF2MmgtMlY1SDhxLS44MjUgMC0xLjQxMi41ODhRNiA2LjE3NSA2IDdabTAgNGgxMnYtMkg2djJabTAtMnYyWiIvPjwvc3ZnPg==';
Editor.freehandImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHJlY3QgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgd2lkdGg9IjI0Ii8+PHBhdGggZD0iTTQuNSw4YzEuMDQsMCwyLjM0LTEuNSw0LjI1LTEuNWMxLjUyLDAsMi43NSwxLjIzLDIuNzUsMi43NWMwLDIuMDQtMS45OSwzLjE1LTMuOTEsNC4yMkM1LjQyLDE0LjY3LDQsMTUuNTcsNCwxNyBjMCwxLjEsMC45LDIsMiwydjJjLTIuMjEsMC00LTEuNzktNC00YzAtMi43MSwyLjU2LTQuMTQsNC42Mi01LjI4YzEuNDItMC43OSwyLjg4LTEuNiwyLjg4LTIuNDdjMC0wLjQxLTAuMzQtMC43NS0wLjc1LTAuNzUgQzcuNSw4LjUsNi4yNSwxMCw0LjUsMTBDMy4xMiwxMCwyLDguODgsMiw3LjVDMiw1LjQ1LDQuMTcsMi44Myw1LDJsMS40MSwxLjQxQzUuNDEsNC40Miw0LDYuNDMsNCw3LjVDNCw3Ljc4LDQuMjIsOCw0LjUsOHogTTgsMjEgbDMuNzUsMGw4LjA2LTguMDZsLTMuNzUtMy43NUw4LDE3LjI1TDgsMjF6IE0xMCwxOC4wOGw2LjA2LTYuMDZsMC45MiwwLjkyTDEwLjkyLDE5TDEwLDE5TDEwLDE4LjA4eiBNMjAuMzcsNi4yOSBjLTAuMzktMC4zOS0xLjAyLTAuMzktMS40MSwwbC0xLjgzLDEuODNsMy43NSwzLjc1bDEuODMtMS44M2MwLjM5LTAuMzksMC4zOS0xLjAyLDAtMS40MUwyMC4zNyw2LjI5eiIvPjwvc3ZnPg==';
Editor.undoImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIuNSA4Yy0yLjY1IDAtNS4wNS45OS02LjkgMi42TDIgN3Y5aDlsLTMuNjItMy42MmMxLjM5LTEuMTYgMy4xNi0xLjg4IDUuMTItMS44OCAzLjU0IDAgNi41NSAyLjMxIDcuNiA1LjVsMi4zNy0uNzhDMjEuMDggMTEuMDMgMTcuMTUgOCAxMi41IDh6Ii8+PC9zdmc+';
Editor.redoImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTguNCAxMC42QzE2LjU1IDguOTkgMTQuMTUgOCAxMS41IDhjLTQuNjUgMC04LjU4IDMuMDMtOS45NiA3LjIyTDMuOSAxNmMxLjA1LTMuMTkgNC4wNS01LjUgNy42LTUuNSAxLjk1IDAgMy43My43MiA1LjEyIDEuODhMMTMgMTZoOVY3bC0zLjYgMy42eiIvPjwvc3ZnPg==';
Editor.outlineImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0ibTE1IDIxLTYtMi4xLTQuNjUgMS44cS0uNS4yLS45MjUtLjExM1EzIDIwLjI3NSAzIDE5Ljc1di0xNHEwLS4zMjUuMTg4LS41NzUuMTg3LS4yNS41MTItLjM3NUw5IDNsNiAyLjEgNC42NS0xLjhxLjUtLjIuOTI1LjExMi40MjUuMzEzLjQyNS44Mzh2MTRxMCAuMzI1LS4xODguNTc1LS4xODcuMjUtLjUxMi4zNzVabS0xLTIuNDVWNi44NWwtNC0xLjR2MTEuN1ptMiAwIDMtMVY1LjdsLTMgMS4xNVpNNSAxOC4zbDMtMS4xNVY1LjQ1bC0zIDFaTTE2IDYuODV2MTEuN1ptLTgtMS40djExLjdaIi8+PC9zdmc+';
Editor.saveImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMThweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE5IDEydjdINXYtN0gzdjdjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnYtN2gtMnptLTYgLjY3bDIuNTktMi41OEwxNyAxMS41bC01IDUtNS01IDEuNDEtMS40MUwxMSAxMi42N1YzaDJ2OS42N3oiLz48L3N2Zz4=';
Editor.compareImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0ibTE1Ljg1IDQwLTIuMS0yLjEgNi4wNS02LjA1SDR2LTNoMTUuOGwtNi4wNS02LjA1IDIuMS0yLjEgOS42NSA5LjY1Wm0xNi4zLTEyLjctOS42NS05LjY1TDMyLjE1IDhsMi4xIDIuMS02LjA1IDYuMDVINDR2M0gyOC4ybDYuMDUgNi4wNVoiLz48L3N2Zz4=';
Editor.expandMoreImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0ibTEyIDE1LjM3NS02LTYgMS40LTEuNCA0LjYgNC42IDQuNi00LjYgMS40IDEuNFoiLz48L3N2Zz4=';
Editor.expandLessImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0ibTcuNCAxNS4zNzUtMS40LTEuNCA2LTYgNiA2LTEuNCAxLjQtNC42LTQuNloiLz48L3N2Zz4=';
Editor.gearImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0ibTkuMjUgMjItLjQtMy4ycS0uMzI1LS4xMjUtLjYxMi0uMy0uMjg4LS4xNzUtLjU2My0uMzc1TDQuNyAxOS4zNzVsLTIuNzUtNC43NSAyLjU3NS0xLjk1UTQuNSAxMi41IDQuNSAxMi4zMzd2LS42NzVxMC0uMTYyLjAyNS0uMzM3TDEuOTUgOS4zNzVsMi43NS00Ljc1IDIuOTc1IDEuMjVxLjI3NS0uMi41NzUtLjM3NS4zLS4xNzUuNi0uM2wuNC0zLjJoNS41bC40IDMuMnEuMzI1LjEyNS42MTMuMy4yODcuMTc1LjU2Mi4zNzVsMi45NzUtMS4yNSAyLjc1IDQuNzUtMi41NzUgMS45NXEuMDI1LjE3NS4wMjUuMzM3di42NzVxMCAuMTYzLS4wNS4zMzhsMi41NzUgMS45NS0yLjc1IDQuNzUtMi45NS0xLjI1cS0uMjc1LjItLjU3NS4zNzUtLjMuMTc1LS42LjNsLS40IDMuMlptMi44LTYuNXExLjQ1IDAgMi40NzUtMS4wMjVRMTUuNTUgMTMuNDUgMTUuNTUgMTJxMC0xLjQ1LTEuMDI1LTIuNDc1UTEzLjUgOC41IDEyLjA1IDguNXEtMS40NzUgMC0yLjQ4OCAxLjAyNVE4LjU1IDEwLjU1IDguNTUgMTJxMCAxLjQ1IDEuMDEyIDIuNDc1UTEwLjU3NSAxNS41IDEyLjA1IDE1LjVabTAtMnEtLjYyNSAwLTEuMDYyLS40MzgtLjQzOC0uNDM3LS40MzgtMS4wNjJ0LjQzOC0xLjA2MnEuNDM3LS40MzggMS4wNjItLjQzOHQxLjA2My40MzhxLjQzNy40MzcuNDM3IDEuMDYydC0uNDM3IDEuMDYycS0uNDM4LjQzOC0xLjA2My40MzhaTTEyIDEyWm0tMSA4aDEuOTc1bC4zNS0yLjY1cS43NzUtLjIgMS40MzgtLjU4OC42NjItLjM4NyAxLjIxMi0uOTM3bDIuNDc1IDEuMDI1Ljk3NS0xLjctMi4xNS0xLjYyNXEuMTI1LS4zNS4xNzUtLjczOC4wNS0uMzg3LjA1LS43ODd0LS4wNS0uNzg4cS0uMDUtLjM4Ny0uMTc1LS43MzdsMi4xNS0xLjYyNS0uOTc1LTEuNy0yLjQ3NSAxLjA1cS0uNTUtLjU3NS0xLjIxMi0uOTYzLS42NjMtLjM4Ny0xLjQzOC0uNTg3TDEzIDRoLTEuOTc1bC0uMzUgMi42NXEtLjc3NS4yLTEuNDM3LjU4Ny0uNjYzLjM4OC0xLjIxMy45MzhMNS41NSA3LjE1bC0uOTc1IDEuNyAyLjE1IDEuNnEtLjEyNS4zNzUtLjE3NS43NS0uMDUuMzc1LS4wNS44IDAgLjQuMDUuNzc1dC4xNzUuNzVsLTIuMTUgMS42MjUuOTc1IDEuNyAyLjQ3NS0xLjA1cS41NS41NzUgMS4yMTMuOTYyLjY2Mi4zODggMS40MzcuNTg4WiIvPjwvc3ZnPg==';
Editor.extensionImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSIyNCI+PHBhdGggZD0iTTguOCAyMUg1cS0uODI1IDAtMS40MTMtLjU4N1EzIDE5LjgyNSAzIDE5di0zLjhxMS4yIDAgMi4xLS43NjIuOS0uNzYzLjktMS45MzggMC0xLjE3NS0uOS0xLjkzOFE0LjIgOS44IDMgOS44VjZxMC0uODI1LjU4Ny0xLjQxMlE0LjE3NSA0IDUgNGg0cTAtMS4wNS43MjUtMS43NzVRMTAuNDUgMS41IDExLjUgMS41cTEuMDUgMCAxLjc3NS43MjVRMTQgMi45NSAxNCA0aDRxLjgyNSAwIDEuNDEzLjU4OFEyMCA1LjE3NSAyMCA2djRxMS4wNSAwIDEuNzc1LjcyNS43MjUuNzI1LjcyNSAxLjc3NSAwIDEuMDUtLjcyNSAxLjc3NVEyMS4wNSAxNSAyMCAxNXY0cTAgLjgyNS0uNTg3IDEuNDEzUTE4LjgyNSAyMSAxOCAyMWgtMy44cTAtMS4yNS0uNzg3LTIuMTI1UTEyLjYyNSAxOCAxMS41IDE4dC0xLjkxMi44NzVROC44IDE5Ljc1IDguOCAyMVpNNSAxOWgyLjEyNXEuNi0xLjY1IDEuOTI1LTIuMzI1UTEwLjM3NSAxNiAxMS41IDE2cTEuMTI1IDAgMi40NS42NzUgMS4zMjUuNjc1IDEuOTI1IDIuMzI1SDE4di02aDJxLjIgMCAuMzUtLjE1LjE1LS4xNS4xNS0uMzUgMC0uMi0uMTUtLjM1UTIwLjIgMTIgMjAgMTJoLTJWNmgtNlY0cTAtLjItLjE1LS4zNS0uMTUtLjE1LS4zNS0uMTUtLjIgMC0uMzUuMTVRMTEgMy44IDExIDR2Mkg1djIuMnExLjM1LjUgMi4xNzUgMS42NzVROCAxMS4wNSA4IDEyLjVxMCAxLjQyNS0uODI1IDIuNlQ1IDE2LjhabTcuNzUtNy43NVoiLz48L3N2Zz4=';
Editor.colorDropperImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHdpZHRoPSI0OCI+PHBhdGggZD0iTTYgNDJ2LTguNGwxOC44NS0xOC44NS0zLjYtMy42TDIzLjMgOS4xbDQuNiA0LjZMMzUgNi42cS41NS0uNTUgMS4xNzUtLjU1dDEuMTc1LjU1bDQuMDUgNC4wNXEuNTUuNTUuNTUgMS4xNzVUNDEuNCAxM2wtNy4xIDcuMSA0LjYgNC42LTIuMDUgMi4wNS0zLjYtMy42TDE0LjQgNDJabTMtM2g0LjM1TDMxLjEgMjEuMjVsLTQuMzUtNC4zNUw5IDM0LjY1Wm0yMy4xNS0yMSA2LjItNi4yLTIuMTUtMi4xNS02LjIgNi4yWm0wIDBMMzAgMTUuODUgMzIuMTUgMThaIi8+PC9zdmc+';
Editor.helpImage = Editor.lightHelpImage;
Editor.checkmarkImage = Editor.lightCheckmarkImage;

/**
 * Broken image symbol for offline SVG.
 */
Editor.svgBrokenImage = Graph.createSvgImage(10, 10, '<rect x="0" y="0" width="10" height="10" stroke="#000" fill="transparent"/><path d="m 0 0 L 10 10 L 0 10 L 10 0" stroke="#000" fill="transparent"/>');

/**
 * Error image for not found images
 */
Editor.configurationKey = '.configuration';

/**
 * Error image for not found images
 */
Editor.settingsKey = '.drawio-config';

/**
 * Default value for custom libraries in mxSettings.
 */
Editor.defaultCustomLibraries = [];

/**
 * Default value for custom libraries in mxSettings.
 */
Editor.enableCustomLibraries = true;

/**
 * 尚未实现。支持读取未压缩。
 */
Editor.enableUncompressedLibraries = false;

/**
 * 指定是否应启用自定义属性。
 */
Editor.enableCustomProperties = false;

/**
 * 指定是否应启用简单主题。这个主题可以用
 * 在运行时在kennedy主题中。
 */
Editor.enableSimpleTheme = true;

/**
 * 指定是否应重写 URL 以包含所选页面。
 * 对于没有嵌入的在线应用程序，默认值为 true。
 */
Editor.enableHashObjects = false;

/**
 * 设置包含图表副本的默认值。
 * 默认为 true。
 */
Editor.defaultIncludeDiagram = true;

/**
 * 指定是否应启用自定义属性。
 */
Editor.enableServiceWorker = true;

/**
 * Specifies if web fonts are enabled.
 */
Editor.enableWebFonts = true;

/**
 * Disables the shadow option in the format panel.
 */
Editor.enableShadowOption = !mxClient.IS_SF;

/**
 * Disables the export URL function.
 */
Editor.enableExportUrl = true;

/**
 * Disables fast real time collaboration while keeping slower real time collaboration enabled.
 */
Editor.enableRealtime = true;

/**
 * Enables cache for patches and Pusher for messages. Default is true.
 */
Editor.enableRealtimeCache = true;

/**
 * Enables P2P instead of Pusher for messages. (Ignored if enableRealtimeCache is false.)
 * Default is false.
 */
Editor.p2pSyncNotify = false;

/**
 * Specifies if XML files should be compressed. Default is true.
 */
Editor.compressXml = true;

/**
 * Specifies if XML files should be compressed by default. Default is false.
 */
Editor.defaultCompressed = false;

/**
 * Specifies if XML files should be compressed. Default is true.
 */
Editor.oneDriveInlinePicker = true;

/**
 * Specifies global variables.
 */
Editor.globalVars = null;

/**
 * Reference to the config object passed to <configure>.
 */
Editor.config = null;

/**
 * Reference to the version of the last config object in
 * <configure>. If this is different to the last version in
 * mxSettings.parse, then the settings are reset.
 */
Editor.configVersion = null;

/**
 * Default border for image export (to allow for sketch style).
 */
Editor.defaultBorder = 5;

Editor.fillStyles = [
	{ val: 'auto', dispName: '自动' },
	{ val: 'hatch', dispName: '破壳' },
	{ val: 'solid', dispName: '固体' },
	{ val: 'dots', dispName: '点点' },
	{ val: 'cross-hatch', dispName: '网纹' },
	{ val: 'dashed', dispName: '虚线' },
	{ val: 'zigzag-line', dispName: '锯齿线' },
];

Editor.commonProperties = [
	{
		name: 'enumerate',
		dispName: 'Enumerate',
		type: 'bool',
		defVal: false,
		onChange: function (graph) {
			graph.refresh();
		},
	},
	{
		name: 'enumerateValue',
		dispName: 'Enumerate Value',
		type: 'string',
		defVal: '',
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'enumerate', '0') == '1';
		},
	},
	{
		name: 'comic',
		dispName: 'Comic',
		type: 'bool',
		defVal: false,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', '0') != '1';
		},
	},
	{
		name: 'jiggle',
		dispName: 'Jiggle',
		type: 'float',
		min: 0,
		defVal: 1,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'comic', '0') == '1' || mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1';
		},
	},
	{
		name: 'fillWeight',
		dispName: 'Fill Weight',
		type: 'int',
		defVal: -1,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1' && state.vertices.length > 0;
		},
	},
	{
		name: 'hachureGap',
		dispName: 'Hachure Gap',
		type: 'int',
		defVal: -1,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1' && state.vertices.length > 0;
		},
	},
	{
		name: 'hachureAngle',
		dispName: 'Hachure Angle',
		type: 'int',
		defVal: -41,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1' && state.vertices.length > 0;
		},
	},
	{
		name: 'curveFitting',
		dispName: 'Curve Fitting',
		type: 'float',
		defVal: 0.95,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1';
		},
	},
	{
		name: 'simplification',
		dispName: 'Simplification',
		type: 'float',
		defVal: 0,
		min: 0,
		max: 1,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1';
		},
	},
	{
		name: 'disableMultiStroke',
		dispName: 'Disable Multi Stroke',
		type: 'bool',
		defVal: false,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1';
		},
	},
	{
		name: 'disableMultiStrokeFill',
		dispName: 'Disable Multi Stroke Fill',
		type: 'bool',
		defVal: false,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1' && state.vertices.length > 0;
		},
	},
	{
		name: 'dashOffset',
		dispName: 'Dash Offset',
		type: 'int',
		defVal: -1,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1' && state.vertices.length > 0;
		},
	},
	{
		name: 'dashGap',
		dispName: 'Dash Gap',
		type: 'int',
		defVal: -1,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1' && state.vertices.length > 0;
		},
	},
	{
		name: 'zigzagOffset',
		dispName: 'ZigZag Offset',
		type: 'int',
		defVal: -1,
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1' && state.vertices.length > 0;
		},
	},
	{
		name: 'sketchStyle',
		dispName: 'Sketch Style',
		type: 'enum',
		defVal: 'rough',
		enumList: [
			{ val: 'rough', dispName: 'Rough' },
			{ val: 'comic', dispName: 'Comic' },
		],
		isVisible: function (state, format) {
			return mxUtils.getValue(state.style, 'sketch', false ? '1' : '0') == '1';
		},
	},
];

/**
 * Common properties for all edges.
 */
Editor.commonEdgeProperties = [
	{ type: 'separator' },
	{ name: 'arcSize', dispName: 'Arc Size', type: 'float', min: 0, defVal: mxConstants.LINE_ARCSIZE },
	{
		name: 'sourcePortConstraint',
		dispName: 'Source Constraint',
		type: 'enum',
		defVal: 'none',
		enumList: [
			{ val: 'none', dispName: 'None' },
			{ val: 'north', dispName: 'North' },
			{
				val: 'east',
				dispName: 'East',
			},
			{ val: 'south', dispName: 'South' },
			{ val: 'west', dispName: 'West' },
		],
	},
	{
		name: 'targetPortConstraint',
		dispName: 'Target Constraint',
		type: 'enum',
		defVal: 'none',
		enumList: [
			{ val: 'none', dispName: 'None' },
			{ val: 'north', dispName: 'North' },
			{
				val: 'east',
				dispName: 'East',
			},
			{ val: 'south', dispName: 'South' },
			{ val: 'west', dispName: 'West' },
		],
	},
	{
		name: 'jettySize',
		dispName: 'Jetty Size',
		type: 'int',
		min: 0,
		defVal: 'auto',
		allowAuto: true,
		isVisible: function (state) {
			return mxUtils.getValue(state.style, mxConstants.STYLE_EDGE, null) == 'orthogonalEdgeStyle';
		},
	},
	{ name: 'fillOpacity', dispName: 'Fill Opacity', type: 'int', min: 0, max: 100, defVal: 100 },
	{ name: 'strokeOpacity', dispName: 'Stroke Opacity', type: 'int', min: 0, max: 100, defVal: 100 },
	{ name: 'startFill', dispName: 'Start Fill', type: 'bool', defVal: true },
	{ name: 'endFill', dispName: 'End Fill', type: 'bool', defVal: true },
	{ name: 'perimeterSpacing', dispName: 'Terminal Spacing', type: 'float', defVal: 0 },
	{ name: 'anchorPointDirection', dispName: 'Anchor Direction', type: 'bool', defVal: true },
	{ name: 'snapToPoint', dispName: 'Snap to Point', type: 'bool', defVal: false },
	{ name: 'fixDash', dispName: 'Fixed Dash', type: 'bool', defVal: false },
	{ name: 'editable', dispName: 'Editable', type: 'bool', defVal: true },
	{ name: 'metaEdit', dispName: 'Edit Dialog', type: 'bool', defVal: false },
	{ name: 'backgroundOutline', dispName: 'Background Outline', type: 'bool', defVal: false },
	{ name: 'bendable', dispName: 'Bendable', type: 'bool', defVal: true },
	{ name: 'movable', dispName: 'Movable', type: 'bool', defVal: true },
	{ name: 'cloneable', dispName: 'Cloneable', type: 'bool', defVal: true },
	{ name: 'deletable', dispName: 'Deletable', type: 'bool', defVal: true },
	{ name: 'noJump', dispName: 'No Jumps', type: 'bool', defVal: false },
	{ name: 'flowAnimation', dispName: 'Flow Animation', type: 'bool', defVal: false },
	{ name: 'ignoreEdge', dispName: 'Ignore Edge', type: 'bool', defVal: false },
	{ name: 'orthogonalLoop', dispName: 'Loop Routing', type: 'bool', defVal: false },
	{ name: 'orthogonal', dispName: 'Orthogonal', type: 'bool', defVal: false },
].concat(Editor.commonProperties);

/**
 * Common properties for all vertices.
 */
Editor.commonVertexProperties = [
	{
		name: 'colspan',
		dispName: 'Colspan',
		type: 'int',
		min: 1,
		defVal: 1,
		isVisible: function (state, format) {
			var graph = format.editorUi.editor.graph;

			return state.vertices.length == 1 && state.edges.length == 0 && graph.isTableCell(state.vertices[0]);
		},
	},
	{
		name: 'rowspan',
		dispName: 'Rowspan',
		type: 'int',
		min: 1,
		defVal: 1,
		isVisible: function (state, format) {
			var graph = format.editorUi.editor.graph;

			return state.vertices.length == 1 && state.edges.length == 0 && graph.isTableCell(state.vertices[0]);
		},
	},
	{ type: 'separator' },
	{
		name: 'resizeLastRow',
		dispName: 'Resize Last Row',
		type: 'bool',
		getDefaultValue: function (state, format) {
			var cell = state.vertices.length == 1 && state.edges.length == 0 ? state.vertices[0] : null;
			var graph = format.editorUi.editor.graph;
			var style = graph.getCellStyle(cell);

			return mxUtils.getValue(style, 'resizeLastRow', '0') == '1';
		},
		isVisible: function (state, format) {
			var graph = format.editorUi.editor.graph;

			return state.vertices.length == 1 && state.edges.length == 0 && graph.isTable(state.vertices[0]);
		},
	},
	{
		name: 'resizeLast',
		dispName: 'Resize Last Column',
		type: 'bool',
		getDefaultValue: function (state, format) {
			var cell = state.vertices.length == 1 && state.edges.length == 0 ? state.vertices[0] : null;
			var graph = format.editorUi.editor.graph;
			var style = graph.getCellStyle(cell);

			return mxUtils.getValue(style, 'resizeLast', '0') == '1';
		},
		isVisible: function (state, format) {
			var graph = format.editorUi.editor.graph;

			return state.vertices.length == 1 && state.edges.length == 0 && graph.isTable(state.vertices[0]);
		},
	},
	{ name: 'fillOpacity', dispName: 'Fill Opacity', type: 'int', min: 0, max: 100, defVal: 100 },
	{ name: 'strokeOpacity', dispName: 'Stroke Opacity', type: 'int', min: 0, max: 100, defVal: 100 },
	{
		name: 'overflow',
		dispName: 'Text Overflow',
		defVal: 'visible',
		type: 'enum',
		enumList: [
			{ val: 'visible', dispName: 'Visible' },
			{ val: 'hidden', dispName: 'Hidden' },
			{
				val: 'block',
				dispName: 'Block',
			},
			{ val: 'fill', dispName: 'Fill' },
			{ val: 'width', dispName: 'Width' },
		],
	},
	{ name: 'noLabel', dispName: 'Hide Label', type: 'bool', defVal: false },
	{ name: 'labelPadding', dispName: 'Label Padding', type: 'float', defVal: 0 },
	{
		name: 'direction',
		dispName: 'Direction',
		type: 'enum',
		defVal: 'east',
		enumList: [
			{ val: 'north', dispName: 'North' },
			{ val: 'east', dispName: 'East' },
			{
				val: 'south',
				dispName: 'South',
			},
			{ val: 'west', dispName: 'West' },
		],
	},
	{
		name: 'portConstraint',
		dispName: 'Constraint',
		type: 'enum',
		defVal: 'none',
		enumList: [
			{ val: 'none', dispName: 'None' },
			{ val: 'north', dispName: 'North' },
			{
				val: 'east',
				dispName: 'East',
			},
			{ val: 'south', dispName: 'South' },
			{ val: 'west', dispName: 'West' },
		],
	},
	{ name: 'portConstraintRotation', dispName: 'Rotate Constraint', type: 'bool', defVal: false },
	{
		name: 'connectable',
		dispName: 'Connectable',
		type: 'bool',
		getDefaultValue: function (state, format) {
			var cell = state.vertices.length > 0 && state.edges.length == 0 ? state.vertices[0] : null;
			var graph = format.editorUi.editor.graph;

			return graph.isCellConnectable(cell);
		},
		isVisible: function (state, format) {
			return state.vertices.length > 0 && state.edges.length == 0;
		},
	},
	{ name: 'allowArrows', dispName: 'Allow Arrows', type: 'bool', defVal: true },
	{ name: 'snapToPoint', dispName: 'Snap to Point', type: 'bool', defVal: false },
	{
		name: 'perimeter',
		dispName: 'Perimeter',
		defVal: 'none',
		type: 'enum',
		enumList: [
			{ val: 'none', dispName: 'None' },
			{ val: 'rectanglePerimeter', dispName: 'Rectangle' },
			{ val: 'ellipsePerimeter', dispName: 'Ellipse' },
			{ val: 'rhombusPerimeter', dispName: 'Rhombus' },
			{ val: 'trianglePerimeter', dispName: 'Triangle' },
			{ val: 'hexagonPerimeter2', dispName: 'Hexagon' },
			{ val: 'lifelinePerimeter', dispName: 'Lifeline' },
			{ val: 'orthogonalPerimeter', dispName: 'Orthogonal' },
			{ val: 'backbonePerimeter', dispName: 'Backbone' },
			{ val: 'calloutPerimeter', dispName: 'Callout' },
			{ val: 'parallelogramPerimeter', dispName: 'Parallelogram' },
			{ val: 'trapezoidPerimeter', dispName: 'Trapezoid' },
			{ val: 'stepPerimeter', dispName: 'Step' },
			{ val: 'centerPerimeter', dispName: 'Center' },
		],
	},
	{ name: 'fixDash', dispName: 'Fixed Dash', type: 'bool', defVal: false },
	{
		name: 'container',
		dispName: 'Container',
		type: 'bool',
		getDefaultValue: function (state, format) {
			var cell = state.vertices.length == 1 && state.edges.length == 0 ? state.vertices[0] : null;
			var graph = format.editorUi.editor.graph;

			return cell != null && graph.isSwimlane(cell);
		},
		isVisible: function (state, format) {
			return state.vertices.length == 1 && state.edges.length == 0;
		},
	},
	{
		name: 'dropTarget',
		dispName: 'Drop Target',
		type: 'bool',
		getDefaultValue: function (state, format) {
			var cell = state.vertices.length == 1 && state.edges.length == 0 ? state.vertices[0] : null;
			var graph = format.editorUi.editor.graph;

			return cell != null && (graph.isSwimlane(cell) || graph.model.getChildCount(cell) > 0);
		},
		isVisible: function (state, format) {
			return state.vertices.length == 1 && state.edges.length == 0;
		},
	},
	{
		name: 'collapsible',
		dispName: 'Collapsible',
		type: 'bool',
		getDefaultValue: function (state, format) {
			var cell = state.vertices.length == 1 && state.edges.length == 0 ? state.vertices[0] : null;
			var graph = format.editorUi.editor.graph;

			return cell != null && ((graph.isContainer(cell) && state.style['collapsible'] != '0') || (!graph.isContainer(cell) && state.style['collapsible'] == '1'));
		},
		isVisible: function (state, format) {
			return state.vertices.length == 1 && state.edges.length == 0;
		},
	},
	{
		name: 'recursiveResize',
		dispName: 'Resize Children',
		type: 'bool',
		defVal: true,
		isVisible: function (state, format) {
			return state.vertices.length == 1 && state.edges.length == 0 && !format.editorUi.editor.graph.isSwimlane(state.vertices[0]) && mxUtils.getValue(state.style, 'childLayout', null) == null;
		},
	},
	{ name: 'expand', dispName: 'Expand', type: 'bool', defVal: true },
	{
		name: 'part',
		dispName: 'Part',
		type: 'bool',
		defVal: false,
		isVisible: function (state, format) {
			var model = format.editorUi.editor.graph.model;

			return state.vertices.length > 0 ? model.isVertex(model.getParent(state.vertices[0])) : false;
		},
	},
	{ name: 'editable', dispName: 'Editable', type: 'bool', defVal: true },
	{ name: 'metaEdit', dispName: 'Edit Dialog', type: 'bool', defVal: false },
	{ name: 'backgroundOutline', dispName: 'Background Outline', type: 'bool', defVal: false },
	{ name: 'movable', dispName: 'Movable', type: 'bool', defVal: true },
	{
		name: 'movableLabel',
		dispName: 'Movable Label',
		type: 'bool',
		defVal: false,
		isVisible: function (state, format) {
			var geo = state.vertices.length > 0 ? format.editorUi.editor.graph.getCellGeometry(state.vertices[0]) : null;

			return geo != null && !geo.relative;
		},
	},
	{ name: 'autosize', dispName: 'Autosize', type: 'bool', defVal: false },
	{ name: 'fixedWidth', dispName: 'Fixed Width', type: 'bool', defVal: false },
	{ name: 'resizable', dispName: 'Resizable', type: 'bool', defVal: true },
	{ name: 'resizeWidth', dispName: 'Resize Width', type: 'bool', defVal: false },
	{ name: 'resizeHeight', dispName: 'Resize Height', type: 'bool', defVal: false },
	{ name: 'rotatable', dispName: 'Rotatable', type: 'bool', defVal: true },
	{ name: 'cloneable', dispName: 'Cloneable', type: 'bool', defVal: true },
	{ name: 'deletable', dispName: 'Deletable', type: 'bool', defVal: true },
	{ name: 'treeFolding', dispName: 'Tree Folding', type: 'bool', defVal: false },
	{ name: 'treeMoving', dispName: 'Tree Moving', type: 'bool', defVal: false },
	{
		name: 'pointerEvents',
		dispName: 'Pointer Events',
		type: 'bool',
		defVal: true,
		isVisible: function (state, format) {
			var fillColor = mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, null);

			return format.editorUi.editor.graph.isSwimlane(state.vertices[0]) || fillColor == null || fillColor == mxConstants.NONE || mxUtils.getValue(state.style, mxConstants.STYLE_FILL_OPACITY, 100) == 0 || mxUtils.getValue(state.style, mxConstants.STYLE_OPACITY, 100) == 0 || state.style['pointerEvents'] != null;
		},
	},
	{
		name: 'moveCells',
		dispName: 'Move Cells on Fold',
		type: 'bool',
		defVal: false,
		isVisible: function (state, format) {
			return state.vertices.length > 0 && format.editorUi.editor.graph.isContainer(state.vertices[0]);
		},
	},
].concat(Editor.commonProperties);

/**
 * Default value for the CSV import dialog.
 */
Editor.defaultCsvValue =
	'##\n' +
	'## Example CSV import. Use ## for comments and # for configuration. Paste CSV below.\n' +
	'## The following names are reserved and should not be used (or ignored):\n' +
	'## id, tooltip, placeholder(s), link and label (see below)\n' +
	'##\n' +
	'#\n' +
	'## Node label with placeholders and HTML.\n' +
	"## Default is '%name_of_first_column%'.\n" +
	'#\n' +
	'# label: %name%<br><i style="color:gray;">%position%</i><br><a href="mailto:%email%">Email</a>\n' +
	'#\n' +
	'## Node style (placeholders are replaced once).\n' +
	'## Default is the current style for nodes.\n' +
	'#\n' +
	'# style: label;image=%image%;whiteSpace=wrap;html=1;rounded=1;fillColor=%fill%;strokeColor=%stroke%;\n' +
	'#\n' +
	'## Parent style for nodes with child nodes (placeholders are replaced once).\n' +
	'#\n' +
	'# parentstyle: swimlane;whiteSpace=wrap;html=1;childLayout=stackLayout;horizontal=1;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=1;\n' +
	'#\n' +
	'## Style to be used for objects not in the CSV. If this is - then such objects are ignored,\n' +
	'## else they are created using this as their style, eg. whiteSpace=wrap;html=1;\n' +
	'#\n' +
	'# unknownStyle: -\n' +
	'#\n' +
	'## Optional column name that contains a reference to a named style in styles.\n' +
	'## Default is the current style for nodes.\n' +
	'#\n' +
	'# stylename: -\n' +
	'#\n' +
	'## JSON for named styles of the form {"name": "style", "name": "style"} where style is a cell style with\n' +
	'## placeholders that are replaced once.\n' +
	'#\n' +
	'# styles: -\n' +
	'#\n' +
	'## JSON for variables in styles of the form {"name": "value", "name": "value"} where name is a string\n' +
	'## that will replace a placeholder in a style.\n' +
	'#\n' +
	'# vars: -\n' +
	'#\n' +
	'## Optional column name that contains a reference to a named label in labels.\n' +
	'## Default is the current label.\n' +
	'#\n' +
	'# labelname: -\n' +
	'#\n' +
	'## JSON for named labels of the form {"name": "label", "name": "label"} where label is a cell label with\n' +
	'## placeholders.\n' +
	'#\n' +
	'# labels: -\n' +
	'#\n' +
	'## Uses the given column name as the identity for cells (updates existing cells).\n' +
	'## Default is no identity (empty value or -).\n' +
	'#\n' +
	'# identity: -\n' +
	'#\n' +
	'## Uses the given column name as the parent reference for cells. Default is no parent (empty or -).\n' +
	'## The identity above is used for resolving the reference so it must be specified.\n' +
	'#\n' +
	'# parent: -\n' +
	'#\n' +
	'## Adds a prefix to the identity of cells to make sure they do not collide with existing cells (whose\n' +
	'## IDs are numbers from 0..n, sometimes with a GUID prefix in the context of realtime collaboration).\n' +
	'## Default is csvimport-.\n' +
	'#\n' +
	'# namespace: csvimport-\n' +
	'#\n' +
	'## Connections between rows ("from": source colum, "to": target column).\n' +
	"## Label, style and invert are optional. Defaults are '', current style and false.\n" +
	'## If placeholders are used in the style, they are replaced with data from the source.\n' +
	'## An optional placeholders can be set to target to use data from the target instead.\n' +
	'## In addition to label, an optional fromlabel and tolabel can be used to name the column\n' +
	'## that contains the text for the label in the edges source or target (invert ignored).\n' +
	'## In addition to those, an optional source and targetlabel can be used to specify a label\n' +
	'## that contains placeholders referencing the respective columns in the source or target row.\n' +
	'## The label is created in the form fromlabel + sourcelabel + label + tolabel + targetlabel.\n' +
	'## Additional labels can be added by using an optional labels array with entries of the\n' +
	'## form {"label": string, "x": number, "y": number, "dx": number, "dy": number} where\n' +
	'## x is from -1 to 1 along the edge, y is orthogonal, and dx/dy are offsets in pixels.\n' +
	'## An optional placeholders with the string value "source" or "target" can be specified\n' +
	'## to replace placeholders in the additional label with data from the source or target.\n' +
	'## The target column may contain a comma-separated list of values.\n' +
	'## Multiple connect entries are allowed.\n' +
	'#\n' +
	'# connect: {"from": "manager", "to": "name", "invert": true, "label": "manages", \\\n' +
	'#          "style": "curved=1;endArrow=blockThin;endFill=1;fontSize=11;"}\n' +
	'# connect: {"from": "refs", "to": "id", "style": "curved=1;fontSize=11;"}\n' +
	'#\n' +
	'## Node x-coordinate. Possible value is a column name. Default is empty. Layouts will\n' +
	'## override this value.\n' +
	'#\n' +
	'# left: \n' +
	'#\n' +
	'## Node y-coordinate. Possible value is a column name. Default is empty. Layouts will\n' +
	'## override this value.\n' +
	'#\n' +
	'# top: \n' +
	'#\n' +
	'## Node width. Possible value is a number (in px), auto or an @ sign followed by a column\n' +
	'## name that contains the value for the width. Default is auto.\n' +
	'#\n' +
	'# width: auto\n' +
	'#\n' +
	'## Node height. Possible value is a number (in px), auto or an @ sign followed by a column\n' +
	'## name that contains the value for the height. Default is auto.\n' +
	'#\n' +
	'# height: auto\n' +
	'#\n' +
	'## Collapsed state for vertices. Possible values are true or false. Default is false.\n' +
	'#\n' +
	'# collapsed: false\n' +
	'#\n' +
	'## Padding for autosize. Default is 0.\n' +
	'#\n' +
	'# padding: -12\n' +
	'#\n' +
	'## Comma-separated list of ignored columns for metadata. (These can be\n' +
	'## used for connections and styles but will not be added as metadata.)\n' +
	'#\n' +
	'# ignore: id,image,fill,stroke,refs,manager\n' +
	'#\n' +
	'## Column to be renamed to link attribute (used as link).\n' +
	'#\n' +
	'# link: url\n' +
	'#\n' +
	'## Spacing between nodes. Default is 40.\n' +
	'#\n' +
	'# nodespacing: 40\n' +
	'#\n' +
	'## Spacing between levels of hierarchical layouts. Default is 100.\n' +
	'#\n' +
	'# levelspacing: 100\n' +
	'#\n' +
	'## Spacing between parallel edges. Default is 40. Use 0 to disable.\n' +
	'#\n' +
	'# edgespacing: 40\n' +
	'#\n' +
	'## Name or JSON of layout. Possible values are auto, none, verticaltree, horizontaltree,\n' +
	'## verticalflow, horizontalflow, organic, circle, orgchart or a JSON string as used in\n' +
	'## Layout, Apply. Default is auto.\n' +
	'#\n' +
	'# layout: auto\n' +
	'#\n' +
	'## ---- CSV below this line. First line are column names. ----\n' +
	'name,position,id,location,manager,email,fill,stroke,refs,url,image\n' +
	'Tessa Miller,CFO,emi,Office 1,,me@example.com,default,#6c8ebf,,https://www.draw.io,https://cdn3.iconfinder.com/data/icons/user-avatars-1/512/users-3-128.png\n' +
	'Edward Morrison,Brand Manager,emo,Office 2,Tessa Miller,me@example.com,default,#82b366,,https://www.draw.io,https://cdn3.iconfinder.com/data/icons/user-avatars-1/512/users-10-3-128.png\n' +
	'Alison Donovan,System Admin,rdo,Office 3,Tessa Miller,me@example.com,default,#82b366,"emo,tva",https://www.draw.io,https://cdn3.iconfinder.com/data/icons/user-avatars-1/512/users-2-128.png\n' +
	'Evan Valet,HR Director,tva,Office 4,Tessa Miller,me@example.com,default,#82b366,,https://www.draw.io,https://cdn3.iconfinder.com/data/icons/user-avatars-1/512/users-9-2-128.png\n';

Editor.isSettingsEnabled = function () {
	return true;
};

/**
 * Returns the current state of the dark mode.
 */
Editor.isDarkMode = function (value) {
	return Editor.darkMode;
};

/**
 * Initializes the environment.
 */
Editor.prototype.init = function () {};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.isChromelessView = function () {
	return this.chromeless;
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.setAutosave = function (value) {
	this.autosave = value;
};

/**
 * Alphabet for global unique IDs.
 */
Editor.GUID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

/**
 * Default length for global unique IDs.
 */
Editor.GUID_LENGTH = 20;

/**
 * Default length for global unique IDs.
 */
Editor.guid = function (length) {
	var len = length != null ? length : Editor.GUID_LENGTH;
	var rtn = [];

	for (var i = 0; i < len; i++) {
		rtn.push(Editor.GUID_ALPHABET.charAt(Math.floor(Math.random() * Editor.GUID_ALPHABET.length)));
	}

	return rtn.join('');
};

Editor.prototype.getEditBlankUrl = function (params) {
	return this.editBlankUrl + params;
};

Editor.extractParserError = function (node, defaultCause) {
	var cause = null;
	var errors = (node != null) ? node.getElementsByTagName('parsererror') : null;

	if (errors != null && errors.length > 0) {
		cause = defaultCause || mxResources.get('invalidChars');
		var divs = errors[0].getElementsByTagName('div');

		if (divs.length > 0) {
			cause = mxUtils.getTextContent(divs[0]);
		}
	}

	return (cause != null) ? mxUtils.trim(cause) : cause;
};


Editor.prototype.editAsNew = function (xml, title) {
	let p = title != null ? '?title=' + encodeURIComponent(title) : '';

	if (typeof window.postMessage !== 'undefined' && (document.documentMode == null || document.documentMode >= 10)) {
		let wnd = null;

		var l = mxUtils.bind(this, function (evt) {
			if (evt.data == 'ready' && evt.source == wnd) {
				mxEvent.removeListener(window, 'message', l);
				wnd.postMessage(xml, '*');
			}
		});

		mxEvent.addListener(window, 'message', l);
		wnd = this.graph.openLink(this.getEditBlankUrl(p + (p.length > 0 ? '&' : '?') + 'client=1'), null, true);
	} else {
		this.graph.openLink(this.getEditBlankUrl(p) + '#R' + encodeURIComponent(xml));
	}
};

Editor.prototype.extractGraphModel = function (node, allowMxFile, checked) {
	return Editor.extractGraphModel.apply(this, arguments);
};

Editor.extractGraphModel = function (node, allowMxFile, checked) {
	if (node != null && typeof (pako) !== 'undefined') {
		var tmp = node.ownerDocument.getElementsByTagName('div');
		var divs = [];

		if (tmp != null && tmp.length > 0) {
			for (var i = 0; i < tmp.length; i++) {
				if (tmp[i].getAttribute('class') == 'mxgraph') {
					divs.push(tmp[i]);
					break;
				}
			}
		}

		if (divs.length > 0) {
			var data = divs[0].getAttribute('data-mxgraph');

			if (data != null) {
				var config = JSON.parse(data);

				if (config != null && config.xml != null) {
					var doc2 = mxUtils.parseXml(config.xml);
					node = doc2.documentElement;
				}
			}
			else {
				var divs2 = divs[0].getElementsByTagName('div');

				if (divs2.length > 0) {
					var data = mxUtils.getTextContent(divs2[0]);
					data = Graph.decompress(data, null, checked);

					if (data.length > 0) {
						var doc2 = mxUtils.parseXml(data);
						node = doc2.documentElement;
					}
				}
			}
		}
	}

	if (node != null && node.nodeName == 'svg') {
		var tmp = node.getAttribute('content');

		if (tmp != null && tmp.charAt(0) != '<' && tmp.charAt(0) != '%') {
			tmp = unescape((window.atob) ? atob(tmp) : Base64.decode(cont, tmp));
		}

		if (tmp != null && tmp.charAt(0) == '%') {
			tmp = decodeURIComponent(tmp);
		}

		if (tmp != null && tmp.length > 0) {
			node = mxUtils.parseXml(tmp).documentElement;
		}
		else {
			throw { message: mxResources.get('notADiagramFile') };
		}
	}

	if (node != null && !allowMxFile) {
		var diagramNode = null;

		if (node.nodeName == 'diagram') {
			diagramNode = node;
		}
		else if (node.nodeName == 'mxfile') {
			var diagrams = node.getElementsByTagName('diagram');

			if (diagrams.length > 0) {
				diagramNode = diagrams[Math.max(0, Math.min(diagrams.length - 1, 0))];
			}
		}

		if (diagramNode != null) {
			node = Editor.parseDiagramNode(diagramNode, checked);
		}
	}

	if (node != null && node.nodeName != 'mxGraphModel' && (!allowMxFile || node.nodeName != 'mxfile')) {
		node = null;
	}

	return node;
};

Editor.parseDiagramNode = function (diagramNode, checked) {
	var text = mxUtils.trim(mxUtils.getTextContent(diagramNode));
	var node = null;

	if (text.length > 0) {
		var tmp = Graph.decompress(text, null, checked);

		if (tmp != null && tmp.length > 0) {
			node = mxUtils.parseXml(tmp).documentElement;
		}
	}
	else {
		var temp = mxUtils.getChildNodes(diagramNode);

		if (temp.length > 0) {
			// Creates new document for unique IDs within mxGraphModel
			var doc = mxUtils.createXmlDocument();
			doc.appendChild(doc.importNode(temp[0], true));
			node = doc.documentElement;
		}
	}

	return node;
};

Editor.getDiagramNodeXml = function (diagramNode) {
	var text = mxUtils.getTextContent(diagramNode);
	var xml = null;

	if (text.length > 0) {
		xml = Graph.decompress(text);
	}
	else if (diagramNode.firstChild != null) {
		xml = mxUtils.getXml(diagramNode.firstChild);
	}

	return xml;
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.createGraph = function (themes, model) {
	const graph = new Graph(null, model, null, null, themes);
	graph.transparentBackground = false;
	//graph.getModel().getRoot().setId('root')
	// Disables CSS transforms in Safari in chromeless mode
	var graphIsCssTransformsSupported = graph.isCssTransformsSupported;
	var self = this;

	graph.isCssTransformsSupported = function () {
		return graphIsCssTransformsSupported.apply(this, arguments) && (!self.chromeless || !mxClient.IS_SF);
	};

	// Opens all links in a new window while editing
	if (!this.chromeless) {
		graph.isBlankLink = function (href) {
			return !this.isExternalProtocol(href);
		};
	}

	return graph;
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.resetGraph = function () {
	this.graph.gridEnabled = !this.isChromelessView();
	this.graph.graphHandler.guidesEnabled = true;
	this.graph.setTooltips(true);
	this.graph.setConnectable(true);
	this.graph.foldingEnabled = true;
	this.graph.scrollbars = this.graph.defaultScrollbars;
	this.graph.pageVisible = this.graph.defaultPageVisible;
	this.graph.pageBreaksVisible = this.graph.pageVisible;
	this.graph.preferPageSize = this.graph.pageBreaksVisible;
	this.graph.background = null;
	this.graph.pageScale = mxGraph.prototype.pageScale;
	this.graph.pageFormat = mxGraph.prototype.pageFormat;
	this.graph.currentScale = 1;
	this.graph.currentTranslate.x = 0;
	this.graph.currentTranslate.y = 0;
	this.updateGraphComponents();
	this.graph.view.setScale(1);
	const rootId = this.graph.getModel().getRoot().getId();
	if (!rootId) {
		this.graph.getModel().getRoot().setId('0');
	}
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.readGraphState = function (node) {
	this.graph.gridEnabled = node.getAttribute('grid') != '0' && !this.isChromelessView();
	this.graph.gridSize = parseFloat(node.getAttribute('gridSize')) || mxGraph.prototype.gridSize;
	this.graph.graphHandler.guidesEnabled = node.getAttribute('guides') != '0';
	this.graph.setTooltips(node.getAttribute('tooltips') != '0');
	this.graph.setConnectable(node.getAttribute('connect') != '0');
	this.graph.connectionArrowsEnabled = node.getAttribute('arrows') != '0';
	this.graph.foldingEnabled = node.getAttribute('fold') != '0';

	if (this.isChromelessView() && this.graph.foldingEnabled) {
		this.graph.foldingEnabled = false;
		this.graph.cellRenderer.forceControlClickHandler = this.graph.foldingEnabled;
	}

	const ps = parseFloat(node.getAttribute('pageScale'));

	if (!isNaN(ps) && ps > 0) {
		this.graph.pageScale = ps;
	} else {
		this.graph.pageScale = mxGraph.prototype.pageScale;
	}

	if (!this.graph.isLightboxView() && !this.graph.isViewer()) {
		const pv = node.getAttribute('page');

		if (pv != null) {
			this.graph.pageVisible = pv != '0';
		} else {
			this.graph.pageVisible = this.graph.defaultPageVisible;
		}
	} else {
		this.graph.pageVisible = false;
	}

	this.graph.pageBreaksVisible = this.graph.pageVisible;
	this.graph.preferPageSize = this.graph.pageBreaksVisible;

	const pw = parseFloat(node.getAttribute('pageWidth'));
	const ph = parseFloat(node.getAttribute('pageHeight'));

	if (!isNaN(pw) && !isNaN(ph)) {
		this.graph.pageFormat = new mxRectangle(0, 0, pw, ph);
	}

	// Loads the persistent state settings
	const bg = node.getAttribute('background');

	if (bg != null && bg.length > 0) {
		this.graph.background = bg;
	} else {
		this.graph.background = null;
	}
};

/**
 * Sets the XML node for the current diagram.
 */
Editor.prototype.setGraphXml = function (node) {
	if (node != null) {
		const dec = new mxCodec(node.ownerDocument);

		if (node.nodeName == 'mxGraphModel') {
			this.graph.model.beginUpdate();

			try {
				this.graph.model.clear();
				this.graph.view.scale = 1;
				this.readGraphState(node);
				this.updateGraphComponents();
				dec.decode(node, this.graph.getModel());
			} finally {
				this.graph.model.endUpdate();
			}

			this.fireEvent(new mxEventObject('resetGraphView'));
		} else if (node.nodeName == 'root') {
			this.resetGraph();

			// Workaround for invalid XML output in Firefox 20 due to bug in mxUtils.getXml
			const wrapper = dec.document.createElement('mxGraphModel');
			wrapper.appendChild(node);

			dec.decode(wrapper, this.graph.getModel());
			this.updateGraphComponents();
			this.fireEvent(new mxEventObject('resetGraphView'));
		} else {
			throw {
				message: mxResources.get('cannotOpenFile'),
				node: node,
				toString: function () {
					return this.message;
				},
			};
		}
	} else {
		this.resetGraph();
		this.graph.model.clear();
		this.fireEvent(new mxEventObject('resetGraphView'));
	}
};

/**
 * Returns the XML node that represents the current diagram.
 */
Editor.prototype.getGraphXml = function (ignoreSelection) {
	ignoreSelection = ignoreSelection != null ? ignoreSelection : true;
	let node = null;

	if (ignoreSelection) {
		const enc = new mxCodec(mxUtils.createXmlDocument());
		node = enc.encode(this.graph.getModel());
	} else {
		node = this.graph.encodeCells(mxUtils.sortCells(this.graph.model.getTopmostCells(this.graph.getSelectionCells())));
	}

	if (this.graph.view.translate.x != 0 || this.graph.view.translate.y != 0) {
		node.setAttribute('dx', Math.round(this.graph.view.translate.x * 100) / 100);
		node.setAttribute('dy', Math.round(this.graph.view.translate.y * 100) / 100);
	}

	node.setAttribute('grid', this.graph.isGridEnabled() ? '1' : '0');
	node.setAttribute('gridSize', this.graph.gridSize);
	node.setAttribute('guides', this.graph.graphHandler.guidesEnabled ? '1' : '0');
	node.setAttribute('tooltips', this.graph.tooltipHandler.isEnabled() ? '1' : '0');
	node.setAttribute('connect', this.graph.connectionHandler.isEnabled() ? '1' : '0');
	node.setAttribute('arrows', this.graph.connectionArrowsEnabled ? '1' : '0');
	node.setAttribute('fold', this.graph.foldingEnabled ? '1' : '0');
	node.setAttribute('page', this.graph.pageVisible ? '1' : '0');
	node.setAttribute('pageScale', this.graph.pageScale);
	node.setAttribute('pageWidth', this.graph.pageFormat.width);
	node.setAttribute('pageHeight', this.graph.pageFormat.height);

	if (this.graph.background != null) {
		node.setAttribute('background', this.graph.background);
	}

	return node;
};

/**
 * Keeps the graph container in sync with the persistent graph state
 */
Editor.prototype.updateGraphComponents = function () {
	const graph = this.graph;

	if (graph.container != null) {
		graph.view.validateBackground();
		graph.container.style.overflow = graph.scrollbars ? 'auto' : this.defaultGraphOverflow;

		this.fireEvent(new mxEventObject('updateGraphComponents'));
	}
};

/**
 * Sets the modified flag.
 */
Editor.prototype.setModified = function (value) {
	this.modified = value;
};

/**
 * Sets the filename.
 */
Editor.prototype.setFilename = function (value) {
	this.filename = value;
};

/**
 * Creates and returns a new undo manager.
 */
Editor.prototype.createUndoManager = function () {
	const graph = this.graph;
	const undoMgr = new mxUndoManager();

	this.undoListener = function (sender, evt) {
		undoMgr.undoableEditHappened(evt.getProperty('edit'));
	};

	// Installs the command history
	const listener = mxUtils.bind(this, function () {
		this.undoListener.apply(this, arguments);
	});

	graph.getModel().addListener(mxEvent.UNDO, listener);
	graph.getView().addListener(mxEvent.UNDO, listener);

	// Keeps the selection in sync with the history
	const undoHandler = function (sender, evt) {
		const cand = graph.getSelectionCellsForChanges(evt.getProperty('edit').changes, function (change) {
			// Only selects changes to the cell hierarchy
			return !(change.constructor.name === 'mxChildChange');
		});

		if (cand.length > 0) {
			const cells = [];

			for (let i = 0; i < cand.length; i++) {
				if (graph.view.getState(cand[i]) != null) {
					cells.push(cand[i]);
				}
			}

			graph.setSelectionCells(cells);
		}
	};

	undoMgr.addListener(mxEvent.UNDO, undoHandler);
	undoMgr.addListener(mxEvent.REDO, undoHandler);

	return undoMgr;
};

/**
 * Adds basic stencil set (no namespace).
 */
Editor.prototype.initStencilRegistry = function () {};

/**
 * Creates and returns a new undo manager.
 */
Editor.prototype.destroy = function () {
	if (this.graph != null) {
		this.graph.destroy();
		this.graph = null;
	}
};

function Dialog(editorUi, elt, w, h, modal, closable, onClose, noScroll, transparent, needPadding) {
	var dx = 0;
	mxClient.IS_VML && (null == document.documentMode || document.documentMode < 8) && (dx = 80);
	var w0 = (w += dx),
		h0 = (h += dx),
		dh = document.documentElement.clientHeight > 0 ? document.documentElement.clientHeight : Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight),
		left = Math.max(1, Math.round((document.body.clientWidth - w - 64) / 2)),
		top = Math.max(1, Math.round((dh - h - editorUi.footerHeight) / 3));
	mxClient.IS_QUIRKS || (elt.style.maxHeight = '100%'), (w = Math.min(w, document.body.scrollWidth - 64)), (h = Math.min(h, dh - 64)), editorUi.dialogs.length > 0 && (this.zIndex += 2 * editorUi.dialogs.length), null == this.bg && ((this.bg = editorUi.createDiv('background')), (this.bg.style.position = 'absolute'), (this.bg.style.background = Dialog.backdropColor), (this.bg.style.height = dh + 'px'), (this.bg.style.right = '0px'), (this.bg.style.zIndex = this.zIndex - 2), mxUtils.setOpacity(this.bg, this.bgOpacity), mxClient.IS_QUIRKS && new mxDivResizer(this.bg));
	var origin = mxUtils.getDocumentScrollOrigin(document);
	(this.bg.style.left = origin.x + 'px'), (this.bg.style.top = origin.y + 'px'), (left += origin.x), (top += origin.y), modal && document.body.appendChild(this.bg);
	var div = editorUi.createDiv(transparent ? 'geTransDialog' : 'geDialog');
	div.style.padding = needPadding || void 0 === needPadding ? '30px' : '0px';
	var pos = this.getPosition(left, top, w, h);
	if (((left = pos.x), (top = pos.y), (div.style.width = w + 'px'), (div.style.height = h + 'px'), (div.style.left = left + 'px'), (div.style.top = top + 'px'), (div.style.zIndex = this.zIndex), (div.style.overflowY = 'auto'), div.appendChild(elt), document.body.appendChild(div), !noScroll && elt.clientHeight > div.clientHeight - 64 && (elt.style.overflowY = 'auto'), closable)) {
		var img = document.createElement('img');
		img.setAttribute('src', Dialog.prototype.closeImage),
			img.setAttribute('title', mxResources.get('close')),
			(img.className = 'geDialogClose'),
			(img.style.top = top + 14 + 'px'),
			(img.style.left = needPadding || void 0 === needPadding ? left + w + 38 - dx + 'px' : left + w + 38 - 60 - dx + 'px'),
			(img.style.zIndex = this.zIndex),
			mxEvent.addListener(
				img,
				'click',
				mxUtils.bind(this, function () {
					editorUi.hideDialog(!0);
				})
			),
			document.body.appendChild(img),
			(this.dialogImg = img),
			mxEvent.addGestureListeners(
				this.bg,
				null,
				null,
				mxUtils.bind(this, function (evt) {})
			);
	}
	(this.resizeListener = mxUtils.bind(this, function () {
		(dh = Math.max(document.body.clientHeight, document.documentElement.clientHeight)), (this.bg.style.height = dh + 'px'), (left = Math.max(1, Math.round((document.body.clientWidth - w - 64) / 2))), (top = Math.max(1, Math.round((dh - h - editorUi.footerHeight) / 3))), (w = Math.min(w0, document.body.scrollWidth - 64)), (h = Math.min(h0, dh - 64));
		var pos = this.getPosition(left, top, w, h);
		(left = pos.x), (top = pos.y), (div.style.left = left + 'px'), (div.style.top = top + 'px'), (div.style.width = w + 'px'), (div.style.height = h + 'px'), !noScroll && elt.clientHeight > div.clientHeight - 64 && (elt.style.overflowY = 'auto'), null != this.dialogImg && ((this.dialogImg.style.top = top + 14 + 'px'), (this.dialogImg.style.left = left + w + 38 - dx + 'px'));
	})),
		mxEvent.addListener(window, 'resize', this.resizeListener),
		(this.onDialogClose = onClose),
		(this.container = div),
		editorUi.editor.fireEvent(new mxEventObject('showDialog'));
}

/**
 *
 */
Dialog.backdropColor = 'white';

/**
 *
 */
Dialog.prototype.zIndex = mxPopupMenu.prototype.zIndex - 1;

/**
 *
 */
Dialog.prototype.noColorImage = noColorImage;

/**
 *
 */
Dialog.prototype.closeImage = closeImage;

/**
 *
 */
Dialog.prototype.clearImage = clearImage;

/**
 *
 */
Dialog.prototype.lockedImage = lockedImage;

/**
 *
 */
Dialog.prototype.unlockedImage = unlockedImage;

/**
 * Removes the dialog from the DOM.
 */
Dialog.prototype.bgOpacity = 80;

/**
 * Removes the dialog from the DOM.
 */
Dialog.prototype.getPosition = function (left, top) {
	return new mxPoint(left, top);
};

/**
 * Removes the dialog from the DOM.
 */
Dialog.prototype.close = function (cancel, isEsc) {
	if (this.onDialogClose != null) {
		if (this.onDialogClose(cancel, isEsc) == false) {
			return false;
		}

		this.onDialogClose = null;
	}

	if (this.dialogImg != null) {
		this.dialogImg.parentNode.removeChild(this.dialogImg);
		this.dialogImg = null;
	}

	if (this.bg != null && this.bg.parentNode != null) {
		this.bg.parentNode.removeChild(this.bg);
	}

	mxEvent.removeListener(window, 'resize', this.resizeListener);
	this.container.parentNode.removeChild(this.container);
};

/**
 *
 */
function ErrorDialog(editorUi, title, message, buttonText, fn, retry, buttonText2, fn2, hide, buttonText3, fn3) {
	hide = hide != null ? hide : true;

	const div = document.createElement('div');
	div.style.textAlign = 'center';

	if (title != null) {
		const hd = document.createElement('div');
		hd.style.padding = '0px';
		hd.style.margin = '0px';
		hd.style.fontSize = '18px';
		hd.style.paddingBottom = '16px';
		hd.style.marginBottom = '10px';
		hd.style.borderBottom = '1px solid #c0c0c0';
		hd.style.color = 'gray';
		hd.style.whiteSpace = 'nowrap';
		hd.style.textOverflow = 'ellipsis';
		hd.style.overflow = 'hidden';
		mxUtils.write(hd, title);
		hd.setAttribute('title', title);
		div.appendChild(hd);
	}

	const p2 = document.createElement('div');
	p2.style.lineHeight = '1.2em';
	p2.style.padding = '6px';
	p2.innerHTML = message;
	div.appendChild(p2);

	const btns = document.createElement('div');
	btns.style.marginTop = '12px';
	btns.style.textAlign = 'center';

	if (retry != null) {
		const retryBtn = mxUtils.button(mxResources.get('tryAgain'), function () {
			editorUi.hideDialog();
			retry();
		});
		retryBtn.className = 'geBtn';
		btns.appendChild(retryBtn);

		btns.style.textAlign = 'center';
	}

	if (buttonText3 != null) {
		const btn3 = mxUtils.button(buttonText3, function () {
			if (fn3 != null) {
				fn3();
			}
		});

		btn3.className = 'geBtn';
		btns.appendChild(btn3);
	}

	const btn = mxUtils.button(buttonText, function () {
		if (hide) {
			editorUi.hideDialog();
		}

		if (fn != null) {
			fn();
		}
	});

	btn.className = 'geBtn';
	btns.appendChild(btn);

	if (buttonText2 != null) {
		const mainBtn = mxUtils.button(buttonText2, function () {
			if (hide) {
				editorUi.hideDialog();
			}

			if (fn2 != null) {
				fn2();
			}
		});

		mainBtn.className = 'geBtn gePrimaryBtn';
		btns.appendChild(mainBtn);
	}

	this.init = function () {
		btn.focus();
	};

	div.appendChild(btns);

	this.container = div;
}

Editor.extractGraphModelFromPng = function (data) {
	var result = null;

	try {
		var base64 = data.substring(data.indexOf(',') + 1);

		// Workaround for invalid character error in Safari
		var binary = window.atob && !mxClient.IS_SF ? atob(base64) : Base64.decode(base64, true);
		EditorUi.parsePng(
			binary,
			mxUtils.bind(this, function (pos, type, length) {
				var value = binary.substring(pos + 8, pos + 8 + length);

				if (type == 'zTXt') {
					var idx = value.indexOf(String.fromCharCode(0));

					if (value.substring(0, idx) == 'mxGraphModel') {
						// Workaround for Java URL Encoder using + for spaces, which isn't compatible with JS
						var xmlData = pako
							.inflateRaw(Graph.stringToArrayBuffer(value.substring(idx + 2)), {
								to: 'string',
							})
							.replace(/\+/g, ' ');

						if (xmlData != null && xmlData.length > 0) {
							result = xmlData;
						}
					}
				}
				// Uncompressed section is normally not used
				else if (type == 'tEXt') {
					var vals = value.split(String.fromCharCode(0));

					if (vals.length > 1 && (vals[0] == 'mxGraphModel' || vals[0] == 'mxfile')) {
						result = vals[1];
					}
				}

				if (result != null || type == 'IDAT') {
					// Stops processing the file as our text chunks
					// are always placed before the data section
					return true;
				}
			})
		);
	} catch (e) {
		// ignores decoding errors
	}

	if (result != null && result.charAt(0) == '%') {
		result = decodeURIComponent(result);
	}

	// Workaround for double encoded content
	if (result != null && result.charAt(0) == '%') {
		result = decodeURIComponent(result);
	}

	return result;
};

/**
 * 构造一个新的页面设置对话框。
 */
function PageSetupDialog(editorUi) {
	const graph = editorUi.editor.graph;
	let row, td;

	const table = document.createElement('table');
	table.style.width = '100%';
	table.style.height = '100%';
	const tbody = document.createElement('tbody');

	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.verticalAlign = 'top';
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('paperSize') + ':');

	row.appendChild(td);

	td = document.createElement('td');
	td.style.verticalAlign = 'top';
	td.style.fontSize = '10pt';

	const accessor = PageSetupDialog.addPageFormatPanel(td, 'pagesetupdialog', graph.pageFormat);

	row.appendChild(td);
	tbody.appendChild(row);

	row = document.createElement('tr');

	td = document.createElement('td');
	mxUtils.write(td, mxResources.get('background') + ':');

	row.appendChild(td);

	td = document.createElement('td');
	td.style.whiteSpace = 'nowrap';

	const backgroundInput = document.createElement('input');
	backgroundInput.setAttribute('type', 'text');
	const backgroundButton = document.createElement('button');

	backgroundButton.style.width = '18px';
	backgroundButton.style.height = '18px';
	backgroundButton.style.marginRight = '20px';
	backgroundButton.style.backgroundPosition = 'center center';
	backgroundButton.style.backgroundRepeat = 'no-repeat';

	let newBackgroundColor = graph.background;

	function updateBackgroundColor() {
		if (newBackgroundColor == null || newBackgroundColor == mxConstants.NONE) {
			backgroundButton.style.backgroundColor = '';
			backgroundButton.style.backgroundImage = "url('" + Dialog.prototype.noColorImage + "')";
		} else {
			backgroundButton.style.backgroundColor = newBackgroundColor;
			backgroundButton.style.backgroundImage = '';
		}
	}

	updateBackgroundColor();

	mxEvent.addListener(backgroundButton, 'click', function (evt) {
		editorUi.pickColor(newBackgroundColor || 'none', function (color) {
			newBackgroundColor = color;
			updateBackgroundColor();
		});
		mxEvent.consume(evt);
	});

	td.appendChild(backgroundButton);

	mxUtils.write(td, mxResources.get('gridSize') + ':');

	const gridSizeInput = document.createElement('input');
	gridSizeInput.setAttribute('type', 'number');
	gridSizeInput.setAttribute('min', '0');
	gridSizeInput.style.width = '40px';
	gridSizeInput.style.marginLeft = '6px';

	gridSizeInput.value = graph.getGridSize();
	td.appendChild(gridSizeInput);

	mxEvent.addListener(gridSizeInput, 'change', function () {
		const value = parseInt(gridSizeInput.value);
		gridSizeInput.value = Math.max(1, isNaN(value) ? graph.getGridSize() : value);
	});

	row.appendChild(td);
	tbody.appendChild(row);

	row = document.createElement('tr');
	td = document.createElement('td');

	mxUtils.write(td, mxResources.get('image') + ':');

	row.appendChild(td);
	td = document.createElement('td');

	const changeImageLink = document.createElement('a');
	changeImageLink.style.textDecoration = 'underline';
	changeImageLink.style.cursor = 'pointer';
	changeImageLink.style.color = '#a0a0a0';

	let newBackgroundImage = graph.backgroundImage;

	function updateBackgroundImage() {
		if (newBackgroundImage == null) {
			changeImageLink.removeAttribute('title');
			changeImageLink.style.fontSize = '';
			changeImageLink.innerHTML = mxUtils.htmlEntities(mxResources.get('change')) + '...';
		} else {
			changeImageLink.setAttribute('title', newBackgroundImage.src);
			changeImageLink.style.fontSize = '11px';
			changeImageLink.innerHTML = mxUtils.htmlEntities(newBackgroundImage.src.substring(0, 42)) + '...';
		}
	}

	mxEvent.addListener(changeImageLink, 'click', function (evt) {
		editorUi.showBackgroundImageDialog(function (image, failed) {
			if (!failed) {
				newBackgroundImage = image;
				updateBackgroundImage();
			}
		}, newBackgroundImage);

		mxEvent.consume(evt);
	});

	updateBackgroundImage();

	td.appendChild(changeImageLink);

	row.appendChild(td);
	tbody.appendChild(row);

	row = document.createElement('tr');
	td = document.createElement('td');
	td.colSpan = 2;
	td.style.paddingTop = '16px';
	td.setAttribute('align', 'right');

	const cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
		editorUi.hideDialog();
	});
	cancelBtn.className = 'geBtn';

	if (editorUi.editor.cancelFirst) {
		td.appendChild(cancelBtn);
	}

	const applyBtn = mxUtils.button(mxResources.get('apply'), function () {
		editorUi.hideDialog();
		const gridSize = parseInt(gridSizeInput.value);

		if (!isNaN(gridSize) && graph.gridSize !== gridSize) {
			graph.setGridSize(gridSize);
		}

		const change = new ChangePageSetup(editorUi, newBackgroundColor, newBackgroundImage, accessor.get());
		change.ignoreColor = graph.background == newBackgroundColor;

		const oldSrc = graph.backgroundImage != null ? graph.backgroundImage.src : null;
		const newSrc = newBackgroundImage != null ? newBackgroundImage.src : null;

		change.ignoreImage = oldSrc === newSrc;

		if (graph.pageFormat.width != change.previousFormat.width || graph.pageFormat.height != change.previousFormat.height || !change.ignoreColor || !change.ignoreImage) {
			graph.model.execute(change);
		}
	});
	applyBtn.className = 'geBtn gePrimaryBtn';
	td.appendChild(applyBtn);

	if (!editorUi.editor.cancelFirst) {
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);

	table.appendChild(tbody);
	this.container = table;
}

PageSetupDialog.addPageFormatPanel = function (div, namePostfix, pageFormat, pageFormatListener) {
	const formatName = 'rcui-' + namePostfix;

	const portraitCheckBox = document.createElement('input');
	portraitCheckBox.setAttribute('name', formatName);
	portraitCheckBox.setAttribute('type', 'radio');
	portraitCheckBox.setAttribute('value', 'portrait');

	const landscapeCheckBox = document.createElement('input');
	landscapeCheckBox.setAttribute('name', formatName);
	landscapeCheckBox.setAttribute('type', 'radio');
	landscapeCheckBox.setAttribute('value', 'landscape');

	const paperSizeSelect = document.createElement('select');
	paperSizeSelect.style.marginBottom = '8px';
	paperSizeSelect.style.width = '202px';
	// paperSizeSelect.style.border = 'none';
	paperSizeSelect.style.cssText = `width: 210px; height: 28px; border: 1px solid rgb(230, 230, 230);`;

	const formatDiv = document.createElement('div');
	formatDiv.style.marginLeft = '4px';
	formatDiv.style.width = '210px';
	formatDiv.style.height = '24px';
	formatDiv.className = 'form-options-line';

	portraitCheckBox.style.marginRight = '6px';
	formatDiv.appendChild(portraitCheckBox);

	const portraitSpan = document.createElement('span');
	portraitSpan.style.maxWidth = '100px';
	mxUtils.write(portraitSpan, mxResources.get('portrait'));
	formatDiv.appendChild(portraitSpan);

	landscapeCheckBox.style.marginLeft = '10px';
	landscapeCheckBox.style.marginRight = '6px';
	formatDiv.appendChild(landscapeCheckBox);

	const landscapeSpan = document.createElement('span');
	landscapeSpan.style.width = '100px';
	mxUtils.write(landscapeSpan, mxResources.get('landscape'));
	formatDiv.appendChild(landscapeSpan);

	const customDiv = document.createElement('div');
	const usrCustom = document.createElement('div');
	customDiv.style.marginLeft = '4px';
	customDiv.style.marginTop = '10px';
	customDiv.style.width = '210px';
	customDiv.style.height = '28px';
	usrCustom.className = 'usrCustom';
	customDiv.appendChild(usrCustom);
	const widthInput = document.createElement('input');
	widthInput.className = 'usrCustomInput';
	widthInput.style.textAlign = 'center';
	mxUtils.write(usrCustom, 'W');
	usrCustom.appendChild(widthInput);
	const usrCustom2 = document.createElement('div');
	usrCustom2.className = 'usrCustom';
	usrCustom2.style.marginLeft = '10px';
	customDiv.appendChild(usrCustom2);
	const heightInput = document.createElement('input');
	heightInput.className = 'usrCustomInput';
	heightInput.style.textAlign = 'center';
	mxUtils.write(usrCustom2, 'H');
	usrCustom2.appendChild(heightInput);
	formatDiv.style.display = 'none';
	customDiv.style.display = 'none';
	const pf = new Object();
	const formats = PageSetupDialog.getFormats();
	for (let i = 0; i < formats.length; i++) {
		const f = formats[i];
		pf[f.key] = f;
		const paperSizeOption = document.createElement('option');
		paperSizeOption.setAttribute('value', f.key);
		mxUtils.write(paperSizeOption, f.title);
		paperSizeSelect.appendChild(paperSizeOption);
	}
	let customSize = false;
	function listener(sender, evt, force) {
		if (force || (widthInput != document.activeElement && heightInput != document.activeElement)) {
			let detected = false;
			for (let i = 0; i < formats.length; i++) {
				const f = formats[i];
				if (customSize) {
					if (f.key == 'custom') {
						paperSizeSelect.value = f.key;
						customSize = false;
					}
				} else if (f.format != null) {
					if (f.key == 'a4') {
						if (pageFormat.width == 826) {
							pageFormat = mxRectangle.fromRectangle(pageFormat);
							pageFormat.width = 827;
						} else if (pageFormat.height == 826) {
							pageFormat = mxRectangle.fromRectangle(pageFormat);
							pageFormat.height = 827;
						}
					} else if (f.key == 'a5') {
						if (pageFormat.width == 584) {
							pageFormat = mxRectangle.fromRectangle(pageFormat);
							pageFormat.width = 583;
						} else if (pageFormat.height == 584) {
							pageFormat = mxRectangle.fromRectangle(pageFormat);
							pageFormat.height = 583;
						}
					}
					if (pageFormat.width == f.format.width && pageFormat.height == f.format.height) {
						paperSizeSelect.value = f.key;
						portraitCheckBox.setAttribute('checked', 'checked');
						portraitCheckBox.defaultChecked = true;
						portraitCheckBox.checked = true;
						landscapeCheckBox.removeAttribute('checked');
						landscapeCheckBox.defaultChecked = false;
						landscapeCheckBox.checked = false;
						detected = true;
					} else if (pageFormat.width == f.format.height && pageFormat.height == f.format.width) {
						paperSizeSelect.value = f.key;
						portraitCheckBox.removeAttribute('checked');
						portraitCheckBox.defaultChecked = false;
						portraitCheckBox.checked = false;
						landscapeCheckBox.setAttribute('checked', 'checked');
						landscapeCheckBox.defaultChecked = true;
						landscapeCheckBox.checked = true;
						detected = true;
					}
				}
			}
			if (!detected) {
				widthInput.value = pageFormat.width;
				heightInput.value = pageFormat.height;
				portraitCheckBox.setAttribute('checked', 'checked');
				paperSizeSelect.value = 'custom';
				formatDiv.style.display = 'none';
				customDiv.style.display = '';
			} else {
				formatDiv.style.display = '';
				customDiv.style.display = 'none';
			}
		}
	}
	listener();
	div.appendChild(paperSizeSelect);
	mxUtils.br(div);
	div.appendChild(formatDiv);
	div.appendChild(customDiv);
	let currentPageFormat = pageFormat;
	const update = function (evt, selectChanged) {
		const f = pf[paperSizeSelect.value];
		if (f.format != null) {
			widthInput.value = f.format.width;
			heightInput.value = f.format.height;
			customDiv.style.display = 'none';
			formatDiv.style.display = '';
		} else {
			formatDiv.style.display = 'none';
			customDiv.style.display = '';
		}
		const wi = parseFloat(widthInput.value);
		if (isNaN(wi) || wi <= 0) {
			widthInput.value = pageFormat.width;
		}
		const hi = parseFloat(heightInput.value);
		if (isNaN(hi) || hi <= 0) {
			heightInput.value = pageFormat.height;
		}
		let newPageFormat = new mxRectangle(0, 0, Math.floor(parseFloat(widthInput.value)), Math.floor(parseFloat(heightInput.value)));
		if (paperSizeSelect.value != 'custom' && landscapeCheckBox.checked) {
			newPageFormat = new mxRectangle(0, 0, newPageFormat.height, newPageFormat.width);
		}
		if ((!selectChanged || !customSize) && (newPageFormat.width != currentPageFormat.width || newPageFormat.height != currentPageFormat.height)) {
			currentPageFormat = newPageFormat;
			if (pageFormatListener != null) {
				pageFormatListener(currentPageFormat);
			}
		}
	};

	mxEvent.addListener(portraitSpan, 'click', function (evt) {
		portraitCheckBox.checked = true;
		update(evt);
		mxEvent.consume(evt);
	});

	mxEvent.addListener(landscapeSpan, 'click', function (evt) {
		landscapeCheckBox.checked = true;
		update(evt);
		mxEvent.consume(evt);
	});

	mxEvent.addListener(widthInput, 'blur', update);
	mxEvent.addListener(widthInput, 'click', update);
	mxEvent.addListener(heightInput, 'blur', update);
	mxEvent.addListener(heightInput, 'click', update);
	mxEvent.addListener(landscapeCheckBox, 'change', update);
	mxEvent.addListener(portraitCheckBox, 'change', update);
	mxEvent.addListener(paperSizeSelect, 'change', function (evt) {
		customSize = paperSizeSelect.value == 'custom';
		update(evt, true);
	});

	update();

	return {
		set: function (value) {
			pageFormat = value;
			listener(null, null, true);
		},
		get: function () {
			return currentPageFormat;
		},
		widthInput: widthInput,
		heightInput: heightInput,
	};
};

/**
 *
 */
PageSetupDialog.getFormats = function () {
	return [
		/* {
            key: 'letter',
            title: 'US-Letter (8,5" x 11")',
            format: mxConstants.PAGE_FORMAT_LETTER_PORTRAIT,
        },
        {
            key: 'legal',
            title: 'US-Legal (8,5" x 14")',
            format: new mxRectangle(0, 0, 850, 1400),
        },
        {
            key: 'tabloid',
            title: 'US-Tabloid (11" x 17")',
            format: new mxRectangle(0, 0, 1100, 1700),
        },
        {
            key: 'executive',
            title: 'US-Executive (7" x 10")',
            format: new mxRectangle(0, 0, 700, 1000),
        },
        {
            key: 'a0',
            title: 'A0 (841 mm x 1189 mm)',
            format: new mxRectangle(0, 0, 3300, 4681),
        },
        {
            key: 'a1',
            title: 'A1 (594 mm x 841 mm)',
            format: new mxRectangle(0, 0, 2339, 3300),
        },
        {
            key: 'a2',
            title: 'A2 (420 mm x 594 mm)',
            format: new mxRectangle(0, 0, 1654, 2336),
        },
        {
            key: 'a3',
            title: 'A3 (297 mm x 420 mm)',
            format: new mxRectangle(0, 0, 1169, 1654),
        },
        {
            key: 'a4',
            title: 'A4 (210 mm x 297 mm)',
            format: mxConstants.PAGE_FORMAT_A4_PORTRAIT,
        },
        {
            key: 'a5',
            title: 'A5 (148 mm x 210 mm)',
            format: new mxRectangle(0, 0, 583, 827),
        },
        {
            key: 'a6',
            title: 'A6 (105 mm x 148 mm)',
            format: new mxRectangle(0, 0, 413, 583),
        },
        {
            key: 'a7',
            title: 'A7 (74 mm x 105 mm)',
            format: new mxRectangle(0, 0, 291, 413),
        },
        {
            key: 'b4',
            title: 'B4 (250 mm x 353 mm)',
            format: new mxRectangle(0, 0, 980, 1390),
        },
        {
            key: 'b5',
            title: 'B5 (176 mm x 250 mm)',
            format: new mxRectangle(0, 0, 690, 980),
        }, */
		{
			key: '1600-900',
			title: '1600 x 900',
			format: new mxRectangle(0, 0, 900, 1600),
		},
		{
			key: '1920-1200',
			title: '1920 x 1200',
			format: new mxRectangle(0, 0, 1200, 1920),
		},
		{
			key: '1920-1080',
			title: '1920 x 1080',
			format: new mxRectangle(0, 0, 1080, 1920),
		},
		{
			key: '1600-1200',
			title: '1600 x 1200',
			format: new mxRectangle(0, 0, 1200, 1600),
		},
		{ key: 'custom', title: mxResources.get('custom'), format: null },
	];
};

/**
 * Constructs a new filename dialog.
 */
function FilenameDialog(editorUi, filename, buttonText, fn, label, validateFn, content, helpLink, closeOnBtn, cancelFn, hints, w) {
	closeOnBtn = closeOnBtn != null ? closeOnBtn : true;
	let row, td;

	const table = document.createElement('table');
	const tbody = document.createElement('tbody');
	table.style.marginTop = '8px';

	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.whiteSpace = 'nowrap';
	td.style.fontSize = '10pt';
	td.style.width = hints ? '80px' : '120px';
	mxUtils.write(td, (label || mxResources.get('filename')) + ':');

	row.appendChild(td);

	const nameInput = document.createElement('input');
	nameInput.setAttribute('value', filename || '');
	nameInput.style.marginLeft = '4px';
	nameInput.style.width = w != null ? w + 'px' : '180px';

	const genericBtn = mxUtils.button(buttonText, function () {
		if (validateFn == null || validateFn(nameInput.value)) {
			if (closeOnBtn) {
				editorUi.hideDialog();
			}

			fn(nameInput.value);
		}
	});
	genericBtn.className = 'geBtn gePrimaryBtn';

	this.init = function () {
		if (label == null && content != null) {
			return;
		}

		nameInput.focus();

		if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS) {
			nameInput.select();
		} else {
			document.execCommand('selectAll', false, null);
		}

		// Installs drag and drop handler for links
		if (Graph.fileSupport) {
			// Setup the dnd listeners
			const dlg = table.parentNode;

			if (dlg != null) {
				let dropElt = null;

				mxEvent.addListener(dlg, 'dragleave', function (evt) {
					if (dropElt != null) {
						dropElt.style.backgroundColor = '';
						dropElt = null;
					}

					evt.stopPropagation();
					evt.preventDefault();
				});

				mxEvent.addListener(
					dlg,
					'dragover',
					mxUtils.bind(this, function (evt) {
						// IE 10 does not implement pointer-events so it can't have a drop highlight
						if (dropElt == null && (!mxClient.IS_IE || document.documentMode > 10)) {
							dropElt = nameInput;
							dropElt.style.backgroundColor = '#ebf2f9';
						}

						evt.stopPropagation();
						evt.preventDefault();
					})
				);

				mxEvent.addListener(
					dlg,
					'drop',
					mxUtils.bind(this, function (evt) {
						if (dropElt != null) {
							dropElt.style.backgroundColor = '';
							dropElt = null;
						}

						if (mxUtils.indexOf(evt.dataTransfer.types, 'text/uri-list') >= 0) {
							nameInput.value = decodeURIComponent(evt.dataTransfer.getData('text/uri-list'));
							genericBtn.click();
						}

						evt.stopPropagation();
						evt.preventDefault();
					})
				);
			}
		}
	};

	td = document.createElement('td');
	td.style.whiteSpace = 'nowrap';
	td.appendChild(nameInput);
	row.appendChild(td);

	if (label != null || content == null) {
		tbody.appendChild(row);

		if (hints != null) {
			if (editorUi.editor.diagramFileTypes != null) {
				const typeSelect = FilenameDialog.createFileTypes(editorUi, nameInput, editorUi.editor.diagramFileTypes);
				typeSelect.style.marginLeft = '6px';
				typeSelect.style.width = '74px';

				td.appendChild(typeSelect);
				nameInput.style.width = w != null ? w - 40 + 'px' : '140px';
			}

			td.appendChild(FilenameDialog.createTypeHint(editorUi, nameInput, hints));
		}
	}

	if (content != null) {
		row = document.createElement('tr');
		td = document.createElement('td');
		td.colSpan = 2;
		td.appendChild(content);
		row.appendChild(td);
		tbody.appendChild(row);
	}

	row = document.createElement('tr');
	td = document.createElement('td');
	td.colSpan = 2;
	td.style.paddingTop = '20px';
	td.style.whiteSpace = 'nowrap';
	td.setAttribute('align', 'right');

	const cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
		editorUi.hideDialog();

		if (cancelFn != null) {
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';

	if (editorUi.editor.cancelFirst) {
		td.appendChild(cancelBtn);
	}

	if (helpLink != null) {
		const helpBtn = mxUtils.button(mxResources.get('help'), function () {
			editorUi.editor.graph.openLink(helpLink);
		});

		helpBtn.className = 'geBtn';
		td.appendChild(helpBtn);
	}

	mxEvent.addListener(nameInput, 'keypress', function (e) {
		if (e.keyCode == 13) {
			genericBtn.click();
		}
	});

	td.appendChild(genericBtn);

	if (!editorUi.editor.cancelFirst) {
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);
	table.appendChild(tbody);

	this.container = table;
}

/**
 *
 */
FilenameDialog.filenameHelpLink = null;

/**
 *
 */
FilenameDialog.createTypeHint = function (ui, nameInput, hints) {
	const hint = document.createElement('img');
	hint.style.cssText = 'vertical-align:top;height:16px;width:16px;margin-left:4px;background-repeat:no-repeat;background-position:center bottom;cursor:pointer;';
	mxUtils.setOpacity(hint, 70);

	const nameChanged = function () {
		hint.setAttribute('src', Editor.helpImage);
		hint.setAttribute('title', mxResources.get('help'));

		for (let i = 0; i < hints.length; i++) {
			if (hints[i].ext.length > 0 && nameInput.value.toLowerCase().substring(nameInput.value.length - hints[i].ext.length - 1) == '.' + hints[i].ext) {
				hint.setAttribute('src', mxClient.imageBasePath + '/warning.png');
				hint.setAttribute('title', mxResources.get(hints[i].title));
				break;
			}
		}
	};

	mxEvent.addListener(nameInput, 'keyup', nameChanged);
	mxEvent.addListener(nameInput, 'change', nameChanged);
	mxEvent.addListener(hint, 'click', function (evt) {
		const title = hint.getAttribute('title');

		if (hint.getAttribute('src') == Editor.helpImage) {
			ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
		} else if (title != '') {
			ui.showError(
				null,
				title,
				mxResources.get('help'),
				function () {
					ui.editor.graph.openLink(FilenameDialog.filenameHelpLink);
				},
				null,
				mxResources.get('ok'),
				null,
				null,
				null,
				340,
				90
			);
		}

		mxEvent.consume(evt);
	});

	nameChanged();

	return hint;
};

/**
 *
 */
FilenameDialog.createFileTypes = function (editorUi, nameInput, types) {
	const typeSelect = document.createElement('select');

	for (let i = 0; i < types.length; i++) {
		const typeOption = document.createElement('option');
		typeOption.setAttribute('value', i);
		mxUtils.write(typeOption, mxResources.get(types[i].description) + ' (.' + types[i].extension + ')');
		typeSelect.appendChild(typeOption);
	}

	mxEvent.addListener(typeSelect, 'change', function () {
		var ext = types[typeSelect.value].extension;
		const idx = nameInput.value.lastIndexOf('.');

		if (idx > 0) {
			var ext = types[typeSelect.value].extension;
			nameInput.value = nameInput.value.substring(0, idx + 1) + ext;
		} else {
			nameInput.value = nameInput.value + '.' + ext;
		}

		if ('createEvent' in document) {
			const changeEvent = document.createEvent('HTMLEvents');
			changeEvent.initEvent('change', false, true);
			nameInput.dispatchEvent(changeEvent);
		} else {
			nameInput.fireEvent('onchange');
		}
	});

	const nameInputChanged = function () {
		const idx = nameInput.value.lastIndexOf('.');
		let active = 0;

		// Finds current extension
		if (idx > 0) {
			const ext = nameInput.value.toLowerCase().substring(idx + 1);

			for (let i = 0; i < types.length; i++) {
				if (ext == types[i].extension) {
					active = i;
					break;
				}
			}
		}

		typeSelect.value = active;
	};

	mxEvent.addListener(nameInput, 'change', nameInputChanged);
	mxEvent.addListener(nameInput, 'keyup', nameInputChanged);
	nameInputChanged();

	return typeSelect;
};

/**
 * Static overrides
 */
(function () {
	// Uses HTML for background pages (to support grid background image)

    /*const mxGraphViewValidateBackgroundImage = mxGraphView.prototype.validateBackgroundImage;
    mxGraphView.prototype.validateBackgroundImage = function () {
        console.log('validateBackgroundImage------------------------------1111')
        const graph = this.graph;
        mxGraphViewValidateBackgroundImage.apply(this, arguments);
        if(graph.isChromeless){
            if(graph.backgroundImage && graph.backgroundImage.src){
                graph.container.style.cssText = `background-image: url(${graph.backgroundImage.src});
                background-size: cover;
                background-repeat: no-repeat;`;
                console.log('validateBackgroundImage------------------------------1111---22222')
            }
        }
    }*/

	mxGraphView.prototype.validateBackgroundPage = function () {
		const graph = this.graph;
		if (graph.container != null && !graph.transparentBackground) {
			if (graph.pageVisible) {
				const bounds = this.getBackgroundPageBounds();
				if (this.backgroundPageShape == null) {
					// Finds first element in graph container
					let firstChild = graph.container.firstChild;

					while (firstChild != null && firstChild.nodeType != mxConstants.NODETYPE_ELEMENT) {
						firstChild = firstChild.nextSibling;
					}

					if (firstChild != null) {
						this.backgroundPageShape = this.createBackgroundPageShape(bounds);
						this.backgroundPageShape.scale = 1;

						// Shadow filter causes problems in outline window in quirks mode. IE8 standards
						// also has known rendering issues inside mxWindow but not using shadow is worse.
						this.backgroundPageShape.isShadow = !mxClient.IS_QUIRKS;
						this.backgroundPageShape.dialect = mxConstants.DIALECT_STRICTHTML;
						this.backgroundPageShape.init(graph.container);

						// Required for the browser to render the background page in correct order
						firstChild.style.position = 'absolute';
						graph.container.insertBefore(this.backgroundPageShape.node, firstChild);
						this.backgroundPageShape.redraw();
                        if(graph.isChromeless){
                            this.backgroundPageShape.node.className = 'geBackgroundPageNone';
                        }else{
                            this.backgroundPageShape.node.className = 'geBackgroundPage';
                        }

						// Adds listener for double click handling on background
						mxEvent.addListener(
							this.backgroundPageShape.node,
							'dblclick',
							mxUtils.bind(this, function (evt) {
								graph.dblClick(evt);
							})
						);

						// 添加基本​​侦听器以在外部进行图形事件调度
						// 容器并完成单个手势的处理
						mxEvent.addGestureListeners(
						this.backgroundPageShape.node,
						mxUtils.bind(this, function (evt) {
							// Hide sidebar tooltip when user starts interacting with canvas
							if (this.sidebar && this.sidebar.hideTooltip) {
								this.sidebar.hideTooltip();
							}
							graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
						}),
							mxUtils.bind(this, function (evt) {
								// Hides the tooltip if mouse is outside container
								if (graph.tooltipHandler != null && graph.tooltipHandler.isHideOnHover()) {
									graph.tooltipHandler.hide();
								}

								if (graph.isMouseDown && !mxEvent.isConsumed(evt)) {
									graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
								}
							}),
							mxUtils.bind(this, function (evt) {
								graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
							})
						);
					}
				} else {
					this.backgroundPageShape.scale = 1;
					this.backgroundPageShape.bounds = bounds;
					this.backgroundPageShape.redraw();
				}
			} else if (this.backgroundPageShape != null) {
				this.backgroundPageShape.destroy();
				this.backgroundPageShape = null;
			}

			this.validateBackgroundStyles();
		}
	};

	// Updates the CSS of the background to draw the grid
	mxGraphView.prototype.validateBackgroundStyles = function () {
		const graph = this.graph;
		const color = graph.background == null || graph.background == mxConstants.NONE ? graph.defaultPageBackgroundColor : graph.background;
		const gridColor = color != null && this.gridColor != color.toLowerCase() ? this.gridColor : '#ffffff';
		let image = 'none';
		let position = '';

		if (graph.isGridEnabled()) {
			let phase = 10;
			// Generates the SVG required for drawing the dynamic grid
			image = unescape(encodeURIComponent(this.createSvgGrid(gridColor)));
			image = btoa(image);
			image = 'url(' + 'data:image/svg+xml;base64,' + image + ')';
			phase = graph.gridSize * this.scale * this.gridSteps;

			let x0 = 0;
			let y0 = 0;

			if (graph.view.backgroundPageShape != null) {
				const bds = this.getBackgroundPageBounds();

				x0 = 1 + bds.x;
				y0 = 1 + bds.y;
			}

			// Computes the offset to maintain origin for grid
			position = -Math.round(phase - mxUtils.mod(this.translate.x * this.scale - x0, phase)) + 'px ' + -Math.round(phase - mxUtils.mod(this.translate.y * this.scale - y0, phase)) + 'px';
		}
        graph.container.setAttribute('id', 'RCgeBackgroundPage');

		let canvas = graph.view.canvas;

		if (canvas.ownerSVGElement != null) {
			canvas = canvas.ownerSVGElement;
		}

        if (graph.view.backgroundPageShape != null) {
            graph.view.backgroundPageShape.node.style.backgroundPosition = position;
            graph.view.backgroundPageShape.node.style.backgroundImage = image;
            const isGradientColor = color && color.length > 9;
            if(!isGradientColor){
                graph.view.backgroundPageShape.node.style.backgroundColor = color;
            }else{
                graph.view.backgroundPageShape.node.style.background = color;
            }
            graph.container.className = 'geDiagramContainer geDiagramBackdrop';
            canvas.style.backgroundImage = 'none';
            canvas.style.backgroundColor = '';
        } else {
            graph.container.className = 'geDiagramContainer';
            canvas.style.backgroundPosition = position;
            canvas.style.backgroundColor = color;
            canvas.style.backgroundImage = image;
        }
	};

	// Returns the SVG required for painting the background grid.
	mxGraphView.prototype.createSvgGrid = function (color) {
		let tmp = this.graph.gridSize * this.scale;

		while (tmp < this.minGridSize) {
			tmp *= 2;
		}

		const tmp2 = this.gridSteps * tmp;

		// Small grid lines
		const d = [];

		for (let i = 1; i < this.gridSteps; i++) {
			const tmp3 = i * tmp;
			d.push('M 0 ' + tmp3 + ' L ' + tmp2 + ' ' + tmp3 + ' M ' + tmp3 + ' 0 L ' + tmp3 + ' ' + tmp2);
		}

		// KNOWN: Rounding errors for certain scales (eg. 144%, 121% in Chrome, FF and Safari). Workaround
		// in Chrome is to use 100% for the svg size, but this results in blurred grid for large diagrams.
		const size = tmp2;
		const svg = '<svg width="' + size + '" height="' + size + '" xmlns="' + mxConstants.NS_SVG + '">' + '<defs><pattern id="grid" width="' + tmp2 + '" height="' + tmp2 + '" patternUnits="userSpaceOnUse">' + '<path d="' + d.join(' ') + '" fill="none" stroke="' + color + '" opacity="0.2" stroke-width="1"/>' + '<path d="M ' + tmp2 + ' 0 L 0 0 0 ' + tmp2 + '" fill="none" stroke="' + color + '" stroke-width="1"/>' + '</pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>';

		return svg;
	};

	// 为没有页面视图和禁用滚动条的网格添加平移
	const mxGraphPanGraph = mxGraph.prototype.panGraph;
	mxGraph.prototype.panGraph = function (dx, dy) {
		mxGraphPanGraph.apply(this, arguments);

		if (this.shiftPreview1 != null) {
			let canvas = this.view.canvas;

			if (canvas.ownerSVGElement != null) {
				canvas = canvas.ownerSVGElement;
			}

			const phase = this.gridSize * this.view.scale * this.view.gridSteps;
			const position = -Math.round(phase - mxUtils.mod(this.view.translate.x * this.view.scale + dx, phase)) + 'px ' + -Math.round(phase - mxUtils.mod(this.view.translate.y * this.view.scale + dy, phase)) + 'px';
			canvas.style.backgroundPosition = position;
		}
	};

	// 仅在页面内绘制分页符
	mxGraph.prototype.updatePageBreaks = function (visible, width, height) {
		const scale = this.view.scale;
		const tr = this.view.translate;
		const fmt = this.pageFormat;
		const ps = scale * this.pageScale;

		const bounds2 = this.view.getBackgroundPageBounds();

		width = bounds2.width;
		height = bounds2.height;
		const bounds = new mxRectangle(scale * tr.x, scale * tr.y, fmt.width * ps, fmt.height * ps);

		// Does not show page breaks if the scale is too small
		visible = visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;

		const horizontalCount = visible ? Math.ceil(height / bounds.height) - 1 : 0;
		const verticalCount = visible ? Math.ceil(width / bounds.width) - 1 : 0;
		const right = bounds2.x + width;
		const bottom = bounds2.y + height;

		if (this.horizontalPageBreaks == null && horizontalCount > 0) {
			this.horizontalPageBreaks = [];
		}

		if (this.verticalPageBreaks == null && verticalCount > 0) {
			this.verticalPageBreaks = [];
		}

		const drawPageBreaks = mxUtils.bind(this, function (breaks) {
			if (breaks != null) {
				const count = breaks == this.horizontalPageBreaks ? horizontalCount : verticalCount;

				for (var i = 0; i <= count; i++) {
					const pts = breaks == this.horizontalPageBreaks ? [new mxPoint(Math.round(bounds2.x), Math.round(bounds2.y + (i + 1) * bounds.height)), new mxPoint(Math.round(right), Math.round(bounds2.y + (i + 1) * bounds.height))] : [new mxPoint(Math.round(bounds2.x + (i + 1) * bounds.width), Math.round(bounds2.y)), new mxPoint(Math.round(bounds2.x + (i + 1) * bounds.width), Math.round(bottom))];

					if (breaks[i] != null) {
						breaks[i].points = pts;
						breaks[i].redraw();
					} else {
						const pageBreak = new mxPolyline(pts, this.pageBreakColor);
						pageBreak.dialect = this.dialect;
						pageBreak.isDashed = this.pageBreakDashed;
						pageBreak.pointerEvents = false;
						pageBreak.init(this.view.backgroundPane);
						pageBreak.redraw();

						breaks[i] = pageBreak;
					}
				}

				for (var i = count; i < breaks.length; i++) {
					breaks[i].destroy();
				}

				breaks.splice(count, breaks.length - count);
			}
		});

		drawPageBreaks(this.horizontalPageBreaks);
		drawPageBreaks(this.verticalPageBreaks);
	};

	// Disables removing relative children from parents
	const mxGraphHandlerShouldRemoveCellsFromParent = mxGraphHandler.prototype.shouldRemoveCellsFromParent;
	mxGraphHandler.prototype.shouldRemoveCellsFromParent = function (parent, cells) {
		for (let i = 0; i < cells.length; i++) {
			if (this.graph.getModel().isVertex(cells[i])) {
				const geo = this.graph.getCellGeometry(cells[i]);

				if (geo != null && geo.relative) {
					return false;
				}
			}
		}

		return mxGraphHandlerShouldRemoveCellsFromParent.apply(this, arguments);
	};

	// Overrides to ignore hotspot only for target terminal
	const mxConnectionHandlerCreateMarker = mxConnectionHandler.prototype.createMarker;
	mxConnectionHandler.prototype.createMarker = function () {
		const marker = mxConnectionHandlerCreateMarker.apply(this, arguments);

		marker.intersects = mxUtils.bind(this, function () {
			if (this.isConnecting()) {
				return true;
			}

			return mxCellMarker.prototype.intersects.apply(marker, arguments);
		});

		return marker;
	};

	// Creates background page shape
	mxGraphView.prototype.createBackgroundPageShape = function (bounds) {
		return new mxRectangleShape(bounds, '#ffffff', this.graph.defaultPageBorderColor);
	};

	// Fits the number of background pages to the graph
	mxGraphView.prototype.getBackgroundPageBounds = function () {
		const gb = this.getGraphBounds();

		// Computes unscaled, untranslated graph bounds
		const x = gb.width > 0 ? gb.x / this.scale - this.translate.x : 0;
		const y = gb.height > 0 ? gb.y / this.scale - this.translate.y : 0;
		const w = gb.width / this.scale;
		const h = gb.height / this.scale;

		const fmt = this.graph.pageFormat;
		const ps = this.graph.pageScale;

		const pw = fmt.width * ps;
		const ph = fmt.height * ps;

		const x0 = Math.floor(Math.min(0, x) / pw);
		const y0 = Math.floor(Math.min(0, y) / ph);
		const xe = Math.ceil(Math.max(1, x + w) / pw);
		const ye = Math.ceil(Math.max(1, y + h) / ph);

		const rows = xe - x0;
		const cols = ye - y0;

		const bounds = new mxRectangle(this.scale * (this.translate.x + x0 * pw), this.scale * (this.translate.y + y0 * ph), this.scale * rows * pw, this.scale * cols * ph);

		return bounds;
	};

	// Add panning for background page in VML
	const graphPanGraph = mxGraph.prototype.panGraph;
	mxGraph.prototype.panGraph = function (dx, dy) {
		graphPanGraph.apply(this, arguments);

		if (this.dialect != mxConstants.DIALECT_SVG && this.view.backgroundPageShape != null && (!this.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.container))) {
			this.view.backgroundPageShape.node.style.marginLeft = dx + 'px';
			this.view.backgroundPageShape.node.style.marginTop = dy + 'px';
		}
	};

	/**
	 * Consumes click events for disabled menu items.
	 */
	const mxPopupMenuAddItem = mxPopupMenu.prototype.addItem;
	mxPopupMenu.prototype.addItem = function (title, image, funct, parent, iconCls, enabled) {
		const result = mxPopupMenuAddItem.apply(this, arguments);

		if (enabled != null && !enabled) {
			mxEvent.addListener(result, 'mousedown', function (evt) {
				mxEvent.consume(evt);
			});
		}

		return result;
	};

	/**
	 * Selects tables before cells and rows.
	 */
	const mxGraphHandlerIsPropagateSelectionCell = mxGraphHandler.prototype.isPropagateSelectionCell;
	mxGraphHandler.prototype.isPropagateSelectionCell = function (cell, immediate, me) {
		let result = false;
		const parent = this.graph.model.getParent(cell);

		if (immediate) {
			const geo = this.graph.getCellGeometry(cell);

			return !this.graph.model.isEdge(cell) && !this.graph.model.isEdge(parent) && !this.graph.isSiblingSelected(cell) && (geo == null || geo.relative || !this.graph.isContainer(parent) || this.graph.isPart(cell));
		} else {
			result = mxGraphHandlerIsPropagateSelectionCell.apply(this, arguments);

			if (this.graph.isTableCell(cell) || this.graph.isTableRow(cell)) {
				let table = parent;

				if (!this.graph.isTable(table)) {
					table = this.graph.model.getParent(table);
				}

				result = !this.graph.selectionCellsHandler.isHandled(table) || (this.graph.isCellSelected(table) && this.graph.isToggleEvent(me.getEvent())) || (this.graph.isCellSelected(cell) && !this.graph.isToggleEvent(me.getEvent())) || (this.graph.isTableCell(cell) && this.graph.isCellSelected(parent));
			}
		}

		return result;
	};

	mxPopupMenuHandler.prototype.getCellForPopupEvent = function (me) {
		let cell = me.getCell();
		const model = this.graph.getModel();
		let parent = model.getParent(cell);
		const state = this.graph.view.getState(parent);
		let selected = this.graph.isCellSelected(cell);

		while (state != null && (model.isVertex(parent) || model.isEdge(parent))) {
			const temp = this.graph.isCellSelected(parent);
			selected = selected || temp;

			if (temp || (!selected && (this.graph.isTableCell(cell) || this.graph.isTableRow(cell)))) {
				cell = parent;
			}

			parent = model.getParent(parent);
		}

		return cell;
	};
})();

Editor.prototype.convertImages = function (svgRoot, callback, imageCache, converter) {
	if (converter == null) {
		converter = this.createImageUrlConverter();
	}
	var counter = 0;
	function inc() {
		counter++;
	}
	function dec() {
		counter--;
		if (counter == 0) {
			callback(svgRoot);
		}
	}
	var cache = imageCache || new Object();
	var convertImages = mxUtils.bind(this, function (tagName, srcAttr) {
		var images = svgRoot.getElementsByTagName(tagName);
		for (var i = 0; i < images.length; i++) {
			mxUtils.bind(this, function (img) {
				try {
					if (img != null) {
						var src = converter.convert(img.getAttribute(srcAttr));
						if (src != null && src.substring(0, 5) != 'data:') {
							var tmp = cache[src];
							if (tmp == null) {
								inc();
								this.convertImageToDataUri(src, function (uri) {
									if (uri != null) {
										cache[src] = uri;
										img.setAttribute(srcAttr, uri);
									}
									dec();
								});
							} else {
								img.setAttribute(srcAttr, tmp);
							}
						} else if (src != null) {
							img.setAttribute(srcAttr, src);
						}
					}
				} catch (e) {
					console.log(e);
				}
			})(images[i]);
		}
	});
	convertImages('image', 'xlink:href');
	convertImages('img', 'src');
	if (counter == 0) {
		callback(svgRoot);
	}
};

Editor.prototype.getMaxCanvasScale = function (w, h, scale) {
	var max = mxClient.IS_FF ? 8192 : 16384;
	return Math.min(scale, Math.min(max / w, max / h));
};

Editor.prototype.exportToCanvas = function (callback, width, imageCache, background, error, limitHeight, ignoreSelection, scale, transparentBackground, addShadow, converter, graph, border, noCrop, grid, theme, exportType, cells) {
	try {
		limitHeight = limitHeight != null ? limitHeight : true;
		ignoreSelection = ignoreSelection != null ? ignoreSelection : true;
		graph = graph != null ? graph : this.graph;
		border = border != null ? border : 0;
		var bg = transparentBackground ? null : graph.background;
		if (bg == mxConstants.NONE) {
			bg = null;
		}
		if (bg == null) {
			bg = background;
		}
		if (bg == null && transparentBackground == false) {
			bg = theme == 'dark' ? Editor.darkColor : '#ffffff';
		}
		this.convertImages(
			graph.getSvg(null, null, border, noCrop, null, ignoreSelection, null, null, null, addShadow, null, theme, exportType, cells),
			mxUtils.bind(this, function (svgRoot) {
				try {
					var img = new Image();
					img.onload = mxUtils.bind(this, function () {
						try {
							var canvas = document.createElement('canvas');
							var w = parseInt(svgRoot.getAttribute('width'));
							var h = parseInt(svgRoot.getAttribute('height'));
							scale = scale != null ? scale : 1;

							if (width != null) {
								scale = !limitHeight ? width / w : Math.min(1, Math.min((width * 3) / (h * 4), width / w));
							}

							scale = this.getMaxCanvasScale(w, h, scale);
							w = Math.ceil(scale * w);
							h = Math.ceil(scale * h);

							canvas.setAttribute('width', w);
							canvas.setAttribute('height', h);
							var ctx = canvas.getContext('2d');

							if (bg != null) {
								ctx.beginPath();
								ctx.rect(0, 0, w, h);
								ctx.fillStyle = bg;
								ctx.fill();
							}

							if (scale != 1) {
								ctx.scale(scale, scale);
							}

							function drawImage() {
								// Workaround for broken data URI images in Safari on first export
								if (mxClient.IS_SF) {
									window.setTimeout(function () {
										ctx.drawImage(img, 0, 0);
										callback(canvas, svgRoot);
									}, 0);
								} else {
									ctx.drawImage(img, 0, 0);
									callback(canvas, svgRoot);
								}
							}

							if (grid) {
								var view = graph.view;
								var curViewScale = view.scale;
								view.scale = 1; //Reset the scale temporary to generate unscaled grid image which is then scaled
								var gridImage = btoa(unescape(encodeURIComponent(view.createSvgGrid(view.gridColor))));
								view.scale = curViewScale;
								gridImage = 'data:image/svg+xml;base64,' + gridImage;
								var phase = graph.gridSize * view.gridSteps * scale;

								var b = graph.getGraphBounds();
								var tx = view.translate.x * curViewScale;
								var ty = view.translate.y * curViewScale;
								var x0 = tx + (b.x - tx) / curViewScale - border;
								var y0 = ty + (b.y - ty) / curViewScale - border;

								var background = new Image();

								background.onload = function () {
									try {
										var x = -Math.round(phase - mxUtils.mod((tx - x0) * scale, phase));
										var y = -Math.round(phase - mxUtils.mod((ty - y0) * scale, phase));
										for (var i = x; i < w; i += phase) {
											for (var j = y; j < h; j += phase) {
												ctx.drawImage(background, i / scale, j / scale);
											}
										}
										drawImage();
									} catch (e) {
										console.log(e);
										if (error != null) {
											error(e);
										}
									}
								};

								background.onerror = function (e) {
									if (error != null) {
										error(e);
									}
								};

								background.src = gridImage;
							} else {
								drawImage();
							}
						} catch (e) {
							console.log(e);
							if (error != null) {
								error(e);
							}
						}
					});

					img.onerror = function (e) {
						//console.log('img', e, img.src);

						if (error != null) {
							error(e);
						}
					};

					if (addShadow) {
						this.graph.addSvgShadow(svgRoot);
					}

					if (this.graph.mathEnabled) {
						this.addMathCss(svgRoot);
					}

					var done = mxUtils.bind(this, function () {
						try {
							if (this.resolvedFontCss != null) {
								this.addFontCss(svgRoot, this.resolvedFontCss);
							}

							img.src = Editor.createSvgDataUri(mxUtils.getXml(svgRoot));
						} catch (e) {
							console.log(e);
							if (error != null) {
								error(e);
							}
						}
					});

					this.embedExtFonts(
						mxUtils.bind(this, function (extFontsEmbeddedCss) {
							try {
								if (extFontsEmbeddedCss != null) {
									this.addFontCss(svgRoot, extFontsEmbeddedCss);
								}
								this.loadFonts(done);
							} catch (e) {
								console.log(e);
								if (error != null) {
									error(e);
								}
							}
						})
					);
				} catch (e) {
					//console.log('src', e, img.src);

					if (error != null) {
						error(e);
					}
				}
			}),
			imageCache,
			converter
		);
	} catch (e) {
		console.log(e);
		if (error != null) {
			error(e);
		}
	}
};

Editor.prototype.createImageUrlConverter = function () {
	var converter = new mxUrlConverter();
	converter.updateBaseUrl();
	var convert = converter.convert;
	var self = this;
	converter.convert = function (src) {
		if (src != null) {
			var remote = src.substring(0, 7) == 'http://' || src.substring(0, 8) == 'https://';
			if (remote && !navigator.onLine) {
				src = Editor.svgBrokenImage.src;
			} else if (remote && src.substring(0, converter.baseUrl.length) != converter.baseUrl && (!self.crossOriginImages || !self.isCorsEnabledForUrl(src))) {
				src = PROXY_URL + '?url=' + encodeURIComponent(src);
			} else if (src.substring(0, 19) != 'chrome-extension://' && !mxClient.IS_CHROMEAPP) {
				src = convert.apply(this, arguments);
			}
		}
		return src;
	};
	return converter;
};

Editor.prototype.convertImageToDataUri = function (url, callback, error) {
	try {
		var acceptResponse = true;
		var timeoutThread = window.setTimeout(
			mxUtils.bind(this, function () {
				acceptResponse = false;
				callback(Editor.svgBrokenImage.src);
			}),
			this.timeout
		);

		if (/(\.svg)$/i.test(url)) {
			mxUtils.get(
				url,
				mxUtils.bind(this, function (req) {
					window.clearTimeout(timeoutThread);
					if (acceptResponse) {
						callback(Editor.createSvgDataUri(req.getText()));
					}
				}),
				function () {
					window.clearTimeout(timeoutThread);
					if (acceptResponse) {
						callback(Editor.svgBrokenImage.src);
					}
				}
			);
		} else {
			var img = new Image();
			if (this.crossOriginImages) {
				img.crossOrigin = 'anonymous';
			}
			img.onload = function () {
				window.clearTimeout(timeoutThread);
				if (acceptResponse) {
					try {
						var canvas = document.createElement('canvas');
						var ctx = canvas.getContext('2d');
						canvas.height = img.height;
						canvas.width = img.width;
						ctx.drawImage(img, 0, 0);

						callback(canvas.toDataURL());
					} catch (e) {
						console.log(e);
						callback(Editor.svgBrokenImage.src);
					}
				}
			};

			img.onerror = function () {
				window.clearTimeout(timeoutThread);
				if (acceptResponse) {
					if (error != null) {
						error();
					} else {
						callback(Editor.svgBrokenImage.src);
					}
				}
			};

			img.src = url;
		}
	} catch (e) {
		console.log(e);
		if (error != null) {
			error();
		} else {
			callback(Editor.svgBrokenImage.src);
		}
	}
};

Graph.prototype.getCustomFonts = function () {
	var fonts = this.extFonts;
	if (fonts != null) {
		fonts = fonts.slice();
	} else {
		fonts = [];
	}
	for (var key in Graph.customFontElements) {
		var font = Graph.customFontElements[key];
		fonts.push({ name: font.name, url: font.url });
	}
	return fonts;
};

Editor.prototype.embedExtFonts = function (callback) {
	var extFonts = this.graph.getCustomFonts();

	if (extFonts.length > 0) {
		var content = [];
		var waiting = 0;

		if (this.cachedGoogleFonts == null) {
			this.cachedGoogleFonts = this.createGoogleFontCache();
		}

		var googleCssDone = mxUtils.bind(this, function () {
			if (waiting == 0) {
				this.embedCssFonts(content.join(''), callback);
			}
		});

		for (var i = 0; i < extFonts.length; i++) {
			mxUtils.bind(this, function (fontName, fontUrl) {
				if (Graph.isCssFontUrl(fontUrl)) {
					if (this.cachedGoogleFonts[fontUrl] == null) {
						waiting++;
						this.loadUrl(
							fontUrl,
							mxUtils.bind(this, function (css) {
								this.cachedGoogleFonts[fontUrl] = css;
								content.push(css + '\n');
								waiting--;
								googleCssDone();
							}),
							mxUtils.bind(this, function (err) {
								// LATER: handle error
								waiting--;
								content.push('@import url(' + fontUrl + ');\n');
								googleCssDone();
							})
						);
					} else {
						content.push(this.cachedGoogleFonts[fontUrl] + '\n');
					}
				} else {
					content.push('@font-face {' + 'font-family: "' + fontName + '";' + 'src: url("' + fontUrl + '")}\n');
				}
			})(extFonts[i].name, extFonts[i].url);
		}
		googleCssDone();
	} else {
		callback();
	}
};

Editor.prototype.loadFonts = function (then) {
	if (this.fontCss != null && this.resolvedFontCss == null) {
		this.embedCssFonts(
			this.fontCss,
			mxUtils.bind(this, function (resolvedFontCss) {
				this.resolvedFontCss = resolvedFontCss;
				if (then != null) {
					then();
				}
			})
		);
	} else if (then != null) {
		then();
	}
};

Editor.createSvgDataUri = function (svg) {
	return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
};
