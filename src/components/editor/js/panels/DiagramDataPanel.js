/* eslint-disable */
import {mxUtils} from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";
import CustomDynamicGlobalDataView from "./datas/CustomDynamicGlobalDataView.js";

export default DiagramDataPanel;

function DiagramDataPanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    // console.log('DiagramDataPanel---new');
    this.container.style.overflowY = 'scroll';
    this.init();
}

mxUtils.extend(DiagramDataPanel, BaseFormatPanel);

DiagramDataPanel.prototype.init = function () {
    const ss = this.editorUi.getSelectionState();
    // console.log('DiagramDataPanel---init', ss)
    if (ss.cells.length <= 0) {
        this.container.appendChild(new CustomDynamicGlobalDataView(this.format).container);
    }
};

