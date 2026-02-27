<template>
  <div ref="chartRef" class="power-trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface PowerTrendData {
  time: string[]
  power: number[]
  radiation: number[]
}

const props = defineProps<{
  data: PowerTrendData
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    legend: {
      data: ['全网功率', '瞬时辐射'],
      textStyle: {
        color: '#fff',
        fontSize: 11,
      },
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
    },
    grid: {
      left: '45px',
      right: '45px',
      top: '15px',
      bottom: '35px',
    },
    xAxis: {
      type: 'category',
      data: props.data.time,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)',
          width: 1,
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.65)',
        fontSize: 10,
        interval: 35, // 每隔35个显示一个标签（约3小时间隔）
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'kW',
        nameTextStyle: {
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: 11,
        },
        position: 'left',
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.3)',
            width: 1,
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.1)',
            type: 'dashed',
          },
        },
      },
      {
        type: 'value',
        name: 'W/m²',
        nameTextStyle: {
          color: 'rgba(255, 165, 0, 0.85)',
          fontSize: 11,
        },
        position: 'right',
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 165, 0, 0.3)',
            width: 1,
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: 10,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '全网功率',
        type: 'line',
        data: props.data.power,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#FFD700',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 215, 0, 0.8)' },
              { offset: 0.5, color: 'rgba(255, 215, 0, 0.4)' },
              { offset: 1, color: 'rgba(255, 215, 0, 0.05)' },
            ],
          },
        },
      },
      {
        name: '瞬时辐射',
        type: 'line',
        yAxisIndex: 1,
        data: props.data.radiation,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#FF8C00',
          width: 2,
        },
      },
    ],
  }

  chartInstance.setOption(option)
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    if (chartInstance) {
      initChart()
    }
  },
  { deep: true }
)

// 监听窗口resize
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.power-trend-chart {
  width: 100%;
  height: 160px;
}
</style>

