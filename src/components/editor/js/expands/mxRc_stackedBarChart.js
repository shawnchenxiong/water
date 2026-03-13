/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";
import Chart from "../plugins/d3/chart";
import * as d3 from '../plugins/d3/d3';

export default mxRc_stackedBarChart;

function mxRc_stackedBarChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_stackedBarChart, mxShape);
mxRc_stackedBarChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_stackedBarChart',
};
mxRc_stackedBarChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_stackedBarChart.prototype.foreground = function (c, x, y, w, h) {
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
            this.renderChart(divId, this.getChartConfigOption());
        }, 1);
    }
};

mxRc_stackedBarChart.prototype.getChartConfigOption = function () {
    var echartsLegendPrefix = 'echartsLegend';
    var echartsLegend = '';
    var echartsLegendArray = [];
    let option = {};
    const graph = this.state.view.graph;
    if (!graph.isChromeless) {
        let series = [
            {
                data: [200, 300, 150, 80, 70, 110, 130],
                type: 'bar',
                stack: 'a',
                name: 'a'
            },
            {
                data: [59, 46, 64, 302, 0, 212, 100],
                type: 'bar',
                stack: 'a',
                name: 'b'
            },
            {
                data: [810, '102', 213, 20, 10, '350', 200],
                type: 'bar',
                stack: 'a',
                name: 'c'
            },
            {
                data: [30, '210', 521, 20, 10, '390', 300],
                type: 'bar',
                stack: 'a',
                name: 'd'
            },
            {
                data: [110, 20, 150, 0, '189', 100, 400],
                type: 'bar',
                stack: 'a',
                name: 'e'
            }
        ];
        const stackInfo = {};
        for (let i = 0; i < series[0].data.length; ++i) {
            for (let j = 0; j < series.length; ++j) {
                const stackName = series[j].stack;
                if (!stackName) {
                    continue;
                }
                if (!stackInfo[stackName]) {
                    stackInfo[stackName] = {
                        stackStart: [],
                        stackEnd: []
                    };
                }
                const info = stackInfo[stackName];
                const data = series[j].data[i];
                if (data && data !== '-') {
                    if (info.stackStart[i] == null) {
                        info.stackStart[i] = j;
                    }
                    info.stackEnd[i] = j;
                }
            }
        }
        for (let i = 0; i < series.length; ++i) {
            const data = series[i].data;
            const info = stackInfo[series[i].stack];
            for (let j = 0; j < series[i].data.length; ++j) {
                // const isStart = info.stackStart[j] === i;
                const isEnd = info.stackEnd[j] === i;
                const topBorder = isEnd ? 0 : 0;
                const bottomBorder = 0;
                data[j] = {
                    value: data[j],
                    itemStyle: {
                        borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder]
                    }
                };
            }
        }
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
            series: series
        };
    } else {
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

mxRc_stackedBarChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};
