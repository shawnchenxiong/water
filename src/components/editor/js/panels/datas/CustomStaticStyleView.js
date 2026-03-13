/* eslint-disable */

import {mxEventObject, mxUtils, mxEvent} from "../../../core/mxgraph";
import BaseFormatPanel from "../BaseFormatPanel";
import api from '../../utils/api';

import {StaticStylePropMap} from './StaticPropMap'

export default CustomStaticStyleView;

function CustomStaticStyleView(format) {
    let container = this.createTag('div', 'rcui-dynamic-data-panel');
    container.style.cssText = `padding: 0px;box-sizing: border-box;background:transparent`;
    BaseFormatPanel.call(this, format, format.editorUi, container);
    this.init();
}

mxUtils.extend(CustomStaticStyleView, BaseFormatPanel);

CustomStaticStyleView.prototype.init = function () {
  const graph = this.editorUi.editor.graph;
    const ss = this.editorUi.getSelectionState();
    let showComm = false;
    if (ss.cells && ss.cells.length === 1 && ss.vertices && ss.vertices.length === 1) {
        let cellStyle = graph.getCellStyle(ss.cells[0]);
        let rcSprop = mxUtils.getValue(cellStyle, 'rcSprop', null);
        if (mxUtils.isNotNullOrUndefined(rcSprop) && rcSprop.trim().length > 0) {
            try {
                rcSprop = rcSprop.trim().split(',');
                if (rcSprop.length > 0) {
                    for (let i = 0; i < rcSprop.length; i++) {
                        let prop = JSON.parse(JSON.stringify(StaticStylePropMap[rcSprop[i]]));
                        if (mxUtils.isNotNullOrUndefined(prop)) {
                            this.genCellWithProp(prop);
                        }
                    }
                }
            } catch (e) {
                console.log('解析参数异常', e);
            }
        }
        showComm = false;
    }
    if(ss.cells && ss.cells.length === 1 && ss.edges && ss.edges.length === 1 && ss.lineJumps){
        let cellStyle = graph.getCellStyle(ss.cells[0]);
        let rcCommonSprops = [];
        if(cellStyle.enableFlow == '1'){
            rcCommonSprops.push(...[
                'flowFluidWidth', 'flowFluidColor','flowPipWidth',
                'flowPipDashWidth','flowPipColor','flowDirection',
                'pipRound', 'flowRound'
            ]);
        }
        if(mxUtils.isNotNullOrUndefined(cellStyle.igSprop)){
            const ignoreArr = cellStyle.igSprop.split(',');
            rcCommonSprops = rcCommonSprops.filter(item => ignoreArr.indexOf(item) ===-1);
        }
        for (let i = 0; i < rcCommonSprops.length; i++) {
            let prop = JSON.parse(JSON.stringify(StaticStylePropMap[rcCommonSprops[i]]));
            if (mxUtils.isNotNullOrUndefined(prop)) {
                this.genCellWithProp(prop);
            }
        }
        showComm = false;
    }
    if(showComm){
        let cellStyle = graph.getCellStyle(ss.cells[0]);
        let rcCommonSprops = [
            'rotateDirection', 'rotateSpeed','twinkleSpeed'
        ];
        if(mxUtils.isNotNullOrUndefined(cellStyle.igSprop)){
            const ignoreArr = cellStyle.igSprop.split(',');
            rcCommonSprops = rcCommonSprops.filter(item => ignoreArr.indexOf(item) ===-1);
        }
        for (let i = 0; i < rcCommonSprops.length; i++) {
            let prop = JSON.parse(JSON.stringify(StaticStylePropMap[rcCommonSprops[i]]));
            if (mxUtils.isNotNullOrUndefined(prop)) {
                this.genCellWithProp(prop);
            }
        }
    }
}

CustomStaticStyleView.prototype.genCellWithProp = function (prop) {
    const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;

    if (prop.type === 'image') {
        let setImgRow = this.createLabelCellRowPicture(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setImgRow.root);
    } else if (prop.type === 'select') {
        let setSelectCellRow = this.createLabelCellRowSelect(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value.key, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value.key], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setSelectCellRow.root);
    } else if (prop.type === 'input') {
        let setSelectCellRow = this.createLabelCellRowInput(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setSelectCellRow.root);
    } else if (prop.type === 'color') {
        let setColorCellRow = this.createLabelCellRowColor(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setColorCellRow.root);
    }else if (prop.type === 'switch') {
        let setSwitchCellRow = this.createLabelCellRowSwitch(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, '0') == '1';
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                let val = value ? '1' : '0';
                graph.setCellStyles(prop.key, val, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [val], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(setSwitchCellRow.root);
    }else if (prop.type === 'virvar') {
        let row = this.createLabelCellRowChooseVirvarCell(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(row.root);
    }else if (prop.type === 'importDevice') {
        let row = this.createLabelCellRowImportDevice(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        this.container.appendChild(row.root);
    }else if (prop.type === 'rightBtns') {
        let row = this.createLabelCellRowRightButton(prop.name, prop.config);
        this.container.appendChild(row.root);
    }

}

CustomStaticStyleView.prototype.createLabelCellRowImportDevice = function (label, config, getter, setter) {
    var root = document.createElement('div');
    root.style.cssText = 'display:flex;align-items:center;margin-bottom:10px;padding:0 10px;';

    var labelDiv = document.createElement('div');
    labelDiv.style.cssText = 'width:60px;font-size:12px;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    labelDiv.innerText = label;
    labelDiv.title = label;
    root.appendChild(labelDiv);

    var input = document.createElement('input');
    input.style.cssText = 'flex:1;height:24px;line-height:24px;border:1px solid #dcdfe6;border-radius:4px;padding:0 5px;font-size:12px;color:#606266;outline:none;min-width: 0;';
    input.placeholder = config.placeholder || '';
    
    var val = getter();
    if (val != null) {
        input.value = val;
    }
    
    // 失去焦点时自动保存值
    mxEvent.addListener(input, 'blur', function () {
        if(input.value !== val){
            setter(input.value);
        }
    });
    
    mxEvent.addListener(input, 'keydown', function (e) {
        if (e.keyCode === 13) {
            btn.click();
        }
    });

    root.appendChild(input);

    var btn = document.createElement('button');
    btn.innerText = '导入';
    btn.style.cssText = 'margin-left:5px;height:26px;padding:0 8px;background:#409eff;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;white-space:nowrap;';
    
    var _this = this;
    mxEvent.addListener(btn, 'click', function () {
        var deviceId = input.value;
        if (!deviceId) {
            mxUtils.alert('请输入设备ID');
            return;
        }
        
        btn.innerText = '...';
        btn.disabled = true;
        btn.style.background = '#a0cfff';

        api.getConfigurationInfo({deviceId: deviceId}).then(res => {
            btn.innerText = '导入';
            btn.disabled = false;
            btn.style.background = '#409eff';
            
            if (res.code === 200) {
                // 验证成功，保存 DeviceID
                setter(deviceId);
                mxUtils.alert('导入成功！');
            } else {
                mxUtils.alert('导入失败：' + (res.msg || '设备不存在'));
            }
        }).catch(e => {
            btn.innerText = '导入';
            btn.disabled = false;
            btn.style.background = '#409eff';
            mxUtils.alert('导入异常：' + e.message);
        });
    });

    root.appendChild(btn);

    return {root: root};
};