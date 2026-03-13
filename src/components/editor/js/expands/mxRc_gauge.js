/* eslint-disable */
/**
 * 半圆形仪表盘组件
 * 功能：
 * - 半圆形刻度盘显示
 * - 动态指针旋转
 * - 可配置量程、警戒区间
 * - 支持变量绑定
 */

import { mxConstants, mxShape, mxUtils } from "../../core/mxgraph";

export default mxRc_gauge;

function mxRc_gauge(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 1;
}

mxUtils.extend(mxRc_gauge, mxShape);

mxRc_gauge.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_gauge',
};

/**
 * 主绘制函数
 */
mxRc_gauge.prototype.paintVertexShape = function (c, x, y, w, h) {
    // 获取样式参数
    var style = this.state ? this.state.style : {};

    // 量程配置
    var minValue = parseFloat(mxUtils.getValue(style, 'gaugeMin', 0));
    var maxValue = parseFloat(mxUtils.getValue(style, 'gaugeMax', 100));
    var currentValue = parseFloat(mxUtils.getValue(style, 'gaugeValue', 50));

    // 数值模式：raw (原值) 或 percent (百分比输出)
    // 两种模式下，输入值、警告阈值、危险阈值都使用相同的自定义单位
    // 原值模式：显示原始数值 + 单位
    // 百分比模式：将数值归一化后显示百分比结果
    var valueMode = mxUtils.getValue(style, 'gaugeValueMode', 'raw');

    // 颜色配置
    var dialColor = mxUtils.getValue(style, 'dialColor', '#2d3436');
    var scaleColor = mxUtils.getValue(style, 'scaleColor', '#636e72');
    var pointerColor = mxUtils.getValue(style, 'pointerColor', '#e74c3c');
    var normalColor = mxUtils.getValue(style, 'normalColor', '#27ae60');
    var warningColor = mxUtils.getValue(style, 'warningColor', '#f39c12');
    var dangerColor = mxUtils.getValue(style, 'dangerColor', '#e74c3c');

    // 警告模式：high (高值警告), low (低值警告), both (双向警告)
    var alarmMode = mxUtils.getValue(style, 'gaugeAlarmMode', 'high');

    // 读取4个阈值
    var lowDanger = parseFloat(mxUtils.getValue(style, 'lowDangerThreshold', 10));
    var lowWarn = parseFloat(mxUtils.getValue(style, 'lowWarningThreshold', 30));
    var highWarn = parseFloat(mxUtils.getValue(style, 'highWarningThreshold', 70));
    var highDanger = parseFloat(mxUtils.getValue(style, 'highDangerThreshold', 90));

    // 显示配置
    var showValue = mxUtils.getValue(style, 'showValue', '1') == '1';
    var unit = mxUtils.getValue(style, 'gaugeUnit', 'm/s');
    var title = mxUtils.getValue(style, 'gaugeTitle', '');
    var fontSize = parseFloat(mxUtils.getValue(style, 'fontSize', 14));
    var fontColor = mxUtils.getValue(style, 'fontColor', '#ffffff');

    // 计算中心点和半径
    var centerX = x + w / 2;
    var centerY = y + h * 0.85; // 圆心偏下，留出空间给数值显示
    var radius = Math.min(w / 2, h * 0.7) * 0.9;
    var innerRadius = radius * 0.65;

    // 限制当前值在量程范围内
    var clampedValue = Math.max(minValue, Math.min(maxValue, currentValue));

    // 计算指针角度 (180度 = π, 从左到右)
    var range = maxValue - minValue;
    var valueRatio = range > 0 ? (clampedValue - minValue) / range : 0;
    var startAngle = Math.PI; // 180度，左侧
    var endAngle = 0; // 0度，右侧
    var pointerAngle = startAngle - valueRatio * Math.PI;

    // 1. 绘制表盘背景
    c.begin();
    c.setFillColor(dialColor);
    c.setStrokeColor('none');
    c.moveTo(centerX - radius, centerY);
    c.arcTo(radius, radius, 0, 0, 1, centerX + radius, centerY);
    c.lineTo(centerX + innerRadius, centerY);
    c.arcTo(innerRadius, innerRadius, 0, 0, 0, centerX - innerRadius, centerY);
    c.close();
    c.fillAndStroke();

    // 2. 绘制彩色区间 (根据警告模式)
    if (alarmMode === 'low') {
        // 低值警告模式：使用 lowWarningThreshold 和 lowDangerThreshold
        // 危险区 (最小值 -> 低危险阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, minValue, lowDanger, maxValue, dangerColor, startAngle);
        // 警告区 (低危险阈值 -> 低警告阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, lowDanger, lowWarn, maxValue, warningColor, startAngle);
        // 正常区 (低警告阈值 -> 最大值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, lowWarn, maxValue, maxValue, normalColor, startAngle);
    } else if (alarmMode === 'both') {
        // 双向警告模式：使用全部4个阈值
        // 确保阈值顺序正确
        var sortedLowDanger = Math.min(lowDanger, lowWarn);
        var sortedLowWarn = Math.max(lowDanger, lowWarn);
        var sortedHighWarn = Math.min(highWarn, highDanger);
        var sortedHighDanger = Math.max(highWarn, highDanger);

        // 低危险区 (最小值 -> 低危险阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, minValue, sortedLowDanger, maxValue, dangerColor, startAngle);
        // 低警告区 (低危险阈值 -> 低警告阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, sortedLowDanger, sortedLowWarn, maxValue, warningColor, startAngle);
        // 正常区 (低警告阈值 -> 高警告阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, sortedLowWarn, sortedHighWarn, maxValue, normalColor, startAngle);
        // 高警告区 (高警告阈值 -> 高危险阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, sortedHighWarn, sortedHighDanger, maxValue, warningColor, startAngle);
        // 高危险区 (高危险阈值 -> 最大值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, sortedHighDanger, maxValue, maxValue, dangerColor, startAngle);
    } else {
        // 高值警告模式（默认）：使用 highWarningThreshold 和 highDangerThreshold
        // 正常区 (最小值 -> 高警告阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, minValue, highWarn, maxValue, normalColor, startAngle);
        // 警告区 (高警告阈值 -> 高危险阈值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, highWarn, highDanger, maxValue, warningColor, startAngle);
        // 危险区 (高危险阈值 -> 最大值)
        this.drawColoredArc(c, centerX, centerY, radius, innerRadius, highDanger, maxValue, maxValue, dangerColor, startAngle);
    }

    // 3. 绘制刻度线
    this.drawScaleMarks(c, centerX, centerY, radius, innerRadius, scaleColor, minValue, maxValue);

    // 4. 绘制指针
    this.drawPointer(c, centerX, centerY, radius * 0.9, pointerAngle, pointerColor);

    // 5. 绘制中心圆点
    c.begin();
    c.setFillColor(pointerColor);
    c.ellipse(centerX - 8, centerY - 8, 16, 16);
    c.fill();

    // 6. 绘制数值显示
    if (showValue) {
        var valueText;
        if (valueMode === 'percent') {
            // 百分比模式：归一化计算百分比输出
            var percentValue = range > 0 ? ((clampedValue - minValue) / range * 100) : 0;
            valueText = percentValue.toFixed(1) + ' %';
        } else {
            // 原值模式：显示原始数值 + 自定义单位
            valueText = clampedValue.toFixed(1) + ' ' + unit;
        }

        c.setFontSize(fontSize);
        c.setFontColor(fontColor);
        c.setFontFamily('Arial, sans-serif');
        c.setFontStyle(mxConstants.FONT_BOLD);
        c.text(centerX, centerY + 25, 0, 0, valueText, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
    }

    // 7. 绘制标题
    if (title) {
        c.setFontSize(fontSize * 0.8);
        c.setFontColor(fontColor);
        c.setFontStyle(0);
        c.text(centerX, y + h - 5, 0, 0, title, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_BOTTOM, 0, null, 0, 0, 0);
    }

    // 8. 绘制最小/最大值标签
    c.setFontSize(fontSize * 0.7);
    c.setFontColor(scaleColor);
    c.text(centerX - radius + 10, centerY + 15, 0, 0, minValue.toString(), mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, null, 0, 0, 0);
    c.text(centerX + radius - 10, centerY + 15, 0, 0, maxValue.toString(), mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP, 0, null, 0, 0, 0);
};

/**
 * 绘制彩色弧形区间
 */
mxRc_gauge.prototype.drawColoredArc = function (c, cx, cy, outerR, innerR, startVal, endVal, maxVal, color, baseAngle) {
    if (startVal >= endVal) return;

    var range = maxVal - parseFloat(this.state.style.gaugeMin || 0);
    var startRatio = (startVal - parseFloat(this.state.style.gaugeMin || 0)) / range;
    var endRatio = (endVal - parseFloat(this.state.style.gaugeMin || 0)) / range;

    var arcStart = baseAngle - startRatio * Math.PI;
    var arcEnd = baseAngle - endRatio * Math.PI;

    c.begin();
    c.setFillColor(color);
    c.setAlpha(0.8);

    // 外弧起点
    var x1 = cx + outerR * Math.cos(arcStart);
    var y1 = cy - outerR * Math.sin(arcStart);
    // 外弧终点
    var x2 = cx + outerR * Math.cos(arcEnd);
    var y2 = cy - outerR * Math.sin(arcEnd);
    // 内弧终点
    var x3 = cx + innerR * Math.cos(arcEnd);
    var y3 = cy - innerR * Math.sin(arcEnd);
    // 内弧起点
    var x4 = cx + innerR * Math.cos(arcStart);
    var y4 = cy - innerR * Math.sin(arcStart);

    c.moveTo(x1, y1);
    c.arcTo(outerR, outerR, 0, 0, 1, x2, y2);
    c.lineTo(x3, y3);
    c.arcTo(innerR, innerR, 0, 0, 0, x4, y4);
    c.close();
    c.fill();
    c.setAlpha(1);
};

/**
 * 绘制刻度线
 */
mxRc_gauge.prototype.drawScaleMarks = function (c, cx, cy, outerR, innerR, color, minVal, maxVal) {
    c.setStrokeColor(color);
    c.setStrokeWidth(1);

    var numMajor = 10; // 主刻度数量
    var numMinor = 5;  // 每个主刻度间的小刻度数量

    for (var i = 0; i <= numMajor; i++) {
        var ratio = i / numMajor;
        var angle = Math.PI - ratio * Math.PI;

        // 主刻度线
        var outerX = cx + outerR * Math.cos(angle);
        var outerY = cy - outerR * Math.sin(angle);
        var innerLen = (i % 2 === 0) ? innerR * 1.15 : innerR * 1.08;
        var innerX = cx + innerLen * Math.cos(angle);
        var innerY = cy - innerLen * Math.sin(angle);

        c.begin();
        c.moveTo(outerX, outerY);
        c.lineTo(innerX, innerY);
        c.stroke();

        // 小刻度线 (除了最后一段)
        if (i < numMajor) {
            for (var j = 1; j < numMinor; j++) {
                var minorRatio = (i + j / numMinor) / numMajor;
                var minorAngle = Math.PI - minorRatio * Math.PI;

                var mOuterX = cx + outerR * Math.cos(minorAngle);
                var mOuterY = cy - outerR * Math.sin(minorAngle);
                var mInnerX = cx + innerR * 1.03 * Math.cos(minorAngle);
                var mInnerY = cy - innerR * 1.03 * Math.sin(minorAngle);

                c.begin();
                c.setStrokeWidth(0.5);
                c.moveTo(mOuterX, mOuterY);
                c.lineTo(mInnerX, mInnerY);
                c.stroke();
                c.setStrokeWidth(1);
            }
        }
    }
};

/**
 * 绘制指针
 */
mxRc_gauge.prototype.drawPointer = function (c, cx, cy, length, angle, color) {
    c.begin();
    c.setFillColor(color);
    c.setStrokeColor('#ffffff');
    c.setStrokeWidth(1);

    // 指针形状：三角形
    var tipX = cx + length * Math.cos(angle);
    var tipY = cy - length * Math.sin(angle);

    var baseWidth = 8;
    var baseAngle1 = angle + Math.PI / 2;
    var baseAngle2 = angle - Math.PI / 2;

    var base1X = cx + baseWidth * Math.cos(baseAngle1);
    var base1Y = cy - baseWidth * Math.sin(baseAngle1);
    var base2X = cx + baseWidth * Math.cos(baseAngle2);
    var base2Y = cy - baseWidth * Math.sin(baseAngle2);

    // 增加指针尾部
    var tailLength = 15;
    var tailX = cx - tailLength * Math.cos(angle);
    var tailY = cy + tailLength * Math.sin(angle);

    c.moveTo(tipX, tipY);
    c.lineTo(base1X, base1Y);
    c.lineTo(tailX, tailY);
    c.lineTo(base2X, base2Y);
    c.close();
    c.fillAndStroke();
};
