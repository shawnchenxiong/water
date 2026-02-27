<template>
  <el-dialog
    v-model="dialogVisible"
    :title="device?.deviceName || '设备详情'"
    width="900px"
    @closed="handleClose"
  >
    <div class="device-detail-dialog">
      <!-- 时间选择和查询 -->
      <div class="query-bar">
        <span class="label">查询时间</span>
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          format="YYYY-MM"
          value-format="YYYY-MM"
          @change="handleMonthChange"
        />
        <el-button
          type="primary"
          @click="handleQuery"
        >
          提交
        </el-button>
      </div>

      <!-- 趋势图表 -->
      <div class="trend-chart-container" v-loading="loading">
        <div ref="trendChartRef" class="trend-chart"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { ElMessage } from 'element-plus'
import { getDeviceOperationTrend } from '@/api/diagnosis/deviceOperation'
import type { DeviceOperationData, DeviceOperationTrendResponse } from '@/api/types/diagnosis/deviceOperation'
import dayjs from 'dayjs'

interface Props {
  visible: boolean
  device: DeviceOperationData | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗可见性
const dialogVisible = ref(false)

// 选择的月份
const selectedMonth = ref<string>(dayjs().format('YYYY-MM'))

// 趋势数据
const trendData = ref<DeviceOperationTrendResponse | null>(null)

// 图表相关
const trendChartRef = ref<HTMLElement>()
let trendChartInstance: ECharts | null = null
const loading = ref(false)

// 监听visible变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.device) {
    loadTrendData()
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

/**
 * 处理月份变化
 */
const handleMonthChange = () => {
  // 月份变化时可以自动查询或等待用户点击提交
}

/**
 * 处理查询
 */
const handleQuery = () => {
  loadTrendData()
}

/**
 * 加载趋势数据
 */
const loadTrendData = async () => {
  if (!props.device?.deviceId) return

  loading.value = true

  try {
    // 计算月份的开始和结束日期
    const startDate = dayjs(selectedMonth.value).startOf('month').format('YYYY-MM-DD')
    const endDate = dayjs(selectedMonth.value).endOf('month').format('YYYY-MM-DD')

    const response = await getDeviceOperationTrend({
      deviceId: props.device.deviceId,
      startDate,
      endDate
    })

    trendData.value = response
    await nextTick()
    renderTrendChart(response)
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    ElMessage.error('加载趋势数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 渲染趋势图表
 */
const renderTrendChart = (data: DeviceOperationTrendResponse) => {
  if (!trendChartRef.value) return

  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChartRef.value)
  }

  // 标记异常点
  const markPointData = data.trendData.events.map(event => ({
    name: '异常',
    value: event.operationIndex,
    xAxis: event.date,
    yAxis: event.operationIndex,
    itemStyle: {
      color: '#f5222d'
    },
    label: {
      show: true,
      formatter: '异常',
      color: '#fff',
      backgroundColor: '#f5222d',
      padding: [4, 8],
      borderRadius: 4
    }
  }))

  const option: echarts.EChartsOption = {
    title: {
      text: '数质质量指数',
      left: 10,
      textStyle: {
        color: '#00D4FF',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `${param.axisValue}<br/>运行指数: ${param.value}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.trendData.dates,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#4A90E2'
        }
      },
      axisLabel: {
        color: '#fff',
        rotate: 45,
        interval: 2
      }
    },
    yAxis: {
      type: 'value',
      name: '运行指数',
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#4A90E2'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(74, 144, 226, 0.2)'
        }
      }
    },
    series: [
      {
        name: '运行指数',
        type: 'line',
        data: data.trendData.operationIndex,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#52c41a'
        },
        lineStyle: {
          color: '#52c41a',
          width: 2
        },
        markPoint: {
          data: markPointData
        }
      }
    ]
  }

  trendChartInstance.setOption(option)
}

/**
 * 窗口大小变化时调整图表
 */
const handleResize = () => {
  trendChartInstance?.resize()
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  // 清理图表实例
  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
}

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
})

// 添加窗口resize监听
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize)
}
</script>

<style scoped lang="scss">
.device-detail-dialog {
  .query-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 8px;

    .label {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
    }

    .el-date-picker {
      flex: 1;
    }
  }

  .trend-chart-container {
    height: 500px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;

    .trend-chart {
      width: 100%;
      height: 100%;
    }
  }
}

:deep(.el-dialog) {
  background: linear-gradient(135deg, #0d2344 0%, #1a2d4d 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.2);

  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    padding: 20px;

    .el-dialog__title {
      color: #00D4FF;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #00D4FF;
        font-size: 20px;

        &:hover {
          color: #33ddff;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 20px;
  }
}
</style>

