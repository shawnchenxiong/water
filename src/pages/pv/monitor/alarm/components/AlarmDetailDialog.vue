<template>
  <el-dialog
    v-model="dialogVisible"
    :before-close="handleClose"
    class="alarm-detail-dialog"
    :width="isMobile ? '95%' : '90%'"
    :top="isMobile ? '2vh' : '3vh'"
    :show-close="true"
  >
    <!-- 自定义标题 -->
    <template #header>
      <div class="dialog-header">
        <div class="alarm-title">
          <el-tag :type="getLevelTagType(props.alarmLevel || alarmDetail?.level)" class="alarm-tag">
            {{ getLevelText(props.alarmLevel || alarmDetail?.level) }}
          </el-tag>
          <span class="alarm-name">{{ alarmDetail?.operationalInformation || '告警详情' }}</span>
        </div>
      </div>
    </template>

    <div v-loading="loading" class="alarm-detail-container">
      <!-- 空状态 -->
      <div v-if="!loading && !alarmDetail" class="empty-state">
        <el-empty description="暂无告警详情数据" />
      </div>
      <!-- 详情内容 -->
      <div v-else-if="alarmDetail" class="detail-content">
        <!-- 主要内容区域 -->
        <div class="main-content">
          <!-- 第一列信息 -->
          <div class="info-column">
            <div class="info-item">
              <span class="label">告警设备:</span>
              <span class="value">{{ alarmDetail.deviceName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">设备ID:</span>
              <span class="value">{{ alarmDetail.deviceId || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">影响范围:</span>
              <span class="value">{{ alarmDetail.impactRange || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">告警来源:</span>
              <span class="value">{{ alarmDetail.source || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">告警位置:</span>
              <span class="value">{{ alarmDetail.position || '-' }}</span>
            </div>
          </div>

          <!-- 第二列信息 -->
          <div class="info-column">
            <div class="info-item">
              <span class="label">告警对象:</span>
              <span class="value">{{ alarmDetail.operationalInformation || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">告警内容:</span>
              <span class="value">{{ alarmDetail.content || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">告警值:</span>
              <span class="value">{{ alarmDetail.alarmValues || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">产生时间:</span>
              <span class="value">{{ alarmDetail.time || '-' }}</span>
            </div>
          </div>

          <!-- 第三列信息 -->
          <div class="info-column">
            <div class="info-item">
              <span class="label">消除时间:</span>
              <span class="value">{{ alarmDetail.eliminationTime || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">确认状态:</span>
              <span class="value status-value" :class="getConfirmStatusClass(alarmDetail.isConfirm)">
                {{ getConfirmStatusText(alarmDetail.isConfirm) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">确认人:</span>
              <span class="value">{{ alarmDetail.confirmUser || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">告警误报:</span>
              <span class="value">{{ alarmDetail.isReport === 1 ? '是' : '否' }}</span>
            </div>
            <div class="info-item">
              <span class="label">确认意见:</span>
              <span class="value">{{ alarmDetail.confirmOpinions || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 设备数据 -->
        <div class="device-data-section">
          <div class="device-data-header">
            <span class="device-data-title">设备数据</span>
            <!-- 搜索条件（右侧） -->
            <div class="control-bar">
              <!-- 日期选择（单日） -->
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                size="small"
                style="width: 140px"
                :disabled="deviceDataLoading"
                :clearable="false"
                @change="handleDateChange"
              />
              <!-- 参数选择按钮 -->
              <el-button type="primary" size="small" @click="showParamSelectDialog" :loading="loading">参数选择</el-button>
              <!-- 查询数据按钮 -->
              <el-button size="small" type="primary" @click="fetchDeviceData" :loading="deviceDataLoading">查询数据</el-button>
            </div>
          </div>
          
          <!-- 图表区域 -->
          <div class="chart-container">
            <div v-if="deviceDataLoading" class="loading-container">
              <el-empty description="加载中..." />
            </div>
            <div v-else-if="Object.keys(currentRealListDataMap).length === 0" class="empty-container">
              <el-empty description="暂无数据，请选择参数并查询" />
            </div>
            <template v-else>
              <!-- 合并图表：折线图 + 告警时间段条状图 -->
              <div ref="combinedChartContainer" class="combined-chart" style="width: 100%; height: 420px;"></div>
            </template>
          </div>
        </div>

        <!-- 可能原因 -->
        <div class="analysis-section">
          <div class="analysis-title">可能原因</div>
          <el-input
            v-model="possibleCauses"
            type="textarea"
            :rows="3"
            class="analysis-textarea"
            :disabled="true"
          />
        </div>

        <!-- 处理建议 -->
        <div class="suggestion-section">
          <div class="suggestion-title">处理建议</div>
          <el-input
            v-model="suggestions"
            type="textarea"
            :rows="3"
            class="suggestion-textarea"
            :disabled="true"
          />
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-buttons">
          <el-button 
            v-if="alarmDetail && alarmDetail.isConfirm !== 1 && alarmDetail.isConfirm !== 2"
            type="primary" 
            @click="handleConfirm"
            :loading="confirmLoading"
          >
            告警确认
          </el-button>
          <el-button 
            v-if="alarmDetail && alarmDetail.isConfirm !== 2"
            type="success" 
            @click="handleEliminate"
            :loading="eliminateLoading"
          >
            手动消除
          </el-button>
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 参数选择弹框 -->
  <ParamSelectDialog
    v-model:visible="paramSelectVisible"
    :device-id="alarmDetail?.deviceId || ''"
    :selected-params="selectedRealListParamIds"
    @confirm="handleParamConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAlarmDetails, confirmAlarm, eliminateAlarm, getHistoryDataParameters } from '@/api/alarm/history'
import type { AlarmDetailData, RealDataPoint, HistoryDataParameter } from '@/api/types/alarm/history'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import ParamSelectDialog from './ParamSelectDialog.vue'

// 移动端检测
const isMobile = ref(false)

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  window.addEventListener('resize', handleChartResize)
  
  if (props.visible && props.alarmId) {
    fetchAlarmDetail()
  }
})

// 图表 resize 处理
const handleChartResize = () => {
  if (combinedChartInstance) {
    combinedChartInstance.resize()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
  window.removeEventListener('resize', handleChartResize)
  // 销毁图表
  if (combinedChartInstance) {
    combinedChartInstance.dispose()
    combinedChartInstance = null
  }
})

interface Props {
  visible: boolean
  alarmId: number | null
  alarmLevel?: string // 告警等级（从列表数据传递）
  alarmTime?: string // 告警产生时间（从列表数据传递，格式：2025-04-01 00:00:11）
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'alarm-handled'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const confirmLoading = ref(false)
const eliminateLoading = ref(false)
const alarmDetail = ref<AlarmDetailData & { level?: string }>()
const possibleCauses = ref('')
const suggestions = ref('')
const combinedChartContainer = ref<HTMLElement | null>(null)
let combinedChartInstance: echarts.ECharts | null = null

// 设备数据相关
const deviceDataLoading = ref(false)
const selectedDate = ref<string>(dayjs().format('YYYY-MM-DD')) // 默认今天
const selectedRealListParams = ref<string[]>([]) // 选中的realList参数（参数名称，支持多选）
const availableParameters = ref<HistoryDataParameter[]>([]) // 可用参数列表（从API获取）
const currentRealListDataMap = ref<Record<string, RealDataPoint[]>>({}) // 当前选中参数的数据映射

// 参数ID到参数名称的映射
const paramIdToNameMap = computed(() => {
  const map: Record<string, string> = {}
  availableParameters.value.forEach(param => {
    map[param.value] = param.name
  })
  return map
})

// 参数名称到参数ID的映射
const paramNameToIdMap = computed(() => {
  const map: Record<string, string> = {}
  availableParameters.value.forEach(param => {
    map[param.name] = param.value
  })
  return map
})

// 参数选择弹框相关
const paramSelectVisible = ref(false)

// 将参数名称转换为参数ID（用于ParamSelectDialog）
const selectedRealListParamIds = computed(() => {
  return selectedRealListParams.value
    .map(paramName => paramNameToIdMap.value[paramName])
    .filter(id => id)
})

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

/**
 * 获取告警等级标签类型
 */
function getLevelTagType(level?: string) {
  const typeMap: Record<string, any> = {
    '1': '',
    '2': 'warning',
    '3': 'danger'
  }
  return typeMap[level || '1'] || ''
}

/**
 * 获取告警等级文本
 */
function getLevelText(level?: string) {
  const textMap: Record<string, string> = {
    '1': '一般',
    '2': '重要',
    '3': '紧急'
  }
  return textMap[level || '1'] || '一般'
}

/**
 * 获取确认状态文本
 */
function getConfirmStatusText(status: number) {
  const statusMap: Record<number, string> = {
    0: '待确认',
    1: '已确认',
    2: '已消除'
  }
  return statusMap[status] || '待确认'
}

/**
 * 获取确认状态样式类
 */
function getConfirmStatusClass(status: number) {
  const classMap: Record<number, string> = {
    0: 'unconfirmed',
    1: 'confirmed',
    2: 'cleared'
  }
  return classMap[status] || 'unconfirmed'
}

/**
 * 初始化默认日期（系统当天）
 */
const initDefaultDate = () => {
  selectedDate.value = dayjs().format('YYYY-MM-DD')
}

/**
 * 处理日期变化
 */
const handleDateChange = () => {
  // 日期变化后自动查询
  if (selectedDate.value && selectedRealListParams.value.length > 0) {
    fetchDeviceData()
  }
}

/**
 * 加载参数列表
 */
const loadParameters = async () => {
  if (!alarmDetail.value?.deviceId) return

  try {
    const response = await getHistoryDataParameters(alarmDetail.value.deviceId)
    if (response.success && response.code === 200) {
      availableParameters.value = response.result || []
      
      // 如果已经有选择的参数（从realList中获取的），验证是否仍然有效
      // 不需要修改selectedRealListParams，因为它已经从realList的key中获取了
    } else {
      ElMessage.error(response.message || '加载参数列表失败')
    }
  } catch (error: any) {
    console.error('加载参数列表失败:', error)
    ElMessage.error('加载参数列表失败')
  }
}

/**
 * 显示参数选择弹框
 */
const showParamSelectDialog = () => {
  if (!alarmDetail.value?.deviceId) {
    ElMessage.warning('设备ID不存在，无法选择参数')
    return
  }
  paramSelectVisible.value = true
}

/**
 * 确认参数选择
 */
const handleParamConfirm = (paramIds: string[]) => {
  // 将参数ID转换为参数名称
  const paramNames = paramIds
    .map(paramId => paramIdToNameMap.value[paramId])
    .filter(name => name)
  
  selectedRealListParams.value = paramNames
  
  // 更新图表（如果有现有数据）
  handleRealListParamsChange()
  
  // 如果日期已选择，自动查询数据
  if (selectedDate.value && selectedRealListParams.value.length > 0) {
    fetchDeviceData()
  }
}

/**
 * 处理realList参数选择变化（多选）
 */
const handleRealListParamsChange = () => {
  // 更新当前选中参数的数据
  if (selectedRealListParams.value.length > 0 && alarmDetail.value?.realList) {
    const dataMap: Record<string, RealDataPoint[]> = {}
    selectedRealListParams.value.forEach(param => {
      if (alarmDetail.value?.realList[param]) {
        dataMap[param] = alarmDetail.value.realList[param]
      }
    })
    currentRealListDataMap.value = dataMap
    // 渲染图表
    nextTick(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          initCharts()
        }, 50)
      })
    })
  } else {
    currentRealListDataMap.value = {}
  }
}

/**
 * 获取设备数据（单独调用getDetail接口）
 */
const fetchDeviceData = async () => {
  if (!props.alarmId || !selectedDate.value) {
    ElMessage.warning('请选择日期')
    return
  }

  if (!alarmDetail.value?.deviceId) {
    ElMessage.warning('设备ID不存在，无法查询数据')
    return
  }

  if (selectedRealListParams.value.length === 0) {
    ElMessage.warning('请至少选择一个参数')
    return
  }

  try {
    deviceDataLoading.value = true

    // 计算当天的开始和结束时间（ISO格式）
    const startDate = dayjs(selectedDate.value).startOf('day').toISOString()
    const endDate = dayjs(selectedDate.value).endOf('day').toISOString()

    // 将参数名称转换为参数ID（逗号分隔）
    const paramIds = selectedRealListParams.value
      .map(paramName => paramNameToIdMap.value[paramName])
      .filter(id => id) // 过滤掉无效的ID
    const parametersStr = paramIds.join(',')

    if (!parametersStr) {
      ElMessage.warning('参数选择无效，请重新选择参数')
      return
    }

    // 单独查询设备数据
    const response = await getAlarmDetails(props.alarmId, startDate, endDate, parametersStr)

    if (response.success && response.code === 200 && response.result) {
      // 只更新realList数据，不更新其他基本信息
      if (response.result.realList) {
        // 更新realList数据
        if (!alarmDetail.value.realList) {
          alarmDetail.value.realList = {}
        }
        Object.assign(alarmDetail.value.realList, response.result.realList)
        
        // 更新当前选中参数的数据
        const dataMap: Record<string, RealDataPoint[]> = {}
        selectedRealListParams.value.forEach(param => {
          if (alarmDetail.value?.realList[param]) {
            dataMap[param] = alarmDetail.value.realList[param]
          }
        })
        currentRealListDataMap.value = dataMap
        
        // 渲染图表
        await nextTick()
        requestAnimationFrame(() => {
          setTimeout(() => {
            initCharts()
          }, 50)
        })
      } else {
        currentRealListDataMap.value = {}
        ElMessage.warning('未获取到设备数据')
      }
    } else {
      ElMessage.error(response.message || '获取设备数据失败')
      currentRealListDataMap.value = {}
    }
  } catch (error: any) {
    console.error('获取设备数据失败:', error)
    ElMessage.error('获取设备数据失败')
    currentRealListDataMap.value = {}
  } finally {
    deviceDataLoading.value = false
  }
}

/**
 * 初始化所有图表（合并为一个canvas）
 */
const initCharts = () => {
  const paramKeys = Object.keys(currentRealListDataMap.value)
  if (!combinedChartContainer.value || paramKeys.length === 0) {
    console.warn('图表初始化失败：容器不存在或数据为空')
    return
  }

  if (combinedChartInstance) {
    combinedChartInstance.dispose()
    combinedChartInstance = null
  }

  combinedChartInstance = echarts.init(combinedChartContainer.value)

  if (!combinedChartInstance) {
    console.error('ECharts 初始化失败')
    return
  }

  // 生成完整24小时时间轴（每5分钟一个点）
  const dayStart = dayjs(selectedDate.value).startOf('day')
  const fullTimeAxis: string[] = []
  for (let i = 0; i < 24 * 60; i += 5) {
    fullTimeAxis.push(dayStart.add(i, 'minute').format('YYYY-MM-DD HH:mm:ss'))
  }

  // 颜色列表
  const colors = ['#f7931e', '#00d4ff', '#ff6b35', '#39b6f7', '#ffd700', '#ff69b4', '#00ff00']
  
  // 构建折线图series和告警条状图series
  const lineSeries: any[] = []
  const barSeries: any[] = []
  const legendData: string[] = []
  const visualMaps: any[] = []
  
  paramKeys.forEach((paramName, paramIndex) => {
    const data = currentRealListDataMap.value[paramName] || []
    const color = colors[paramIndex % colors.length]
    
    // 创建时间到数据的映射
    const timeDataMap: Record<string, RealDataPoint> = {}
    data.forEach(item => {
      // 将时间截断到5分钟精度
      const time = dayjs(item.time)
      const minutes = Math.floor(time.minute() / 5) * 5
      const key = time.startOf('hour').add(minutes, 'minute').format('YYYY-MM-DD HH:mm:ss')
      timeDataMap[key] = item
    })
    
    // 构建折线图数据（基于完整24小时时间轴）
    const lineData = fullTimeAxis.map(time => {
      const point = timeDataMap[time]
      return point ? point.value : null
    })
    
    legendData.push(paramName)
    
    // 折线图series（纯折线，无填充）
    lineSeries.push({
      name: paramName,
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: lineData,
      smooth: true,
      connectNulls: false,
      lineStyle: { color, width: 2 },
      itemStyle: { color },
      symbol: 'circle',
      symbolSize: 3
    })
    
    // 构建告警 heatmap 数据（每个时间点一个格子）
    // heatmap数据格式: [xIndex, yIndex, value]
    // value: 0=无数据, 1=正常, 2=告警
    // yIndex 必须对应 yAxis 的 data 数组索引，这里 yAxis.data = [''], 所以 yIndex = 0
    const heatmapData = fullTimeAxis.map((time, xIndex) => {
      const current = timeDataMap[time]
      
      if (!current) {
        return [xIndex, 0, 0] // [xIndex, yIndex=0, value=0] 无数据
      }
      
      const isAlarm = current.isAlarm === 1
      return [xIndex, 0, isAlarm ? 2 : 1] // [xIndex, yIndex=0, value] 2=告警, 1=正常
    })
    
    // 告警条状图series（使用heatmap类型，无间隙）
    // seriesIndex 会在 series 数组中：lineSeries.length + paramIndex
    barSeries.push({
      name: paramName + '告警',
      type: 'heatmap',
      xAxisIndex: paramIndex + 1,
      yAxisIndex: paramIndex + 1,
      data: heatmapData,
      itemStyle: {
        borderWidth: 0
      },
      emphasis: {
        disabled: true
      },
      silent: true
    })
  })
  
  // 在所有 barSeries 添加完成后，为每个参数添加 visualMap
  // 此时可以正确计算 seriesIndex
  paramKeys.forEach((paramName, paramIndex) => {
    const color = colors[paramIndex % colors.length]
    const barSeriesIndex = lineSeries.length + paramIndex
    
    visualMaps.push({
      show: false,
      seriesIndex: barSeriesIndex, // 对应heatmap的seriesIndex
      min: 0,
      max: 2,
      inRange: {
        color: ['#1a1a1a', '#505050', color] // 使用不透明颜色：无数据、正常、告警
      }
    })
  })

  // 计算布局
  const barCount = paramKeys.length
  const lineChartHeight = 44 // 折线图高度百分比
  const dataZoomHeight = 5 // dataZoom高度百分比
  const barTotalHeight = 22 // 所有条状图总高度百分比
  const barHeight = Math.min(10, barTotalHeight / barCount) // 每个条状图高度
  const gap = 2 // 间隔
  
  const lineChartTop = 6 // 顶部间距
  const dataZoomTop = lineChartTop + lineChartHeight + 6 // 折线图与dataZoom间距
  const barStartTop = dataZoomTop + dataZoomHeight + 7 // dataZoom与条状图间距

  // 构建grid配置
  const grids: any[] = [
    {
      // 折线图区域
      left: '5%',
      right: '2%',
      top: `${lineChartTop}%`,
      height: `${lineChartHeight}%`,
      containLabel: true
    }
  ]
  
  // 为每个参数添加条状图grid
  paramKeys.forEach((_, index) => {
    grids.push({
      left: '5%',
      right: '2%',
      top: `${barStartTop + index * (barHeight + gap)}%`,
      height: `${barHeight}%`
    })
  })

  // 构建xAxis配置
  const xAxes: any[] = [
    {
      // 折线图X轴
      type: 'category',
      gridIndex: 0,
      boundaryGap: false,
      data: fullTimeAxis,
      axisLine: { lineStyle: { color: '#1875b7' } },
      axisLabel: {
        color: '#ffffff',
        fontSize: 10,
        interval: 11, // 每小时显示一个标签
        formatter: (value: string) => {
          return dayjs(value).format('HH:mm')
        }
      }
    }
  ]
  
  // 为每个参数添加条状图X轴
  paramKeys.forEach((paramName, index) => {
    xAxes.push({
      type: 'category',
      gridIndex: index + 1,
      data: fullTimeAxis,
      boundaryGap: true,
      axisLine: { 
        show: false,
        lineStyle: { color: '#1875b7' } 
      },
      axisLabel: {
        show: index === paramKeys.length - 1, // 只在最后一个显示标签
        color: '#ffffff',
        fontSize: 10,
        interval: 11,
        formatter: (value: string) => {
          return dayjs(value).format('HH:mm')
        }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      name: paramName,
      nameLocation: 'start',
      nameTextStyle: {
        color: colors[index % colors.length],
        fontSize: 11,
        padding: [0, 10, 0, 0]
      }
    })
  })

  // 构建yAxis配置
  const yAxes: any[] = [
    {
      // 折线图Y轴
      type: 'value',
      gridIndex: 0,
      axisLine: { lineStyle: { color: '#1875b7' } },
      axisLabel: { color: '#ffffff', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1875b7', type: 'dashed', opacity: 0.3 } }
    }
  ]
  
  // 为每个参数添加条状图Y轴（隐藏，heatmap需要category类型）
  paramKeys.forEach((_, index) => {
    yAxes.push({
      type: 'category',
      gridIndex: index + 1,
      data: [''],
      show: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    })
  })

  // 构建dataZoom的xAxisIndex：[0, 1, 2, ..., paramKeys.length]
  // 0是折线图X轴，1到paramKeys.length是条状图X轴
  const allXAxisIndices = [0, ...paramKeys.map((_, i) => i + 1)]

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0d2344',
      borderColor: '#1875b7',
      textStyle: { color: '#ffffff' },
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''
        const time = params[0].axisValue
        let html = `时间: ${dayjs(time).format('HH:mm:ss')}<br/>`
        params.forEach((p: any) => {
          if (p.seriesType === 'line' && p.value !== null) {
            html += `${p.seriesName}: ${p.value}<br/>`
          }
        })
        return html
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#1875b7'
        }
      }
    },
    legend: [
      {
        // 折线图图例（参数名称）
        data: legendData,
        textStyle: { color: '#ffffff', fontSize: 12 },
        top: 0,
        left: 'center'
      },
      {
        // 告警状态图例
        data: [
          { name: '有报警', icon: 'rect', itemStyle: { color: '#f7931e' } },
          { name: '无报警', icon: 'rect', itemStyle: { color: 'rgba(150, 150, 150, 0.5)' } }
        ],
        textStyle: { color: '#ffffff', fontSize: 11 },
        bottom: 0,
        left: 'center',
        itemWidth: 16,
        itemHeight: 10,
        itemGap: 20,
        selectedMode: false
      }
    ],
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    visualMap: visualMaps,
    series: [
      ...lineSeries, 
      ...barSeries,
      // 虚拟series用于显示告警状态图例（必须在最后，不影响 visualMap 的 seriesIndex）
      {
        name: '有报警',
        type: 'bar',
        data: [],
        itemStyle: { color: '#f7931e' }
      },
      {
        name: '无报警',
        type: 'bar',
        data: [],
        itemStyle: { color: 'rgba(150, 150, 150, 0.5)' }
      }
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: allXAxisIndices.slice(0, paramKeys.length + 1),
        top: `${dataZoomTop}%`,
        height: 20,
        backgroundColor: '#0d2344',
        borderColor: '#1875b7',
        fillerColor: 'rgba(57, 182, 247, 0.3)',
        handleStyle: { color: '#39b6f7' },
        textStyle: { color: '#ffffff' },
        start: 0,
        end: 100,
        labelFormatter: (value: number) => {
          const time = fullTimeAxis[Math.floor(value)]
          return time ? dayjs(time).format('HH:mm') : ''
        }
      },
      {
        type: 'inside',
        xAxisIndex: allXAxisIndices.slice(0, paramKeys.length + 1)
      }
    ]
  }

  combinedChartInstance.setOption(option, true)
  combinedChartInstance.resize()
}



/**
 * 获取告警详情（包含设备数据）
 */
const fetchAlarmDetail = async () => {
  if (!props.alarmId) return

  try {
    loading.value = true
    
    // 初始化默认日期（系统当天）
    initDefaultDate()
    
    // 计算当天的开始和结束时间（ISO格式）
    const startDate = dayjs(selectedDate.value).startOf('day').toISOString()
    const endDate = dayjs(selectedDate.value).endOf('day').toISOString()
    
    // 查询告警详情，传入日期但不传parameters（查询所有参数）
    const response = await getAlarmDetails(props.alarmId, startDate, endDate)
    
    // 设置基本信息
    if (response.success && response.code === 200 && response.result) {
      alarmDetail.value = response.result
      possibleCauses.value = alarmDetail.value.reason || ''
      suggestions.value = alarmDetail.value.suggest || ''
      
      // 如果有deviceId，加载参数列表
      if (alarmDetail.value.deviceId) {
        await loadParameters()
        
        // 如果API返回了realList数据，处理并显示
        if (alarmDetail.value.realList && Object.keys(alarmDetail.value.realList).length > 0) {
          // 将realList的key（参数名称）设置为已选择的参数
          const paramKeys = Object.keys(alarmDetail.value.realList)
          selectedRealListParams.value = paramKeys
          
          // 更新数据映射
          const dataMap: Record<string, RealDataPoint[]> = {}
          paramKeys.forEach(paramName => {
            if (alarmDetail.value?.realList && alarmDetail.value.realList[paramName]) {
              dataMap[paramName] = alarmDetail.value.realList[paramName]
            }
          })
          currentRealListDataMap.value = dataMap
          
          // 渲染图表
          await nextTick()
          requestAnimationFrame(() => {
            setTimeout(() => {
              initCharts()
            }, 100)
          })
        } else {
          // 如果没有realList数据，清空数据映射
          currentRealListDataMap.value = {}
          selectedRealListParams.value = []
        }
      } else {
        // 如果没有deviceId，清空设备数据相关状态
        currentRealListDataMap.value = {}
        selectedRealListParams.value = []
      }
    } else {
      alarmDetail.value = undefined
      availableParameters.value = []
      selectedRealListParams.value = []
      currentRealListDataMap.value = {}
    }
  } catch (error) {
    console.error('获取告警详情失败:', error)
    alarmDetail.value = undefined
    availableParameters.value = []
    selectedRealListParams.value = []
    currentRealListDataMap.value = {}
  } finally {
    loading.value = false
  }
}

/**
 * 告警确认
 */
const handleConfirm = async () => {
  if (!props.alarmId) return

  try {
    const { value: comment } = await ElMessageBox.prompt(
      '请输入确认意见',
      '告警确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入确认意见...'
      }
    )

    confirmLoading.value = true
    const response = await confirmAlarm({
      id: props.alarmId,
      confirmOpinions: comment || '已确认'
    })

    if (response.success && response.code === 200) {
      ElMessage.success('告警确认成功')
      // 重新加载详情数据
      await fetchAlarmDetail()
      emit('alarm-handled')
    } else {
      ElMessage.error(response.message || '告警确认失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '告警确认失败')
    }
  } finally {
    confirmLoading.value = false
  }
}

/**
 * 消除告警
 */
const handleEliminate = async () => {
  if (!props.alarmId) return

  try {
    await ElMessageBox.confirm(
      '确定要消除此告警吗？',
      '手动消除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    eliminateLoading.value = true
    const response = await eliminateAlarm({
      id: props.alarmId
    })

    if (response.success && response.code === 200) {
      ElMessage.success('告警消除成功')
      // 重新加载详情数据
      await fetchAlarmDetail()
      emit('alarm-handled')
    } else {
      ElMessage.error(response.message || '告警消除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '告警消除失败')
    }
  } finally {
    eliminateLoading.value = false
  }
}


/**
 * 关闭弹窗
 */
const handleClose = () => {
  dialogVisible.value = false
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.alarmId) {
    fetchAlarmDetail()
  } else {
    // 关闭弹窗时清理数据（但保留参数选择，以便下次打开时恢复）
    currentRealListDataMap.value = {}
    // 注意：不清空 selectedRealListParams，以便下次打开同一告警时恢复
    // 但如果是不同的告警ID，会在 fetchAlarmDetail 中重新加载
    if (combinedChartInstance) {
      combinedChartInstance.dispose()
      combinedChartInstance = null
    }
  }
})

// 监听告警ID变化
watch(() => props.alarmId, (newAlarmId, oldAlarmId) => {
  // 如果告警ID变化，清空之前的参数选择
  if (oldAlarmId && newAlarmId !== oldAlarmId) {
    selectedRealListParams.value = []
    currentRealListDataMap.value = {}
    availableParameters.value = []
  }
  
  if (newAlarmId && props.visible) {
    fetchAlarmDetail()
  }
})
</script>

<style scoped lang="scss">
.alarm-detail-dialog {
  :deep(.el-dialog) {
    background: #0d2344;
    border: 1px solid #1875b7;
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
  }

  :deep(.el-dialog__header) {
    background: #0d2344;
    border-bottom: 1px solid #1875b7;
    padding: 15px 20px;

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #39b6f7;
        
        &:hover {
          color: #ffffff;
        }
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background: #0d2344;
  }
}

.dialog-header {
  .alarm-title {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      gap: 8px;
    }

    .alarm-tag {
      font-weight: 600;

      @media (max-width: 768px) {
        font-size: 12px;
      }
    }

    .alarm-name {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;

      @media (max-width: 768px) {
        font-size: 16px;
      }
    }
  }
}

.alarm-detail-container {
  height: 70vh;
  overflow-y: auto;
  max-height: 800px;

  @media (max-width: 768px) {
    height: 65vh;
    max-height: 600px;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 400px;

    :deep(.el-empty) {
      .el-empty__description {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .detail-content {
    padding: 20px;
    color: #ffffff;

    @media (max-width: 768px) {
      padding: 15px;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 30px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .info-column {
        .info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 15px;
          font-size: 14px;

          @media (max-width: 768px) {
            flex-direction: column;
            margin-bottom: 12px;
            font-size: 13px;
          }

          .label {
            min-width: 100px;
            color: #39b6f7;
            font-weight: 500;

            @media (max-width: 768px) {
              min-width: auto;
              margin-bottom: 4px;
            }
          }

          .value {
            color: #ffffff;
            margin-left: 10px;

            @media (max-width: 768px) {
              margin-left: 0;
            }

            &.status-value {
              &.confirmed {
                color: #27ae60;
              }
              &.unconfirmed {
                color: #e74c3c;
              }
              &.cleared {
                color: #95a5a6;
              }
            }
          }
        }
      }
    }

    .device-data-section {
      margin-bottom: 5px;

      .device-data-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        flex-wrap: wrap;
        gap: 10px;

        .device-data-title {
          color: #39b6f7;
          font-size: 14px;
          font-weight: 600;
        }
        
        .control-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
      }

      .control-bar-standalone {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 15px;
        flex-wrap: wrap;
        gap: 15px;

        .time-dimension {
          :deep(.el-button--primary) {
            background: #1680ca;
            border-color: #1875b7;
            
            &:hover {
              background: #39b6f7;
              border-color: #39b6f7;
            }
          }

          :deep(.el-button) {
            background: #1875b7;
            border-color: #0d2344;
            color: #ffffff;
            
            &:hover {
              background: #39b6f7;
              border-color: #39b6f7;
            }
          }
        }

        .date-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;

          :deep(.el-button) {
            background: #1875b7;
            border-color: #0d2344;
            color: #ffffff;
            
            &:hover {
              background: #39b6f7;
              border-color: #39b6f7;
            }
          }
          
          :deep(.el-date-editor) {
            width: 360px;
            // 其他样式由全局样式控制
          }
        }

        .right-actions {
          display: flex;
          gap: 8px;

          :deep(.el-button) {
            background: #1875b7;
            border-color: #0d2344;
            color: #ffffff;
            
            &:hover {
              background: #39b6f7;
              border-color: #39b6f7;
            }
          }
        }


        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
          
          .time-dimension {
        width: 100%;
            flex-wrap: wrap;
          }
          
          .date-controls {
            width: 100%;
            
            :deep(.el-date-picker) {
              width: 100% !important;
            }
          }
          
          .right-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      }

      .chart-container {
        background: #0d2344;
        border: 1px solid #1875b7;
        border-radius: 8px;
        padding: 20px;
        min-height: 480px;

        .loading-container,
        .empty-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
        }

        .combined-chart {
          background: transparent;
        }
      }

      .param-select {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .analysis-section,
    .suggestion-section {
      margin-bottom: 5px;

      .analysis-title,
      .suggestion-title {
        color: #39b6f7;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .analysis-textarea,
      .suggestion-textarea {
        :deep(.el-textarea__inner) {
          background: #1875b7;
          border-color: #39b6f7;
          color: #ffffff;
          
          &::placeholder {
            color: #bdc3c7;
          }

          &:focus {
            border-color: #39b6f7;
            box-shadow: 0 0 0 2px rgba(57, 182, 247, 0.2);
          }

          &:disabled {
            background: rgba(24, 117, 183, 0.5);
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
    }

  }
}

// 底部按钮样式
.dialog-footer {
  padding: 15px 20px;
  background: #0d2344;
  border-top: 1px solid #1875b7;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 768px) {
    padding: 12px 15px;
  }

  .footer-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: flex-end;

    @media (max-width: 768px) {
      gap: 10px;
      flex-direction: column;
      width: 100%;
    }

    :deep(.el-button) {
      @media (max-width: 768px) {
        width: 100%;
      }

      &.el-button--primary {
        background: #1680ca;
        border-color: #1680ca;
        
        &:hover {
          background: #39b6f7;
          border-color: #39b6f7;
        }
      }

      &.el-button--success {
        background: #27ae60;
        border-color: #27ae60;
        
        &:hover {
          background: #229954;
          border-color: #229954;
        }
      }
    }
  }
}

// 自定义滚动条
.alarm-detail-container::-webkit-scrollbar {
  width: 6px;
}

.alarm-detail-container::-webkit-scrollbar-track {
  background: #1875b7;
  border-radius: 3px;
}

.alarm-detail-container::-webkit-scrollbar-thumb {
  background: #39b6f7;
  border-radius: 3px;
  
  &:hover {
    background: #1680ca;
  }
}

</style>

