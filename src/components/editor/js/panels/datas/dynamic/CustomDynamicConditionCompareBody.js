/* eslint-disable */

import BaseFormatPanel from "../../BaseFormatPanel";
import {mxUtils} from "../../../../core/mxgraph";

export default CustomDynamicConditionCompareBody;

function CustomDynamicConditionCompareBody(format, prop) {
    BaseFormatPanel.call(this, format, format.editorUi, this.createTag('div', 'rcui-dynamic-data-panel-custom'));
    this.prop = prop;
    this.cotOptions = [
        {key: 0, title: '等于'},
        {key: 1, title: '不等于'},
        {key: 2, title: '小于等于'},
        {key: 3, title: '介于之间'},
        {key: 4, title: '大于等于'},
        {key: 5, title: '外包含'},
        {key: 6, title: '不外包含'},
        {key: 7, title: '内包含'},
        {key: 8, title: '不包含'},
    ];
    this.init();
}

mxUtils.extend(CustomDynamicConditionCompareBody, BaseFormatPanel);
//     cot:0, 比较类型 比较方是 【数据点的值】 和 【输入框的值（min, max）】进行比较
//        以下代号 dv 为数据点的值代号 minv为输入框的min的值 maxv为输入框的max的值 valv 为输入框val的值
//         0: 相等比较 dv == minv 此时 max输入框无效
//         1: 非相等比较 dv != minv 此时 max输入框无效
//         2: 做大小比较 dv <= minv 此时 max输入框无效
//         3: 做大小比较 minv <= dv <= maxv
//         4: 做大小比较 dv >= maxv 此时 min输入框无效
//         5: 外包含 dv中包含minv
//         6: 非外包含 dv中不包含minv
//         7: 内包含 minv中包含dv
//         8: 非内包含 minv中不包含dv"shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=/rcscada/images/usr/switch/17.svg;closeStateImg=/rcscada/images/usr/switch/18.svg;html=1;shadow=0;dashed=0;strokeWidth=1;stateValue=0;title=控制开关10;opacity=100;fillColor=none;verticalLabelPosition=bottom;verticalAlign=top;"
//     min: null,
//     max: null,
//     val: null
CustomDynamicConditionCompareBody.prototype.init = function () {
    const prop = this.prop;
    this.container.innerHTML = `
    <table class="rcui-table" style="margin-top: 5px">
    <thead>
        ${prop.hasLabelCol || (this.prop.fixed && this.prop.cons[0].label) ? `<th title="值名" style="min-width: 50px;font-size: 10px;">状态</th>` : ''}
        <th title="${`等于： 点位值 与 min输入值 作相等比较 此时 max输入框无效
不等于： 点位值 与 min输入值 作不相等比较 此时 max输入框无效
小于等于： 点位值 与 min输入值 作大小比较 此时 max输入框无效
介于之间： 点位值 与 min输入值 和 max输入框值 作大小比较
大于等于： 点位值 与 min输入框值 作大小比较 此时 max输入框无效
外包含： 点位值 是否 包含 min输入值
非外包含： 点位值 是否 不包含 min输入值
内包含： min输入值 是否 包含 点位值
非内包含： min输入值 是否 不包含 点位值`}" style="min-width: 80px;font-size: 9px;">比较<br/>方式</th>
        <th title="最小值" style="font-size: 10px;">min</th>
        <th title="最大值" style="font-size: 10px;">max</th>
        <th title="设值" style="font-size: 10px;">设值</th>
        ${prop.fixed ? '' : `<th title="新增状态" style="font-size: 10px;"><div class="rcui-btn btnAddCons rcui-btn-primary rcui-btn-sm">
                <i class="rcui-icon rcui-icon-addition"></i>
            </div></th>`}
    </thead>
    <tbody class="fnsBody">
    </tbody>
</table>`;
    this.tableBody = this.container.querySelector('tbody.fnsBody');
    this.refreshTableView();
    if(!prop.fixed){
        mxEvent.addListener(this.container.querySelector('div.rcui-btn.btnAddCons'), 'click', mxUtils.bind(this, function (evt) {
            this.prop.cons.push({min: null, max: null, val: null});
            this.refreshTableView();
            // 数据变化时自动保存
            if (this.format && this.format.autoSaveDynamicData) {
                this.format.autoSaveDynamicData(this.prop);
            }
        }));
    }
}

CustomDynamicConditionCompareBody.prototype.refreshTableView = function () {
    this.tableBody.innerHTML = `${this.prop.cons.reduce((t, item, i) => {
        return t + `<tr class="fnsBody-row">
                ${this.prop.hasLabelCol || (this.prop.fixed && item.label) ? `
                <td title="${this.prop.fixed && item.label ? item.label : (this.prop.labelKeyword ? this.prop.labelKeyword : '状态') + `${i + 1}` }" class="fnsBody-row-conname" style="text-align: center;">
                    ${this.prop.fixed && item.label ? item.label : (this.prop.labelKeyword ? this.prop.labelKeyword : '状态') + `${i + 1}` }
                </td>` : ''}
                <td style="text-align: center;" class="fnsBody-row-cot"></td>
                <td style="text-align: center;" class="fnsBody-row-min"></td>
                <td style="text-align: center;" class="fnsBody-row-max"></td>
                <td style="text-align: center;" class="fnsBody-row-val"></td>
                ${this.prop.fixed ? '' : `
                <td style="text-align: center;" class="fnsBody-row-ctrl">
                    <div title="删除" class="rcui-btn rcui-btn-sm rcui-btn-primary btnDeleteItem">
                        <i class="rcui-icon rcui-icon-delete"></i>
                    </div>
                </td>`}
            </tr>`
    }, '')}`;
    let trRows = this.container.querySelectorAll('tr.fnsBody-row');
    for (let i = 0; i < trRows.length; i++) {
        let td_i_cot = trRows[i].querySelector('td.fnsBody-row-cot');
        let cotSelectCell = this.createOnlySelect({
            options: this.cotOptions,
        }, mxUtils.bind(this, function () {
            return this.prop.cons[i].cot;
        }), mxUtils.bind(this, function (val) {
            this.prop.cons[i].cot = val.key;
            // 数据变化时自动保存
            if (this.format && this.format.autoSaveDynamicData) {
                this.format.autoSaveDynamicData(this.prop);
            }
        }));
        cotSelectCell.selectInput.style.cssText = `
        padding: 0px;
        text-align: left;
        font-size: 12px;
            height: 35px;
            line-height: 35px;
            border-width: 0px;`;
        cotSelectCell.selectInput.parentElement.parentElement.style.cssText = `
            height: 35px;
            line-height: 35px;
            border-width: 0px;`;

        td_i_cot.appendChild(cotSelectCell.root);
        let td_i_min = trRows[i].querySelector('td.fnsBody-row-min');
        let minInputCell = this.createOnlyInput({
            type: 'text',
            textAlign: 'center',
            required: false,
        }, mxUtils.bind(this, function () {
            return this.prop.cons[i].min;
        }), mxUtils.bind(this, function (val) {
            this.prop.cons[i].min = val;
            // 数据变化时自动保存
            if (this.format && this.format.autoSaveDynamicData) {
                this.format.autoSaveDynamicData(this.prop);
            }
        }));
        td_i_min.appendChild(minInputCell.root);
        let td_i_max = trRows[i].querySelector('td.fnsBody-row-max');
        let maxInputCell = this.createOnlyInput({
            type: 'text',
            textAlign: 'center',
            required: false,
        }, mxUtils.bind(this, function () {
            return this.prop.cons[i].max;
        }), mxUtils.bind(this, function (val) {
            this.prop.cons[i].max = val;
            // 数据变化时自动保存
            if (this.format && this.format.autoSaveDynamicData) {
                this.format.autoSaveDynamicData(this.prop);
            }
        }));
        td_i_max.appendChild(maxInputCell.root);
        let td_i_val = trRows[i].querySelector('td.fnsBody-row-val');
        let disable = mxUtils.isNotNullOrUndefined(this.prop.valDisable) && this.prop.valDisable === true;
        if(this.prop.valType === 'input'){
            let valInputCell = this.createOnlyInput({
                type: 'text',
                textAlign: 'center',
                disable: disable,
                required: false,
            }, mxUtils.bind(this, function () {
                return this.prop.cons[i].val;
            }), mxUtils.bind(this, function (val) {
                this.prop.cons[i].val = val;
                // 数据变化时自动保存
                if (this.format && this.format.autoSaveDynamicData) {
                    this.format.autoSaveDynamicData(this.prop);
                }
            }));
            td_i_val.appendChild(valInputCell.root);
        }else if(this.prop.valType === 'select'){
            let valInputCell = this.createOnlySelect({
                option:this.prop.valSelectOptions,
                textAlign: 'center',
                disable: disable,
                required: false,
            }, mxUtils.bind(this, function () {
                return this.prop.cons[i].val;
            }), mxUtils.bind(this, function (val) {
                this.prop.cons[i].val = val.key;
                // 数据变化时自动保存
                if (this.format && this.format.autoSaveDynamicData) {
                    this.format.autoSaveDynamicData(this.prop);
                }
            }));
            td_i_val.appendChild(valInputCell.root);
        }else if(this.prop.valType === 'color'){
            let valInputCell = this.createOnlyColor({
                hideInput: true,
                textAlign: 'center',
                disable: disable,
                required: false,
            }, mxUtils.bind(this, function () {
                return this.prop.cons[i].val;
            }), mxUtils.bind(this, function (val) {
                this.prop.cons[i].val = val;
                // 数据变化时自动保存
                if (this.format && this.format.autoSaveDynamicData) {
                    this.format.autoSaveDynamicData(this.prop);
                }
            }));
            td_i_val.appendChild(valInputCell.root);
        }else if(this.prop.valType === 'image'){
            let valInputCell = this.createOnlyPicture({
                width: 40,
                height: 40,
                small: true,
                disable: disable,
                required: false,
            }, mxUtils.bind(this, function () {
                return this.prop.cons[i].val;
            }), mxUtils.bind(this, function (val) {
                this.prop.cons[i].val = val;
                // 数据变化时自动保存
                if (this.format && this.format.autoSaveDynamicData) {
                    this.format.autoSaveDynamicData(this.prop);
                }
            }));
            td_i_val.appendChild(valInputCell.root);
        }
        let td_i_ctrl = trRows[i].querySelector('td.fnsBody-row-ctrl');
        if(td_i_ctrl){
            mxEvent.addListener(td_i_ctrl.querySelector('div.rcui-btn.btnDeleteItem'), 'click', mxUtils.bind(this, function (evt) {
                this.editorUi.confirm("确定要删除吗？", mxUtils.bind(this, function (evt) {
                    this.prop.cons.splice(i, 1);
                    this.refreshTableView();
                    // 数据变化时自动保存
                    if (this.format && this.format.autoSaveDynamicData) {
                        this.format.autoSaveDynamicData(this.prop);
                    }
                }));
            }));
        }
    }
}
