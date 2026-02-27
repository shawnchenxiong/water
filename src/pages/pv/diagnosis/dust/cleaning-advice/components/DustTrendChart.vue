<template>
  <div class="dust-trend-chart" ref="chartRef" v-loading="loading">
    <!-- 时间范围选择器 -->
    <div class="chart-header">
      <div class="date-range-picker">
        <span class="range-label">时间范围:</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange" 
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateRangeChange"
          size="small"
        />
        <el-button type="primary" size="small" @click="resetTimeRange">
          重置范围
        </el-button>
      </div>
      
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-dot orange"></span>
          <span>电站积尘损失率(%)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot blue"></span>
          <span>电站积尘损失电量(kWh)</span>
        </div>
      </div>
    </div>

    <!-- ECharts图表容器 -->
    <div class="chart-content" ref="chartContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { TrendData } from '@/api/types/diagnosis/cleaningAdvice'
import dayjs from 'dayjs'

interface Props {
  trendData?: TrendData
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const chartRef = ref<HTMLElement>()
const chartContainer = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// Resize处理函数
const handleResize = () => {
  chartInstance?.resize()
}

// 时间范围
const dateRange = ref<[string, string]>([])
const filteredData = ref<TrendData | null>(null)

// 天气图标映射
const weatherIcons = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  overcast: '☁️',
  thunderstorm: '⛈️'
}

// 初始化时间范围
const initDateRange = (data: TrendData) => {
  if (data.dates && data.dates.length > 0) {
    dateRange.value = [data.dates[0], data.dates[data.dates.length - 1]]
  }
}

// 过滤后的数据
const chartData = computed(() => {
  if (!props.trendData) return null
  
  if (filteredData.value) {
    return filteredData.value
  }
  
  return props.trendData
})

// 更新图表
const updateChart = () => {
  if (!chartInstance || !chartData.value) return

  const { dates, dustLossRate, dustLossGeneration, weather } = chartData.value

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#00d4ff'
        }
      },
      backgroundColor: 'rgba(10, 30, 50, 0.9)',
      borderColor: '#00d4ff',
      textStyle: {
        color: '#fff'
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        const date = dates[dataIndex]
        const weatherIcon = weatherIcons[weather[dataIndex] as keyof typeof weatherIcons] || '☀️'
        
        let tooltip = `${date} ${weatherIcon}<br/>`
        params.forEach((param: any) => {
          tooltip += `${param.marker} ${param.seriesName}: ${param.value}${param.seriesName.includes('率') ? '%' : 'kWh'}<br/>`
        })
        return tooltip
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '60px',
      right: '60px',
      bottom: '120px',
      top: '60px',
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.5)'
        }
      },
      axisTick: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.5)'
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 11,
        formatter: (value: string) => dayjs(value).format('MM-DD')
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.1)',
          type: 'dashed'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '积尘损失率(%)',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e67e22'
          }
        },
        axisLabel: {
          color: '#e67e22',
          fontSize: 11
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.1)',
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '积尘损失电量(kWh)',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#3498db'
          }
        },
        axisLabel: {
          color: '#3498db',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '电站积尘损失率',
        type: 'line',
        yAxisIndex: 0,
        data: dustLossRate,
        lineStyle: {
          color: '#e67e22',
          width: 2
        },
        itemStyle: {
          color: '#e67e22'
        },
        symbol: 'circle',
        symbolSize: 6,
        smooth: true,
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
                color: 'rgba(230, 126, 34, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(230, 126, 34, 0.05)'
              }
            ]
          }
        }
      },
      {
        name: '电站积尘损失电量',
        type: 'line',
        yAxisIndex: 1,
        data: dustLossGeneration,
        lineStyle: {
          color: '#3498db',
          width: 2
        },
        itemStyle: {
          color: '#3498db'
        },
        symbol: 'circle',
        symbolSize: 6,
        smooth: true
      }
    ],
    // 天气图标显示
    graphic: weather.map((w, index) => ({
      type: 'text',
      left: `${(index / (dates.length - 1)) * 100}%`,
      top: '20px',
      style: {
        text: weatherIcons[w as keyof typeof weatherIcons] || '☀️',
        fontSize: 16,
        textAlign: 'center',
        textVerticalAlign: 'middle'
      },
      silent: true
    })),
    // 时间范围缩放滑块
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100,
        bottom: 20,
        height: 20,
        backgroundColor: 'rgba(20, 40, 80, 0.6)',
        borderColor: 'rgba(0, 212, 255, 0.4)',
        fillerColor: 'rgba(0, 212, 255, 0.3)',
        handleStyle: {
          color: '#00d4ff',
          borderColor: '#00d4ff'
        },
        textStyle: {
          color: '#fff',
          fontSize: 10
        },
        moveHandleSize: 8,
        labelFormatter: (value: number, valueStr: string) => {
          const date = dates[Math.floor(value)]
          return date ? dayjs(date).format('MM-DD') : valueStr
        }
      }
    ]
  }

  chartInstance.setOption(option, true)
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value, 'dark')
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 设置图表配置
  updateChart()
}

// 时间范围变化处理
const handleDateRangeChange = (range: [string, string] | null) => {
  if (!range || !props.trendData) {
    filteredData.value = null
    updateChart()
    return
  }

  const [start, end] = range
  const startIndex = props.trendData.dates.findIndex(date => date >= start)
  const endIndex = props.trendData.dates.findLastIndex(date => date <= end)
  
  if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
    filteredData.value = {
      dates: props.trendData.dates.slice(startIndex, endIndex + 1),
      dustLossRate: props.trendData.dustLossRate.slice(startIndex, endIndex + 1),
      dustLossGeneration: props.trendData.dustLossGeneration.slice(startIndex, endIndex + 1),
      weather: props.trendData.weather.slice(startIndex, endIndex + 1)
    }
  } else {
    filteredData.value = null
  }
  
  updateChart()
}

// 重置时间范围
const resetTimeRange = () => {
  if (props.trendData) {
    initDateRange(props.trendData)
    filteredData.value = null
    updateChart()
  }
}

// 监听数据变化
watch(() => props.trendData, (newData) => {
  if (newData) {
    initDateRange(newData)
    updateChart()
  }
}, { immediate: true })

watch(() => props.loading, (loading) => {
  if (!loading && props.trendData) {
    nextTick(() => {
      updateChart()
    })
  }
})

// 组件挂载
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

// 组件卸载
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.dust-trend-chart {
  width: 100%;
  height: 100%;
  position: relative;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 8px;

    .date-range-picker {
      display: flex;
      align-items: center;
      gap: 12px;

      .range-label {
        color: #fff;
        font-size: 14px;
        white-space: nowrap;
      }

      :deep(.el-date-editor) {
        background: rgba(10, 30, 50, 0.8);
        border: 1px solid rgba(0, 212, 255, 0.4);
        color: #fff;

        &:focus-within {
          border-color: #00d4ff;
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
        }

        .el-input__inner {
          color: #fff;
          background: transparent;

          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
        }

        .el-range-separator {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    .chart-legend {
      display: flex;
      gap: 24px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #fff;
        font-size: 12px;

        .legend-dot {
          width: 12px;
          height: 3px;
          border-radius: 2px;

          &.orange {
            background: #e67e22;
          }

          &.blue {
            background: #3498db;
          }
        }
      }
    }
  }

  .chart-content {
    width: 100%;
    height: calc(100% - 60px);
    min-height: 300px;
  }

  // 响应式适配
  @media (max-width: 768px) {
    .chart-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .chart-legend {
        gap: 16px;
      }
    }

    .chart-content {
      height: calc(100% - 100px);
    }
  }
}
</style>