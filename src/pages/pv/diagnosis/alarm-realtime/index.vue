<template>
  <div class="alarm-realtime-page">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="16" align="middle">
        <el-col :span="5">
          <el-select v-model="filterLevel" placeholder="告警级别" clearable style="width: 100%">
            <el-option label="一般" :value="1" />
            <el-option label="重要" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 100%">
            <el-option label="未处理" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="filterSource" placeholder="告警来源" clearable style="width: 100%">
            <el-option label="预处理" value="预处理" />
            <el-option label="I段AAO" value="I段AAO" />
            <el-option label="二沉池及出水" value="二沉池及出水" />
            <el-option label="污泥脱水" value="污泥脱水" />
            <el-option label="鼓风机房" value="鼓风机房" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <div class="stat-card stat-total">
          <div class="stat-number">{{ filteredAlarms.length }}</div>
          <div class="stat-label">告警总数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-urgent">
          <div class="stat-number">{{ urgentCount }}</div>
          <div class="stat-label">紧急告警</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-important">
          <div class="stat-number">{{ importantCount }}</div>
          <div class="stat-label">重要告警</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-normal">
          <div class="stat-number">{{ normalCount }}</div>
          <div class="stat-label">一般告警</div>
        </div>
      </el-col>
    </el-row>

    <!-- 告警列表表格 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="paginatedAlarms" stripe style="width: 100%" @row-click="handleRowClick">
        <el-table-column label="序号" width="60" align="center" type="index" :index="getIndex" />
        <el-table-column label="告警级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)" size="small" effect="dark">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="告警内容" min-width="200" prop="content" show-overflow-tooltip />
        <el-table-column label="告警来源" width="140" prop="source" align="center" />
        <el-table-column label="设备名称" width="150" prop="deviceName" show-overflow-tooltip />
        <el-table-column label="告警时间" width="170" prop="time" align="center" />
        <el-table-column label="持续时间" width="100" align="center">
          <template #default="{ row }">
            {{ row.duration }}s
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredAlarms.length"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>

    <!-- 告警详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="告警详情"
      width="520px"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div v-if="selectedAlarm" class="detail-content">
        <div class="detail-row">
          <span class="detail-label">告警级别：</span>
          <el-tag :type="getLevelTagType(selectedAlarm.level)" size="small" effect="dark">
            {{ getLevelText(selectedAlarm.level) }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">告警内容：</span>
          <span class="detail-value">{{ selectedAlarm.content }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">告警来源：</span>
          <span class="detail-value">{{ selectedAlarm.source }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">设备名称：</span>
          <span class="detail-value">{{ selectedAlarm.deviceName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">告警时间：</span>
          <span class="detail-value">{{ selectedAlarm.time }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">持续时间：</span>
          <span class="detail-value">{{ selectedAlarm.duration }}秒</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">事件归类：</span>
          <span class="detail-value">{{ selectedAlarm.categorize }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">整改建议：</span>
          <span class="detail-value">{{ selectedAlarm.suggest }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">处理状态：</span>
          <el-tag :type="getStatusTagType(selectedAlarm.status)" size="small">
            {{ getStatusText(selectedAlarm.status) }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="selectedAlarm && selectedAlarm.status === 'pending'"
          type="warning"
          @click="handleConfirm"
        >确认告警</el-button>
        <el-button
          v-if="selectedAlarm && selectedAlarm.status !== 'resolved'"
          type="success"
          @click="handleResolve"
        >处理完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

// ==================== 告警数据类型定义 ====================
interface AlarmItem {
  id: number
  level: number        // 1-一般, 2-重要, 3-紧急
  content: string      // 告警内容
  source: string       // 告警来源（对应工艺流程）
  deviceName: string   // 设备名称
  time: string         // 告警时间
  duration: number     // 持续时间（秒）
  categorize: string   // 事件归类
  suggest: string      // 整改建议
  status: 'pending' | 'confirmed' | 'resolved' // 处理状态
}

// ==================== 状态 ====================
const filterLevel = ref<number | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)
const filterSource = ref<string | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const selectedAlarm = ref<AlarmItem | null>(null)

// ==================== 模拟告警数据（三级告警） ====================
const alarmList = ref<AlarmItem[]>([])

// 生成模拟数据
const generateMockAlarms = (): AlarmItem[] => {
  const sources = ['预处理', 'I段AAO', '二沉池及出水', '污泥脱水', '高效沉淀池', '反硝化深床滤池', '加药系统', 'II段AAO', '鼓风机房']
  const devices = ['1#提升泵', '2#鼓风机', '进水闸门', 'PAC加药泵', '回流泵', '3#搅拌器', '脱水机A', '排泥阀', '格栅机']
  const urgentContents = [
    '设备过载严重，请立即停机检修', '温度超限告警，已达到危险阈值',
    '压力传感器异常，压力骤升', '电机过流保护动作，已自动断开',
    'pH值严重超标，出水不合格'
  ]
  const importantContents = [
    '设备运行参数偏离标准范围', '液位传感器测量值偏高',
    'COD浓度接近上限', '溶解氧浓度持续偏低',
    '加药量超标需关注', '回流污泥浓度异常'
  ]
  const normalContents = [
    '设备巡检提醒：已到达维护周期', '通信延迟轻微增大',
    '数据采集间隔异常', '备用设备未就绪提示',
    '传感器校准提醒', '滤池反冲洗周期到达'
  ]
  const categories = ['设备故障', '参数越限', '通信异常', '运行告警', '维护提醒']
  const suggests = [
    '建议立即安排维修人员现场处理',
    '建议调整设备运行参数至标准范围',
    '建议检查传感器接线及通信链路',
    '建议提高巡检频次，持续关注',
    '建议安排计划性维护保养'
  ]

  const result: AlarmItem[] = []
  const now = dayjs()

  for (let i = 0; i < 35; i++) {
    // 随机分配三级告警：约20%紧急, 30%重要, 50%一般
    const rand = Math.random()
    const level = rand < 0.2 ? 3 : rand < 0.5 ? 2 : 1
    const contents = level === 3 ? urgentContents : level === 2 ? importantContents : normalContents
    const statuses: Array<'pending' | 'confirmed' | 'resolved'> = ['pending', 'confirmed', 'resolved']

    result.push({
      id: 1000 + i,
      level,
      content: contents[Math.floor(Math.random() * contents.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      deviceName: devices[Math.floor(Math.random() * devices.length)],
      time: now.subtract(Math.floor(Math.random() * 24 * 60), 'minute').format('YYYY-MM-DD HH:mm:ss'),
      duration: Math.floor(Math.random() * 3600) + 10,
      categorize: categories[Math.floor(Math.random() * categories.length)],
      suggest: suggests[Math.floor(Math.random() * suggests.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    })
  }
  // 按时间倒序排列
  result.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
  return result
}

// ==================== 计算属性 ====================
const filteredAlarms = computed(() => {
  return alarmList.value.filter(a => {
    if (filterLevel.value && a.level !== filterLevel.value) return false
    if (filterStatus.value && a.status !== filterStatus.value) return false
    if (filterSource.value && a.source !== filterSource.value) return false
    return true
  })
})

const paginatedAlarms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAlarms.value.slice(start, start + pageSize.value)
})

const urgentCount = computed(() => filteredAlarms.value.filter(a => a.level === 3).length)
const importantCount = computed(() => filteredAlarms.value.filter(a => a.level === 2).length)
const normalCount = computed(() => filteredAlarms.value.filter(a => a.level === 1).length)

// ==================== 工具方法 ====================
const getLevelText = (level: number) => ({ 1: '一般', 2: '重要', 3: '紧急' }[level] || '未知')
const getLevelTagType = (level: number) => ({ 1: 'info', 2: 'warning', 3: 'danger' }[level] || 'info') as any
const getStatusText = (status: string) => ({ pending: '未处理', confirmed: '已确认', resolved: '已处理' }[status] || '未知')
const getStatusTagType = (status: string) => ({ pending: 'danger', confirmed: 'warning', resolved: 'success' }[status] || 'info') as any
const getIndex = (index: number) => (currentPage.value - 1) * pageSize.value + index + 1

// ==================== 事件处理 ====================
const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterLevel.value = undefined
  filterStatus.value = undefined
  filterSource.value = undefined
  currentPage.value = 1
}

const handleRowClick = (row: AlarmItem) => { showDetail(row) }
const showDetail = (row: AlarmItem) => {
  selectedAlarm.value = { ...row }
  detailVisible.value = true
}

const handleConfirm = () => {
  if (!selectedAlarm.value) return
  const found = alarmList.value.find(a => a.id === selectedAlarm.value!.id)
  if (found) found.status = 'confirmed'
  selectedAlarm.value.status = 'confirmed'
  ElMessage.success('告警已确认')
}

const handleResolve = () => {
  if (!selectedAlarm.value) return
  const found = alarmList.value.find(a => a.id === selectedAlarm.value!.id)
  if (found) found.status = 'resolved'
  selectedAlarm.value.status = 'resolved'
  ElMessage.success('告警已处理')
}

// ==================== 生命周期 ====================
onMounted(() => {
  alarmList.value = generateMockAlarms()
})
</script>

<style scoped lang="scss">
.alarm-realtime-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card, .table-card {
  background: rgba(10, 24, 45, 0.7);
  border: 1px solid rgba(0, 212, 255, 0.2);
  :deep(.el-card__body) { padding: 16px; }
}

.stat-row {
  .stat-card {
    background: rgba(10, 24, 45, 0.7);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 8px;
    padding: 18px 20px;
    text-align: center;
    .stat-number { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .stat-label { font-size: 13px; color: rgba(255,255,255,0.65); }
  }
  .stat-total .stat-number { color: #00d4ff; }
  .stat-urgent .stat-number { color: #ff4444; }
  .stat-important .stat-number { color: #ffb800; }
  .stat-normal .stat-number { color: #67c23a; }
}

.detail-content {
  .detail-row {
    display: flex;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
    &:last-child { border-bottom: none; }

    .detail-label {
      flex-shrink: 0;
      width: 90px;
      color: rgba(255, 255, 255, 0.65);
      font-size: 14px;
    }
    .detail-value {
      flex: 1;
      color: rgba(255, 255, 255, 0.95);
      font-size: 14px;
    }
  }
}
</style>
