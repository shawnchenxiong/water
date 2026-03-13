/* eslint-disable */

import {
    mxActor,
    mxCellRenderer,
    mxConnectionConstraint,
    mxConstants,
    mxPoint,
    mxShape,
    mxUtils
} from "../../core/mxgraph";

import {Graph} from "../Graph";
export default mxShapeBasicTwoCornerRoundRect;
function mxShapeBasicTwoCornerRoundRect(a, d, e, b) {
    mxShape.call(this);
    this.bounds = a;
    this.fill = d;
    this.stroke = e;
    this.strokewidth = null != b ? b : 1;
    this.dx = 0.5;
}

mxUtils.extend(mxShapeBasicTwoCornerRoundRect, mxActor);
mxShapeBasicTwoCornerRoundRect.prototype.customProperties = [
    {
        name: 'dx',
        dispName: 'Rounding Size',
        type: 'float',
        min: 0,
        defVal: 6,
    },
];
mxShapeBasicTwoCornerRoundRect.prototype.cst = { TWO_CORNER_ROUND_RECT: 'mxgraph.basic.two_corner_round_rect' };
mxShapeBasicTwoCornerRoundRect.prototype.paintVertexShape = function (a, d, e, b, c) {
    a.translate(d, e);
    d = 2 * Math.max(0, Math.min(b, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
    d = Math.min(0.5 * b, 0.5 * c, d);
    a.begin();
    a.moveTo(d, 0);
    a.lineTo(b - d, 0);
    a.arcTo(d, d, 0, 0, 1, b, d);
    a.lineTo(b, c);
    a.lineTo(0, c);
    a.lineTo(0, d);
    a.arcTo(d, d, 0, 0, 1, d, 0);
    a.close();
    a.fillAndStroke();
};

mxShapeBasicTwoCornerRoundRect.prototype.constraints = null;
Graph.handleFactory[mxShapeBasicTwoCornerRoundRect.prototype.cst.TWO_CORNER_ROUND_RECT] = function (a) {
    return [
        Graph.createHandle(
            a,
            ['dx'],
            function (d) {
                var e = Math.max(0, Math.min(d.width / 4, d.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));
                return new mxPoint(d.x + e, d.y + e);
            },
            function (d, e) {
                this.state.style.dx = Math.round(100 * Math.max(0, Math.min(d.height / 4, d.width / 4, e.x - d.x))) / 100;
            }
        ),
    ];
};
mxShapeBasicTwoCornerRoundRect.prototype.getConstraints = function (a, d, e) {
    a = [];
    a.push(new mxConnectionConstraint(new mxPoint(0.5, 0), !1));
    a.push(new mxConnectionConstraint(new mxPoint(1, 0), !1));
    a.push(new mxConnectionConstraint(new mxPoint(1, 0.5), !1));
    a.push(new mxConnectionConstraint(new mxPoint(1, 1), !1));
    a.push(new mxConnectionConstraint(new mxPoint(0.5, 1), !1));
    a.push(new mxConnectionConstraint(new mxPoint(0, 1), !1));
    a.push(new mxConnectionConstraint(new mxPoint(0, 0.5), !1));
    return a;
};
