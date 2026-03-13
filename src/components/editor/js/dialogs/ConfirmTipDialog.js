import {mxUtils} from "../../core/mxgraph";
import BaseDialog from "./BaseDialog";

export default ConfirmTipDialog;

function ConfirmTipDialog(editorUi, config = {}) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.init();
};

mxUtils.extend(ConfirmTipDialog, BaseDialog);

ConfirmTipDialog.prototype.init = function () {
    let div = this.createTag('div');
    div.style.cssText = `width: 100%px; height:100%;`;
    div.innerHTML = `
    <div class="rcui-layer rcui-layer-dialog" style="display: flex;flex-direction: column;height:100%;">
        <div class="rcui-layer-title" >${this.config.title ? this.config.title : '提示'}</div>
        <div class="rcui-layer-content" style="flex: 1;text-align: center;">${this.config.content ? this.config.content : '确定吗'}</div>
        <div class="rcui-layer-setwin">
            <span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span>
        </div>
        <div class="rcui-layer-btn" style="height: 50px;width: 100%;display: flex;flex-direction: row;align-items: center;justify-content: flex-end;padding:0px;-webkit-box-shadow: 10px 6px 8px 1px rgba(0,0,0,0.5);box-shadow: 10px 6px 8px 1px rgba(0,0,0,0.5);">
        ${this.config.buttons ? this.config.buttons.reduce((t, item, i, arr) => {
            return t + `<a class="rcui-btn-sm rcui-layer-btn${arr.length -1 === i ? '0' : '1'} rcui-layer-dialog-btn ${item.typeClass ? item.typeClass : ''}" >${item.text}</a>`
    }, '') : ``}
        </div>
    </div>`;
    this.container.appendChild(div);
    mxEvent.addListener(div.querySelector('span.rcui-layer-close'), 'click', mxUtils.bind(this, function (evt) {
        this.editorUi.hideDialog(true, false);
    }));
    if(this.config.buttons && this.config.buttons.length > 0){
        let btnEles = div.querySelectorAll('a.rcui-layer-dialog-btn');
        for (let i = 0; i < btnEles.length; i++) {
            mxEvent.addListener(btnEles[i], 'click', mxUtils.bind(this, function (evt) {
                if(this.config.buttons[i].func){
                    this.config.buttons[i].func();
                }
            }));
        }
    }
}