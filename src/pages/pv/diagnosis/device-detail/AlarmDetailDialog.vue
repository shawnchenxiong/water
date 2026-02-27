<template>
  <el-dialog
    v-model="dialogVisible"
    :before-close="handleClose"
    class="alarm-detail-dialog"
    width="90%"
    top="3vh"
    :show-close="true"
  >
    <!-- 自定义标题 -->
    <template #header>
      <div class="dialog-header">
        <div class="alarm-title">
          <el-tag type="warning" class="alarm-tag">告警</el-tag>
          <span class="alarm-name">PV反接告警</span>
        </div>
      </div>
    </template>

    <div v-loading="loading" class="alarm-detail-container">
      <div v-if="alarmDetail" class="detail-content">
        <!-- 主要内容区域 -->
        <div class="main-content">
          <!-- 左侧信息 -->
          <div class="left-info">
            <div class="info-item">
              <span class="label">台套编号:</span>
              <span class="value">{{ alarmDetail.alarmInfo.stationName }}</span>
            </div>
            <div class="info-item">
              <span class="label">台套类型:</span>
              <span class="value">{{ alarmDetail.alarmInfo.deviceType || '阳光云平台' }}</span>
            </div>
            <div class="info-item">
              <span class="label">台套对象:</span>
              <span class="value">{{ alarmDetail.alarmInfo.alarmObject }}</span>
            </div>
            <div class="info-item">
              <span class="label">产生时间:</span>
              <span class="value">{{ alarmDetail.alarmInfo.alarmTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">确认状态:</span>
              <span class="value status-value" :class="(alarmDetail.alarmInfo.confirmStatus || '行确认') === '已确认' ? 'confirmed' : 'unconfirmed'">
                {{ alarmDetail.alarmInfo.confirmStatus || '行确认' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">告警类型:</span>
              <span class="value">{{ alarmDetail.alarmInfo.alarmType || '吉' }}</span>
            </div>
          </div>

          <!-- 右侧信息 -->
          <div class="right-info">
            <div class="info-item">
              <span class="label">影响范围:</span>
              <span class="value">{{ alarmDetail.alarmInfo.affectedScope || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">台套位置:</span>
              <span class="value">{{ alarmDetail.alarmInfo.stationLocation }}</span>
            </div>
            <div class="info-item">
              <span class="label">台套值:</span>
              <span class="value">{{ alarmDetail.alarmInfo.deviceValue || '1' }}</span>
            </div>
            <div class="info-item">
              <span class="label">消除时间:</span>
              <span class="value">{{ alarmDetail.alarmInfo.clearTime || '2025-09-17 14:33:24' }}</span>
              <el-tag size="small" type="success" class="auto-clear-tag">自动消除</el-tag>
            </div>
            <div class="info-item">
              <span class="label">确认人:</span>
              <span class="value">{{ alarmDetail.alarmInfo.confirmer || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">确认意见:</span>
              <span class="value">{{ alarmDetail.alarmInfo.confirmComment || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 设备数据图表 -->
        <div class="chart-section">
          <div class="chart-header">
            <span class="chart-title">设备数据</span>
            <div class="chart-controls">
              <el-button size="small" @click="handlePrevDay">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <span class="date-display">2025-09-17</span>
              <el-button size="small" @click="handleNextDay">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="handleDataExport">
                参数导出
              </el-button>
            </div>
          </div>
          <div class="chart-container">
            <div ref="chartRef" class="chart"></div>
          </div>
          <!-- 告警时段指示器 -->
          <div class="alarm-timeline">
            <div class="timeline-header">
              <span>PV反接告警</span>
            </div>
            <div class="timeline-bar">
              <div class="time-markers">
                <span>00:00</span>
                <span>03:00</span>
                <span>06:00</span>
                <span>09:00</span>
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00</span>
                <span>21:00</span>
                <span>24:00</span>
              </div>
              <div class="alarm-indicators">
                <div class="alarm-period" style="left: 62.5%; width: 6.25%;">
                  <span class="alarm-label">有报警</span>
                </div>
                <div class="normal-period" style="left: 68.75%; width: 31.25%;">
                  <span class="normal-label">无报警</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 可能原因 -->
        <div class="analysis-section">
          <div class="analysis-title">可能原因</div>
          <el-input
            v-model="possibleCauses"
            type="textarea"
            :rows="3"
            placeholder="请输入可能原因..."
            class="analysis-textarea"
          />
        </div>

        <!-- 处理建议 -->
        <div class="suggestion-section">
          <div class="suggestion-title">处理建议</div>
          <el-input
            v-model="suggestions"
            type="textarea"
            :rows="3"
            placeholder="请输入处理建议..."
            class="suggestion-textarea"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="operation-section">
          <div class="operation-buttons">
            <el-button type="info" @click="handleVideoReplay">
              录像回放
            </el-button>
            <el-button type="primary" @click="handleConfirm">
              告警确认
            </el-button>
            <el-button type="success" @click="handleCreateWorkOrder">
              导工单
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getAlarmDetail, handleAlarm } from '@/api/diagnosis/deviceDetail'
import type { AlarmDetailResponse } from '@/api/types/diagnosis/deviceDetail'

interface Props {
  visible: boolean
  alarmId: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'alarm-handled'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const alarmDetail = ref<AlarmDetailResponse['data']>()
const chartRef = ref<HTMLElement>()
const possibleCauses = ref('')
const suggestions = ref('')
let chartInstance: echarts.ECharts | null = null

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})


/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  // 生成模拟数据
  const timeAxis = []
  const powerData = []
  const energyData = []
  
  // 生成24小时的数据，每30分钟一个点
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    timeAxis.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    
    // 模拟发电曲线（白天有发电，夜晚为0）
    if (hour >= 6 && hour <= 18) {
      const t = (hour - 6) / 12 // 0到1的时间比例
      const powerValue = Math.sin(t * Math.PI) * 50 + Math.random() * 5 // 0-55kW的功率
      const energyValue = Math.sin(t * Math.PI) * 350 + Math.random() * 20 // 0-370kWh的发电量
      powerData.push(powerValue.toFixed(1))
      energyData.push(energyValue.toFixed(1))
    } else {
      powerData.push(0)
      energyData.push(0)
    }
  }

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0d2344',
      borderColor: '#1875b7',
      textStyle: {
        color: '#ffffff'
      },
      formatter: (params: any) => {
        let result = `<div style="margin-bottom: 5px;">${params[0].axisValue}</div>`
        params.forEach((param: any) => {
          const unit = param.seriesName.includes('发电量') ? 'kWh' : 'kW'
          result += `<div style="color: ${param.color};">● ${param.seriesName}: ${param.value} ${unit}</div>`
        })
        return result
      }
    },
    legend: {
      data: ['当日发电量 (kWh)', '总有功功率 (kW)'],
      textStyle: {
        color: '#ffffff'
      },
      top: 10,
      itemGap: 30
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeAxis,
      axisLine: {
        lineStyle: {
          color: '#1875b7'
        }
      },
      axisLabel: {
        color: '#ffffff',
        interval: 5 // 每6个点显示一个标签
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '发电量 (kWh)',
        position: 'left',
        min: 0,
        max: 400,
        axisLine: {
          lineStyle: {
            color: '#1875b7'
          }
        },
        axisLabel: {
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: '#1875b7',
            type: 'dashed'
          }
        },
        nameTextStyle: {
          color: '#ffffff'
        }
      },
      {
        type: 'value',
        name: '功率 (kW)',
        position: 'right',
        min: 0,
        max: 60,
        axisLine: {
          lineStyle: {
            color: '#1875b7'
          }
        },
        axisLabel: {
          color: '#ffffff'
        },
        splitLine: {
          show: false
        },
        nameTextStyle: {
          color: '#ffffff'
        }
      }
    ],
    series: [
      {
        name: '当日发电量 (kWh)',
        type: 'line',
        yAxisIndex: 0,
        data: energyData,
        lineStyle: {
          color: '#ff6b35',
          width: 2
        },
        itemStyle: {
          color: '#ff6b35'
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      },
      {
        name: '总有功功率 (kW)',
        type: 'line',
        yAxisIndex: 1,
        data: powerData,
        lineStyle: {
          color: '#ffd700',
          width: 2
        },
        itemStyle: {
          color: '#ffd700'
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: true
      }
    ]
  }

  chartInstance.setOption(option)
}

/**
 * 获取告警详情
 */
const fetchAlarmDetail = async () => {
  if (!props.alarmId) return

  try {
    loading.value = true
    const response = await getAlarmDetail(props.alarmId)
    
    if (response.success && response.data) {
      alarmDetail.value = response.data
      
      // 初始化文本框内容
      possibleCauses.value = alarmDetail.value.possibleCauses?.join('\n') || ''
      suggestions.value = alarmDetail.value.suggestions?.join('\n') || ''
      
      // 等待DOM更新后初始化图表
      await nextTick()
      initChart()
    }
  } catch (error) {
    ElMessage.error('获取告警详情失败')
  } finally {
    loading.value = false
  }
}

/**
 * 告警确认
 */
const handleConfirm = async () => {
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

    await handleAlarm(props.alarmId, {
      action: 'confirm',
      comment: comment || '已确认',
      handler: 'current_user'
    })

    ElMessage.success('告警确认成功')
    emit('alarm-handled')
    dialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('告警确认失败')
    }
  }
}


/**
 * 转工单
 */
const handleCreateWorkOrder = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将此告警转为工单吗？',
      '导工单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await handleAlarm(props.alarmId, {
      action: 'create_workorder',
      comment: '转工单处理',
      handler: 'current_user',
      workOrderInfo: {
        title: `告警处理工单-PV反接告警`,
        priority: 'medium',
        assignee: 'maintenance_team'
      }
    })

    ElMessage.success('工单创建成功')
    emit('alarm-handled')
    dialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('转工单失败')
    }
  }
}

/**
 * 录像回放
 */
const handleVideoReplay = () => {
  ElMessage.info('录像回放功能开发中...')
}

/**
 * 上一天
 */
const handlePrevDay = () => {
  ElMessage.info('切换到上一天')
  // 这里可以添加切换日期的逻辑
}

/**
 * 下一天
 */
const handleNextDay = () => {
  ElMessage.info('切换到下一天')
  // 这里可以添加切换日期的逻辑
}

/**
 * 参数导出
 */
const handleDataExport = () => {
  ElMessage.success('参数导出成功')
  // 这里可以添加导出逻辑
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
  }
})

// 监听告警ID变化
watch(() => props.alarmId, (alarmId) => {
  if (alarmId && props.visible) {
    fetchAlarmDetail()
  }
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.alarm-detail-dialog {
  :deep(.el-dialog) {
    background-color: #0d2344;
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

    .alarm-tag {
      background: #ff6b35;
      border-color: #ff6b35;
      color: #ffffff;
      font-weight: 600;
    }

    .alarm-name {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.alarm-detail-container {
  height: 80vh;
  overflow-y: auto;

  .detail-content {
    padding: 20px;
    color: #ffffff;

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;

      .left-info,
      .right-info {
        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          font-size: 14px;

          .label {
            min-width: 100px;
            color: #39b6f7;
            font-weight: 500;
          }

          .value {
            color: #ffffff;
            margin-left: 10px;

            &.status-value {
              &.confirmed {
                color: #27ae60;
              }
              &.unconfirmed {
                color: #e74c3c;
              }
            }
          }

          .auto-clear-tag {
            margin-left: 10px;
            background: #27ae60;
            border-color: #27ae60;
          }
        }
      }
    }

    .chart-section {
      margin-bottom: 30px;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .chart-title {
          color: #39b6f7;
          font-size: 16px;
          font-weight: 600;
        }

        .chart-controls {
          display: flex;
          align-items: center;
          gap: 10px;

          .date-display {
            color: #ffffff;
            font-size: 14px;
            margin: 0 10px;
          }

          :deep(.el-button) {
            &.el-button--primary {
              background-color: #1680ca;
              border-color: #1680ca;
              
              &:hover {
                background: #39b6f7;
                border-color: #39b6f7;
              }
            }
          }
        }
      }

      .chart-container {
        background: #0d2344;
        border: 1px solid #1875b7;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;

        .chart {
          width: 100%;
          height: 300px;
        }
      }

      .alarm-timeline {
        .timeline-header {
          color: #39b6f7;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .timeline-bar {
          position: relative;
          height: 60px;
          background: #1875b7;
          border-radius: 4px;
          padding: 10px;

          .time-markers {
            display: flex;
            justify-content: space-between;
            color: #ffffff;
            font-size: 12px;
            margin-bottom: 10px;
          }

          .alarm-indicators {
            position: relative;
            height: 20px;

            .alarm-period,
            .normal-period {
              position: absolute;
              height: 100%;
              border-radius: 2px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #ffffff;
            }

            .alarm-period {
              background: #e74c3c;
            }

            .normal-period {
              background: #27ae60;
            }
          }
        }
      }
    }

    .analysis-section,
    .suggestion-section {
      margin-bottom: 25px;

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
          background-color: #1875b7;
          border-color: #39b6f7;
          color: #ffffff;
          
          &::placeholder {
            color: #bdc3c7;
          }

          &:focus {
            border-color: #39b6f7;
            box-shadow: 0 0 0 2px rgba(57, 182, 247, 0.2);
          }
        }
      }
    }

    .operation-section {
      .operation-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;

        :deep(.el-button) {
          &.el-button--info {
            background-color: #6c757d;
            border-color: #6c757d;
            
            &:hover {
              background-color: #5a6268;
              border-color: #5a6268;
            }
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
