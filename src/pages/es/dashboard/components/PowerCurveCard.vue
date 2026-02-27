<template>
  <div class="power-curve-card">
    <div class="card-header">
      <span class="card-title">功率曲线</span>
      <div class="date-picker">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          size="small"
        />
      </div>
    </div>
    <div class="chart-container" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { PowerCurveDataPoint } from '@/api/types/es-dashboard'
import { getPowerCurve } from '@/api/esDashboardApi'
import { ElMessage } from 'element-plus'

/**
 * 组件Props
 */
interface Props {
  curveData?: PowerCurveDataPoint[]
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const curveDataRef = ref<PowerCurveDataPoint[]>([])
const chartRef = ref<HTMLElement>()
const selectedDate = ref(new Date().toISOString().split('T')[0])
let chart: ECharts | null = null

// 使用props或API数据
const curveData = computed(() => props.curveData || curveDataRef.value)

/**
 * 加载数据
 */
const loadData = async (date: string = selectedDate.value) => {
  if (props.curveData) return
  
  loading.value = true
  try {
    const response = await getPowerCurve(date)
    if (response.code === 200) {
      curveDataRef.value = response.data
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载功率曲线数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 监听日期变化
watch(selectedDate, (newDate) => {
  loadData(newDate)
})

/**
 * 初始化功率曲线图表
 */
const initChart = () => {
  if (!chartRef.value || !curveData.value.length) return
  
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  
  const option = {
    grid: {
      top: 20,
      left: 40,
      right: 20,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: curveData.value.map(item => item.time),
      axisLine: { lineStyle: { color: '#2f5f8f' } },
      axisLabel: { color: '#8db4d8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2f5f8f' } },
      axisLabel: { color: '#8db4d8' },
      splitLine: { lineStyle: { color: '#1a3a5c' } }
    },
    series: [{
      data: curveData.value.map(item => item.power),
      type: 'line',
      smooth: true,
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#f1c40f', width: 3 },
      itemStyle: { color: '#f1c40f' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(241, 196, 15, 0.3)' },
          { offset: 1, color: 'rgba(241, 196, 15, 0.05)' }
        ])
      }
    }]
  }
  
  chart.setOption(option)
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
watch(curveData, () => {
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
.power-curve-card {
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

.chart-container {
  height: 100%;
  width: 100%;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-date-editor) {
  background: transparent;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

:deep(.el-date-editor .el-input__inner) {
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
}

:deep(.el-date-editor:hover) {
  border-color: #00d4ff;
}
</style>

