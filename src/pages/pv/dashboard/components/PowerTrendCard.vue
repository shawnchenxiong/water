<template>
  <div class="power-trend-card">
    <div class="card-header">
      <span class="card-title">发电量趋势</span>
      <div class="date-controls">
        <el-button 
          :class="{ active: selectedTimeRange === 'day' }" 
          @click="handleTimeRangeChange('day')"
          text
        >
          日
        </el-button>
        <el-button 
          :class="{ active: selectedTimeRange === 'month' }" 
          @click="handleTimeRangeChange('month')"
          text
        >
          月
        </el-button>
        <el-button 
          :class="{ active: selectedTimeRange === 'year' }" 
          @click="handleTimeRangeChange('year')"
          text
        >
          年
        </el-button>
      </div>
    </div>
    <div class="chart-container" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { PowerTrendDataPoint, TimeRange } from '@/api/types/pv-dashboard'
import { getPowerTrend } from '@/api/pvDashboardApi'
import { ElMessage } from 'element-plus'

/**
 * 组件Props
 */
interface Props {
  trendData?: PowerTrendDataPoint[]
  timeRange?: TimeRange
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: 'month'
})

// 响应式数据
const loading = ref(false)
const trendDataRef = ref<PowerTrendDataPoint[]>([])

// 使用props或API数据
const trendData = computed(() => props.trendData || trendDataRef.value)

/**
 * 组件Emits
 */
interface Emits {
  (e: 'change-time-range', range: TimeRange): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const chartRef = ref<HTMLElement>()
const selectedTimeRange = ref<TimeRange>(props.timeRange)
let chart: ECharts | null = null

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value || !trendData.value.length) return
  
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  
  const option = {
    grid: {
      top: 30,
      left: 30,
      right: 20,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map(item => item.date),
      axisLine: { lineStyle: { color: '#2f5f8f' } },
      axisLabel: { color: '#8db4d8' }
    },
    yAxis: {
      type: 'value',
      name: '万kWh',
      nameTextStyle: { color: '#8db4d8' },
      axisLine: { lineStyle: { color: '#2f5f8f' } },
      axisLabel: { color: '#8db4d8' },
      splitLine: { lineStyle: { color: '#1a3a5c' } }
    },
    series: [{
      data: trendData.value.map(item => Number((item.generation / 10000).toFixed(2))),
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#00d4ff' },
          { offset: 1, color: '#0099cc' }
        ])
      },
      barWidth: 12
    }]
  }
  
  chart.setOption(option)
}

/**
 * 加载数据
 */
const loadData = async (range: TimeRange = selectedTimeRange.value) => {
  // 如果有 props 数据，不调用 API
  if (props.trendData) {
    return
  }
  
  loading.value = true
  try {
    const response = await getPowerTrend(range)
    if (response.code === 200) {
      trendDataRef.value = response.data
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载发电趋势数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 切换时间范围
 */
const handleTimeRangeChange = (range: TimeRange) => {
  selectedTimeRange.value = range
  emit('change-time-range', range)
  loadData(range)
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

// 监听数据变化
watch(trendData, () => {
  initChart()
}, { deep: true })

// 组件挂载后加载数据和初始化图表
onMounted(async () => {
  await loadData()
  initChart()
  window.addEventListener('resize', handleResize)
  // 使用 ResizeObserver 监听容器大小变化
  if (chartRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        handleResize()
      })
    })
    resizeObserver.observe(chartRef.value)
    ;(chartRef.value as any)._resizeObserver = resizeObserver
  }
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartRef.value && (chartRef.value as any)._resizeObserver) {
    ;(chartRef.value as any)._resizeObserver.disconnect()
  }
  if (chart) {
    chart.dispose()
  }
})
</script>

<style scoped lang="scss">
.power-trend-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.card-title {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 500;
}

.date-controls {
  display: flex;
  gap: 8px;
}

.date-controls .el-button {
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  background: transparent;
  min-width: 40px;
  height: 28px;
}

.date-controls .el-button.active,
.date-controls .el-button:hover {
  color: #00d4ff;
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.chart-container {
  height: 100%;
  width: 100%;
}
</style>

