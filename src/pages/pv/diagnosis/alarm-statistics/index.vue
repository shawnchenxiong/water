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
      <div class="alarm-statistics-wrapper">
        <!-- 顶部二级导航标签栏 -->
        <div class="sub-nav-bar">
          <router-link
            v-for="tab in navTabs"
            :key="tab.path"
            :to="tab.path"
            :class="['nav-tab', { active: isActiveTab(tab.path) }]"
          >{{ tab.name }}</router-link>
        </div>

        <!-- 告警统计大屏内容 -->
        <div class="statistics-content">
          <!-- ========== 范围指示标签 ========== -->
          <div class="scope-indicator">
            <span class="scope-icon">📊</span>
            <span class="scope-text">当前范围：</span>
            <span class="scope-name">{{ selectedNodeName }}</span>
            <span v-if="!isAllMode" class="scope-reset" @click="resetToAll">
              <el-icon :size="12"><Close /></el-icon> 返回全厂
            </span>
          </div>

          <!-- ========== 第一行：顶部统计指标卡片 ========== -->
          <div class="stat-cards-row">
            <div
              v-for="card in statCards"
              :key="card.label"
              class="stat-card"
              :style="{ borderColor: card.borderColor }"
            >
              <div class="stat-icon" :style="{ background: card.iconBg }">
                <el-icon :size="22" :color="card.iconColor"><component :is="card.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value" :style="{ color: card.valueColor }">
                  <span class="stat-num">{{ card.value }}</span>
                  <span v-if="card.unit" class="stat-unit">{{ card.unit }}</span>
                </div>
                <div class="stat-label">{{ card.label }}</div>
              </div>
              <!-- 微趋势指示 -->
              <div v-if="card.trend" class="stat-trend" :class="card.trend">
                <span>{{ card.trendVal }}</span>
                <span class="trend-arrow">{{ card.trend === 'up' ? '↑' : '↓' }}</span>
              </div>
            </div>
          </div>

          <!-- ========== 第二行：告警趋势 + 告警级别分布 ========== -->
          <el-row :gutter="12" class="chart-row">
            <!-- 告警趋势分析（折线图） -->
            <el-col :span="16">
              <div class="panel">
                <div class="panel-title">
                  <span class="title-text">
                    <span class="title-dot"></span>
                    告警趋势分析
                  </span>
                  <div class="period-tabs">
                    <span :class="{ active: trendPeriod === '7d' }" @click="trendPeriod = '7d'">近7天</span>
                    <span :class="{ active: trendPeriod === '30d' }" @click="trendPeriod = '30d'">近30天</span>
                    <span :class="{ active: trendPeriod === '1y' }" @click="trendPeriod = '1y'">近一年</span>
                  </div>
                </div>
                <div class="panel-body">
                  <div ref="trendChartRef" class="chart-full"></div>
                </div>
              </div>
            </el-col>
            <!-- 告警级别分布（环形图） -->
            <el-col :span="8">
              <div class="panel">
                <div class="panel-title">
                  <span class="title-text">
                    <span class="title-dot"></span>
                    告警级别分布
                  </span>
                </div>
                <div class="panel-body">
                  <div ref="levelPieRef" class="chart-full"></div>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- ========== 第三行：各工艺告警统计 + 告警类型分布 ========== -->
          <el-row :gutter="12" class="chart-row">
            <!-- 各工艺告警统计（横向柱状图） -->
            <el-col :span="12">
              <div class="panel">
                <div class="panel-title">
                  <span class="title-text">
                    <span class="title-dot"></span>
                    各工艺告警统计
                  </span>
                  <div class="period-tabs">
                    <span :class="{ active: processPeriod === '7d' }" @click="processPeriod = '7d'">近7天</span>
                    <span :class="{ active: processPeriod === '30d' }" @click="processPeriod = '30d'">月</span>
                    <span :class="{ active: processPeriod === '1y' }" @click="processPeriod = '1y'">年</span>
                  </div>
                </div>
                <div class="panel-body">
                  <div ref="processBarRef" class="chart-full"></div>
                </div>
              </div>
            </el-col>
            <!-- 告警类型分布（南丁格尔玫瑰图） -->
            <el-col :span="12">
              <div class="panel">
                <div class="panel-title">
                  <span class="title-text">
                    <span class="title-dot"></span>
                    告警类型分布
                  </span>
                </div>
                <div class="panel-body">
                  <div ref="typePieRef" class="chart-full"></div>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- ========== 第四行：设备告警排行 + 告警处理时效 ========== -->
          <el-row :gutter="12" class="chart-row">
            <!-- 设备告警排行 TOP10 -->
            <el-col :span="12">
              <div class="panel">
                <div class="panel-title">
                  <span class="title-text">
                    <span class="title-dot"></span>
                    设备告警排行 TOP10
                  </span>
                </div>
                <div class="panel-body">
                  <div ref="deviceTopRef" class="chart-full"></div>
                </div>
              </div>
            </el-col>
            <!-- 告警处理时效分析 -->
            <el-col :span="12">
              <div class="panel">
                <div class="panel-title">
                  <span class="title-text">
                    <span class="title-dot"></span>
                    告警处理时效分析
                  </span>
                </div>
                <div class="panel-body">
                  <div ref="resolveTimeRef" class="chart-full"></div>
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
 * 告警统计页面 - 综合运维大屏风格
 * 布局：左侧工艺流程树 + 顶部二级Tab导航 + 多图表统计仪表盘
 * 包含六大统计模块：指标卡片、趋势分析、级别分布、工艺统计、类型分布、设备排行、处理时效
 */
import { ref, computed, onMounted, onUnmounted, watch, nextTick, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import dayjs from 'dayjs'
import {
  Bell, Warning, SuccessFilled, Timer, DataLine, Close
} from '@element-plus/icons-vue'

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
const selectedNode = ref('all') // 默认选中全厂

/** 工艺节点名称映射，便于在界面和图表中显示 */
const nodeNameMap: Record<string, string> = {
  'all': '污水处理厂（全厂）',
  'pre-treatment': '预处理',
  'stage1-aao': 'I段AAO',
  'sedimentation': '二沉池及出水',
  'sludge': '污泥脱水',
  'high-sedimentation': '高效沉淀池',
  'denitrification': '反硝化深床滤池',
  'dosing': '加药系统',
  'stage2-aao': 'II段AAO',
  'blower': '鼓风机房',
}

/** 是否为全厂统计模式 */
const isAllMode = computed(() => selectedNode.value === 'all')

/** 当前选中节点的显示名称 */
const selectedNodeName = computed(() => nodeNameMap[selectedNode.value] || '污水处理厂（全厂）')

const stationTree = ref([
  {
    id: 'all', // 根节点也有 id，用于全厂统计
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

/** 树节点点击：根节点→全厂统计；子节点→对应工艺统计 */
const handleNodeClick = (node: any) => {
  if (node.id) {
    selectedNode.value = node.id
  } else {
    selectedNode.value = 'all'
  }
  refreshAllData()
  nextTick(initAllCharts)
}

/** 点击“返回全厂”按钮 */
const resetToAll = () => {
  selectedNode.value = 'all'
  refreshAllData()
  nextTick(initAllCharts)
}

// ==================== 图表 DOM 引用 ====================
const trendChartRef = ref<HTMLElement>()
const levelPieRef = ref<HTMLElement>()
const processBarRef = ref<HTMLElement>()
const typePieRef = ref<HTMLElement>()
const deviceTopRef = ref<HTMLElement>()
const resolveTimeRef = ref<HTMLElement>()

// ECharts 实例缓存
let trendChart: echarts.ECharts | null = null
let levelPie: echarts.ECharts | null = null
let processBar: echarts.ECharts | null = null
let typePie: echarts.ECharts | null = null
let deviceTop: echarts.ECharts | null = null
let resolveTime: echarts.ECharts | null = null

// ==================== 周期切换 ====================
const trendPeriod = ref('30d')
const processPeriod = ref('7d')

// ==================== 工具函数 ====================
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// ==================== 顶部统计卡片数据 ====================
const totalAlarms = ref(0)
const urgentAlarms = ref(0)
const importantAlarms = ref(0)
const normalAlarms = ref(0)
const resolvedAlarms = ref(0)
const resolveRate = ref('0')

/** 统计卡片配置（使用 markRaw 避免 Vue 对图标组件进行深度代理） */
const statCards = computed(() => [
  {
    label: '告警总数',
    value: totalAlarms.value,
    unit: '条',
    icon: markRaw(Bell),
    iconBg: 'rgba(0, 212, 255, 0.15)',
    iconColor: '#00d4ff',
    valueColor: '#00d4ff',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    trend: 'up' as const,
    trendVal: '+12%',
  },
  {
    label: '紧急告警',
    value: urgentAlarms.value,
    unit: '条',
    icon: markRaw(Warning),
    iconBg: 'rgba(255, 68, 68, 0.15)',
    iconColor: '#ff4444',
    valueColor: '#ff4444',
    borderColor: 'rgba(255, 68, 68, 0.3)',
    trend: 'up' as const,
    trendVal: '+5%',
  },
  {
    label: '重要告警',
    value: importantAlarms.value,
    unit: '条',
    icon: markRaw(Bell),
    iconBg: 'rgba(255, 184, 0, 0.15)',
    iconColor: '#ffb800',
    valueColor: '#ffb800',
    borderColor: 'rgba(255, 184, 0, 0.3)',
    trend: 'down' as const,
    trendVal: '-3%',
  },
  {
    label: '一般告警',
    value: normalAlarms.value,
    unit: '条',
    icon: markRaw(DataLine),
    iconBg: 'rgba(103, 194, 58, 0.15)',
    iconColor: '#67c23a',
    valueColor: '#67c23a',
    borderColor: 'rgba(103, 194, 58, 0.3)',
    trend: null,
    trendVal: '',
  },
  {
    label: '已处理',
    value: resolvedAlarms.value,
    unit: '条',
    icon: markRaw(SuccessFilled),
    iconBg: 'rgba(0, 150, 255, 0.15)',
    iconColor: '#0096ff',
    valueColor: '#0096ff',
    borderColor: 'rgba(0, 150, 255, 0.3)',
    trend: null,
    trendVal: '',
  },
  {
    label: '处理率',
    value: resolveRate.value,
    unit: '%',
    icon: markRaw(Timer),
    iconBg: 'rgba(148, 103, 255, 0.15)',
    iconColor: '#9467ff',
    valueColor: '#9467ff',
    borderColor: 'rgba(148, 103, 255, 0.3)',
    trend: 'up' as const,
    trendVal: '+2%',
  },
])

// ==================== 刷新模拟数据 ====================
/** 全厂模式数据量更大，单工艺模式数据量较小 */
const refreshAllData = () => {
  if (isAllMode.value) {
    // 全厂汇总统计：数据量更大
    urgentAlarms.value = randInt(30, 80)
    importantAlarms.value = randInt(100, 250)
    normalAlarms.value = randInt(200, 500)
    resolvedAlarms.value = randInt(250, 600)
  } else {
    // 单工艺统计：数据量较小
    urgentAlarms.value = randInt(2, 10)
    importantAlarms.value = randInt(8, 30)
    normalAlarms.value = randInt(15, 60)
    resolvedAlarms.value = randInt(15, 70)
  }
  totalAlarms.value = urgentAlarms.value + importantAlarms.value + normalAlarms.value
  resolveRate.value = ((resolvedAlarms.value / (totalAlarms.value + resolvedAlarms.value)) * 100).toFixed(1)
}

// ==================== 图表1: 告警趋势分析（多系列折线图） ====================
const initTrendChart = () => {
  if (!trendChartRef.value) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)

  // 根据选择的周期生成日期标签
  const days = trendPeriod.value === '7d' ? 7 : trendPeriod.value === '30d' ? 30 : 12
  const labels = trendPeriod.value === '1y'
    ? Array.from({ length: 12 }, (_, i) => dayjs().subtract(11 - i, 'month').format('MM月'))
    : Array.from({ length: days }, (_, i) => dayjs().subtract(days - 1 - i, 'day').format('MM-DD'))

  // 各级别告警模拟数据
  const urgentData = labels.map(() => randInt(0, 4))
  const importantData = labels.map(() => randInt(2, 10))
  const normalData = labels.map(() => randInt(5, 18))

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      textStyle: { color: '#fff', fontSize: 12 },
    },
    legend: {
      data: ['紧急告警', '重要告警', '一般告警'],
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
      top: 5, right: 10,
      icon: 'roundRect', itemWidth: 12, itemHeight: 3,
    },
    grid: { left: 40, right: 16, top: 40, bottom: 28 },
    xAxis: {
      type: 'category', data: labels, boundaryGap: false,
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', minInterval: 1,
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)', type: 'dashed' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: '紧急告警', type: 'line', data: urgentData, smooth: true, symbol: 'circle', symbolSize: 4,
        lineStyle: { color: '#ff4444', width: 2 },
        itemStyle: { color: '#ff4444' },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(255,68,68,0.25)' }, { offset: 1, color: 'rgba(255,68,68,0.02)' }]
          }
        },
      },
      {
        name: '重要告警', type: 'line', data: importantData, smooth: true, symbol: 'circle', symbolSize: 4,
        lineStyle: { color: '#ffb800', width: 2 },
        itemStyle: { color: '#ffb800' },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(255,184,0,0.2)' }, { offset: 1, color: 'rgba(255,184,0,0.02)' }]
          }
        },
      },
      {
        name: '一般告警', type: 'line', data: normalData, smooth: true, symbol: 'circle', symbolSize: 4,
        lineStyle: { color: '#67c23a', width: 2 },
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(103,194,58,0.2)' }, { offset: 1, color: 'rgba(103,194,58,0.02)' }]
          }
        },
      },
    ]
  }, true)
}

// ==================== 图表2: 告警级别分布（嵌套环形图） ====================
const initLevelPie = () => {
  if (!levelPieRef.value) return
  if (levelPie) levelPie.dispose()
  levelPie = echarts.init(levelPieRef.value)

  const total = urgentAlarms.value + importantAlarms.value + normalAlarms.value

  levelPie.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10,24,45,0.95)',
      borderColor: 'rgba(0,212,255,0.4)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: '{b}: {c}条 ({d}%)',
    },
    legend: {
      orient: 'vertical', right: 10, top: 'center',
      textStyle: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
      icon: 'circle', itemWidth: 10, itemGap: 14,
      formatter: (name: string) => {
        const map: Record<string, number> = {
          '紧急': urgentAlarms.value,
          '重要': importantAlarms.value,
          '一般': normalAlarms.value,
        }
        return `${name}  ${map[name] || 0}条`
      }
    },
    series: [
      {
        type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true, position: 'center', fontSize: 18, fontWeight: 'bold', color: '#FFD700',
          formatter: `${total}\n{sub|告警总数}`,
          rich: { sub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 22 } },
        },
        labelLine: { show: false },
        data: [
          { value: urgentAlarms.value, name: '紧急', itemStyle: { color: '#ff4444' } },
          { value: importantAlarms.value, name: '重要', itemStyle: { color: '#ffb800' } },
          { value: normalAlarms.value, name: '一般', itemStyle: { color: '#67c23a' } },
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,212,255,0.3)' }
        },
      },
      // 外层装饰环
      {
        type: 'pie', radius: ['73%', '76%'], center: ['35%', '50%'],
        silent: true, label: { show: false }, labelLine: { show: false },
        data: [
          { value: 1, itemStyle: { color: 'rgba(0,212,255,0.15)' } },
        ],
      }
    ]
  }, true)
}

// ==================== 图表3: 各工艺告警统计（横向柱状图） ====================
const initProcessBar = () => {
  if (!processBarRef.value) return
  if (processBar) processBar.dispose()
  processBar = echarts.init(processBarRef.value)

  const processes = ['预处理', 'I段AAO', '二沉池', '污泥脱水', '高效沉淀池', '反硝化滤池', '加药系统', 'II段AAO', '鼓风机房']
  const urgentData = processes.map(() => randInt(0, 5))
  const importantData = processes.map(() => randInt(1, 8))
  const normalData = processes.map(() => randInt(2, 12))

  processBar.setOption({
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(10,24,45,0.95)',
      borderColor: 'rgba(0,212,255,0.4)',
      textStyle: { color: '#fff', fontSize: 12 },
    },
    legend: {
      data: ['紧急', '重要', '一般'],
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
      top: 2, right: 10,
      icon: 'roundRect', itemWidth: 10, itemHeight: 3,
    },
    grid: { left: 80, right: 16, top: 30, bottom: 8 },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category', data: processes, inverse: true,
      axisLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [
      {
        name: '紧急', type: 'bar', stack: 'total', data: urgentData,
        itemStyle: { color: '#ff4444', borderRadius: [0, 0, 0, 0] }, barWidth: 14,
      },
      {
        name: '重要', type: 'bar', stack: 'total', data: importantData,
        itemStyle: { color: '#ffb800' },
      },
      {
        name: '一般', type: 'bar', stack: 'total', data: normalData,
        itemStyle: { color: '#67c23a', borderRadius: [0, 3, 3, 0] },
        label: {
          show: true, position: 'right', color: 'rgba(255,255,255,0.6)', fontSize: 10,
          formatter: (params: any) => {
            const total = urgentData[params.dataIndex] + importantData[params.dataIndex] + normalData[params.dataIndex]
            return `${total}`
          }
        },
      },
    ]
  }, true)
}

// ==================== 图表4: 告警类型分布（南丁格尔玫瑰图） ====================
const initTypePie = () => {
  if (!typePieRef.value) return
  if (typePie) typePie.dispose()
  typePie = echarts.init(typePieRef.value)

  const typeData = [
    { value: randInt(15, 40), name: '设备故障', itemStyle: { color: '#ff4444' } },
    { value: randInt(20, 50), name: '参数越限', itemStyle: { color: '#ffb800' } },
    { value: randInt(10, 25), name: '通信异常', itemStyle: { color: '#00d4ff' } },
    { value: randInt(8, 20), name: '运行告警', itemStyle: { color: '#9467ff' } },
    { value: randInt(5, 15), name: '维护提醒', itemStyle: { color: '#67c23a' } },
  ]

  typePie.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10,24,45,0.95)',
      borderColor: 'rgba(0,212,255,0.4)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: '{b}: {c}次 ({d}%)',
    },
    legend: {
      orient: 'vertical', left: 10, top: 'middle',
      textStyle: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
      icon: 'circle', itemWidth: 10, itemGap: 12,
    },
    series: [{
      type: 'pie', radius: ['20%', '65%'], center: ['60%', '50%'],
      roseType: 'area',
      label: {
        show: true, color: 'rgba(255,255,255,0.7)', fontSize: 10,
        formatter: '{d}%',
      },
      labelLine: {
        lineStyle: { color: 'rgba(0,212,255,0.3)' }, length: 8, length2: 12,
      },
      data: typeData,
      emphasis: {
        itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,212,255,0.4)' }
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
    }]
  }, true)
}

// ==================== 图表5: 设备告警排行 TOP10（横向柱状图） ====================
const initDeviceTop = () => {
  if (!deviceTopRef.value) return
  if (deviceTop) deviceTop.dispose()
  deviceTop = echarts.init(deviceTopRef.value)

  const devices = [
    '进水闸门', '格栅机B', '排泥阀C', '变频器D', '3#搅拌器',
    '脱水机A', '回流泵A', 'PAC加药泵', '2#鼓风机', '1#提升泵'
  ]
  const values = devices.map(() => randInt(2, 25)).sort((a, b) => a - b)

  deviceTop.setOption({
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(10,24,45,0.95)',
      borderColor: 'rgba(0,212,255,0.4)',
      textStyle: { color: '#fff', fontSize: 12 },
    },
    grid: { left: 85, right: 50, top: 8, bottom: 8 },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category', data: devices, inverse: false,
      axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      type: 'bar', data: values.map((v, i) => ({
        value: v,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: i >= 8 ? 'rgba(255,68,68,0.4)' : i >= 6 ? 'rgba(255,184,0,0.3)' : 'rgba(0,212,255,0.25)' },
              { offset: 1, color: i >= 8 ? '#ff4444' : i >= 6 ? '#ffb800' : '#00d4ff' },
            ]
          },
          borderRadius: [0, 4, 4, 0],
        }
      })),
      barWidth: 12,
      label: {
        show: true, position: 'right', fontSize: 11,
        color: (params: any) => {
          const i = params.dataIndex
          return i >= 8 ? '#ff4444' : i >= 6 ? '#ffb800' : '#00d4ff'
        },
        formatter: '{c}次',
      },
    }]
  }, true)
}

// ==================== 图表6: 告警处理时效分析（柱状图+折线混合） ====================
const initResolveTime = () => {
  if (!resolveTimeRef.value) return
  if (resolveTime) resolveTime.dispose()
  resolveTime = echarts.init(resolveTimeRef.value)

  const categories = ['<5min', '5-15min', '15-30min', '30-60min', '1-2h', '2-4h', '>4h']
  const countData = [randInt(15, 30), randInt(20, 40), randInt(10, 25), randInt(8, 18), randInt(5, 12), randInt(2, 8), randInt(1, 5)]
  const total = countData.reduce((a, b) => a + b, 0)
  // 累计百分比
  let cum = 0
  const cumulativeData = countData.map(v => {
    cum += v
    return parseFloat(((cum / total) * 100).toFixed(1))
  })

  resolveTime.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,24,45,0.95)',
      borderColor: 'rgba(0,212,255,0.4)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: any) => {
        const bar = params[0]
        const line = params[1]
        return `${bar.name}<br/>${bar.marker} 处理数量: ${bar.value}条<br/>${line.marker} 累计占比: ${line.value}%`
      }
    },
    legend: {
      data: ['处理数量', '累计占比'],
      textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
      top: 2, right: 10,
      icon: 'roundRect', itemWidth: 12, itemHeight: 3,
    },
    grid: { left: 40, right: 40, top: 35, bottom: 28 },
    xAxis: {
      type: 'category', data: categories,
      axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0,212,255,0.2)' } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value', name: '数量', nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0,212,255,0.08)', type: 'dashed' } },
        axisLine: { show: false },
      },
      {
        type: 'value', name: '累计%', nameTextStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
        max: 100, min: 0,
        axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
      }
    ],
    series: [
      {
        name: '处理数量', type: 'bar', data: countData, barWidth: '40%',
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#00d4ff' }, { offset: 1, color: 'rgba(0,212,255,0.25)' }]
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: '累计占比', type: 'line', yAxisIndex: 1, data: cumulativeData,
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: '#FFD700', width: 2 },
        itemStyle: { color: '#FFD700' },
      }
    ]
  }, true)
}

// ==================== 统一初始化所有图表 ====================
const initAllCharts = () => {
  initTrendChart()
  initLevelPie()
  initProcessBar()
  initTypePie()
  initDeviceTop()
  initResolveTime()
}

// ==================== resize 处理 ====================
const handleResize = () => {
  trendChart?.resize()
  levelPie?.resize()
  processBar?.resize()
  typePie?.resize()
  deviceTop?.resize()
  resolveTime?.resize()
}

// ==================== Watch 周期切换重绘 ====================
watch(trendPeriod, () => { refreshAllData(); nextTick(initTrendChart) })
watch(processPeriod, () => nextTick(initProcessBar))

// ==================== 生命周期 ====================
onMounted(() => {
  refreshAllData()
  nextTick(initAllCharts)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  levelPie?.dispose()
  processBar?.dispose()
  typePie?.dispose()
  deviceTop?.dispose()
  resolveTime?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
/* ========== 整体容器 ========== */
.alarm-statistics-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ========== 二级导航栏（与其他告警页面保持一致） ========== */
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

/* ========== 统计大屏正文区 ========== */
.statistics-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* 美化滚动条 */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(10,30,50,0.3); border-radius: 3px; }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(0,212,255,0.5), rgba(0,180,230,0.7));
    border-radius: 3px;
  }
}

/* ========== 顶部统计指标卡片行 ========== */
.stat-cards-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  flex-shrink: 0;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 12px;
    background: rgba(10, 24, 45, 0.8);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    /* 卡片底部装饰光条 */
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--glow-color, rgba(0,212,255,0.6)), transparent);
      opacity: 0.6;
    }

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(0, 212, 255, 0.5);
      box-shadow: 0 4px 16px rgba(0, 212, 255, 0.15);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;
      min-width: 0;

      .stat-value {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;

        .stat-num {
          font-size: 22px;
          font-family: 'DIN Alternate', 'Roboto Mono', monospace;
        }
        .stat-unit {
          font-size: 11px;
          margin-left: 2px;
          opacity: 0.7;
          font-weight: 400;
        }
      }

      .stat-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.55);
        margin-top: 3px;
      }
    }

    .stat-trend {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 10px;
      display: flex;
      align-items: center;
      gap: 1px;
      padding: 1px 4px;
      border-radius: 3px;

      &.up { color: #ff4444; background: rgba(255,68,68,0.12); }
      &.down { color: #67c23a; background: rgba(103,194,58,0.12); }
    }
  }
}

/* ========== 图表行 ========== */
.chart-row {
  flex-shrink: 0;

  .el-col { height: 280px; }
}

/* ========== 面板通用（与告警概览保持一致） ========== */
.panel {
  background: rgba(10, 24, 45, 0.85);
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 6px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  /* 面板顶部装饰线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent);
  }
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #00d4ff;
  border-bottom: 1px solid rgba(0, 212, 255, 0.12);
  flex-shrink: 0;

  .title-text {
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
  }

  .title-dot {
    width: 4px;
    height: 14px;
    background: #00d4ff;
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0, 212, 255, 0.6);
  }
}

.panel-body {
  flex: 1;
  padding: 6px 10px;
  min-height: 0;
}

/* ========== 图表容器 ========== */
.chart-full {
  width: 100%;
  height: 100%;
}

/* ========== 周期标签（与告警概览保持一致） ========== */
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
    border: 1px solid transparent;

    &.active {
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
      border-color: rgba(0, 212, 255, 0.4);
    }

    &:hover:not(.active) { color: rgba(255,255,255,0.8); }
  }
}

/* ========== 范围指示标签 ========== */
.scope-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(0, 212, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 6px;
  flex-shrink: 0;

  .scope-icon {
    font-size: 16px;
  }

  .scope-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
  }

  .scope-name {
    font-size: 13px;
    font-weight: 600;
    color: #00d4ff;
    text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
  }

  .scope-reset {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-left: auto;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.2s;

    &:hover {
      color: #00d4ff;
      border-color: rgba(0, 212, 255, 0.4);
      background: rgba(0, 212, 255, 0.1);
    }
  }
}

/* ========== 响应式适配 ========== */
@media (max-width: 1400px) {
  .stat-cards-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .stat-cards-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-row .el-col {
    height: 260px;
  }
}

@media (max-width: 600px) {
  .stat-cards-row {
    grid-template-columns: 1fr;
  }
}
</style>
