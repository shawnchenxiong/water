import {mxUtils} from "../../core/mxgraph";
import BaseDialog from "./BaseDialog";

export default ObjectFormDialog;

function ObjectFormDialog(editorUi, config = {}) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.init();
};

mxUtils.extend(ObjectFormDialog, BaseDialog);

ObjectFormDialog.prototype.init = function () {
    let div = this.createTag('div');
    div.style.cssText = `width: 100%px; height:100%;`;
    let contentHeight = this.config.height - 101;
    div.innerHTML = `
    <div class="rcui-layer rcui-layer-dialog" style="display: flex;flex-direction: column;height:100%;">
        <div class="rcui-layer-title" >${this.config.title ? this.config.title : '提示'}</div>
        <div style="display: flex;flex-direction: row;height:${contentHeight}px" class="contentPanel">
            <div style="width:100%;height:100%;overflow: scroll;flex:1;padding: 10px;box-sizing: border-box;">
                <div class="propertyListPanel" style="display: flex;flex-direction: column;">
                </div>
            </div>
        </div>
        <div class="rcui-layer-setwin">
            <span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span>
        </div>
        <div class="rcui-layer-btn" style="height: 50px;width: 100%;display: flex;flex-direction: row;align-items: center;justify-content: flex-end;padding:0px 16px;box-sizing: border-box;-webkit-box-shadow: 10px 6px 8px 1px rgba(0,0,0,0.5);box-shadow: 10px 6px 8px 1px rgba(0,0,0,0.5);">
        ${this.config.buttons ? this.config.buttons.reduce((t, item, i, arr) => {
            return t + `<a class="rcui-layer-btn${arr.length -1 === i ? '0' : '1'} rcui-layer-dialog-btn ${item.typeClass ? item.typeClass : ''}" >${item.text}</a>`
    }, '') : ``}
        </div>
    </div>`;
    this.container.appendChild(div);
    let propertyListPanel = div.querySelector('div.propertyListPanel');
    let formObj = this.config.formObj;
    formObj = formObj ? formObj : {};
    this.formObj = formObj;
    let itemProperties = this.config.formProperties;
    if(itemProperties && itemProperties.length > 0){
        for (let i = 0; i < itemProperties.length; i++) {
            const prop = itemProperties[i];
            let row = null;
            if (prop.type === 'select') {
                row = this.createLabelCellRowSelect(prop.name, prop.config, mxUtils.bind(this, function () {
                    return this.formObj[prop.key];
                }), mxUtils.bind(this, function (value) {
                    this.formObj[prop.key] = value.key;
                }));
            } else if (prop.type === 'input') {
                row = this.createLabelCellRowInput(prop.name, prop.config, mxUtils.bind(this, function () {
                    return this.formObj[prop.key] ? this.formObj[prop.key] : '';
                }), mxUtils.bind(this, function (value) {
                    this.formObj[prop.key] = value;
                }));
            } else if (prop.type === 'virvar') {
                row = this.createLabelCellRowChooseVirvarCell(prop.name, prop.config, mxUtils.bind(this, function () {
                    return this.formObj[prop.key];
                }), mxUtils.bind(this, function (value) {
                    this.formObj[prop.key] = value;
                }));
            }else if (prop.type === 'image') {
                row = this.createLabelCellRowPicture(prop.name, prop.config, mxUtils.bind(this, function () {
                    return this.formObj[prop.key];
                }), mxUtils.bind(this, function (value) {
                    this.formObj[prop.key] = value;
                }));
            }else if (prop.type === 'color') {
                row = this.createLabelCellRowColor(prop.name, prop.config, mxUtils.bind(this, function () {
                    return this.formObj[prop.key];
                }), mxUtils.bind(this, function (value) {
                    this.formObj[prop.key] = value;
                }));
            }else if (prop.type === 'switch') {
                row = this.createLabelCellRowSwitch(prop.name, prop.config, mxUtils.bind(this, function () {
                    return this.formObj[prop.key];
                }), mxUtils.bind(this, function (value) {
                    let val = value ? '1' : '0';
                    this.formObj[prop.key] = val;
                }));
            }
            if(row != null){
                propertyListPanel.appendChild(row.root);
            }
        }
    }
    mxEvent.addListener(div.querySelector('span.rcui-layer-close'), 'click', mxUtils.bind(this, function (evt) {
        this.editorUi.hideDialog(true, false);
    }));
    if(this.config.buttons && this.config.buttons.length > 0){
        let btnEles = div.querySelectorAll('a.rcui-layer-dialog-btn');
        for (let i = 0; i < btnEles.length; i++) {
            mxEvent.addListener(btnEles[i], 'click', mxUtils.bind(this, function (evt) {
                if(this.config.buttons[i].func){
                    this.config.buttons[i].func(evt, this, this.config.buttons[i], this.formObj);
                }
            }));
        }
    }
}
