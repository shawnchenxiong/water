/* eslint-disable */

import { EditorUi } from './js/EditorUi';
import { Editor } from './js/Editor';
import { Graph } from './js/Graph';
import api from './js/utils/api';
import { DiagramPage } from './js/customer/TabPages';
import localforage from './js/utils/localforage';
import CustomMqtt from './js/utils/CustomMqtt';
import CustomWebSocket from './js/utils/CustomWebSocket';
import CustomHttpHeartbeat from './js/utils/CustomHttpHeartbeat';
import HttpData from './js/utils/HttpData';
import echarts from './js/expands/echarts-common.js';
import { mxClient, mxEvent, mxEventObject, mxResources, mxUtils, mxPoint } from './core/mxgraph';

import { mxBasePath } from './constant';
import request from "@/components/editor/js/utils/request.js";
import $ from "jquery";
import ErchenchiControlDialog from './js/dialogs/ErchenchiControlDialog';
import CustomControlDialog from './js/dialogs/CustomControlDialog';
import ControlPanelDisplayDialog from './js/dialogs/ControlPanelDisplayDialog';
import { StaticPointPropMap } from './js/panels/datas/StaticPropMap';
//getStencil
export default App;

function App(editor, container, config, lightbox) {
    EditorUi.call(this, editor, container, config, lightbox);
    this.deviceStore = localforage.createInstance({
        name: `${config.deviceId}_${config.chromeless ? 'preview' : 'editor'}`
    });
    this.deviceMap = {}; // 用于存储 {snSerial: name} 的映射
}

mxUtils.extend(App, EditorUi);

App.ERROR_TIMEOUT = 'timeout';
App.ERROR_BUSY = 'busy';
App.ERROR_UNKNOWN = 'unknown';
App.MODE_DEVICE = 'device';
App.MODE_BROWSER = 'browser';

App.startTime = new Date();

App.main = function (root, options, callback) {
    mxResources.loadDefaultBundle = false;

    function doLoad(bundle) {
        mxUtils.getAll(
            [bundle, mxBasePath + '/rcscada/default.xml'],
            function (xhr) {
                //将捆绑文本添加到资源中
                mxResources.parse(xhr[0].getText());

                // 手动为控制面板功能添加缺失的资源项
                mxResources.add('saveAsControlPanel', '保存为控制面板');

                // //配置默认图表主题
                let themes = {};
                themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();
                const ui = new App(new Editor(options.chromeless, themes), root, options, false);
                null != callback && callback(ui);
            },
            function (xhr) {
                root.innerHTML = '加载失败. <a href="javascript:void(0);">请重试.</a>';
                root.getElementsByTagName('a')[0].onclick = function () {
                    doLoad(mxResources.getDefaultBundle(mxBasePath + '/rcscada/grapheditor', 'zh') || mxResources.getSpecialBundle(mxBasePath + '/rcscada/grapheditor', 'zh'));
                };
            }
        );
    }

    doLoad(mxResources.getDefaultBundle(mxBasePath + '/rcscada/grapheditor', 'zh') || mxResources.getSpecialBundle(mxBasePath + '/rcscada/grapheditor', 'zh'));
};

App.prototype.init = function () {
    EditorUi.prototype.init.apply(this, arguments);

    // 二沉池 (Erchenchi): 监听样式变化以触发展示状态、指示灯和其他动态属性的即时刷新
    this.addListener('styleChanged', mxUtils.bind(this, function (sender, evt) {
        const cells = evt.getProperty('cells');
        const graph = this.editor.graph;
        if (cells && cells.length > 0) {
            cells.forEach(cell => {
                this.mappingCellDprop(graph, cell);
            });
        }
    }));

    // 获取并缓存设备列表，用于 ID 到名称的映射
    this.loadDeviceMap();
};

App.prototype.loadDeviceMap = function () {
    api.getDeviceList({ pageSize: 9999 }).then(res => {
        if (res.code === 200 && res.result && res.result.records) {
            res.result.records.forEach(device => {
                const sn = device.snSerial || device.sn || device.id;
                const name = device.name || device.title || 'Unknown';
                if (sn) this.deviceMap[sn] = name;
            });
        }
    }).catch(err => console.error('加载设备映射失败:', err));
};
App.prototype.destroy = function () {
    if (this.mqttClient) {
        this.mqttClient.close();
    }
    if (this.websocketClient) {
        this.websocketClient.close();
    }
    if (this.httpClient) {
        this.httpClient.close();
    }
    EditorUi.prototype.init.destroy(this, arguments);
};

/**
 * 显示临时提示消息（用于验证反向控制等功能）
 * @param {string} message - 提示内容
 * @param {string} type - 类型：'success' | 'error' | 'info'
 * @param {number} duration - 显示时长（毫秒），默认3000
 */
App.prototype.showTemporaryMessage = function (message, type, duration) {
    duration = duration || 3000;
    const container = this.editor.graph.container;
    if (!container) return;

    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'rc-temp-toast rc-temp-toast-' + type;
    toast.innerText = message;

    // 样式
    const bgColor = type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1890ff';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: #fff;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 99999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        animation: rcToastFadeIn 0.3s ease;
    `;

    // 添加动画样式（如果尚未添加）
    if (!document.getElementById('rc-toast-style')) {
        const style = document.createElement('style');
        style.id = 'rc-toast-style';
        style.textContent = `
            @keyframes rcToastFadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes rcToastFadeOut {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.style.animation = 'rcToastFadeOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
};

const moduleAliasMap = {
    'api': './js/utils/api.js',        // 内置 api 模块
    'request': './js/utils/request.js', // 内置 request 模块
    'mqtt': './js/utils/CustomMqtt', //内置mqtt 模块
    // 'lodash': 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js', // lodash CDN
    // 'moment': 'https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.min.js',  // moment CDN
    // 其他内置模块
};

App.prototype.loadTemplate = function () {
    const graph = this.editor.graph;
    if (this.editor.chromeless) {
        const loadPromise = this.previewLoad();
        this.initPointsData();
        this.checkDataCenter();
        this.openClickListener();
        const initFunc = async () => {
            this.fitView();
            this.ruochenResetPipStyle();
            // 预览加载页面成功之后  可以执行 对页面的css效果   所以执行js应当在这里执行  否则获取不到页面  syzzzz
            // document.getElementById("div_mxDynamicChart_bec0810d522f48e380fd5be97e2804ae_4").style.display = "none";
            // document.getElementById("div_mxDynamicChart_bec0810d522f48e380fd5be97e2804ae_4").style.display = "block";
            // let mqttOption = {
            //     mqttUrl: slaveJson.mqttUrl,
            //     mqttClientId: slaveJson.mqttClientId,
            //     mqttUsername: slaveJson.mqttUsername,
            //     mqttPassword: slaveJson.mqttPassword,
            // };
            // let client = new CustomMqtt(mqttOption);
            // client.connect()
            // client.publish()

            api.getRcScript({ id: this.GLOBAL_CONFIG.deviceId }).then(async res => {
                console.log('res.result.commonScriptres.result.commonScript', res.result.commonScript)
                try {
                    // 第一步：解码
                    const decodedCommonScript = decodeURIComponent(res.result.commonScript);
                    console.log('mxDynamicChart -- getChartScript -- decodedCommonScript', decodedCommonScript)

                    // 第二步：解析
                    let parsedCommonScript = JSON.parse(decodedCommonScript);
                    // console.log('parsedCommonScript', parsedCommonScript);

                    // 第三步：加载模块
                    // 动态注册模块别名（可选）
                    function registerModuleAlias(alias, path) {
                        moduleAliasMap[alias] = path;
                    }

                    // 创建沙箱环境
                    const sandbox = {
                        chartInstance: this, // 当前图表实例
                        api: api,       // 提供的 API
                        request: request,
                        $: $, // 直接包含 $, 不通过模块加载器
                        modules: {},         // 存储加载的模块
                        require: async (modulePath) => {
                            // 检查是否是内置模块或别名
                            let actualPath = moduleAliasMap[modulePath] || modulePath;

                            // 如果已经缓存，直接返回缓存的模块
                            if (sandbox.modules[actualPath]) {
                                return sandbox.modules[actualPath];
                            }

                            // 动态加载模块
                            try {
                                const module = await import(actualPath);
                                sandbox.modules[actualPath] = module.default || module;
                                // console.log(`Successfully loaded module ${modulePath} from ${actualPath}`);
                                return module.default || module;
                            } catch (e) {
                                console.error(`Failed to load module ${modulePath} from ${actualPath}:`, e);
                                throw new Error(`Failed to load module ${modulePath}`);
                            }
                        },
                    };

                    // 第五步：执行脚本
                    if (parsedCommonScript && typeof parsedCommonScript.script === 'string') {
                        // console.log('script', parsedCommonScript.script);

                        // 使用立即执行函数表达式(IIFE)来创建一个作用域
                        await (async function () {
                            try {
                                // 将 script 包装在一个 async 函数中，以处理可能的异步操作
                                const scriptFunction = new Function('sandbox', `async function customScript() {
                                        try {
                                            ${parsedCommonScript.script}
                                        } catch (e) {
                                            console.error('Error in customScript:', e);
                                            throw e;
                                        }
                                    }
                                    return customScript();
                                `);
                                const result = await scriptFunction(sandbox); // 传递沙箱环境

                                console.log('resultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresult', result);
                            } catch (e) {
                                console.error('Error executing commonScript:', e);

                            }
                        }).call(this);
                    } else {
                        console.warn('Invalid or missing script in parsedCommonScript');
                    }
                } catch (e) {
                    console.error('Failed to parse or execute commonScript:', e);
                }
            })
        };
        if (loadPromise && typeof loadPromise.then === 'function') {
            loadPromise.then(() => setTimeout(initFunc, 100));
        } else {
            setTimeout(initFunc, 500);
        }
    } else {
        this.editLoad();
    }
};

// 执行配置的http接口源
App.prototype.runHttpInterfaces = function () {
    const httpjson = this.GLOBAL_CONFIG.device.httpjson;
    const httpList = httpjson && httpjson.length > 0 ? JSON.parse(decodeURIComponent(httpjson)) : [];
    if (httpList.length > 0) {
        console.log('runHttpInterfaces', httpList);
        for (let i = 0; i < httpList.length; i++) {
            const element = httpList[i];
            if (element.runModel != 0) {// == 0 不执行
                new HttpData(this, element).start((res, http) => {
                    if (res && http && http.point) {
                        const msg = {};
                        msg[http.point] = res;
                        this.doDeviceDatas(msg);
                    }
                })
            }
        }
    }
};

// 初始化点位数据
App.prototype.initPointsData = function () {
    const graph = this.editor.graph;
    if (!this.currentPage || !graph || !graph.model || !graph.model.root) {
        setTimeout(() => this.initPointsData(), 50);
        return;
    }
    let rcVariableList = this.GLOBAL_CONFIG.templete.rcVariableList;
    if (mxUtils.isNotNullOrUndefined(rcVariableList) && rcVariableList.length > 0) {
        let pointsValAll = rcVariableList.reduce((all, item, i) => {
            if (mxUtils.isNotNullOrUndefined(item.dwkey)) {
                all[item.dwkey] = mxUtils.convertDefaultValue(item.defaultValue, item.valueType);
            }
            return all;
        }, {});
        console.log('initPointsData', JSON.stringify(pointsValAll));
        this.doDeviceDatas(pointsValAll);
        this.runHttpInterfaces();
    }
};

App.prototype.changeVirvarValueMap = function (message) {
    // 合并新旧数据
    const prev = this.lastPointData && typeof this.lastPointData === 'object' ? this.lastPointData : {};
    const next = message && typeof message === 'object' ? message : {};
    this.lastPointData = Object.assign({}, prev, next);
    console.log('changeVirvarValueMap-message合并结果', JSON.stringify(this.lastPointData));

    // ========== 【核心修改】使用当前系统时间生成时分秒并缓存 ==========
    try {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const timePart = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        // 更新localStorage中的时间记录（保留最近10条）
        const cached = localStorage.getItem('time');
        const arr = (cached ? JSON.parse(cached) : []).concat(timePart).slice(-10);
        localStorage.setItem('time', JSON.stringify(arr));
    } catch (e) {
        console.error('当前时间记录失败:', e);
    }
    // ========== 时间处理结束 ==========

    // ========== 原有虚拟变量计算逻辑（已移除所有时间相关处理）==========
    let usedJson = this.GLOBAL_CONFIG.device.hasUsedPointJson;
    if (!mxUtils.isNotNullOrUndefined(usedJson) || usedJson.length <= 0) {
        usedJson = this.GLOBAL_CONFIG.device.virvarJson;
    }

    if (mxUtils.isNotNullOrUndefined(usedJson)) {
        let usedArr = [];
        try {
            usedArr = JSON.parse(usedJson);
        } catch (e) {
            usedArr = [];
        }

        const keys = Object.keys(this.lastPointData || {});
        const toCompute = keys.length > 0
            ? usedArr.filter(it =>
                mxUtils.isNotNullOrUndefined(it.points) &&
                it.points.some(k => keys.indexOf(k) !== -1)
            )
            : usedArr;

        this.virvarValueMap = toCompute.map(item => {
            let defVal = mxUtils.convertDefaultValue(item.defaultValue, item.valueType);
            if (mxUtils.isNotNullOrUndefined(item.customFunc)) {
                let params = [];
                if (mxUtils.isNotNullOrUndefined(item.points) && item.points.length > 0) {
                    params = item.points.map(ptem => this.lastPointData[ptem]);
                }
                let customFunc = new Function(item.customFunc);
                try {
                    defVal = customFunc(params, defVal, item.id, echarts);
                } catch (e) {
                    console.log('计算虚拟变量结果异常', item.name, item, params, defVal, e);
                }
            }
            item['resultVal'] = defVal;
            return item;
        }).reduce((obj, item) => {
            obj[`${item.id}`] = item.resultVal;
            return obj;
        }, {});
    } else {
        console.log('ajkshfgaskjfhaskjfhashjj11111111111111111111111111111111111111');
    }
    // ========== 虚拟变量逻辑结束 ==========
};
App.prototype.openClickListener = function () {
    const graph = this.editor.graph;
    const click = graph.click;
    graph.click = mxUtils.bind(this, function (evt) {
        click.apply(graph, arguments);
        if (evt && (evt.state || evt.sourceState)) {
            let oneCell = (evt.state || evt.sourceState).cell;
            if (oneCell) {
                if (this.cellSingleClickTimeOut != null) {
                    clearTimeout(this.cellSingleClickTimeOut);
                    this.cellSingleClickTimeOut = null;
                }
                this.cellSingleClickTimeOut = setTimeout(mxUtils.bind(this, function () {
                    this.firePreviewMouseEvent('click', oneCell)
                }), 300);
            }
        }
    });
    const dblClick = graph.dblClick;
    graph.dblClick = mxUtils.bind(this, function (evt, oneCell) {
        dblClick.apply(graph, arguments);
        if (this.cellSingleClickTimeOut != null) {
            clearTimeout(this.cellSingleClickTimeOut);
            this.cellSingleClickTimeOut = null;
        }
        if (evt && oneCell) {
            this.firePreviewMouseEvent('dbClick', oneCell);
        }
    });
    graph.view.addListener(
        mxEvent.SCALE,
        mxUtils.bind(this, function (event1, event2) {
            setTimeout(() => {
                this.ruochenResetPipStyle();
            }, 1);
        })
    );
    mxEvent.addListener(
        window,
        'resize',
        mxUtils.bind(this, function () {
            setTimeout(() => {
                this.fitView();
                this.ruochenResetPipStyle();
            }, 1);
        })
    );

    // 新增：全局监听 HTML Input 元素的 Enter 键，用于触发反向控制提交
    mxEvent.addListener(document, 'keydown', mxUtils.bind(this, function (evt) {
        if (evt.keyCode === 13 && evt.target && evt.target.classList.contains('inputEle')) {
            // 通过查找父级 div id 恢复 cellId
            let parentDiv = evt.target.closest('.rc_custom_view_outer_div');
            if (parentDiv && parentDiv.id && parentDiv.id.startsWith('div_')) {
                let cellId = parentDiv.id.substring(4);
                let cell = graph.model.getCell(cellId);
                if (cell) {
                    // 检查是否是 mxRc_htmlInput 组件且处于下发模式
                    const cellStyle = graph.getCellStyle(cell);
                    const shapeName = mxUtils.getValue(cellStyle, 'shape');
                    const inputMode = mxUtils.getValue(cellStyle, 'inputMode', 'display');
                    const childType = mxUtils.getValue(cellStyle, 'childType', '');

                    // 仅当是独立的 mxRc_htmlInput 组件（非 inputPart）且处于 control 模式时，走新逻辑
                    if (shapeName === 'mxgraph.rc.mxRc_htmlInput' && inputMode === 'control' && childType !== 'inputPart') {
                        // 文本输入框组件 - 下发模式 Enter 键处理
                        evt.preventDefault();
                        this.handleHtmlInputEnter(cell, cellStyle, evt.target.value);
                        return;
                    }

                    // 如果点击的是零件，尝试找到其触发事件的父组件（用于参数设定行等组合组件）
                    let triggerCell = cell;
                    if (graph.isPart(cell)) {
                        triggerCell = graph.getCompositeParent(cell);
                    }
                    console.log('检测到输入框 Enter 提交，触发单元格:', triggerCell.id);
                    this.firePreviewMouseEvent('click', triggerCell);
                }
            }
        }
    }));
};
App.prototype.getPointMetadata = function (pointKey) {
    // 1. 基础校验
    if (!pointKey || typeof pointKey !== 'string') {
        console.warn('getPointMetadata: pointKey 无效');
        return null;
    }

    const rawData = this.GLOBAL_CONFIG?.device?.virvarJson;
    if (!rawData) {
        console.warn('getPointMetadata: virvarJson 数据为空');
        return null;
    }

    // 2. 解析数据（兼容字符串/已解析数组）
    let virvarArray;
    if (typeof rawData === 'string') {
        try {
            virvarArray = JSON.parse(rawData);
            // 调试日志（生产环境可移除）
            // console.log('✅ virvarJson 已解析:', virvarArray);
        } catch (e) {
            console.error('❌ virvarJson 解析失败:', e, '原始数据:', rawData);
            return null;
        }
    } else if (Array.isArray(rawData)) {
        virvarArray = rawData;
    } else {
        console.warn('getPointMetadata: virvarJson 格式异常，既非字符串也非数组');
        return null;
    }

    // 3. 查找匹配项
    const match = virvarArray.find(v =>
        Array.isArray(v?.points) && v.points.includes(pointKey)
    );

    if (!match) {
        console.warn(`⚠️ 未找到 pointKey=" ${pointKey}" 对应的虚拟变量配置`);
        return null;
    }

    // 4. 返回必要元数据（确保数值类型）
    const pointId = Number(match.pointId);
    const sxDeviceId = Number(match.sxDeviceId);

    if (isNaN(pointId) || isNaN(sxDeviceId)) {
        console.warn(`⚠️ pointId 或 sxDeviceId 非有效数字:`, { pointId, sxDeviceId });
        return null;
    }

    return { pointId, sxDeviceId };
};
/**
 *    //{key: 0, title: '反向控制点位'},
 *     //{key: 1, title: '反向控制指令'},
 *     //{key: 2, title: '切面页面'},
 *     //{key: 3, title: '跳转外部网页'},
 * @param type
 * @param oneCell
 */
App.prototype.firePreviewMouseEvent = function (type, oneCell, contextGraph) {
    // console.log('firePreviewMouseEvent', type);
    // 优先使用传入的上下文 Graph (例如弹窗的 graph)，否则使用主编辑器 Graph
    const graph = contextGraph || this.editor.graph;
    const cellStyle = graph.getCellStyle(oneCell);

    // Check for Erchenchi Type
    const erchenchiType = mxUtils.getValue(cellStyle, 'erchenchiType');
    if ((erchenchiType === 'pump' || erchenchiType === 'valve') && type === 'click') {
        new ErchenchiControlDialog(this, oneCell, erchenchiType).show();
        return;
    }

    // Check for Custom Control Panel
    const controlPanelConfig = mxUtils.getValue(cellStyle, 'controlPanelConfig');
    if (controlPanelConfig && controlPanelConfig.length > 2 && type === 'click') {
        // Simple check if it's not empty array string "[]"
        new CustomControlDialog(this, oneCell).show();
        return;
    }

    // --- 脉冲控制组件 (Pulse Control) Logic ---
    const shapeName = mxUtils.getValue(cellStyle, 'shape');
    if (shapeName === 'mxgraph.rc.mxRc_pulseControl' && type === 'click') {
        this.handlePulseControlClick(oneCell, cellStyle);
        return;
    }

    // --- 开关组件 (Open/Close Switch) Toggle Logic ---
    const DPROP_OPEN_CLOSE = 'openCloseValues';

    // 尝试定位开关组件：检查当前点击的cell，或其父cell
    let switchTargetCell = oneCell;
    let switchRcDprop = mxUtils.getValue(cellStyle, 'rcDprop');
    let switchCellStyle = cellStyle;

    // 如果当前cell没有目标属性，尝试检查父节点 (处理点击滑块的情况)
    if (switchRcDprop !== DPROP_OPEN_CLOSE && graph.model.isVertex(graph.model.getParent(oneCell))) {
        const parent = graph.model.getParent(oneCell);
        const parentStyle = graph.getCellStyle(parent);
        if (mxUtils.getValue(parentStyle, 'rcDprop') === DPROP_OPEN_CLOSE) {
            switchTargetCell = parent;
            switchCellStyle = parentStyle;
            switchRcDprop = DPROP_OPEN_CLOSE;
        }
    }
    // console.log('DEBUG: firePreviewMouseEvent type=', type, 'switchRcDprop=', switchRcDprop);

    if (switchRcDprop === DPROP_OPEN_CLOSE && type === 'click') {
        const configStr = mxUtils.getValue(switchCellStyle, DPROP_OPEN_CLOSE);
        // console.log('DEBUG: Switch configStr=', configStr);
        if (configStr) {
            try {
                const config = JSON.parse(decodeURIComponent(configStr));
                const virvarId = config.virvarId;
                // console.log('DEBUG: virvarId=', virvarId);

                if (virvarId) {
                    // 获取 virvarJson
                    let virvars = [];
                    try {
                        virvars = JSON.parse(this.GLOBAL_CONFIG.device.virvarJson || '[]');
                    } catch (e) { }

                    const virvar = virvars.find(v => v.id === virvarId);
                    // 获取 pointKey (优先取 points[0]，否则取 id)
                    let pointKey = virvar && virvar.points && virvar.points.length > 0 ? virvar.points[0] : virvarId;
                    // console.log('DEBUG: pointKey=', pointKey);

                    if (pointKey) {
                        // 确定当前状态 (从 cell value 判断)
                        let currentVal = switchTargetCell.value;
                        let isOn = currentVal === 'ON' || currentVal === '1' || String(currentVal).toLowerCase() === 'true';

                        // 目标值：反转 (ON -> 0, OFF -> 1)
                        let targetVal = isOn ? 0 : 1;
                        // console.log('DEBUG: currentVal=', currentVal, 'isOn=', isOn, 'targetVal=', targetVal);

                        // 发送命令
                        const metadata = this.getPointMetadata(pointKey);
                        const commandData = {
                            key: pointKey,
                            value: targetVal,
                            ...(metadata && { pointId: metadata.pointId, sxDeviceId: metadata.sxDeviceId })
                        };
                        let command = JSON.stringify({
                            deviceId: this.GLOBAL_CONFIG.deviceId,
                            type: 'changePointValue',
                            data: commandData
                        });
                        console.log('发送开关 Toggle 指令', command);
                        this.sendReverseControlMsg(command);

                        // 立即更新由于网络延迟可能导致 UI 跳变，这里先乐观更新
                        // console.log('DEBUG: Updating switch visual');
                        this.updateSwitchVisual(graph, switchTargetCell, targetVal);

                        return; // 阻止后续逻辑
                    } else {
                        console.warn('DEBUG: Switch toggle failed - No pointKey found for virvarId:', virvarId);
                    }
                } else {
                    console.warn('DEBUG: Switch toggle failed - No virvarId in config');
                }
            } catch (e) {
                console.warn('Error handling switch toggle', e);
            }
        } else {
            // console.warn('DEBUG: Switch toggle skipped - No configStr');
        }
    }

    let clickEvent = mxUtils.getValue(cellStyle, type === 'click' ? 'singleClickEvent' : 'doubleClickEvent');
    if (mxUtils.isNotNullOrUndefined(clickEvent)) {
        clickEvent = JSON.parse(decodeURIComponent(clickEvent));
        if (mxUtils.isNotNullOrUndefined(clickEvent.clickType)) {
            if (clickEvent.clickType === 0) {
                if (mxUtils.isNotNullOrUndefined(clickEvent.ctrlType)) {
                    if (clickEvent.ctrlType === 0) {
                        if (mxUtils.isNotNullOrUndefined(clickEvent.pointValueDirect)) {
                            const metadata = this.getPointMetadata(clickEvent.pointKey);
                            const commandData = {
                                key: clickEvent.pointKey,
                                value: clickEvent.pointValueDirect,
                                ...(metadata && { pointId: metadata.pointId, sxDeviceId: metadata.sxDeviceId })
                            };
                            let command = JSON.stringify({
                                deviceId: this.GLOBAL_CONFIG.deviceId,
                                type: 'changePointValue',
                                data: commandData
                            });
                            console.log('发送直接修改点位值消息', command);
                            this.sendReverseControlMsg(command);
                        }
                    } else if (clickEvent.ctrlType === 1) {
                        if (mxUtils.isNotNullOrUndefined(clickEvent.pointValueVirvarId) && clickEvent.pointValueConsProp.cons
                            && clickEvent.pointValueConsProp.cons.length > 0) {
                            let outputValue = this.virvarValueMap[clickEvent.pointValueVirvarId];
                            if (mxUtils.isNotNullOrUndefined(outputValue)) {
                                outputValue = mxUtils.getConditionValue(clickEvent.pointValueConsProp.cons, outputValue);
                                const metadata = this.getPointMetadata(clickEvent.pointKey);
                                const commandData = {
                                    key: clickEvent.pointKey,
                                    value: outputValue,
                                    ...(metadata && { pointId: metadata.pointId, sxDeviceId: metadata.sxDeviceId })
                                };
                                let command = JSON.stringify({
                                    deviceId: this.GLOBAL_CONFIG.deviceId,
                                    type: 'changePointValue',
                                    data: commandData
                                });
                                console.log('发送条件修改点位值消息', command);
                                this.sendReverseControlMsg(command);
                            }
                        }
                    } else if (clickEvent.ctrlType === 2) {
                        if (mxUtils.isNotNullOrUndefined(clickEvent.pointValueCellId)) {
                            let divId = 'div_' + clickEvent.pointValueCellId;
                            // 优先在当前 Graph 容器内查找，以处理弹窗环境
                            let cellDiv = null;
                            if (graph.container) {
                                cellDiv = graph.container.querySelector('#' + divId);
                            }
                            // 降级：全局查找
                            if (!cellDiv) {
                                cellDiv = document.getElementById(divId);
                            }

                            if (cellDiv) {
                                let inputEle = cellDiv.querySelector('.inputEle');
                                if (inputEle) {
                                    const metadata = this.getPointMetadata(clickEvent.pointKey);
                                    const commandData = {
                                        key: clickEvent.pointKey,
                                        value: inputEle.value,
                                        ...(metadata && { pointId: metadata.pointId, sxDeviceId: metadata.sxDeviceId })
                                    };
                                    let command = JSON.stringify({
                                        deviceId: this.GLOBAL_CONFIG.deviceId,
                                        type: 'changePointValue',
                                        data: commandData
                                    });
                                    console.log('发送输入值修改点位值消息', metadata);
                                    console.log('发送输入值修改点位值消息', command);
                                    this.sendReverseControlMsg(command);
                                    // 就地刷新
                                    let localData = {};
                                    localData[clickEvent.pointKey] = inputEle.value;
                                    this.doDeviceDatas(localData);
                                }
                            }
                        }
                    }
                }
            } else if (clickEvent.clickType === 1) {
                if (mxUtils.isNotNullOrUndefined(clickEvent.commandContent) && clickEvent.commandContent.length > 0) {
                    let command = JSON.stringify({
                        deviceId: this.GLOBAL_CONFIG.deviceId,
                        type: 'ctrlCommand',
                        data: {
                            command: clickEvent.commandContent,
                        }
                    });
                    // console.log('发送反向控制指令', command);
                    this.sendReverseControlMsg(command);
                }
            } else if (clickEvent.clickType === 2) {
                if (mxUtils.isNotNullOrUndefined(clickEvent.changePageId)) {
                    const jumpPage = this.pages.find((item) => {
                        return item.getId() === clickEvent.changePageId
                    })
                    if (mxUtils.isNotNullOrUndefined(jumpPage)) {
                        console.log('切换页面', jumpPage);
                        this.selectPage(jumpPage);
                        setTimeout(() => {
                            this.fitView();
                            this.ruochenResetPipStyle();
                        }, 500);
                    }
                }
            } else if (clickEvent.clickType === 3) {
                if (mxUtils.isNotNullOrUndefined(clickEvent.outerLink)) {
                    window.open(clickEvent.outerLink, '_blank');
                }
            } else if (clickEvent.clickType === 4) {
                // 处理打开控制面板
                if (mxUtils.isNotNullOrUndefined(clickEvent.controlPanelId)) {
                    new ControlPanelDisplayDialog(this, clickEvent.controlPanelId).show();
                }
            }
        }
    }
};

App.prototype.sendReverseControlMsg = function (msg) {
    console.log('[CX] sendReverseControlMsg---start', msg);
    if (this.GLOBAL_CONFIG['DATA_SOURCE_TYPE'] === 'mqtt') {
        if (this.mqttClient != null) {
            if (this.mqttClient.connected) {
                console.log('[CX] 反向控制消息已发送', 'mqtt', msg);
                this.mqttClient.publish('topic/client/changePoint', msg);
            } else {
                console.log('[CX] 反向控制消息未发送', 'mqtt', '未连接');
            }
        } else {
            console.log('[CX] 反向控制消息未发送', 'mqtt', '无 mqttClient 实例');
        }
    } else if (this.GLOBAL_CONFIG['DATA_SOURCE_TYPE'] === 'websocket') {
        if (this.websocketClient != null) {
            if (this.websocketClient.connected) {
                console.log('[CX] 反向控制消息已发送', 'websocket', msg);
                this.websocketClient.publish(msg);
            } else {
                console.log('[CX] 反向控制消息未发送', 'websocket', '未连接');
            }
        } else {
            console.log('[CX] 反向控制消息未发送', 'websocket', '无 websocketClient 实例');
        }
    } else if (this.GLOBAL_CONFIG['DATA_SOURCE_TYPE'] === 'http') {
        if (this.httpClient != null) {
            this.httpClient.publish(msg);
        } else {
            console.log('[CX] 反向控制消息未发送', 'http', '无 httpClient 实例');
        }
    }

    // 修复：同时调用后端的数据下发接口，确保记录和下发逻辑正确
    // 安全获取 Integer 范围内的 Device ID，防止后端反序列化报错 (DataType mismatch: String(Long) -> int)
    let safeDeviceId = 0;
    try {
        const globalId = parseInt(this.GLOBAL_CONFIG.deviceId);
        // Java Integer.MAX_VALUE = 2147483647
        if (!isNaN(globalId) && globalId >= -2147483648 && globalId <= 2147483647) {
            safeDeviceId = globalId;
        } else {
            console.warn('[CX] DeviceId exceeds Integer range, using 0 for logging to avoid backend error:', this.GLOBAL_CONFIG.deviceId);
        }
    } catch (e) { }

    // 修复：同时调用后端的数据下发接口，确保记录和下发逻辑正确
    const commandPayload = {
        dataDistributionTopic: '/up/data/nodereds', // 默认下发主题，如有配置可从 this.GLOBAL_CONFIG 读取
        issueCommand: msg,
        deviceId: safeDeviceId,
        dataDistributionName: '节点下发命令'
    };

    // 尝试从 msg 中提取更多信息
    try {
        const msgObj = JSON.parse(msg);
        if (msgObj.type === 'changePointValue') {
            commandPayload.dataDistributionName = '参数设定下发';
            // 如果由点位信息提供了 sxDeviceId 且在范围内，优先使用
            if (msgObj.data && msgObj.data.sxDeviceId) {
                const sxId = parseInt(msgObj.data.sxDeviceId);
                if (!isNaN(sxId) && sxId >= -2147483648 && sxId <= 2147483647) {
                    commandPayload.deviceId = sxId;
                }
            }
        } else if (msgObj.type === 'ctrlCommand') {
            commandPayload.dataDistributionName = '控制命令下发';
        }
    } catch (e) { }

    api.addDataDistribution(commandPayload).then(res => {
        console.log('%c[CX] ✅ 数据下发接口调用成功', 'color: green; font-weight: bold;', res);
        console.log('[CX] 📤 下发请求详情:', JSON.stringify(commandPayload, null, 2));
    }).catch(err => {
        console.error('%c[CX] ❌ 数据下发接口调用失败', 'color: red; font-weight: bold;', err);
        console.log('[CX] 📤 下发请求详情:', JSON.stringify(commandPayload, null, 2));
    });
};

// 检查连接什么服务
// syz 这里是查询当前组态使用的是什么方式的数据来源   也就是说  一个组态配置一个数据来源  不能精确到一个组件一个数据来源
App.prototype.checkDataCenter = function () {
    //checkDataCenter
    if (!this.editor.chromeless) return;
    let device = this.GLOBAL_CONFIG.device;
    if (mxUtils.isNullOrUndefined(device)) {
        console.log('checkDataCenter--失败---device信息不存在')
        return;
    }
    if (mxUtils.isNullOrUndefined(device.slaveUrl) || device.slaveUrl.length <= 0) {
        console.log('checkDataCenter--失败---device.slaveUrl信息不存在')
        return;
    }
    this.GLOBAL_CONFIG['DATA_SOURCE_TYPE'] = null;
    this.GLOBAL_CONFIG['SLAVE_JSON'] = null;
    let slaveJson = null;
    try {
        slaveJson = JSON.parse(decodeURIComponent(device.slaveUrl));
    } catch (e) {
        console.log(`JSON.parse(decodeURIComponent(device.slaveUrl))`, e);
    }
    console.log('checkDataCenter--slaveJson', slaveJson);
    if (slaveJson == null) {
        console.log('checkDataCenter--失败---slaveJson 信息不存在')
        return;
    }
    if (mxUtils.isNullOrUndefined(slaveJson.source) || slaveJson.source.length <= 0) {
        console.log('checkDataCenter--失败---slaveJson.source 未设置')
        return;
    }
    this.GLOBAL_CONFIG['SLAVE_JSON'] = slaveJson;
    if (slaveJson.source === 'mqtt') {
        if (mxUtils.isNullOrUndefined(slaveJson.mqttUrl)) {
            console.log('checkDataCenter--失败---mqtt slaveJson.mqttUrl 信息不存在')
            return;
        }
        this.GLOBAL_CONFIG['DATA_SOURCE_TYPE'] = 'mqtt';
        let mqttOption = {
            mqttUrl: slaveJson.mqttUrl,
            mqttClientId: slaveJson.mqttClientId,
            mqttUsername: slaveJson.mqttUsername,
            mqttPassword: slaveJson.mqttPassword,
        };
        this.checkStartMqtt(mqttOption);
        return;
    }
    if (slaveJson.source === 'websocket') {
        if (mxUtils.isNullOrUndefined(slaveJson.wsUrl)) {
            console.log('checkDataCenter--失败---websocket slaveJson.wsUrl 信息不存在')
            return;
        }
        this.GLOBAL_CONFIG['DATA_SOURCE_TYPE'] = 'websocket';
        let wsOption = {
            wsUrl: slaveJson.wsUrl,
            wsProtocols: slaveJson.wsProtocols,
        };
        this.checkStartWebsocket(wsOption);
        return;
    }
    if (slaveJson.source === 'http') {
        this.GLOBAL_CONFIG['DATA_SOURCE_TYPE'] = 'http';
        if (mxUtils.isNullOrUndefined(slaveJson.httpHost)) {
            console.log('checkDataCenter--失败---http slaveJson.httpHost 信息不存在')
            return;
        }
        this.checkStartHttp(slaveJson);
        return;
    }
    setTimeout(() => {
        this.changeVirvarValueMap()
    }, 1);

    console.log('checkDataCenter--失败---未匹配到数据源类型')
};

App.prototype.checkStartHttp = function (slaveJson) {
    if (this.httpClient != null) {
        this.httpClient.close();
    }
    this.httpClient = null;
    let client = null;
    try {
        client = new CustomHttpHeartbeat(this, slaveJson);
    } catch (e) {
        console.log('checkStartWebsocket', e);
    } finally {
        if (client) {
            client.onMessage(mxUtils.bind(this, function (msg) {
                console.log('client.onMessage', msg);
                if (mxUtils.isJSON(msg)) {
                    msg = JSON.parse(msg);
                    this.doDeviceDatas(msg);
                }
            }));
            client.connect();
            this.httpClient = client;
        }
    }
};

App.prototype.checkStartWebsocket = function (wsOption) {
    if (this.websocketClient != null) {
        this.websocketClient.close();
    }
    this.websocketClient = null;
    console.log('wsOption', JSON.stringify(wsOption));
    let client = null;
    try {
        wsOption.wsUrl = mxUtils.replaceDynamicParams(wsOption.wsUrl, this);
        let wsProtocols = null;
        if (mxUtils.isNotNullOrUndefined(wsOption.wsProtocols)) {
            if (wsOption.wsProtocols.indexOf(';') !== -1) {
                wsProtocols = wsOption.wsProtocols.split(';')
            } else {
                wsProtocols = wsOption.wsProtocols;
            }
        }
        client = new CustomWebSocket(wsOption.wsUrl, wsProtocols);
    } catch (e) {
        console.log('checkStartWebsocket', e);
    } finally {
        if (client) {
            client.onMessage(mxUtils.bind(this, function (msg) {
                console.log('client.onMessage', msg);
                if (mxUtils.isJSON(msg)) {
                    msg = JSON.parse(msg);
                    this.doDeviceDatas(msg);
                }
            }));
            client.connect();
            this.websocketClient = client;
        }
    }
};

App.prototype.checkStartMqtt = function (mqttOption) {
    if (this.mqttClient) {
        this.mqttClient.close();
        this.mqttClient = null;
    }
    let client = null;
    try {
        if (mxUtils.isNullOrUndefined(mqttOption.mqttClientId) || mqttOption.mqttClientId.length <= 0) {
            let uuid = mxUtils.uuid();
            mqttOption.mqttClientId = `mqtt_preview_${this.GLOBAL_CONFIG.deviceId}_${uuid}`;
        }
        mqttOption.mqttUrl = mxUtils.replaceDynamicParams(mqttOption.mqttUrl, this);
        console.log('mqttOption', JSON.stringify(mqttOption));
        this.GLOBAL_CONFIG.clientId = mqttOption.mqttClientId;
        client = new CustomMqtt(mqttOption);
    } catch (e) {
        console.log('checkStartWebsocket', e);
    } finally {
        if (client) {
            client.onOpen(mxUtils.bind(this, function (event) {
                // 在连接建立后执行的操作
                let topic0 = `topic/preview/subscribe/device/${this.GLOBAL_CONFIG.deviceId}`;
                client.subscribe(topic0, (err) => {
                    if (!err) {
                        console.log(`订阅 topic0 ${topic0} 成功`);
                    } else {
                        console.log('err', err);
                    }
                });
                let topic1 = `topic/preview/subscribe/client/${this.GLOBAL_CONFIG.clientId}`;
                client.subscribe(topic1, (err) => {
                    if (!err) {
                        console.log(`订阅 topic1 ${topic1} 成功!`);
                        client.publish(
                            'topic/client/connected',
                            JSON.stringify({
                                deviceId: this.GLOBAL_CONFIG.deviceId,
                                clientId: mqttOption.mqttClientId,
                            })
                        );
                    } else {
                        console.log('err', err);
                    }
                });
            }));
            client.onMessage(mxUtils.bind(this, function (topic, message) {
                console.log(`mqtt收到消息\ntopic：${topic}\nmessage：${message}`);
                if (mxUtils.isJSON(message)) {
                    message = JSON.parse(message);
                    this.doDeviceDatas(message);
                }
            }));
            client.connect();
            this.mqttClient = client;
        }
    }
};

App.prototype.doDeviceDatas = function (message) {
    if (mxUtils.isNullOrUndefined(message)) return;
    console.log('doDeviceDatas message=', JSON.stringify(message));
    this.changeVirvarValueMap(message);
    const graph = this.editor.graph;
    // console.log("graph",graph);
    const allCells = graph.model.cells;
    // console.log("allCells",allCells);
    try {
        if (!allCells || Object.keys(allCells).length <= 0) return;
        // console.log('App.prototype.doDeviceDatas-allCells:', allCells);
        // 记录最新点位值
        //this.GLOBAL_CONFIG['lastData'] = event.dataPoints;
        for (let i in allCells) {
            let oneCell = allCells[i];
            // console.log('App.prototype.doDeviceDatas-for-i:', i, oneCell);
            if (!graph.getModel().isRoot(oneCell)) {
                this.mappingCellDprop(graph, oneCell);
            }
        }
        // 触发全局设备数据更新事件，通知子窗口/弹窗刷新
        this.fireEvent(new mxEventObject('deviceDataUpdated', 'message', message));
    } catch (e) {
        console.error('doDeviceDatas error=', e);
    } finally {
        setTimeout(() => {
            this.ruochenResetPipStyle();
        }, 1);
    }
};

App.prototype.mappingCellDprop = function (graph, oneCell) {
    let cellStyle = graph.getCellStyle(oneCell);
    // console.log('mappingCellDprop---cellStyle', cellStyle, oneCell);
    let rcCommonDprops = [
        'commonVisible', 'commonRotateAnim', 'commonTwinkleAnim',
        'commonStrokeColor', 'commonFontColor', 'commonTextValues', 'commonScript'
    ];
    if (mxUtils.isNotNullOrUndefined(oneCell.edge) && oneCell.edge === 1) {
        rcCommonDprops.push('flowStateValues');
    }
    let rcDprop = mxUtils.getValue(cellStyle, 'rcDprop', null);
    // console.log('mappingCellDprop---rcDprop', rcDprop);
    if (mxUtils.isNotNullOrUndefined(rcDprop)) {
        rcDprop = rcDprop.split(',');
        rcCommonDprops.push(...rcDprop);
    }
    if (mxUtils.isNotNullOrUndefined(cellStyle.igDprop)) {
        const ignoreArr = cellStyle.igDprop.split(',');
        rcCommonDprops = rcCommonDprops.filter(item => ignoreArr.indexOf(item) === -1);
    }

    console.log(`[mappingCellDprop] CellID: ${oneCell.id}, Props:`, rcCommonDprops);

    for (let j = 0; j < rcCommonDprops.length; j++) {
        let rcDpropValue = mxUtils.getValue(cellStyle, rcCommonDprops[j], null);
        try {
            if (mxUtils.isNullOrUndefined(rcDpropValue)) {
                // 如果样式中缺失该属性但它在 rcDprop 中定义了，尝试从静态配置映射中加载默认值
                if (StaticPointPropMap[rcCommonDprops[j]]) {
                    rcDpropValue = JSON.parse(JSON.stringify(StaticPointPropMap[rcCommonDprops[j]]));
                }
            } else {
                rcDpropValue = JSON.parse(decodeURIComponent(rcDpropValue));
            }

            if (mxUtils.isNotNullOrUndefined(rcDpropValue)) {
                // 检查 virvarId 是否有效（非空且非 'null' 字符串）
                const hasValidVirvar = mxUtils.isNotNullOrUndefined(rcDpropValue.virvarId) &&
                    rcDpropValue.virvarId !== '' &&
                    rcDpropValue.virvarId !== 'null';

                if (hasValidVirvar) {
                    let outputValue = this.virvarValueMap[rcDpropValue.virvarId];
                    if (rcDpropValue.consType === 4) {
                        if (rcDpropValue.outputType === 1) {
                            outputValue = rcDpropValue.prefix + outputValue;
                        } else if (rcDpropValue.outputType === 2) {
                            outputValue = outputValue + rcDpropValue.suffix;
                        } else if (rcDpropValue.outputType === 3) {
                            outputValue = rcDpropValue.prefix + outputValue + rcDpropValue.suffix;
                        }
                        this.setDpropValueKeyData(graph, oneCell, cellStyle, rcDpropValue, outputValue);
                    } else if (rcDpropValue.consType === 5) {
                        outputValue = mxUtils.getConditionValue(rcDpropValue.cons, outputValue);
                        this.setDpropValueKeyData(graph, oneCell, cellStyle, rcDpropValue, outputValue);
                    }
                } else {
                    // 二沉池 (Erchenchi): 如果未绑定变量，支持使用静态数值控制状态
                    if (rcDpropValue.dpropKey === 'erchenchiStatusValues') {
                        let staticVal = mxUtils.getValue(cellStyle, 'staticStatusValue', null);
                        if (staticVal === null || staticVal === undefined) {
                            // 备选方案：直接从样式字符串解析
                            let rawStyle = mxUtils.getCellStyleWithStr(oneCell.getStyle() || '');
                            staticVal = rawStyle['staticStatusValue'];
                        }

                        console.log(`[mappingCellDprop] StatusIndicator staticVal detected:`, staticVal);

                        if (staticVal != null && staticVal !== '') {
                            this.setDpropValueKeyData(graph, oneCell, cellStyle, rcDpropValue, staticVal);
                        }
                    }
                    // 开关切换：手动测试状态
                    if (rcDpropValue.dpropKey === 'openCloseValues') {
                        let staticVal = mxUtils.getValue(cellStyle, 'staticSwitchState', null);
                        if (staticVal === null || staticVal === undefined) {
                            let rawStyle = mxUtils.getCellStyleWithStr(oneCell.getStyle() || '');
                            staticVal = rawStyle['staticSwitchState'];
                        }
                        if (staticVal != null && staticVal !== '') {
                            this.setDpropValueKeyData(graph, oneCell, cellStyle, rcDpropValue, staticVal);
                        }
                    }
                    if (rcDpropValue.consType === 7) {
                        this.setDpropValueKeyData(graph, oneCell, cellStyle, rcDpropValue, null);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
};

App.prototype.setDpropValueKeyData = function (graph, oneCell, cellStyle, rcDpropValue, outputValue) {
    if (rcDpropValue.key.startsWith('attr:')) {
        let key = rcDpropValue.key.split(':')[1];
        if (key === 'value') {
            // 二沉池 (Erchenchi) 状态指示灯专用逻辑
            let erchenchiType = mxUtils.getValue(cellStyle, 'erchenchiType', null);
            if (erchenchiType == null) {
                erchenchiType = mxUtils.getCellStyleWithStr(oneCell.getStyle() || '')['erchenchiType'];
            }

            if (erchenchiType === 'statusIndicator') {
                console.log(`[StatusIndicator] Processing value: "${outputValue}", CellID: ${oneCell.id}`);
                let targetText = null;
                let targetColor = null;

                // 统一转换为字符串进行匹配，增强容错性
                const valStr = (outputValue != null) ? String(outputValue).trim() : '';
                // console.log(`[StatusIndicator Debug] CellID: ${oneCell.id}, valStr: "${valStr}"`);

                if (valStr === '0' || valStr === 'false') {
                    targetText = 'STOP';
                    targetColor = '#ff4d4f'; // 红色
                } else if (valStr === '1' || valStr === 'true') {
                    targetText = 'RUN';
                    targetColor = '#00ff00'; // 绿色
                } else if (valStr === '2') {
                    targetText = 'SUSPEND';
                    targetColor = '#ffffff'; // 白色
                }

                if (targetText !== null) {
                    outputValue = targetText;

                    // console.log(`[StatusIndicator Debug] Matched targetText: ${targetText}`);

                    const currentStroke = mxUtils.getValue(cellStyle, 'strokeColor', null);
                    if (currentStroke !== targetColor) {
                        graph.getModel().beginUpdate();
                        try {
                            // 检查是否为“填充型”指示灯（如果有非 none 的填充色，或者明确是椭圆形的圆形指示灯）
                            const isFilled = mxUtils.getValue(cellStyle, 'fillColor', 'none') !== 'none';

                            graph.setCellStyles('strokeColor', targetColor, [oneCell]);

                            if (isFilled) {
                                // 填充模式：背景变色，文字根据背景自动选择对比色
                                graph.setCellStyles('fillColor', targetColor, [oneCell]);
                                const contrastColor = (targetColor.toLowerCase() === '#ffffff') ? '#000000' : '#ffffff';
                                graph.setCellStyles('fontColor', contrastColor, [oneCell]);
                            } else {
                                // 描边模式：文字与描边颜色同步
                                graph.setCellStyles('fontColor', targetColor, [oneCell]);
                            }
                        } finally {
                            graph.getModel().endUpdate();
                        }
                    }
                } else {
                    // console.log(`[StatusIndicator Debug] No match for valStr: "${valStr}"`);
                    return;
                }
            }

            if (rcDpropValue.dpropKey === 'singleDataBindValues' && oneCell.getChildCount() > 0) {
                // 如果是参数设定行（Group），我们需要更新其内部Input子组件的值，而不是Group本身
                for (let i = 0; i < oneCell.getChildCount(); i++) {
                    let child = oneCell.getChildAt(i);
                    let childStyle = graph.getCellStyle(child);
                    let childType = mxUtils.getValue(childStyle, 'childType', null);
                    if (childType === 'inputPart') {
                        if (child.getValue() != outputValue) {
                            graph.getModel().beginUpdate();
                            try {
                                graph.getModel().setValue(child, outputValue);
                            } finally {
                                graph.getModel().endUpdate();
                            }
                        }
                        return; // 找到并更新后直接返回
                    }
                }
            }

            if (oneCell.getValue() != outputValue) {
                graph.getModel().beginUpdate();
                try {
                    graph.getModel().setValue(oneCell, outputValue);
                } finally {
                    graph.getModel().endUpdate();
                }
            }
            // 状态指示灯或数据显示组件属性变更后，强制刷新图元显示并触发即时重绘
            if (erchenchiType === 'statusIndicator' || erchenchiType === 'dataDisplay') {
                graph.refresh(oneCell);
            }
        } else if (key === 'visible') {
            let val = outputValue == 1;
            if (graph.isCellVisible(oneCell) != val) {
                graph.getModel().beginUpdate();
                try {
                    graph.setCellsVisible([oneCell], val);
                } finally {
                    graph.getModel().endUpdate();
                }
            }
            console.log(`setDpropValueKeyData, visible:${val}`);
        }
    } else if (rcDpropValue.key.startsWith('style:')) {
        let key = rcDpropValue.key.split(':')[1];

        // 增强：处理开关组件的视觉切换
        if (key === 'stateValue' && rcDpropValue.dpropKey === 'openCloseValues') {
            this.updateSwitchVisual(graph, oneCell, outputValue);
        }

        let keyStyleValue = mxUtils.getValue(cellStyle, key, null);
        if (keyStyleValue != outputValue) {
            graph.getModel().beginUpdate();
            try {
                let cells = [oneCell];
                graph.setCellStyles(key, outputValue, cells);
                this.fireEvent(new mxEventObject('styleChanged', 'keys', [key], 'values', [outputValue], 'cells', cells));
            } finally {
                graph.getModel().endUpdate();
            }
            console.log(`setDpropValueKeyData, style:${key}, value:${outputValue}`);
        }
    } else if (rcDpropValue.key.startsWith('script:')) {
        if (outputValue == null) {
            try {
                const ov = document.getElementById('jump-script-overlay');
                if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
            } catch (e) { }
            try {
                if (typeof window._jumpScriptCleanup === 'function') {
                    window._jumpScriptCleanup();
                }
            } catch (e) { }
            try {
                if (typeof window._pulseScriptCleanup === 'function') {
                    window._pulseScriptCleanup();
                }
            } catch (e) { }
        }
    }
};

App.prototype.updateSwitchVisual = function (graph, cell, value) {
    if (cell.getChildCount() > 0) {
        // 假设滑块是第一个子元素 (part=1)
        let knob = cell.getChildAt(0);

        // 简单验证是否为滑块部分
        let knobStyle = graph.getCellStyle(knob);
        if (mxUtils.getValue(knobStyle, 'part', '0') == '1') {
            graph.getModel().beginUpdate();
            try {
                let geo = graph.getModel().getGeometry(knob);
                if (geo) {
                    geo = geo.clone();
                    // value is often "1" or "0" string or number
                    if (value == 1 || value == '1' || value == true || value == 'true') {
                        // ON logic: 滑块在右边，文字在左边
                        geo.x = 1;
                        geo.offset = new mxPoint(-22, 2);
                        graph.setCellStyles('fillColor', '#2d8cf0', [cell]);
                        graph.setCellStyles('strokeColor', '#2d8cf0', [cell]);
                        graph.setCellStyles('align', 'left', [cell]);
                        graph.setCellStyles('spacingLeft', '5', [cell]);
                        graph.setCellStyles('spacingRight', '0', [cell]);
                        graph.model.setValue(cell, 'ON');
                    } else {
                        // OFF logic: 滑块在左边，文字在右边
                        geo.x = 0;
                        geo.offset = new mxPoint(2, 2);
                        graph.setCellStyles('fillColor', '#ff4d4f', [cell]);
                        graph.setCellStyles('strokeColor', '#ff4d4f', [cell]);
                        graph.setCellStyles('align', 'right', [cell]);
                        graph.setCellStyles('spacingRight', '5', [cell]);
                        graph.setCellStyles('spacingLeft', '0', [cell]);
                        graph.model.setValue(cell, 'OFF');
                    }
                    graph.getModel().setGeometry(knob, geo);
                }
            } finally {
                graph.getModel().endUpdate();
            }
        }
    }
};

App.prototype.previewLoad = function () {


    console.log('最先进这里了啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊')
    const graph = this.editor.graph;
    return this.deviceStore.getItem('content').then(mxUtils.bind(this, function (content) {
        if (content) {
            let doc = mxUtils.parseXml(content);
            let node = this.editor.extractGraphModel(doc.documentElement, true);
            let diagrams = node.getElementsByTagName('diagram');
            this.pages = [];
            for (let index = 0; index < diagrams.length; index++) {
                const diagram = diagrams[index];
                const page = this.updatePageRoot(new DiagramPage(diagram), true);
                this.pages.push(page);
            }
            this.currentPage = this.pages[0];
            this.scrollToPage();
            graph.view.clear(graph.model.root, true);
            graph.clearSelection();
            graph.model.rootChanged(this.currentPage.root);
            graph.setViewState(this.currentPage.viewState);
            this.editor.fireEvent(new mxEventObject('setViewState', 'change', this));
            graph.gridEnabled = graph.gridEnabled && !this.editor.isChromelessView();
            this.editor.fireEvent(new mxEventObject('pageSelected', 'change', this));
        } else {
            this.createFirstPage();
        }
    })).catch(e => {
        console.log('App.prototype.editLoad---catch', e);
    });
};

App.prototype.editLoad = function () {
    const graph = this.editor.graph;
    this.deviceStore.getItem('content').then(mxUtils.bind(this, function (content) {
        if (content) {
            const doc = mxUtils.parseXml(content);
            const node = this.editor.extractGraphModel(doc.documentElement, true);
            const diagrams = node.getElementsByTagName('diagram');
            this.pages = [];
            for (let index = 0; index < diagrams.length; index++) {
                const diagram = diagrams[index];
                const page = this.updatePageRoot(new DiagramPage(diagram), true);
                this.pages.push(page);
            }
            this.currentPage = this.pages[0];
            this.scrollToPage();
            graph.view.clear(graph.model.root, true);
            graph.clearSelection();
            graph.model.rootChanged(this.currentPage.root);
            graph.setViewState(this.currentPage.viewState);
            this.editor.fireEvent(new mxEventObject('setViewState', 'change', this));
            graph.gridEnabled = graph.gridEnabled && !this.editor.isChromelessView();

            this.editor.updateGraphComponents();
            graph.view.validate();
            graph.sizeDidChange();
            this.editor.fireEvent(new mxEventObject(mxEvent.ROOT));
            this.editor.fireEvent(new mxEventObject('pageSelected', 'change', this));

            /* const backgroundColor = this.currentPage.getBackgroundColor();
            const backgroundImg = this.currentPage.getBackgroundImage();
            if (backgroundImg) {
                let image = new Image();
                image.src = mxUtils.fixImg(backgroundImg);
                image.crossOrigin = '*';
                image.onload = mxUtils.bind(this, function () {
                    let canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                    let dataURL = canvas.toDataURL('image/png');
                    let bgImg = new Image();
                    bgImg.src = dataURL;
                    setTimeout(()=>{
                        this.setBackgroundImage(bgImg);
                    }, 500);
                });
            }else if(backgroundColor){
                this.setBackgroundColor(backgroundColor);
            } */
        } else {
            this.createFirstPage();
        }
    })).catch(e => {
        console.log('App.prototype.editLoad---catch', e);
    });
};

EditorUi.prototype.save2Server = function (preview, server) {
    console.log('save2Server', preview, server);
    let enc = new mxCodec(mxUtils.createXmlDocument());
    let content = enc.document.createElement('mxfile');
    content.setAttribute('useragent', 'rc-editor');
    content.setAttribute('author', 'songjun');
    content.setAttribute('version', '@RC-EDITOR@');
    content.setAttribute('company', '万维组态-sj');
    content.setAttribute('editor', 'rceditor.com');
    content.setAttribute('sourceId', this.GLOBAL_CONFIG.deviceId);
    for (let i = 0; i < this.pages.length; i++) {
        let page = this.pages[i];
        content.appendChild(page.node);
    }
    content = mxUtils.getPrettyXml(content);
    this.deviceStore.setItem('content', content).then(async () => {
        let edversion = await this.deviceStore.getItem('edversion');
        edversion = parseInt(edversion);
        let plus = edversion + 1
        return this.deviceStore.setItem('edversion', plus + '');
    }).then(async () => {
        if (preview || server) {
            let fileName = `${this.GLOBAL_CONFIG.deviceId}_content.txt`;
            // 创建一个新的 Blob 对象，并将文本内容放入其中file
            let blob = new Blob([content], { type: "text/plain" });
            let file = new File([blob], fileName, { type: "text/plain" });
            return api.uploadContent(this.GLOBAL_CONFIG.deviceId, file)
        } else {
            return new Promise(resolve => {
                resolve({ code: 0 });
            })
        }
    }).then((uploadRes) => {
        if (uploadRes.code === 200) {
            if (uploadRes.data) {
                // 规范化后端返回路径，防止保存绝对路径导致后续拉取失败
                const normalizedContentPath = api.normalizePath(uploadRes.data);
                console.log('文件上传成功，规范化路径后准备保存记录:', normalizedContentPath);

                let hasUsedPointJson = this.GLOBAL_CONFIG.device.hasUsedPointJson;
                if (!hasUsedPointJson || hasUsedPointJson.length === 0) {
                    hasUsedPointJson = this.getHasUsedPointJson ? this.getHasUsedPointJson() : '[]';
                }

                return api.saveConfigurationInfo({
                    id: this.GLOBAL_CONFIG.deviceId,
                    content: normalizedContentPath,
                    hasUsedPointJson: hasUsedPointJson,
                })
            } else {
                return new Promise((resolve) => resolve(uploadRes))
            }
        } else {
            return new Promise((resolve, reject) => reject(uploadRes.msg))
        }
    }).then(async (saveRes) => {
        this.spinner.stop();
        if (saveRes.code === 200) {
            mxUtils.alert(saveRes.msg);
            if (mxUtils.isNotNullOrUndefined(saveRes.data)) {
                await this.deviceStore.setItem('edversion', saveRes.data.edversion);
                this.GLOBAL_CONFIG.device.edversion = saveRes.data.edversion;
            }
            if (preview) {
                window.open(`${window.location.origin}/preview?deviceId=${this.GLOBAL_CONFIG.deviceId}`);
            }
        } else {
            mxUtils.alert(saveRes.msg);
            console.log('saveConfigurationInfo----Failure: ', saveRes);
        }
    }).catch((err) => {
        console.error('save2Server----Error: ', err);
        this.spinner.stop();
        mxUtils.alert('保存失败: ' + (err.message || err));
    });

};

EditorUi.prototype.getHasUsedPointJson = function () {
    const graph = this.editor.graph;
    const allCells = graph.model.cells;
    const virvarJsonStr = this.GLOBAL_CONFIG.device.virvarJson;
    const virvarList = virvarJsonStr && virvarJsonStr.length > 0 ? JSON.parse(virvarJsonStr) : [];
    console.log('hasUsedPointJson 收集开始，virvarJson 条目数=', virvarList.length);
    const virvarById = virvarList.reduce((m, it) => {
        if (mxUtils.isNotNullOrUndefined(it.id)) {
            m[`${it.id}`] = it;
        }
        return m;
    }, {});
    const usedIds = {};
    if (allCells && Object.keys(allCells).length > 0) {
        for (let k in allCells) {
            const oneCell = allCells[k];
            if (!graph.getModel().isRoot(oneCell)) {
                let cellStyle = graph.getCellStyle(oneCell);
                let rcCommonDprops = [
                    'commonVisible', 'commonRotateAnim', 'commonTwinkleAnim',
                    'commonStrokeColor', 'commonFontColor', 'commonTextValues', 'commonScript'
                ];
                if (mxUtils.isNotNullOrUndefined(oneCell.edge) && oneCell.edge === 1) {
                    rcCommonDprops.push('flowStateValues');
                }
                let rcDprop = mxUtils.getValue(cellStyle, 'rcDprop', null);
                if (mxUtils.isNotNullOrUndefined(rcDprop)) {
                    rcDprop = rcDprop.split(',');
                    rcCommonDprops.push(...rcDprop);
                }
                if (mxUtils.isNotNullOrUndefined(cellStyle.igDprop)) {
                    const ignoreArr = cellStyle.igDprop.split(',');
                    rcCommonDprops = rcCommonDprops.filter(item => ignoreArr.indexOf(item) === -1);
                }
                for (let j = 0; j < rcCommonDprops.length; j++) {
                    let rcDpropValue = mxUtils.getValue(cellStyle, rcCommonDprops[j], null);
                    if (mxUtils.isNotNullOrUndefined(rcDpropValue)) {
                        try {
                            rcDpropValue = JSON.parse(decodeURIComponent(rcDpropValue));
                            if (mxUtils.isNotNullOrUndefined(rcDpropValue.virvarId)) {
                                usedIds[`${rcDpropValue.virvarId}`] = true;
                            }
                        } catch (e) {
                        }
                    }
                }
            }
        }
    }
    console.log('hasUsedPointJson 已使用变量数量=', Object.keys(usedIds).length);
    const usedList = [];
    Object.keys(usedIds).forEach(id => {
        const it = virvarById[id];
        if (mxUtils.isNotNullOrUndefined(it)) {
            usedList.push(it);
        }
    });
    console.log('hasUsedPointJson 输出点位数量=', usedList.length);
    try {
        console.log('hasUsedPointJson 预览前两项=', JSON.stringify(usedList.slice(0, 2)));
    } catch (e) {
        console.log('hasUsedPointJson 预览前两项失败', e);
    }
    return JSON.stringify(usedList);
};

EditorUi.prototype.updateHasUsedPointJson = function () {
    const computedJson = this.getHasUsedPointJson();
    let computedArr = [];
    try {
        computedArr = JSON.parse(computedJson);
    } catch (e) {
        computedArr = [];
    }
    let existingArr = [];
    const existingJson = this.GLOBAL_CONFIG.device.hasUsedPointJson;
    if (existingJson && existingJson.length > 0) {
        try {
            existingArr = JSON.parse(existingJson);
        } catch (e) {
            existingArr = [];
        }
    }
    const map = {};
    const push = (it) => {
        if (mxUtils.isNotNullOrUndefined(it) && mxUtils.isNotNullOrUndefined(it.id)) {
            map[`${it.id}`] = it;
        }
    };
    for (let i = 0; i < existingArr.length; i++) push(existingArr[i]);
    for (let i = 0; i < computedArr.length; i++) push(computedArr[i]);
    const mergedArr = Object.keys(map).map(k => map[k]);
    const json = JSON.stringify(mergedArr);
    this.GLOBAL_CONFIG.device.hasUsedPointJson = json;
    try {
        const cnt = Array.isArray(JSON.parse(json)) ? JSON.parse(json).length : 0;
        console.log('更新 hasUsedPointJson 完成，数量=', cnt);
        console.log('更新 hasUsedPointJson 内容=', json);
        console.log('更新 hasUsedPointJson 解析=', JSON.parse(json));
    } catch (e) {
        console.log('更新 hasUsedPointJson 解析失败', e);
    }
};

EditorUi.prototype.refreshHasUsedPointJson = function () {
    const computedJson = this.getHasUsedPointJson();
    this.GLOBAL_CONFIG.device.hasUsedPointJson = computedJson;
    try {
        const arr = JSON.parse(computedJson);
        console.log('刷新 hasUsedPointJson 完成，数量=', Array.isArray(arr) ? arr.length : 0);
        console.log('刷新 hasUsedPointJson 内容=', computedJson);
        console.log('刷新 hasUsedPointJson 解析=', arr);
    } catch (e) {
        console.log('刷新 hasUsedPointJson 解析失败', e);
    }
};

EditorUi.prototype.mergeHasUsedPointJsonFromVirvars = function (virvarArr) {
    if (!Array.isArray(virvarArr) || virvarArr.length <= 0) return;
    let existingArr = [];
    const existingJson = this.GLOBAL_CONFIG.device.hasUsedPointJson;
    if (existingJson && existingJson.length > 0) {
        try {
            existingArr = JSON.parse(existingJson);
        } catch (e) {
            existingArr = [];
        }
    }
    const map = {};
    const push = (it) => {
        if (mxUtils.isNotNullOrUndefined(it) && mxUtils.isNotNullOrUndefined(it.id)) {
            map[`${it.id}`] = it;
        }
    };
    for (let i = 0; i < existingArr.length; i++) push(existingArr[i]);
    for (let i = 0; i < virvarArr.length; i++) {
        const v = virvarArr[i];
        if (v && v.sys === false && Array.isArray(v.points) && v.points.length > 0) {
            push(v);
        }
    }
    const mergedArr = Object.keys(map).map(k => map[k]);
    const json = JSON.stringify(mergedArr);
    this.GLOBAL_CONFIG.device.hasUsedPointJson = json;
    try {
        const cnt = Array.isArray(JSON.parse(json)) ? JSON.parse(json).length : 0;
        console.log('mergeHasUsedPointJsonFromVirvars 完成，合并数量=', cnt);
        const merged = JSON.parse(json);
        const flatPoints = merged.reduce((s, it) => {
            if (Array.isArray(it.points)) {
                it.points.forEach(p => {
                    if (p != null) s[p] = true;
                });
            }
            return s;
        }, {});
        console.log('mergeHasUsedPointJsonFromVirvars 点位数量=', Object.keys(flatPoints).length);
        console.log('mergeHasUsedPointJsonFromVirvars 内容=', json);
        console.log('mergeHasUsedPointJsonFromVirvars 解析=', JSON.parse(json));
    } catch (e) {
        console.log('mergeHasUsedPointJsonFromVirvars 解析失败', e);
    }
};

EditorUi.prototype.saveCollect = function (params, successFn, errorFun) {
    if (this.spinner.spin(document.body)) {
        api.saveCollect(params).then((res) => {
            this.spinner.stop();
            if (successFn) {
                successFn(res);
            }
        }).catch((e) => {
            this.spinner.stop();
            if (errorFun) {
                errorFun(e);
            }
        });
    }
};

EditorUi.prototype.saveVirvarJson = function (json, successFn, errorFun) {
    console.log('111111111111111')
    if (this.spinner.spin(document.body)) {
        api.saveConfigurationInfo({
            id: this.GLOBAL_CONFIG.deviceId,
            virvarJson: json,
        }).then((res) => {
            this.GLOBAL_CONFIG.device.virvarJson = json;
            this.spinner.stop();
            if (successFn) {
                successFn(res);
            }
        }).catch((e) => {
            this.spinner.stop();
            if (errorFun) {
                errorFun(e);
            }
        });
    }
};

EditorUi.prototype.saveHttpJson = function (json, successFn, errorFun) {
    console.log('33333333333333')
    if (this.spinner.spin(document.body)) {
        api.saveConfigurationInfo({
            id: this.GLOBAL_CONFIG.deviceId,
            httpjson: json,
        }).then((res) => {
            this.GLOBAL_CONFIG.device.httpjson = json;
            this.spinner.stop();
            if (successFn) {
                successFn(res);
            }
        }).catch((e) => {
            this.spinner.stop();
            if (errorFun) {
                errorFun(e);
            }
        });
    }
};

App.prototype.createBackground = function () {
    var bg = this.createDiv('background');
    bg.style.position = 'absolute';
    bg.style.background = 'white';
    bg.style.left = '0px';
    bg.style.top = '0px';
    bg.style.bottom = '0px';
    bg.style.right = '0px';
    mxUtils.setOpacity(bg, 100);
    mxClient.IS_QUIRKS && new mxDivResizer(bg);
    return bg;
};

/**
 * 文本输入框组件 Enter 键处理（下发模式）
 * 功能：在下发模式下，按 Enter 键触发反向控制，将输入值发送到绑定的点位
 * 
 * @param {mxCell} cell - 文本输入框组件
 * @param {Object} cellStyle - 组件样式配置
 * @param {string} inputValue - 用户输入的值
 */
App.prototype.handleHtmlInputEnter = function (cell, cellStyle, inputValue) {
    console.log('[文本输入框] Enter 键触发，输入值:', inputValue);

    // 获取绑定的变量配置
    const configStr = mxUtils.getValue(cellStyle, 'htmlTextInputDefaultValues', '');
    if (!configStr) {
        console.warn('[文本输入框] 未配置变量绑定');
        return;
    }

    let config;
    try {
        config = JSON.parse(decodeURIComponent(configStr));
    } catch (e) {
        console.error('[文本输入框] 解析配置失败', e);
        return;
    }

    const virvarId = config.virvarId;
    if (!virvarId) {
        console.warn('[文本输入框] 未绑定变量');
        return;
    }

    // 获取点位信息
    const pointInfo = this.getPointInfoByVirvarId(virvarId);
    if (!pointInfo) {
        console.warn('[文本输入框] 无法获取点位信息，virvarId:', virvarId);
        return;
    }

    const { pointKey, pointId, sxDeviceId } = pointInfo;

    // 构建下发数据
    const commandData = {
        key: pointKey,
        value: inputValue,
        pointId: pointId,
        sxDeviceId: sxDeviceId
    };

    const command = JSON.stringify({
        deviceId: this.GLOBAL_CONFIG.deviceId,
        type: 'changePointValue',
        data: commandData
    });

    console.log('[文本输入框] 发送反向控制指令:', command);
    this.sendReverseControlMsg(command);

    // 本地刷新数据显示
    let localData = {};
    localData[pointKey] = inputValue;
    this.doDeviceDatas(localData);
};

/**
 * 脉冲控制组件点击处理
 * 功能：点击后发送高电平信号，延迟后自动发送低电平信号复位
 * 
 * @param {mxCell} cell - 被点击的组件
 * @param {Object} cellStyle - 组件样式配置
 */
App.prototype.handlePulseControlClick = function (cell, cellStyle) {
    const cellId = cell.id;
    const graph = this.editor.graph;

    // 初始化脉冲状态管理（延迟初始化）
    if (!this._pulseState) {
        this._pulseState = {
            isPulsing: {},
            sequenceId: {},
            timers: {}
        };
    }

    // 检查是否正在执行脉冲
    if (this._pulseState.isPulsing[cellId]) {
        // this.showTemporaryMessage('脉冲执行中，请稍候...', 'info', 1500);
        return;
    }

    // 获取配置参数
    let virvarId = mxUtils.getValue(cellStyle, 'pulseTargetKey', '');

    // 尝试从 pulseControlValues 中解析 virvarId (这是数据栏绑定的正确位置)
    const pulseConfigStr = mxUtils.getValue(cellStyle, 'pulseControlValues', '');
    if (pulseConfigStr) {
        try {
            const pulseConfig = JSON.parse(decodeURIComponent(pulseConfigStr));
            if (pulseConfig && pulseConfig.virvarId) {
                virvarId = pulseConfig.virvarId;
            }
        } catch (e) {
            console.error('[脉冲控制] 解析配置失败', e);
        }
    }

    const highValue = mxUtils.getValue(cellStyle, 'pulseHighValue', '1');
    const lowValue = mxUtils.getValue(cellStyle, 'pulseLowValue', '0');
    const delay = parseInt(mxUtils.getValue(cellStyle, 'pulseDelay', '2000'), 10);
    const outputType = mxUtils.getValue(cellStyle, 'pulseOutputType', 'numeric');

    // 参数验证
    if (!virvarId) {
        this.showTemporaryMessage('请先配置目标点位', 'error');
        return;
    }

    // 根据虚拟变量ID获取完整的点位信息
    const pointInfo = this.getPointInfoByVirvarId(virvarId);
    if (!pointInfo) {
        this.showTemporaryMessage('点位配置无效，请重新选择', 'error');
        return;
    }

    const { pointKey, pointId, sxDeviceId } = pointInfo;

    // 开始脉冲序列
    this._pulseState.sequenceId[cellId] = (this._pulseState.sequenceId[cellId] || 0) + 1;
    const seqId = this._pulseState.sequenceId[cellId];
    this._pulseState.isPulsing[cellId] = true;
    this._pulseState.timers[cellId] = [];

    // 刷新显示状态
    graph.refresh(cell);

    // 发送值函数
    const sendPulseValue = (val) => {
        // 输出类型转换
        let sendVal = val;
        if (outputType === 'boolean') {
            sendVal = val == 1 || val === 'true' || val === '1' ? 'true' : 'false';
        } else {
            sendVal = String(val);
        }

        // 构建正确的下发数据格式
        const commandData = {
            key: pointKey,
            value: sendVal,
            pointId: pointId,
            sxDeviceId: sxDeviceId
        };

        const command = JSON.stringify({
            deviceId: this.GLOBAL_CONFIG.deviceId,
            type: 'changePointValue',
            data: commandData
        });

        this.sendReverseControlMsg(command);
    };

    // 1. 发送高电平（激活信号）
    sendPulseValue(highValue);
    // this.showTemporaryMessage('⚡ 脉冲信号已发送', 'success', 1500);

    // 2. 延迟后发送低电平（复位信号）
    const timer1 = setTimeout(() => {
        // 验证序列ID，防止旧定时器执行
        if (this._pulseState.sequenceId[cellId] !== seqId) {
            return;
        }

        sendPulseValue(lowValue);

        // 冗余发送确保复位（300ms后再发一次）
        const timer2 = setTimeout(() => {
            if (this._pulseState.sequenceId[cellId] !== seqId) return;
            sendPulseValue(lowValue);

            // 结束脉冲状态
            this._pulseState.isPulsing[cellId] = false;
            graph.refresh(cell);
        }, 300);

        this._pulseState.timers[cellId].push(timer2);
    }, delay);

    this._pulseState.timers[cellId].push(timer1);

    // 安全超时（防止状态锁死）
    const safetyTimer = setTimeout(() => {
        if (this._pulseState.isPulsing[cellId] && this._pulseState.sequenceId[cellId] === seqId) {
            this._pulseState.isPulsing[cellId] = false;
            graph.refresh(cell);
        }
    }, delay + 2000);

    this._pulseState.timers[cellId].push(safetyTimer);
};

/**
 * 根据虚拟变量ID获取完整的点位信息
 * 
 * @param {string|number} virvarId - 虚拟变量ID
 * @returns {Object|null} 点位信息 { pointKey, pointId, sxDeviceId } 或 null
 */
App.prototype.getPointInfoByVirvarId = function (virvarId) {
    if (!virvarId) {
        return null;
    }

    const rawData = this.GLOBAL_CONFIG?.device?.virvarJson;
    if (!rawData) {
        return null;
    }

    // 解析数据
    let virvarArray;
    if (typeof rawData === 'string') {
        try {
            virvarArray = JSON.parse(rawData);
        } catch (e) {
            return null;
        }
    } else if (Array.isArray(rawData)) {
        virvarArray = rawData;
    } else {
        return null;
    }

    // 根据虚拟变量ID查找匹配项
    const virvarIdStr = String(virvarId);
    const match = virvarArray.find(v => String(v.id) === virvarIdStr);

    if (!match) {
        return null;
    }

    // 获取 pointKey（优先从 points 数组获取，否则使用 dwkey）
    let pointKey = null;
    if (Array.isArray(match.points) && match.points.length > 0) {
        pointKey = match.points[0];
    } else if (match.dwkey) {
        pointKey = match.dwkey;
    }

    if (!pointKey) {
        return null;
    }

    // 获取 pointId 和 sxDeviceId
    const pointId = Number(match.pointId);
    const sxDeviceId = Number(match.sxDeviceId);

    if (isNaN(pointId) || isNaN(sxDeviceId)) {
        return null;
    }

    return { pointKey, pointId, sxDeviceId };
};
