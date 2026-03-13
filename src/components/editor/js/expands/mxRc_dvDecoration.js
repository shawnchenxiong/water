/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import {
    DvDecoration1,
    DvDecoration10,
    DvDecoration11,
    DvDecoration12,
    DvDecoration2,
    DvDecoration3,
    DvDecoration4,
    DvDecoration5,
    DvDecoration6,
    DvDecoration7,
    DvDecoration8,
    DvDecoration9
} from "../plugins/DvExpands";

export default mxRc_dvDecoration;

function mxRc_dvDecoration(bounds, fill, stroke, strokewidth) {
    mxShape.call(this), (this.bounds = bounds), (this.fill = fill), (this.stroke = stroke), (this.strokewidth = null != strokewidth ? strokewidth : 1);
}

mxUtils.extend(mxRc_dvDecoration, mxShape);
mxRc_dvDecoration.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.datavdvDecoration',
};
mxRc_dvDecoration.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_dvDecoration.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        const cell = this.state.cell;
        const divId = 'div_' + this.state.cell.id;
        // cell.setAttribute('divId', divId);
        const varvalue = this.style.varvalue;
        const htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div datav-decoration-container" style="width: ${w}px;height: ${h}px;font-size: 14px;">
			${this.repaintHtml(varvalue, w, h)}
		</div>`;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
    }
};
mxRc_dvDecoration.prototype.repaintHtml = function (value, w, h) {
    console.log('mxRc_dvDecoration.prototype.repaintHtml', value, w, h);
    var html = '';
    if (value == 1) {
        html = new DvDecoration1(w, h).content;
    } else if (value == 2) {
        html = new DvDecoration2(w, h).content;
    } else if (value == 3) {
        html = new DvDecoration3(w, h).content;
    } else if (value == 4) {
        html = new DvDecoration4(w, h).content;
    } else if (value == 5) {
        html = new DvDecoration5(w, h).content;
    } else if (value == 6) {
        html = new DvDecoration6(w, h).content;
    } else if (value == 7) {
        html = new DvDecoration7(w, h).content;
    } else if (value == 8) {
        html = new DvDecoration8(w, h).content;
    } else if (value == 9) {
        html = new DvDecoration9(w, h).content;
    } else if (value == 10) {
        html = new DvDecoration10(w, h).content;
    } else if (value == 11) {
        html = new DvDecoration11(w, h).content;
    } else if (value == 12) {
        html = new DvDecoration12(w, h).content;
    }
    return html;
};
