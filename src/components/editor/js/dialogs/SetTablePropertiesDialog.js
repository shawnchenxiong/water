import {mxEvent, mxUtils} from "../../core/mxgraph";
import BaseDialog from "./BaseDialog";

export default SetTablePropertiesDialog;

function SetTablePropertiesDialog(editorUi, config = {}) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.init();
};

mxUtils.extend(SetTablePropertiesDialog, BaseDialog);

SetTablePropertiesDialog.prototype.init = function () {
    const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;
    const cell = ss.cells[0];
    const cellStyle = graph.getCellStyle(cell);
    let tableHeaderConfig = mxUtils.getValue(cellStyle, 'tableHeaderConfig', null);
    console.log('tableHeaderConfig', tableHeaderConfig);
    if(tableHeaderConfig != null){
        this.tableHeaderConfig = JSON.parse(decodeURIComponent(tableHeaderConfig));
    }else{
        this.tableHeaderConfig = JSON.parse(`{"headers":[{"level":1,"columns":[]},{"level":2,"columns":[]},{"level":3,"columns":[]},{"level":4,"columns":[]},{"level":5,"columns":[]}]}`);
    }
    let div = this.createTag('div');
    div.style.cssText = `width: 100%px; height:100%;`;
    let contentHeight = this.config.height - 101;
    div.innerHTML = `
    <div class="rcui-layer rcui-layer-dialog" style="display: flex;flex-direction: column;height:100%;">
        <div class="rcui-layer-title" >${this.config.title ? this.config.title : '提示'}</div>
        <div style="display: flex;flex-direction: row;height:${contentHeight}px" class="contentPanel">
        <style>
        .rcui-table1 td{
            text-align: center;
        }
        </style>
            <div style="width:100%;height:100%;overflow: scroll;flex:1;padding: 10px;box-sizing: border-box;">
                <table class="rcui-table rcui-table1" lay-filter="parse-table-demo" style="margin: 0px;background:none;">
                    <thead>
                        <tr>
                            <td rowspan="2">表头等级</td>
                            <td colspan="7" rowspan="1">列集合</td>
                            <td rowspan="2" colspan="1">操作</td>
                        </tr>
                        <tr>
                            <td rowspan="1">列名</td>
                            <td rowspan="1">跨行</td>
                            <td rowspan="1">夸列</td>
                            <td rowspan="1">属性</td>
                            <td rowspan="1">列号</td>
                            <td rowspan="1">宽度</td>
                            <td rowspan="1">设置</td>
                        </tr>
                    </thead>
                    <tbody class="tbodyColumsPanel">
                    </tbody>
                </table>
            </div>
        </div>
        <div class="rcui-layer-setwin">
            <span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span>
        </div>
        <div class="rcui-layer-btn" style="height: 50px;width: 100%;display: flex;flex-direction: row;align-items: center;justify-content: flex-end;padding:0px 16px;box-sizing: border-box;border-box;border-top: 1px solid #F0f0f0;">
        ${this.config.buttons ? this.config.buttons.reduce((t, item, i, arr) => {
            return t + `<a class="rcui-layer-btn${arr.length -1 === i ? '0' : '1'} rcui-layer-dialog-btn ${item.typeClass ? item.typeClass : ''}" >${item.text}</a>`
    }, '') : ``}
        </div>
    </div>`;
    this.container.appendChild(div);
    
    this.tbodyColumsPanel = div.querySelector('tbody.tbodyColumsPanel');
    
    mxEvent.addListener(div.querySelector('span.rcui-layer-close'), 'click', mxUtils.bind(this, function (evt) {
        this.editorUi.hideDialog(true, false);
    }));
    if(this.config.buttons && this.config.buttons.length > 0){
        let btnEles = div.querySelectorAll('a.rcui-layer-dialog-btn');
        for (let i = 0; i < btnEles.length; i++) {
            mxEvent.addListener(btnEles[i], 'click', mxUtils.bind(this, function (evt) {
                if(this.config.buttons[i].func){
                    this.config.buttons[i].func(evt, this, this.config.buttons[i], this.tableHeaderConfig);
                }
            }));
        }
    }

    this.loadColumns();
}

SetTablePropertiesDialog.prototype.loadColumns = function(){
    this.tbodyColumsPanel.innerHTML = this.tableHeaderConfig.headers.reduce((t, item, i, list) => {
        if(item.columns.length < 1){
            return t + `<tr>
    <td rowspan="1" >${item.level}级表头</td>
    <td rowspan="1" colspan="8">
        <button type="button" data-header-index="${i}" class="addColums rcui-btn rcui-btn-fluid ${i != 0 && (!list[i-1].columns || list[i-1].columns.length < 1) ? 'rcui-btn-disabled' : ''}">增加列</button>
    </td>
</tr>`;
        }else{
            return item.columns.reduce((ct, column, j, columns) => {
                if(j == 0){
                    return ct + `<tr>
                    <td rowspan="${columns.length}">${item.level}级表头</td>
                    <td>${column.name}</td>
                    <td>${column.rowspan}</td>
                    <td>${column.colspan}</td>
                    <td>${column.key}</td>
                    <td>${column.colIndex}</td>
                    <td>${column.width}</td>
                    <td>
                        <button type="button" class="editColums rcui-btn rcui-btn-sm rcui-btn-normal" data-header-index="${i}" data-column-index="${j}">编辑</button>
                        <button type="button" class="insertColums rcui-btn rcui-btn-sm rcui-btn-orange" data-header-index="${i}" data-column-index="${j}">插入</button>
                        <button type="button" class="deleteColums rcui-btn rcui-btn-sm rcui-btn-danger" data-header-index="${i}" data-column-index="${j}">删除</button>
                    </td>
                    <td rowspan="${columns.length}">
                        <button type="button" class="addColums rcui-btn rcui-btn-sm rcui-btn-normal" data-header-index="${i}">增加列</button>
                    </td>
                </tr>`;
                }else{
                    return ct + `<tr>
                    <td>${column.name}</td>
                    <td>${column.rowspan}</td>
                    <td>${column.colspan}</td>
                    <td>${column.key}</td>
                    <td>${column.colIndex}</td>
                    <td>${column.width}</td>
                    <td>
                        <button type="button" class="editColums rcui-btn rcui-btn-sm rcui-btn-normal" data-header-index="${i}" data-column-index="${j}">编辑</button>
                        <button type="button" class="insertColums rcui-btn rcui-btn-sm rcui-btn-orange" data-header-index="${i}" data-column-index="${j}">插入</button>
                        <button type="button" class="deleteColums rcui-btn rcui-btn-sm rcui-btn-danger" data-header-index="${i}" data-column-index="${j}">删除</button>
                    </td>
                </tr>`;
                }
            }, t);
        }
    },'');
    let addColumsBtns = this.tbodyColumsPanel.querySelectorAll('button.addColums');
    let addClickListener = mxUtils.bind(this, function(e){
        const btn = e.srcElement || e.target;
        const index = parseInt(btn.getAttribute('data-header-index'));
        this.editorUi.showObjectFormDialog({
            title: `${index + 1}级表头增加列`,
            formObj: {
                name: '',
                key: '',
                rowspan: 1,
                colspan: 1,
                width: '',
            },
            formProperties: [
                {
                    name: '列名',
                    type: 'input',
                    key: 'name',
                    config: {
                        type: 'text',
                    },
                },
                {
                    name: '跨行',
                    type: 'input',
                    key: 'rowspan',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 50,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: '行',
                    },
                },
                {
                    name: '跨列',
                    type: 'input',
                    key: 'colspan',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 50,
                        step: 1,
                        hideStep: false,
                        decimal: true,
                        unit: '列',
                    },
                },
                {
                    name: '属性',
                    type: 'input',
                    key: 'key',
                    config: {
                        type: 'text',
                    },
                },
                {
                    name: '列号',
                    type: 'input',
                    key: 'colIndex',
                    config: {
                        type: 'text',
                        type: 'number',
                        min: 1,
                        max: 100,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: '',
                    },
                },
                {
                    name: '宽度',
                    type: 'input',
                    key: 'width',
                    config: {
                        type: 'number',
                        min: 0,
                        max: 9999,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: 'px',
                    },
                },
            ],
            buttons: [{text: '取消', typeClass:'rcui-bg-red', func: mxUtils.bind(this, function (evt, dialog, btn) {
                this.editorUi.hideDialog(true, false);
            })},{text: '确定', typeClass:'rcui-bg-blue', func: mxUtils.bind(this, function (evt, dialog, btn, resObj) {
                this.editorUi.hideDialog(true, false);
                this.tableHeaderConfig.headers[index].columns.push(resObj);
                this.loadColumns();
            })}]
        })
    })
    addColumsBtns.forEach(element => {
        if(!mxUtils.hasStyleClass(element, 'rcui-btn-disabled')){
            mxEvent.addListener(element, 'click', addClickListener);
        }
    });
    let insertColumsBtns = this.tbodyColumsPanel.querySelectorAll('button.insertColums');
    let insertClickListener = mxUtils.bind(this, function(e){
        const btn = e.srcElement || e.target;
        const index = parseInt(btn.getAttribute('data-header-index'));
        const col = parseInt(btn.getAttribute('data-column-index'));
        this.editorUi.showObjectFormDialog({
            title: `${index + 1}级表头增加列`,
            width: 480,
            height: 410,
            formObj: {
                name: '',
                key: '',
                rowspan: 1,
                colspan: 1,
                width: '',
                colIndex: 1,
            },
            formProperties: [
                {
                    name: '列名',
                    type: 'input',
                    key: 'name',
                    config: {
                        type: 'text',
                    },
                },
                {
                    name: '跨行',
                    type: 'input',
                    key: 'rowspan',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 50,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: '行',
                    },
                },
                {
                    name: '跨列',
                    type: 'input',
                    key: 'colspan',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 50,
                        step: 1,
                        hideStep: false,
                        decimal: true,
                        unit: '列',
                    },
                },
                {
                    name: '属性',
                    type: 'input',
                    key: 'key',
                    config: {
                        type: 'text',
                    },
                },
                {
                    name: '列号',
                    type: 'input',
                    key: 'colIndex',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 100,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: '',
                    },
                },
                {
                    name: '宽度',
                    type: 'input',
                    key: 'width',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 9999,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: 'px',
                    },
                },
            ],
            buttons: [{text: '取消', typeClass:'rcui-bg-red', func: mxUtils.bind(this, function (evt, dialog, btn) {
                this.editorUi.hideDialog(true, false);
            })},{text: '确定', typeClass:'rcui-bg-blue', func: mxUtils.bind(this, function (evt, dialog, btn, resObj) {
                this.editorUi.hideDialog(true, false);
                let columns = this.tableHeaderConfig.headers[index].columns;
                columns.splice(col, 0, resObj);
                this.tableHeaderConfig.headers[index].columns = columns;
                this.loadColumns();
            })}]
        })
    })
    insertColumsBtns.forEach(element => {
        mxEvent.addListener(element, 'click', insertClickListener);
    });
    let editColumsBtns = this.tbodyColumsPanel.querySelectorAll('button.editColums');
    let editClickListener = mxUtils.bind(this, function(e){
        const btn = e.srcElement || e.target;
        const index = parseInt(btn.getAttribute('data-header-index'));
        const col = parseInt(btn.getAttribute('data-column-index'));
        this.editorUi.showObjectFormDialog({
            title: `${index + 1}级表头修改列`,
            width: 480,
            height: 410,
            formObj: {...this.tableHeaderConfig.headers[index].columns[col]},
            formProperties: [
                {
                    name: '列名',
                    type: 'input',
                    key: 'name',
                    config: {
                        type: 'text',
                    },
                },
                {
                    name: '跨行',
                    type: 'input',
                    key: 'rowspan',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 50,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: '行',
                    },
                },
                {
                    name: '跨列',
                    type: 'input',
                    key: 'colspan',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 50,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: '列',
                    },
                },
                {
                    name: '属性',
                    type: 'input',
                    key: 'key',
                    config: {
                        type: 'text',
                    },
                },
                {
                    name: '列号',
                    type: 'input',
                    key: 'colIndex',
                    config: {
                        type: 'number',
                        min: 1,
                        max: 100,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: '',
                    },
                },
                {
                    name: '宽度',
                    type: 'input',
                    key: 'width',
                    config: {
                        type: 'number',
                        min: 0,
                        max: 9999,
                        step: 1,
                        hideStep: false,
                        decimal: false,
                        unit: 'px',
                    },
                },
            ],
            buttons: [{text: '取消', typeClass:'rcui-bg-red', func: mxUtils.bind(this, function (evt, dialog, btn) {
                this.editorUi.hideDialog(true, false);
            })},{text: '确定', typeClass:'rcui-bg-blue', func: mxUtils.bind(this, function (evt, dialog, btn, resObj) {
                this.editorUi.hideDialog(true, false);
                let columns = this.tableHeaderConfig.headers[index].columns;
                columns.splice(col, 1, resObj);
                this.tableHeaderConfig.headers[index].columns = columns;
                this.loadColumns();
            })}]
        })
    })
    editColumsBtns.forEach(element => {
        mxEvent.addListener(element, 'click', editClickListener);
    });

    let deleteColumsBtns = this.tbodyColumsPanel.querySelectorAll('button.deleteColums');
    let deleteClickListener = mxUtils.bind(this, function(e){
        const btn = e.srcElement || e.target;
        const index = parseInt(btn.getAttribute('data-header-index'));
        const col = parseInt(btn.getAttribute('data-column-index'));
        this.editorUi.layerConfirm({
            width: 200,
            height: 150,
            title: '提示',
            content: '确认是否删除？',
            buttons: [
                {
                    text: '否', func: mxUtils.bind(this, function () {
                        this.editorUi.hideDialog(true, false);
                    })
                }, {
                    text: '是', func: mxUtils.bind(this, function () {
                        this.editorUi.hideDialog(true, false);
                        let columns = this.tableHeaderConfig.headers[index].columns;
                        columns.splice(col, 1);
                        this.tableHeaderConfig.headers[index].columns = columns;
                        this.loadColumns();
                    })
                }
            ]
        });
    })
    deleteColumsBtns.forEach(element => {
        mxEvent.addListener(element, 'click', deleteClickListener);
    });
};

