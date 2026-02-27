<template>
  <div class="inspection-bar-chart">
    <div class="chart-header">
      <h3 class="chart-title">巡检分布</h3>
    </div>
    <div class="chart-container">
      <div ref="chartRef" class="chart-canvas"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { BarChartData } from '@/api/types/mobile-inspection-statistics'

interface Props {
  chartData: BarChartData
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

/**
 * 更新图表数据
 */
const updateChart = () => {
  if (!chartInstance) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>${param.seriesName}: ${param.value}次`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: props.chartData.xAxis,
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#333'
          }
        },
        axisLabel: {
          color: '#cccccc',
          fontSize: window.innerWidth <= 480 ? 10 : window.innerWidth <= 768 ? 11 : 12,
          interval: window.innerWidth <= 480 ? 'auto' : 0
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#333'
          }
        },
        axisLabel: {
          color: '#cccccc',
          fontSize: window.innerWidth <= 480 ? 10 : window.innerWidth <= 768 ? 11 : 12
        },
        splitLine: {
          lineStyle: {
            color: '#333',
            type: 'dashed'
          }
        }
      }
    ],
    series: props.chartData.series.map(series => ({
      name: series.name,
      type: 'bar',
      barWidth: '60%',
      data: series.data,
      itemStyle: {
        color: series.color,
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: series.color,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(0, 212, 255, 0.5)'
        }
      }
    }))
  }

  chartInstance.setOption(option, true)
}

/**
 * 调整图表大小
 */
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听数据变化
watch(() => props.chartData, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 监听加载状态
watch(() => props.loading, (loading) => {
  if (chartInstance) {
    if (loading) {
      chartInstance.showLoading({
        text: '加载中...',
        color: '#00d4ff',
        textColor: '#ffffff',
        maskColor: 'rgba(0, 0, 0, 0.3)'
      })
    } else {
      chartInstance.hideLoading()
    }
  }
})

onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped lang="scss">
.inspection-bar-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid #333;
  padding: 16px;

  .chart-header {
    margin-bottom: 16px;

    .chart-title {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }
  }

  .chart-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .chart-canvas {
      flex: 1;
      min-height: 280px;
      max-height: 350px;
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .inspection-bar-chart {
    .chart-container {
      .chart-canvas {
        min-height: 180px;
      }
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  .inspection-bar-chart {
    padding: 12px;

    .chart-header {
      margin-bottom: 12px;

      .chart-title {
        font-size: 15px;
      }
    }

    .chart-container {
      .chart-canvas {
        min-height: 200px;
        max-height: 280px;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .inspection-bar-chart {
    padding: 12px;

    .chart-header {
      margin-bottom: 12px;

      .chart-title {
        font-size: 14px;
      }
    }

    .chart-container {
      .chart-canvas {
        min-height: 240px;
        max-height: 300px;
      }
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  .inspection-bar-chart {
    padding: 8px;

    .chart-header {
      margin-bottom: 8px;

      .chart-title {
        font-size: 13px;
        font-weight: 500;
      }
    }

    .chart-container {
      .chart-canvas {
        min-height: 220px;
        max-height: 270px;
      }
    }
  }
}
</style>
