/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_stackedAreaChart;

function mxRc_stackedAreaChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_stackedAreaChart, mxShape);
mxRc_stackedAreaChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_stackedAreaChart',
};
mxRc_stackedAreaChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_stackedAreaChart.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'div_' + this.state.cell.id;
        cell.setAttribute('divId', divId);

        let htmlStr = `
            <div id="${divId}" class="rc_custom_view_outer_div" style="width: ${w}px;height: ${h}px;overflow: hidden">
            </div>
        `;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
        setTimeout(() => {
            this.renderChart(divId, this.getChartConfigOption())
        }, 1);
    }
};


mxRc_stackedAreaChart.prototype.getChartConfigOption = function () {
    var echartsLegendPrefix = 'echartsLegend';
    var echartsLegend = '';
    var echartsLegendArray = [];
    let option = {};
    const graph = this.state.view.graph;
    if (!graph.isChromeless) {
        option = {
            title: {
                text: 'Stacked Area Chart'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
            },
            // toolbox: {
            //     feature: {
            //         saveAsImage: {}
            //     }
            // },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Email',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: [120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name: 'Union Ads',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: [220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name: 'Video Ads',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: [150, 232, 201, 154, 190, 330, 410]
                },
                {
                    name: 'Direct',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: [320, 332, 301, 334, 390, 330, 320]
                },
                {
                    name: 'Search Engine',
                    type: 'line',
                    stack: 'Total',
                    label: {
                        show: true,
                        position: 'top'
                    },
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: [820, 932, 901, 934, 1290, 1330, 1320]
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
                            left: 10
                        };
                        // 配置提示
                        styleConfig.tooltip = {
                            trigger: 'axis',
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

mxRc_stackedAreaChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};
