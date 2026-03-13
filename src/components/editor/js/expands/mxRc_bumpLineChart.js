/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_bumpLineChart;

function mxRc_bumpLineChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_bumpLineChart, mxShape);
mxRc_bumpLineChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_bumpLineChart',
};
mxRc_bumpLineChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_bumpLineChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_bumpLineChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
        const names = [
            'Orange',
            'Tomato',
            'Apple',
            'Sakana',
            'Banana',
            'Iwashi',
            'Snappy Fish',
            'Lemon',
            'Pasta'
        ];
        const years = ['2001', '2002', '2003', '2004', '2005', '2006'];
        const shuffle = (array) => {
            let currentIndex = array.length;
            let randomIndex = 0;
            while (currentIndex > 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex],
                    array[currentIndex]
                ];
            }
            return array;
        };
        const generateRankingData = () => {
            const map = new Map();
            const defaultRanking = Array.from({ length: names.length }, (_, i) => i + 1);
            for (const _ of years) {
                const shuffleArray = shuffle(defaultRanking);
                names.forEach((name, i) => {
                    map.set(name, (map.get(name) || []).concat(shuffleArray[i]));
                });
            }
            return map;
        };
        const generateSeriesList = () => {
            const seriesList = [];
            const rankingMap = generateRankingData();
            rankingMap.forEach((data, name) => {
                const series = {
                    name,
                    symbolSize: 20,
                    type: 'line',
                    smooth: true,
                    emphasis: {
                        focus: 'series'
                    },
                    endLabel: {
                        show: true,
                        formatter: '{a}',
                        distance: 20
                    },
                    lineStyle: {
                        width: 4
                    },
                    data
                };
                seriesList.push(series);
            });
            return seriesList;
        };
        option =  {
            title: {
                text: 'Bump Chart (Ranking)'
            },
            tooltip: {
                trigger: 'item'
            },
            grid: {
                left: 30,
                right: 110,
                bottom: 30,
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                splitLine: {
                    show: true
                },
                axisLabel: {
                    margin: 30,
                    fontSize: 16
                },
                boundaryGap: false,
                data: years
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    margin: 30,
                    fontSize: 16,
                    formatter: '#{value}'
                },
                inverse: true,
                interval: 1,
                min: 1,
                max: names.length
            },
            series: generateSeriesList()
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
mxRc_bumpLineChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};
