<template>
  <DeviceMonitorLayout>
    <!-- ========== 左侧工艺流程树菜单 ========== -->
    <template #left>
      <div style="padding: 10px; color: #fff;">
        <el-input v-model="treeSearch" placeholder="请输入关键字搜索" clearable style="margin-bottom: 15px;" />
        <el-tree
          :data="stationTree"
          :props="{ label: 'name', children: 'children' }"
          @node-click="handleNodeClick"
          default-expand-all
          highlight-current
          style="background: transparent; color: #fff;"
        />
      </div>
    </template>

    <!-- ========== 右侧内容区 ========== -->
    <template #right>
      <div class="alarm-history-wrapper">
        <!-- 顶部二级导航标签栏 -->
        <div class="sub-nav-bar">
          <router-link
            v-for="tab in navTabs"
            :key="tab.path"
            :to="tab.path"
            :class="['nav-tab', { active: isActiveTab(tab.path) }]"
          >{{ tab.name }}</router-link>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-area">
          <el-row :gutter="12" align="middle">
            <el-col :span="4">
              <el-select v-model="filter.level" placeholder="告警等级" clearable size="small" style="width:100%">
                <el-option label="全部" value="" />
                <el-option label="紧急" :value="3" />
                <el-option label="重要" :value="2" />
                <el-option label="一般" :value="1" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="filter.deviceType" placeholder="设备类型" clearable size="small" style="width:100%">
                <el-option label="全部" value="" />
                <el-option label="泵类" value="泵类" />
                <el-option label="风机" value="风机" />
                <el-option label="阀门" value="阀门" />
                <el-option label="传感器" value="传感器" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input v-model="filter.deviceName" placeholder="设备名称" clearable size="small" />
            </el-col>
            <el-col :span="4">
              <el-input v-model="filter.alarmName" placeholder="告警名称" clearable size="small" />
            </el-col>
            <el-col :span="4">
              <el-select v-model="filter.confirmStatus" placeholder="确认状态" clearable size="small" style="width:100%">
                <el-option label="全部" value="" />
                <el-option label="未确认" value="unconfirmed" />
                <el-option label="已确认" value="confirmed" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="12" align="middle" style="margin-top: 8px;">
            <el-col :span="8">
              <span class="filter-label">告警产生时间</span>
              <el-date-picker
                v-model="filter.alarmTimeRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="small"
                style="width: calc(100% - 90px);"
                value-format="YYYY-MM-DD"
              />
            </el-col>
            <el-col :span="8">
              <span class="filter-label">告警消除时间</span>
              <el-date-picker
                v-model="filter.clearTimeRange"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="small"
                style="width: calc(100% - 90px);"
                value-format="YYYY-MM-DD"
              />
            </el-col>
            <el-col :span="8" style="text-align: right;">
              <el-button size="small" @click="handleReset">重置</el-button>
              <el-button type="warning" size="small" @click="handleBatchConfirm">批量确认</el-button>
              <el-button type="success" size="small" @click="handleExport">导出</el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 告警列表表格 -->
        <div class="table-area">
          <el-table
            ref="tableRef"
            :data="paginatedData"
            stripe
            style="width: 100%"
            @selection-change="handleSelectionChange"
            :header-cell-style="{ background: 'rgba(0,40,80,0.6)', color: '#00d4ff', fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.2)' }"
            :cell-style="{ fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.08)' }"
            max-height="calc(100vh - 320px)"
          >
            <el-table-column type="selection" width="45" align="center" />
            <el-table-column label="告警等级" width="85" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="row.level === 3 ? 'danger' : row.level === 2 ? 'warning' : 'info'"
                  size="small" effect="dark"
                >{{ getLevelText(row.level) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="告警名称" min-width="140" prop="alarmName" show-overflow-tooltip />
            <el-table-column label="所属工艺" width="120" prop="source" align="center" />
            <el-table-column label="告警设备" width="140" prop="deviceName" show-overflow-tooltip />
            <el-table-column label="设备类型" width="90" prop="deviceType" align="center" />
            <el-table-column label="告警产生时间" width="158" prop="alarmTime" align="center" />
            <el-table-column label="告警消除时间" width="158" prop="clearTime" align="center" />
            <el-table-column label="告警状态" width="85" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.alarmStatus === '已消除' ? '#67c23a' : '#ff4444' }">
                  {{ row.alarmStatus }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="确认状态" width="85" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.confirmStatus === '已确认' ? '#67c23a' : '#ffb800' }">
                  {{ row.confirmStatus }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-bar">
            <span class="total-text">共 {{ filteredData.length }} 条</span>
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[20, 40, 60, 100]"
              :total="filteredData.length"
              layout="prev, pager, next, sizes, jumper"
              small
            />
          </div>
        </div>

        <!-- 详情弹窗 -->
        <el-dialog v-model="detailVisible" title="告警详情" width="520px" destroy-on-close>
          <div v-if="selectedAlarm" class="detail-content">
            <div class="detail-row"><span class="detail-label">告警等级：</span><el-tag :type="selectedAlarm.level === 3 ? 'danger' : selectedAlarm.level === 2 ? 'warning' : 'info'" size="small" effect="dark">{{ getLevelText(selectedAlarm.level) }}</el-tag></div>
            <div class="detail-row"><span class="detail-label">告警名称：</span><span>{{ selectedAlarm.alarmName }}</span></div>
            <div class="detail-row"><span class="detail-label">所属工艺：</span><span>{{ selectedAlarm.source }}</span></div>
            <div class="detail-row"><span class="detail-label">告警设备：</span><span>{{ selectedAlarm.deviceName }}</span></div>
            <div class="detail-row"><span class="detail-label">设备类型：</span><span>{{ selectedAlarm.deviceType }}</span></div>
            <div class="detail-row"><span class="detail-label">产生时间：</span><span>{{ selectedAlarm.alarmTime }}</span></div>
            <div class="detail-row"><span class="detail-label">消除时间：</span><span>{{ selectedAlarm.clearTime || '--' }}</span></div>
            <div class="detail-row"><span class="detail-label">告警状态：</span><span>{{ selectedAlarm.alarmStatus }}</span></div>
            <div class="detail-row"><span class="detail-label">确认状态：</span><span>{{ selectedAlarm.confirmStatus }}</span></div>
            <div class="detail-row"><span class="detail-label">整改建议：</span><span>{{ selectedAlarm.suggest }}</span></div>
          </div>
          <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
          </template>
        </el-dialog>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 历史告警页面 - 参考 jeecg 告警列表大屏样式
 * 左侧工艺流程树 + 顶部二级Tab导航 + 筛选 + 数据表格
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import dayjs from 'dayjs'

const route = useRoute()
const prefix = computed(() => route.path.startsWith('/es') ? '/es' : '/pv')

// ==================== 二级导航标签 ====================
const navTabs = computed(() => [
  { name: '告警概览', path: `${prefix.value}/diagnosis/alarm-overview` },
  { name: '实时告警', path: `${prefix.value}/diagnosis/alarm-realtime` },
  { name: '历史告警', path: `${prefix.value}/diagnosis/alarm-history` },
  { name: '告警规则', path: `${prefix.value}/diagnosis/alarm-rules` },
  { name: '告警统计', path: `${prefix.value}/diagnosis/alarm-statistics` },
])
const isActiveTab = (path: string) => route.path === path

// ==================== 左侧工艺树 ====================
const treeSearch = ref('')
const selectedNode = ref('')
const stationTree = ref([
  {
    name: '污水处理厂',
    children: [
      { id: 'pre-treatment', name: '预处理' },
      { id: 'stage1-aao', name: 'I段AAO' },
      { id: 'sedimentation', name: '二沉池及出水' },
      { id: 'sludge', name: '污泥脱水' },
      { id: 'high-sedimentation', name: '高效沉淀池' },
      { id: 'denitrification', name: '反硝化深床滤池' },
      { id: 'dosing', name: '加药系统' },
      { id: 'stage2-aao', name: 'II段AAO' },
      { id: 'blower', name: '鼓风机房' },
    ]
  }
])

const handleNodeClick = (node: any) => {
  if (node.id) {
    selectedNode.value = node.id
    currentPage.value = 1
  }
}

// ==================== 筛选状态 ====================
const filter = ref({
  level: '' as number | string,
  deviceType: '',
  deviceName: '',
  alarmName: '',
  confirmStatus: '',
  alarmTimeRange: null as string[] | null,
  clearTimeRange: null as string[] | null,
})

// ==================== 表格状态 ====================
const currentPage = ref(1)
const pageSize = ref(40)
const selectedRows = ref<any[]>([])
const detailVisible = ref(false)
const selectedAlarm = ref<any>(null)

// ==================== 告警数据类型 ====================
interface HistoryAlarmItem {
  id: number
  level: number
  alarmName: string
  source: string
  deviceName: string
  deviceType: string
  alarmTime: string
  clearTime: string
  alarmStatus: string   // 活动 / 已消除
  confirmStatus: string // 未确认 / 已确认
  suggest: string
}

// ==================== 模拟数据生成 ====================
const allData = ref<HistoryAlarmItem[]>([])

const generateMockData = (): HistoryAlarmItem[] => {
  const sources = ['预处理', 'I段AAO', '二沉池及出水', '污泥脱水', '高效沉淀池', '反硝化深床滤池', '加药系统', 'II段AAO', '鼓风机房']
  const devices = ['1#提升泵', '2#鼓风机', 'PAC加药泵', '回流泵A', '3#搅拌器', '脱水机A', '进水闸门', '格栅机B', '排泥阀C', '变频器D']
  const deviceTypes = ['泵类', '风机', '阀门', '传感器', '泵类', '泵类', '阀门', '传感器', '阀门', '传感器']
  const alarmNames = [
    '系统地址异常越限', '设备运行参数偏离', '设备过载保护动作',
    '温度超限告警', '液位传感器测量值偏高', 'COD浓度接近上限',
    'pH值严重超标', '溶解氧浓度持续偏低', '通信延迟增大',
    '设备巡检提醒', '机组地址异常越限', '频率传感异常',
    '数据采集间隔异常', '备用设备未就绪提示', '传感器校准提醒'
  ]
  const suggests = [
    '建议立即安排维修人员现场处理', '建议调整设备运行参数至标准范围',
    '建议检查传感器接线及通信链路', '建议提高巡检频次，持续关注',
    '1、检验监控网', '1、检查通信链路'
  ]

  const result: HistoryAlarmItem[] = []
  const now = dayjs()

  for (let i = 0; i < 687; i++) {
    const rand = Math.random()
    const level = rand < 0.15 ? 3 : rand < 0.45 ? 2 : 1
    const devIdx = Math.floor(Math.random() * devices.length)
    const isCleared = Math.random() > 0.3
    const alarmTime = now.subtract(Math.floor(Math.random() * 30 * 24 * 60), 'minute')
    const clearTime = isCleared ? alarmTime.add(Math.floor(Math.random() * 120) + 1, 'minute') : null

    result.push({
      id: 5000 + i,
      level,
      alarmName: alarmNames[Math.floor(Math.random() * alarmNames.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      deviceName: devices[devIdx],
      deviceType: deviceTypes[devIdx],
      alarmTime: alarmTime.format('YYYY-MM-DD HH:mm:ss'),
      clearTime: clearTime ? clearTime.format('YYYY-MM-DD HH:mm:ss') : '',
      alarmStatus: isCleared ? '已消除' : '活动',
      confirmStatus: Math.random() > 0.5 ? '已确认' : '未确认',
      suggest: suggests[Math.floor(Math.random() * suggests.length)]
    })
  }
  result.sort((a, b) => dayjs(b.alarmTime).valueOf() - dayjs(a.alarmTime).valueOf())
  return result
}

// ==================== 计算属性 ====================
const filteredData = computed(() => {
  return allData.value.filter(item => {
    if (filter.value.level && item.level !== Number(filter.value.level)) return false
    if (filter.value.deviceType && item.deviceType !== filter.value.deviceType) return false
    if (filter.value.deviceName && !item.deviceName.includes(filter.value.deviceName)) return false
    if (filter.value.alarmName && !item.alarmName.includes(filter.value.alarmName)) return false
    if (filter.value.confirmStatus === 'confirmed' && item.confirmStatus !== '已确认') return false
    if (filter.value.confirmStatus === 'unconfirmed' && item.confirmStatus !== '未确认') return false
    if (selectedNode.value) {
      const nodeNameMap: Record<string, string> = {
        'pre-treatment': '预处理', 'stage1-aao': 'I段AAO', 'sedimentation': '二沉池及出水',
        'sludge': '污泥脱水', 'high-sedimentation': '高效沉淀池', 'denitrification': '反硝化深床滤池',
        'dosing': '加药系统', 'stage2-aao': 'II段AAO', 'blower': '鼓风机房',
      }
      if (nodeNameMap[selectedNode.value] && item.source !== nodeNameMap[selectedNode.value]) return false
    }
    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

// ==================== 工具方法 ====================
const getLevelText = (level: number) => ({ 1: '一般', 2: '重要', 3: '紧急' }[level] || '未知')

// ==================== 事件处理 ====================
const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filter.value = { level: '', deviceType: '', deviceName: '', alarmName: '', confirmStatus: '', alarmTimeRange: null, clearTimeRange: null }
  selectedNode.value = ''
  currentPage.value = 1
}
const handleSelectionChange = (rows: any[]) => { selectedRows.value = rows }
const handleBatchConfirm = () => {
  if (selectedRows.value.length === 0) { ElMessage.warning('请先选择告警记录'); return }
  selectedRows.value.forEach(r => { r.confirmStatus = '已确认' })
  ElMessage.success(`已批量确认 ${selectedRows.value.length} 条告警`)
}
const handleExport = () => { ElMessage.success('导出功能开发中...') }
const handleDetail = (row: any) => { selectedAlarm.value = row; detailVisible.value = true }

// ==================== 生命周期 ====================
onMounted(() => { allData.value = generateMockData() })
</script>

<style scoped lang="scss">
.alarm-history-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ========== 二级导航栏 ========== */
.sub-nav-bar {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 42px;
  background: rgba(10, 24, 45, 0.9);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  flex-shrink: 0;

  .nav-tab {
    padding: 8px 20px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.25s;
    border-bottom: 2px solid transparent;
    line-height: 24px;

    &:hover { color: rgba(255, 255, 255, 0.85); }
    &.active {
      color: #00d4ff;
      border-bottom-color: #00d4ff;
      font-weight: 600;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
    }
  }
}

/* ========== 筛选区域 ========== */
.filter-area {
  padding: 10px 14px;
  background: rgba(10, 24, 45, 0.6);
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
  flex-shrink: 0;

  .filter-label {
    color: rgba(255,255,255,0.65);
    font-size: 12px;
    margin-right: 6px;
    white-space: nowrap;
  }
}

/* ========== 表格区域 ========== */
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

  .total-text {
    color: rgba(255,255,255,0.6);
    font-size: 12px;
  }
}

/* ========== 详情弹窗 ========== */
.detail-content {
  .detail-row {
    display: flex;
    align-items: flex-start;
    padding: 9px 0;
    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
    font-size: 13px;
    color: rgba(255,255,255,0.9);
    &:last-child { border-bottom: none; }

    .detail-label {
      flex-shrink: 0;
      width: 85px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
