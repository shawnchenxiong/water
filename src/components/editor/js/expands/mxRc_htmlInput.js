/* eslint-disable */

import { mxConstants, mxShape, mxUtils } from "../../core/mxgraph";

export default mxRc_htmlInput;

/**
 * 文本输入框组件
 * 
 * 功能特性：
 * - 支持两种工作模式：
 *   - display（回显模式）：只读，只能接收数据显示，不可输入
 *   - control（下发模式）：可读写，既可接收数据，也可通过 Enter 键发送反向控制
 * - 支持数据绑定和实时数据回显
 * - 支持反向控制（下发模式下）
 * 
 * 配置属性：
 * - inputMode: 'display' | 'control' （默认 'display'）
 * - placeholderText: 占位符文本
 * - 其他样式属性（fontSize, fontColor, fillColor 等）
 */
function mxRc_htmlInput(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_htmlInput, mxShape);

mxRc_htmlInput.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_htmlInput',
};

mxRc_htmlInput.prototype.paintVertexShape = function (c, x, y, w, h) {
    // 绘制透明背景以捕获事件（特别是在 Swimlane 中）
    c.setFillColor('#ffffff');
    c.setAlpha(0);
    c.rect(x, y, w, h);
    c.fill();
    c.setAlpha(1);

    this.foreground(c, x, y, w, h);
};

mxRc_htmlInput.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        const cell = this.state.cell;
        const divId = 'div_' + this.state.cell.id;
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        cell.setAttribute('divId', divId);

        // 获取样式配置
        const fontSize = style.fontSize || 14;
        const fontColor = style.fontColor || '#333333';
        const placeholderText = style.placeholderText || '';
        let text = cell.getValue() || '';
        let fontStyle = style.fontStyle || '';
        fontStyle = mxUtils.cssForFontStyle(fontStyle);

        // 获取输入模式：display（回显只读）或 control（下发可输入）
        // 特殊处理：如果是参数设定行的子组件 (childType=inputPart)，默认为 control 模式，确保可编辑
        const childType = mxUtils.getValue(style, 'childType', '');
        const defaultMode = childType === 'inputPart' ? 'control' : 'display';
        const inputMode = style.inputMode || defaultMode;
        const isDisplayMode = inputMode === 'display';

        // 背景设置
        let background = style.fillColor || 'none';
        if (background != 'none') {
            if (style.gradientColor) {
                let d = style.gradientDirection || 'south';
                background = `linear-gradient(to ${d == 'south' ? 'top' : d == 'north' ? 'bottom' : d == 'east' ? 'right' : 'left'},${background},${style.gradientColor})`;
            }
        }

        // 边框设置
        let hasBorder = style.strokeColor && style.strokeWidth;
        let borderStyle = 'solid';
        let borderSpace = '';
        if (style.dashed == 1) {
            let dashPattern = style.dashPattern || '10 10';
            if (dashPattern) {
                dashPattern = dashPattern.split(' ');
                if (dashPattern[0] == '1') {
                    borderStyle = 'dotted';
                    borderSpace = `${dashPattern[1]}px`;
                } else {
                    borderStyle = 'dashed';
                    borderSpace = `${dashPattern[0]}px ${dashPattern[1]}px`;
                }
            }
        }

        // 圆角设置
        let hasRadius = style.rounded == '1' && style.arcSize;
        let borderRadius = hasRadius ? (style.arcSize || 1) : 0;
        let border = hasBorder ? `${style.strokeWidth}px ${borderStyle} ${style.strokeColor}` : '';

        // 判断是否在编辑器模式
        const isEditor = graph.isEnabled() && !graph.isViewer;
        const pointerEvents = isEditor ? 'none' : 'auto';

        // 根据模式设置不同的属性
        const readonlyAttr = isDisplayMode ? 'readonly' : '';
        const cursorStyle = isDisplayMode ? 'default' : 'text';

        // 模式指示样式（编辑器中显示，帮助区分模式）
        let modeIndicator = '';
        if (isEditor) {
            const modeColor = isDisplayMode ? '#52c41a' : '#1890ff';
            const modeText = isDisplayMode ? '回显' : '下发';
            modeIndicator = `<span style="position:absolute;top:0;right:0;padding:1px 4px;font-size:10px;background:${modeColor};color:#fff;border-radius:0 0 0 4px;opacity:0.8;">${modeText}</span>`;
        }

        // 构建HTML
        const htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div singleImage" style="width: ${w}px;height: ${h}px;padding:0px;box-sizing:border-box;overflow: hidden;pointer-events: ${pointerEvents} !important;position:relative;">
            ${modeIndicator}
            <input 
                class="inputEle rcui-input" 
                value="${text}" 
                placeholder="${placeholderText}" 
                ${readonlyAttr}
                data-cell-id="${cell.id}"
                data-input-mode="${inputMode}"
                style="
                    ${hasBorder ? `border: ${border}; ${borderSpace ? `border-spacing:${borderSpace};` : ''}` : ''} 
                    ${hasRadius ? `border-radius:${borderRadius}px;` : ''} 
                    width: 100%;
                    height: 100%;
                    background: ${background};
                    padding: ${style.perimeterSpacing || 0}px;
                    box-sizing: border-box;
                    font-size: ${fontSize}px;
                    color: ${fontColor};
                    ${fontStyle};
                    pointer-events: ${pointerEvents} !important;
                    cursor: ${cursorStyle};
                    outline: none;
                " 
            />
        </div>`;

        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
    }
};

/**
 * 初始化运行时事件处理（在预览模式下调用）
 * 主要功能：
 * - 监听 Enter 键，当处于下发模式时触发反向控制
 */
mxRc_htmlInput.initRuntimeHandler = function (editorUi) {
    // 全局监听 Enter 键（已经在 App.js 的 openClickListener 中实现）
    // 这里可以添加额外的初始化逻辑
    console.log('[mxRc_htmlInput] 运行时处理器初始化');
};

