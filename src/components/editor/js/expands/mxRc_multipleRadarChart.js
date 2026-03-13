/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_multipleRadarChart;

function mxRc_multipleRadarChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_multipleRadarChart, mxShape);
mxRc_multipleRadarChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_multipleRadarChart',
};
mxRc_multipleRadarChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_multipleRadarChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_multipleRadarChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
      option = {
        title: {
          text: 'Multiple Radar'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 'center',
          data: [
            'A Software',
            'A Phone',
            'Another Phone',
            'Precipitation',
            'Evaporation'
          ]
        },
        radar: [
          {
            indicator: [
              { text: 'Brand', max: 100 },
              { text: 'Content', max: 100 },
              { text: 'Usability', max: 100 },
              { text: 'Function', max: 100 }
            ],
            center: ['25%', '40%'],
            radius: 80
          },
          {
            indicator: [
              { text: 'Look', max: 100 },
              { text: 'Photo', max: 100 },
              { text: 'System', max: 100 },
              { text: 'Performance', max: 100 },
              { text: 'Screen', max: 100 }
            ],
            radius: 80,
            center: ['50%', '60%']
          },
          {
            indicator: (function () {
              var res = [];
              for (var i = 1; i <= 12; i++) {
                res.push({ text: i + '月', max: 100 });
              }
              return res;
            })(),
            center: ['75%', '40%'],
            radius: 80
          }
        ],
        series: [
          {
            type: 'radar',
            tooltip: {
              trigger: 'item'
            },
            areaStyle: {},
            data: [
              {
                value: [60, 73, 85, 40],
                name: 'A Software'
              }
            ]
          },
          {
            type: 'radar',
            radarIndex: 1,
            areaStyle: {},
            data: [
              {
                value: [85, 90, 90, 95, 95],
                name: 'A Phone'
              },
              {
                value: [95, 80, 95, 90, 93],
                name: 'Another Phone'
              }
            ]
          },
          {
            type: 'radar',
            radarIndex: 2,
            areaStyle: {},
            data: [
              {
                name: 'Precipitation',
                value: [
                  2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 75.6, 82.2, 48.7, 18.8, 6.0, 2.3
                ]
              },
              {
                name: 'Evaporation',
                value: [
                  2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 35.6, 62.2, 32.6, 20.0, 6.4, 3.3
                ]
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

mxRc_multipleRadarChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};


