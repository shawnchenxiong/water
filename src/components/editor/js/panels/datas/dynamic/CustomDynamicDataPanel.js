/* eslint-disable */
import BaseFormatPanel from "../../BaseFormatPanel";
import { mxEventObject, mxUtils } from "../../../../core/mxgraph";

import CustomDynamicConditionCompareBody from './CustomDynamicConditionCompareBody';
import CustomDynamicTextOutputBody from "./CustomDynamicTextOutputBody";
import CustomDynamicEventClickBody from "./CustomDynamicEventClickBody";
import CustomDynamicScriptBody from "./CustomDynamicScriptBody.js";

export default CustomDynamicDataPanel;

function CustomDynamicDataPanel(format, prop) {
    BaseFormatPanel.call(this, format, format.editorUi, this.createTag('div', 'rcui-dynamic-data-panel'));
    this.prop = prop;
    this.init();
}

mxUtils.extend(CustomDynamicDataPanel, BaseFormatPanel);

// 自动保存方法（带防抖，不触发 styleChanged 事件避免面板重新初始化）
// propToSave: 可选参数，如果提供则保存指定的 prop，否则保存 this.prop
CustomDynamicDataPanel.prototype.autoSave = function (propToSave) {
    // 在调用时立即保存选中的单元格引用，避免在延迟期间选中状态丢失
    const ss = this.editorUi.getSelectionState();
    const savedCells = ss.cells && ss.cells.length > 0 ? ss.cells.slice() : null;

    // 清除之前的定时器
    if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
    }

    // 保存要使用的 prop（如果提供了 propToSave 则使用它，否则使用 this.prop）
    const propToUse = propToSave || this.prop;

    // 设置新的定时器，延迟 500ms 后保存（增加延迟时间，确保用户输入完成）
    this.autoSaveTimer = setTimeout(mxUtils.bind(this, function () {
        const graph = this.editorUi.editor.graph;
        const prop = propToUse;

        // 使用保存的单元格引用，而不是重新获取选中状态
        if (!savedCells || savedCells.length === 0) {
            return;
        }

        console.log('autoSave', JSON.stringify(prop));
        const propSnapshot = JSON.stringify(prop);
        let dropValues = encodeURIComponent(propSnapshot);
        graph.getModel().beginUpdate();
        try {
            // 直接设置样式，不触发 styleChanged 事件，避免面板重新初始化
            graph.setCellStyles(prop.dpropKey, dropValues, savedCells);
            // 注意：不触发 styleChanged 事件，避免面板重新初始化导致输入框被重置
            // this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.prop.dpropKey], 'values', [dropValues], 'cells', savedCells));
        } finally {
            graph.getModel().endUpdate();
        }
        if (this.editorUi && this.editorUi.updateHasUsedPointJson) {
            this.editorUi.updateHasUsedPointJson();
        }
        try {
            console.log('CustomDynamicDataPanel 自动保存后 hasUsedPointJson 内容=', this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson);
            console.log('CustomDynamicDataPanel 自动保存后 hasUsedPointJson 解析=', JSON.parse(this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson));
        } catch (e) { }
        console.log('CustomDynamicDataPanel 自动保存后触发全局点位刷新');
        // 将编辑器修改状态重置为已保存，避免刷新提示未保存
        if (this.editorUi && this.editorUi.editor && typeof this.editorUi.editor.setModified === 'function') {
            this.editorUi.editor.setModified(false);
        }
    }), 500);
};

CustomDynamicDataPanel.prototype.init = function () {
    const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;
    const prop = this.prop;
    const json = this.editorUi.GLOBAL_CONFIG.device.virvarJson;
    this.virvarList = json && json.length > 0 ? JSON.parse(json) : [];

    // 将自动保存方法保存到 format 对象中，以便子组件可以访问
    this.format.autoSaveDynamicData = mxUtils.bind(this, this.autoSave);

    //${prop.remark}

    //consType >= 6 只有属性 没有控制 如时间组件 不需变量控制
    // 注释掉保存按钮的 HTML 代码，改为自动保存
    this.container.innerHTML = `
${prop.hasSaveClear ? `
<div class="rcui-dynamic-data-panel-row">
     <div class="rcui-dynamic-data-panel-row-title">
        ${prop.name}
    </div>
    <div class="rcui-dynamic-data-panel-row-after">
        <div class="rcui-btn-group">
            <div class="rcui-btn rcui-btn-primary rcui-btn-sm btnClear" title="清除已设置内容">
                清空
            </div>
          <!-- 保存按钮已注释，改为自动保存
          <div class="rcui-btn rcui-btn-primary rcui-btn-sm btnSave" title="保存已设置内容">
            保存
          </div>
          -->
        </div>
    </div>
</div>` : ''}
${(prop.hasVirvar || prop.dpropKey === 'singleDataBindValues') ? `<div class="rcui-dynamic-data-panel-row" >
    <div class="rcui-dynamic-data-panel-row-title">
        控制变量
    </div>
    <div class="rcui-dynamic-data-panel-row-after datapoint">
    </div>
    </div>` : ''}
`;
    if (prop.hasVirvar || prop.dpropKey === 'singleDataBindValues') {
        if (prop.dpropKey === 'textMonitorValues') {
            // 多变量文本组件，使用穿梭框选择多个变量（弹窗模式）
            let afterDiv = this.container.querySelector('div.rcui-dynamic-data-panel-row-after.datapoint');
            if (afterDiv) {
                // 创建一个显示框和按钮
                const row = document.createElement('div');
                row.className = 'rcui-line-row';
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.marginBottom = '10px';

                const input = document.createElement('input');
                input.className = 'rcui-input';
                input.readOnly = true;
                input.style.flex = '1';
                input.style.marginRight = '5px';
                input.style.cursor = 'pointer';
                input.placeholder = '点击选择变量';

                // 计算显示文本
                const updateDisplayText = () => {
                    const ids = this.prop.virvarIds || [];
                    const names = ids.map(id => {
                        const item = this.virvarList.find(v => v.id === id);
                        return item ? (item.name || item.title || item.id) : id;
                    });
                    input.value = names.join(', ');
                    input.title = input.value; // tooltip
                };
                updateDisplayText();

                const btn = document.createElement('button');
                btn.className = 'rcui-btn rcui-btn-sm rcui-btn-primary';
                btn.innerText = '选择';
                btn.style.cursor = 'pointer';

                const showTransferDialog = () => {
                    const dialogDiv = document.createElement('div');
                    dialogDiv.style.padding = '20px';
                    dialogDiv.style.backgroundColor = '#fff';

                    const title = document.createElement('h3');
                    title.innerText = '选择变量';
                    title.style.marginBottom = '15px';
                    title.style.fontSize = '16px';
                    title.style.fontWeight = 'bold';
                    title.style.color = '#333';
                    dialogDiv.appendChild(title);

                    // 准备数据
                    let tempIds = (this.prop.virvarIds || []).slice();

                    const options = this.virvarList.map(item => ({
                        key: item.id,
                        title: item.name || item.title || item.id
                    }));

                    // 实例化 TransferBox
                    const transferBoxRow = this.createLabelRowRCTransferBoxCell('', {
                        options: options,
                        onChange: mxUtils.bind(this, function (checkedItems) {
                            if (checkedItems) {
                                tempIds = checkedItems.map(i => i.key);
                            }
                        })
                    }, mxUtils.bind(this, function () {
                        return tempIds;
                    }), mxUtils.bind(this, function (checkedItems) {
                        if (checkedItems) {
                            tempIds = checkedItems.map(i => i.key);
                        }
                    }));

                    // 隐藏 label
                    const labelDiv = transferBoxRow.root.querySelector('.rcui-line-row-label');
                    if (labelDiv) labelDiv.style.display = 'none';

                    dialogDiv.appendChild(transferBoxRow.root);

                    const btnRow = document.createElement('div');
                    btnRow.style.marginTop = '20px';
                    btnRow.style.textAlign = 'right';
                    btnRow.style.borderTop = '1px solid #eee';
                    btnRow.style.paddingTop = '10px';

                    const okBtn = document.createElement('button');
                    okBtn.className = 'rcui-btn rcui-btn-primary';
                    okBtn.innerText = '确定';
                    okBtn.onclick = () => {
                        this.prop.virvarIds = tempIds;
                        updateDisplayText();
                        this.autoSave();
                        this.editorUi.hideDialog();
                    };

                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'rcui-btn';
                    cancelBtn.innerText = '取消';
                    cancelBtn.style.marginLeft = '10px';
                    cancelBtn.onclick = () => {
                        this.editorUi.hideDialog();
                    };

                    btnRow.appendChild(okBtn);
                    btnRow.appendChild(cancelBtn);
                    dialogDiv.appendChild(btnRow);

                    this.editorUi.showDialog(dialogDiv, 620, 480, true, true);
                };

                input.onclick = showTransferDialog;
                btn.onclick = showTransferDialog;

                row.appendChild(input);
                row.appendChild(btn);
                afterDiv.appendChild(row);
            }
        } else {
            let afterDiv = this.container.querySelector('div.rcui-dynamic-data-panel-row-after.datapoint');
            if (afterDiv) {
                afterDiv.appendChild(this.createOnlyChooseVirvarCell({
                    placeholder: '请选择变量',
                }, mxUtils.bind(this, function () {
                    return this.prop.virvarId;
                }), mxUtils.bind(this, function (virvarId, virvar) {
                    console.log('virvarId', virvarId)
                    console.log('virvar', virvar)
                    this.prop.virvarId = virvarId;

                    // 联动：如果开启了回写控制，同步更新 ClickEvent
                    if (this.prop.isControl === true) {
                        this.syncReverseControlConfig(this.prop);
                    }

                    // 数据变化时自动保存
                    this.autoSave();
                })).root);
            }
        }
    }

    if (prop.hasSaveClear) {
        // 保存按钮已注释，改为自动保存
        /*
        let btnSave = this.container.querySelector('div.rcui-btn.btnSave');
        if(mxUtils.isNotNullOrUndefined(btnSave)){
            mxEvent.addListener(this.container.querySelector('div.rcui-btn.btnSave'), 'click', mxUtils.bind(this, function (evt) {
                if(mxUtils.isNullOrUndefined(this.prop.virvarId) || this.prop.virvarId.trim().length <= 0){
                    mxUtils.alert('请选择数据点');
                    return;
                }
                console.log('btnSave', JSON.stringify(this.prop));
                let dropValues = encodeURIComponent(JSON.stringify(this.prop));
                const graph = this.editorUi.editor.graph;
                graph.getModel().beginUpdate();
                try {
                    graph.setCellStyles(prop.dpropKey, dropValues, ss.cells);
                    this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.prop.dpropKey], 'values', [dropValues], 'cells', ss.cells));
                } finally {
                    graph.getModel().endUpdate();
                    mxUtils.alert("已保存")
                }
                if (this.editorUi && this.editorUi.updateHasUsedPointJson) {
                    this.editorUi.updateHasUsedPointJson();
                }
                try {
                    console.log('CustomDynamicDataPanel 保存后 hasUsedPointJson 内容=', this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson);
                    console.log('CustomDynamicDataPanel 保存后 hasUsedPointJson 解析=', JSON.parse(this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson));
                } catch (e) {}
                console.log('CustomDynamicDataPanel 保存后触发全局点位刷新');
            }));
        }
        */

        let btnClear = this.container.querySelector('div.rcui-btn.btnClear');
        if (mxUtils.isNotNullOrUndefined(btnClear)) {
            mxEvent.addListener(this.container.querySelector('div.rcui-btn.btnClear'), 'click', mxUtils.bind(this, function (evt) {
                this.editorUi.confirm("确定要清空吗？", mxUtils.bind(this, function (evt) {
                    if (this.prop && this.prop.category === 'script') {
                        try {
                            const ov = document.getElementById('jump-script-overlay');
                            if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
                        } catch (e) { }
                        try {
                            if (typeof window._jumpScriptCleanup === 'function') {
                                window._jumpScriptCleanup();
                            }
                        } catch (e) { }
                        try {
                            if (typeof window._pulseScriptCleanup === 'function') {
                                window._pulseScriptCleanup();
                            }
                        } catch (e) { }
                        try {
                            window.__rcLocalScriptDisabled = window.__rcLocalScriptDisabled || {};
                            if (this.prop && this.prop.cellId) {
                                window.__rcLocalScriptDisabled[this.prop.cellId] = true;
                            }
                        } catch (e) { }
                        try {
                            if (this.bodyView && this.bodyView._customCodeEditorCell && this.bodyView._customCodeEditorCell.customCoder) {
                                window.__rcSuppressAutoSaveDynamicData = true;
                                this.bodyView._customCodeEditorCell.customCoder.setValue('');
                                delete window.__rcSuppressAutoSaveDynamicData;
                            }
                        } catch (e) { }
                        if (this.editorUi && this.editorUi.editor && typeof this.editorUi.editor.setModified === 'function') {
                            this.editorUi.editor.setModified(false);
                        }
                    } else {
                        let dropValues = '';
                        const graph = this.editorUi.editor.graph;
                        graph.getModel().beginUpdate();
                        try {
                            graph.setCellStyles(this.prop.dpropKey, dropValues, ss.cells);
                            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.prop.dpropKey], 'values', [dropValues], 'cells', ss.cells));
                        } finally {
                            graph.getModel().endUpdate();
                        }
                        if (this.editorUi && this.editorUi.updateHasUsedPointJson) {
                            this.editorUi.updateHasUsedPointJson();
                        }
                        try {
                            console.log('CustomDynamicDataPanel 清空后 hasUsedPointJson 内容=', this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson);
                            console.log('CustomDynamicDataPanel 清空后 hasUsedPointJson 解析=', JSON.parse(this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson));
                        } catch (e) { }
                        console.log('CustomDynamicDataPanel 清空后触发全局点位刷新');
                        if (this.editorUi && this.editorUi.editor && typeof this.editorUi.editor.setModified === 'function') {
                            this.editorUi.editor.setModified(false);
                        }
                    }
                }));
            }));
        }
    }

    // 状态指示灯 (erchenchiStatusValues) 和数据显示 (erchenchiDataValues) 不需要显示标准的文本输出配置（前缀/后缀），因为其文本是自动生成的或有专用标题
    if (prop.dpropKey !== 'erchenchiStatusValues' && prop.dpropKey !== 'erchenchiDataValues') {
        if (prop.consType === 5) {
            this.bodyView = new CustomDynamicConditionCompareBody(this.format, prop);
        } else if (prop.consType === 4) {
            this.bodyView = new CustomDynamicTextOutputBody(this.format, prop);
        } else if (prop.consType === 3) {
            this.bodyView = new CustomDynamicEventClickBody(this.format, prop);
        } else if (prop.consType === 7) {
            this.bodyView = new CustomDynamicScriptBody(this.format, prop);
        }
    }

    if (this.bodyView) {
        this.container.appendChild(this.bodyView.container);
    }

    // --- 新增：为支持反向控制的属性添加配置项 ---
    if (prop.hasReverseControl) {
        const hr = document.createElement('hr');
        hr.style.cssText = 'margin: 15px 10px; border: none; border-top: 1px dashed #DDD;';
        this.container.appendChild(hr);

        const controlRow = document.createElement('div');
        controlRow.className = 'rcui-dynamic-data-panel-row';
        controlRow.style.padding = '0 10px';
        controlRow.innerHTML = `
            <div class="rcui-dynamic-data-panel-row-title" style="width: auto; flex: 1;">反向控制 (输入回写)</div>
            <div class="rcui-dynamic-data-panel-row-after" style="width: auto;"></div>
        `;

        const switchComp = this.createLabelCellRowSwitch('', {
            trueLabel: '启用',
            falseLabel: '禁用'
        }, mxUtils.bind(this, function () {
            return prop.isControl === true;
        }), mxUtils.bind(this, function (value) {
            prop.isControl = value;

            // 联动逻辑：如果启用了反向控制，自动同步配置 singleClickEvent
            if (value && prop.virvarId) {
                this.syncReverseControlConfig(prop);
            }

            this.autoSave();
        }));

        // 移除多余的 Label 占位
        const switchLabel = switchComp.root.querySelector('div');
        if (switchLabel && switchLabel.innerText === '') {
            switchLabel.style.display = 'none';
        }

        controlRow.querySelector('.rcui-dynamic-data-panel-row-after').appendChild(switchComp.root);
        this.container.appendChild(controlRow);
    }
};

/**
 * 同步反向控制配置到 singleClickEvent
 */
CustomDynamicDataPanel.prototype.syncReverseControlConfig = function (prop) {
    const graph = this.editorUi.editor.graph;
    const cell = this.editorUi.getSelectionState().cells[0];
    if (!cell || !prop.virvarId) return;

    // 1. 获取变量对应的 dwkey
    let pointKey = '';
    const virvar = this.virvarList.find(v => v.id === prop.virvarId);
    if (virvar && virvar.points && virvar.points.length > 0) {
        pointKey = virvar.points[0];
    } else {
        pointKey = prop.virvarId; // 降级处理
    }

    // 2. 寻找输入框零件 (childType=inputPart)
    let inputPartId = cell.getId(); // 默认是自身
    const childCount = graph.model.getChildCount(cell);
    for (let i = 0; i < childCount; i++) {
        const child = graph.model.getChildAt(cell, i);
        const childStyle = graph.getCellStyle(child);
        if (childStyle['childType'] === 'inputPart' || childStyle['shape'] === 'mxgraph.rc.mxRc_htmlInput') {
            inputPartId = child.getId();
            break;
        }
    }

    // 3. 构建 ClickEvent 对象
    const clickEvent = {
        clickType: 0, // 反向控制点位
        ctrlType: 2,  // 输入框控件的值
        pointKey: pointKey,
        pointValueCellId: inputPartId
    };

    // 4. 将配置写入 singleClickEvent 样式
    const eventJson = encodeURIComponent(JSON.stringify(clickEvent));
    graph.setCellStyles('singleClickEvent', eventJson, [cell]);

    console.log('已自动同步反向控制配置:', clickEvent);
};
