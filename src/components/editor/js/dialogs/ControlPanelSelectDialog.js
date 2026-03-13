/* eslint-disable */
import { mxUtils, mxEvent, mxResources } from "../../core/mxgraph";
import BaseDialog from "./BaseDialog";
import api from "../utils/api.js";

/**
 * 控制面板选择弹窗 (Control Panel Selection Dialog)
 * 支持本地和后端存储面板的搜索与选择
 */
function ControlPanelSelectDialog(editorUi, config = {}) {
    BaseDialog.call(this, editorUi);
    this.config = config;
    this.allPanels = { local: [], remote: [] };
    this.displayList = [];
    this.currentTab = 'remote';
    this.searchTerm = '';
    this.init();
    this.loadData();
}

mxUtils.extend(ControlPanelSelectDialog, BaseDialog);

ControlPanelSelectDialog.prototype.init = function () {
    const contentHeight = (this.config.height || 680) - 100;
    const div = this.createTag('div');
    div.style.cssText = `width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; font-family: "Microsoft YaHei", sans-serif;`;

    div.innerHTML = `
        <div class="rcui-layer-title" style="background: #1890ff; color: #fff; padding: 0 20px; height: 50px; line-height: 50px; cursor: move; flex-shrink: 0;">
            ${mxResources.get('select') || '选择'}控制面板
        </div>
        <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; background: #f0f2f5; overflow: hidden;">
            <!-- Tab Switcher -->
            <div style="display: flex; margin-bottom: 15px; background: #fff; border-radius: 4px; padding: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-shrink: 0;">
                <div class="tab-item" data-tab="local" style="flex: 1; text-align: center; padding: 8px; cursor: pointer; border-radius: 4px; transition: all 0.3s; font-weight: bold;">本地存储 [本]</div>
                <div class="tab-item active" data-tab="remote" style="flex: 1; text-align: center; padding: 8px; cursor: pointer; border-radius: 4px; transition: all 0.3s;">后端存储 [后]</div>
            </div>
            
            <!-- Search Bar -->
            <div style="display: flex; margin-bottom: 15px; flex-shrink: 0;">
                <div class="rcui-transfer-search" style="flex: 1; margin-right: 10px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; display: flex; align-items: center; padding: 0 10px;">
                    <i class="rcui-icon rcui-icon-search" style="color: #bfbfbf;"></i>
                    <input type="text" class="search-input" placeholder="输入名称搜索..." style="border: none; outline: none; padding: 8px; flex: 1; font-size: 14px;">
                </div>
                <div class="rcui-btn rcui-btn-blue refresh-btn" style="width: 80px; height: 34px; line-height: 34px; text-align: center; border-radius: 4px;">刷新</div>
            </div>

            <!-- List Container -->
            <div class="list-container" style="flex: 1; background: #fff; border-radius: 4px; overflow-y: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div class="loading-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px;">
                    <div class="spinner" style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #1890ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <div style="margin-top: 10px; color: #999;">正在加载数据...</div>
                </div>
                <div class="panels-list" style="display: none;"></div>
                <div class="empty-state" style="display: none; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; color: #999;">
                    <img src="${mxUtils.staticImg('/rcscada/icon_empty.svg')}" style="width: 64px; margin-bottom: 15px; opacity: 0.5;">
                    <div>未找到任何相关面板</div>
                </div>
            </div>
        </div>
        <div class="rcui-layer-setwin" style="position: absolute; top: 15px; right: 15px;">
            <span class="rcui-icon rcui-icon-close rcui-layer-close" style="color: #fff; cursor: pointer; font-size: 18px;"></span>
        </div>

        <style>
            .tab-item.active { background: #1890ff !important; color: #fff !important; }
            .tab-item:not(.active):hover { background: #e6f7ff; color: #1890ff; }
            .panel-row { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: all 0.2s; }
            .panel-row:hover { background: #fafafa; border-left: 3px solid #1890ff; padding-left: 13px; }
            .panel-row:last-child { border-bottom: none; }
            .panel-name { flex: 1; font-size: 14px; color: #333; }
            .panel-meta { font-size: 12px; color: #999; margin-left: 10px; }
            .select-tag { padding: 2px 8px; border-radius: 2px; font-size: 12px; border: 1px solid #d9d9d9; opacity: 0; transition: opacity 0.2s; }
            .panel-row:hover .select-tag { opacity: 1; border-color: #1890ff; color: #1890ff; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;

    this.container.appendChild(div);

    // Bind Events
    this.searchInput = div.querySelector('.search-input');
    this.listPanel = div.querySelector('.panels-list');
    this.loadingPanel = div.querySelector('.loading-state');
    this.emptyPanel = div.querySelector('.empty-state');

    // Tab switching
    div.querySelectorAll('.tab-item').forEach(item => {
        mxEvent.addListener(item, 'click', mxUtils.bind(this, function () {
            div.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            this.currentTab = item.getAttribute('data-tab');
            this.updateDisplayList();
        }));
    });

    // Search
    mxEvent.addListener(this.searchInput, 'input', mxUtils.bind(this, function () {
        this.searchTerm = this.searchInput.value.toLowerCase().trim();
        this.updateDisplayList();
    }));

    // Refresh
    mxEvent.addListener(div.querySelector('.refresh-btn'), 'click', mxUtils.bind(this, function () {
        this.loadData();
    }));

    // Close
    mxEvent.addListener(div.querySelector('.rcui-layer-close'), 'click', mxUtils.bind(this, function () {
        this.editorUi.hideDialog();
    }));

    // List selection (event delegation)
    mxEvent.addListener(this.listPanel, 'click', mxUtils.bind(this, function (evt) {
        const row = evt.target.closest('.panel-row');
        if (row) {
            const id = row.getAttribute('data-id');
            const panel = this.displayList.find(p => p.id === id);
            if (panel) {
                this.editorUi.hideDialog();
                if (this.config.sureFn) {
                    this.config.sureFn(panel);
                }
            }
        }
    }));
};

ControlPanelSelectDialog.prototype.loadData = function () {
    this.loadingPanel.style.display = 'flex';
    this.listPanel.style.display = 'none';
    this.emptyPanel.style.display = 'none';

    const getQueryParam = function (name) {
        const reg = new RegExp('(^|&|\\?)' + name + '=([^&]*)(&|$)');
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        const hash = window.location.hash;
        const qIndex = hash.indexOf('?');
        if (qIndex > -1) {
            r = hash.substring(qIndex + 1).match(reg);
            if (r != null) return unescape(r[2]);
        }
        if (typeof URLSearchParams !== 'undefined') {
            const sp = new URLSearchParams(window.location.search);
            if (sp.has(name)) return sp.get(name);
        }
        return null;
    };

    let scadaId = getQueryParam('scadaId') || getQueryParam('id') || getQueryParam('deviceId');
    // Fallback to GLOBAL_CONFIG
    if (!scadaId && this.editorUi && this.editorUi.GLOBAL_CONFIG && this.editorUi.GLOBAL_CONFIG.device) {
        scadaId = this.editorUi.GLOBAL_CONFIG.device.id || this.editorUi.GLOBAL_CONFIG.device.deviceId;
    }

    const loadLocal = api.getControlPanelList().then(res => {
        return res.data.code === 200 ? res.data.data.map(p => ({ ...p, source: 'local' })) : [];
    });

    const loadRemote = scadaId ? api.getControlPanelListRemote({ pageNo: 1, pageSize: 1000, scadaId: scadaId }).then(res => {
        let list = [];
        if (res && (res.code === 200 || res.success)) {
            if (res.result && Array.isArray(res.result.records)) {
                list = res.result.records;
            } else if (res.result && Array.isArray(res.result)) {
                list = res.result;
            } else if (Array.isArray(res)) {
                list = res;
            }
        }
        return list.map(p => ({ ...p, source: 'remote', id: String(p.id) }));
    }).catch(err => {
        console.error('Remote Load Error:', err);
        return [];
    }) : Promise.resolve([]);

    Promise.all([loadLocal, loadRemote]).then(results => {
        this.allPanels.local = results[0];
        this.allPanels.remote = results[1];
        this.loadingPanel.style.display = 'none';
        this.updateDisplayList();
    });
};

ControlPanelSelectDialog.prototype.updateDisplayList = function () {
    const list = this.allPanels[this.currentTab] || [];
    this.displayList = list.filter(p => p.name.toLowerCase().includes(this.searchTerm));

    if (this.displayList.length === 0) {
        this.listPanel.style.display = 'none';
        this.emptyPanel.style.display = 'flex';
    } else {
        this.emptyPanel.style.display = 'none';
        this.listPanel.innerHTML = '';
        this.displayList.forEach(panel => {
            const row = document.createElement('div');
            row.className = 'panel-row';
            row.setAttribute('data-id', panel.id);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'panel-name';
            nameSpan.innerText = panel.name;

            const metaSpan = document.createElement('span');
            metaSpan.className = 'panel-meta';
            metaSpan.innerText = panel.source === 'remote' ? '后端' : '本地';

            const tag = document.createElement('span');
            tag.className = 'select-tag';
            tag.innerText = '选择';

            row.appendChild(nameSpan);
            row.appendChild(metaSpan);
            row.appendChild(tag);
            this.listPanel.appendChild(row);
        });
        this.listPanel.style.display = 'block';
    }
};

export default ControlPanelSelectDialog;
