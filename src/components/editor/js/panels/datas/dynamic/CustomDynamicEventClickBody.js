/* eslint-disable */

import BaseFormatPanel from "../../BaseFormatPanel";
import { mxEventObject, mxUtils } from "../../../../core/mxgraph";
import api from '../../../utils/api';
import CustomDynamicConditionCompareBody from "./CustomDynamicConditionCompareBody";
import ControlPanelSelectDialog from "../../../dialogs/ControlPanelSelectDialog";

export default CustomDynamicEventClickBody;

function CustomDynamicEventClickBody(format, prop) {
    BaseFormatPanel.call(this, format, format.editorUi, this.createTag('div', 'rcui-dynamic-data-panel-custom'));
    this.prop = prop;
    this.container.style.padding = '0 10px';
    this.container.style.boxSizing = 'border-box';
    this.container.style.marginTop = '5px';
    const json = this.editorUi.GLOBAL_CONFIG.device.virvarJson;
    this.virvarList = json && json.length > 0 ? JSON.parse(json) : [];
    this.init();
}

mxUtils.extend(CustomDynamicEventClickBody, BaseFormatPanel);

CustomDynamicEventClickBody.prototype.init = function () {
    this.setClickTypeRow = this.createLabelCellRowSelect('事件行为', {
        options: [
            { key: null, title: '请选择' },
            { key: 0, title: '反向控制点位' },
            { key: 1, title: '反向控制指令' },
            { key: 2, title: '切面页面' },
            { key: 3, title: '跳转外部网页' },
            { key: 4, title: '打开控制面板' },
        ]
    }, mxUtils.bind(this, function () {
        return this.prop.clickType;
    }), mxUtils.bind(this, function (val, evt) {
        this.prop.clickType = val.key;
        this.showHideRowView();
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setClickTypeRow.root);

    let list = this.editorUi.GLOBAL_CONFIG.templete.rcVariableList ? this.editorUi.GLOBAL_CONFIG.templete.rcVariableList : [];
    const virJson = this.editorUi.GLOBAL_CONFIG.device && this.editorUi.GLOBAL_CONFIG.device.virvarJson ? this.editorUi.GLOBAL_CONFIG.device.virvarJson : null;
    const virList = virJson && virJson.length > 0 ? JSON.parse(virJson) : [];
    const allowKeys = new Set();
    if (virList && virList.length > 0) {
        for (let i = 0; i < virList.length; i++) {
            const v = virList[i];
            if (v && Array.isArray(v.points)) {
                for (let j = 0; j < v.points.length; j++) {
                    allowKeys.add(v.points[j]);
                }
            }
        }
    }
    const filteredList = list.filter(item => allowKeys.size === 0 ? false : allowKeys.has(item.dwkey));
    this.setChooseDataPoints = this.createLabelCellRowSelect('被控点位', {
        options: filteredList.map(item => { return { key: item.dwkey, title: item.name } })
    }, mxUtils.bind(this, function () {
        return this.prop.pointKey;
    }), mxUtils.bind(this, function (val, evt) {
        this.prop.pointKey = val.key;
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setChooseDataPoints.root);

    this.setCtrlTypeRow = this.createLabelCellRowSelect('控制值类型', {
        options: [
            { key: null, title: '请选择' },
            { key: 0, title: '输入设置值' },
            { key: 1, title: '变量条件设置值' },
            { key: 2, title: '输入框控件的值' },
        ]
    }, mxUtils.bind(this, function () {
        return this.prop.ctrlType;
    }), mxUtils.bind(this, function (val, evt) {
        this.prop.ctrlType = val.key;
        this.showHideRowView();
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setCtrlTypeRow.root);

    this.setPointValueDirectInputRow = this.createLabelCellRowInput('输入控制值', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return this.prop.pointValueDirect;
    }), mxUtils.bind(this, function (value) {
        this.prop.pointValueDirect = value;
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setPointValueDirectInputRow.root);

    this.setPointValueVirvarRoow = this.createLabelCellRowSelect('条件控制变量', {
        options: this.virvarList.map((item, i) => {
            return { key: item.id, title: item.name };
        }),
    }, mxUtils.bind(this, function () {
        return this.prop.pointValueVirvarId;
    }), mxUtils.bind(this, function (val, evt) {
        this.prop.pointValueVirvarId = val.key;
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setPointValueVirvarRoow.root);
    this.customDynamicConditionCompareBody = new CustomDynamicConditionCompareBody(this.format, this.prop.pointValueConsProp);
    this.container.appendChild(this.customDynamicConditionCompareBody.container);

    const inputCells = [];
    const graph = this.editorUi.editor.graph;
    const allCells = graph.model.cells;
    if (allCells && Object.keys(allCells).length > 0) {
        for (let i in allCells) {
            let oneCell = allCells[i];
            if (!graph.getModel().isRoot(oneCell)) {
                let cellStyle = mxUtils.getCellStyleWithStr(oneCell.style);
                if (cellStyle.shape === 'mxgraph.rc.mxRc_htmlTextarea' || cellStyle.shape === 'mxgraph.rc.mxRc_htmlInput') {
                    let title;
                    if (cellStyle) {
                        title = cellStyle.title;
                        if (!title) {
                            title = cellStyle.defaultTitle;
                        }
                    }
                    title = title ? title : '无名节点';
                    inputCells.push({
                        title: title,
                        key: oneCell.id,
                    });
                }
            }
        }
    }
    this.setChooseInputCellRoow = this.createLabelCellRowSelect('选择输入控件', {
        options: inputCells,
    }, mxUtils.bind(this, function () {
        return this.prop.pointValueCellId;
    }), mxUtils.bind(this, function (val, evt) {
        this.prop.pointValueCellId = val.key;
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setChooseInputCellRoow.root);

    this.setCommandContentRow = this.createLabelCellRowInput('输入指令内容', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return this.prop.commandContent;
    }), mxUtils.bind(this, function (value) {
        this.prop.commandContent = value;
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setCommandContentRow.root);

    const pages = this.editorUi.pages.filter((item) => {
        return this.editorUi.currentPage.getId() !== item.getId()
    })
    this.setChangePageRoow = this.createLabelCellRowSelect('选择页面', {
        options: pages.map((item, i) => {
            return { key: item.getId(), title: item.getName() };
        }),
    }, mxUtils.bind(this, function () {
        return this.prop.changePageId;
    }), mxUtils.bind(this, function (val, evt) {
        this.prop.changePageId = val.key;
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setChangePageRoow.root);

    this.setOuterLinkRow = this.createLabelCellRowInput('输入外部链接', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return this.prop.outerLink;
    }), mxUtils.bind(this, function (value) {
        this.prop.outerLink = value;
        if (this.format && this.format.autoSaveDynamicData) {
            this.format.autoSaveDynamicData(this.prop);
        }
    }));
    this.container.appendChild(this.setOuterLinkRow.root);

    this.setControlPanelRow = this.createLabelCellRowInput('选择控制面板', {
        type: 'text',
        readonly: true,
        placeholder: '点击选择控制面板',
        style: 'cursor: pointer; background: #fff;'
    }, mxUtils.bind(this, function () {
        // Find the name from local/remote if possible, but usually we just show the ID or a cached name
        // For better UX, we'd need to store the name in this.prop.controlPanelName
        return this.prop.controlPanelName || (this.prop.controlPanelId ? '已选择 (ID: ' + this.prop.controlPanelId + ')' : '');
    }), mxUtils.bind(this, function (value) {
        // Input is readonly, so this won't be called directly by user typing
    }));

    // Add click listener to the input to open dialog
    const cpInput = this.setControlPanelRow.root.querySelector('input');
    if (cpInput) {
        mxEvent.addListener(cpInput, 'click', mxUtils.bind(this, function () {
            const dlg = new ControlPanelSelectDialog(this.editorUi, {
                width: 600,
                height: 600,
                sureFn: mxUtils.bind(this, function (panel) {
                    this.prop.controlPanelId = panel.id;
                    this.prop.controlPanelName = panel.name;
                    cpInput.value = panel.name;
                    if (this.format && this.format.autoSaveDynamicData) {
                        this.format.autoSaveDynamicData(this.prop);
                    }
                })
            });
            this.editorUi.showDialog(dlg.container, 600, 600, true, true);
        }));
    }
    this.container.appendChild(this.setControlPanelRow.root);

    this.showHideRowView();
};
CustomDynamicEventClickBody.prototype.showHideRowView = function () {
    mxUtils.hideElement(this.setChooseDataPoints.root);
    mxUtils.hideElement(this.setCtrlTypeRow.root);
    mxUtils.hideElement(this.setPointValueDirectInputRow.root);
    mxUtils.hideElement(this.setChooseInputCellRoow.root);
    mxUtils.hideElement(this.setPointValueVirvarRoow.root);
    mxUtils.hideElement(this.customDynamicConditionCompareBody.container);
    mxUtils.hideElement(this.setCommandContentRow.root);
    mxUtils.hideElement(this.setChangePageRoow.root);
    mxUtils.hideElement(this.setOuterLinkRow.root);
    mxUtils.hideElement(this.setControlPanelRow.root);

    if (this.prop.clickType === 0) {
        mxUtils.showElement(this.setChooseDataPoints.root);
        mxUtils.showElement(this.setCtrlTypeRow.root);
        if (this.prop.ctrlType === 0) {
            mxUtils.showElement(this.setPointValueDirectInputRow.root);
        } else if (this.prop.ctrlType === 1) {
            mxUtils.showElement(this.setPointValueVirvarRoow.root);
            mxUtils.showElement(this.customDynamicConditionCompareBody.container);
        } else if (this.prop.ctrlType === 2) {
            mxUtils.showElement(this.setChooseInputCellRoow.root);
        }
    } else if (this.prop.clickType === 1) {
        mxUtils.showElement(this.setCommandContentRow.root);
    } else if (this.prop.clickType === 2) {
        mxUtils.showElement(this.setChangePageRoow.root);
    } else if (this.prop.clickType === 3) {
        mxUtils.showElement(this.setOuterLinkRow.root);
    } else if (this.prop.clickType === 4) {
        mxUtils.showElement(this.setControlPanelRow.root);
    }
}
