<template>
  <div class="alarm-list-card">
    <div class="card-header">
      <span class="card-title">告警列表</span>
      <el-button type="text" size="small" @click="goToRealtimeAlarm">更多</el-button>
    </div>
    <div class="alarm-table">
      <div class="table-header">
        <div class="col-level">告警级别</div>
        <div class="col-name">告警名称</div>
        <div class="col-location">告警位置</div>
        <div class="col-time">告警时间</div>
        <div class="col-status">确认状态</div>
      </div>
      <div class="table-body">
        <div 
          v-for="alarm in alarms" 
          :key="alarm.id"
          class="table-row"
        >
          <div class="col-level">
            <span :class="['level-badge', alarm.level]">{{ alarm.levelText }}</span>
          </div>
          <div class="col-name">{{ alarm.alarmName }}</div>
          <div class="col-location">{{ alarm.location }}</div>
          <div class="col-time">{{ alarm.alarmTime }}</div>
          <div class="col-status">
            <span :class="['status-badge', alarm.status]">{{ alarm.statusText }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

// 路由
const router = useRouter()

// 告警数据类型
interface AlarmData {
  id: number
  level: string       // warning / error / info
  levelText: string
  alarmName: string
  location: string
  alarmTime: string
  status: string      // pending / confirmed / resolved
  statusText: string
}

/**
 * 组件Props
 */
interface Props {
  alarms?: AlarmData[]
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const alarmsRef = ref<AlarmData[]>([])

// 使用props或本地数据
const alarms = computed(() => props.alarms || alarmsRef.value)

/**
 * 生成模拟三级告警数据
 */
const generateMockAlarms = (): AlarmData[] => {
  const now = dayjs()
  const sources = ['预处理', 'I段AAO', '二沉池及出水', '污泥脱水', '鼓风机房', '加药系统', '高效沉淀池']
  const urgentNames = ['设备过载告警', '温度超限告警', 'pH值严重超标']
  const importantNames = ['参数偏离告警', '液位偏高告警', 'COD浓度告警', '溶解氧偏低']
  const normalNames = ['维护提醒', '通信延迟提示', '采集间隔异常', '备用设备提示']
  const statuses: Array<{ status: string; statusText: string }> = [
    { status: 'pending', statusText: '未处理' },
    { status: 'confirmed', statusText: '已确认' },
    { status: 'resolved', statusText: '已处理' }
  ]

  const items: AlarmData[] = []
  for (let i = 0; i < 10; i++) {
    const r = Math.random()
    const levelNum = r < 0.2 ? 3 : r < 0.5 ? 2 : 1
    const names = levelNum === 3 ? urgentNames : levelNum === 2 ? importantNames : normalNames
    const levelMap: Record<number, { level: string; levelText: string }> = {
      3: { level: 'error', levelText: '紧急' },
      2: { level: 'warning', levelText: '重要' },
      1: { level: 'info', levelText: '一般' }
    }
    const st = statuses[Math.floor(Math.random() * statuses.length)]

    items.push({
      id: 3000 + i,
      ...levelMap[levelNum],
      alarmName: names[Math.floor(Math.random() * names.length)],
      location: sources[Math.floor(Math.random() * sources.length)],
      alarmTime: now.subtract(Math.floor(Math.random() * 720), 'minute').format('MM-DD HH:mm'),
      ...st
    })
  }
  items.sort((a, b) => {
    const order: Record<string, number> = { error: 0, warning: 1, info: 2 }
    return (order[a.level] ?? 2) - (order[b.level] ?? 2)
  })
  return items
}

/**
 * 加载数据
 */
const loadData = async () => {
  if (props.alarms) return
  loading.value = true
  try {
    alarmsRef.value = generateMockAlarms()
  } finally {
    loading.value = false
  }
}

/**
 * 跳转到实时告警页面
 */
const goToRealtimeAlarm = () => {
  router.push('/pv/diagnosis/alarm-realtime')
}

// 组件挂载后加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.alarm-list-card {
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.card-title {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 500;
}

.alarm-table {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);
  overflow: hidden; // 防止整体溢出
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 140px 80px;
  gap: 16px;
  padding: 8px 0;
  align-items: center;
}

.table-header {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  flex-shrink: 0; // 防止表头被压缩
}

.table-body {
  flex: 1;
  overflow-y: auto; // 启用垂直滚动
  overflow-x: hidden;
  min-height: 0; // 允许flex收缩
}

.table-row {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  
  &:last-child {
    border-bottom: none; // 最后一行不显示边框
  }
}

// 美化滚动条
.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: rgba(10, 22, 40, 0.6);
  border-radius: 3px;
  margin: 4px 0;
}

.table-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00d4ff 0%, #0099cc 100%);
  border-radius: 3px;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #00e5ff 0%, #00b8e6 100%);
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.6);
}

.level-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: white;
}

.level-badge.warning {
  background: #f59e0b;
}

.level-badge.error {
  background: #ef4444;
}

.level-badge.info {
  background: #3b82f6;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-badge.confirmed {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-badge.resolved {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
</style>

