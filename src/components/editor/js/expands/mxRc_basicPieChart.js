/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_basicPieChart;

function mxRc_basicPieChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_basicPieChart, mxShape);
mxRc_basicPieChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_basicPieChart',
};
mxRc_basicPieChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_basicPieChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_basicPieChart.prototype.getChartConfigOption = function () {
    var echartsLegendPrefix = 'echartsLegend';
    var echartsLegend = '';
    var echartsLegendArray = [];
    let option = {};
    const graph = this.state.view.graph;
    if (!graph.isChromeless) {
        option = {
            title: {
                text: 'Referer of a Website',
                subtext: 'Fake Data',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                selectedMode: false,
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        {value: 1048, name: 'Search Engine'},
                        {value: 735, name: 'Direct'},
                        {value: 580, name: 'Email'},
                        {value: 484, name: 'Union Ads'},
                        {value: 300, name: 'Video Ads'}
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    } else {
        // 获取图例
        var chartValues = decodeURIComponent(this.style.chartValues);
        if (mxUtils.isNotNullOrUndefined(chartValues)) {
            if (mxUtils.isJSON(chartValues)) {
                try {
                    chartValues = JSON.parse(chartValues);
                    console.log('chartValues 解析成功', chartValues);
                    var echartsLegendItem = echartsLegendPrefix + chartValues.virvarId;
                    echartsLegend = localStorage.getItem(echartsLegendItem);
                    echartsLegendArray = echartsLegend.split(',');
                    console.log('echartsLegendArray', echartsLegendArray);
                } catch (e) {
                    console.log('chartValues 解析异常', e);
                }
            }
        }
        let styleConfig = this.style['chartConfig'];
        if (mxUtils.isNotNullOrUndefined(styleConfig)) {
            styleConfig = decodeURIComponent(styleConfig);
            console.log('chartConfig', styleConfig);
            if (mxUtils.isJSON(styleConfig)) {
                console.log('chartConfig', styleConfig);
                try {
                    styleConfig = JSON.parse(styleConfig);
                    if (mxUtils.isNotNullOrUndefined(echartsLegendArray) && echartsLegendArray.length > 0) {
                        // 配置图例
                        styleConfig.legend = {
                            data: echartsLegendArray,
                            selectedMode: false,
                            orient: 'vertical',
                            left: 'left'
                        };
                        // 配置提示
                        styleConfig.tooltip = {
                            trigger: 'item'
                        };
                        var series = styleConfig.series;
                        // series里面有 name 才能匹配到 legend
                        for (let i = 0; i < series.length; i++) {
                            series[i].name = echartsLegendArray[i];
                        }
                        styleConfig.series = series;
                    }
                    console.log('chartConfig解析成功', styleConfig);
                    option = styleConfig;
                } catch (e) {
                    console.log('chartConfig解析异常', e);
                }
            } else {
                console.log('chartConfig非json字符串')
            }
        } else {
            console.log('chartConfig为空')
        }
    }
    return option;
};
mxRc_basicPieChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};
