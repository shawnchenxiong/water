/* eslint-disable */
import BaseFormatPanel from "../../BaseFormatPanel";
import {mxEventObject, mxUtils} from "../../../../core/mxgraph";

import CustomDynamicConditionCompareBody from './CustomDynamicConditionCompareBody';
import CustomDynamicTextOutputBody from "./CustomDynamicTextOutputBody";
import CustomDynamicEventClickBody from "./CustomDynamicEventClickBody";
import CustomDynamicGlobalScriptBody
    from "@/components/editor/js/panels/datas/dynamic/CustomDynamicGlobalScriptBody.js";
import api from "@/components/editor/js/utils/api.js";

export default CustomDynamicGlobalDataPanel;

function CustomDynamicGlobalDataPanel(format, prop) {
    BaseFormatPanel.call(this, format, format.editorUi, this.createTag('div', 'rcui-dynamic-data-panel'));
    this.prop = prop;
    this.init();
}

mxUtils.extend(CustomDynamicGlobalDataPanel, BaseFormatPanel);

CustomDynamicGlobalDataPanel.prototype.init = function () {
    // const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;
    const ss = graph.getModel().getRoot();
    const prop = this.prop;
    this.script = this.prop.script ? this.prop.script : null;
    console.log('CustomDynamicGlobalDataPanel---init', this.prop)

    //consType >= 6 只有属性 没有控制 如时间组件 不需变量控制
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
          <div class="rcui-btn rcui-btn-primary rcui-btn-sm btnSave" title="保存已设置内容">
            保存
          </div>
        </div>
    </div>
</div>` : ''}
${prop.hasVirvar ? `<div class="rcui-dynamic-data-panel-row" >
    <div class="rcui-dynamic-data-panel-row-title">
        控制变量
    </div>
    <div class="rcui-dynamic-data-panel-row-after datapoint">
    </div>
</div>` : ''}
`;
    if (prop.hasVirvar) {
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
            })).root);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('deviceId');
    if (prop.hasSaveClear) {
        let btnSave = this.container.querySelector('div.rcui-btn.btnSave');
        if (mxUtils.isNotNullOrUndefined(btnSave)) {
            mxEvent.addListener(this.container.querySelector('div.rcui-btn.btnSave'), 'click', mxUtils.bind(this, async function (evt) {
                /*if(mxUtils.isNullOrUndefined(this.prop.virvarId) || this.prop.virvarId.trim().length <= 0){
                    mxUtils.alert('请选择数据点');
                    return;
                }*/
                let dropValues = encodeURIComponent(JSON.stringify(this.prop));

                console.log('btnSave', this.prop);
                const graph = this.editorUi.editor.graph;
                const rootCell = graph.getDefaultParent();
                graph.getModel().beginUpdate();
                try {
                    graph.setCellStyles(prop.dpropKey, dropValues, rootCell);
                    // this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.prop.dpropKey], 'values', [dropValues], 'cells', rootCell));
                    const rcScript = {
                        id: deviceId,
                        deviceId: null,
                        commonScript: dropValues
                    };
                    const res = await api.saveGlobalScriptByDeviceId(rcScript);
                    if (res.code === 200) {
                        mxUtils.alert("保存成功");
                    } else {
                        mxUtils.alert("保存失败");
                    }
                } finally {
                    graph.getModel().endUpdate();
                    // mxUtils.alert("已保存")
                }
            }));
        }

        let btnClear = this.container.querySelector('div.rcui-btn.btnClear');
        if (mxUtils.isNotNullOrUndefined(btnClear)) {
            mxEvent.addListener(this.container.querySelector('div.rcui-btn.btnClear'), 'click', mxUtils.bind(this, function (evt) {
                this.editorUi.confirm("确定要清空吗？", mxUtils.bind(this, async function (evt) {
                    try {
                        const ov = document.getElementById('jump-script-overlay');
                        if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
                    } catch (e) {}
                    try {
                        if (typeof window._jumpScriptCleanup === 'function') {
                            window._jumpScriptCleanup();
                        }
                    } catch (e) {}
                    try {
                        if (typeof window._pulseScriptCleanup === 'function') {
                            window._pulseScriptCleanup();
                        }
                    } catch (e) {}
                    try {
                        window.__rcLocalScriptDisabled = window.__rcLocalScriptDisabled || {};
                        window.__rcLocalScriptDisabled['global:script'] = true;
                    } catch (e) {}
                    try {
                        if (this.bodyView && this.bodyView._customCodeEditorCell && this.bodyView._customCodeEditorCell.customCoder) {
                            window.__rcSuppressAutoSaveDynamicData = true;
                            this.bodyView._customCodeEditorCell.customCoder.setValue('');
                            delete window.__rcSuppressAutoSaveDynamicData;
                        }
                    } catch (e) {}
                    if (this.editorUi && this.editorUi.editor && typeof this.editorUi.editor.setModified === 'function') {
                        this.editorUi.editor.setModified(false);
                    }
                }));
            }));
        }
    }

    if (prop.consType === 5) {
        this.bodyView = new CustomDynamicConditionCompareBody(this.format, prop);
    } else if (prop.consType === 4) {
        this.bodyView = new CustomDynamicTextOutputBody(this.format, prop);
    } else if (prop.consType === 3) {
        this.bodyView = new CustomDynamicEventClickBody(this.format, prop);
    } else if (prop.consType === 7) {
        this.bodyView = new CustomDynamicGlobalScriptBody(this.format, prop);
    }
    if (this.bodyView) {
        this.container.appendChild(this.bodyView.container);
    }

};
