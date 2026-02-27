<template>
  <DeviceMonitorLayout>
    <!--左侧电站树 -->
    <template #left>
      <StationTree 
        @node-click="handleStationChange" 
        :auto-select-first-leaf="true"
      />
    </template>

    <!-- 右侧内容区 -->
    <template #right>
      <div class="downtime-content">
        <!-- 顶部控制区 -->
        <div class="control-bar">
          <div class="left-controls">
            <!-- 时间维度tabs -->
            <div class="time-tabs">
              <div 
                v-for="tab in timeDimensionOptions"
                :key="tab.value"
                :class="['tab-item', { active: queryParams.timeDimension === tab.value }]"
                @click="handleTimeDimensionChange(tab.value)"
              >
                {{ tab.label }}
              </div>
            </div>

            <!-- 时间选择器 -->
            <div class="time-controls">
              <el-button :icon="ArrowLeft" circle size="small" @click="handlePrevPeriod" />
              <el-date-picker
                v-if="queryParams.timeDimension === 'month'"
                v-model="selectedMonth"
                type="month"
                placeholder="选择月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                @change="handleMonthChange"
                class="time-picker"
              />
              <el-date-picker
                v-else-if="queryParams.timeDimension === 'year'"
                v-model="selectedYear"
                type="year"
                placeholder="选择年份"
                format="YYYY"
                value-format="YYYY"
                @change="handleYearChange"
                class="time-picker"
              />
              <el-date-picker
                v-else
                v-model="customDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleCustomDateChange"
                class="time-picker"
              />
              <el-button :icon="ArrowRight" circle size="small" @click="handleNextPeriod" />
            </div>

            <!-- 选择逆变器 -->
            <el-select
              v-model="selectedInverter"
              placeholder="选择逆变器"
              clearable
              class="inverter-select"
            >
              <el-option label="全部" value="" />
            </el-select>

            <!-- 刷新按钮 -->
            <el-button :icon="Refresh" circle @click="loadData" />
          </div>

          <div class="right-controls">
            <!-- 图表切换按钮 -->
            <el-button 
              :type="currentChart === 'reason' ? 'primary' : ''"
              @click="currentChart = 'reason'"
            >
              原因分析
            </el-button>
            <el-button 
              :type="currentChart === 'time' ? 'primary' : ''"
              @click="currentChart = 'time'"
            >
              时间分析
            </el-button>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-section">
          <div class="stat-item">
            <span class="label">停运损失电量</span>
            <span class="value">{{ statistics?.summary.lossEnergy.toFixed(1) }} kWh</span>
          </div>
          <div class="stat-item">
            <span class="label">停运损失收益</span>
            <span class="value">{{ statistics?.summary.lossRevenue.toFixed(2) }} 元</span>
          </div>
          <div class="stat-item">
            <span class="label">运行可利用率</span>
            <span class="value">{{ statistics?.summary.availabilityRate.toFixed(2) }}%</span>
          </div>
    </div>

        <!-- 图表区域 -->
        <div class="chart-section">
          <div 
            v-show="currentChart === 'time'"
            ref="timeChartRef" 
            class="chart-container"
          ></div>
          <div 
            v-show="currentChart === 'reason'"
            ref="reasonChartRef" 
            class="chart-container"
          ></div>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
          <div class="table-header">
            <span class="table-title">停运事件</span>
            <el-button size="small" @click="handleExport">导出</el-button>
          </div>

          <el-table
            :data="eventList"
            v-loading="loading"
            border
            height="300"
            class="event-table"
          >
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="stationName" label="电站名称" min-width="120" />
            <el-table-column 
              label="停运设备" 
              min-width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-button 
                  type="text" 
                  class="device-name-link"
                  @click="handleDeviceDetail(row)"
                >
                  {{ row.deviceName }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" min-width="150" />
            <el-table-column prop="endTime" label="结束时间" min-width="150" />
            <el-table-column prop="duration" label="考核停运时长" min-width="120" />
            <el-table-column prop="lossEnergy" label="损失电量(kWh)" min-width="120" align="right">
              <template #default="{ row }">
                {{ row.lossEnergy.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="lossRevenue" label="损失收益(元)" min-width="120" align="right">
              <template #default="{ row }">
                {{ row.lossRevenue.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="停运原因" min-width="120" />
            <el-table-column label="备注" min-width="80">
              <template #default="{ row }">
                {{ row.remark || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEdit(row)">
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.pageSize"
              :total="pagination.total"
              :page-sizes="[20, 50, 100]"
              :layout="paginationLayout"
              :pager-count="isMobile ? 3 : 7"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
      </div>
    </div>
  </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 编辑弹窗 -->
  <EditDowntimeDialog
    v-model="editDialogVisible"
    :event="currentEvent"
    @confirm="handleEditConfirm"
  />

  <!-- 设备详情弹窗 -->
  <DeviceDetailDialog
    v-model:visible="deviceDetailVisible"
    :device-id="selectedDeviceId"
    :device-name="selectedDeviceName"
    @device-change="handleDeviceChange"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, onBeforeUnmount, watch, computed } from 'vue'
import { ArrowLeft, ArrowRight, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import EditDowntimeDialog from './components/EditDowntimeDialog.vue'
import DeviceDetailDialog from '../device-detail/DeviceDetailDialog.vue'
import {
  getDowntimeStatistics,
  getDowntimeEventList,
  updateDowntimeEvent
} from '@/api/diagnosis/downtime'
import type {
  DowntimeStatistics,
  DowntimeEvent
} from '@/api/types/diagnosis/downtime'
import { downloadExcel } from '@/utils/download'

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const loading = ref(false)
const statistics = ref<DowntimeStatistics>()
const eventList = ref<DowntimeEvent[]>([])

// 时间维度选项
const timeDimensionOptions = [
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
  { label: '自定义', value: 'custom' }
]

// 查询参数
const queryParams = reactive({
  stationId: '',
  timeDimension: 'month',
  month: dayjs().format('YYYY-MM'),
  page: 1,
  pageSize: 20
})

const selectedMonth = ref(dayjs().format('YYYY-MM'))
const selectedYear = ref(dayjs().format('YYYY'))
const customDateRange = ref<[string, string]>()
const selectedInverter = ref('')

// 当前显示的图表
const currentChart = ref<'time' | 'reason'>('time')

// 分页信息
const pagination = reactive({
  total: 0,
  totalPages: 0
})

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value 
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

// 图表实例
const timeChartRef = ref<HTMLElement>()
const reasonChartRef = ref<HTMLElement>()
let timeChart: echarts.ECharts | null = null
let reasonChart: echarts.ECharts | null = null

// Resize处理函数
const handleTimeChartResize = () => timeChart?.resize()
const handleReasonChartResize = () => reasonChart?.resize()

// 编辑弹窗
const editDialogVisible = ref(false)
const currentEvent = ref<DowntimeEvent>()

// 设备详情弹窗
const deviceDetailVisible = ref(false)
const selectedDeviceId = ref<string>('')
const selectedDeviceName = ref<string>('')

/**
 * 处理电站切换
 */
const handleStationChange = async (data: any) => {
  if (!data || !data.regionId) return
  if (data.childList && data.childList.length > 0) return
  
  queryParams.stationId = data.regionId
  queryParams.page = 1
  await loadData()
}

/**
 * 处理时间维度切换
 */
const handleTimeDimensionChange = (dimension: string) => {
  queryParams.timeDimension = dimension
  queryParams.page = 1
  loadData()
}

/**
 * 处理上一个时间段
 */
const handlePrevPeriod = () => {
  if (queryParams.timeDimension === 'month') {
    selectedMonth.value = dayjs(selectedMonth.value).subtract(1, 'month').format('YYYY-MM')
    queryParams.month = selectedMonth.value
  } else if (queryParams.timeDimension === 'year') {
    selectedYear.value = dayjs(selectedYear.value).subtract(1, 'year').format('YYYY')
    queryParams.month = selectedYear.value
  }
  queryParams.page = 1
  loadData()
}

/**
 * 处理下一个时间段
 */
const handleNextPeriod = () => {
  if (queryParams.timeDimension === 'month') {
    selectedMonth.value = dayjs(selectedMonth.value).add(1, 'month').format('YYYY-MM')
    queryParams.month = selectedMonth.value
  } else if (queryParams.timeDimension === 'year') {
    selectedYear.value = dayjs(selectedYear.value).add(1, 'year').format('YYYY')
    queryParams.month = selectedYear.value
  }
  queryParams.page = 1
  loadData()
}

/**
 * 处理月份变化
 */
const handleMonthChange = () => {
  queryParams.month = selectedMonth.value
  queryParams.page = 1
  loadData()
}

/**
 * 处理年份变化
 */
const handleYearChange = () => {
  queryParams.month = selectedYear.value
  queryParams.page = 1
  loadData()
}

/**
 * 处理自定义日期变化
 */
const handleCustomDateChange = () => {
  if (customDateRange.value) {
    queryParams.month = customDateRange.value.join(',')
    queryParams.page = 1
    loadData()
  }
}

/**
 * 加载数据
 */
const loadData = async () => {
  if (!queryParams.stationId) return
  
  loading.value = true
  try {
    const [statsData, eventsData] = await Promise.all([
      getDowntimeStatistics(queryParams),
      getDowntimeEventList(queryParams)
    ])
    
    statistics.value = statsData
    eventList.value = eventsData.events
    pagination.total = eventsData.pagination.total
    pagination.totalPages = eventsData.pagination.totalPages
    
    await nextTick()
    initCharts()
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 初始化图表
 */
const initCharts = () => {
  if (!statistics.value) return
  
  // 初始化时间分析图表
  if (timeChartRef.value) {
    if (!timeChart) {
      timeChart = echarts.init(timeChartRef.value)
      window.addEventListener('resize', handleTimeChartResize)
    }
    
    const timeOption: EChartsOption = {
      grid: {
        left: '3%',
        right: '3%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: statistics.value.timeAnalysis.categories,
        axisLabel: {
          fontSize: 12,
          color: '#a3a3a3'
        },
        axisLine: {
          lineStyle: {
            color: '#2a5c8f'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 12,
          color: '#a3a3a3',
          formatter: '{value}kWh'
        },
        axisLine: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#2a5c8f',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: statistics.value.timeAnalysis.lossEnergy,
          barWidth: '40%',
          itemStyle: {
            color: '#00D4FF'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}kWh',
            color: '#fff',
            fontSize: 11
          }
        }
      ],
      dataZoom: [
        {
          type: 'slider',
          show: true,
          start: 0,
          end: 100,
          height: 20,
          bottom: 10,
          borderColor: '#2a5c8f',
          fillerColor: 'rgba(0, 212, 255, 0.2)',
          handleStyle: {
            color: '#00D4FF'
          },
          textStyle: {
            color: '#a3a3a3'
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00D4FF',
        textStyle: {
          color: '#fff'
        }
      }
    }
    
    timeChart.setOption(timeOption)
  }
  
  // 初始化原因分析图表
  if (reasonChartRef.value) {
    if (!reasonChart) {
      reasonChart = echarts.init(reasonChartRef.value)
      window.addEventListener('resize', handleReasonChartResize)
    }
    
    const reasonOption: EChartsOption = {
      grid: {
        left: '3%',
        right: '3%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: statistics.value.reasonAnalysis.categories,
        axisLabel: {
          fontSize: 12,
          color: '#a3a3a3',
          rotate: 0,
          interval: 0,
          formatter: (value: string) => {
            return value.length > 6 ? value.substring(0, 6) + '...' : value
          }
        },
        axisLine: {
          lineStyle: {
            color: '#2a5c8f'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 12,
          color: '#a3a3a3',
          formatter: '{value}kWh'
        },
        axisLine: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#2a5c8f',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: statistics.value.reasonAnalysis.lossEnergy,
          barWidth: '40%',
          itemStyle: {
            color: '#00D4FF'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}kWh',
            color: '#fff',
            fontSize: 11
          }
        }
      ],
      dataZoom: [
        {
          type: 'slider',
          show: true,
          start: 0,
          end: 100,
          height: 20,
          bottom: 10,
          borderColor: '#2a5c8f',
          fillerColor: 'rgba(0, 212, 255, 0.2)',
          handleStyle: {
            color: '#00D4FF'
          },
          textStyle: {
            color: '#a3a3a3'
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00D4FF',
        textStyle: {
          color: '#fff'
        }
      }
    }
    
    reasonChart.setOption(reasonOption)
  }
}

// 监听图表切换，调整大小
watch(currentChart, async () => {
  await nextTick()
  timeChart?.resize()
  reasonChart?.resize()
})

/**
 * 处理分页
 */
const handlePageChange = () => {
  loadData()
}

const handlePageSizeChange = () => {
  queryParams.page = 1
  loadData()
}

/**
 * 处理编辑
 */
const handleEdit = (row: DowntimeEvent) => {
  currentEvent.value = { ...row }
  editDialogVisible.value = true
}

/**
 * 处理编辑确认
 */
const handleEditConfirm = async (event: DowntimeEvent) => {
  try {
    await updateDowntimeEvent(event)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Failed to update:', error)
    ElMessage.error('更新失败')
  }
}

/**
 * 处理设备详情
 */
const handleDeviceDetail = (event: DowntimeEvent) => {
  console.log('点击设备详情，传递数据:', event)
  selectedDeviceId.value = event.deviceId || event.deviceName // 使用设备名称作为ID如果没有deviceId
  selectedDeviceName.value = event.deviceName
  deviceDetailVisible.value = true
}

/**
 * 处理设备切换
 */
const handleDeviceChange = (deviceId: string) => {
  selectedDeviceId.value = deviceId
  // 这里可以根据需要更新设备名称
  const device = eventList.value.find(item => 
    (item.deviceId || item.deviceName) === deviceId
  )
  if (device) {
    selectedDeviceName.value = device.deviceName
  }
}

/**
 * 导出数据
 */
const handleExport = () => {
  const exportData = eventList.value.map((item, index) => ({
    '#': index + 1,
    '电站名称': item.stationName,
    '停运设备': item.deviceName,
    '开始时间': item.startTime,
    '结束时间': item.endTime,
    '考核停运时长': item.duration,
    '损失电量(kWh)': item.lossEnergy.toFixed(2),
    '损失收益(元)': item.lossRevenue.toFixed(2),
    '停运原因': item.reason
  }))
  
  downloadExcel(exportData, '停机诊断_停运事件')
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  // 图表会在数据加载后初始化
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

onBeforeUnmount(() => {
  if (timeChart) {
    window.removeEventListener('resize', handleTimeChartResize)
    timeChart.dispose()
    timeChart = null
  }
  if (reasonChart) {
    window.removeEventListener('resize', handleReasonChartResize)
    reasonChart.dispose()
    reasonChart = null
  }
})
</script>

<style scoped lang="scss">
.downtime-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
  padding: 16px;
}

.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 30, 60, 0.3);
  border-radius: 4px;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.time-tabs {
  display: flex;
  background: rgba(0, 60, 120, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.tab-item {
  padding: 8px 20px;
  font-size: 13px;
  color: #a3a3a3;
  cursor: pointer;
  transition: all 0.3s;
  border-right: 1px solid rgba(0, 212, 255, 0.2);

  &:last-child {
    border-right: none;
  }

  &:hover {
    color: #fff;
    background: rgba(0, 212, 255, 0.1);
  }

  &.active {
    color: #fff;
    background: #00D4FF;
  }
}

.time-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-picker {
  width: 140px;
}

.inverter-select {
  width: 140px;
}

.right-controls {
  display: flex;
  gap: 8px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background: rgba(0, 30, 60, 0.3);
  border-radius: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .label {
    font-size: 13px;
    color: #fff;
  }

  .value {
    font-size: 20px;
    font-weight: bold;
    color: #FFB84D;
  }
}

.chart-section {
  flex: 1;
  min-height: 350px;
  background: rgba(0, 30, 60, 0.3);
  border-radius: 4px;
  padding: 12px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.table-section {
  display: flex;
  flex-direction: column;
  background: rgba(0, 30, 60, 0.3);
  border-radius: 4px;
  padding: 12px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-title {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

:deep(.el-table) {
  background: transparent;
  color: #d1d5db;

  th.el-table__cell {
    background: rgba(0, 60, 120, 0.4);
    color: #fff;
    font-weight: 500;
  }

  tr {
    background: transparent;

    &:hover > td {
      background: rgba(0, 212, 255, 0.05);
    }
  }

  td.el-table__cell {
    border-color: rgba(0, 212, 255, 0.1);
  }
}

:deep(.el-pagination) {
  .el-pagination__total {
    color: #a3a3a3;
  }

  .btn-prev,
  .btn-next,
  .el-pager li {
    background: rgba(0, 212, 255, 0.1);
    color: #a3a3a3;

    &:not(.disabled):hover {
      color: #00D4FF;
    }

    &.is-active {
      color: #00D4FF;
      background: rgba(0, 212, 255, 0.2);
    }
  }
}

// 设备名称链接样式
:deep(.device-name-link) {
  color: #00d4ff !important;
  font-weight: 500;
  
  &:hover {
    color: #0099cc !important;
    text-decoration: underline;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .downtime-content {
    padding: 12px;
    gap: 12px;

    .control-bar {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      padding: 12px;

      .left-controls {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        grid-template-areas: 
          "tabs"
          "controls"
          "actions";

        .time-tabs {
          grid-area: tabs;
          width: 100%;
          justify-content: flex-start;
          gap: 8px;

          .tab-item {
            font-size: 12px;
            padding: 6px 12px;
            min-width: 60px;
          }
        }

        .time-controls {
          grid-area: controls;
          width: 100%;
          justify-content: flex-start;
          gap: 8px;

          .time-picker {
            width: 150px;
          }

          .el-button {
            min-width: 32px;
          }
        }

        // 选择逆变器和刷新按钮在同一行
        .inverter-select {
          grid-area: actions;
          width: 150px;
          justify-self: start;
        }

        .el-button:last-child {
          grid-area: actions;
          justify-self: start;
          margin-left: 158px; // 150px + 8px gap
        }
      }

      .right-controls {
        width: 100%;
        justify-content: flex-start;
        gap: 8px;

        .el-button {
          min-width: 80px;
          font-size: 13px;
        }
      }
    }

    .statistics-section {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .stat-card {
          padding: 12px;

          .stat-value {
            font-size: 18px;
          }

          .stat-label {
            font-size: 11px;
          }
        }
      }
    }

    .charts-section {
      .chart-tabs {
        justify-content: center;
        margin-bottom: 12px;

        .chart-tab {
          font-size: 12px;
          padding: 6px 12px;
        }
      }

      .chart-container {
        height: 250px;
      }
    }

    .events-section {
      .section-header {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;

        .section-title {
          font-size: 14px;
          text-align: center;
        }

        .header-actions {
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;

          .el-button {
            flex: 1;
            min-width: 70px;
            font-size: 12px;
          }
        }
      }

      .events-table {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        :deep(.el-table) {
          min-width: 700px;
          font-size: 11px;

          .el-table__header {
            th {
              font-size: 12px;
              padding: 8px 4px;
            }
          }

          .el-table__body {
            td {
              padding: 8px 4px;
            }
          }
        }
      }

      .pagination {
        :deep(.el-pagination) {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          font-size: 12px;

          .el-pagination__total {
            font-size: 11px;
            flex-basis: 100%;
            text-align: center;
            margin-bottom: 6px;
          }

          .btn-prev,
          .btn-next {
            min-width: 32px;
            font-size: 11px;
            padding: 4px 8px;
          }

          .el-pager {
            li {
              min-width: 28px;
              height: 28px;
              line-height: 28px;
              font-size: 11px;
              margin: 0 2px;
            }
          }
        }
      }
    }
  }
}
</style>
