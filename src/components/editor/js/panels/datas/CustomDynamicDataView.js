import { mxEventObject, mxUtils, mxResources } from "../../../core/mxgraph";
import BaseFormatPanel from "../BaseFormatPanel";
import api from '../../utils/api';
import FilenameDialog from '../../dialogs/FilenameDialog';

import { StaticPointPropMap, StaticStylePropMap } from './StaticPropMap';

import CustomDynamicDataPanel from './dynamic/CustomDynamicDataPanel';

export default CustomDynamicDataView;

function CustomDynamicDataView(format) {
    const container = this.createTag('div', 'rcui-style-panel');
    BaseFormatPanel.call(this, format, format.editorUi, container);
    container.style.cssText = `border-bottom: 1px solid #CCCCCC;`;
    this.init();
}

// 设置值时的类型 控制用什么控件 integer: [input:type=number|正则integer] number: [input:type=number|小数正则] text: [input:type=text]

mxUtils.extend(CustomDynamicDataView, BaseFormatPanel);

CustomDynamicDataView.prototype.init = function () {
    // 定义完整的分类配置
    const defaultCategories = [
        { category: 'erchenchi', title: '二沉池', collapse: false },
        { category: 'data', title: '数据', collapse: false },
        { category: 'style', title: '外观', collapse: true },
        { category: 'anim', title: '动画', collapse: true },
        { category: 'event', title: '事件', collapse: true },
        { category: 'script', title: '脚本', collapse: true },
    ];

    // 如果数组不存在，则初始化
    if (mxUtils.isNullOrUndefined(this.format.customDynamicDataCategoryArr)) {
        this.format.customDynamicDataCategoryArr = defaultCategories.map(cat => ({ ...cat }));
    } else {
        // 如果数组存在但不完整，补充缺失的分类，但保留已有的折叠状态
        const existingCategories = this.format.customDynamicDataCategoryArr;
        const existingCategoryMap = {};
        existingCategories.forEach(cat => {
            existingCategoryMap[cat.category] = cat;
        });

        // 补充缺失的分类，保留已有的折叠状态
        // 注意：这里需要确保 erchenchi 在最前面，如果已经存在但位置不对，可能需要重新排序
        // 简单起见，我们先补充确实的，如果 erchenchi 缺失，会被添加到最后
        defaultCategories.forEach(defaultCat => {
            if (!existingCategoryMap[defaultCat.category]) {
                existingCategories.push({ ...defaultCat });
            }
        });

        // 强制确保 erchenchi 在最前面 (如果它存在于数组中)
        const erchenchiIndex = existingCategories.findIndex(c => c.category === 'erchenchi');
        if (erchenchiIndex > 0) {
            const erchenchiItem = existingCategories.splice(erchenchiIndex, 1)[0];
            existingCategories.unshift(erchenchiItem);
        }
    }

    this.format.customDynamicDataCategoryArr.map(item => {
        // 如果是二沉池分类，但当前选中的图元不包含erchenchiValues属性，则不创建该分类面板
        if (item.category === 'erchenchi') {
            const ss = this.editorUi.getSelectionState();
            const graph = this.editorUi.editor.graph;
            if (ss.cells && ss.cells.length > 0) {
                let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
                let rcDprop = mxUtils.getValue(cellStyle, 'rcDprop', '');
                if (!rcDprop || rcDprop.indexOf('erchenchiValues') === -1) {
                    return;
                }
            } else {
                return;
            }
        }
        this.createCategoryCollapsePanel(item);
    });

    const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;
    // console.log('CustomDynamicDataView---graph', graph);
    let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
    this.cellId = ss.cells[0].getId();
    // console.log('CustomDynamicDataView---cellId', this.cellId);
    let shape = cellStyle.shape;
    this.chartOption = cellStyle.chartOption
    // console.log('CustomDynamicDataView---init', cellStyle);
    let dpropArr = [];
    if (ss.cells && ss.cells.length === 1 && ss.vertices && ss.vertices.length === 1) {
        try {
            // 是vertice
            let rcDprop = mxUtils.getValue(cellStyle, 'rcDprop', null);
            if (mxUtils.isNotNullOrUndefined(rcDprop) && rcDprop.trim().length > 0) {
                rcDprop = rcDprop.trim().split(',');
                if (rcDprop.length > 0) {
                    dpropArr.push(...rcDprop);
                }
            }
        } catch (e) {
            console.log(e);
        }

        let rcCommonDprops = [
            'commonVisible', 'commonRotateAnim', 'commonTwinkleAnim',
            'commonStrokeColor', 'commonFontColor', 'commonTextValues',
            'singleClickEvent', 'doubleClickEvent'
        ];
        // 自定义组件 才注入脚本模块
        if (shape === 'mxgraph.rc.mxDynamicChart') {
            rcCommonDprops.push('commonScript')
        }

        if (mxUtils.isNotNullOrUndefined(cellStyle.igDprop)) {
            const ignoreArr = cellStyle.igDprop.split(',');
            rcCommonDprops = rcCommonDprops.filter(item => ignoreArr.indexOf(item) === -1);
        }
        dpropArr.push(...rcCommonDprops);
    } else if (ss.cells && ss.cells.length === 1 && ss.edges && ss.edges.length === 1 && ss.lineJumps) {
        if (cellStyle.enableFlow == '1') {
            dpropArr.push(...['flowStateValues', 'commonVisible']);
        } else {
            dpropArr.push(...['commonVisible']);
        }
    }
    this.loadDpropWithArray(ss, dpropArr);
}

CustomDynamicDataView.prototype.loadDpropWithArray = function (ss, rcDprop) {
    const graph = this.editorUi.editor.graph;
    let cellStyle = graph.getCellStyle(ss.cells[0]);
    // console.log('loadDpropWithArray--ss', ss);
    for (let i = 0; i < rcDprop.length; i++) {
        let key = rcDprop[i];
        let prop = mxUtils.getValue(cellStyle, key, null);
        if (mxUtils.isNullOrUndefined(prop)) {
            prop = JSON.parse(JSON.stringify(StaticPointPropMap[key]));
        } else {
            prop = JSON.parse(decodeURIComponent(prop));
        }
        // 如果这个组件的数据tab包括脚本模块
        // 说明是自定义组件
        if (key === 'commonScript') {
            // 注入原始chartOption
            prop.chartOption = this.chartOption;
            // 同时注入当前组件的id，即this.cellId
            prop.cellId = this.cellId;
        }
        // 安全检查：如果 prop 缺少 category，从 StaticPointPropMap 获取默认值
        if (prop && !prop.category && StaticPointPropMap[key]) {
            prop.category = StaticPointPropMap[key].category;
        }
        if (mxUtils.isNotNullOrUndefined(prop)) {
            // console.log('loadDpropWithArray--prop', prop, key);
            this.genCellWithProp(prop);
        }
    }
}

CustomDynamicDataView.prototype.genCellWithProp = function (prop) {
    // 安全检查：确保 prop 和 category 存在
    if (!prop || !prop.category) {
        console.warn('Invalid prop or missing category:', prop);
        return;
    }

    // 安全检查：确保对应的 collapse body 存在
    const collapseBodyKey = `${prop.category}CollapseBody`;
    const collapseKey = `${prop.category}Collapse`;

    if (!this[collapseBodyKey]) {
        // 如果是二沉池属性，但当前不在二沉池面板模式下（例如普通图元），则不显示
        if (prop.category === 'erchenchi') {
            return;
        }
        console.warn(`Missing collapse body for category: ${prop.category}. Available categories: erchenchi, data, style, anim, event, script`);
        return;
    }

    const dataPanel = new CustomDynamicDataPanel(this.format, prop);
    if (mxUtils.isNotNullOrUndefined(prop.props) && prop.props.length > 0) {
        let propPropertyContainer = this.createTag('div');
        propPropertyContainer.style.cssText = `padding: 10px 10px 0 10px;box-sizing: border-box;margin:0px;border:none;display:flex;flex-direction: column;`;
        dataPanel.container.appendChild(propPropertyContainer);
        for (let i = 0; i < prop.props.length; i++) {
            let propProperty = JSON.parse(JSON.stringify(StaticStylePropMap[prop.props[i]]));
            if (mxUtils.isNotNullOrUndefined(propProperty)) {
                this.genPropertyViewWithProp(propPropertyContainer, propProperty);
            }
        }
    }

    mxUtils.removeStyleClass(this[collapseKey], 'rcui-hide');
    this[collapseBodyKey].appendChild(dataPanel.container);
};

CustomDynamicDataView.prototype.genPropertyViewWithProp = function (container, prop) {
    const ss = this.editorUi.getSelectionState();
    const graph = this.editorUi.editor.graph;

    if (prop.type === 'image') {
        let setImgRow = this.createLabelCellRowPicture(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        container.appendChild(setImgRow.root);
    } else if (prop.type === 'select') {
        let setSelectCellRow = this.createLabelCellRowSelect(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            // 特殊处理：如果是趋势图时间范围选择
            if (prop.key === 'trendTimePreset') {
                // 联动隐藏/显示自定义时长输入框
                let sibling = container.querySelector('[data-prop-key="trendCustomDuration"]');
                if (sibling) {
                    if (value.key === 'custom') {
                        sibling.style.display = 'block';
                    } else {
                        sibling.style.display = 'none';
                    }
                }

                // 如果选择自定义，弹出时长设置对话框
                if (value.key === 'custom') {
                    var dlg = new FilenameDialog(this.editorUi, "3600", mxResources.get('apply'), mxUtils.bind(this, function (newValue) {
                        var durationNum = parseInt(newValue);
                        if (!isNaN(durationNum) && durationNum > 0) {
                            graph.getModel().beginUpdate();
                            try {
                                graph.setCellStyles('trendCustomDuration', durationNum, ss.cells);
                            } finally {
                                graph.getModel().endUpdate();
                            }
                        } else {
                            mxUtils.alert('请输入有效的秒数');
                        }
                    }), '自定义时长(秒)');
                    this.editorUi.showDialog(dlg.container, 300, 80, true, true);
                }
            }

            // 特殊处理：如果是趋势图时间模式选择
            if (prop.key === 'trendTimeMode') {
                let showHistory = (value.key === 'history');
                let startTimeRow = container.querySelector('[data-prop-key="trendStartTime"]');
                let endTimeRow = container.querySelector('[data-prop-key="trendEndTime"]');
                let presetRow = container.querySelector('[data-prop-key="trendTimePreset"]');
                let customRow = container.querySelector('[data-prop-key="trendCustomDuration"]');
                let refreshRow = container.querySelector('[data-prop-key="trendRefreshInterval"]');

                // 历史模式：显示具体起止时间，隐藏预设时间
                // 实时模式：显示预设时间，隐藏具体起止时间
                if (startTimeRow) startTimeRow.style.display = showHistory ? 'flex' : 'none';
                if (endTimeRow) endTimeRow.style.display = showHistory ? 'flex' : 'none';

                // 假设select row是flex或block，这里用unsetting可能更安全，或者flex
                // createLabelCellRowSelect 生成的容器没有显式设置cssText?? 没看到。通常是div.
                // 假设它是默认样式(block)或flex。
                if (presetRow) presetRow.style.display = showHistory ? 'none' : '';
                if (refreshRow) refreshRow.style.display = showHistory ? 'none' : '';

                // 联动自定义时长输入框
                if (showHistory) {
                    if (customRow) customRow.style.display = 'none';
                } else {
                    // 切换回实时模式，需要检查当前preset值
                    let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
                    let preset = mxUtils.getValue(cellStyle, 'trendTimePreset', 'hour_1');
                    if (preset === 'custom' && customRow) {
                        customRow.style.display = 'block';
                    }
                }
            }

            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value.key, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value.key], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));

        // 设置属性Key标识
        setSelectCellRow.root.setAttribute('data-prop-key', prop.key);

        // 初始状态处理
        if (prop.key === 'trendTimePreset' || prop.key === 'trendRefreshInterval') {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            let timeMode = mxUtils.getValue(cellStyle, 'trendTimeMode', 'realtime');
            if (timeMode === 'history') {
                setSelectCellRow.root.style.display = 'none';
            }
        }

        container.appendChild(setSelectCellRow.root);
    } else if (prop.type === 'input') {
        let setSelectCellRow = this.createLabelCellRowInput(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, prop.defVal || null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));

        // 设置属性Key标识
        setSelectCellRow.root.setAttribute('data-prop-key', prop.key);

        // 特殊处理：trendCustomDuration 初始显示状态
        if (prop.key === 'trendCustomDuration') {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            let preset = mxUtils.getValue(cellStyle, 'trendTimePreset', 'hour_1');
            if (preset !== 'custom') {
                setSelectCellRow.root.style.display = 'none';
            }

            // 显示换算后的天小时分钟秒
            setSelectCellRow.root.style.flexWrap = 'wrap';

            let hintDiv = document.createElement('div');
            hintDiv.style.cssText = 'width:100%;font-size:11px;color:#999;margin-top:2px;text-align:right;';
            setSelectCellRow.root.appendChild(hintDiv);

            let inputEl = setSelectCellRow.root.querySelector('textarea, input'); // createLabelCellRowInput通常使用textarea或input
            if (inputEl) {
                const updateHint = (val) => {
                    let seconds = parseInt(val);
                    if (!isNaN(seconds)) {
                        let d = Math.floor(seconds / (3600 * 24));
                        let h = Math.floor((seconds % (3600 * 24)) / 3600);
                        let m = Math.floor((seconds % 3600) / 60);
                        let s = Math.floor(seconds % 60);
                        let str = '';
                        if (d > 0) str += d + '天';
                        if (h > 0) str += h + '小时';
                        if (m > 0) str += m + '分';
                        if (s > 0 || str === '') str += s + '秒';
                        hintDiv.innerText = str;
                    } else {
                        hintDiv.innerText = '';
                    }
                };
                mxEvent.addListener(inputEl, 'input', function () {
                    updateHint(inputEl.value);
                });
                // 初始显示
                updateHint(inputEl.value);
            }
        }

        container.appendChild(setSelectCellRow.root);
    } else if (prop.type === 'switch') {
        let setSwitchCellRow = this.createLabelCellRowSwitch(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, '0') == '1';
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                let val = value ? '1' : '0';
                graph.setCellStyles(prop.key, val, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [val], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        container.appendChild(setSwitchCellRow.root);
    } else if (prop.type === 'color') {
        let setColorCellRow = this.createLabelCellRowColor(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, prop.defVal || null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        container.appendChild(setColorCellRow.root);
    } else if (prop.type === 'textarea') {
        let setTextareaRow = this.createLabelCellRowTextarea(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, '');
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));

                // 特殊逻辑：如果是变量列表，自动更新图元显示的文本
                if (prop.key === 'monitorVarList') {
                    let lines = value.split('\n');
                    let displayContent = lines.map(line => {
                        line = line.trim();
                        if (!line) return null;
                        // 如果已经包含了冒号，就不加了，否则加上默认值
                        if (line.indexOf(':') > -1) return line;
                        return `${line}: 0.00`;
                    }).filter(s => s).join('\n');
                    graph.model.setValue(ss.cells[0], displayContent);
                }
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        container.appendChild(setTextareaRow.root);
    } else if (prop.type === 'deviceSelect') {
        let row = this.createLabelCellRowDeviceSelect(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        container.appendChild(row.root);
    } else if (prop.type === 'header') {
        let header = document.createElement('div');
        header.style.cssText = `margin-top: 10px; margin-bottom: 5px; font-weight: bold; font-size: 13px; color: #333; border-bottom: 1px solid #EEE; padding-bottom: 3px;`;
        header.innerText = prop.name;
        container.appendChild(header);
    } else if (prop.type === 'datetime') {
        let setDatetimeRow = this.createLabelCellRowDatetime(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, prop.defVal || null);
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));

        // 设置属性Key标识
        setDatetimeRow.root.setAttribute('data-prop-key', prop.key);

        // 初始状态显示控制：如果是在实时模式，隐藏开始时间和结束时间
        if (prop.key === 'trendStartTime' || prop.key === 'trendEndTime') {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            let timeMode = mxUtils.getValue(cellStyle, 'trendTimeMode', 'realtime');
            if (timeMode === 'realtime') {
                setDatetimeRow.root.style.display = 'none';
            }
        }

        container.appendChild(setDatetimeRow.root);
    } else if (prop.type === 'varselect') {
        // 变量选择控件：从已配置的rcVariableList中选择变量
        let setVarSelectRow = this.createLabelCellRowVarSelect(prop.name, prop.config, mxUtils.bind(this, function () {
            let cellStyle = mxUtils.getCellStyleWithStr(graph.getModel().getStyle(ss.cells[0]));
            return mxUtils.getValue(cellStyle, prop.key, '');
        }), mxUtils.bind(this, function (value) {
            if (graph.isEditing()) {
                graph.stopEditing(true);
            }
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(prop.key, value, ss.cells);
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [prop.key], 'values', [value], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
        container.appendChild(setVarSelectRow.root);
    }
};

CustomDynamicDataView.prototype.createLabelCellRowDatetime = function (label, config, getValueFn, setValueFn) {
    const div = document.createElement('div');
    div.className = 'rcui-line-row';
    div.style.cssText = 'display:flex;align-items:center;margin-bottom:10px;padding:0 10px;';

    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = 'width:60px;font-size:12px;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    labelDiv.innerText = label;
    labelDiv.title = label;
    div.appendChild(labelDiv);

    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.title = "更改时间后，请点击右侧确认按钮以应用更改";
    // 设置步骤为1秒，允许选择秒（如果需要），或者设为60秒
    // config.step 可以从配置中获取，默认60
    input.step = config.step || 60;
    input.style.cssText = 'flex:1;height:24px;line-height:24px;border:1px solid #dcdfe6;border-radius:4px;padding:0 5px;font-size:12px;color:#606266;outline:none;min-width:0;font-family:inherit;';

    // 获取当前值 (时间戳字符串)，并转换为 datetime-local 格式
    const tsStr = getValueFn();
    if (tsStr && tsStr !== '0') {
        const ts = parseInt(tsStr);
        if (!isNaN(ts)) {
            const date = new Date(ts);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            // 如果 step < 60，可能需要秒
            input.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }

    mxEvent.addListener(input, 'change', function () {
        // change时不再自动触发保存，需点击确认按钮
    });

    div.appendChild(input);

    const confirmBtn = document.createElement('div');
    confirmBtn.innerText = '√';
    confirmBtn.title = mxResources.get('apply') || '应用';
    confirmBtn.style.cssText = 'width:24px;height:24px;line-height:24px;text-align:center;cursor:pointer;background:#f0f0f0;border-radius:4px;margin-left:5px;flex-shrink:0;color:#333;font-weight:bold;';

    confirmBtn.onmouseenter = function () { this.style.backgroundColor = '#e0e0e0'; };
    confirmBtn.onmouseleave = function () { this.style.backgroundColor = '#f0f0f0'; };

    mxEvent.addListener(confirmBtn, 'click', function () {
        const val = input.value;
        if (val) {
            const date = new Date(val);
            const ts = date.getTime();
            if (!isNaN(ts)) {
                setValueFn(ts.toString());
            }
        } else {
            setValueFn('0');
        }
    });

    div.appendChild(confirmBtn);

    return { root: div };
};

CustomDynamicDataView.prototype.createLabelCellRowDeviceSelect = function (label, config, getter, setter) {
    var root = document.createElement('div');
    root.style.cssText = 'display:flex;align-items:center;margin-bottom:10px;padding:0 10px;';

    var labelDiv = document.createElement('div');
    labelDiv.style.cssText = 'width:60px;font-size:12px;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    labelDiv.innerText = label;
    labelDiv.title = label;
    root.appendChild(labelDiv);

    var select = document.createElement('select');
    select.style.cssText = 'flex:1;height:24px;line-height:24px;border:1px solid #dcdfe6;border-radius:4px;padding:0 5px;font-size:12px;color:#606266;outline:none;min-width: 0;';

    // 添加默认选项
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = config.placeholder || '请选择设备';
    select.appendChild(defaultOption);

    // 获取当前值
    var val = getter();

    // 异步加载设备列表
    // 优先尝试 getDeviceList，如果失败或无数据，降级使用 getDeviceNameList
    const loadFromList = () => {
        return api.getDeviceList({ pageNo: 1, pageSize: 1000 }).then(res => {
            if (res.code === 200 && res.result && res.result.records) {
                return res.result.records.map(device => ({
                    // 关键修改：Value 必须存数据库 ID，用于后续 API 调用
                    // Label 显示名称和序列号，方便用户识别
                    value: device.id,
                    label: device.name + ((device.snSerial || device.code) ? ` (${device.snSerial || device.code})` : '')
                }));
            }
            return null;
        });
    };

    const loadFromNameList = () => {
        return api.getDeviceNameList().then(res => {
            if (res.code === 200 && (res.result || res.data)) { // 兼容 res.result 和 res.data
                const list = res.result || res.data;
                return list.map(device => ({
                    value: device.snSerial || device.key || device.code || device.id, // 尝试获取 snSerial，没有则用 key/code/id
                    label: (device.title || device.name) + ((device.key || device.code) ? ` (${device.key || device.code})` : '')
                }));
            }
            return [];
        });
    };

    loadFromList().then(options => {
        if (!options) {
            return loadFromNameList();
        }
        return options;
    }).then(options => {
        if (options && options.length > 0) {
            options.forEach(opt => {
                var option = document.createElement('option');
                option.value = opt.value;
                option.text = opt.label;
                select.appendChild(option);
            });
            // 列表加载完成后设置选中值
            if (val != null) {
                select.value = val;
            }
        } else {
            defaultOption.text = '无可用设备';
        }
    }).catch(e => {
        console.error('加载设备列表失败', e);
        defaultOption.text = '加载失败';
    });

    mxEvent.addListener(select, 'change', function () {
        setter(select.value);
    });

    root.appendChild(select);

    return { root: root };
};

CustomDynamicDataView.prototype.createLabelCellRowTextarea = function (label, config, getValueFn, setValueFn) {
    const div = document.createElement('div');
    div.className = 'rcui-line-row';
    div.style.display = 'block';
    div.style.height = 'auto';
    div.style.marginBottom = '10px';

    const labelDiv = document.createElement('div');
    labelDiv.innerText = label;
    labelDiv.style.marginBottom = '5px';
    labelDiv.style.color = '#333';
    labelDiv.style.fontSize = '12px';
    div.appendChild(labelDiv);

    const textarea = document.createElement('textarea');
    textarea.rows = config.rows || 3;
    textarea.placeholder = config.placeholder || '';
    textarea.style.width = '100%';
    textarea.style.boxSizing = 'border-box';
    textarea.style.resize = 'vertical';
    textarea.style.border = '1px solid #dcdcdc';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '5px';
    textarea.style.fontFamily = 'inherit';
    textarea.style.fontSize = '12px';
    textarea.style.lineHeight = '1.5';

    textarea.value = getValueFn() || '';

    mxEvent.addListener(textarea, 'change', function () {
        setValueFn(textarea.value);
    });

    div.appendChild(textarea);

    return { root: div };
};

CustomDynamicDataView.prototype.createCategoryCollapsePanel = function (collapse) {
    let category = collapse.category;
    this[`${category}Collapse`] = this.createTag('div', 'rcui-dynamic-data-collapse rcui-hide');
    this[`${category}CollapseHead`] = this.createTag('div', 'rcui-dynamic-data-collapse-head');
    this[`${category}CollapseBody`] = this.createTag('div', 'rcui-dynamic-data-collapse-body');
    this[`${category}Collapse`].appendChild(this[`${category}CollapseHead`]);
    this[`${category}Collapse`].appendChild(this[`${category}CollapseBody`]);
    let collapseHead = this[`${category}CollapseHead`];
    let collapseBody = this[`${category}CollapseBody`];
    let bodyShowOrHide = !collapse.collapse;
    if (bodyShowOrHide) {
        mxUtils.removeStyleClass(collapseBody, 'rcui-hide');
    } else {
        mxUtils.addStyleClass(collapseBody, 'rcui-hide');
    }
    //layui-icon-triangle-d rcui-icon-triangle-r
    collapseHead.innerHTML = `
    <div style="flex: 1">${collapse.title}</div>
    <div><i class="rcui-icon rcui-icon-triangle-${bodyShowOrHide ? 'd' : 'r'}"></i></div>
    `;
    this.container.appendChild(this[`${category}Collapse`]);
    mxEvent.addListener(collapseHead, 'click', mxUtils.bind(this, function (evt) {
        if (!collapse.collapse) {
            collapse.collapse = true;
            mxUtils.addStyleClass(collapseBody, 'rcui-hide');
            mxUtils.addStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-r');
            mxUtils.removeStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-d');
        } else {
            collapse.collapse = false;
            mxUtils.removeStyleClass(collapseBody, 'rcui-hide');
            mxUtils.removeStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-r');
            mxUtils.addStyleClass(collapseHead.querySelector('i.rcui-icon'), 'rcui-icon-triangle-d');
        }
    }));
};

/**
 * 创建变量选择控件
 * 从已配置订阅的虚拟变量(virvarJson)中选择，存储关联的dwkey（属性名）
 */
CustomDynamicDataView.prototype.createLabelCellRowVarSelect = function (label, config, getValueFn, setValueFn) {
    const div = document.createElement('div');
    div.className = 'rcui-line-row';
    div.style.cssText = 'display:flex;align-items:center;margin-bottom:10px;padding:0 10px;';

    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = 'width:80px;font-size:12px;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    labelDiv.innerText = label;
    labelDiv.title = label;
    div.appendChild(labelDiv);

    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = 'flex:1;display:flex;align-items:center;gap:5px;';

    const input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.style.cssText = 'flex:1;height:24px;line-height:24px;border:1px solid #dcdfe6;border-radius:4px;padding:0 8px;font-size:12px;color:#606266;background:#f5f7fa;cursor:pointer;min-width:0;';
    input.placeholder = config.placeholder || '点击选择变量';

    // 获取已配置的虚拟变量列表
    const getVirvarList = mxUtils.bind(this, function () {
        const json = this.editorUi.GLOBAL_CONFIG.device && this.editorUi.GLOBAL_CONFIG.device.virvarJson
            ? this.editorUi.GLOBAL_CONFIG.device.virvarJson : null;
        return json && json.length > 0 ? JSON.parse(json) : [];
    });

    // 根据dwkey查找变量名
    const findVarNameByKey = mxUtils.bind(this, function (dwkey) {
        const virvarList = getVirvarList();
        for (const v of virvarList) {
            if (v.points && v.points.includes(dwkey)) {
                return v.name;
            }
        }
        return dwkey;
    });

    // 获取当前值并显示
    const currentValue = getValueFn();
    if (currentValue) {
        const selectedKeys = currentValue.split(',').map(s => s.trim()).filter(s => s);
        const displayNames = selectedKeys.map(key => findVarNameByKey(key));
        input.value = displayNames.join(', ');
        input.title = currentValue;
    }

    inputWrapper.appendChild(input);

    const selectBtn = document.createElement('div');
    selectBtn.className = 'rcui-btn rcui-btn-sm rcui-bg-blue';
    selectBtn.style.cssText = 'padding:0 10px;height:24px;line-height:24px;font-size:12px;cursor:pointer;';
    selectBtn.innerText = '选择';
    inputWrapper.appendChild(selectBtn);

    div.appendChild(inputWrapper);

    // 点击选择按钮或输入框打开选择对话框
    const openSelectDialog = mxUtils.bind(this, function () {
        const virvarList = getVirvarList();

        if (virvarList.length === 0) {
            mxUtils.alert('未配置订阅变量，请先在"配置虚拟变量"中添加并保存变量');
            return;
        }

        // 获取当前已选中的dwkey列表
        const currentValue = getValueFn();
        const rawSelectedKeys = currentValue ? currentValue.split(',').map(s => s.trim()).filter(s => s) : [];

        // 过滤掉不在当前 virvarList 中的 key (清洗脏数据，如遗留的默认值)
        const selectedKeys = rawSelectedKeys.filter(key => {
            // 检查该 key 是否属于任何一个已配置的虚拟变量 (检查 points 数组或 id)
            return virvarList.some(v => {
                return (v.points && v.points.includes(key)) || v.id === key;
            });
        });

        const selectedSet = new Set(selectedKeys);

        // 创建对话框
        const dialogWidth = 500;
        const dialogHeight = 400;
        const dialogDiv = document.createElement('div');
        dialogDiv.style.cssText = `width:${dialogWidth}px;height:${dialogHeight}px;`;
        dialogDiv.innerHTML = `
            <div class="rcui-layer rcui-layer-dialog" style="display:flex;flex-direction:column;height:100%;">
                <div class="rcui-layer-title" style="padding:10px 15px;font-weight:bold;">选择已订阅的变量</div>
                <div style="padding:10px 15px;">
                    <div class="rcui-transfer-search" style="width:100%;">
                        <i class="rcui-icon rcui-icon-search"></i>
                        <input type="text" class="rcui-input searchInput" placeholder="搜索变量名" style="width:100%;"/>
                    </div>
                </div>
                <div style="flex:1;overflow-y:auto;padding:0 15px;" class="varListContainer">
                </div>
                <div style="padding:10px 15px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid #eee;">
                    <div class="rcui-btn rcui-btn-sm cancelBtn" style="padding:0 20px;">取消</div>
                    <div class="rcui-btn rcui-btn-sm rcui-bg-blue confirmBtn" style="padding:0 20px;">确定</div>
                </div>
                <div class="rcui-layer-setwin">
                    <span class="rcui-icon rcui-icon-close rcui-layer-close rcui-layer-close1"></span>
                </div>
            </div>
        `;

        const varListContainer = dialogDiv.querySelector('.varListContainer');
        const searchInput = dialogDiv.querySelector('.searchInput');
        const localSelectedSet = new Set(selectedSet); // 本地选中状态

        // 渲染变量列表
        const renderList = (filterText) => {
            varListContainer.innerHTML = '';
            const filteredList = virvarList.filter(v => {
                if (!filterText) return true;
                const lowerFilter = filterText.toLowerCase();
                return v.name.toLowerCase().includes(lowerFilter);
            });

            if (filteredList.length === 0) {
                varListContainer.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">无匹配结果</div>';
                return;
            }

            filteredList.forEach(v => {
                // 获取该变量关联的第一个点位dwkey作为唯一标识
                const dwkey = v.points && v.points.length > 0 ? v.points[0] : v.id;
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;padding:8px 10px;border-bottom:1px solid #f0f0f0;cursor:pointer;';
                row.innerHTML = `
                    <input type="checkbox" style="margin-right:10px;cursor:pointer;" data-dwkey="${dwkey}" ${localSelectedSet.has(dwkey) ? 'checked' : ''}/>
                    <div style="flex:1;">
                        <div style="font-size:13px;color:#333;">${v.name}</div>
                        <div style="font-size:11px;color:#999;">${dwkey}</div>
                    </div>
                `;
                const checkbox = row.querySelector('input[type="checkbox"]');
                mxEvent.addListener(row, 'click', function (evt) {
                    if (evt.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                    if (checkbox.checked) {
                        localSelectedSet.add(dwkey);
                    } else {
                        localSelectedSet.delete(dwkey);
                    }
                });
                varListContainer.appendChild(row);
            });
        };

        renderList('');

        // 搜索事件
        mxEvent.addListener(searchInput, 'input', function () {
            renderList(searchInput.value);
        });

        // 显示对话框
        this.editorUi.showDialog(dialogDiv, dialogWidth, dialogHeight, true, true);

        // 确定按钮
        mxEvent.addListener(dialogDiv.querySelector('.confirmBtn'), 'click', mxUtils.bind(this, function () {
            const selectedArray = Array.from(localSelectedSet);
            const newValue = selectedArray.join(',');
            setValueFn(newValue);

            // 更新显示
            const displayNames = selectedArray.map(key => findVarNameByKey(key));
            input.value = displayNames.join(', ');
            input.title = newValue;

            this.editorUi.hideDialog(true, false);
        }));

        // 取消按钮
        mxEvent.addListener(dialogDiv.querySelector('.cancelBtn'), 'click', mxUtils.bind(this, function () {
            this.editorUi.hideDialog(true, false);
        }));

        // 关闭按钮
        mxEvent.addListener(dialogDiv.querySelector('.rcui-layer-close'), 'click', mxUtils.bind(this, function () {
            this.editorUi.hideDialog(true, false);
        }));
    });

    mxEvent.addListener(input, 'click', openSelectDialog);
    mxEvent.addListener(selectBtn, 'click', openSelectDialog);

    return { root: div };
};