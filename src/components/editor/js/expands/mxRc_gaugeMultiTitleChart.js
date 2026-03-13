/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_gaugeMultiTitleChart;

function mxRc_gaugeMultiTitleChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_gaugeMultiTitleChart, mxShape);
mxRc_gaugeMultiTitleChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_gaugeMultiTitleChart',
};
mxRc_gaugeMultiTitleChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_gaugeMultiTitleChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_gaugeMultiTitleChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
      const gaugeData = [
        {
          value: 20,
          name: 'Good',
          title: {
            offsetCenter: ['-40%', '80%']
          },
          detail: {
            offsetCenter: ['-40%', '95%']
          }
        },
        {
          value: 40,
          name: 'Better',
          title: {
            offsetCenter: ['0%', '80%']
          },
          detail: {
            offsetCenter: ['0%', '95%']
          }
        },
        {
          value: 60,
          name: 'Perfect',
          title: {
            offsetCenter: ['40%', '80%']
          },
          detail: {
            offsetCenter: ['40%', '95%']
          }
        }
      ];
      option = {
        series: [
          {
            type: 'gauge',
            anchor: {
              show: true,
              showAbove: true,
              size: 18,
              itemStyle: {
                color: '#FAC858'
              }
            },
            pointer: {
              icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
              width: 8,
              length: '80%',
              offsetCenter: [0, '8%']
            },
            progress: {
              show: true,
              overlap: true,
              roundCap: true
            },
            axisLine: {
              roundCap: true
            },
            data: gaugeData,
            title: {
              fontSize: 14
            },
            detail: {
              width: 40,
              height: 14,
              fontSize: 14,
              color: '#fff',
              backgroundColor: 'inherit',
              borderRadius: 3,
              formatter: '{value}%'
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

mxRc_gaugeMultiTitleChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
    const gaugeData = [
      {
        value: 20,
        name: 'Good',
        title: {
          offsetCenter: ['-40%', '80%']
        },
        detail: {
          offsetCenter: ['-40%', '95%']
        }
      },
      {
        value: 40,
        name: 'Better',
        title: {
          offsetCenter: ['0%', '80%']
        },
        detail: {
          offsetCenter: ['0%', '95%']
        }
      },
      {
        value: 60,
        name: 'Perfect',
        title: {
          offsetCenter: ['40%', '80%']
        },
        detail: {
          offsetCenter: ['40%', '95%']
        }
      }
    ];
    /* setInterval(function () {
      gaugeData[0].value = +(Math.random() * 100).toFixed(2);
      gaugeData[1].value = +(Math.random() * 100).toFixed(2);
      gaugeData[2].value = +(Math.random() * 100).toFixed(2);
      myChart.setOption({
        series: [
          {
            data: gaugeData
          }
        ]
      });
    }, 2000); */
};


