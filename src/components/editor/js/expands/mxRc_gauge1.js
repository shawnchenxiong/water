/* eslint-disable */

import {mxConstants, mxPoint, mxShape, mxUtils} from "../../core/mxgraph";

export default mxRc_gauge1;

const cellStateMap = new Map();

function mxRc_gauge1(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_gauge1, mxShape);
mxRc_gauge1.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_gauge1',
};
mxRc_gauge1.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_gauge1.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'div_' + this.state.cell.id;
        const graph = this.state.view.graph;
        cell.setAttribute('divId', divId);

        const s = mxUtils.getValue(this.style, 'perimeterSpacing', 0);
        const p1 = s + 20;
        const p2 = s + 20;
        const p3 = s + 20;
        const p4 = s + 20;

        const PA = new mxPoint(p4, p1);
        const PB = new mxPoint(w - p2, p1);
        const PC = new mxPoint(w - p2, h - p3);
        const PD = new mxPoint(p4, h - p3);

        const maxScale = mxUtils.getValue(this.style, 'maxScale', 100);
        const minScale = mxUtils.getValue(this.style, 'minScale', 0);
        const smallUnitScale = mxUtils.getValue(this.style, 'smallUnitScale', 2);
        const bigUnitScale = mxUtils.getValue(this.style, 'bigUnitScale', 20);

        const scaleVal = mxUtils.getValue(this.style, 'scaleVal', !graph.isChromeless ? (maxScale + minScale) / 2 : 0);

        const showScale = mxUtils.getValue(this.style, 'showScale', 0);

        const bgFillColor1 = mxUtils.getValue(this.style, 'bgFillColor1', '#F8D7D1');
        const bgFillColor2 = mxUtils.getValue(this.style, 'bgFillColor2', '#FF5D3C');
        const fontSize = mxUtils.getValue(this.style, 'fontSize', 12);
        const fontColor = mxUtils.getValue(this.style, 'fontColor', '#528CFF');
        const scaleColor = mxUtils.getValue(this.style, 'scaleColor', '#528CFF');
        const scaleValDuration = mxUtils.getValue(this.style, 'scaleValDuration', 1);
        const scaleTransX = mxUtils.getValue(this.style, 'scaleTransX', 0);

        const bigScaleH = 1;
        const smallScaleLineArr = [];
        const bigScaleLineArr = [];
        if (showScale !== 0 && maxScale > minScale) {
            if (smallUnitScale > 0) {
                const smallScaleCount = (maxScale - minScale) / smallUnitScale;
                const smallYUnit = (PC.y - PB.y - bigScaleH) / smallScaleCount;
                for (let i = 0; i <= smallScaleCount; i++) {
                    const y = PC.y - bigScaleH/2 - i * smallYUnit;
                    if (y >= PB.y) {
                        smallScaleLineArr.push({x1: PC.x + scaleTransX, y1: y, x2: PC.x + scaleTransX + 10, y2: y, value: minScale + i * smallUnitScale});
                    }
                }
            }
            if (bigUnitScale > 0) {
                const bigScaleCount = (maxScale - minScale) / bigUnitScale;
                const bigYUnit = (PC.y - PB.y - bigScaleH) / bigScaleCount;
                for (let i = 0; i <= bigScaleCount; i++) {
                    const y = PC.y - bigScaleH/2 - i * bigYUnit;
                    if (y >= PB.y) {
                        bigScaleLineArr.push({x1: PC.x + scaleTransX, y1: y, x2: PC.x + scaleTransX + 20, y2: y, value: minScale + i * bigUnitScale});
                    }
                }
            }
        }

        let lastScaleVal = scaleVal;
        if (cellStateMap.has(divId)) {
            lastScaleVal = cellStateMap.get(divId);
        } else {
            lastScaleVal = scaleVal;
        }
        cellStateMap.set(divId, scaleVal);

        const getOffset = (val) => {
            let pct = 0;
            if (val >= minScale && val <= maxScale && maxScale > minScale) {
                pct = (val - minScale) / (maxScale - minScale);
            } else if (val > maxScale) {
                pct = 1;
            } else if (val < minScale) {
                pct = 0;
            }
            return (1 - pct) * (PC.y - PB.y);
        };

        const lastOffset = getOffset(lastScaleVal);
        const currentOffset = getOffset(scaleVal);
        
        const pathFull = `M${PC.x} ${PC.y} H${PD.x} V${PB.y} H${PB.x}`;
        
        const clipRectX = PD.x;
        const clipRectY = PB.y;
        const clipRectW = PC.x - PD.x;
        const clipRectH = PC.y - PB.y;

        if (typeof window !== 'undefined' && graph.isChromeless) {
            setTimeout(() => {
                const rect = document.getElementById(`clip_rect_${divId}`);
                if (rect) {
                    rect.style.transition = `transform ${scaleValDuration}s ease-out`;
                    rect.style.transform = `translateY(${currentOffset}px)`;
                }
            }, 50);
        }

        let htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" style="width: ${w}px;height: ${h}px;overflow: hidden">
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="clip_${divId}">
                <rect id="clip_rect_${divId}" x="${clipRectX}" y="${clipRectY}" width="${clipRectW}" height="${clipRectH}" style="transform: translateY(${lastOffset}px);" />
            </clipPath>
        </defs>
        <path d="M${PA.x} ${PA.y} H${PB.x} V${PC.y} H${PD.x} V${PA.y}" fill="${bgFillColor1}"  />
        <path d="${pathFull}" fill="${bgFillColor2}" clip-path="url(#clip_${divId})" />

        ${showScale !== 0 ? smallScaleLineArr.reduce((t, item, i) => {
            return t + `<line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${scaleColor}" stroke-width="0.5"/>`
        }, '') : ''}
        ${showScale !== 0 ? bigScaleLineArr.reduce((t, item, i) => {
            return t + `<line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="${scaleColor}" stroke-width="1"/>`
        }, '') : ''}
        ${showScale !== 0 ? bigScaleLineArr.reduce((t, item, i) => {
            return t + `<text x="${item.x2 + 10}" y="${item.y2}" dy="3" font-size="${fontSize}" fill="${fontColor}">${item.value}</text>`
        }, '') : ''}
    </svg>
</div>`;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);

    }
};
