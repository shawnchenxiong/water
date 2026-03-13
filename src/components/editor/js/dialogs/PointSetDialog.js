/* eslint-disable */
/*
 * 请在 「自定义方法区」之后输入自定义计算代码
 * params中是选择的点位值 按选择顺序从上往下、从左往右
const params = arguments[0];
const defaultValue = arguments[1];
console.log('自定义方法----',params, defaultValue);
if(!params || params.length <= 0) return defaultValue;
//取值
// let p0 = params[0];
//let p1 = params[1];
//let p2 = params[2];
//let p3 = params[3];
//let p4 = params[4];
// ...
//自定义方法区start

//自定义方法区end
// 此处要返回计算出来的值
return defaultValue;

 */

import {mxUtils} from "../../core/mxgraph";
import BaseDialog from "./BaseDialog";
import api from "../utils/api.js";

export default PointSetDialog;

function PointSetDialog(editorUi, config) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.container.style.cssText = `width: ${config.width}px;; height: ${config.height}px;display:flex;flex-direction: column;`;
    this.init();
};

mxUtils.extend(PointSetDialog, BaseDialog);

PointSetDialog.prototype.init = function () {
    let contentHeight = this.config.height - 110;
    console.log('contentHeight', this.config.height, contentHeight)
    this.currentIndex = -1;
    this.tabs = [
        {
            key: 'text',
            title: '配置虚拟变量',
            panel: new VirtualVariablePanel(this.editorUi, {width: this.config.width, height: contentHeight})
        },
        {
            key: 'http',
            title: '配置Http数据接口',
            panel: new HttpjsonPanel(this.editorUi, {width: this.config.width, height: contentHeight})
        },
        {
            key: 'style',
            title: '数据点位',
            panel: new RemoteVariablePanel(this.editorUi, {width: this.config.width, height: contentHeight})
        },
    ];
    const titleTabDiv = this.createDiv('rcui-tab2');
    titleTabDiv.style.position = 'relative';
    titleTabDiv.style.backgroundColor = this.activeTabBackgroundColor;
    this.container.appendChild(titleTabDiv);

    const contentDiv = this.createTag('div', 'mydiv');
    contentDiv.style.cssText = `width:${this.config.width - 10}px;height:${contentHeight}px;`;
    this.container.appendChild(contentDiv);

    for (let i = 0; i < this.tabs.length; i++) {
        const childDiv = this.createTabCell(this.tabs[i].title);
        mxUtils.addStyleClass(childDiv, 'rcui-tab2-item');
        titleTabDiv.appendChild(childDiv);
        this.tabs[i].panel.container.style.display = 'none';
        contentDiv.appendChild(this.tabs[i].panel.container);
        childDiv.onclick = mxUtils.bind(this, function (evt) {
            this.changeTab(i);
        });
    }
    let setwin = this.createTag('div', 'rcui-layer-setwin');
    setwin.innerHTML = `<div class="rcui-layer-close-outer"><span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span></div>`;
    this.titleTabDiv = titleTabDiv;
    titleTabDiv.appendChild(setwin);
    mxEvent.addListener(setwin.querySelector('div.rcui-layer-close-outer'), 'click', mxUtils.bind(this, function (evt) {
        this.tabs[0].panel.checkCloseDialog();
    }));

    this.changeTab(0);
}

PointSetDialog.prototype.changeTab = function (index) {
    if (this.currentIndex === index) return;
    this.currentIndex = index;
    for (let i = 0; i < this.tabs.length; i++) {
        const ele = this.titleTabDiv.childNodes[i];
        if (index === i) {
            mxUtils.addStyleClass(ele, 'rcui-tab2-item-active');
            this.tabs[i].panel.container.style.display = 'flex';
        } else {
            mxUtils.removeStyleClass(ele, 'rcui-tab2-item-active');
            this.tabs[i].panel.container.style.display = 'none';
        }
    }
};

function RemoteVariablePanel(editorUi, config) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.container.style.cssText = `overflow: scroll;width: 100%; height: ${this.config.height}px;`;
    // this.container.style.height = `${this.config.height}px;`;
    // this.container.style.padding = '10px';
    // this.container.style.boxSizing = 'border-box';
    this.init();
}

mxUtils.extend(RemoteVariablePanel, BaseDialog);
RemoteVariablePanel.prototype.init = function () {
    let list = this.editorUi.GLOBAL_CONFIG.templete && this.editorUi.GLOBAL_CONFIG.templete.rcVariableList ?
        this.editorUi.GLOBAL_CONFIG.templete.rcVariableList : [];
    console.log('list', list);
    let tab = this.createTag('table', 'rcui-table');
    tab.innerHTML = `
        <thead><tr><th style="width: 120px;">ID</th><th>点位名</th><th>属性名</th><th>类型</th><th>默认值</th></tr></thead>
        <tbody>
    ${list.reduce((t, item, index) => {
        return t + `<tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.dwkey}</td>
            <td>${item.valueType == 0 ? '整型' : item.valueType == 1 ? '浮点型' : item.valueType == 2 ? '字符串' : '其他'}</td>
            <td>${item.defaultValue}</td>
        </tr>`;
    }, '')}
        `;
    this.container.appendChild(tab);

}

function VirtualVariablePanel(editorUi, config) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.container.style.cssText = `width: 100%; height: ${this.config.height}px;display:flex;flex-direction: column;`;
    const json = this.editorUi.GLOBAL_CONFIG.device.virvarJson;
    this.virvarList = json && json.length > 0 ? JSON.parse(json) : [];
    this.init();

}

mxUtils.extend(VirtualVariablePanel, BaseDialog);

VirtualVariablePanel.prototype.loadDeviceDropDown = function () {
    // 设置两个查询条件的接参

    this.selectValue = '';
    this.inputValue = '';
    // 下拉框 列表
    this.deviceNameList = [];
    // api接口
    api.getDeviceNameList().then(res => {
        if (res.code === 200) {
            this.deviceNameList = res.result;
            const deviceNameSelect = this.createLabelCellRowSelect('设备列表', {
                options: this.deviceNameList,
                disable: false,
            }, mxUtils.bind(this, function () {
                return this.selectValue;
            }), mxUtils.bind(this, function (option, evt) {
                console.log('option', option);
                this.selectValue = option;
            }));
            // 获取根元素并设置宽度
            const rootElement = deviceNameSelect.root;
            rootElement.style.width = '300px';
            this.deviceDropDown.appendChild(deviceNameSelect.root);
        }
    });
}

VirtualVariablePanel.prototype.init = function () {
    this.pointList = this.editorUi.GLOBAL_CONFIG.templete && this.editorUi.GLOBAL_CONFIG.templete.rcVariableList ?
        this.editorUi.GLOBAL_CONFIG.templete.rcVariableList : [];
    // 每次都在头部更新系统变量
    let sysVirvarList = this.genDefaultVirvarList();
    this.virvarList = this.virvarList.filter(item => {
        return !item.sys
    });
    this.virvarList.unshift(...sysVirvarList);

    if (this.virvarList.length <= 0) {
        this.virvarListFirstJson = null;
    } else {
        this.virvarListFirstJson = JSON.stringify(this.virvarList);
    }

    // 虚拟滚动配置
    this.virtualScrollConfig = {
        itemHeight: 40, // 每行高度（可根据实际调整）
        bufferSize: 10, // 缓冲区行数（上下各多渲染10行）
        scrollTop: 0, // 当前滚动位置
        visibleStartIndex: 0, // 可见区域起始索引
        visibleEndIndex: 0, // 可见区域结束索引
        filteredList: [] // 过滤后的列表（用于搜索）
    };

    // 勾选功能配置
    this.selectedIds = new Set(); // 存储选中的变量ID集合

    let contentHeight = this.config.height - 50;
    console.log('this.config.width', this.config.width)
    console.log('this.config.height', this.config.height)
    let div = this.createTag('div');
    div.style.cssText = `width: ${this.config.width}px;height:${contentHeight}px;display:flex;flex-direction:row;`;
    div.innerHTML = `<div style="height: ${contentHeight}px; flex: 1; margin-right: 10px;">
  <div class="rcui-panel" style="padding: 10px; box-sizing: border-box; background: #FFFFFF; height: 100%; overflow: hidden;">
    <div class="panel-one" style="display: flex; flex-direction: row;">
      <div class="device-drop-down"></div>
      <div style="display: flex; flex-direction: row; width: 300px; margin-left: 2%;">
          <div class="rcui-transfer-search" style="width: 100%;">
            <i class="rcui-icon rcui-icon-search"></i>
            <input
              type="text"
              value=""
              class="rcui-input leftSearchInput"
              placeholder="变量名搜索"
            />
            <span
              class="clear-icon"
              style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer;"
            >
              ×
            </span>
          </div>
        </div>
        <div class="rcui-btn rcui-btn-sm queryBtn" style="margin-right: 20px; margin-left: 1%; margin-top: 5px; width: 50px;">查询</div>
<!--        <div class="rcui-btn rcui-btn-danger rcui-btn-sm resetBtn" style="margin-right: 30px; margin-left: 1%; margin-top: 5px; width: 50px;">重置</div>-->
    </div>  
    <div class="variableTable" style="overflow-y: auto; height: 100%;">
      <table class="rcui-table">
        <thead class="sticky-header">
          <tr>
            <th colspan="5">虚拟变量列表 <span class="selected-count" style="color: #1890ff; margin-left: 10px;">已选: 0</span></th>
            <th style="text-align: center;">
              <div
                class="rcui-btn rcui-bg-blue rcui-btn-sm addPoint"
                style="width: calc(100% - 20px); display: block;"
              >
                新增
              </div>
            </th>
          </tr>
          <tr>
            <th style="width: 50px; text-align: center;">
              <input type="checkbox" class="select-all-checkbox" style="cursor: pointer;" />
            </th>
            <th style="width: 50px; text-align: center;">序号</th>
            <th style="text-align: center;">变量名</th>
            <th style="text-align: center;">变量类型</th>
            <th style="text-align: center;">默认值</th>
            <th style="width: 100px; text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody class="pointListBody" id="tableBody">
        </tbody>
      </table>
    </div>
  </div>
</div>
<div style="height: 100%; width: 630px; min-width: 560px;">
  <div
    class="rcui-panel"
    style="padding: 10px; box-sizing: border-box; background: #FFFFFF; height: 100%; overflow: hidden;"
  >
    <div class="rightSettingBody" style="overflow-y: scroll; height: 100%;"></div>
  </div>
</div>`;
    this.container.appendChild(div);
    this.pointListBody = div.querySelector('tbody.pointListBody');
    this.rightSettingBody = div.querySelector('div.rightSettingBody');
    this.deviceDropDown = div.querySelector('div.device-drop-down');
    this.leftSearchInput = div.querySelector('input.leftSearchInput');
    this.cleanIcon = div.querySelector('span.clear-icon');
    this.variableTable = div.querySelector('div.variableTable');
    this.selectAllCheckbox = div.querySelector('input.select-all-checkbox');
    this.selectedCountSpan = div.querySelector('span.selected-count');

    // 绑定全选事件（优化大数据量处理）
    mxEvent.addListener(this.selectAllCheckbox, 'change', mxUtils.bind(this, function (evt) {
        const checked = evt.target.checked;
        const filteredList = this.virtualScrollConfig.filteredList;

        // 使用批量操作，避免一次性处理大量数据
        if (checked) {
            // 全选：批量添加所有过滤后的变量ID
            const idsToAdd = filteredList.map(item => item.id);
            idsToAdd.forEach(id => this.selectedIds.add(id));
        } else {
            // 取消全选：批量删除过滤后的变量ID
            const idsToRemove = filteredList.map(item => item.id);
            idsToRemove.forEach(id => this.selectedIds.delete(id));
        }

        this.updateSelectedCount();
        // 只重新渲染可见区域，不重新渲染整个列表
        this.renderVirtualList();
    }));

    // 初始化虚拟滚动
    this.initVirtualScroll();
    mxEvent.addListener(this.container.querySelector('div.addPoint'), 'click', mxUtils.bind(this, function (evt) {
        this.addPoint();
    }));
    if (this.virvarList.length > 0) {
        this.currentVirvar = this.virvarList[0];
    }
    let bottom = this.createTag('div', 'rcui-panel-dialog-footer');
    bottom.innerHTML = `
<div style="font-size: 13px;color: red;margin-right: 20px;">第一次或者系统点位存在变化需要手动保存一次，否则绑定中无法选择新增的系统变量</div>
<div class="rcui-btn rcui-btn-sm rcui-btn-primary rcui-border closeBtn" style="margin-right: 20px;width: 80px;">关闭</div>
<div class="rcui-btn rcui-btn-sm rcui-bg-purple checkBtn" style="margin-right: 20px;width: 80px;">校验算法</div>
<div class="rcui-btn rcui-btn-sm saveBtn" style="margin-right: 30px;width: 80px;">保存</div>
`;
    this.container.appendChild(bottom);
    bottom.style.height = '50px';
    this.checkBtn = bottom.querySelector('div.checkBtn');
    this.saveBtn = bottom.querySelector('div.saveBtn');
    mxEvent.addListener(this.checkBtn, 'click', mxUtils.bind(this, function (evt) {
        let hasError = false;
        for (let i = 0; i < this.virvarList.length; i++) {
            let err = this.checkSettingForm(this.virvarList[i]);
            if (typeof err == 'string') {
                hasError = true;
                mxUtils.alert(`第${i + 1}个变量存在错误，${err}`);
            }
        }
        if (!hasError) {
            mxUtils.alert('校验通过！');
        }
    }));
    mxEvent.addListener(this.saveBtn, 'click', mxUtils.bind(this, function (evt) {
        // 检查是否有选中的变量
        if (this.selectedIds.size === 0) {
            mxUtils.alert('请至少选择一个虚拟变量进行保存');
            return;
        }

        // 获取选中的变量列表
        const selectedVirvars = this.virvarList.filter(item => this.selectedIds.has(item.id));

        // 校验选中的变量
        for (let i = 0; i < selectedVirvars.length; i++) {
            const item = selectedVirvars[i];
            const originalIndex = this.virvarList.findIndex(v => v.id === item.id);
            let err = this.checkSettingForm(item);
            if (typeof err == 'string') {
                mxUtils.alert(`第${originalIndex + 1}个变量"${item.name}"存在错误，${err}`);
                return;
            }
        }

        // 保存选中的变量
        const selectedJson = JSON.stringify(selectedVirvars);
        this.editorUi.saveVirvarJson(selectedJson, mxUtils.bind(this, function (res) {
            // 保存成功后，更新已保存的变量状态
            selectedVirvars.forEach(item => {
                const originalItem = this.virvarList.find(v => v.id === item.id);
                if (originalItem) {
                    // 标记为已保存（可以在这里添加标记逻辑）
                }
            });

            setTimeout(() => {
                mxUtils.alert(`已保存 ${selectedVirvars.length} 个虚拟变量`);
                // 更新初始状态，防止关闭时提示
                this.virvarListFirstJson = JSON.stringify(this.virvarList);
                // 更新过滤列表并重新渲染
                this.updateFilteredList();
                this.renderVirtualList();
            }, 1);
        }), mxUtils.bind(this, function (e) {
            setTimeout(() => {
                mxUtils.alert(e);
            }, 1);
        }));
    }));
    mxEvent.addListener(bottom.querySelector('div.closeBtn'), 'click', mxUtils.bind(this, function (evt) {
        this.checkCloseDialog();
    }));
    this.loadDeviceDropDown();
    this.loadVirvarListHtml();
    this.loadVirvarSettingPanel();
};
VirtualVariablePanel.prototype.checkCloseDialog = function () {
    if (this.virvarListFirstJson == JSON.stringify(this.virvarList)) {
        this.editorUi.hideDialog(true, false);
        return true;
    }
    this.editorUi.layerConfirm({
        width: 300,
        height: 200,
        title: '提示',
        // content: '存在已修改变量，未保存直接关闭会导致数据丢失，确认关闭吗？',
        content: '如果存在已修改数据且未保存会导致修改不生效，确认关闭吗？',
        buttons: [
            {
                text: '继续设置', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(true, false);
                })
            }, {
                text: '确定关闭', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(true, false);
                    setTimeout(() => {
                        this.editorUi.hideDialog(false, false);
                    }, 1);
                })
            }
        ]
    });
    return false;
};

VirtualVariablePanel.prototype.genDefaultVirvarList = function () {
    let sysVirvarList = []
    if (this.pointList.length > 0) {
        sysVirvarList = this.pointList.map((item, i) => {
            return {
                id: i + '',
                name: `${item.name}`,
                templeteId: item.templeteId,
                valueType: item.valueType,
                defaultValue: item.defaultValue,
                pointId: item.id,
                sxDeviceId: item.deviceId,
                points: [item.dwkey],
                sys: true,
                customFunc: `const params = arguments[0];
const defaultValue = arguments[1];
if(!params || params.length <= 0) return defaultValue;
return params[0];`,
            }
        })
    }
    return sysVirvarList;
};

VirtualVariablePanel.prototype.checkSettingForm = function (virvarObj) {
    if (!virvarObj.name || virvarObj.name.trim().length <= 0) {
        return '未设置变量名';
    }
    if (virvarObj.valueType === null || virvarObj.valueType === undefined) {
        return '未设置变量类型';
    }
    if (virvarObj.defaultValue === null || virvarObj.defaultValue === undefined) {
        return '未设置变量默认值（算法返回的默认值）';
    }
    if (!virvarObj.points || virvarObj.points.length <= 0) {
        return '未设置点位';
    }
    if (!virvarObj.customFunc || virvarObj.customFunc.trim().length <= 0) {
        return '未输入算法';
    }
    let customFunc = new Function(virvarObj.customFunc);
    /*let ops = this.pointList.filter(item => virvarObj.points.indexOf(item.dwkey) > -1).reduce((obj, item, i) => {
        obj[item.id] = item;
        return obj;
    }, {});*/
    // let params = virvarObj.points.map(item => ops[item].defaultValue);
    /*let params = [];
    if(mxUtils.isNotNullOrUndefined(virvarObj.points) && virvarObj.points.length > 0){
        params = this.pointList.filter(item => virvarObj.points.indexOf(item.dwkey) > -1).map(item => {
            return mxUtils.convertDefaultValue(item.defaultValue, item.valueType);
        });
    }*/
    let params = this.pointList.filter(item => virvarObj.points.indexOf(item.dwkey) > -1).map(item => {
        return mxUtils.convertDefaultValue(item.defaultValue, item.valueType);
    });
    try {
        let res = customFunc(params, virvarObj.defaultValue);
        if (res == undefined) {
            return '算法未设置返回值';
        }
        if (virvarObj.valueType == 0 && !mxUtils.isInteger(res)) {
            return '算法返回值与默认类型不同，不是整型';
        }
        if (virvarObj.valueType == 1 && !mxUtils.isNumeric(res)) {
            return '算法返回值与默认类型不同，不是浮点型';
        }
        return {'params': params, 'defaultValue': virvarObj.defaultValue, 'res': res};
    } catch (e) {
        console.log(e);
        return '算法出错了！' + e
    }
};

VirtualVariablePanel.prototype.loadVirvarSettingPanel = function () {
    if (!this.currentVirvar) {
        this.rightSettingBody.innerHTML = `<div class="rcui-empty-node" style="padding: 50px 0px;">
            <img src="${mxUtils.staticImg('/rcscada/icon_empty.svg')}">
            <div class="rcui-empty-node-text">未选择变量</div>
            <div class="rcui-empty-node-text" style="margin-top: 16px;">点击左边列表中设置按钮选择变量</div>
        </div>`;
        return;
    }
    this.rightSettingBody.innerHTML = ``;
    const setNameRow = this.createLabelCellRowInput('变量名称', {
        type: 'text',
        disable: this.currentVirvar.sys,
    }, mxUtils.bind(this, function () {
        return this.currentVirvar.name;
    }), mxUtils.bind(this, function (value, evt) {
        this.currentVirvar.name = value;
    }));
    this.rightSettingBody.appendChild(setNameRow.root);
    const setValueTypeRow = this.createLabelCellRowSelect('变量类型', {
        options: [
            {key: 0, title: '整型'},
            {key: 1, title: '浮点型'},
            {key: 2, title: '字符串'},
        ],
        disable: this.currentVirvar.sys,
    }, mxUtils.bind(this, function () {
        return this.currentVirvar.valueType;
    }), mxUtils.bind(this, function (option, evt) {
        this.currentVirvar.valueType = option.key;
        setDefaultValueRowInt.root.style.display = this.currentVirvar.valueType === 0 ? 'flex' : 'none';
        setDefaultValueRowDouble.root.style.display = this.currentVirvar.valueType === 1 ? 'flex' : 'none';
        setDefaultValueRowString.root.style.display = this.currentVirvar.valueType === 2 ? 'flex' : 'none';
        if (this.currentVirvar.valueType === 0) {
            this.currentVirvar.defaultValue = 0;
            setDefaultValueRowInt.cell.outerChangeValue(0);
        } else if (this.currentVirvar.valueType === 1) {
            this.currentVirvar.defaultValue = 0;
            setDefaultValueRowDouble.cell.outerChangeValue(0);
        } else {
            this.currentVirvar.defaultValue = '';
            setDefaultValueRowString.cell.outerChangeValue('');
        }
    }));
    this.rightSettingBody.appendChild(setValueTypeRow.root);

    const setDefaultValueRowInt = this.createLabelCellRowInput('默认值', {
        type: 'number',
        min: -99999,
        max: 99999,
        step: 1,
        hideStep: false,
        decimal: false,
        unit: '',
        disable: this.currentVirvar.sys,
    }, mxUtils.bind(this, function () {
        if (this.currentVirvar.defaultValue == null) {
            return 0;
        }
        try {
            return parseInt(this.currentVirvar.defaultValue + '');
        } catch (e) {
            return 0;
        }
    }), mxUtils.bind(this, function (value) {
        try {
            this.currentVirvar.defaultValue = parseInt(value);
        } catch (e) {
            this.currentVirvar.defaultValue = 0;
            setDefaultValueRowInt.cell.outerChangeValue(0);
        }
    }));
    this.rightSettingBody.appendChild(setDefaultValueRowInt.root);
    const setDefaultValueRowDouble = this.createLabelCellRowInput('默认值', {
        type: 'number',
        min: -99999,
        max: 99999,
        step: 0.1,
        hideStep: false,
        decimal: true,
        unit: '',
        disable: this.currentVirvar.sys,
    }, mxUtils.bind(this, function () {
        if (this.currentVirvar.defaultValue == null) {
            return 0;
        }
        try {
            return parseFloat(this.currentVirvar.defaultValue + '');
        } catch (e) {
            return 0;
        }
    }), mxUtils.bind(this, function (value) {
        try {
            this.currentVirvar.defaultValue = parseFloat(value);
        } catch (e) {
            this.currentVirvar.defaultValue = 0;
            setDefaultValueRowInt.cell.outerChangeValue(0);
        }
    }));
    this.rightSettingBody.appendChild(setDefaultValueRowDouble.root);
    const setDefaultValueRowString = this.createLabelCellRowInput('默认值', {
        type: 'text',
        disable: this.currentVirvar.sys,
    }, mxUtils.bind(this, function () {
        return this.currentVirvar.defaultValue;
    }), mxUtils.bind(this, function (value) {
        try {
            this.currentVirvar.defaultValue = value;
        } catch (e) {
            this.currentVirvar.defaultValue = '';
            setDefaultValueRowInt.cell.outerChangeValue('');
        }
    }));
    this.rightSettingBody.appendChild(setDefaultValueRowString.root);

    setDefaultValueRowInt.root.style.display = this.currentVirvar.valueType === 0 ? 'flex' : 'none';
    setDefaultValueRowDouble.root.style.display = this.currentVirvar.valueType === 1 ? 'flex' : 'none';
    setDefaultValueRowString.root.style.display = this.currentVirvar.valueType === 2 ? 'flex' : 'none';

    const setDataPointsRow = this.createLabelRowRCTransferBoxCell('数据点位', {
        options: this.pointList.map(item => {
            return {'key': item.dwkey, 'title': `${item.name}`}
        }),
        disable: this.currentVirvar.sys,
        onChange: mxUtils.bind(this, function (options, evt) {
            if (this.currentVirvar && this.currentVirvar.sys === false) {
                if (this.editorUi && this.editorUi.mergeHasUsedPointJsonFromVirvars) {
                    this.editorUi.mergeHasUsedPointJsonFromVirvars([this.currentVirvar]);
                }
            }
            try {
                console.log('PointSetDialog onChange hasUsedPointJson 内容=', this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson);
                console.log('PointSetDialog onChange hasUsedPointJson 解析=', JSON.parse(this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson));
            } catch (e) {}
        }),
    }, mxUtils.bind(this, function () {
        return this.currentVirvar.points
    }), mxUtils.bind(this, function (options, evt) {
        // 设置当前虚拟变量的 点位key 和 key对应的标签
        this.currentVirvar.points = options ? options.map(item => item.key) : null;
        this.currentVirvar.pointsLabel = options ? options.map(item => item.title) : null;
        // 将图例和点位key存储到浏览器缓存里
        localStorage.setItem('echartsSeriesKey' + this.currentVirvar.id, this.currentVirvar.points);
        localStorage.setItem('echartsLegend' + this.currentVirvar.id, this.currentVirvar.pointsLabel);
    }));
    this.rightSettingBody.appendChild(setDataPointsRow.root);

    const setCustomFuncRow = this.createLabelRowRCCodeEditorCell('自定义算法', {
        disable: this.currentVirvar.sys,
    }, mxUtils.bind(this, function () {
        return this.currentVirvar.customFunc
    }), mxUtils.bind(this, function (value, evt) {
        this.currentVirvar.customFunc = value;
    }));
    this.rightSettingBody.appendChild(setCustomFuncRow.root);

};

VirtualVariablePanel.prototype.addPoint = function () {
    const newItem = {
        id: mxUtils.uuid(),
        name: `虚拟变量${this.virvarList.length}`,
        templeteId: this.editorUi.GLOBAL_CONFIG.templeteId,
        valueType: 2,
        defaultValue: '',
        points: [],
        sys: false,
        customFunc: `
const params = arguments[0];
const defaultValue = arguments[1];
const virvalId = arguments[2];

console.log("params",params);
// 折线图示例代码
let eacher = [];
for (let i = 0; i < params.length; i++) {
    console.log(params[i]); // 输出每个元素
    const cachedData = localStorage.getItem(virvalId + '_data_' + i);
    let array;
    if (cachedData) {
        array = JSON.parse(cachedData);
    } else {
        array = [];
    }
    // 将新的参数数据添加到数组中
    array = array.concat(params[i]);  // 使用concat合并新数据
    while (array.length > 10) {
        array.shift();
    }
    localStorage.setItem(virvalId + '_data_' + i, JSON.stringify(array));
    
    const dataOne = localStorage.getItem(virvalId + '_data_' + i);
    let servece = {
        data: JSON.parse(dataOne),
            type: 'line'
    }
    eacher.push(servece);
    
}


const dataTime = localStorage.getItem('time');
try{
    var option =  {
        animation: false,
        xAxis: {
            type: 'category',
            data: JSON.parse(dataTime)
        },
        yAxis: {
            type: 'value'
        },
        series: eacher,
        sn: 'nz001'
    };
    return encodeURIComponent(JSON.stringify(option))
} catch (e) {
    return defaultValue;
}`,
    }
    this.virvarList.push(newItem);
    this.currentVirvar = newItem;
    // 新增的变量默认选中
    this.selectedIds.add(newItem.id);

    // 更新过滤列表并滚动到底部
    this.updateFilteredList();
    this.renderVirtualList();

    // 滚动到底部显示新添加的项
    setTimeout(() => {
        if (this.variableTable) {
            this.variableTable.scrollTop = this.variableTable.scrollHeight;
            this.handleVirtualScroll();
        }
    }, 100);

    this.loadVirvarSettingPanel();
};

VirtualVariablePanel.prototype.deletePoint = function (rowId) {
    this.editorUi.layerConfirm({
        title: '提示',
        content: '确定要删除吗,删除会导致已绑定改变量的数据异常？',
        buttons: [
            {
                text: '取消', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(true, false);
                })
            },
            {
                text: '确定', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(false, false);
                    this.virvarList = this.virvarList.filter(item => item.id != rowId);
                    // 删除时同时移除选中状态
                    this.selectedIds.delete(rowId);
                    if (this.currentVirvar && this.currentVirvar.id == rowId) {
                        if (this.virvarList.length > 0) {
                            this.currentVirvar = this.virvarList[0];
                        } else {
                            this.currentVirvar = null;
                        }
                        this.loadVirvarSettingPanel()
                    }
                    // 更新过滤列表并重新渲染
                    this.updateFilteredList();
                    this.renderVirtualList();
                    try {
                        let hasUsedJson = this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson;
                        if (hasUsedJson && hasUsedJson.length > 0) {
                            let arr = JSON.parse(hasUsedJson);
                            arr = Array.isArray(arr) ? arr.filter(it => !(it && it.id === rowId)) : [];
                            this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson = JSON.stringify(arr);
                            console.log('deletePoint 已移除 hasUsedPointJson 对应条目，当前内容=', this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson);
                            console.log('deletePoint 已移除 hasUsedPointJson 解析=', JSON.parse(this.editorUi.GLOBAL_CONFIG.device.hasUsedPointJson));
                        }
                    } catch (e) {}
                })
            }
        ]
    });
};

VirtualVariablePanel.prototype.scrollToBottom = function () {
    var tableBody = document.getElementById('tableBody');
    // 确保DOM更新后再进行滚动
    requestAnimationFrame(() => {
        tableBody.scrollTop = tableBody.scrollHeight;
    });
}

// 初始化虚拟滚动
VirtualVariablePanel.prototype.initVirtualScroll = function () {
    if (!this.variableTable) return;

    // 绑定滚动事件
    mxEvent.addListener(this.variableTable, 'scroll', mxUtils.bind(this, function (evt) {
        this.handleVirtualScroll();
    }));

    // 初始化渲染
    this.updateFilteredList();
    this.renderVirtualList();
};

// 更新过滤后的列表（用于搜索）
VirtualVariablePanel.prototype.updateFilteredList = function () {
    let list = this.virvarList;

    // 如果有搜索条件，进行过滤
    if (this.inputValue || (this.selectValue && this.selectValue.key !== -1 && this.selectValue.key != null)) {
        list = this.virvarList.filter(item => {
            const name = item.name || '';
            let matchInput = true;
            let matchSelect = true;

            // 输入框匹配
            if (this.inputValue && this.inputValue.trim()) {
                matchInput = name.toUpperCase().includes(this.inputValue.toUpperCase());
            }

            // 下拉框匹配
            if (this.selectValue && this.selectValue.key !== -1 && this.selectValue.key != null && this.selectValue.title) {
                matchSelect = name.includes(this.selectValue.title);
            }

            return matchInput && matchSelect;
        });
    }

    this.virtualScrollConfig.filteredList = list;
    return list;
};

// 处理虚拟滚动
VirtualVariablePanel.prototype.handleVirtualScroll = function () {
    if (!this.variableTable) return;

    const scrollTop = this.variableTable.scrollTop;
    this.virtualScrollConfig.scrollTop = scrollTop;

    // 计算可见区域
    const containerHeight = this.variableTable.clientHeight;
    const itemHeight = this.virtualScrollConfig.itemHeight;
    const bufferSize = this.virtualScrollConfig.bufferSize;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(
        this.virtualScrollConfig.filteredList.length,
        startIndex + visibleCount + bufferSize * 2
    );

    this.virtualScrollConfig.visibleStartIndex = startIndex;
    this.virtualScrollConfig.visibleEndIndex = endIndex;

    // 重新渲染可见区域
    this.renderVirtualList();
};

// 更新已选数量显示
VirtualVariablePanel.prototype.updateSelectedCount = function () {
    if (this.selectedCountSpan) {
        const count = this.selectedIds.size;
        this.selectedCountSpan.textContent = `已选: ${count}`;
    }

    // 更新全选复选框状态（优化大数据量处理）
    if (this.selectAllCheckbox) {
        const filteredList = this.virtualScrollConfig.filteredList;
        if (filteredList.length === 0) {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = false;
            return;
        }

        // 使用更高效的方式检查选中状态
        let selectedCount = 0;
        for (let i = 0; i < filteredList.length; i++) {
            if (this.selectedIds.has(filteredList[i].id)) {
                selectedCount++;
            }
        }

        const allSelected = selectedCount === filteredList.length && filteredList.length > 0;
        const someSelected = selectedCount > 0 && selectedCount < filteredList.length;

        this.selectAllCheckbox.checked = allSelected;
        this.selectAllCheckbox.indeterminate = someSelected;
    }
};

// 渲染虚拟列表
VirtualVariablePanel.prototype.renderVirtualList = function () {
    const filteredList = this.virtualScrollConfig.filteredList;

    if (filteredList.length <= 0) {
        this.pointListBody.innerHTML = `<tr><td colspan="6">
            <div class="rcui-empty-node" style="padding: 50px 0px;">
                <img src="${mxUtils.staticImg('/rcscada/icon_empty.svg')}">
                <div class="rcui-empty-node-text">未添加变量</div>
            </div></td></tr>`;
        this.updateSelectedCount();
        return;
    }

    const startIndex = this.virtualScrollConfig.visibleStartIndex;
    const endIndex = this.virtualScrollConfig.visibleEndIndex;
    const itemHeight = this.virtualScrollConfig.itemHeight;

    // 渲染可见区域的行
    let visibleRowsHtml = '';
    for (let i = startIndex; i < endIndex; i++) {
        const item = filteredList[i];
        const actualIndex = i; // 在过滤列表中的索引
        const originalIndex = this.virvarList.findIndex(v => v.id === item.id); // 在原列表中的索引
        const isChecked = this.selectedIds.has(item.id);

        visibleRowsHtml += `<tr class="rcui-line" data-index="${i}" style="height: ${itemHeight}px; ${this.currentVirvar && this.currentVirvar.id == item.id ? `background:#dbf3d060` : ''}">
<td style="text-align: center;">
    <input type="checkbox" class="row-checkbox" data-rowid="${item.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer;" />
</td>
<td style="text-align: center;">${originalIndex + 1}</td>
<td style="text-align: center;">${item.name}</td>
<td style="text-align: center;">${['整型', '浮点型', '字符串'][item.valueType]}</td>
<td style="text-align: center;">${item.defaultValue}</td>
<td style="text-align: center;">
    ${!item.sys ? `<div class="rcui-btn rcui-bg-red rcui-btn-sm deletePoint" data-rowid="${item.id}" style="height: 24px;line-height: 24px;padding: 0px 8px;font-size:9px;" data-rowid="${item.id}">删除</div>` : ''}
    <div class="rcui-btn ${item.sys ? 'rcui-bg-blue' : 'rcui-bg-orange'} rcui-btn-sm setPoint" data-rowid="${item.id}" style="height: 24px;line-height: 24px;padding: 0px 8px;font-size:9px;" data-rowid="${item.id}">${item.sys ? '查看' : '设置'}</div>
</td>
</tr>`;
    }

    // 添加上方占位符
    const topPlaceholder = startIndex > 0 ? `<tr style="height: ${startIndex * itemHeight}px;"><td colspan="6"></td></tr>` : '';

    // 添加下方占位符
    const bottomHeight = (filteredList.length - endIndex) * itemHeight;
    const bottomPlaceholder = bottomHeight > 0 ? `<tr style="height: ${bottomHeight}px;"><td colspan="6"></td></tr>` : '';

    this.pointListBody.innerHTML = topPlaceholder + visibleRowsHtml + bottomPlaceholder;

    // 绑定事件
    this.bindRowEvents();

    // 更新已选数量
    this.updateSelectedCount();
};

// 绑定行事件
VirtualVariablePanel.prototype.bindRowEvents = function () {
    let deleteBtns = this.container.querySelectorAll('div.deletePoint');
    let setPointBtns = this.container.querySelectorAll('div.setPoint');
    let rowCheckboxes = this.container.querySelectorAll('input.row-checkbox');

    // 绑定复选框事件
    if (rowCheckboxes && rowCheckboxes.length > 0) {
        for (let i = 0; i < rowCheckboxes.length; i++) {
            mxEvent.addListener(rowCheckboxes[i], 'change', mxUtils.bind(this, function (evt) {
                const rowId = evt.target.getAttribute('data-rowid');
                const checked = evt.target.checked;

                if (checked) {
                    this.selectedIds.add(rowId);
                } else {
                    this.selectedIds.delete(rowId);
                }

                this.updateSelectedCount();
            }));
        }
    }

    if (deleteBtns && deleteBtns.length > 0) {
        for (let i = 0; i < deleteBtns.length; i++) {
            mxEvent.addListener(deleteBtns[i], 'click', mxUtils.bind(this, function (evt) {
                let rowId = evt.target.getAttribute('data-rowid');
                this.deletePoint(rowId);
            }));
        }
    }

    if (setPointBtns && setPointBtns.length > 0) {
        for (let i = 0; i < setPointBtns.length; i++) {
            mxEvent.addListener(setPointBtns[i], 'click', mxUtils.bind(this, function (evt) {
                let rowId = evt.target.getAttribute('data-rowid');
                if (this.currentVirvar != null && this.currentVirvar.id === rowId) return;
                this.currentVirvar = this.virvarList.find(item => item.id === rowId);
                this.renderVirtualList();
                this.loadVirvarSettingPanel();
            }));
        }
    }
};

VirtualVariablePanel.prototype.loadVirvarListHtml = function () {
    // 更新过滤列表
    this.updateFilteredList();

    // 重置滚动位置
    if (this.variableTable) {
        this.virtualScrollConfig.scrollTop = 0;
        this.variableTable.scrollTop = 0;
    }

    // 重新计算可见区域
    this.handleVirtualScroll();
    // 搜索输入事件
    mxEvent.addListener(this.leftSearchInput, 'input', mxUtils.bind(this, function (evt) {
        let str = evt.target.value;
        this.inputValue = str;
    }));

    // 查询按钮事件
    mxEvent.addListener(this.container.querySelector('div.queryBtn'), 'click', mxUtils.bind(this, function (evt) {
        mxUtils.alert("正在查询，请稍等~");
        console.log("查询条件：", this.selectValue, this.inputValue);

        // 重置滚动位置
        if (this.variableTable) {
            this.virtualScrollConfig.scrollTop = 0;
            this.variableTable.scrollTop = 0;
        }

        // 更新过滤列表并重新渲染
        this.updateFilteredList();
        this.handleVirtualScroll();
        console.log('过滤完成，显示 ' + this.virtualScrollConfig.filteredList.length + ' 条记录');
    }));
    mxEvent.addListener(this.cleanIcon, 'click', mxUtils.bind(this, function (evt) {
        this.leftSearchInput.value = '';
        this.inputValue = '';
        // 重置滚动位置并重新渲染
        if (this.variableTable) {
            this.virtualScrollConfig.scrollTop = 0;
            this.variableTable.scrollTop = 0;
        }
        this.updateFilteredList();
        this.handleVirtualScroll();
    }));
    // mxEvent.addListener(this.container.querySelector('div.resetBtn'), 'click', mxUtils.bind(this, function (evt) {
    //     this.selectValue = -1
    //     this.leftSearchInput.value = '';
    //     this.inputValue = '';
    //     for (let i = 0; i < this.itemList.length; i++) {
    //         mxUtils.removeStyleClass(this.itemList[i], 'rcui-hide');
    //     }
    // }));

};


function HttpjsonPanel(editorUi, config) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.container.style.cssText = `width: 100%; height: ${this.config.height}px;display:flex;flex-direction: column;`;
    this.pointList = this.editorUi.GLOBAL_CONFIG.templete && this.editorUi.GLOBAL_CONFIG.templete.rcVariableList ? this.editorUi.GLOBAL_CONFIG.templete.rcVariableList : [];
    this.pointMap = this.pointList.reduce((obj, item) => {
        obj[item.dwkey] = item.name;
        return obj;
    }, {});
    const httpjson = this.editorUi.GLOBAL_CONFIG.device.httpjson;
    this.httpList = httpjson && httpjson.length > 0 ? JSON.parse(decodeURIComponent(httpjson)) : [];
    this.httpListFirstJson = encodeURIComponent(JSON.stringify(this.httpList));
    this.currentHttp = null;
    this.init();
}

mxUtils.extend(HttpjsonPanel, BaseDialog);
HttpjsonPanel.prototype.init = function () {
    let contentHeight = this.config.height - 50;
    this.container.innerHTML = `<div style="width:100%;height: ${contentHeight}px;display:flex;flex-direction: row;">
    <div class="httpListPanel" style="height:${contentHeight}px;overflow: scroll;flex:2;background:white;margin-right:10px;">
        <div style="overflow-y: scroll;height: 100%;width:100%;">
            <div style="padding:0px 10px;boxsizing:border-box;">
                <table class="rcui-table">
                    <thead>
                        <tr>
                            <th colspan="5">Http数据接口列表</th>
                            <th style="text-align: center;">
                                <div class="rcui-btn rcui-bg-blue rcui-btn-sm addHttp" style="width: calc(100% - 20px);display:block">新增</div>
                            </th>
                        </tr>
                        <tr>
                            <th style="width: 50px;text-align: center;">序号</th>
                            <th style="width: 100px;text-align: center;">接口名称</th>
                            <th style="text-align: center;">接口地址</th>
                            <th style="width: 80px;text-align: center;">请求类型</th>
                            <th style="width: 100px;text-align: center;">映射点位</th>
                            <th style="width: 200px;text-align: center;">操作</th>
                        </tr>
                    </thead>
                    <tbody class="httpListBody">
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="httpFormPanel" style="height:${contentHeight}px;flex:1;background:white;">
        <div style="overflow-y: scroll;height: 100%;width:100%;">
            <div class="rightSettingBody" style="padding:0px 10px;boxsizing:border-box;display:flex;flex-direction:column;">

            </div>
        </div>
    </div>
</div>
<div class="rcui-panel-dialog-footer" style="width:100%;height:50px;">
    <div class="rcui-btn rcui-btn-primary rcui-border closeBtn" style="margin-right: 20px;width: 80px;">关闭</div>
    <div class="rcui-btn saveBtn" style="margin-right: 30px;width: 80px;">保存</div>
</div>`;

    this.httpListBody = this.container.querySelector('tbody.httpListBody');
    this.rightSettingBody = this.container.querySelector('div.rightSettingBody');

    mxEvent.addListener(this.container.querySelector('div.addHttp'), 'click', mxUtils.bind(this, function (evt) {
        this.addHttp();
    }));
    mxEvent.addListener(this.container.querySelector('div.closeBtn'), 'click', mxUtils.bind(this, function (evt) {
        this.checkCloseDialog();
    }));
    mxEvent.addListener(this.container.querySelector('div.saveBtn'), 'click', mxUtils.bind(this, function (evt) {
        this.saveForm();
    }));
    if (this.httpList.length > 0) {
        this.currentHttp = this.httpList[0];
    }
    this.loadHttpListPanel();
    this.loadHttpSettingPanel();
}

HttpjsonPanel.prototype.saveForm = function () {
    console.log('saveForm', this.httpList);
    const httpJson = encodeURIComponent(JSON.stringify(this.httpList));
    if (this.httpListFirstJson != null && this.httpListFirstJson == httpJson) {
        mxUtils.alert('已保存');
        return;
    }
    for (let i = 0; i < this.httpList.length; i++) {
        let err = this.checkSettingForm(this.httpList[i]);
        if (err != null) {
            mxUtils.alert(`第变量${i + 1}个变量存在错误，${err}`);
            return;
        }
    }
    this.editorUi.saveHttpJson(httpJson, mxUtils.bind(this, function (res) {
        this.httpListFirstJson = httpJson;
        setTimeout(() => {
            mxUtils.alert('已保存');
            this.loadHttpListPanel();
        }, 1);
    }), mxUtils.bind(this, function (e) {
        setTimeout(() => {
            mxUtils.alert(e);
        }, 1);
    }));
};
HttpjsonPanel.prototype.checkSettingForm = function (httpObj) {
    if (!httpObj.name || httpObj.name.trim().length <= 0) {
        return '未设置接口名称';
    }
    if (!httpObj.url || httpObj.url.trim().length <= 0) {
        return '未设置接口地址';
    }
    if (!httpObj.type) {
        return '未设置请求类型';
    }
    if (httpObj.runModel == null || httpObj.runModel == undefined) {
        return '未设置请求模式';
    }
    if (httpObj.runModel == -1 && !httpObj.cycle)
        if (!httpObj.point) {
            return '未设置轮询周期';
        }
    if (!httpObj.customFunc || httpObj.customFunc.trim().length <= 0) {
        return '未设置返回值转换方法体';
    }
    let customFunc = new Function(decodeURIComponent(httpObj.customFunc));
    try {
        let res = customFunc({});
        console.log('customFunc', customFunc, res)
        if (res === undefined) {
            return '算法未设置返回值';
        }
        return null;
    } catch (e) {
        console.log(e);
        return '算法出错了'
    }
};

HttpjsonPanel.prototype.checkCloseDialog = function () {
    this.editorUi.layerConfirm({
        width: 300,
        height: 200,
        title: '提示',
        content: '如果存在已修改数据且未保存会导致修改不生效，确认关闭吗？',
        buttons: [
            {
                text: '继续设置', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(true, false);
                })
            }, {
                text: '确定关闭', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(true, false);
                    setTimeout(() => {
                        this.editorUi.hideDialog(false, false);
                    }, 1);
                })
            }
        ]
    });
    return false;
};

HttpjsonPanel.prototype.addHttp = function () {
    const newItem = {
        id: mxUtils.uuid(),
        name: `Http接口${this.httpList.length}`,
        host: '',
        url: '',
        type: 'GET',
        point: null,
        headers: '',
        params: '',
        runModel: -1,
        cycle: 5,
        customFunc: encodeURIComponent(`try{
    const response = arguments[0];
    if(response.status == 200 && response.data);
    const result = response.data
    if(result.code == 0 && result.data){
        return result.data;
    }
    return null;
}catch(e){
    console.log(e);
    return null;
}`),
    }
    this.httpList.push(newItem);
    this.currentHttp = newItem;
    this.loadHttpListPanel();
    this.loadHttpSettingPanel();
};

HttpjsonPanel.prototype.deleteHttp = function (rowId) {
    this.editorUi.layerConfirm({
        title: '提示',
        content: '确定要删除吗？',
        buttons: [
            {
                text: '取消', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(true, false);
                })
            },
            {
                text: '确定', func: mxUtils.bind(this, function () {
                    this.editorUi.hideDialog(false, false);
                    this.httpList = this.httpList.filter(item => item.id != rowId);
                    if (this.currentHttp && this.currentHttp.id == rowId) {
                        if (this.httpList.length > 0) {
                            this.currentHttp = this.httpList[0];
                        } else {
                            this.currentHttp = null;
                        }
                        this.loadHttpSettingPanel()
                    }
                    this.loadHttpListPanel();
                })
            }
        ]
    });
};

HttpjsonPanel.prototype.loadHttpSettingPanel = function () {
    if (!this.currentHttp) {
        this.rightSettingBody.innerHTML = `<div class="rcui-empty-node" style="padding: 50px 0px;">
            <img src="${mxUtils.staticImg('/rcscada/icon_empty.svg')}">
            <div class="rcui-empty-node-text">未选择</div>
            <div class="rcui-empty-node-text" style="margin-top: 16px;">点击左边列表中设置按钮选择</div>
        </div>`;
        return;
    }
    this.rightSettingBody.innerHTML = ``;
    const setNameRow = this.createLabelCellRowInput('接口名称', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return this.currentHttp.name;
    }), mxUtils.bind(this, function (value, evt) {
        this.currentHttp.name = value;
    }));
    this.rightSettingBody.appendChild(setNameRow.root);

    const setHostRow = this.createLabelCellRowInput('接口域名', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return this.currentHttp.host;
    }), mxUtils.bind(this, function (value, evt) {
        this.currentHttp.host = value;
    }));
    this.rightSettingBody.appendChild(setHostRow.root);

    const setAddressRow = this.createLabelCellRowInput('接口地址', {
        type: 'text',
    }, mxUtils.bind(this, function () {
        return this.currentHttp.url;
    }), mxUtils.bind(this, function (value, evt) {
        this.currentHttp.url = value;
    }));
    this.rightSettingBody.appendChild(setAddressRow.root);

    const setTypeRow = this.createLabelCellRowSelect('请求类型', {
        options: [
            {key: 'GET', title: 'GET'},
            {key: 'POST', title: 'POST'},
        ],
    }, mxUtils.bind(this, function () {
        return this.currentHttp.type;
    }), mxUtils.bind(this, function (option, evt) {
        this.currentHttp.type = option.key;
    }));
    this.rightSettingBody.appendChild(setTypeRow.root);

    const setRunModelRow = this.createLabelCellRowSelect('执行模式', {
        options: [
            {key: -1, title: '轮询'},
            {key: 0, title: '不执行'},
            {key: 1, title: '执行1次'},
        ],
    }, mxUtils.bind(this, function () {
        return this.currentHttp.runModel;
    }), mxUtils.bind(this, function (option, evt) {
        this.currentHttp.runModel = option.key;
    }));
    this.rightSettingBody.appendChild(setRunModelRow.root);

    const setCycleRow = this.createLabelCellRowInput('轮询周期', {
        type: 'number',
        min: 1,
        max: 100,
        step: 1,
        hideStep: false,
        decimal: false,
        unit: '秒',
    }, mxUtils.bind(this, function () {
        if (!this.currentHttp.cycle) {
            return 1;
        }
        try {
            return parseInt(this.currentHttp.cycle);
        } catch (e) {
            return 1;
        }
    }), mxUtils.bind(this, function (value) {
        try {
            this.currentHttp.cycle = parseInt(value);
        } catch (e) {
            this.currentHttp.cycle = 1;
            setCycleRow.cell.outerChangeValue(1);
        }
    }));
    this.rightSettingBody.appendChild(setCycleRow.root);


    const setPointRow = this.createLabelCellRowSelect('映射点位', {
        options: this.pointList.map(item => {
            return {key: item.dwkey, title: item.name};
        }),
    }, mxUtils.bind(this, function () {
        return this.currentHttp.point;
    }), mxUtils.bind(this, function (option, evt) {
        this.currentHttp.point = option.key;
    }));
    this.rightSettingBody.appendChild(setPointRow.root);

    const setHeadersRow = this.createLabelCellRowInput('请求头', {
        type: 'text',
        placeholder: '格式如：${a1=真实值1};${a2={{动态参数属性}}};'
    }, mxUtils.bind(this, function () {
        return this.currentHttp.headers;
    }), mxUtils.bind(this, function (value, evt) {
        this.currentHttp.headers = value;
    }));
    this.rightSettingBody.appendChild(setHeadersRow.root);

    const setParamsRow = this.createLabelCellRowInput('请求参数', {
        type: 'text',
        placeholder: '格式如：${a1=真实值1};${a2={{动态参数属性}}};'
    }, mxUtils.bind(this, function () {
        return this.currentHttp.params;
    }), mxUtils.bind(this, function (value, evt) {
        this.currentHttp.params = value;
    }));
    this.rightSettingBody.appendChild(setParamsRow.root);

    let tipDiv = this.createDiv();
    tipDiv.innerHTML = `arguments是javascript中function的一个原生参数,是一个数组,[0]:response, [1]:httpConfig, [2]:editorUi`;
    this.rightSettingBody.appendChild(tipDiv);
    tipDiv.style.cssText = `color:red;font-size:12px;`;

    const setCustomFuncRow = this.createLabelRowRCCodeEditorCell('返回值转换', {}, mxUtils.bind(this, function () {
        console.log('this.currentHttp.customFunc');
        if (this.currentHttp.customFunc) {
            return decodeURIComponent(this.currentHttp.customFunc);
        }
        return '';
    }), mxUtils.bind(this, function (value, evt) {
        this.currentHttp.customFunc = encodeURIComponent(value);
    }));
    this.rightSettingBody.appendChild(setCustomFuncRow.root);
};
HttpjsonPanel.prototype.loadHttpListPanel = function () {
    this.httpListBody.innerHTML = this.httpList.length <= 0 ? `<tr><td colspan="6">
        <div class="rcui-empty-node" style="padding: 50px 0px;">
            <img src="${mxUtils.staticImg('/rcscada/icon_empty.svg')}">
            <div class="rcui-empty-node-text">暂无Http数据接口</div>
        </div></td></tr>
    ` : this.httpList.reduce((t, item, index) => {
        return t + `<tr style="${this.currentHttp && this.currentHttp.id == item.id ? `background:#dbf3d060` : ''}">
<td style="text-align: center;">${index + 1}</td>
<td style="text-align: center;">${item.name}</td>
<td style="text-align: center;">${item.url}</td>
<td style="text-align: center;">${item.type}</td>
<td style="text-align: center;">${this.pointMap[item.point] ? this.pointMap[item.point] : ''}</td>
<td style="text-align: center;">
    <div class="rcui-btn rcui-bg-red rcui-btn-sm deleteHttp" style="height: 24px;line-height: 24px;padding: 0px 8px;font-size:9px;" data-rowid="${item.id}">删除</div>
    <div class="rcui-btn rcui-bg-orange rcui-btn-sm setHttp" style="height: 24px;line-height: 24px;padding: 0px 8px;font-size:9px;" data-rowid="${item.id}">设置</div>
</td>
</tr>`;
    }, '');

    let deleteHttpBtns = this.container.querySelectorAll('div.deleteHttp');
    let setHttpBtns = this.container.querySelectorAll('div.setHttp');
    if (deleteHttpBtns && deleteHttpBtns.length > 0) {
        for (let i = 0; i < deleteHttpBtns.length; i++) {
            mxEvent.addListener(deleteHttpBtns[i], 'click', mxUtils.bind(this, function (evt) {
                let rowId = evt.target.getAttribute('data-rowid');
                this.deleteHttp(rowId);
            }));
        }
    }
    if (setHttpBtns && setHttpBtns.length > 0) {
        for (let i = 0; i < setHttpBtns.length; i++) {
            mxEvent.addListener(setHttpBtns[i], 'click', mxUtils.bind(this, function (evt) {
                let rowId = evt.target.getAttribute('data-rowid');
                if (this.currentHttp != null && this.currentHttp.id === rowId) return;
                this.currentHttp = this.httpList.find(item => item.id === rowId);
                this.loadHttpSettingPanel();
                this.loadHttpListPanel();
            }));
        }
    }
};
