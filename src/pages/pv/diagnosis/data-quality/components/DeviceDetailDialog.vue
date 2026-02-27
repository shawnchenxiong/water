<template>
  <el-dialog
    v-model="dialogVisible"
    :title="device?.deviceName || '设备详情'"
    width="800px"
    class="device-detail-dialog"
  >
    <div class="dialog-content">
      <div class="control-bar">
        <span class="label">查询时间</span>
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          @change="loadTrendData"
        />
        <el-button type="primary" @click="loadTrendData">提交</el-button>
      </div>
      <div ref="trendChartRef" class="trend-chart" v-loading="loading"></div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { getDeviceTrend } from '@/api/diagnosis/dataQuality'
import type { DeviceDataQuality, DeviceTrendResponse } from '@/api/types/diagnosis/dataQuality'

const props = defineProps<{
  visible: boolean
  device: DeviceDataQuality | null
}>()

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const trendChartRef = ref<HTMLElement | null>(null)
let trendChartInstance: ECharts | null = null
const loading = ref(false)
const trendData = ref<DeviceTrendResponse | null>(null)

watch(dialogVisible, async (val) => {
  if (val && props.device) {
    await nextTick()
    await loadTrendData()
  }
})

const loadTrendData = async () => {
  if (!props.device) return

  loading.value = true

  try {
    const [year, month] = selectedMonth.value.split('-')
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
    const startDate = `${selectedMonth.value}-01`
    const endDate = `${selectedMonth.value}-${String(daysInMonth).padStart(2, '0')}`

    const data = await getDeviceTrend({
      deviceId: props.device.deviceId,
      startDate,
      endDate
    })

    trendData.value = data
    renderChart(data)
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  } finally {
    loading.value = false
  }
}

const renderChart = (data: DeviceTrendResponse) => {
  if (!trendChartRef.value) return

  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChartRef.value)
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.trendData.dates.map(d => d.split('-').slice(1).join('-')),
      axisLine: {
        lineStyle: {
          color: '#4A90E2'
        }
      },
      axisLabel: {
        color: '#fff'
      }
    },
    yAxis: {
      type: 'value',
      name: '数据质量指数',
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
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '数据质量指数',
        type: 'line',
        data: data.trendData.qualityIndex,
        itemStyle: {
          color: '#52c41a'
        },
        lineStyle: {
          color: '#52c41a',
          width: 2
        },
        symbol: 'circle',
        symbolSize: 6,
        markPoint: {
          data: data.trendData.events.map(event => ({
            name: event.description,
            value: event.qualityIndex,
            xAxis: data.trendData.dates.indexOf(event.date),
            yAxis: event.qualityIndex,
            itemStyle: {
              color: '#ff4d4f'
            }
          }))
        }
      }
    ]
  }

  trendChartInstance.setOption(option)
}
</script>

<style scoped lang="scss">
.device-detail-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.dialog-content {
  width: 100%;
  height: 500px;

  .control-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .label {
      color: #fff;
      font-size: 14px;
    }
  }

  .trend-chart {
    width: 100%;
    height: calc(100% - 60px);
  }
}
</style>

