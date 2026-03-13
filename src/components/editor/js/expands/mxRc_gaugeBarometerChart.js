/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_gaugeBarometerChart;

function mxRc_gaugeBarometerChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_gaugeBarometerChart, mxShape);
mxRc_gaugeBarometerChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_gaugeBarometerChart',
};
mxRc_gaugeBarometerChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_gaugeBarometerChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_gaugeBarometerChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
      option = {
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: '80%',
            axisLine: {
              lineStyle: {
                color: [[1, '#f00']],
                width: 3
              }
            },
            splitLine: {
              distance: -18,
              length: 18,
              lineStyle: {
                color: '#f00'
              }
            },
            axisTick: {
              distance: -12,
              length: 10,
              lineStyle: {
                color: '#f00'
              }
            },
            axisLabel: {
              distance: -50,
              color: '#f00',
              fontSize: 25
            },
            anchor: {
              show: true,
              size: 20,
              itemStyle: {
                borderColor: '#000',
                borderWidth: 2
              }
            },
            pointer: {
              offsetCenter: [0, '10%'],
              icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
              length: '115%',
              itemStyle: {
                color: '#000'
              }
            },
            detail: {
              valueAnimation: true,
              precision: 1
            },
            title: {
              offsetCenter: [0, '-50%']
            },
            data: [
              {
                value: 58.46,
                name: 'PLP'
              }
            ]
          },
          {
            type: 'gauge',
            min: 0,
            max: 60,
            splitNumber: 6,
            axisLine: {
              lineStyle: {
                color: [[1, '#000']],
                width: 3
              }
            },
            splitLine: {
              distance: -3,
              length: 18,
              lineStyle: {
                color: '#000'
              }
            },
            axisTick: {
              distance: 0,
              length: 10,
              lineStyle: {
                color: '#000'
              }
            },
            axisLabel: {
              distance: 10,
              fontSize: 25,
              color: '#000'
            },
            pointer: {
              show: false
            },
            title: {
              show: false
            },
            anchor: {
              show: true,
              size: 14,
              itemStyle: {
                color: '#000'
              }
            }
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

mxRc_gaugeBarometerChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);

    /* setInterval(function () {
      myChart.setOption({
        series: [
          {
            type: 'gauge',
            data: [
              {
                value: +(Math.random() * 100).toFixed(2),
                name: 'PLP'
              }
            ]
          }
        ]
      });
    }, 2000); */
};


