import { mxCell, mxGeometry, mxUtils, mxEvent, mxCodec, mxRectangle, mxPoint, mxGraphModel } from "../../core/mxgraph";
import { Sidebar } from "../Sidebar";
import api from "../utils/api";
import ControlPanelDisplayDialog from "../dialogs/ControlPanelDisplayDialog";

(function () {
    Sidebar.prototype.addControlPanelPalette = function (expand) {
        // 添加背景调色板
        this.addBackgroundPalette(expand);

        // 添加组件调色板
        this.addComponentPalette(expand);

        // 添加已存控制面板调色板
        this.addStoredControlPanelPalette(expand);

        // 为控制面板分割线注册自动布局监听器
        var graph = this.editorUi.editor.graph;
        if (!graph.controlPanelDividerListenerInstalled) {
            var model = graph.getModel();

            // 辅助函数：更新分割线布局
            var updateDivider = function (cell, parent) {
                if (parent == null) parent = model.getParent(cell);
                if (parent == null) return;

                var parentStyle = graph.getCellStyle(parent);
                var geo = model.getGeometry(cell);
                if (geo == null) return;

                var clone = geo.clone();

                // 检查是否在控制面板内
                if (mxUtils.getValue(parentStyle, 'ctrlPanel', '0') == '1') {
                    var parentGeo = model.getGeometry(parent);
                    if (parentGeo != null) {
                        // 根据父级宽度强制执行全宽布局
                        clone.relative = true;
                        clone.x = 0;
                        clone.width = parentGeo.width; // 使用与父级匹配的绝对像素值
                        clone.height = 3;

                        // 使用 offset.y 保持其相对于顶部的相对位置
                        // 如果已经是相对/偏移量，保持当前的 Y 轴视觉位置
                        if (!clone.offset) {
                            clone.offset = new mxPoint(0, clone.y);
                            clone.y = 0;
                        } else if (clone.y !== 0) {
                            // If y is not 0, it might have been moved manually?
                            // 标准化为 y=0, offset=Y
                            clone.offset.y += clone.y; // approximate? or just use y as offset
                            clone.y = 0;
                        }

                        model.setGeometry(cell, clone);
                    }
                } else {
                    // 在面板外部 -> 使用固定宽度
                    if (clone.relative || clone.width != 280) {
                        clone.relative = false;
                        clone.width = 280;
                        clone.height = 3;
                        if (clone.offset) {
                            clone.y = clone.offset.y;
                            clone.offset = null;
                        }
                        model.setGeometry(cell, clone);
                    }
                }
            };

            // 处理添加/移动的句柄
            var layoutHandler = function (sender, evt) {
                var cells = evt.getProperty('cells');
                if (cells == null) return;

                model.beginUpdate();
                try {
                    for (var i = 0; i < cells.length; i++) {
                        var cell = cells[i];
                        if (model.isEdge(cell)) continue;

                        var style = graph.getCellStyle(cell);
                        if (mxUtils.getValue(style, 'divider', '0') == '1') {
                            updateDivider(cell, null);
                        }
                    }
                } finally {
                    model.endUpdate();
                }
            };

            // 处理调整大小（父级被调整）的句柄
            var resizeHandler = function (sender, evt) {
                var cells = evt.getProperty('cells');
                if (cells == null) return;

                model.beginUpdate();
                try {
                    for (var i = 0; i < cells.length; i++) {
                        var parent = cells[i];
                        var childCount = model.getChildCount(parent);
                        for (var j = 0; j < childCount; j++) {
                            var child = model.getChildAt(parent, j);
                            var style = graph.getCellStyle(child);
                            if (mxUtils.getValue(style, 'divider', '0') == '1') {
                                updateDivider(child, parent);
                            }
                        }
                    }
                } finally {
                    model.endUpdate();
                }
            };

            graph.addListener(mxEvent.CELLS_ADDED, layoutHandler);
            graph.addListener(mxEvent.CELLS_MOVED, layoutHandler);
            graph.addListener(mxEvent.CELLS_RESIZED, resizeHandler);

            graph.controlPanelDividerListenerInstalled = true;
        }
    };

    Sidebar.prototype.addBackgroundPalette = function (expand) {
        var sb = this;
        var fns = [];

        // 面板容器的通用样式配置
        // verticalAlign=top: 文字置顶
        // startSize=30: 标题栏区域高度
        // swimlaneFillColor=#ffffff: 内容区域（主体）颜色
        // fillColor=#ffffff: 标题栏（页眉）颜色        // 在 mxGraph 的 swimlane 中：
        // fillColor = 标题栏背景色
        // swimlaneFillColor = 内容区域背景色
        // fontColor = 标题文字颜色

        // 基础样式：标题栏白色，文字黑色，内容区域透明/白色
        var baseStyle = 'swimlane;startSize=30;horizontal=1;collapsible=1;marginBottom=0;html=1;whiteSpace=wrap;ctrlPanel=1;verticalAlign=top;align=center;spacingTop=0;';

        // 1. 工业深蓝 (主体深色，标题栏白色)
        // 需求：“默认背景白色（用于标题），字体黑色”
        // But body should be Industrial Blue? Or whole thing white?
        // 用户提到：“标题框默认白色，字体黑色”
        // 理解为：标题栏为白色背景背景、黑色文字。主体部分为工业深蓝色。

        var s1 = baseStyle + 'fillColor=#ffffff;fontColor=#000000;swimlaneFillColor=#0a1a3c;strokeColor=#1e3a6e;fontSize=14;fontStyle=1;ctrlPanel=1;connectable=0;';
        fns.push(sb.createVertexTemplateEntry(s1, 280, 400, '面板标题', '蓝色面板', null, null, '蓝色面板'));

        // 2. 浅灰/白色 (全白)
        var s2 = baseStyle + 'fillColor=#ffffff;fontColor=#000000;swimlaneFillColor=#ffffff;strokeColor=#d9d9d9;fontSize=14;fontStyle=1;connectable=0;';
        fns.push(sb.createVertexTemplateEntry(s2, 280, 400, '面板标题', '白色面板', null, null, '白色面板'));

        // 3. 深灰色 (主体深色，标题栏白色)
        var s3 = baseStyle + 'fillColor=#ffffff;fontColor=#000000;swimlaneFillColor=#262626;strokeColor=#434343;fontSize=14;fontStyle=1;connectable=0;';
        fns.push(sb.createVertexTemplateEntry(s3, 280, 400, '面板标题', '黑色面板', null, null, '黑色面板'));

        this.addPaletteFunctions('controlPanelBackground', '控制面板-背景', expand, fns);
    };

    Sidebar.prototype.addComponentPalette = function (expand) {
        var sb = this;
        var fns = [];

        // 1. 标题栏
        var sHeader = 'text;html=1;strokeColor=none;fillColor=#ffffff;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=#000000;fontSize=14;fontStyle=1;ctrlPanel=1;connectable=0;';
        fns.push(sb.createVertexTemplateEntry(sHeader, 280, 30, '设备名称/标题', '标题栏', null, null, '标题栏'));

        // 2. 状态指示灯 (二沉池专用动态指示灯)
        var sStatus = 'shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;erchenchiType=statusIndicator;rcDprop=erchenchiStatusValues;fillColor=none;strokeColor=#ff4d4f;fontColor=#ff4d4f;strokeWidth=2;fontSize=12;fontStyle=1;ctrlPanel=1;connectable=0;';
        fns.push(sb.createVertexTemplateEntry(sStatus, 60, 50, 'STOP', '状态指示灯', null, null, '状态指示灯'));

        // 3. 操作按钮
        var sBtn = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#007bff;strokeColor=none;fontColor=#ffffff;fontSize=12;arcSize=10;ctrlPanel=1;connectable=0;';
        fns.push(sb.createVertexTemplateEntry(sBtn, 80, 32, '操作按钮', '按钮', null, null, '操作按钮'));

        // 4. 文字标签 (键名)
        var sLabel = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=#ffffff;fontSize=12;ctrlPanel=1;connectable=0;';
        fns.push(sb.createVertexTemplateEntry(sLabel, 100, 20, '参数名称', '文本标签', null, null, '文本标签'));

        // 5. 数据显示 (名称 + 数值)
        // 5. 数据显示 (升级为单组件整体，解决出框和箭头拉取问题)
        // 5. 数据显示 (升级为单组件整体，解决出框和箭头拉取问题)
        var sData = 'shape=rectangle;html=1;whiteSpace=wrap;rounded=1;strokeColor=#409EFF;fillColor=#1e4b9e;fontColor=#FFFF00;fontSize=14;fontStyle=1;align=center;verticalAlign=middle;ctrlPanel=1;connectable=0;erchenchiType=dataDisplay;dataTitle=数据显示;dataTitleFontColor=#ffffff;dataValueFontColor=#FFFF00;rcDprop=erchenchiDataValues;';
        fns.push(sb.createVertexTemplateEntry(sData, 160, 28, '0.00', '数据显示', null, null, '数据显示'));

        // 6. 区域分割线
        // 结合侧边栏手动 UI 和拖放处理程序的自定义实现方式
        fns.push(function (content) {
            // 1. 侧边栏视觉呈现 (HTML 预览)
            var div = document.createElement('div');
            div.style.cssText = 'cursor: pointer;display: inline-block;background: #FFF;width: calc(calc(100% - 10px) / 4);aspect-ratio:1;overflow:hidden;margin: 0px 0px 2px 2px;vertical-align: top;';
            div.title = '分割线';

            var inner = document.createElement('div');
            inner.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;';

            var line = document.createElement('div');
            line.style.width = '60%';
            line.style.height = '3px';
            line.style.backgroundColor = '#1890ff';
            inner.appendChild(line);
            div.appendChild(inner);

            // 2. 定义拖放放置后的单元格 (Cell)
            var cellStyle = 'shape=line;strokeWidth=3;strokeColor=#1890ff;fillColor=none;dashed=0;resizeHeight=0;divider=1;ctrlPanel=1;connectable=0;';
            var cell = new mxCell('', new mxGeometry(0, 0, 280, 3), cellStyle);
            cell.vertex = true;

            // 3. 创建自定义拖放处理句柄
            var dropHandler = function (graph, evt, target, x, y) {
                var c = cell.clone();

                // 增强的目标检测逻辑
                if (target == null) {
                    target = graph.getCellAt(x, y);
                }

                var parent = target;
                while (parent != null) {
                    if (graph.isValidDropTarget(parent, [c], evt)) {
                        break;
                    }
                    parent = graph.getModel().getParent(parent);
                }

                // 如果父级是根节点/层级，视为 null (顶级放置)
                if (parent != null && (graph.getModel().isLayer(parent) || graph.getModel().isRoot(parent))) {
                    parent = null;
                }

                // 重要：如果父级有效 (属于控制面板)，我们必须使用 graph.moveCells 或带目标的 importCells 导入单元格
                // 但此时 importCells(cells, x, y, target) 是否会自动计算相对于目标的相对坐标？
                // 问题可能在于带目标的 graph.importCells 会将目标作为新父节点，
                // 但既然 isValidDropTarget 返回了 true，我们应当相信该结果。

                graph.getModel().beginUpdate(); // 开始更新模型
                try {
                    // 导入单元格操作
                    // 当放入容器时，通常需要计算相对坐标，如果 importCells 在拖放时未能正确处理则需手动修正。
                    // 不过，侧边栏拖放传入的 x/y 通常代表屏幕/页面坐标。
                    // 实际上传递给 dropHandler 的 x,y 通常是鼠标坐标点。

                    var cells = graph.importCells([c], x, y, parent);

                    // 监听器会处理布局逻辑，但如果 parent 不为 null，必须确保单元格确实已添加到 parent 中。
                    // 如果提供了第 4 个参数，graph.importCells 会自动处理父节点的添加。

                } finally {
                    graph.getModel().endUpdate();
                }
            };

            // 4. 注册拖拽源和事件处理逻辑
            var preview = document.createElement('div');
            preview.style.border = '1px solid #1890ff';
            preview.style.width = '280px';
            preview.style.height = '2px';

            var ds = sb.createDragSource(div, dropHandler, preview, [cell], new mxRectangle(0, 0, 280, 10));

            // 添加点击组件直接添加的功能句柄
            sb.addClickHandler(div, ds, [cell]);

            // 添加 Tooltip 提示处理句柄
            if (!mxClient.IS_IOS) {
                mxEvent.addGestureListeners(div, null, mxUtils.bind(sb, function (evt) {
                    if (mxEvent.isMouseEvent(evt)) {
                        // 在预览中使用虚拟单元格以避免在预览中造成“相对”位置的混淆。
                        // 或者直接显示标准提示。
                        this.showTooltip(div, [cell], 280, 10, '分割线', true);
                    }
                }));
            }

            return div;
        });

        // 7. 信息栏 (子页眉)
        var sInfo = 'text;html=1;strokeColor=none;fillColor=#1e4b9e;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=#ffffff;fontSize=12;spacingLeft=10;ctrlPanel=1;connectable=0;erchenchiType=infoBar;';
        fns.push(sb.createVertexTemplateEntry(sInfo, 280, 24, '${snSerial} ${deviceName}', '信息栏', null, null, '信息栏'));

        // 7.5 进度滑块
        var sSlider = 'shape=mxgraph.rc.mxRc_progressSlider;whiteSpace=wrap;html=1;fillColor=#FF8800;strokeColor=none;trackColor=#505050;thumbColor=#FF9900;fontColor=#CCCCCC;sliderMin=0;sliderMax=100;sliderValue=37;showThumb=1;ctrlPanel=1;connectable=0;rcDprop=progressSliderValues;sliderTextMode=percent;';
        fns.push(sb.createVertexTemplateEntry(sSlider, 220, 40, '', '进度滑块', null, null, '进度滑块'));

        // === 新增效率组件 ===

        // 8. 圆形指示灯 (更符合常规视觉)
        // 增加默认尺寸和字体配置，解决文字超出边界问题
        var sIndicatorCircle = 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#52c41a;strokeColor=#ffffff;strokeWidth=1;align=center;verticalAlign=middle;fontColor=#ffffff;fontSize=12;ctrlPanel=1;connectable=0;erchenchiType=statusIndicator;rcDprop=erchenchiStatusValues;';
        fns.push(sb.createVertexTemplateEntry(sIndicatorCircle, 50, 50, 'RUN', '圆形指示灯', null, null, '圆形指示灯'));

        // 9. 开关切换器 (UI 模拟型 - 增强版)
        var sSwitch = 'rounded=1;whiteSpace=wrap;html=1;arcSize=50;fillColor=#2d8cf0;strokeColor=#2d8cf0;strokeWidth=1;ctrlPanel=1;connectable=0;fontColor=#ffffff;fontSize=10;align=left;spacingLeft=5;rcDprop=openCloseValues;';
        var switchCell = new mxCell('ON', new mxGeometry(0, 0, 50, 24), sSwitch);
        switchCell.vertex = true;
        // 滑块固定在右侧表示 ON
        var switchKnob = new mxCell('', new mxGeometry(1, 0, 20, 20), 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#ffffff;strokeColor=none;connectable=0;shadow=1;part=1;selectable=0;movable=0;resizable=0;');
        switchKnob.vertex = true;
        switchKnob.geometry.relative = true;
        switchKnob.geometry.offset = new mxPoint(-22, 2);
        switchCell.insert(switchKnob);
        fns.push(sb.addEntry('开关切换', function () {
            return sb.createVertexTemplateFromCells([switchCell], 50, 24, '开关切换');
        }));

        // 10. 参数设定组合 (Label + Input + Unit)
        // 本体保持透明，但增加明显的黑色边框，方便预览和操作
        var sSettingRow = 'html=1;ctrlPanel=1;connectable=0;rcDprop=singleDataBindValues;fillColor=none;strokeColor=#000000;pointerEvents=1;container=1;movable=1;rounded=0;';
        var settingCell = new mxCell('', new mxGeometry(0, 0, 260, 30), sSettingRow);
        settingCell.vertex = true;

        // 变量名零件 (像素坐标，支持递归缩放)
        var labelPart = new mxCell('设定压力', new mxGeometry(0, 0, 100, 30), 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=#FFFF00;fontSize=12;connectable=0;part=1;selectable=1;');
        labelPart.vertex = true;

        // 输入控件零件 (显示 HTML Input 形状，支持递归缩放)
        var inputPart = new mxCell('0.50', new mxGeometry(100, 2, 120, 26), 'shape=mxgraph.rc.mxRc_htmlInput;rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d9d9d9;fontColor=#333333;fontSize=12;align=center;connectable=0;part=1;selectable=1;childType=inputPart;editable=0;');
        inputPart.vertex = true;

        // 单位零件 (像素坐标，支持递归缩放)
        var unitPart = new mxCell('MPa', new mxGeometry(225, 0, 35, 30), 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=#FFFF00;fontSize=12;connectable=0;part=1;selectable=1;');
        unitPart.vertex = true;

        settingCell.insert(labelPart);
        settingCell.insert(inputPart);
        settingCell.insert(unitPart);

        fns.push(sb.addEntry('参数设定行', function () {
            return sb.createVertexTemplateFromCells([settingCell], 260, 30, '参数设定行');
        }));

        // 11. 半圆形仪表盘 (动态指针，可绑定变量)
        var sGauge = 'shape=mxgraph.rc.mxRc_gauge;html=1;whiteSpace=wrap;ctrlPanel=1;connectable=0;' +
            'gaugeMin=0;gaugeMax=100;gaugeValue=50;gaugeValueMode=raw;' +
            'dialColor=#2d3436;scaleColor=#636e72;pointerColor=#e74c3c;' +
            'normalColor=#27ae60;warningColor=#f39c12;dangerColor=#e74c3c;' +
            'warningThreshold=70;dangerThreshold=90;gaugeAlarmMode=high;' +
            'lowDangerThreshold=10;lowWarningThreshold=30;highWarningThreshold=70;highDangerThreshold=90;' +
            'showValue=1;gaugeUnit=m/s;gaugeTitle=;' +
            'fontSize=14;fontColor=#ffffff;' +
            'rcDprop=gaugeValues;';
        fns.push(sb.createVertexTemplateEntry(sGauge, 200, 120, '', '半圆仪表盘', null, null, '半圆仪表盘 Gauge'));

        this.addPaletteFunctions('controlPanelComponents', '控制面板-组件', expand, fns);
    };

    // ============================================
    // 图表组件栏目
    // ============================================
    Sidebar.prototype.addChartComponentsPalette = function (expand) {
        var sb = this;
        var fns = [];

        // 1. 趋势图 (时序数据库历史数据展示)
        // 支持配置开始时间、结束时间、设备SN，从时序数据库获取数据并显示趋势曲线
        var sTrendChart = 'shape=mxgraph.rc.mxRc_trendChart;html=1;whiteSpace=wrap;connectable=0;' +
            'trendTitle=趋势图;' +
            'trendTimeMode=realtime;trendTimePreset=hour_1;' +
            'trendStartTime=0;trendEndTime=0;' +
            'trendSnList=;' +
            'trendBgColor=#1a1a2e;trendBorderColor=#16213e;trendBorderRadius=8;' +
            'trendTitleColor=#ffffff;trendTextColor=#aaaaaa;trendGridColor=#2a2a4a;' +
            'trendShowLegend=1;trendShowTitle=1;trendShowTooltip=1;trendShowArea=1;' +
            'trendRefreshInterval=0;' +
            'rcDprop=trendChartValues;';
        fns.push(sb.createVertexTemplateEntry(sTrendChart, 400, 250, '', '趋势图', null, null, '趋势图 TrendChart 历史数据 时序'));

        this.addPaletteFunctions('chartComponents', '图表组件', expand, fns);
    };

    Sidebar.prototype.addStoredControlPanelPalette = function (expand) {
        var sb = this;
        this.addPalette('storedControlPanel', '已存控制面板', expand, function (content) {
            sb.refreshStoredControlPanels(content); // 刷新已存面板列表内容
        });
    };

    Sidebar.prototype.refreshStoredControlPanels = function (content) {
        content.innerHTML = '';
        var sb = this;

        // Search Input
        var searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'padding: 8px 10px; border-bottom: 1px solid #eee; background: #f5f5f5;';

        var searchInput = document.createElement('input');
        searchInput.setAttribute('type', 'text');
        searchInput.setAttribute('placeholder', '搜索面板名称...');
        searchInput.style.cssText = 'width: 100%; padding: 4px 8px; box-sizing: border-box; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; outline: none;';

        searchContainer.appendChild(searchInput);
        content.appendChild(searchContainer);

        // List Container
        var listContainer = document.createElement('div');
        listContainer.style.cssText = 'overflow-y: auto; max-height: 400px;';
        content.appendChild(listContainer);

        var allPanels = [];

        var renderList = function (panels) {
            listContainer.innerHTML = '';

            panels.forEach(panel => {
                var row = document.createElement('div');
                row.style.cssText = 'padding: 5px 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; height: 30px; transition: background 0.2s;';

                mxEvent.addListener(row, 'mouseenter', function () {
                    row.style.backgroundColor = '#e6f7ff';
                });
                mxEvent.addListener(row, 'mouseleave', function () {
                    row.style.backgroundColor = '';
                });

                var label = document.createElement('span');
                var sourceText = panel.source === 'remote' ? ' [后]' : ' [本]';
                label.innerText = panel.name + sourceText;
                label.style.flex = '1';
                label.style.overflow = 'hidden';
                label.style.textOverflow = 'ellipsis';
                label.style.whiteSpace = 'nowrap';
                label.style.fontSize = '12px';
                label.title = panel.name + (panel.source === 'remote' ? ' (后端存储)' : ' (本地存储)');
                if (panel.source === 'remote') label.style.color = '#1890ff';
                row.appendChild(label);

                var btnGroup = document.createElement('div');
                btnGroup.style.display = 'flex';
                btnGroup.style.alignItems = 'center';

                // Preview
                var previewBtn = document.createElement('i');
                previewBtn.className = 'rcui-icon rcui-icon-search';
                previewBtn.style.cursor = 'pointer';
                previewBtn.style.marginRight = '8px';
                previewBtn.style.fontSize = '14px';
                previewBtn.title = '预览';
                mxEvent.addListener(previewBtn, 'click', function (evt) {
                    mxEvent.consume(evt);
                    new ControlPanelDisplayDialog(sb.editorUi, panel).show();
                });
                btnGroup.appendChild(previewBtn);

                // Edit
                var editBtn = document.createElement('i');
                editBtn.className = 'rcui-icon rcui-icon-edit';
                editBtn.style.cursor = 'pointer';
                editBtn.style.marginRight = '8px';
                editBtn.style.fontSize = '14px';
                editBtn.title = '编辑 (放回画布)';
                mxEvent.addListener(editBtn, 'click', function (evt) {
                    mxEvent.consume(evt);
                    if (panel.content) {
                        var graph = sb.editorUi.editor.graph;
                        var doc = mxUtils.parseXml(panel.content);
                        var codec = new mxCodec(doc);
                        var tempModel = new mxGraphModel();
                        codec.decode(doc.documentElement, tempModel);

                        var cells = [];
                        var layer = tempModel.getChildAt(tempModel.getRoot(), 0);
                        if (layer) {
                            var childCount = tempModel.getChildCount(layer);
                            for (var i = 0; i < childCount; i++) {
                                cells.push(tempModel.getChildAt(layer, i));
                            }
                        }

                        if (cells.length > 0) {
                            graph.getModel().beginUpdate();
                            try {
                                var importedCells = [];
                                // 根据现有的控制面板计算偏移量以防止重叠
                                var parent = graph.getDefaultParent();
                                var childCells = graph.getChildCells(parent);
                                var panelCount = 0;
                                if (childCells) {
                                    for (var k = 0; k < childCells.length; k++) {
                                        var style = graph.getCellStyle(childCells[k]);
                                        if (mxUtils.getValue(style, 'ctrlPanel', '0') == '1') {
                                            panelCount++;
                                        }
                                    }
                                }
                                var dx = panelCount * 20;
                                var dy = panelCount * 20;

                                importedCells = graph.importCells(cells, dx, dy);
                                if (importedCells && importedCells.length > 0) {
                                    for (var i = 0; i < importedCells.length; i++) {
                                        var cell = importedCells[i];
                                        var style = graph.getCellStyle(cell);
                                        if (mxUtils.getValue(style, 'ctrlPanel', '0') == '1') {
                                            graph.setCellStyles('panelId', panel.id, [cell]);
                                            graph.setCellStyles('panelSource', panel.source, [cell]);
                                            graph.setCellStyles('originalPanelName', panel.name, [cell]);
                                            if (panel.panelId) {
                                                graph.setCellStyles('remotePanelId', panel.panelId, [cell]);
                                            }
                                            break;
                                        }
                                    }
                                }
                                graph.setSelectionCells(importedCells);
                            } finally {
                                graph.getModel().endUpdate();
                            }
                        }
                    }
                });
                btnGroup.appendChild(editBtn);

                // Delete
                var deleteBtn = document.createElement('i');
                deleteBtn.className = 'rcui-icon rcui-icon-delete';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontSize = '14px';
                deleteBtn.title = '删除';
                mxEvent.addListener(deleteBtn, 'click', function (evt) {
                    mxEvent.consume(evt);
                    if (confirm('确定删除该控制面板吗？')) {
                        if (panel.source === 'remote') {
                            api.deleteControlPanelRemote({ id: panel.id }).then(res => {
                                // Remote API returns unwrapped data
                                if (res && res.code === 200) {
                                    sb.refreshStoredControlPanels(content);
                                } else {
                                    mxUtils.alert((res && res.message) || '删除失败');
                                }
                            });
                        } else {
                            api.deleteControlPanel(panel.id).then(res => {
                                if (res.data.code === 200) {
                                    sb.refreshStoredControlPanels(content);
                                }
                            });
                        }
                    }
                });
                btnGroup.appendChild(deleteBtn);

                row.appendChild(btnGroup);
                listContainer.appendChild(row);
            });

            if (panels.length === 0) {
                var empty = document.createElement('div');
                empty.innerText = '暂无相关面板';
                empty.style.padding = '10px';
                empty.style.color = '#999';
                empty.style.textAlign = 'center';
                empty.style.fontSize = '12px';
                listContainer.appendChild(empty);
            }
        };

        mxEvent.addListener(searchInput, 'input', function () {
            var keyword = searchInput.value.toLowerCase().trim();
            var filtered = allPanels.filter(p => p.name.toLowerCase().indexOf(keyword) > -1);
            renderList(filtered);
        });

        // Load Data
        var loadLocal = api.getControlPanelList().then(res => {
            return res.data.code === 200 ? res.data.data.map(function (p) { p.source = 'local'; return p; }) : [];
        });

        // Robustly get query param from search or hash
        var getQueryParam = function (name) {
            var reg = new RegExp('(^|&|\\?)' + name + '=([^&]*)(&|$)');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            // Try hash if not found in search
            var hash = window.location.hash;
            var qIndex = hash.indexOf('?');
            if (qIndex > -1) {
                r = hash.substring(qIndex + 1).match(reg);
                if (r != null) return unescape(r[2]);
            }
            return null;
        };

        var scadaId = getQueryParam('scadaId') || getQueryParam('id') || getQueryParam('deviceId');
        console.log('Sidebar: Extracted scadaId:', scadaId);
        var loadRemote;
        if (scadaId) {
            loadRemote = api.getControlPanelListRemote({ pageNo: 1, pageSize: 1000, scadaId: scadaId }).then(res => {
                console.log('Remote Control Panel List Response:', res);
                // API Request interceptor returns response.data directly.
                // So 'res' is the payload.
                var list = [];
                // Check res.code or res.success directly
                if (res && (res.code === 200 || res.success)) {
                    if (res.result && Array.isArray(res.result.records)) {
                        list = res.result.records;
                    } else if (res.result && Array.isArray(res.result)) {
                        list = res.result;
                    } else if (Array.isArray(res)) {
                        // Fallback if res itself is the array
                        list = res;
                    }
                }
                return list.map(function (p) {
                    p.source = 'remote';
                    p.id = String(p.id);
                    return p;
                });
            }).catch(function (err) {
                console.error('Remote Control Panel List Error:', err);
                return [];
            });
        } else {
            loadRemote = Promise.resolve([]);
        }

        Promise.all([loadLocal, loadRemote]).then(results => {
            allPanels = results[0].concat(results[1]);
            renderList(allPanels);
        });
    };
})();
