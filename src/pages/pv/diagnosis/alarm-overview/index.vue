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
      <div class="alarm-overview-wrapper">
        <!-- 顶部二级导航标签栏 -->
        <div class="sub-nav-bar">
          <router-link
            v-for="tab in navTabs"
            :key="tab.path"
            :to="tab.path"
            :class="['nav-tab', { active: isActiveTab(tab.path) }]"
          >
            {{ tab.name }}
          </router-link>
        </div>

        <!-- 告警概览大屏内容 -->
        <div class="overview-content">
          <!-- ========== 第一行：三个统计面板 ========== -->
          <el-row :gutter="12" class="top-row">
            <!-- 今日告警统计 -->
            <el-col :span="8">
              <div class="panel">
                <div class="panel-title">今日告警统计</div>
                <div class="panel-body stat-panel">
                  <div class="stat-left">
                    <div class="stat-numbers">
                      <div class="stat-item">
                        <span class="stat-val highlight">{{ todayRealtime }}</span>
                        <span class="stat-desc">今日实时</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-val">{{ todayHistory }}</span>
                        <span class="stat-desc">今日历史</span>
                      </div>
                    </div>
                    <div ref="donutChartRef" class="donut-chart"></div>
                  </div>
                  <div class="stat-legend">
                    <div class="legend-item"><span class="dot urgent"></span>紧急 <b>{{ alarmLevelCount.urgent }}</b></div>
                    <div class="legend-item"><span class="dot important"></span>重要 <b>{{ alarmLevelCount.important }}</b></div>
                    <div class="legend-item"><span class="dot normal"></span>一般 <b>{{ alarmLevelCount.normal }}</b></div>
                    <div class="legend-item"><span class="dot resolved"></span>已处理 <b>{{ alarmLevelCount.resolved }}</b></div>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- 今日时段告警 -->
            <el-col :span="8">
              <div class="panel">
                <div class="panel-title">今日时段告警</div>
                <div class="panel-body">
                  <div ref="hourlyChartRef" class="chart-fill"></div>
                </div>
              </div>
            </el-col>

            <!-- 今日告警设备 -->
            <el-col :span="8">
              <div class="panel">
                <div class="panel-title">今日告警设备</div>
                <div class="panel-body device-panel">
                  <div ref="deviceDonutRef" class="device-donut"></div>
                  <div class="device-legend">
                    <div class="device-stat-item">
                      <span class="dot-lg" style="background:#ff4444"></span>
                      <span>故障设备</span>
                      <b>{{ deviceStats.fault }}</b>
                    </div>
                    <div class="device-stat-item">
                      <span class="dot-lg" style="background:#ffb800"></span>
                      <span>告警设备</span>
                      <b>{{ deviceStats.warning }}</b>
                    </div>
                    <div class="device-stat-item">
                      <span class="dot-lg" style="background:#67c23a"></span>
                      <span>正常设备</span>
                      <b>{{ deviceStats.normal }}</b>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- ========== 第二行：告警次数统计 + 设备告警 TOP ========== -->
          <el-row :gutter="12" class="bottom-row">
            <!-- 告警次数统计 -->
            <el-col :span="12">
              <div class="panel">
                <div class="panel-title">
                  告警次数统计
                  <div class="period-tabs">
                    <span :class="{ active: barPeriod === '7d' }" @click="barPeriod = '7d'">近7天</span>
                    <span :class="{ active: barPeriod === '1m' }" @click="barPeriod = '1m'">月</span>
                    <span :class="{ active: barPeriod === '1y' }" @click="barPeriod = '1y'">年</span>
                  </div>
                </div>
                <div class="panel-body">
                  <div class="summary-bar">
                    <span class="summary-tag urgent">紧急告警 <b>{{ barSummary.urgent }}</b> 条</span>
                    <span class="summary-tag important">重要告警 <b>{{ barSummary.important }}</b> 条</span>
                    <span class="summary-tag normal">一般告警 <b>{{ barSummary.normal }}</b> 条</span>
                    <span class="summary-tag rate">告警率 <b>{{ barSummary.rate }}%</b></span>
                  </div>
                  <div ref="barChartRef" class="chart-fill-lg"></div>
                </div>
              </div>
            </el-col>

            <!-- 设备告警TOP -->
            <el-col :span="12">
              <div class="panel">
                <div class="panel-title">
                  设备告警TOP10
                  <div class="period-tabs">
                    <span :class="{ active: topPeriod === '7d' }" @click="topPeriod = '7d'">近7天</span>
                    <span :class="{ active: topPeriod === '1m' }" @click="topPeriod = '1m'">月</span>
                    <span :class="{ active: topPeriod === '1y' }" @click="topPeriod = '1y'">年</span>
                  </div>
                </div>
                <div class="panel-body">
                  <div ref="topChartRef" class="chart-fill-lg"></div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 告警概览页面 - 参考 jeecg 告警管理模块大屏样式
 * 左侧工艺流程树 + 顶部二级Tab导航 + 告警统计大屏
 */
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import dayjs from 'dayjs'

const route = useRoute()

// 根据当前路由前缀自动适配一期/二期路径
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

// ==================== 左侧工艺流程树 ====================
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
    // 切换工艺时重新加载数据
    initMockData()
    nextTick(() => {
      initDonutChart()
      initHourlyChart()
      initDeviceDonut()
      initBarChart()
      initTopChart()
    })
  }
}

// ==================== 图表 DOM 引用 ====================
const donutChartRef = ref<HTMLElement>()
const hourlyChartRef = ref<HTMLElement>()
const deviceDonutRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
const topChartRef = ref<HTMLElement>()

let donutChart: echarts.ECharts | null = null
let hourlyChart: echarts.ECharts | null = null
let deviceDonut: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
let topChart: echarts.ECharts | null = null

// ==================== 切换周期 ====================
const barPeriod = ref('7d')
const topPeriod = ref('7d')

// ==================== 模拟数据 ====================
const todayRealtime = ref(0)
const todayHistory = ref(0)
const alarmLevelCount = ref({ urgent: 0, important: 0, normal: 0, resolved: 0 })
const deviceStats = ref({ fault: 0, warning: 0, normal: 0, total: 0 })
const barSummary = ref({ urgent: 0, important: 0, normal: 0, rate: '0' })

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const initMockData = () => {
  const urgent = randInt(1, 5)
  const important = randInt(3, 10)
  const normal = randInt(5, 15)
  const resolved = randInt(2, 8)
  todayRealtime.value = urgent + important + normal
  todayHistory.value = todayRealtime.value + resolved
  alarmLevelCount.value = { urgent, important, normal, resolved }
  deviceStats.value = {
    fault: randInt(0, 2),
    warning: randInt(1, 4),
    normal: randInt(10, 25),
    total: 0
  }
  deviceStats.value.total = deviceStats.value.fault + deviceStats.value.warning + deviceStats.value.normal
}

// ==================== 图表1: 今日告警环形图 ====================
const initDonutChart = () => {
  if (!donutChartRef.value) return
  if (donutChart) donutChart.dispose()
  donutChart = echarts.init(donutChartRef.value)
  const { urgent, important, normal } = alarmLevelCount.value
  const total = urgent + important + normal
  donutChart.setOption({
    series: [{
      type: 'pie', radius: ['55%', '80%'], center: ['50%', '50%'],
      label: {
        show: true, position: 'center', fontSize: 13, fontWeight: 'bold', color: '#FFD700',
        formatter: `${total}\n{sub|今日总数}`,
        rich: { sub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 18 } }
      },
      data: [
        { value: urgent, name: '紧急', itemStyle: { color: '#ff4444' } },
        { value: important, name: '重要', itemStyle: { color: '#ffb800' } },
        { value: normal, name: '一般', itemStyle: { color: '#67c23a' } }
      ],
      emphasis: { scale: false }
    }]
  })
}

// ==================== 图表2: 今日时段告警（折线图） ====================
const initHourlyChart = () => {
  if (!hourlyChartRef.value) return
  if (hourlyChart) hourlyChart.dispose()
  hourlyChart = echarts.init(hourlyChartRef.value)
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const currentHour = dayjs().hour()
  const data = hours.map((_, i) => i <= currentHour ? randInt(0, 6) : 0)
  hourlyChart.setOption({
    grid: { left: 32, right: 12, top: 12, bottom: 22 },
    xAxis: {
      type: 'category', data: hours, boundaryGap: false,
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, interval: 5 },
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } }
    },
    yAxis: {
      type: 'value', minInterval: 1,
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.1)', type: 'dashed' } }
    },
    series: [{
      type: 'line', data, smooth: true, symbol: 'none',
      lineStyle: { color: '#FFD700', width: 2 },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(255,215,0,0.4)' }, { offset: 1, color: 'rgba(255,215,0,0.02)' }]
        }
      }
    }]
  })
}

// ==================== 图表3: 设备告警环形图 ====================
const initDeviceDonut = () => {
  if (!deviceDonutRef.value) return
  if (deviceDonut) deviceDonut.dispose()
  deviceDonut = echarts.init(deviceDonutRef.value)
  const { fault, warning, normal, total } = deviceStats.value
  deviceDonut.setOption({
    series: [{
      type: 'pie', radius: ['55%', '80%'], center: ['50%', '50%'],
      label: {
        show: true, position: 'center', fontSize: 13, fontWeight: 'bold', color: '#FFD700',
        formatter: `${total}\n{sub|设备总数}`,
        rich: { sub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 18 } }
      },
      data: [
        { value: fault, name: '故障', itemStyle: { color: '#ff4444' } },
        { value: warning, name: '告警', itemStyle: { color: '#ffb800' } },
        { value: normal, name: '正常', itemStyle: { color: '#67c23a' } }
      ],
      emphasis: { scale: false }
    }]
  })
}

// ==================== 图表4: 告警次数统计（柱状图） ====================
const initBarChart = () => {
  if (!barChartRef.value) return
  if (barChart) barChart.dispose()
  barChart = echarts.init(barChartRef.value)
  const days = barPeriod.value === '7d' ? 7 : barPeriod.value === '1m' ? 30 : 12
  const labels = barPeriod.value === '1y'
    ? Array.from({ length: 12 }, (_, i) => dayjs().subtract(11 - i, 'month').format('MM月'))
    : Array.from({ length: days }, (_, i) => dayjs().subtract(days - 1 - i, 'day').format('MM-DD'))
  const urgentData = labels.map(() => randInt(0, 3))
  const importantData = labels.map(() => randInt(0, 5))
  const normalData = labels.map(() => randInt(0, 8))

  barSummary.value = {
    urgent: urgentData.reduce((a, b) => a + b, 0),
    important: importantData.reduce((a, b) => a + b, 0),
    normal: normalData.reduce((a, b) => a + b, 0),
    rate: (Math.random() * 5).toFixed(1)
  }

  barChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,24,45,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
    legend: { data: ['紧急告警', '重要告警', '一般告警'], textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 }, top: 0 },
    grid: { left: 35, right: 12, top: 35, bottom: 22 },
    xAxis: {
      type: 'category', data: labels,
      axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } }
    },
    yAxis: {
      type: 'value', minInterval: 1,
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.1)', type: 'dashed' } }
    },
    series: [
      { name: '紧急告警', type: 'bar', stack: 'total', data: urgentData, itemStyle: { color: '#ff4444' }, barWidth: '40%' },
      { name: '重要告警', type: 'bar', stack: 'total', data: importantData, itemStyle: { color: '#ffb800' } },
      { name: '一般告警', type: 'bar', stack: 'total', data: normalData, itemStyle: { color: '#67c23a' } }
    ]
  }, true)
}

// ==================== 图表5: 设备告警TOP10（横向柱状图） ====================
const initTopChart = () => {
  if (!topChartRef.value) return
  if (topChart) topChart.dispose()
  topChart = echarts.init(topChartRef.value)
  const devices = [
    '1#提升泵', '2#鼓风机', 'PAC加药泵', '回流泵A', '3#搅拌器',
    '脱水机A', '进水闸门', '格栅机B', '排泥阀C', '变频器D'
  ]
  const values = devices.map(() => randInt(1, 15)).sort((a, b) => a - b)

  topChart.setOption({
    grid: { left: 80, right: 48, top: 6, bottom: 6 },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category', data: devices, inverse: false,
      axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
      axisLine: { show: false }, axisTick: { show: false }
    },
    series: [{
      type: 'bar', data: values, barWidth: 12,
      label: { show: true, position: 'right', color: '#00d4ff', fontSize: 11, formatter: '{c}次' },
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.3)' }, { offset: 1, color: '#00d4ff' }]
        },
        borderRadius: [0, 4, 4, 0]
      }
    }]
  }, true)
}

// ==================== resize ====================
const handleResize = () => {
  donutChart?.resize()
  hourlyChart?.resize()
  deviceDonut?.resize()
  barChart?.resize()
  topChart?.resize()
}

// ==================== Watch 周期切换 ====================
watch(barPeriod, () => nextTick(initBarChart))
watch(topPeriod, () => nextTick(initTopChart))

// ==================== 生命周期 ====================
onMounted(() => {
  initMockData()
  nextTick(() => {
    initDonutChart()
    initHourlyChart()
    initDeviceDonut()
    initBarChart()
    initTopChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  donutChart?.dispose()
  hourlyChart?.dispose()
  deviceDonut?.dispose()
  barChart?.dispose()
  topChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
/* ========== 整体容器 ========== */
.alarm-overview-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ========== 二级导航栏 ========== */
.sub-nav-bar {
  display: flex;
  align-items: center;
  gap: 0;
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

    &:hover {
      color: rgba(255, 255, 255, 0.85);
    }

    &.active {
      color: #00d4ff;
      border-bottom-color: #00d4ff;
      font-weight: 600;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
    }
  }
}

/* ========== 概览正文区 ========== */
.overview-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ========== 面板通用 ========== */
.panel {
  background: rgba(10, 24, 45, 0.85);
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 6px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #00d4ff;
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
  flex-shrink: 0;
}

.panel-body {
  flex: 1;
  padding: 10px 14px;
  min-height: 0;
}

/* ========== 行高度 ========== */
.top-row { .el-col { height: 220px; } }
.bottom-row { flex: 1; .el-col { height: 320px; } }

/* ========== 统计面板 ========== */
.stat-panel {
  display: flex;
  gap: 10px;

  .stat-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-numbers {
    display: flex;
    gap: 20px;
    margin-bottom: 6px;

    .stat-item {
      text-align: center;
      .stat-val { font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.9); display: block; }
      .stat-val.highlight { color: #FFD700; }
      .stat-desc { font-size: 10px; color: rgba(255,255,255,0.5); }
    }
  }

  .donut-chart { width: 110px; height: 110px; }

  .stat-legend {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 7px;
    min-width: 95px;

    .legend-item {
      font-size: 11px;
      color: rgba(255,255,255,0.75);
      display: flex;
      align-items: center;
      gap: 5px;

      b { color: #fff; margin-left: auto; }

      .dot {
        width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        &.urgent { background: #ff4444; }
        &.important { background: #ffb800; }
        &.normal { background: #67c23a; }
        &.resolved { background: #0096ff; }
      }
    }
  }
}

/* ========== 设备面板 ========== */
.device-panel {
  display: flex;
  align-items: center;
  gap: 14px;

  .device-donut { width: 120px; height: 120px; flex-shrink: 0; }

  .device-legend {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .device-stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255,255,255,0.8);
      b { margin-left: auto; color: #fff; font-size: 15px; }
    }

    .dot-lg {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
  }
}

/* ========== 图表填充 ========== */
.chart-fill { width: 100%; height: 100%; }
.chart-fill-lg { width: 100%; height: calc(100% - 30px); }

/* ========== 汇总条 ========== */
.summary-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;

  .summary-tag {
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 11px;
    color: rgba(255,255,255,0.85);
    b { margin-left: 3px; }

    &.urgent { background: rgba(255,68,68,0.15); border: 1px solid rgba(255,68,68,0.3); }
    &.important { background: rgba(255,184,0,0.15); border: 1px solid rgba(255,184,0,0.3); }
    &.normal { background: rgba(103,194,58,0.15); border: 1px solid rgba(103,194,58,0.3); }
    &.rate { background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); }
  }
}

/* ========== 周期标签 ========== */
.period-tabs {
  display: flex;
  gap: 3px;

  span {
    padding: 2px 8px;
    font-size: 11px;
    cursor: pointer;
    border-radius: 3px;
    color: rgba(255,255,255,0.5);
    font-weight: 400;
    transition: all 0.2s;

    &.active {
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
      border: 1px solid rgba(0, 212, 255, 0.4);
    }

    &:hover:not(.active) { color: rgba(255,255,255,0.8); }
  }
}
</style>
