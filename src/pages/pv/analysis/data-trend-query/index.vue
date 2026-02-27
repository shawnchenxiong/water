<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <div style="padding: 10px; color: #fff;">
        <el-input v-model="treeSearch" placeholder="搜索监测点" clearable style="margin-bottom: 15px;" />
        <el-tree
          :data="dummyStations"
          :props="{ label: 'name', children: 'children' }"
          @node-click="handleStationSelect"
          style="background: transparent; color: #fff;"
        />
      </div>
    </template>

    <!-- 右侧内容区 -->
    <template #right>
      <div class="content-container">
        <!-- 顶部控制栏 -->
        <div class="control-bar">
          <div class="left-controls">
            <!-- 时间粒度 -->
            <el-radio-group v-model="timeType" size="default" @change="handleTimeTypeChange">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
              <el-radio-button label="history">历史查询</el-radio-button>
            </el-radio-group>

            <!-- 日期选择 -->
            <div v-if="timeType !== 'total'" class="date-picker-wrapper">
              <el-button v-if="timeType !== 'history'" :icon="ArrowLeft" circle @click="handlePrevDate" />
                <el-date-picker
                  v-if="timeType === 'history'"
                  v-model="dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD HH:00"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 0, 0)]"
                  @change="handleDateChange"
                />
              <el-date-picker
                v-else
                v-model="selectedDate"
                :type="datePickerType"
                :format="dateFormat"
                :placeholder="datePlaceholder"
                :disabled-date="disabledDate"
                @change="handleDateChange"
              />
              <el-button v-if="timeType !== 'history'" :icon="ArrowRight" circle @click="handleNextDate" />
            </div>
          </div>

          <div class="right-controls">
            <!-- 图表类型 -->
            <el-radio-group v-model="chartType" size="default" @change="handleChartTypeChange">
              <el-radio-button label="curve">发电曲线</el-radio-button>
              <el-radio-button label="power">分时电量</el-radio-button>
            </el-radio-group>

            <!-- 刷新 -->
            <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="summary-info">
          <div class="info-item">
            <span class="label">{{ summaryLabel }}发电量</span>
            <span class="value highlight">{{ formatNumber(summary.dailyEnergy) }}</span>
            <span class="unit">kWh</span>
          </div>
          <div class="info-item">
            <span class="label">{{ summaryLabel }}等效小时</span>
            <span class="value highlight">{{ formatNumber(summary.dailyHours) }}</span>
            <span class="unit">h</span>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-wrapper">
          <PowerChart ref="powerChartRef" :option="chartOption" :loading="chartLoading" />
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <div class="table-header">
            <el-button type="primary" @click="handleExport" :loading="exportLoading">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>

          <el-table
            :data="tableData"
            stripe
            :max-height="500"
            v-loading="loading"
            :header-cell-style="headerCellStyle"
            :cell-style="cellStyle"
          >
            <el-table-column prop="stationName" label="电站名称" width="200" fixed />
            <el-table-column prop="time" label="时间" width="180" />
            
            <!-- 发电曲线模式的列 -->
            <template v-if="chartType === 'curve'">
              <el-table-column :label="energyColumnLabel" width="150" align="right">
                <template #default="{ row }">
                  {{ formatNumber(row.dailyEnergy) }}
                </template>
              </el-table-column>
              <el-table-column prop="power" label="发电功率(kW)" width="130" align="right">
                <template #default="{ row }">
                  {{ formatNumber(row.power) }}
                </template>
              </el-table-column>
              <el-table-column prop="radiation" label="瞬时辐照(W/m²)" width="150" align="right" />
            </template>
          
            <!-- 分时电量模式的列 -->
            <template v-else>
              <el-table-column label="小时发电量(kWh)" width="150" align="right">
                <template #default="{ row }">
                  {{ formatNumber(row.hourlyEnergy) }}
                </template>
              </el-table-column>
            </template>
          
            <el-table-column prop="weather" label="电站天气" width="100" align="center" />
            <el-table-column prop="temperature" label="温度(°C)" width="100" align="right" />
            <el-table-column prop="windSpeed" label="风速(km/h)" width="110" align="right" />
          </el-table>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Refresh, Download } from '@element-plus/icons-vue'
import { downloadBlobFile, generateTimestampFilename } from '@/utils/download'
import dayjs from 'dayjs'
import type { EChartsOption } from 'echarts'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import PowerChart from './components/PowerChart.vue'
import { exportTrendData } from '@/api/analysis/powerTrend'
import type {
  TimeType,
  ChartType,
  SummaryData,
  ChartData,
  TableRow,
  CurveChartData,
  PowerChartData
} from '@/api/types/analysis/powerTrend'

// 状态
const selectedStationId = ref<string>('')
const treeSearch = ref('')
const timeType = ref<TimeType | 'history'>('day')
const selectedDate = ref<Date>(new Date())
const dateRange = ref<[Date, Date]>([
  new Date(Date.now() - 3600 * 1000 * 24 * 7), 
  new Date()
])
const chartType = ref<ChartType>('curve')
const summary = ref<SummaryData>({ dailyEnergy: 0, dailyHours: 0, updateTime: '' })
const chartData = ref<ChartData>({ time: [], power: [], radiation: [] } as CurveChartData)
const tableData = ref<TableRow[]>([])
const loading = ref(false)
const chartLoading = ref(false)
const exportLoading = ref(false)

// 移动端检测
const isMobile = ref(false)
const powerChartRef = ref()

// 计算属性
const datePickerType = computed<'date' | 'month' | 'year'>(() => {
  const typeMap: Record<Exclude<TimeType | 'history', 'total'>, 'date' | 'month' | 'year' | undefined> = {
    day: 'date',
    month: 'month',
    year: 'year',
    history: undefined
  }
  return typeMap[timeType.value as Exclude<TimeType, 'total'>] || 'date'
})

const dateFormat = computed(() => {
  const formatMap: Record<any, string> = {
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
    total: '',
    history: ''
  }
  return formatMap[timeType.value]
})

const datePlaceholder = computed(() => {
  const placeholderMap: Record<any, string> = {
    day: '选择日期',
    month: '选择月份',
    year: '选择年份',
    total: '',
    history: ''
  }
  return placeholderMap[timeType.value]
})

// 由于按钮改为图标按钮，不再需要文字标签

const summaryLabel = computed(() => {
  const labelMap: Record<any, string> = {
    day: '当日',
    month: '当月',
    year: '当年',
    total: '总计',
    history: '范围'
  }
  return labelMap[timeType.value]
})

const energyColumnLabel = computed(() => {
  const labelMap: Record<any, string> = {
    day: '当日发电量(kWh)',
    month: '当月发电量(kWh)',
    year: '当年发电量(kWh)',
    total: '总发电量(kWh)',
    history: '范围发电量(kWh)'
  }
  return labelMap[timeType.value]
})

const chartOption = computed<EChartsOption>(() => {
  return chartType.value === 'curve' ? getCurveChartOption() : getPowerChartOption()
})

// 图表配置
function getCurveChartOption(): EChartsOption {
  const data = chartData.value as CurveChartData
  // 响应式边距设置
  const gridConfig = isMobile.value 
    ? { left: '15%', right: '15%', top: '70px', bottom: '40px' }
    : { left: '60px', right: '60px', top: '60px', bottom: '40px' }
  
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      axisPointer: { type: 'cross' }
    },
    toolbox: {
      show: true,
      itemSize: 0,
      feature: {
        dataZoom: { yAxisIndex: 'none' }
      }
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, height: 20, bottom: 10, borderColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.1)' }
    ],
    legend: {
      data: ['发电功率', '瞬时辐照'],
      textStyle: { color: 'rgba(255, 255, 255, 0.85)' },
      top: 10
    },
    grid: gridConfig,
    xAxis: {
      type: 'category',
      data: data.time,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: isMobile.value ? 10 : 12 }
    },
    yAxis: [
      {
        type: 'value',
        name: '功率 (kW)',
        position: 'left',
        axisLine: { show: true, lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: isMobile.value ? 10 : 12 },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)', type: 'dashed' } }
      },
      {
        type: 'value',
        name: '辐照 (W/m²)',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: 'rgba(255, 165, 0, 0.5)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: isMobile.value ? 10 : 12 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '发电功率',
        type: 'line',
        data: data.power,
        smooth: true,
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: { color: '#FFD700', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 215, 0, 0.6)' },
              { offset: 1, color: 'rgba(255, 215, 0, 0.05)' }
            ]
          }
        }
      },
      {
        name: '瞬时辐照',
        type: 'line',
        yAxisIndex: 1,
        data: data.radiation,
        smooth: true,
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: { color: '#FF8C00', width: 2 }
      }
    ]
  }
}

function getPowerChartOption(): EChartsOption {
  const data = chartData.value as PowerChartData
  // 响应式边距设置
  const gridConfig = isMobile.value 
    ? { left: '15%', right: '10%', top: '40px', bottom: '50px' }
    : { left: '60px', right: '40px', top: '40px', bottom: '60px' }
  
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' }
    },
    toolbox: {
      show: true,
      itemSize: 0,
      feature: {
        dataZoom: { yAxisIndex: 'none' }
      }
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, height: 20, bottom: 5, borderColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.1)' }
    ],
    grid: gridConfig,
    xAxis: {
      type: 'category',
      data: data.time,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: isMobile.value ? 10 : 12, rotate: timeType.value === 'day' ? 45 : 0 }
    },
    yAxis: {
      type: 'value',
      name: '电量 (kWh)',
      axisLine: { show: true, lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: isMobile.value ? 10 : 12 },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)', type: 'dashed' } }
    },
    series: [
      {
        name: '分时电量',
        type: 'bar',
        data: data.energy,
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.3)' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
}

// 表格样式
const headerCellStyle = {
  background: 'rgba(0, 212, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.85)',
  borderColor: 'rgba(0, 212, 255, 0.2)'
}

const cellStyle = {
  borderColor: 'rgba(0, 212, 255, 0.1)'
}

// 工具函数
function formatNumber(value: number): string {
  if (typeof value !== 'number') return '-'
  return value.toFixed(2)
}

function formatDate(date: Date, type: TimeType): string {
  const formatMap: Record<TimeType, string> = {
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
    total: ''
  }
  return dayjs(date).format(formatMap[type])
}

function disabledDate(time: Date): boolean {
  return time.getTime() > Date.now()
}


function handleTimeTypeChange() {
  if (selectedStationId.value) {
    fetchTrendData()
  }
}

function handleDateChange() {
  if (timeType.value === 'history' && dateRange.value && dateRange.value.length === 2) {
    // Force hours to whole hours
    const start = new Date(dateRange.value[0])
    start.setMinutes(0, 0, 0)
    const end = new Date(dateRange.value[1])
    end.setMinutes(0, 0, 0)
    dateRange.value = [start, end]
  }
  if (selectedStationId.value) {
    fetchTrendData()
  }
}

function handlePrevDate() {
  const unitMap: Record<any, any> = { day: 'day', month: 'month', year: 'year', total: '', history: '' }
  selectedDate.value = dayjs(selectedDate.value).subtract(1, unitMap[timeType.value]).toDate()
  handleDateChange()
}

function handleNextDate() {
  const unitMap: Record<any, any> = { day: 'day', month: 'month', year: 'year', total: '', history: '' }
  const nextDate = dayjs(selectedDate.value).add(1, unitMap[timeType.value]).toDate()
  if (nextDate.getTime() > Date.now()) {
    ElMessage.warning('不能选择未来日期')
    return
  }
  selectedDate.value = nextDate
  handleDateChange()
}

function handleChartTypeChange() {
  // 切换图表类型
}

function handleRefresh() {
  if (!selectedStationId.value) {
    ElMessage.warning('请先选择电站')
    return
  }
  fetchTrendData()
}

async function handleExport() {
  if (!selectedStationId.value) {
    ElMessage.warning('请先选择电站')
    return
  }
  exportLoading.value = true
  try {
    const blob = await exportTrendData({
      stationIds: [selectedStationId.value],
      timeType: timeType.value as any,
      date: timeType.value === 'history' ? formatDate(dateRange.value[0], 'day' as any) : formatDate(selectedDate.value, timeType.value as any),
      chartType: chartType.value
    })
    // 使用工具函数下载文件
    const filename = generateTimestampFilename('发电趋势分析')
    downloadBlobFile(blob, `${filename}.xlsx`)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// 事件处理
const handleStationSelect = (node: any) => {
  selectedStationId.value = node.regionId || node.id;
  fetchTrendData();
};

// 模拟树组件数据
const dummyStations = ref([
  {
    name: '工艺流程',
    children: [
      { id: 'station1', name: '预处理' },
      { id: 'station2', name: 'I段AAO' },
      { id: 'station3', name: '二沉池及出水' },
      { id: 'station4', name: '污泥脱水' },
      { id: 'station5', name: '高效沉淀池' },
      { id: 'station6', name: '反硝化深床滤池' },
      { id: 'station7', name: '加药系统' },
      { id: 'station8', name: 'II段AAO' },
      { id: 'station9', name: '鼓风机房' }
    ]
  }
])

// 数据请求

async function fetchTrendData() {
  loading.value = true
  chartLoading.value = true
  try {
    // 模拟构造多点数据
    const mockTime: string[] = []
    const mockPower: number[] = []
    const mockRadiation: number[] = []
    const baseVal = 100 + Math.random() * 200
    
    // Generate simple mock points
    let points = 24
    let current = dayjs().startOf('day')
    let timeConfig = { fmt: 'HH:00', scale: 1 }

    if (timeType.value === 'history' && dateRange.value) {
        const d1 = dayjs(dateRange.value[0]).startOf('hour')
        const d2 = dayjs(dateRange.value[1]).startOf('hour')
        const hours = Math.abs(d2.diff(d1, 'hour')) + 1
        points = Math.max(1, hours)
        current = d1
        // Make sure X-axis labels don't repeat for category axis when zooming across days!
        if (points > 24) timeConfig.fmt = 'MM-DD HH:00'
    } else if (timeType.value === 'day') {
        current = dayjs(selectedDate.value).startOf('day')
        timeConfig.fmt = 'HH:00'
    } else if (timeType.value === 'month') {
        points = dayjs(selectedDate.value).daysInMonth()
        current = dayjs(selectedDate.value).startOf('month')
        timeConfig.fmt = 'MM-DD'
        timeConfig.scale = 24
    } else if (timeType.value === 'year') {
        points = 12
        current = dayjs(selectedDate.value).startOf('year')
        timeConfig.fmt = 'YYYY-MM'
        timeConfig.scale = 24 * 30
    }
    
    for (let i = 0; i < points; i++) {
        mockTime.push(current.format(timeConfig.fmt))
        mockPower.push(parseFloat((baseVal + Math.random()*50).toFixed(2)))
        mockRadiation.push(parseFloat((Math.random()*1000).toFixed(2)))
        
        if (timeType.value === 'year') current = current.add(1, 'month')
        else if (timeType.value === 'month') current = current.add(1, 'day')
        else current = current.add(1, 'hour')
    }

    // Assign generic fake data
    summary.value = { dailyEnergy: 3450.2, dailyHours: 4.5, updateTime: '' }
    chartData.value = { time: mockTime, power: mockPower, radiation: mockRadiation } as unknown as CurveChartData
    
    const selectedStationName = dummyStations.value[0].children.find(c => c.id === selectedStationId.value)?.name || '预处理'
    
    tableData.value = mockTime.map((t, idx) => ({
        stationName: selectedStationName,
        time: t,
        dailyEnergy: parseFloat((Math.random()*100).toFixed(2)),
        power: mockPower[idx],
        radiation: mockRadiation[idx],
        hourlyEnergy: parseFloat((Math.random()*50).toFixed(2)),
        weather: '晴',
        temperature: 25,
        windSpeed: 10
    })) as unknown as TableRow[]
    
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
    chartLoading.value = false
  }
}

// 移动端检测函数
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  const wasChanged = isMobile.value !== newIsMobile
  isMobile.value = newIsMobile
  
  // 如果移动端状态改变了，需要重新渲染图表
  if (wasChanged && powerChartRef.value) {
    // 使用 nextTick 确保 DOM 更新后再调用 resize
    nextTick(() => {
      powerChartRef.value?.resize()
    })
  }
}

onMounted(() => {
  // 默认选中第一个
  if (dummyStations.value[0].children) {
    selectedStationId.value = dummyStations.value[0].children[0].id
    fetchTrendData()
  }
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
}

.control-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(10, 24, 45, 0.4);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  min-height: auto;
  
  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 10px;
  }

  :deep(.el-radio-group) {
    flex-shrink: 0;
    .el-radio-button__inner {
      background: rgba(10, 24, 45, 0.6);
      border-color: rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.85);
      &:hover {
        color: #00d4ff;
      }
    }
    .el-radio-button__original-radio:checked + .el-radio-button__inner {
      background: rgba(0, 212, 255, 0.3);
      border-color: #00d4ff;
      color: #00d4ff;
      box-shadow: -1px 0 0 0 #00d4ff;
    }
  }

  .date-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    :deep(.el-date-editor) {
      .el-input__wrapper {
        background: rgba(10, 24, 45, 0.6);
        border-color: rgba(0, 212, 255, 0.3);
        box-shadow: none;
        .el-input__inner {
          color: rgba(255, 255, 255, 0.85);
        }
        &:hover {
          border-color: rgba(0, 212, 255, 0.6);
        }
      }
    }
  }
}

.left-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  
  @media (max-width: 1200px) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
  
  .date-picker-wrapper {
    @media (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }
  }
}

.right-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 1;
  
  @media (max-width: 1200px) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
    
    .el-radio-group {
      flex: 1;
    }
    
    .el-button {
      flex-shrink: 0;
    }
  }
}

.summary-info {
  display: flex;
  gap: 48px;
  padding: 20px;
  background: rgba(10, 24, 45, 0.4);
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 24px;
    padding: 16px;
    justify-content: space-around;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
    justify-content: space-around;
  }

  .info-item {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex: 1;
    min-width: 200px;
    
    @media (max-width: 768px) {
      min-width: 150px;
      gap: 8px;
    }
    
    @media (max-width: 480px) {
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: auto;
    }

    .label {
      font-size: 16px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
      
      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
    .value {
      font-size: 32px;
      font-weight: 700;
      color: #00d4ff;
      text-shadow: 0 0 16px rgba(0, 212, 255, 0.5);
      
      @media (max-width: 768px) {
        font-size: 28px;
      }
      
      @media (max-width: 480px) {
        font-size: 24px;
      }
    }
    .unit {
      font-size: 16px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
      
      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
  }
}

.chart-wrapper {
  flex-shrink: 0;
  height: 460px;
  padding: 20px;
  background: rgba(10, 24, 45, 0.3);
  
  @media (max-width: 768px) {
    height: 300px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    height: 250px;
    padding: 12px;
  }
}

.table-container {
  flex-shrink: 0;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }

  .table-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
      justify-content: center;
      margin-bottom: 12px;
    }
  }

  :deep(.el-table) {
    background: rgba(10, 24, 45, 0.4);
    color: rgba(255, 255, 255, 0.85);

    .el-table__body tr.el-table__row--striped {
      background: rgba(10, 24, 45, 0.5);
    }

    .el-table__body tr:hover {
      background: rgba(0, 212, 255, 0.05);
    }
  }
}
</style>

