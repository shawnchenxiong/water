/* eslint-disable */
/**
 * 转化为vue
 */
import {
    mxConstants,
    mxResources,
    mxEventObject,
    mxEvent,
    mxUtils,
    mxClient,
    mxRectangle,
    mxPopupMenu,
    mxCell,
    mxWindow,
    mxForm,
    mxGeometry,
    mxKeyHandler,
    mxPoint,
    mxConnectionConstraint,
    mxImage
} from '../core/mxgraph';
import {Graph} from './Graph';
import {Editor, Dialog, FilenameDialog} from './Editor';
import {mxJSColor, mxColor} from '../jscolor/jscolor';
import {EditorUi} from './EditorUi';
import {PRESENT_COLORS, DEFAULT_COLORS} from '../constant';

export {
    StorageDialog,
    ConfirmDialog,
    CustomDialog,
    ColorDialog,
    OutlineWindow,
    LayersWindow,
    CellPropertyManageDialog,
    BackgroundImageDialog,
    ConnectionPointsDialog,
    EditGeometryDialog,
    UsrImageDialog,
};

/**
 * Constructs a new color dialog.
 */
function ColorDialog(editorUi, color, apply, cancelFn) {
    this.editorUi = editorUi;

    const input = document.createElement('input');
    input.style.marginBottom = '10px';
    input.style.width = '216px';

    // Required for picker to render in IE
    if (mxClient.IS_IE) {
        input.style.marginTop = '10px';
        document.body.appendChild(input);
    }

    const applyFunction = apply != null ? apply : this.createApplyFunction();

    function doApply() {
        let color = input.value;

        // Blocks any non-alphabetic chars in colors
        if (/(^#?[a-zA-Z0-9]*$)/.test(color)) {
            if (color != 'none' && color.charAt(0) != '#') {
                color = '#' + color;
            }

            ColorDialog.addRecentColor(color != 'none' ? color.substring(1) : color, 12);
            applyFunction(color);
            editorUi.hideDialog();
        } else {
            editorUi.handleError({message: mxResources.get('invalidInput')});
        }
    }

    this.init = function () {
        if (!mxClient.IS_TOUCH) {
            input.focus();
        }
    };

    const picker = new mxColor(input);
    picker.pickerOnfocus = false;
    picker.showPicker();

    const div = document.createElement('div');
    mxJSColor.picker.box.style.position = 'relative';
    mxJSColor.picker.box.style.width = '230px';
    mxJSColor.picker.box.style.height = '100px';
    mxJSColor.picker.box.style.paddingBottom = '10px';
    div.appendChild(mxJSColor.picker.box);

    const center = document.createElement('center');

    function createRecentColorTable() {
        const table = addPresets(ColorDialog.recentColors.length == 0 ? ['FFFFFF'] : ColorDialog.recentColors, 11, 'FFFFFF', true);
        table.style.marginBottom = '8px';

        return table;
    }

    function addPresets(presets, rowLength, defaultColor, addResetOption) {
        rowLength = rowLength != null ? rowLength : 12;
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.setAttribute('cellspacing', '0');
        table.style.marginBottom = '20px';
        table.style.cellSpacing = '0px';
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        const rows = presets.length / rowLength;

        for (let row = 0; row < rows; row++) {
            var tr = document.createElement('tr');

            for (let i = 0; i < rowLength; i++) {
                (function (clr) {
                    const td = document.createElement('td');
                    td.style.border = '1px solid black';
                    td.style.padding = '0px';
                    td.style.width = '16px';
                    td.style.height = '16px';

                    if (clr == null) {
                        clr = defaultColor;
                    }

                    if (clr == 'none') {
                        td.style.background = "url('" + Dialog.prototype.noColorImage + "')";
                    } else {
                        td.style.backgroundColor = '#' + clr;
                    }

                    tr.appendChild(td);

                    if (clr != null) {
                        td.style.cursor = 'pointer';

                        mxEvent.addListener(td, 'click', function () {
                            if (clr == 'none') {
                                picker.fromString('ffffff');
                                input.value = 'none';
                            } else {
                                picker.fromString(clr);
                            }
                        });

                        mxEvent.addListener(td, 'dblclick', doApply);
                    }
                })(presets[row * rowLength + i]);
            }

            tbody.appendChild(tr);
        }

        if (addResetOption) {
            const td = document.createElement('td');
            td.setAttribute('title', mxResources.get('reset'));
            td.style.border = '1px solid black';
            td.style.padding = '0px';
            td.style.width = '16px';
            td.style.height = '16px';
            td.style.backgroundImage = "url('" + Dialog.prototype.closeImage + "')";
            td.style.backgroundPosition = 'center center';
            td.style.backgroundRepeat = 'no-repeat';
            td.style.cursor = 'pointer';

            tr.appendChild(td);

            mxEvent.addListener(td, 'click', function () {
                ColorDialog.resetRecentColors();
                table.parentNode.replaceChild(createRecentColorTable(), table);
            });
        }

        center.appendChild(table);

        return table;
    }

    div.appendChild(input);
    mxUtils.br(div);

    // Adds recent colors
    createRecentColorTable();

    // Adds presets
    let table = addPresets(this.presetColors);
    table.style.marginBottom = '8px';
    table = addPresets(this.defaultColors);
    table.style.marginBottom = '16px';

    div.appendChild(center);

    const buttons = document.createElement('div');
    buttons.style.textAlign = 'right';
    buttons.style.whiteSpace = 'nowrap';

    const cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();

        if (cancelFn != null) {
            cancelFn();
        }
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
    }

    const applyBtn = mxUtils.button(mxResources.get('apply'), doApply);
    applyBtn.className = 'geBtn gePrimaryBtn';
    buttons.appendChild(applyBtn);

    if (!editorUi.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
    }

    if (color != null) {
        if (color == 'none') {
            picker.fromString('ffffff');
            input.value = 'none';
        } else {
            picker.fromString(color);
        }
    }

    div.appendChild(buttons);
    this.picker = picker;
    this.colorInput = input;

    // LATER: Only fires if input if focused, should always
    // fire if this dialog is showing.
    mxEvent.addListener(div, 'keydown', function (e) {
        if (e.keyCode == 27) {
            editorUi.hideDialog();

            if (cancelFn != null) {
                cancelFn();
            }

            mxEvent.consume(e);
        }
    });

    this.container = div;
}

/**
 * Creates function to apply value
 */
ColorDialog.prototype.presetColors = PRESENT_COLORS;

/**
 * Creates function to apply value
 */
ColorDialog.prototype.defaultColors = ['none', ...DEFAULT_COLORS];

/**
 * Creates function to apply value
 */
ColorDialog.prototype.createApplyFunction = function () {
    return mxUtils.bind(this, function (color) {
        const graph = this.editorUi.editor.graph;

        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(this.currentColorKey, color);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.currentColorKey], 'values', [color], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
};

/**
 *
 */
ColorDialog.recentColors = [];

/**
 * Adds recent color for later use.
 */
ColorDialog.addRecentColor = function (color, max) {
    if (color != null) {
        mxUtils.remove(color, ColorDialog.recentColors);
        ColorDialog.recentColors.splice(0, 0, color);

        if (ColorDialog.recentColors.length >= max) {
            ColorDialog.recentColors.pop();
        }
    }
};

/**
 * Adds recent color for later use.
 */
ColorDialog.resetRecentColors = function () {
    ColorDialog.recentColors = [];
};

/**
 *
 */
function OutlineWindow(editorUi, x, y, w, h) {
    const graph = editorUi.editor.graph;

    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.border = '1px solid whiteSmoke';
    div.style.overflow = 'hidden';

    this.window = new mxWindow(mxResources.get('outline'), div, x, y, w, h, true, true);
    this.window.minimumSize = new mxRectangle(0, 0, 80, 80);
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
    this.window.setVisible(true);

    this.window.setLocation = function (x, y) {
        const iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
        const ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

        x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
        y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

        if (this.getX() != x || this.getY() != y) {
            mxWindow.prototype.setLocation.apply(this, arguments);
        }
    };

    const resizeListener = mxUtils.bind(this, function () {
        const x = this.window.getX();
        const y = this.window.getY();

        this.window.setLocation(x, y);
    });

    mxEvent.addListener(window, 'resize', resizeListener);

    const outline = editorUi.createOutline(this.window);

    this.destroy = function () {
        mxEvent.removeListener(window, 'resize', resizeListener);
        this.window.destroy();
        outline.destroy();
    };

    this.window.addListener(
        mxEvent.RESIZE,
        mxUtils.bind(this, function () {
            outline.update(false);
            outline.outline.sizeDidChange();
        })
    );

    this.window.addListener(
        mxEvent.SHOW,
        mxUtils.bind(this, function () {
            this.window.fit();
            outline.suspended = false;
            outline.outline.refresh();
            outline.update();
        })
    );

    this.window.addListener(
        mxEvent.HIDE,
        mxUtils.bind(this, function () {
            outline.suspended = true;
        })
    );

    this.window.addListener(
        mxEvent.NORMALIZE,
        mxUtils.bind(this, function () {
            outline.suspended = false;
            outline.update();
        })
    );

    this.window.addListener(
        mxEvent.MINIMIZE,
        mxUtils.bind(this, function () {
            outline.suspended = true;
        })
    );

    const outlineCreateGraph = outline.createGraph;
    outline.createGraph = function () {
        const g = outlineCreateGraph.apply(this, arguments);
        g.gridEnabled = false;
        g.pageScale = graph.pageScale;
        g.pageFormat = graph.pageFormat;
        g.background = graph.background == null || graph.background == mxConstants.NONE ? graph.defaultPageBackgroundColor : graph.background;
        g.pageVisible = graph.pageVisible;

        const current = mxUtils.getCurrentStyle(graph.container);
        div.style.backgroundColor = current.backgroundColor;

        return g;
    };

    function update() {
        outline.outline.pageScale = graph.pageScale;
        outline.outline.pageFormat = graph.pageFormat;
        outline.outline.pageVisible = graph.pageVisible;
        outline.outline.background = graph.background == null || graph.background == mxConstants.NONE ? graph.defaultPageBackgroundColor : graph.background;

        const current = mxUtils.getCurrentStyle(graph.container);
        div.style.backgroundColor = current.backgroundColor;

        if (graph.view.backgroundPageShape != null && outline.outline.view.backgroundPageShape != null) {
            outline.outline.view.backgroundPageShape.fill = graph.view.backgroundPageShape.fill;
        }

        outline.outline.refresh();
    }

    outline.init(div);

    editorUi.editor.addListener('resetGraphView', update);
    editorUi.addListener('pageFormatChanged', update);
    editorUi.addListener('backgroundColorChanged', update);
    editorUi.addListener('backgroundImageChanged', update);
    editorUi.addListener('pageViewChanged', function () {
        update();
        outline.update(true);
    });

    if (outline.outline.dialect == mxConstants.DIALECT_SVG) {
        const zoomInAction = editorUi.actions.get('zoomIn');
        const zoomOutAction = editorUi.actions.get('zoomOut');

        mxEvent.addMouseWheelListener(function (evt, up) {
            let outlineWheel = false;
            let source = mxEvent.getSource(evt);

            while (source != null) {
                if (source == outline.outline.view.canvas.ownerSVGElement) {
                    outlineWheel = true;
                    break;
                }

                source = source.parentNode;
            }

            if (outlineWheel) {
                if (up) {
                    zoomInAction.funct();
                } else {
                    zoomOutAction.funct();
                }
            }
        });
    }
}

/**
 *
 */
function LayersWindow(editorUi, x, y, w, h) {
    const graph = editorUi.editor.graph;

    const div = document.createElement('div');
    div.style.userSelect = 'none';
    div.style.background = Dialog.backdropColor == 'white' ? 'whiteSmoke' : Dialog.backdropColor;
    div.style.border = '1px solid whiteSmoke';
    div.style.height = '100%';
    div.style.marginBottom = '10px';
    div.style.overflow = 'auto';

    const tbarHeight = !EditorUi.compactUi ? '30px' : '26px';

    const listDiv = document.createElement('div');
    listDiv.style.backgroundColor = Dialog.backdropColor == 'white' ? '#dcdcdc' : Dialog.backdropColor;
    listDiv.style.position = 'absolute';
    listDiv.style.overflow = 'auto';
    listDiv.style.left = '0px';
    listDiv.style.right = '0px';
    listDiv.style.top = '0px';
    listDiv.style.bottom = parseInt(tbarHeight) + 7 + 'px';
    div.appendChild(listDiv);

    let dragSource = null;
    let dropIndex = null;

    mxEvent.addListener(div, 'dragover', function (evt) {
        evt.dataTransfer.dropEffect = 'move';
        dropIndex = 0;
        evt.stopPropagation();
        evt.preventDefault();
    });

    // Workaround for "no element found" error in FF
    mxEvent.addListener(div, 'drop', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
    });

    let layerCount = null;
    let selectionLayer = null;
    const ldiv = document.createElement('div');

    ldiv.className = 'geToolbarContainer';
    ldiv.style.position = 'absolute';
    ldiv.style.bottom = '0px';
    ldiv.style.left = '0px';
    ldiv.style.right = '0px';
    ldiv.style.height = tbarHeight;
    ldiv.style.overflow = 'hidden';
    ldiv.style.padding = !EditorUi.compactUi ? '1px' : '4px 0px 3px 0px';
    ldiv.style.backgroundColor = Dialog.backdropColor == 'white' ? 'whiteSmoke' : Dialog.backdropColor;
    ldiv.style.borderWidth = '1px 0px 0px 0px';
    ldiv.style.borderColor = '#c3c3c3';
    ldiv.style.borderStyle = 'solid';
    ldiv.style.display = 'block';
    ldiv.style.whiteSpace = 'nowrap';

    if (mxClient.IS_QUIRKS) {
        ldiv.style.filter = 'none';
    }

    const link = document.createElement('a');
    link.className = 'geButton';

    if (mxClient.IS_QUIRKS) {
        link.style.filter = 'none';
    }

    const removeLink = link.cloneNode();
    removeLink.innerHTML = '<div class="geSprite geSprite-delete" style="display:inline-block;"></div>';

    mxEvent.addListener(removeLink, 'click', function (evt) {
        if (graph.isEnabled()) {
            graph.model.beginUpdate();
            try {
                const index = graph.model.root.getIndex(selectionLayer);
                graph.removeCells([selectionLayer], false);

                // Creates default layer if no layer exists
                if (graph.model.getChildCount(graph.model.root) == 0) {
                    graph.model.add(graph.model.root, new mxCell());
                    graph.setDefaultParent(null);
                } else if (index > 0 && index <= graph.model.getChildCount(graph.model.root)) {
                    graph.setDefaultParent(graph.model.getChildAt(graph.model.root, index - 1));
                } else {
                    graph.setDefaultParent(null);
                }
            } finally {
                graph.model.endUpdate();
            }
        }

        mxEvent.consume(evt);
    });

    if (!graph.isEnabled()) {
        removeLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(removeLink);

    const insertLink = link.cloneNode();
    insertLink.setAttribute('title', mxUtils.trim(mxResources.get('moveSelectionTo', [''])));
    insertLink.innerHTML = '<div class="geSprite geSprite-insert" style="display:inline-block;"></div>';

    mxEvent.addListener(insertLink, 'click', function (evt) {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            editorUi.editor.graph.popupMenuHandler.hideMenu();

            const menu = new mxPopupMenu(
                mxUtils.bind(this, function (menu, parent) {
                    for (let i = layerCount - 1; i >= 0; i--) {
                        mxUtils.bind(this, function (child) {
                            const item = menu.addItem(
                                graph.convertValueToString(child) || mxResources.get('background'),
                                null,
                                mxUtils.bind(this, function () {
                                    graph.moveCells(graph.getSelectionCells(), 0, 0, false, child);
                                }),
                                parent
                            );

                            if (graph.getSelectionCount() == 1 && graph.model.isAncestor(child, graph.getSelectionCell())) {
                                menu.addCheckmark(item, Editor.checkmarkImage);
                            }
                        })(graph.model.getChildAt(graph.model.root, i));
                    }
                })
            );
            menu.div.className += ' geMenubarMenu';
            menu.smartSeparators = true;
            menu.showDisabled = true;
            menu.autoExpand = true;

            // Disables autoexpand and destroys menu when hidden
            menu.hideMenu = mxUtils.bind(this, function () {
                mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
                menu.destroy();
            });

            const offset = mxUtils.getOffset(insertLink);
            menu.popup(offset.x, offset.y + insertLink.offsetHeight, null, evt);

            // Allows hiding by clicking on document
            editorUi.setCurrentMenu(menu);
        }
    });

    ldiv.appendChild(insertLink);

    const dataLink = link.cloneNode();
    dataLink.innerHTML = '<div class="geSprite geSprite-dots" style="display:inline-block;"></div>';
    dataLink.setAttribute('title', mxResources.get('rename'));

    mxEvent.addListener(dataLink, 'click', function (evt) {
        if (graph.isEnabled()) {
            editorUi.showDataDialog(selectionLayer);
        }

        mxEvent.consume(evt);
    });

    if (!graph.isEnabled()) {
        dataLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(dataLink);

    function renameLayer(layer) {
        if (graph.isEnabled() && layer != null) {
            const label = graph.convertValueToString(layer);
            const dlg = new FilenameDialog(
                editorUi,
                label || mxResources.get('background'),
                mxResources.get('rename'),
                mxUtils.bind(this, function (newValue) {
                    if (newValue != null) {
                        graph.cellLabelChanged(layer, newValue);
                    }
                }),
                mxResources.get('enterName')
            );
            editorUi.showDialog(dlg.container, 300, 100, true, true);
            dlg.init();
        }
    }

    const duplicateLink = link.cloneNode();
    duplicateLink.innerHTML = '<div class="geSprite geSprite-duplicate" style="display:inline-block;"></div>';

    mxEvent.addListener(duplicateLink, 'click', function () {
        if (graph.isEnabled()) {
            let newCell = null;
            graph.model.beginUpdate();
            try {
                newCell = graph.cloneCell(selectionLayer);
                graph.cellLabelChanged(newCell, mxResources.get('untitledLayer'));
                newCell.setVisible(true);
                newCell = graph.addCell(newCell, graph.model.root);
                graph.setDefaultParent(newCell);
            } finally {
                graph.model.endUpdate();
            }

            if (newCell != null && !graph.isCellLocked(newCell)) {
                graph.selectAll(newCell);
            }
        }
    });

    if (!graph.isEnabled()) {
        duplicateLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(duplicateLink);

    const addLink = link.cloneNode();
    addLink.innerHTML = '<div class="geSprite geSprite-plus" style="display:inline-block;"></div>';
    addLink.setAttribute('title', mxResources.get('addLayer'));

    mxEvent.addListener(addLink, 'click', function (evt) {
        if (graph.isEnabled()) {
            graph.model.beginUpdate();

            try {
                const cell = graph.addCell(new mxCell(mxResources.get('untitledLayer')), graph.model.root);
                graph.setDefaultParent(cell);
            } finally {
                graph.model.endUpdate();
            }
        }

        mxEvent.consume(evt);
    });

    if (!graph.isEnabled()) {
        addLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(addLink);
    div.appendChild(ldiv);

    function refresh() {
        layerCount = graph.model.getChildCount(graph.model.root);
        listDiv.innerHTML = '';

        function addLayer(index, label, child, defaultParent) {
            const ldiv = document.createElement('div');
            ldiv.className = 'geToolbarContainer';

            ldiv.style.overflow = 'hidden';
            ldiv.style.position = 'relative';
            ldiv.style.padding = '4px';
            ldiv.style.height = '22px';
            ldiv.style.display = 'block';
            ldiv.style.backgroundColor = Dialog.backdropColor == 'white' ? 'whiteSmoke' : Dialog.backdropColor;
            ldiv.style.borderWidth = '0px 0px 1px 0px';
            ldiv.style.borderColor = '#c3c3c3';
            ldiv.style.borderStyle = 'solid';
            ldiv.style.whiteSpace = 'nowrap';
            ldiv.setAttribute('title', label);

            const left = document.createElement('div');
            left.style.display = 'inline-block';
            left.style.width = '100%';
            left.style.textOverflow = 'ellipsis';
            left.style.overflow = 'hidden';

            mxEvent.addListener(ldiv, 'dragover', function (evt) {
                evt.dataTransfer.dropEffect = 'move';
                dropIndex = index;
                evt.stopPropagation();
                evt.preventDefault();
            });

            mxEvent.addListener(ldiv, 'dragstart', function (evt) {
                dragSource = ldiv;

                // Workaround for no DnD on DIV in FF
                if (mxClient.IS_FF) {
                    // LATER: Check what triggers a parse as XML on this in FF after drop
                    evt.dataTransfer.setData('Text', '<layer/>');
                }
            });

            mxEvent.addListener(ldiv, 'dragend', function (evt) {
                if (dragSource != null && dropIndex != null) {
                    graph.addCell(child, graph.model.root, dropIndex);
                }

                dragSource = null;
                dropIndex = null;
                evt.stopPropagation();
                evt.preventDefault();
            });

            const btn = document.createElement('img');
            btn.setAttribute('draggable', 'false');
            btn.setAttribute('align', 'top');
            btn.setAttribute('border', '0');
            btn.style.padding = '4px';
            btn.setAttribute('title', mxResources.get('lockUnlock'));

            const style = graph.getCurrentCellStyle(child);

            if (mxUtils.getValue(style, 'locked', '0') == '1') {
                btn.setAttribute('src', Dialog.prototype.lockedImage);
            } else {
                btn.setAttribute('src', Dialog.prototype.unlockedImage);
            }

            if (graph.isEnabled()) {
                btn.style.cursor = 'pointer';
            }

            mxEvent.addListener(btn, 'click', function (evt) {
                if (graph.isEnabled()) {
                    let value = null;

                    graph.getModel().beginUpdate();
                    try {
                        value = mxUtils.getValue(style, 'locked', '0') == '1' ? null : '1';
                        graph.setCellStyles('locked', value, [child]);
                    } finally {
                        graph.getModel().endUpdate();
                    }

                    if (value == '1') {
                        graph.removeSelectionCells(graph.getModel().getDescendants(child));
                    }

                    mxEvent.consume(evt);
                }
            });

            left.appendChild(btn);

            const inp = document.createElement('input');
            inp.setAttribute('type', 'checkbox');
            inp.setAttribute('title', mxResources.get('hideIt', [child.value || mxResources.get('background')]));
            inp.style.marginLeft = '4px';
            inp.style.marginRight = '6px';
            inp.style.marginTop = '4px';
            left.appendChild(inp);

            if (graph.model.isVisible(child)) {
                inp.setAttribute('checked', 'checked');
                inp.defaultChecked = true;
            }

            mxEvent.addListener(inp, 'click', function (evt) {
                graph.model.setVisible(child, !graph.model.isVisible(child));
                mxEvent.consume(evt);
            });

            mxUtils.write(left, label);
            ldiv.appendChild(left);

            if (graph.isEnabled()) {
                // Fallback if no drag and drop is available
                if (mxClient.IS_TOUCH || mxClient.IS_POINTER || mxClient.IS_VML || (mxClient.IS_IE && document.documentMode < 10)) {
                    const right = document.createElement('div');
                    right.style.display = 'block';
                    right.style.textAlign = 'right';
                    right.style.whiteSpace = 'nowrap';
                    right.style.position = 'absolute';
                    right.style.right = '6px';
                    right.style.top = '6px';

                    // Poor man's change layer order
                    if (index > 0) {
                        const img2 = document.createElement('a');

                        img2.setAttribute('title', mxResources.get('toBack'));

                        img2.className = 'geButton';
                        img2.style.cssFloat = 'none';
                        img2.innerHTML = '&#9660;';
                        img2.style.width = '14px';
                        img2.style.height = '14px';
                        img2.style.fontSize = '14px';
                        img2.style.margin = '0px';
                        img2.style.marginTop = '-1px';
                        right.appendChild(img2);

                        mxEvent.addListener(img2, 'click', function (evt) {
                            if (graph.isEnabled()) {
                                graph.addCell(child, graph.model.root, index - 1);
                            }

                            mxEvent.consume(evt);
                        });
                    }

                    if (index >= 0 && index < layerCount - 1) {
                        const img1 = document.createElement('a');

                        img1.setAttribute('title', mxResources.get('toFront'));

                        img1.className = 'geButton';
                        img1.style.cssFloat = 'none';
                        img1.innerHTML = '&#9650;';
                        img1.style.width = '14px';
                        img1.style.height = '14px';
                        img1.style.fontSize = '14px';
                        img1.style.margin = '0px';
                        img1.style.marginTop = '-1px';
                        right.appendChild(img1);

                        mxEvent.addListener(img1, 'click', function (evt) {
                            if (graph.isEnabled()) {
                                graph.addCell(child, graph.model.root, index + 1);
                            }

                            mxEvent.consume(evt);
                        });
                    }

                    ldiv.appendChild(right);
                }

                if (!mxClient.IS_IE || document.documentMode >= 10) {
                    ldiv.setAttribute('draggable', 'true');
                    ldiv.style.cursor = 'move';
                }
            }

            mxEvent.addListener(ldiv, 'dblclick', function (evt) {
                const nodeName = mxEvent.getSource(evt).nodeName;

                if (nodeName != 'INPUT' && nodeName != 'IMG') {
                    renameLayer(child);
                    mxEvent.consume(evt);
                }
            });

            if (graph.getDefaultParent() == child) {
                ldiv.style.background = Dialog.backdropColor == 'white' ? '#e6eff8' : '#505759';
                ldiv.style.fontWeight = graph.isEnabled() ? 'bold' : '';
                selectionLayer = child;
            } else {
                mxEvent.addListener(ldiv, 'click', function () {
                    if (graph.isEnabled()) {
                        graph.setDefaultParent(defaultParent);
                        graph.view.setCurrentRoot(null);
                        refresh();
                    }
                });
            }

            listDiv.appendChild(ldiv);
        }

        // Cannot be moved or deleted
        for (var i = layerCount - 1; i >= 0; i--) {
            mxUtils.bind(this, function (child) {
                addLayer(i, graph.convertValueToString(child) || mxResources.get('background'), child, child);
            })(graph.model.getChildAt(graph.model.root, i));
        }

        const label = graph.convertValueToString(selectionLayer) || mxResources.get('background');
        removeLink.setAttribute('title', mxResources.get('removeIt', [label]));
        duplicateLink.setAttribute('title', mxResources.get('duplicateIt', [label]));
        dataLink.setAttribute('title', mxResources.get('editData'));

        if (graph.isSelectionEmpty()) {
            insertLink.className = 'geButton mxDisabled';
        }
    }

    refresh();
    graph.model.addListener(mxEvent.CHANGE, function () {
        refresh();
    });

    graph.selectionModel.addListener(mxEvent.CHANGE, function () {
        if (graph.isSelectionEmpty()) {
            insertLink.className = 'geButton mxDisabled';
        } else {
            insertLink.className = 'geButton';
        }
    });

    this.window = new mxWindow(mxResources.get('layers'), div, x, y, w, h, true, true);
    this.window.minimumSize = new mxRectangle(0, 0, 120, 120);
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
    this.window.setVisible(true);

    this.init = function () {
        listDiv.scrollTop = listDiv.scrollHeight - listDiv.clientHeight;
    };

    this.window.addListener(
        mxEvent.SHOW,
        mxUtils.bind(this, function () {
            this.window.fit();
        })
    );

    // Make refresh available via instance
    this.refreshLayers = refresh;

    this.window.setLocation = function (x, y) {
        const iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
        const ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

        x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
        y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

        if (this.getX() != x || this.getY() != y) {
            mxWindow.prototype.setLocation.apply(this, arguments);
        }
    };

    const resizeListener = mxUtils.bind(this, function () {
        const x = this.window.getX();
        const y = this.window.getY();

        this.window.setLocation(x, y);
    });

    mxEvent.addListener(window, 'resize', resizeListener);

    this.destroy = function () {
        mxEvent.removeListener(window, 'resize', resizeListener);
        this.window.destroy();
    };
}

/**
 * Constructs a new embed dialog
 */
function EmbedDialog(editorUi, result, timeout, ignoreSize, previewFn, title, tweet, previewTitle, filename) {
    tweet = tweet != null ? tweet : 'Check out the diagram I made using @drawio';
    var div = document.createElement('div');
    var maxSize = 500000;
    var maxFbSize = 51200;
    var maxTwitterSize = 7168;

    // Checks if result is a link
    var validUrl = /^https?:\/\//.test(result) || /^mailto:\/\//.test(result);

    if (title != null) {
        mxUtils.write(div, title);
    } else {
        mxUtils.write(div, mxResources.get(result.length < maxSize ? (validUrl ? 'link' : 'mainEmbedNotice') : 'preview') + ':');
    }
    mxUtils.br(div);

    var size = document.createElement('div');
    size.style.position = 'absolute';
    size.style.top = '30px';
    size.style.right = '30px';
    size.style.color = 'gray';
    mxUtils.write(size, editorUi.formatFileSize(result.length));

    div.appendChild(size);

    // Using DIV for faster rendering
    var text = document.createElement('textarea');
    text.setAttribute('autocomplete', 'off');
    text.setAttribute('autocorrect', 'off');
    text.setAttribute('autocapitalize', 'off');
    text.setAttribute('spellcheck', 'false');
    text.style.fontFamily = 'monospace';
    text.style.wordBreak = 'break-all';
    text.style.marginTop = '10px';
    text.style.resize = 'none';
    text.style.height = '150px';
    text.style.width = '440px';
    text.style.border = '1px solid gray';
    text.value = mxResources.get('updatingDocument');
    div.appendChild(text);
    mxUtils.br(div);

    this.init = function () {
        window.setTimeout(function () {
            if (result.length < maxSize) {
                text.value = result;
                text.focus();

                if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5) {
                    text.select();
                } else {
                    document.execCommand('selectAll', false, null);
                }
            } else {
                text.setAttribute('readonly', 'true');
                text.value = mxResources.get('tooLargeUseDownload');
            }
        }, 0);
    };

    var buttons = document.createElement('div');
    buttons.style.position = 'absolute';
    buttons.style.bottom = '36px';
    buttons.style.right = '32px';

    var previewBtn = null;

    // Loads forever in IE9
    if (EmbedDialog.showPreviewOption && (!mxClient.IS_CHROMEAPP || validUrl) && !navigator.standalone && (validUrl || (mxClient.IS_SVG && (document.documentMode == null || document.documentMode > 9)))) {
        previewBtn = mxUtils.button(previewTitle != null ? previewTitle : mxResources.get(result.length < maxSize ? 'preview' : 'openInNewWindow'), function () {
            var value = result.length < maxSize ? text.value : result;

            if (previewFn != null) {
                previewFn(value);
            } else {
                if (validUrl) {
                    try {
                        var win = editorUi.openLink(value);

                        if (win != null && (timeout == null || timeout > 0)) {
                            window.setTimeout(
                                mxUtils.bind(this, function () {
                                    try {
                                        if (win != null && win.location.href != null && win.location.href.substring(0, 8) != value.substring(0, 8)) {
                                            win.close();
                                            editorUi.handleError({
                                                message: mxResources.get('drawingTooLarge'),
                                            });
                                        }
                                    } catch (e) {
                                        // ignore
                                    }
                                }),
                                timeout || 500
                            );
                        }
                    } catch (e) {
                        editorUi.handleError({
                            message: e.message || mxResources.get('drawingTooLarge'),
                        });
                    }
                } else {
                    var wnd = window.open();
                    var doc = wnd != null ? wnd.document : null;

                    if (doc != null) {
                        doc.writeln('<html><head><title>' + mxUtils.htmlEntities(mxResources.get('preview')) + '</title><meta charset="utf-8"></head><body>' + mxUtils.htmlEntities(result) + '</body></html>');
                        doc.close();
                    } else {
                        editorUi.handleError({
                            message: mxResources.get('errorUpdatingPreview'),
                        });
                    }
                }
            }
        });

        previewBtn.className = 'geBtn';
        buttons.appendChild(previewBtn);
    }

    if (!validUrl || result.length > 7500) {
        var downloadBtn = mxUtils.button(mxResources.get('download'), function () {
            editorUi.hideDialog();
            editorUi.saveData(filename != null ? filename : 'embed.txt', 'txt', result, 'text/plain');
        });

        downloadBtn.className = 'geBtn';
        buttons.appendChild(downloadBtn);
    }

    // Twitter-intent does not allow more characters, must be pasted manually
    if (validUrl && (!editorUi.isOffline() || mxClient.IS_CHROMEAPP)) {
        if (result.length < maxFbSize) {
            var fbBtn = mxUtils.button('', function () {
                try {
                    var url = 'https://www.facebook.com/sharer.php?p[url]=' + encodeURIComponent(text.value);
                    editorUi.openLink(url);
                } catch (e) {
                    editorUi.handleError({
                        message: e.message || mxResources.get('drawingTooLarge'),
                    });
                }
            });

            var img = document.createElement('img');
            img.setAttribute('src', Editor.facebookImage);
            img.setAttribute('width', '18');
            img.setAttribute('height', '18');
            img.setAttribute('border', '0');

            fbBtn.appendChild(img);
            fbBtn.setAttribute('title', mxResources.get('facebook') + ' (' + editorUi.formatFileSize(maxFbSize) + ' max)');
            fbBtn.style.verticalAlign = 'bottom';
            fbBtn.style.paddingTop = '4px';
            fbBtn.style.minWidth = '46px';
            fbBtn.className = 'geBtn';
            buttons.appendChild(fbBtn);
        }

        if (result.length < maxTwitterSize) {
            var tweetBtn = mxUtils.button('', function () {
                try {
                    var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet) + '&url=' + encodeURIComponent(text.value);

                    editorUi.openLink(url);
                } catch (e) {
                    editorUi.handleError({
                        message: e.message || mxResources.get('drawingTooLarge'),
                    });
                }
            });

            var img = document.createElement('img');
            img.setAttribute('src', Editor.tweetImage);
            img.setAttribute('width', '18');
            img.setAttribute('height', '18');
            img.setAttribute('border', '0');
            img.style.marginBottom = '5px';

            tweetBtn.appendChild(img);
            tweetBtn.setAttribute('title', mxResources.get('twitter') + ' (' + editorUi.formatFileSize(maxTwitterSize) + ' max)');
            tweetBtn.style.verticalAlign = 'bottom';
            tweetBtn.style.paddingTop = '4px';
            tweetBtn.style.minWidth = '46px';
            tweetBtn.className = 'geBtn';
            buttons.appendChild(tweetBtn);
        }
    }

    if (!editorUi.isOffline() && result.length < maxSize) {
        var emailBtn = mxUtils.button('', function () {
            try {
                var url = 'mailto:?subject=' + encodeURIComponent(filename || editorUi.defaultFilename) + '&body=' + encodeURIComponent(text.value);

                editorUi.openLink(url);
            } catch (e) {
                editorUi.handleError({
                    message: e.message || mxResources.get('drawingTooLarge'),
                });
            }
        });

        var img = document.createElement('img');
        img.className = 'geAdaptiveAsset';
        img.setAttribute('src', Editor.mailImage);
        img.setAttribute('width', '18');
        img.setAttribute('height', '18');
        img.setAttribute('border', '0');
        img.style.marginBottom = '5px';

        emailBtn.appendChild(img);
        emailBtn.style.verticalAlign = 'bottom';
        emailBtn.style.paddingTop = '4px';
        emailBtn.style.minWidth = '46px';
        emailBtn.className = 'geBtn';
        buttons.appendChild(emailBtn);
    }

    var closeBtn = mxUtils.button(mxResources.get('close'), function () {
        editorUi.hideDialog();
    });

    buttons.appendChild(closeBtn);

    var copyBtn = mxUtils.button(mxResources.get('copy'), function () {
        text.focus();

        if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5) {
            text.select();
        } else {
            document.execCommand('selectAll', false, null);
        }

        document.execCommand('copy');
        editorUi.alert(mxResources.get('copiedToClipboard'));
    });

    if (result.length < maxSize) {
        // Does not work in Safari and shows annoying dialog for IE11-
        if (!mxClient.IS_SF && document.documentMode == null) {
            buttons.appendChild(copyBtn);
            copyBtn.className = 'geBtn gePrimaryBtn';
            closeBtn.className = 'geBtn';
        } else {
            closeBtn.className = 'geBtn gePrimaryBtn';
        }
    } else if (previewBtn != null) {
        buttons.appendChild(previewBtn);
        closeBtn.className = 'geBtn';
        previewBtn.className = 'geBtn gePrimaryBtn';
    }

    div.appendChild(buttons);
    this.container = div;
}

/**
 * 构造一个新的元数据对话框。
 */
function EditDataDialog(ui, cell) {
    var div = document.createElement('div');
    var graph = ui.editor.graph;
    var value = graph.getModel().getValue(cell);
    // 将值转换为 XML 节点
    if (!mxUtils.isNode(value)) {
        var doc = mxUtils.createXmlDocument();
        var obj = doc.createElement('object');
        obj.setAttribute('label', value || '');
        value = obj;
    }

    var meta = {};

    try {
        var temp = mxUtils.getValue(ui.editor.graph.getCurrentCellStyle(cell), 'metaData', null);
        if (temp != null) {
            meta = JSON.parse(temp);
        }
    } catch (e) {
        // ignore
        console.log('EditDataDialog----', e);
    }

    // Creates the dialog contents
    var form = new mxForm('properties');
    form.table.style.width = '100%';

    var attrs = value.attributes;
    var names = [];
    var texts = [];
    var count = 0;

    var id = EditDataDialog.getDisplayIdForCell != null ? EditDataDialog.getDisplayIdForCell(ui, cell) : null;

    var addRemoveButton = function (text, name) {
        var wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.paddingRight = '20px';
        wrapper.style.boxSizing = 'border-box';
        wrapper.style.width = '100%';

        var removeAttr = document.createElement('a');
        var img = mxUtils.createImage(Dialog.prototype.closeImage);
        img.style.height = '9px';
        img.style.fontSize = '9px';
        img.style.marginBottom = mxClient.IS_IE11 ? '-1px' : '5px';

        removeAttr.className = 'geButton';
        removeAttr.setAttribute('title', mxResources.get('delete'));
        removeAttr.style.position = 'absolute';
        removeAttr.style.top = '4px';
        removeAttr.style.right = '0px';
        removeAttr.style.margin = '0px';
        removeAttr.style.width = '9px';
        removeAttr.style.height = '9px';
        removeAttr.style.cursor = 'pointer';
        removeAttr.appendChild(img);

        var removeAttrFn = (function (name) {
            return function () {
                var count = 0;

                for (var j = 0; j < names.length; j++) {
                    if (names[j] == name) {
                        texts[j] = null;
                        form.table.deleteRow(count + (id != null ? 1 : 0));

                        break;
                    }

                    if (texts[j] != null) {
                        count++;
                    }
                }
            };
        })(name);

        mxEvent.addListener(removeAttr, 'click', removeAttrFn);

        var parent = text.parentNode;
        wrapper.appendChild(text);
        wrapper.appendChild(removeAttr);
        parent.appendChild(wrapper);
    };

    var addTextArea = function (index, name, value) {
        names[index] = name;
        texts[index] = form.addTextarea(names[count] + ':', value, 2);
        texts[index].style.width = '100%';

        if (value.indexOf('\n') > 0) {
            texts[index].setAttribute('rows', '2');
        }

        addRemoveButton(texts[index], name);

        if (meta[name] != null && meta[name].editable == false) {
            texts[index].setAttribute('disabled', 'disabled');
        }
    };

    var temp = [];
    var isLayer = graph.getModel().getParent(cell) == graph.getModel().getRoot();

    for (var i = 0; i < attrs.length; i++) {
        if ((attrs[i].nodeName != 'label' || Graph.translateDiagram || isLayer) && attrs[i].nodeName != 'placeholders') {
            temp.push({name: attrs[i].nodeName, value: attrs[i].nodeValue});
        }
    }

    // Sorts by name
    temp.sort(function (a, b) {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        } else {
            return 0;
        }
    });

    if (id != null) {
        var text = document.createElement('div');
        text.style.width = '100%';
        text.style.fontSize = '11px';
        text.style.textAlign = 'center';
        mxUtils.write(text, id);

        var idInput = form.addField(mxResources.get('id') + ':', text);

        mxEvent.addListener(text, 'dblclick', function (evt) {
            var dlg = new FilenameDialog(
                ui,
                id,
                mxResources.get('apply'),
                mxUtils.bind(this, function (value) {
                    if (value != null && value.length > 0 && value != id) {
                        if (graph.model.isRoot(cell)) {
                            var page = ui.getPageById(id);

                            if (page != null) {
                                if (ui.getPageById(value) == null) {
                                    var index = ui.getPageIndex(page);

                                    if (index >= 0) {
                                        ui.removePage(page);
                                        page.node.setAttribute('id', value);
                                        id = value;
                                        idInput.innerHTML = mxUtils.htmlEntities(value);
                                        ui.insertPage(page, index);
                                    }
                                } else {
                                    ui.handleError({
                                        message: mxResources.get('alreadyExst', [mxResources.get('page')]),
                                    });
                                }
                            }
                        } else {
                            if (graph.getModel().getCell(value) == null) {
                                graph.getModel().cellRemoved(cell);
                                cell.setId(value);
                                id = value;
                                idInput.innerHTML = mxUtils.htmlEntities(value);
                                graph.getModel().cellAdded(cell);
                            } else {
                                ui.handleError({
                                    message: mxResources.get('alreadyExst', [value]),
                                });
                            }
                        }
                    }
                }),
                mxResources.get('id'),
                null,
                null,
                null,
                null,
                null,
                null,
                200
            );
            ui.showDialog(dlg.container, 300, 80, true, true);
            dlg.init();
        });
    }

    for (var i = 0; i < temp.length; i++) {
        addTextArea(count, temp[i].name, temp[i].value);
        count++;
    }

    var top = document.createElement('div');
    top.style.position = 'absolute';
    top.style.top = '30px';
    top.style.left = '30px';
    top.style.right = '30px';
    top.style.bottom = '80px';
    top.style.overflowY = 'auto';

    top.appendChild(form.table);

    var newProp = document.createElement('div');
    newProp.style.display = 'flex';
    newProp.style.alignItems = 'center';
    newProp.style.boxSizing = 'border-box';
    newProp.style.paddingRight = '160px';
    newProp.style.whiteSpace = 'nowrap';
    newProp.style.marginTop = '6px';
    newProp.style.width = '100%';

    var nameInput = document.createElement('input');
    nameInput.setAttribute('placeholder', mxResources.get('enterPropertyName'));
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('size', mxClient.IS_IE || mxClient.IS_IE11 ? '36' : '40');
    nameInput.style.boxSizing = 'border-box';
    nameInput.style.borderWidth = '1px';
    nameInput.style.borderStyle = 'solid';
    nameInput.style.marginLeft = '2px';
    nameInput.style.padding = '4px';
    nameInput.style.width = '100%';

    newProp.appendChild(nameInput);
    top.appendChild(newProp);
    div.appendChild(top);

    var addBtn = mxUtils.button(mxResources.get('addProperty'), function () {
        var name = nameInput.value;
        // Avoid ':' in attribute names which seems to be valid in Chrome
        if (name.length > 0 && name != 'label' && name != 'id' && name != 'placeholders' && name.indexOf(':') < 0) {
            try {
                var idx = mxUtils.indexOf(names, name);

                if (idx >= 0 && texts[idx] != null) {
                    texts[idx].focus();
                } else {
                    var clone = value.cloneNode(false);
                    clone.setAttribute(name, '');

                    if (idx >= 0) {
                        names.splice(idx, 1);
                        texts.splice(idx, 1);
                    }

                    names.push(name);
                    var text = form.addTextarea(name + ':', '', 2);
                    text.style.width = '100%';
                    texts.push(text);
                    addRemoveButton(text, name);

                    text.focus();
                }

                addBtn.setAttribute('disabled', 'disabled');
                nameInput.value = '';
            } catch (e) {
                mxUtils.alert(e);
            }
        } else {
            mxUtils.alert(mxResources.get('invalidName'));
        }
    });

    mxEvent.addListener(nameInput, 'keypress', function (e) {
        if (e.keyCode == 13) {
            addBtn.click();
        }
    });

    this.init = function () {
        if (texts.length > 0) {
            texts[0].focus();
        } else {
            nameInput.focus();
        }
    };

    addBtn.setAttribute('title', mxResources.get('addProperty'));
    addBtn.setAttribute('disabled', 'disabled');
    addBtn.style.textOverflow = 'ellipsis';
    addBtn.style.position = 'absolute';
    addBtn.style.overflow = 'hidden';
    addBtn.style.width = '144px';
    addBtn.style.right = '0px';
    addBtn.className = 'geBtn';
    newProp.appendChild(addBtn);

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        ui.hideDialog.apply(ui, arguments);
    });

    cancelBtn.setAttribute('title', 'Escape');
    cancelBtn.className = 'geBtn';

    var exportBtn = mxUtils.button(
        mxResources.get('export'),
        mxUtils.bind(this, function (evt) {
            var result = graph.getDataForCells([cell]);

            var dlg = new EmbedDialog(
                ui,
                JSON.stringify(result, null, 2),
                null,
                null,
                function () {
                    console.log(result);
                    ui.alert('Written to Console (Dev Tools)');
                },
                mxResources.get('export'),
                null,
                'Console',
                'data.json'
            );
            ui.showDialog(dlg.container, 450, 240, true, true);
            dlg.init();
        })
    );

    exportBtn.setAttribute('title', mxResources.get('export'));
    exportBtn.className = 'geBtn';

    var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        try {
            ui.hideDialog.apply(ui, arguments);

            // Clones and updates the value
            value = value.cloneNode(true);
            var removeLabel = false;

            for (var i = 0; i < names.length; i++) {
                if (texts[i] == null) {
                    value.removeAttribute(names[i]);
                } else {
                    value.setAttribute(names[i], texts[i].value);
                    removeLabel = removeLabel || (names[i] == 'placeholder' && value.getAttribute('placeholders') == '1');
                }
            }

            // Removes label if placeholder is assigned
            if (removeLabel) {
                value.removeAttribute('label');
            }

            // Updates the value of the cell (undoable)
            graph.getModel().setValue(cell, value);
        } catch (e) {
            mxUtils.alert(e);
        }
    });

    applyBtn.setAttribute('title', 'Ctrl+Enter');
    applyBtn.className = 'geBtn gePrimaryBtn';

    mxEvent.addListener(div, 'keypress', function (e) {
        if (e.keyCode == 13 && mxEvent.isControlDown(e)) {
            applyBtn.click();
        }
    });

    function updateAddBtn() {
        if (nameInput.value.length > 0) {
            addBtn.removeAttribute('disabled');
        } else {
            addBtn.setAttribute('disabled', 'disabled');
        }
    }

    mxEvent.addListener(nameInput, 'keyup', updateAddBtn);

    // Catches all changes that don't fire a keyup (such as paste via mouse)
    mxEvent.addListener(nameInput, 'change', updateAddBtn);

    var buttons = document.createElement('div');
    buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;';

    if (ui.editor.graph.getModel().isVertex(cell) || ui.editor.graph.getModel().isEdge(cell)) {
        var replace = document.createElement('span');
        replace.style.marginRight = '10px';
        var input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.style.marginRight = '6px';

        if (value.getAttribute('placeholders') == '1') {
            input.setAttribute('checked', 'checked');
            input.defaultChecked = true;
        }

        mxEvent.addListener(input, 'click', function () {
            if (value.getAttribute('placeholders') == '1') {
                value.removeAttribute('placeholders');
            } else {
                value.setAttribute('placeholders', '1');
            }
        });

        replace.appendChild(input);
        mxUtils.write(replace, mxResources.get('placeholders'));

        if (EditDataDialog.placeholderHelpLink != null) {
            var link = document.createElement('a');
            link.setAttribute('href', EditDataDialog.placeholderHelpLink);
            link.setAttribute('title', mxResources.get('help'));
            link.setAttribute('target', '_blank');
            link.style.marginLeft = '8px';
            link.style.cursor = 'help';

            var icon = document.createElement('img');
            mxUtils.setOpacity(icon, 50);
            icon.style.height = '16px';
            icon.style.width = '16px';
            icon.setAttribute('border', '0');
            icon.setAttribute('valign', 'middle');
            icon.style.marginTop = mxClient.IS_IE11 ? '0px' : '-4px';
            icon.setAttribute('src', Editor.helpImage);
            link.appendChild(icon);
            icon.className = 'geAdaptiveAsset';

            replace.appendChild(link);
        }

        buttons.appendChild(replace);
    }

    if (ui.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
    }

    buttons.appendChild(exportBtn);
    buttons.appendChild(applyBtn);

    if (!ui.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
    }

    div.appendChild(buttons);
    this.container = div;
}

/**
 * Optional help link.
 */
EditDataDialog.getDisplayIdForCell = function (ui, cell) {
    var id = null;
    if (ui.editor.graph.getModel().getParent(cell) != null) {
        id = cell.getId();
    } else {
        id = cell.getId();
    }
    return id;
};

function CellPropertyManageDialog(ui, cell) {
    this.editorUi = ui;
    this.currentCell = cell;
    var graph = ui.editor.graph;
    var div = document.createElement('div');
    div.style.cssText = `display:flex;flex-direction: column;`;

    var tvTitle = document.createElement('div');
    mxUtils.write(tvTitle, '数据绑定');
    tvTitle.style.cssText = `position: absolute;font-size: 18px;font-weight: 700;color:#333;top: 0px;margin-top: 16px;left: 16px;`;
    div.appendChild(tvTitle);

    var tabContainer = document.createElement('div');
    tabContainer.className = 'layui-tab layui-tab-brief';

    var elTabTitle = document.createElement('ul');
    elTabTitle.className = 'layui-tab-title';
    tabContainer.appendChild(elTabTitle);
    var elTabContent = document.createElement('div');
    elTabContent.className = 'layui-tab-content';
    elTabContent.style.height = '580px';
    this.tabCurrentIndex = 0;
    var tabs = ['属性', '事件', '动画'];
    for (let index = 0; index < tabs.length; index++) {
        const element = tabs[index];
        const elLi = document.createElement('li');
        mxUtils.write(elLi, element);
        mxEvent.addListener(
            elLi,
            'click',
            mxUtils.bind(this, function (evt) {
                this.changTab(index);
            })
        );
        const elTabItem = this.getTabPanel(index);
        if (index == this.tabCurrentIndex) {
            elLi.className = elLi.className ? elLi.className + ' layui-this' : 'layui-this';
            elTabItem.className = elTabItem.className ? elTabItem.className + ' layui-show' : 'layui-show';
        }
        elTabItem.style.height = '550px';

        elTabTitle.appendChild(elLi);
        elTabContent.appendChild(elTabItem);
    }

    tabContainer.appendChild(elTabContent);

    div.appendChild(tabContainer);
    this.tabContainer = tabContainer;
    this.changTab = function (position) {
        if (this.tabCurrentIndex == position) return;
        this.tabCurrentIndex = position;
        for (let index = 0; index < tabs.length; index++) {
            const elLi = elTabTitle.childNodes[index];
            const elTabItem = elTabContent.childNodes[index];
            elLi.className = '';
            elTabItem.className = 'layui-tab-item';
            if (index == position) {
                elLi.className = elLi.className ? elLi.className + ' layui-this' : 'layui-this';
                elTabItem.className = elTabItem.className ? elTabItem.className + ' layui-show' : 'layui-show';
            }
        }
    };

    var btnContainer = document.createElement('div');
    btnContainer.style.cssText = `position: absolute;background-color:white;height:60px;bottom:0;left:0;right:0;display:flex;flex-direction: row;justify-content: flex-end;align-items: center;box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.14);`;
    div.appendChild(btnContainer);
    var addSaveBtn = mxUtils.button('保存', () => {
    });
    addSaveBtn.className = 'layui-btn layui-btn-normal';
    addSaveBtn.style.cssText = 'margin-right:16px;';
    var closeBtn = mxUtils.button('关闭', function () {
        ui.hideDialog.apply(ui, arguments);
    });
    closeBtn.className = 'layui-btn layui-btn-primary';
    btnContainer.appendChild(closeBtn);
    btnContainer.appendChild(addSaveBtn);

    this.init = () => {
    };
    this.container = div;
}

CellPropertyManageDialog.prototype.getTabPanel = function (index) {
    const div = document.createElement('div');
    div.className = 'layui-tab-item';
    if (index == 0) {
        this.genPropertyPanel(div);
    }
    return div;
};
CellPropertyManageDialog.prototype.genPropertyPanel = function (root) {
    const panel = document.createElement('div');
    panel.style.cssText = `display: flex;flex-direction: column;`;
    let row = document.createElement('div');
    row.style.cssText = `display: flex;flex-direction: row;`;
    let ele = document.createElement('div');
    ele.style.cssText = `height:40px;line-height:30px;font-size:14px;color:#333;`;
    mxUtils.write(ele, '数据点');
    row.appendChild(ele);

    ele = document.createElement('select');
    ele.style.cssText = `width:150px;height:30px;line-height:30px;font-size:14px;color:#333;text-align:left;margin-left: 10px`;
    let option = document.createElement('option');
    option.value = '';
    mxUtils.write(option, '请选择');
    ele.appendChild(option);
    option = document.createElement('option');
    option.value = '1';
    mxUtils.write(option, '点位1');
    ele.appendChild(option);
    option = document.createElement('option');
    option.value = '2';
    mxUtils.write(option, '点位2');
    ele.appendChild(option);
    row.appendChild(ele);

    ele = document.createElement('div');
    ele.style.cssText = `height:40px;line-height:30px;font-size:14px;color:#333;margin-left:36px;`;
    mxUtils.write(ele, '属性');
    row.appendChild(ele);

    ele = document.createElement('select');
    ele.style.cssText = `width:150px;height:30px;line-height:30px;font-size:14px;color:#333;text-align:left;margin-left: 10px`;
    option = document.createElement('option');
    option.value = '';
    mxUtils.write(option, '请选择');
    ele.appendChild(option);
    option = document.createElement('option');
    option.value = '1';
    mxUtils.write(option, '属性1');
    ele.appendChild(option);
    option = document.createElement('option');
    option.value = '2';
    mxUtils.write(option, '属性2');
    ele.appendChild(option);
    row.appendChild(ele);

    ele = document.createElement('div');
    ele.style.cssText = `height:40px;line-height:30px;font-size:14px;color:#333;margin-left:36px;`;
    mxUtils.write(ele, '赋值方式');
    row.appendChild(ele);

    ele = document.createElement('select');
    ele.style.cssText = `width:150px;height:30px;line-height:30px;font-size:14px;color:#333;text-align:left;margin-left: 10px`;
    option = document.createElement('option');
    option.value = '';
    mxUtils.write(option, '请选择');
    ele.appendChild(option);
    option = document.createElement('option');
    option.value = '1';
    mxUtils.write(option, '直接赋值');
    ele.appendChild(option);
    option = document.createElement('option');
    option.value = '2';
    mxUtils.write(option, '范围赋值');
    ele.appendChild(option);
    option = document.createElement('option');
    option.value = '3';
    mxUtils.write(option, '倍数赋值');
    ele.appendChild(option);

    row.appendChild(ele);

    panel.appendChild(row);

    root.appendChild(panel);
};

CellPropertyManageDialog.prototype.createPropertyRow = function () {
    const formItem = document.createElement('div');
    formItem.className = 'layui-form-item';
    let formItemInline = document.createElement('div');
    formItemInline.className = 'layui-inline';
    formItem.appendChild(formItemInline);
    let dang = document.createElement('label');
    dang.className = 'layui-form-label';
    dang.style.width = '30px';
    mxUtils.write(dang, '当');
    formItemInline.appendChild(dang);

    let lowItemInputInline = document.createElement('div');
    lowItemInputInline.className = 'layui-input-inline';
    lowItemInputInline.style.width = '80px';
    let lowItemInputInlineInput = document.createElement('input');
    lowItemInputInlineInput.className = 'layui-input';
    lowItemInputInlineInput.name = 'name';
    lowItemInputInlineInput.type = 'text';
    lowItemInputInlineInput.placeholder = '请输入';
    lowItemInputInlineInput.autocomplete = 'off';
    lowItemInputInline.appendChild(lowItemInputInlineInput);
    formItemInline.appendChild(lowItemInputInline);

    let xiaoyu = document.createElement('label');
    xiaoyu.className = 'layui-form-label';
    xiaoyu.style.width = '30px';
    mxUtils.write(xiaoyu, '<=');
    formItemInline.appendChild(xiaoyu);

    lowItemInputInline = document.createElement('div');
    lowItemInputInline.className = 'layui-input-inline';
    lowItemInputInline.style.width = '100px';
    lowItemInputInlineInput = document.createElement('select');
    let option = document.createElement('option');
    option.value = '';
    mxUtils.write(option, '请选择');
    lowItemInputInlineInput.appendChild(option);
    option = document.createElement('option');
    option.value = '1';
    mxUtils.write(option, '选项1');
    lowItemInputInlineInput.appendChild(option);
    option = document.createElement('option');
    option.value = '2';
    mxUtils.write(option, '选项2');
    lowItemInputInlineInput.appendChild(option);
    lowItemInputInline.appendChild(lowItemInputInlineInput);

    formItemInline = document.createElement('div');
    formItemInline.className = 'layui-inline';
    formItemInline.appendChild(lowItemInputInline);
    formItem.appendChild(formItemInline);

    xiaoyu = document.createElement('label');
    xiaoyu.className = 'layui-form-label';
    xiaoyu.style.width = '30px';
    mxUtils.write(xiaoyu, '<=');
    formItemInline.appendChild(xiaoyu);

    lowItemInputInline = document.createElement('div');
    lowItemInputInline.className = 'layui-input-inline';
    lowItemInputInline.style.width = '80px';
    lowItemInputInlineInput = document.createElement('input');
    lowItemInputInlineInput.className = 'layui-input';
    lowItemInputInlineInput.name = 'name';
    lowItemInputInlineInput.type = 'text';
    lowItemInputInlineInput.placeholder = '请输入';
    lowItemInputInlineInput.autocomplete = 'off';
    lowItemInputInline.appendChild(lowItemInputInlineInput);
    formItemInline.appendChild(lowItemInputInline);

    dang = document.createElement('label');
    dang.className = 'layui-form-label';
    dang.style.width = '30px';
    mxUtils.write(dang, '时');
    formItemInline.appendChild(dang);

    return formItem;
};

function CropImageDialog(editorUi, image, clipPath, fn) {
    var IMAGE_SIZE = 300;
    var div = document.createElement('div');

    var elt = document.createElement('div');
    elt.style.height = IMAGE_SIZE + 'px';
    elt.style.width = IMAGE_SIZE + 'px';
    elt.style.display = 'inline-flex';
    elt.style.justifyContent = 'center';
    elt.style.alignItems = 'center';
    elt.style.position = 'absolute';
    var img = document.createElement('img');

    img.onload = init;
    img.onerror = function () {
        img.onload = null;
        img.src = Editor.errorImage;
    };

    img.setAttribute('src', image);
    img.style.maxWidth = IMAGE_SIZE + 'px';
    img.style.maxHeight = IMAGE_SIZE + 'px';
    elt.appendChild(img);
    div.appendChild(elt);

    var croppingDiv = document.createElement('div');
    croppingDiv.style.width = IMAGE_SIZE + 'px';
    croppingDiv.style.height = IMAGE_SIZE + 'px';
    croppingDiv.style.overflow = 'hidden';
    croppingDiv.style.backgroundColor = '#fff9';
    div.appendChild(croppingDiv);

    var cropGraph = null,
        initGeo = new mxGeometry(100, 100, 100, 100),
        arcSizeVal = 5,
        cropCell = new mxCell('', initGeo.clone(), ''),
        commonStyle = 'shape=image;fillColor=none;rotatable=0;cloneable=0;deletable=0;image=' + image.replace(';base64', '') + ';clipPath=';

    function init() {
        cropGraph = new Graph(croppingDiv);
        cropGraph.autoExtend = false;
        cropGraph.autoScroll = false;
        cropGraph.setGridEnabled(false);
        cropGraph.setEnabled(true);
        cropGraph.setPanning(false);
        cropGraph.setConnectable(false);
        cropGraph.getRubberband().setEnabled(false);
        cropGraph.graphHandler.allowLivePreview = false;

        var origCreateVertexHandler = cropGraph.createVertexHandler;

        cropGraph.createVertexHandler = function () {
            var handler = origCreateVertexHandler.apply(this, arguments);
            handler.livePreview = false;
            return handler;
        };

        if (clipPath != null) {
            //Find position and size of cropCell
            try {
                if (clipPath.substring(0, 5) == 'inset') {
                    var geo = cropCell.geometry;
                    var imgW = img.width;
                    var imgH = img.height;
                    var imgX = (IMAGE_SIZE - imgW) / 2;
                    var imgY = (IMAGE_SIZE - imgH) / 2;

                    var tokens = clipPath.match(/\(([^)]+)\)/)[1].split(/[ ,]+/);

                    var top = parseFloat(tokens[0]);
                    var right = parseFloat(tokens[1]);
                    var bottom = parseFloat(tokens[2]);
                    var left = parseFloat(tokens[3]);

                    if (isFinite(top) && isFinite(right) && isFinite(bottom) && isFinite(left)) {
                        geo.x = (left / 100) * imgW + imgX;
                        geo.y = (top / 100) * imgH + imgY;
                        geo.width = ((100 - right) / 100) * imgW + imgX - geo.x;
                        geo.height = ((100 - bottom) / 100) * imgH + imgY - geo.y;

                        if (tokens[4] == 'round') {
                            if (tokens[5] == '50%') {
                                ellipseInput.setAttribute('checked', 'checked');
                            } else {
                                arcSizeVal = parseInt(tokens[5]);
                                arcSize.value = arcSizeVal;
                                roundedInput.setAttribute('checked', 'checked');
                                arcSizeDiv.style.visibility = 'visible';
                            }
                        } else {
                            rectInput.setAttribute('checked', 'checked');
                        }
                    } //Invalid clipPath
                    else {
                        clipPath = null;
                    }
                } //The dialog supports inset only
                else {
                    clipPath = null;
                }
            } catch (e) {
            } //Ignore
        }

        cropCell.style = getCropCellStyle(clipPath);
        cropCell.vertex = true;
        cropGraph.addCell(cropCell, null, null, null, null);
        cropGraph.selectAll();

        function updateCropCell() {
            cropGraph.model.setStyle(cropCell, getCropCellStyle());
        }

        cropGraph.addListener(mxEvent.CELLS_MOVED, updateCropCell);

        cropGraph.addListener(mxEvent.CELLS_RESIZED, updateCropCell);

        var origMouseUp = cropGraph.graphHandler.mouseUp;
        var origMouseDown = cropGraph.graphHandler.mouseDown;

        cropGraph.graphHandler.mouseUp = function () {
            origMouseUp.apply(this, arguments);
            croppingDiv.style.backgroundColor = '#fff9';
        };

        cropGraph.graphHandler.mouseDown = function () {
            origMouseDown.apply(this, arguments);
            croppingDiv.style.backgroundColor = '';
        };

        cropGraph.dblClick = function () {
        }; //Disable text adding

        var origChangeSelection = cropGraph.getSelectionModel().changeSelection;

        //Prevent deselection
        cropGraph.getSelectionModel().changeSelection = function () {
            origChangeSelection.call(this, [cropCell], [cropCell]);
        };
    }

    var rectInput = document.createElement('input');
    rectInput.setAttribute('type', 'radio');
    rectInput.setAttribute('id', 'croppingRect');
    rectInput.setAttribute('name', 'croppingShape');
    rectInput.setAttribute('checked', 'checked');
    rectInput.style.margin = '5px';
    div.appendChild(rectInput);

    var rectLbl = document.createElement('label');
    rectLbl.setAttribute('for', 'croppingRect');
    mxUtils.write(rectLbl, mxResources.get('rectangle'));
    div.appendChild(rectLbl);

    var roundedInput = document.createElement('input');
    roundedInput.setAttribute('type', 'radio');
    roundedInput.setAttribute('id', 'croppingRounded');
    roundedInput.setAttribute('name', 'croppingShape');
    roundedInput.style.margin = '5px';
    div.appendChild(roundedInput);

    var roundedLbl = document.createElement('label');
    roundedLbl.setAttribute('for', 'croppingRounded');
    mxUtils.write(roundedLbl, mxResources.get('rounded'));
    div.appendChild(roundedLbl);

    var ellipseInput = document.createElement('input');
    ellipseInput.setAttribute('type', 'radio');
    ellipseInput.setAttribute('id', 'croppingEllipse');
    ellipseInput.setAttribute('name', 'croppingShape');
    ellipseInput.style.margin = '5px';
    div.appendChild(ellipseInput);

    var ellipseLbl = document.createElement('label');
    ellipseLbl.setAttribute('for', 'croppingEllipse');
    mxUtils.write(ellipseLbl, mxResources.get('ellipse'));
    div.appendChild(ellipseLbl);

    function calcClipPath() {
        var isRounded = roundedInput.checked;
        var isEllipse = ellipseInput.checked;

        var geo = cropCell.geometry;
        var imgW = img.width;
        var imgH = img.height;
        var imgX = (IMAGE_SIZE - imgW) / 2;
        var imgY = (IMAGE_SIZE - imgH) / 2;

        var left, right, top, bottom;

        //prevent coords outside the image
        if (geo.x < imgX) {
            geo.width -= imgX - geo.x;
            geo.x = imgX;
        } else if (geo.x + geo.width > imgX + imgW) {
            geo.width = imgX + imgW - geo.x;
            geo.x = Math.min(geo.x, imgX + imgW);
        }

        if (geo.y < imgY) {
            geo.height -= imgY - geo.y;
            geo.y = imgY;
        } else if (geo.y + geo.height > imgY + imgH) {
            geo.height = imgY + imgH - geo.y;
            geo.y = Math.min(geo.y, imgY + imgH);
        }

        var left = ((geo.x - imgX) / imgW) * 100;
        var right = 100 - ((geo.x + geo.width - imgX) / imgW) * 100;
        var top = ((geo.y - imgY) / imgH) * 100;
        var bottom = 100 - ((geo.y + geo.height - imgY) / imgH) * 100;

        //Use inset for circle also since it uses percentages from 4 sides and this scales no matter the shape of the image
        //Using circle which is based on a single point to position (center) moves when the image is scaled and/or aspect is changed
        return 'inset(' + mxUtils.format(top) + '% ' + mxUtils.format(right) + '% ' + mxUtils.format(bottom) + '% ' + mxUtils.format(left) + '%' + (isRounded ? ' round ' + arcSizeVal + '%' : isEllipse ? ' round 50%' : '') + ')';
    }

    function typeChanged(noGeoReset) {
        if (cropGraph == null) return; //Image is not loaded yet. Graph had to wait for the image to load to be on-top

        if (noGeoReset !== true) {
            cropGraph.model.setGeometry(cropCell, initGeo.clone());
            arcSizeVal = 5;
            arcSize.value = arcSizeVal;
        }

        cropGraph.model.setStyle(cropCell, getCropCellStyle());
        cropGraph.selectAll();
        arcSizeDiv.style.visibility = roundedInput.checked ? 'visible' : 'hidden';
    }

    function getCropCellStyle(clipPath) {
        return commonStyle + (clipPath ? clipPath : calcClipPath());
    }

    mxEvent.addListener(rectInput, 'change', typeChanged);
    mxEvent.addListener(roundedInput, 'change', typeChanged);
    mxEvent.addListener(ellipseInput, 'change', typeChanged);

    //Arc size slider
    var arcSizeDiv = document.createElement('div');
    arcSizeDiv.style.textAlign = 'center';
    arcSizeDiv.style.visibility = 'hidden';

    var arcSize = document.createElement('input');
    arcSize.setAttribute('type', 'range');
    arcSize.setAttribute('min', '1');
    arcSize.setAttribute('max', '49');
    arcSize.setAttribute('value', arcSizeVal);
    arcSize.setAttribute('title', mxResources.get('arcSize'));
    arcSizeDiv.appendChild(arcSize);

    div.appendChild(arcSizeDiv);

    mxEvent.addListener(arcSize, 'change', function () {
        arcSizeVal = this.value;
        typeChanged(true);
    });

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();
    });

    cancelBtn.className = 'geBtn';

    var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        fn(calcClipPath(), cropCell.geometry.width, cropCell.geometry.height);
        editorUi.hideDialog();
    });

    applyBtn.className = 'geBtn gePrimaryBtn';

    var resetBtn = mxUtils.button(mxResources.get('reset'), function () {
        fn(null, img.width, img.height);
        editorUi.hideDialog();
    });

    resetBtn.className = 'geBtn';

    var buttons = document.createElement('div');
    buttons.style.marginTop = '10px';
    buttons.style.textAlign = 'right';

    if (editorUi.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
        buttons.appendChild(resetBtn);
        buttons.appendChild(applyBtn);
    } else {
        buttons.appendChild(resetBtn);
        buttons.appendChild(applyBtn);
        buttons.appendChild(cancelBtn);
    }

    div.appendChild(buttons);

    this.container = div;
}

function ImageDialog(editorUi, title, initialValue, fn, ignoreExisting, convertDataUri, withCrop, initClipPath) {
    convertDataUri = convertDataUri != null ? convertDataUri : true;

    var graph = editorUi.editor.graph;
    var div = document.createElement('div');
    mxUtils.write(div, title);

    var inner = document.createElement('div');
    inner.className = 'geTitle';
    inner.style.backgroundColor = 'transparent';
    inner.style.borderColor = 'transparent';
    inner.style.whiteSpace = 'nowrap';
    inner.style.textOverflow = 'clip';
    inner.style.cursor = 'default';
    inner.style.paddingRight = '20px';

    var linkInput = document.createElement('input');
    linkInput.setAttribute('value', initialValue);
    linkInput.setAttribute('type', 'text');
    linkInput.setAttribute('spellcheck', 'false');
    linkInput.setAttribute('autocorrect', 'off');
    linkInput.setAttribute('autocomplete', 'off');
    linkInput.setAttribute('autocapitalize', 'off');
    linkInput.style.marginTop = '6px';
    var realWidth = Graph.fileSupport ? 460 : 340;
    linkInput.style.width = realWidth - 20 + 'px';
    linkInput.style.backgroundImage = "url('" + Dialog.prototype.clearImage + "')";
    linkInput.style.backgroundRepeat = 'no-repeat';
    linkInput.style.backgroundPosition = '100% 50%';
    linkInput.style.paddingRight = '14px';

    var cross = document.createElement('div');
    cross.setAttribute('title', mxResources.get('reset'));
    cross.style.position = 'relative';
    cross.style.left = '-16px';
    cross.style.width = '12px';
    cross.style.height = '14px';
    cross.style.cursor = 'pointer';

    // Workaround for inline-block not supported in IE
    cross.style.display = 'inline-block';
    cross.style.top = '3px';

    // Needed to block event transparency in IE
    cross.style.background = "url('" + editorUi.editor.transparentImage + "')";

    mxEvent.addListener(cross, 'click', function () {
        linkInput.value = '';
        linkInput.focus();
    });

    inner.appendChild(linkInput);
    inner.appendChild(cross);
    div.appendChild(inner);

    var clipPath = initClipPath,
        cW,
        cH;

    var insertImage = function (newValue, w, h, resize) {
        var dataUri = newValue.substring(0, 5) == 'data:';

        if (!editorUi.isOffline() || (dataUri && typeof chrome === 'undefined')) {
            if (newValue.length > 0 && editorUi.spinner.spin(document.body, mxResources.get('inserting'))) {
                var maxSize = 520;

                editorUi.loadImage(
                    newValue,
                    function (img) {
                        editorUi.spinner.stop();
                        editorUi.hideDialog();
                        var s = resize === false ? 1 : w != null && h != null ? Math.max(w / img.width, h / img.height) : Math.min(1, Math.min(maxSize / img.width, maxSize / img.height));

                        // Handles special case of data URI which needs to be rewritten
                        // to be used in a cell style to remove the semicolon
                        if (convertDataUri) {
                            newValue = editorUi.convertDataUri(newValue);
                        }

                        fn(newValue, Math.round(Number(img.width) * s), Math.round(Number(img.height) * s), clipPath, cW, cH);
                    },
                    function () {
                        editorUi.spinner.stop();
                        fn(null);
                        editorUi.showError(mxResources.get('error'), mxResources.get('fileNotFound'), mxResources.get('ok'));
                    }
                );
            } else {
                editorUi.hideDialog();
                fn(newValue, null, null, clipPath, cW, cH);
            }
        } else {
            newValue = editorUi.convertDataUri(newValue);
            w = w == null ? 120 : w;
            h = h == null ? 100 : h;

            editorUi.hideDialog();
            fn(newValue, w, h, clipPath, cW, cH);
        }
    };

    var apply = function (newValue, resize) {
        if (newValue != null) {
            var geo = ignoreExisting ? null : graph.getModel().getGeometry(graph.getSelectionCell());

            // Reuses width and height of existing cell
            if (geo != null) {
                insertImage(newValue, geo.width, geo.height, resize);
            } else {
                insertImage(newValue, null, null, resize);
            }
        } else {
            editorUi.hideDialog();
            fn(null);
        }
    };

    this.init = function () {
        linkInput.focus();

        // Installs drag and drop handler for local images and links
        if (Graph.fileSupport) {
            linkInput.setAttribute('placeholder', mxResources.get('dragImagesHere'));

            // Setup the dnd listeners
            var dlg = div.parentNode;
            var graph = editorUi.editor.graph;
            var dropElt = null;

            mxEvent.addListener(dlg, 'dragleave', function (evt) {
                if (dropElt != null) {
                    dropElt.parentNode.removeChild(dropElt);
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
                        dropElt = editorUi.highlightElement(dlg);
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
                        dropElt.parentNode.removeChild(dropElt);
                        dropElt = null;
                    }

                    if (evt.dataTransfer.files.length > 0) {
                        editorUi.importFiles(
                            evt.dataTransfer.files,
                            0,
                            0,
                            editorUi.maxImageSize,
                            function (data, mimeType, x, y, w, h, fileName, resize) {
                                apply(data, resize);
                            },
                            function () {
                                // No post processing
                            },
                            function (file) {
                                // Handles only images
                                return file.type.substring(0, 6) == 'image/';
                            },
                            function (queue) {
                                // Invokes elements of queue in order
                                for (var i = 0; i < queue.length; i++) {
                                    queue[i]();
                                }
                            },
                            !mxEvent.isControlDown(evt),
                            null,
                            null,
                            true
                        );
                    } else if (mxUtils.indexOf(evt.dataTransfer.types, 'text/uri-list') >= 0) {
                        var uri = evt.dataTransfer.getData('text/uri-list');

                        if (/\.(gif|jpg|jpeg|tiff|png|svg)($|\?)/i.test(uri)) {
                            apply(decodeURIComponent(uri));
                        }
                    }

                    evt.stopPropagation();
                    evt.preventDefault();
                }),
                false
            );
        }
    };

    var btns = document.createElement('div');
    btns.style.marginTop = '14px';
    btns.style.textAlign = 'center';

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        // Just in case a spinner is spinning, has no effect otherwise
        editorUi.spinner.stop();
        editorUi.hideDialog();
    });

    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        btns.appendChild(cancelBtn);
    }

    ImageDialog.filePicked = function (data) {
        /* if (data.action == google.picker.Action.PICKED) {
              if (data.docs[0].thumbnails != null) {
                var thumb = data.docs[0].thumbnails[data.docs[0].thumbnails.length - 1];

                if (thumb != null) {
                  linkInput.value = thumb.url;
                }
              }
            } */
        linkInput.focus();
    };

    if (Graph.fileSupport) {
        if (editorUi.imgDlgFileInputElt == null) {
            var fileInput = document.createElement('input');
            fileInput.setAttribute('multiple', 'multiple');
            fileInput.setAttribute('type', 'file');

            mxEvent.addListener(fileInput, 'change', function (evt) {
                if (fileInput.files != null) {
                    editorUi.importFiles(
                        fileInput.files,
                        0,
                        0,
                        editorUi.maxImageSize,
                        function (data, mimeType, x, y, w, h) {
                            apply(data);
                        },
                        function () {
                            // No post processing
                        },
                        function (file) {
                            // Handles only images
                            return file.type.substring(0, 6) == 'image/';
                        },
                        function (queue) {
                            // Invokes elements of queue in order
                            for (var i = 0; i < queue.length; i++) {
                                queue[i]();
                            }
                        },
                        true
                    );

                    // Resets input to force change event for same file (type reset required for IE)
                    fileInput.type = '';
                    fileInput.type = 'file';
                    fileInput.value = '';
                }
            });

            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            editorUi.imgDlgFileInputElt = fileInput;
        }

        var btn = mxUtils.button(mxResources.get('open'), function () {
            editorUi.imgDlgFileInputElt.click();
        });

        btn.className = 'geBtn';
        btns.appendChild(btn);
    }

    mxEvent.addListener(linkInput, 'keypress', function (e) {
        if (e.keyCode == 13) {
            apply(linkInput.value);
        }
    });

    var cropBtn = mxUtils.button(mxResources.get('crop'), function () {
        var dlg = new CropImageDialog(editorUi, linkInput.value, clipPath, function (clipPath_p, width, height) {
            clipPath = clipPath_p;
            cW = width;
            cH = height;
        });

        editorUi.showDialog(dlg.container, 300, 390, true, true);
    });

    if (withCrop) {
        cropBtn.className = 'geBtn';
        btns.appendChild(cropBtn);
    }

    var embedBtn = mxUtils.button(mxResources.get('embed'), function () {
        if (linkInput.value.substring(0, 5) != 'data:' && editorUi.spinner.spin(document.body, mxResources.get('loading'))) {
            var converter = editorUi.editor.createImageUrlConverter();
            var src = converter.convert(linkInput.value);
            var img = new Image();

            img.onload = function () {
                editorUi.editor.convertImageToDataUri(
                    src,
                    function (uri) {
                        editorUi.confirmImageResize(function (doResize) {
                            editorUi.resizeImage(
                                img,
                                uri,
                                mxUtils.bind(this, function (data2, w2, h2) {
                                    editorUi.spinner.stop();
                                    // Refuses to insert images above a certain size as they kill the app
                                    if (data2 != null && data2.length < editorUi.maxImageBytes) {
                                        linkInput.value = data2;
                                        updateButtonStates();
                                    } else {
                                        editorUi.handleError({
                                            message: mxResources.get('imageTooBig'),
                                        });
                                    }
                                }),
                                doResize,
                                editorUi.maxImageSize
                            );
                        }, img.width > editorUi.maxImageSize || img.height > editorUi.maxImageSize || uri.length > editorUi.maxImageBytes);
                    },
                    mxUtils.bind(this, function () {
                        editorUi.handleError({message: mxResources.get('fileNotFound')});
                    })
                );
            };

            img.onerror = function () {
                editorUi.spinner.stop();
                editorUi.handleError({message: mxResources.get('fileNotFound')});
            };

            img.src = src;
        }
    });

    function updateButtonStates() {
        if (linkInput.value.length > 0) {
            cropBtn.removeAttribute('disabled');
        } else {
            cropBtn.setAttribute('disabled', 'disabled');
        }

        if (linkInput.value.substring(0, 5) != 'data:') {
            embedBtn.removeAttribute('disabled');
        } else {
            embedBtn.setAttribute('disabled', 'disabled');
        }
    }

    embedBtn.className = 'geBtn';

    mxEvent.addListener(linkInput, 'change', function (e) {
        clipPath = null;
        updateButtonStates();
    });

    updateButtonStates();
    btns.appendChild(embedBtn);

    var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        apply(linkInput.value);
    });

    applyBtn.className = 'geBtn gePrimaryBtn';
    btns.appendChild(applyBtn);

    if (!editorUi.editor.cancelFirst) {
        btns.appendChild(cancelBtn);
    }

    // Shows drop icon in dialog background
    if (Graph.fileSupport) {
        btns.style.marginTop = '120px';
        div.style.backgroundImage = "url('images/droptarget.png')";
        div.style.backgroundPosition = 'center 65%';
        div.style.backgroundRepeat = 'no-repeat';

        var bg = document.createElement('div');
        bg.style.position = 'absolute';
        bg.style.width = '420px';
        bg.style.top = '58%';
        bg.style.textAlign = 'center';
        bg.style.fontSize = '18px';
        bg.style.color = '#a0c3ff';
        mxUtils.write(bg, mxResources.get('dragImagesHere'));
        div.appendChild(bg);
    }

    div.appendChild(btns);

    this.container = div;
}

function BackgroundImageDialog(editorUi, applyFn, img, color, showColor) {
    var graph = editorUi.editor.graph;
    var div = document.createElement('div');
    div.style.whiteSpace = 'nowrap';

    var h3 = document.createElement('h2');
    mxUtils.write(h3, mxResources.get('background'));
    h3.style.marginTop = '0px';
    div.appendChild(h3);

    var isPageLink = img != null && img.originalSrc != null;
    var pageFound = false;

    var urlRadio = document.createElement('input');
    urlRadio.style.cssText = 'margin-right:8px;margin-bottom:8px;margin-top:8px;';
    urlRadio.setAttribute('value', 'url');
    urlRadio.setAttribute('type', 'radio');
    urlRadio.setAttribute('name', 'geBackgroundImageDialogOption');

    var pageRadio = document.createElement('input');
    pageRadio.style.cssText = 'margin-right:8px;margin-bottom:8px;margin-top:8px;';
    pageRadio.setAttribute('value', 'url');
    pageRadio.setAttribute('type', 'radio');
    pageRadio.setAttribute('name', 'geBackgroundImageDialogOption;');

    var urlInput = document.createElement('input');
    urlInput.setAttribute('type', 'text');
    urlInput.style.marginBottom = '8px';
    urlInput.style.marginTop = '8px';
    urlInput.style.width = '360px';
    urlInput.value = isPageLink || img == null ? '' : img.src;

    var pageSelect = document.createElement('select');
    pageSelect.style.width = '360px';

    if (editorUi.pages != null) {
        for (var i = 0; i < editorUi.pages.length; i++) {
            var pageOption = document.createElement('option');
            mxUtils.write(pageOption, editorUi.pages[i].getName() || mxResources.get('pageWithNumber', [i + 1]));
            pageOption.setAttribute('value', 'data:page/id,' + editorUi.pages[i].getId());

            if (editorUi.pages[i] == editorUi.currentPage) {
                pageOption.setAttribute('disabled', 'disabled');
            }

            if (img != null && img.originalSrc == pageOption.getAttribute('value')) {
                pageOption.setAttribute('selected', 'selected');
                pageFound = true;
            }

            pageSelect.appendChild(pageOption);
        }
    }

    if (!isPageLink && (editorUi.pages == null || editorUi.pages.length == 1)) {
        urlRadio.style.display = 'none';
        pageRadio.style.display = 'none';
        pageSelect.style.display = 'none';
    }

    var notFoundOption = document.createElement('option');
    var resetting = false;
    var ignoreEvt = false;

    var urlChanged = function (evt, done) {
        // Skips blur event if called from apply button
        if (!resetting && (evt == null || !ignoreEvt)) {
            if (pageRadio.checked) {
                if (done != null) {
                    done(notFoundOption.selected ? null : pageSelect.value);
                }
            } else if (urlInput.value != '' && !editorUi.isOffline()) {
                urlInput.value = mxUtils.trim(urlInput.value);

                editorUi.loadImage(
                    urlInput.value,
                    function (img) {
                        widthInput.value = img.width;
                        heightInput.value = img.height;

                        if (done != null) {
                            done(urlInput.value);
                        }
                    },
                    function () {
                        editorUi.showError(mxResources.get('error'), mxResources.get('fileNotFound'), mxResources.get('ok'));
                        widthInput.value = '';
                        heightInput.value = '';

                        if (done != null) {
                            done(null);
                        }
                    }
                );
            } else {
                widthInput.value = '';
                heightInput.value = '';

                if (done != null) {
                    done('');
                }
            }
        }
    };

    var openFiles = mxUtils.bind(this, function (files) {
        editorUi.importFiles(
            files,
            0,
            0,
            editorUi.maxBackgroundSize,
            function (data, mimeType, x, y, w, h) {
                urlInput.value = data;
                urlChanged();
                urlInput.focus();
            },
            function () {
                // No post processing
            },
            function (file) {
                // Handles only images
                return file.type.substring(0, 6) == 'image/';
            },
            function (queue) {
                // Invokes elements of queue in order
                for (var i = 0; i < queue.length; i++) {
                    queue[i]();
                }
            },
            true,
            editorUi.maxBackgroundBytes,
            editorUi.maxBackgroundBytes,
            true
        );
    });

    this.init = function () {
        if (isPageLink) {
            pageSelect.focus();
        } else {
            urlInput.focus();
        }

        mxEvent.addListener(pageSelect, 'focus', function () {
            urlRadio.removeAttribute('checked');
            pageRadio.setAttribute('checked', 'checked');
            pageRadio.checked = true;
        });

        mxEvent.addListener(urlInput, 'focus', function () {
            pageRadio.removeAttribute('checked');
            urlRadio.setAttribute('checked', 'checked');
            urlRadio.checked = true;
        });

        // Installs drag and drop handler for local images and links
        if (Graph.fileSupport) {
            urlInput.setAttribute('placeholder', mxResources.get('dragImagesHere'));

            // Setup the dnd listeners
            var dlg = div.parentNode;
            var dropElt = null;

            mxEvent.addListener(dlg, 'dragleave', function (evt) {
                if (dropElt != null) {
                    dropElt.parentNode.removeChild(dropElt);
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
                        dropElt = editorUi.highlightElement(dlg);
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
                        dropElt.parentNode.removeChild(dropElt);
                        dropElt = null;
                    }

                    if (evt.dataTransfer.files.length > 0) {
                        openFiles(evt.dataTransfer.files);
                    } else if (mxUtils.indexOf(evt.dataTransfer.types, 'text/uri-list') >= 0) {
                        var uri = evt.dataTransfer.getData('text/uri-list');

                        if (/\.(gif|jpg|jpeg|tiff|png|svg)$/i.test(uri)) {
                            urlInput.value = decodeURIComponent(uri);
                            urlChanged();
                        }
                    }

                    evt.stopPropagation();
                    evt.preventDefault();
                }),
                false
            );
        }
    };

    div.appendChild(urlRadio);
    div.appendChild(urlInput);
    mxUtils.br(div);

    var span = document.createElement('span');
    span.style.marginLeft = '30px';
    mxUtils.write(span, mxResources.get('width') + ':');
    div.appendChild(span);

    var widthInput = document.createElement('input');
    widthInput.setAttribute('type', 'text');
    widthInput.style.width = '60px';
    widthInput.style.marginLeft = '8px';
    widthInput.style.marginRight = '16px';
    widthInput.value = img != null && !isPageLink ? img.width : '';

    div.appendChild(widthInput);

    mxUtils.write(div, mxResources.get('height') + ':');

    var heightInput = document.createElement('input');
    heightInput.setAttribute('type', 'text');
    heightInput.style.width = '60px';
    heightInput.style.marginLeft = '8px';
    heightInput.style.marginRight = '16px';
    heightInput.value = img != null && !isPageLink ? img.height : '';

    div.appendChild(heightInput);
    mxUtils.br(div);
    mxUtils.br(div);

    mxEvent.addListener(urlInput, 'change', urlChanged);

    ImageDialog.filePicked = function (data) {
        // if (data.action == google.picker.Action.PICKED) {
        //   if (data.docs[0].thumbnails != null) {
        //     var thumb = data.docs[0].thumbnails[data.docs[0].thumbnails.length - 1];

        //     if (thumb != null) {
        //       urlInput.value = thumb.url;
        //       urlChanged();
        //     }
        //   }
        // }
        urlInput.focus();
    };

    div.appendChild(pageRadio);
    div.appendChild(pageSelect);
    mxUtils.br(div);
    mxUtils.br(div);

    if (isPageLink) {
        pageRadio.setAttribute('checked', 'checked');
        pageRadio.checked = true;
    } else {
        urlRadio.setAttribute('checked', 'checked');
        urlRadio.checked = true;
    }

    if (!pageFound && pageRadio.checked) {
        mxUtils.write(notFoundOption, mxResources.get('pageNotFound'));
        notFoundOption.setAttribute('disabled', 'disabled');
        notFoundOption.setAttribute('selected', 'selected');
        notFoundOption.setAttribute('value', 'pageNotFound');
        pageSelect.appendChild(notFoundOption);

        mxEvent.addListener(pageSelect, 'change', function () {
            if (notFoundOption.parentNode != null && !notFoundOption.selected) {
                notFoundOption.parentNode.removeChild(notFoundOption);
            }
        });
    }

    var bgDiv = document.createElement('div');
    bgDiv.style.display = showColor ? 'inline-flex' : 'none';
    bgDiv.style.alignItems = 'center';
    bgDiv.style.cursor = 'default';
    bgDiv.style.minWidth = '40%';
    bgDiv.style.height = '20px';

    var cb = document.createElement('input');
    cb.setAttribute('type', 'checkbox');
    cb.style.margin = '0px 10px 0px 4px';
    cb.style.verticalAlign = 'bottom';
    cb.defaultChecked = color != mxConstants.NONE && color != null;
    cb.checked = cb.defaultChecked;
    bgDiv.appendChild(cb);

    mxUtils.write(bgDiv, mxResources.get('fillColor'));

    var shadowDiv = bgDiv.cloneNode(false);
    var shadow = document.createElement('input');
    shadow.setAttribute('type', 'checkbox');
    shadow.style.margin = '0px 10px 0px 30px';
    shadow.style.verticalAlign = 'bottom';
    shadow.defaultChecked = graph.shadowVisible;
    shadow.checked = shadow.defaultChecked;
    shadowDiv.appendChild(shadow);
    mxUtils.write(shadowDiv, mxResources.get('shadow'));

    if (!mxClient.IS_SVG || mxClient.IS_SF) {
        shadow.setAttribute('disabled', 'disabled');
    }

    mxEvent.addListener(shadowDiv, 'click', function (evt) {
        if (mxEvent.getSource(evt) != shadow) {
            shadow.checked = !shadow.checked;
        }
    });

    // TODO: Move createColorButton to editorUi
    var backgroundButton = document.createElement('button');
    backgroundButton.style.width = '36px';
    backgroundButton.style.height = '18px';
    backgroundButton.style.cursor = 'pointer';
    backgroundButton.style.marginLeft = '10px';
    backgroundButton.style.backgroundPosition = 'center center';
    backgroundButton.style.backgroundRepeat = 'no-repeat';
    backgroundButton.style.verticalAlign = 'bottom';
    backgroundButton.className = 'geColorBtn';

    var newBackgroundColor = color;

    function updateBackgroundColor() {
        if (newBackgroundColor == null || newBackgroundColor == mxConstants.NONE) {
            backgroundButton.style.display = 'none';
            cb.checked = false;
        } else {
            backgroundButton.style.backgroundColor = newBackgroundColor;
            backgroundButton.style.display = '';
            cb.checked = true;
        }
    }

    updateBackgroundColor();

    mxEvent.addListener(bgDiv, 'click', function (evt) {
        if (mxEvent.getSource(evt) != cb) {
            cb.checked = !cb.checked;
        }

        if (cb.checked) {
            newBackgroundColor = '#ffffff';
        } else {
            newBackgroundColor = null;
        }

        updateBackgroundColor();
    });

    mxEvent.addListener(backgroundButton, 'click', function (evt) {
        editorUi.pickColor(newBackgroundColor || 'none', function (color) {
            newBackgroundColor = color;
            updateBackgroundColor();
        });
        mxEvent.consume(evt);
    });

    bgDiv.appendChild(backgroundButton);
    div.appendChild(bgDiv);
    div.appendChild(shadowDiv);
    mxUtils.br(div);

    var btns = document.createElement('div');
    btns.style.marginTop = '30px';
    btns.style.textAlign = 'right';

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        resetting = true;
        editorUi.hideDialog();
    });

    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        btns.appendChild(cancelBtn);
    }

    var resetBtn = mxUtils.button(mxResources.get('reset'), function () {
        urlInput.value = '';
        widthInput.value = '';
        heightInput.value = '';
        urlRadio.checked = true;
        newBackgroundColor = mxConstants.NONE;
        updateBackgroundColor();
        resetting = false;
    });
    mxEvent.addGestureListeners(resetBtn, function () {
        // Blocks processing a image URL while clicking reset
        resetting = true;
    });
    resetBtn.className = 'geBtn';
    resetBtn.width = '100';
    btns.appendChild(resetBtn);

    if (Graph.fileSupport) {
        var fileInput = document.createElement('input');
        fileInput.setAttribute('multiple', 'multiple');
        fileInput.setAttribute('type', 'file');

        mxEvent.addListener(fileInput, 'change', function (evt) {
            if (fileInput.files != null) {
                openFiles(fileInput.files);

                // Resets input to force change event for same file (type reset required for IE)
                fileInput.type = '';
                fileInput.type = 'file';
                fileInput.value = '';
            }
        });

        fileInput.style.display = 'none';
        div.appendChild(fileInput);

        var btn = mxUtils.button(mxResources.get('open'), function () {
            fileInput.click();
        });

        btn.className = 'geBtn';
        btns.appendChild(btn);
    }

    var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        editorUi.hideDialog();
        urlChanged(null, function (url) {
            applyFn(url != '' && url != null ? new mxImage(url, widthInput.value, heightInput.value) : null, url == null, newBackgroundColor, !mxClient.IS_SVG || mxClient.IS_SF ? null : shadow.checked);
        });
    });

    mxEvent.addGestureListeners(applyBtn, function () {
        ignoreEvt = true;
    });

    applyBtn.className = 'geBtn gePrimaryBtn';
    btns.appendChild(applyBtn);

    if (!editorUi.editor.cancelFirst) {
        btns.appendChild(cancelBtn);
    }

    div.appendChild(btns);

    this.container = div;
}

var ConnectionPointsDialog = function (editorUi, cell) {
    var GRAPH_SIZE = 350,
        CP_SIZE = 6,
        CP_HLF_SIZE = 3;
    var div = document.createElement('div');
    div.style.userSelect = 'none';
    var keyHandler = null;

    this.init = function () {
        var graphDiv = document.createElement('div');
        graphDiv.style.width = GRAPH_SIZE + 'px';
        graphDiv.style.height = GRAPH_SIZE + 'px';
        graphDiv.style.overflow = 'hidden';
        graphDiv.style.border = '1px solid lightGray';
        graphDiv.style.boxSizing = 'border-box';
        mxEvent.disableContextMenu(graphDiv);
        div.appendChild(graphDiv);

        var editingGraph = new Graph(graphDiv);
        editingGraph.transparentBackground = false;
        editingGraph.autoExtend = false;
        editingGraph.autoScroll = false;
        editingGraph.setGridEnabled(false);
        editingGraph.setEnabled(true);
        editingGraph.setPanning(true);
        editingGraph.setConnectable(false);
        editingGraph.setTooltips(false);
        editingGraph.minFitScale = null;
        editingGraph.maxFitScale = null;
        editingGraph.centerZoom = true;
        editingGraph.maxFitScale = 2;

        function createCPoint(x, y, constObj) {
            var cPointStyle = 'shape=mxgraph.basic.x;fillColor=#29b6f2;strokeColor=#29b6f2;points=[];rotatable=0;resizable=0;connectable=0;editable=0;';
            var cPoint = new mxCell('', new mxGeometry(x, y, CP_SIZE, CP_SIZE), cPointStyle);
            cPoint.vertex = true;
            cPoint.cp = true;
            cPoint.constObj = constObj;

            return editingGraph.addCell(cPoint);
        }

        //Add cell and current connection points on it
        var geo = cell.geometry;
        var mainCell = new mxCell(cell.value, new mxGeometry(0, 0, geo.width, geo.height), cell.style + ';rotatable=0;resizable=0;connectable=0;editable=0;movable=0;fillColor=none;');
        mainCell.vertex = true;
        editingGraph.addCell(mainCell);

        //Adding a point via double click
        editingGraph.dblClick = function (evt, cell) {
            if (cell != null && cell != mainCell) {
                editingGraph.setSelectionCell(cell);
            } else {
                var pt = mxUtils.convertPoint(editingGraph.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
                mxEvent.consume(evt);
                var scale = editingGraph.view.scale;
                var tr = editingGraph.view.translate;
                editingGraph.setSelectionCell(createCPoint((pt.x - CP_HLF_SIZE * scale) / scale - tr.x, (pt.y - CP_HLF_SIZE * scale) / scale - tr.y));
            }
        };

        keyHandler = new mxKeyHandler(editingGraph);

        function removeCPoints(evt) {
            var cells = editingGraph.getSelectionCells();
            editingGraph.deleteCells(cells);
        }

        keyHandler.bindKey(46, removeCPoints);
        keyHandler.bindKey(8, removeCPoints);

        //Force rubberband inside the cell
        editingGraph.getRubberband().isForceRubberbandEvent = function (event) {
            //Left click and not a click on a connection point
            return event.evt.button == 0 && (event.getCell() == null || event.getCell() == mainCell);
        };
        //Force panning inside the cell
        editingGraph.panningHandler.isForcePanningEvent = function (event) {
            return event.evt.button == 2;
        };

        var origIsCellSelectable = editingGraph.isCellSelectable;
        editingGraph.isCellSelectable = function (cell) {
            if (cell == mainCell) {
                return false;
            } else {
                return origIsCellSelectable.apply(this, arguments);
            }
        };

        // Disables hyperlinks
        editingGraph.getLinkForCell = function () {
            return null;
        };

        var state = editingGraph.view.getState(mainCell);
        var constraints = editingGraph.getAllConnectionConstraints(state);

        for (var i = 0; constraints != null && i < constraints.length; i++) {
            var cp = editingGraph.getConnectionPoint(state, constraints[i]);
            createCPoint(cp.x - CP_HLF_SIZE, cp.y - CP_HLF_SIZE, constraints[i]);
        }

        editingGraph.fit(8);
        editingGraph.center();

        var zoomInBtn = editorUi.createToolbarButton(
            Editor.zoomInImage,
            mxResources.get('zoomIn'),
            function () {
                editingGraph.zoomIn();
            },
            20
        );

        var zoomOutBtn = editorUi.createToolbarButton(
            Editor.zoomOutImage,
            mxResources.get('zoomOut'),
            function () {
                editingGraph.zoomOut();
            },
            20
        );

        var zoomFitBtn = editorUi.createToolbarButton(
            Editor.zoomFitImage,
            mxResources.get('fit'),
            function () {
                if (editingGraph.view.scale == 1) {
                    editingGraph.maxFitScale = 8;
                    editingGraph.fit(8);
                } else {
                    editingGraph.zoomActual();
                }

                editingGraph.center();
            },
            20
        );

        var changeGridSize = function () {
            editorUi.prompt(mxResources.get('gridSize'), editingGraph.gridSize, function (newValue) {
                if (!isNaN(newValue) && newValue > 0) {
                    editingGraph.setGridSize(newValue);
                    editingGraph.setGridEnabled(true);
                    editingGraph.refresh();
                }
            });
        };

        var gridBtn = editorUi.createToolbarButton(
            Editor.thinGridImage,
            mxResources.get('grid'),
            function (evt) {
                if (mxEvent.isShiftDown(evt)) {
                    changeGridSize();
                } else {
                    editingGraph.setGridEnabled(!editingGraph.isGridEnabled());
                    editingGraph.refresh();
                }
            },
            20
        );

        mxEvent.addListener(gridBtn, 'dblclick', changeGridSize);

        var deleteBtn = editorUi.createToolbarButton(Editor.trashImage, mxResources.get('delete'), removeCPoints, 20);
        mxUtils.setOpacity(deleteBtn, 10); //Disabled

        var zoomBtns = document.createElement('div');
        zoomBtns.style.display = 'flex';
        zoomBtns.style.alignItems = 'center';
        zoomBtns.style.paddingTop = '6px';

        zoomBtns.appendChild(zoomInBtn);
        zoomBtns.appendChild(zoomOutBtn);
        zoomBtns.appendChild(zoomFitBtn);
        zoomBtns.appendChild(gridBtn);
        zoomBtns.appendChild(deleteBtn);

        div.appendChild(zoomBtns);

        var pCount = document.createElement('input');
        pCount.setAttribute('type', 'number');
        pCount.setAttribute('min', '1');
        pCount.setAttribute('value', '1');
        pCount.style.width = '45px';
        pCount.style.position = 'relative';
        pCount.style.margin = '0 4px 0 4px';

        var sideSelect = document.createElement('select');
        sideSelect.style.position = 'relative';
        var sides = ['left', 'right', 'top', 'bottom'];

        for (var i = 0; i < sides.length; i++) {
            var side = sides[i];
            var option = document.createElement('option');
            mxUtils.write(option, mxResources.get(side));
            option.value = side;
            sideSelect.appendChild(option);
        }

        var addBtn = mxUtils.button(mxResources.get('add'), function () {
            var count = parseInt(pCount.value);
            count = count < 1 ? 1 : count > 100 ? 100 : count;
            pCount.value = count;
            var side = sideSelect.value;
            var geo = mainCell.geometry;
            var cells = [];

            for (var i = 0; i < count; i++) {
                var x, y;

                switch (side) {
                    case 'left':
                        x = geo.x;
                        y = geo.y + ((i + 1) * geo.height) / (count + 1);
                        break;
                    case 'right':
                        x = geo.x + geo.width;
                        y = geo.y + ((i + 1) * geo.height) / (count + 1);
                        break;
                    case 'top':
                        x = geo.x + ((i + 1) * geo.width) / (count + 1);
                        y = geo.y;
                        break;
                    case 'bottom':
                        x = geo.x + ((i + 1) * geo.width) / (count + 1);
                        y = geo.y + geo.height;
                        break;
                }

                cells.push(createCPoint(x - CP_HLF_SIZE, y - CP_HLF_SIZE));
            }

            editingGraph.setSelectionCells(cells);
        });

        addBtn.style.marginLeft = 'auto';
        zoomBtns.appendChild(addBtn);
        zoomBtns.appendChild(pCount);
        zoomBtns.appendChild(sideSelect);

        //Point properties
        var pointPropsDiv = document.createElement('div');
        pointPropsDiv.style.margin = '4px 0px 8px 0px';
        pointPropsDiv.style.whiteSpace = 'nowrap';
        pointPropsDiv.style.height = '24px';
        var xSpan = document.createElement('span');
        mxUtils.write(xSpan, mxResources.get('dx'));
        pointPropsDiv.appendChild(xSpan);
        var xInput = document.createElement('input');
        xInput.setAttribute('type', 'number');
        xInput.setAttribute('min', '0');
        xInput.setAttribute('max', '100');
        xInput.style.width = '45px';
        xInput.style.margin = '0 4px 0 4px';
        pointPropsDiv.appendChild(xInput);
        mxUtils.write(pointPropsDiv, '%');

        var dxInput = document.createElement('input');
        dxInput.setAttribute('type', 'number');
        dxInput.style.width = '45px';
        dxInput.style.margin = '0 4px 0 4px';
        pointPropsDiv.appendChild(dxInput);
        mxUtils.write(pointPropsDiv, 'pt');

        var ySpan = document.createElement('span');
        mxUtils.write(ySpan, mxResources.get('dy'));
        ySpan.style.marginLeft = '12px';
        pointPropsDiv.appendChild(ySpan);
        var yInput = document.createElement('input');
        yInput.setAttribute('type', 'number');
        yInput.setAttribute('min', '0');
        yInput.setAttribute('max', '100');
        yInput.style.width = '45px';
        yInput.style.margin = '0 4px 0 4px';
        pointPropsDiv.appendChild(yInput);
        mxUtils.write(pointPropsDiv, '%');

        var dyInput = document.createElement('input');
        dyInput.setAttribute('type', 'number');
        dyInput.style.width = '45px';
        dyInput.style.margin = '0 4px 0 4px';
        pointPropsDiv.appendChild(dyInput);
        mxUtils.write(pointPropsDiv, 'pt');
        div.appendChild(pointPropsDiv);

        function applyPointProp() {
            var x = parseInt(xInput.value) || 0;
            x = x < 0 ? 0 : x > 100 ? 100 : x;
            xInput.value = x;

            var y = parseInt(yInput.value) || 0;
            y = y < 0 ? 0 : y > 100 ? 100 : y;
            yInput.value = y;

            var dx = parseInt(dxInput.value) || 0;
            var dy = parseInt(dyInput.value) || 0;
            var constObj = new mxConnectionConstraint(new mxPoint(x / 100, y / 100), false, null, dx, dy);
            var cp = editingGraph.getConnectionPoint(state, constObj);

            var cell = editingGraph.getSelectionCell();

            if (cell != null) {
                cell.constObj = constObj;
                var geo = cell.geometry.clone();
                var scale = editingGraph.view.scale;
                var tr = editingGraph.view.translate;
                geo.x = (cp.x - CP_HLF_SIZE * scale) / scale - tr.x;
                geo.y = (cp.y - CP_HLF_SIZE * scale) / scale - tr.y;
                editingGraph.model.setGeometry(cell, geo);
            }
        }

        function getConstraintFromCPoint(cp) {
            if (cp.constObj) {
                return {
                    x: cp.constObj.point.x,
                    y: cp.constObj.point.y,
                    dx: cp.constObj.dx,
                    dy: cp.constObj.dy,
                };
            }

            var dx = 0,
                dy = 0,
                mGeo = mainCell.geometry;
            var x = mxUtils.format((cp.geometry.x + CP_HLF_SIZE - mGeo.x) / mGeo.width);
            var y = mxUtils.format((cp.geometry.y + CP_HLF_SIZE - mGeo.y) / mGeo.height);

            if (x < 0) {
                dx = x * mGeo.width;
                x = 0;
            } else if (x > 1) {
                dx = (x - 1) * mGeo.width;
                x = 1;
            }

            if (y < 0) {
                dy = y * mGeo.height;
                y = 0;
            } else if (y > 1) {
                dy = (y - 1) * mGeo.height;
                y = 1;
            }

            return {x: x, y: y, dx: parseInt(dx), dy: parseInt(dy)};
        }

        function fillCPointProp(evt) {
            if (editingGraph.getSelectionCount() == 1) {
                var cell = editingGraph.getSelectionCell();

                // On move events, exact constraint is lost
                if (evt) {
                    cell.constObj = null;
                }

                var constraint = getConstraintFromCPoint(cell);
                xInput.value = constraint.x * 100;
                yInput.value = constraint.y * 100;
                dxInput.value = constraint.dx;
                dyInput.value = constraint.dy;
                pointPropsDiv.style.visibility = '';
            } else {
                pointPropsDiv.style.visibility = 'hidden';
            }
        }

        fillCPointProp();

        editingGraph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
            if (editingGraph.getSelectionCount() > 0) {
                mxUtils.setOpacity(deleteBtn, 60); //Enabled
            } else {
                mxUtils.setOpacity(deleteBtn, 10); //Disabled
            }

            fillCPointProp();
        });
        editingGraph.addListener(mxEvent.CELLS_MOVED, fillCPointProp);

        mxEvent.addListener(xInput, 'change', applyPointProp);
        mxEvent.addListener(yInput, 'change', applyPointProp);
        mxEvent.addListener(dxInput, 'change', applyPointProp);
        mxEvent.addListener(dyInput, 'change', applyPointProp);

        var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
            destroy();
            editorUi.hideDialog();
        });

        cancelBtn.className = 'geBtn';

        var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
            var cells = editingGraph.model.cells,
                points = [],
                constraints = [];

            for (var id in cells) {
                var cp = cells[id];

                if (!cp.cp) continue;

                constraints.push(getConstraintFromCPoint(cp));
            }

            //Find and remove identical points
            constraints.sort(function (a, b) {
                return a.x != b.x ? a.x - b.x : a.y != b.y ? a.y - b.y : a.dx != b.dx ? a.dx - b.dx : a.dy - b.dy; //Sort based on x then y, dx and dy
            });

            for (var i = 0; i < constraints.length; i++) {
                if (i > 0 && constraints[i].x == constraints[i - 1].x && constraints[i].y == constraints[i - 1].y && constraints[i].dx == constraints[i - 1].dx && constraints[i].dy == constraints[i - 1].dy) {
                    continue; //Skip this identical point
                }

                points.push('[' + constraints[i].x + ',' + constraints[i].y + ',0,' + constraints[i].dx + ',' + constraints[i].dy + ']');
            }

            editorUi.editor.graph.setCellStyles('points', '[' + points.join(',') + ']', [cell]);
            destroy();
            editorUi.hideDialog();
        });

        applyBtn.className = 'geBtn gePrimaryBtn';

        var resetBtn = mxUtils.button(mxResources.get('reset'), function () {
            editorUi.editor.graph.setCellStyles('points', null, [cell]);
            destroy();
            editorUi.hideDialog();
        });

        resetBtn.className = 'geBtn';

        var buttons = document.createElement('div');
        buttons.style.marginTop = '10px';
        buttons.style.textAlign = 'right';

        if (!editorUi.isOffline()) {
            var helpBtn = mxUtils.button(mxResources.get('help'), function () {
                editorUi.openLink('https://www.drawio.com/doc/faq/shape-connection-points-customise');
            });

            helpBtn.className = 'geBtn';
            buttons.appendChild(helpBtn);
        }

        if (editorUi.editor.cancelFirst) {
            buttons.appendChild(cancelBtn);
        }

        buttons.appendChild(resetBtn);
        buttons.appendChild(applyBtn);

        if (!editorUi.editor.cancelFirst) {
            buttons.appendChild(cancelBtn);
        }

        div.appendChild(buttons);
    };

    function destroy() {
        if (keyHandler != null) {
            keyHandler.destroy();
        }
    }

    this.destroy = destroy;

    this.container = div;
};

var EditGeometryDialog = function (editorUi, vertices) {
    var graph = editorUi.editor.graph;
    var geo = vertices.length == 1 ? graph.getCellGeometry(vertices[0]) : null;
    var div = document.createElement('div');

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    var row = document.createElement('tr');
    var left = document.createElement('td');
    var right = document.createElement('td');
    table.style.paddingLeft = '6px';

    mxUtils.write(left, mxResources.get('relative') + ':');

    var relInput = document.createElement('input');
    relInput.setAttribute('type', 'checkbox');

    if (geo != null && geo.relative) {
        relInput.setAttribute('checked', 'checked');
        relInput.defaultChecked = true;
    }

    this.init = function () {
        relInput.focus();
    };

    right.appendChild(relInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    row = document.createElement('tr');
    left = document.createElement('td');
    right = document.createElement('td');

    mxUtils.write(left, mxResources.get('left') + ':');

    var xInput = document.createElement('input');
    xInput.setAttribute('type', 'text');
    xInput.style.width = '100px';
    xInput.value = geo != null ? geo.x : '';

    right.appendChild(xInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    row = document.createElement('tr');
    left = document.createElement('td');
    right = document.createElement('td');

    mxUtils.write(left, mxResources.get('top') + ':');

    var yInput = document.createElement('input');
    yInput.setAttribute('type', 'text');
    yInput.style.width = '100px';
    yInput.value = geo != null ? geo.y : '';

    right.appendChild(yInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    row = document.createElement('tr');
    left = document.createElement('td');
    right = document.createElement('td');

    mxUtils.write(left, mxResources.get('dx') + ':');

    var dxInput = document.createElement('input');
    dxInput.setAttribute('type', 'text');
    dxInput.style.width = '100px';
    dxInput.value = geo != null && geo.offset != null ? geo.offset.x : '';

    right.appendChild(dxInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    row = document.createElement('tr');
    left = document.createElement('td');
    right = document.createElement('td');

    mxUtils.write(left, mxResources.get('dy') + ':');

    var dyInput = document.createElement('input');
    dyInput.setAttribute('type', 'text');
    dyInput.style.width = '100px';
    dyInput.value = geo != null && geo.offset != null ? geo.offset.y : '';

    right.appendChild(dyInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    row = document.createElement('tr');
    left = document.createElement('td');
    right = document.createElement('td');

    mxUtils.write(left, mxResources.get('width') + ':');

    var wInput = document.createElement('input');
    wInput.setAttribute('type', 'text');
    wInput.style.width = '100px';
    wInput.value = geo != null ? geo.width : '';

    right.appendChild(wInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    row = document.createElement('tr');
    left = document.createElement('td');
    right = document.createElement('td');

    mxUtils.write(left, mxResources.get('height') + ':');

    var hInput = document.createElement('input');
    hInput.setAttribute('type', 'text');
    hInput.style.width = '100px';
    hInput.value = geo != null ? geo.height : '';

    right.appendChild(hInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    row = document.createElement('tr');
    left = document.createElement('td');
    right = document.createElement('td');

    mxUtils.write(left, mxResources.get('rotation') + ':');

    var rotInput = document.createElement('input');
    rotInput.setAttribute('type', 'text');
    rotInput.style.width = '100px';
    rotInput.value = vertices.length == 1 ? mxUtils.getValue(graph.getCellStyle(vertices[0]), mxConstants.STYLE_ROTATION, 0) : '';

    right.appendChild(rotInput);

    row.appendChild(left);
    row.appendChild(right);

    tbody.appendChild(row);

    table.appendChild(tbody);
    div.appendChild(table);

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();
    });

    cancelBtn.className = 'geBtn';

    var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        editorUi.hideDialog();

        graph.getModel().beginUpdate();
        try {
            for (var i = 0; i < vertices.length; i++) {
                var g = graph.getCellGeometry(vertices[i]);

                if (g != null) {
                    g = g.clone();

                    if (graph.isCellMovable(vertices[i])) {
                        g.relative = relInput.checked;

                        if (mxUtils.trim(xInput.value).length > 0) {
                            g.x = Number(xInput.value);
                        }

                        if (mxUtils.trim(yInput.value).length > 0) {
                            g.y = Number(yInput.value);
                        }

                        if (mxUtils.trim(dxInput.value).length > 0) {
                            if (g.offset == null) {
                                g.offset = new mxPoint();
                            }

                            g.offset.x = Number(dxInput.value);
                        }

                        if (mxUtils.trim(dyInput.value).length > 0) {
                            if (g.offset == null) {
                                g.offset = new mxPoint();
                            }

                            g.offset.y = Number(dyInput.value);
                        }
                    }

                    if (graph.isCellResizable(vertices[i])) {
                        if (mxUtils.trim(wInput.value).length > 0) {
                            g.width = Number(wInput.value);
                        }

                        if (mxUtils.trim(hInput.value).length > 0) {
                            g.height = Number(hInput.value);
                        }
                    }

                    graph.getModel().setGeometry(vertices[i], g);
                }

                if (mxUtils.trim(rotInput.value).length > 0) {
                    graph.setCellStyles(mxConstants.STYLE_ROTATION, Number(rotInput.value), [vertices[i]]);
                }
            }
        } finally {
            graph.getModel().endUpdate();
        }
    });

    applyBtn.className = 'geBtn gePrimaryBtn';

    mxEvent.addListener(div, 'keypress', function (e) {
        if (e.keyCode == 13) {
            applyBtn.click();
        }
    });

    var buttons = document.createElement('div');
    buttons.style.marginTop = '20px';
    buttons.style.textAlign = 'right';

    if (editorUi.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
        buttons.appendChild(applyBtn);
    } else {
        buttons.appendChild(applyBtn);
        buttons.appendChild(cancelBtn);
    }

    div.appendChild(buttons);

    this.container = div;
};

function UsrImageDialog(editorUi, title, initialValue, fn, ignoreExisting, convertDataUri) {
    convertDataUri = null == convertDataUri || convertDataUri;
    var graph = editorUi.editor.graph;
    var imagePath = '';
    var div = document.createElement('div');
    div.style.backgroundColor = '#ffffff';
    div.style.overflowX = 'hidden';
    div.style.height = '400px';
    var titleDiv = document.createElement('div');
    mxUtils.write(titleDiv, mxResources.get('image'));
    titleDiv.style.backgroundColor = '#F7F7F7';
    titleDiv.style.height = '50px';
    titleDiv.style.lineHeight = '50px';
    titleDiv.style.paddingLeft = '10px';
    titleDiv.style.fontSize = '16px';
    titleDiv.style.color = '#1E2426';
    titleDiv.style.fontWeight = '600';
    titleDiv.style.borderRadius = '4px 4px 0 0';
    div.appendChild(titleDiv);

    const insertImage = function (newValue, w, h, resize, isRealwh) {
        let dataUri = 'data:' === newValue.substring(0, 5);
        let isShape = newValue.indexOf('shape=') > -1;
        if (!editorUi.isOffline() || (dataUri && 'undefined' == typeof chrome)) {
            if (newValue.length > 0 && editorUi.spinner.spin(document.body, mxResources.get('inserting'))) {
                if (isShape) {
                    fn(newValue, 80, 80);
                    editorUi.spinner.stop();
                    editorUi.hideDialog();
                } else {
                    editorUi.loadImage(newValue, function (img) {
                            editorUi.spinner.stop();
                            editorUi.hideDialog();
                            let s = !1 === resize ? 1 : null != w && null != h ? Math.max(w / img.width, h / img.height) : Math.min(1, Math.min(520 / img.width, 520 / img.height));
                            if (convertDataUri) {
                                newValue = editorUi.convertDataUri(newValue);
                            }
                            if (isRealwh) {
                                fn(newValue, 80, 80);
                            } else {
                                fn(newValue, Math.round(Number(img.width) * s), Math.round(Number(img.height) * s));
                            }
                        }, function () {
                            editorUi.spinner.stop(), fn(null), editorUi.showError(mxResources.get('error'), mxResources.get('fileNotFound'), mxResources.get('ok'));
                        }
                    )
                }
            } else {
                editorUi.hideDialog();
                fn(newValue);
            }
        } else {
            newValue = editorUi.convertDataUri(newValue);
            w = null == w ? 120 : w;
            h = null == h ? 100 : h;
            editorUi.hideDialog();
            fn(newValue, w, h);
        }
    };
    let checkDiv = document.createElement('div');
    checkDiv.style.marginLeft = '10px';
    checkDiv.style.fontSize = '14px';
    checkDiv.style.marginTop = '10px';
    var localImg = document.createElement('input');
    localImg.type = 'radio';
    localImg.name = 'checkImg';
    localImg.checked = true;
    var localName = document.createElement('span');
    localName.className = 'usrRadioName';
    localName.style.marginLeft = '5px';
    localName.style.color = '#666666';
    localName.style.fontSize = '14px';
    mxUtils.write(localName, mxResources.get('LocalUpload'));
    var galleryImg = document.createElement('input');
    galleryImg.type = 'radio';
    galleryImg.name = 'checkImg';
    galleryImg.style.marginLeft = '40px';
    var galleryName = document.createElement('span');
    mxUtils.write(galleryName, mxResources.get('GalleryGraphics'));
    galleryName.className = 'usrRadioName';
    galleryName.style.marginLeft = '5px';
    galleryName.style.color = '#666666';
    galleryName.style.fontSize = '14px';
    checkDiv.appendChild(localImg);
    checkDiv.appendChild(localName);
    checkDiv.appendChild(galleryImg);
    checkDiv.appendChild(galleryName);
    div.appendChild(checkDiv);
    var localDiv = document.createElement('div');
    localDiv.style.height = '300px';
    var localTemporaryDiv = document.createElement('div');
    localTemporaryDiv.id = 'localImgDiv';
    localTemporaryDiv.style.height = '100px';
    localTemporaryDiv.style.width = '100px';
    localTemporaryDiv.style.textAlign = 'center';
    localTemporaryDiv.style.lineHeight = '100px';
    localTemporaryDiv.style.marginTop = '20px';
    localTemporaryDiv.style.marginLeft = '10px';
    localTemporaryDiv.style.border = '1px solid #CCCCCC';
    localTemporaryDiv.style.backgroundColor = '#ffffff';
    localTemporaryDiv.style.cssText = `flex-direction: row;align-items: center;justify-content: center;display: flex;height: 100px;width: 100px;text-align: center;line-height: 100px;margin-top: 20px;margin-left: 10px;border: 1px solid rgb(204, 204, 204);background-color: rgb(255, 255, 255);`;
    var temporaryImg = document.createElement('img');
    temporaryImg.style.maxHeight = '90%';
    temporaryImg.style.maxWidth = '90%';
    localTemporaryDiv.appendChild(temporaryImg);
    localDiv.appendChild(localTemporaryDiv);
    var localButton = document.createElement('button');
    localButton.style.width = '100px';
    localButton.style.height = '100px';
    localButton.style.position = 'relative';
    localButton.style.top = '-101px';
    localButton.style.left = '11px';
    localButton.style.border = 'none';
    localButton.style.fontSize = '50px';
    localButton.style.color = '#D8D8D8';
    localButton.style.backgroundColor = '#ffffff';
    localButton.style.borderRadius = '15px';
    localButton.style.cursor = 'pointer';
    mxUtils.write(localButton, '+');
    localDiv.appendChild(localButton);
    var deleteDiv = document.createElement('div');
    deleteDiv.style.width = '100px';
    deleteDiv.style.height = '100px';
    deleteDiv.style.backgroundColor = '#000000';
    deleteDiv.style.opacity = '0.6';
    deleteDiv.style.position = 'relative';
    deleteDiv.style.top = '-101px';
    deleteDiv.style.left = '11px';
    deleteDiv.style.display = 'none';
    var delectLocalImg = document.createElement('img');
    delectLocalImg.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAd8AAAJxCAQAAACp93DQAAAACXBIWXMAACcQAAAnEAGUaVEZAAADGWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBA3y7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BUNTVQYqg4jIKAX08EGIIUByaVEZhMXIwMDAIMCgxeDHUMmwiuEBozRjFOM8xqdMhkwNTJeYNZgbme+y2LDMY2VmzWa9yubEtoldhX0mhwBHJycrZzMXM1cbNzf3RB4pnqW8xryH+IL5nvFXCwgJrBZ0E3wk1CisKHxYJF2UV3SrWJw4p/hWiRRJYcmjUhXSutJPZObIhsoJyp2V71HwUeRVvKA0RTlKRUnltepWtUZ1Pw1Zjbea+7QmaqfqWOsK6b7SO6I/36DGMMrI0ljS+LfJPdPDZivM+y0qLBOtfKwtbFRtRexY7L7aP3e47XjB6ZjzXpetruvdVrov9VjkudBrgfdCn8W+y/xW+a8P2Bq4N+hY8PmQW6HPwr5EMEUKRilFG8e4xUbF5cW3JMxO3Jx0Nvl5KlOaXLpNRlRmVdas7D059/KY8tULfAqLi2YXHy55WyZR7lJRWDmv6mz131q9uvj6SQ3HGn83G7Skt85ru94h2Ond1d59uJehz76/bsK+if8nO05pnXpiOu+M4JmzZj2aozW3ZN6+BVwLwxYtXvxxqcOyCcsfrjRe1br65lrddU3rb2402NSx+cFWq21Tt3/Y6btr1R6Oven7jh9QP9h56PURv6Obj4ufqD355LT3mS3nZM+3X/h0Ke7yqasW15bdEL3ZeuvrnfS7N+/7PDjwyPTx6qeKz2a+EHzZ9Zr5Td3bn+9LP3z6VPD53de8b+9+5P/88Lv4z7d/Vf//AwAqvx2K829RWwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAHg0lEQVR42uzdYXbaSgyAUTTH+9+y+68kbYDB2JnR6N4NNMX6niDVecR+A3JqXgKQLyBfQL4gX0C+gHwB+YJ8AfkC8gX5AvIF5AvIF+QLyBeQL8gXkC8gX0C+IF9AvoB8Qb6AfIErbSX/1r7YaUVh+wLyBeQLyBfkC8gXkC/IF5AvIF9AviBfQL6AfEG+gHwB+QLyBfkC8gXkC/L1EoB8AfkC8gX5AvIF5AvIF+QLyBeQL8gXmNjmJTgsvAQn2b0Eti/IF5AvIF9AviBfQL6AfEG+gHwB+QLyBfkC8gXkC/IF5AvIF5AvyBeQLyBfkC8gX0C+gHxBvoB8AfkC8gX5AvIFesVE34zsS5pJUo18BYuYU+YrW2ScMF/hIuKE+QoXEafMV7pIOGW+0kXCF2nihazzf+X2lS5cuoObeCHrDr5m+0oXfmEHN/FC1h3cxAtZA27ihawBN/FC1oCbeCFrwE28kDXgJl7IGnATL2QNuIkXsgbcxAtZA/Z/moS0Ps3X7oVh/TTxQtaAvXmGkm+e7V4Yun+beCFrwN48Q7k3z3YvDN+/ti8U2752L0ywf21fKPfZF0iZr7fOMMXbZ9sX0tqm+UnCw2DlTXlJNPsMP7h0kfCBEsZvX+mSU4zfwk28kHV+N+lC1h387vb1j0YwzefpcW+e7V68hU762Ve8CDhtvkDSfO1e7F/bF2zfXuf83tnuxf49pTHbF3z2BeQLyBfkC8gXkC8gX5AvIF9AviBfQL6AfAH5gnwB+QLyBfkC8gWuMuI7jnzRCti+IF9AvoB8AfmCfAH5AvIF5AvyBeQLyBfkC8gXkC8gX5AvIF9AviBfQL6AfAH5gnwB+QLyBfkC8gXkC8gX5AvIF5AvVBMDvur+nD8yPDyqz6TtC948A/IF5AvyPZ9fOrGiqJEvIF+QLyBfQL49dg+P6rNk+4LtC8gXkC/IF5DvF84mWU3UyReQL8gXkC8g3x7OJik+R7YvyBeQLyBfkC8g32+cTbKSqJUvIF+QLyBfQL49nE1SeoZsX5AvIF9AviBfQL7/cDbJKqJevoB8Qb6AfAH59nA2SeH5sX1BvoB8AfmCfAH5/sfZJCuImvkC8gX5AvIF5NvD2SRlZ8f2BfkC8gXkC/IF5PsDZ5NkF3XzBeQL8gXkC8i3h7NJis7N5ikOfPgxxQDGAq+E7QvIF5AvIF+Q7wX8yoLMona+gHxBvoB8Afn2cDZJyZmxfUG+gHwB+YJ8Afk+4GySrEK+gHxBvoB8Afn2cDZJwXmxfUG+gHwB+YJ8Afk+5GySjEK+gHxBvoB8Afn2cjZJuVmxfUG+gHwB+YJ8Afk+4WySbEK+gHxBvoB8Afm+w9kkxebE9gX5AvIF5AvyBeT7lLNJMgn5AvIF+QLyBeT7LmeTlJoR2xfkC8gXkC/IF5DvC84mySLkC8gX5AvIF5DvEc4mKTQfti/IF5AvIF+QLyDfl5xNkkHIF5AvyBeQLyDfo5xNUmY2bF+QLyBfQL4gX0C+HZxNMruQLyBfkC8gX0C+n3A2SZG5sH1BvoB8AfmCfAH5dnE2ycxCvoB8Qb6AfAH5fsrZJCVmwvYF+QLyBeQL8gXk28nZJLMK+QLyBfkC8gXkewZnkxSYB9sX5AvIF5AvyBeQbzdnk9zMpe0Lti8gX0C+gHxBvhNy9czys2D7gnwB+QLyBfmO4GwSM2n7gu0LyBeQLyBfkO+MnE2y+BzYviBfQL6AfEG+YzibxDzavmD7AvIF5Avy9RKAfGfkbJJdvoB8AfkC8gX5ns/ZJGbR9gXbF5AvIF+QLyDfGTmbrG2XLyBfQL6AfEG+13A2iTm0fcH2BeQLyBfkC8h3Rs4m69rlC8gXkC8gX5DvdZxNYgZtX7B9AfkC8gX5AvKdkbPJmnb5AvIF5AvIF+QLyPdHrp4xf7Yv2L6AfAH5gnyX5myynl2+gHwB+QLyBfkC8n3I2SRmz/YF2xeQLyBfkO/SnE3WsssXkC8gX+CLzUtwUPgZpvopbF9Avv7rjvdX8gXkC/IF5AvIt5uzyZtnLV9AvoB8Qb6AfAH5/uVsEjNn+4LtC8gXkC/Id2nOJj1n+QLyBeQL8gXkC8j3ztkk5s32BdsXkC8gX5Dv0pxNesbyBeQLyBfkC8gXkO+ds0nMmu0Lti8gX0C+IN+lOZv0fOULyBeQL8gXkC8g3ztnk5gz2xdsX0C+gHxBvktzNunZyheQLyBfkC8gX0C+d84mMWO2L9i+gHwB+YJ8l+Zs0nOVLyBfQL5Qy+ZTEti+gHyfcjaJ+bJ9wfYF5AvIF+QLyBeQLyBfkC8gX6BIvs4mMVu2L9i+gHwB+YJ8AfkC8gXkC/IF5AsUydfZJObK9gXbF5AvIF+QLyBfQL6AfEG+wDhR8ovmz/lLu/7yPGxfQL4gX0C+gHwB+YJ8AfkC8gX5AvIF5AvIF+QLyBeQL8gXkC8gX0C+IF9AvoB8Qb6AfAH5AvIF+QLyBeQLyBfkC/y6ml/PDbYvIF9AviBfQL6AfAH5gnwB+QLyBfkC8gXkC8gX5AvIF5AvyBeQLyBfQL4gX0C+gHxBvoB8AfkCr/wZAEfwkcLOQcf2AAAAAElFTkSuQmCC`;
    delectLocalImg.style.width = '20px';
    delectLocalImg.style.position = 'relative';
    delectLocalImg.style.top = '35px';
    delectLocalImg.style.left = '40px';
    deleteDiv.appendChild(delectLocalImg);
    localDiv.appendChild(deleteDiv);
    let helpLocal = document.createElement('div');
    helpLocal.style.fontSize = '14px';
    helpLocal.style.color = '#888888';
    helpLocal.style.position = 'absolute';
    helpLocal.style.top = '220px';
    helpLocal.style.left = '10px';
    mxUtils.write(helpLocal, mxResources.get('LocalImgHelp'));
    localDiv.appendChild(helpLocal);
    let fileInput = document.createElement('input');
    // fileInput.setAttribute('multiple', 'multiple');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('id', 'usr_image_file_input');
    fileInput.style.display = 'none';
    localDiv.appendChild(fileInput);
    mxEvent.addListener(localButton, 'click', mxUtils.bind(this, function (evt) {
        fileInput.click();
    }));
    localTemporaryDiv.addEventListener('mouseover', () => {
        console.log('mouseover---------------', temporaryImg.src);
        if (temporaryImg.src && temporaryImg.src.length > 0) {
            deleteDiv.style.display = 'block';
        }
    });
    deleteDiv.addEventListener('mouseout', () => {
        deleteDiv.style.display = 'none';
    });
    mxEvent.addListener(deleteDiv, 'click', mxUtils.bind(this, function (evt) {
        temporaryImg.removeAttribute('src');
        deleteDiv.style.display = 'none';
        localButton.style.display = 'block';
        fileInput.value = '';
    }));
    mxEvent.addListener(fileInput, 'change', function (evt) {
        var fileType = fileInput.files[0].type;
        if (fileInput.files[0].name.indexOf('.jfif') > -1) {
            alert(mxResources.get('ImageFormat'));
            return;
        }
        if (!('image/gif' === fileType || 'image/jpeg' === fileType || 'image/png' === fileType)) {
            alert(mxResources.get('ImageFormat'));
            return;
        }
        editorUi.importFiles(fileInput.files, 0, 0, editorUi.maxImageSize, function (data, mimeType, x, y, w, h) {
            localButton.style.display = 'none';
            temporaryImg.src = data;
            imagePath = data;
        }, null, function (file) {
            return file.type.startsWith('image/');
        }, function (queue) {
            for (let i = 0; i < queue.length; i++) queue[i]();
        }, !0, 1024 * 1024, null, null, !1);
    })
    div.appendChild(localDiv);
    let galleryDiv = document.createElement('div');
    galleryDiv.style.display = 'none';
    galleryDiv.style.marginTop = '10px';
    let galleryLeftDiv = document.createElement('div');
    galleryLeftDiv.style.width = '205px';
    galleryLeftDiv.style.height = '237px';
    galleryLeftDiv.style.cssFloat = 'left';
    galleryLeftDiv.style.marginLeft = '10px';
    galleryLeftDiv.style.overflowY = 'auto';
    galleryLeftDiv.style.border = 'solid 1px rgba(240, 240, 240, 1)';
    galleryDiv.appendChild(galleryLeftDiv);
    let galleryRightDiv = document.createElement('div');
    galleryRightDiv.style.width = '370px';
    galleryRightDiv.style.height = '237px';
    galleryRightDiv.style.overflowY = 'auto';
    galleryRightDiv.style.marginRight = '10px';
    galleryRightDiv.style.cssFloat = 'right';
    galleryRightDiv.style.border = 'solid 1px rgba(240, 240, 240, 1)';
    galleryDiv.appendChild(galleryRightDiv);
    let SiderbarImg = editorUi.sidebar.usrDialogImages;
    let galleryCheckUrl = '';
    let galleryCheckBoolean = !1;
    // editorUi.sidebar.addElectricalPalette(!1, 2);
    for (let p = 0; p < SiderbarImg.length; p++) {
        let strs = SiderbarImg[p].split(':');
        let SiderbarImgName = strs[0];
        let SiderbarImgPic = strs[1];
        let classifyDiv = document.createElement('div');
        classifyDiv.style.width = '185px';
        classifyDiv.style.height = '20px';
        classifyDiv.style.fontSize = '14px';
        classifyDiv.style.textAlign = 'left';
        classifyDiv.style.padding = '10px';
        classifyDiv.style.cursor = 'pointer';
        if ('' != SiderbarImgPic) {
            if (-1 === SiderbarImgPic.indexOf('addElectrical')) {
                classifyDiv.id = SiderbarImgPic;
            } else {
                classifyDiv.id = SiderbarImgName;
            }
        } else {
            classifyDiv.id = 'myCollection'
        }
        classifyDiv.className = 'imgSiderbarName';
        if (0 === p) {
            classifyDiv.style.backgroundColor = '#F2F2F2';
            classifyDiv.style.color = '#3C78FF';
        }
        /*if(editorUi.sidebar.palettes[SiderbarImgName]){
            mxUtils.write(classifyDiv, editorUi.sidebar.palettes[SiderbarImgName][0].innerText);
        }else{
            mxUtils.write(classifyDiv, mxResources.get(SiderbarImgName));
        }*/
        mxUtils.write(classifyDiv, SiderbarImgName);
        galleryLeftDiv.appendChild(classifyDiv);

        classifyDiv.onclick = (function (param) {
            var rightStrs = param.split(':');
            var rightImgName = rightStrs[0];
            var rightImgPic = rightStrs[1];
            return function () {
                const classDivs = document.getElementsByClassName('imgSiderbarName');
                for (let c = 0; c < classDivs.length; c++) {
                    classDivs[c].style.backgroundColor = '#ffffff';
                    classDivs[c].style.color = '#000000';
                }
                if (param.indexOf('addElectrical') > -1) {
                    if ('' != rightImgName && document.getElementById(rightImgName)) {
                        document.getElementById(rightImgName).style.backgroundColor = '#F2F2F2';
                        document.getElementById(rightImgName).style.color = '#3C78FF';
                    }
                } else {
                    if ('' != rightImgPic && document.getElementById(rightImgPic)) {
                        document.getElementById(rightImgPic).style.backgroundColor = '#F2F2F2';
                        document.getElementById(rightImgPic).style.color = '#3C78FF';
                    } else {
                        if (document.getElementById('myCollection')) {
                            document.getElementById('myCollection').style.backgroundColor = '#F2F2F2';
                            document.getElementById('myCollection').style.color = '#3C78FF';
                        }
                    }
                }
                galleryRightDiv.innerHTML = '';
                let rightDiv = document.createElement('div');
                rightDiv.style.width = '100%';
                rightDiv.style.height = '100%';
                if ('' != rightImgPic) {
                    if (param.indexOf('addElectrical') > -1) {
                        editorUi.sidebar[rightImgPic](!0, 2, rightImgName);
                    } else {
                        editorUi.sidebar[rightImgPic](!0, 2);
                    }
                }
                let palettes = param.indexOf('addElectrical') > -1 ? editorUi.sidebar.palettes['electrical' + rightImgName] : editorUi.sidebar.palettes[rightImgName];
                let childNodes = palettes && palettes.length > 1 ? palettes[1].childNodes[0].childNodes : [];
                let imageArr = [];
                if (param.indexOf('addElectrical') > -1) {
                    for (let i = 0; i < childNodes.length; i++) {
                        let imgHTML = childNodes[i].cloneNode(!0);
                        imgHTML.className = imgHTML.className + ' usrImg usrElectricalSvg';
                        imgHTML.childNodes[0].setAttribute('svgInd', i);
                        rightDiv.appendChild(imgHTML);
                        mxEvent.addListener(imgHTML, 'click', function (e) {
                            console.log('imgHTML-------------');
                            $('.usrImg').removeClass('usrImgClick');
                            $(e.currentTarget).addClass('usrImgClick');
                            galleryCheckBoolean = !0;
                            galleryCheckUrl = e.currentTarget.getAttribute('dataStyle');
                            editorUi.spinner.stop();
                        });
                    }
                } else {
                    mxUtils.forEach(childNodes, function (item) {
                        let image = item.querySelector('image');
                        if (image) {
                            let imageUrl = image.getAttribute('xlink:href');
                            let protocols = document.location.protocol;
                            imageUrl = imageUrl.replace(protocols + '://' + window.location.host + '/', '');
                            imageArr.push(imageUrl);
                        }
                    });
                    for (let i = 0; i < imageArr.length; i++) {
                        let item = imageArr[i];
                        let imga = document.createElement('a');
                        imga.className = 'usrImg';
                        imga.style.cssText = 'width: 80px;height: 80px;';
                        let img = document.createElement('img');
                        img.setAttribute('ind', i);
                        img.src = item;
                        img.style.cssText = 'width:70px;max-height:70px;display:inline-block;margin: 5px;';
                        imga.appendChild(img);
                        rightDiv.appendChild(imga);
                        mxEvent.addListener(imga, 'click', function (e) {
                            $('.usrImg img').removeClass('usrImgClick');
                            $(e.currentTarget.childNodes[0]).addClass('usrImgClick');
                            if ('' != rightImgPic) {
                                let imgSrc = e.currentTarget.childNodes[0].getAttribute('src');
                                galleryCheckBoolean = !0;
                                galleryCheckUrl = imgSrc;
                                editorUi.spinner.stop();
                            } else {
                                let ind = e.target.getAttribute('ind');
                                let imageIds = localStorage.getItem('imageIdArray').replace('[', '').replace(']', '').split(',');
                                editorUi.spinner.spin(document.body, mxResources.get('inserting'));
                                applyBtn.style.pointerEvents = 'none';
                            }
                        });
                    }
                }
                galleryRightDiv.appendChild(rightDiv);
            };
        })(SiderbarImg[p]);
        0 === p && classifyDiv.click();
    }
    div.appendChild(galleryDiv);
    let inner = document.createElement('div');
    inner.className = 'geTitle';
    inner.style.backgroundColor = 'transparent';
    inner.style.borderColor = 'transparent';
    inner.style.whiteSpace = 'nowrap';
    inner.style.textOverflow = 'clip';
    inner.style.cursor = 'default';
    if (mxClient.IS_VML) {
        inner.style.paddingRight = '20px';
    }
    let btns = document.createElement('div');
    btns.style.marginTop = mxClient.IS_QUIRKS ? '22px' : '14px';
    btns.style.position = 'absolute';
    btns.style.bottom = '10px';
    btns.style.right = '30px';
    let cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.spinner.stop();
        editorUi.hideDialog();
    });
    cancelBtn.className = 'geBtn';
    if (editorUi.editor.cancelFirst) {
        btns.appendChild(cancelBtn);
    }
    let applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        if (localImg.checked) {
            (function (newValue, resize) {
                if (null != newValue) {
                    let geo = ignoreExisting ? null : graph.getModel().getGeometry(graph.getSelectionCell());
                    if (null != geo) {
                        insertImage(newValue, geo.width, geo.height, resize);
                    } else {
                        insertImage(newValue, null, null, resize);
                    }
                } else {
                    editorUi.hideDialog();
                    fn(null);
                }
            })(imagePath);
        }
        if (galleryImg.checked) {
            let origin = window.location.origin;
            galleryCheckUrl = galleryCheckUrl.indexOf(origin) == 0 ? galleryCheckUrl.replace(origin, '') : galleryCheckUrl;
            insertImage(galleryCheckUrl, null, null, null, galleryCheckBoolean);
        }
    });
    applyBtn.className = 'geBtn gePrimaryBtn';
    btns.appendChild(applyBtn);
    mxEvent.addListener(
        localImg,
        'click',
        mxUtils.bind(this, function (evt) {
            localDiv.style.display = 'block';
            galleryDiv.style.display = 'none';
        })
    );
    mxEvent.addListener(
        galleryImg,
        'click',
        mxUtils.bind(this, function (evt) {
            localDiv.style.display = 'none';
            galleryDiv.style.display = 'block';
        })
    );
    let hr2 = document.createElement('hr');
    hr2.style.height = '1px';
    hr2.style.width = '600px';
    hr2.style.border = 'none';
    hr2.style.position = 'absolute';
    hr2.style.bottom = '52px';
    hr2.style.backgroundColor = '#e6e6e6';
    div.appendChild(hr2);
    div.appendChild(btns);
    this.container = div;
}

function CustomDialog(editorUi, content, okFn, cancelFn, okButtonText, helpLink, buttonsContent, hideCancel, cancelButtonText, isNoBtns, isOkShow) {
    var div = document.createElement('div');
    div.appendChild(content);
    var hr = document.createElement('hr');
    (hr.style.position = 'absolute'), (hr.style.bottom = '52px'), (hr.style.backgroundColor = '#DEDEE3'), (hr.style.height = '1px'), (hr.style.width = '100%'), (hr.style.border = 'none'), div.appendChild(hr);
    var btns = document.createElement('div');
    (btns.style.marginTop = '16px'), (btns.style.marginRight = '14px'), (btns.style.position = 'absolute'), (btns.style.right = '0px'), (btns.style.bottom = '10px'), null != buttonsContent && btns.appendChild(buttonsContent);
    var cancelBtn = mxUtils.button(cancelButtonText || mxResources.get('cancel'), function () {
        cancelButtonText || editorUi.hideDialog(), null != cancelFn && cancelFn();
    });
    if (((cancelBtn.className = 'geBtn usrTableCancelButton'), hideCancel && (cancelBtn.style.display = 'none'), editorUi.editor.cancelFirst && btns.appendChild(cancelBtn), !editorUi.isOffline() && null != helpLink)) {
        var helpBtn = mxUtils.button(mxResources.get('help'), function () {
            editorUi.openLink(helpLink);
        });
        (helpBtn.className = 'geBtn'), btns.appendChild(helpBtn);
    }
    var okBtn = mxUtils.button(okButtonText || mxResources.get('ok'), function () {
        isOkShow || editorUi.hideDialog(), null != okFn && okFn();
    });
    btns.appendChild(okBtn), (okBtn.className = 'geBtn gePrimaryBtn usrTableOkButton'), editorUi.editor.cancelFirst || btns.appendChild(cancelBtn), isNoBtns || div.appendChild(btns), (this.cancelBtn = cancelBtn), (this.okButton = okBtn), (this.container = div);
};

function ConfirmDialog(editorUi, message, okFn, cancelFn, okLabel, cancelLabel, okImg, cancelImg, showRememberOption) {
    var div = document.createElement('div');
    (div.style.textAlign = 'center'), ((p2 = document.createElement('div')).style.padding = '6px'), (p2.style.overflow = 'auto'), (p2.style.maxHeight = '44px'), mxClient.IS_QUIRKS && (p2.style.height = '60px'), mxUtils.write(p2, message), div.appendChild(p2);
    var btns = document.createElement('div');
    (btns.style.textAlign = 'center'), (btns.style.whiteSpace = 'nowrap');
    var cb = document.createElement('input');
    cb.setAttribute('type', 'checkbox');
    var cancelBtn = mxUtils.button(cancelLabel || mxResources.get('cancel'), function () {
        editorUi.hideDialog(), null != cancelFn && cancelFn(cb.checked);
    });
    (cancelBtn.className = 'geBtn'), null != cancelImg && ((cancelBtn.innerHTML = cancelImg + '<br>' + cancelBtn.innerHTML), (cancelBtn.style.paddingBottom = '8px'), (cancelBtn.style.paddingTop = '8px'), (cancelBtn.style.height = 'auto'), (cancelBtn.style.width = '40%')), editorUi.editor.cancelFirst && btns.appendChild(cancelBtn);
    var okBtn = mxUtils.button(okLabel || mxResources.get('ok'), function () {
        editorUi.hideDialog(), null != okFn && okFn(cb.checked);
    });
    if ((btns.appendChild(okBtn), null != okImg ? ((okBtn.innerHTML = okImg + '<br>' + okBtn.innerHTML + '<br>'), (okBtn.style.paddingBottom = '8px'), (okBtn.style.paddingTop = '8px'), (okBtn.style.height = 'auto'), (okBtn.className = 'geBtn'), (okBtn.style.width = '40%')) : (okBtn.className = 'geBtn gePrimaryBtn'), editorUi.editor.cancelFirst || btns.appendChild(cancelBtn), div.appendChild(btns), showRememberOption)) {
        var p2;
        (btns.style.marginTop = '10px'), ((p2 = document.createElement('p')).style.marginTop = '20px'), p2.appendChild(cb);
        var span = document.createElement('span');
        mxUtils.write(span, ' ' + mxResources.get('rememberThisSetting')),
            p2.appendChild(span),
            div.appendChild(p2),
            mxEvent.addListener(span, 'click', function (evt) {
                (cb.checked = !cb.checked), mxEvent.consume(evt);
            });
    } else btns.style.marginTop = '16px';
    this.container = div;
};

function StorageDialog(editorUi, fn, rowLimit) {
    rowLimit = null != rowLimit ? rowLimit : 2;
    var div = document.createElement('div');
    (div.style.textAlign = 'center'), (div.style.whiteSpace = 'nowrap'), (div.style.paddingTop = '0px'), (div.style.paddingBottom = '20px');
    var elt = editorUi.addLanguageMenu(div, !0);
    if ((null != elt && (elt.style.bottom = parseInt('28px') - 2 + 'px'), !editorUi.isOffline() && editorUi.getServiceCount() > 1)) {
        var help = document.createElement('a');
        help.setAttribute('href', 'https://about.draw.io/support/'), help.setAttribute('title', mxResources.get('help')), help.setAttribute('target', '_blank'), (help.style.position = 'absolute'), (help.style.textDecoration = 'none'), (help.style.cursor = 'pointer'), (help.style.fontSize = '12px'), (help.style.bottom = '28px'), (help.style.left = '26px'), (help.style.color = 'gray');
        var icon = document.createElement('img');
        icon.setAttribute('border', '0'), icon.setAttribute('valign', 'bottom'), icon.setAttribute('src', Editor.helpImage), (icon.style.marginRight = '2px'), help.appendChild(icon), mxUtils.write(help, mxResources.get('help')), div.appendChild(help);
    }
    var demo = document.createElement('div');
    (demo.style.position = 'absolute'),
        (demo.style.cursor = 'pointer'),
        (demo.style.fontSize = '12px'),
        (demo.style.bottom = '28px'),
        (demo.style.color = 'gray'),
        mxUtils.write(demo, mxResources.get('decideLater')),
        editorUi.isOfflineApp() ? (demo.style.right = '20px') : (mxUtils.setPrefixedStyle(demo.style, 'transform', 'translate(-50%,0)'), (demo.style.left = '50%')),
        (this.init = function () {
            (mxClient.IS_QUIRKS || 8 == document.documentMode) && (demo.style.marginLeft = -Math.round(demo.clientWidth / 2) + 'px');
        }),
        div.appendChild(demo),
        mxEvent.addListener(demo, 'click', function () {
            editorUi.hideDialog();
            var prev = Editor.useLocalStorage;
            editorUi.createFile(editorUi.defaultFilename, null, null, null, null, null, null, !0), (Editor.useLocalStorage = prev);
        });
    var buttons = document.createElement('div');
    mxClient.IS_QUIRKS && ((buttons.style.whiteSpace = 'nowrap'), (buttons.style.cssFloat = 'left')), (buttons.style.border = '1px solid #d3d3d3'), (buttons.style.borderWidth = '1px 0px 1px 0px'), (buttons.style.padding = '12px 0px 12px 0px');
    var cb = document.createElement('input');
    cb.setAttribute('type', 'checkbox'), cb.setAttribute('checked', 'checked'), (cb.defaultChecked = !0);
    var p3 = document.createElement('p');
    var hd = document.createElement('p');
    (hd.style.fontSize = '16pt'), (hd.style.padding = '0px'), (hd.style.paddingTop = '4px'), (hd.style.paddingBottom = '16px'), (hd.style.margin = '0px'), (hd.style.color = 'gray'), mxUtils.write(hd, mxResources.get('saveDiagramsTo') + ':'), div.appendChild(hd), div.appendChild(buttons);
    var p2 = document.createElement('p');
    (p2.style.marginTop = '12px'), (p2.style.marginBottom = '6px'), p2.appendChild(cb);
    var span = document.createElement('span');
    if (((span.style.color = 'gray'), (span.style.fontSize = '12px'), mxUtils.write(span, ' ' + mxResources.get('rememberThisSetting')), p2.appendChild(span), mxUtils.br(p2), (p2.style.marginTop = '20px'), (buttons.style.padding = '30px 0px 26px 0px'), Graph.fileSupport && !mxClient.IS_IE && !mxClient.IS_IE11)) {
        var link = document.createElement('div');
        (link.style.cursor = 'pointer'),
            (link.style.padding = '18px 0px 6px 0px'),
            (link.style.fontSize = '12px'),
            (link.style.color = 'gray'),
            mxUtils.write(link, mxResources.get('import') + ': ' + mxResources.get('gliffy') + ', ' + mxResources.get('formatVssx') + ', ' + mxResources.get('formatVsdx') + ', ' + mxResources.get('lucidchart') + '...'),
            mxEvent.addListener(link, 'click', function () {
                var input = document.createElement('input');
                input.setAttribute('type', 'file'),
                    mxEvent.addListener(input, 'change', function () {
                        null != input.files && (editorUi.hideDialog(), editorUi.openFiles(input.files, !0));
                    }),
                    input.click();
            }),
            p2.appendChild(link),
            (buttons.style.paddingBottom = '4px');
    }
    buttons.appendChild(p2),
        mxEvent.addListener(span, 'click', function (evt) {
            (cb.checked = !cb.checked), mxEvent.consume(evt);
        }),
    mxClient.IS_SVG &&
    isLocalStorage &&
    (null == document.documentMode || document.documentMode >= 10) &&
    window.setTimeout(function () {
        null == editorUi.drive && ((p3.style.padding = '8px'), (p3.style.fontSize = '9pt'), (p3.style.marginTop = '-14px'), (p3.innerHTML = '<a style="background-color:#dcdcdc;padding:5px;color:black;text-decoration:none;" href="https://plus.google.com/u/0/+DrawIo1/posts/1HTrfsb5wDN" target="_blank"><img border="0" src="' + mxGraph.prototype.warningImage.src + '" align="top"> ' + mxResources.get('googleDriveMissingClickHere') + '</a>'), div.appendChild(p3));
    }, 5e3),
        (this.container = div);
};



