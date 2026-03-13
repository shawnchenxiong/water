/* eslint-disable */

import {mxUtils} from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";
import DiagramDrawingPanel from "./DiagramDrawingPanel";
import DiagramStructurePanel from "./DiagramStructurePanel";
import DiagramDataPanel from "@/components/editor/js/panels/DiagramDataPanel.js";
// import DiagramDataPanel from "./DiagramDataPanel";

export default DiagramFormatPanel;

function DiagramFormatPanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.init();
}

mxUtils.extend(DiagramFormatPanel, BaseFormatPanel);

DiagramFormatPanel.prototype.init = function () {
    this.currentIndex = -1;
    this.currentPanel = null;
    this.tabs = [
        {key: 'drawing', title: '图纸设置', panel: DiagramDrawingPanel},
        {key: 'structure', title: '图元层次', panel: DiagramStructurePanel},
        {key: 'data', title: '数据通信', panel: DiagramDataPanel},
    ];
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

    if(this.format.lastDiagramKey){
        for (let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].key === this.format.lastDiagramKey){
                this.changeTab(i);
                return
            }
        }
    }
    this.changeTab(0);
}

DiagramFormatPanel.prototype.changeTab = function (index) {
    if (this.currentIndex === index) return;
    if (this.currentPanel) {
        this.currentPanel.destroy();
    }
    this.format.lastDiagramKey = this.tabs[index].key;
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
