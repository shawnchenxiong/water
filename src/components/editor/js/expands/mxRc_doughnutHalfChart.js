/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_doughnutHalfChart;

function mxRc_doughnutHalfChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_doughnutHalfChart, mxShape);
mxRc_doughnutHalfChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_doughnutHalfChart',
};
mxRc_doughnutHalfChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_doughnutHalfChart.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'div_' + this.state.cell.id;
        const graph = this.state.view.graph;
        cell.setAttribute('divId', divId);

        let htmlStr = `
            <div id="${divId}" class="rc_custom_view_outer_div" style="width: ${w}px;height: ${h}px;overflow: hidden">
            </div>
        `;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
        setTimeout(() => {
            this.renderChart(divId, this.getChartConfigOption())
        },)
    }
};

mxRc_doughnutHalfChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
        option =  {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center',
                // doesn't perfectly work with our tricks, disable it
                selectedMode: false
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '70%'],
                    // adjust the start angle
                    startAngle: 180,
                    label: {
                        show: true,
                        formatter(param) {
                            // correct the percentage
                            return param.name + ' (' + param.percent * 2 + '%)';
                        }
                    },
                    data: [
                        { value: 1048, name: 'Search Engine' },
                        { value: 735, name: 'Direct' },
                        { value: 580, name: 'Email' },
                        { value: 484, name: 'Union Ads' },
                        { value: 300, name: 'Video Ads' },
                        {
                            // make an record to fill the bottom 50%
                            value: 1048 + 735 + 580 + 484 + 300,
                            itemStyle: {
                                // stop the chart from rendering this piece
                                color: 'none',
                                decal: {
                                    symbol: 'none'
                                }
                            },
                            label: {
                                show: false
                            }
                        }
                    ]
                }
            ]
        };
    }else{
        let styleConfig = this.style['chartConfig'];
        if(mxUtils.isNotNullOrUndefined(styleConfig)){
            styleConfig = decodeURIComponent(styleConfig);
            console.log('chartConfig', styleConfig);
            if(mxUtils.isJSON(styleConfig)){
                console.log('chartConfig', styleConfig);
                try{
                    styleConfig = JSON.parse(styleConfig);
                    console.log('chartConfig解析成功', styleConfig);
                    option = styleConfig;
                }catch (e) {
                    console.log('chartConfig解析异常', e);
                }
            }else{
                console.log('chartConfig非json字符串')
            }
        }else{
            console.log('chartConfig为空')
        }
    }
    return option;
};
mxRc_doughnutHalfChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};
