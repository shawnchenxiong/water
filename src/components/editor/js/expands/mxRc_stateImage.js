/* eslint-disable */
import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

export default mxRc_stateImage;

function mxRc_stateImage(bounds, fill, stroke, strokewidth) {
    mxShape.call(this), (this.bounds = bounds), (this.fill = fill), (this.stroke = stroke), (this.strokewidth = null != strokewidth ? strokewidth : 1);
};

mxUtils.extend(mxRc_stateImage, mxShape);

mxRc_stateImage.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_stateImage',
};
mxRc_stateImage.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_stateImage.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        try{
            const cell = this.state.cell;
            const graph = this.state.view.graph;
            const style = graph.getCellStyle(cell);
            const imgId = 'img_mxRc_stateImage_' + this.state.cell.id;
            const divId = 'div_' + this.state.cell.id;
            cell.setAttribute('divId', divId);
            cell.setAttribute('imgId', imgId);
            let stateImg = style['stateImage'];
            if(mxUtils.isNullOrUndefined(stateImg) || stateImg.trim().length <= 0){
                stateImg = style['defaultImg'];
            }
            stateImg = mxUtils.fixImg(stateImg);
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
            <img id="${imgId}" crossOrigin="*" src="${stateImg}" style="width:100%;height:100%;object-fit:fill"/>
    </div>`;
            c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
        }catch (e) {
            console.log('mxRc_stateImage.prototype.foreground--error', e);
        }
    }
};
