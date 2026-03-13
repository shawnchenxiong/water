/* eslint-disable */

import {mxConstants, mxShape, mxUtils} from "../../core/mxgraph";
import echarts from "./echarts-common.js";
import api from '../../js/utils/api.js';
import $ from 'jquery';
import request from "@/components/editor/js/utils/request.js";
export default mxDynamicChart;

// 创建动态图表类
function mxDynamicChart(bounds, fill, stroke, strokewidth, chartConfig) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth || 0;
    this.chartConfig = chartConfig;  // 接收动态配置
}

// 继承自 mxShape 类
mxUtils.extend(mxDynamicChart, mxShape);

// 设置图形常量
mxDynamicChart.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxDynamicChart',
};

// 绘制图形的方法
mxDynamicChart.prototype.paintVertexShape = function (c, x, y, w, h) {
    this.foreground(c, x, y, w, h);
};

// 绘制前景图形的方法
mxDynamicChart.prototype.foreground = async function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        let divId = 'div_' + this.state.cell.id;
        cell.setAttribute('divId', divId);

        // 创建一个 HTML 容器来放置图表
        let htmlStr = `
            <div id="${divId}" class="rc_custom_view_outer_div" style="width: ${w}px; height: ${h}px; overflow: hidden;">
            </div>
        `;
        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);

        // 延迟渲染图表，确保图形容器加载完成
        // setTimeout(async () => {
        //     const chartScript = await this.getChartScript();
        //     this.renderChart(divId, chartScript);
        // }, 1);

        // 第一次执行，渲染一次图表
        try {
            const chartScript = await this.getChartScript();
            console.log('第一次执行~');
            this.renderChart(divId, chartScript);
        } catch (error) {
            console.error('Error fetching chart script:', error);
        }
        // 定时器执行 5分钟后刷新一次图表
        setInterval(async () => {
            try {
                const chartScript = await this.getChartScript();
                console.log('定时器执行~');
                this.renderChart(divId, chartScript);
            } catch (error) {
                console.error('Error fetching chart script:', error);
            }
        }, 300000);
    }
};

const moduleAliasMap = {
    'api': '../../js/utils/api.js',        // 内置 api 模块
    'request': '../../js/utils/request.js', // 内置 request 模块
    // 'lodash': 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js', // lodash CDN
    // 'moment': 'https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.min.js',  // moment CDN
    // 其他内置模块
};
mxDynamicChart.prototype.getChartScript = async function () {
    // var chartOption = this.style['chartOption'];
    // console.log('mxDynamicChart -- getChartScript -- chartOption', chartOption)
    const commonScript = this.style['commonScript'];
    // console.log('mxDynamicChart -- getChartScript -- commonScript', commonScript)
    if (!commonScript) {
        console.warn('No commonScript found in style');
        return;
    }

    try {
        // 第一步：解码
        const decodedCommonScript = decodeURIComponent(commonScript);
        // console.log('mxDynamicChart -- getChartScript -- decodedCommonScript', decodedCommonScript)

        // 第二步：解析
        let parsedCommonScript = JSON.parse(decodedCommonScript);
        // console.log('parsedCommonScript', parsedCommonScript);

        // 第三步：加载模块
        // 动态注册模块别名（可选）
        function registerModuleAlias(alias, path) {
            moduleAliasMap[alias] = path;
        }

        // 创建沙箱环境
        const sandbox = {
            chartInstance: this, // 当前图表实例
            api: api,       // 提供的 API
            request: request,
            $: $, // 直接包含 $, 不通过模块加载器
            modules: {},         // 存储加载的模块
            require: async (modulePath) => {
                // 检查是否是内置模块或别名
                let actualPath = moduleAliasMap[modulePath] || modulePath;

                // 如果已经缓存，直接返回缓存的模块
                if (sandbox.modules[actualPath]) {
                    return sandbox.modules[actualPath];
                }

                // 动态加载模块
                try {
                    const module = await import(/* @vite-ignore */ actualPath);
                    sandbox.modules[actualPath] = module.default || module;
                    // console.log(`Successfully loaded module ${modulePath} from ${actualPath}`);
                    return module.default || module;
                } catch (e) {
                    console.error(`Failed to load module ${modulePath} from ${actualPath}:`, e);
                    throw new Error(`Failed to load module ${modulePath}`);
                }
            }
        };

        // 第四步：提前加载所有需要的模块
        // const requiredModules = []; // 用户可能需要的模块
        // await Promise.all(requiredModules.map(async (moduleName) => {
        //     try {
        //         const module = await sandbox.require(moduleName);
        //         sandbox[moduleName] = module; // 将模块挂载到 sandbox 上
        //     } catch (e) {
        //         console.error(`Failed to preload module ${moduleName}:`, e);
        //     }
        // }));

        // 第五步：执行脚本
        if (parsedCommonScript && typeof parsedCommonScript.script === 'string') {
            // console.log('script', parsedCommonScript.script);

            // 使用立即执行函数表达式(IIFE)来创建一个作用域
            await (async function () {
                try {
                    // 将 script 包装在一个 async 函数中，以处理可能的异步操作
                    const scriptFunction = new Function('sandbox', `async function customScript() {
                            try {
                                ${parsedCommonScript.script}
                            } catch (e) {
                                console.error('Error in customScript:', e);
                                throw e;
                            }
                        }
                        return customScript();
                    `);
                    const result = await scriptFunction(sandbox); // 传递沙箱环境
                    // console.log('Script result:', result);

                    // 确保 renderChart 在所有异步操作完成后调用
                    // this.renderChart(this.divId, result); // 如果需要将结果传递给 renderChart
                    console.log('mxDynamicChart -- getChartScript -- scriptResult', result);
                    this.style['chartOptionUpdate'] = result;
                } catch (e) {
                    console.error('Error executing commonScript:', e);
                    this.style['chartOptionUpdate'] = '{}';
                }
            }).call(this);
        } else {
            console.warn('Invalid or missing script in parsedCommonScript');
            this.style['chartOptionUpdate'] = '{}';
        }
    } catch (e) {
        console.error('Failed to parse or execute commonScript:', e);
        this.style['chartOptionUpdate'] = '{}';
    }
};

// 渲染图表的方法
mxDynamicChart.prototype.renderChart = function (divId, chartConfig) {
    let chartDom = document.getElementById(divId);
    if (!chartDom) {
        console.error('Chart DOM element not found:', divId);
        return;
    }
    let myChart = echarts.init(chartDom);

    console.log('默认 option:', this.style['chartOption']);
    const optionUpdate = JSON.parse(this.style['chartOptionUpdate'] || '{}');
    console.log('更新后 option:', optionUpdate);

    let option;
    if (Object.keys(optionUpdate).length > 0) {
        option = optionUpdate;
    } else {
        option = JSON.parse(this.style['chartOption'] || '{}');
    }
    console.log('最终 option:', option);
    myChart.setOption(option);
};
