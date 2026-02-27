<template>
  <DeviceMonitorLayout>
    <!-- 左侧报表类型树 -->
    <template #left>
      <div class="report-tree-panel">
        <div class="tree-search">
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行搜索"
            clearable
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-tree
          :data="treeData"
          :filter-node-method="filterNode"
          :default-expand-all="true"
          :highlight-current="true"
          @node-click="handleTreeNodeClick"
          ref="treeRef"
        />
      </div>
    </template>

    <!-- 右侧主内容区 -->
    <template #right>
      <div class="report-content-container">
        <!-- 查询条件栏 -->
        <div class="query-bar">
          <div class="query-left">
            <div class="query-item">
              <span class="label">电站</span>
              <el-select
                v-model="filterForm.stationId"
                filterable
                placeholder="请选择"
                @change="handleQuery"
              >
                <el-option
                  v-for="item in basicData.stations"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>

            <div class="query-item">
              <span class="label">时间选择</span>
              <el-date-picker
                v-model="filterForm.reportTime"
                :type="getDatePickerType()"
                :format="getDateFormat()"
                :value-format="getDateFormat()"
                :placeholder="getDatePlaceholder()"
                @change="handleQuery"
              />
            </div>
          </div>

          <div class="query-right">
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button :icon="Download" @click="handleExport">导出</el-button>
          </div>
        </div>

        <!-- 数据表格 -->
        <el-table
          :data="tableData"
          v-loading="loading"
          stripe
          border
          height="calc(100vh - 280px)"
        >
          <el-table-column prop="reportDate" label="统计日期" width="120" align="center" />
          <el-table-column prop="stationName" label="电站名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="location" label="所在地区" min-width="180" show-overflow-tooltip />
          <el-table-column prop="installedPower" label="装机功率(kW)" width="130" align="center" />
          <el-table-column prop="installedEnergy" label="装机能量(kWh)" width="140" align="center" />
          <el-table-column prop="stationSOH" label="电站SOH" width="100" align="center" />
          <el-table-column prop="dailyCharge" label="当日充电量(kWh)" width="150" align="center" />
          <el-table-column prop="dailyDischarge" label="当日放电量(kWh)" width="150" align="center" />
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :layout="paginationLayout"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import { 
  getStatisticsReports, 
  getStatisticsReportBasicData 
} from '@/api/statisticsReportApi'
import type { 
  ReportType, 
  ESStationReportRecord,
  StatisticsReportBasicData
} from '@/api/types/statistics-report'

// 状态
const filterText = ref('')
const treeRef = ref()
const currentReport = ref<ReportType>('daily')
const loading = ref(false)

// 响应式检测
const isMobile = computed(() => window.innerWidth <= 768)

// 基础数据
const basicData = ref<StatisticsReportBasicData>({
  stations: []
})

// 筛选表单
const filterForm = reactive({
  stationId: 'all',
  reportTime: '2025-11-01'
})

// 报表类型树
const treeData = ref([
  {
    id: 'root',
    label: '统计报表',
    children: [
      { id: 'daily', label: '储能电站日报表' },
      { id: 'weekly', label: '储能电站周报表' },
      { id: 'monthly', label: '储能电站月报表' },
      { id: 'yearly', label: '储能电站年报表' }
    ]
  }
])

// 表格数据
const tableData = ref<ESStationReportRecord[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 1
})

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
})

/**
 * 根据报表类型获取日期选择器类型
 */
const getDatePickerType = () => {
  switch (currentReport.value) {
    case 'daily':
      return 'date'
    case 'weekly':
      return 'week'
    case 'monthly':
      return 'month'
    case 'yearly':
      return 'year'
    default:
      return 'date'
  }
}

/**
 * 根据报表类型获取日期格式
 */
const getDateFormat = () => {
  switch (currentReport.value) {
    case 'daily':
      return 'YYYY-MM-DD'
    case 'weekly':
      return 'YYYY-MM-DD'
    case 'monthly':
      return 'YYYY-MM'
    case 'yearly':
      return 'YYYY'
    default:
      return 'YYYY-MM-DD'
  }
}

/**
 * 根据报表类型获取日期占位符
 */
const getDatePlaceholder = () => {
  switch (currentReport.value) {
    case 'daily':
      return '选择日期'
    case 'weekly':
      return '选择周'
    case 'monthly':
      return '选择月份'
    case 'yearly':
      return '选择年份'
    default:
      return '选择日期'
  }
}

// 树节点过滤
function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.includes(value)
}

// 树节点点击
function handleTreeNodeClick(data: any) {
  if (data.id !== 'root') {
    currentReport.value = data.id
    
    // 重置时间选择
    const today = dayjs()
    switch (data.id) {
      case 'daily':
        filterForm.reportTime = today.format('YYYY-MM-DD')
        break
      case 'weekly':
        filterForm.reportTime = today.format('YYYY-MM-DD')
        break
      case 'monthly':
        filterForm.reportTime = today.format('YYYY-MM')
        break
      case 'yearly':
        filterForm.reportTime = today.format('YYYY')
        break
    }
    
    // 重新查询数据
    handleQuery()
  }
}

/**
 * 查询数据
 */
const handleQuery = async () => {
  loading.value = true
  
  try {
    const params = {
      reportType: currentReport.value,
      stationId: filterForm.stationId,
      reportTime: filterForm.reportTime,
      current: pagination.current,
      pageSize: pagination.pageSize
    }
    
    const response = await getStatisticsReports(params)
    
    if (response.code === 200) {
      tableData.value = response.data.records
      pagination.total = response.data.total
      pagination.current = response.data.current
    } else {
      ElMessage.error(response.message || '查询失败')
    }
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getStatisticsReportBasicData()
    
    if (response.code === 200) {
      basicData.value = response.data
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

/**
 * 导出报表
 */
const handleExport = () => {
  if (!filterForm.reportTime) {
    ElMessage.warning('请先选择时间')
    return
  }
  
  ElMessage.info('导出功能开发中')
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  handleQuery()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.current = page
  handleQuery()
}

// 监听筛选文本
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 组件挂载
onMounted(async () => {
  await loadBasicData()
  await handleQuery()
})
</script>

<style scoped lang="scss">
// 左侧报表树样式
.report-tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .tree-search {
    margin-bottom: 16px;
  }
  
  :deep(.el-tree) {
    flex: 1;
    overflow-y: auto;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
    
    .el-tree-node__content {
      height: 36px;
      border-radius: 4px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(0, 212, 255, 0.1);
      }
    }
    
    .el-tree-node.is-current > .el-tree-node__content {
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
    }
  }
}

// 右侧内容区样式
.report-content-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  
  .query-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(10, 30, 50, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    
    .query-left {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      
      .query-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        }
      }
    }
    
    .query-right {
      display: flex;
      gap: 10px;
    }
  }
  
  :deep(.el-table) {
    flex: 1;
    overflow-y: auto;
    background: transparent;
    
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
  
  :deep(.el-pagination) {
    margin-top: 20px;
    justify-content: flex-end;
    
    .el-pagination__total,
    .el-pagination__jump {
      color: rgba(255, 255, 255, 0.85);
    }
    
    button {
      background: rgba(10, 30, 50, 0.5);
      color: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(0, 212, 255, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(0, 212, 255, 0.2);
        border-color: #00d4ff;
      }
      
      &:disabled {
        opacity: 0.5;
      }
    }
    
    .el-pager li {
      background: rgba(10, 30, 50, 0.5);
      color: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(0, 212, 255, 0.3);
      
      &:hover {
        background: rgba(0, 212, 255, 0.2);
        border-color: #00d4ff;
      }
      
      &.is-active {
        background: rgba(0, 212, 255, 0.3);
        color: #00d4ff;
        border-color: #00d4ff;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .report-content-container {
    padding: 12px;
    
    .query-bar {
      flex-direction: column;
      padding: 12px;
      gap: 12px;
      
      .query-left {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        width: 100%;
        
        .query-item {
          flex-direction: column;
          align-items: stretch;
          gap: 4px;
          
          .label {
            font-size: 12px;
          }
          
          .el-select,
          .el-date-picker {
            width: 100% !important;
            
            :deep(.el-input__wrapper) {
              font-size: 13px;
              min-height: 32px;
            }
          }
        }
      }
      
      .query-right {
        width: 100%;
        
        .el-button {
          flex: 1;
          font-size: 12px;
        }
      }
    }
    
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
    
    :deep(.el-pagination) {
      margin-top: 12px;
      justify-content: center;
      
      .btn-prev,
      .btn-next {
        min-width: 28px;
        padding: 0 4px;
        font-size: 11px;
      }
      
      .el-pager {
        li {
          min-width: 24px;
          height: 24px;
          line-height: 24px;
          font-size: 11px;
          margin: 0 2px;
        }
      }
      
      .el-pagination__total {
        font-size: 12px;
      }
    }
  }
}
</style>