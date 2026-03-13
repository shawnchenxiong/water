import {
    mxCellRenderer,
    mxConstants,
    mxShape,
    mxUtils,
    mxRectangle
} from '../../core/mxgraph';

export default function mxRc_progressSlider(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(mxRc_progressSlider, mxShape);

mxRc_progressSlider.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_progressSlider'
};

mxRc_progressSlider.prototype.paintVertexShape = function (c, x, y, w, h) {
    c.translate(x, y);

    // 获取样式属性
    var min = parseFloat(mxUtils.getValue(this.style, 'sliderMin', 0));
    var max = parseFloat(mxUtils.getValue(this.style, 'sliderMax', 100));
    var val = parseFloat(mxUtils.getValue(this.style, 'sliderValue', 0));

    // 确保值在范围内
    if (isNaN(val)) val = min;
    val = Math.max(min, Math.min(max, val));

    // 计算百分比
    var percent = 0;
    if (max > min) {
        percent = (val - min) / (max - min);
    }

    // 颜色配置
    var trackColor = mxUtils.getValue(this.style, 'trackColor', '#EEEEEE');
    var activeColor = mxUtils.getValue(this.style, 'fillColor', '#FF8800'); // 使用标准 fillColor 作为激活色
    var thumbColor = mxUtils.getValue(this.style, 'thumbColor', '#FF8800');
    var fontColor = mxUtils.getValue(this.style, 'fontColor', '#FFFFFF');
    var showThumb = mxUtils.getValue(this.style, 'showThumb', '1') == '1';

    // 获取字体大小和间距配置
    var fontSize = parseFloat(mxUtils.getValue(this.style, 'sliderFontSize', 12));
    var spacing = parseFloat(mxUtils.getValue(this.style, 'sliderSpacing', 5));

    // 布局参数
    var barHeight = 8;
    var thumbSize = 16;
    // 动态调整文本区域高度 (至少20，或者根据字体大小)
    var textHeight = Math.max(20, fontSize * 1.5);

    // 计算轨道垂直位置 (居中，或者留出底部文字空间)
    var trackY = (h - textHeight) / 2 - barHeight / 2 - spacing;

    // 绘制轨道背景 (Outline)
    c.setStrokeColor('none');
    c.setFillColor(trackColor);
    c.roundrect(0, trackY, w, barHeight, barHeight / 2, barHeight / 2);
    c.fill();

    // 绘制激活进度条
    if (percent > 0) {
        c.setFillColor(activeColor);
        c.roundrect(0, trackY, w * percent, barHeight, barHeight / 2, barHeight / 2);
        c.fill();
    }

    // 绘制滑块 (Thumb)
    if (showThumb) {
        var thumbX = w * percent;
        // 修正 thumbX 边界，使其不超出圆心过多（可选）
        // 简单处理：圆心在 w * percent
        var thumbY = trackY + barHeight / 2;

        // 外发光/阴影效果 (通过绘制半透明大圆模拟)
        c.setAlpha(0.3);
        c.setFillColor('#FFFFFF');
        c.ellipse(thumbX - thumbSize / 2 - 2, thumbY - thumbSize / 2 - 2, thumbSize + 4, thumbSize + 4);
        c.fill();
        c.setAlpha(1);

        // 滑块主体
        c.setFillColor(thumbColor);
        c.setStrokeColor('#FFFFFF');
        c.setStrokeWidth(2);
        c.ellipse(thumbX - thumbSize / 2, thumbY - thumbSize / 2, thumbSize, thumbSize);
        c.fillAndStroke();
    }

    // 绘制数值文本
    c.setFontColor(fontColor);
    c.setFontSize(fontSize);

    var textMode = mxUtils.getValue(this.style, 'sliderTextMode', 'value');
    var curText = '';

    if (textMode === 'percent') {
        curText = Math.round(percent * 100) + '%';
    } else {
        curText = val + '';
    }

    // 文本垂直位置：底部居中
    var textY = h - textHeight / 2;

    // 1. 绘制左侧最小值
    c.text(0, textY, 0, 0, min + '', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);

    // 2. 绘制右侧最大值
    c.text(w, textY, 0, 0, max + '', mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);

    // 3. 绘制中间跟随数值
    // 计算跟随位置，并做简单的边界处理防止过度溢出(可选，此处暂做纯跟随)
    var curX = w * percent;

    // 简单的防重叠/溢出优化：如果非常靠左，偏右一点；非常靠右，偏左一点
    // 但为了严格"跟随"，这里使用 Center 对齐
    // 如果需要避免覆盖 Min/Max，可能需要更复杂的逻辑，这里先保持简单的居中跟随
    c.text(curX, textY, 0, 0, curText, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);

};
