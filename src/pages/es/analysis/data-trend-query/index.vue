<template>
  <DeviceMonitorLayout>
    <!-- ========== 左侧工艺流程/监控点树 ========== -->
    <template #left>
      <div style="padding: 10px; color: #fff; height: 100%; display: flex; flex-direction: column;">
        <el-input v-model="treeSearch" placeholder="搜索监控点" clearable style="margin-bottom: 15px; flex-shrink: 0;" />

        <!-- 加载中 -->
        <div v-if="treeLoading" class="tree-loading" style="flex-shrink: 0;">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 工艺流程树 -->
        <el-tree
          v-else
          ref="treeRef"
          :data="filteredTreeData"
          :props="treeProps"
          node-key="value"
          :default-expanded-keys="defaultExpandedKeys"
          :current-node-key="currentPointValue"
          @node-click="handleNodeClick"
          highlight-current
          :expand-on-click-node="true"
          style="background: transparent; color: #fff; flex: 1; overflow-y: auto; margin-bottom: 10px;"
        >
          <template #default="{ data }">
            <span class="tree-node-label">
              <!-- 叶子节点显示图标 -->
              <el-icon v-if="!data.children || data.children.length === 0" class="leaf-icon"><Monitor /></el-icon>
              {{ data.label }}
            </span>
          </template>
        </el-tree>

        <!-- 手动测试点位 -->
        <div class="manual-test-box">
          <div class="test-title">手动测试点位</div>
          <el-input v-model="testPointId" placeholder="点位ID (如: 14030)" size="small" style="margin-bottom: 8px;" clearable />
          <el-input v-model="testTenantId" placeholder="租户ID (如: 1)" size="small" style="margin-bottom: 8px;" clearable />
          <el-button type="primary" size="small" style="width: 100%;" @click="handleManualTest">
            {{ dataMode === 'realtime' ? '连接实时数据' : '查询历史数据' }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- ========== 右侧内容区 ========== -->
    <template #right>
      <div class="content-container">
        <!-- 顶部控制栏 -->
        <div class="control-bar">
          <div class="left-controls">
            <!-- 当前选中的监控点名称 -->
            <div class="current-point-info">
              <span class="point-label">{{ currentPointLabel || '请选择监控点' }}</span>
              <!-- WebSocket 状态标识 -->
              <el-tag
                v-if="currentPointValue && dataMode === 'realtime'"
                :type="wsStatusType"
                size="small"
                class="ws-status-tag"
              >
                {{ wsStatusText }}
              </el-tag>
            </div>
          </div>

          <div class="right-controls">
            <!-- 数据模式切换 -->
            <el-radio-group v-model="dataMode" size="default" @change="handleModeChange">
              <el-radio-button label="realtime">实时数据</el-radio-button>
              <el-radio-button label="history">历史数据</el-radio-button>
            </el-radio-group>

            <!-- 历史数据查询条件 -->
            <template v-if="dataMode === 'history'">
              <el-select v-model="historyDateType" size="default" style="width: 80px;" :disabled="!!historyDateRange">
                <el-option label="按日" value="date" />
                <el-option label="按月" value="month" />
                <el-option label="按年" value="year" />
              </el-select>
              <el-date-picker
                v-model="historyDate"
                :type="historyDateType"
                placeholder="基准时间"
                :format="historyDateType === 'year' ? 'YYYY' : (historyDateType === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD')"
                :value-format="historyDateType === 'year' ? 'YYYY' : (historyDateType === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD')"
                size="default"
                clearable
                :disabled="!!historyDateRange"
                style="width: 130px;"
              />
              <el-date-picker
                v-model="historyDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                size="default"
                clearable
                :disabled="!!historyDate"
                style="width: 380px;"
              />
              <el-button type="primary" :icon="Search" @click="handleHistoryQuery" :loading="historyLoading">
                查询
              </el-button>
            </template>

            <!-- 实时数据显示控制 -->
            <template v-if="dataMode === 'realtime'">
              <span style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 4px 0 12px;">显示图表点数:</span>
              <el-input-number v-model="chartMaxPoints" :min="10" :max="10000" :step="100" size="default" style="width: 120px;" controls-position="right" />
              <span style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 4px 0 12px;">显示表格条数:</span>
              <el-input-number v-model="tableMaxPoints" :min="10" :max="2000" :step="50" size="default" style="width: 120px;" controls-position="right" />
            </template>

            <!-- 刷新按钮 -->
            <el-button :icon="Refresh" @click="handleRefresh" style="margin-left: 12px;">刷新</el-button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="summary-info">
          <div class="info-item">
            <span class="label">数据点数</span>
            <span class="value highlight">{{ dataPoints.length }}</span>
            <span class="unit">条</span>
          </div>
          <div class="info-item">
            <span class="label">最新值</span>
            <span class="value highlight">{{ latestValue }}</span>
            <span class="unit">-</span>
          </div>
          <div class="info-item">
            <span class="label">最大值</span>
            <span class="value highlight">{{ maxValue }}</span>
            <span class="unit">-</span>
          </div>
          <div class="info-item">
            <span class="label">最小值</span>
            <span class="value highlight">{{ minValue }}</span>
            <span class="unit">-</span>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-wrapper">
          <div ref="chartRef" class="trend-chart" v-loading="chartLoading"></div>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <div class="table-header">
            <span class="table-title">数据明细（最近 {{ dataMode === 'realtime' ? tableMaxPoints : tableData.length }} 条）</span>
            <el-button type="primary" size="small" @click="handleExport" :disabled="tableData.length === 0">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>

          <el-table
            :data="tableData"
            stripe
            :max-height="400"
            :header-cell-style="headerCellStyle"
            :cell-style="cellStyle"
          >
            <el-table-column prop="time" label="时间" width="200" />
            <el-table-column prop="value" label="数值" width="150" align="right">
              <template #default="{ row }">
                {{ typeof row.value === 'number' ? row.value.toFixed(2) : row.value }}
              </template>
            </el-table-column>
            <el-table-column prop="monitorId" label="监控点ID" width="150" />
          </el-table>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 鹤问湖二期 - 数据趋势查询页面
 *
 * 左侧树：从后端 getAllMonitorList 加载工艺流程层级结构
 * 右侧：选中叶子节点后，通过 WebSocket 接收实时监控数据，
 *       使用 ECharts 绘制实时趋势曲线
 *
 * WebSocket 地址：ws://.../websocket/monitorPointData/{pointValue}?tenantId={tenantId}
 * 返回数据：{ monitorId: "xxx", data: { "时间字符串": 数值, ... } }
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Loading, Monitor, Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import {
  getAllMonitorList,
  type MonitorTreeNode,
} from '@/api/monitorApi'
import {
  MonitorPointWs,
  type MonitorDataPoint,
  type WsConnectionState,
} from '@/api/monitorPointWs'
import { getHistoricalData } from '@/api/analysis/waterTrend'

// ==================== 数据模式 ====================
const dataMode = ref<'realtime' | 'history'>('realtime')

// ==================== 左侧树 ====================
const treeLoading = ref(false)
const treeSearch = ref('')
const treeData = ref<MonitorTreeNode[]>([])

const treeProps = {
  label: 'label',
  children: 'children',
  isLeaf: (data: any) => !data.children || data.children.length === 0,
}

const defaultExpandedKeys = computed(() => treeData.value.map(n => n.value))

/** 根据关键词过滤树 */
const filteredTreeData = computed(() => {
  if (!treeSearch.value) return treeData.value
  const keyword = treeSearch.value.toLowerCase()
  function filterNodes(nodes: MonitorTreeNode[]): MonitorTreeNode[] {
    const result: MonitorTreeNode[] = []
    for (const node of nodes) {
      if (node.label.toLowerCase().includes(keyword)) {
        result.push(node)
        continue
      }
      if (node.children) {
        const filtered = filterNodes(node.children)
        if (filtered.length > 0) result.push({ ...node, children: filtered })
      }
    }
    return result
  }
  return filterNodes(treeData.value)
})

/** 加载树数据 */
const loadTreeData = async () => {
  treeLoading.value = true
  try {
    treeData.value = await getAllMonitorList()
  } catch (e) {
    console.error('[EsTrend] 加载树数据失败:', e)
  } finally {
    treeLoading.value = false
  }
}

// ==================== 监控点选择 ====================
/** 当前选中的叶子节点 value */
const currentPointValue = ref<string>('')
/** 当前选中的叶子节点名称 */
const currentPointLabel = ref<string>('')

/** 树节点点击：只在点击叶子节点时连接 WebSocket */
const handleNodeClick = (data: MonitorTreeNode) => {
  if (data.children && data.children.length > 0) {
    // 非叶子节点，不处理
    return
  }
  // 叶子节点
  currentPointValue.value = data.value
  currentPointLabel.value = data.label

  if (dataMode.value === 'realtime') {
    connectWebSocket(data.value)
  } else {
    // 历史模式下，自动查询
    handleHistoryQuery()
  }
}

// ==================== WebSocket 实时数据 ====================
let wsInstance: MonitorPointWs | null = null
const wsState = ref<WsConnectionState>('disconnected')

const chartMaxPoints = ref(500)
const tableMaxPoints = ref(100)

watch(chartMaxPoints, (newVal) => {
  if (dataPoints.value.length > newVal) {
    dataPoints.value = dataPoints.value.slice(-newVal)
    updateChart()
  }
})

const testPointId = ref('')
const testTenantId = ref('1')

const handleManualTest = () => {
  if (!testPointId.value) {
    ElMessage.warning('请输入测试的点位ID')
    return
  }
  
  if (testTenantId.value) {
    // 覆盖本地缓存，使 Axios 请求拦截器获取新的租户ID
    localStorage.setItem('tenant_id', testTenantId.value)
  }

  currentPointValue.value = testPointId.value
  currentPointLabel.value = `[手动测试] ${testPointId.value}`
  
  if (dataMode.value === 'realtime') {
    connectWebSocket(testPointId.value, testTenantId.value)
  } else {
    handleHistoryQuery()
  }
}

/** WebSocket 状态 → el-tag type */
const wsStatusType = computed(() => {
  const map: Record<WsConnectionState, string> = {
    connecting: 'warning',
    connected: 'success',
    disconnected: 'info',
    error: 'danger',
  }
  return map[wsState.value] as any
})

/** WebSocket 状态文本 */
const wsStatusText = computed(() => {
  const map: Record<WsConnectionState, string> = {
    connecting: '连接中...',
    connected: '已连接',
    disconnected: '未连接',
    error: '连接失败',
  }
  return map[wsState.value]
})

/** 收到的所有数据点（按时间排序，保留最近 500 条） */
const dataPoints = ref<MonitorDataPoint[]>([])

/** 连接 WebSocket */
const connectWebSocket = (pointValue: string, customTenantId?: string) => {
  // 清空旧数据
  dataPoints.value = []

  // 断开旧连接
  if (wsInstance) {
    wsInstance.disconnect()
  }

  // 创建新连接
  wsInstance = new MonitorPointWs(
    pointValue,
    // 数据回调
    (points, _monitorId) => {
      // 追加新数据点
      dataPoints.value = [...dataPoints.value, ...points]
        .sort((a, b) => a.time.localeCompare(b.time))

      // 限制最大数据量 (基于用户可配置的 chartMaxPoints)
      if (dataMode.value === 'realtime' && dataPoints.value.length > chartMaxPoints.value) {
        dataPoints.value = dataPoints.value.slice(-chartMaxPoints.value)
      }

      // 更新图表
      updateChart()
    },
    // 状态回调
    (state) => {
      wsState.value = state
    },
    customTenantId
  )

  wsInstance.connect()
}

// ==================== 历史数据 ====================
const historyDateType = ref<'date' | 'month' | 'year'>('date')
const historyDate = ref<string>(new Date().toISOString().slice(0, 10))
const historyDateRange = ref<[string, string] | null>(null)
const historyLoading = ref(false)

/** 模式切换 */
const handleModeChange = (mode: string | number | boolean | undefined) => {
  dataPoints.value = []
  updateChart()

  if (mode === 'realtime') {
    // 切回实时模式，如果已选中点位则重连 WebSocket
    if (currentPointValue.value) {
      connectWebSocket(currentPointValue.value)
    }
  } else {
    // 切到历史模式，断开 WebSocket
    if (wsInstance) {
      wsInstance.disconnect()
    }
    wsState.value = 'disconnected'
  }
}

/** 查询历史数据 */
const handleHistoryQuery = async () => {
  if (!currentPointValue.value) {
    ElMessage.warning('请先从左侧选择一个监控点（或手动测试点位）')
    return
  }
  if (!historyDate.value && !historyDateRange.value) {
    ElMessage.warning('请选择基准时间或时间范围')
    return
  }

  historyLoading.value = true
  chartLoading.value = true
  try {
    const params: any = {
      pointId: currentPointValue.value,
    }
    
    if (historyDate.value) {
      if (historyDateType.value === 'year') {
        params.date = historyDate.value.substring(0, 4)
      } else if (historyDateType.value === 'month') {
        params.date = historyDate.value.substring(0, 7)
      } else {
        params.date = historyDate.value.substring(0, 10) // date type
      }
    } else if (historyDateRange.value) {
      params.startTime = historyDateRange.value[0]
      params.endTime = historyDateRange.value[1]
    }

    const points = await getHistoricalData(params)
    dataPoints.value = points
    updateChart()

    if (points.length === 0) {
      ElMessage.info('该时间范围内暂无数据')
    }
  } catch (e: any) {
    console.error('[EsTrend] 查询历史数据失败:', e)
    ElMessage.error('查询历史数据失败: ' + (e?.message || '未知错误'))
  } finally {
    historyLoading.value = false
    chartLoading.value = false
  }
}

// ==================== 统计信息 ====================
const latestValue = computed(() => {
  if (dataPoints.value.length === 0) return '--'
  return dataPoints.value[dataPoints.value.length - 1].value.toFixed(2)
})

const maxValue = computed(() => {
  if (dataPoints.value.length === 0) return '--'
  return Math.max(...dataPoints.value.map(p => p.value)).toFixed(2)
})

const minValue = computed(() => {
  if (dataPoints.value.length === 0) return '--'
  return Math.min(...dataPoints.value.map(p => p.value)).toFixed(2)
})

// ==================== ECharts 图表 ====================
const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null
const chartLoading = ref(false)

/** 初始化图表 */
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)

  // 初始化空图表
  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.95)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 13 },
      axisPointer: { type: 'cross' },
    },
    toolbox: {
      right: '10px',
      top: '10px',
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
          title: { zoom: '框选区域缩放', back: '还原缩放' }
        },
        restore: { title: '还原图表' }
      },
      iconStyle: {
        borderColor: 'rgba(0, 212, 255, 0.8)'
      }
    },
    grid: { left: '60px', right: '40px', top: '60px', bottom: '60px' },
    xAxis: {
      type: 'category',
      data: [],
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)', fontSize: 11, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: '数值',
      axisLine: { show: true, lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.65)' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)', type: 'dashed' } },
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, height: 20, bottom: 5, borderColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.1)' },
    ],
    series: [],
  })

  window.addEventListener('resize', handleChartResize)
}

/** 更新图表数据 */
const updateChart = () => {
  if (!chartInstance) return

  const times = dataPoints.value.map(p => p.time)
  const values = dataPoints.value.map(p => p.value)

  chartInstance.setOption({
    xAxis: { data: times },
    series: [
      {
        name: currentPointLabel.value || (dataMode.value === 'history' ? '历史数据' : '实时数据'),
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: { color: '#00d4ff', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.02)' },
            ],
          },
        },
      },
    ],
  })
}

const handleChartResize = () => chartInstance?.resize()

// ==================== 表格数据 ====================
/** 表格显示最近配置的条数，时间倒序 */
const tableData = computed(() => {
  let list = [...dataPoints.value].reverse()
  if (dataMode.value === 'realtime') {
    list = list.slice(0, tableMaxPoints.value)
  }
  return list.map(p => ({
    time: p.time,
    value: p.value,
    monitorId: currentPointValue.value,
  }))
})

const headerCellStyle = {
  background: 'rgba(0, 212, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.85)',
  borderColor: 'rgba(0, 212, 255, 0.2)',
}

const cellStyle = { borderColor: 'rgba(0, 212, 255, 0.1)' }

// ==================== 操作 ====================
const handleRefresh = () => {
  if (!currentPointValue.value) {
    ElMessage.warning('请先从左侧选择一个监控点（叶子节点）')
    return
  }
  if (dataMode.value === 'realtime') {
    connectWebSocket(currentPointValue.value)
    ElMessage.success('已重新连接')
  } else {
    handleHistoryQuery()
  }
}

const handleExport = () => {
  if (dataPoints.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  // 创建 CSV 并下载
  const header = '时间,数值,监控点ID\n'
  const rows = dataPoints.value
    .map(p => `${p.time},${p.value},${currentPointValue.value}`)
    .join('\n')
  const csv = '\uFEFF' + header + rows // BOM for Excel 中文兼容
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `趋势数据_${currentPointLabel.value}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await loadTreeData()
  await nextTick()
  initChart()
})

onBeforeUnmount(() => {
  // 断开 WebSocket
  if (wsInstance) {
    wsInstance.disconnect()
    wsInstance = null
  }
  // 销毁图表
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleChartResize)
})
</script>

<style scoped lang="scss">
/* ========== 树节点 ========== */
.tree-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  padding: 20px 0;
  justify-content: center;
}

.tree-node-label {
  display: flex;
  align-items: center;
  gap: 4px;

  .leaf-icon {
    font-size: 12px;
    color: rgba(0, 212, 255, 0.6);
  }
}

.manual-test-box {
  flex-shrink: 0;
  margin-top: 10px;
  padding: 12px;
  background: rgba(10, 24, 45, 0.4);
  border: 1px dashed rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  
  .test-title {
    color: rgba(0, 212, 255, 0.8);
    font-size: 13px;
    margin-bottom: 10px;
    font-weight: bold;
    text-align: center;
  }
}

/* ========== 主内容区 ========== */
.content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 控制栏 */
.control-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: rgba(10, 24, 45, 0.4);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);

  :deep(.el-radio-group) {
    .el-radio-button__inner {
      background: rgba(10, 24, 45, 0.6);
      border-color: rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.85);
      &:hover { color: #00d4ff; }
    }
    .el-radio-button__original-radio:checked + .el-radio-button__inner {
      background: rgba(0, 212, 255, 0.3);
      border-color: #00d4ff;
      color: #00d4ff;
      box-shadow: -1px 0 0 0 #00d4ff;
    }
  }
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  :deep(.el-date-editor) {
    --el-fill-color-blank: rgba(10, 24, 45, 0.6);
    --el-text-color-regular: rgba(255, 255, 255, 0.85);
    --el-border-color: rgba(0, 212, 255, 0.3);
  }
}

.current-point-info {
  display: flex;
  align-items: center;
  gap: 10px;

  .point-label {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
  }

  .ws-status-tag {
    flex-shrink: 0;
  }
}

/* 统计信息 */
.summary-info {
  display: flex;
  gap: 36px;
  padding: 16px 20px;
  background: rgba(10, 24, 45, 0.4);
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  flex-wrap: wrap;

  .info-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex: 1;
    min-width: 140px;

    .label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
    .value {
      font-size: 26px;
      font-weight: 700;
      color: #00d4ff;
      text-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
    }
    .unit {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

/* 图表区域 */
.chart-wrapper {
  flex-shrink: 0;
  height: 420px;
  padding: 16px 20px;
  background: rgba(10, 24, 45, 0.3);
}

.trend-chart {
  width: 100%;
  height: 100%;
}

/* 数据表格 */
.table-container {
  flex-shrink: 0;
  padding: 16px 20px;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .table-title {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  :deep(.el-table) {
    background: rgba(10, 24, 45, 0.4);
    color: rgba(255, 255, 255, 0.85);

    .el-table__body tr.el-table__row--striped {
      background: rgba(10, 24, 45, 0.5);
    }

    .el-table__body tr:hover {
      background: rgba(0, 212, 255, 0.05);
    }
  }
}
</style>
