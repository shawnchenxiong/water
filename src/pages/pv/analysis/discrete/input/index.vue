<template>
  <DeviceMonitorLayout>
    <template #left>
      <StationTree 
        device-type="0920"
        :auto-select-first-leaf="true"
        @node-click="handleStationSelect" 
      />
    </template>
    <template #right>
      <div class="content-container">
      <div class="control-bar">
        <div class="time-controls">
          <el-radio-group v-model="timeType" @change="handleTimeTypeChange">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
            <el-radio-button label="year">年</el-radio-button>
          </el-radio-group>

          <div class="date-picker-wrapper">
            <el-button :icon="ArrowLeft" circle @click="handlePrevDate" />
            <el-date-picker
              v-model="queryDate"
              :type="datePickerType"
              :format="dateFormat"
              value-format="YYYY-MM-DD"
              @change="fetchData"
            />
            <el-button :icon="ArrowRight" circle @click="handleNextDate" />
          </div>

          <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
        </div>
        <el-button type="primary" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
      </div>
      <div class="chart-section">
        <div ref="chartRef" class="chart" v-loading="loading"></div>
      </div>
      <div class="table-section">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="installedCapacity" label="装机容量(kWp)" width="130" align="right">
            <template #default="{ row }">{{ row.installedCapacity.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="dispersionRate" label="离散率" align="right">
            <template #default="{ row }">
              <span :style="{ color: getColor(row.dispersionRate) }">{{ row.dispersionRate }}%</span>
            </template>
          </el-table-column>
          <el-table-column v-for="i in 5" :key="i" :label="`组串${i}(A)`" width="100" align="right">
            <template #default="{ row }">{{ row.strings[i - 1]?.value || 0 }}</template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template><el-button text type="primary">设置</el-button></template>
          </el-table-column>
        </el-table>
      </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeft, ArrowRight, Refresh, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import { getDispersionAll, getDispersionPage } from '@/api/analysis/discreteInput'
import type { DeviceDetail } from '@/api/types/analysis/discreteInput'

const selectedStationId = ref('')
const timeType = ref<'day' | 'month' | 'year'>('month')
const queryDate = ref(dayjs().format('YYYY-MM-DD'))

// 移动端检测
const isMobile = ref(false)
const datePickerType = computed(() => {
  const map: Record<'day' | 'month' | 'year', 'date' | 'month' | 'year'> = {
    day: 'date',
    month: 'month',
    year: 'year'
  }
  return map[timeType.value]
})

const dateFormat = computed(() => {
  const map: Record<'day' | 'month' | 'year', string> = {
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY'
  }
  return map[timeType.value]
})

function handleTimeTypeChange() {
  const now = dayjs()
  if (timeType.value === 'day') {
    queryDate.value = now.format('YYYY-MM-DD')
  } else if (timeType.value === 'month') {
    queryDate.value = now.format('YYYY-MM-01')
  } else {
    queryDate.value = now.format('YYYY-01-01')
  }
  fetchData()
}

function handlePrevDate() {
  const current = dayjs(queryDate.value)
  if (timeType.value === 'day') {
    queryDate.value = current.subtract(1, 'day').format('YYYY-MM-DD')
  } else if (timeType.value === 'month') {
    queryDate.value = current.subtract(1, 'month').format('YYYY-MM-01')
  } else {
    queryDate.value = current.subtract(1, 'year').format('YYYY-01-01')
  }
  fetchData()
}

function handleNextDate() {
  const current = dayjs(queryDate.value)
  if (timeType.value === 'day') {
    queryDate.value = current.add(1, 'day').format('YYYY-MM-DD')
  } else if (timeType.value === 'month') {
    queryDate.value = current.add(1, 'month').format('YYYY-MM-01')
  } else {
    queryDate.value = current.add(1, 'year').format('YYYY-01-01')
  }
  fetchData()
}
const tableData = ref<DeviceDetail[]>([])
const loading = ref(false)
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

function getColor(rate: number) {
  if (rate >= 20) return '#F56C6C'
  if (rate >= 10) return '#FFA500'
  if (rate >= 5) return '#FFD700'
  return '#67C23A'
}

const handleStationSelect = (node: any) => {
  selectedStationId.value = node.regionId || node.id;
  fetchData();
};

async function fetchData() {
  if (!selectedStationId.value) return
  loading.value = true
  try {
    const dateTypeMap: Record<'day' | 'month' | 'year', number> = { day: 0, month: 1, year: 2 }
    const current = dayjs(queryDate.value)
    let formatted = ''
    if (timeType.value === 'day') formatted = current.format('YYYY-MM-DD')
    else if (timeType.value === 'month') formatted = current.format('YYYY-MM')
    else formatted = current.format('YYYY')

    const params = {
      regionId: selectedStationId.value,
      deviceType: '0915',
      dateType: dateTypeMap[timeType.value],
      queryTime: formatted
    }
    const [summaryRes, pageRes] = await Promise.all([
      getDispersionAll(params),
      getDispersionPage({ ...params, pageNum: 1, pageSize: 100 })
    ])
    updateChart(summaryRes.data)
    tableData.value = pageRes.data.list
  } finally {
    loading.value = false
  }
}

function updateChart(data: any) {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: isMobile.value ? 'horizontal' : 'vertical',
      right: isMobile.value ? 'center' : 20,
      top: isMobile.value ? 20 : 'center',
      bottom: isMobile.value ? 'auto' : 'auto',
      textStyle: { 
        color: '#fff',
        fontSize: isMobile.value ? 12 : 14
      }
    },
    series: [{
      type: 'pie',
      radius: isMobile.value ? ['50%', '70%'] : ['60%', '80%'],
      center: isMobile.value ? ['50%', '60%'] : ['40%', '50%'],
      label: { 
        show: true, 
        formatter: isMobile.value ? '{b}\n{c}' : '{b}\n{c}台 ({d}%)', 
        color: '#fff',
        fontSize: isMobile.value ? 10 : 12
      },
      data: [
        { value: data.poorCount, name: '建议整改', itemStyle: { color: '#F56C6C' } },
        { value: data.normalCount, name: '指差', itemStyle: { color: '#FFA500' } },
        { value: data.goodCount, name: '一般', itemStyle: { color: '#FFD700' } },
        { value: data.excellentCount, name: '优秀', itemStyle: { color: '#67C23A' } },
        { value: data.offlineCount, name: '离线', itemStyle: { color: '#909399' } }
      ].filter(item => item.value > 0)
    }],
    graphic: {
      type: 'text',
      left: isMobile.value ? '50%' : '40%',
      top: isMobile.value ? '55%' : '45%',
      style: {
        text: `${data.totalCount}\n总台数`,
        fontSize: isMobile.value ? 20 : 28,
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#fff'
      },
      z: 100
    }
  })
}

async function handleExport() {
  const dateTypeMap: Record<'day' | 'month' | 'year', number> = { day: 0, month: 1, year: 2 }
  const current = dayjs(queryDate.value)
  let formatted = ''
  if (timeType.value === 'day') formatted = current.format('YYYY-MM-DD')
  else if (timeType.value === 'month') formatted = current.format('YYYY-MM')
  else formatted = current.format('YYYY')

  const params = {
    regionId: selectedStationId.value,
    deviceType: '0915',
    dateType: dateTypeMap[timeType.value],
    queryTime: formatted,
    pageNum: 1,
    pageSize: 100000
  }
  const res = await getDispersionPage(params)
  console.log('Export data:', res.data.list)
}

// 移动端检测函数
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  const wasChanged = isMobile.value !== newIsMobile
  isMobile.value = newIsMobile
  
  // 如果移动端状态改变了，需要重新更新图表
  if (wasChanged && chartInstance) {
    nextTick(() => {
      // 重新获取数据并更新图表
      if (selectedStationId.value) {
        fetchData()
      }
      // 延迟调用 resize 确保图表尺寸正确
      setTimeout(() => {
        chartInstance?.resize()
      }, 100)
    })
  }
}

// 该页面依赖左侧 StationTree 选择后再查询

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', handleResize)
  window.addEventListener('resize', checkIsMobile)
  // 确保图表初始化后再次检查移动端状态
  nextTick(() => {
    setTimeout(() => {
      checkIsMobile()
    }, 200)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('resize', checkIsMobile)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.content-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
  }

    .control-bar { 
      display: flex; 
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
      flex-shrink: 0;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 16px;
    }

    .time-controls { 
      display: flex; 
      gap: 10px; 
      align-items: center;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        justify-content: center;
        gap: 8px;
      }

      .date-picker-wrapper { 
        display: flex; 
        gap: 5px; 
        align-items: center; 
      }
    }

    @media (max-width: 768px) {
      .el-button {
        align-self: center;
      }
    }
  }

  .chart-section {
    height: 400px;
    margin-bottom: 20px;
    background: rgba(10, 24, 45, 0.4);
    border-radius: 4px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      height: 300px;
      margin-bottom: 16px;
    }

    @media (max-width: 480px) {
      height: 250px;
    }

    .chart {
      width: 100%;
      height: 100%;
    }
  }

  .table-section {
    flex: 1;
    min-height: 0;
    overflow: hidden;

    // 表格移动端适配
    :deep(.el-table) {
      @media (max-width: 768px) {
        font-size: 12px;

        .el-table__header th {
          padding: 8px 0;
        }

        .el-table__body td {
          padding: 8px 0;
        }
      }
    }
  }
}
</style>
