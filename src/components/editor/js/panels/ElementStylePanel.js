/* eslint-disable */
import {mxConstants, mxEvent, mxEventObject, mxRectangle, mxUtils} from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";
import {Editor} from '../Editor';
import {Graph} from '../Graph';
import {ChangePageSetup} from "../EditorUi";

import CustomStaticStyleView from './datas/CustomStaticStyleView';

export default ElementStylePanel;

function ElementStylePanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.container.style.cssText = `padding: 10px;box-sizing: border-box;`;
    this.container.style.overflowY = 'scroll';
    this.init();
    const ss = this.editorUi.getSelectionState();
    if(ss.cells && ss.cells.length > 0){
        if(ss.cells[0].getId() == ElementStylePanel.lastCellId){
            setTimeout(()=>{
                this.container.scrollTop = ElementStylePanel.lastScrollTop;
            }, this.setScrollTopLazyTime);
        }else{
            ElementStylePanel.lastCellId = ss.cells[0].getId();
            ElementStylePanel.lastScrollTop = 0;
        }
    }else{
        ElementStylePanel.lastCellId = null;
        ElementStylePanel.lastScrollTop = 0;
    }
    this.listenTop();
}

ElementStylePanel.lastCellId = null;
ElementStylePanel.lastScrollTop = 0;

mxUtils.extend(ElementStylePanel, BaseFormatPanel);

ElementStylePanel.prototype.listenTop = function () {
    this.container.addEventListener("scroll", mxUtils.bind(this, function (e) {
        ElementStylePanel.lastScrollTop = this.container.scrollTop;
    }));
}

ElementStylePanel.prototype.init = function () {
    const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    if (ss.cells.length <= 0) {
        this.addSingleLockedView();
        return;
    }
    const style = graph.getCellStyle(ss.cells[0])
    this.addNameView(ss);
    try{
        this.loadCustomViewStyle(ss);
    }catch (e) {
        console.error('loadCustomViewStyle', e);
    }
    if(style && style.shape == 'mxgraph.rc.mxRcTableView'){
        this.addSetTabStyleView(ss);
    }
    if (ss.fill && !(ss.style && ss.style.igBackground == '1')) {
        this.addFillView(ss);
    }

    this.addChangeToFlowPipView(ss);

    if(!(ss.style && ss.style.igStroke == '1')){
        this.addStrokeView(ss);
    }

    this.addLineJumps(ss);

    if(!(ss.style && ss.style.igRound == '1')){
        this.addRoundedView(ss);
    }

    this.addVisibleView(ss);

    this.addLayerOpsView(ss);

    this.addGeometryView(ss);

    this.addEdgeGeometryView(ss);

    if (!ss.containsLabel || ss.edges.length === 0) {
        this.addAngleView(ss);
    }
    if (!ss.containsLabel) {
        this.addFlipView(ss);
    }

    let div = document.createElement('div');
    this.addTable(div);
    this.container.appendChild(div);

};

ElementStylePanel.prototype.addSetTabStyleView = function (ss){
    const graph = this.editorUi.editor.graph;
    const row = this.createLabelCellRowRightButton('设置表头', {
        btnsFlex: '1',
        btnsAlign: 'left',
        btns: [
            {label: '去设置', typeClass:'rcui-bg-orange', clickFn: mxUtils.bind(this, function (evt) {
                this.editorUi.showSetTablePropertiesDialog({
                    title: '设置表头',
                    buttons: [{text: '取消', typeClass:'rcui-bg-red', func: mxUtils.bind(this, function (evt, dialog, btn) {
                        this.editorUi.hideDialog(true, false);
                    })},{text: '确定', typeClass:'rcui-bg-blue', func: mxUtils.bind(this, function (evt, dialog, btn, headerConfig) {
                        this.editorUi.hideDialog(true, false);
                        let value = encodeURIComponent(JSON.stringify(headerConfig))
                        graph.getModel().beginUpdate();
                        try {
                            let cells = [ss.cells[0]];
                            graph.setCellStyles('tableHeaderConfig', value, cells);
                            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', ['tableHeaderConfig'], 'values', [value], 'cells', cells));
                        } finally {
                            graph.getModel().endUpdate();
                        }
                    })}]
                });
            })},
        ]
    });
    this.container.appendChild(row.root);
}


ElementStylePanel.prototype.addChangeToFlowPipView = function (ss){
    const graph = this.editorUi.editor.graph;
    if (ss.edges.length > 0 && ss.vertices.length === 0 && ss.lineJumps && ss.style['enableFlow'] != '1') {
        const setEnableFlowRow = this.createLabelCellRowSwitch('转为流动条', {
            trueLabel: '是',
            falseLabel: '否'
        }, mxUtils.bind(this, function () {
            return ss.style['enableFlow'] == '1';
        }), mxUtils.bind(this, function (val) {
            graph.getModel().beginUpdate();
            try {
                const cells = ss.cells;
                graph.setCellStyles('enableFlow', val ? '1' : '0', cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', ['enableFlow'], 'values', [val ? '1' : '0'], 'cells', cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setEnableFlowRow.root);
    }
}
ElementStylePanel.prototype.loadCustomViewStyle = function (ss){
    if(ss.cells && ss.cells.length > 0){
        let isLine = ss.edges.length > 0 && ss.vertices.length === 0 && ss.lineJumps;
        if(!isLine){
            let rcSprop = mxUtils.getValue(ss.style, 'rcSprop', null);
            if(mxUtils.isNullOrUndefined(rcSprop) || rcSprop.trim().length < 0) return;
            try{
                rcSprop = rcSprop.trim().split(',');
                if(rcSprop.length < 1) return;
            }catch (e) {
                console.log('解析参数异常', e);
                return;
            }
        }
        this.container.appendChild(new CustomStaticStyleView(this.format).container);
    }
}

ElementStylePanel.prototype.addTable = function (div) {
    var ui = this.editorUi;
    var editor = ui.editor;
    var graph = editor.graph;
    var ss = ui.getSelectionState();
    div.style.paddingTop = '6px';
    div.style.paddingBottom = '10px';

    var span = document.createElement('div');
    span.style.marginTop = '0px';
    span.style.marginBottom = '6px';
    span.style.fontWeight = 'bold';
    mxUtils.write(span, mxResources.get('table'));
    div.appendChild(span);

    var panel = document.createElement('div');
    panel.style.position = 'relative';
    panel.style.paddingLeft = '0px';
    panel.style.borderWidth = '0px';
    panel.style.width = '220px';
    panel.className = 'geToolbarContainer';

    var cell = ss.vertices[0];

    if (graph.getSelectionCount() > 1) {
        if (graph.isTableCell(cell)) {
            cell = graph.model.getParent(cell);
        }

        if (graph.isTableRow(cell)) {
            cell = graph.model.getParent(cell);
        }
    }

    var isTable = ss.table || ss.row || ss.cell;
    var isStack = graph.isStack(cell) || graph.isStackChild(cell);

    var showCols = isTable;
    var showRows = isTable;

    if (isStack) {
        var style = graph.isStack(cell) ? ss.style : graph.getCellStyle(graph.model.getParent(cell));

        showRows = style['horizontalStack'] == '0';
        showCols = !showRows;
    }

    var btns = [];

    if (showCols) {
        btns = btns.concat([
            ui.toolbar.addButton(
                'geSprite-insertcolumnbefore',
                mxResources.get('insertColumnBefore'),
                mxUtils.bind(this, function () {
                    try {
                        if (isStack) {
                            graph.insertLane(cell, true);
                        } else {
                            graph.insertTableColumn(cell, true);
                        }
                    } catch (e) {
                        ui.handleError(e);
                    }
                }),
                panel
            ),
            ui.toolbar.addButton(
                'geSprite-insertcolumnafter',
                mxResources.get('insertColumnAfter'),
                mxUtils.bind(this, function () {
                    try {
                        if (isStack) {
                            graph.insertLane(cell, false);
                        } else {
                            graph.insertTableColumn(cell, false);
                        }
                    } catch (e) {
                        ui.handleError(e);
                    }
                }),
                panel
            ),
            ui.toolbar.addButton(
                'geSprite-deletecolumn',
                mxResources.get('deleteColumn'),
                mxUtils.bind(this, function () {
                    try {
                        if (isStack) {
                            graph.deleteLane(cell);
                        } else {
                            graph.deleteTableColumn(cell);
                        }
                    } catch (e) {
                        ui.handleError(e);
                    }
                }),
                panel
            ),
        ]);
    }

    if (showRows) {
        btns = btns.concat([
            ui.toolbar.addButton(
                'geSprite-insertrowbefore',
                mxResources.get('insertRowBefore'),
                mxUtils.bind(this, function () {
                    try {
                        if (isStack) {
                            graph.insertLane(cell, true);
                        } else {
                            graph.insertTableRow(cell, true);
                        }
                    } catch (e) {
                        ui.handleError(e);
                    }
                }),
                panel
            ),
            ui.toolbar.addButton(
                'geSprite-insertrowafter',
                mxResources.get('insertRowAfter'),
                mxUtils.bind(this, function () {
                    try {
                        if (isStack) {
                            graph.insertLane(cell, false);
                        } else {
                            graph.insertTableRow(cell, false);
                        }
                    } catch (e) {
                        ui.handleError(e);
                    }
                }),
                panel
            ),
            ui.toolbar.addButton(
                'geSprite-deleterow',
                mxResources.get('deleteRow'),
                mxUtils.bind(this, function () {
                    try {
                        if (isStack) {
                            graph.deleteLane(cell);
                        } else {
                            graph.deleteTableRow(cell);
                        }
                    } catch (e) {
                        ui.handleError(e);
                    }
                }),
                panel
            ),
        ]);
    }

    if (btns.length > 0) {
        this.styleButtons(btns);
        div.appendChild(panel);

        if (btns.length > 3) {
            btns[2].style.marginRight = '10px';
        }

        var count = 0;

        if (ss.mergeCell != null) {
            count += this.addActions(div, ['mergeCells']);
        } else if (ss.style['colspan'] > 1 || ss.style['rowspan'] > 1) {
            count += this.addActions(div, ['unmergeCells']);
        }

        if (count > 0) {
            panel.style.paddingBottom = '2px';
        }
    } else {
        div.style.display = 'none';
    }



    return div;
};

ElementStylePanel.prototype.addRoundedView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const style = graph.getCellStyle(ss.cells[0])
    const label = !ss.style.shape ? '' : ss.style.shape === 'connector' ? '转角' : ss.style.shape === 'image' || (ss.style.shape && ss.style.shape.indexOf('mxgraph.rc') == 0) ? '背景' : '转角';
    const setRoundedRow = this.createLabelCellRowSwitch(label + mxResources.get('rounded'), {
        trueLabel: '开启',
        falseLabel: '关闭'
    }, mxUtils.bind(this, function () {
        return mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, 0);
    }), mxUtils.bind(this, function (val) {
        graph.getModel().beginUpdate();
        try {
            let cells = ss.cells;
            graph.setCellStyles(mxConstants.STYLE_ROUNDED, val ? 1 : 0, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED], 'values', [val ? 1 : 0], 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setRoundedRow.root);
    if(mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, 0) != 0){
        const setArcSizeRow = this.createLabelCellRowInput('圆角大小', {
            type: 'number',
            min: 0,
            max: 9999,
            step: 1,
            hideStep: false,
            decimal: true,
            unit: 'px',
        }, mxUtils.bind(this, function () {
            return mxUtils.getValue(style, 'arcSize', 0);
        }), mxUtils.bind(this, function (value) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                value = parseFloat(value ? value : '0');
                if (value !== mxUtils.getValue(style, 'arcSize', 0)) {
                    let cells = ss.cells;
                    graph.setCellStyles('arcSize', value, cells);
                    this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', ['width'], 'values', [value], 'cells', cells));
                }
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setArcSizeRow.root);
    }
};
ElementStylePanel.prototype.addVisibleView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    const setVisibleRow = this.createLabelCellRowSwitch('可见性', {
        trueLabel: '可见',
        falseLabel: '不可见'
    }, mxUtils.bind(this, function () {
        return graph.isCellVisible(ss.cells[0]);
    }), mxUtils.bind(this, function (val) {
        graph.getModel().beginUpdate();
        try {
            const cells = ss.cells;
            graph.setCellsVisible(cells, val);
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setVisibleRow.root);
};

ElementStylePanel.prototype.addNameView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    if(ss && ss.cells && ss.cells.length > 0){
        const setIDRow = this.createLabelCellRowInput('控件ID', {
            type: 'text',
            disable: true,
        }, mxUtils.bind(this, function () {
            const cell = ss.cells[0];
            return cell.id;
        }), mxUtils.bind(this, function (value) {

        }));
        this.container.appendChild(setIDRow.root);
    }
    const setNameRow = this.createLabelCellRowInput('控件名称', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        let title = mxUtils.getValue(ss.style, 'title', '');
        if (!title) {
            title = mxUtils.getValue(ss.style, 'defaultTitle', '');
        }
        return title;
    }), mxUtils.bind(this, function (value) {
        graph.getModel().beginUpdate();
        try {
            let cells = [ss.cells[0]];
            graph.setCellStyles('title', value, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', ['title'], 'values', [value], 'cells', cells));
            
            // 如果是二沉池图元，同步更新显示的标签
            let rcDprop = mxUtils.getValue(ss.style, 'rcDprop', '');
            if (rcDprop && rcDprop.indexOf('erchenchiValues') >= 0) {
                graph.model.setValue(cells[0], value);
            }
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setNameRow.root);

    // Check for Erchenchi
    let rcDprop = mxUtils.getValue(ss.style, 'rcDprop', '');
    if (rcDprop && rcDprop.indexOf('erchenchiValues') >= 0) {
        const setTypeRow = this.createLabelCellRowSelect('控件类型', {
            options: [
                {key: 'pump', title: '泵类'},
                {key: 'valve', title: '阀类'},
                {key: 'none', title: '无'}
            ]
        }, mxUtils.bind(this, function () {
            return mxUtils.getValue(ss.style, 'erchenchiType', 'pump');
        }), mxUtils.bind(this, function (option) {
            graph.getModel().beginUpdate();
            try {
                let cells = ss.cells;
                graph.setCellStyles('erchenchiType', option.key, cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', ['erchenchiType'], 'values', [option.key], 'cells', cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setTypeRow.root);
    }
};

ElementStylePanel.prototype.addFlipView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    const setFlipRow = this.createLabelRowActionButtonsCell(mxResources.get('flip'), {
        options: [
            {key: 'horizontal', title: mxResources.get('horizontal')},
            {key: 'vertical', title: mxResources.get('vertical')},
        ]
    }, null, mxUtils.bind(this, function (val, evt) {
        graph.flipCells(ss.cells, val.key === 'horizontal');
    }));
    this.container.appendChild(setFlipRow.root);
};

ElementStylePanel.prototype.addAngleView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    if (ss.rotatable && !ss.table && !ss.row && !ss.cell) {
        const setRotationAngleRow = this.createLabelCellRowInput('角度', {
            type: 'number',
            min: 0,
            max: 360,
            step: 1,
            hideStep: false,
            decimal: false,
            unit: '°',
        }, mxUtils.bind(this, function () {
            return parseFloat(mxUtils.getValue(ss.style, mxConstants.STYLE_ROTATION, 0));
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                let cells = ss.cells;
                let key = mxConstants.STYLE_ROTATION;
                graph.setCellStyles(key, value, cells);
                for (let i = 0; i < cells.length; i++) {
                    if (graph.model.getChildCount(cells[i]) === 0) {
                        graph.autoSizeCell(cells[i], false);
                    }
                }
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [key], 'values', [value], 'cells', cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setRotationAngleRow.root);
    }
    if (!ss.containsLabel) {
        let label = mxResources.get('reverse');
        if (ss.vertices.length > 0 && ss.edges.length > 0) {
            label = mxResources.get('turn') + ' / ' + label;
        } else if (ss.vertices.length > 0) {
            label = mxResources.get('turn');
        }
        const setRotationFastRow = this.createLabelRowActionButtonsCell('', {
            options: [{key: 'turn', title: label}]
        }, null, mxUtils.bind(this, function (val, evt) {
            this.editorUi.actions.get(val.key).funct(evt, evt);
        }));
        this.container.appendChild(setRotationFastRow.root);
    }
};

ElementStylePanel.prototype.addEdgeGeometryView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    if (ss.style.shape === 'link' || ss.style.shape === 'flexArrow') {
        const setWidthRow = this.createLabelCellRowInput('宽', {
            type: 'number',
            min: 0,
            max: 9999,
            step: 0.1,
            hideStep: false,
            decimal: true,
            unit: 'px',
        }, mxUtils.bind(this, function () {
            return mxUtils.getValue(ss.style, 'width', mxCellRenderer.defaultShapes['flexArrow'].prototype.defaultWidth);
        }), mxUtils.bind(this, function (value) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                value = parseFloat(value ? value : '0');
                if (value !== mxUtils.getValue(ss.style, 'width', mxCellRenderer.defaultShapes['flexArrow'].prototype.defaultWidth)) {
                    let cells = ss.cells;
                    graph.setCellStyles('width', value, cells);
                    this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', ['width'], 'values', [value], 'cells', cells));
                }
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setWidthRow.root);
    }
    if (ss.cells.length === 1) {
        let cell = ss.cells[0];
        if (graph.model.isEdge(cell)) {
            const geo = graph.model.getGeometry(cell);
            if (geo != null && geo.sourcePoint != null && graph.model.getTerminal(cell, true) == null) {
                const setStartXRow = this.createLabelCellRowInput('起点X', {
                    type: 'number',
                    min: 0,
                    max: 9999,
                    step: 0.1,
                    hideStep: false,
                    decimal: true,
                    unit: 'px',
                }, mxUtils.bind(this, function () {
                    return geo.sourcePoint.x;
                }), mxUtils.bind(this, function (value) {
                    value = parseFloat(value ? value : '0');
                    geo.sourcePoint.x = value;
                }));
                this.container.appendChild(setStartXRow.root);
                const setStartYRow = this.createLabelCellRowInput('起点Y', {
                    type: 'number',
                    min: 0,
                    max: 9999,
                    step: 0.1,
                    hideStep: false,
                    decimal: true,
                    unit: 'px',
                }, mxUtils.bind(this, function () {
                    return geo.sourcePoint.y;
                }), mxUtils.bind(this, function (value) {
                    value = parseFloat(value ? value : '0');
                    geo.sourcePoint.x = value;
                }));
                this.container.appendChild(setStartYRow.root);
            }

            if (geo != null && geo.targetPoint != null && graph.model.getTerminal(cell, false) == null) {
                const setEndXRow = this.createLabelCellRowInput('终点X', {
                    type: 'number',
                    min: 0,
                    max: 9999,
                    step: 0.1,
                    hideStep: false,
                    decimal: true,
                    unit: 'px',
                }, mxUtils.bind(this, function () {
                    return geo.targetPoint.x;
                }), mxUtils.bind(this, function (value) {
                    value = parseFloat(value ? value : '0');
                    geo.targetPoint.x = value;
                }));
                this.container.appendChild(setEndXRow.root);
                const setEndYRow = this.createLabelCellRowInput('终点Y', {
                    type: 'number',
                    min: 0,
                    max: 9999,
                    step: 0.1,
                    hideStep: false,
                    decimal: true,
                    unit: 'px',
                }, mxUtils.bind(this, function () {
                    return geo.targetPoint.y;
                }), mxUtils.bind(this, function (value) {
                    value = parseFloat(value ? value : '0');
                    geo.targetPoint.x = value;
                }));
                this.container.appendChild(setEndYRow.root);
            }
        }
    }
};

ElementStylePanel.prototype.addGeometryView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    if ((ss.resizable || ss.row || ss.cell) && !ss.containsLabel && ss.vertices.length === graph.getSelectionCount() && ss.width != null && ss.height != null) {
        if (!ss.row) {
            const setWidthRow = this.createLabelCellRowInput('宽度', {
                type: 'number',
                min: 0,
                max: 9999,
                step: 0.1,
                hideStep: false,
                decimal: true,
                unit: 'px',
            }, mxUtils.bind(this, function () {
                return this.inUnit(ss.width);
            }), mxUtils.bind(this, function (value) {
                value = parseFloat(value ? value : '0');
                this.callGeometryHandler(graph, ss, mxUtils.bind(this, function (geo, cell) {
                    if (graph.isTableCell(cell)) {
                        graph.setTableColumnWidth(cell, value - geo.width, true);
                        return true;
                    }
                    if (geo.width > 0) {
                        value = Math.max(1, this.fromUnit(value));
                        let aspect = mxUtils.getValue(ss.style, mxConstants.STYLE_ASPECT, null)
                        if (aspect === 'fixed') {
                            geo.height = Math.round((geo.height * value * 100) / geo.width) / 100;
                        }
                        geo.width = value;
                    }
                    return false;
                }));
            }));
            this.container.appendChild(setWidthRow.root);
        }

        const setHeightRow = this.createLabelCellRowInput('高度', {
            type: 'number',
            min: 0,
            max: 9999,
            step: 0.1,
            hideStep: false,
            decimal: true,
            unit: 'px',
        }, mxUtils.bind(this, function () {
            return this.inUnit(ss.height);
        }), mxUtils.bind(this, function (value) {
            value = parseFloat(value ? value : '0');
            this.callGeometryHandler(graph, ss, mxUtils.bind(this, function (geo, cell) {
                if (graph.isTableCell(cell)) {
                    cell = graph.getModel().getParent(cell);
                }
                if (graph.isTableRow(cell)) {
                    graph.setTableRowHeight(cell, value - geo.height);
                    return true;
                }
                if (geo.height > 0) {
                    let aspect = mxUtils.getValue(ss.style, mxConstants.STYLE_ASPECT, null)
                    if (aspect === 'fixed') {
                        geo.width = Math.round((geo.width * value * 100) / geo.height) / 100;
                    }
                    geo.height = value;
                }
                return false;
            }));
        }));
        this.container.appendChild(setHeightRow.root);
        if (!ss.cell && !ss.row) {
            const setAspectWHRow = this.createLabelCellRowSwitch('固定宽高比', {trueLabel: '固定', falseLabel: '不限'},
                mxUtils.bind(this, function () {
                    return mxUtils.getValue(ss.style, mxConstants.STYLE_ASPECT, null) === 'fixed';
                }), mxUtils.bind(this, function (val) {
                    graph.stopEditing(false);
                    graph.getModel().beginUpdate();
                    try {
                        let value = val ? 'fixed' : null;
                        graph.setCellStyles(mxConstants.STYLE_ASPECT, value, ss.cells);
                        this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_SPACING_BOTTOM], 'values', [value], 'cells', ss.cells));
                    } finally {
                        graph.getModel().endUpdate();
                    }
                }));
            this.container.appendChild(setAspectWHRow.root);

            const setAutoSizeRow = this.createLabelRowActionButtonsCell('自适应宽高', {
                options: [{key: 'autosize', title: mxResources.get('autosize')}]
            }, null, mxUtils.bind(this, function (val, evt) {
                this.editorUi.actions.get(val.key).funct(evt, evt);
            }));
            this.container.appendChild(setAutoSizeRow.root);
        }
    }
    if (ss.movable && ss.vertices.length === graph.getSelectionCount() && ss.vertices.length > 0 && ss.x != null && ss.y != null) {
        const setXRow = this.createLabelCellRowInput('X', {
            type: 'number',
            min: 0,
            max: 9999,
            step: 0.1,
            hideStep: false,
            decimal: true,
            unit: 'px',
        }, mxUtils.bind(this, function () {
            return ss.x;
        }), mxUtils.bind(this, function (value) {
            value = parseFloat(value ? value : '0');
            this.callGeometryHandler(graph, ss, mxUtils.bind(this, function (geo) {
                if (geo.relative) {
                    geo.offset.x = value;
                } else {
                    geo.x = value;
                }
                return false;
            }));
        }));
        this.container.appendChild(setXRow.root);
        const setYRow = this.createLabelCellRowInput('Y', {
            type: 'number',
            min: 0,
            max: 9999,
            step: 0.1,
            hideStep: false,
            decimal: true,
            unit: 'px',
        }, mxUtils.bind(this, function () {
            return ss.y;
        }), mxUtils.bind(this, function (value) {
            value = parseFloat(value ? value : '0');
            this.callGeometryHandler(graph, ss, mxUtils.bind(this, function (geo) {
                if (geo.relative) {
                    geo.offset.y = value;
                } else {
                    geo.y = value;
                }
                return false;
            }));
        }));
        this.container.appendChild(setYRow.root);
        let coordinateLabels = true;
        if (ss.edges.length === 0 && ss.vertices.length === 1) {
            let geo = graph.getCellGeometry(ss.vertices[0]);
            if (geo != null && geo.relative) {
                const setDxRow = this.createLabelCellRowInput('相对X', {
                    type: 'number',
                    min: 0,
                    max: 9999,
                    step: 1,
                    hideStep: true,
                    decimal: true,
                    unit: '%',
                }, mxUtils.bind(this, function () {
                    return Math.round(geo.x * 1000) / 10;
                }), mxUtils.bind(this, function (value) {
                    value = parseFloat(value ? value : '0');
                    graph.getModel().beginUpdate();
                    try {
                        geo = geo.clone();
                        geo.x = value / 100;
                        graph.getModel().setGeometry(ss.vertices[0], geo);
                    } finally {
                        graph.getModel().endUpdate();
                    }
                }));
                this.container.appendChild(setDxRow.root);
                if (graph.getModel().isEdge(graph.getModel().getParent(ss.vertices[0]))) {
                    coordinateLabels = false;
                    const setDyRow = this.createLabelCellRowInput('相对Y', {
                        type: 'number',
                        min: 0,
                        max: 9999,
                        step: 0.1,
                        hideStep: false,
                        decimal: true,
                        unit: 'px',
                    }, mxUtils.bind(this, function () {
                        return geo.y;
                    }), mxUtils.bind(this, function (value) {
                        value = parseFloat(value ? value : '0');
                        this.callGeometryHandler(graph, ss, mxUtils.bind(this, function (geo) {
                            geo.y = value;
                            return false;
                        }));
                    }));
                    this.container.appendChild(setDyRow.root);
                } else {
                    const setDYRow = this.createLabelCellRowInput('相对X', {
                        type: 'number',
                        min: 0,
                        max: 9999,
                        step: 1,
                        hideStep: true,
                        decimal: true,
                        unit: '%',
                    }, mxUtils.bind(this, function () {
                        return Math.round(geo.y * 1000) / 10;
                    }), mxUtils.bind(this, function (value) {
                        value = parseFloat(value ? value : '0');
                        graph.getModel().beginUpdate();
                        try {
                            geo = geo.clone();
                            geo.y = value / 100;
                            graph.getModel().setGeometry(ss.vertices[0], geo);
                        } finally {
                            graph.getModel().endUpdate();
                        }
                    }));
                    this.container.appendChild(setDYRow.root);
                }
            }
        }
        setXRow.changeLabel(coordinateLabels ? '坐标X' : mxResources.get('line'));
        setYRow.changeLabel(coordinateLabels ? '坐标Y' : mxResources.get('orthogonal'));
    }
};

ElementStylePanel.prototype.callGeometryHandler = function (graph, ss, fn) {
    graph.getModel().beginUpdate();
    try {
        let cells = ss.cells;
        for (let i = 0; i < cells.length; i++) {
            if (graph.getModel().isVertex(cells[i])) {
                let geo = graph.getCellGeometry(cells[i]);
                if (geo != null) {
                    geo = geo.clone();
                    if (!fn(geo, cells[i])) {
                        let state = graph.view.getState(cells[i]);
                        if (state != null && graph.isRecursiveVertexResize(state)) {
                            graph.resizeChildCells(cells[i], geo);
                        }
                        graph.getModel().setGeometry(cells[i], geo);
                        graph.constrainChildCells(cells[i]);
                    }
                }
            }
        }
    } finally {
        graph.getModel().endUpdate();
    }
};

ElementStylePanel.prototype.addLayerOpsView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    const setLayerOpsRow = this.createLabelRowActionButtonsCell('层次设置', {
        options: ['toFront', 'toBack', 'bringForward', 'sendBackward'].map(item => {
            return {key: item, title: mxResources.get(item)};
        })
    }, null, mxUtils.bind(this, function (val, evt) {
        this.editorUi.actions.get(val.key).funct(evt, evt);
    }));
    this.container.appendChild(setLayerOpsRow.root);
};

ElementStylePanel.prototype.addFillView = function (ss) {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    const fillKey = ss.style.shape === 'image' ? mxConstants.STYLE_IMAGE_BACKGROUND : mxConstants.STYLE_FILLCOLOR;
    const setFillEnableRow = this.createLabelCellRowSwitch('背景填充', {
        trueLabel: '显示',
        falseLabel: '透明'
    }, mxUtils.bind(this, function () {
        let color = ss.style[fillKey];
        return color && color !== mxConstants.NONE;
    }), mxUtils.bind(this, function (val) {
        const color = val ? '#FFFFFF' : mxConstants.NONE;
        graph.getModel().beginUpdate();
        try {
            const cells = this.editorUi.getSelectionState().cells;
            graph.setCellStyles(fillKey, color, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [fillKey], 'values', [color], 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
        setFillColorRow.root.style.display = val ? 'flex' : 'none';
        setGradientEnableRow.root.style.display = val ? 'flex' : 'none';
        setGradientColorRow.root.style.display = val && setGradientEnableRow.cell.getValueFn() ? 'flex' : 'none';
        setGradientDirectionRow.root.style.display = val && setFillEnableRow.cell.getValueFn() ? 'flex' : 'none';
        if (val) {
            setFillColorRow.cell.outerChangeValue(color);
        }
        graph.setCellStyles(fillKey, color, ss.cells);
    }));
    this.container.appendChild(setFillEnableRow.root);

    const setFillColorRow = this.createLabelCellRowColor('填充颜色', {}, mxUtils.bind(this, function () {
        let color = ss.style[fillKey];
        return color && color !== mxConstants.NONE ? color : '#FFFFFF';
    }), mxUtils.bind(this, function (color) {
        graph.getModel().beginUpdate();
        try {
            const cells = ss.cells;
            graph.setCellStyles(fillKey, color, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [fillKey], 'values', [color], 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
        // graph.setCellStyles(fillKey, color, ss.cells);
    }));
    this.container.appendChild(setFillColorRow.root);

    const setGradientEnableRow = this.createLabelCellRowSwitch('背景渐变', {
        trueLabel: '开启',
        falseLabel: '关闭'
    }, mxUtils.bind(this, function () {
        let color = ss.style[mxConstants.STYLE_GRADIENTCOLOR];
        return color && color !== mxConstants.NONE;
    }), mxUtils.bind(this, function (val) {
        const color = val ? '#000000' : mxConstants.NONE;
        graph.getModel().beginUpdate();
        try {
            const cells = this.editorUi.getSelectionState().cells;
            graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, color, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_GRADIENTCOLOR], 'values', [color], 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
        setGradientColorRow.root.style.display = val ? 'flex' : 'none';
        setGradientDirectionRow.root.style.display = val ? 'flex' : 'none';
        graph.updateCellStyles({gradientColor: color}, graph.getSelectionCells());
    }));
    this.container.appendChild(setGradientEnableRow.root);

    const setGradientColorRow = this.createLabelCellRowColor('渐变颜色', {}, mxUtils.bind(this, function () {
        let color = ss.style[mxConstants.STYLE_GRADIENTCOLOR];
        return color && color !== mxConstants.NONE ? color : '#000000';
    }), mxUtils.bind(this, function (color) {
        graph.getModel().beginUpdate();
        try {
            const cells = this.editorUi.getSelectionState().cells;
            graph.setCellStyles(mxConstants.STYLE_GRADIENTCOLOR, color, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_GRADIENTCOLOR], 'values', [color], 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
        graph.updateCellStyles({gradientColor: color}, graph.getSelectionCells());
    }));
    this.container.appendChild(setGradientColorRow.root);

    const setGradientDirectionRow = this.createLabelCellRowSelect('渐变方向', {
        options: [...graph.defaultDirections]
    }, mxUtils.bind(this, function () {
        let value = ss.style[mxConstants.STYLE_GRADIENT_DIRECTION];
        return value ? value : mxConstants.DIRECTION_SOUTH;
    }), mxUtils.bind(this, function (option) {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_GRADIENT_DIRECTION, option.key, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_GRADIENT_DIRECTION], 'values', [option.key], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setGradientDirectionRow.root);

    setFillColorRow.root.style.display = setFillEnableRow.cell.getValueFn() ? 'flex' : 'none';
    setGradientEnableRow.root.style.display = setFillEnableRow.cell.getValueFn() ? 'flex' : 'none';
    setGradientColorRow.root.style.display = setFillEnableRow.cell.getValueFn() && setGradientEnableRow.cell.getValueFn() ? 'flex' : 'none';
    setGradientDirectionRow.root.style.display = setFillEnableRow.cell.getValueFn() && setFillEnableRow.cell.getValueFn() ? 'flex' : 'none';
};

ElementStylePanel.prototype.addStrokeView = function (ss) {
    const isFlowPip = ss.style['enableFlow'] == 1 && ss.cells && ss.cells.length === 1 && ss.edges && ss.edges.length === 1 && ss.lineJumps;
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    const strokeKey = ss.style.shape === 'image' ? mxConstants.STYLE_IMAGE_BORDER : mxConstants.STYLE_STROKECOLOR;
    const label = isFlowPip ? '管道' : ss.style.shape === 'image' || (ss.style.shape && ss.style.shape.indexOf('mxgraph.rc') == 0) ? mxResources.get('border') : mxResources.get('line');
    const setStockEnableRow = this.createLabelCellRowSwitch(label, {
        trueLabel: '显示',
        falseLabel: '隐藏'
    }, mxUtils.bind(this, function () {
        let color = ss.style[strokeKey];
        return color && color !== mxConstants.NONE;
    }), mxUtils.bind(this, function (val) {
        const color = val ? graph.shapeForegroundColor : mxConstants.NONE;
        graph.getModel().beginUpdate();
        try {
            const cells = this.editorUi.getSelectionState().cells;
            graph.setCellStyles(strokeKey, color, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [strokeKey], 'values', [color], 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
        setStockColorRow.root.style.display = val ? 'flex' : 'none';
        if (val) {
            setStockColorRow.cell.outerChangeValue(color);
        }
        graph.setCellStyles(strokeKey, color, ss.cells);
        if (color == null || color === mxConstants.NONE) {
            let tableCells = [];
            for (let i = 0; i < ss.cells.length; i++) {
                if (graph.isTableCell(ss.cells[i]) || graph.isTableRow(ss.cells[i])) {
                    tableCells.push(ss.cells[i]);
                }
            }
            if (tableCells.length > 0) {
                graph.setCellStyles(strokeKey, 'inherit', tableCells);
            }
        }
    }));
    this.container.appendChild(setStockEnableRow.root);
    if(isFlowPip){
        mxUtils.hideElement(setStockEnableRow.root);
    }

    const setStockColorRow = this.createLabelCellRowColor(label + '颜色', {}, mxUtils.bind(this, function () {
        let color = ss.style[strokeKey];
        return color && color !== mxConstants.NONE ? color : graph.shapeForegroundColor;
    }), mxUtils.bind(this, function (color) {
        graph.getModel().beginUpdate();
        try {
            const cells = this.editorUi.getSelectionState().cells;
            graph.setCellStyles(strokeKey, color, cells);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [strokeKey], 'values', [color], 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
        graph.setCellStyles(strokeKey, color, ss.cells);
        if (color == null || color === mxConstants.NONE) {
            let tableCells = [];
            for (let i = 0; i < ss.cells.length; i++) {
                if (graph.isTableCell(ss.cells[i]) || graph.isTableRow(ss.cells[i])) {
                    tableCells.push(ss.cells[i]);
                }
            }
            if (tableCells.length > 0) {
                graph.setCellStyles(strokeKey, 'inherit', tableCells);
            }
        }
    }));
    this.container.appendChild(setStockColorRow.root);
    //setStockColorRow.root.style.display = setStockEnableRow.cell.getValueFn() ? 'flex' : 'none';
    if(!setStockEnableRow.cell.getValueFn() || isFlowPip){
        mxUtils.hideElement(setStockColorRow.root);
    }


    // 线条转角样式
    if (ss.style.shape === 'connector' || ss.style.shape === 'filledEdge' || ss.style.shape === 'wire') {
        const setLineCornerStyleRow = this.createLabelCellRowSelect(label + '转角', {
            options: [{key: 'sharp', title: '直角'}, {key: 'rounded', title: '圆角'}, {key: 'curved', title: '曲线'}]
        }, mxUtils.bind(this, function () {
            if (mxUtils.getValue(ss.style, mxConstants.STYLE_CURVED, null) === '1') {
                return 'curved';
            } else if (mxUtils.getValue(ss.style, mxConstants.STYLE_ROUNDED, null) === '1') {
                return 'rounded';
            }
            return 'sharp';
        }), mxUtils.bind(this, function (option) {
            graph.getModel().beginUpdate();
            try {
                let keys = [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED];
                let values = ['0', null];
                if (option.key === 'rounded') {
                    values = ['1', null];
                } else if (option.key === 'curved') {
                    values = [null, '1'];
                }
                for (let i = 0; i < keys.length; i++) {
                    graph.setCellStyles(keys[i], values[i], ss.cells);
                }
                ui.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values, 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setLineCornerStyleRow.root);
    }

    const setBorderStyleRow = this.createLabelCellRowSelect(label + '样式', {
        options: [
            {key: 'solid', title: '实线'},
            {key: 'dash1', title: '虚线1'},
            {key: 'dash2', title: '虚线2'},
            {key: 'dash3', title: '虚线3'},
            {key: 'dot1', title: '点线1'},
            {key: 'dot2', title: '点线2'},
            {key: 'dot3', title: '点线3'},
        ]
    }, mxUtils.bind(this, function () {
        if (mxUtils.getValue(ss.style, mxConstants.STYLE_DASHED, null) !== 1) return 'solid';
        let style_dash_pattern = mxUtils.getValue(ss.style, mxConstants.STYLE_DASH_PATTERN, null);
        if (style_dash_pattern == null) return 'dash1';
        if (style_dash_pattern === '8 8') return 'dash2';
        if (style_dash_pattern === '12 12') return 'dash3';
        if (style_dash_pattern === '1 1') return 'dot1';
        if (style_dash_pattern === '1 2') return 'dot2';
        if (style_dash_pattern === '1 4') return 'dot3';
        return 'solid';
    }), mxUtils.bind(this, function (option) {
        let values = [null, null];
        if (option.key === 'solid') values = [null, null];
        if (option.key === 'dash1') values = ['1', null];
        if (option.key === 'dash2') values = ['1', '8 8'];
        if (option.key === 'dash3') values = ['1', '12 12'];
        if (option.key === 'dot1') values = ['1', '1 1'];
        if (option.key === 'dot2') values = ['1', '1 2'];
        if (option.key === 'dot3') values = ['1', '1 4'];
        let keys = [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN];
        graph.getModel().beginUpdate();
        try {
            const cells = ss.cells;
            let autoSizeCells = false;
            for (let i = 0; i < keys.length; i++) {
                graph.setCellStyles(keys[i], values[i], cells);
            }
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values, 'cells', cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setBorderStyleRow.root);
    if(isFlowPip){
        mxUtils.hideElement(setBorderStyleRow.root);
    }

    const setBorderWidthRow = this.createLabelCellRowInput(label + '宽度', {
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        hideStep: false,
        decimal: false,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        let tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_STROKEWIDTH, 1));
        return tmp;
    }), mxUtils.bind(this, function (val) {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, val, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_STROKEWIDTH], 'values', [val], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setBorderWidthRow.root);
    if(isFlowPip){
        mxUtils.hideElement(setBorderWidthRow.root);
    }

    if (ss.edges.length === ss.cells.length) {
        const setLineConnectionStyleRow = this.createLabelRowSelectClassIconCell(label + '连接样式', {
                options: [
                    {
                        title: 'geSprite geSprite-connection',
                        key: 'connection',
                        keys: [mxConstants.STYLE_SHAPE, mxConstants.STYLE_STARTSIZE, mxConstants.STYLE_ENDSIZE, 'width'],
                        values: [null, null, null, null]
                    },
                    {
                        title: 'geSprite geSprite-linkedge',
                        key: 'linkedge',
                        keys: [mxConstants.STYLE_SHAPE, mxConstants.STYLE_STARTSIZE, mxConstants.STYLE_ENDSIZE, 'width'],
                        values: ['link', null, null, null]
                    },
                    {
                        title: 'geSprite geSprite-arrow',
                        key: 'arrow',
                        keys: [mxConstants.STYLE_SHAPE, mxConstants.STYLE_STARTSIZE, mxConstants.STYLE_ENDSIZE, 'width'],
                        values: ['flexArrow', null, null, null]
                    },
                    {
                        title: 'geSprite geSprite-simplearrow',
                        key: 'simplearrow',
                        keys: [mxConstants.STYLE_SHAPE, mxConstants.STYLE_STARTSIZE, mxConstants.STYLE_ENDSIZE, 'width'],
                        values: ['arrow', null, null, null]
                    },
                ],
            },
            mxUtils.bind(this, function () {
                return ss.style.shape === 'link' ? 'linkedge' :
                    ss.style.shape === 'flexArrow' ? 'arrow' :
                        ss.style.shape === 'arrow' ? 'simplearrow' : 'connection';
            }),
            mxUtils.bind(this, function (option) {
                graph.getModel().beginUpdate();
                try {
                    for (let i = 0; i < option.keys.length; i++) {
                        graph.setCellStyles(option.keys[i], option.values[i], ss.cells);
                    }
                    this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', option.keys, 'values', option.values, 'cells', ss.cells));
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
        this.container.appendChild(setLineConnectionStyleRow.root);

        let options = [];
        if (setLineConnectionStyleRow.cell.getValueFn() !== 'simplearrow') {
            options = [
                {
                    title: 'geSprite geSprite-straight',
                    key: 'straight',
                    keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                    values: [null, null, null]
                },
                {
                    title: 'geSprite geSprite-orthogonal',
                    key: 'orthogonal',
                    keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                    values: ['orthogonalEdgeStyle', null, null]
                },
                {
                    title: 'geSprite geSprite-horizontalelbow',
                    key: 'horizontalelbow',
                    keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                    values: ['elbowEdgeStyle', null, null, null]
                },
                {
                    title: 'geSprite geSprite-verticalelbow',
                    key: 'verticalelbow',
                    keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                    values: ['elbowEdgeStyle', 'vertical', null, null]
                },
                {
                    title: 'geSprite geSprite-horizontalisometric',
                    key: 'horizontalisometric',
                    keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                    values: ['isometricEdgeStyle', null, null, null]
                },
                {
                    title: 'geSprite geSprite-verticalisometric',
                    key: 'verticalisometric',
                    keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_ELBOW, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                    values: ['isometricEdgeStyle', 'vertical', null, null]
                },
            ];
            if (ss.style.shape === 'connector') {
                options.push({
                    title: 'geSprite geSprite-curved',
                    key: 'curved',
                    keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                    values: ['orthogonalEdgeStyle', '1', null]
                });
            }
            options.push({
                title: 'geSprite geSprite-entity',
                key: 'entity',
                keys: [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE],
                values: ['entityRelationEdgeStyle', null, null]
            });
            const setEdgeStyleRow = this.createLabelRowSelectClassIconCell(label + '连接航点', {
                    options: options,
                },
                mxUtils.bind(this, function () {
                    let es = mxUtils.getValue(ss.style, mxConstants.STYLE_EDGE, null);
                    if (mxUtils.getValue(ss.style, mxConstants.STYLE_NOEDGESTYLE, null) == '1') {
                        es = null;
                    }
                    if (es === 'orthogonalEdgeStyle' && mxUtils.getValue(ss.style, mxConstants.STYLE_CURVED, null) == '1') {
                        return 'curved';
                    }
                    if (es == 'straight' || es == 'none' || es == null) {
                        return 'straight';
                    }
                    if (es == 'entityRelationEdgeStyle') {
                        return 'entity';
                    }
                    if (es == 'elbowEdgeStyle') {
                        return mxUtils.getValue(ss.style, mxConstants.STYLE_ELBOW, null) == 'vertical' ? 'verticalelbow' : 'horizontalelbow';
                    }
                    if (es == 'isometricEdgeStyle') {
                        return mxUtils.getValue(ss.style, mxConstants.STYLE_ELBOW, null) == 'vertical' ? 'verticalisometric' : 'horizontalisometric';
                    }
                    return 'orthogonal';
                }),
                mxUtils.bind(this, function (option) {
                    graph.getModel().beginUpdate();
                    try {
                        for (let i = 0; i < option.keys.length; i++) {
                            graph.setCellStyles(option.keys[i], option.values[i], ss.cells);
                        }
                        this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', option.keys, 'values', option.values, 'cells', ss.cells));
                    } finally {
                        graph.getModel().endUpdate();
                    }
                }));
            this.container.appendChild(setEdgeStyleRow.root);
        }

        if (setLineConnectionStyleRow.cell.getValueFn() !== 'linkedge' && setLineConnectionStyleRow.cell.getValueFn() !== 'simplearrow') {
            options = [];
            if (ss.style.shape == 'connector' || ss.style.shape == 'flexArrow' || ss.style.shape == 'filledEdge') {
                if (ss.style.shape == 'connector' || ss.style.shape == 'filledEdge') {
                    options = [
                        {
                            title: '',
                            key: 'none',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.NONE, 0]
                        },
                        {
                            title: 'geSprite geSprite-startclassic',
                            key: 'startclassic',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_CLASSIC, 1]
                        },
                        {
                            title: 'geSprite geSprite-startclassicthin',
                            key: 'startclassicthin',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_CLASSIC_THIN, 1]
                        },
                        {
                            title: 'geSprite geSprite-startopen',
                            key: 'startopen',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_OPEN, 0]
                        },
                        {
                            title: 'geSprite geSprite-startopenthin',
                            key: 'startopenthin',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_OPEN_THIN, 0]
                        },
                        {
                            title: 'geSprite geSprite-startopenasync',
                            key: 'startopenasync',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['openAsync', 0]
                        },
                        {
                            title: 'geSprite geSprite-startblock',
                            key: 'startblock',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_BLOCK, 1]
                        },
                        {
                            title: 'geSprite geSprite-startblockthin',
                            key: 'startblockthin',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_BLOCK_THIN, 1]
                        },
                        {
                            title: 'geSprite geSprite-startasync',
                            key: 'startasync',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['async', 1]
                        },
                        {
                            title: 'geSprite geSprite-startoval',
                            key: 'startoval',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_OVAL, 1]
                        },
                        {
                            title: 'geSprite geSprite-startdiamond',
                            key: 'startdiamond',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_DIAMOND, 1]
                        },
                        {
                            title: 'geSprite geSprite-startthindiamond',
                            key: 'startthindiamond',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_DIAMOND_THIN, 1]
                        },
                        {
                            title: 'geSprite geSprite-startclassictrans',
                            key: 'startclassictrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_CLASSIC, 0]
                        },
                        {
                            title: 'geSprite geSprite-startclassicthintrans',
                            key: 'startclassicthintrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_CLASSIC_THIN, 0]
                        },
                        {
                            title: 'geSprite geSprite-startblocktrans',
                            key: 'startblocktrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_BLOCK, 0]
                        },
                        {
                            title: 'geSprite geSprite-startblockthintrans',
                            key: 'startblockthintrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_BLOCK_THIN, 0]
                        },
                        {
                            title: 'geSprite geSprite-startasynctrans',
                            key: 'startasynctrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['async', 0]
                        },
                        {
                            title: 'geSprite geSprite-startovaltrans',
                            key: 'startovaltrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_OVAL, 0]
                        },
                        {
                            title: 'geSprite geSprite-startdiamondtrans',
                            key: 'startdiamondtrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_DIAMOND, 0]
                        },
                        {
                            title: 'geSprite geSprite-startthindiamondtrans',
                            key: 'startthindiamondtrans',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.ARROW_DIAMOND_THIN, 0]
                        },
                        {
                            title: 'geSprite geSvgSprite geFlipSprite geSprite-box',
                            key: 'box',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['box', 0]
                        },
                        {
                            title: 'geSprite geSvgSprite geFlipSprite geSprite-halfCircle',
                            key: 'halfCircle',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['halfCircle', 0]
                        },
                        {
                            title: 'geSprite geSprite-startdash',
                            key: 'startdash',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['dash', 0]
                        },
                        {
                            title: 'geSprite geSprite-startcross',
                            key: 'startcross',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['cross', 0]
                        },
                        {
                            title: 'geSprite geSprite-startcircleplus',
                            key: 'startcircleplus',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['circlePlus', 0]
                        },
                        {
                            title: 'geSprite geSprite-startcircle',
                            key: 'startcircle',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['circle', 0]
                        },
                        {
                            title: 'geSprite geSprite-starterone',
                            key: 'starterone',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['ERone', 0]
                        },
                        {
                            title: 'geSprite geSprite-starteronetoone',
                            key: 'starteronetoone',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['ERmandOne', 0]
                        },
                        {
                            title: 'geSprite geSprite-startermany',
                            key: 'startermany',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['ERmany', 0]
                        },
                        {
                            title: 'geSprite geSprite-starteronetomany',
                            key: 'starteronetomany',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['ERoneToMany', 0]
                        },
                        {
                            title: 'geSprite geSprite-starteroneopt',
                            key: 'starteroneopt',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['ERzeroToOne', 0]
                        },
                        {
                            title: 'geSprite geSprite-startermanyopt',
                            key: 'startermanyopt',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: ['ERzeroToMany', 0]
                        },
                    ];
                } else {
                    options = [
                        {
                            title: '',
                            key: 'none',
                            keys: [mxConstants.STYLE_STARTARROW, 'startFill'],
                            values: [mxConstants.NONE, 0]
                        },
                        {
                            title: 'geSprite geSprite-startblocktrans',
                            key: 'startblocktrans',
                            keys: [mxConstants.STYLE_STARTARROW],
                            values: [mxConstants.ARROW_BLOCK]
                        },
                    ]
                }
            }
            const setLineStartStyleRow = this.createLabelRowSelectClassIconCell('起点箭头样式', {
                    options: options,
                },
                mxUtils.bind(this, function () {
                    let marker = mxUtils.getValue(ss.style, mxConstants.STYLE_STARTARROW, null);
                    let fill = mxUtils.getValue(ss.style, 'startFill', '1');
                    let shape = ss.style.shape;
                    let prefix = 'start';
                    if (shape == 'flexArrow') return marker != null && marker != mxConstants.NONE ? prefix + 'blocktrans' : 'none';
                    // SVG marker sprites
                    if (marker == 'box' || marker == 'halfCircle') return marker;
                    if (marker == mxConstants.ARROW_CLASSIC) return fill == '1' ? prefix + 'classic' : prefix + 'classictrans';
                    if (marker == mxConstants.ARROW_CLASSIC_THIN) return fill == '1' ? prefix + 'classicthin' : prefix + 'classicthintrans';
                    if (marker == mxConstants.ARROW_OPEN) return prefix + 'open';
                    if (marker == mxConstants.ARROW_OPEN_THIN) return prefix + 'openthin';
                    if (marker == mxConstants.ARROW_BLOCK) return fill == '1' ? prefix + 'block' : prefix + 'blocktrans';
                    if (marker == mxConstants.ARROW_BLOCK_THIN) return fill == '1' ? prefix + 'blockthin' : prefix + 'blockthintrans';
                    if (marker == mxConstants.ARROW_OVAL) return fill == '1' ? prefix + 'oval' : prefix + 'ovaltrans';
                    if (marker == mxConstants.ARROW_DIAMOND) return fill == '1' ? prefix + 'diamond' : prefix + 'diamondtrans';
                    if (marker == mxConstants.ARROW_DIAMOND_THIN) return fill == '1' ? prefix + 'thindiamond' : prefix + 'thindiamondtrans';
                    if (marker == 'openAsync') return prefix + 'openasync';
                    if (marker == 'dash') return prefix + 'dash';
                    if (marker == 'cross') return prefix + 'cross';
                    if (marker == 'async') return fill == '1' ? prefix + 'async' : prefix + 'asynctrans';
                    if (marker == 'circle' || marker == 'circlePlus') return fill == '1' || marker == 'circle' ? prefix + 'circle' : prefix + 'circleplus';
                    if (marker == 'ERone') return prefix + 'erone';
                    if (marker == 'ERmandOne') return prefix + 'eronetoone';
                    if (marker == 'ERmany') return prefix + 'ermany';
                    if (marker == 'ERoneToMany') return prefix + 'eronetomany';
                    if (marker == 'ERzeroToOne') return prefix + 'eroneopt';
                    if (marker == 'ERzeroToMany') return prefix + 'ermanyopt';
                    return 'none';
                }),
                mxUtils.bind(this, function (option) {
                    graph.getModel().beginUpdate();
                    try {
                        for (let i = 0; i < option.keys.length; i++) {
                            graph.setCellStyles(option.keys[i], option.values[i], ss.cells);
                        }
                        this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', option.keys, 'values', option.values, 'cells', ss.cells));
                    } finally {
                        graph.getModel().endUpdate();
                    }
                }));
            this.container.appendChild(setLineStartStyleRow.root);

            const setLineStartSpaceRow = this.createLabelCellRowInput('起点箭头间距', {
                type: 'number',
                min: 0,
                max: 100,
                step: 1,
                hideStep: false,
                decimal: false,
                unit: 'px',
            }, mxUtils.bind(this, function () {
                return parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_SOURCE_PERIMETER_SPACING, 0));
            }), mxUtils.bind(this, function (val) {
                graph.getModel().beginUpdate();
                try {
                    graph.setCellStyles(mxConstants.STYLE_SOURCE_PERIMETER_SPACING, val, ss.cells);
                    ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_SOURCE_PERIMETER_SPACING], 'values', [val], 'cells', ss.cells));
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
            this.container.appendChild(setLineStartSpaceRow.root);

            const setLineStartWidthRow = this.createLabelCellRowInput('起点箭头大小', {
                type: 'number',
                min: 0,
                max: 100,
                step: 1,
                hideStep: false,
                decimal: false,
                unit: 'px',
            }, mxUtils.bind(this, function () {
                return parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_MARKERSIZE));
            }), mxUtils.bind(this, function (val) {
                graph.getModel().beginUpdate();
                try {
                    graph.setCellStyles(mxConstants.STYLE_STARTSIZE, val, ss.cells);
                    ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_STARTSIZE], 'values', [val], 'cells', ss.cells));
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
            this.container.appendChild(setLineStartWidthRow.root);


            options = [];
            if (ss.style.shape == 'connector' || ss.style.shape == 'flexArrow' || ss.style.shape == 'filledEdge') {
                if (ss.style.shape == 'connector' || ss.style.shape == 'filledEdge') {
                    options = [
                        {
                            title: '',
                            key: 'none',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.NONE, 0]
                        },
                        {
                            title: 'geSprite geSprite-endclassic',
                            key: 'endclassic',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_CLASSIC, 1]
                        },
                        {
                            title: 'geSprite geSprite-endclassicthin',
                            key: 'endclassicthin',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_CLASSIC_THIN, 1]
                        },
                        {
                            title: 'geSprite geSprite-endopen',
                            key: 'endopen',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_OPEN, 0]
                        },
                        {
                            title: 'geSprite geSprite-endopenthin',
                            key: 'endopenthin',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_OPEN_THIN, 0]
                        },
                        {
                            title: 'geSprite geSprite-endopenasync',
                            key: 'endopenasync',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['openAsync', 0]
                        },
                        {
                            title: 'geSprite geSprite-endblock',
                            key: 'endblock',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_BLOCK, 1]
                        },
                        {
                            title: 'geSprite geSprite-endblockthin',
                            key: 'endblockthin',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_BLOCK_THIN, 1]
                        },
                        {
                            title: 'geSprite geSprite-endasync',
                            key: 'endasync',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['async', 1]
                        },
                        {
                            title: 'geSprite geSprite-endoval',
                            key: 'endoval',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_OVAL, 1]
                        },
                        {
                            title: 'geSprite geSprite-enddiamond',
                            key: 'enddiamond',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_DIAMOND, 1]
                        },
                        {
                            title: 'geSprite geSprite-endthindiamond',
                            key: 'endthindiamond',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_DIAMOND_THIN, 1]
                        },
                        {
                            title: 'geSprite geSprite-endclassictrans',
                            key: 'endclassictrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_CLASSIC, 0]
                        },
                        {
                            title: 'geSprite geSprite-endclassicthintrans',
                            key: 'endclassicthintrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_CLASSIC_THIN, 0]
                        },
                        {
                            title: 'geSprite geSprite-endblocktrans',
                            key: 'endblocktrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_BLOCK, 0]
                        },
                        {
                            title: 'geSprite geSprite-endblockthintrans',
                            key: 'endblockthintrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_BLOCK_THIN, 0]
                        },
                        {
                            title: 'geSprite geSprite-endasynctrans',
                            key: 'endasynctrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['async', 0]
                        },
                        {
                            title: 'geSprite geSprite-endovaltrans',
                            key: 'endovaltrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_OVAL, 0]
                        },
                        {
                            title: 'geSprite geSprite-enddiamondtrans',
                            key: 'enddiamondtrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_DIAMOND, 0]
                        },
                        {
                            title: 'geSprite geSprite-endthindiamondtrans',
                            key: 'endthindiamondtrans',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.ARROW_DIAMOND_THIN, 0]
                        },
                        {
                            title: 'geSprite geSvgSprite geFlipSprite geSprite-box',
                            key: 'box',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['box', 0]
                        },
                        {
                            title: 'geSprite geSvgSprite geFlipSprite geSprite-halfCircle',
                            key: 'halfCircle',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['halfCircle', 0]
                        },
                        {
                            title: 'geSprite geSprite-enddash',
                            key: 'enddash',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['dash', 0]
                        },
                        {
                            title: 'geSprite geSprite-endcross',
                            key: 'endcross',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['cross', 0]
                        },
                        {
                            title: 'geSprite geSprite-endcircleplus',
                            key: 'endcircleplus',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['circlePlus', 0]
                        },
                        {
                            title: 'geSprite geSprite-endcircle',
                            key: 'endcircle',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['circle', 0]
                        },
                        {
                            title: 'geSprite geSprite-enderone',
                            key: 'enderone',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['ERone', 0]
                        },
                        {
                            title: 'geSprite geSprite-enderonetoone',
                            key: 'enderonetoone',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['ERmandOne', 0]
                        },
                        {
                            title: 'geSprite geSprite-endermany',
                            key: 'endermany',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['ERmany', 0]
                        },
                        {
                            title: 'geSprite geSprite-enderonetomany',
                            key: 'enderonetomany',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['ERoneToMany', 0]
                        },
                        {
                            title: 'geSprite geSprite-enderoneopt',
                            key: 'enderoneopt',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['ERzeroToOne', 0]
                        },
                        {
                            title: 'geSprite geSprite-endermanyopt',
                            key: 'endermanyopt',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: ['ERzeroToMany', 0]
                        },
                    ];
                } else {
                    options = [
                        {
                            title: '',
                            key: 'none',
                            keys: [mxConstants.STYLE_ENDARROW, 'endFill'],
                            values: [mxConstants.NONE, 0]
                        },
                        {
                            title: 'geSprite geSprite-endblocktrans',
                            key: 'endblocktrans',
                            keys: [mxConstants.STYLE_ENDARROW],
                            values: [mxConstants.ARROW_BLOCK]
                        },
                    ]
                }
            }

            const setLineEndStyleRow = this.createLabelRowSelectClassIconCell('终点箭头样式', {
                    options: options,
                },
                mxUtils.bind(this, function () {
                    let marker = mxUtils.getValue(ss.style, mxConstants.STYLE_ENDARROW, null);
                    let fill = mxUtils.getValue(ss.style, 'endFill', '1');
                    let shape = ss.style.shape;
                    let prefix = 'end';
                    if (shape == 'flexArrow') return marker != null && marker != mxConstants.NONE ? prefix + 'blocktrans' : 'none';
                    // SVG marker sprites
                    if (marker == 'box' || marker == 'halfCircle') return marker;
                    if (marker == mxConstants.ARROW_CLASSIC) return fill == '1' ? prefix + 'classic' : prefix + 'classictrans';
                    if (marker == mxConstants.ARROW_CLASSIC_THIN) return fill == '1' ? prefix + 'classicthin' : prefix + 'classicthintrans';
                    if (marker == mxConstants.ARROW_OPEN) return prefix + 'open';
                    if (marker == mxConstants.ARROW_OPEN_THIN) return prefix + 'openthin';
                    if (marker == mxConstants.ARROW_BLOCK) return fill == '1' ? prefix + 'block' : prefix + 'blocktrans';
                    if (marker == mxConstants.ARROW_BLOCK_THIN) return fill == '1' ? prefix + 'blockthin' : prefix + 'blockthintrans';
                    if (marker == mxConstants.ARROW_OVAL) return fill == '1' ? prefix + 'oval' : prefix + 'ovaltrans';
                    if (marker == mxConstants.ARROW_DIAMOND) return fill == '1' ? prefix + 'diamond' : prefix + 'diamondtrans';
                    if (marker == mxConstants.ARROW_DIAMOND_THIN) return fill == '1' ? prefix + 'thindiamond' : prefix + 'thindiamondtrans';
                    if (marker == 'openAsync') return prefix + 'openasync';
                    if (marker == 'dash') return prefix + 'dash';
                    if (marker == 'cross') return prefix + 'cross';
                    if (marker == 'async') return fill == '1' ? prefix + 'async' : prefix + 'asynctrans';
                    if (marker == 'circle' || marker == 'circlePlus') return fill == '1' || marker == 'circle' ? prefix + 'circle' : prefix + 'circleplus';
                    if (marker == 'ERone') return prefix + 'erone';
                    if (marker == 'ERmandOne') return prefix + 'eronetoone';
                    if (marker == 'ERmany') return prefix + 'ermany';
                    if (marker == 'ERoneToMany') return prefix + 'eronetomany';
                    if (marker == 'ERzeroToOne') return prefix + 'eroneopt';
                    if (marker == 'ERzeroToMany') return prefix + 'ermanyopt';
                    return 'none';
                }),
                mxUtils.bind(this, function (option) {
                    graph.getModel().beginUpdate();
                    try {
                        for (let i = 0; i < option.keys.length; i++) {
                            graph.setCellStyles(option.keys[i], option.values[i], ss.cells);
                        }
                        this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', option.keys, 'values', option.values, 'cells', ss.cells));
                    } finally {
                        graph.getModel().endUpdate();
                    }
                }));
            this.container.appendChild(setLineEndStyleRow.root);

            const setLineEndSpaceRow = this.createLabelCellRowInput('终点箭头间距', {
                type: 'number',
                min: 0,
                max: 100,
                step: 1,
                hideStep: false,
                decimal: false,
                unit: 'px',
            }, mxUtils.bind(this, function () {
                return parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_TARGET_PERIMETER_SPACING, 0));
            }), mxUtils.bind(this, function (val) {
                graph.getModel().beginUpdate();
                try {
                    graph.setCellStyles(mxConstants.STYLE_TARGET_PERIMETER_SPACING, val, ss.cells);
                    ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_TARGET_PERIMETER_SPACING], 'values', [val], 'cells', ss.cells));
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
            this.container.appendChild(setLineEndSpaceRow.root);

            const setLineEndWidthRow = this.createLabelCellRowInput('终点箭头大小', {
                type: 'number',
                min: 0,
                max: 100,
                step: 1,
                hideStep: false,
                decimal: false,
                unit: 'px',
            }, mxUtils.bind(this, function () {
                return parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE));
            }), mxUtils.bind(this, function (val) {
                graph.getModel().beginUpdate();
                try {
                    graph.setCellStyles(mxConstants.STYLE_ENDSIZE, val, ss.cells);
                    ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ENDSIZE], 'values', [val], 'cells', ss.cells));
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
            this.container.appendChild(setLineEndWidthRow.root);
        }

    } else if (ss.vertices.length === ss.cells.length) {
        const setPerimeterWidthRow = this.createLabelCellRowInput('边框间距', {
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            hideStep: false,
            decimal: false,
            unit: 'px',
        }, mxUtils.bind(this, function () {
            let tmp = parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_PERIMETER_SPACING, 0));
            return tmp;
        }), mxUtils.bind(this, function (val) {
            graph.setCellStyles(mxConstants.STYLE_PERIMETER_SPACING, val, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_PERIMETER_SPACING], 'values', [val], 'cells', ss.cells));
        }));
        this.container.appendChild(setPerimeterWidthRow.root);
    }

};

ElementStylePanel.prototype.addLineJumps = function (ss) {
    const isLine = ss.cells && ss.cells.length === 1 && ss.edges && ss.edges.length === 1 && ss.lineJumps;
    if(isLine){
        const graph = this.editorUi.editor.graph;
        const ui = this.editorUi;
        const setLineJumpsStyleRow = this.createLabelCellRowSelect('跳线方式', {
            options: [{key: 'none', title: '无'}, {key: 'arc', title: '圆弧'}, {key: 'gap', title: '间隙'}, {
                key: 'sharp',
                title: '锐利'
            }, {key: 'line', title: '线条'}]
        }, mxUtils.bind(this, function () {
            return mxUtils.getValue(ss.style, 'jumpStyle', 'none');
        }), mxUtils.bind(this, function (option) {
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles('jumpStyle', option.key, ss.cells);
                ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['jumpStyle'], 'values', [option.key], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setLineJumpsStyleRow.root);
    
        const setLineJumpsWidthRow = this.createLabelCellRowInput('跳线大小', {
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            hideStep: false,
            decimal: false,
            unit: 'px',
        }, mxUtils.bind(this, function () {
            return parseInt(mxUtils.getValue(ss.style, 'jumpSize', Graph.defaultJumpSize));
        }), mxUtils.bind(this, function (val) {
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles('jumpSize', val, ss.cells);
                ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['jumpSize'], 'values', [val], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setLineJumpsWidthRow.root);
    }
};

ElementStylePanel.prototype.addSingleLockedView = function () {
    const graph = this.editorUi.editor.graph;
    const ui = this.editorUi;
    const button = this.createTag('button', 'rcui-btn rcui-btn-normal');
    const icon = this.createTag('i', 'rcui-icon rcui-icon-password');
    button.appendChild(icon);
    mxUtils.write(button, '解锁');
    mxEvent.addListener(button, 'click', mxUtils.bind(this, function (evt) {
        const action = this.editorUi.actions.get('lockUnlock');
        action.funct(evt, evt);
    }));
    this.container.appendChild(button);
};
