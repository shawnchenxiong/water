/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

export default mxRc_htmlTextarea;

function mxRc_htmlTextarea(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_htmlTextarea, mxShape);
mxRc_htmlTextarea.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_htmlTextarea',
};
mxRc_htmlTextarea.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_htmlTextarea.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'div_' + this.state.cell.id;
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        cell.setAttribute('divId', divId);
        let fontSize = style.fontSize;
        let fontColor = style.fontColor;
        let textareaRows = style.textareaRows;
        let placeholderText = style.placeholderText;
        let text = '';
        text = cell.getValue();
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
        htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" class="singleImage" style="width: ${w}px;height: ${h}px;padding:10px;box-sizing:border-box;overflow: hidden;">
    <textarea class="inputEle rcui-textarea" rows="${textareaRows ? textareaRows : '4'}" placeholder="${placeholderText ? placeholderText : ''}" style="${hasBorder ? `border: ${border}; ${borderSpace ? `border-spacing:${borderSpace};` : ''}` : ''} ${hasRadius ? `border-radius:${borderRadius}px;` : ''} width: 100%;height: 100%;background: ${background};padding:${style.perimeterSpacing || 0}px;box-sizing:border-box;font-size: ${fontSize}px;color: ${fontColor};${fontStyle}">
        ${text ? text : ''}
    </textarea>
</div>`;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);

    }
};

