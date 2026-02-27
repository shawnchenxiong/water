<template>
  <div ref="chartRef" class="power-chart" v-loading="loading"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'

interface Props {
  option: EChartsOption
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(props.option)

    // 监听窗口resize
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})

// 监听option变化
watch(
  () => props.option,
  (newOption) => {
    if (chartInstance && newOption) {
      chartInstance.setOption(newOption, true)
    }
  },
  { deep: true }
)

function handleResize() {
  chartInstance?.resize()
}

// 暴露方法给父组件
defineExpose({
  resize: () => chartInstance?.resize()
})
</script>

<style scoped lang="scss">
.power-chart {
  width: 100%;
  height: 100%;
}
</style>

