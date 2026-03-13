import { mxWindow, mxUtils, mxCodec, mxEvent, mxConstants } from "../../core/mxgraph";
import { Graph } from "../Graph";
import api from "../utils/api";

export default ControlPanelDisplayDialog;

function ControlPanelDisplayDialog(app, panelOrId) {
    this.app = app;
    if (typeof panelOrId === 'object') {
        this.panel = panelOrId;
        this.panelId = panelOrId.id;
    } else {
        this.panelId = panelOrId;
        this.panel = null;
    }
}

ControlPanelDisplayDialog.prototype.show = function () {
    var self = this;

    // 优先使用传入的面板对象
    if (this.panel && this.panel.content) {
        self.createDialog(this.panel);
        return;
    }

    // 降级：通过 API 获取面板列表查找
    api.getControlPanelList().then(res => {
        if (res.data.code === 200) {
            let panels = res.data.data;
            let panel = panels.find(p => p.id === self.panelId);

            if (panel) {
                self.createDialog(panel);
            } else {
                console.error('未找到控制面板:', self.panelId);
                // 尝试从远程列表获取 (Backup)
                // 尝试从远程列表获取 (Backup)
                let scadaId = null;
                try {
                    const urlParams = new URLSearchParams(window.location.search);
                    scadaId = urlParams.get('scadaId') || urlParams.get('id') || urlParams.get('deviceId');
                } catch (e) { }

                api.getControlPanelListRemote({ pageNo: 1, pageSize: 1000, scadaId: scadaId }).then(remoteRes => {
                    // API request interceptor usually returns response.data, but handle both cases
                    let data = remoteRes.data || remoteRes;
                    let list = [];

                    if (data && (data.code === 200 || data.success)) {
                        if (data.result && Array.isArray(data.result.records)) {
                            list = data.result.records;
                        } else if (data.result && Array.isArray(data.result)) {
                            list = data.result;
                        } else if (data.data && Array.isArray(data.data)) {
                            list = data.data; // Fallback for some APIs
                        }
                    }

                    let remotePanel = list.find(p => String(p.id) === String(self.panelId));
                    if (remotePanel) {
                        self.createDialog(remotePanel);
                    } else {
                        console.warn('Backup remote fetch failed: Panel not found in list');
                        mxUtils.alert('无法加载控制面板数据');
                    }
                }).catch((e) => {
                    console.error('Backup remote fetch error:', e);
                    mxUtils.alert('无法加载控制面板数据');
                });
            }
        }
    });
};

ControlPanelDisplayDialog.prototype.createDialog = function (panel) {
    var self = this;

    // 1. 创建容器
    var container = document.createElement('div');
    container.style.overflow = 'hidden';
    container.style.background = 'transparent';
    container.style.position = 'relative';

    // 2. 创建图表容器
    var graphContainer = document.createElement('div');
    graphContainer.style.width = '1000px'; // 初始设定大尺寸用于计算边框
    graphContainer.style.height = '1000px';
    graphContainer.style.overflow = 'hidden';
    graphContainer.style.background = 'transparent';
    container.appendChild(graphContainer);

    // 3. 初始化图表 (Graph)
    // 传入主应用的样式表和主题，确保背景色和 Stencil (模版) 匹配
    var mainGraph = this.app.editor.graph;
    var graph = new Graph(graphContainer, null, null, mainGraph.getStylesheet(), mainGraph.themes);

    // 覆写光标行为
    graph.getCursorForCell = function (cell) {
        if (cell == null || graph.getModel().isRoot(cell) || graph.getModel().isLayer(cell)) {
            return null;
        }

        var style = graph.getCellStyle(cell);

        // 1. 交互元素 -> 指针光标 (手型)
        var isInteractive = (style['erchenchiType'] != null) ||
            (style['controlPanelConfig'] != null) ||
            (style['singleClickEvent'] != null) ||
            (style['doubleClickEvent'] != null) ||
            (style['rounded'] === '1' && (style['fillColor'] !== 'none' && style['fillColor'] != null)) ||
            (style['shape'] === 'hexagon') ||
            (style['cursor'] === 'pointer');

        if (isInteractive) {
            return 'pointer';
        }

        // 2. 默认/非交互元素 -> 标准箭头光标 (null)
        return null;
    };

    // 样式表覆写
    var style = graph.getStylesheet().getDefaultVertexStyle();

    // 覆写特定形状以匹配二沉池项目参考图样
    var applyCustomStyles = function (graph) {
        var stylesheet = graph.getStylesheet();

        // 1. 泳道 (面板背景)
        var laneStyle = stylesheet.getCellStyle('swimlane');
        if (laneStyle) {
            laneStyle[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = '#0a1a3c';
            laneStyle[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
            laneStyle[mxConstants.STYLE_FONTCOLOR] = '#000000';
            laneStyle[mxConstants.STYLE_STROKECOLOR] = '#1e3a6e';
        }

        // 2. 六边形 (状态指示灯 - 可交互)
        var hexStyle = stylesheet.getCellStyle('hexagon');
        if (hexStyle) {
            hexStyle[mxConstants.STYLE_FILLCOLOR] = 'none';
            hexStyle[mxConstants.STYLE_STROKECOLOR] = '#00ff00';
            hexStyle[mxConstants.STYLE_STOKREWIDTH] = '2';
            hexStyle[mxConstants.STYLE_FONTCOLOR] = '#00ff00';
            hexStyle[mxConstants.STYLE_CURSOR] = 'pointer';
        }

        // 3. 按钮 (填充色为 #1890ff 或相似颜色的圆角矩形)
        // 既然按钮可能使用通用样式，我们稍后也可以遍历单元格进行处理
    };
    applyCustomStyles(graph);

    // 禁用所有编辑和选择机制
    graph.setEnabled(true);
    graph.setCellsSelectable(false);
    graph.setCellsMovable(false);
    graph.setCellsResizable(false);
    graph.setCellsEditable(false);
    graph.setCellsDeletable(false);
    graph.setCellsCloneable(false);
    graph.setCellsDisconnectable(false);
    graph.setConnectable(false);
    graph.setDropEnabled(false);
    graph.setSplitEnabled(false);

    // 交互设置
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.panningHandler.useLeftButtonForPanning = true; // 使用左键平移

    // 确保画布背景透明，以便能透出面板容器的背景色
    graph.transparentBackground = true;

    // 4. 解析并解码 XML
    if (panel.content) {
        var doc = mxUtils.parseXml(panel.content);
        var codec = new mxCodec(doc);
        codec.decode(doc.documentElement, graph.getModel());

        // 修复背景颜色：如果未显式设置，则匹配深蓝色工业风背景
        var bg = doc.documentElement.getAttribute('background') || doc.documentElement.getAttribute('bgcolor');
        if (bg && bg !== 'none') {
            container.style.background = bg;
        } else {
            // 默认匹配二沉池项目的背景色
            container.style.background = '#0a1a3c';
        }
    } else {
        container.style.background = '#0a1a3c';
    }

    // 5. 添加点击交互
    // 5. 添加点击交互
    graph.click = function (me) {
        var cell = (me.state != null) ? me.state.cell : me.getCell();
        if (cell != null) {
            // 使用主应用的交互逻辑处理点击事件，传入当前 graph 上下文
            self.app.firePreviewMouseEvent('click', cell, graph);
        }
    };

    // 5.1 监听弹窗容器内的 Enter 键 (针对输入框反向控制)
    mxEvent.addListener(container, 'keydown', function (evt) {
        if (evt.keyCode === 13 && evt.target && evt.target.classList.contains('inputEle')) {
            // 通过查找父级 div id 恢复 cellId
            var parentDiv = evt.target.closest('.rc_custom_view_outer_div');
            if (parentDiv && parentDiv.id && parentDiv.id.startsWith('div_')) {
                var cellId = parentDiv.id.substring(4);
                var cell = graph.model.getCell(cellId);
                if (cell) {
                    // 检查是否是 mxRc_htmlInput 组件且处于下发模式 (同步 App.js 中的逻辑)
                    var cellStyle = graph.getCellStyle(cell);
                    var shapeName = mxUtils.getValue(cellStyle, 'shape');
                    var inputMode = mxUtils.getValue(cellStyle, 'inputMode', 'display');
                    var childType = mxUtils.getValue(cellStyle, 'childType', '');

                    // 仅当是独立的 mxRc_htmlInput 组件（非 inputPart）且处于 control 模式时，走新逻辑
                    if (shapeName === 'mxgraph.rc.mxRc_htmlInput' && inputMode === 'control' && childType !== 'inputPart') {
                        evt.preventDefault();
                        self.app.handleHtmlInputEnter(cell, cellStyle, evt.target.value);
                        return;
                    }

                    // 如果点击的是零件，尝试找到其触发事件的父组件
                    var triggerCell = cell;
                    // 注意：isPart 需要 graph 上下文支持，这里简化处理，通常 cell 即为目标或者通过 getCompositeParent
                    if (graph.isPart && graph.isPart(cell)) {
                        triggerCell = graph.getCompositeParent(cell);
                    }
                    console.log('[Popup] 检测到输入框 Enter 提交，触发单元格:', triggerCell.id);
                    self.app.firePreviewMouseEvent('click', triggerCell, graph);
                }
            }
        }
    });

    // 6. 映射实时数据并替换占位符（例如：序列号 SN）
    var allCells = graph.model.cells;
    var config = this.app.GLOBAL_CONFIG || {};
    var device = config.device || {};

    // 最稳健的序列号 (SN Serial) 和设备名称检测逻辑
    var snSerial = device.snSerial || device.sn || config.snSerial || config.sn || config.deviceId || device.id || 'Unknown';
    var deviceName = device.name || device.title || config.deviceName || config.deviceTitle || '未命名设备';

    console.log('控制面板显示弹窗 - 解析出的 SN:', snSerial, '设备名称:', deviceName);

    for (var id in allCells) {
        var cell = allCells[id];
        if (!graph.getModel().isRoot(cell)) {
            // A. 标准数据绑定映射
            self.app.mappingCellDprop(graph, cell);

            // B. 静态占位符文本替换
            var val = graph.getModel().getValue(cell);
            var style = graph.getCellStyle(cell);
            var isInfoBar = style['erchenchiType'] === 'infoBar';

            if (typeof val === 'string') {
                // 1. 处理占位符
                if (val.indexOf('${snSerial}') !== -1 || val.indexOf('${deviceId}') !== -1 || val.indexOf('${deviceName}') !== -1) {
                    var newVal = val.replace(/\${snSerial}/g, snSerial)
                        .replace(/\${deviceId}/g, snSerial)
                        .replace(/\${deviceName}/g, deviceName);
                    graph.getModel().setValue(cell, newVal);
                }
                // 2. 如果是信息栏但显示内容仅为 ID，则尝试补全名称
                else if (isInfoBar && val.indexOf(' ') === -1) {
                    if (self.app.deviceMap && self.app.deviceMap[val]) {
                        graph.getModel().setValue(cell, val + ' ' + self.app.deviceMap[val]);
                    } else if (val === snSerial) {
                        graph.getModel().setValue(cell, snSerial + ' ' + deviceName);
                    }
                }
                // 3. 默认占位符替换逻辑 (兼容旧版)
                else if (val === '设备名称/标题' || val === '详细信息/编号') {
                    if (val === '设备名称/标题') {
                        graph.getModel().setValue(cell, deviceName);
                    } else if (val === '详细信息/编号') {
                        graph.getModel().setValue(cell, snSerial);
                    }
                }
            }
        }
    }

    // 7. 计算边框范围并进行对齐更新
    graph.view.scaleAndTranslate(1, 0, 0);
    var bounds = graph.getGraphBounds();

    var padding = 0; // 若需要紧凑排列可移除 padding，或在这里设置极小值
    var w = Math.ceil(bounds.width);
    var h = Math.ceil(bounds.height);

    // 将内容平移至左上角 (0,0) 坐标点
    graph.view.setTranslate(-bounds.x, -bounds.y);

    // 更新容器的尺寸数据
    w = Math.max(w, 100);
    h = Math.max(h, 100);
    container.style.width = w + 'px';
    container.style.height = h + 'px';
    graphContainer.style.width = '100%';
    graphContainer.style.height = '100%';

    // 8. 创建 mxWindow 弹窗对象
    var x = (document.body.clientWidth - w) / 2;
    var y = (document.body.clientHeight - h) / 2;

    var wnd = new mxWindow(panel.name || '控制面板', container, x, y, w, h, false, true);

    // 9. 配置窗口行为属性
    wnd.minimizable = false;
    wnd.maximizable = false;
    wnd.setScrollable(false);
    wnd.setResizable(false);
    wnd.setClosable(true);

    // 10. 设置无边框窗口 (Chromeless) 的自定义样式
    if (wnd.table != null && wnd.table.rows.length > 0) {
        wnd.table.rows[0].style.display = 'none';
    }
    if (wnd.div != null) {
        wnd.div.style.boxShadow = '0 0 20px rgba(0,0,0,0.8)';
        wnd.div.style.border = '1px solid #1e3a6e';
        wnd.div.style.borderRadius = '2px'; // 采用方正的现代工业外观样式
        wnd.div.style.background = container.style.background;
    }
    if (wnd.td != null) {
        wnd.td.style.background = 'transparent';
        wnd.td.style.border = 'none';
        wnd.td.style.padding = '0px';
    }

    // 11. 在右上角集成自定义关闭按钮
    var closeBtn = document.createElement('div');
    closeBtn.innerHTML = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '8px';
    closeBtn.style.right = '10px';
    closeBtn.style.width = '24px';
    closeBtn.style.height = '24px';
    closeBtn.style.lineHeight = '24px';
    closeBtn.style.textAlign = 'center';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.color = '#333'; // 白色页眉背景下的默认按钮颜色
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10000';
    closeBtn.style.transition = 'color 0.2s';
    closeBtn.title = '关闭';

    closeBtn.onmouseover = function () { this.style.color = '#ff4d4f'; };
    closeBtn.onmouseout = function () { this.style.color = '#333'; };

    mxEvent.addListener(closeBtn, 'click', function () {
        wnd.destroy();
    });

    container.appendChild(closeBtn);

    // 12. 注册数据更新监听器，实现弹窗内容实时刷新
    var updateListener = mxUtils.bind(this, function (sender, evt) {
        // 当主应用收到新 MQTT 数据时触发
        var allCells = graph.model.cells;
        for (var id in allCells) {
            var cell = allCells[id];
            if (!graph.getModel().isRoot(cell)) {
                // 重新映射数据点值
                self.app.mappingCellDprop(graph, cell);
            }
        }
    });
    self.app.addListener('deviceDataUpdated', updateListener);

    // 窗口销毁时移除监听器，防止内存泄漏
    wnd.addListener(mxEvent.DESTROY, function () {
        self.app.removeListener(updateListener);
    });

    wnd.setVisible(true);

    // 如果内容缩放比例发生变化，则重新进行验证更新
    graph.view.revalidate();
};
