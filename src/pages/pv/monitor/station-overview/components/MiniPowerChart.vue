<template>
  <div ref="chartRef" class="mini-power-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const props = defineProps<{
  data: number[] // 功率数据数组
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      show: false,
      data: props.data.map((_, index) => index),
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        type: 'line',
        data: props.data,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#FFD700',
          width: 1.5,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 215, 0, 0.6)' },
              { offset: 1, color: 'rgba(255, 215, 0, 0.05)' },
            ],
          },
        },
      },
    ],
  }

  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.mini-power-chart {
  width: 100%;
  height: 40px;
}
</style>

