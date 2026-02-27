<template>
  <div class="energy-consumption-page">
    <!-- ========== 顶部：三大能耗概览卡片 ========== -->
    <div class="overview-cards">
      <!-- 电能消耗卡片 -->
      <div class="overview-card electricity-card">
        <div class="card-inner">
          <!-- 卡片头部 -->
          <div class="card-head">
            <div class="head-left">
              <span class="update-time">截止时间: {{ updateTime }}</span>
            </div>
            <div class="head-center">
              <span class="energy-icon electricity-icon">⚡</span>
              <span class="energy-label">电</span>
            </div>
            <div class="head-right">
              <span class="energy-unit">单位: 千瓦时</span>
            </div>
          </div>
          <!-- 卡片数据行 -->
          <div class="card-data-rows">
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">昨天:</span>
                <span class="item-value">{{ formatNumber(elecData.yesterday) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">值天:</span>
                <span class="item-value">{{ formatNumber(elecData.today) }}</span>
              </div>
              <div class="data-item yoy">
                <span class="item-label">同期环比:</span>
                <span :class="['item-value', elecData.dayYoy >= 0 ? 'up' : 'down']">
                  {{ formatPercent(elecData.dayYoy) }}
                  <span class="arrow">{{ elecData.dayYoy >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">本月:</span>
                <span class="item-value">{{ formatNumber(elecData.month) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">上月:</span>
                <span class="item-value">{{ formatNumber(elecData.lastMonth) }}</span>
              </div>
              <div class="data-item yoy">
                <span class="item-label">同期环比:</span>
                <span :class="['item-value', elecData.monthYoy >= 0 ? 'up' : 'down']">
                  {{ formatPercent(elecData.monthYoy) }}
                  <span class="arrow">{{ elecData.monthYoy >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">今年:</span>
                <span class="item-value">{{ formatNumber(elecData.year) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">去年:</span>
                <span class="item-value">{{ formatNumber(elecData.lastYear) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 水耗消耗卡片 -->
      <div class="overview-card water-card">
        <div class="card-inner">
          <!-- 卡片头部 -->
          <div class="card-head">
            <div class="head-left">
              <span class="update-time">截止时间: {{ updateTime }}</span>
            </div>
            <div class="head-center">
              <span class="energy-icon water-icon">💧</span>
              <span class="energy-label">水</span>
            </div>
            <div class="head-right">
              <span class="energy-unit">单位: 吨</span>
            </div>
          </div>
          <!-- 卡片数据行 -->
          <div class="card-data-rows">
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">昨天:</span>
                <span class="item-value">{{ formatNumber(waterData.yesterday) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">值天:</span>
                <span class="item-value">{{ formatNumber(waterData.today) }}</span>
              </div>
              <div class="data-item yoy">
                <span class="item-label">同期环比:</span>
                <span :class="['item-value', waterData.dayYoy >= 0 ? 'up' : 'down']">
                  {{ formatPercent(waterData.dayYoy) }}
                  <span class="arrow">{{ waterData.dayYoy >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">本月:</span>
                <span class="item-value">{{ formatNumber(waterData.month) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">上月:</span>
                <span class="item-value">{{ formatNumber(waterData.lastMonth) }}</span>
              </div>
              <div class="data-item yoy">
                <span class="item-label">同期环比:</span>
                <span :class="['item-value', waterData.monthYoy >= 0 ? 'up' : 'down']">
                  {{ formatPercent(waterData.monthYoy) }}
                  <span class="arrow">{{ waterData.monthYoy >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">今年:</span>
                <span class="item-value">{{ formatNumber(waterData.year) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">去年:</span>
                <span class="item-value">{{ formatNumber(waterData.lastYear) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 碳排放量卡片 -->
      <div class="overview-card carbon-card">
        <div class="card-inner">
          <!-- 卡片头部 -->
          <div class="card-head">
            <div class="head-left">
              <span class="update-time">截止时间: {{ updateTime }}</span>
            </div>
            <div class="head-center">
              <span class="energy-icon carbon-icon">🏭</span>
              <span class="energy-label">碳排放量</span>
            </div>
            <div class="head-right">
              <span class="energy-unit">单位: 千克</span>
            </div>
          </div>
          <!-- 卡片数据行 -->
          <div class="card-data-rows">
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">昨天:</span>
                <span class="item-value">{{ formatNumber(carbonData.yesterday) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">值天:</span>
                <span class="item-value">{{ formatNumber(carbonData.today) }}</span>
              </div>
              <div class="data-item yoy">
                <span class="item-label">同期环比:</span>
                <span :class="['item-value', carbonData.dayYoy >= 0 ? 'up' : 'down']">
                  {{ formatPercent(carbonData.dayYoy) }}
                  <span class="arrow">{{ carbonData.dayYoy >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">本月:</span>
                <span class="item-value">{{ formatNumber(carbonData.month) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">上月:</span>
                <span class="item-value">{{ formatNumber(carbonData.lastMonth) }}</span>
              </div>
              <div class="data-item yoy">
                <span class="item-label">同期环比:</span>
                <span :class="['item-value', carbonData.monthYoy >= 0 ? 'up' : 'down']">
                  {{ formatPercent(carbonData.monthYoy) }}
                  <span class="arrow">{{ carbonData.monthYoy >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
            <div class="data-row">
              <div class="data-item">
                <span class="item-label">今年:</span>
                <span class="item-value">{{ formatNumber(carbonData.year) }}</span>
              </div>
              <div class="data-item">
                <span class="item-label">去年:</span>
                <span class="item-value">{{ formatNumber(carbonData.lastYear) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 中部：昨日24小时用能趋势 ========== -->
    <div class="trend-section daily-trend-section">
      <div class="section-title-bar">
        <span class="section-dot"></span>
        <span class="section-title">昨日24小时用能趋势</span>
      </div>
      <div class="trend-body">
        <!-- 左侧统计摘要 -->
        <div class="trend-summary">
          <div class="summary-item">
            <span class="summary-label">昨日总用水量</span>
            <div class="summary-value-row">
              <span class="summary-value">{{ formatNumber(dailyTrendSummary.totalConsumption) }}</span>
              <span class="summary-unit">t</span>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-label">同期环比</span>
            <div class="summary-value-row">
              <span :class="['summary-value', 'yoy-value', dailyTrendSummary.yoyChange >= 0 ? 'up' : 'down']">
                {{ formatPercent(dailyTrendSummary.yoyChange) }}
                <span class="arrow">{{ dailyTrendSummary.yoyChange >= 0 ? '↑' : '↓' }}</span>
              </span>
            </div>
          </div>
        </div>
        <!-- 右侧图表 -->
        <div class="trend-chart-wrapper">
          <div ref="dailyChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- ========== 底部：两个并排图表 ========== -->
    <div class="bottom-charts">
      <!-- 月能耗每日用能趋势 -->
      <div class="trend-section bottom-chart-section">
        <div class="section-title-bar">
          <span class="section-dot"></span>
          <span class="section-title">月能耗每日用能趋势</span>
        </div>
        <div class="trend-body">
          <div class="trend-summary">
            <div class="summary-item">
              <span class="summary-label">本月总用水量</span>
              <div class="summary-value-row">
                <span class="summary-value">{{ formatNumber(monthlyTrendSummary.totalConsumption) }}</span>
                <span class="summary-unit">t</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-label">同期环比</span>
              <div class="summary-value-row">
                <span :class="['summary-value', 'yoy-value', monthlyTrendSummary.yoyChange >= 0 ? 'up' : 'down']">
                  {{ formatPercent(monthlyTrendSummary.yoyChange) }}
                  <span class="arrow">{{ monthlyTrendSummary.yoyChange >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
          </div>
          <div class="trend-chart-wrapper">
            <div ref="monthlyChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>

      <!-- 年度月份用能趋势 -->
      <div class="trend-section bottom-chart-section">
        <div class="section-title-bar">
          <span class="section-dot"></span>
          <span class="section-title">年度{{ currentMonth }}月份用能趋势</span>
        </div>
        <div class="trend-body">
          <div class="trend-summary">
            <div class="summary-item">
              <span class="summary-label">今年总用水量</span>
              <div class="summary-value-row">
                <span class="summary-value">{{ formatNumber(yearlyTrendSummary.totalConsumption) }}</span>
                <span class="summary-unit">t</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-label">同期环比</span>
              <div class="summary-value-row">
                <span :class="['summary-value', 'yoy-value', yearlyTrendSummary.yoyChange >= 0 ? 'up' : 'down']">
                  {{ formatPercent(yearlyTrendSummary.yoyChange) }}
                  <span class="arrow">{{ yearlyTrendSummary.yoyChange >= 0 ? '↑' : '↓' }}</span>
                </span>
              </div>
            </div>
          </div>
          <div class="trend-chart-wrapper">
            <div ref="yearlyChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 能耗数据分析页面
 * 
 * 展示电、水、碳排放三类能耗的概览统计和趋势分析图表。
 * 包含：
 *  - 顶部三大能耗概览卡片（电、水、碳排放）
 *  - 昨日24小时用能趋势折线图
 *  - 月能耗每日用能趋势柱状图
 *  - 年度月份用能趋势柱状图
 */
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import dayjs from 'dayjs'

// ========== 接口定义 ==========
/** 能耗概览数据 */
interface EnergyOverview {
  yesterday: number
  today: number
  dayYoy: number        // 日同期环比（百分比）
  month: number
  lastMonth: number
  monthYoy: number      // 月同期环比（百分比）
  year: number
  lastYear: number
}

/** 趋势摘要数据 */
interface TrendSummary {
  totalConsumption: number
  yoyChange: number     // 同比变化（百分比）
}

// ========== 响应式状态 ==========
const dailyChartRef = ref<HTMLElement>()
const monthlyChartRef = ref<HTMLElement>()
const yearlyChartRef = ref<HTMLElement>()

let dailyChart: ECharts | null = null
let monthlyChart: ECharts | null = null
let yearlyChart: ECharts | null = null

// 更新时间
const updateTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))

// 当前月份（用于标题显示）
const currentMonth = computed(() => dayjs().month() + 1)

// ========== 模拟数据 ==========
// 电能消耗数据
const elecData = ref<EnergyOverview>({
  yesterday: 10480.2,
  today: 10457.6,
  dayYoy: 0.22,
  month: 192570,
  lastMonth: 53886.6,
  monthYoy: 257.36,
  year: 246456.6,
  lastYear: 0,
})

// 水耗消耗数据
const waterData = ref<EnergyOverview>({
  yesterday: 0,
  today: 0,
  dayYoy: -100,
  month: 0,
  lastMonth: 1118,
  monthYoy: -100,
  year: 1118,
  lastYear: 0,
})

// 碳排放量数据
const carbonData = ref<EnergyOverview>({
  yesterday: 8279.36,
  today: 8261.5,
  dayYoy: 0.22,
  month: 153130.3,
  lastMonth: 43567.78,
  monthYoy: 250,
  year: 0,
  lastYear: 0,
})

// 昨日24小时趋势摘要
const dailyTrendSummary = ref<TrendSummary>({
  totalConsumption: 10450.2,
  yoyChange: -0.22,
})

// 月能耗趋势摘要
const monthlyTrendSummary = ref<TrendSummary>({
  totalConsumption: 192570,
  yoyChange: 257.36,
})

// 年度趋势摘要
const yearlyTrendSummary = ref<TrendSummary>({
  totalConsumption: 1118,
  yoyChange: 25,
})

// ========== 工具函数 ==========
/**
 * 格式化数字，保留适当的小数位，并添加千分位分隔符
 */
function formatNumber(value: number): string {
  if (value === null || value === undefined) return '-'
  if (value === 0) return '0'
  // 保留最多两位小数
  const fixed = Number.isInteger(value) ? value.toString() : value.toFixed(2)
  // 添加千分位分隔
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * 格式化百分比
 */
function formatPercent(value: number): string {
  if (value === null || value === undefined) return '-'
  return `${Math.abs(value).toFixed(2)}%`
}

// ========== 生成模拟图表数据 ==========
/**
 * 生成24小时趋势数据
 */
function generateDailyData() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}h`)
  // 上一期数据 (20220221)
  const prevData = hours.map(() => +(Math.random() * 0.3 + 0.1).toFixed(3))
  // 当前期数据 (20220222) - 有一定的趋势模式
  const currData = hours.map((_, i) => {
    // 模拟白天能耗较高的模式
    const base = i >= 7 && i <= 20 ? 0.3 : 0.1
    return +(base + Math.random() * 0.4).toFixed(3)
  })
  return { hours, prevData, currData }
}

/**
 * 生成月度每日趋势数据（柱状图）
 */
function generateMonthlyData() {
  const currentYear = dayjs().year()
  const prevYear = currentYear - 1
  const daysInMonth = dayjs().daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}号`)

  // 本年度数据
  const currentData = days.map(() => +(Math.random() * 800 + 200).toFixed(0))
  // 上一年度数据
  const prevData = days.map(() => +(Math.random() * 600 + 100).toFixed(0))

  return { days, currentData, prevData, currentYear, prevYear }
}

/**
 * 生成年度月份趋势数据（柱状图）
 */
function generateYearlyData() {
  const currentYear = dayjs().year()
  const prevYear = currentYear - 1
  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

  // 本年度数据
  const currentData = months.map(() => +(Math.random() * 800 + 200).toFixed(0))
  // 上一年度数据
  const prevData = months.map(() => +(Math.random() * 600 + 100).toFixed(0))

  return { months, currentData, prevData, currentYear, prevYear }
}

// ========== 图表初始化 ==========
/**
 * 初始化昨日24小时折线图
 */
function initDailyChart() {
  if (!dailyChartRef.value) return

  dailyChart = echarts.init(dailyChartRef.value)
  const { hours, prevData, currData } = generateDailyData()
  const currentDate = dayjs().format('YYYYMMDD')
  const prevDate = dayjs().subtract(1, 'day').format('YYYYMMDD')

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: [prevDate, currentDate],
      top: 5,
      right: 50,
      textStyle: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 11 },
      itemWidth: 20,
      itemHeight: 10,
    },
    // 右上角工具箱图标（折线、柱状、区域切换）
    toolbox: {
      right: 10,
      top: 0,
      itemSize: 14,
      iconStyle: {
        borderColor: 'rgba(255,255,255,0.5)',
      },
      feature: {
        magicType: { type: ['line', 'bar'] },
        saveAsImage: { pixelRatio: 2, title: '保存' },
      },
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '10%',
      top: '50px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hours,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.08)', type: 'dashed' } },
    },
    series: [
      {
        name: prevDate,
        type: 'line',
        data: prevData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#00d4ff', width: 2 },
        itemStyle: { color: '#00d4ff' },
      },
      {
        name: currentDate,
        type: 'line',
        data: currData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#67c23a', width: 2 },
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.25)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.02)' },
            ],
          },
        },
      },
    ],
  }

  dailyChart.setOption(option)
}

/**
 * 初始化月能耗每日柱状图
 */
function initMonthlyChart() {
  if (!monthlyChartRef.value) return

  monthlyChart = echarts.init(monthlyChartRef.value)
  const { days, currentData, prevData, currentYear, prevYear } = generateMonthlyData()
  const currentMonth = dayjs().format('MM')

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: [`${prevYear}${currentMonth}`, `${currentYear}${currentMonth}`],
      top: 5,
      right: 20,
      textStyle: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 11 },
      itemWidth: 14,
      itemHeight: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '45px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        interval: 'auto',
        rotate: 0,
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.08)', type: 'dashed' } },
    },
    series: [
      {
        name: `${prevYear}${currentMonth}`,
        type: 'bar',
        data: prevData,
        barWidth: '35%',
        barGap: '20%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.3)' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
      },
      {
        name: `${currentYear}${currentMonth}`,
        type: 'bar',
        data: currentData,
        barWidth: '35%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#67c23a' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.3)' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
  }

  monthlyChart.setOption(option)
}

/**
 * 初始化年度月份柱状图
 */
function initYearlyChart() {
  if (!yearlyChartRef.value) return

  yearlyChart = echarts.init(yearlyChartRef.value)
  const { months, currentData, prevData, currentYear, prevYear } = generateYearlyData()

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 24, 45, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 12 },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: [`${prevYear}`, `${currentYear}`],
      top: 5,
      right: 20,
      textStyle: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 11 },
      itemWidth: 14,
      itemHeight: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '45px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.08)', type: 'dashed' } },
    },
    series: [
      {
        name: `${prevYear}`,
        type: 'bar',
        data: prevData,
        barWidth: '35%',
        barGap: '20%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00d4ff' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.3)' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
      },
      {
        name: `${currentYear}`,
        type: 'bar',
        data: currentData,
        barWidth: '35%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#FFBF00' },
              { offset: 1, color: 'rgba(255, 191, 0, 0.3)' },
            ],
          },
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
  }

  yearlyChart.setOption(option)
}

// ========== 窗口resize处理 ==========
function handleResize() {
  dailyChart?.resize()
  monthlyChart?.resize()
  yearlyChart?.resize()
}

// ========== 生命周期 ==========
onMounted(async () => {
  await nextTick()
  // 初始化三个图表
  initDailyChart()
  initMonthlyChart()
  initYearlyChart()
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  // 销毁 ECharts 实例，释放资源
  dailyChart?.dispose()
  monthlyChart?.dispose()
  yearlyChart?.dispose()
  dailyChart = null
  monthlyChart = null
  yearlyChart = null
})
</script>

<style scoped lang="scss">
/* ========== 页面根容器 ========== */
.energy-consumption-page {
  width: 100%;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.6) 0%, rgba(15, 30, 55, 0.4) 100%);

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(10, 30, 50, 0.3);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    &:hover {
      background: rgba(0, 212, 255, 0.5);
    }
  }
}

/* ========== 顶部概览卡片区域 ========== */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  flex-shrink: 0;
}

/* 单个概览卡片 */
.overview-card {
  background: rgba(10, 24, 45, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: rgba(0, 212, 255, 0.4);
    box-shadow: 0 0 16px rgba(0, 212, 255, 0.1);
  }
}

.card-inner {
  padding: 12px 16px;
}

/* 卡片头部 */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
}

.head-left {
  flex: 1;
}

.update-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.head-center {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.energy-icon {
  font-size: 18px;
}

.energy-label {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.head-right {
  flex: 1;
  text-align: right;
}

.energy-unit {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

/* 卡片数据行 */
.card-data-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 3px 0;
}

.data-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex: 1;
  min-width: 0;

  &.yoy {
    flex: 1.3;
  }
}

.item-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  flex-shrink: 0;
}

.item-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  white-space: nowrap;

  &.up {
    color: #f56c6c;
  }

  &.down {
    color: #67c23a;
  }
}

.arrow {
  font-size: 10px;
  margin-left: 2px;
}

/* ========== 趋势图表区域通用样式 ========== */
.trend-section {
  background: rgba(10, 24, 45, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: rgba(0, 212, 255, 0.3);
  }
}

/* 区域标题栏 */
.section-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 6px;
}

.section-dot {
  width: 4px;
  height: 14px;
  background: #00d4ff;
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.5);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;
}

/* 趋势主体（左侧摘要 + 右侧图表） */
.trend-body {
  display: flex;
  padding: 0 16px 10px;
  gap: 16px;
}

/* 趋势摘要 */
.trend-summary {
  flex-shrink: 0;
  width: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.summary-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  line-height: 1.2;

  &.yoy-value {
    font-size: 16px;

    &.up {
      color: #f56c6c;
    }

    &.down {
      color: #67c23a;
    }
  }
}

.summary-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 图表容器 */
.trend-chart-wrapper {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.chart-container {
  width: 100%;
  height: 100%;
}

/* ========== 昨日24小时趋势区域高度 ========== */
.daily-trend-section {
  flex-shrink: 0;

  .trend-body {
    height: 240px;
  }
}

/* ========== 底部并排图表 ========== */
.bottom-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  flex-shrink: 0;
}

.bottom-chart-section {
  .trend-body {
    height: 230px;
  }
}

/* ========== 电/水/碳 卡片特殊主题色 ========== */
.electricity-card {
  .energy-label { color: #FFD700; }
  .energy-icon { filter: brightness(1.2); }
  border-left: 3px solid rgba(255, 215, 0, 0.5);
}

.water-card {
  .energy-label { color: #00d4ff; }
  border-left: 3px solid rgba(0, 212, 255, 0.5);
}

.carbon-card {
  .energy-label { color: #a0a0a0; }
  border-left: 3px solid rgba(160, 160, 160, 0.5);
}

/* ========== 响应式适配 ========== */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 让第三个卡片占满整行 */
  .overview-card:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .bottom-charts {
    grid-template-columns: 1fr;
  }

  .trend-body {
    flex-direction: column;
  }

  .trend-summary {
    width: 100%;
    flex-direction: row;
    gap: 24px;
    padding: 0;
  }

  .daily-trend-section .trend-body {
    height: auto;
  }

  .daily-trend-section .trend-chart-wrapper {
    height: 200px;
  }

  .bottom-chart-section .trend-body {
    height: auto;
  }

  .bottom-chart-section .trend-chart-wrapper {
    height: 200px;
  }
}

@media (max-width: 768px) {
  .energy-consumption-page {
    padding: 12px;
    gap: 10px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .overview-card:last-child {
    grid-column: auto;
  }

  .data-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .data-item {
    min-width: 100px;
  }

  .trend-summary {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }

  .summary-value {
    font-size: 18px;
  }

  .bottom-chart-section .trend-chart-wrapper,
  .daily-trend-section .trend-chart-wrapper {
    height: 180px;
  }
}
</style>
