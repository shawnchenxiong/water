<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0919"
        :auto-select-first-leaf="true"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧主内容 -->
    <template #right>
      <div class="inspection-statistics-container">
        <!-- 筛选控制区 -->
        <div class="filter-section">
          <el-form
            ref="filterFormRef"
            :model="filterForm"
            inline
            label-width="auto"
          >
            <!-- 组织选择 -->
            <el-form-item label="组织" class="organization-item">
              <el-select
                v-model="filterForm.organizationId"
                placeholder="请选择组织"
                style="width: 120px"
                @change="handleOrganizationChange"
              >
                <el-option
                  v-for="org in basicData.organizations"
                  :key="org.value"
                  :label="org.label"
                  :value="org.value"
                />
              </el-select>
            </el-form-item>
            
            <!-- 时间维度选择 -->
            <el-form-item label="时间维度" class="time-dimension-item">
              <el-radio-group
                v-model="filterForm.timeDimension"
                class="time-dimension-group"
                @change="handleTimeDimensionChange"
              >
                <el-radio-button
                  v-for="dimension in basicData.timeDimensions"
                  :key="dimension.value"
                  :value="dimension.value"
                  class="time-dimension-button"
                >
                  {{ dimension.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <!-- 时间范围选择 -->
            <el-form-item label="时间范围" class="time-range-item">
              <el-select
                v-model="filterForm.timeRange"
                placeholder="请选择时间范围"
                style="width: 180px"
                @change="handleTimeRangeChange"
              >
                <el-option
                  v-for="option in timeRangeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            
            <!-- 刷新按钮 -->
            <el-form-item class="refresh-item">
              <el-button 
                :icon="Refresh" 
                type="primary"
                class="refresh-button"
                @click="handleRefresh"
              >
                刷新
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 统计卡片区 -->
        <div class="statistics-grid">
          <!-- 左上: 巡检统计环形图 -->
          <div class="grid-item">
            <InspectionPieChart
              :chart-data="statisticsData.piechartData"
              :personnel-stats="statisticsData.personnelStats"
              :loading="loading"
            />
          </div>

          <!-- 右上: 巡检分布柱状图 -->
          <div class="grid-item">
            <InspectionBarChart
              :chart-data="statisticsData.barChartData"
              :loading="loading"
            />
          </div>

          <!-- 左下: 巡检排名表格 -->
          <div class="grid-item">
            <RankingTable
              :title="statisticsData.stationRanking.title"
              :data="statisticsData.stationRanking.list"
              type="station"
              :loading="loading"
              @row-click="handleStationRankingClick"
            />
          </div>

          <!-- 右下: 巡检之星表格 -->
          <div class="grid-item">
            <RankingTable
              :title="statisticsData.personnelRanking.title"
              :data="statisticsData.personnelRanking.list"
              type="personnel"
              :loading="loading"
              @row-click="handlePersonnelRankingClick"
            />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import InspectionPieChart from './components/InspectionPieChart.vue'
import InspectionBarChart from './components/InspectionBarChart.vue'
import RankingTable from './components/RankingTable.vue'

// API 导入
import {
  getInspectionStatistics,
  getStatisticsBasicData,
  getTimeRangeOptions
} from '@/api/maintenance/mobileInspectionStatisticsApi'

// 类型导入
import type {
  InspectionStatistics,
  InspectionStatisticsQueryParams,
  StatisticsBasicData,
  FilterFormData,
  StationRankingItem,
  PersonnelRankingItem
} from '@/api/types/mobile-inspection-statistics'
import type { StationTreeNode } from '@/types/station'

// 基础数据
const basicData = ref<StatisticsBasicData>({
  organizations: [],
  timeDimensions: []
})

// 时间范围选项
const timeRangeOptions = ref<Array<{value: string, label: string}>>([])

// 统计数据
const statisticsData = ref<InspectionStatistics>({
  timeRange: '',
  piechartData: {
    total: 0,
    normal: 0,
    abnormal: 0,
    notInspected: 0,
    series: []
  },
  barChartData: {
    xAxis: [],
    series: []
  },
  personnelStats: {
    total: 0,
    totalIssues: 0,
    unconfirmedIssues: 0,
    list: []
  },
  stationRanking: {
    title: '巡检排名',
    list: []
  },
  personnelRanking: {
    title: '巡检之星',
    list: []
  }
})

const loading = ref(false)

// 当前选中的电站
const selectedStationId = ref('')
const selectedStationName = ref('')

// 筛选表单
const filterForm = reactive<FilterFormData>({
  organizationId: '',
  timeDimension: 'week',
  timeRange: ''
})


/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  console.log('Selected station:', node)
  selectedStationId.value = node.regionId
  selectedStationName.value = node.regionName
  loadStatisticsData()
}

/**
 * 组织变化
 */
const handleOrganizationChange = () => {
  loadStatisticsData()
}

/**
 * 时间维度变化
 */
const handleTimeDimensionChange = async () => {
  // 清空当前时间范围选择
  filterForm.timeRange = ''
  await loadTimeRangeOptions()
  // 等待选项加载完成后再加载数据
  await nextTick()
  if (filterForm.timeRange) {
    loadStatisticsData()
  }
}

/**
 * 时间范围变化
 */
const handleTimeRangeChange = () => {
  loadStatisticsData()
}

/**
 * 刷新数据
 */
const handleRefresh = () => {
  loadStatisticsData()
}

/**
 * 电站排名点击
 */
const handleStationRankingClick = (row: StationRankingItem | PersonnelRankingItem) => {
  console.log('Station ranking clicked:', row)
  if ('stationName' in row) {
    ElMessage.info(`查看电站 ${row.stationName} 的详细排名信息`)
  }
}

/**
 * 人员排名点击
 */
const handlePersonnelRankingClick = (row: StationRankingItem | PersonnelRankingItem) => {
  console.log('Personnel ranking clicked:', row)
  if ('name' in row) {
    ElMessage.info(`查看人员 ${row.name} 的详细排名信息`)
  }
}


/**
 * 加载统计数据
 */
const loadStatisticsData = async () => {
  if (!filterForm.timeRange) {
    return
  }

  loading.value = true
  try {
    const params: InspectionStatisticsQueryParams = {
      stationId: selectedStationId.value || undefined,
      organizationId: filterForm.organizationId || undefined,
      timeDimension: filterForm.timeDimension,
      timeRange: filterForm.timeRange
    }

    const response = await getInspectionStatistics(params)
    if (response.code === 200) {
      statisticsData.value = response.data
    } else {
      ElMessage.error('获取统计数据失败')
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getStatisticsBasicData()
    if (response.code === 200) {
      basicData.value = response.data
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

/**
 * 加载时间范围选项
 */
const loadTimeRangeOptions = async () => {
  try {
    const response = await getTimeRangeOptions(filterForm.timeDimension)
    if (response.code === 200) {
      timeRangeOptions.value = response.data
      // 设置默认时间范围
      if (timeRangeOptions.value.length > 0 && !filterForm.timeRange) {
        filterForm.timeRange = timeRangeOptions.value[timeRangeOptions.value.length - 1].value
      }
    }
  } catch (error) {
    console.error('加载时间范围选项失败:', error)
  }
}

// 监听时间维度变化，自动更新时间范围选项
watch(() => filterForm.timeDimension, async () => {
  await loadTimeRangeOptions()
})

// 组件挂载
onMounted(async () => {
  await loadBasicData()
  await loadTimeRangeOptions()
  
  // 等待StationTree组件加载完成后，如果有自动选择的节点，会触发node-click事件
  await nextTick()
  
  // 延迟一段时间后加载默认数据（全部数据）
  setTimeout(() => {
    if (filterForm.timeRange) {
      console.log('Loading initial statistics data (all stations)')
      loadStatisticsData()
    }
  }, 1000)
})
</script>

<style scoped lang="scss">
.inspection-statistics-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;


  .filter-section {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border: 1px solid rgba(0, 212, 255, 0.15);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 20px;

      &:last-child {
        margin-right: 0;
      }

      .el-form-item__label {
        color: #ffffff;
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 8px;
      }
    }

    // 表单项分组样式
    .organization-item,
    .time-range-item {
      :deep(.el-select) {
        .el-input {
          .el-input__wrapper {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: rgba(0, 212, 255, 0.4);
              box-shadow: 0 2px 8px rgba(0, 212, 255, 0.1);
            }
            
            &.is-focus {
              border-color: #00d4ff;
              box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
            }
          }

          .el-input__inner {
            color: #ffffff;
            font-weight: 500;
          }
        }
      }
    }

    :deep(.el-select) {
      .el-input {
        .el-input__wrapper {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: #333;
          
          &:hover {
            border-color: #00d4ff;
          }
          
          &.is-focus {
            border-color: #00d4ff;
            box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
          }
        }

        .el-input__inner {
          color: #ffffff;
        }
      }
    }

    // 时间维度选择器优化
    .time-dimension-item {
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #ffffff;
      }
    }

    .time-dimension-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .time-dimension-button {
        :deep(.el-radio-button__inner) {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #cccccc;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
            transition: left 0.5s;
          }
          
          &:hover {
            border-color: rgba(0, 212, 255, 0.5);
            color: #00d4ff;
            box-shadow: 0 2px 8px rgba(0, 212, 255, 0.15);
            transform: translateY(-1px);
            
            &::before {
              left: 100%;
            }
          }
        }

        &.is-active {
          :deep(.el-radio-button__inner) {
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            border-color: #00d4ff;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
            font-weight: 600;
            
            &::before {
              display: none;
            }
          }
        }
      }
    }

    // 其他表单项优化
    .organization-item,
    .time-range-item {
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #ffffff;
      }
    }

    .refresh-button {
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      border: none;
      box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
        transform: translateY(-1px);
      }
    }

    :deep(.el-button) {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: #333;
      color: #cccccc;
      
      &:hover {
        background-color: rgba(0, 212, 255, 0.1);
        border-color: #00d4ff;
        color: #00d4ff;
      }
    }
  }

  .statistics-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 20px;
    min-height: 0;

    .grid-item {
      min-height: 380px;
      max-height: 450px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
}

// 响应式设计
@media (max-width: 1600px) {
  .inspection-statistics-container {
    .statistics-grid {
      gap: 16px;

      .grid-item {
        min-height: 350px;
        max-height: 420px;
      }
    }
  }
}

@media (max-width: 1400px) {
  .inspection-statistics-container {
    .filter-section {
      :deep(.el-form) {
        flex-wrap: wrap;

        .el-form-item {
          margin-bottom: 8px;
        }
      }
    }

    .statistics-grid {
      gap: 12px;

      .grid-item {
        min-height: 320px;
        max-height: 380px;
      }
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  .inspection-statistics-container {
    padding: 16px;

    .filter-section {
      padding: 12px;
      margin-bottom: 16px;

      :deep(.el-form) {
        .el-form-item {
          margin-right: 12px;
          margin-bottom: 12px;

          .el-form-item__label {
            font-size: 13px;
          }
        }
      }

      :deep(.el-select) {
        .el-input {
          .el-input__wrapper {
            font-size: 13px;
          }
        }
      }

      :deep(.el-radio-group) {
        .el-radio-button {
          .el-radio-button__inner {
            padding: 8px 12px;
            font-size: 13px;
          }
        }
      }
    }

    .statistics-grid {
      gap: 12px;

      .grid-item {
        min-height: 280px;
        max-height: 350px;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .inspection-statistics-container {
    padding: 12px;

    .filter-section {
      padding: 12px;
      margin-bottom: 12px;

      :deep(.el-form) {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 16px;

        .el-form-item {
          margin-right: 0;
          margin-bottom: 0;
          width: 100%;

          .el-form-item__label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 600;
            color: #ffffff;
          }
        }
      }

      .organization-item,
      .time-dimension-item,
      .time-range-item,
      .refresh-item {
        width: 100%;
        
        :deep(.el-form-item__content) {
          width: 100%;
        }
      }

      :deep(.el-select) {
        width: 100% !important;
        
        .el-input {
          .el-input__wrapper {
            height: 36px;
            font-size: 14px;
          }
        }
      }

      // 移动端时间维度选择器优化
      .time-dimension-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
        gap: 8px;
        width: 100%;
        
        .time-dimension-button {
          :deep(.el-radio-button__inner) {
            width: 100%;
            padding: 10px 8px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            border-radius: 8px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            border: 1px solid rgba(0, 212, 255, 0.3);
            transition: all 0.2s ease;
            
            &:hover {
              border-color: rgba(0, 212, 255, 0.6);
              background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.08) 100%);
              transform: scale(1.02);
            }
          }

          &.is-active {
            :deep(.el-radio-button__inner) {
              background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
              border-color: #00d4ff;
              color: #ffffff;
              font-weight: 700;
              box-shadow: 0 3px 10px rgba(0, 212, 255, 0.4);
            }
          }
        }
      }

      :deep(.el-button) {
        width: 100%;
        height: 36px;
        font-size: 14px;
      }
    }

    .statistics-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .grid-item {
        min-height: 420px;
        max-height: none;
        width: 100%;
      }
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  .inspection-statistics-container {
    padding: 8px;

    .filter-section {
      padding: 8px;
      margin-bottom: 8px;

      :deep(.el-form) {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        .el-form-item {
          margin-right: 0;
          margin-bottom: 0;
          width: 100%;

          .el-form-item__label {
            display: block;
            margin-bottom: 6px;
            font-size: 12px;
            font-weight: 600;
            color: #ffffff;
          }
        }
      }

      .organization-item,
      .time-dimension-item,
      .time-range-item,
      .refresh-item {
        width: 100%;
        
        :deep(.el-form-item__content) {
          width: 100%;
        }
      }

      :deep(.el-select) {
        .el-input {
          .el-input__wrapper {
            height: 32px;
            font-size: 12px;
          }
        }
      }

      // 小屏移动端时间维度选择器
      .time-dimension-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
        gap: 6px;
        width: 100%;
        
        .time-dimension-button {
          :deep(.el-radio-button__inner) {
            width: 100%;
            padding: 8px 4px;
            font-size: 10px;
            font-weight: 600;
            text-align: center;
            border-radius: 6px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
            border: 1px solid rgba(0, 212, 255, 0.25);
            transition: all 0.15s ease;
            
            &:hover {
              border-color: rgba(0, 212, 255, 0.5);
              background: linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(0, 212, 255, 0.06) 100%);
            }
          }

          &.is-active {
            :deep(.el-radio-button__inner) {
              background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
              border-color: #00d4ff;
              color: #ffffff;
              font-weight: 700;
              box-shadow: 0 2px 8px rgba(0, 212, 255, 0.35);
            }
          }
        }
      }

      :deep(.el-button) {
        height: 32px;
        font-size: 12px;
      }
    }

    .statistics-grid {
      gap: 8px;

      .grid-item {
        min-height: 370px;
      }
    }
  }
}

// 下拉菜单样式
:deep(.el-select-dropdown) {
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;

  .el-select-dropdown__item {
    color: #cccccc;

    &:hover {
      background-color: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
    }

    &.is-selected {
      background-color: #00d4ff;
      color: #ffffff;
    }
  }
}
</style>