/* eslint-disable */
import {mxUtils} from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";
import CustomDynamicDataView from "./datas/CustomDynamicDataView";
import CustomStaticStyleView from "./datas/CustomStaticStyleView";

export default ElementDataPanel;

function ElementDataPanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.container.style.overflowY = 'scroll';
    this.init();
    const ss = this.editorUi.getSelectionState();
    if(ss.cells && ss.cells.length > 0){
        if(ss.cells[0].getId() == ElementDataPanel.lastCellId){
            setTimeout(()=>{
                this.container.scrollTop = ElementDataPanel.lastScrollTop;
            }, this.setScrollTopLazyTime);
        }else{
            ElementDataPanel.lastCellId = ss.cells[0].getId();
            ElementDataPanel.lastScrollTop = 0;
        }
    }else{
        ElementDataPanel.lastCellId = null;
        ElementDataPanel.lastScrollTop = 0;
    }
    this.listenTop();
}
ElementDataPanel.lastCellId = null;
ElementDataPanel.lastScrollTop = 0;
mxUtils.extend(ElementDataPanel, BaseFormatPanel);

ElementDataPanel.prototype.listenTop = function () {
    this.container.addEventListener("scroll", mxUtils.bind(this, function (e) {
        ElementDataPanel.lastScrollTop = this.container.scrollTop;
    }));
}
ElementDataPanel.prototype.init = function () {
    const ss = this.editorUi.getSelectionState();
    if (ss.cells.length <= 0) {
        return;
    }
    this.container.appendChild(new CustomDynamicDataView(this.format).container);
};

