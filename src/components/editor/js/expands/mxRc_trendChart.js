/* eslint-disable */
/**
 * ============================================
 * 趋势图元件 (Trend Chart Component)
 * ============================================
 * 用于显示时序数据的趋势曲线图
 * 支持配置开始时间、结束时间、设备SN来获取历史数据
 * 
 * @author Antigravity AI Assistant
 * @date 2026-02-04
 */

import { mxConstants, mxShape, mxUtils } from "../../core/mxgraph";
import echarts from './echarts-common.js';
import api from '../utils/api.js';
import {
    getPresetTimeRange,
    formatTimestamp,
    formatDuration,
    TIME_CONSTANTS
} from '../utils/timeUtils.js';

export default mxRc_trendChart;

/**
 * 趋势图构造函数
 * @param {Object} bounds - 边界框
 * @param {string} fill - 填充颜色
 * @param {string} stroke - 边框颜色
 * @param {number} strokewidth - 边框宽度
 */
function mxRc_trendChart(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
    this.chartInstance = null;
    this.refreshTimer = null;
}

mxUtils.extend(mxRc_trendChart, mxShape);

// ============================================
// 常量定义
// ============================================
mxRc_trendChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRc_trendChart',
};

// ============================================
// 核心渲染方法
// ============================================

/**
 * 绘制顶点形状
 */
mxRc_trendChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};

/**
 * 前景渲染
 * 创建ECharts图表容器并初始化图表
 */
mxRc_trendChart.prototype.foreground = function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'trend_chart_' + this.state.cell.id;
        cell.setAttribute('divId', divId);

        // 获取样式配置
        // 获取样式配置
        const chartStyle = mxUtils.getValue(this.style, 'trendChartStyle', 'dark');
        let bgColor = mxUtils.getValue(this.style, 'trendBgColor', '#1a1a2e');

        // 非深色模式强制背景透明
        if (chartStyle !== 'dark') {
            bgColor = 'transparent';
        }

        const borderColor = mxUtils.getValue(this.style, 'trendBorderColor', '#16213e');
        const borderRadius = mxUtils.getValue(this.style, 'trendBorderRadius', '8');

        let htmlStr = `
            <div id="${divId}" class="rc_trend_chart_container" style="
                width: ${w}px;
                height: ${h}px;
                overflow: hidden;
                background: ${bgColor};
                border: 1px solid ${borderColor};
                border-radius: ${borderRadius}px;
                box-sizing: border-box;
                pointer-events: auto;
                position: relative;
                z-index: 10;
            ">
            </div>
        `;

        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);

        setTimeout(() => {
            this.initChart(divId, w, h);
        }, 100);
    }
};

/**
 * 初始化图表
 * @param {string} divId - 容器ID
 * @param {number} w - 宽度
 * @param {number} h - 高度
 */
mxRc_trendChart.prototype.initChart = function (divId, w, h) {
    const chartDom = document.getElementById(divId);
    if (!chartDom) {
        console.warn('[TrendChart] 容器未找到:', divId);
        return;
    }

    // 销毁已存在的实例
    if (this.chartInstance) {
        this.chartInstance.dispose();
    }

    // 初始化ECharts实例
    this.chartInstance = echarts.init(chartDom);

    const graph = this.state.view.graph;
    const isPreview = graph.isChromeless;

    if (isPreview) {
        // 预览模式：获取真实数据
        this.loadAndRenderData();
    } else {
        // 编辑模式：显示示例数据
        this.renderDemoData();
    }

    // 设置自动刷新
    this.setupAutoRefresh();
};

/**
 * 渲染示例数据（编辑模式）
 */
mxRc_trendChart.prototype.renderDemoData = function () {
    const chartStyle = mxUtils.getValue(this.style, 'trendChartStyle', 'dark');
    const colors = this.getSeriesColors();

    const mockData = [
        { name: '示例数据1', data: [120, 132, 101, 134, 90, 230, 210] },
        { name: '示例数据2', data: [220, 182, 191, 234, 290, 330, 310] }
    ];

    const series = mockData.map((item, index) => {
        const color = colors[index % colors.length];
        return this.buildSeriesItem(item.name, item.data, color, chartStyle);
    });

    const option = this.buildChartOption({
        title: this.getChartTitle(),
        xAxisData: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        series: series,
        isDemo: true
    });

    if (this.chartInstance) {
        this.chartInstance.setOption(option);
    }
};

/**
 * 加载并渲染真实数据（预览模式）
 */
mxRc_trendChart.prototype.loadAndRenderData = async function () {
    try {
        // 获取时间范围配置
        const timeRangeConfig = this.getTimeRangeConfig();
        const { startTime, endTime } = timeRangeConfig;

        // 获取设备SN列表
        const snList = this.getSnList();

        if (snList.length === 0) {
            console.warn('[TrendChart] 未配置设备SN');
            this.renderEmptyState('请配置设备SN');
            return;
        }

        console.log('[TrendChart] 开始加载数据:', {
            startTime: formatTimestamp(startTime),
            endTime: formatTimestamp(endTime),
            sn: snList
        });

        // 显示加载动画
        if (this.chartInstance) {
            const chartStyle = mxUtils.getValue(this.style, 'trendChartStyle', 'dark');
            const loadingColor = chartStyle === 'dark' ? '#ffffff' : '#333333';
            const maskColor = chartStyle === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';

            this.chartInstance.showLoading({
                text: '加载中...',
                color: '#409eff',
                textColor: loadingColor,
                maskColor: maskColor,
                zlevel: 0
            });
        }

        // 调用API获取数据
        const response = await api.getHistoryDataBySn({
            startTime: startTime,
            endTime: endTime,
            sn: snList
        });

        if (this.chartInstance) {
            this.chartInstance.hideLoading();
        }

        console.log('[TrendChart] API响应:', response);

        // 解析并渲染数据
        this.parseAndRenderData(response, snList);

    } catch (error) {
        if (this.chartInstance) {
            this.chartInstance.hideLoading();
        }
        console.error('[TrendChart] 加载数据失败:', error);
        this.renderErrorState('数据加载失败: ' + error.message);
    }
};

/**
 * 解析API响应并渲染图表
 * @param {Object} response - API响应数据
 * @param {Array} snList - 设备SN列表
 */
mxRc_trendChart.prototype.parseAndRenderData = function (response, snList) {
    console.log('[TrendChart] 开始解析API响应:', JSON.stringify(response).substring(0, 500));

    // 解析响应数据 - 支持多种API响应格式
    let rawData = [];

    // 尝试多种数据提取方式
    if (response) {
        // 特殊格式: { "sn1*sn2": [...] } - 键是SN组合，值是数据数组
        // 这是 getHistoryDataBySn API 的实际返回格式
        const keys = Object.keys(response);
        if (keys.length > 0 && !response.data && !response.result && !response.code) {
            // 检查第一个键是否看起来像SN组合
            const firstKey = keys[0];
            if (firstKey.includes('*') || firstKey.includes('_device') || firstKey.includes('t_')) {
                console.log('[TrendChart] 检测到SN键格式: { "sn1*sn2": [...] }');
                // 遍历所有键，提取数据
                keys.forEach(key => {
                    const dataArray = response[key];
                    if (Array.isArray(dataArray)) {
                        // 从键中提取SN列表
                        const snListFromKey = key.split('*').map(s => s.trim());
                        console.log('[TrendChart] 从键提取的SN:', snListFromKey);

                        // 将数据添加到rawData，并标记SN
                        // 将数据添加到rawData，并标记SN
                        dataArray.forEach(item => {
                            let normalizedItem = {};

                            // 情况A: item 是数组 ["2026-01-05 12:00:00", 23.5]
                            if (Array.isArray(item) && item.length >= 2) {
                                let ts = item[0];
                                const val = item[1];

                                // 解析时间字符串
                                if (typeof ts === 'string') {
                                    // 尝试解决iOS/Safari兼容性 (yyyy-MM-dd -> yyyy/MM/dd)
                                    ts = ts.replace(/-/g, '/');
                                    const parsed = Date.parse(ts);
                                    if (!isNaN(parsed)) {
                                        ts = parsed;
                                    }
                                }

                                normalizedItem = {
                                    timestamp: ts,
                                    value: val
                                };
                            }
                            // 情况B: item 是对象 { timestamp:..., value:... }
                            else if (typeof item === 'object') {
                                normalizedItem = item;
                            }

                            // 注入SN
                            if (!normalizedItem.sn && !normalizedItem.deviceSn) {
                                if (snListFromKey.length === 1) {
                                    normalizedItem.sn = snListFromKey[0];
                                } else {
                                    // 如果是组合键返回这种格式，很难区分，默认给第一个
                                    normalizedItem.sn = snListFromKey[0];
                                }
                            }

                            // 确保有有效的时间戳和值才添加
                            if (normalizedItem.timestamp && normalizedItem.value !== undefined) {
                                rawData.push(normalizedItem);
                            }
                        });
                    }
                });
                console.log('[TrendChart] 数据来源: SN键格式，提取到', rawData.length, '条数据');
            }
        }

        // 如果上面没有提取到数据，尝试其他格式
        if (rawData.length === 0) {
            // 格式1: { data: [...] }
            if (response.data && Array.isArray(response.data)) {
                rawData = response.data;
                console.log('[TrendChart] 数据来源: response.data (数组)');
            }
            // 格式2: { data: { records: [...] } } 或 { data: { list: [...] } }
            else if (response.data && typeof response.data === 'object') {
                if (response.data.records && Array.isArray(response.data.records)) {
                    rawData = response.data.records;
                    console.log('[TrendChart] 数据来源: response.data.records');
                } else if (response.data.list && Array.isArray(response.data.list)) {
                    rawData = response.data.list;
                    console.log('[TrendChart] 数据来源: response.data.list');
                } else {
                    // 尝试将对象值展平为数组
                    rawData = Object.values(response.data).flat().filter(item => typeof item === 'object');
                    console.log('[TrendChart] 数据来源: response.data (对象展平)');
                }
            }
            // 格式3: { result: [...] }
            else if (response.result && Array.isArray(response.result)) {
                rawData = response.result;
                console.log('[TrendChart] 数据来源: response.result (数组)');
            }
            // 格式4: { result: { records: [...] } }
            else if (response.result && typeof response.result === 'object') {
                if (response.result.records && Array.isArray(response.result.records)) {
                    rawData = response.result.records;
                    console.log('[TrendChart] 数据来源: response.result.records');
                } else if (response.result.list && Array.isArray(response.result.list)) {
                    rawData = response.result.list;
                    console.log('[TrendChart] 数据来源: response.result.list');
                }
            }
            // 格式5: 直接是数组
            else if (Array.isArray(response)) {
                rawData = response;
                console.log('[TrendChart] 数据来源: response 本身是数组');
            }
        }
    }

    console.log('[TrendChart] 解析后数据条数:', rawData.length);
    if (rawData.length > 0) {
        console.log('[TrendChart] 第一条数据示例:', JSON.stringify(rawData[0]));
    }

    if (rawData.length === 0) {
        console.warn('[TrendChart] 解析后数据为空，渲染空图表（显示坐标轴）');
    }

    // 按SN分组数据
    const groupedData = this.groupDataBySn(rawData, snList);

    console.log('[TrendChart] 分组后数据:', {
        timestampCount: groupedData.timestamps.length,
        seriesKeys: Object.keys(groupedData.series)
    });

    // 构建图表配置（即使没有数据也构建，以显示坐标轴）
    const option = this.buildChartOptionFromData(groupedData);

    if (this.chartInstance) {
        this.chartInstance.setOption(option, true);
    }
    return; // 明确结束
};

/**
 * 按设备SN分组数据
 * @param {Array} rawData - 原始数据
 * @param {Array} snList - 设备SN列表
 * @returns {Object} 分组后的数据
 */
mxRc_trendChart.prototype.groupDataBySn = function (rawData, snList) {
    const grouped = {};
    const timestamps = new Set();
    let matchedCount = 0;
    let unmatchedCount = 0;

    // 初始化分组 - 同时添加可能的变体
    snList.forEach(sn => {
        grouped[sn] = {};
    });

    // 分组数据
    rawData.forEach((item, index) => {
        // 尝试多种字段名获取SN
        const sn = item.sn || item.deviceSn || item.snSerial || item.device_sn ||
            item.pointKey || item.pointName || item.key || item.name || '';

        // 尝试多种字段名获取时间戳
        let timestamp = item.timestamp || item.ts || item.time || item.createTime ||
            item.create_time || item.updateTime || item.update_time ||
            item.collectTime || item.collect_time || item.t || null;

        // 如果时间戳是字符串，尝试转换
        if (timestamp && typeof timestamp === 'string') {
            const parsed = Date.parse(timestamp);
            if (!isNaN(parsed)) {
                timestamp = parsed;
            }
        }

        // 尝试多种字段名获取值
        let value = item.value !== undefined ? item.value :
            (item.val !== undefined ? item.val :
                (item.data !== undefined ? item.data :
                    (item.v !== undefined ? item.v : null)));

        // 调试：打印第一条数据的解析结果
        if (index === 0) {
            console.log('[TrendChart] 第一条数据字段解析:', {
                sn: sn,
                timestamp: timestamp,
                value: value,
                originalKeys: Object.keys(item)
            });
        }

        // 检查是否匹配配置的SN列表
        if (sn && timestamp !== null && value !== null) {
            // 精确匹配
            if (grouped[sn] !== undefined) {
                grouped[sn][timestamp] = parseFloat(value) || 0;
                timestamps.add(timestamp);
                matchedCount++;
            }
            // 部分匹配 - SN可能包含前缀或后缀
            else {
                for (const configSn of snList) {
                    if (sn.includes(configSn) || configSn.includes(sn)) {
                        grouped[configSn][timestamp] = parseFloat(value) || 0;
                        timestamps.add(timestamp);
                        matchedCount++;
                        break;
                    }
                }
                unmatchedCount++;
            }
        } else {
            unmatchedCount++;
        }
    });

    console.log('[TrendChart] 数据分组统计:', {
        总数据条数: rawData.length,
        匹配条数: matchedCount,
        未匹配条数: unmatchedCount,
        时间点数量: timestamps.size
    });

    // 排序时间戳
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);


    return {
        timestamps: sortedTimestamps,
        series: grouped
    };
};

/**
 * 从分组数据构建图表配置
 * @param {Object} groupedData - 分组后的数据
 * @returns {Object} ECharts配置
 */
mxRc_trendChart.prototype.buildChartOptionFromData = function (groupedData) {
    const { timestamps, series } = groupedData;

    // 获取配置的时间范围（用于实时模式的固定范围显示）
    const timeConfig = this.getTimeRangeConfig();
    const timeMode = mxUtils.getValue(this.style, 'trendTimeMode', 'realtime');

    // 实时模式：X轴范围固定为配置的时间范围，右端始终是当前时间
    // 历史模式：X轴范围根据数据自动调整
    let xAxisMin, xAxisMax;
    if (timeMode === 'realtime') {
        // 实时模式：右端是当前时间，左端是配置的起始时间
        xAxisMax = Date.now();
        xAxisMin = timeConfig.startTime;
    } else {
        // 历史模式：使用配置的固定时间范围
        xAxisMin = timeConfig.startTime;
        xAxisMax = timeConfig.endTime;
    }

    // 计算时间跨度，用于格式化标签
    const duration = xAxisMax - xAxisMin;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    // 构建系列数据 - 使用 [timestamp, value] 格式
    const seriesData = [];
    const colors = this.getSeriesColors();
    let colorIndex = 0;

    const chartStyle = mxUtils.getValue(this.style, 'trendChartStyle', 'dark');

    for (const sn in series) {
        const dataMap = series[sn];
        // 转换为 [timestamp, value] 格式，用于 time 类型 X 轴
        const data = timestamps.map(ts => {
            const val = dataMap[ts];
            return val !== undefined ? [ts, val] : null;
        }).filter(item => item !== null);

        let color = colors[colorIndex % colors.length];
        let seriesItem = this.buildSeriesItem(this.getSnDisplayName(sn), data, color, chartStyle);

        seriesData.push(seriesItem);

        colorIndex++;
    }

    return this.buildChartOption({
        title: this.getChartTitle(),
        series: seriesData,
        isDemo: false,
        // 时间轴配置
        useTimeAxis: true,
        xAxisMin: xAxisMin,
        xAxisMax: xAxisMax,
        duration: duration
    });
};

/**
 * 构建完整的图表配置
 * @param {Object} config - 配置参数
 * @returns {Object} ECharts配置
 */
mxRc_trendChart.prototype.buildChartOption = function (config) {
    const { title, xAxisData, series, isDemo, useTimeAxis, xAxisMin, xAxisMax, duration } = config;

    // 获取样式配置
    const chartStyle = mxUtils.getValue(this.style, 'trendChartStyle', 'dark');

    // 根据样式自适应颜色
    let defaultText = '#aaaaaa';
    let defaultGrid = '#2a2a4a';
    let defaultTitle = '#ffffff';

    if (chartStyle !== 'dark') {
        defaultText = '#333333';
        defaultGrid = '#eeeeee';
        defaultTitle = '#333333';
    }

    const titleColor = mxUtils.getValue(this.style, 'trendTitleColor', defaultTitle);
    const textColor = mxUtils.getValue(this.style, 'trendTextColor', defaultText);
    const gridColor = mxUtils.getValue(this.style, 'trendGridColor', defaultGrid);
    const showLegend = mxUtils.getValue(this.style, 'trendShowLegend', '1') === '1';
    const showTitle = mxUtils.getValue(this.style, 'trendShowTitle', '1') === '1';
    const showTooltip = mxUtils.getValue(this.style, 'trendShowTooltip', '1') === '1';

    // 根据时间跨度计算合适的时间格式
    const ONE_DAY = 24 * 60 * 60 * 1000;
    var axisLabelFormatter = function (value) {
        const d = new Date(value);
        if (duration && duration > ONE_DAY) {
            // 超过1天，显示 月-日 时:分
            return (d.getMonth() + 1).toString().padStart(2, '0') + '-' +
                d.getDate().toString().padStart(2, '0') + ' ' +
                d.getHours().toString().padStart(2, '0') + ':' +
                d.getMinutes().toString().padStart(2, '0');
        } else {
            // 1天以内，显示 时:分
            return d.getHours().toString().padStart(2, '0') + ':' +
                d.getMinutes().toString().padStart(2, '0');
        }
    };

    return {
        // 动画配置 - 使数据更新更平滑
        animation: true,
        animationDuration: 300,
        animationDurationUpdate: 300,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear',
        title: {
            show: showTitle,
            text: title + (isDemo ? ' (示例)' : ''),
            left: 'center',
            top: 10,
            textStyle: {
                color: titleColor,
                fontSize: 14,
                fontWeight: 'bold'
            }
        },
        legend: {
            show: showLegend,
            top: 35,
            type: 'scroll', // 防止图例过多溢出
            textStyle: {
                color: textColor
            }
        },
        tooltip: {
            show: showTooltip,
            trigger: 'axis',
            confine: true,
            enterable: false,
            backgroundColor: chartStyle === 'dark' ? 'rgba(40, 42, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: chartStyle === 'dark' ? '#6272a4' : '#ccc',
            borderWidth: 1,
            padding: 10,
            textStyle: {
                color: chartStyle === 'dark' ? '#f8f8f2' : '#333',
                fontSize: 12
            },
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6272a4'
                },
                lineStyle: {
                    color: '#6272a4',
                    type: 'dashed'
                }
            },
            formatter: function (params) {
                try {
                    if (!params || params.length === 0) return '';

                    // 从数据中获取时间戳（time轴模式下params[0].value是[timestamp, value]数组）
                    var timestamp;
                    if (useTimeAxis && params[0].value && Array.isArray(params[0].value)) {
                        timestamp = params[0].value[0];
                    } else if (params[0].axisValue !== undefined) {
                        timestamp = params[0].axisValue;
                    }

                    // 格式化时间显示
                    var headerTime = '';
                    if (typeof timestamp === 'number') {
                        var d = new Date(timestamp);
                        headerTime = d.getFullYear() + '-' +
                            String(d.getMonth() + 1).padStart(2, '0') + '-' +
                            String(d.getDate()).padStart(2, '0') + ' ' +
                            String(d.getHours()).padStart(2, '0') + ':' +
                            String(d.getMinutes()).padStart(2, '0') + ':' +
                            String(d.getSeconds()).padStart(2, '0');
                    } else {
                        headerTime = params[0].axisValueLabel || timestamp || '';
                    }

                    // 构建HTML
                    var html = '<div style="padding:5px;">';
                    html += '<div style="font-size:12px;color:#bd93f9;border-bottom:1px solid #555;padding-bottom:5px;margin-bottom:5px;font-weight:bold;">' + headerTime + '</div>';

                    for (var i = 0; i < params.length; i++) {
                        var item = params[i];
                        // time轴模式下，value是[timestamp, value]数组
                        var val = Array.isArray(item.value) ? item.value[1] : item.value;
                        var displayValue = (val === null || val === undefined) ? '-' : (typeof val === 'number' ? val.toFixed(2) : val);
                        var color = item.color || '#5470c6';
                        var seriesName = item.seriesName || '';

                        html += '<div style="display:flex;justify-content:space-between;align-items:center;min-width:120px;margin-top:4px;">';
                        html += '<div style="display:flex;align-items:center;">';
                        html += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + ';margin-right:6px;"></span>';
                        html += '<span style="color:#fff;">' + seriesName + '</span>';
                        html += '</div>';
                        html += '<span style="font-weight:bold;color:#ff79c6;margin-left:12px;">' + displayValue + '</span>';
                        html += '</div>';
                    }

                    html += '</div>';
                    return html;
                } catch (e) {
                    console.error('[TrendChart] Tooltip formatter error:', e);
                    return '';
                }
            }
        },
        legend: {
            show: showLegend,
            top: showTitle ? 35 : 10,
            textStyle: {
                color: textColor
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '8%',
            top: showTitle ? (showLegend ? 70 : 50) : (showLegend ? 50 : 30),
            containLabel: true
        },
        xAxis: useTimeAxis ? {
            type: 'time',
            min: xAxisMin,
            max: xAxisMax,
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: gridColor
                }
            },
            axisLabel: {
                color: textColor,
                fontSize: 10,
                formatter: axisLabelFormatter
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: gridColor,
                    type: 'dashed'
                }
            }
        } : {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            axisLine: {
                lineStyle: {
                    color: gridColor
                }
            },
            axisLabel: {
                color: textColor,
                fontSize: 10
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: gridColor,
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: gridColor
                }
            },
            axisLabel: {
                color: textColor,
                fontSize: 10
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: gridColor,
                    type: 'dashed'
                }
            }
        },
        series: series
    };
};

// ============================================
// 配置获取方法
// ============================================

/**
 * 获取时间范围配置
 * @returns {Object} { startTime, endTime }
 */
mxRc_trendChart.prototype.getTimeRangeConfig = function () {
    // 获取时间模式配置
    const timeMode = mxUtils.getValue(this.style, 'trendTimeMode', 'realtime');

    let startTime, endTime;

    if (timeMode === 'history') {
        // 历史数据模式 (自定义时间)
        startTime = parseInt(mxUtils.getValue(this.style, 'trendStartTime', Date.now() - TIME_CONSTANTS.HOUR));
        endTime = parseInt(mxUtils.getValue(this.style, 'trendEndTime', Date.now()));
    } else {
        // 实时数据模式 (预设时间范围，包含最近30天)
        const presetKey = mxUtils.getValue(this.style, 'trendTimePreset', 'hour_1');

        if (presetKey === 'custom') {
            const customSec = parseInt(mxUtils.getValue(this.style, 'trendCustomDuration', '3600'));
            endTime = Date.now();
            startTime = endTime - customSec * 1000;
        } else {
            try {
                const range = getPresetTimeRange(presetKey);
                startTime = range.startTime;
                endTime = range.endTime;
            } catch (e) {
                console.warn('[TrendChart] 预设时间范围获取失败，使用默认值');
                startTime = Date.now() - TIME_CONSTANTS.HOUR;
                endTime = Date.now();
            }
        }
    }

    return { startTime, endTime };
};

/**
 * 获取设备SN列表
 * @returns {Array} SN数组
 */
mxRc_trendChart.prototype.getSnList = function () {
    const snConfig = mxUtils.getValue(this.style, 'trendSnList', '');

    if (!snConfig) {
        return [];
    }

    // 支持逗号分隔的多个SN
    return snConfig.split(',').map(sn => sn.trim()).filter(sn => sn);
};

/**
 * 获取图表标题
 * @returns {string} 标题
 */
mxRc_trendChart.prototype.getChartTitle = function () {
    return mxUtils.getValue(this.style, 'trendTitle', '趋势图');
};

/**
 * 获取SN显示名称
 * @param {string} sn - 设备SN
 * @returns {string} 显示名称
 */
mxRc_trendChart.prototype.getSnDisplayName = function (sn) {
    // 尝试获取自定义显示名称配置
    const nameMap = mxUtils.getValue(this.style, 'trendSnNames', '');

    if (nameMap) {
        try {
            const names = JSON.parse(decodeURIComponent(nameMap));
            if (names[sn]) {
                return names[sn];
            }
        } catch (e) {
            // 解析失败，使用原始SN
        }
    }

    // 默认返回SN的最后部分作为显示名称
    const parts = sn.split('_');
    return parts[parts.length - 1] || sn;
};

/**
 * 获取系列颜色列表
 * @returns {Array} 颜色数组
 */
mxRc_trendChart.prototype.getSeriesColors = function () {
    const defaultColors = [
        '#5470c6', '#91cc75', '#fac858', '#ee6666',
        '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
    ];

    const customColors = mxUtils.getValue(this.style, 'trendColors', '');

    if (customColors) {
        try {
            return JSON.parse(decodeURIComponent(customColors));
        } catch (e) {
            return defaultColors;
        }
    }

    return defaultColors;
};

/**
 * 获取区域填充配置
 * @returns {boolean} 是否显示区域填充
 */
mxRc_trendChart.prototype.getAreaStyleConfig = function () {
    return mxUtils.getValue(this.style, 'trendShowArea', '1') === '1';
};

// ============================================
// 状态渲染方法
// ============================================

/**
 * 渲染空状态
 * @param {string} message - 提示信息
 */
mxRc_trendChart.prototype.renderEmptyState = function (message) {
    const option = {
        title: {
            text: this.getChartTitle(),
            left: 'center',
            top: 10,
            textStyle: {
                color: '#ffffff',
                fontSize: 14
            }
        },
        graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
                text: message || '暂无数据',
                fontSize: 14,
                fill: '#888'
            }
        }
    };

    if (this.chartInstance) {
        this.chartInstance.setOption(option, true);
    }
};

/**
 * 渲染错误状态
 * @param {string} message - 错误信息
 */
mxRc_trendChart.prototype.renderErrorState = function (message) {
    const option = {
        title: {
            text: this.getChartTitle(),
            left: 'center',
            top: 10,
            textStyle: {
                color: '#ffffff',
                fontSize: 14
            }
        },
        graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
                text: '⚠ ' + (message || '加载失败'),
                fontSize: 12,
                fill: '#ff6b6b'
            }
        }
    };

    if (this.chartInstance) {
        this.chartInstance.setOption(option, true);
    }
};

// ============================================
// 自动刷新
// ============================================

/**
 * 设置自动刷新
 */
mxRc_trendChart.prototype.setupAutoRefresh = function () {
    const graph = this.state.view.graph;
    const isPreview = graph.isChromeless;

    if (!isPreview) {
        return; // 编辑模式不自动刷新
    }

    const refreshInterval = parseInt(mxUtils.getValue(this.style, 'trendRefreshInterval', '0'));
    const timeMode = mxUtils.getValue(this.style, 'trendTimeMode', 'realtime');

    // 历史模式下，不进行自动刷新
    if (timeMode === 'history') {
        return;
    }

    if (refreshInterval > 0) {
        // 清除已有定时器
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        // 设置数据刷新定时器
        this.refreshTimer = setInterval(() => {
            console.log('[TrendChart] 自动刷新数据');
            this.loadAndRenderData();
        }, refreshInterval * 1000);

        console.log('[TrendChart] 自动刷新已启用，间隔:', refreshInterval, '秒');

        // 实时模式：启用平滑滚动（每200ms更新X轴范围）
        if (timeMode === 'realtime') {
            this.startSmoothScroll();
        }
    }
};

/**
 * 启动平滑滚动定时器
 * 每200ms更新一次X轴范围，使时间轴持续平滑滚动
 */
mxRc_trendChart.prototype.startSmoothScroll = function () {
    // 清除已有的滚动定时器
    if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
    }

    this.scrollTimer = setInterval(() => {
        if (!this.chartInstance) return;

        // 直接使用 getTimeRangeConfig 获取当前应该显示的时间范围
        // 这样可以复用 custom 和 preset 的逻辑，无需维护两份映射
        const timeConfig = this.getTimeRangeConfig();

        // 只更新X轴范围，不重新加载数据
        this.chartInstance.setOption({
            xAxis: {
                min: timeConfig.startTime,
                max: timeConfig.endTime
            }
        }, false); // false表示不合并，只更新指定的配置
    }, 200);

    console.log('[TrendChart] 平滑滚动已启用');
};

/**
 * 停止平滑滚动
 */
mxRc_trendChart.prototype.stopSmoothScroll = function () {
    if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
    }
};

/**
 * 销毁组件时清理资源
 */
mxRc_trendChart.prototype.destroy = function () {
    if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
    }

    // 清理平滑滚动定时器
    if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
    }

    if (this.chartInstance) {
        this.chartInstance.dispose();
        this.chartInstance = null;
    }

    mxShape.prototype.destroy.apply(this, arguments);
};

/**
 * 辅助方法：Hex转RGBA
 */
mxRc_trendChart.prototype.hexToRgba = function (hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
};

/**
 * 构建单个系列配置
 * 根据chartStyle生成不同的series配置项
 */
mxRc_trendChart.prototype.buildSeriesItem = function (seriesName, data, color, chartStyle) {
    let seriesItem = {
        name: seriesName,
        data: data,
        itemStyle: { color: color }
    };

    if (chartStyle === 'bar') {
        seriesItem.type = 'bar';
        seriesItem.barMaxWidth = 20;
    } else if (chartStyle === 'scatter') {
        seriesItem.type = 'scatter';
        seriesItem.symbolSize = 10;
        seriesItem.itemStyle = {
            color: color,
            shadowBlur: 10,
            shadowColor: this.hexToRgba(color, 0.5)
        };
    } else {
        seriesItem.type = 'line';
        seriesItem.smooth = true;
        seriesItem.connectNulls = true;
        seriesItem.lineStyle = { width: 2, color: color };
        seriesItem.showSymbol = data.length < 100;
        seriesItem.symbolSize = 5;

        if (chartStyle === 'stacked_area') {
            seriesItem.stack = 'Total';
            seriesItem.areaStyle = {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: color },
                    { offset: 1, color: this.hexToRgba(color, 0.1) }
                ])
            };
            seriesItem.emphasis = { focus: 'series' };
        } else if (chartStyle === 'dark') {
            // 深色模式保留原有逻辑
            seriesItem.areaStyle = this.getAreaStyleConfig() ? {
                opacity: 0.3,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: color },
                    { offset: 1, color: 'rgba(0,0,0,0)' }
                ])
            } : null;
        } else {
            // 透明折线图：无 areaStyle
            seriesItem.areaStyle = null;
        }
    }
    return seriesItem;
};
