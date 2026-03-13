/* eslint-disable*/
// 自定义拓展
import { mxConstants, mxUtils } from "../../core/mxgraph";
import { Sidebar } from "../Sidebar";
import api from '../utils/api';

(function () {

    Sidebar.prototype.addAlarmTablePalette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/alarmTableView.jpg`;
        let s = `shape=mxgraph.rc.mxRcAlarmTableView;rcSprop=alarmFontColor,tableHeaderBgColor,tableHeaderFontColor,tableHeaderFontSize,tableHeaderFontStyle,tableHeaderFontWeight;tableHeaderFontSize=15;tableHeaderFontStyle=normal;tableHeaderFontWeight=normal;tableHeaderFontColor=#000000;tableBoderColor=#eeeeee;tableHeaderBgColor=#DCDCDC;readonly=1;igStroke=1;igRound=1;fontColor=#333;fontSize=12;title=告警表格;fillColor=#FFFFFF;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;

        fns.push(this.createVertexTemplateEntry(s, 400, 220, '', '告警表格', true, '', '', mxUtils.staticImg(defaultImg), ''));



        this.addPaletteFunctions('mxRc_SpecialEffects', '告警', false, fns);
    };

    Sidebar.prototype.addCustomStatistic1Palette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_basicBarChart.png`;
        let s = `shape=mxgraph.rc.mxRc_baseBarChar;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=直方图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '直方图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_horizontalBarChart.png`;
        s = `shape=mxgraph.rc.mxRc_horizontalBarChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=横向直方图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '横向直方图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_multiBarChart.png`;
        s = `shape=mxgraph.rc.mxRc_multiBarChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=多列直方图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '多列直方图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_stackedBarChart.png`;
        s = `shape=mxgraph.rc.mxRc_stackedBarChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=堆叠直方图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '堆叠直方图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_stateSwitch', '直方图', false, fns);
    };

    Sidebar.prototype.addCustomStatisticPaletteByron = function (expand) {
        const fns = [];
        // syzz 测试添加图表
        let defaultImg;
        let s;
        api.getModuleInfo().then(res => {
            let groupedData = {};
            res.data.data.forEach(item => {
                let folderTitle = item.folderTitle;
                if (!groupedData[folderTitle]) {
                    groupedData[folderTitle] = [];
                }
                groupedData[folderTitle].push(item);
            });
            console.log('groupedDatagroupedDatagroupedData', groupedData)
            const folderTitles = Object.keys(groupedData);
            // 使用 forEach 遍历，同时获取索引和文件夹标题
            folderTitles.forEach((folderTitle, index) => {
                let fns = [];
                groupedData[folderTitle].forEach(item => {
                    // 保持原有逻辑不变
                    let newContent = 'let option;' + item.code;
                    let option = eval(newContent);
                    console.log('option:', option);
                    console.log('option JSON:', JSON.stringify(option));

                    let defaultImg = item.img;
                    let s = `shape=mxgraph.rc.mxDynamicChart;chartOption=${JSON.stringify(option)};igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=${item.legendTitle};opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
                    fns.push(this.createVertexTemplateEntry(s, 600, 600, '', item.legendTitle, true, '', '', defaultImg, ''));
                });
                if (index === 0) {
                    this.addPaletteFunctions('byron', folderTitle, null == expand || expand, fns);
                } else {
                    this.addPaletteFunctions('byron', folderTitle, false, fns);
                }
            });
        })
    }


    Sidebar.prototype.addCustomStatistic2Palette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_basicLineChart.png`;
        let s = `shape=mxgraph.rc.mxRc_basicLineChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=折线图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '折线图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_basicLineAreaChart.png`;
        s = `shape=mxgraph.rc.mxRc_basicLineAreaChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=折线图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '基础面积图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_stackAreaChart.png`;
        s = `shape=mxgraph.rc.mxRc_stackedAreaChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=堆叠面积图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '堆叠面积图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_smoothLineChart.png`;
        s = `shape=mxgraph.rc.mxRc_smoothLineChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=曲线图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '曲线图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_smoothLineChart.png`;
        s = `shape=mxgraph.rc.mxRc_parallelLineChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=平行坐标系折线图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '平行坐标系折线图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_areaStackGradientLineChart.png`;
        s = `shape=mxgraph.rc.mxRc_areaStackGradientLineChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=渐变堆叠面积图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '渐变堆叠面积图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_bumpLineChart.png`;
        s = `shape=mxgraph.rc.mxRc_bumpLineChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=凹凸图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '凹凸图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_stateSwitch', '折线图', false, fns);
    };
    Sidebar.prototype.addCustomStatistic3Palette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_basicPieChart.png`;
        let s = `shape=mxgraph.rc.mxRc_basicPieChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '饼图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_doughnutChart.png`;
        s = `shape=mxgraph.rc.mxRc_doughnutChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=环状饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '环状饼图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_doughnutHalfChart.png`;
        s = `shape=mxgraph.rc.mxRc_doughnutHalfChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=半环形图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '半环形图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_nightingale.png`;
        s = `shape=mxgraph.rc.mxRc_nightingale;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '南丁格尔图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_stateSwitch', '饼图', false, fns);
    };
    Sidebar.prototype.addCustomStatisticRadarPalette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_radar1.png`;
        let s = `shape=mxgraph.rc.mxRc_basicRadarChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '基础雷达图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_radar2.png`;
        s = `shape=mxgraph.rc.mxRc_aqiRadarChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=环状饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', 'AQI - 雷达图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_radar3.png`;
        s = `shape=mxgraph.rc.mxRc_customizedRadarChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=半环形图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '自定义雷达图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_radar4.png`;
        s = `shape=mxgraph.rc.mxRc_browsersRadarChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '浏览器占比变化', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_radar5.png`;
        s = `shape=mxgraph.rc.mxRc_multipleRadarChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '多雷达图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_radar', '雷达图', false, fns);
    };
    Sidebar.prototype.addCustomStatisticBoxplotPalette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_boxplot1.png`;
        let s = `shape=mxgraph.rc.mxRc_basicBoxplotChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '基础盒须图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_boxplot2.png`;
        s = `shape=mxgraph.rc.mxRc_simpleBoxplotChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=环状饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '简单的数据聚合', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_boxplot3.png`;
        s = `shape=mxgraph.rc.mxRc_velocityBoxplotChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=半环形图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '垂直方向盒须图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_boxplot4.png`;
        s = `shape=mxgraph.rc.mxRc_multipleBoxplotChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '多系列盒须图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_radar', '盒须图', false, fns);
    };
    Sidebar.prototype.addCustomStatisticFunnelPalette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_funnel1.png`;
        let s = `shape=mxgraph.rc.mxRc_basicFunnelChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '基础漏斗图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_funnel2.png`;
        s = `shape=mxgraph.rc.mxRc_compareFunnelChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=环状饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '漏斗图(对比)', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_funnel3.png`;
        s = `shape=mxgraph.rc.mxRc_customizedFunnelChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=半环形图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '垂直方向盒须图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_funnel4.png`;
        s = `shape=mxgraph.rc.mxRc_multipleFunnelChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '多系列盒须图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_radar', '漏斗图', false, fns);
    };
    Sidebar.prototype.addCustomStatisticGaugePalette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_gauge1.png`;
        let s = `shape=mxgraph.rc.mxRc_gaugeBasicChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '基础仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge2.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeSimpleChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=环状饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '带标签数字动画', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge3.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeSpeedChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=半环形图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '速度仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge4.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeProgressChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '进度仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge5.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeStageChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=环状饼图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '阶段速度仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge6.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeGradeChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=半环形图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '等级仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge7.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeMultiTitleChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '多标题仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge8.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeTemperatureChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '气温仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge9.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeRingChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '得分环', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge10.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeBarometerChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '气压表', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge11.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeClockChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '时钟仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_gauge12.png`;
        s = `shape=mxgraph.rc.mxRc_gaugeCarChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', 'Gauge Car', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_radar', '仪表盘', false, fns);
    };
    Sidebar.prototype.addCustomStatistic4PaletteOther = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_basicScatterChart.png`;
        let s = `shape=mxgraph.rc.mxRc_basicScatterChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=盒须图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '散点图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_multiSymbolChart.png`;
        s = `shape=mxgraph.rc.mxRc_multiSymbolChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=盒须图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '单轴散点图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_bubbleChart.png`;
        s = `shape=mxgraph.rc.mxRc_bubbleChart;igBackground=1;igStroke=1;igRound=1;readonly=1;rcDprop=chartValues;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=盒须图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '气泡图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_stateSwitch', '散点图', false, fns);
    };
    /* Sidebar.prototype.addCustomStatisticPaletteOther = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_basicBoxplot.png`;
        let s = `shape=mxgraph.rc.mxRc_basicBoxplot;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=盒须图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '盒须图', true, '', '', mxUtils.staticImg(defaultImg), ''));
        defaultImg = `/rcscada/menu/ic_menu_basicFunnel.png`;
        s = `shape=mxgraph.rc.mxRc_basicFunnel;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=漏斗图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '漏斗图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_basicGauge.png`;
        s = `shape=mxgraph.rc.mxRc_basicGauge;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=仪表盘;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '仪表盘', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_graphChord.png`;
        s = `shape=mxgraph.rc.mxRc_graphChord;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '弦图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_basicRadarChart.png`;
        s = `shape=mxgraph.rc.mxRc_basicRadarChart;igBackground=1;igStroke=1;igRound=1;rcDprop=chartValues;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=弦图;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '雷达图', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_stateSwitch', '其他效果', false, fns);
    }; */

    Sidebar.prototype.addCustomSpecialEffectsPalette = function () {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_blaze.png`;
        let s = `shape=mxgraph.rc.mxRc_blazeSpecialEffects;readonly=1;rcSprop=blazeColor,blazeSize,blazeLevel;blazeColor=#d7cece;blazeSize=20;blazeLevel=1;igBackground=1;igStroke=1;igRound=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;title=沸腾特效;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 150, 150, '', '沸腾特效', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_SpecialEffects', '特效图元', false, fns);
    };

    Sidebar.prototype.addCustomStateImagePalette = function (expand) {
        const fns = [];
        let closeImg = `/rcscada/images/usr/switch/1.svg`;
        let openImg = `/rcscada/images/usr/switch/2.svg`;
        let s = `shape=mxgraph.rc.mxRc_stateSwitch;readonly=1;rcSprop=openStateImg,closeStateImg;rcDprop=openCloseValues;igDprop=commonStrokeColor;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=切换开关;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 150, 150, '', '切换开关', true, '', '', mxUtils.staticImg(closeImg), ''));
        let defaultImg = `/rcscada/images/usr/light/1.png`;
        s = `shape=mxgraph.rc.mxRc_stateImage;readonly=1;igDprop=commonStrokeColor;rcSprop=defaultImg;rcDprop=stateImageValues;defaultImg=${defaultImg};stateImage=;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=状态图片1;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 150, 150, '', '状态图片', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_text.svg`;
        s = 'text;rcDprop=stateTextValues;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;';
        fns.push(this.createVertexTemplateEntry(s, 200, 100, '文字', '状态文字', true, '', '', mxUtils.staticImg(defaultImg), ''));

        s = 'text;rcDprop=textOutputValues;html=1;strokeColor=#000000;fillColor=#FFFFFF;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=2;';
        fns.push(this.createVertexTemplateEntry(s, 200, 100, '文字', '变量文本', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_pip_flow.gif`;
        fns.push(this.createEdgeTemplateEntry(
            'html=1;endArrow=none;endFill=0;enableFlow=1;strokeWidth=10;strokeColor=#409eff;pipWidth=18;pipDash=20;strokeBgColor=#d3d3d3;flowDirection=1;pipRound=1;flowRound=1;',
            200, 200, '', '流动条', null, null, null, true, mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_trough.svg`;//troughMinScale=0;troughMaxScale=100;
        s = `shape=mxgraph.rc.mxRc_squareTrough;igBackground=1;igStroke=1;igRound=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;rcDprop=troughLiquidProgressValues;rcSprop=troughMinScale,troughMaxScale,troughBubbles,troughBorderWidth,troughBorderRadius,troughBorderColor,troughBackgroundColor,troughLiquidColor;troughMinScale=0;troughMaxScale=100;troughBorderWidth=5;troughBorderRadius=5;troughBorderColor=#000000;troughBackgroundColor=#FFFFFF38;troughLiquidColor=#00AAFF;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=水槽;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 200, 200, '', '液体容器', true, '', '', mxUtils.staticImg(defaultImg), ''));

        //readonly == 1 时 showFontStyle 是否显示字体设置面板 1 显示 默认不显示 rcDprop=shuziTimeValues;
        defaultImg = `/rcscada/menu/ic_menu_shuzi_time.svg`;
        s = `shape=mxgraph.rc.mxRc_shu_zi_time;showFontStyle=1;readonly=1;timeFormat=0;igDprop=commonStrokeColor;rcSprop=timeFormat;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=数字日期;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=middle;`;
        fns.push(this.createVertexTemplateEntry(s, 180, 50, '', '数字日期', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_video_play.svg`;//rcDprop=videoPlayerValues;
        s = `shape=mxgraph.rc.mxRc_video_play;rcSprop=playUrl,poster;igBackground=1;igStroke=1;igRound=1;readonly=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=0;strokeColor=none;title=点播直播;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 200, 120, '', '点播/直播', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_thermometer.png`;
        s = `shape=mxgraph.rc.mxRc_thermometer;readonly=1;igBackground=1;igStroke=1;igRound=1;rcDprop=scaleValValues;rcSprop=scaleStrokeColor,showScale,bgFillColor1,bgFillColor2,minScale,maxScale,smallUnitScale,bigUnitScale,scaleValDuration,scaleTransX,scaleFontSize,scaleColor,scaleFontColor;scaleTransX=0.0;scaleColor=#528CFF;bgFillColor1=#F8D7D1;bgFillColor2=#FF5D3C;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;showScale=1;scaleValDuration=1.0;minScale=0;maxScale=100;smallUnitScale=2;bigUnitScale=20;strokeWidth=1;strokeColor=#528CFF;fillColor=#00000000;fontColor=#528CFF;fontSize=12;title=温度计;opacity=100;aspect=fixed;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 120, 200, '', '温度计', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_rcgauge1.png`;
        s = `shape=mxgraph.rc.mxRc_gauge1;readonly=1;igBackground=1;igStroke=1;igRound=1;rcDprop=scaleValValues;rcSprop=showScale,bgFillColor1,bgFillColor2,minScale,maxScale,smallUnitScale,bigUnitScale,scaleValDuration,scaleTransX,scaleFontSize,scaleColor,scaleFontColor;perimeterSpacing=40;scaleTransX=0.0;scaleColor=#528CFF;bgFillColor1=#F8D7D1;bgFillColor2=#FF5D3C;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;showScale=1;scaleValDuration=1.0;minScale=0;maxScale=100;smallUnitScale=2;bigUnitScale=20;strokeWidth=1;strokeColor=#528CFF;fillColor=#00000000;fontColor=#528CFF;fontSize=12;title=计量器;opacity=100;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 150, 200, '', '计量器', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_htmlInput.png`;
        s = `shape=mxgraph.rc.mxRc_htmlInput;perimeterSpacing=5;showFontStyle=1;placeholderText=请输入;inputMode=display;readonly=1;rcDprop=htmlTextInputDefaultValues;rcSprop=placeholderText;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=#528CFF;fontColor=#333;fontSize=12;title=文本框;fillColor=#FFFFFF;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 200, 60, '', '文本框', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_htmlTextArea.png`;
        s = `shape=mxgraph.rc.mxRc_htmlTextarea;perimeterSpacing=5;showFontStyle=1;placeholderText=请输入;textareaRows=4;readonly=1;rcDprop=htmlTextareaDefaultValues;rcSprop=placeholderText,textareaRows;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=#528CFF;fontColor=#333;fontSize=12;title=文本域;fillColor=#FFFFFF;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 300, 120, '', '文本域', true, '', '', mxUtils.staticImg(defaultImg), ''));

        defaultImg = `/rcscada/menu/ic_menu_htmlTable.png`;
        s = `shape=mxgraph.rc.mxRcTableView;rcDprop=tableViewListValues;rcSprop=tableBoderColor,tableHeaderBgColor,tableHeaderFontColor,tableHeaderFontSize,tableHeaderFontStyle,tableHeaderFontWeight;tableHeaderFontSize=15;tableHeaderFontStyle=normal;tableHeaderFontWeight=normal;tableHeaderFontColor=#000000;tableBoderColor=#eeeeee;tableHeaderBgColor=#DCDCDC;readonly=1;igStroke=1;igRound=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=0;strokeColor=none;fontColor=#333;fontSize=12;title=表格;fillColor=#FFFFFF;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 400, 220, '', '表格', true, '', '', mxUtils.staticImg(defaultImg), ''));

        // 脉冲控制组件 - 用于点击触发脉冲信号控制目标点位
        defaultImg = `/rcscada/menu/ic_menu_pulse_control.png`;
        s = `shape=mxgraph.rc.mxRc_pulseControl;rcDprop=pulseControlValues;rcSprop=pulseButtonText,pulseButtonBgColor,pulseBgImage,pulseButtonTextColor,pulseButtonFontSize,pulseButtonRadius;pulseHighValue=1;pulseLowValue=0;pulseDelay=2000;pulseOutputType=numeric;pulseButtonText=脉冲触发;pulseButtonBgColor=#409eff;pulseButtonTextColor=#ffffff;pulseButtonFontSize=14;pulseButtonRadius=4;readonly=1;igStroke=1;igRound=1;igBackground=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor;html=1;shadow=0;dashed=0;strokeWidth=0;strokeColor=none;fontColor=#333;fontSize=14;title=脉冲控制;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 120, 40, '', '脉冲控制', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_stateSwitch', '变量控制', null == expand || expand, fns);
    };


    Sidebar.prototype.add3D = function (expand) {
        const fns = [];
        let defaultImg = `/rcscada/menu/ic_menu_htmlTable.png`;
        let s = `shape=mxgraph.rc.mxRc_threeModel;rcDprop=tableViewListValues;rcSprop=tableBoderColor,tableHeaderBgColor,tableHeaderFontColor,tableHeaderFontSize,tableHeaderFontStyle,tableHeaderFontWeight;tableHeaderFontSize=15;tableHeaderFontStyle=normal;tableHeaderFontWeight=normal;tableHeaderFontColor=#000000;tableBoderColor=#eeeeee;tableHeaderBgColor=#DCDCDC;readonly=1;igStroke=1;igRound=1;igDprop=commonRotateAnim,commonTwinkleAnim,commonStrokeColor,commonFontColor,singleClickEvent,doubleClickEvent;html=1;shadow=0;dashed=0;strokeWidth=0;strokeColor=none;fontColor=#333;fontSize=12;title=表格;fillColor=#FFFFFF;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 600, 600, '', '3d', true, '', '', mxUtils.staticImg(defaultImg), ''));

        this.addPaletteFunctions('mxRc_3d', '3D', null == expand || expand, fns);
    }


    Sidebar.prototype.addCustomControlSwitchPalette = function () {
        const fns = [];
        let closeImg = `/rcscada/images/usr/switch/1.svg`;
        let openImg = `/rcscada/images/usr/switch/2.svg`;
        let s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关1;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关1', true, '', '', mxUtils.staticImg(closeImg), ''));

        closeImg = `/rcscada/images/usr/switch/3.svg`;
        openImg = `/rcscada/images/usr/switch/4.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关2;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关2', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/6.svg`;
        openImg = `/rcscada/images/usr/switch/5.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关3;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关3', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/8.svg`;
        openImg = `/rcscada/images/usr/switch/7.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关4;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关4', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/20.svg`;
        openImg = `/rcscada/images/usr/switch/9.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关5;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关5', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/19.svg`;
        openImg = `/rcscada/images/usr/switch/10.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关6;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关6', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/11.svg`;
        openImg = `/rcscada/images/usr/switch/12.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关7;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关7', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/13.svg`;
        openImg = `/rcscada/images/usr/switch/14.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关8;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关8', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/16.svg`;
        openImg = `/rcscada/images/usr/switch/15.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关9;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关9', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/18.svg`;
        openImg = `/rcscada/images/usr/switch/17.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关10;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关10', true, '', '', mxUtils.staticImg(closeImg), ''));
        closeImg = `/rcscada/images/usr/switch/21.svg`;
        openImg = `/rcscada/images/usr/switch/22.svg`;
        s = `shape=mxgraph.rc.mxRc_stateSwitch;igDprop=commonStrokeColor;rcDprop=openCloseValues;rcSprop=openStateImg,closeStateImg;openStateImg=${openImg};closeStateImg=${closeImg};html=1;shadow=0;dashed=0;strokeWidth=1;strokeColor=none;stateValue=0;title=控制开关11;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
        fns.push(this.createVertexTemplateEntry(s, 80, 80, '', '控制开关11', true, '', '', mxUtils.staticImg(closeImg), ''));
        this.addPaletteFunctions('mxRc_stateSwitch', '控制开关', false, fns);
    };


    Sidebar.prototype.addDatavBorderboxPalette = function (expand, type) {
        const fns = [];
        // style, width, height, value, title, showLabel, showTitle, tags, thumbImg, className
        for (let i = 1; i < 14; i++) {
            let imgUrl = mxUtils.staticImg(`/rcscada/menu/ic_menu_dv_border${i}.svg`);
            let s2 = `shape=mxgraph.rc.datavdvBorderBox;varvalue=${i};readonly=1;html=1;shadow=0;dashed=0;strokeWidth=0;title=dv-border-Box-1;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
            fns.push(this.createVertexTemplateEntry(s2, 300, 165, this.createCustomerNode('dv-border-box' + i, {}), '边框' + i, null, true, '', imgUrl, 'usr-thumb-small usr-dvBorderBox'));
            /*if (i == 4 || i == 5 || i == 8) {
                s2 += 'reverse=1';
                fns.push(this.createVertexTemplateEntry(s2, 150, 80, this.createCustomerNode('dv-border-box-reverse' + i, {}), '边框' + i + '(反)', null, true, '', imgUrl, 'usr-thumb-small usr-dvBorderBox'));
            }*/
        }
        this.addPaletteFunctions('datavBorderBox', '边框', null == expand || expand, fns, 1);
    };
    Sidebar.prototype.addDatavDecorationPalette = function (expand, type) {
        const fns = [];
        // style, width, height, value, title, showLabel, showTitle, tags, thumbImg, className
        // let imgUrl = mxUtils.staticImg(`/rcscada/datav/borderbox_default.svg`);
        for (let i = 1; i < 13; i++) {
            let imgUrl = mxUtils.staticImg(`/rcscada/menu/ic_menu_dv_decoration${i}.gif`);
            let s2 = `shape=mxgraph.rc.datavdvDecoration;varvalue=${i};readonly=1;html=1;shadow=0;dashed=0;strokeWidth=0;title=dv-border-Box-1;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
            fns.push(this.createVertexTemplateEntry(s2, i == 4 ? 60 : 200, i == 12 || i == 9 || i == 4 ? 200 : 79, this.createCustomerNode('dv-border-box-reverse' + i, {}), '装饰' + i, null, true, '', imgUrl, 'usr-thumb-small usr-dvBorderBox'));
        }
        this.addPaletteFunctions('datavDecoration', '装饰', null == expand || expand, fns, 1);
    };
    Sidebar.prototype.addDatavProgressPalette = function (expand, type) {
        const fns = [];
        let imgUrl = mxUtils.staticImg(`/rcscada/datav/borderbox_default.svg`);
        for (let i = 1; i < 13; i++) {
            let s2 = `shape=mxgraph.rc.datavdvDecoration;varvalue=${i};readonly=1;html=1;shadow=0;dashed=0;strokeWidth=0;title=dv-border-Box-1;opacity=100;fillColor=none;${mxConstants.STYLE_VERTICAL_LABEL_POSITION}=bottom;${mxConstants.STYLE_VERTICAL_ALIGN}=top;`;
            fns.push(this.createVertexTemplateEntry(s2, 100, 100, this.createCustomerNode('dv-border-box-reverse' + i, {}), '装饰' + i, null, true, '', imgUrl, 'usr-thumb-small usr-dvBorderBox'));
        }
        this.addPaletteFunctions('datavProgress', '进度', null == expand || expand, fns, 1)
            ;
    };


})();
