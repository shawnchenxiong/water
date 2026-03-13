/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import {
    DvBorderBox1,
    DvBorderBox10,
    DvBorderBox11,
    DvBorderBox12,
    DvBorderBox13,
    DvBorderBox2,
    DvBorderBox3,
    DvBorderBox4,
    DvBorderBox5,
    DvBorderBox6,
    DvBorderBox7,
    DvBorderBox8,
    DvBorderBox9
} from "../plugins/DvExpands";

export default mxRc_dvBorderBox;

function mxRc_dvBorderBox(bounds, fill, stroke, strokewidth) {
    mxShape.call(this), (this.bounds = bounds), (this.fill = fill), (this.stroke = stroke), (this.strokewidth = null != strokewidth ? strokewidth : 1);
}

mxUtils.extend(mxRc_dvBorderBox, mxShape);

mxRc_dvBorderBox.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.datavdvBorderBox',
};
mxRc_dvBorderBox.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_dvBorderBox.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        const cell = this.state.cell;
        const divId = 'div_' + this.state.cell.id;
        // cell.setAttribute('divId', divId);
        const varvalue = this.style.varvalue;
        const reverse = this.style.reverse && this.style.reverse == '1';
        const htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div datav-border-box-container" style="width: ${w}px;height: ${h}px;font-size: 14px;">
			${this.repaintHtml({value: varvalue, reverse: reverse}, w, h)}
		</div>`;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
    }
};
mxRc_dvBorderBox.prototype.repaintHtml = function (option, w, h) {
    let html = '';
    const value = option.value;
    if (value == 1) {
        html = new DvBorderBox1(w, h, option).content;
    } else if (value == 2) {
        html = new DvBorderBox2(w, h, option).content;
    } else if (value == 3) {
        html = new DvBorderBox3(w, h, option).content;
    } else if (value == 4) {
        html = new DvBorderBox4(w, h, option).content;
    } else if (value == 5) {
        html = new DvBorderBox5(w, h, option).content;
    } else if (value == 6) {
        html = new DvBorderBox6(w, h, option).content;
    } else if (value == 7) {
        html = new DvBorderBox7(w, h, option).content;
    } else if (value == 8) {
        html = new DvBorderBox8(w, h, option).content;
    } else if (value == 9) {
        html = new DvBorderBox9(w, h, option).content;
    } else if (value == 10) {
        html = new DvBorderBox10(w, h, option).content;
    } else if (value == 11) {
        html = new DvBorderBox11(w, h, option).content;
    } else if (value == 12) {
        html = new DvBorderBox12(w, h, option).content;
    } else if (value == 13) {
        html = new DvBorderBox13(w, h, option).content;
    }
    return html;
};
