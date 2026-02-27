<template>
  <ElDialog
    v-model="visible"
    title="数据对比"
    :width="isMobile ? '95%' : '90%'"
    :top="isMobile ? '2vh' : '3vh'"
    :close-on-click-modal="false"
    destroy-on-close
    class="data-compare-dialog"
  >
    <div class="data-compare-container">
      <!-- 控制栏 -->
      <div class="control-bar">
        <div class="date-control">
          <span class="control-label">对比日期:</span>
          <ElDatePicker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </div>
        
        <ElButton 
          type="primary" 
          @click="handleParamSelect"
          :loading="paramsLoading"
        >
          参数选择
        </ElButton>
        
        <ElButton 
          @click="handleRefresh"
          :loading="chartLoading"
          :disabled="selectedParams.length === 0"
        >
          刷新数据
        </ElButton>
      </div>
      
      <!-- 参数图例 -->
      <div v-if="selectedParams.length > 0" class="chart-legend">
        <div class="legend-title">已选参数:</div>
        <div class="legend-items">
          <div 
            v-for="(param, index) in selectedParams" 
            :key="param"
            class="legend-item"
          >
            <span 
              class="legend-color"
              :style="{ backgroundColor: getParamColor(index) }"
            ></span>
            <span class="legend-text">{{ param }}</span>
          </div>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="chart-container">
        <div 
          v-if="selectedParams.length === 0"
          class="empty-chart"
        >
          <ElEmpty description="请先选择要对比的参数" />
        </div>
        
        <!-- 图表容器始终渲染，但根据条件显示/隐藏 -->
        <div
          ref="chartRef"
          class="chart"
          v-loading="chartLoading"
          :style="{ display: selectedParams.length > 0 ? 'block' : 'none' }"
        ></div>
      </div>
    </div>
    
    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
    </template>
  </ElDialog>
  
  <!-- 参数选择弹窗 -->
  <ParamSelectDialog
    v-model:visible="paramSelectVisible"
    :device-id="deviceId"
    :selected-params="selectedParams"
    @confirm="handleParamConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import ParamSelectDialog from './ParamSelectDialog.vue'
import type { StringDiagnosisRecord } from '@/api/types/diagnosis/stringDiagnosis'
import { compareStringData } from '@/api/diagnosis/stringDiagnosis'
import { getToday } from '@/utils/date'

interface Props {
  visible: boolean
  deviceInfo: StringDiagnosisRecord | null
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const selectedDate = ref(getToday())
const selectedParams = ref<string[]>([])
const chartLoading = ref(false)
const paramsLoading = ref(false)
const paramSelectVisible = ref(false)

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 计算属性
const deviceId = computed(() => {
  const id = props.deviceInfo?.deviceId || props.deviceInfo?.id || ''
  console.log('Computed deviceId:', id, 'from deviceInfo:', props.deviceInfo)
  return id
})

// 参数颜色配置（光伏主题色彩）
const paramColors = [
  '#00d4ff', // 青色（主色）
  '#10b981', // 绿色
  '#f59e0b', // 橙色 
  '#ef4444', // 红色
  '#8b5cf6', // 紫色
  '#06b6d4', // 青蓝色
  '#84cc16', // 柠檬绿
  '#f97316', // 橙红色
  '#ec4899', // 粉红色
  '#6366f1', // 靓蓝色
  '#14b8a6', // 青绿色
  '#fbbf24', // 黄色
  '#f472b6', // 粉色
  '#a78bfa', // 淡紫色
  '#34d399'  // 淡绿色
]

/**
 * 获取参数颜色
 */
const getParamColor = (index: number): string => {
  return paramColors[index % paramColors.length]
}

/**
 * 处理日期变化
 */
const handleDateChange = () => {
  if (selectedParams.value.length > 0) {
    fetchCompareData()
  }
}

/**
 * 处理参数选择
 */
const handleParamSelect = () => {
  if (!deviceId.value) {
    ElMessage.warning('请先选择设备')
    return
  }
  paramSelectVisible.value = true
}

/**
 * 处理参数确认
 */
const handleParamConfirm = (params: string[]) => {
  console.log('Parameter confirm called with:', params)
  try {
    selectedParams.value = [...params] // 使用数组解构避免引用问题
    console.log('Updated selectedParams:', selectedParams.value)
    
    if (params.length > 0) {
      fetchCompareData()
    } else {
      console.warn('No parameters selected')
    }
  } catch (error) {
    console.error('Error in handleParamConfirm:', error)
    ElMessage.error('参数设置失败')
  }
}

/**
 * 刷新数据
 */
const handleRefresh = () => {
  if (selectedParams.value.length > 0) {
    fetchCompareData()
  }
}

/**
 * 获取对比数据
 */
const fetchCompareData = async () => {
  if (!deviceId.value || selectedParams.value.length === 0) {
    console.warn('Cannot fetch data: missing deviceId or selectedParams', {
      deviceId: deviceId.value,
      selectedParamsLength: selectedParams.value.length
    })
    return
  }
  
  console.log('Fetching compare data with params:', {
    stationId: props.deviceInfo?.stationId || '',
    deviceId: deviceId.value,
    compareDate: selectedDate.value,
    selectedParams: selectedParams.value
  })
  
  chartLoading.value = true
  try {
    const requestParams = {
      stationId: props.deviceInfo?.stationId || '',
      deviceId: deviceId.value,
      compareDate: selectedDate.value,
      selectedParams: selectedParams.value
    }
    
    // 确保所有必要参数都存在
    if (!requestParams.stationId || !requestParams.deviceId || !requestParams.selectedParams.length) {
      console.error('Missing required parameters:', requestParams)
      ElMessage.error('缺少必要参数')
      return
    }
    
    console.log('API request params:', requestParams)
    
    const response = await compareStringData(requestParams)
    
    console.log('Compare data API response:', response)
    
    if (response.success && response.data) {
      console.log('Calling updateChart with:', response.data.compareResult)
      updateChart(response.data.compareResult)
    } else {
      console.error('API response error:', response.message)
      ElMessage.error(response.message || '获取对比数据失败')
    }
  } catch (error) {
    console.error('获取对比数据失败:', error)
    ElMessage.error('获取对比数据失败')
  } finally {
    chartLoading.value = false
  }
}

/**
 * 更新图表
 */
const updateChart = (compareResult: any) => {
  console.log('updateChart called, chartInstance exists:', !!chartInstance)
  
  if (!chartInstance) {
    console.error('Chart instance not available for update')
    return
  }
  
  console.log('Updating chart with data:', compareResult)
  const { timeAxis, series, yAxis } = compareResult
  
  if (!timeAxis || !series || timeAxis.length === 0 || series.length === 0) {
    console.warn('Invalid chart data:', { timeAxis, series })
    return
  }
  
  // 构建 ECharts 配置（光伏主题风格）
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: '#00d4ff',
          width: 1,
          type: 'dashed'
        }
      },
      backgroundColor: 'rgba(13, 35, 68, 0.95)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      formatter: (params: any[]) => {
        let html = `<div style="color: #00d4ff; font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach(param => {
          html += `
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="width: 12px; height: 12px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
              <span style="color: #ffffff; margin-right: 12px;">${param.seriesName}:</span>
              <span style="color: #00d4ff; font-weight: 600;">${param.value} A</span>
            </div>
          `
        })
        return html
      }
    },
    legend: {
      show: false // 使用自定义图例
    },
    grid: {
      left: '80px',
      right: '80px',
      top: '40px',
      bottom: '80px',
      backgroundColor: 'transparent'
    },
    xAxis: {
      type: 'category',
      data: timeAxis,
      axisLine: {
        show: true,
        lineStyle: { 
          color: 'rgba(0, 212, 255, 0.3)',
          width: 1
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        interval: 'auto'
      },
      splitLine: {
        show: false
      }
    },
    yAxis: yAxis && yAxis.length > 0 ? yAxis.map((axis: any, index: number) => ({
      type: 'value',
      position: index === 0 ? 'left' : 'right',
      name: axis.name || '',
      nameTextStyle: {
        color: '#00d4ff',
        fontSize: 14,
        fontWeight: 600
      },
      min: axis.min || 0,
      max: axis.max || 'dataMax',  // 使用数据最大值自动缩放,
      axisLine: {
        show: true,
        lineStyle: { 
          color: 'rgba(0, 212, 255, 0.3)',
          width: 1
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        formatter: (value: number) => {
          if (index === 0) { // 电流轴
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k'
            }
            return Math.round(value).toString()
          } else { // 功率轴
            return value.toFixed(1)
          }
        }
      },
      splitLine: {
        show: index === 0,
        lineStyle: { 
          color: 'rgba(0, 212, 255, 0.1)',
          width: 1,
          type: 'dashed'
        }
      }
    })) : [{
      type: 'value',
      axisLine: { 
        show: true,
        lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } 
      },
      axisLabel: { 
        color: '#ffffff',
        fontSize: 12
      },
      splitLine: { 
        lineStyle: { 
          color: 'rgba(0, 212, 255, 0.1)',
          type: 'dashed'
        } 
      }
    }],
    series: series.map((item: any, index: number) => ({
      name: item.name,
      type: 'line',
      data: item.data || [],
      yAxisIndex: Math.min(item.yAxisIndex || 0, (yAxis?.length || 1) - 1),
      lineStyle: {
        color: item.color || getParamColor(index),
        width: 2.5,
        shadowColor: item.color || getParamColor(index),
        shadowBlur: 3,
        shadowOffsetY: 1
      },
      itemStyle: {
        color: item.color || getParamColor(index),
        borderColor: '#ffffff',
        borderWidth: 1
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: `${item.color || getParamColor(index)}40` // 25% 透明度
            },
            {
              offset: 1,
              color: `${item.color || getParamColor(index)}10` // 6% 透明度
            }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 0, // 隐藏数据点，显示更干净
      smooth: 0.3, // 平滑系数，让曲线更自然
      showSymbol: false, // 不显示数据点符号
      emphasis: {
        focus: 'series',
        lineStyle: {
          width: 3.5
        },
        itemStyle: {
          shadowBlur: 8,
          shadowColor: item.color || getParamColor(index)
        }
      }
    })),
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100,
        height: 25,
        bottom: 5,
        backgroundColor: 'rgba(0, 40, 80, 0.8)',
        borderColor: 'rgba(0, 212, 255, 0.5)',
        handleStyle: {
          color: '#00d4ff',
          borderColor: '#ffffff',
          borderWidth: 1
        },
        moveHandleStyle: {
          color: '#00d4ff'
        },
        selectedDataBackground: {
          lineStyle: {
            color: '#00d4ff'
          },
          areaStyle: {
            color: 'rgba(0, 212, 255, 0.2)'
          }
        },
        dataBackground: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          },
          areaStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        textStyle: {
          color: '#ffffff'
        }
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      }
    ]
  }
  
  chartInstance.setOption(option, true)
}

/**
 * 初始化图表
 */
const initChart = async () => {
  console.log('initChart called, chartRef.value:', chartRef.value)
  
  if (!chartRef.value) {
    console.error('Chart ref not available')
    return null
  }
  
  try {
    // 如果已经初始化过，先销毁
    if (chartInstance) {
      console.log('Disposing existing chart instance')
      chartInstance.dispose()
      chartInstance = null
    }
    
    console.log('Creating new chart instance...')
    chartInstance = echarts.init(chartRef.value)
    
    if (chartInstance) {
      console.log('Chart instance created successfully')
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
      
      // 设置初始配置
      chartInstance.setOption({
        backgroundColor: 'transparent',
        grid: {
          left: '60px',
          right: '60px', 
          top: '40px',
          bottom: '120px'
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { lineStyle: { color: '#ddd' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#ddd' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        series: []
      })
      
      // 延迟调用resize确保初始化完成
      setTimeout(() => {
        if (chartInstance) {
          chartInstance.resize()
        }
      }, 100)
      
      return chartInstance
    } else {
      console.error('Failed to create chart instance')
      return null
    }
  } catch (error) {
    console.error('Error initializing chart:', error)
    return null
  }
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  visible.value = false
}

// 监听弹窗显示/隐藏
watch(visible, (newVal) => {
  if (newVal) {
    console.log('Data compare dialog opened, deviceId:', deviceId.value)
    // 等待弹窗DOM完全渲染后再初始化
    setTimeout(async () => {
      console.log('Starting chart initialization...')
      await nextTick()
      
      // 初始化图表
      const chart = await initChart()
      if (chart) {
        console.log('Chart initialized successfully')
        
        // 设置默认选中的参数
        if (selectedParams.value.length === 0) {
          selectedParams.value = [
            'PV组流_1 (A)', 
            'PV组流_2 (A)', 
            'PV组流_3 (A)', 
            'PV组流_4 (A)', 
            'PV组流_5 (A)'
          ]
          console.log('Setting default params:', selectedParams.value)
        }
        
        // 立即加载数据
        await fetchCompareData()
      } else {
        console.error('Failed to initialize chart')
      }
    }, 300) // 等待300ms确保弹窗完全渲染
  } else {
    // 清理数据
    selectedParams.value = []
    selectedDate.value = getToday()
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  }
})

// 组件挂载时初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

// 组件销毁时清理
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.data-compare-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

// 对话框样式
:global(.el-dialog .el-dialog__header) {
  padding: 8px 20px !important;
}

:global(.el-dialog .el-dialog__title) {
  font-size: 16px !important;
  line-height: 1.2 !important;
}

:global(.el-dialog .el-dialog__body) {
  padding: 15px 20px !important;
}

:global(.el-dialog .el-dialog__footer) {
  padding: 10px 20px 15px !important;
}

// 控制栏
.control-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 70% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .date-control {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 2;
    
    .control-label {
      font-size: 14px;
      color: #00d4ff;
      white-space: nowrap;
      font-weight: 500;
    }
  }
}

// 参数图例
.chart-legend {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .legend-title {
    font-size: 15px;
    color: #00d4ff;
    margin-bottom: 12px;
    font-weight: 600;
    position: relative;
    z-index: 2;
  }
  
  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    position: relative;
    z-index: 2;
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .legend-color {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        box-shadow: 0 0 6px currentColor;
      }
      
      .legend-text {
        font-size: 13px;
        color: #ffffff;
        font-weight: 500;
      }
    }
  }
}

// 图表区域
.chart-container {
  flex: 1;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .empty-chart {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    
    :deep(.el-empty__description) {
      color: #ffffff;
    }
  }
  
  .chart {
    width: 100%;
    height: 100%;
    min-height: 400px;
    position: relative;
    z-index: 2;
  }
}

// 自定义 Tooltip 样式
:global(.tooltip-title) {
  font-weight: 600;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

:global(.tooltip-item) {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

:global(.tooltip-marker) {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

:global(.tooltip-name) {
  flex: 1;
  margin-right: 12px;
}

:global(.tooltip-value) {
  font-weight: 600;
}

// 响应式适配
@media (max-width: 1400px) {
  .control-bar {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .legend-items {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .data-compare-container {
    height: 85vh;
  }
  
  .control-bar {
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    
    .date-control {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      
      .control-label {
        font-size: 13px;
      }
      
      .el-date-picker {
        width: 100%;
      }
    }
    
    .el-button {
      width: 100%;
      font-size: 13px;
    }
  }
  
  .chart-legend {
    padding: 10px 12px;
    
    .legend-title {
      font-size: 13px;
      margin-bottom: 8px;
    }
    
    .legend-items {
      gap: 8px;
      
      .legend-item {
        font-size: 12px;
        
        .legend-color {
          width: 10px;
          height: 10px;
        }
      }
    }
  }
  
  .chart-container {
    padding: 12px;
    
    .chart {
      min-height: 300px;
    }
  }
}
</style>
