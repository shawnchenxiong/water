<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree 
        @node-click="handleStationChange" 
        :auto-select-first-leaf="true"
      />
    </template>

    <!-- 右侧内容区 -->
    <template #right>
      <div class="loss-diagnosis-content">
        <!-- 图表区域 -->
        <div class="chart-container" v-loading="chartLoading">
          <!-- 月份选择器 -->
          <div class="month-selector">
            <el-button :icon="ArrowLeft" circle @click="handlePrevMonth" size="small" />
            <el-date-picker
              v-model="selectedMonth"
              type="month"
              placeholder="选择月份"
              format="YYYY-MM"
              value-format="YYYY-MM"
              @change="handleMonthChange"
              size="small"
            />
            <el-button :icon="ArrowRight" circle @click="handleNextMonth" size="small" />
          </div>

          <!-- 图例 -->
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color" style="background: #00CED1;"></span>
              实际发电量
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #FFA500;"></span>
              理论损失电量
            </span>
            <span class="legend-item">
              <span class="legend-color circle" style="background: #FF0000;"></span>
              理论损失百分比
            </span>
          </div>

          <!-- 图表 -->
          <div ref="chartRef" class="chart"></div>
        </div>

        <!-- 数据表格 -->
        <div class="table-container" v-loading="tableLoading">
          <div class="table-header">
            <span class="table-title">数据表</span>
            <el-button type="primary" @click="handleExport">导出</el-button>
          </div>

          <el-table
            :data="paginatedTableData"
            stripe
            style="width: 100%"
            height="calc(100% - 100px)"
            :class="{ 'mobile-table': isMobile }"
          >
            <el-table-column
              prop="date"
              label="时间"
              width="100"
              fixed="left"
            />
            <el-table-column
              v-if="!isMobile"
              prop="stationName"
              label="电站名称"
              min-width="150"
            />
            <el-table-column
              v-if="!isMobile"
              prop="location"
              label="所在地区"
              min-width="180"
            />
            <el-table-column
              v-if="!isMobile"
              prop="capacity"
              label="电站容量(kWp)"
              width="130"
              sortable
            >
              <template #default="{ row }">
                {{ row.capacity.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="!isMobile"
              prop="theoreticalGeneration"
              label="标准辐照度测算发电量(kWh)"
              min-width="200"
              sortable
            >
              <template #default="{ row }">
                {{ row.theoreticalGeneration ? row.theoreticalGeneration.toFixed(2) : '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="actualGeneration"
              :label="isMobile ? '实际发电' : '实际发电量(kWh)'"
              :min-width="isMobile ? 100 : 140"
              sortable
            >
              <template #default="{ row }">
                <span>{{ row.actualGeneration.toFixed(2) }}</span>
                <div v-if="isMobile" class="mobile-sub-info">
                  <small>kWh</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="lossGeneration"
              :label="isMobile ? '损失电量' : '测算损失电量(kWh)'"
              :min-width="isMobile ? 100 : 160"
              sortable
            >
              <template #default="{ row }">
                <span :class="row.lossGeneration ? 'loss-value' : ''">
                  {{ row.lossGeneration ? row.lossGeneration.toFixed(2) : '-' }}
                </span>
                <div v-if="isMobile && row.lossGeneration" class="mobile-sub-info">
                  <small>kWh</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="lossPercentage"
              :label="isMobile ? '损失%' : '测算损失百分比'"
              :min-width="isMobile ? 80 : 140"
              sortable
            >
              <template #default="{ row }">
                <span :class="row.lossPercentage ? 'loss-percentage' : ''">
                  {{ row.lossPercentage ? `${row.lossPercentage.toFixed(2)}%` : '-' }}
                </span>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 31, 50]"
              :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next'"
              :small="isMobile"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import { getLossDiagnosisData, exportLossDiagnosisReport } from '@/api/diagnosis/lossDiagnosis'
import type {
  LossDiagnosisData,
  LossDiagnosisTableData
} from '@/api/types/diagnosis/lossDiagnosis'

// 移动端检测
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value <= 768)

// 监听窗口大小变化
function handleWindowResize() {
  windowWidth.value = window.innerWidth
  // 重新调整图表大小
  chartInstance?.resize()
}

// 当前选中的电站
const currentStationId = ref<string>('')

// 月份选择
const selectedMonth = ref<string>(dayjs().format('YYYY-MM'))

// 诊断数据
const diagnosisData = ref<LossDiagnosisData | null>(null)

// 图表相关
const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null
const chartLoading = ref(false)

// 表格数据
const tableLoading = ref(false)

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 计算分页后的表格数据
const paginatedTableData = computed(() => {
  if (!diagnosisData.value) return []
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return diagnosisData.value.tableData.slice(start, end)
})

/**
 * 处理电站切换
 */
const handleStationChange = async (data: any) => {
  if (!data || !data.regionId) {
    return
  }
  
  // 只处理叶子节点（电站节点）
  if (data.childList && data.childList.length > 0) {
    return
  }
  
  currentStationId.value = data.regionId
  
  // 重置分页
  pagination.value.page = 1
  
  await loadData()
}

/**
 * 处理月份变化
 */
const handleMonthChange = () => {
  pagination.value.page = 1
  loadData()
}

/**
 * 上一个月
 */
const handlePrevMonth = () => {
  selectedMonth.value = dayjs(selectedMonth.value).subtract(1, 'month').format('YYYY-MM')
  handleMonthChange()
}

/**
 * 下一个月
 */
const handleNextMonth = () => {
  selectedMonth.value = dayjs(selectedMonth.value).add(1, 'month').format('YYYY-MM')
  handleMonthChange()
}

/**
 * 加载数据
 */
const loadData = async () => {
  if (!currentStationId.value) {
    return
  }

  chartLoading.value = true
  tableLoading.value = true

  try {
    const data = await getLossDiagnosisData({
      stationId: currentStationId.value,
      month: selectedMonth.value
    })

    console.log('[损失诊断] 数据加载成功:', {
      图表数据点数: data.chartData.dates.length,
      表格数据行数: data.tableData.length,
      统计摘要: data.summary
    })

    diagnosisData.value = data
    pagination.value.total = data.tableData.length
    
    await nextTick()
    renderChart(data)
  } catch (error) {
    console.error('[损失诊断] 加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    chartLoading.value = false
    tableLoading.value = false
  }
}

/**
 * 渲染图表
 */
const renderChart = (data: LossDiagnosisData) => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  // 获取天气图标
  const getWeatherIcon = (weather: string) => {
    const icons: Record<string, string> = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️'
    }
    return icons[weather] || '☀️'
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(10, 30, 50, 0.9)',
      borderColor: '#00D4FF',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      formatter: (params: any) => {
        const dateIndex = params[0].dataIndex
        const date = data.chartData.dates[dateIndex]
        const weather = data.chartData.weather[dateIndex]
        const weatherIcon = getWeatherIcon(weather)
        
        let result = `<div style="padding: 5px;">`
        result += `<div style="margin-bottom: 8px; font-weight: 600;">${date} ${weatherIcon}</div>`
        
        params.forEach((param: any) => {
          const unit = param.seriesName.includes('百分比') ? ' %' : ' kWh'
          const value = param.value !== null && param.value !== undefined ? param.value : '-'
          result += `<div style="margin: 4px 0;">
            ${param.marker} ${param.seriesName}: 
            <span style="font-weight: 600;">${value}${value !== '-' ? unit : ''}</span>
          </div>`
        })
        result += `</div>`
        return result
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '18%',
      top: '18%',
      containLabel: true
    },
    graphic: data.chartData.weather.map((weather, index) => ({
      type: 'text',
      z: 100,
      left: `${3 + (index / data.chartData.dates.length) * 94}%`,
      top: '10%',
      style: {
        text: getWeatherIcon(weather),
        fontSize: 14,
        fill: '#fff'
      }
    })),
    xAxis: {
      type: 'category',
      data: data.chartData.dates.map(d => d.split('-')[2]),
      boundaryGap: true,
      axisLine: {
        lineStyle: {
          color: '#4A90E2'
        }
      },
      axisLabel: {
        color: '#fff',
        fontSize: 11
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '发电量(kWh)',
        nameTextStyle: {
          fontSize: 11
        },
        position: 'left',
        axisLine: {
          lineStyle: {
            color: '#4A90E2'
          }
        },
        axisLabel: {
          color: '#fff',
          formatter: '{value}',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(74, 144, 226, 0.2)'
          }
        }
      },
      {
        type: 'value',
        name: '损失百分比(%)',
        nameTextStyle: {
          fontSize: 11
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
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 18,
        bottom: 25,
        textStyle: {
          color: '#fff',
          fontSize: 10
        },
        borderColor: '#4A90E2',
        fillerColor: 'rgba(0, 212, 255, 0.2)',
        handleStyle: {
          color: '#00D4FF'
        }
      }
    ],
    series: [
      {
        name: '实际发电量',
        type: 'bar',
        data: data.chartData.actualGeneration,
        itemStyle: {
          color: '#00CED1'
        },
        barWidth: '35%'
      },
      {
        name: '理论损失电量',
        type: 'bar',
        data: data.chartData.theoreticalLoss,
        itemStyle: {
          color: '#FFA500'
        },
        barWidth: '35%'
      },
      {
        name: '理论损失百分比',
        type: 'line',
        yAxisIndex: 1,
        data: data.chartData.lossPercentage,
        itemStyle: {
          color: '#FF0000'
        },
        lineStyle: {
          color: '#FF0000',
          width: 2
        }
      }
    ]
  }

  chartInstance.setOption(option)
}


/**
 * 导出数据
 */
const handleExport = async () => {
  if (!currentStationId.value) {
    ElMessage.warning('请先选择电站')
    return
  }

  try {
    const response = await exportLossDiagnosisReport({
      stationId: currentStationId.value,
      month: selectedMonth.value,
      exportType: 'excel'
    })
    
    // 下载文件
    window.open(response.downloadUrl, '_blank')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

/**
 * 处理页码变化
 */
const handlePageChange = () => {
  // 分页已通过computed处理
}

/**
 * 处理每页大小变化
 */
const handleSizeChange = () => {
  pagination.value.page = 1
}


onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.loss-diagnosis-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;

  // 移动端适配
  @media (max-width: 768px) {
    gap: 6px;
    padding: 0;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
}

.chart-container {
  height: 405px;
  flex-shrink: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  position: relative;

  .month-selector {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10;
  }

  .chart-legend {
    position: absolute;
    top: 20px;
    right: 30px;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 10;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #fff;
      font-size: 12px;

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;

        &.circle {
          border-radius: 50%;
        }
      }
    }
  }

  .chart {
    width: 100%;
    height: 100%;
    margin-top: 30px;
  }

  // 移动端适配
  @media (max-width: 768px) {
    height: 350px;
    padding: 12px;

    .month-selector {
      top: 15px;
      left: 20px;
      transform: none;
      gap: 8px;

      .el-date-picker {
        width: 120px;
      }

      .el-button {
        padding: 6px;
      }
    }

    .chart-legend {
      position: static;
      top: auto;
      right: auto;
      margin: 45px 0 10px 0;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;

      .legend-item {
        font-size: 11px;
        
        .legend-color {
          width: 10px;
          height: 10px;
        }
      }
    }

    .chart {
      margin-top: 15px;
      height: calc(100% - 85px);
    }
  }

  @media (max-width: 480px) {
    height: 300px;
    padding: 8px;

    .month-selector {
      top: 10px;
      left: 10px;
      gap: 6px;

      .el-date-picker {
        width: 100px;
        
        :deep(.el-input__inner) {
          font-size: 12px;
        }
      }

      .el-button {
        padding: 4px;
        
        .el-icon {
          font-size: 14px;
        }
      }
    }

    .chart-legend {
      margin: 40px 0 8px 0;
      gap: 8px;

      .legend-item {
        font-size: 10px;
        
        .legend-color {
          width: 8px;
          height: 8px;
        }
      }
    }

    .chart {
      height: calc(100% - 75px);
    }
  }
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  overflow: hidden;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .table-title {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .loss-value {
    color: #FFA500;
    font-weight: 600;
  }

  .loss-percentage {
    color: #FF0000;
    font-weight: 600;
  }

  // 移动端适配
  @media (max-width: 768px) {
    padding: 12px;

    .table-header {
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;

      .table-title {
        font-size: 14px;
      }

      .el-button {
        font-size: 12px;
        padding: 8px 15px;
      }
    }

    :deep(.mobile-table) {
      .el-table__header-wrapper {
        .el-table__header th {
          padding: 8px 4px;
          font-size: 12px;
        }
      }

      .el-table__body-wrapper {
        .el-table__row {
          .el-table__cell {
            padding: 8px 4px;
            font-size: 12px;
            
            .mobile-sub-info {
              font-size: 10px;
              color: rgba(255, 255, 255, 0.6);
              margin-top: 2px;
            }
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    padding: 8px;

    .table-header {
      margin-bottom: 8px;

      .table-title {
        font-size: 13px;
      }

      .el-button {
        font-size: 11px;
        padding: 6px 12px;
      }
    }

    :deep(.mobile-table) {
      .el-table__header-wrapper {
        .el-table__header th {
          padding: 6px 3px;
          font-size: 11px;
        }
      }

      .el-table__body-wrapper {
        .el-table__row {
          .el-table__cell {
            padding: 6px 3px;
            font-size: 11px;
          }
        }
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;

  // 移动端适配
  @media (max-width: 768px) {
    justify-content: center;
    padding-top: 12px;

    :deep(.el-pagination) {
      .el-pager li {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
      }

      .btn-prev,
      .btn-next {
        min-width: 28px;
        height: 28px;
        font-size: 12px;
      }
    }
  }

  @media (max-width: 480px) {
    padding-top: 8px;

    :deep(.el-pagination) {
      .el-pager li {
        min-width: 24px;
        height: 24px;
        line-height: 24px;
        font-size: 11px;
      }

      .btn-prev,
      .btn-next {
        min-width: 24px;
        height: 24px;
        font-size: 11px;
      }
    }
  }
}
</style>

