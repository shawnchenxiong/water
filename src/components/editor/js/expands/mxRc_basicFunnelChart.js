/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_basicFunnelChart;

function mxRc_basicFunnelChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_basicFunnelChart, mxShape);
mxRc_basicFunnelChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_basicFunnelChart',
};
mxRc_basicFunnelChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_basicFunnelChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_basicFunnelChart.prototype.getChartConfigOption = function () {
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
            name: 'Funnel',
            type: 'funnel',
            left: '10%',
            top: 60,
            bottom: 60,
            width: '80%',
            min: 0,
            max: 100,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: true,
              position: 'inside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: [
              { value: 60, name: 'Visit' },
              { value: 40, name: 'Inquiry' },
              { value: 20, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' }
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

mxRc_basicFunnelChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};


