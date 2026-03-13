/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";

export default mxRc_multipleBoxplotChart;

function mxRc_multipleBoxplotChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRc_multipleBoxplotChart, mxShape);
mxRc_multipleBoxplotChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_multipleBoxplotChart',
};
mxRc_multipleBoxplotChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};
mxRc_multipleBoxplotChart.prototype.foreground = function (c, x, y, w, h) {
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

mxRc_multipleBoxplotChart.prototype.getChartConfigOption = function () {
    let  option = {};
    const graph = this.state.view.graph;
    if(!graph.isChromeless){
      // Generate data.
      function makeData() {
        let data = [];
        for (let i = 0; i < 18; i++) {
          let cate = [];
          for (let j = 0; j < 100; j++) {
            cate.push(Math.random() * 200);
          }
          data.push(cate);
        }
        return data;
      }
      const data0 = makeData();
      const data1 = makeData();
      const data2 = makeData();
      option = {
        title: {
          text: 'Multiple Categories',
          left: 'center'
        },
        dataset: [
          {
            source: data0
          },
          {
            source: data1
          },
          {
            source: data2
          },
          {
            fromDatasetIndex: 0,
            transform: { type: 'boxplot' }
          },
          {
            fromDatasetIndex: 1,
            transform: { type: 'boxplot' }
          },
          {
            fromDatasetIndex: 2,
            transform: { type: 'boxplot' }
          }
        ],
        legend: {
          top: '10%'
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '10%',
          top: '20%',
          right: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: true
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: 'Value',
          min: -400,
          max: 600,
          splitArea: {
            show: false
          }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 20
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            xAxisIndex: [0],
            start: 0,
            end: 20
          }
        ],
        series: [
          {
            name: 'category0',
            type: 'boxplot',
            datasetIndex: 3
          },
          {
            name: 'category1',
            type: 'boxplot',
            datasetIndex: 4
          },
          {
            name: 'category2',
            type: 'boxplot',
            datasetIndex: 5
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

mxRc_multipleBoxplotChart.prototype.renderChart = function (divId, option) {
    let chartDom = document.getElementById(divId);
    let myChart = echarts.init(chartDom);
    myChart.setOption(option);
};


