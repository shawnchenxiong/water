import * as echarts from 'echarts';

// 引入所需的图表类型，例如 line chart 和 bar chart

import {BarChart, LineChart, PieChart, RadarChart} from "echarts/charts";
import {GridComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";

echarts.use([BarChart, LineChart, PieChart, RadarChart, GridComponent, CanvasRenderer]);

// 将配置好的 ECharts 导出
export default echarts;
