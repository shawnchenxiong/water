/* eslint-disable */
/**
 * 脉冲控制组件 Shape 定义
 * 
 * 功能描述：
 * - 点击触发脉冲信号：用户点击组件后，先发送高电平值（激活信号）
 * - 延迟后自动复位：经过配置的延迟时间后，自动发送低电平值（复位信号）
 * - 防止重复触发：脉冲序列执行期间忽略重复点击
 * - 序列版本控制：防止旧定时器在脚本重置后仍然触发发送
 * 
 * 配置属性（通过右侧面板设置）：
 * - pulseTargetKey: 目标点位ID（通过变量选择器选择）
 * - pulseHighValue: 脉冲高电平值（默认1）
 * - pulseLowValue: 脉冲低电平值（默认0）
 * - pulseDelay: 脉冲延迟时间（毫秒，默认2000）
 * - pulseButtonText: 按钮显示文字
 * - pulseOutputType: 输出类型 ('numeric' | 'boolean')
 * - pulseButtonBgColor: 按钮背景颜色
 * - pulseButtonTextColor: 按钮文字颜色
 * - pulseButtonFontSize: 按钮字体大小
 * - pulseButtonRadius: 按钮圆角大小
 * 
 * 运行时逻辑在 App.js 的 handlePulseControlClick 方法中实现
 * 
 * @author 自动生成
 * @date 2026-02-05
 */

import { mxConstants, mxShape, mxUtils } from "../../core/mxgraph";

export default mxRc_pulseControl;

/**
 * 脉冲控制组件构造函数
 */
function mxRc_pulseControl(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_pulseControl, mxShape);

// 组件标识符
mxRc_pulseControl.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_pulseControl',
};

/**
 * 绘制组件
 */
mxRc_pulseControl.prototype.paintVertexShape = function (c, x, y, w, h) {
    // 绘制透明背景以捕获事件
    c.setFillColor('#ffffff');
    c.setAlpha(0);
    c.rect(x, y, w, h);
    c.fill();
    c.setAlpha(1);

    this.foreground(c, x, y, w, h);
};

/**
 * 绘制前景内容（按钮样式）
 */
mxRc_pulseControl.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        const cell = this.state.cell;
        const divId = 'div_pulse_' + this.state.cell.id;
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        cell.setAttribute('divId', divId);

        // 获取样式配置
        // 获取样式配置
        let buttonText = style.pulseButtonText;
        if (buttonText === undefined || buttonText === null) {
            buttonText = '脉冲触发'; // 仅在未定义时使用默认值，允许空字符串
        }

        const buttonBgColor = style.pulseButtonBgColor || '#409eff';
        const buttonTextColor = style.pulseButtonTextColor || '#ffffff';
        const buttonFontSize = style.pulseButtonFontSize || '14';
        const buttonRadius = style.pulseButtonRadius || '4';
        let pulseTargetKey = style.pulseTargetKey || '';
        const pulseConfigStr = style.pulseControlValues;
        if (pulseConfigStr) {
            try {
                const pulseConfig = JSON.parse(decodeURIComponent(pulseConfigStr));
                if (pulseConfig && pulseConfig.virvarId) {
                    pulseTargetKey = pulseConfig.virvarId;
                }
            } catch (e) { }
        }
        const pulseBgImage = style.pulseBgImage ? mxUtils.fixImg(style.pulseBgImage) : '';

        // 如果有背景图，且文字是默认的，则自动隐藏文字（视为用户希望纯图片展示）
        if (pulseBgImage && buttonText === '脉冲触发') {
            buttonText = '';
        }

        // 判断是否在编辑器模式（编辑器模式下禁用点击）
        const isEditor = graph.isEnabled() && !graph.isViewer;
        const pointerEvents = isEditor ? 'none' : 'auto';
        const cursor = isEditor ? 'default' : 'pointer';

        // 配置状态提示（仅在未配置且无图片时通过背景色提示，文字始终显示）
        const displayText = buttonText;
        let backgroundStyle = `background: ${buttonBgColor};`;

        if (pulseBgImage) {
            backgroundStyle = `background: url('${pulseBgImage}') center/100% 100% no-repeat;`;
        }

        // 未配置目标点位时，给予黄色边框提示，不再强制覆盖背景色，以便用户能预览颜色设置
        let borderStyle = 'border: none;';
        if (!pulseTargetKey) {
            borderStyle = 'border: 2px dashed #e6a23c;';
        }

        // 构建HTML（按钮样式）
        const htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div pulse-control-container" 
            style="width: ${w}px; height: ${h}px; padding: 0px; box-sizing: border-box; overflow: hidden; pointer-events: ${pointerEvents} !important;">
            <button class="pulse-control-btn" 
                data-cell-id="${cell.id}"
                data-target-key="${pulseTargetKey}"
                style="
                    width: 100%;
                    height: 100%;
                    ${backgroundStyle}
                    color: ${buttonTextColor};
                    font-size: ${buttonFontSize}px;
                    ${borderStyle}
                    border-radius: ${buttonRadius}px;
                    cursor: ${cursor};
                    pointer-events: ${pointerEvents} !important;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                    font-weight: 500;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                "
                onmouseenter="this.style.opacity='0.85'; this.style.transform='scale(0.98)'"
                onmouseleave="this.style.opacity='1'; this.style.transform='scale(1)'"
                title="${!pulseTargetKey ? '⚠️ 未配置目标点位' : ''}"
            >${displayText}</button>
        </div>`;

        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
    }
};

