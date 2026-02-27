<template>
  <div class="station-overview-container">
    <!-- 状态统计栏 -->
    <div class="status-bar">
      <div class="status-items">
        <div class="status-item">
          <span class="status-label">总数</span>
          <span class="status-value">({{ statistics.total }})</span>
        </div>
        <div class="status-item">
          <el-icon class="status-icon online"><Connection /></el-icon>
          <span class="status-label">通讯正常</span>
          <span class="status-value">({{ statistics.communicationNormal }})</span>
        </div>
        <div class="status-item">
          <el-icon class="status-icon offline"><Promotion /></el-icon>
          <span class="status-label">全部设备离线</span>
          <span class="status-value">({{ statistics.allDeviceOffline }})</span>
        </div>
        <div class="status-item">
          <el-icon class="status-icon partial-offline"><Connection /></el-icon>
          <span class="status-label">部分设备离线</span>
          <span class="status-value">({{ statistics.partialDeviceOffline }})</span>
        </div>
        <div class="status-item">
          <el-icon class="status-icon connecting"><Loading /></el-icon>
          <span class="status-label">接入中</span>
          <span class="status-value">({{ statistics.connecting }})</span>
        </div>
        <div class="status-item">
          <el-icon class="status-icon no-alarm"><SuccessFilled /></el-icon>
          <span class="status-label">无告警</span>
          <span class="status-value">({{ statistics.noAlarm }})</span>
        </div>
        <div class="status-item">
          <el-icon class="status-icon has-alarm"><WarningFilled /></el-icon>
          <span class="status-label">有告警</span>
          <span class="status-value">({{ statistics.hasAlarm }})</span>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-controls">
        <el-input
          v-model="searchKeyword"
          placeholder="(0)站名称"
          clearable
          style="width: 200px; margin-right: 12px;"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="toggleFilter">
          展开筛选
          <el-icon>
            <ArrowDown v-if="!isFilterExpanded" />
            <ArrowUp v-if="isFilterExpanded" />
          </el-icon>
        </el-button>
        <el-button-group>
          <el-button :icon="Download" @click="handleExport" title="导出数据"></el-button>
          <el-button :icon="Refresh" @click="handleRefresh" title="刷新数据"></el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="info-banner">
      <el-icon class="info-icon"><InfoFilled /></el-icon>
      <span>电站概览聚合了你可见电站下的所有数据，由于数据量较大，电站概览页面更新频率预计需要5分钟。</span>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section" v-show="isFilterExpanded">
      <el-form :model="filterForm" label-width="100px">
        <!-- 第一行 -->
        <div class="filter-row">
          <el-form-item label="所在位置">
            <el-select v-model="filterForm.location" placeholder="请选择" clearable>
              <el-option
                v-for="option in basicData.locationOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所在地区">
            <el-select v-model="filterForm.region" placeholder="请选择" clearable>
              <el-option
                v-for="option in basicData.regionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="建设状态">
            <el-select v-model="filterForm.constructionStatus" placeholder="全部" clearable>
              <el-option
                v-for="option in basicData.constructionStatusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 第二行 -->
        <div class="filter-row">
          <el-form-item label="装机功率">
            <div class="range-input">
              <el-input
                v-model="filterForm.minPower"
                placeholder="最小功率"
                style="width: 120px;"
              />
              <span class="range-separator">—</span>
              <el-input
                v-model="filterForm.maxPower"
                placeholder="最大功率"
                style="width: 120px;"
              />
              <span class="unit">MW</span>
            </div>
          </el-form-item>
        </div>

        <!-- 第三行 -->
        <div class="filter-row">
          <el-form-item label="装机能量">
            <div class="range-input">
              <el-input
                v-model="filterForm.minEnergy"
                placeholder="最小能量"
                style="width: 120px;"
              />
              <span class="range-separator">—</span>
              <el-input
                v-model="filterForm.maxEnergy"
                placeholder="最大能量"
                style="width: 120px;"
              />
              <span class="unit">MWh</span>
            </div>
          </el-form-item>
          <el-form-item label="并网时间">
            <el-date-picker
              v-model="filterForm.gridConnectionTime"
              type="date"
              placeholder="—"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px;"
            />
          </el-form-item>
        </div>

        <!-- 第四行 -->
        <div class="filter-row">
          <el-form-item label="联系人">
            <el-input
              v-model="filterForm.contactPerson"
              placeholder=""
              style="width: 150px;"
            />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input
              v-model="filterForm.contactPhone"
              placeholder=""
              style="width: 150px;"
            />
          </el-form-item>
          <div class="filter-actions">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleConfirm">确认</el-button>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <AdvancedTable
        :data="tableData"
        :columns="tableColumns"
        :loading="loading"
        :height="tableHeight"
        :show-pagination="true"
        :show-column-setting="false"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :pagination-layout="paginationLayout"
        stripe
        border
        empty-text="暂无数据"
        @size-change="handleSizeChange"
        @page-change="handleCurrentChange"
      >
        <!-- 通讯状态插槽 -->
        <template #communication="{ row }">
          <el-icon :class="getCommunicationClass(row.communication)">
            <Connection v-if="row.communication === 'online'" />
            <Promotion v-else />
          </el-icon>
        </template>

        <!-- 告警状态插槽 -->
        <template #alarm="{ row }">
          <el-icon :class="getAlarmClass(row.alarm)">
            <SuccessFilled v-if="!row.alarm" />
            <WarningFilled v-else />
          </el-icon>
        </template>

        <!-- 天气插槽 -->
        <template #weather="{ row }">
          <el-icon class="weather-icon" :class="getWeatherClass(row.weather)">
            <Sunny v-if="row.weather === 'sunny'" />
            <Cloudy v-else-if="row.weather === 'cloudy'" />
            <Cloudy v-else />
          </el-icon>
        </template>
      </AdvancedTable>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { downloadExcel, generateTimestampFilename } from '@/utils/download'
import {
  Connection,
  Promotion,
  Loading,
  SuccessFilled,
  WarningFilled,
  ArrowDown,
  ArrowUp,
  Download,
  InfoFilled,
  Sunny,
  Cloudy,
  Refresh
} from '@element-plus/icons-vue'
import AdvancedTable from '@/components/common/AdvancedTable.vue'
import type { ColumnConfig } from '@/components/common/AdvancedTable.vue'
import {
  getStationOverviewStatistics,
  getStationOverviewList,
  getStationOverviewBasicData
} from '@/api/stationOverviewApi'
import type {
  StationOverviewStatistics,
  StationOverviewRecord,
  StationOverviewBasicData,
  StationOverviewQueryParams
} from '@/api/types/station-overview'

// 响应式检测
const isMobile = computed(() => window.innerWidth <= 768)

// 状态统计
const statistics = ref<StationOverviewStatistics>({
  total: 0,
  communicationNormal: 0,
  allDeviceOffline: 0,
  partialDeviceOffline: 0,
  connecting: 0,
  noAlarm: 0,
  hasAlarm: 0
})

// 搜索关键字
const searchKeyword = ref('')

// 筛选展开状态
const isFilterExpanded = ref(false)

// 筛选表单
const filterForm = reactive<StationOverviewQueryParams>({
  location: '',
  region: '',
  constructionStatus: '',
  minPower: undefined,
  maxPower: undefined,
  minEnergy: undefined,
  maxEnergy: undefined,
  gridConnectionTime: '',
  contactPerson: '',
  contactPhone: ''
})

// 基础数据（筛选选项）
const basicData = ref<StationOverviewBasicData>({
  locationOptions: [],
  regionOptions: [],
  constructionStatusOptions: []
})

const tableData = ref<StationOverviewRecord[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const paginationLayout = computed(() => {
  return isMobile.value ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
})

// 表格高度计算（移动端需要设置最小高度）
const tableHeight = computed(() => {
  if (isMobile.value) {
    return 'auto'
  }
  return 'calc(100vh - 400px)'
})

// 表格列配置
const tableColumns = computed((): ColumnConfig[] => [
  {
    prop: 'stationName',
    label: '电站名称',
    minWidth: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'communication',
    label: '通讯',
    width: 80,
    align: 'center' as const,
    slotName: 'communication'
  },
  {
    prop: 'alarm',
    label: '告警',
    width: 80,
    align: 'center' as const,
    slotName: 'alarm'
  },
  {
    prop: 'location',
    label: '所在地区',
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    prop: 'installedPower',
    label: '装机功率(MW)',
    width: 130,
    align: 'center' as const,
    sortable: true
  },
  {
    prop: 'installedEnergy',
    label: '装机能量(MWh)',
    width: 140,
    align: 'center' as const,
    sortable: true
  },
  {
    prop: 'weather',
    label: '天气',
    width: 80,
    align: 'center' as const,
    slotName: 'weather'
  },
  {
    prop: 'realtimePower',
    label: '实时功率(kW)',
    width: 130,
    align: 'center'
  },
  {
    prop: 'dailyCharging',
    label: '当日充电量(kWh)',
    width: 150,
    align: 'center'
  },
  {
    prop: 'dailyDischarging',
    label: '当日放电量(kWh)',
    width: 150,
    align: 'center'
  },
  {
    prop: 'monthlyCharging',
    label: '当月充电量(kWh)',
    width: 150,
    align: 'center' as const,
    visible: false // 默认不显示
  },
  {
    prop: 'monthlyDischarging',
    label: '当月放电量(kWh)',
    width: 150,
    align: 'center' as const,
    visible: false // 默认不显示
  },
  {
    prop: 'yearlyCharging',
    label: '当年充电量(kWh)',
    width: 150,
    align: 'center' as const,
    visible: false // 默认不显示
  },
  {
    prop: 'yearlyDischarging',
    label: '当年放电量(kWh)',
    width: 150,
    align: 'center' as const,
    visible: false // 默认不显示
  },
  {
    prop: 'cumulativeCharging',
    label: '累计充电量(kWh)',
    width: 150,
    align: 'center'
  },
  {
    prop: 'cumulativeDischarging',
    label: '累计放电量(kWh)',
    width: 150,
    align: 'center'
  },
  {
    prop: 'gridConnectionDate',
    label: '并网日期',
    width: 120,
    align: 'center' as const,
    visible: false // 默认不显示
  },
  {
    prop: 'contactPerson',
    label: '联系人',
    width: 100,
    align: 'center' as const,
    visible: false // 默认不显示
  },
  {
    prop: 'contactPhone',
    label: '联系电话',
    width: 140,
    align: 'center' as const,
    visible: false // 默认不显示
  },
  {
    prop: 'updateTime',
    label: '更新时间',
    width: 160,
    align: 'center'
  }
])

/**
 * 切换筛选展开状态
 */
const toggleFilter = () => {
  isFilterExpanded.value = !isFilterExpanded.value
}

/**
 * 获取通讯状态图标样式
 */
const getCommunicationClass = (status: string) => {
  return {
    'communication-online': status === 'online',
    'communication-offline': status === 'offline'
  }
}

/**
 * 获取告警状态图标样式
 */
const getAlarmClass = (hasAlarm: boolean) => {
  return {
    'alarm-normal': !hasAlarm,
    'alarm-warning': hasAlarm
  }
}

/**
 * 获取天气图标样式
 */
const getWeatherClass = (weather: string) => {
  return {
    'weather-sunny': weather === 'sunny',
    'weather-cloudy': weather === 'cloudy',
    'weather-rainy': weather === 'rainy'
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}

/**
 * 刷新数据
 */
const handleRefresh = async () => {
  await Promise.all([
    loadBasicData(),
    loadStatistics(),
    loadTableData()
  ])
  ElMessage.success('数据已刷新')
}

/**
 * 导出数据
 */
const handleExport = () => {
  try {
    if (tableData.value.length === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    // 定义导出列配置
    const exportColumns = [
      { prop: 'stationName', label: '电站名称', width: 140 },
      { 
        prop: 'communication', 
        label: '通讯状态', 
        width: 80,
        formatter: (row: any) => row.communication === 'online' ? '在线' : '离线'
      },
      { 
        prop: 'alarm', 
        label: '告警状态', 
        width: 80,
        formatter: (row: any) => row.alarm ? '有告警' : '正常'
      },
      { prop: 'location', label: '所在地区', width: 180 },
      { prop: 'installedPower', label: '装机功率(MW)', width: 120 },
      { prop: 'installedEnergy', label: '装机能量(MWh)', width: 130 },
      { 
        prop: 'weather', 
        label: '天气', 
        width: 80,
        formatter: (row: any) => {
          const weatherMap: Record<string, string> = {
            sunny: '晴天',
            cloudy: '多云',
            rainy: '雨天',
            snowy: '雪天'
          }
          return weatherMap[row.weather] || row.weather
        }
      },
      { prop: 'realtimePower', label: '实时功率(kW)', width: 120 },
      { prop: 'dailyCharging', label: '当日充电量(kWh)', width: 140 },
      { prop: 'dailyDischarging', label: '当日放电量(kWh)', width: 140 },
      { prop: 'cumulativeCharging', label: '累计充电量(kWh)', width: 140 },
      { prop: 'cumulativeDischarging', label: '累计放电量(kWh)', width: 140 },
      { 
        prop: 'contactPerson', 
        label: '联系人', 
        width: 100,
        formatter: (row: any) => row.contactPerson || '-'
      },
      { 
        prop: 'contactPhone', 
        label: '联系电话', 
        width: 120,
        formatter: (row: any) => row.contactPhone || '-'
      },
      { prop: 'updateTime', label: '更新时间', width: 160 }
    ]

    // 生成文件名
    const filename = generateTimestampFilename('电站概览')

    // 使用工具函数导出Excel
    downloadExcel(tableData.value, exportColumns, filename, '电站概览')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

/**
 * 重置筛选
 */
const handleReset = () => {
  Object.assign(filterForm, {
    location: '',
    region: '',
    constructionStatus: '',
    minPower: undefined,
    maxPower: undefined,
    minEnergy: undefined,
    maxEnergy: undefined,
    gridConnectionTime: '',
    contactPerson: '',
    contactPhone: ''
  })
}

/**
 * 确认筛选
 */
const handleConfirm = () => {
  pagination.current = 1
  loadTableData()
  ElMessage.success('筛选已应用')
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadTableData()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadTableData()
}

/**
 * 加载表格数据
 */
const loadTableData = async () => {
  loading.value = true
  
  try {
    const params: StationOverviewQueryParams = {
      keyword: searchKeyword.value,
      location: filterForm.location,
      region: filterForm.region,
      constructionStatus: filterForm.constructionStatus,
      minPower: filterForm.minPower ? Number(filterForm.minPower) : undefined,
      maxPower: filterForm.maxPower ? Number(filterForm.maxPower) : undefined,
      minEnergy: filterForm.minEnergy ? Number(filterForm.minEnergy) : undefined,
      maxEnergy: filterForm.maxEnergy ? Number(filterForm.maxEnergy) : undefined,
      gridConnectionTime: filterForm.gridConnectionTime,
      contactPerson: filterForm.contactPerson,
      contactPhone: filterForm.contactPhone,
      current: pagination.current,
      pageSize: pagination.pageSize
    }
    
    const response = await getStationOverviewList(params)
    
    if (response.code === 200) {
      tableData.value = response.data.records
      pagination.total = response.data.total
      pagination.current = response.data.current
      pagination.pageSize = response.data.pageSize
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

/**
 * 加载统计数据
 */
const loadStatistics = async () => {
  try {
    const response = await getStationOverviewStatistics()
    
    if (response.code === 200) {
      statistics.value = response.data
    } else {
      console.error('加载统计数据失败:', response.message)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getStationOverviewBasicData()
    
    if (response.code === 200) {
      basicData.value = response.data
    } else {
      console.error('加载基础数据失败:', response.message)
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

// 组件挂载
onMounted(async () => {
  await Promise.all([
    loadBasicData(),
    loadStatistics(),
    loadTableData()
  ])
})
</script>

<style scoped lang="scss">
.station-overview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: rgba(10, 30, 50, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;

    .status-items {
      display: flex;
      align-items: center;
      gap: 24px;

      .status-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.85);

        .status-icon {
          font-size: 16px;

          &.online {
            color: #52c41a;
          }

          &.offline {
            color: #ff4d4f;
          }

          &.partial-offline {
            color: #faad14;
          }

          &.connecting {
            color: #1890ff;
          }

          &.no-alarm {
            color: #52c41a;
          }

          &.has-alarm {
            color: #ff4d4f;
          }
        }

        .status-label {
          white-space: nowrap;
        }

        .status-value {
          color: #00d4ff;
          font-weight: 500;
        }
      }
    }

    .search-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .info-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(24, 144, 255, 0.1);
    border: 1px solid rgba(24, 144, 255, 0.3);
    border-radius: 6px;
    margin-bottom: 16px;

    .info-icon {
      color: #1890ff;
      font-size: 16px;
      flex-shrink: 0;
    }

    span {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.5;
    }
  }

  .filter-section {
    background: rgba(10, 30, 50, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-form-item) {
        margin-bottom: 0;

        .el-form-item__label {
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
        }
      }

      .range-input {
        display: flex;
        align-items: center;
        gap: 8px;

        .range-separator {
          color: rgba(255, 255, 255, 0.65);
        }

        .unit {
          color: rgba(255, 255, 255, 0.65);
          font-size: 14px;
          white-space: nowrap;
        }
      }

      .filter-actions {
        display: flex;
        gap: 12px;
        margin-left: auto;
      }
    }
  }

  .table-section {
    flex: 1;
    background: rgba(10, 30, 50, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    padding: 16px;
    min-height: 0;
    display: flex;
    flex-direction: column;

    :deep(.el-table) {
      flex: 1;
      background-color: transparent;

      th.el-table__cell {
        background: rgba(10, 30, 50, 0.6);
        color: rgba(255, 255, 255, 0.85);
        border-color: rgba(0, 212, 255, 0.3);
      }

      td.el-table__cell {
        background: rgba(10, 30, 50, 0.4);
        color: rgba(255, 255, 255, 0.85);
        border-color: rgba(0, 212, 255, 0.2);
      }

      .el-table__body tr:hover > td {
        background: rgba(0, 212, 255, 0.1);
      }
    }
  }


  // 图标样式
  .communication-online {
    color: #52c41a;
  }

  .communication-offline {
    color: #ff4d4f;
  }

  .alarm-normal {
    color: #52c41a;
  }

  .alarm-warning {
    color: #ff4d4f;
  }

  .weather-sunny {
    color: #faad14;
  }

  .weather-cloudy {
    color: #1890ff;
  }

  .weather-rainy {
    color: #722ed1;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .station-overview-container {
    padding: 12px;

    .status-bar {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .status-items {
        flex-wrap: wrap;
        gap: 16px;
        justify-content: center;
      }

      .search-controls {
        justify-content: center;
      }
    }

    .filter-section {
      padding: 12px;

      .filter-row {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        :deep(.el-form-item) {
          .el-form-item__content {
            .el-input,
            .el-select,
            .el-date-picker {
              width: 100% !important;
            }
          }
        }

        .range-input {
          flex-direction: column;
          gap: 8px;

          .el-input {
            width: 100%;
          }
        }

        .filter-actions {
          margin-left: 0;
          justify-content: center;
        }
      }
    }

    .table-section {
      padding: 12px;
      min-height: 400px; // 移动端表格最小高度，避免被压缩

      :deep(.el-table) {
        font-size: 12px;

        .el-table__header th,
        .el-table__body td {
          padding: 8px 4px;
        }

        .cell {
          padding: 0 4px;
        }
      }
    }

  }
}
</style>