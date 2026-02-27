<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { 
  GetDeviceTrendParams,
  DeviceTrend
} from '@/api/types/diagnosis/diagnosisResult'
import { 
  getDeviceTrend
} from '@/api/diagnosis/diagnosisResult'
import dayjs from 'dayjs'

// Props
interface Props {
  visible: boolean
  deviceId: string
  deviceName: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  deviceId: '',
  deviceName: ''
})

// Emits
interface Emits {
  (e: 'update:visible', visible: boolean): void
}

const emit = defineEmits<Emits>()

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

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  window.addEventListener('resize', handleChartResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
  window.removeEventListener('resize', handleChartResize)
})

// 响应式数据
const loading = ref(false)
const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null
const trendData = ref<DeviceTrend[]>([])

// 查询参数
const startDate = ref('')
const endDate = ref('')

// 监听弹窗显示
watch(() => props.visible, async (newVal) => {
  if (newVal && props.deviceId) {
    // 设置默认日期范围
    endDate.value = dayjs().format('YYYY-MM-DD')
    startDate.value = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
    
    await nextTick()
    initChart()
    await loadTrendData()
  }
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
}

// 加载趋势数据
const loadTrendData = async () => {
  if (!props.deviceId) return
  
  try {
    loading.value = true
    
    const params: GetDeviceTrendParams = {
      deviceId: props.deviceId,
      startDate: startDate.value,
      endDate: endDate.value,
      params: ['dustLossRate', 'generation']
    }
    
    const response = await getDeviceTrend(params)
    // 修复数据结构：response.data.trendData 是趋势数据对象
    const { dates, dustLossRate, dustLossGeneration, weather } = response.data.trendData
    
    // 转换为 DeviceTrend[] 数组格式，以便图表使用
    trendData.value = dates.map((date, index) => ({
      date,
      dustLossRate: dustLossRate[index] || 0,
      deviceLossRate: dustLossGeneration[index] || 0, // 映射到设备积尘损失率
      weather: weather[index] || 'sunny'
    })) as any[]
    
    updateChart()
  } catch (error) {
    console.error('获取设备趋势数据失败:', error)
    ElMessage.error('获取设备趋势数据失败')
  } finally {
    loading.value = false
  }
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !trendData.value.length) return
  
  const dates = trendData.value.map(item => dayjs(item.date).format('MM-DD'))
  const dustLossRates = trendData.value.map(item => item.dustLossRate || 0)
  const deviceLossRates = trendData.value.map(item => item.deviceLossRate || 0)
  const weatherData = trendData.value.map(item => item.weather)
  
  // 天气图标映射
  const weatherIcons = {
    'sunny': '☀️',
    'cloudy': '☁️', 
    'rainy': '🌧️',
    'snowy': '❄️',
    'foggy': '🌫️'
  }
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.5)'
        }
      }
    },
    legend: {
      data: ['积尘损失率(%)', '设备积尘损失率(%)'],
      textStyle: {
        color: '#d1d5db',
        fontSize: 12
      },
      itemWidth: 16,
      itemHeight: 12,
      top: 30
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '30%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#d1d5db',
        fontSize: 10
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '损失率(%)',
      nameTextStyle: {
        color: '#d1d5db',
        fontSize: 10
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#d1d5db',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.1)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '积尘损失率(%)',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: dustLossRates,
        itemStyle: {
          color: '#ff6b6b'
        },
        lineStyle: {
          color: '#ff6b6b',
          width: 2
        }
      },
      {
        name: '设备积尘损失率(%)',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: deviceLossRates,
        itemStyle: {
          color: '#52c41a'
        },
        lineStyle: {
          color: '#52c41a',
          width: 2
        }
      }
    ],
    graphic: weatherData.map((weather, index) => ({
      type: 'text',
      left: `${((index + 0.5) / dates.length) * 90 + 5}%`,
      top: '15%',
      style: {
        text: weatherIcons[weather as keyof typeof weatherIcons] || '☀️',
        fontSize: 16,
        textAlign: 'center'
      }
    }))
  }
  
  chartInstance.setOption(option)
}

// 参数查询
const handleQuery = async () => {
  if (!startDate.value || !endDate.value) {
    ElMessage.warning('请选择查询时间范围')
    return
  }
  
  if (dayjs(startDate.value).isAfter(dayjs(endDate.value))) {
    ElMessage.warning('开始时间不能晚于结束时间')
    return
  }
  
  await loadTrendData()
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

// 组件销毁时清理
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="deviceName || deviceId"
    :width="isMobile ? '95%' : '900px'"
    :top="isMobile ? '2vh' : '3vh'"
    :before-close="handleClose"
    class="trend-dialog"
  >
    <div class="trend-content" v-loading="loading">
      <!-- 查询控制区 -->
      <div class="query-controls">
        <div class="date-range">
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            size="small"
          />
          <span class="separator">~</span>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            size="small"
          />
        </div>
        <el-button type="primary" size="small" @click="handleQuery" :loading="loading">
          参数查询
        </el-button>
      </div>
      
      <!-- 图表区域 -->
      <div class="chart-container">
        <div ref="chartRef" class="chart"></div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.trend-content {
  .query-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(0, 212, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 212, 255, 0.2);
    
    .date-range {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .separator {
        color: #d1d5db;
        font-weight: 500;
      }
      
      :deep(.el-date-editor) {
        width: 140px;
        
        .el-input__wrapper {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.3);
          
          &:hover {
            border-color: rgba(0, 212, 255, 0.5);
          }
          
          &.is-focus {
            border-color: #00D4FF;
          }
        }
        
        .el-input__inner {
          color: #d1d5db;
        }
      }
    }
  }
  
  .chart-container {
    .chart {
      width: 100%;
      height: 400px;
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 212, 255, 0.02);
    }
  }
}

:deep(.el-dialog) {
  background: #1a1f2e;
  border: 1px solid rgba(0, 212, 255, 0.3);
  
  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    
    .el-dialog__title {
      color: #00D4FF;
      font-weight: 500;
      font-size: 16px;
    }
    
    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #d1d5db;
        
        &:hover {
          color: #00D4FF;
        }
      }
    }
  }
  
  .el-dialog__body {
    color: #d1d5db;
    padding: 20px;
  }
}

:deep(.el-loading-mask) {
  background-color: rgba(26, 31, 46, 0.8);
  
  .el-loading-spinner {
    .el-loading-text {
      color: #00D4FF;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .trend-content {
    .query-controls {
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      
      .date-range {
        width: 100%;
        flex-direction: column;
        gap: 8px;
        
        .separator {
          display: none;
        }
        
        :deep(.el-date-editor) {
          width: 100%;
        }
      }
      
      .el-button {
        width: 100%;
        font-size: 13px;
      }
    }
    
    .chart-container {
      .chart {
        height: 300px;
      }
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 12px;
  }
}
</style>