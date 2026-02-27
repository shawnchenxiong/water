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
          <!-- 今日告警统计 -->
          <div class="stat-card">
            <div class="card-title">今日告警统计</div>
            <div class="alarm-stats">
              <div class="alarm-count">
                <div class="count-item" @click="navigateToRealtime">
                  <div class="label">今日实时</div>
                  <div class="value">0</div>
                </div>
                <div class="count-item" @click="navigateToHistory">
                  <div class="label">今日历史</div>
                  <div class="value">6</div>
                </div>
              </div>
              <div class="level-stats">
                <div class="level-item severe">
                  <div class="label">严重</div>
                  <div class="value">0</div>
                </div>
                <div class="level-item warning">
                  <div class="label">警告</div>
                  <div class="value">6</div>
                </div>
                <div class="level-item normal">
                  <div class="label">一般</div>
                  <div class="value">0</div>
                </div>
                <div class="level-item info">
                  <div class="label">提示</div>
                  <div class="value">0</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 今日新增告警 -->
          <div class="chart-card">
            <div class="card-title">今日新增告警</div>
            <div ref="todayChartRef" class="mini-chart"></div>
          </div>

          <!-- 今日告警设备 -->
          <div class="device-card">
            <div class="card-title">今日告警设备</div>
            <div class="device-list">
              <div class="device-item" @click="handleDeviceClick('inverter')">
                <div class="device-name">逆变器</div>
                <div class="device-count">3 台</div>
              </div>
              <div class="device-item" @click="handleDeviceClick('meter')">
                <div class="device-name">电能表</div>
                <div class="device-count">2 台</div>
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
                <el-date-picker
                  v-if="timeGranularity === 'month'"
                  v-model="queryDate"
                  type="month"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  @change="fetchTrendData"
                />
                <el-radio-group v-model="timeGranularity" @change="handleTimeChange">
                  <el-radio-button label="week">近7天</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="stats-cards">
              <div class="stat-item">
                <div class="stat-label">新增告警</div>
                <div class="stat-value">{{ trendData.alarmSum || 0 }} 条</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">确认告警</div>
                <div class="stat-value">{{ trendData.confirmAlarmSum || 0 }} 条</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">误报告警</div>
                <div class="stat-value">{{ trendData.falseAlarmSum || 0 }} 条</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">准确率</div>
                <div class="stat-value">{{ trendData.accuracy || '-' }} %</div>
              </div>
            </div>
            <div ref="trendChartRef" class="chart" v-loading="loading"></div>
          </div>

          <!-- 设备告警TOP20 -->
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">设备告警TOP20</span>
              <el-radio-group v-model="rankTimeGranularity" @change="fetchRankData">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
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
import dayjs from 'dayjs'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import { getAlarmCountTrend, getAlarmRank } from '@/api/alarm/overview'
import type { TimeGranularity, AlarmTrendData, AlarmRankItem } from '@/api/types/alarm/overview'

// 状态
const selectedStationId = ref('LHYR98NH00000014')
const timeGranularity = ref<TimeGranularity>('week')
const rankTimeGranularity = ref<TimeGranularity>('week')
const queryDate = ref(dayjs().format('YYYY-MM'))

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
  await Promise.all([fetchTrendData(), fetchRankData()])
}

// 电站选择
function handleStationSelect(node: any) {
  // 使用regionId或id作为站点ID
  selectedStationId.value = node.regionId || node.id
  Promise.all([fetchTrendData(), fetchRankData()])
}

// 时间粒度切换
function handleTimeChange() {
  if (timeGranularity.value === 'month') {
    queryDate.value = dayjs().format('YYYY-MM')
  }
  fetchTrendData()
}

// 获取趋势数据
async function fetchTrendData() {
  if (!selectedStationId.value) return
  
  loading.value = true
  try {
    const dateTypeMap: Record<TimeGranularity, number> = {
      week: 0,
      month: 1,
      year: 2
    }
    
    const params = {
      regionId: selectedStationId.value,
      dateType: dateTypeMap[timeGranularity.value],
      dateTime: timeGranularity.value === 'month' ? queryDate.value : ''
    }
    
    const response = await getAlarmCountTrend(params)
    if (response.code === 200) {
      trendData.value = response.data
      updateTrendChart()
      
      // 确保图表在数据更新后重新渲染
      setTimeout(() => {
        trendChart?.resize()
      }, 100)
    } else {
      ElMessage.error(response.message || '加载趋势数据失败')
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    ElMessage.error('加载趋势数据失败')
  } finally {
    loading.value = false
  }
}

// 获取排名数据
async function fetchRankData() {
  if (!selectedStationId.value) return
  
  loading.value = true
  try {
    const dateTypeMap: Record<TimeGranularity, number> = {
      week: 4,
      month: 1,
      year: 2
    }
    
    const params = {
      regionId: selectedStationId.value,
      dateType: dateTypeMap[rankTimeGranularity.value],
      dateTime: ''
    }
    
    const response = await getAlarmRank(params)
    if (response.code === 200) {
      rankData.value = response.data
      updateRankChart()
      
      // 确保图表在数据更新后重新渲染
      setTimeout(() => {
        rankChart?.resize()
      }, 100)
    } else {
      ElMessage.error(response.message || '加载排名数据失败')
    }
  } catch (error) {
    console.error('加载排名数据失败:', error)
    ElMessage.error('加载排名数据失败')
  } finally {
    loading.value = false
  }
}

// 更新趋势图表
function updateTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  
  const option = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(10, 30, 50, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.5)',
      textStyle: { color: '#fff' }
    },
    legend: { 
      data: ['新增告警', '确认告警'], 
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
      data: trendData.value.timeList,
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
        name: '新增告警',
        type: 'bar',
        data: trendData.value.newAlarmList,
        itemStyle: { color: '#FF6B6B' },
        barWidth: isMobile.value ? '60%' : '40%'
      },
      {
        name: '确认告警',
        type: 'line',
        data: trendData.value.confirmAlarmList,
        itemStyle: { color: '#4ECDC4' },
        symbol: 'circle',
        symbolSize: isMobile.value ? 4 : 6,
        lineStyle: { width: 2 }
      }
    ]
  }
  
  trendChart.setOption(option)
  
  // 确保图表渲染完成后调整尺寸
  setTimeout(() => {
    trendChart?.resize()
  }, 100)
}

// 更新排名图表
function updateRankChart() {
  if (!rankChartRef.value) return
  if (!rankChart) {
    rankChart = echarts.init(rankChartRef.value)
  }
  
  const top20 = rankData.value.slice(0, 20)
  const option = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(10, 30, 50, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.5)',
      textStyle: { color: '#fff' }
    },
    grid: { 
      left: isMobile.value ? '25%' : '20%', 
      right: '4%', 
      bottom: '3%', 
      top: '10px',
      containLabel: true 
    },
    xAxis: { 
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
    yAxis: {
      type: 'category',
      data: top20.map(item => item.deviceName),
      axisLabel: { 
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: isMobile.value ? 10 : 12,
        // 移动端截断过长的设备名
        formatter: isMobile.value ? function(value: string) {
          return value.length > 8 ? value.substring(0, 8) + '...' : value
        } : undefined
      },
      axisLine: {
        lineStyle: { color: 'rgba(0, 212, 255, 0.3)' }
      }
    },
    series: [
      {
        type: 'bar',
        data: top20.map(item => item.alarmcount),
        itemStyle: { color: '#00d4ff' },
        barWidth: isMobile.value ? '60%' : '40%'
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

// 导航到实时告警
function navigateToRealtime() {
  // TODO: 路由跳转
  ElMessage.info('跳转到实时告警页面')
}

// 导航到历史告警
function navigateToHistory() {
  // TODO: 路由跳转
  ElMessage.info('跳转到历史告警页面')
}

// 设备点击
function handleDeviceClick(type: string) {
  ElMessage.info(`点击了${type === 'inverter' ? '逆变器' : '电能表'}`)
}

// 组件挂载
onMounted(() => {
  // 初始化移动端检测
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  initData()
  
  // 延迟初始化图表确保DOM已渲染
  setTimeout(() => {
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
      .alarm-count {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        
        .count-item {
          flex: 1;
          text-align: center;
          padding: 12px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.25);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(0, 212, 255, 0.2);
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
      
      .level-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        
        /* 移动端适配 */
        @media (max-width: 480px) {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        
        .level-item {
          padding: 12px;
          border: 1px solid transparent;
          border-radius: 4px;
          text-align: center;
          transition: all 0.3s ease;
          
          &.severe {
            background: rgba(245, 108, 108, 0.15);
            border-color: rgba(245, 108, 108, 0.3);
            .value { 
              color: #F56C6C;
              text-shadow: 0 0 8px rgba(245, 108, 108, 0.5);
            }
          }
          
          &.warning {
            background: rgba(230, 162, 60, 0.15);
            border-color: rgba(230, 162, 60, 0.3);
            .value { 
              color: #E6A23C;
              text-shadow: 0 0 8px rgba(230, 162, 60, 0.5);
            }
          }
          
          &.normal {
            background: rgba(103, 194, 58, 0.15);
            border-color: rgba(103, 194, 58, 0.3);
            .value { 
              color: #67C23A;
              text-shadow: 0 0 8px rgba(103, 194, 58, 0.5);
            }
          }
          
          &.info {
            background: rgba(144, 147, 153, 0.15);
            border-color: rgba(144, 147, 153, 0.3);
            .value { 
              color: #909399;
            }
          }
          
          .label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.65);
            margin-bottom: 4px;
          }
          
          .value {
            font-size: 20px;
            font-weight: 600;
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
    
    .device-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .device-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.25);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: rgba(0, 212, 255, 0.5);
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }
        
        .device-name {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.85);
        }
        
        .device-count {
          font-size: 18px;
          font-weight: 600;
          color: #00d4ff;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
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
    
    .stats-cards {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      
      .stat-item {
        flex: 1;
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
        
        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #00d4ff;
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
      }
    }
    
    .chart {
      height: 400px;
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
