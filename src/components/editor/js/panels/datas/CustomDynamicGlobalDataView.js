/* eslint-disable */

import {mxUtils} from "../../../core/mxgraph";
import BaseFormatPanel from "../BaseFormatPanel";

import {StaticPointPropMap} from './StaticPropMap';

import CustomDynamicGlobalDataPanel from "@/components/editor/js/panels/datas/dynamic/CustomDynamicGlobalDataPanel.js";
import api from "@/components/editor/js/utils/api.js";

export default CustomDynamicGlobalDataView;

function CustomDynamicGlobalDataView(format) {
    const container = this.createTag('div', 'rcui-style-panel');
    BaseFormatPanel.call(this, format, format.editorUi, container);
    container.style.cssText = `border-bottom: 1px solid #CCCCCC;`;
    this.init();
}

// 设置值时的类型 控制用什么控件 integer: [input:type=number|正则integer] number: [input:type=number|小数正则] text: [input:type=text]

mxUtils.extend(CustomDynamicGlobalDataView, BaseFormatPanel);

CustomDynamicGlobalDataView.prototype.init = function () {
    if (mxUtils.isNullOrUndefined(this.format.customDynamicDataCategoryArr)) {
        this.format.customDynamicDataCategoryArr = [
            {category: 'script', title: '脚本', collapse: true},
        ];
    }
    this.format.customDynamicDataCategoryArr.map(item => {
        this.createCategoryCollapsePanel(item);
    });

    // const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;
    const ss = graph.getSelectionCell() || graph.getModel().getRoot();
    let dpropArr = [];
    let rcCommonDprops = [];
    rcCommonDprops.push('globalScript')
    this.loadDpropWithArray(ss, dpropArr);
}

CustomDynamicGlobalDataView.prototype.fetchGlobalScript = async function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        this.deviceId = urlParams.get('deviceId');
        const res = await api.getGlobalScriptByDeviceId({id: this.deviceId});
        return res;
    } catch (error) {
        console.error('Error fetching global script:', error);
    }
};

CustomDynamicGlobalDataView.prototype.loadDpropWithArray = function (ss, rcDprop) {
    const graph = this.editorUi.editor.graph;
    var rootCell = graph.getSelectionCell() || graph.getModel().getRoot();
    let cellStyle = graph.getCellStyle(rootCell);
    let prop = null;

    this.fetchGlobalScript().then(res => {
        console.log('getGlobalScriptByDeviceId', res);
        if (res.code === 200) {
            if (res.result.commonScript) {
                prop = JSON.parse(decodeURIComponent(res.result.commonScript))
            } else {
                prop = JSON.parse(JSON.stringify(StaticPointPropMap['globalScript']));
            }
            this.genCellWithProp(prop);
        }
    });

}

CustomDynamicGlobalDataView.prototype.genCellWithProp = function (prop) {
    const dataPanel = new CustomDynamicGlobalDataPanel(this.format, prop);
    console.log('genCellWithProp--prop', prop)
    mxUtils.removeStyleClass(this[`${prop.category}Collapse`], 'rcui-hide');
    this[`${prop.category}CollapseBody`].appendChild(dataPanel.container);
};

CustomDynamicGlobalDataView.prototype.createCategoryCollapsePanel = function (collapse) {
    let category = collapse.category;
    this[`${category}Collapse`] = this.createTag('div', 'rcui-dynamic-data-collapse rcui-hide');
    this[`${category}CollapseHead`] = this.createTag('div', 'rcui-dynamic-data-collapse-head');
    this[`${category}CollapseBody`] = this.createTag('div', 'rcui-dynamic-data-collapse-body');
    this[`${category}Collapse`].appendChild(this[`${category}CollapseHead`]);
    this[`${category}Collapse`].appendChild(this[`${category}CollapseBody`]);
    let collapseHead = this[`${category}CollapseHead`];
    let collapseBody = this[`${category}CollapseBody`];
    let bodyShowOrHide = !collapse.collapse;
    if (bodyShowOrHide) {
        mxUtils.removeStyleClass(collapseBody, 'rcui-hide');
    } else {
        mxUtils.addStyleClass(collapseBody, 'rcui-hide');
    }
    //layui-icon-triangle-d rcui-icon-triangle-r
    collapseHead.innerHTML = `
    <div style="flex: 1">${collapse.title}</div>
    <div><i class="rcui-icon rcui-icon-triangle-${bodyShowOrHide ? 'd' : 'r'}"></i></div>
    `;
    this.container.appendChild(this[`${category}Collapse`]);
    mxEvent.addListener(collapseHead, 'click', mxUtils.bind(this, function (evt) {
        if (!collapse.collapse) {
            collapse.collapse = true;
            mxUtils.addStyleClass(collapseBody, 'rcui-hide');
            mxUtils.addStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-r');
            mxUtils.removeStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-d');
        } else {
            collapse.collapse = false;
            mxUtils.removeStyleClass(collapseBody, 'rcui-hide');
            mxUtils.removeStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-r');
            mxUtils.addStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-d');
        }
    }));
};


