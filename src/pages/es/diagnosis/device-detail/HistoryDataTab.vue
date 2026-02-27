<template>
  <div class="history-data-tab">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <!-- 时间维度选择 -->
      <div class="time-dimension">
        <el-button
          v-for="dimension in timeDimensions"
          :key="dimension.value"
          :type="activeDimension === dimension.value ? 'primary' : ''"
          size="small"
          @click="handleDimensionChange(dimension.value)"
          class="dimension-btn"
        >
          {{ dimension.label }}
        </el-button>
      </div>

      <!-- 日期选择和控制 -->
      <div class="date-controls">
        <template v-if="activeDimension === 'custom'">
          <!-- 自定义日期范围 -->
          <div class="custom-controls">
            <el-button :icon="ArrowLeft" size="small" @click="handlePrevDate" />
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              size="small"
              @change="fetchData"
            />
            <el-button :icon="ArrowRight" size="small" @click="handleNextDate" />
          </div>
          
          <!-- 快速选择按钮 -->
          <div class="quick-select">
            <el-button size="small" @click="fetchData">查询数据</el-button>
            <span class="separator">来样</span>
            <el-switch 
              v-model="isRealtime" 
              active-text="实时" 
              inactive-text="" 
              size="small"
            />
            <span class="time-interval">时间间隔</span>
            <el-select v-model="timeInterval" placeholder="5min" size="small" style="width: 80px">
              <el-option label="5min" value="5min" />
              <el-option label="10min" value="10min" />
              <el-option label="15min" value="15min" />
            </el-select>
            <span class="chart-type">采样类型</span>
            <el-select v-model="chartType" placeholder="瞬后" size="small" style="width: 80px">
              <el-option label="瞬后" value="instant" />
              <el-option label="平均" value="average" />
            </el-select>
          </div>
        </template>
        
        <template v-else>
          <!-- 其他维度的日期选择 -->
          <div class="normal-controls">
            <el-button :icon="ArrowLeft" size="small" @click="handlePrevDate" />
            <el-date-picker
              v-model="selectedDate"
              :type="getDatePickerType()"
              :placeholder="getDatePlaceholder()"
              :format="getDateFormat()"
              value-format="YYYY-MM-DD"
              size="small"
              @change="fetchData"
            />
            <el-button :icon="ArrowRight" size="small" @click="handleNextDate" />
          </div>
          
          <!-- 查询按钮 -->
          <el-button size="small" @click="fetchData">查询数据</el-button>
        </template>
      </div>

      <!-- 右侧操作 -->
      <div class="right-actions">
        <el-button :icon="Download" size="small">下载</el-button>
        <el-button :icon="RefreshRight" size="small" @click="fetchData" :loading="loading" />
      </div>
    </div>

    <!-- 快速选择按钮（日和自定义模式） -->
    <div v-if="activeDimension === 'day' || activeDimension === 'custom'" class="quick-buttons">
      <el-button
        v-for="button in quickButtons"
        :key="button.value"
        :type="selectedQuickType === button.value ? 'primary' : ''"
        size="small"
        @click="handleQuickSelect(button.value)"
        class="quick-btn"
      >
        {{ button.label }}
      </el-button>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div ref="chartRef" class="chart" style="width: 100%; height: 400px;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight, Download, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getDeviceHistoryData } from '@/api/diagnosis/deviceDetail'

interface Props {
  deviceId: string
  visible: boolean
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

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

// 响应式数据
const loading = ref(false)
const activeDimension = ref<'day' | 'month' | 'year' | 'total' | 'custom'>('day')
const selectedDate = ref<string>('')
const isRealtime = ref(false)
const timeInterval = ref('5min')
const chartType = ref('instant')
const selectedQuickType = ref('功率')
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 时间维度选项
const timeDimensions = [
  { label: '日', value: 'day' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
  { label: '总', value: 'total' },
  { label: '自定义', value: 'custom' }
]

// 快速选择按钮（日和自定义模式）
const quickButtons = [
  { label: '功率', value: '功率' },
  { label: '电量', value: '电量' },
  { label: '文件导出', value: '文件导出' },
  { label: 'PV电压', value: 'PV电压' },
  { label: 'PV电流', value: 'PV电流' },
  { label: 'PV电压和PV电流', value: 'PV电压和PV电流' },
  { label: 'MPPT电压和电流', value: 'MPPT电压和电流' }
]

/**
 * 获取日期选择器类型
 */
const getDatePickerType = (): string => {
  switch (activeDimension.value) {
    case 'day':
      return 'date'
    case 'month':
      return 'month'
    case 'year':
      return 'year'
    default:
      return 'date'
  }
}

/**
 * 获取日期选择器占位符
 */
const getDatePlaceholder = (): string => {
  switch (activeDimension.value) {
    case 'day':
      return '选择日期'
    case 'month':
      return '选择月份'
    case 'year':
      return '选择年份'
    default:
      return '选择日期'
  }
}

/**
 * 获取日期格式
 */
const getDateFormat = (): string => {
  switch (activeDimension.value) {
    case 'day':
      return 'YYYY-MM-DD'
    case 'month':
      return 'YYYY-MM'
    case 'year':
      return 'YYYY'
    default:
      return 'YYYY-MM-DD'
  }
}

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  // 根据维度决定图表类型和数据
  const isLineChart = activeDimension.value === 'day' || activeDimension.value === 'custom'
  
  let option: echarts.EChartsOption
  
  if (isLineChart) {
    // 折线图配置（日/自定义）
    option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0d2344',
        borderColor: '#1875b7',
        textStyle: { color: '#ffffff' }
      },
      legend: {
        data: ['当日发电量 (kWh)', '总有功功率 (kW)'],
        textStyle: { color: '#ffffff' },
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: generateTimeAxis(),
        axisLine: { lineStyle: { color: '#1875b7' } },
        axisLabel: { 
          color: '#ffffff',
          rotate: 0,
          fontSize: 10
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'kWh',
          position: 'left',
          axisLine: { lineStyle: { color: '#1875b7' } },
          axisLabel: { color: '#ffffff' },
          splitLine: { lineStyle: { color: '#1875b7', type: 'dashed' } }
        },
        {
          type: 'value',
          name: 'kW',
          position: 'right',
          axisLine: { lineStyle: { color: '#1875b7' } },
          axisLabel: { color: '#ffffff' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '当日发电量 (kWh)',
          type: 'line',
          yAxisIndex: 0,
          data: generateMockLineData(),
          lineStyle: { color: '#ff6b35', width: 2 },
          itemStyle: { color: '#ff6b35' },
          smooth: true
        },
        {
          name: '总有功功率 (kW)',
          type: 'line',
          yAxisIndex: 1,
          data: generateMockPowerData(),
          lineStyle: { color: '#f7931e', width: 2 },
          itemStyle: { color: '#f7931e' },
          smooth: true
        }
      ],
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
          textStyle: { color: '#ffffff' }
        }
      ]
    }
  } else {
    // 柱状图配置（月/年/总）
    option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0d2344',
        borderColor: '#1875b7',
        textStyle: { color: '#ffffff' }
      },
      legend: {
        data: ['总发电量 (kWh)'],
        textStyle: { color: '#ffffff' },
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: generateBarTimeAxis(),
        axisLine: { lineStyle: { color: '#1875b7' } },
        axisLabel: { 
          color: '#ffffff',
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        name: 'kWh',
        axisLine: { lineStyle: { color: '#1875b7' } },
        axisLabel: { color: '#ffffff' },
        splitLine: { lineStyle: { color: '#1875b7', type: 'dashed' } }
      },
      series: [
        {
          name: '总发电量 (kWh)',
          type: 'bar',
          data: generateMockBarData(),
          itemStyle: { color: '#39b6f7' },
          barWidth: '60%'
        }
      ],
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
          textStyle: { color: '#ffffff' }
        }
      ]
    }
  }

  chartInstance.setOption(option)
}

/**
 * 生成时间轴数据（折线图）
 */
const generateTimeAxis = () => {
  const times = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 5) {
      const hour = i.toString().padStart(2, '0')
      const minute = j.toString().padStart(2, '0')
      times.push(`${hour}:${minute}`)
    }
  }
  return times
}

/**
 * 生成时间轴数据（柱状图）
 */
const generateBarTimeAxis = () => {
  const dates = []
  for (let i = 1; i <= 31; i++) {
    dates.push(`2025-10-${i.toString().padStart(2, '0')}`)
  }
  return dates
}

/**
 * 生成模拟折线数据（发电量）
 */
const generateMockLineData = () => {
  const data = []
  const timeCount = 24 * 12 // 24小时 * 每小时12个点（5分钟间隔）
  
  for (let i = 0; i < timeCount; i++) {
    const hour = Math.floor(i / 12)
    // 模拟发电量曲线：白天高，夜晚为0
    if (hour >= 6 && hour <= 18) {
      const peak = Math.sin((hour - 6) * Math.PI / 12) * 130
      const noise = Math.random() * 10 - 5
      data.push(Math.max(0, peak + noise))
    } else {
      data.push(0)
    }
  }
  return data
}

/**
 * 生成模拟功率数据
 */
const generateMockPowerData = () => {
  const data = []
  const timeCount = 24 * 12
  
  for (let i = 0; i < timeCount; i++) {
    const hour = Math.floor(i / 12)
    // 模拟功率曲线：白天高，夜晚为0
    if (hour >= 6 && hour <= 18) {
      const peak = Math.sin((hour - 6) * Math.PI / 12) * 55
      const noise = Math.random() * 5 - 2.5
      data.push(Math.max(0, peak + noise))
    } else {
      data.push(0)
    }
  }
  return data
}

/**
 * 生成模拟柱状图数据
 */
const generateMockBarData = () => {
  const data = []
  for (let i = 0; i < 31; i++) {
    // 模拟每日发电量：200-500kWh之间
    const base = 300 + Math.sin(i * 0.2) * 100
    const noise = Math.random() * 100 - 50
    data.push(Math.max(50, base + noise))
  }
  return data
}

/**
 * 处理维度变化
 */
const handleDimensionChange = (dimension: string) => {
  activeDimension.value = dimension as any
  
  // 设置默认日期
  const today = new Date()
  switch (dimension) {
    case 'day':
      selectedDate.value = today.toISOString().split('T')[0]
      break
    case 'month':
      selectedDate.value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`
      break
    case 'year':
      selectedDate.value = today.getFullYear().toString()
      break
    case 'total':
      selectedDate.value = today.toISOString().split('T')[0]
      break
    case 'custom':
      selectedDate.value = today.toISOString().split('T')[0]
      break
  }
  
  fetchData()
}

/**
 * 处理快速选择
 */
const handleQuickSelect = (type: string) => {
  selectedQuickType.value = type
  // 这里可以根据选择的类型更新图表数据
  fetchData()
}

/**
 * 处理上一个/下一个日期
 */
const handlePrevDate = () => {
  // 实现日期前移逻辑
  fetchData()
}

const handleNextDate = () => {
  // 实现日期后移逻辑  
  fetchData()
}

/**
 * 获取数据
 */
const fetchData = async () => {
  if (!props.deviceId) return
  
  try {
    loading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 重新初始化图表
    await nextTick()
    initChart()
  } catch (error) {
    console.error('获取历史数据失败:', error)
    ElMessage.error('获取历史数据失败')
  } finally {
    loading.value = false
  }
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.deviceId) {
    fetchData()
  }
})

// 监听设备ID变化
watch(() => props.deviceId, (deviceId) => {
  if (deviceId && props.visible) {
    fetchData()
  }
})

// 组件挂载时初始化
onMounted(() => {
  // 移动端检测
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  window.addEventListener('resize', handleChartResize)
  
  // 设置默认日期为今天
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0]
  
  if (props.visible && props.deviceId) {
    fetchData()
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

    .time-dimension {
      display: flex;
      gap: 2px;

      .dimension-btn {
        :deep(.el-button--primary) {
          background: #1680ca;  // 青色主按钮
          border-color: #1875b7;  // 青蓝边框
          
          &:hover {
            background: #39b6f7;  // 青色发光
            border-color: #39b6f7;
          }
        }

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

    .date-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      .custom-controls,
      .normal-controls {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .quick-select {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;

        .separator,
        .time-interval,
        .chart-type {
          color: #ffffff;
        }
      }

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
        .el-input__inner {
          background: #1875b7;  // 青蓝背景
          border-color: #39b6f7;  // 青色边框
          color: #ffffff;
        }
      }

      :deep(.el-select) {
        .el-input__inner {
          background: #1875b7;  // 青蓝背景
          border-color: #39b6f7;  // 青色边框
          color: #ffffff;
        }
      }

      :deep(.el-switch) {
        --el-switch-on-color: #39b6f7;
        --el-switch-off-color: #1875b7;
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

  .quick-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
    flex-wrap: wrap;

    .quick-btn {
      :deep(.el-button--primary) {
        background: #1680ca;  // 青色主按钮
        border-color: #1875b7;  // 青蓝边框
        
        &:hover {
          background: #39b6f7;  // 青色发光
          border-color: #39b6f7;
        }
      }

      :deep(.el-button) {
        background: #1875b7;  // 青蓝背景
        border-color: #0d2344;  // 深蓝边框
        color: #ffffff;
        font-size: 12px;
        
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

    .chart {
      background: transparent;
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
    
    .filter-section {
      margin-bottom: 15px;
      padding: 10px;
      background: rgba(0, 30, 60, 0.9);
      border-radius: 8px;
      
      .filter-controls {
        flex-direction: column;
        gap: 10px;
        
        .filter-item {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          
          .filter-label {
            font-size: 12px;
            display: block;
          }
          
          :deep(.el-select),
          :deep(.el-date-picker),
          :deep(.el-input) {
            width: 100% !important;
            
            .el-input__wrapper {
              width: 100%;
            }
          }
        }
        
        .el-button {
          width: 100%;
          font-size: 12px;
          margin-top: 4px;
        }
      }
    }
    
    .chart-container {
      height: 300px;
      margin-bottom: 15px;
    }
    
    .data-table {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      
      :deep(.el-table) {
        font-size: 11px;
        min-width: 600px;
        
        .el-table__cell {
          padding: 6px 4px;
        }
        
        .el-table__header {
          .el-table__cell {
            font-size: 12px;
          }
        }
      }
    }
    
    .pagination-section {
      padding: 10px;
      
      :deep(.el-pagination) {
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
        font-size: 12px;
        
        .el-pagination__total {
          font-size: 11px;
          flex-basis: 100%;
          text-align: center;
          margin-bottom: 6px;
        }
        
        .btn-prev,
        .btn-next {
          min-width: 32px;
          font-size: 11px;
        }
        
        .el-pager {
          li {
            min-width: 28px;
            height: 28px;
            line-height: 28px;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>