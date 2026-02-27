<template>
  <div class="construction-stats-card">
    <div class="card-header">
      <span class="card-title">电站建设统计</span>
      <div class="satellite-icon">
        <el-icon size="20"><OfficeBuilding /></el-icon>
      </div>
    </div>
    <div class="construction-body">
      <div class="construction-ring" ref="chartRef"></div>
      <div class="construction-stats">
        <div class="construction-item grid-connected">
          <div class="status-dot"></div>
          <div class="status-text">并网</div>
          <div class="status-value">{{ constructionStats.gridConnected.capacity }}</div>
          <div class="status-unit">MWp</div>
          <div class="status-count">{{ constructionStats.gridConnected.count }}座</div>
        </div>
        <div class="construction-item under-construction">
          <div class="status-dot"></div>
          <div class="status-text">在建</div>
          <div class="status-value">{{ constructionStats.underConstruction.capacity }}</div>
          <div class="status-unit">MWp</div>
          <div class="status-count">{{ constructionStats.underConstruction.count }}座</div>
        </div>
        <div class="construction-item planned">
          <div class="status-dot"></div>
          <div class="status-text">拟建</div>
          <div class="status-value">{{ constructionStats.planned.capacity }}</div>
          <div class="status-unit">MWp</div>
          <div class="status-count">{{ constructionStats.planned.count }}座</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { StationConstructionStats } from '@/api/types/es-dashboard'
import { getConstructionStats } from '@/api/esDashboardApi'
import { ElMessage } from 'element-plus'

/**
 * 组件Props
 */
interface Props {
  constructionStats?: StationConstructionStats
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const constructionStatsRef = ref<StationConstructionStats>({
  gridConnected: { count: 0, capacity: 0 },
  underConstruction: { count: 0, capacity: 0 },
  planned: { count: 0, capacity: 0 }
})

// 使用props或API数据
const constructionStats = computed(() => props.constructionStats || constructionStatsRef.value)

/**
 * 加载数据
 */
const loadData = async () => {
  if (props.constructionStats) return
  
  loading.value = true
  try {
    const response = await getConstructionStats()
    if (response.code === 200) {
      constructionStatsRef.value = response.data
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载建设统计数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 响应式数据
const chartRef = ref<HTMLElement>()
let chart: ECharts | null = null

/**
 * 初始化电站建设环形图
 */
const initChart = () => {
  if (!chartRef.value) return
  
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  
  const { gridConnected, underConstruction, planned } = constructionStats.value
  const data = [
    { name: '并网', value: gridConnected.capacity, itemStyle: { color: '#00d4ff' } },
    { name: '在建', value: underConstruction.capacity, itemStyle: { color: '#ffa726' } },
    { name: '拟建', value: planned.capacity, itemStyle: { color: '#6b7280' } }
  ]
  
  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '电站建设',
        type: 'pie',
        radius: ['70%', '85%'],
        center: ['50%', '50%'],
        data,
        label: { show: false },
        clockwise: false
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '44%',
        style: {
          text: `${gridConnected.capacity}`,
          fill: '#00d4ff',
          fontSize: 16, // 缩小字体
          fontWeight: 600
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '58%',
        style: {
          text: 'MWp',
          fill: 'rgba(255,255,255,0.8)',
          fontSize: 11 // 缩小字体
        }
      }
    ]
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
watch(constructionStats, () => {
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
.construction-stats-card {
  padding: 12px; // 更紧凑的padding
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px; // 减小间距
  padding-bottom: 6px; // 减小间距
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.card-title {
  color: #00d4ff;
  font-size: 15px; // 缩小字体
  font-weight: 500;
}

.construction-body {
  display: flex;
  align-items: center;
  gap: 12px; // 减小gap
}

.construction-ring {
  width: 120px; // 缩小圆环图
  height: 120px;
  flex-shrink: 0;
}

.construction-stats {
  display: flex;
  flex-direction: column;
  gap: 12px; // 减小gap
  flex: 1;
  min-width: 0;
}

.construction-item {
  display: flex;
  align-items: center;
  gap: 6px; // 稍微增加gap，让元素间距清晰
}

.status-dot {
  width: 10px; // 缩小点
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.grid-connected .status-dot {
  background: #10b981;
}

.under-construction .status-dot {
  background: #f59e0b;
}

.planned .status-dot {
  background: #6b7280;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px; // 缩小字体
  min-width: 36px; // 缩小宽度
  flex-shrink: 0;
}

.status-value {
  color: #00d4ff;
  font-size: 16px; // 缩小字体
  font-weight: 600;
  flex-shrink: 0;
}

.status-unit {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px; // 缩小字体
  margin-left: 2px; // 减小间距
  flex-shrink: 0;
}

.status-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px; // 缩小字体
  margin-left: auto;
  flex-shrink: 0;
}
</style>

