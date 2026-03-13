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
    mxEdgeHandler,
    mxClipboard,
    mxCodec,
    mxEventSource, mxCell, mxGeometry, mxGraphModel
} from '../core/mxgraph';

import { Editor, FilenameDialog } from './Editor';
import { LayersWindow, OutlineWindow, ConnectionPointsDialog, EditGeometryDialog, ConfirmDialog } from './Dialogs';
import { ChangePageSetup } from './EditorUi';
import usrUtils from './utils/usrUtils';
import api from './utils/api';
import ControlPanelSaveDialog from './dialogs/ControlPanelSaveDialog';

// Don't export FilenameDialog anymore or keep it if used elsewhere.
// It is imported from Editor, so we don't export it here anyway.
export { Actions, Action };

/**
 * Copyright (c) 2006-2020, JGraph Ltd
 * Copyright (c) 2006-2020, draw.io AG
 *
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi) {
    this.editorUi = editorUi;
    this.actions = new Object();
    this.init();
}

/**
 * Adds the default actions.
 */
Actions.prototype.init = function () {
    const ui = this.editorUi;
    const editor = ui.editor;
    const graph = editor.graph;


    function clearPanelIdentity(cells) {
        if (cells != null && cells.length > 0) {
            graph.getModel().beginUpdate();
            try {
                for (var i = 0; i < cells.length; i++) {
                    var cell = cells[i];
                    var style = graph.getCellStyle(cell);
                    if (mxUtils.getValue(style, 'ctrlPanel', '0') == '1') {
                        graph.setCellStyles('panelId', null, [cell]);
                        graph.setCellStyles('remotePanelId', null, [cell]);
                        graph.setCellStyles('originalPanelName', null, [cell]);
                        graph.setCellStyles('panelSource', null, [cell]);
                    }
                }
            } finally {
                graph.getModel().endUpdate();
            }
        }
    }

    function saveScada(callback) {
        var fileData = ui.getFileData(true);
        var fileNode = document.createElement('mxfile');
        let pr = mxUtils.parseXml(fileData);
        var diagrams = pr.childNodes[0];
        diagrams = mxUtils.parseXml(diagrams.innerHTML);
        var contentList = [];
        for (let i = 0; i < diagrams.length; i++) {
            var tempFileNode = fileNode.cloneNode(!0),
                tempDiagram = diagrams[i].cloneNode(!0);
            tempFileNode.appendChild(tempDiagram),
                contentList.push({
                    id: diagrams[i].getAttribute('usrId'),
                    content: mxUtils.getXml(tempFileNode),
                });
        }
        ui.editor.setStatus(mxUtils.htmlEntities(mxResources.get('allChangesSaved')));
        callback && callback();
    }

    const isGraphEnabled = function () {
        return Action.prototype.isEnabled.apply(this, arguments) && graph.isEnabled();
    };
    this.addAction('preview', function () {
        ui.saveFile(true, true);
    });
    this.addAction('pointSet', function () {
        ui.showPointSetDialog();
    }, null, null, Editor.ctrlKey + '+shifts+D');
    this.addAction(
        'saveContent',
        function () {
            ui.saveFile(false, true);
        },
        null,
        null
    ).isEnabled = isGraphEnabled;
    this.addAction(
        'save',
        function () {
            ui.saveFile(false, true);
        },
        null,
        null,
        Editor.ctrlKey + '+S'
    ).isEnabled = isGraphEnabled;
    // - File actions
    this.addAction('image', function () {
        if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
            var title = mxResources.get('image') + ' (' + mxResources.get('url') + '):';
            var state = graph.getView().getState(graph.getSelectionCell());
            var value = '';
            null != state && (value = state.style[mxConstants.STYLE_IMAGE] || value);
            var selectionState = graph.cellEditor.saveSelection();
            ui.showImageDialog(title, value, function (newValue, w, h, clipPath, cW, cH) {
                if (mxUtils.isNullOrUndefined(w)) w = 100;
                if (mxUtils.isNullOrUndefined(h)) w = 100;
                if (newValue) {
                    let select = null;
                    graph.getModel().beginUpdate();
                    try {
                        const style = `shape=mxgraph.rc.singleImage;igDprop=commonStrokeColor;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;title=自定义图片;imgUrl=${newValue};opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
                        let cells = [graph.insertVertex(graph.getDefaultParent(), mxUtils.uuid(), null, 0, 0, w, h, style)];
                        let pt = graph.getCenterInsertPoint(graph.getBoundingBoxFromGeometry(cells, true));
                        cells[0].geometry.x = pt.x;
                        cells[0].geometry.y = pt.y;
                        select = cells;
                        graph.fireEvent(new mxEventObject('cellsInserted', 'cells', select));
                    } catch (e) {
                        console.log('----------', e);
                    } finally {
                        graph.getModel().endUpdate();
                    }
                    if (select != null) {
                        graph.setSelectionCells(select);
                        graph.scrollCellToVisible(select[0]);
                    }
                }
            }, graph.cellEditor.isContentEditing(), !graph.cellEditor.isContentEditing());
        }
    }).isEnabled = isGraphEnabled;
    this.addAction(
        'undo',
        function () {
            ui.undo();
        },
        null,
        'sprite-undo',
        Editor.ctrlKey + '+Z'
    );
    this.addAction(
        'redo',
        function () {
            ui.redo();
        },
        null,
        'sprite-redo',
        !mxClient.IS_WIN ? Editor.ctrlKey + '+Shift+Z' : Editor.ctrlKey + '+Y'
    );
    this.addAction(
        'cut',
        function () {
            mxClipboard.cut(graph);
        },
        null,
        'sprite-cut',
        Editor.ctrlKey + '+X'
    );
    this.addAction('saveAsControlPanel', function () {
        if (graph.isSelectionEmpty()) return;

        var cell = graph.getSelectionCell();
        var style = graph.getCellStyle(cell);
        var panelId = mxUtils.getValue(style, 'panelId', null);
        var remotePanelId = mxUtils.getValue(style, 'remotePanelId', null);

        var panelSource = mxUtils.getValue(style, 'panelSource', null);

        // 如果缺失来源则进行推断（用于向后兼容）
        var isLocal = false;
        if (panelId) {
            try {
                var panels = JSON.parse(localStorage.getItem('rc_control_panels') || '[]');
                if (panels.find(function (p) { return p.id == panelId; })) isLocal = true;
            } catch (e) { }
        }
        if (!panelSource) {
            if (isLocal) panelSource = 'local';
            else if (remotePanelId) panelSource = 'remote';
        }

        var originalPanelName = mxUtils.getValue(style, 'originalPanelName', null);
        var currentName = originalPanelName || cell.value || '已存控制面板';
        if (typeof currentName !== 'string') currentName = '';

        var refreshSidebar = function () {
            if (ui.sidebar) {
                var palette = ui.sidebar.palettes['storedControlPanel'];
                if (palette && palette[1] && palette[1].firstChild) {
                    ui.sidebar.refreshStoredControlPanels(palette[1].firstChild);
                }
            }
        };

        var doSave = function (name, id, type) {
            var cells = graph.getSelectionCells();
            var clones = graph.cloneCells(cells);

            // Wrap clones in a temporary graph model to ensure correct Structure (Root -> Layer -> Cells)
            var tempModel = new mxGraphModel();
            var parent = tempModel.getChildAt(tempModel.getRoot(), 0);

            for (var i = 0; i < clones.length; i++) {
                tempModel.add(parent, clones[i]);
            }

            var xml = mxUtils.getXml(new mxCodec().encode(tempModel));

            var params = {
                name: name,
                content: xml,
                type: 'controlPanel'
            };

            // 使用 panelId 作为旧 ID（现在它在本地和远程都适用，因为我们在扩展中同步了它）
            var oldId = panelId;

            // 删除旧面板的函数（返回 Promise，不在内部刷新）
            // 仅在以下情况删除：
            // 1. 我们有一个旧 ID
            // 2. 我们保存到相同的来源类型（例如：远程 -> 远程重命名）
            // 3. 新 ID 与旧 ID 不同（重命名/覆盖其他）
            var deleteOldPanel = function () {
                return new Promise(function (resolve) {
                    if (!oldId) { resolve(); return; }
                    // 检查来源是否匹配目标类型（如果保存到远程，不要删除本地文件）
                    if (panelSource !== type) { resolve(); return; }

                    if (id && String(id) == String(oldId)) { resolve(); return; }

                    console.log('尝试删除旧面板:', oldId, '当前 ID:', id, '来源:', panelSource, '类型:', type);

                    if (type === 'remote') {
                        api.deleteControlPanelRemote({ id: oldId }).then(function (delRes) {
                            console.log('Deleted old remote panel:', oldId);
                            resolve();
                        }).catch(function () { resolve(); });
                    } else {
                        api.deleteControlPanel(oldId).then(function (delRes) {
                            console.log('Deleted old local panel:', oldId);
                            resolve();
                        }).catch(function () { resolve(); });
                    }
                });
            };

            if (type === 'remote') {
                var getQueryParam = function (name) {
                    var reg = new RegExp('(^|&|\\?)' + name + '=([^&]*)(&|$)');
                    var r = window.location.search.substr(1).match(reg);
                    if (r != null) return unescape(r[2]);
                    var hash = window.location.hash;
                    var qIndex = hash.indexOf('?');
                    if (qIndex > -1) {
                        r = hash.substring(qIndex + 1).match(reg);
                        if (r != null) return unescape(r[2]);
                    }
                    return null;
                };
                var scadaId = getQueryParam('scadaId') || getQueryParam('id') || getQueryParam('deviceId');
                if (scadaId) {
                    params.scadaId = scadaId;
                    if (id) {
                        params.id = id;
                        // 远程 panelId 通常与 id 相同（如果是更新），
                        // 但如果我们覆盖不同的文件，则传递该文件的 ID。
                        // 等等，后端可能需要 params.panelId 字段用于验证？
                        // 假设后端使用 params.id 作为主键进行更新。
                        // 如果我们覆盖 `id`，除非后端要求，否则我们不需要严格区分 `panelId` 字段。
                        // 如果按照惯例，将 `id` 作为 `panelId` 传递也是安全的。
                        params.panelId = id;
                    }

                    api.saveControlPanelRemote(params).then(res => {
                        // Request interceptor unwraps response.data, so check res.code directly
                        if (res && res.code === 200) {
                            graph.removeCells(cells);
                            ui.editor.setStatus(id ? '控制面板已更新 (后端)' : '控制面板已保存 (后端)');
                            // 先删除旧面板，再刷新列表
                            deleteOldPanel().then(function () {
                                refreshSidebar();
                            });
                        } else {
                            mxUtils.alert((res && res.message) || '后端保存失败');
                        }
                    });
                } else {
                    mxUtils.alert('无法获取 Scada ID，请检查 URL 参数');
                }
            } else {
                if (id) params.id = id;
                api.saveControlPanel(params).then(res => {
                    if (res.data.code === 200) {
                        graph.removeCells(cells);
                        ui.editor.setStatus(id ? '控制面板已更新' : '控制面板已保存');
                        // 先删除旧面板，再刷新列表
                        deleteOldPanel().then(function () {
                            refreshSidebar();
                        });
                    }
                });
            }
        };

        var loadLocalPanels = function () {
            try {
                return JSON.parse(localStorage.getItem('rc_control_panels') || '[]');
            } catch (e) { return []; }
        };

        var checkNameConflict = function (name, type, callback) {
            if (type === 'remote') {
                var getQueryParam = function (name) {
                    var reg = new RegExp('(^|&|\\?)' + name + '=([^&]*)(&|$)');
                    var r = window.location.search.substr(1).match(reg);
                    if (r != null) return unescape(r[2]);
                    var hash = window.location.hash;
                    var qIndex = hash.indexOf('?');
                    if (qIndex > -1) {
                        r = hash.substring(qIndex + 1).match(reg);
                        if (r != null) return unescape(r[2]);
                    }
                    return null;
                };
                var scadaId = getQueryParam('scadaId') || getQueryParam('id') || getQueryParam('deviceId');

                if (!scadaId) {
                    callback(false, null, []);
                    return;
                }

                api.getControlPanelListRemote({ pageNo: 1, pageSize: 1000, scadaId: scadaId }).then(res => {
                    var list = [];
                    if (res && (res.code === 200 || res.success)) {
                        if (res.result && Array.isArray(res.result.records)) {
                            list = res.result.records;
                        } else if (res.result && Array.isArray(res.result)) {
                            list = res.result;
                        } else if (Array.isArray(res)) {
                            list = res;
                        }
                    }
                    // 检查严格的名称匹配（符合用户预期：即使是自身也总是显示选项）
                    var duplicate = list.find(p => p.name === name);
                    if (duplicate) {
                        callback(true, duplicate, list);
                    } else {
                        callback(false, null, list);
                    }
                }).catch(err => {
                    console.error("Failed to check remote duplicates", err);
                    callback(false, null, []);
                });

            } else {
                // Local check
                var panels = loadLocalPanels();
                var duplicate = panels.find(p => p.name === name);
                if (duplicate) {
                    callback(true, duplicate, panels);
                } else {
                    callback(false, null, panels);
                }
            }
        };




        var dlg = new ControlPanelSaveDialog(ui, currentName, mxResources.get('save'), function (name, type) {
            if (name != null && name.length > 0) {

                checkNameConflict(name, type, function (hasConflict, conflictingPanel, allPanels) {
                    if (hasConflict) {
                        // Import dynamically to avoid top-level dependency issues if needed, or assume global/bundled.
                        // Assuming new file is propertly imported/available.
                        // For now we use the global mechanism or ensure import in header.
                        // Since I cannot easily add top-level imports in this specific tool block without reading whole file,
                        // I will assume the user or build system handles it, OR I will rely on `require` if available, 
                        // BUT standard ES6 import is top-level. 
                        // **Plan B**: I should add the import to Actions.js at the top first? 
                        // Wait, I can't do two edits in one Block unless I do multi-replace.
                        // Let's assume I will add the import in a separate step or `require` it.
                        // Actually, I can use a generic dialog approach or the new class.

                        import('./dialogs/NameConflictDialog').then(module => {
                            var NameConflictDialog = module.NameConflictDialog;
                            var conflictDlg = new NameConflictDialog(
                                ui,
                                '控制面板名称 "' + name + '" 已存在，请选择操作：',
                                function () { // 自动重命名
                                    // 生成唯一名称：name(1), name(2) 等
                                    var newName = name;
                                    var counter = 1;
                                    var exists = true;

                                    // 检查完整列表中是否存在的辅助函数
                                    var checkExists = function (n) {
                                        return allPanels && allPanels.some(p => p.name === n);
                                    };

                                    while (exists) {
                                        newName = name + '(' + counter + ')';
                                        if (!checkExists(newName)) {
                                            exists = false;
                                        } else {
                                            counter++;
                                        }
                                    }
                                    // 另存为新文件
                                    doSave(newName, null, type);
                                },
                                function () { // 替换（覆盖）
                                    // 对于覆盖，我们需要目标 ID 作为冲突的 ID
                                    // 但是，对于远程，我们可能需要更多信息。
                                    // 如果我们将新名称“另存为”冲突的名称，“覆盖”意味着接管现有的位置。
                                    // 所以我们将 conflictingPanel.id 作为目标 ID 传递。

                                    // 但是，安全检查：如果我们正在编辑面板 A，并将其重命名为面板 B（已存在），
                                    // 并选择覆盖，面板 A 仍然存在（作为什么？脏数据？）而面板 B 被 A 的内容覆盖。
                                    // “保存”的逻辑流程是：
                                    var targetId = conflictingPanel.id;
                                    // 如果是远程，如果更新严格需要，我们还需要它的 panelId 引用？
                                    // doSave 函数处理 `id` 参数。

                                    // “替换”的正确逻辑：
                                    // 我们将当前内容保存到 `targetId`。
                                    doSave(name, targetId, type);
                                },
                                function () { // 取消
                                    // 什么也不做，关闭对话框。
                                }
                            );
                            ui.showDialog(conflictDlg.container, 340, 100, true, true);
                        });

                    } else {
                        // No conflict, proceed as normal
                        var targetId = null;
                        if (panelId) {
                            if (type === 'local' && isLocal) targetId = panelId;
                            if (type === 'remote' && !isLocal) targetId = panelId;
                        }

                        // Use existing confirm logic only if we are overwriting OURSELVES (same ID), 
                        // which is implicit update.
                        // The duplicate check handles cross-collisions. 
                        // If targetId is set (we are updating current panel), do we still confirm?
                        // User asked for "Filename repeat" check only.
                        // The previous logic had a confirmation for ANY targetId.
                        // Let's keep that for self-update safety? Or does the new requirement replace it?
                        // Requirement: "Save local/backend, if filename repeat -> Option: Overwrite, Rename, Cancel"

                        // If we are just updating the current panel (same name, same ID), it's not a "Repeat" with *another* file, it's just a Save.
                        // Usually Save (Update) doesn't ask for generic overwrite confirmation unless "Save As".

                        if (targetId) {
                            // This is a direct update of the current panel. 
                            // We can probably skip the confirmation or keep the simple one?
                            // Let's keep the simple ConfirmDialog for direct updates to be safe, 
                            // OR, if the user implies "conflict with OTHERS", we don't need this for self.
                            // But let's stick to existing safe logic + new conflict logic.

                            // Actually, if name matches self, checkNameConflict returns false.
                            // So we land here.
                            var confirmDlg = new ConfirmDialog(
                                ui,
                                '确定更新当前控制面板吗？',
                                function () {
                                    doSave(name, targetId, type);
                                }
                            );
                            ui.showDialog(confirmDlg.container, 300, 80, true, true);
                        } else {
                            doSave(name, null, type);
                        }
                    } // end else
                });
            }
        });
        ui.showDialog(dlg.container, 340, 160, true, true);

    }).isEnabled = isGraphEnabled;
    this.addAction(
        'copy',
        function () {
            try {
                mxClipboard.copy(graph);
            } catch (e) {
                ui.handleError(e);
            }
        },
        null,
        'sprite-copy',
        Editor.ctrlKey + '+C'
    );
    this.addAction(
        'paste',
        function () {
            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
                var cells = mxClipboard.paste(graph);
                clearPanelIdentity(cells);
            }
        },
        false,
        'sprite-paste',
        Editor.ctrlKey + '+V'
    );
    this.addAction(
        'leftAlign',
        function () {
            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
                graph.alignCells(mxConstants.ALIGN_LEFT);
            }
        },
        false,
        'sprite-leftAlign'
    );
    this.addAction(
        'rightAlign',
        function () {
            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
                graph.alignCells(mxConstants.ALIGN_RIGHT);
            }
        },
        false,
        'sprite-rightAlign'
    );
    this.addAction(
        'hCenterAlign',
        function () {
            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
                graph.alignCells(mxConstants.ALIGN_CENTER);
            }
        },
        false,
        'sprite-hCenterAlign'
    );
    this.addAction(
        'topAlign',
        function () {
            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
                graph.alignCells(mxConstants.ALIGN_TOP);
            }
        },
        false,
        'sprite-topAlign'
    );
    this.addAction(
        'bottomAlign',
        function () {
            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
                graph.alignCells(mxConstants.ALIGN_BOTTOM);
            }
        },
        false,
        'sprite-bottomAlign'
    );
    this.addAction(
        'vCenterAlign',
        function () {
            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
                graph.alignCells(mxConstants.ALIGN_MIDDLE);
            }
        },
        false,
        'sprite-vCenterAlign'
    );
    this.addAction('pasteHere', function () {
        if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
            graph.getModel().beginUpdate();
            try {
                const cells = mxClipboard.paste(graph);
                clearPanelIdentity(cells);

                if (cells != null) {
                    let includeEdges = true;

                    for (let i = 0; i < cells.length && includeEdges; i++) {
                        includeEdges = includeEdges && graph.model.isEdge(cells[i]);
                    }

                    const t = graph.view.translate;
                    const s = graph.view.scale;
                    const dx = t.x;
                    const dy = t.y;
                    let bb = null;

                    if (cells.length == 1 && includeEdges) {
                        const geo = graph.getCellGeometry(cells[0]);

                        if (geo != null) {
                            bb = geo.getTerminalPoint(true);
                        }
                    }

                    bb = bb != null ? bb : graph.getBoundingBoxFromGeometry(cells, includeEdges);

                    if (bb != null) {
                        const x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
                        const y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

                        graph.cellsMoved(cells, x - bb.x, y - bb.y);
                    }
                }
            } finally {
                graph.getModel().endUpdate();
            }
        }
    });

    this.addAction(
        'copySize',
        function () {
            const cell = graph.getSelectionCell();

            if (graph.isEnabled() && cell != null && graph.getModel().isVertex(cell)) {
                const geo = graph.getCellGeometry(cell);

                if (geo != null) {
                    ui.copiedSize = new mxRectangle(geo.x, geo.y, geo.width, geo.height);
                }
            }
        },
        null,
        null,
        'Alt+Shift+X'
    );

    this.addAction(
        'pasteSize',
        function () {
            if (graph.isEnabled() && !graph.isSelectionEmpty() && ui.copiedSize != null) {
                graph.getModel().beginUpdate();

                try {
                    const cells = graph.getSelectionCells();

                    for (let i = 0; i < cells.length; i++) {
                        if (graph.getModel().isVertex(cells[i])) {
                            let geo = graph.getCellGeometry(cells[i]);

                            if (geo != null) {
                                geo = geo.clone();
                                geo.width = ui.copiedSize.width;
                                geo.height = ui.copiedSize.height;

                                graph.getModel().setGeometry(cells[i], geo);
                            }
                        }
                    }
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        },
        null,
        null,
        'Alt+Shift+V'
    );

    this.addAction(
        'copyStyle',
        function () {
            graph.isEnabled() && !graph.isSelectionEmpty() && (ui.copiedStyle = graph.copyStyle(graph.getSelectionCell()));
        },
        null,
        null,
        'Alt+C'
    );
    this.addAction(
        'pasteStyle',
        function () {
            graph.isEnabled() && !graph.isSelectionEmpty() && null != ui.copiedStyle && graph.pasteStyle(ui.copiedStyle, graph.getSelectionCells());
        },
        null,
        null,
        'Alt+V'
    );

    function deleteCells(includeEdges) {
        // Cancels interactive operations
        graph.escape();
        const select = graph.deleteCells(graph.getDeletableCells(graph.getSelectionCells()), includeEdges);
        if (ui && ui.refreshHasUsedPointJson) {
            ui.refreshHasUsedPointJson();
        }

        if (select != null) {
            graph.setSelectionCells(select);
        }
    }

    this.addAction(
        'delete',
        function (evt) {
            deleteCells(evt != null && mxEvent.isShiftDown(evt));
        },
        null,
        null,
        'Delete'
    );
    this.addAction(
        'deleteAll',
        function () {
            deleteCells(true);
        },
        null,
        null,
        Editor.ctrlKey + '+Delete'
    );
    this.addAction('deleteLabels', function () {
        if (!graph.isSelectionEmpty()) {
            graph.getModel().beginUpdate();
            try {
                var cells = graph.getSelectionCells();
                for (var i = 0; i < cells.length; i++) {
                    graph.cellLabelChanged(cells[i], '');
                }
            }
            finally {
                graph.getModel().endUpdate();
            }
        }
    }, null, null, Editor.ctrlKey + '+Delete');
    this.addAction('duplicate', function () {
        try {
            var cells = graph.duplicateCells();
            graph.setSelectionCells(cells);
            clearPanelIdentity(cells);
            graph.scrollCellToVisible(graph.getSelectionCell());
        }
        catch (e) {
            ui.handleError(e);
        }
    }, null, null, Editor.ctrlKey + '+D');
    this.put('mergeCells', new Action(mxResources.get('merge'), function () {
        var ss = ui.getSelectionState();

        if (ss.mergeCell != null) {
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles('rowspan', ss.rowspan, [ss.mergeCell]);
                graph.setCellStyles('colspan', ss.colspan, [ss.mergeCell]);
            }
            finally {
                graph.getModel().endUpdate();
            }
        }
    }));
    this.put('unmergeCells', new Action(mxResources.get('unmerge'), function () {
        var ss = ui.getSelectionState();

        if (ss.cells.length > 0) {
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles('rowspan', null, ss.cells);
                graph.setCellStyles('colspan', null, ss.cells);
            }
            finally {
                graph.getModel().endUpdate();
            }
        }
    }));
    this.put(
        'turn',
        new Action(
            mxResources.get('turn') + ' / ' + mxResources.get('reverse'),
            function (evt) {
                graph.turnShapes(graph.getSelectionCells(), evt != null ? mxEvent.isShiftDown(evt) : false);
            },
            null,
            null,
            Editor.ctrlKey + '+R'
        )
    );
    this.addAction(
        'selectVertices',
        function () {
            graph.selectVertices(null, true);
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+I'
    );
    this.addAction(
        'selectEdges',
        function () {
            graph.selectEdges();
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+E'
    );
    this.addAction(
        'selectAll',
        function () {
            graph.selectAll(null, true);
        },
        null,
        null,
        Editor.ctrlKey + '+A'
    );
    this.addAction(
        'selectNone',
        function () {
            graph.clearSelection();
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+A'
    );
    this.addAction(
        'lockUnlock',
        function () {
            if (!graph.isSelectionEmpty()) {
                graph.getModel().beginUpdate();
                try {
                    const defaultValue = graph.isCellMovable(graph.getSelectionCell()) ? 1 : 0;
                    graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_DELETABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_EDITABLE, defaultValue);
                    graph.toggleCellStyles('connectable', defaultValue);
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        },
        null,
        null,
        Editor.ctrlKey + '+L'
    );
    this.addAction(
        'lock',
        function () {
            if (!graph.isSelectionEmpty()) {
                graph.getModel().beginUpdate();
                try {
                    const defaultValue = graph.isCellMovable(graph.getSelectionCell()) ? 1 : 0;
                    graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_DELETABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_EDITABLE, defaultValue);
                    graph.toggleCellStyles('connectable', defaultValue);
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        },
        null,
        null,
        null
    );
    this.addAction(
        'unlock',
        function () {
            if (!graph.isSelectionEmpty()) {
                graph.getModel().beginUpdate();
                try {
                    const defaultValue = graph.isCellMovable(graph.getSelectionCell()) ? 1 : 0;
                    graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_DELETABLE, defaultValue);
                    graph.toggleCellStyles(mxConstants.STYLE_EDITABLE, defaultValue);
                    graph.toggleCellStyles('connectable', defaultValue);
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        },
        null,
        null,
        null
    );

    // Navigation actions
    this.addAction(
        'home',
        function () {
            graph.home();
        },
        null,
        null,
        'Shift+Home'
    );
    this.addAction(
        'exitGroup',
        function () {
            graph.exitGroup();
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+Home'
    );
    this.addAction(
        'enterGroup',
        function () {
            graph.enterGroup();
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+End'
    );
    this.addAction(
        'collapse',
        function () {
            graph.foldCells(true);
        },
        null,
        null,
        Editor.ctrlKey + '+Home'
    );
    this.addAction(
        'expand',
        function () {
            graph.foldCells(false);
        },
        null,
        null,
        Editor.ctrlKey + '+End'
    );

    // Arrange actions
    this.addAction(
        'toFront',
        function () {
            graph.orderCells(false);
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+F'
    );
    this.addAction(
        'toBack',
        function () {
            graph.orderCells(true);
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+B'
    );
    this.addAction('bringForward', function (evt) {
        graph.orderCells(false, null, true);
    });
    this.addAction('sendBackward', function (evt) {
        graph.orderCells(true, null, true);
    });
    this.addAction(
        'group',
        function () {
            if (graph.getSelectionCount() == 1) {
                graph.setCellStyles('container', '1');
            } else {
                graph.setSelectionCell(graph.groupCells(null, 0));
            }
        },
        null,
        null,
        Editor.ctrlKey + '+G'
    );
    this.addAction(
        'ungroup',
        function () {
            if (graph.getSelectionCount() == 1 && graph.getModel().getChildCount(graph.getSelectionCell()) == 0) {
                graph.setCellStyles('container', '0');
            } else {
                graph.setSelectionCells(graph.ungroupCells());
            }
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+U'
    );
    /*  this.addAction("removeFromGroup", function () {
       graph.removeCellsFromParent();
     }); */
    this.addAction('removeFromGroup', function () {
        if (graph.isEnabled()) {
            var cells = graph.getSelectionCells();
            if (cells != null) {
                var temp = [];
                for (var i = 0; i < cells.length; i++) {
                    if (!graph.isTableRow(cells[i]) && !graph.isTableCell(cells[i])) {
                        temp.push(cells[i]);
                    }
                }
                graph.removeCellsFromParent(temp);
            }
        }
    });
    // Adds action
    this.addAction(
        'edit',
        function () {
            if (graph.isEnabled()) {
                graph.startEditingAtCell();
            }
        },
        null,
        null,
        'F2/Enter'
    );

    // - Edit Edit Tooltip Action
    this.addAction(
        'editData...',
        function () {
            var cell = graph.getSelectionCell() || graph.getModel().getRoot();
            ui.showDataDialog(cell);
        },
        null,
        null,
        Editor.ctrlKey + '+M'
    );
    // - Insert Image Action
    // - Insert Link Action



    this.addAction(
        'autosize',
        function () {
            const cells = graph.getSelectionCells();

            if (cells != null) {
                graph.getModel().beginUpdate();
                try {
                    for (let i = 0; i < cells.length; i++) {
                        const cell = cells[i];

                        if (graph.getModel().getChildCount(cell)) {
                            graph.updateGroupBounds([cell], 20);
                        } else {
                            const state = graph.view.getState(cell);
                            let geo = graph.getCellGeometry(cell);

                            if (graph.getModel().isVertex(cell) && state != null && state.text != null && geo != null && graph.isWrapping(cell)) {
                                geo = geo.clone();
                                geo.height = state.text.boundingBox.height / graph.view.scale;
                                graph.getModel().setGeometry(cell, geo);
                            } else {
                                graph.updateCellSize(cell);
                            }
                        }
                    }
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+Y'
    );
    this.addAction('formattedText', function () {
        const refState = graph.getView().getState(graph.getSelectionCell());

        if (refState != null) {
            graph.stopEditing();
            const value = refState.style['html'] == '1' ? null : '1';

            graph.getModel().beginUpdate();
            try {
                const cells = graph.getSelectionCells();

                for (let i = 0; i < cells.length; i++) {
                    const state = graph.getView().getState(cells[i]);

                    if (state != null) {
                        const html = mxUtils.getValue(state.style, 'html', '0');
                        if (html == '1' && value == null) {
                            var label = graph.convertValueToString(state.cell);

                            if (mxUtils.getValue(state.style, 'nl2Br', '1') != '0') {
                                // Removes newlines from HTML and converts breaks to newlines
                                // to match the HTML output in plain text
                                label = label.replace(/\n/g, '').replace(/<br\s*.?>/g, '\n');
                            }

                            // Removes HTML tags
                            const temp = document.createElement('div');
                            temp.innerHTML = graph.sanitizeHtml(label);
                            label = mxUtils.extractTextWithWhitespace(temp.childNodes);

                            graph.cellLabelChanged(state.cell, label);
                            graph.setCellStyles('html', value, [cells[i]]);
                        } else if (html == '0' && value == '1') {
                            // Converts HTML tags to text
                            var label = mxUtils.htmlEntities(graph.convertValueToString(state.cell), false);

                            if (mxUtils.getValue(state.style, 'nl2Br', '1') != '0') {
                                // Converts newlines in plain text to breaks in HTML
                                // to match the plain text output
                                label = label.replace(/\n/g, '<br/>');
                            }

                            graph.cellLabelChanged(state.cell, graph.sanitizeHtml(label));
                            graph.setCellStyles('html', value, [cells[i]]);
                        }
                    }
                }

                ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['html'], 'values', [value != null ? value : '0'], 'cells', cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }
    });
    this.addAction('wordWrap', function () {
        const state = graph.getView().getState(graph.getSelectionCell());
        let value = 'wrap';

        graph.stopEditing();

        if (state != null && state.style[mxConstants.STYLE_WHITE_SPACE] == 'wrap') {
            value = null;
        }

        graph.setCellStyles(mxConstants.STYLE_WHITE_SPACE, value);
    });
    this.addAction('rotation', function () {
        let value = '0';
        const state = graph.getView().getState(graph.getSelectionCell());

        if (state != null) {
            value = state.style[mxConstants.STYLE_ROTATION] || value;
        }

        const dlg = new FilenameDialog(
            ui,
            value,
            mxResources.get('apply'),
            function (newValue) {
                if (newValue != null && newValue.length > 0) {
                    graph.setCellStyles(mxConstants.STYLE_ROTATION, newValue);
                }
            },
            mxResources.get('enterValue') + ' (' + mxResources.get('rotation') + ' 0-360)'
        );

        ui.showDialog(dlg.container, 375, 80, true, true);
        dlg.init();
    });
    // View actions
    this.addAction(
        'resetView',
        function () {
            graph.zoomTo(1);
            ui.resetScrollbars();
        },
        null,
        null,
        'Home'
    );
    this.addAction(
        'zoomIn',
        function () {
            if (graph.isFastZoomEnabled()) {
                graph.lazyZoom(true, true, ui.buttonZoomDelay);
            } else {
                graph.zoomIn();
            }
        },
        null,
        null,
        Editor.ctrlKey + ' + (Numpad) / Alt+Mousewheel'
    );
    this.addAction(
        'zoomOut',
        function () {
            if (graph.isFastZoomEnabled()) {
                graph.lazyZoom(false, true, ui.buttonZoomDelay);
            } else {
                graph.zoomOut();
            }
        },
        null,
        null,
        Editor.ctrlKey + ' - (Numpad) / Alt+Mousewheel'
    );
    this.addAction(
        'fitWindow',
        function () {
            const bounds = graph.isSelectionEmpty() ? graph.getGraphBounds() : graph.getBoundingBox(graph.getSelectionCells());
            const t = graph.view.translate;
            const s = graph.view.scale;
            bounds.width /= s;
            bounds.height /= s;
            bounds.x = bounds.x / s - t.x;
            bounds.y = bounds.y / s - t.y;

            const cw = graph.container.clientWidth - 10;
            const ch = graph.container.clientHeight - 10;
            const scale = Math.floor(20 * Math.min(cw / bounds.width, ch / bounds.height)) / 20;
            graph.zoomTo(scale);

            if (mxUtils.hasScrollbars(graph.container)) {
                graph.container.scrollTop = (bounds.y + t.y) * scale - Math.max((ch - bounds.height * scale) / 2 + 5, 0);
                graph.container.scrollLeft = (bounds.x + t.x) * scale - Math.max((cw - bounds.width * scale) / 2 + 5, 0);
            }
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+H'
    );
    this.addAction(
        'fitPage',
        mxUtils.bind(this, function () {
            if (!graph.pageVisible) {
                this.get('pageView').funct();
            }

            const fmt = graph.pageFormat;
            const ps = graph.pageScale;
            const cw = graph.container.clientWidth - 10;
            const ch = graph.container.clientHeight - 10;
            const scale = Math.floor(20 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 20;
            graph.zoomTo(scale);

            if (mxUtils.hasScrollbars(graph.container)) {
                const pad = graph.getPagePadding();
                graph.container.scrollTop = pad.y * graph.view.scale - 1;
                graph.container.scrollLeft = Math.min(pad.x * graph.view.scale, (graph.container.scrollWidth - graph.container.clientWidth) / 2) - 1;
            }
        }),
        null,
        null,
        Editor.ctrlKey + '+J'
    );
    this.addAction(
        'fitTwoPages',
        mxUtils.bind(this, function () {
            if (!graph.pageVisible) {
                this.get('pageView').funct();
            }

            const fmt = graph.pageFormat;
            const ps = graph.pageScale;
            const cw = graph.container.clientWidth - 10;
            const ch = graph.container.clientHeight - 10;

            const scale = Math.floor(20 * Math.min(cw / (2 * fmt.width) / ps, ch / fmt.height / ps)) / 20;
            graph.zoomTo(scale);

            if (mxUtils.hasScrollbars(graph.container)) {
                const pad = graph.getPagePadding();
                graph.container.scrollTop = Math.min(pad.y, (graph.container.scrollHeight - graph.container.clientHeight) / 2);
                graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
            }
        }),
        null,
        null,
        Editor.ctrlKey + '+Shift+J'
    );
    this.addAction(
        'fitPageWidth',
        mxUtils.bind(this, function () {
            if (!graph.pageVisible) {
                this.get('pageView').funct();
            }

            const fmt = graph.pageFormat;
            const ps = graph.pageScale;
            const cw = graph.container.clientWidth - 10;

            const scale = Math.floor((20 * cw) / fmt.width / ps) / 20;
            graph.zoomTo(scale);

            if (mxUtils.hasScrollbars(graph.container)) {
                const pad = graph.getPagePadding();
                graph.container.scrollLeft = Math.min(pad.x * graph.view.scale, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
            }
        })
    );
    this.put(
        'customZoom',
        new Action(
            mxResources.get('custom') + '...',
            mxUtils.bind(this, function () {
                const dlg = new FilenameDialog(
                    this.editorUi,
                    parseInt(graph.getView().getScale() * 100),
                    mxResources.get('apply'),
                    mxUtils.bind(this, function (newValue) {
                        const val = parseInt(newValue);

                        if (!isNaN(val) && val > 0) {
                            graph.zoomTo(val / 100);
                        }
                    }),
                    mxResources.get('zoom') + ' (%)'
                );
                this.editorUi.showDialog(dlg.container, 300, 80, true, true);
                dlg.init();
            }),
            null,
            null,
            Editor.ctrlKey + '+0'
        )
    );

    this.addAction(
        'pageScale...',
        mxUtils.bind(this, function () {
            const dlg = new FilenameDialog(
                this.editorUi,
                parseInt(graph.pageScale * 100),
                mxResources.get('apply'),
                mxUtils.bind(this, function (newValue) {
                    const val = parseInt(newValue);

                    if (!isNaN(val) && val > 0) {
                        const change = new ChangePageSetup(ui, null, null, null, val / 100);
                        change.ignoreColor = true;
                        change.ignoreImage = true;

                        graph.model.execute(change);
                    }
                }),
                mxResources.get('pageScale') + ' (%)'
            );
            this.editorUi.showDialog(dlg.container, 300, 80, true, true);
            dlg.init();
        })
    );

    // Option actions
    let action = null;
    action = this.addAction(
        'grid',
        function () {
            graph.setGridEnabled(!graph.isGridEnabled());
            ui.fireEvent(new mxEventObject('gridEnabledChanged'));
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+G'
    );
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.isGridEnabled();
    });
    action.setEnabled(false);

    action = this.addAction('guides', function () {
        graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled;
        ui.fireEvent(new mxEventObject('guidesEnabledChanged'));
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.graphHandler.guidesEnabled;
    });
    action.setEnabled(false);

    action = this.addAction('tooltips', function () {
        graph.tooltipHandler.setEnabled(!graph.tooltipHandler.isEnabled());
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.tooltipHandler.isEnabled();
    });

    action = this.addAction('collapseExpand', function () {
        const change = new ChangePageSetup(ui);
        change.ignoreColor = true;
        change.ignoreImage = true;
        change.foldingEnabled = !graph.foldingEnabled;

        graph.model.execute(change);
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.foldingEnabled;
    });
    action.isEnabled = isGraphEnabled;
    action = this.addAction('scrollbars', function () {
        ui.setScrollbars(!ui.hasScrollbars());
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.scrollbars;
    });
    action = this.addAction(
        'pageView',
        mxUtils.bind(this, function () {
            ui.setPageVisible(!graph.pageVisible);
        })
    );
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.pageVisible;
    });
    action = this.addAction(
        'connectionArrows',
        function () {
            graph.connectionArrowsEnabled = !graph.connectionArrowsEnabled;
            ui.fireEvent(new mxEventObject('connectionArrowsChanged'));
        },
        null,
        null,
        'Alt+Shift+A'
    );
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.connectionArrowsEnabled;
    });
    action = this.addAction(
        'connectionPoints',
        function () {
            graph.setConnectable(!graph.connectionHandler.isEnabled());
            ui.fireEvent(new mxEventObject('connectionPointsChanged'));
        },
        null,
        null,
        'Alt+Shift+P'
    );
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.connectionHandler.isEnabled();
    });
    action = this.addAction('copyConnect', function () {
        graph.connectionHandler.setCreateTarget(!graph.connectionHandler.isCreateTarget());
        ui.fireEvent(new mxEventObject('copyConnectChanged'));
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.connectionHandler.isCreateTarget();
    });
    action.isEnabled = isGraphEnabled;

    // - AutoSave Action
    // - Help Action
    // - About Action

    // Font style actions
    const toggleFontStyle = mxUtils.bind(this, function (key, style, fn, shortcut) {
        return this.addAction(
            key,
            function () {
                if (fn != null && graph.cellEditor.isContentEditing()) {
                    fn();
                } else {
                    graph.stopEditing(false);

                    graph.getModel().beginUpdate();
                    try {
                        const cells = graph.getSelectionCells();
                        graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style, cells);

                        // Removes bold and italic tags and CSS styles inside labels
                        if ((style & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
                            graph.updateLabelElements(graph.getSelectionCells(), function (elt) {
                                elt.style.fontWeight = null;

                                if (elt.nodeName == 'B') {
                                    graph.replaceElement(elt);
                                }
                            });
                        } else if ((style & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
                            graph.updateLabelElements(graph.getSelectionCells(), function (elt) {
                                elt.style.fontStyle = null;

                                if (elt.nodeName == 'I') {
                                    graph.replaceElement(elt);
                                }
                            });
                        } else if ((style & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
                            graph.updateLabelElements(graph.getSelectionCells(), function (elt) {
                                elt.style.textDecoration = null;

                                if (elt.nodeName == 'U') {
                                    graph.replaceElement(elt);
                                }
                            });
                        }

                        for (let i = 0; i < cells.length; i++) {
                            if (graph.model.getChildCount(cells[i]) == 0) {
                                graph.autoSizeCell(cells[i], false);
                            }
                        }
                    } finally {
                        graph.getModel().endUpdate();
                    }
                }
            },
            null,
            null,
            shortcut
        );
    });

    toggleFontStyle(
        'bold',
        mxConstants.FONT_BOLD,
        function () {
            document.execCommand('bold', false, null);
        },
        Editor.ctrlKey + '+B'
    );
    toggleFontStyle(
        'italic',
        mxConstants.FONT_ITALIC,
        function () {
            document.execCommand('italic', false, null);
        },
        Editor.ctrlKey + '+I'
    );
    toggleFontStyle(
        'underline',
        mxConstants.FONT_UNDERLINE,
        function () {
            document.execCommand('underline', false, null);
        },
        Editor.ctrlKey + '+U'
    );

    // Color actions
    this.addAction('fontColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_FONTCOLOR, 'forecolor', '000000');
    });
    this.addAction('strokeColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_STROKECOLOR);
    });
    this.addAction('fillColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_FILLCOLOR);
    });
    this.addAction('gradientColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_GRADIENTCOLOR);
    });
    this.addAction('backgroundColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, 'backcolor');
    });
    this.addAction('borderColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_LABEL_BORDERCOLOR);
    });

    this.addAction('vertical', function () {
        ui.menus.toggleStyle(mxConstants.STYLE_HORIZONTAL, true);
    });
    this.addAction('shadow', function () {
        ui.menus.toggleStyle(mxConstants.STYLE_SHADOW);
    });
    this.addAction('solid', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_DASHED, null);
            graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], 'values', [null, null], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('dashed', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
            graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], 'values', ['1', null], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('dotted', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
            graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, '1 4');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN], 'values', ['1', '1 4'], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('sharp', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
            graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED], 'values', ['0', '0'], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('rounded', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_ROUNDED, '1');
            graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED], 'values', ['1', '0'], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('toggleRounded', function () {
        if (!graph.isSelectionEmpty() && graph.isEnabled()) {
            graph.getModel().beginUpdate();
            try {
                const cells = graph.getSelectionCells();
                const style = graph.getCurrentCellStyle(cells[0]);
                const value = mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, '0') == '1' ? '0' : '1';

                graph.setCellStyles(mxConstants.STYLE_ROUNDED, value);
                graph.setCellStyles(mxConstants.STYLE_CURVED, null);
                ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED], 'values', [value, '0'], 'cells', graph.getSelectionCells()));
            } finally {
                graph.getModel().endUpdate();
            }
        }
    });
    this.addAction('curved', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
            graph.setCellStyles(mxConstants.STYLE_CURVED, '1');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED], 'values', ['0', '1'], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('collapsible', function () {
        const state = graph.view.getState(graph.getSelectionCell());
        let value = '1';

        if (state != null && graph.getFoldingImage(state) != null) {
            value = '0';
        }

        graph.setCellStyles('collapsible', value);
        ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['collapsible'], 'values', [value], 'cells', graph.getSelectionCells()));
    });

    // - Edit Style Action

    this.addAction(
        'setAsDefaultStyle',
        function () {
            if (graph.isEnabled() && !graph.isSelectionEmpty()) {
                ui.setDefaultStyle(graph.getSelectionCell());
            }
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+D'
    );
    this.addAction(
        'clearDefaultStyle',
        function () {
            if (graph.isEnabled()) {
                ui.clearDefaultStyle();
            }
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+R'
    );
    this.addAction('TableAddTopRow', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0];
        graph.selectNode(graph.insertRow(node, 0)), graph.stopEditing();
    });
    this.addAction('TableAddBottomRow', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0],
            rows = node.rows.length;
        graph.selectNode(graph.insertRow(node, rows)), graph.stopEditing();
    });
    this.addAction('TableAddLeftColumn', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0];
        graph.selectNode(graph.insertColumn(node, 0)), graph.stopEditing();
    });
    this.addAction('TableAddRightColumn', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0],
            colums = node.rows[0].cells.length;
        graph.selectNode(graph.insertColumn(node, colums)), graph.stopEditing();
    });
    this.addAction('TableDeleteTopRow', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0];
        graph.deleteRow(node, 0), graph.stopEditing();
    });
    this.addAction('TableDeleteBottomRow', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0],
            rows = node.rows.length;
        graph.deleteRow(node, rows - 1), graph.stopEditing();
    });
    this.addAction('TableDeleteLeftColumn', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0];
        graph.deleteColumn(node, 0), graph.stopEditing();
    });
    this.addAction('TableDeleteRightColumn', function () {
        graph.dblClick('dblclick', graph.getSelectionCell());
        var node = document.getElementsByClassName('mxCellEditor')[0].childNodes[0],
            colums = node.rows[0].cells.length;
        graph.deleteColumn(node, colums - 1), graph.stopEditing();
    });
    this.addAction(
        'setPassword',
        function (isNeedPassword) {
            ui.setPasswordPage(ui.currentPage, isNeedPassword);
        },
        null,
        null,
        null
    );
    this.addAction('addWaypoint', function () {
        const cell = graph.getSelectionCell();

        if (cell != null && graph.getModel().isEdge(cell)) {
            const handler = editor.graph.selectionCellsHandler.getHandler(cell);

            if (handler instanceof mxEdgeHandler) {
                const t = graph.view.translate;
                const s = graph.view.scale;
                let dx = t.x;
                let dy = t.y;

                let parent = graph.getModel().getParent(cell);
                let pgeo = graph.getCellGeometry(parent);

                while (graph.getModel().isVertex(parent) && pgeo != null) {
                    dx += pgeo.x;
                    dy += pgeo.y;

                    parent = graph.getModel().getParent(parent);
                    pgeo = graph.getCellGeometry(parent);
                }

                const x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
                const y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

                handler.addPointAt(handler.state, x, y);
            }
        }
    });
    this.addAction('removeWaypoint', function () {
        // TODO: Action should run with "this" set to action
        const rmWaypointAction = ui.actions.get('removeWaypoint');

        if (rmWaypointAction.handler != null) {
            // NOTE: Popupevent handled and action updated in Menus.createPopupMenu
            rmWaypointAction.handler.removePoint(rmWaypointAction.handler.state, rmWaypointAction.index);
        }
    });
    this.addAction(
        'clearWaypoints',
        function () {
            let cells = graph.getSelectionCells();

            if (cells != null) {
                cells = graph.addAllEdges(cells);

                graph.getModel().beginUpdate();
                try {
                    for (let i = 0; i < cells.length; i++) {
                        const cell = cells[i];

                        if (graph.getModel().isEdge(cell)) {
                            let geo = graph.getCellGeometry(cell);

                            if (geo != null) {
                                geo = geo.clone();
                                geo.points = null;
                                graph.getModel().setGeometry(cell, geo);
                            }
                        }
                    }
                } finally {
                    graph.getModel().endUpdate();
                }
            }
        },
        null,
        null,
        'Alt+Shift+C'
    );
    this.addAction(
        'editConnectionPoints...',
        function () {
            var cell = graph.getSelectionCell();

            if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()) && cell != null) {
                var dlg = new ConnectionPointsDialog(ui, cell);
                ui.showDialog(dlg.container, 350, 450, true, false, function () {
                    dlg.destroy();
                });
                dlg.init();
            }
        },
        null,
        null,
        'Alt+Shift+Q'
    ).isEnabled = isGraphEnabled;
    this.addAction(
        'editGeometry...',
        function () {
            var cells = graph.getSelectionCells();
            var vertices = [];
            for (var i = 0; i < cells.length; i++) {
                if (graph.getModel().isVertex(cells[i])) {
                    vertices.push(cells[i]);
                }
            }
            if (vertices.length > 0) {
                var dlg = new EditGeometryDialog(ui, vertices);
                ui.showDialog(dlg.container, 200, 270, true, true);
                dlg.init();
            }
        },
        null,
        null,
        Editor.ctrlKey + '+Shift+M'
    );

    action = this.addAction(
        'subscript',
        mxUtils.bind(this, function () {
            if (graph.cellEditor.isContentEditing()) {
                document.execCommand('subscript', false, null);
            }
        }),
        null,
        null,
        Editor.ctrlKey + '+,'
    );
    action = this.addAction(
        'superscript',
        mxUtils.bind(this, function () {
            if (graph.cellEditor.isContentEditing()) {
                document.execCommand('superscript', false, null);
            }
        }),
        null,
        null,
        Editor.ctrlKey + '+.'
    );
    action = this.addAction(
        'indent',
        mxUtils.bind(this, function () {
            // NOTE: Alt+Tab for outdent implemented via special code in
            // keyHandler.getFunction in EditorUi.js. Ctrl+Tab is reserved.
            if (graph.cellEditor.isContentEditing()) {
                document.execCommand('indent', false, null);
            }
        }),
        null,
        null,
        'Shift+Tab'
    );
    // - Image... Action
    action = this.addAction(
        'layers',
        mxUtils.bind(this, function () {
            if (this.layersWindow == null) {
                // LATER: Check outline window for initial placement
                this.layersWindow = new LayersWindow(ui, document.body.offsetWidth - 280, 120, 220, 196);
                this.layersWindow.window.addListener('show', function () {
                    ui.fireEvent(new mxEventObject('layers'));
                });
                this.layersWindow.window.addListener('hide', function () {
                    ui.fireEvent(new mxEventObject('layers'));
                });
                this.layersWindow.window.setVisible(true);
                ui.fireEvent(new mxEventObject('layers'));

                this.layersWindow.init();
            } else {
                this.layersWindow.window.setVisible(!this.layersWindow.window.isVisible());
            }
        }),
        null,
        null,
        Editor.ctrlKey + '+Shift+L'
    );
    action.setToggleAction(true);
    action.setSelectedCallback(
        mxUtils.bind(this, function () {
            return this.layersWindow != null && this.layersWindow.window.isVisible();
        })
    );
    action = this.addAction(
        'formatPanel',
        mxUtils.bind(this, function () {
            ui.toggleFormatPanel();
        }),
        null,
        null,
        Editor.ctrlKey + '+Shift+P'
    );
    action.setToggleAction(true);
    action.setSelectedCallback(
        mxUtils.bind(this, function () {
            return ui.formatWidth > 0;
        })
    );
    action = this.addAction(
        'outline',
        mxUtils.bind(this, function () {
            if (this.outlineWindow == null) {
                // LATER: Check layers window for initial placement
                this.outlineWindow = new OutlineWindow(ui, document.body.offsetWidth - 260, 100, 180, 180);
                this.outlineWindow.window.addListener('show', function () {
                    ui.fireEvent(new mxEventObject('outline'));
                });
                this.outlineWindow.window.addListener('hide', function () {
                    ui.fireEvent(new mxEventObject('outline'));
                });
                this.outlineWindow.window.setVisible(true);
                ui.fireEvent(new mxEventObject('outline'));
            } else {
                this.outlineWindow.window.setVisible(!this.outlineWindow.window.isVisible());
            }
        }),
        null,
        null,
        Editor.ctrlKey + '+Shift+O'
    );

    action.setToggleAction(true);
    action.setSelectedCallback(
        mxUtils.bind(this, function () {
            return this.outlineWindow != null && this.outlineWindow.window.isVisible();
        })
    );

    action = this.addAction('ruler', mxUtils.bind(this, function () {
        ui.setRulerVisible(!ui.isRulerVisible());
    }));
    action.setEnabled(true);
    action.setToggleAction(true);
    action.setSelectedCallback(mxUtils.bind(this, function () {
        return ui.isRulerVisible();
    }));
};

Actions.prototype.addAction = function (key, funct, enabled, iconCls, shortcut) {
    let title;

    if (key.substring(key.length - 3) == '...') {
        key = key.substring(0, key.length - 3);
        title = mxResources.get(key) + '...';
    } else {
        title = mxResources.get(key);
    }

    return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

Actions.prototype.put = function (name, action) {
    this.actions[name] = action;

    return action;
};

Actions.prototype.get = function (name) {
    return this.actions[name];
};

function Action(label, funct, enabled, iconCls, shortcut) {
    mxEventSource.call(this);
    this.label = label;
    this.funct = this.createFunction(funct);
    this.enabled = enabled != null ? enabled : true;
    this.iconCls = iconCls;
    this.shortcut = shortcut;
    this.visible = true;
}

mxUtils.extend(Action, mxEventSource);

Action.prototype.createFunction = function (funct) {
    return funct;
};

Action.prototype.setEnabled = function (value) {
    if (this.enabled != value) {
        this.enabled = value;
        this.fireEvent(new mxEventObject('stateChanged'));
    }
};

Action.prototype.isEnabled = function () {
    return this.enabled;
};

Action.prototype.setToggleAction = function (value) {
    this.toggleAction = value;
};

Action.prototype.setSelectedCallback = function (funct) {
    this.selectedCallback = funct;
};

Action.prototype.isSelected = function () {
    return this.selectedCallback();
};
