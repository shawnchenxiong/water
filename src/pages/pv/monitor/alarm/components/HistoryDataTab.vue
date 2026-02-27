<template>
  <div class="history-data-tab">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <!-- 左侧控件 -->
      <div class="left-controls">
        <!-- 快捷时间选择 - 按钮组 -->
        <el-button-group class="time-dimension">
          <el-button
            v-for="dimension in timeDimensions"
            :key="dimension.value"
            :type="activeDimension === dimension.value ? 'primary' : ''"
            size="small"
            @click="handleDimensionChange(dimension.value)"
          >
            {{ dimension.label }}
          </el-button>
        </el-button-group>

        <!-- 日期范围选择 -->
        <div class="date-controls">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            size="small"
            style="width: 360px"
            @change="handleDateRangeChange"
          />
          <el-button type="primary" size="small" @click="handleParamSelect" :loading="loading">参数选择</el-button>
          <el-button size="small" type="primary" @click="fetchData" :loading="loading">查询数据</el-button>
        </div>
      </div>

      <!-- 右侧操作 -->
      <div class="right-actions">
        <el-button-group>
          <el-button :icon="Download" size="small" />
          <el-button :icon="RefreshRight" size="small" @click="fetchData" :loading="loading" />
        </el-button-group>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div v-if="loading" class="loading-container">
        <el-empty description="加载中..." />
      </div>
      <div v-else-if="historyData.length === 0" class="empty-container">
        <el-empty description="暂无数据，请选择参数并查询" />
      </div>
      <div v-else ref="chartRef" class="chart" style="width: 100%; height: 400px;"></div>
    </div>
  </div>

  <!-- 参数选择弹窗 -->
  <ParamSelectDialog
    v-model:visible="paramSelectVisible"
    :device-id="deviceId"
    :selected-params="selectedParameters"
    @confirm="handleParamConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight, Download, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getHistoryDataParameters, getHistoryData } from '@/api/alarm/history'
import type { HistoryDataParameter, HistoryDataItem } from '@/api/types/alarm/history'
import ParamSelectDialog from './ParamSelectDialog.vue'

interface Props {
  deviceId: string
  visible?: boolean
}

const props = defineProps<Props>()

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 图表 resize 处理
const handleChartResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 响应式数据
const loading = ref(false)
const activeDimension = ref<'today' | 'week' | 'month' | 'threeMonths' | 'halfYear'>('today')
const dateRange = ref<[string, string] | null>(null)

// 初始化默认日期范围为当前一天
const initDefaultDateRange = () => {
  const endDate = dayjs()
  const startDate = endDate.startOf('day')
  dateRange.value = [
    startDate.format('YYYY-MM-DD HH:mm:ss'),
    endDate.format('YYYY-MM-DD HH:mm:ss')
  ]
  // 默认激活"今天"快捷选项
  activeDimension.value = 'today'
}
const availableParameters = ref<HistoryDataParameter[]>([])
const selectedParameters = ref<string[]>([])
const historyData = ref<HistoryDataItem[]>([])
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
const paramSelectVisible = ref(false)

// 时间维度选项（今天、一周、一个月、三个月、半年）
const timeDimensions = [
  { label: '今天', value: 'today' },
  { label: '一周', value: 'week' },
  { label: '一个月', value: 'month' },
  { label: '三个月', value: 'threeMonths' },
  { label: '半年', value: 'halfYear' }
]

/**
 * 根据维度设置日期范围
 */
const setDateRangeByDimension = (dimension: string) => {
  const endDate = dayjs()
  let startDate: dayjs.Dayjs

  switch (dimension) {
    case 'today':
      startDate = endDate.startOf('day')
      break
    case 'week':
      startDate = endDate.subtract(7, 'day')
      break
    case 'month':
      startDate = endDate.subtract(1, 'month')
      break
    case 'threeMonths':
      startDate = endDate.subtract(3, 'month')
      break
    case 'halfYear':
      startDate = endDate.subtract(6, 'month')
      break
    default:
      // 默认是当前一天（今天）
      startDate = endDate.startOf('day')
  }

  dateRange.value = [
    startDate.format('YYYY-MM-DD HH:mm:ss'),
    endDate.format('YYYY-MM-DD HH:mm:ss')
  ]
}

/**
 * 处理维度变化
 */
const handleDimensionChange = (dimension: string) => {
  activeDimension.value = dimension as any
  setDateRangeByDimension(dimension)
  if (selectedParameters.value.length > 0) {
    fetchData()
  }
}

/**
 * 处理日期范围变化
 */
const handleDateRangeChange = () => {
  if (selectedParameters.value.length > 0 && dateRange.value) {
    fetchData()
  }
}

/**
 * 打开参数选择弹框
 */
const handleParamSelect = () => {
  if (!props.deviceId) {
    ElMessage.warning('请先选择设备')
    return
  }
  paramSelectVisible.value = true
}

/**
 * 处理参数确认
 */
const handleParamConfirm = (params: string[]) => {
  selectedParameters.value = [...params]
  
  // 如果有选中的参数且日期范围已设置，自动查询
  if (selectedParameters.value.length > 0 && dateRange.value) {
    fetchData()
  } else {
    // 清空图表
    historyData.value = []
    if (chartInstance) {
      chartInstance.clear()
    }
  }
}

/**
 * 加载参数列表（用于获取可用参数，但不自动选择）
 */
const loadParameters = async () => {
  if (!props.deviceId) return

  try {
    const response = await getHistoryDataParameters(props.deviceId)
    if (response.success && response.code === 200) {
      availableParameters.value = response.result || []
      
      // 如果没有选中的参数，默认选择前两个
      if (selectedParameters.value.length === 0 && availableParameters.value.length >= 2) {
        selectedParameters.value = [
          availableParameters.value[0].value,
          availableParameters.value[1].value
        ]
        // 如果有选中的参数且日期范围已设置，自动查询
        if (dateRange.value) {
          fetchData()
        }
      } else if (selectedParameters.value.length === 0 && availableParameters.value.length === 1) {
        selectedParameters.value = [availableParameters.value[0].value]
        // 如果有选中的参数且日期范围已设置，自动查询
        if (dateRange.value) {
          fetchData()
        }
      }
    } else {
      ElMessage.error(response.message || '加载参数列表失败')
    }
  } catch (error: any) {
    console.error('加载参数列表失败:', error)
    ElMessage.error('加载参数列表失败')
  }
}

/**
 * 获取历史数据
 */
const fetchData = async () => {
  if (!props.deviceId || !dateRange.value || selectedParameters.value.length === 0) {
    if (selectedParameters.value.length === 0) {
      ElMessage.warning('请至少选择一个参数')
    }
    return
  }

  try {
    loading.value = true

    // 转换日期格式为 ISO 格式
    const startDateISO = dayjs(dateRange.value[0]).toISOString()
    const endDateISO = dayjs(dateRange.value[1]).toISOString()

    // 构建参数ID列表（逗号分隔）
    const parametersStr = selectedParameters.value.join(',')

    const response = await getHistoryData({
      deviceId: props.deviceId,
      startDate: startDateISO,
      endDate: endDateISO,
      parameters: parametersStr
    })

    if (response.success && response.code === 200) {
      historyData.value = response.result || []
      console.log('历史数据加载成功:', {
        dataLength: historyData.value.length,
        firstItem: historyData.value[0]
      })
      
      // 等待 DOM 更新后再初始化图表
      await nextTick()
      // 使用 requestAnimationFrame 确保 DOM 已渲染
      requestAnimationFrame(() => {
        setTimeout(() => {
          initChart()
        }, 50)
      })
    } else {
      ElMessage.error(response.message || '获取历史数据失败')
      historyData.value = []
    }
  } catch (error: any) {
    console.error('获取历史数据失败:', error)
    ElMessage.error('获取历史数据失败')
    historyData.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 计算缩放起始位置（最近半天的数据）
 */
const calculateZoomStart = (): number => {
  if (historyData.value.length === 0 || !dateRange.value) return 0
  
  // 计算总时间跨度（毫秒）
  const startTime = dayjs(dateRange.value[0]).valueOf()
  const endTime = dayjs(dateRange.value[1]).valueOf()
  const totalSpan = endTime - startTime
  
  // 最近半天的时间跨度（毫秒）
  const halfDaySpan = 12 * 60 * 60 * 1000
  
  // 如果总时间跨度小于半天，则显示全部
  if (totalSpan <= halfDaySpan) {
    return 0
  }
  
  // 计算最近半天对应的起始百分比
  const startPercent = ((totalSpan - halfDaySpan) / totalSpan) * 100
  
  return Math.max(0, Math.floor(startPercent))
}

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value || historyData.value.length === 0) {
    console.warn('图表初始化失败：容器不存在或数据为空', {
      chartRef: !!chartRef.value,
      dataLength: historyData.value.length
    })
    return
  }

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  chartInstance = echarts.init(chartRef.value)
  
  if (!chartInstance) {
    console.error('ECharts 初始化失败')
    return
  }

  // 获取所有参数名称（排除 time 字段）
  const paramNames = new Set<string>()
  historyData.value.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'time') {
        paramNames.add(key)
      }
    })
  })

  const paramNamesArray = Array.from(paramNames)

  // 构建时间轴数据
  const timeAxis = historyData.value.map(item => item.time)

  // 计算时间间隔，使时间坐标正点显示（5分钟、10分钟、15分钟等）
  const calculateTimeInterval = (): { intervalMinutes: number; dataInterval: number } => {
    if (timeAxis.length < 2) return { intervalMinutes: 5, dataInterval: 1 }
    
    // 计算第一个和最后一个时间的差值（分钟）
    const startTime = dayjs(timeAxis[0])
    const endTime = dayjs(timeAxis[timeAxis.length - 1])
    const totalMinutes = endTime.diff(startTime, 'minute')
    
    // 计算数据点之间的时间间隔（分钟）
    const dataPointInterval = timeAxis.length > 1 ? 
      dayjs(timeAxis[1]).diff(dayjs(timeAxis[0]), 'minute', true) : 1 // 使用true参数获取精确的小数分钟
    
    // 根据总时间跨度选择合适的显示间隔（分钟）
    // 确保显示足够的时间点，避免时间标签过少
    let intervalMinutes = 5
    if (totalMinutes <= 30) {
      intervalMinutes = 5 // 每5分钟
    } else if (totalMinutes <= 120) {
      intervalMinutes = 10 // 每10分钟
    } else if (totalMinutes <= 360) {
      intervalMinutes = 15 // 每15分钟
    } else if (totalMinutes <= 720) {
      intervalMinutes = 30 // 每30分钟
    } else if (totalMinutes <= 1440) {
      intervalMinutes = 60 // 每小时（24小时内）
    } else {
      // 超过24小时，根据数据点密度调整
      // 确保至少显示10-15个时间点
      const desiredPoints = 12
      intervalMinutes = Math.max(60, Math.ceil(totalMinutes / desiredPoints / 60) * 60)
    }
    
    // 计算数据点间隔（多少个数据点显示一次）
    // 如果数据点间隔太小（小于0.1分钟），直接使用时间判断，不依赖数据点间隔
    let dataInterval = 1
    if (dataPointInterval > 0.1) {
      dataInterval = Math.max(1, Math.ceil(intervalMinutes / dataPointInterval))
      // 限制最大间隔，避免Infinity
      dataInterval = Math.min(dataInterval, timeAxis.length)
    } else {
      // 数据点间隔很小，使用时间判断，设置一个合理的默认间隔
      // 根据总数据点数和期望显示的时间点数计算
      const desiredLabels = Math.min(20, Math.max(5, Math.ceil(totalMinutes / intervalMinutes)))
      dataInterval = Math.max(1, Math.floor(timeAxis.length / desiredLabels))
    }
    
    return { intervalMinutes, dataInterval }
  }

  const { intervalMinutes, dataInterval } = calculateTimeInterval()
  
  // 调试信息
  console.log('时间间隔计算:', {
    totalMinutes: timeAxis.length > 1 ? dayjs(timeAxis[timeAxis.length - 1]).diff(dayjs(timeAxis[0]), 'minute') : 0,
    intervalMinutes,
    dataInterval,
    timeAxisLength: timeAxis.length
  })

  // 构建系列数据
  const series = paramNamesArray.map((paramName, index) => {
    const data = historyData.value.map(item => {
      const value = item[paramName]
      return typeof value === 'number' ? value : parseFloat(String(value)) || 0
    })

    // 使用不同颜色
    const colors = ['#00d4ff', '#ff6b35', '#f7931e', '#39b6f7', '#ffd700', '#ff69b4', '#00ff00']
    const color = colors[index % colors.length]

    return {
      name: paramName,
      type: 'line',
      data: data,
      smooth: true,
      lineStyle: { color, width: 2 },
      itemStyle: { color },
      symbol: 'circle',
      symbolSize: 4
    }
  })

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0d2344',
      borderColor: '#1875b7',
      textStyle: { color: '#ffffff' },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#1875b7'
        }
      }
    },
    legend: {
      data: paramNamesArray,
      textStyle: { color: '#ffffff' },
      top: 10,
      right: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeAxis,
      axisLine: { lineStyle: { color: '#1875b7' } },
      axisLabel: {
        color: '#ffffff',
        rotate: 45,
        fontSize: 10,
        interval: dataInterval > 1 ? dataInterval - 1 : 0, // 设置显示间隔（echarts的interval是索引间隔）
        formatter: (value: string) => {
          return dayjs(value).format('MM-DD HH:mm')
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#1875b7' } },
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: '#1875b7', type: 'dashed', opacity: 0.3 } }
    },
    series: series,
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        bottom: 10,
        height: 20,
        backgroundColor: '#0d2344',
        borderColor: '#1875b7',
        fillerColor: 'rgba(57, 182, 247, 0.3)',
        handleStyle: { color: '#39b6f7' },
        textStyle: { color: '#ffffff' },
        // 默认缩放到最近半天的数据
        start: calculateZoomStart(),
        end: 100
      },
      {
        type: 'inside',
        xAxisIndex: 0
      }
    ]
  }

  chartInstance.setOption(option, true)
  
  // 初始化时，如果有默认缩放，需要重新计算时间间隔
  const updateTimeInterval = () => {
    if (!chartInstance || timeAxis.length < 2) return
    
    // 获取当前缩放范围
    const option = chartInstance.getOption()
    const dataZoom = (option as any).dataZoom
    if (!dataZoom || dataZoom.length === 0) return
    
    const sliderZoom = dataZoom.find((dz: any) => dz.type === 'slider')
    if (!sliderZoom) return
    
    const startPercent = sliderZoom.start || 0
    const endPercent = sliderZoom.end || 100
    
    // 计算缩放后的时间范围
    const startIndex = Math.floor((timeAxis.length * startPercent) / 100)
    const endIndex = Math.floor((timeAxis.length * endPercent) / 100)
    const zoomedTimeAxis = timeAxis.slice(startIndex, endIndex)
    
    if (zoomedTimeAxis.length >= 2) {
      // 重新计算时间间隔
      const zoomStartTime = dayjs(zoomedTimeAxis[0])
      const zoomEndTime = dayjs(zoomedTimeAxis[zoomedTimeAxis.length - 1])
      const zoomTotalMinutes = zoomEndTime.diff(zoomStartTime, 'minute', true)
      const zoomDataPointInterval = zoomedTimeAxis.length > 1 ? 
        dayjs(zoomedTimeAxis[1]).diff(dayjs(zoomedTimeAxis[0]), 'minute', true) : 1
      
      let zoomIntervalMinutes = 60
      if (zoomTotalMinutes <= 30) {
        zoomIntervalMinutes = 5
      } else if (zoomTotalMinutes <= 120) {
        zoomIntervalMinutes = 10
      } else if (zoomTotalMinutes <= 360) {
        zoomIntervalMinutes = 15
      } else if (zoomTotalMinutes <= 720) {
        zoomIntervalMinutes = 30
      } else if (zoomTotalMinutes <= 1440) {
        zoomIntervalMinutes = 60 // 每小时（24小时内）
      } else {
        // 超过24小时，根据数据点密度调整
        const desiredPoints = 12
        zoomIntervalMinutes = Math.max(60, Math.ceil(zoomTotalMinutes / desiredPoints / 60) * 60)
      }
      
      let zoomDataInterval = 1
      if (zoomDataPointInterval > 0.1) {
        zoomDataInterval = Math.max(1, Math.ceil(zoomIntervalMinutes / zoomDataPointInterval))
        zoomDataInterval = Math.min(zoomDataInterval, zoomedTimeAxis.length)
      } else {
        const desiredLabels = Math.min(20, Math.max(5, Math.ceil(zoomTotalMinutes / zoomIntervalMinutes)))
        zoomDataInterval = Math.max(1, Math.floor(zoomedTimeAxis.length / desiredLabels))
      }
      
      // 更新xAxis配置
      chartInstance.setOption({
        xAxis: {
          axisLabel: {
            interval: zoomDataInterval > 1 ? zoomDataInterval - 1 : 0
          }
        }
      }, false)
    }
  }
  
  // 初始化后，等待一下再更新（确保dataZoom已应用）
  setTimeout(() => {
    updateTimeInterval()
  }, 100)
  
  // 监听dataZoom事件，缩放时重新计算时间间隔
  chartInstance.on('dataZoom', (params: any) => {
    if (params.batch && params.batch.length > 0) {
      const zoomParams = params.batch[0]
      const startPercent = zoomParams.start || 0
      const endPercent = zoomParams.end || 100
      
      // 计算缩放后的时间范围
      const startIndex = Math.floor((timeAxis.length * startPercent) / 100)
      const endIndex = Math.floor((timeAxis.length * endPercent) / 100)
      const zoomedTimeAxis = timeAxis.slice(startIndex, endIndex)
      
      if (zoomedTimeAxis.length >= 2) {
        // 重新计算时间间隔
        const zoomStartTime = dayjs(zoomedTimeAxis[0])
        const zoomEndTime = dayjs(zoomedTimeAxis[zoomedTimeAxis.length - 1])
        const zoomTotalMinutes = zoomEndTime.diff(zoomStartTime, 'minute', true)
        const zoomDataPointInterval = zoomedTimeAxis.length > 1 ? 
          dayjs(zoomedTimeAxis[1]).diff(dayjs(zoomedTimeAxis[0]), 'minute', true) : 1
        
        let zoomIntervalMinutes = 60
        if (zoomTotalMinutes <= 30) {
          zoomIntervalMinutes = 5
        } else if (zoomTotalMinutes <= 120) {
          zoomIntervalMinutes = 10
        } else if (zoomTotalMinutes <= 360) {
          zoomIntervalMinutes = 15
        } else if (zoomTotalMinutes <= 720) {
          zoomIntervalMinutes = 30
        } else if (zoomTotalMinutes <= 1440) {
          zoomIntervalMinutes = 60 // 每小时（24小时内）
        } else {
          // 超过24小时，根据数据点密度调整
          // 确保至少显示10-15个时间点
          const desiredPoints = 12
          zoomIntervalMinutes = Math.max(60, Math.ceil(zoomTotalMinutes / desiredPoints / 60) * 60)
        }
        
        let zoomDataInterval = 1
        if (zoomDataPointInterval > 0.1) {
          zoomDataInterval = Math.max(1, Math.ceil(zoomIntervalMinutes / zoomDataPointInterval))
          zoomDataInterval = Math.min(zoomDataInterval, zoomedTimeAxis.length)
        } else {
          const desiredLabels = Math.min(20, Math.max(5, Math.ceil(zoomTotalMinutes / zoomIntervalMinutes)))
          zoomDataInterval = Math.max(1, Math.floor(zoomedTimeAxis.length / desiredLabels))
        }
        
        // 更新xAxis配置
        chartInstance.setOption({
          xAxis: {
            axisLabel: {
              interval: zoomDataInterval > 1 ? zoomDataInterval - 1 : 0
            }
          }
        }, false)
      }
    }
  })
  
  // 确保图表正确渲染
  chartInstance.resize()
  
  console.log('图表初始化完成', {
    paramCount: paramNamesArray.length,
    dataPoints: historyData.value.length
  })
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.deviceId) {
    initDefaultDateRange()
    loadParameters()
  }
})

// 监听设备ID变化
watch(() => props.deviceId, (deviceId) => {
  if (deviceId && props.visible) {
    initDefaultDateRange()
    loadParameters()
  }
})

// 组件挂载时初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  window.addEventListener('resize', handleChartResize)

  if (props.visible && props.deviceId) {
    initDefaultDateRange()
    loadParameters()
  }
})

// 组件卸载时销毁图表
onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
  window.removeEventListener('resize', handleChartResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.history-data-tab {
  padding: 20px;
  background: #0d2344;  // 深蓝背景
  color: #ffffff;
  height: 100%;
  overflow-y: auto;

  .control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 15px;
    
    .left-controls {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .time-dimension {
      :deep(.el-button) {
        background: #16315e;
        border-color: #174984;
        color: hsla(0, 0%, 100%, 0.7);
        border-radius: 0;
        
        &:hover {
          background: #1a4a7a;
          color: #fff;
        }
        
        &:first-child {
          border-radius: 4px 0 0 4px;
        }
        
        &:last-child {
          border-radius: 0 4px 4px 0;
        }
      }
      
      :deep(.el-button--primary) {
        background: #1680ca;
        border-color: #1680ca;
        color: #fff;
      }
    }

    .date-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      :deep(.el-button) {
        background: #1875b7;  // 青蓝背景
        border-color: #0d2344;  // 深蓝边框
        color: #ffffff;
        
        &:hover {
          background: #39b6f7;  // 青色发光
          border-color: #39b6f7;
        }
      }

      :deep(.el-date-editor) {
        width: 360px;
        // 其他样式由全局样式控制
      }
    }

    .right-actions {
      display: flex;
      gap: 8px;

      :deep(.el-button) {
        background: #1875b7;  // 青蓝背景
        border-color: #0d2344;  // 深蓝边框
        color: #ffffff;
        
        &:hover {
          background: #39b6f7;  // 青色发光
          border-color: #39b6f7;
        }
      }
    }
  }


  .chart-container {
    background: #0d2344;  // 深蓝背景
    border: 1px solid #1875b7;  // 青蓝边框
    border-radius: 8px;
    padding: 20px;
    min-height: 400px;

    .loading-container,
    .empty-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
    }

    .chart {
      background: transparent;
      min-height: 400px;
    }
  }
}

// 自定义滚动条
.history-data-tab::-webkit-scrollbar {
  width: 6px;
}

.history-data-tab::-webkit-scrollbar-track {
  background: #0d2344;  // 深蓝背景
  border-radius: 3px;
}

.history-data-tab::-webkit-scrollbar-thumb {
  background: #39b6f7;  // 青色发光
  border-radius: 3px;
  
  &:hover {
    background: #1680ca;  // 青色主按钮
  }
}

// 移动端适配
@media (max-width: 768px) {
  .history-data-tab {
    padding: 12px;
    
    .control-bar {
      flex-direction: column;
      align-items: flex-start;
      
      .time-dimension {
        width: 100%;
        flex-wrap: wrap;
      }
      
      .date-controls {
        width: 100%;
        
        :deep(.el-date-picker) {
          width: 100% !important;
        }
      }
      
      .right-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }

    .parameter-selection {
      flex-direction: column;
      align-items: flex-start;
      
      .parameter-label {
        width: 100%;
      }
    }
    
    .chart-container {
      height: 400px;
      margin-bottom: 15px;
    }
  }
}
</style>
