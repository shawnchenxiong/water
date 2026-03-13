/* eslint-disable*/

import {mxUtils} from "../../core/mxgraph";
import BaseDialog from "./BaseDialog";
import api from "../utils/api.js";

export default ChooseVirvarDialog;

function ChooseVirvarDialog(editorUi, config = {}) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.loadDevice();
    this.init();
}

mxUtils.extend(ChooseVirvarDialog, BaseDialog);

ChooseVirvarDialog.prototype.loadDevice = function () {
    // 下拉框 列表
    this.deviceNameList = [];
    // api接口
    api.getDeviceNameList().then(res => {
        if (res.code === 200) {
            this.deviceNameList = res.result;
            this.initDeviceDropDown();
        }
    });
}

ChooseVirvarDialog.prototype.initDeviceDropDown = function () {
    // 使用 DocumentFragment 减少 DOM 操作
    const fragment = document.createDocumentFragment();

    // 创建下拉框
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
    rootElement.style.cssText = 'width: 300px; margin-left: 20px;';

    // 将根元素添加到 DocumentFragment
    fragment.appendChild(rootElement);

    // 将 DocumentFragment 添加到设备下拉框容器
    this.deviceDropDown.appendChild(fragment);
}

ChooseVirvarDialog.prototype.init = function () {
    let div = this.createTag('div');
    div.style.cssText = `width: 100%; height:100%;`;
    let contentHeight = this.config.height - 50;
    div.innerHTML = `
    <div class="rcui-layer rcui-layer-dialog" style="display: flex;flex-direction: column;height:100%;">
        <div class="rcui-layer-title" >${this.config.title ? this.config.title : '提示'}</div>
        <div style="display: flex;flex-direction: column; height:${contentHeight}px" class="contentPanel">
            <div style="display: flex; flex-direction: row;">
                <div class="device-drop-down"></div>
                <div style="display: flex;flex-direction: row;">
                    <div class="rcui-transfer-search" style="width: 100%; border-bottom-width: 0;">
                        <i class="rcui-icon rcui-icon-search"></i>
                        <input type="text" value="" class="rcui-input leftSearchInput" placeholder="关键词搜索">
                    </div>
                </div>
<!--                <span-->
<!--                  class="clear-icon"-->
<!--                  style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer;"-->
<!--                >-->
<!--                  ×-->
<!--                </span>-->
                <div class="rcui-btn rcui-btn-sm queryBtn" style="margin-right: 20px; margin-left: 1%; margin-top: 5px; width: 50px;">查询</div>
            </div>
            <div class="epmtyPanel rcui-empty-node rcui-hide" style="padding: 50px 0px;" >
                <img src="${mxUtils.staticImg('/rcscada/icon_empty.svg')}">
                <div class="rcui-empty-node-text">未设置变量</div>
            </div>
            <div style="width:100%;height:100%;overflow: scroll;flex:1;">
                <div class="virvarListPanel" style="display: flex;flex-direction: column;background:#F0f0f0;">
                </div>
            </div>
        </div>
        <div class="rcui-layer-setwin">
            <span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span>
        </div>
    </div>`;
    this.container.appendChild(div);
    this.deviceDropDown = div.querySelector('div.device-drop-down');
    const leftSearchInput = div.querySelector('input.leftSearchInput');
    // this.cleanIcon = div.querySelector('span.clear-icon');
    const emptyPanel = div.querySelector('div.rcui-empty-node');
    const virvarListPanel = div.querySelector('div.virvarListPanel');
    const json = this.editorUi.GLOBAL_CONFIG.device.virvarJson;
    this.virvarList = json && json.length > 0 ? JSON.parse(json) : [];

    // 设置两个查询条件的接参
    this.selectValue = '';
    this.inputValue = '';

    mxUtils.showOrHideElement(emptyPanel, this.virvarList.length <= 0);
    mxUtils.showOrHideElement(virvarListPanel, this.virvarList.length > 0);

    // 初始化渲染参数
    this.renderBatchSize = 50;
    this.currentRenderCount = 0;
    this.displayList = this.virvarList;

    // 初始加载
    this.loadVirvarListHtml(false);

    // 添加滚动监听实现懒加载
    mxEvent.addListener(virvarListPanel, 'scroll', mxUtils.bind(this, function (evt) {
        if (virvarListPanel.scrollTop + virvarListPanel.clientHeight >= virvarListPanel.scrollHeight - 20) {
            if (this.currentRenderCount < this.displayList.length) {
                this.loadVirvarListHtml(true); // true 表示追加模式
            }
        }
    }));

    // 事件委托：处理列表点击事件（选择按钮）
    mxEvent.addListener(virvarListPanel, 'click', mxUtils.bind(this, function (evt) {
        let target = mxEvent.getSource(evt);
        let selectBtn = target.closest('.selectBtn');
        if (selectBtn) {
            let row = selectBtn.closest('.rcui-line-row');
            if (row) {
                let id = row.getAttribute('data-id');
                let virvar = this.virvarList.find(v => v.id === id);
                if (virvar) {
                    this.editorUi.hideDialog(true, false);
                    if (this.config.sureFn) {
                        this.config.sureFn(evt, this, virvar);
                    }
                }
            }
        }
    }));
    mxEvent.addListener(div.querySelector('span.rcui-layer-close'), 'click', mxUtils.bind(this, function (evt) {
        this.editorUi.hideDialog(true, false);
        if (this.config.cancelFn) {
            this.config.cancelFn(evt, this);
        }
    }));

    mxEvent.addListener(this.container.querySelector('div.queryBtn'), 'click', mxUtils.bind(this, function (evt) {
        mxUtils.alert("正在查询，请稍等~");
        // 使用内存过滤代替 DOM 操作
        this.displayList = this.virvarList.filter(item => {
            const title = item.name;
            if (this.selectValue.key === -1 || this.selectValue.key == null || this.selectValue === '') {
                if (this.inputValue == null || this.inputValue === '') return true;
                return title.toUpperCase().includes(this.inputValue.toUpperCase());
            } else {
                if (this.inputValue == null || this.inputValue === '') {
                    return title.includes(this.selectValue.title);
                } else {
                    return title.toUpperCase().includes(this.inputValue.toUpperCase()) && title.includes(this.selectValue.title);
                }
            }
        });

        // 重新渲染列表
        this.loadVirvarListHtml(false);
        console.log('过滤完成，共找到 ' + this.displayList.length + ' 条数据');
    }));

    // mxEvent.addListener(this.cleanIcon, 'click', mxUtils.bind(this, function (evt) {
    //     leftSearchInput.value = '';
    //     this.inputValue = '';
    // }));

    mxEvent.addListener(leftSearchInput, 'input', mxUtils.bind(this, function (evt) {
        this.inputValue = evt.target.value;
    }));
}

ChooseVirvarDialog.prototype.loadVirvarListHtml = function (isAppend) {
    const virvarListPanel = this.container.querySelector('div.virvarListPanel');
    if (!virvarListPanel) return;

    if (!isAppend) {
        virvarListPanel.innerHTML = '';
        this.currentRenderCount = 0;
    }

    // 如果没有数据
    const emptyPanel = this.container.querySelector('div.rcui-empty-node');
    mxUtils.showOrHideElement(emptyPanel, this.displayList.length <= 0);
    mxUtils.showOrHideElement(virvarListPanel, this.displayList.length > 0);

    const start = this.currentRenderCount;
    // 每次渲染 renderBatchSize 条
    const end = Math.min(start + this.renderBatchSize, this.displayList.length);

    if (start >= end) return;

    const fragment = document.createDocumentFragment();

    for (let i = start; i < end; i++) {
        const virvar = this.displayList[i];
        let itemRoot = this.createLabelCellRowRightButton(virvar.name, {
            btns: [
                {
                    label: '选择',
                    typeClass: 'rcui-bg-blue selectBtn', // 添加 selectBtn 类以便事件委托识别
                    clickFn: null // 不再绑定单独事件
                },
            ],
        }).root;
        itemRoot.style.cssText = 'padding: 0px 16px;box-sizing: border-box;margin-bottom:1px;background:#FFF;';
        itemRoot.setAttribute('data-id', virvar.id); // 绑定ID
        // 确保有 rcui-line-row 类
        if (!itemRoot.classList.contains('rcui-line-row')) {
            itemRoot.classList.add('rcui-line-row');
        }
        if (itemRoot && itemRoot.children && itemRoot.children[0]) {
            itemRoot.children[0].style.width = '400px';
        }
        fragment.appendChild(itemRoot);
    }
    virvarListPanel.appendChild(fragment);
    this.currentRenderCount = end;
};
