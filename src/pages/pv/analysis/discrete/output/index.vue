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
      <!-- 顶部操作栏 -->
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
        
        <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
      </div>

      <!-- 统计图表区域 -->
      <div class="chart-section">
        <div ref="chartRef" class="chart" v-loading="loading"></div>
      </div>

      <!-- 详细数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe border height="400">
        <el-table-column prop="deviceName" label="设备名称"  />
        <el-table-column prop="installedCapacity" label="装机容量(kWp)" width="130" align="right">
          <template #default="{ row }">
            {{ Number(row.installedCapacity).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="inverterPower" label="逆变器发电量(kWh)" width="160" align="right">
          <template #default="{ row }">
            {{ Number(row.inverterPower).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="eqe" label="等价发电时(h)" width="120" align="right">
          <template #default="{ row }">
            {{ row.eqe.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="avgEqe" label="平均等价发电时(h)" width="150" align="right">
          <template #default="{ row }">
            {{ row.avgEqe.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="differenceEqe" label="等价发电时偏差(h)" width="160" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.differenceEqe < 0 ? '#F56C6C' : '' }">
              {{ row.differenceEqe.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="ratioEqePrecent" label="差值比例" width="100" align="right">
          <template #default="{ row }">
            <span :style="{ color: getRatioColor(row.ratioEqe) }">
              {{ row.ratioEqePrecent }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeft, ArrowRight, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import { getDiscreteOutputData } from '@/api/analysis/discreteOutput'
import type { TimeType, DeviceDetail, OverviewData } from '@/api/types/analysis/discreteOutput'

// 状态
const selectedStationId = ref('')
const timeType = ref<TimeType>('month')
const queryDate = ref(dayjs().format('YYYY-MM-DD'))

// 移动端检测
const isMobile = ref(false)
const tableData = ref<DeviceDetail[]>([])
const overviewData = ref<OverviewData>({
  n_20: 0,
  n_20_n_10: 0,
  n_10_p_10: 0,
  p_10_p_20: 0,
  p_20: 0,
  total: 0
})
const loading = ref(false)
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 日期选择器类型
const datePickerType = computed(() => {
  const typeMap: Record<TimeType, 'date' | 'month' | 'year'> = {
    day: 'date',
    month: 'month',
    year: 'year'
  }
  return typeMap[timeType.value]
})

// 日期格式
const dateFormat = computed(() => {
  const formatMap: Record<TimeType, string> = {
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY'
  }
  return formatMap[timeType.value]
})

// 获取差值比例颜色
function getRatioColor(ratio: number): string {
  if (ratio < -20) return '#F56C6C'
  if (ratio < -10) return '#FFA500'
  if (ratio <= 10) return '#67C23A'
  if (ratio <= 20) return '#FFD700'
  return '#E74C3C'
}

// 电站选择
function handleStationSelect(node: any) {
  // 通用 StationTree 叶子节点无 childList
  if (!node.childList || node.childList.length === 0) {
    selectedStationId.value = node.regionId
    fetchData()
  }
}

// 时间类型切换
function handleTimeTypeChange() {
  // 调整日期为对应粒度的当前值
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

// 上一个日期
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

// 下一个日期
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

// 获取数据
async function fetchData() {
  if (!selectedStationId.value) return

  loading.value = true
  try {
    // 转换时间类型
    const dateTypeMap: Record<TimeType, number> = {
      day: 0,
      month: 1,
      year: 2
    }

    // 格式化查询时间
    const current = dayjs(queryDate.value)
    let formattedTime = ''
    if (timeType.value === 'day') {
      formattedTime = current.format('YYYY-MM-DD')
    } else if (timeType.value === 'month') {
      formattedTime = current.format('YYYY-MM')
    } else {
      formattedTime = current.format('YYYY')
    }

    const params = {
      regionId: selectedStationId.value,
      dateType: dateTypeMap[timeType.value],
      queryTime: formattedTime
    }

    const response = await getDiscreteOutputData(params)
    
    if (response.code === 200) {
      overviewData.value = {
        n_20: response.data.n_20,
        n_20_n_10: response.data.n_20_n_10,
        n_10_p_10: response.data.n_10_p_10,
        p_10_p_20: response.data.p_10_p_20,
        p_20: response.data.p_20,
        total: response.data.total
      }
      tableData.value = response.data.inverterCapacity
      updateChart()
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 更新图表
function updateChart() {
  if (!chartRef.value) return
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const option = {
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
    series: [
      {
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
          { 
            value: overviewData.value.n_20, 
            name: '<-20% 严重偏低', 
            itemStyle: { color: '#F56C6C' } 
          },
          { 
            value: overviewData.value.n_20_n_10, 
            name: '-20%~-10% 偏低', 
            itemStyle: { color: '#FFA500' } 
          },
          { 
            value: overviewData.value.n_10_p_10, 
            name: '-10%~+10% 正常', 
            itemStyle: { color: '#67C23A' } 
          },
          { 
            value: overviewData.value.p_10_p_20, 
            name: '+10%~+20% 偏高', 
            itemStyle: { color: '#FFD700' } 
          },
          { 
            value: overviewData.value.p_20, 
            name: '>+20% 严重偏高', 
            itemStyle: { color: '#E74C3C' } 
          }
        ].filter((item) => item.value > 0)
      }
    ],
    graphic: {
      type: 'text',
      left: isMobile.value ? '50%' : '38%',
      top: isMobile.value ? '55%' : '45%',
      style: {
        text: `${overviewData.value.total}\n总台数`,
        fontSize: isMobile.value ? 20 : 28,
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#fff'
      },
      z: 100
    }
  }

  chartInstance.setOption(option)
}

// 导出数据
async function handleExport() {
  if (!selectedStationId.value) {
    ElMessage.warning('请先选择电站')
    return
  }
  
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
  console.log('Export data:', tableData.value)
}

// 窗口大小变化处理
function handleResize() {
  if (chartInstance) {
    setTimeout(() => {
      chartInstance?.resize()
    }, 100)
  }
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

// 组件挂载
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

// 组件卸载
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
</style>
