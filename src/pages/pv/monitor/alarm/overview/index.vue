<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree 
        device-type="0917"
        @node-click="handleStationSelect" 
      />
    </template>
    
    <!-- 右侧内容 -->
    <template #right>
      <div class="alarm-overview-content">
        <!-- 顶部三列 -->
        <div class="top-row" :class="{ 'mobile-top-row': isMobile }">
          <!-- 设备概览 -->
          <div class="stat-card">
            <div class="card-title">设备概览</div>
            <div class="alarm-stats">
              <div class="overview-grid">
                <div class="overview-item">
                  <div class="label">所有设备</div>
                  <div class="value">{{ deviceOverview.allDevices }}</div>
                </div>
                <div class="overview-item">
                  <div class="label">在线设备</div>
                  <div class="value">{{ deviceOverview.onLineDevices }}</div>
                </div>
                <div class="overview-item">
                  <div class="label">活跃设备</div>
                  <div class="value">{{ deviceOverview.activeDevices }}</div>
                </div>
                <div class="overview-item">
                  <div class="label">告警设备</div>
                  <div class="value">{{ deviceOverview.alertDevices }}</div>
                </div>
                <div class="overview-item">
                  <div class="label">告警量</div>
                  <div class="value">{{ deviceOverview.dailyOperation }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 今日新增告警 -->
          <div class="chart-card">
            <div class="card-title">今日新增告警</div>
            <div ref="todayChartRef" class="mini-chart"></div>
          </div>

          <!-- 设备统计 -->
          <div class="device-card">
            <div class="card-title">设备统计</div>
            <div class="device-stats-grid">
              <div class="stat-item monitor">
                <div class="label">监测数据</div>
                <div class="value">{{ deviceStats.monitorData }}</div>
              </div>
              <div class="stat-item alert">
                <div class="label">告警数量</div>
                <div class="value">{{ deviceStats.alertNum }}</div>
              </div>
              <div class="stat-item operation">
                <div class="label">操作量</div>
                <div class="value">{{ deviceStats.operationLog }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部两列 -->
        <div class="bottom-row" :class="{ 'mobile-bottom-row': isMobile }">
          <!-- 告警次数统计 -->
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">告警次数统计</span>
              <div class="controls">
                <el-radio-group v-model="trendTimeRange" @change="fetchTrendData">
                  <el-radio-button label="24h">24小时</el-radio-button>
                  <el-radio-button label="3d">3天</el-radio-button>
                  <el-radio-button label="7d">7天</el-radio-button>
                  <el-radio-button label="15d">15天</el-radio-button>
                  <el-radio-button label="30d">30天</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div ref="trendChartRef" class="chart" v-loading="loading"></div>
          </div>

          <!-- 设备告警率统计 -->
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">设备告警率统计</span>
              <el-radio-group v-model="alarmRateTimeRange" @change="fetchAlarmRateData">
                <el-radio-button label="24h">24小时</el-radio-button>
                <el-radio-button label="3d">3天</el-radio-button>
                <el-radio-button label="7d">7天</el-radio-button>
                <el-radio-button label="15d">15天</el-radio-button>
                <el-radio-button label="30d">30天</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="rankChartRef" class="chart" v-loading="loading"></div>
          </div>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import { getDeviceAlarmRate, getTimeIntervalLogs, getMonitorData, getAlertNum, getOperationLog, getAllDevices, getOnLineDeviceNum, getActiveDevicesNum, getAlertDevicesNum, getDailyOperation } from '@/api/alarm/overview'
import type { AlarmTrendData, AlarmRankItem } from '@/api/types/alarm/overview'

// 状态
const selectedStationId = ref('LHYR98NH00000014')
const trendTimeRange = ref('24h') // 告警次数统计时间范围：24h, 3d, 7d, 15d, 30d（默认24小时）
const alarmRateTimeRange = ref('24h') // 告警率时间范围：24h, 3d, 7d, 15d, 30d（默认24小时）

// 设备统计数据
const deviceStats = ref({
  monitorData: 0,    // 监测数据
  alertNum: 0,       // 告警数量
  operationLog: 0    // 操作量
})

// 设备概览统计数据
const deviceOverview = ref({
  allDevices: 0,        // 所有设备
  onLineDevices: 0,     // 在线设备
  activeDevices: 0,     // 活跃设备
  alertDevices: 0,      // 告警设备
  dailyOperation: 0     // 告警量
})

// 移动端检测
const isMobile = ref(false)

// 检测是否为移动端
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  const wasChanged = isMobile.value !== newIsMobile
  isMobile.value = newIsMobile
  
  if (wasChanged) {
    // 布局变化时需要更长延迟确保DOM完全更新
    setTimeout(() => {
      // 强制重新初始化图表以适应新的布局
      if (todayChart) {
        todayChart.dispose()
        todayChart = null
        initTodayChart()
      }
      if (trendChart) {
        trendChart.dispose()
        trendChart = null
        updateTrendChart()
      }
      if (rankChart) {
        rankChart.dispose()
        rankChart = null
        updateRankChart()
      }
    }, 300)
  } else {
    // 仅尺寸变化时的简单resize
    setTimeout(() => {
      todayChart?.resize()
      trendChart?.resize()
      rankChart?.resize()
    }, 100)
  }
}
const trendData = ref<AlarmTrendData>({
  confirmAlarmSum: 0,
  confirmAlarmList: [],
  timeList: [],
  newAlarmList: [],
  falseAlarmSum: 0,
  alarmSum: 0,
  accuracy: '-'
})
const rankData = ref<AlarmRankItem[]>([])
const loading = ref(false)
const trendChartRef = ref<HTMLElement>()
const rankChartRef = ref<HTMLElement>()
const todayChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let rankChart: echarts.ECharts | null = null
let todayChart: echarts.ECharts | null = null

// 初始化数据加载
async function initData() {
  selectedStationId.value = 'LHYR98NH00000014'
  await Promise.all([fetchDeviceOverview(), fetchDeviceStats(), fetchTrendData(), fetchAlarmRateData()])
}

// 电站选择
function handleStationSelect(node: any) {
  // 使用regionId或id作为站点ID
  selectedStationId.value = node.regionId || node.id
  Promise.all([fetchDeviceOverview(), fetchDeviceStats(), fetchTrendData(), fetchAlarmRateData()])
}

// 获取设备概览统计数据
async function fetchDeviceOverview() {
  if (!selectedStationId.value) return
  
  loading.value = true
  try {
    // 使用24小时作为默认时间范围
    const item = 1
    // 并行请求5个接口
    const [allDevices, onLineDevices, activeDevices, alertDevices, dailyOperation] = await Promise.all([
      getAllDevices(),
      getOnLineDeviceNum(),
      getActiveDevicesNum(item),
      getAlertDevicesNum(item),
      getDailyOperation(item)
    ])
    
    deviceOverview.value = {
      allDevices,
      onLineDevices,
      activeDevices,
      alertDevices,
      dailyOperation
    }
  } catch (error) {
    ElMessage.error('加载设备概览数据失败')
  } finally {
    loading.value = false
  }
}

// 获取设备统计数据
async function fetchDeviceStats() {
  if (!selectedStationId.value) return
  
  loading.value = true
  try {
    // 使用24小时作为默认时间范围
    const item = 1
    // 并行请求三个接口
    const [monitorData, alertNum, operationLog] = await Promise.all([
      getMonitorData(item),
      getAlertNum(item),
      getOperationLog(item)
    ])
    
    deviceStats.value = {
      monitorData,
      alertNum,
      operationLog
    }
  } catch (error) {
    ElMessage.error('加载设备统计数据失败')
  } finally {
    loading.value = false
  }
}

// 时间粒度切换

// 获取趋势数据（使用折线图接口）
async function fetchTrendData() {
  if (!selectedStationId.value) return
  
  loading.value = true
  try {
    // 将时间范围转换为接口参数
    const timeRangeMap: Record<string, number> = {
      '24h': 1,   // 24小时
      '3d': 3,    // 3天
      '7d': 7,    // 7天
      '15d': 15,  // 15天
      '30d': 30   // 30天
    }
    
    const item = timeRangeMap[trendTimeRange.value] || 7
    
    // 调用新的折线图接口
    const response = await getTimeIntervalLogs(item)
    
    // 转换数据格式
    const commonly = response['1'] || []  // 普通告警
    const serious = response['2'] || []   // 重要告警
    const emergent = response['3'] || []  // 紧急告警
    
    const option = {
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(10, 30, 50, 0.9)',
        borderColor: 'rgba(0, 212, 255, 0.5)',
        textStyle: { color: '#fff' },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: { 
        data: ['普通告警', '重要告警', '紧急告警'], 
        textStyle: { 
          color: '#fff',
          fontSize: isMobile.value ? 12 : 14
        },
        top: '10px'
      },
      grid: { 
        left: '3%', 
        right: '4%', 
        bottom: '3%', 
        top: '40px',
        containLabel: true 
      },
      xAxis: { 
        type: 'category', 
        boundaryGap: false,
        data: commonly.map(item => item.time_interval),
        axisLabel: { 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile.value ? 10 : 12,
          rotate: isMobile.value ? 45 : 0
        },
        axisLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.3)' }
        }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile.value ? 10 : 12
        },
        axisLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.3)' }
        },
        splitLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.1)' }
        }
      },
      series: [
        {
          name: '普通告警',
          type: 'line',
          stack: 'Total',
          itemStyle: { color: '#DEFF0A' },
          lineStyle: { width: isMobile.value ? 1 : 2 },
          symbolSize: isMobile.value ? 2 : 4,
          emphasis: {
            focus: 'series'
          },
          data: commonly.map(item => item.total_data)
        },
        {
          name: '重要告警',
          type: 'line',
          stack: 'Total',
          itemStyle: { color: '#FF8700' },
          lineStyle: { width: isMobile.value ? 1 : 2 },
          symbolSize: isMobile.value ? 2 : 4,
          emphasis: {
            focus: 'series'
          },
          data: serious.map(item => item.total_data)
        },
        {
          name: '紧急告警',
          type: 'line',
          stack: 'Total',
          itemStyle: { color: '#FF0000' },
          lineStyle: { width: isMobile.value ? 1 : 2 },
          symbolSize: isMobile.value ? 2 : 4,
          emphasis: {
            focus: 'series'
          },
          data: emergent.map(item => item.total_data)
        }
      ]
    }

    // 确保图表已初始化
    if (!trendChartRef.value) {
      console.warn('告警次数统计图表容器未准备好')
      return
    }
    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value)
    }

    trendChart.setOption(option, { notMerge: true })
    
    // 确保图表在数据更新后重新渲染
    setTimeout(() => {
      trendChart?.resize()
    }, 100)
  } catch (error) {
    ElMessage.error('加载告警趋势数据失败')
  } finally {
    loading.value = false
  }
}

// 获取告警率数据（饼图）
async function fetchAlarmRateData() {
  if (!selectedStationId.value) return
  
  loading.value = true
  try {
    // 将时间范围转换为接口参数
    const timeRangeMap: Record<string, number> = {
      '24h': 1,   // 24小时
      '3d': 3,    // 3天
      '7d': 7,    // 7天
      '15d': 15,  // 15天
      '30d': 30   // 30天
    }
    
    const item = timeRangeMap[alarmRateTimeRange.value] || 7
    // 调用真实接口
    const response = await getDeviceAlarmRate(item)
    
    // 转换数据格式用于饼图（字符串转数字）
    rankData.value = [
      { deviceName: '普通告警', alarmcount: parseInt(response.commonly) || 0 },
      { deviceName: '重要告警', alarmcount: parseInt(response.serious) || 0 },
      { deviceName: '紧急告警', alarmcount: parseInt(response.emergent) || 0 }
    ] as any
    
    updateRankChart()
    
    // 确保图表在数据更新后重新渲染
    setTimeout(() => {
      rankChart?.resize()
    }, 100)
  } catch (error) {
    ElMessage.error('加载告警率数据失败')
  } finally {
    loading.value = false
  }
}

// 更新趋势图表（堆叠面积图）
async function updateTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  
  // 重新获取数据以获取三个级别的详细数据
  const timeRangeMap: Record<string, number> = {
    '24h': 1,   // 24小时
    '3d': 3,    // 3天
    '7d': 7,    // 7天
    '15d': 15,  // 15天
    '30d': 30   // 30天
  }
  
  const item = timeRangeMap[trendTimeRange.value] || 7
  
  try {
    const response = await getTimeIntervalLogs(item)
    const commonly = response['1'] || []  // 普通告警
    const serious = response['2'] || []   // 重要告警
    const emergent = response['3'] || []  // 紧急告警
    
    const option = {
      tooltip: { 
        trigger: 'axis',
        backgroundColor: 'rgba(10, 30, 50, 0.9)',
        borderColor: 'rgba(0, 212, 255, 0.5)',
        textStyle: { color: '#fff' },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: { 
        data: ['普通告警', '重要告警', '紧急告警'], 
        textStyle: { 
          color: '#fff',
          fontSize: isMobile.value ? 12 : 14
        },
        top: '10px'
      },
      grid: { 
        left: '3%', 
        right: '4%', 
        bottom: '3%', 
        top: '40px',
        containLabel: true 
      },
      xAxis: { 
        type: 'category', 
        boundaryGap: false,
        data: commonly.map(item => item.time_interval),
        axisLabel: { 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile.value ? 10 : 12,
          rotate: isMobile.value ? 45 : 0
        },
        axisLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.3)' }
        }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile.value ? 10 : 12
        },
        axisLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.3)' }
        },
        splitLine: {
          lineStyle: { color: 'rgba(0, 212, 255, 0.1)' }
        }
      },
      series: [
        {
          name: '普通告警',
          type: 'line',
          stack: 'Total',
          data: commonly.map(item => item.total_data),
          itemStyle: { color: '#DEFF0A' },
          lineStyle: { width: 2 },
          symbolSize: 4,
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: '重要告警',
          type: 'line',
          stack: 'Total',
          data: serious.map(item => item.total_data),
          itemStyle: { color: '#FF8700' },
          lineStyle: { width: 2 },
          symbolSize: 4,
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: '紧急告警',
          type: 'line',
          stack: 'Total',
          data: emergent.map(item => item.total_data),
          itemStyle: { color: '#FF0000' },
          lineStyle: { width: 2 },
          symbolSize: 4,
          emphasis: {
            focus: 'series'
          }
        }
      ]
    }
    
    trendChart.setOption(option)
    
    // 确保图表渲染完成后调整尺寸
    setTimeout(() => {
      trendChart?.resize()
    }, 100)
  } catch (error) {
    console.error('[告警概览] 更新趋势图表失败:', error)
  }
}

// 更新告警率饼图
function updateRankChart() {
  if (!rankChartRef.value) return
  if (!rankChart) {
    rankChart = echarts.init(rankChartRef.value)
  }
  
  // 准备饼图数据
  const pieData = rankData.value.map((item: any) => ({
    value: item.alarmcount,
    name: item.deviceName
  }))
  
  const option = {
    title: {
      text: '设备告警率',
      left: isMobile.value ? '5%' : '10',
      top: isMobile.value ? '5%' : '10',
      textStyle: {
        color: '#00d4ff',
        fontSize: isMobile.value ? 14 : 16,
        fontWeight: 600,
        textShadowColor: 'rgba(0, 212, 255, 0.5)',
        textShadowBlur: 10
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 30, 50, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.5)',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: isMobile.value ? '5%' : '20',
      top: isMobile.value ? '15%' : '57',
      itemWidth: isMobile.value ? 20 : 27,
      itemHeight: isMobile.value ? 14 : 18,
      itemGap: isMobile.value ? 10 : 15,
      textStyle: {
        fontSize: isMobile.value ? 12 : 15,
        color: 'rgba(255, 255, 255, 0.85)'
      }
    },
    series: [
      {
        type: 'pie',
        radius: isMobile.value ? ['30%', '50%'] : ['40%', '60%'],
        center: isMobile.value ? ['40%', '55%'] : ['30%', '60%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(10, 30, 50, 0.6)',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center',
          formatter: '{c}',
          fontSize: isMobile.value ? 16 : 20,
          color: '#fff'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobile.value ? 18 : 20,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 212, 255, 0.5)'
          }
        },
        data: pieData,
        color: ['#DEFF0A', '#FF8700', '#FF0000'], // 黄、橙、红
        labelLine: false
      }
    ]
  }
  
  rankChart.setOption(option)
  
  // 确保图表渲染完成后调整尺寸
  setTimeout(() => {
    rankChart?.resize()
  }, 100)
}

// 初始化今日新增告警图表
function initTodayChart() {
  if (!todayChartRef.value) return
  if (!todayChart) {
    todayChart = echarts.init(todayChartRef.value)
  }
  
  // 模拟数据：今日每小时新增告警
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = [0, 0, 0, 0, 0, 0, 1, 2, 1, 3, 2, 4, 5, 3, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0]
  
  todayChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: { color: '#fff', interval: 2 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' }
    },
    series: [
      {
        type: 'line',
        data: data,
        smooth: true,
        itemStyle: { color: '#FF6B6B' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 107, 0.5)' },
              { offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
            ]
          }
        }
      }
    ]
  })
}

// 组件挂载
onMounted(() => {
  // 初始化移动端检测
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  // 延迟初始化数据和图表确保DOM已渲染
  setTimeout(() => {
    initData()
    initTodayChart()
  }, 200)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 组件卸载
onUnmounted(() => {
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  if (rankChart) {
    rankChart.dispose()
    rankChart = null
  }
  if (todayChart) {
    todayChart.dispose()
    todayChart = null
  }
})

// 监听 isMobile 变化，重新渲染图表
watch(isMobile, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // 移动端状态变化时强制重新初始化所有图表
    setTimeout(() => {
      if (todayChart) {
        todayChart.dispose()
        todayChart = null
      }
      if (trendChart) {
        trendChart.dispose()
        trendChart = null
      }
      if (rankChart) {
        rankChart.dispose()
        rankChart = null
      }
      
      // 重新初始化
      setTimeout(() => {
        initTodayChart()
        updateTrendChart()
        updateRankChart()
      }, 100)
    }, 200)
  }
})
</script>

<style scoped lang="scss">
.alarm-overview-content {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    padding: 12px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    gap: 12px;
  }
  
  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(10, 30, 50, 0.4);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.5);
  }
  
  .top-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    
    /* 移动端适配 */
    &.mobile-top-row {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
  
  /* 平板端适配 */
  @media (max-width: 1024px) and (min-width: 769px) {
    .top-row {
      gap: 16px;
    }
  }
  
  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    flex: 1;
    min-height: 500px;
    
    /* 移动端适配 */
    &.mobile-bottom-row {
      grid-template-columns: 1fr;
      gap: 16px;
      min-height: auto;
    }
  }
  
  /* 平板端适配 */
  @media (max-width: 1024px) and (min-width: 769px) {
    .bottom-row {
      gap: 16px;
      min-height: 400px;
    }
  }
  
  .stat-card, .device-card, .chart-card {
    background: rgba(10, 30, 50, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 6px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.4);
      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
    }
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      padding: 16px;
      border-radius: 6px;
    }
    
    @media (max-width: 480px) {
      padding: 12px;
    }
  }
  
  .stat-card {
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      margin-bottom: 16px;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      text-align: center;
      
      /* 移动端适配 */
      @media (max-width: 768px) {
        font-size: 15px;
        margin-bottom: 12px;
      }
      
      @media (max-width: 480px) {
        font-size: 14px;
        margin-bottom: 10px;
      }
    }
    
    .alarm-stats {
      .overview-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        
        /* 移动端适配 */
        @media (max-width: 768px) {
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        
        @media (max-width: 480px) {
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        
        .overview-item {
          text-align: center;
          padding: 12px 8px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.25);
          border-radius: 4px;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: rgba(0, 212, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
          }
          
          /* 移动端适配 */
          @media (max-width: 768px) {
            padding: 10px 6px;
          }
          
          @media (max-width: 480px) {
            padding: 8px 4px;
          }
          
          .label {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.65);
            margin-bottom: 6px;
            
            /* 移动端适配 */
            @media (max-width: 768px) {
              font-size: 12px;
              margin-bottom: 4px;
            }
            
            @media (max-width: 480px) {
              font-size: 11px;
              margin-bottom: 3px;
            }
          }
          
          .value {
            font-size: 20px;
            font-weight: 600;
            color: #00d4ff;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
            
            /* 移动端适配 */
            @media (max-width: 768px) {
              font-size: 18px;
            }
            
            @media (max-width: 480px) {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
  
  .device-card {
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      margin-bottom: 16px;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }
    
    .device-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      
      .stat-item {
        text-align: center;
        padding: 16px;
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.25);
        border-radius: 4px;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: rgba(0, 212, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }
        
        /* 移动端适配 */
        @media (max-width: 480px) {
          padding: 8px;
        }
        
        .label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 8px;
          
          /* 移动端适配 */
          @media (max-width: 768px) {
            font-size: 13px;
          }
          
          @media (max-width: 480px) {
            font-size: 12px;
            margin-bottom: 6px;
          }
        }
        
        .value {
          font-size: 24px;
          font-weight: 600;
          color: #00d4ff;
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
          
          /* 移动端适配 */
          @media (max-width: 768px) {
            font-size: 20px;
          }
          
          @media (max-width: 480px) {
            font-size: 18px;
          }
        }
      }
    }
  }
  
  .chart-card {
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }
    
    .mini-chart {
      height: 180px;
      width: 100%;
      min-height: 120px;
      
      /* 移动端适配 */
      @media (max-width: 768px) {
        height: 150px;
        min-height: 100px;
      }
      
      @media (max-width: 480px) {
        height: 120px;
        min-height: 80px;
      }
    }
    
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
      
      .card-title {
        text-align: left;
        margin-bottom: 0;
      }
      
      .controls {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .el-date-picker {
          width: 100%;
        }
        
        .el-radio-group {
          width: 100%;
          
          .el-radio-button {
            flex: 1;
            
            :deep(.el-radio-button__inner) {
              width: 100%;
              font-size: 12px;
              padding: 8px 4px;
            }
          }
        }
      }
    }
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #00d4ff;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      }
      
      .controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }
    
    .chart {
      height: 450px;
    }
  }
}

// Element Plus 组件样式覆盖
:deep(.el-radio-group) {
  .el-radio-button__inner {
    background: rgba(0, 212, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.3);
    color: rgba(255, 255, 255, 0.85);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 212, 255, 0.2);
      border-color: #00d4ff;
      color: #fff;
    }
  }
  
  .el-radio-button__original-radio:checked + .el-radio-button__inner {
    background: rgba(0, 212, 255, 0.3);
    border-color: #00d4ff;
    color: #fff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }
}

:deep(.el-date-picker) {
  .el-input__wrapper {
    background: rgba(10, 30, 50, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: none;
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
    }
    
    &.is-focus {
      border-color: #00d4ff;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
    }
  }
  
  .el-input__inner {
    color: #fff;
  }
}
</style>
