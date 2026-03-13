/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

const cellStateMap = new Map();

export default mxRc_squareTrough;

function mxRc_squareTrough(bounds, fill, stroke, strokewidth) {
    mxShape.call(this), (this.bounds = bounds), (this.fill = fill), (this.stroke = stroke), (this.strokewidth = null != strokewidth ? strokewidth : 0);
}

mxUtils.extend(mxRc_squareTrough, mxShape);

mxRc_squareTrough.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_squareTrough',
};
mxRc_squareTrough.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_squareTrough.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        try{
            const cell = this.state.cell;
            const divId = 'div_' + this.state.cell.id;
            cell.setAttribute('divId', divId);
            const graph = this.state.view.graph;
            const style = graph.getCellStyle(cell);
            let troughBorderWidth = mxUtils.getValue(style, 'troughBorderWidth', '5');
            let troughBorderRadius = mxUtils.getValue(style, 'troughBorderRadius', '0');
            let troughBorderColor = mxUtils.getValue(style, 'troughBorderColor', '#000000');
            let troughBackgroundColor = mxUtils.getValue(style, 'troughBackgroundColor', '#FFFFFF');
            let troughLiquidColor = mxUtils.getValue(style, 'troughLiquidColor', '#00AAFF');
            let troughLiquidProgress = mxUtils.getValue(style, 'troughLiquidProgress', null);
            let troughMinScale = mxUtils.getValue(style, 'troughMinScale', null);
            let troughMaxScale = mxUtils.getValue(style, 'troughMaxScale', null);
            let troughBubbles = mxUtils.getValue(style, 'troughBubbles', 0);
            let targetProgress = '0%';
            // 判断当前是否有有效数据（非 null/undefined 且非空字符串）
            let hasData = mxUtils.isNotNullOrUndefined(troughLiquidProgress) && troughLiquidProgress !== '';

            if(graph.isChromeless){
                if(hasData){
                    if(mxUtils.isNumeric(troughLiquidProgress)){
                        if(mxUtils.isNumeric(troughMinScale) && mxUtils.isNumeric(troughMaxScale)){
                            let min = parseFloat(troughMinScale );
                            let max = parseFloat(troughMaxScale);
                            let cur = parseFloat(troughLiquidProgress);
                            if(min <= cur && cur <= max){
                                let pro = ((cur - min) / (max - min)) * 100.0;
                                targetProgress = `${pro.toFixed(2)}%`;
                            }
                        }
                    }else{
                        targetProgress = troughLiquidProgress;
                    }
                }
            }else{
                targetProgress = '50%';
                hasData = true; // 编辑模式视为有数据
            }

            // 获取历史状态
            let lastState = cellStateMap.get(cell.id);
            let lastHasData = lastState ? lastState.hasData : false;
            let lastProgress = lastState ? lastState.progress : '0%';

            // 如果当前数据无效，保持上一次的状态（防止闪烁回0）
            if (!hasData && lastHasData) {
                targetProgress = lastProgress;
                hasData = true; // 视为延续有效数据
            }

            const existingWrap = document.getElementById(divId);
            if(existingWrap){
                try{
                    const water = existingWrap.querySelector('.rcui-tank-water');
                    const waterHide = existingWrap.querySelector('.rcui-tank-water_hide');
                    if(water){
                        // 如果之前没有数据，现在有数据了，强制不播放动画（即时跳变）
                        if (hasData && !lastHasData) {
                             water.style.transition = 'none';
                             if(waterHide) waterHide.style.transition = 'none';
                             water.style.height = targetProgress;
                             if(waterHide) waterHide.style.height = targetProgress;
                        } else {
                            // 正常更新
                            let curH = water.style.height || targetProgress;
                            let diff = Math.abs(parseFloat(targetProgress) - parseFloat(curH));
                            
                            if (diff > 0.1) {
                                let ms = Math.max(200, Math.min(1000, diff * 15));
                                requestAnimationFrame(() => {
                                    water.style.transition = `height ${ms}ms ease-out`;
                                    if(waterHide) waterHide.style.transition = `height ${ms}ms ease-out`;
                                    water.style.height = targetProgress;
                                    if(waterHide) waterHide.style.height = targetProgress;
                                });
                            } else {
                                // 差值极小，直接设置，不动画
                                water.style.transition = 'none';
                                if(waterHide) waterHide.style.transition = 'none';
                                water.style.height = targetProgress;
                                if(waterHide) waterHide.style.height = targetProgress;
                            }
                        }
                    }
                    // 更新状态
                    cellStateMap.set(cell.id, { progress: targetProgress, hasData: hasData });
                }catch(e){}
                return;
            }

            // DOM 不存在（首次渲染或重建）
            // 如果历史状态存在，优先使用历史值
            let initialProgress = (lastState && lastHasData) ? lastState.progress : targetProgress;
            
            // 如果是首次有数据（且无历史有效数据），initialProgress 已经等于 targetProgress，不产生动画
            
            // 更新状态
            cellStateMap.set(cell.id, { progress: targetProgress, hasData: hasData });
            
            let htmlStr = `
        <div id="${divId}" class="rc_custom_view_outer_div" style="width: ${w}px;height: ${h}px;overflow: hidden;">
        <div class="rcui-tank-container" style="background-color: ${troughBackgroundColor};border-left: ${troughBorderWidth}px solid ${troughBorderColor};border-bottom: ${troughBorderWidth}px solid ${troughBorderColor};border-right: ${troughBorderWidth}px solid ${troughBorderColor};border-bottom-left-radius: ${troughBorderRadius + 5}px;border-bottom-right-radius: ${troughBorderRadius + 5}px;">
            <div class="rcui-tank-placeholder" style="background-color: ${troughBackgroundColor};border: none;"></div>
            <div class="rcui-tank-water_hide" style="height:${initialProgress};border: none;"></div>
            <div class="rcui-tank-water" style="height:${initialProgress};border-bottom-left-radius: ${troughBorderRadius}px;border-bottom-right-radius: ${troughBorderRadius}px;background-color: ${troughLiquidColor};"></div>
        </div></div>`;
            c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);

            // 如果初始值与目标值不同，且之前已经是有效数据状态，则播放动画
            // 如果是从无数据变有数据，initialProgress 已经被设为 targetProgress，不会进入此块 -> 无动画
            if(initialProgress !== targetProgress){
                 setTimeout(() => {
                     const wrap = document.getElementById(divId);
                     if(wrap){
                         const water = wrap.querySelector('.rcui-tank-water');
                         const waterHide = wrap.querySelector('.rcui-tank-water_hide');
                         if(water){
                             let diff = Math.abs(parseFloat(targetProgress) - parseFloat(initialProgress));
                             let ms = Math.max(200, Math.min(1000, diff * 15));
                             water.style.transition = `height ${ms}ms ease-out`;
                             if(waterHide) waterHide.style.transition = `height ${ms}ms ease-out`;
                             water.style.height = targetProgress;
                             if(waterHide) waterHide.style.height = targetProgress;
                         }
                     }
                 }, 50);
            }
        }catch (e) {
            console.log(e);
        }
    }
};
