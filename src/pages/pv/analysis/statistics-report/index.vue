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
              v-model="selectedStation"
              filterable
              placeholder="请选择"
              @change="handleQuery"
            >
              <el-option
                v-for="item in stationList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <div class="query-item" v-if="showTimeGranularity">
            <span class="label">时间选择</span>
            <el-button-group>
              <el-button
                v-for="item in timeGranularityOptions"
                :key="item.value"
                :type="timeGranularity === item.value ? 'primary' : 'default'"
                @click="handleTimeGranularityChange(item.value)"
              >
                {{ item.label }}
              </el-button>
            </el-button-group>
          </div>

          <div class="query-item">
            <el-date-picker
              v-model="queryDate"
              :type="datePickerType"
              :format="dateFormat"
              :value-format="dateValueFormat"
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
        @sort-change="handleSortChange"
      >
        <template v-for="column in currentColumns" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :align="column.align || 'left'"
            :sortable="column.sortable ? 'custom' : false"
          >
            <template #default="{ row }" v-if="column.formatter">
              <span>{{ column.formatter(row) }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, prev, pager, next, sizes, jumper"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import { downloadExcel, generateTimestampFilename } from '@/utils/download'
import {
  getStationList,
  getPowerStationReport,
  getInverterReport,
  getEmissionReport
} from '@/api/analysis/statistics'
import type { ReportType, TimeGranularity } from '@/api/types/analysis/statistics'

// 状态
const filterText = ref('')
const treeRef = ref()
const selectedStation = ref('')
const stationList = ref<Array<{ value: string; label: string }>>([])
const currentReportType = ref<ReportType>('powerStation-day')
const timeGranularity = ref<TimeGranularity>('date')
const queryDate = ref(dayjs().format('YYYY-MM-DD'))
const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const sortField = ref('')
const sortOrder = ref<'ascending' | 'descending'>()

// 报表类型树
const treeData = ref([
  {
    id: 'root',
    label: '统计报表',
    children: [
      { id: 'powerStation-day', label: '电站运行日报表' },
      { id: 'powerStation-week', label: '电站运行周报表' },
      { id: 'powerStation-month', label: '电站运行月报表' },
      { id: 'powerStation-year', label: '电站运行年报表' },
      { id: 'inverter', label: '逆变器报表' },
      { id: 'controller', label: '控制器报表' },
      { id: 'energyMeter', label: '电能表报表' },
      { id: 'emission', label: '节能减排报表' }
    ]
  }
])

// 时间粒度选项
const timeGranularityOptions = [
  { value: 'date' as TimeGranularity, label: '日' },
  { value: 'month' as TimeGranularity, label: '月' },
  { value: 'year' as TimeGranularity, label: '年' }
]

// 是否显示时间粒度选择器
const showTimeGranularity = computed(() => {
  return currentReportType.value.startsWith('powerStation-')
})

// 日期选择器类型
const datePickerType = computed(() => {
  if (currentReportType.value === 'powerStation-week') return 'week'
  const typeMap: Record<TimeGranularity, 'date' | 'month' | 'year' | 'week'> = {
    date: 'date',
    month: 'month',
    year: 'year',
    week: 'week'
  }
  return typeMap[timeGranularity.value]
})

// 日期格式
const dateFormat = computed(() => {
  if (currentReportType.value === 'powerStation-week') return 'YYYY 第 ww 周'
  const formatMap: Record<TimeGranularity, string> = {
    date: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
    week: 'YYYY 第 ww 周'
  }
  return formatMap[timeGranularity.value]
})

// 日期值格式
const dateValueFormat = computed(() => {
  return 'YYYY-MM-DD'
})

// 当前表格列配置
const currentColumns = computed(() => {
  const columnConfigs: Record<string, any[]> = {
    'powerStation-day': powerStationColumns,
    'powerStation-week': powerStationColumns,
    'powerStation-month': powerStationColumns,
    'powerStation-year': powerStationColumns,
    'inverter': inverterColumns,
    'emission': emissionColumns
  }
  return columnConfigs[currentReportType.value] || []
})

// 电站运行报表列配置
const powerStationColumns = [
  { prop: 'statsDate', label: '统计日期', width: 120, sortable: true },
  { prop: 'regionName', label: '电站名称', width: 180 },
  { prop: 'capacity', label: '装机容量(MWp)', width: 130, align: 'right', sortable: true },
  { prop: 'generation', label: '发电量(kWh)', width: 130, align: 'right', sortable: true },
  { prop: 'irradiation', label: '辐照量(MJ/㎡)', width: 130, align: 'right', sortable: true },
  { prop: 'equivalence', label: '等效小时数(h)', width: 130, align: 'right', sortable: true },
  { prop: 'connectTime', label: '并网时间', width: 160, align: 'center', sortable: true },
  { prop: 'offTime', label: '脱网时间', width: 160, align: 'center', sortable: true },
  { prop: 'onlineTime', label: '并网时长(h)', width: 120, align: 'right', sortable: true },
  { prop: 'maxPower', label: '最大有功功率(kW)', width: 150, align: 'right', sortable: true },
  { prop: 'maxPowerTime', label: '最大有功功率时间', width: 160, align: 'center', sortable: true },
  { prop: 'avgPower', label: '平均有功功率(kW)', width: 150, align: 'right', sortable: true },
  { prop: 'textDay', label: '电站天气', width: 100, align: 'center' },
  { prop: 'maxTemp', label: '最高温度(℃)', width: 120, align: 'right', sortable: true },
  { prop: 'minTemp', label: '最低温度(℃)', width: 120, align: 'right', sortable: true },
  { prop: 'avgTemp', label: '平均温度(℃)', width: 120, align: 'right', sortable: true },
  { prop: 'avgWindSpeed', label: '平均风速(Km/h)', width: 130, align: 'right', sortable: true },
  { prop: 'dayPR', label: '系统效率PR', width: 120, align: 'center' },
  { prop: 'powerInverter', label: '逆变器发电量(kWh)', width: 160, align: 'right', sortable: true },
  { prop: 'powerBind', label: '并网点电量(kWh)', width: 150, align: 'right', sortable: true },
  { prop: 'powerOnline', label: '余电上网电量(kWh)', width: 160, align: 'right', sortable: true },
  { prop: 'powerUse', label: '自发自用电量(kWh)', width: 160, align: 'right', sortable: true },
  { prop: 'powerOffline', label: '下网电量(kWh)', width: 140, align: 'right', sortable: true }
]

// 逆变器报表列配置
const inverterColumns = [
  { prop: 'deviceName', label: '设备名称', width: 150 },
  { prop: 'nodeName', label: '电站名称', width: 180 },
  { 
    prop: 'capacity', 
    label: '装机容量(kWp)', 
    width: 130, 
    align: 'right', 
    sortable: true,
    formatter: (row: any) => row.capacity ? row.capacity.toFixed(2) : '-'
  },
  { prop: 'generation', label: '发电量(kWh)', width: 130, align: 'right', sortable: true },
  { 
    prop: 'equivalence', 
    label: '等效小时数(h)', 
    width: 130, 
    align: 'right', 
    sortable: true,
    formatter: (row: any) => row.equivalence ? row.equivalence.toFixed(2) : '-'
  },
  { prop: 'connection', label: '并网状态', width: 100, align: 'center' },
  { prop: 'maxPower', label: '最大有功功率(kW)', width: 150, align: 'right', sortable: true },
  { prop: 'maxPowerTime', label: '最大有功功率时间', width: 160, align: 'center', sortable: true }
]

// 节能减排报表列配置
const emissionColumns = [
  { prop: 'statsDate', label: '统计日期', width: 120, sortable: true },
  { prop: 'regionName', label: '电站名称', width: 180 },
  { prop: 'capacity', label: '装机容量(kWp)', width: 130, align: 'right', sortable: true },
  { prop: 'generation', label: '发电量(kWh)', width: 130, align: 'right', sortable: true },
  { prop: 'carbonDioxideReduction', label: '二氧化碳减排(kg)', width: 150, align: 'right', sortable: true },
  { prop: 'saveStandardCoal', label: '节约标准煤(kg)', width: 140, align: 'right', sortable: true },
  { prop: 'equivalentTreePlant', label: '等效植树(棵)', width: 130, align: 'right', sortable: true },
  { prop: 'sulfurDioxide', label: '二氧化硫减排(kg)', width: 150, align: 'right', sortable: true },
  { prop: 'tonerDust', label: '碳粉尘减排(kg)', width: 140, align: 'right', sortable: true }
]

// 树节点过滤
function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.includes(value)
}

// 树节点点击
function handleTreeNodeClick(data: any) {
  if (data.id !== 'root') {
    currentReportType.value = data.id as ReportType
    
    // 根据报表类型调整时间粒度
    if (data.id === 'powerStation-week') {
      // 周报不显示时间粒度选择器
    } else if (data.id.startsWith('powerStation-')) {
      const typeMap: Record<string, TimeGranularity> = {
        'powerStation-day': 'date',
        'powerStation-month': 'month',
        'powerStation-year': 'year'
      }
      timeGranularity.value = typeMap[data.id] || 'date'
    }
    
    // 重置分页
    pagination.value.pageNum = 1
    handleQuery()
  }
}

// 时间粒度切换
function handleTimeGranularityChange(value: TimeGranularity) {
  timeGranularity.value = value
  
  // 调整日期
  const now = dayjs()
  if (value === 'date') {
    queryDate.value = now.format('YYYY-MM-DD')
  } else if (value === 'month') {
    queryDate.value = now.format('YYYY-MM-01')
  } else if (value === 'year') {
    queryDate.value = now.format('YYYY-01-01')
  }
  
  handleQuery()
}

// 排序变化
function handleSortChange({ prop, order }: any) {
  if (order) {
    sortField.value = prop
    sortOrder.value = order
  } else {
    sortField.value = ''
    sortOrder.value = undefined
  }
  handleQuery()
}

// 查询数据
async function handleQuery() {
  if (!selectedStation.value) {
    ElMessage.warning('请先选择电站')
    return
  }
  
  loading.value = true
  try {
    // 确定dateType
    let dateType: TimeGranularity = timeGranularity.value
    if (currentReportType.value === 'powerStation-week') {
      dateType = 'week'
    }
    
    // 格式化查询时间
    let formattedTime = queryDate.value
    if (dateType === 'month') {
      formattedTime = dayjs(queryDate.value).format('YYYY-MM')
    } else if (dateType === 'year') {
      formattedTime = dayjs(queryDate.value).format('YYYY')
    }
    
    const params = {
      regionId: selectedStation.value,
      dateType,
      dateTime: formattedTime,
      sort: sortField.value,
      order: sortOrder.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    
    let response
    if (currentReportType.value.startsWith('powerStation-')) {
      response = await getPowerStationReport(params)
    } else if (currentReportType.value === 'inverter') {
      response = await getInverterReport(params)
    } else if (currentReportType.value === 'emission') {
      response = await getEmissionReport(params)
    } else {
      ElMessage.info('该报表类型暂未实现')
      return
    }
    
    if (response.code === 200) {
      tableData.value = response.data.list || []
      pagination.value.total = response.data.total || 0
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

// 导出
function handleExport() {
  if (!tableData.value || tableData.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  try {
    // 获取报表类型名称
    const reportTypeMap: Record<ReportType, string> = {
      'powerStation-day': '电站运行日报表',
      'powerStation-week': '电站运行周报表',
      'powerStation-month': '电站运行月报表',
      'powerStation-year': '电站运行年报表',
      'inverter': '逆变器报表',
      'controller': '控制器报表',
      'energyMeter': '电能表报表',
      'emission': '节能减排报表'
    }
    
    const reportName = reportTypeMap[currentReportType.value] || '统计报表'
    const filename = generateTimestampFilename(reportName)
    
    // 导出数据
    downloadExcel(tableData.value, currentColumns.value, filename, reportName)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}

// 加载电站列表
async function loadStationList() {
  try {
    stationList.value = await getStationList()
    if (stationList.value.length > 0) {
      selectedStation.value = stationList.value[0].value
      handleQuery()
    }
  } catch (error) {
    console.error('加载电站列表失败:', error)
    ElMessage.error('加载电站列表失败')
  }
}

// 监听筛选文本
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 组件挂载
onMounted(() => {
  loadStationList()
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
</style>
