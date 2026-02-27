<template>
  <el-dialog
    v-model="dialogVisible"
    :title="deviceName"
    width="85%"
    :before-close="handleClose"
    custom-class="device-trend-dialog"
  >
    <div class="dialog-content" v-loading="loading">
      <!-- 控制区域 -->
      <div class="control-section">
        <div class="control-row">
          <div class="time-range-group">
            <el-date-picker
              v-model="timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleTimeRangeChange"
              size="default"
            />
            <el-button type="primary" @click="queryTrendData" :loading="loading">
              参数选择
            </el-button>
          </div>
          
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot orange"></span>
              <span>电站积尘损失率(%)</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot yellow"></span>
              <span>设备积尘损失率(%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势图表 -->
      <div class="chart-section" v-if="trendData">
        <div class="chart-container" ref="chartRef"></div>
      </div>

      <!-- 暂无数据提示 -->
      <div class="no-data" v-if="!loading && !trendData">
        <el-empty description="暂无历史趋势数据" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { DeviceHistoryTrend } from '@/api/types/diagnosis/cleaningAdvice'
import { getDeviceHistoryTrend } from '@/api/diagnosis/cleaningAdvice'
import dayjs from 'dayjs'

interface Props {
  visible: boolean
  stationId: string
  deviceName: string
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const trendData = ref<DeviceHistoryTrend | null>(null)
const timeRange = ref<[string, string]>([
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])

// 图表相关
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// Resize处理函数
const handleResize = () => {
  chartInstance?.resize()
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.stationId && props.deviceName) {
    queryTrendData()
  } else if (!visible) {
    // 清理图表
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    trendData.value = null
  }
})

// 时间范围变化
const handleTimeRangeChange = (range: [string, string] | null) => {
  if (range) {
    timeRange.value = range
  }
}

// 查询趋势数据
const queryTrendData = async () => {
  if (!props.stationId || !props.deviceName) return

  try {
    loading.value = true
    
    const response = await getDeviceHistoryTrend({
      stationId: props.stationId,
      deviceName: props.deviceName,
      startDate: timeRange.value[0],
      endDate: timeRange.value[1]
    })

    if (response.code === 200) {
      trendData.value = response.data
      nextTick(() => {
        initChart()
      })
    } else {
      ElMessage.error(response.message || '获取历史趋势失败')
    }
  } catch (error) {
    console.error('查询历史趋势失败:', error)
    ElMessage.error('网络请求失败')
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value || !trendData.value) return

  // 清理旧图表
  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value, 'dark')

  const { dates, dustLossRate, dustLossGeneration } = trendData.value

  // 天气图标映射
  const weatherIcons = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    overcast: '☁️',
    thunderstorm: '⛈️'
  }

  // 模拟天气数据
  const weatherData = dates.map(() => {
    const weathers = ['sunny', 'cloudy', 'rainy', 'overcast']
    return weathers[Math.floor(Math.random() * weathers.length)]
  })

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#00d4ff',
          type: 'solid'
        }
      },
      backgroundColor: 'rgba(10, 30, 50, 0.95)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        const date = dates[dataIndex]
        const weatherIcon = weatherIcons[weatherData[dataIndex] as keyof typeof weatherIcons] || '☀️'
        
        let tooltip = `<div style="margin-bottom: 6px; font-weight: bold;">${date} ${weatherIcon}</div>`
        params.forEach((param: any) => {
          tooltip += `<div style="display: flex; justify-content: space-between; margin: 3px 0;">
            <span>${param.marker} ${param.seriesName}:</span>
            <span style="margin-left: 20px; font-weight: bold;">${param.value || '-'}</span>
          </div>`
        })
        return tooltip
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '50px',
      right: '50px',
      bottom: '120px',
      top: '80px'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        formatter: (value: string) => dayjs(value).format('MM-DD')
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
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
    series: [
      {
        name: '电站积尘损失率(%)',
        type: 'line',
        data: dustLossRate,
        lineStyle: {
          color: '#e67e22',
          width: 2
        },
        itemStyle: {
          color: '#e67e22'
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      },
      {
        name: '设备积尘损失率(%)',
        type: 'line',
        data: dustLossGeneration,
        lineStyle: {
          color: '#f1c40f',
          width: 2
        },
        itemStyle: {
          color: '#f1c40f'
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      }
    ],
    // 天气图标显示
    graphic: weatherData.map((weather, index) => ({
      type: 'text',
      left: `${(index / (dates.length - 1)) * 100}%`,
      top: '40px',
      style: {
        text: weatherIcons[weather as keyof typeof weatherIcons] || '☀️',
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
        labelFormatter: (value: number) => {
          const date = dates[Math.floor(value)]
          return date ? dayjs(date).format('MM-DD') : ''
        }
      }
    ]
  }

  chartInstance.setOption(option)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 导出图表（移除footer中的导出按钮，简化UI）

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 组件卸载时清理
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss">
.device-trend-dialog {
  background: linear-gradient(135deg, rgba(30, 60, 120, 0.95) 0%, rgba(20, 40, 80, 0.98) 100%);
  border: 1px solid rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 50px rgba(0, 212, 255, 0.2);

  .el-dialog__header {
    background: rgba(20, 40, 80, 0.6);
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);

    .el-dialog__title {
      color: #00d4ff;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #fff;

        &:hover {
          color: #00d4ff;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    background: rgba(20, 40, 80, 0.4);
    border-top: 1px solid rgba(0, 212, 255, 0.3);
  }
}
</style>

<style scoped lang="scss">
.dialog-content {
  .control-section {
    margin-bottom: 20px;

    .control-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(20, 40, 80, 0.4);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;

      .time-range-group {
        display: flex;
        align-items: center;
        gap: 12px;

        :deep(.el-date-editor) {
          background: rgba(10, 30, 50, 0.8);
          border: 1px solid rgba(0, 212, 255, 0.4);
          color: #fff;
          width: 300px;

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
          font-size: 13px;

          .legend-dot {
            width: 12px;
            height: 3px;
            border-radius: 2px;

            &.orange {
              background: #e67e22;
            }

            &.yellow {
              background: #f1c40f;
            }
          }
        }
      }
    }
  }

  .chart-section {
    .chart-container {
      width: 100%;
      height: 420px;
      background: rgba(30, 60, 120, 0.2);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 8px;
    }
  }

  .no-data {
    text-align: center;
    padding: 60px 0;

    :deep(.el-empty__description) {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .control-section {
    .control-row {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .time-range-group {
        justify-content: center;

        :deep(.el-date-editor) {
          width: 100%;
          max-width: 300px;
        }
      }

      .chart-legend {
        justify-content: center;
        gap: 16px;
      }
    }
  }

  .chart-section {
    .chart-container {
      height: 320px;
    }
  }
}
</style>
