/* eslint-disable */
import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

export default mxRc_blazeSpecialEffects;

function mxRc_blazeSpecialEffects(bounds, fill, stroke, strokewidth) {
    mxShape.call(this), (this.bounds = bounds), (this.fill = fill), (this.stroke = stroke), (this.strokewidth = null != strokewidth ? strokewidth : 1);
};

mxUtils.extend(mxRc_blazeSpecialEffects, mxShape);

mxRc_blazeSpecialEffects.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_blazeSpecialEffects',
};
mxRc_blazeSpecialEffects.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_blazeSpecialEffects.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        try{
            const cell = this.state.cell;
            const graph = this.state.view.graph;
            const style = graph.getCellStyle(cell);
            const imgId = 'img_mxRc_blazeSpecialEffects_' + this.state.cell.id;
            const divId = 'div_' + this.state.cell.id;
            cell.setAttribute('divId', divId);
            cell.setAttribute('imgId', imgId);
            let blazeColor = mxUtils.getValue(style, 'blazeColor', '#FFFFFF');
            let blazeSize = mxUtils.getValue(style, 'blazeSize', 20);
            let blazeLevel = mxUtils.getValue(style, 'blazeLevel', 1);
            if(blazeColor.length > 7){
                blazeColor = blazeColor.substring(0, 7);
            }
            let fireDuration = blazeLevel < 1 ? '0' : blazeLevel == 1 ? '2' : blazeLevel == 2 ? '1' : '0.5';
            const fireColor1 = `${blazeColor}33`;
            const fireColor2 = `${blazeColor}EF`;
            let num = blazeLevel < 1 ? 0 : blazeLevel == 1 ? 30 : blazeLevel == 2 ? 60 : 90;
            let leftSpacing = 30;
            let particle = '';
            for (let i = 0; i < num; i += 1) {
                let r = 4 * Math.random().toFixed(4);
                let l = i / leftSpacing;
                l = l.toFixed(4);
                particle += `<div class="rcui-blaze-particle" style="left:calc((100% - 5px) * ${l});animation-delay:${r}s;"></div>`;
			}
            let htmlStr = `<div id="${divId}"  class="rc_custom_view_outer_div" style="width: ${w}px;height: ${h}px;overflow: hidden;--blur:0.4px;--fireSize: ${blazeSize}px;--fireDuration: ${fireDuration}s;--fireColor1: ${fireColor1};--fireColor2: ${fireColor2};">
            <div class="rcui-blaze-container" style="width: ${w}px;height: ${h}px;--ty:-${h}px;">${particle}</div>
</div>`;
            c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
        }catch (e) {
            console.log('mxRc_blazeSpecialEffects.prototype.foreground--error', e);
        }
    }
};
