/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_gaugeStageChart;

function mxRc_gaugeStageChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_gaugeStageChart, mxShape);
mxRc_gaugeStageChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_gaugeStageChart',
};
mxRc_gaugeStageChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_gaugeStageChart.prototype.foreground = function (c, x, y, w, h) {
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
            this.renderChart(divId, this.getChartConfigOption());
        }, 1)
    }
};

mxRc_gaugeStageChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
      option = {
        series: [
          {
            type: 'gauge',
            axisLine: {
              lineStyle: {
                width: 30,
                color: [
                  [0.3, '#67e0e3'],
                  [0.7, '#37a2da'],
                  [1, '#fd666d']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 2
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 4
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: 40,
              fontSize: 20
            },
            detail: {
              valueAnimation: true,
              formatter: '{value} km/h',
              color: 'inherit'
            },
            data: [
              {
                value: 70
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

mxRc_gaugeStageChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
    /* setInterval(function () {
      myChart.setOption({
        series: [
          {
            data: [
              {
                value: +(Math.random() * 100).toFixed(2)
              }
            ]
          }
        ]
      });
    }, 2000); */
};


