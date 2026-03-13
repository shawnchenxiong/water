/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";

import echarts from "./echarts-common.js";

export default mxRc_smoothLineChart;


/*
{
    title: '曲线图',
    titleTextSize: '14px',
    titleTextColor: '#FFFFFF',
    xAxisLineColor: '#FFFFFF',
    yAxisLineColor: '#FFFFFF',
    xAxisLabelColor: '#FFFFFF',
    yAxisLabelColor: '#FFFFFF',
    xlabelText: '时刻',
    xlabelTextSize: '14px',
    xlabelTextColor: '#000000',
    ylabelText: '电压（V）',
    ylabelTextSize: '14px',
    ylabelTextColor: '#000000',
    lineColor: '#2AB500',
    pointColor: '#FFFFFF',
    pointSize: 5,
    hoverColor: '#FF0000',
    margins: {top: 60, left: 60, bottom: 50, right: 20},
    gridXColor: '#E5E3DF',
    gridYColor: '#E5E3DF',
    showGridX: ['04', '08', '12', '16', '20', '24'],
    showGridY: [2.0, 4.0, 6.0, 8.0, 10.0],
    gridXDash: '2 2',
    gridYDash: '2 2',
    animateDuration: 1000,
    data: [
        {key: '02', value: 2, tip: '电压：2'},
        {key: '04', value: 3, tip: '电压：3'},
        {key: '06', value: 5, tip: '电压：5'},
        {key: '08', value: 6, tip: '电压：6'},
        {key: '10', value: 2.5, tip: '电压：2.5'},
        {key: '12', value: 4.5, tip: '电压：4.5'},
        {key: '14', value: 3.3, tip: '电压：3.3'},
        {key: '16', value: 8.6, tip: '电压：8.6'},
        {key: '18', value: 1.3, tip: '电压：1.3'},
        {key: '20', value: 7.8, tip: '电压：7.8'},
        {key: '22', value: 9.1, tip: '电压：9.1'},
        {key: '24', value: 2.4, tip: '电压：2.4'},
    ]
}

 */
function mxRc_smoothLineChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_smoothLineChart, mxShape);
mxRc_smoothLineChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_smoothLineChart',
};
mxRc_smoothLineChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_smoothLineChart.prototype.foreground = function (c, x, y, w, h) {
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
        }, 1)
    }
};

mxRc_smoothLineChart.prototype.getChartConfigOption = function () {
    var echartsLegendPrefix = 'echartsLegend';
    var echartsLegend = '';
    var echartsLegendArray = [];
    let option = {};
    const graph = this.state.view.graph;
    if (!graph.isChromeless) {
        option = {
            legend: {
                show: true,
                selectedMode: false,
                left: 10
            },
            tooltip: {
                trigger: 'axis',
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'number',
                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                    type: 'line',
                    smooth: true
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

mxRc_smoothLineChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};

