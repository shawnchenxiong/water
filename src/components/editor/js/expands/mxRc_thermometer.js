/* eslint-disable */

import {mxConstants, mxShape, mxUtils, mxPoint} from "../../core/mxgraph";
import Chart from "../plugins/d3/chart";

import * as d3 from '../plugins/d3/d3';

const cellStateMap = new Map();

export default mxRc_thermometer;

function mxRc_thermometer(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_thermometer, mxShape);
mxRc_thermometer.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_thermometer',
};
mxRc_thermometer.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_thermometer.prototype.foreground = function (c, divx, divy, divw, divh) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'div_' + this.state.cell.id;
        const graph = this.state.view.graph;
        cell.setAttribute('divId', divId);

        const perimeterSpacing = mxUtils.getValue(this.style, 'perimeterSpacing', 0);
        const D = 40;
        const d = 20;
        const h = 150;
        const r = 25;
        const p1 = perimeterSpacing + 20;
        const p2 = perimeterSpacing + 60;
        const p3 = perimeterSpacing + 20;
        const p4 = perimeterSpacing + 20;
        const dr = Math.sqrt(3 * Math.pow(r, 2) - r * d - Math.pow(d, 2) / 4 + Math.pow(D, 2) / 4) - r;

        const R = dr + r;

        const y1 = 0.5 * (D + d - Math.sqrt(3) * d) + p1;

        const PD = new mxPoint(p4 + R - D / 2, y1);
        const PA = new mxPoint(p4 + R - d / 2, y1);
        const PB = new mxPoint(p4 + R + d / 2, y1);
        const PE = new mxPoint(p4 + R + D / 2, y1);

        const y2 = y1 + h;
        const PI = new mxPoint(PD.x, y2);
        const PF = new mxPoint(PA.x, y2);
        const PG = new mxPoint(PB.x, y2);
        const PH = new mxPoint(PE.x, y2);

        const PT = new mxPoint(p4 + dr + 1.5 * r + d / 4, h + y1 + Math.sqrt(3 * Math.pow(r, 2) - r * d - Math.pow(d, 2) / 4) / 2);
        const PS = new mxPoint(p4 + R - r / 2 - d / 4, PT.y);

        const svgW = p4 + 2 * R + p2;
        const svgH = PT.y + Math.sqrt(3 * Math.pow(r, 2) - r * d - Math.pow(d, 2) / 4) / 2 + R + p3;

        const maxScale = mxUtils.getValue(this.style, 'maxScale', 100);
        const minScale = mxUtils.getValue(this.style, 'minScale', 0);
        const smallUnitScale = mxUtils.getValue(this.style, 'smallUnitScale', 2);
        const bigUnitScale = mxUtils.getValue(this.style, 'bigUnitScale', 20);

        const scaleVal = mxUtils.getValue(this.style, 'scaleVal', !graph.isChromeless ? (maxScale + minScale) / 2 : 0);

        const showScale = mxUtils.getValue(this.style, 'showScale', 0);
        const borderWidth = mxUtils.getValue(this.style, 'strokeWidth', 1);
        const bgFillColor1 = mxUtils.getValue(this.style, 'bgFillColor1', '#F8D7D1');
        const bgFillColor2 = mxUtils.getValue(this.style, 'bgFillColor2', '#FF5D3C');
        const borderColor = mxUtils.getValue(this.style, 'strokeColor', '#528CFF');
        const fontSize = mxUtils.getValue(this.style, 'fontSize', 12);
        const fontColor = mxUtils.getValue(this.style, 'fontColor', '#528CFF');
        const scaleColor = mxUtils.getValue(this.style, 'scaleColor', '#528CFF');
        const fillColor = mxUtils.getValue(this.style, 'fillColor', 'none');
        const gradientColor = mxUtils.getValue(this.style, 'gradientColor', 'none');
        const direction = mxUtils.getValue(this.style, 'gradientDirection', 'south');
        const scaleValDuration = mxUtils.getValue(this.style, 'scaleValDuration', 1);
        const scaleTransX = mxUtils.getValue(this.style, 'scaleTransX', 0);
        
        // ----------------- 新增逻辑开始 -----------------
        let rawScaleVal = mxUtils.getValue(this.style, 'scaleVal', null);
        let hasData = mxUtils.isNotNullOrUndefined(rawScaleVal) && rawScaleVal !== '';
        
        let lastState = cellStateMap.get(cell.id);
        let lastHasData = lastState ? lastState.hasData : false;
        let lastScaleVal = lastState ? lastState.scaleVal : minScale;

        let currentScaleVal = minScale; // 默认为最小值

        if (graph.isChromeless) { // 预览/运行模式
            if (hasData) {
                // 有效数据，尝试解析
                if (mxUtils.isNumeric(rawScaleVal)) {
                    currentScaleVal = parseFloat(rawScaleVal);
                } else {
                    // 非数字但有值，可能需要特殊处理，暂且认为无效或保持原值
                    currentScaleVal = lastScaleVal;
                }
            } else {
                // 无效数据
                if (lastHasData) {
                    // 之前有数据，保持之前的数据（防止归零）
                    currentScaleVal = lastScaleVal;
                    hasData = true; // 视为延续有效
                } else {
                    // 一直无数据，默认为 minScale
                    currentScaleVal = minScale;
                }
            }
        } else {
            // 编辑模式，使用默认值或设定值
            currentScaleVal = mxUtils.isNumeric(rawScaleVal) ? parseFloat(rawScaleVal) : (maxScale + minScale) / 2;
            hasData = true;
        }

        // 限制范围
        if (currentScaleVal < minScale) currentScaleVal = minScale;
        if (currentScaleVal > maxScale) currentScaleVal = maxScale;

        // 如果是首次有数据（且无历史），或者从无数据变有数据，让 lastScaleVal = currentScaleVal 以消除动画
        if (hasData && !lastHasData) {
            lastScaleVal = currentScaleVal;
        }

        // 更新状态
        cellStateMap.set(cell.id, { scaleVal: currentScaleVal, hasData: hasData });

        // 计算Y坐标
        const getYForScale = (val) => {
             let valY = PH.y;
             if (maxScale > minScale) {
                 const pct = (val - minScale) / (maxScale - minScale);
                 valY = PH.y - pct * (PH.y - PE.y);
             }
             return valY;
        };

        const lastY = getYForScale(lastScaleVal);
        const currentY = getYForScale(currentScaleVal);
        
        // 满量程路径
        const getPathForScale = (val) => {
             let valY = PH.y;
             if (maxScale > minScale) {
                 const pct = (val - minScale) / (maxScale - minScale);
                 valY = PH.y - pct * (PH.y - PE.y);
             }
             const targetY = valY > PB.y ? valY : PB.y;
             const isOverCap = valY <= PB.y;
             return `M${PG.x} ${PG.y} H${PF.x} V${targetY} ${ !isOverCap ? `H${PB.x}` : `A${d/2} ${d/2}, 0, 0, 0, ${PB.x} ${PB.y}`}`;
        };
        const pathFull = getPathForScale(maxScale); // 满量程

        // ----------------- 新增逻辑结束 -----------------

        const gradient = {x1: '0%', y1: '0%', x2: '0%', y2: '0%'};
        if (direction === mxConstants.DIRECTION_SOUTH) gradient.y2 = '100%';
        else if (direction === mxConstants.DIRECTION_EAST) gradient.x2 = '100%';
        else if (direction === mxConstants.DIRECTION_NORTH) gradient.y1 = '100%';
        else if (direction === mxConstants.DIRECTION_WEST) gradient.x1 = '100%';
        const smallScaleLineArr = [];
        const bigScaleLineArr = [];
        if (showScale !== 0 && maxScale > minScale) {
            if (smallUnitScale > 0) {
                const smallScaleCount = (maxScale - minScale) / smallUnitScale;
                const smallYUnit = (PH.y - PB.y) / smallScaleCount;
                for (let i = 0; i <= smallScaleCount; i++) {
                    const y = PH.y - i * smallYUnit;
                    if (y >= PE.y) {
                        smallScaleLineArr.push({x1: PH.x + scaleTransX, y1: y, x2: PH.x + scaleTransX + 10, y2: y, value: minScale + i * smallUnitScale});
                    }
                }
            }
            if (bigUnitScale > 0) {
                const bigScaleCount = (maxScale - minScale) / bigUnitScale;
                const bigYUnit = (PH.y - PB.y) / bigScaleCount;
                for (let i = 0; i <= bigScaleCount; i++) {
                    const y = PH.y - i * bigYUnit;
                    if (y >= PE.y) {
                        bigScaleLineArr.push({x1: PH.x + scaleTransX, y1: y, x2: PH.x + scaleTransX + 20, y2: y, value: minScale + i * bigUnitScale});
                    }
                }
            }
        }
        // Deprecated variables, keeping for safety if needed by other parts (though unlikely)
        const scaleValY = 0; 
        const pathValueHeight = pathFull; // 使用满量程路径

        // 动画时长逻辑
        let actualDuration = scaleValDuration;
        if (Math.abs(currentScaleVal - lastScaleVal) < 0.001) {
            actualDuration = 0;
        }
        
        // 计算 ClipRect 的 y 坐标
        // 我们需要露出从底部 (PH.y) 到 currentY 的部分。
        // ClipRect 应该覆盖这个区域。
        // 但这里使用 "遮罩" 思路：
        // 方法 A：ClipPath 是一个 Rect，覆盖我们要“显示”的区域。
        // 液柱在底部。所以 Rect 应该在底部。
        // Rect: x=0, width=svgW. 
        // y = currentY (或者 lastY for initial).
        // height = svgH - currentY (或者足够大).
        
        // 初始状态 (lastY)
        // 使用 CSS transform 来移动 Rect。
        // 初始位置：y=0. height=svgH + something to cover bottom.
        // 其实直接让 height 很大就行。
        // 关键是 y。
        
        // 我们定义 ClipRect 的初始 y = lastY.
        
        // 为了两阶段动画，我们需要在 HTML 渲染后执行 JS。
        // 利用 setTimeout.
        
        if (typeof window !== 'undefined' && graph.isChromeless) {
             setTimeout(() => {
                 const rect = document.getElementById(`clip_rect_${divId}`);
                 if (rect) {
                     // 强制重绘以确保 transition 生效（虽然 setTimeout 已经足够）
                     // rect.getBoundingClientRect();
                     
                     // 设置新的 y
                     // 使用 CSS 属性 (如果是现代浏览器) 或者直接 setAttribute 但配合 transition
                     // 为了兼容性，使用 style.transform
                     // 但是 SVG 坐标系下，y 属性更直接。
                     // 现代浏览器支持 y 作为 CSS 属性。
                     
                     // 方案：使用 setAttribute 'y'，但无法 transition。
                     // 方案：使用 CSS transition on 'y' (Chrome/FF/Safari recent).
                     // 方案：使用 transform: translateY(...).
                     // 如果 Rect 初始 y=0. TranslateY(lastY) -> TranslateY(currentY).
                     // 这样 Rect 顶部就在 Y 位置。
                     
                     rect.style.transition = `transform ${actualDuration}s ease-out`;
                     rect.style.transform = `translateY(${currentY}px)`;
                     
                     // 同时也设置 y 属性作为 fallback? 不，transform 会叠加。
                     // 只要初始 y=0 即可。
                 }
             }, 50);
        }

        let htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" style="width: ${divw}px;height: ${divh}px;overflow: hidden; background: transparent;">
    <svg width="${divw}" height="${divh}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="clip_${divId}">
                <!-- 初始位置在 lastY。使用 transform 初始值 -->
                <rect id="clip_rect_${divId}" x="0" y="0" width="${svgW}" height="${svgH + 100}" style="transform: translateY(${lastY}px);" />
            </clipPath>
        </defs>
        ${fillColor !== 'none' && gradientColor !== 'none' ? `<linearGradient id="${divId}grad" x1="${gradient.x1}" y1="${gradient.y1}" x2="${gradient.x2}" y2="${gradient.y2}">
            <stop offset="0%" style="stop-color:${fillColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradientColor};stop-opacity:1" />
        </linearGradient>` : ''}

        <path d="M${PD.x} ${PD.y} A${D / 2} ${D / 2}, 0, 1, 1, ${PE.x} ${PE.y} L${PH.x} ${PH.y} A${R} ${R}, 0, 1, 1, ${PI.x} ${PI.y} V${PD.y}"  stroke="${borderColor}" stroke-width="${borderWidth}" fill="${ fillColor !== 'none' && gradientColor !== 'none' ? `url(#${divId}grad)` : fillColor }" />
        ${showScale !== 0 ? smallScaleLineArr.reduce((t, item, i) => {
            return t + `<line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${scaleColor}" stroke-width="0.5"/>`
        }, '') : ''}
        ${showScale !== 0 ? bigScaleLineArr.reduce((t, item, i) => {
            return t + `<line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${scaleColor}" stroke-width="1"/>`
        }, '') : ''}
        ${showScale !== 0 ? bigScaleLineArr.reduce((t, item, i) => {
            return t + `<text x="${item.x2 + 10}" y="${item.y2}" dy="3" font-size="${fontSize}" fill="${fontColor}">${item.value}</text>`
        }, '') : ''}
        <path d="M${PA.x} ${PA.y} A${d / 2} ${d / 2}, 0, 1, 1, ${PB.x} ${PB.y} L${PG.x} ${PG.y} A${r} ${r}, 0, 0, 0, ${PT.x} ${PT.y} A${r} ${r}, 0, 1, 1, ${PS.x} ${PS.y} A${r} ${r}, 0, 0, 0, ${PF.x} ${PF.y} V${PA.y}" fill="${bgFillColor1}"  />
        <path d="M${PG.x} ${PG.y} A${r} ${r}, 0, 0, 0, ${PT.x} ${PT.y} A${r} ${r}, 1, 1, 1, ${PS.x} ${PS.y} A${r} ${r}, 0, 0, 0, ${PF.x} ${PF.y} H${PG.y}" fill="${bgFillColor2}"  />
        
        <!-- 使用 clip-path 裁剪满量程液柱 -->
        <path d="${pathFull}" fill="${bgFillColor2}" clip-path="url(#clip_${divId})" />
            
    </svg>
</div>`;
        c.text(divx, divy, divw, divh, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);

    }
};
