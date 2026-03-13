/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

export default mxRcTableView;

function mxRcTableView(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRcTableView, mxShape);
mxRcTableView.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRcTableView',
};
mxRcTableView.prototype.paintVertexShape = function (c, x, y, w, h) {
    try{
        this.foreground(c, x, y, w, h);
    }catch(e){
        console.log(e);
    }
};
mxRcTableView.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'div_' + this.state.cell.id;
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        cell.setAttribute('divId', divId);
        var htmlStr = '';
        let borderColor = style.borderColor || '#EEEEEE';
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
        let tableHeaderConfig = mxUtils.getValue(style, 'tableHeaderConfig', encodeURIComponent('{}'));
        let tableHeaderBgColor = mxUtils.getValue(style, 'tableHeaderBgColor', '#00000000');
        let tableHeaderFontColor = mxUtils.getValue(style, 'tableHeaderFontColor', '#000000');
        let tableHeaderFontSize = mxUtils.getValue(style, 'tableHeaderFontSize', 15);
        let tableHeaderFontStyle = mxUtils.getValue(style, 'tableHeaderFontStyle', 'normal');
        let tableHeaderFontWeight = mxUtils.getValue(style, 'tableHeaderFontWeight', 'normal');
        let listData = mxUtils.getValue(style, 'listData', encodeURIComponent(JSON.stringify([])));
        listData = JSON.parse(decodeURIComponent(listData));
        tableHeaderConfig = JSON.parse(decodeURIComponent(tableHeaderConfig));
        console.log('mxRcTableView-listData', listData);
        if(tableHeaderConfig == null || !tableHeaderConfig.headers || tableHeaderConfig.headers.length < 1){
            htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" class="singleImage" style="${hasBorder ? `border: ${border}; ${borderSpace ? `border-spacing:${borderSpace};` : ''}` : ''} ${hasRadius ? `border-radius:${borderRadius}px;` : ''} width: ${w}px;height: ${h}px;background: ${background};padding:${style.perimeterSpacing || 0}px;box-sizing:border-box;overflow: hidden;">
                <div style="width: ${w}px;height: ${h}px;line-height: ${h}px;text-align:center;font-size:18px;">表格内容区域</div>
            </div>`;
        }else{
            let headerRowCount = tableHeaderConfig.headers.reduce((t, row) => {
                return t + (row.columns && row.columns.length > 0 ? 1 : 0);
            }, 0);
            console.log('headerRowCount', headerRowCount);
            let columns = [];
            for (let i = 0; i < headerRowCount; i++) {
                const row = tableHeaderConfig.headers[i];
                for (let j = 0; j < row.columns.length; j++) {
                    const column = row.columns[j];
                    if(i + parseInt(column.rowspan ? column.rowspan : '1') == headerRowCount){
                        columns.push(JSON.parse(JSON.stringify(column)));
                    }
                }
            }
            columns = columns.sort(function(a, b){
                let aIndex = a.colIndex ? parseInt(a.colIndex) : 0;
                let bIndex = b.colIndex ? parseInt(b.colIndex) : 0;
                console.log('sort', aIndex, bIndex, aIndex < bIndex);
                return aIndex - bIndex;
            });
            console.log('columns', columns);

            htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" class="singleImage" style="${hasBorder ? `border: ${border}; ${borderSpace ? `border-spacing:${borderSpace};` : ''}` : ''} ${hasRadius ? `border-radius:${borderRadius}px;` : ''} width: ${w}px;height: ${h}px;background: ${background};padding:${style.perimeterSpacing || 0}px;box-sizing:border-box;overflow: hidden;">
            <style>
                #${divId}-table td{
                    border-color: ${borderColor};
                    text-align: center;
                }
            </style>
            <table id="${divId}-table" class="rcui-table" lay-filter="parse-table-demo" style="margin: 0px;background:none;table-layout: fixed;">
            <thead>
                ${tableHeaderConfig.headers.reduce((t, row, i) => {
                    if(row.columns && row.columns.length > 0){
                        return t + `<tr>${row.columns.reduce((cs, column, j) => {
                            return cs + `<td style="${column.width ? `width:${column.width}px;` : ''} background:${tableHeaderBgColor};color:${tableHeaderFontColor};font-size:${tableHeaderFontSize}px;font-style:${tableHeaderFontStyle};font-weight:${tableHeaderFontWeight};" colspan="${column.colspan ? column.colspan : 1}" rowspan="${column.rowspan ? column.rowspan : 1}">${column.name}</td>`
                        }, '')}</tr>`;
                    }
                    return t;
                }, '')}
            </thead>
            <tbody>
                ${listData.length <= 0 ? `<tr>
                    <td colspan="${columns.length}">
                    <div style="width: 100%;height: ${h - headerRowCount * 40 - 18}px;line-height: ${h - headerRowCount * 40 - 18}px;text-align:center;font-size:18px;">无数据</div>  
                    </td>
                </tr>` : listData.reduce((trow, row) => {
                    return trow + `<tr>
                        ${columns.reduce((tcol, column) => {
                            return tcol + `<td>${row[column.key] ? row[column.key] : ''}</td>`;
                        }, '')}
                    </tr>`
                }, '')}
            </tbody>
        </table></div>`;
        }

        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);

    }
};

