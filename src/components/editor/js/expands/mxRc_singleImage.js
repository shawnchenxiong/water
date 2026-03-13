/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

export default mxRc_singleImage;

function mxRc_singleImage(bounds, fill, stroke, strokewidth) {
    mxShape.call(this), (this.bounds = bounds), (this.fill = fill), (this.stroke = stroke), (this.strokewidth = null != strokewidth ? strokewidth : 1);
}

mxUtils.extend(mxRc_singleImage, mxShape);

mxRc_singleImage.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.singleImage',
    SHAPE_RACK_CABINET_LEG: 'mxgraph.rc.singleImage',
};
mxRc_singleImage.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_singleImage.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        const cell = this.state.cell;
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        const imgId = 'img_singleImage_' + this.state.cell.id;
        const divId = 'div_' + this.state.cell.id;
        cell.setAttribute('divId', divId);
        const imgUrl = `${mxUtils.fixImg(this.style.imgUrl)}`
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
        htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" class="singleImage" style="${hasBorder ? `border: ${border}; ${borderSpace ? `border-spacing:${borderSpace};` : ''}` : ''} ${hasRadius ? `border-radius:${borderRadius}px;` : ''} width: ${w}px;height: ${h}px;background: ${background};padding:${style.perimeterSpacing || 0}px;box-sizing:border-box;overflow: hidden;">
    <img id="${imgId}" crossOrigin="*" src="${imgUrl}" style="width:100%;height:100%;object-fit:fill"/>
</div>`;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
    }
};
