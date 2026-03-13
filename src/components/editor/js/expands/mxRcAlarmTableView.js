/* eslint-disable */

import { mxConstants, mxShape, mxUtils } from "../../core/mxgraph";
import api from '../utils/api';

export default mxRcAlarmTableView;

function mxRcAlarmTableView(bounds, fill, stroke, strokewidth) {
    mxShape.call(this);
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = null != strokewidth ? strokewidth : 0;
}

mxUtils.extend(mxRcAlarmTableView, mxShape);
mxRcAlarmTableView.prototype.cst = {
    SHAPE_NAME: 'mxgraph.rc.mxRcAlarmTableView',
};
mxRcAlarmTableView.prototype.paintVertexShape = function (c, x, y, w, h) {
    try {
        this.foreground(c, x, y, w, h);
    } catch (e) {
        console.log(e);
    }
};
mxRcAlarmTableView.prototype.foreground = async function (c, x, y, w, h) {
    if (this.antiAlias) {
        let cell = this.state.cell;
        const graph = this.state.view.graph;
        const style = graph.getCellStyle(cell);
        
        // 使用固定的divId，避免窗口resize时重复创建
        let divId = cell.getAttribute('divId');
        if (!divId) {
            // 只在第一次创建时生成新的divId
            divId = 'div_' + this.state.cell.id + '_alarm_table';
            cell.setAttribute('divId', divId);
        }
        
        // 如果DOM元素已存在且实例也存在，直接返回，避免重复创建
        if (document.getElementById(divId) && window.alarmTableInstances && window.alarmTableInstances[divId]) {
            console.log('告警表格实例已存在，跳过重复创建:', divId);
            return;
        }
        var htmlStr = '';
        let borderColor = style.borderColor || '#EEEEEE';
        let background = style.fillColor || 'none';
        if (background != 'none') {
            if (style.gradientColor) {
                let d = style.gradientDirection || 'south';
                background = `linear-gradient(to ${d == 'south' ? 'top' : d == 'north' ? 'bottom' : d == 'east' ? 'right' : 'left'},${background},${style.gradientColor})`;
            }
        }
        let hasBorder = style.strokeColor && style.strokeWidth;
        let borderStyle = 'solid';
        let borderSpace = '';
        if (style.dashed == 1) {
            let dashPattern = style.dashPattern || '10 10';
            if (dashPattern) {
                dashPattern = dashPattern.split(' ');
                if (dashPattern[0] == '1') {
                    borderStyle = 'dotted';
                    borderSpace = `${dashPattern[1]}px`;
                } else {
                    borderStyle = 'dashed';
                    borderSpace = `${dashPattern[0]}px ${dashPattern[1]}px`;
                }
            }
        }
        let hasRadius = style.rounded == '1' && style.arcSize;
        let borderRadius = hasRadius ? (style.arcSize || 1) : 0;
        let border = hasBorder ? `${style.strokeWidth}px ${borderStyle} ${style.strokeColor}` : '';

        // 告警表格特有的配置
        let alarmTableHeaders = mxUtils.getValue(style, 'alarmTableHeaders', '序号,设备名称,告警级别,告警内容,告警时间');
        let tableHeaderBgColor = mxUtils.getValue(style, 'tableHeaderBgColor', '#DCDCDC');
        let tableHeaderFontColor = mxUtils.getValue(style, 'tableHeaderFontColor', '#000000');
        let tableHeaderFontSize = mxUtils.getValue(style, 'tableHeaderFontSize', 15);
        let tableHeaderFontStyle = mxUtils.getValue(style, 'tableHeaderFontStyle', 'normal');
        let tableHeaderFontWeight = mxUtils.getValue(style, 'tableHeaderFontWeight', 'normal');
        let alarmFontColor = mxUtils.getValue(style, 'fontColor', '#333333');
        let alarmData = mxUtils.getValue(style, 'alarmData', encodeURIComponent(JSON.stringify([])));

        // 分页配置
        let enablePagination = mxUtils.getValue(style, 'enablePagination', 'true') === 'true';
        let pageSize = parseInt(mxUtils.getValue(style, 'pageSize', '10'));
        let currentPage = parseInt(mxUtils.getValue(style, 'currentPage', '1'));

        try {
            alarmData = JSON.parse(decodeURIComponent(alarmData));
        } catch (e) {
            alarmData = [];
        }

        // 解析表头
        let headers = alarmTableHeaders.split(',').map(header => header.trim());

        // 分页逻辑 - 区分静态数据和API数据
        let totalRecords, totalPages, displayData;


        if (!graph.isChromeless) {
            // 编辑模式：显示示例数据
            if (alarmData.length === 0) {
                alarmData = [
                    {
                        index: '1',
                        name: '温度传感器01',
                        logLevel: '1',
                        content: '温度超过阈值',
                        time: '2024-01-15 14:30:25'
                    },
                    {
                        index: '2',
                        name: '压力传感器02',
                        logLevel: '2',
                        content: '压力异常',
                        time: '2024-01-15 14:28:10'
                    },
                    {
                        index: '3',
                        name: '湿度传感器03',
                        logLevel: '2',
                        content: '湿度过高',
                        time: '2024-01-15 14:25:30'
                    },
                    {
                        index: '4',
                        name: '流量传感器04',
                        logLevel: '3',
                        content: '流量过低',
                        time: '2024-01-15 14:20:15'
                    },
                    {
                        index: '5',
                        name: '电压传感器05',
                        logLevel: '1',
                        content: '电压异常',
                        time: '2024-01-15 14:15:45'
                    }
                ];
            }
            
            // 静态数据：前端分页
            totalRecords = alarmData.length;
            totalPages = Math.ceil(totalRecords / pageSize);
            displayData = alarmData;

            if (enablePagination && totalRecords > 0) {
                currentPage = Math.max(1, Math.min(currentPage, totalPages));
                let startIndex = (currentPage - 1) * pageSize;
                let endIndex = Math.min(startIndex + pageSize, totalRecords);
                displayData = alarmData.slice(startIndex, endIndex);
            }
        } else {
            // 预览模式：初始化默认值，等待API返回
            totalRecords = 0;
            totalPages = 0;
            displayData = [];
            // 预览模式：调用 API 获取真实数据
            // 添加防抖机制，避免窗口调整时频繁请求API
            if (!window.alarmTableDebounceTimers) {
                window.alarmTableDebounceTimers = {};
            }
            
            // 清除之前的定时器
            if (window.alarmTableDebounceTimers[divId]) {
                clearTimeout(window.alarmTableDebounceTimers[divId]);
            }
            
            // 设置防抖定时器，500ms内只执行最后一次请求
            window.alarmTableDebounceTimers[divId] = setTimeout(async () => {
                try {
                    // 添加实例标识和延迟，避免多实例同时调用API
                    const delay = Math.random() * 100; // 随机延迟0-100ms
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    const res = await api.getAllAlarm({ 
                        page: currentPage, 
                        pageSize: pageSize,
                        instanceId: divId // 添加实例标识
                    });
                if (res.code === 200) {
                    // API数据已经分页处理，直接使用
                    alarmData = res.data.map((item, index) => {
                        return {
                            index: ((currentPage - 1) * pageSize + index + 1).toString(),
                            name: item.name,
                            logLevel: item.logLevel.toString(),
                            content: item.content,
                            time: item.time
                        };
                    });

                    // 使用API返回的总条数
                    totalRecords = res.total || 0;
                    totalPages = Math.ceil(totalRecords / pageSize);
                    displayData = alarmData;
                    
                    // 缓存数据，供防抖期间使用
                    if (!window.alarmTableCache) {
                        window.alarmTableCache = {};
                    }
                    window.alarmTableCache[divId] = {
                        totalRecords: totalRecords,
                        totalPages: totalPages,
                        displayData: displayData,
                        timestamp: Date.now()
                    };
                    
                    // 显示分页控件
                    const paginationDiv = document.querySelector(`#${divId}-pagination`);
                    if (paginationDiv && enablePagination && totalRecords > 0) {
                        paginationDiv.innerHTML = `
                            <button onclick="window.alarmTableInstances['${divId}'].changePage(1)" ${currentPage <= 1 ? 'disabled' : ''}>首页</button>
                            <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>上一页</button>
                            <span class="page-info">第 ${currentPage} 页 / 共 ${totalPages} 页</span>
                            <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
                            <button onclick="window.alarmTableInstances['${divId}'].changePage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''}>末页</button>
                            <span class="page-info">共 ${totalRecords} 条记录</span>
                        `;
                    }
                    
                    console.log(`[${divId}] API数据获取成功:`, alarmData.length, '条数据，总条数:', totalRecords);
                } else {
                    // API调用失败，使用空数据
                    console.error(`[${divId}] API调用失败:`, res);
                    totalRecords = 0;
                    totalPages = 0;
                    displayData = [];
                }
            } catch (error) {
                // API调用异常，使用空数据
                console.error(`[${divId}] API调用异常:`, error);
                totalRecords = 0;
                totalPages = 0;
                displayData = [];
            }
                    // 防抖延迟后重新渲染组件
                    setTimeout(() => {
                        if (window.alarmTableInstances[divId]) {
                            // 触发组件重新渲染
                            const element = document.getElementById(divId);
                            if (element) {
                                // 更新表格内容
                                const tableBody = element.querySelector('tbody');
                                if (tableBody && displayData.length > 0) {
                                    tableBody.innerHTML = displayData.map(row => {
                                        return `<tr>
                                            ${headers.map(header => {
                                                let fieldName = header;
                                                if (header === '序号') fieldName = 'index';
                                                else if (header === '设备名称') fieldName = 'name';
                                                else if (header === '告警级别') fieldName = 'logLevel';
                                                else if (header === '告警内容') fieldName = 'content';
                                                else if (header === '告警时间') fieldName = 'time';

                                                let cellValue = row[fieldName] || '';
                                                let cellClass = '';

                                                if (header === '告警级别') {
                                                    if (cellValue === '1') {
                                                        cellClass = 'alarm-level-high';
                                                        cellValue = '紧急';
                                                    } else if (cellValue === '2') {
                                                        cellClass = 'alarm-level-medium';
                                                        cellValue = '严重';
                                                    } else if (cellValue === '3') {
                                                        cellClass = 'alarm-level-low';
                                                        cellValue = '一般';
                                                    }
                                                }

                                                return `<td class="${cellClass}" title="${cellValue}">${cellValue}</td>`;
                                            }).join('')}
                                        </tr>`;
                                    }).join('');
                                }
                                
                                // 更新分页控件
                                const paginationDiv = element.querySelector(`#${divId}-pagination`);
                                if (paginationDiv && enablePagination && totalRecords > 0) {
                                    paginationDiv.innerHTML = `
                                        <button onclick="window.alarmTableInstances['${divId}'].changePage(1)" ${currentPage <= 1 ? 'disabled' : ''}>首页</button>
                                        <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>上一页</button>
                                        <span class="page-info">第 ${currentPage} 页 / 共 ${totalPages} 页</span>
                                        <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
                                        <button onclick="window.alarmTableInstances['${divId}'].changePage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''}>末页</button>
                                        <span class="page-info">共 ${totalRecords} 条记录</span>
                                    `;
                                }
                            }
                        }
                    }, 50);
                    
            }, 500); // 500ms防抖延迟
            
            // 在防抖期间，使用缓存数据或显示加载状态
            if (window.alarmTableCache && window.alarmTableCache[divId]) {
                const cachedData = window.alarmTableCache[divId];
                totalRecords = cachedData.totalRecords;
                totalPages = cachedData.totalPages;
                displayData = cachedData.displayData;
                console.log(`[${divId}] 使用缓存数据，避免防抖期间空白`);
            } else {
                // 首次加载，显示加载状态
                totalRecords = 0;
                totalPages = 0;
                displayData = [];
            }
        }

        if (!graph.isChromeless) {
            // 静态数据：前端分页
            totalRecords = alarmData.length;
            totalPages = Math.ceil(totalRecords / pageSize);
            displayData = alarmData;

            if (enablePagination && totalRecords > 0) {
                currentPage = Math.max(1, Math.min(currentPage, totalPages));
                let startIndex = (currentPage - 1) * pageSize;
                let endIndex = Math.min(startIndex + pageSize, totalRecords);
                displayData = alarmData.slice(startIndex, endIndex);
            }
        }

 console.log('totalRecordstotalRecordstotalRecordstotalRecords',totalRecords);

        // 计算列宽
        // 使用JSON格式配置列宽
        let columnConfig = mxUtils.getValue(style, 'columnConfig', JSON.stringify({
            '序号': '60px',
            '设备名称': '50px',
            '告警级别': '50px',
            '告警内容': '200px',    // 可以适当增加宽度
            '告警时间': '140px'
        }));

        try {
            columnConfig = JSON.parse(columnConfig);
        } catch (e) {
            columnConfig = {};
        }
        let columnWidth = Math.floor(w / headers.length);

        // 计算分页控件高度
        let paginationHeight = enablePagination && totalRecords > 0 ? 40 : 40;
        let tableHeight = h - paginationHeight;

        // 存储graph和cell引用到全局，供分页函数使用
        if (!window.alarmTableInstances) {
            window.alarmTableInstances = {};
        }
        
        // 检查是否已存在相同divId的实例，如果存在则先清理
        if (window.alarmTableInstances[divId]) {
            console.warn('发现重复的divId，清理旧实例:', divId);
            // 清理旧的DOM元素
            const oldElement = document.getElementById(divId);
            if (oldElement) {
                oldElement.remove();
            }
            delete window.alarmTableInstances[divId];
        }
        
        window.alarmTableInstances[divId] = {
            graph: graph,
            cell: cell,
            divId: divId,
            destroy: function() {
                // 清理防抖定时器
                if (window.alarmTableDebounceTimers && window.alarmTableDebounceTimers[divId]) {
                    clearTimeout(window.alarmTableDebounceTimers[divId]);
                    delete window.alarmTableDebounceTimers[divId];
                }
                
                // 清理分页防抖定时器
                if (window.alarmTablePageDebounceTimers && window.alarmTablePageDebounceTimers[divId]) {
                    clearTimeout(window.alarmTablePageDebounceTimers[divId]);
                    delete window.alarmTablePageDebounceTimers[divId];
                }
                
                // 清理缓存数据
                if (window.alarmTableCache && window.alarmTableCache[divId]) {
                    delete window.alarmTableCache[divId];
                }
                
                // 清理实例引用
                delete window.alarmTableInstances[divId];
                console.log('告警表格实例已清理:', divId);
            },
            searchAlarms: async function() {
                try {
                    // 获取筛选条件
                    const deviceName = document.getElementById(`${divId}-device-name`).value.trim();
                    const alarmLevel = document.getElementById(`${divId}-alarm-level`).value;
                    const startTime = document.getElementById(`${divId}-start-time`).value;
                    const endTime = document.getElementById(`${divId}-end-time`).value;
                    
                    console.log(`[${divId}] 开始筛选查询:`, { deviceName, alarmLevel, startTime, endTime });
                    
                    // 重置到第一页
                    const currentPage = 1;
                    const style = this.graph.getCellStyle(this.cell);
                    const pageSize = parseInt(mxUtils.getValue(style, 'pageSize', '10'));
                    const headers = ['序号', '设备名称', '告警级别', '告警内容', '告警时间'];
                    
                    // 显示加载状态
                    const tableBody = document.querySelector(`#${divId}-table tbody`);
                    if (tableBody) {
                        tableBody.innerHTML = `<tr>
                            <td colspan="${headers.length}">
                                <div style="width: 100%;height: 200px;display: flex;align-items: center;justify-content: center;font-size:16px;color:#999;">正在查询数据...</div>
                            </td>
                        </tr>`;
                    }
                    
                    // 构建API参数
                    const apiParams = {
                        page: currentPage,
                        pageSize: pageSize,
                        instanceId: divId
                    };
                    
                    // 添加筛选条件
                    if (deviceName) apiParams.deviceName = deviceName;
                    if (alarmLevel) apiParams.alarmLevel = alarmLevel;
                    if (startTime) apiParams.startTime = startTime.replace('T', ' ');
                    if (endTime) apiParams.endTime = endTime.replace('T', ' ');
                    
                    // 添加随机延迟
                    const delay = Math.random() * 50;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    // 调用API
                    const res = await api.getAllAlarm(apiParams);
                    
                    // 检查实例是否仍然存在
                    if (!window.alarmTableInstances[divId]) {
                        console.warn('实例已被销毁，取消数据更新:', divId);
                        return;
                    }
                    
                    if (res.code === 200) {
                        // 处理API返回的数据
                        const pageData = res.data.map((item, index) => {
                            return {
                                index: ((currentPage - 1) * pageSize + index + 1).toString(),
                                name: item.name,
                                logLevel: item.logLevel.toString(),
                                content: item.content,
                                time: item.time
                            };
                        });
                        
                        const totalRecords = res.total || 0;
                        const totalPages = Math.ceil(totalRecords / pageSize);
                        
                        // 更新表格数据
                        if (tableBody) {
                            if (pageData.length === 0) {
                                tableBody.innerHTML = `<tr>
                                    <td colspan="${headers.length}">
                                        <div style="width: 100%;height: 200px;display: flex;align-items: center;justify-content: center;font-size:16px;color:#999;">未找到符合条件的数据</div>
                                    </td>
                                </tr>`;
                            } else {
                                tableBody.innerHTML = pageData.map(row => {
                                    return `<tr>
                                        ${headers.map(header => {
                                            let fieldName = header;
                                            if (header === '序号') fieldName = 'index';
                                            else if (header === '设备名称') fieldName = 'name';
                                            else if (header === '告警级别') fieldName = 'logLevel';
                                            else if (header === '告警内容') fieldName = 'content';
                                            else if (header === '告警时间') fieldName = 'time';

                                            let cellValue = row[fieldName] || '';
                                            let cellClass = '';

                                            if (header === '告警级别') {
                                                if (cellValue === '1') {
                                                    cellClass = 'alarm-level-high';
                                                    cellValue = '紧急';
                                                } else if (cellValue === '2') {
                                                    cellClass = 'alarm-level-medium';
                                                    cellValue = '严重';
                                                } else if (cellValue === '3') {
                                                    cellClass = 'alarm-level-low';
                                                    cellValue = '一般';
                                                }
                                            }

                                            return `<td class="${cellClass}" title="${cellValue}">${cellValue}</td>`;
                                        }).join('')}
                                    </tr>`;
                                }).join('');
                            }
                        }
                        
                        // 更新分页控件
                        const paginationDiv = document.querySelector(`#${divId}-pagination`);
                        if (paginationDiv) {
                            paginationDiv.innerHTML = `
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(1)" ${currentPage <= 1 ? 'disabled' : ''}>首页</button>
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>上一页</button>
                                <span class="page-info">第 ${currentPage} 页 / 共 ${totalPages} 页</span>
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''}>末页</button>
                                <span class="page-info">共 ${totalRecords} 条记录</span>
                            `;
                        }
                        
                        console.log(`[${divId}] 筛选查询成功，找到`, totalRecords, '条记录');
                        
                    } else {
                        if (tableBody) {
                            tableBody.innerHTML = `<tr>
                                <td colspan="${headers.length}">
                                    <div style="width: 100%;height: 200px;line-height: 200px;text-align:center;font-size:16px;color:#ff4d4f;">查询失败，请重试</div>
                                </td>
                            </tr>`;
                        }
                        console.error(`[${divId}] 筛选查询失败:`, res);
                    }
                    
                } catch (error) {
                    const tableBody = document.querySelector(`#${divId}-table tbody`);
                    if (tableBody) {
                        const headers = ['序号', '设备名称', '告警级别', '告警内容', '告警时间'];
                        tableBody.innerHTML = `<tr>
                            <td colspan="${headers.length}">
                                <div style="width: 100%;height: 200px;line-height: 200px;text-align:center;font-size:16px;color:#ff4d4f;">网络异常，请重试</div>
                            </td>
                        </tr>`;
                    }
                    console.error(`[${divId}] 筛选查询异常:`, error);
                }
            },
            resetFilters: function() {
                // 清空所有筛选条件
                document.getElementById(`${divId}-device-name`).value = '';
                document.getElementById(`${divId}-alarm-level`).value = '';
                document.getElementById(`${divId}-start-time`).value = '';
                document.getElementById(`${divId}-end-time`).value = '';
                document.getElementById(`${divId}-time-range-display`).textContent = '请选择时间范围';
                
                console.log(`[${divId}] 重置筛选条件`);
                
                // 重新加载第一页数据
                this.changePage(1);
            },
            openTimeRangePicker: function() {
                const panel = document.getElementById(`${divId}-time-range-panel`);
                console.log(`[${divId}] 打开时间范围选择器`);
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            },
            confirmTimeRange: function() {
                const startTime = document.getElementById(`${divId}-start-time`).value;
                const endTime = document.getElementById(`${divId}-end-time`).value;
                const display = document.getElementById(`${divId}-time-range-display`);
                
                if (startTime && endTime) {
                    display.textContent = `${startTime.replace('T', ' ')} 至 ${endTime.replace('T', ' ')}`;
                } else if (startTime) {
                    display.textContent = `从 ${startTime}`;
                } else if (endTime) {
                    display.textContent = `到 ${endTime}`;
                } else {
                    display.textContent = '请选择时间范围';
                }
                
                document.getElementById(`${divId}-time-range-panel`).style.display = 'none';
            },
            cancelTimeRange: function() {
                document.getElementById(`${divId}-time-range-panel`).style.display = 'none';
            },
            changePage: function(page) {
                // 添加防抖机制，避免快速点击分页按钮时频繁请求API
                if (!window.alarmTablePageDebounceTimers) {
                    window.alarmTablePageDebounceTimers = {};
                }
                
                // 清除之前的分页定时器
                if (window.alarmTablePageDebounceTimers[divId]) {
                    clearTimeout(window.alarmTablePageDebounceTimers[divId]);
                }
                
                // 设置分页防抖定时器，300ms内只执行最后一次请求
                window.alarmTablePageDebounceTimers[divId] = setTimeout(async () => {
                    try {
                        const style = this.graph.getCellStyle(this.cell);
                        const pageSize = parseInt(mxUtils.getValue(style, 'pageSize', '10'));
                        const headers = ['序号', '设备名称', '告警级别', '告警内容', '告警时间'];
                        
                        // 显示加载状态
                        const tableBody = document.querySelector(`#${divId}-table tbody`);
                        if (tableBody) {
                            tableBody.innerHTML = `<tr>
                                <td colspan="${headers.length}">
                                    <div style="width: 100%;height: 200px;display: flex;align-items: center;justify-content: center;font-size:16px;color:#999;">正在加载数据...</div>
                                </td>
                            </tr>`;
                        }
                        
                        // 调用API获取指定页的数据，添加实例标识和延迟
                        const delay = Math.random() * 50; // 随机延迟0-50ms
                        await new Promise(resolve => setTimeout(resolve, delay));
                        
                        const res = await api.getAllAlarm({ 
                            page: page, 
                            pageSize: pageSize,
                            instanceId: divId // 添加实例标识
                        });
                    
                    // 检查实例是否仍然存在
                    if (!window.alarmTableInstances[divId]) {
                        console.warn('实例已被销毁，取消数据更新:', divId);
                        return;
                    }
                    
                    if (res.code === 200) {
                        // 处理API返回的数据
                        const pageData = res.data.map((item, index) => {
                            return {
                                index: ((page - 1) * pageSize + index + 1).toString(),
                                name: item.name,
                                logLevel: item.logLevel.toString(),
                                content: item.content,
                                time: item.time
                            };
                        });
                        
                        const totalRecords = res.total || 0;
                        const totalPages = Math.ceil(totalRecords / pageSize);
                        const currentPage = Math.max(1, Math.min(page, totalPages));
                        
                        // 更新表格数据
                        if (tableBody) {
                            if (pageData.length === 0) {
                                tableBody.innerHTML = `<tr>
                                    <td colspan="${headers.length}">
                                        <div style="width: 100%;height: 200px;display: flex;align-items: center;justify-content: center;font-size:16px;color:#999;">暂无告警数据</div>
                                    </td>
                                </tr>`;
                            } else {
                                tableBody.innerHTML = pageData.map(row => {
                                    return `<tr>
                                        ${headers.map(header => {
                                            let fieldName = header;
                                            if (header === '序号') fieldName = 'index';
                                            else if (header === '设备名称') fieldName = 'name';
                                            else if (header === '告警级别') fieldName = 'logLevel';
                                            else if (header === '告警内容') fieldName = 'content';
                                            else if (header === '告警时间') fieldName = 'time';

                                            let cellValue = row[fieldName] || '';
                                            let cellClass = '';

                                            if (header === '告警级别') {
                                                if (cellValue === '1') {
                                                    cellClass = 'alarm-level-high';
                                                    cellValue = '紧急';
                                                } else if (cellValue === '2') {
                                                    cellClass = 'alarm-level-medium';
                                                    cellValue = '严重';
                                                } else if (cellValue === '3') {
                                                    cellClass = 'alarm-level-low';
                                                    cellValue = '一般';
                                                }
                                            }

                                            return `<td class="${cellClass}" title="${cellValue}">${cellValue}</td>`;
                                        }).join('')}
                                    </tr>`;
                                }).join('');
                            }
                        }
                        
                        // 更新分页控件
                        const paginationDiv = document.querySelector(`#${divId}-pagination`);
                        if (paginationDiv) {
                            paginationDiv.innerHTML = `
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(1)" ${currentPage <= 1 ? 'disabled' : ''}>首页</button>
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>上一页</button>
                                <span class="page-info">第 ${currentPage} 页 / 共 ${totalPages} 页</span>
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
                                <button onclick="window.alarmTableInstances['${divId}'].changePage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''}>末页</button>
                                <span class="page-info">共 ${totalRecords} 条记录</span>
                            `;
                        }
                        
                        console.log(`[${divId}] 分页切换成功，当前第`, currentPage, '页，共', totalRecords, '条记录');
                        
                    } else {
                        if (tableBody) {
                            tableBody.innerHTML = `<tr>
                                <td colspan="${headers.length}">
                                    <div style="width: 100%;height: 200px;line-height: 200px;text-align:center;font-size:16px;color:#ff4d4f;">数据加载失败，请重试</div>
                                </td>
                            </tr>`;
                        }
                        console.error(`[${divId}] API调用失败:`, res);
                    }
                    
                } catch (error) {
                    const tableBody = document.querySelector(`#${divId}-table tbody`);
                    if (tableBody) {
                        const headers = ['序号', '设备名称', '告警级别', '告警内容', '告警时间'];
                        tableBody.innerHTML = `<tr>
                            <td colspan="${headers.length}">
                                <div style="width: 100%;height: 200px;line-height: 200px;text-align:center;font-size:16px;color:#ff4d4f;">网络异常，请重试</div>
                            </td>
                        </tr>`;
                    }
                    console.error(`[${divId}] 分页切换失败:`, error);
                }
                }, 300); // 300ms分页防抖延迟
            }

        };

        htmlStr = `<div id="${divId}" class="rc_custom_view_outer_div" class="singleImage" style="${hasBorder ? `border: ${border}; ${borderSpace ? `border-spacing:${borderSpace};` : ''}` : ''} ${hasRadius ? `border-radius:${borderRadius}px;` : ''} width: ${w}px;height: ${h}px;background: ${background};overflow: hidden;display: flex;flex-direction: column;">
            <!-- 筛选区域 -->
            <div id="${divId}-filter" class="filter-container">
                <div class="filter-row">
                    <div class="filter-item">
                        <label>设备名称:</label>
                        <input type="text" id="${divId}-device-name" placeholder="请输入设备名称" />
                    </div>
                    <div class="filter-item">
                        <label>告警等级:</label>
                        <select id="${divId}-alarm-level">
                            <option value="">全部</option>
                            <option value="1">紧急</option>
                            <option value="2">严重</option>
                            <option value="3">一般</option>
                        </select>
                    </div>
                    <div class="filter-item time-range-picker">
                        <label>时间范围:</label>
                        <div class="time-range-input" onclick="window.alarmTableInstances['${divId}'].openTimeRangePicker()">
                            <span id="${divId}-time-range-display">请选择时间范围</span>
                            <span class="range-arrow">▼</span>
                        </div>
                        <div id="${divId}-time-range-panel" class="time-range-panel" style="display: none;">
                            <div class="time-input-group">
                                <label>开始时间:</label>
                                 <div class="custom-datetime-wrapper">
                                    <input type="datetime-local" id="${divId}-start-time" class="custom-datetime-input" />
                                    <span class="custom-datetime-icon">📅</span> <!-- 可替换为Font Awesome图标 -->
                                </div>
                            </div>
                            <div class="time-input-group">
                                <label>结束时间:</label>
                                <div class="custom-datetime-wrapper">
                                    <input type="datetime-local" id="${divId}-end-time" class="custom-datetime-input" />
                                    <span class="custom-datetime-icon">📅</span>
                                </div>
                            </div>
                            <div class="time-range-buttons">
                                <button onclick="window.alarmTableInstances['${divId}'].confirmTimeRange()">确定</button>
                                <button onclick="window.alarmTableInstances['${divId}'].cancelTimeRange()">取消</button>
                            </div>
                        </div>
                    </div>
                    <div class="filter-buttons">
                        <button onclick="window.alarmTableInstances['${divId}'].searchAlarms()">查询</button>
                        <button onclick="window.alarmTableInstances['${divId}'].resetFilters()">重置</button>
                    </div>
                </div>
            </div>
            <style>
                /* 筛选区域样式 */
                #${divId} .filter-container {
                    width: 100%;
                    background: ${tableHeaderBgColor};
                    padding: 12px;
                    box-sizing: border-box;
                }
                #${divId} .filter-row {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 12px;
                }
                #${divId} .filter-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                #${divId} .time-range-picker {
                    position: relative;
                    min-width: 230px;
                }
                #${divId} .time-range-input {
                    padding: 6px 8px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    background: ${tableHeaderBgColor};
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: ${alarmFontColor};
                    width:230px;
                }
                #${divId} .time-range-input:hover {
                    border-color: #1890ff;
                }
                #${divId} .range-arrow {
                    color: ${alarmFontColor};
                    font-size: 10px;
                }
                #${divId} .time-range-panel {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: ${tableHeaderBgColor};
                    backdrop-filter: blur(8px); /* 模糊值越大，磨砂感越强 */
                    -webkit-backdrop-filter: blur(8px); /* 兼容Safari浏览器 */
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    z-index: 1000;
                    padding: 12px;
                    margin-top: 2px;
                }
                #${divId} .time-input-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                #${divId} .time-input-group label {
                    min-width: 60px;
                    font-size: 12px;
                }
                #${divId} .time-input-group input {
                    flex: 1;
                    padding: 4px 6px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    font-size: 12px;
                }
                #${divId} .time-range-buttons {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                    margin-top: 8px;
                }
                #${divId} .time-range-buttons button {
                    padding: 4px 12px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    background: white;
                    cursor: pointer;
                    font-size: 12px;
                }
                #${divId} .time-range-buttons button:first-child {
                    background: #1890ff;
                    color: white;
                    border-color: #1890ff;
                }
                #${divId} .time-range-buttons button:hover {
                    opacity: 0.8;
                }
                #${divId} .filter-item label {
                    font-size: 12px;
                    color: ${alarmFontColor};
                    white-space: nowrap;
                    min-width: 60px;
                }
                #${divId} .filter-item input,
                #${divId} .filter-item select {
                    padding: 4px 8px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    font-size: 12px;
                    min-width: 120px;
                    height: 28px;
                    box-sizing: border-box;
                    color: ${alarmFontColor};
                    background: ${tableHeaderBgColor} !important;
                    position: relative;
                    z-index: 1;
                }
                #${divId}-alarm-level option {
                    background:  #112126!important;
                    backdrop-filter: blur(8px); /* 模糊值越大，磨砂感越强 */
                    -webkit-backdrop-filter: blur(8px); /* 兼容Safari浏览器 */
                }
                #${divId} .filter-item input:focus,
                #${divId} .filter-item select:focus {
                    border-color: #40a9ff;
                    outline: none;
                }
                #${divId} .filter-buttons {
                    display: flex;
                    gap: 8px;
                    margin-left: auto;
                }
                #${divId} .filter-buttons button {
                    padding: 4px 12px;
                    border: 1px solid #d9d9d9;
                    border-radius: 4px;
                    background: ${tableHeaderBgColor};
                    cursor: pointer;
                    font-size: 12px;
                    color: ${alarmFontColor};

                }
                #${divId} .filter-buttons button:first-child {
                    background:  ${tableHeaderBgColor};
                    color: ${alarmFontColor};
                    border-color: #1890ff;
                }
                #${divId} .filter-buttons button:first-child:hover {
                    background: ${tableHeaderBgColor};
                    border-color: #40a9ff;
                    color: #40a9ff;
                }
                #${divId} .filter-buttons button:last-child:hover {
                    border-color: #40a9ff;
                    color: #40a9ff;
                }
                
                #${divId} .table-container {
                    flex: 1;
                    width: 100%;
                    overflow: auto;

                }
                /* 自定义滚动条样式 */
                #${divId} .table-container::-webkit-scrollbar {
                    width: 1px;
                    height: 6px;
                }
                #${divId} .table-container::-webkit-scrollbar-track {
                    background: none;
                    border-radius: 4px;
                }
                #${divId} .table-container::-webkit-scrollbar-thumb {
                    background: white;
                    border-radius: 4px;
                }
                #${divId} .table-container::-webkit-scrollbar-thumb:hover {
                    background: white;
                }
                #${divId} .table-container::-webkit-scrollbar-corner {
                    display: none;
                    background: transparent;
                }
                /* 移除滚动条箭头按钮 */
                #${divId} .table-container::-webkit-scrollbar-button {
                    display: none;
                }
                #${divId}-table {
                    width: 100%;
                    min-width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;  // 改为固定布局
                }
                #${divId}-table th,
                #${divId}-table td {
                    text-align: center;
                    padding: 4px 8px;
                    white-space: nowrap;
                    overflow: hidden;      // 添加溢出隐藏
                    text-overflow: ellipsis; // 添加省略号
                    min-width: 80px;
                }
                #${divId}-table th {
                    background: ${tableHeaderBgColor};
                    color: ${tableHeaderFontColor};
                    font-size: ${tableHeaderFontSize}px;
                    font-style: ${tableHeaderFontStyle};
                    font-weight: ${tableHeaderFontWeight};
                    height: 35px;
                    top: 0;
                    right: 4px;
                    z-index: 10;
                }
                #${divId}-table td {
                    height: 30px;
                    font-size: 12px;
                    color: ${alarmFontColor};
                }
                #${divId}-table .alarm-level-high {
                    color: #ff4d4f;
                    font-weight: bold;
                }
                #${divId}-table .alarm-level-medium {
                    color: #faad14;
                    font-weight: bold;
                }
                #${divId}-table .alarm-level-low {
                    color: #52c41a;
                    font-weight: bold;
                }
                #${divId}-pagination {
                    width: 100%;
                    height: ${paginationHeight}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${tableHeaderBgColor};
                    font-size: 12px;
                    gap: 8px;
                    color: ${alarmFontColor};
                }
                #${divId}-pagination button {
                    padding: 4px 8px;
                    border: 1px solid #d9d9d9;
                    background: ${tableHeaderBgColor};
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 12px;
                    color: ${alarmFontColor};
                }
                #${divId}-pagination button:hover {
                    border-color: #40a9ff;
                    color: #40a9ff;
                }
                #${divId}-pagination button:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }
                #${divId}-pagination .current-page {
                    background: #1890ff;
                    color: white;
                    border-color: #1890ff;
                }
                #${divId}-pagination .page-info {
                    margin: 0 8px;
                    color: ${alarmFontColor};
                }
                #${divId} .custom-datetime-wrapper {
                    position: relative;
                    display: inline-block;
                    width: 100%;
                }

                /* 隐藏原生图标 */
                #${divId} .custom-datetime-input {
                    width: 100%;
                    padding-right: 30px; /* 给自定义图标留出空间 */
                    position: relative;
                    z-index: 1;
                }

                /* 针对不同浏览器隐藏原生图标 */
                #${divId} .custom-datetime-input::-webkit-calendar-picker-indicator {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0; /* 隐藏但保留点击区域 */
                    cursor: pointer;
                }

                /* 自定义图标样式 */
                #${divId} .custom-datetime-icon {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #1890ff; /* 这里可以自定义图标颜色 */
                    z-index: 0; /* 确保在输入框下方但可见 */
                    pointer-events: none; /* 避免图标本身阻挡点击 */
                }

                /* 可选：添加悬停效果 */
                #${divId} .custom-datetime-wrapper:hover .custom-datetime-icon {
                    color: #40a9ff; /* 悬停时的颜色 */
                }
            </style>
            <div class="table-container">
                <table id="${divId}-table" class="rcui-alarm-table">
                    <thead>
                        <tr>
                            ${headers.map(header => {
                                let width = columnConfig[header] || `${Math.floor(w / headers.length)}px`;
                                return `<th style="width: ${width}; min-width: ${width}; max-width: ${width};">${header}</th>`;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${displayData.length <= 0 ? `<tr>
                            <td colspan="${headers.length}">
                                <div style="width: 100%;height: 200px;line-height: 200px;text-align:center;font-size:16px;color:#999;">暂无告警数据</div>  
                            </td>
                        </tr>` : displayData.map(row => {
            return `<tr>
                                ${headers.map(header => {
                // 中文表头到英文字段的映射
                let fieldName = header;
                if (header === '序号') fieldName = 'index';
                else if (header === '设备名称') fieldName = 'name';
                else if (header === '告警级别') fieldName = 'logLevel';
                else if (header === '告警内容') fieldName = 'content';
                else if (header === '告警时间') fieldName = 'time';

                let cellValue = row[fieldName] || '';
                let cellClass = '';

                // 为告警等级添加样式
                if (header === '告警级别') {
                    if (cellValue === '1') {
                        cellClass = 'alarm-level-high';
                        cellValue = '紧急'; // 显示中文
                    } else if (cellValue === '2') {
                        cellClass = 'alarm-level-medium';
                        cellValue = '严重'; // 显示中文
                    } else if (cellValue === '3') {
                        cellClass = 'alarm-level-low';
                        cellValue = '一般'; // 显示中文
                    }
                }

                return `<td class="${cellClass}" title="${cellValue}">${cellValue}</td>`;
            }).join('')}
                            </tr>`;
        }).join('')}
                    </tbody>
                </table>
            </div>`;

        // 添加分页控件（在表格容器外部）- 在预览模式下始终添加，在编辑模式下根据条件添加
        if (enablePagination && (totalRecords > 0 || graph.isChromeless)) {
            htmlStr += `
            <div id="${divId}-pagination">
                <button onclick="window.alarmTableInstances['${divId}'].changePage(1)" ${currentPage <= 1 ? 'disabled' : ''}>首页</button>
                <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>上一页</button>
                <span class="page-info">第 ${currentPage} 页 / 共 ${totalPages} 页</span>
                <button onclick="window.alarmTableInstances['${divId}'].changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
                <button onclick="window.alarmTableInstances['${divId}'].changePage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''}>末页</button>
                <span class="page-info">共 ${totalRecords} 条记录</span>
            </div>`;
        }

        htmlStr += `
        </div>`;

        // 每个实例都有独立的分页方法，不再需要全局函数
        
        // 添加实例清理机制
        setTimeout(() => {
            // 检查DOM元素是否还存在，如果不存在则清理实例
            const checkAndCleanup = () => {
                const element = document.getElementById(divId);
                if (!element && window.alarmTableInstances[divId]) {
                    window.alarmTableInstances[divId].destroy();
                }
            };
            
            // 延迟检查，给DOM渲染一些时间
            setTimeout(checkAndCleanup, 1000);
        }, 100);

        c.text(x, y, w, h, htmlStr, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP, 0, 'html', 0, 0, 0);
    }
};