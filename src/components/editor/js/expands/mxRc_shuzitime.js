/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

import moment from "../utils/moment";
import usrUtils from '../utils/usrUtils';
export default mxRc_shuzitime;

function mxRc_shuzitime(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_shuzitime, mxShape);
mxRc_shuzitime.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_shu_zi_time',
};
mxRc_shuzitime.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_shuzitime.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        let divId = 'div_' + cell.id;
        cell.setAttribute('divId', divId);
        let fontSize = style.fontSize;
        let fontColor = style.fontColor;
        let align = style.align || 'center';
        let verticalAlign = style.verticalAlign || 'middle';
        let fontStyle = style.fontStyle || '';
        fontStyle = mxUtils.cssForFontStyle(fontStyle);
        var htmlStr = '';
            let background = style.fillColor || 'none';
            if(background != 'none'){
                if(style.gradientColor){
                    let d = style.gradientDirection || 'south';
                    background = `linear-gradient(to ${d == 'south' ? 'top' : d == 'north' ? 'bottom' : d == 'east' ? 'right' :  'left'},${background},${style.gradientColor})`;
                }
            }
            let hasBorder = style.strokeColor && style.strokeWidth;
            let borderStyle = 'solid';
            let borderSpace = '';
            if(style.dashed == 1){
                let dashPattern = style.dashPattern || '10 10';
                if(dashPattern){
                    dashPattern = dashPattern.split(' ');
                    if(dashPattern[0] == '1'){
                        borderStyle = 'dotted';
                        borderSpace = `${dashPattern[1]}px`;
                    }else{
                        borderStyle = 'dashed';
                        borderSpace = `${dashPattern[0]}px ${dashPattern[1]}px`;
                    }
                }
            }
            let hasRadius = style.rounded == '1' && style.arcSize;
            let borderRadius = hasRadius ? (style.arcSize || 1) : 0;
            let border = hasBorder ? `${style.strokeWidth}px ${borderStyle} ${style.strokeColor}` : '';
            let timeFormat = mxUtils.getValue(style, 'timeFormat', '0');
            htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" style="${hasBorder ? `border: ${border}; ${borderSpace ? `border-spacing:${borderSpace};` : ''}` : ''} ${hasRadius ? `border-radius:${borderRadius}px;` : ''} width: ${w}px;height: ${h}px;font-size: ${fontSize}px;color: ${fontColor};text-align: ${align};line-height: ${h}px;overflow: hidden;${fontStyle};background: ${background};padding:${style.perimeterSpacing || 0}px;box-sizing:border-box;overflow: hidden;">
    <span style="line-height: ${fontSize}px;vertical-align: ${verticalAlign};">
        ${this.repaintHtml(timeFormat, divId)}
    </span>
</div>`;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
        /*if (graph.isChromeless) {

        }*/
        if (this.timeInterval) clearInterval(this.timeInterval);
        this.timeInterval = undefined;
        this.timeInterval = setInterval(() => {
            const ele = document.getElementById(divId);
            if (ele) {
                let children = ele.children;
                let c = children[0];
                c.innerHTML = this.repaintHtml(timeFormat, divId);
            }
        }, 1000);
    }
};
mxRc_shuzitime.prototype.repaintHtml = function (timeFormat, divId) {
    if ('0' == timeFormat) {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }
    if ('1' == timeFormat) {
        return moment().format('YYYY-MM-DD');
    }
    if ('2' == timeFormat) {
        return moment().format('YYYY-MM');
    }
    if ('3' == timeFormat) {
        return moment().format('MM-DD');
    }
    if ('4' == timeFormat) {
        return moment().format('HH:mm:ss');
    }
    if ('5' == timeFormat) {
        return moment().format('HH:mm');
    }
    if ('6' == timeFormat) {
        return moment().format('mm:ss');
    }
    if ('7' == timeFormat) {
        return moment().format('YYYY年MM月DD日 HH:mm:ss');
    }
    if ('8' == timeFormat) {
        return moment().format('YYYY年MM月DD日');
    }
    if ('9' == timeFormat) {
        return moment().format('YYYY年MM月');
    }
    if ('10' == timeFormat) {
        return moment().format('MM月DD日');
    }
    return moment().format('YYYY-MM-DD HH:mm:ss');
};

