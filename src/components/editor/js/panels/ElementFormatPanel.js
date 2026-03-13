/* eslint-disable */

import { mxUtils } from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";
import ElementStylePanel from "./ElementStylePanel";
import ElementTextPanel from "./ElementTextPanel";
import ElementDataPanel from "./ElementDataPanel";
import ElementControlPanel from "./ElementControlPanel";

export default ElementFormatPanel;

function ElementFormatPanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.init();
}

mxUtils.extend(ElementFormatPanel, BaseFormatPanel);

ElementFormatPanel.prototype.init = function () {
    const ui = this.editorUi;
    const graph = ui.editor.graph;
    this.currentIndex = -1;
    this.currentPanel = null;
    if (graph.isEditing()) {
        this.tabs = [
            { key: 'text', title: '文本', panel: ElementTextPanel },
        ];
    } else {
        const ss = this.editorUi.getSelectionState();
        if (ss.cells.length > 0) {
            const cellStyle = graph.getCellStyle(ss.cells[0]);
            if (graph.isCellEditable(ss.cells[0])) {
                this.tabs = [
                    { key: 'style', title: '样式', panel: ElementStylePanel },
                    { key: 'text', title: '文本', panel: ElementTextPanel },
                ];
            } else {
                let showFontStyle = mxUtils.getValue(cellStyle, 'showFontStyle', null);
                if (showFontStyle == '1') {
                    this.tabs = [
                        { key: 'style', title: '样式', panel: ElementStylePanel },
                        { key: 'text', title: '文本', panel: ElementTextPanel },
                    ];
                } else {
                    this.tabs = [
                        { key: 'style', title: '样式', panel: ElementStylePanel },
                    ];
                }
            }
            if (ss.cells.length === 1) {
                this.tabs.push({ key: 'data', title: '数据', panel: ElementDataPanel });

                // 检查是否是多变量文本组件或控制面板组件，如果是，增加控制面板选项卡
                const rcDprop = mxUtils.getValue(cellStyle, 'rcDprop', '');
                const ctrlPanel = mxUtils.getValue(cellStyle, 'ctrlPanel', '0');
                if (rcDprop === 'textMonitorValues' || ctrlPanel === '1') {
                    this.tabs.push({ key: 'control', title: '控制面板', panel: ElementControlPanel });
                }
            }
        } else {
            this.tabs = [
                { key: 'style', title: '样式', panel: ElementStylePanel },
            ];
        }
    }

    const titleTabDiv = this.createDiv('rcui-tab');
    titleTabDiv.style.backgroundColor = this.activeTabBackgroundColor;
    this.container.appendChild(titleTabDiv);

    for (let i = 0; i < this.tabs.length; i++) {
        const childDiv = this.createTabCell(this.tabs[i].title);
        mxUtils.addStyleClass(childDiv, 'rcui-tab-item');
        titleTabDiv.appendChild(childDiv);
        childDiv.onclick = mxUtils.bind(this, function (evt) {
            this.changeTab(i);
        });
    }
    this.titleTabDiv = titleTabDiv;
    if (this.format.lastElementKey) {
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].key === this.format.lastElementKey) {
                this.changeTab(i);
                return
            }
        }
    }
    this.changeTab(0);
}

ElementFormatPanel.prototype.changeTab = function (index) {
    if (this.currentIndex === index) return;
    if (this.currentPanel) {
        this.currentPanel.destroy();
    }
    this.format.lastElementKey = this.tabs[index].key;
    for (let i = 0; i < this.tabs.length; i++) {
        const ele = this.titleTabDiv.childNodes[i];
        if (index === i) {
            mxUtils.addStyleClass(ele, 'rcui-tab-item-active');
            this.currentPanel = new this.tabs[i].panel(this.format, this.editorUi);
        } else {
            mxUtils.removeStyleClass(ele, 'rcui-tab-item-active');
        }
    }
    this.container.appendChild(this.currentPanel.container);
}

