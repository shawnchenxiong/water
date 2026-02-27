<template>
  <DeviceMonitorLayout>
    <!-- ========== 左侧报表类型树菜单 ========== -->
    <template #left>
      <div style="padding: 10px; color: #fff;">
        <el-input v-model="treeSearch" placeholder="输入关键字进行搜索" clearable style="margin-bottom: 15px;" />
        <el-tree
          :data="reportTree"
          :props="{ label: 'name', children: 'children' }"
          @node-click="handleReportSelect"
          default-expand-all
          highlight-current
          style="background: transparent; color: #fff;"
        />
      </div>
    </template>

    <!-- ========== 右侧内容区 ========== -->
    <template #right>
      <div class="report-wrapper">
        <!-- 顶部筛选栏 -->
        <div class="filter-bar">
          <div class="filter-left">
            <span class="filter-label">工艺：</span>
            <el-select v-model="filterSource" placeholder="全部工艺" clearable size="small" style="width: 160px;">
              <el-option label="全部工艺" value="" />
              <el-option v-for="s in sources" :key="s" :label="s" :value="s" />
            </el-select>

            <span class="filter-label" style="margin-left: 16px;">时间粒度：</span>
            <el-radio-group v-model="timeGranularity" size="small" @change="handleSearch">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>

            <el-date-picker
              v-model="selectedDate"
              :type="datePickerType"
              :format="dateFormat"
              placeholder="选择日期"
              size="small"
              style="width: 160px; margin-left: 12px;"
              @change="handleSearch"
            />
          </div>
          <div class="filter-right">
            <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
            <el-button size="small" @click="handleExport">导出</el-button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-area">
          <el-table
            :data="paginatedData"
            stripe
            style="width: 100%"
            :header-cell-style="{ background: 'rgba(0,40,80,0.6)', color: '#00d4ff', fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.2)' }"
            :cell-style="{ fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.08)' }"
            max-height="calc(100vh - 210px)"
          >
            <el-table-column label="所属工艺" width="140" prop="source" align="center" />
            <el-table-column label="设备名称" min-width="160" prop="deviceName" show-overflow-tooltip />
            <el-table-column label="装机容量(kWp)" width="130" prop="capacity" align="right">
              <template #default="{ row }">{{ row.capacity.toFixed(1) }}</template>
            </el-table-column>
            <el-table-column label="处理水量(kWh)" width="140" prop="processVolume" align="right">
              <template #default="{ row }">{{ row.processVolume > 0 ? row.processVolume.toFixed(2) : '-' }}</template>
            </el-table-column>
            <el-table-column label="等效运行时(h)" width="130" prop="equivalentHours" align="right">
              <template #default="{ row }">{{ row.equivalentHours > 0 ? row.equivalentHours.toFixed(2) : '-' }}</template>
            </el-table-column>
            <el-table-column label="最大有功功率(kW)" width="160" prop="maxPower" align="right">
              <template #default="{ row }">{{ row.maxPower > 0 ? row.maxPower.toFixed(2) : '-' }}</template>
            </el-table-column>
            <el-table-column label="最大有功功率时间" width="175" prop="maxPowerTime" align="center">
              <template #default="{ row }">{{ row.maxPowerTime || '-' }}</template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-bar">
            <span class="total-text">共 {{ allData.length }} 条</span>
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="allData.length"
              layout="prev, pager, next, sizes, jumper"
              small
            />
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 统计报表页面 - 左侧报表类型树 + 右侧数据表格
 * 参考 jeecg 统计报表截图风格
 */
import { ref, computed, onMounted, watch } from 'vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

// ==================== 左侧报表树 ====================
const treeSearch = ref('')
const selectedReport = ref('daily')

const reportTree = ref([
  {
    name: '统计报表',
    children: [
      { id: 'daily', name: '运行日报表' },
      { id: 'monthly', name: '运行月报表' },
      { id: 'yearly', name: '运行年报表' },
      { id: 'device', name: '设备报表' },
      { id: 'energy', name: '能耗报表' },
      { id: 'water', name: '水质报表' },
      { id: 'sludge', name: '污泥报表' },
      { id: 'dosing', name: '加药报表' },
    ]
  }
])

const handleReportSelect = (node: any) => {
  if (node.id) {
    selectedReport.value = node.id
    handleSearch()
  }
}

// ==================== 筛选状态 ====================
const filterSource = ref('')
const timeGranularity = ref('day')
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const sources = ['预处理', 'I段AAO', '二沉池及出水', '污泥脱水', '高效沉淀池', '反硝化深床滤池', '加药系统', 'II段AAO', '鼓风机房']

const datePickerType = computed(() => ({ day: 'date', month: 'month', year: 'year' }[timeGranularity.value] || 'date') as any)
const dateFormat = computed(() => ({ day: 'YYYY-MM-DD', month: 'YYYY-MM', year: 'YYYY' }[timeGranularity.value] || 'YYYY-MM-DD'))

// ==================== 表格状态 ====================
const currentPage = ref(1)
const pageSize = ref(10)

// ==================== 模拟数据 ====================
interface ReportRow {
  source: string
  deviceName: string
  capacity: number
  processVolume: number
  equivalentHours: number
  maxPower: number
  maxPowerTime: string
}

const allData = ref<ReportRow[]>([])

const generateMockData = (): ReportRow[] => {
  const devices: { source: string; name: string; capacity: number }[] = [
    { source: '预处理', name: '粗格栅NB0131', capacity: 129.25 },
    { source: '预处理', name: '细格栅A-NB0102', capacity: 123.3 },
    { source: 'I段AAO', name: '厌氧池A NB0103', capacity: 199.15 },
    { source: 'I段AAO', name: '缺氧池A NB0201', capacity: 161.2 },
    { source: '二沉池及出水', name: '二沉池刮泥机NB0210', capacity: 44 },
    { source: '污泥脱水', name: '脱水离心机DC235', capacity: 121 },
    { source: '鼓风机房', name: '罗茨鼓风机NB0101', capacity: 118.8 },
    { source: '鼓风机房', name: '罗茨鼓风机NB0102', capacity: 123.3 },
    { source: '高效沉淀池', name: '高效沉淀池NB0301', capacity: 113.6 },
    { source: '反硝化深床滤池', name: '反硝化NB0210', capacity: 125.4 },
    { source: '加药系统', name: 'PAC加药泵P001', capacity: 88.5 },
    { source: 'II段AAO', name: '厌氧池B NB0401', capacity: 145.6 },
  ]

  const result: ReportRow[] = []
  const rand = (min: number, max: number) => Math.random() * (max - min) + min

  for (const d of devices) {
    if (filterSource.value && d.source !== filterSource.value) continue
    const hasData = Math.random() > 0.25
    result.push({
      source: d.source,
      deviceName: d.name,
      capacity: d.capacity,
      processVolume: hasData ? rand(10, 25) : 0,
      equivalentHours: hasData ? rand(0.05, 0.2) : 0,
      maxPower: hasData ? rand(8, 18) : 0,
      maxPowerTime: hasData ? dayjs().subtract(Math.floor(Math.random() * 24), 'hour').format('YYYY-MM-DD HH:mm:ss') : ''
    })
  }
  return result
}

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return allData.value.slice(start, start + pageSize.value)
})

// ==================== 事件 ====================
const handleSearch = () => {
  currentPage.value = 1
  allData.value = generateMockData()
}

const handleExport = () => { ElMessage.success('导出功能开发中...') }

// ==================== 生命周期 ====================
onMounted(() => { allData.value = generateMockData() })
</script>

<style scoped lang="scss">
.report-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(10, 24, 45, 0.6);
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
  flex-shrink: 0;

  .filter-left {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .filter-right {
    display: flex;
    gap: 8px;
  }
  .filter-label {
    color: rgba(255,255,255,0.65);
    font-size: 12px;
    white-space: nowrap;
  }
}

.table-area {
  flex: 1;
  padding: 0 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 8px 0;
  flex-shrink: 0;
  .total-text { color: rgba(255,255,255,0.6); font-size: 12px; }
}
</style>
