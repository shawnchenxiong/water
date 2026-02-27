<template>
  <div class="inspection-pie-chart">
    <div class="chart-header">
      <h3 class="chart-title">巡检统计</h3>
    </div>
    <div class="chart-container">
      <div ref="chartRef" class="chart-canvas"></div>
      <div class="chart-legend">
        <div 
          v-for="item in chartData.series" 
          :key="item.name"
          class="legend-item"
        >
          <div 
            class="legend-color" 
            :style="{ backgroundColor: item.color }"
          ></div>
          <span class="legend-label">{{ item.name }}</span>
          <span class="legend-value">{{ item.value }}</span>
          <span class="legend-unit">次</span>
        </div>
      </div>
    </div>
    <div class="personnel-stats">
      <div class="stat-item">
        <span class="stat-label">巡检人员</span>
        <span class="stat-value">{{ personnelStats.total }}人</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">问题数</span>
        <span class="stat-value">{{ personnelStats.totalIssues }}个</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">未确认问题</span>
        <span class="stat-value">{{ personnelStats.unconfirmedIssues }}个</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { PieChartData, PersonnelStats } from '@/api/types/mobile-inspection-statistics'

interface Props {
  chartData: PieChartData
  personnelStats: PersonnelStats
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
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      }
    },
    legend: {
      show: false
    },
        series: [
      {
        name: '巡检统计',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: props.chartData.series.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: `${props.chartData.total}次`,
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#ffffff',
          textAlign: 'center',
          x: -100
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '60%',
        style: {
          text: '巡检总数',
          fontSize: 12,
          fill: '#cccccc',
          textAlign: 'center',
          x: -100
        }
      }
    ]
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
.inspection-pie-chart {
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
    flex-direction: row;
    min-height: 0;
    gap: 20px;

    .chart-canvas {
      flex: 1;
      min-height: 220px;
      max-height: 280px;
    }

    .chart-legend {
      width: 140px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 12px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .legend-label {
          color: #cccccc;
          font-size: 13px;
          min-width: 50px;
        }

        .legend-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin-left: auto;
        }

        .legend-unit {
          color: #999999;
          font-size: 12px;
          margin-left: 2px;
        }
      }
    }
  }

  .personnel-stats {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    background-color: rgba(0, 212, 255, 0.15);
    border-radius: 6px;
    padding: 16px 12px;
    border: 1px solid rgba(0, 212, 255, 0.3);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex: 1;

      .stat-label {
        color: #cccccc;
        font-size: 13px;
      }

      .stat-value {
        color: #ffffff;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .inspection-pie-chart {
    .chart-container {
      .chart-canvas {
        min-height: 180px;
      }
    }

    .personnel-stats {
      .stat-item {
        .stat-value {
          font-size: 14px;
        }
      }
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  .inspection-pie-chart {
    padding: 12px;

    .chart-header {
      margin-bottom: 12px;

      .chart-title {
        font-size: 15px;
      }
    }

    .chart-container {
      gap: 16px;

      .chart-canvas {
        min-height: 160px;
        max-height: 200px;
      }

      .chart-legend {
        width: 120px;

        .legend-item {
          gap: 6px;

          .legend-label {
            font-size: 12px;
            min-width: 40px;
          }

          .legend-value {
            font-size: 13px;
          }

          .legend-unit {
            font-size: 11px;
          }
        }
      }
    }

    .personnel-stats {
      padding: 12px 8px;

      .stat-item {
        gap: 4px;

        .stat-label {
          font-size: 12px;
        }

        .stat-value {
          font-size: 16px;
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .inspection-pie-chart {
    height: auto;
    min-height: 400px;
    padding: 12px;

    .chart-header {
      margin-bottom: 12px;

      .chart-title {
        font-size: 14px;
      }
    }

    .chart-container {
      flex: none;
      flex-direction: column;
      gap: 12px;
      min-height: 0;

      .chart-canvas {
        height: 200px;
        width: 100%;
        flex-shrink: 0;
      }

      .chart-legend {
        width: 100%;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        gap: 8px;
        flex-shrink: 0;

        .legend-item {
          flex: 1;
          min-width: calc(50% - 4px);
          justify-content: flex-start;
          gap: 6px;

          .legend-color {
            width: 10px;
            height: 10px;
          }

          .legend-label {
            font-size: 12px;
            min-width: auto;
            flex: 1;
          }

          .legend-value {
            font-size: 13px;
            font-weight: 600;
            margin-left: auto;
          }

          .legend-unit {
            font-size: 11px;
            margin-left: 2px;
          }
        }
      }
    }

    .personnel-stats {
      margin-top: 16px;
      padding: 12px 8px;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;

      .stat-item {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;

        .stat-label {
          font-size: 12px;
          color: #cccccc;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }
      }
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  .inspection-pie-chart {
    height: auto;
    min-height: 350px;
    padding: 8px;

    .chart-header {
      margin-bottom: 8px;

      .chart-title {
        font-size: 13px;
      }
    }

    .chart-container {
      flex: none;
      gap: 8px;

      .chart-canvas {
        height: 160px;
        width: 100%;
        flex-shrink: 0;
      }

      .chart-legend {
        flex-shrink: 0;
        
        .legend-item {
          .legend-label {
            font-size: 11px;
          }

          .legend-value {
            font-size: 12px;
          }

          .legend-unit {
            font-size: 10px;
          }
        }
      }
    }

    .personnel-stats {
      margin-top: 12px;
      padding: 8px 6px;
      flex-shrink: 0;

      .stat-item {
        .stat-label {
          font-size: 11px;
        }

        .stat-value {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
