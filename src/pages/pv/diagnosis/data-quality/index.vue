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
      <div class="data-quality-content">
        <!-- 顶部控制区 -->
        <div class="control-bar">
          <el-select
            v-model="selectedDeviceType"
            placeholder="设备类型"
            clearable
            @change="handleDeviceTypeChange"
          >
            <el-option
              v-for="type in deviceTypes"
              :key="type.code"
              :label="type.name"
              :value="type.code"
            />
          </el-select>
          
          <div class="date-controls">
            <span class="label">时间</span>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
            />
            <el-button :icon="Refresh" circle @click="handleRefresh" />
          </div>
        </div>

        <!-- 诊断结果提示 -->
        <div class="diagnosis-result" v-if="statistics">
          <el-icon class="result-icon" color="#00D4FF">
            <InfoFilled />
          </el-icon>
          <span class="result-text">
            诊断结果：电站日数据质量质量评分为 
            <span class="highlight">{{ statistics.summary.qualityScore }}</span> 分，
            {{ statistics.summary.suggestion }}
          </span>
        </div>

        <!-- 图表区域 -->
        <div class="chart-container" v-loading="chartLoading">
          <div ref="chartRef" class="chart"></div>
        </div>

        <!-- 数据表格 -->
        <div class="table-container" v-loading="tableLoading">
          <el-table
            :data="deviceList"
            stripe
            style="width: 100%"
            height="calc(100% - 50px)"
          >
            <el-table-column prop="deviceType" label="设备类型" width="100" />
            <el-table-column 
              label="设备名称" 
              min-width="150"
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
            <el-table-column prop="qualityIndex" label="数据质量指数" width="140" sortable>
              <template #default="{ row }">
                <span :class="getQualityClass(row.qualityIndex)">
                  {{ row.qualityIndex }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="qualityRate" label="数据质量率(%)" width="140" sortable>
              <template #default="{ row }">
                {{ row.qualityRate }}%
              </template>
            </el-table-column>
            <el-table-column prop="commInterruptTime" label="通讯中断时长(h)" width="160" sortable>
              <template #default="{ row }">
                {{ row.commInterruptTime }}小时
              </template>
            </el-table-column>
            <el-table-column prop="dataMissingTime" label="数据缺失时长(h)" width="160" sortable>
              <template #default="{ row }">
                {{ row.dataMissingTime }}小时
              </template>
            </el-table-column>
            <el-table-column prop="dataAbnormalTime" label="数据异常时长(h)" width="160" sortable>
              <template #default="{ row }">
                {{ row.dataAbnormalTime }}小时
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleViewDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 设备详情弹窗 -->
  <DeviceDetailDialog
    v-model:visible="deviceDetailVisible"
    :device-id="selectedDeviceId"
    :device-name="selectedDeviceName"
    @device-change="handleDeviceChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Refresh, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import DeviceDetailDialog from '../device-detail/DeviceDetailDialog.vue'
import {
  getDataQualityStatistics,
  getDeviceDataQualityList,
  getDeviceTypeList
} from '@/api/diagnosis/dataQuality'
import type {
  DataQualityStatistics,
  DeviceDataQuality,
  DeviceType
} from '@/api/types/diagnosis/dataQuality'

// 当前选中的电站
const currentStationId = ref<string>('')

// 设备类型列表
const deviceTypes = ref<DeviceType[]>([])
const selectedDeviceType = ref<string>('')

// 日期选择
const selectedDate = ref<string>(dayjs().format('YYYY-MM-DD'))

// 统计数据
const statistics = ref<DataQualityStatistics | null>(null)

// 图表相关
const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null
const chartLoading = ref(false)

// 表格数据
const deviceList = ref<DeviceDataQuality[]>([])
const tableLoading = ref(false)

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 详情弹窗
const detailDialogVisible = ref(false)
const selectedDevice = ref<DeviceDataQuality | null>(null)

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
  
  currentStationId.value = data.regionId
  pagination.value.page = 1
  
  await loadDeviceTypes()
  await loadData()
}

/**
 * 加载设备类型列表
 */
const loadDeviceTypes = async () => {
  if (!currentStationId.value) return

  try {
    const response = await getDeviceTypeList(currentStationId.value)
    deviceTypes.value = response.deviceTypes
  } catch (error) {
    console.error('加载设备类型失败:', error)
  }
}

/**
 * 处理设备类型变化
 */
const handleDeviceTypeChange = () => {
  pagination.value.page = 1
  loadData()
}

/**
 * 处理日期变化
 */
const handleDateChange = () => {
  pagination.value.page = 1
  loadData()
}

/**
 * 刷新数据
 */
const handleRefresh = () => {
  loadData()
}

/**
 * 加载数据
 */
const loadData = async () => {
  if (!currentStationId.value) return

  await Promise.all([
    loadStatistics(),
    loadDeviceList()
  ])
}

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  chartLoading.value = true

  try {
    const response = await getDataQualityStatistics({
      stationId: currentStationId.value,
      deviceType: selectedDeviceType.value,
      date: selectedDate.value
    })

    statistics.value = response
    await nextTick()
    renderChart(response)
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    chartLoading.value = false
  }
}

/**
 * 加载设备列表
 */
const loadDeviceList = async () => {
  tableLoading.value = true

  try {
    const response = await getDeviceDataQualityList({
      stationId: currentStationId.value,
      deviceType: selectedDeviceType.value,
      date: selectedDate.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })

    deviceList.value = response.devices
    pagination.value.total = response.pagination.total
  } catch (error) {
    console.error('加载设备列表失败:', error)
    ElMessage.error('加载设备列表失败')
  } finally {
    tableLoading.value = false
  }
}

/**
 * 渲染图表
 */
const renderChart = (data: DataQualityStatistics) => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['设备数', '数据质量指数'],
      textStyle: {
        color: '#fff',
        fontSize: 10
      },
      itemWidth: 16,
      itemHeight: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.chartData.categories,
      axisLine: {
        lineStyle: {
          color: '#4A90E2'
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 10
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '设备数量',
        nameTextStyle: {
          fontSize: 10
        },
        position: 'left',
        axisLine: {
          lineStyle: {
            color: '#4A90E2'
          }
        },
        axisLabel: {
          color: '#fff',
          formatter: '{value}台',
          fontSize: 10
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(74, 144, 226, 0.2)'
          }
        }
      },
      {
        type: 'value',
        name: '数据质量指数',
        nameTextStyle: {
          fontSize: 10
        },
        position: 'right',
        axisLine: {
          lineStyle: {
            color: '#4A90E2'
          }
        },
        axisLabel: {
          color: '#fff',
          formatter: '{value}%',
          fontSize: 10
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '设备数',
        type: 'bar',
        data: data.chartData.deviceCounts.map((value, index) => ({
          value,
          itemStyle: {
            color: index === data.chartData.categories.length - 1 ? '#52c41a' : '#4A90E2'
          }
        })),
        barWidth: '12%'
      },
      {
        name: '数据质量指数',
        type: 'line',
        yAxisIndex: 1,
        data: data.chartData.qualityRates,
        smooth: true,
        itemStyle: {
          color: '#00D4FF'
        },
        lineStyle: {
          color: '#00D4FF',
          width: 2
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

/**
 * 获取质量指数样式类
 */
const getQualityClass = (index: number) => {
  if (index >= 95) return 'quality-excellent'
  if (index >= 85) return 'quality-good'
  if (index >= 75) return 'quality-normal'
  if (index >= 65) return 'quality-bad'
  return 'quality-poor'
}

/**
 * 查看设备详情
 */
const handleViewDetail = (device: DeviceDataQuality) => {
  selectedDevice.value = device
  detailDialogVisible.value = true
}

/**
 * 处理设备详情
 */
const handleDeviceDetail = (device: DeviceDataQuality) => {
  console.log('点击设备详情，传递数据:', device)
  selectedDeviceId.value = device.deviceId || device.deviceName // 使用设备名称作为ID如果没有deviceId
  selectedDeviceName.value = device.deviceName
  deviceDetailVisible.value = true
}

/**
 * 处理设备切换
 */
const handleDeviceChange = (deviceId: string) => {
  selectedDeviceId.value = deviceId
  // 这里可以根据需要更新设备名称
  const device = deviceList.value.find(item => 
    (item.deviceId || item.deviceName) === deviceId
  )
  if (device) {
    selectedDeviceName.value = device.deviceName
  }
}

/**
 * 处理页码变化
 */
const handlePageChange = () => {
  loadDeviceList()
}

/**
 * 处理每页大小变化
 */
const handleSizeChange = () => {
  pagination.value.page = 1
  loadDeviceList()
}

/**
 * 窗口大小变化时调整图表
 */
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.data-quality-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;

  .date-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;

    .label {
      color: #fff;
      font-size: 14px;
    }
  }
}

.diagnosis-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 4px;
  border-left: 4px solid #00D4FF;

  .result-icon {
    font-size: 24px;
  }

  .result-text {
    color: #fff;
    font-size: 14px;
    line-height: 1.6;

    .highlight {
      color: #00D4FF;
      font-weight: 600;
      margin: 0 4px;
    }
  }
}

.chart-container {
  flex: 6;
  min-height: 240px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;

  .chart {
    width: 100%;
    height: 100%;
  }
}

.table-container {
  flex: 4;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  overflow: hidden;

  .quality-excellent {
    color: #52c41a;
    font-weight: 600;
  }

  .quality-good {
    color: #1890ff;
    font-weight: 600;
  }

  .quality-normal {
    color: #faad14;
    font-weight: 600;
  }
  
  .quality-bad {
    color: #ff7875;
    font-weight: 600;
  }

  .quality-poor {
    color: #f5222d;
    font-weight: 600;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
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
</style>




