/* eslint-disable */
import {
    mxConstants,
    mxResources,
    mxEventObject,
    mxEvent,
    mxUtils,
    mxClient,
    mxCellRenderer,
    mxRectangle
} from '../../core/mxgraph';
import BaseFormatPanel from "./BaseFormatPanel";
import { ChangePageSetup } from "../EditorUi";
import api from "../utils/api.js";

export default ElementTextPanel;

function ElementTextPanel(format, editorUi, container) {
    BaseFormatPanel.call(this, format, editorUi, container);
    this.container.style.cssText = `padding: 10px;box-sizing: border-box;`;
    this.container.style.overflowY = 'scroll';
    this.init();

    const ss = this.editorUi.getSelectionState();
    if (ss.cells && ss.cells.length > 0) {
        if (ss.cells[0].getId() == ElementTextPanel.lastCellId) {
            setTimeout(() => {
                this.container.scrollTop = ElementTextPanel.lastScrollTop;
            }, this.setScrollTopLazyTime);
        } else {
            ElementTextPanel.lastCellId = ss.cells[0].getId();
            ElementTextPanel.lastScrollTop = 0;
        }
    } else {
        ElementTextPanel.lastCellId = null;
        ElementTextPanel.lastScrollTop = 0;
    }
    this.listenTop();
}

ElementTextPanel.lastCellId = null;
ElementTextPanel.lastScrollTop = 0;

mxUtils.extend(ElementTextPanel, BaseFormatPanel);

ElementTextPanel.prototype.listenTop = function () {
    this.container.addEventListener("scroll", mxUtils.bind(this, function (e) {
        ElementTextPanel.lastScrollTop = this.container.scrollTop;
    }));
}

ElementTextPanel.prototype.textLocationType = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
ElementTextPanel.prototype.textLocationOption = {
    topLeft: [mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_BOTTOM],
    top: [mxConstants.ALIGN_CENTER, mxConstants.ALIGN_TOP, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_BOTTOM],
    topRight: [mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_BOTTOM],
    left: [mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE],
    center: [mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE],
    right: [mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE],
    bottomLeft: [mxConstants.ALIGN_LEFT, mxConstants.ALIGN_BOTTOM, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP],
    bottom: [mxConstants.ALIGN_CENTER, mxConstants.ALIGN_BOTTOM, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_TOP],
    bottomRight: [mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_BOTTOM, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP],
};

ElementTextPanel.prototype.textDirectionType = ['automatic', 'leftToRight', 'rightToLeft'];
ElementTextPanel.prototype.textDirectionOption = {
    automatic: null,
    leftToRight: mxConstants.TEXT_DIRECTION_LTR,
    rightToLeft: mxConstants.TEXT_DIRECTION_RTL,
};


ElementTextPanel.prototype.init = function () {
    const ui = this.editorUi;
    const graph = this.editorUi.editor.graph;
    const ss = this.editorUi.getSelectionState();
    const style = graph.getCellStyle(ss.cells[0]);
    const erchenchiType = mxUtils.getValue(style, 'erchenchiType');

    // 逻辑调整：如果是不允许手动修改文本内容的组件（由数据驱动），我们将隐藏其“文本内容”输入框，但保留“字体大小”等样式的修改能力
    const isDataDriven = (erchenchiType === 'statusIndicator' || erchenchiType === 'dataDisplay');

    if (graph.isCellEditable(ss.cells[0]) && !isDataDriven) {
        if (erchenchiType === 'infoBar') {
            const setContentRow = this.createLabelCellRowSelect('文本内容 (SN)', {
                options: [],
            }, mxUtils.bind(this, function () {
                let text = '';
                if (ss.cells && ss.cells.length > 0) {
                    text = ss.cells[0].getValue();
                    // 如果已经是 "ID 名称" 格式，提取 ID 用于下拉框匹配
                    if (text && text.indexOf(' ') !== -1) {
                        text = text.split(' ')[0];
                    }
                }
                return text == null ? '' : text;
            }), mxUtils.bind(this, function (option) {
                graph.stopEditing(false);
                graph.getModel().beginUpdate();
                try {
                    // 设置为 "ID 名称" 形式
                    graph.getModel().setValue(ss.cells[0], option.key + ' ' + option.title);
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
            this.container.appendChild(setContentRow.root);

            // 为信息栏下拉列表获取设备列表
            const loadFromList = () => {
                return api.getDeviceList({ pageNo: 1, pageSize: 1000 }).then(res => {
                    if (res.code === 200 && res.result && res.result.records) {
                        return res.result.records.map(device => ({
                            key: device.snSerial || device.sn || device.id || device.key,
                            title: device.name || device.title || device.text || 'Unknown'
                        }));
                    }
                    return null;
                });
            };

            const loadFromNameList = () => {
                return api.getDeviceNameList().then(res => {
                    if (res.code === 200) {
                        const list = res.result || res.data || [];
                        return list.map(device => ({
                            key: device.snSerial || device.sn || device.key || device.id,
                            title: device.title || device.name || device.text || 'Unknown'
                        }));
                    }
                    return [];
                });
            };

            loadFromList().then(options => {
                if (!options || options.length === 0) {
                    return loadFromNameList();
                }
                return options;
            }).then(options => {
                if (options && options.length > 0) {
                    setContentRow.cell.updateOptions(options);
                }
            }).catch(err => {
                console.error('Failed to load device list:', err);
            });
        } else {
            // 为其他元素恢复标准文本输入
            const setContentRow = this.createLabelCellRowInput('文本内容', {
                type: 'text',
                required: false,
            }, mxUtils.bind(this, function () {
                let text = '';
                if (ss.cells && ss.cells.length > 0) {
                    text = ss.cells[0].getValue();
                }
                return text == null ? '' : text;
            }), mxUtils.bind(this, function (value) {
                graph.stopEditing(false);
                graph.getModel().beginUpdate();
                try {
                    graph.getModel().setValue(ss.cells[0], value);
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
            this.container.appendChild(setContentRow.root);
        }
        const setFontVisibleRow = this.createLabelCellRowSwitch('文本状态', { trueLabel: '显示', falseLabel: '隐藏' },
            mxUtils.bind(this, function () {
                return mxUtils.getValue(ss.style, mxConstants.STYLE_NOLABEL, null) == null;
            }), mxUtils.bind(this, function (val) {
                graph.stopEditing(false);
                graph.getModel().beginUpdate();
                try {
                    let value = !val ? '1' : null;
                    graph.setCellStyles(mxConstants.STYLE_NOLABEL, value, ss.cells);
                    ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_NOLABEL], 'values', [value], 'cells', ss.cells));
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
        this.container.appendChild(setFontVisibleRow.root);
    }

    const setFontSizeRow = this.createLabelCellRowInput('字体大小', {
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        hideStep: false,
        decimal: false,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return parseInt(mxUtils.getValue(ss.style, mxConstants.STYLE_FONTSIZE, '12'));
    }), mxUtils.bind(this, function (fontSize) {
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_FONTSIZE, fontSize, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_FONTSIZE], 'values', [fontSize], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setFontSizeRow.root);

    const setFontColorRow = this.createLabelCellRowColor('字体颜色', {},
        mxUtils.bind(this, function () {
            let color = mxUtils.getValue(ss.style, mxConstants.STYLE_FONTCOLOR, graph.shapeForegroundColor)
            return color;
        }), mxUtils.bind(this, function (color) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(mxConstants.STYLE_FONTCOLOR, color, ss.cells);
                graph.updateLabelElements(ss.cells, function (elt) {
                    elt.removeAttribute('color');
                    elt.style.color = null;
                });
                ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_FONTCOLOR], 'values', [color], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
    this.container.appendChild(setFontColorRow.root);

    const setFontBackgroundColorRow = this.createLabelCellRowColor('字体背景',
        { required: false },
        mxUtils.bind(this, function () {
            let color = mxUtils.getValue(ss.style, mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, graph.shapeBackgroundColor)
            return color;
        }), mxUtils.bind(this, function (color) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, color, ss.cells);
                graph.updateLabelElements(ss.cells, function (elt) {
                    elt.style.backgroundColor = null;
                });
                ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_LABEL_BACKGROUNDCOLOR], 'values', [color], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
    this.container.appendChild(setFontBackgroundColorRow.root);

    const setFontBorderColorRow = this.createLabelCellRowColor('字体边框', {},
        mxUtils.bind(this, function () {
            let color = mxUtils.getValue(ss.style, mxConstants.STYLE_LABEL_BORDERCOLOR, graph.shapeForegroundColor)
            return color;
        }), mxUtils.bind(this, function (color) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                graph.setCellStyles(mxConstants.STYLE_LABEL_BORDERCOLOR, color, ss.cells);
                ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_LABEL_BORDERCOLOR], 'values', [color], 'cells', ss.cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
    this.container.appendChild(setFontBorderColorRow.root);

    const setTextStyleRow = this.createLabelRowCheckGroupIconCell('字体样式',
        {
            isCheckbox: true,
            options: [
                { key: 'bold', title: 'geSprite geSprite-bold' },
                { key: 'italic', title: 'geSprite geSprite-italic' },
                { key: 'underline', title: 'geSprite geSprite-underline' },
                { key: 'vertical', title: 'geSprite geSprite-vertical' },
            ],
        },
        mxUtils.bind(this, function (option) {
            if (option.key === 'bold') {
                let fontStyle = mxUtils.getValue(ss.style, mxConstants.STYLE_FONTSTYLE, 0);
                return (fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD;
            }
            if (option.key === 'italic') {
                let fontStyle = mxUtils.getValue(ss.style, mxConstants.STYLE_FONTSTYLE, 0);
                return (fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC;
            }
            if (option.key === 'underline') {
                let fontStyle = mxUtils.getValue(ss.style, mxConstants.STYLE_FONTSTYLE, 0);
                return (fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE;
            }
            if (option.key === 'vertical') {
                return mxUtils.getValue(ss.style, mxConstants.STYLE_HORIZONTAL, '1') == '0';
            }
        }),
        mxUtils.bind(this, function (option) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                const cells = ss.cells;
                let index = ['bold', 'italic', 'underline'].indexOf(option.key);
                if (index > -1) {
                    let style = [mxConstants.FONT_BOLD, mxConstants.FONT_ITALIC, mxConstants.FONT_UNDERLINE][index];
                    graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style, cells);
                    if ((style & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
                        graph.updateLabelElements(cells, function (elt) {
                            elt.style.fontWeight = null;
                            if (elt.nodeName == 'B') {
                                graph.replaceElement(elt);
                            }
                        });
                    } else if ((style & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
                        graph.updateLabelElements(cells, function (elt) {
                            elt.style.fontStyle = null;
                            if (elt.nodeName == 'I') {
                                graph.replaceElement(elt);
                            }
                        });
                    } else if ((style & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
                        graph.updateLabelElements(cells, function (elt) {
                            elt.style.textDecoration = null;
                            if (elt.nodeName == 'U') {
                                graph.replaceElement(elt);
                            }
                        });
                    }
                    for (let i = 0; i < cells.length; i++) {
                        if (graph.model.getChildCount(cells[i]) == 0) {
                            graph.autoSizeCell(cells[i], false);
                        }
                    }
                    return;
                }
                if (option.key === 'vertical') {
                    this.editorUi.menus.toggleStyle(mxConstants.STYLE_HORIZONTAL, true);
                }
            } finally {
                graph.getModel().endUpdate();
            }
        }));
    this.container.appendChild(setTextStyleRow.root);

    const setTextHorizontalAlignRow = this.createLabelRowCheckGroupIconCell('水平对齐',
        {
            isCheckbox: false,
            options: [
                { key: mxConstants.ALIGN_LEFT, title: 'geSprite geSprite-left' },
                { key: mxConstants.ALIGN_CENTER, title: 'geSprite geSprite-center' },
                { key: mxConstants.ALIGN_RIGHT, title: 'geSprite geSprite-right' },
            ],
        },
        mxUtils.bind(this, function () {
            return mxUtils.getValue(ss.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
        }),
        mxUtils.bind(this, function (option) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                let keys = [mxConstants.STYLE_ALIGN];
                let values = [option.key];
                let cells = ss.cells;
                for (let i = 0; i < keys.length; i++) {
                    graph.setCellStyles(keys[i], values[i], cells);
                    graph.updateLabelElements(cells, function (elt) {
                        elt.removeAttribute('align');
                        elt.style.textAlign = null;
                    });
                }
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values, 'cells', cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
    this.container.appendChild(setTextHorizontalAlignRow.root);


    const setTextVerticalAlignRow = this.createLabelRowCheckGroupIconCell('垂直对齐',
        {
            isCheckbox: false,
            options: [
                { key: mxConstants.ALIGN_TOP, title: 'geSprite geSprite-top' },
                { key: mxConstants.ALIGN_MIDDLE, title: 'geSprite geSprite-middle' },
                { key: mxConstants.ALIGN_BOTTOM, title: 'geSprite geSprite-bottom' },
            ],
        },
        mxUtils.bind(this, function () {
            return mxUtils.getValue(ss.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
        }),
        mxUtils.bind(this, function (option) {
            graph.stopEditing(false);
            graph.getModel().beginUpdate();
            try {
                let keys = [mxConstants.STYLE_VERTICAL_ALIGN];
                let values = [option.key];
                let cells = ss.cells;
                for (let i = 0; i < keys.length; i++) {
                    graph.setCellStyles(keys[i], values[i], cells);
                }
                this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values, 'cells', cells));
            } finally {
                graph.getModel().endUpdate();
            }
        }));
    this.container.appendChild(setTextVerticalAlignRow.root);

    const setTextLocationRow = this.createLabelCellRowSelect('文字位置', {
        options: [...this.textLocationType.map(item => {
            return { 'key': item, 'title': mxResources.get(item) };
        })]
    }, mxUtils.bind(this, function () {
        let pos = mxUtils.getValue(ss.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
        let vpos = mxUtils.getValue(ss.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
        if (pos == mxConstants.ALIGN_LEFT && vpos == mxConstants.ALIGN_TOP) return 'topLeft';
        if (pos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_TOP) return 'top';
        if (pos == mxConstants.ALIGN_RIGHT && vpos == mxConstants.ALIGN_TOP) return 'topRight';
        if (pos == mxConstants.ALIGN_LEFT && vpos == mxConstants.ALIGN_BOTTOM) return 'bottomLeft';
        if (pos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_BOTTOM) return 'bottom';
        if (pos == mxConstants.ALIGN_RIGHT && vpos == mxConstants.ALIGN_BOTTOM) return 'bottomRight';
        if (pos == mxConstants.ALIGN_LEFT) return 'left';
        if (pos == mxConstants.ALIGN_RIGHT) return 'right';
        return 'center';
    }), mxUtils.bind(this, function (option) {
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            let values = this.textLocationOption[option.key];
            if (values != null) {
                graph.setCellStyles(mxConstants.STYLE_LABEL_POSITION, values[0], ss.cells);
                graph.setCellStyles(mxConstants.STYLE_VERTICAL_LABEL_POSITION, values[1], ss.cells);
                graph.setCellStyles(mxConstants.STYLE_ALIGN, values[2], ss.cells);
                graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, values[3], ss.cells);
            }
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setTextLocationRow.root);

    const setTextDirectionRow = this.createLabelCellRowSelect('输入方向', {
        options: [...this.textDirectionType.map(item => {
            return { 'key': item, 'title': mxResources.get(item) };
        })]
    }, mxUtils.bind(this, function () {
        let dir = mxUtils.getValue(ss.style, mxConstants.STYLE_TEXT_DIRECTION, mxConstants.DEFAULT_TEXT_DIRECTION);
        if (dir == mxConstants.TEXT_DIRECTION_RTL) return 'rightToLeft';
        if (dir == mxConstants.TEXT_DIRECTION_LTR) return 'leftToRight';
        return 'automatic';
    }), mxUtils.bind(this, function (option) {
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_TEXT_DIRECTION, this.textDirectionOption[option.key], ss.cells);
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setTextDirectionRow.root);

    let wwCells = graph.filterSelectionCells(
        mxUtils.bind(this, function (cell) {
            let state = graph.view.getState(cell);
            return state == null || graph.isAutoSizeState(state) || graph.getModel().isEdge(cell) || (!graph.isTableRow(cell) && !graph.isTableCell(cell) && !graph.isCellResizable(cell));
        })
    );
    if (wwCells && wwCells.length > 0) {
        const setFontWordWrapRow = this.createLabelCellRowSwitch(mxResources.get('wordWrap'), {
            trueLabel: '开启',
            falseLabel: '关闭'
        },
            mxUtils.bind(this, function () {
                return mxUtils.getValue(ss.style, mxConstants.STYLE_WHITE_SPACE, null) === 'wrap';
            }), mxUtils.bind(this, function (val) {
                graph.stopEditing(false);
                graph.getModel().beginUpdate();
                try {
                    let value = val ? 'wrap' : null;
                    graph.setCellStyles(mxConstants.STYLE_WHITE_SPACE, value, wwCells);
                    ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_WHITE_SPACE], 'values', [value], 'cells', wwCells));
                } finally {
                    graph.getModel().endUpdate();
                }
            }));
        this.container.appendChild(setFontWordWrapRow.root);
    }

    const setGlobalSpaceRow = this.createLabelCellRowInput('间距（四方）', {
        type: 'number',
        min: -9999,
        max: 9999,
        step: 1,
        hideStep: false,
        decimal: true,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING, '0');
    }), mxUtils.bind(this, function (value) {
        value = parseFloat(value ? value : '0');
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_SPACING, value, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_SPACING], 'values', [value], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setGlobalSpaceRow.root);

    const setTopSpaceRow = this.createLabelCellRowInput('顶部间距', {
        type: 'number',
        min: -9999,
        max: 9999,
        step: 1,
        hideStep: false,
        decimal: true,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_TOP, '0');
    }), mxUtils.bind(this, function (value) {
        value = parseFloat(value ? value : '0');
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_SPACING_TOP, value, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_SPACING_TOP], 'values', [value], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setTopSpaceRow.root);

    const setBottomSpaceRow = this.createLabelCellRowInput('底部间距', {
        type: 'number',
        min: -9999,
        max: 9999,
        step: 1,
        hideStep: false,
        decimal: true,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_BOTTOM, '0');
    }), mxUtils.bind(this, function (value) {
        value = parseFloat(value ? value : '0');
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_SPACING_BOTTOM, value, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_SPACING_BOTTOM], 'values', [value], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setBottomSpaceRow.root);

    const setLeftSpaceRow = this.createLabelCellRowInput('左边间距', {
        type: 'number',
        min: -9999,
        max: 9999,
        step: 1,
        hideStep: false,
        decimal: true,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_LEFT, '0');
    }), mxUtils.bind(this, function (value) {
        value = parseFloat(value ? value : '0');
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_SPACING_LEFT, value, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_SPACING_LEFT], 'values', [value], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setLeftSpaceRow.root);

    const setRightSpaceRow = this.createLabelCellRowInput('右边间距', {
        type: 'number',
        min: -9999,
        max: 9999,
        step: 1,
        hideStep: false,
        decimal: true,
        unit: 'px',
    }, mxUtils.bind(this, function () {
        return mxUtils.getValue(ss.style, mxConstants.STYLE_SPACING_RIGHT, '0');
    }), mxUtils.bind(this, function (value) {
        value = parseFloat(value ? value : '0');
        graph.stopEditing(false);
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_SPACING_RIGHT, value, ss.cells);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_SPACING_RIGHT], 'values', [value], 'cells', ss.cells));
        } finally {
            graph.getModel().endUpdate();
        }
    }));
    this.container.appendChild(setRightSpaceRow.root);

}
