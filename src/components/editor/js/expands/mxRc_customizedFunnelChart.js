/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_customizedFunnelChart;

function mxRc_customizedFunnelChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_customizedFunnelChart, mxShape);
mxRc_customizedFunnelChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_customizedFunnelChart',
};
mxRc_customizedFunnelChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_customizedFunnelChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_customizedFunnelChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
      option = {
        title: {
          text: 'Funnel'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        legend: {
          data: ['Show', 'Click', 'Visit', 'Inquiry', 'Order']
        },
        series: [
          {
            name: 'Expected',
            type: 'funnel',
            left: '10%',
            width: '80%',
            label: {
              formatter: '{b}Expected'
            },
            labelLine: {
              show: false
            },
            itemStyle: {
              opacity: 0.7
            },
            emphasis: {
              label: {
                position: 'inside',
                formatter: '{b}Expected: {c}%'
              }
            },
            data: [
              { value: 60, name: 'Visit' },
              { value: 40, name: 'Inquiry' },
              { value: 20, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' }
            ]
          },
          {
            name: 'Actual',
            type: 'funnel',
            left: '10%',
            width: '80%',
            maxSize: '80%',
            label: {
              position: 'inside',
              formatter: '{c}%',
              color: '#fff'
            },
            itemStyle: {
              opacity: 0.5,
              borderColor: '#fff',
              borderWidth: 2
            },
            emphasis: {
              label: {
                position: 'inside',
                formatter: '{b}Actual: {c}%'
              }
            },
            data: [
              { value: 30, name: 'Visit' },
              { value: 10, name: 'Inquiry' },
              { value: 5, name: 'Order' },
              { value: 50, name: 'Click' },
              { value: 80, name: 'Show' }
            ],
            // Ensure outer shape will not be over inner shape when hover.
            z: 100
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

mxRc_customizedFunnelChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};


