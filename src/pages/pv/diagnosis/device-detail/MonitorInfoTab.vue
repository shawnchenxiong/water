<template>
  <div class="monitor-info-tab">
    <!-- 刷新按钮和总数显示 -->
    <div class="refresh-bar">
      <div class="left-info">
        <el-button 
          type="text" 
          :icon="RefreshRight" 
          @click="fetchMonitorInfo"
          :loading="loading"
          size="small"
          class="refresh-btn"
        />
        <span class="total-count">总数量:113</span>
      </div>
      <el-button 
        type="primary" 
        size="small"
        class="view-toggle-btn"
        @click="toggleViewMode"
      >
        {{ viewMode === 'card' ? '列表展示' : '卡片展示' }}
      </el-button>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <!-- 上方布局：左侧数据总览表格，右侧状态信息 -->
      <div class="top-section">
        <!-- 左侧数据总览表格 -->
        <div class="overview-section">
          <div class="overview-title">数据总览</div>
          
          <!-- 桌面端表格 -->
          <el-table
            v-if="!isMobile"
            :data="overviewTableData"
            style="width: 100%"
            :show-header="false"
            :header-cell-style="{ 
              backgroundColor: '#0d2344', 
              color: '#ffffff',
              borderColor: 'rgba(0, 212, 255, 0.4)'
            }"
            :cell-style="{ 
              backgroundColor: 'rgba(0, 212, 255, 0.15)', 
              color: '#ffffff',
              borderColor: '#0d2344'
            }"
          >
            <el-table-column prop="label1" width="120" />
            <el-table-column prop="value1" width="120" />
            <el-table-column prop="label2" width="120" />
            <el-table-column prop="value2" width="120" />
            <el-table-column prop="label3" width="120" />
            <el-table-column prop="value3" min-width="120" />
          </el-table>
          
          <!-- 移动端网格 -->
          <div v-else class="mobile-overview-grid">
            <div 
              v-for="(item, index) in overviewFlatData" 
              :key="index"
              class="overview-item"
            >
              <div class="item-label">{{ item.label }}</div>
              <div class="item-value">{{ item.value }}</div>
            </div>
          </div>
        </div>

        <!-- 右侧状态信息 -->
        <div class="status-section">
          <div class="status-title">状态信息</div>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">设备通讯正常</span>
              <div class="status-value">
                <span class="status-indicator green"></span>
                <span class="status-text">正常运行</span>
              </div>
            </div>
            <div class="status-item">
              <span class="label">设备运行中断</span>
              <div class="status-value">
                <span class="status-indicator red"></span>
                <span class="status-text">故障运行</span>
              </div>
            </div>
            <div class="status-item">
              <span class="label">设备运行</span>
              <div class="status-value">
                <span class="status-indicator green"></span>
                <span class="status-text">正常</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PV信息表格 -->
      <div class="pv-section">
        <div class="section-title">PV信息</div>
        <div class="pv-table">
          <el-table
            :data="pvData"
            style="width: 100%"
            :header-cell-style="{ 
              backgroundColor: '#0d2344', 
              color: '#ffffff',
              borderColor: 'rgba(0, 212, 255, 0.4)'
            }"
            :cell-style="{ 
              backgroundColor: 'rgba(0, 212, 255, 0.15)', 
              color: '#ffffff',
              borderColor: '#0d2344'
            }"
          >
            <el-table-column prop="pvName" label="PV电压_1" width="120" align="center" />
            <el-table-column prop="pvVoltage" label="PV电流_1" width="120" align="center">
              <template #default="{ row }">
                {{ formatNumber(row.pvVoltage) }}V
              </template>
            </el-table-column>
            <el-table-column prop="pvCurrent" label="PV功率_1" width="120" align="center">
              <template #default="{ row }">
                {{ formatNumber(row.pvCurrent) }}A
              </template>
            </el-table-column>
            <el-table-column prop="pvPower" label="PV电压_2" width="120" align="center">
              <template #default="{ row }">
                {{ formatNumber(row.pvPower) }}W
              </template>
            </el-table-column>
            <el-table-column prop="pvName2" label="PV电流_2" width="120" align="center" />
            <el-table-column prop="pvVoltage2" label="PV功率_2" width="120" align="center" />
            <el-table-column prop="pvCurrent2" label="PV电压_3" width="120" align="center" />
            <el-table-column prop="pvPower2" label="PV电流_3" width="120" align="center" />
            <el-table-column prop="pvName3" label="PV功率_3" min-width="120" align="center" />
          </el-table>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="list-view">
      <el-table
        :data="monitorPointsData"
        style="width: 100%"
        :header-cell-style="{ 
          backgroundColor: '#0d2344', 
          color: '#ffffff',
          borderColor: 'rgba(0, 212, 255, 0.4)'
        }"
        :cell-style="{ 
          backgroundColor: 'rgba(0, 212, 255, 0.15)', 
          color: '#ffffff',
          borderColor: '#0d2344'
        }"
      >
        <el-table-column prop="pointName" label="测点名称" width="150" align="center" />
        <el-table-column prop="pointCategory" label="测点分类" width="100" align="center" />
        <el-table-column prop="coefficient" label="系数" width="80" align="center" />
        <el-table-column prop="currentValue" label="当前值" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="pointAddress" label="点位地址" width="120" align="center" />
        <el-table-column prop="pointNumber" label="测点编号" width="150" align="center" />
        <el-table-column prop="currentTime" label="当前时间" min-width="180" align="center" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { getDeviceMonitorInfo } from '@/api/diagnosis/deviceDetail'
import type { 
  DeviceTotalData, 
  DeviceStatusInfo, 
  PVData, 
  SystemInfo 
} from '@/api/types/diagnosis/deviceDetail'

interface Props {
  deviceId: string
  visible: boolean
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const viewMode = ref<'card' | 'list'>('card')  // 视图模式
const totalData = ref<DeviceTotalData>()
const statusInfo = ref<DeviceStatusInfo>()
const pvData = ref<PVData[]>([])
const systemInfo = ref<SystemInfo>()

// 视图模式切换
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'card' ? 'list' : 'card'
}

// 监控点数据（列表视图）
const monitorPointsData = computed(() => [
  {
    pointName: 'MPPT功率_6',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'W',
    pointAddress: '',
    pointNumber: '0915012400G',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电压_7',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'V',
    pointAddress: '',
    pointNumber: '0915012200T',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电流_7',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'A',
    pointAddress: '',
    pointNumber: '0915012300T',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT功率_7',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'W',
    pointAddress: '',
    pointNumber: '0915012400T',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电压_8',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'V',
    pointAddress: '',
    pointNumber: '0915012200S',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电流_8',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'A',
    pointAddress: '',
    pointNumber: '0915012300S',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT功率_8',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'W',
    pointAddress: '',
    pointNumber: '0915012400S',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电压_9',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'V',
    pointAddress: '',
    pointNumber: '0915012200Y',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电流_9',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'A',
    pointAddress: '',
    pointNumber: '0915012300Y',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT功率_9',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'W',
    pointAddress: '',
    pointNumber: '0915012400Y',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电压_10',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'V',
    pointAddress: '',
    pointNumber: '0915012201O',
    currentTime: '2025-10-22 20:00:00'
  },
  {
    pointName: 'MPPT电流_10',
    pointCategory: '运测',
    coefficient: 1,
    currentValue: 0,
    unit: 'A',
    pointAddress: '',
    pointNumber: '0915012301O',
    currentTime: '2025-10-22 20:00:00'
  }
])

// 数据总览表格数据
// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

const overviewTableData = computed(() => {
  if (!totalData.value) return []
  
  return [
    {
      label1: '累计发电量',
      value1: `${formatNumber(totalData.value.totalGeneration)}kWh`,
      label2: '当日发电量',
      value2: `${formatNumber(totalData.value.dailyGeneration)}kWh`,
      label3: '平均发电量',
      value3: `${formatNumber(totalData.value.avgGeneration)}kWh`
    },
    {
      label1: '总有功功率',
      value1: `${formatNumber(totalData.value.totalActivePower)}kW`,
      label2: '当日有功功率',
      value2: `${formatNumber(totalData.value.dailyActivePower)}kW`,
      label3: '平均有功功率',
      value3: `${formatNumber(totalData.value.avgActivePower)}kW`
    },
    {
      label1: '总无功功率',
      value1: `${formatNumber(totalData.value.totalReactivePower)}kVar`,
      label2: '当日无功功率',
      value2: `${formatNumber(totalData.value.dailyReactivePower)}kVar`,
      label3: '功率因数',
      value3: totalData.value.powerFactor || '-'
    },
    {
      label1: 'A相电压',
      value1: `${formatNumber(systemInfo.value?.aPhaseVoltage)}V`,
      label2: 'B相电压',
      value2: `${formatNumber(systemInfo.value?.bPhaseVoltage)}V`,
      label3: 'C相电压',
      value3: `${formatNumber(systemInfo.value?.cPhaseVoltage)}V`
    },
    {
      label1: 'A相电流',
      value1: `${formatNumber(systemInfo.value?.aPhaseCurrent)}A`,
      label2: 'B相电流',
      value2: `${formatNumber(systemInfo.value?.bPhaseCurrent)}A`,
      label3: 'C相电流',
      value3: `${formatNumber(systemInfo.value?.cPhaseCurrent)}A`
    },
    {
      label1: '电网频率',
      value1: `${formatNumber(systemInfo.value?.gridFrequency)}Hz`,
      label2: '逆变器内温度',
      value2: `${formatNumber(systemInfo.value?.inverterTemp)}℃`,
      label3: '逆变器工作状态',
      value3: systemInfo.value?.workStatus || '-'
    }
  ]
})

// 扁平化数据用于移动端网格显示
const overviewFlatData = computed(() => {
  const tableData = overviewTableData.value
  const flatData: Array<{ label: string; value: string }> = []
  
  tableData.forEach(row => {
    if (row.label1 && row.value1) flatData.push({ label: row.label1, value: String(row.value1) })
    if (row.label2 && row.value2) flatData.push({ label: row.label2, value: String(row.value2) })
    if (row.label3 && row.value3) flatData.push({ label: row.label3, value: String(row.value3) })
  })
  
  return flatData
})

/**
 * 格式化数字显示
 */
const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return '-'
  return value.toFixed(2)
}

/**
 * 获取状态指示器样式类
 */
const getStatusClass = (color: string | undefined): string => {
  switch (color) {
    case 'green':
      return 'status-green'
    case 'red':
      return 'status-red'
    case 'orange':
      return 'status-orange'
    default:
      return 'status-gray'
  }
}

/**
 * 获取监控信息数据
 */
const fetchMonitorInfo = async () => {
  if (!props.deviceId) return
  
  try {
    loading.value = true
    const response = await getDeviceMonitorInfo(props.deviceId)
    
    if (response.success && response.data) {
      totalData.value = response.data.totalData
      statusInfo.value = response.data.statusInfo
      pvData.value = response.data.pvData
      systemInfo.value = response.data.systemInfo
    }
  } catch (error) {
    console.error('获取设备监控信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.deviceId) {
    fetchMonitorInfo()
  }
})

// 监听设备ID变化
watch(() => props.deviceId, (deviceId) => {
  if (deviceId && props.visible) {
    fetchMonitorInfo()
  }
})

// 组件挂载时获取数据
onMounted(() => {
  if (props.visible && props.deviceId) {
    fetchMonitorInfo()
  }
})
</script>

<style scoped lang="scss">
.monitor-info-tab {
  padding: 20px;
  background: #0d2344;  // 深蓝背景
  color: #ffffff;
  height: 100%;
  overflow-y: auto;

  .refresh-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .left-info {
      display: flex;
      align-items: center;
      gap: 15px;

      .refresh-btn {
        color: #39b6f7;  // 青色发光
        
        &:hover {
          color: #1680ca;  // 青色主按钮
        }
      }

      .total-count {
        color: #39b6f7;  // 青色发光
        font-size: 14px;
        font-weight: 500;
      }
    }

    .view-toggle-btn {
      background: #1680ca;  // 青色主按钮
      border-color: rgba(0, 212, 255, 0.4);  // 主题青色边框
      
      &:hover {
        background: #39b6f7;  // 青色发光
        border-color: #39b6f7;
      }
    }
  }

  .top-section {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;

    .overview-section {
      flex: 2;

      .overview-title {
        font-size: 16px;
        font-weight: 600;
        color: #39b6f7;  // 青色发光
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.4);  // 主题青色边框
      }

      :deep(.el-table) {
        background: transparent;
        
        .el-table__body-wrapper {
          background: transparent;
        }

        .el-table__row {
          background: rgba(0, 212, 255, 0.15);  // 主题青色背景
          
          &:hover {
            background: rgba(0, 212, 255, 0.35) !important;  // 主题青色hover效果
          }
        }

        .el-table__cell {
          border-color: #0d2344;  // 深蓝边框
          padding: 8px 12px;
          font-size: 13px;
        }
      }
    }

    .status-section {
      flex: 1;

      .status-title {
        font-size: 16px;
        font-weight: 600;
        color: #39b6f7;  // 青色发光
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.4);  // 主题青色边框
      }

      .status-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .status-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: rgba(0, 212, 255, 0.15);  // 主题青色背景
          border-radius: 4px;
          border: 1px solid #0d2344;  // 深蓝边框

          .label {
            color: #ffffff;
            font-size: 14px;
          }

          .status-value {
            display: flex;
            align-items: center;
            gap: 8px;

            .status-indicator {
              width: 8px;
              height: 8px;
              border-radius: 50%;

              &.green {
                background: #27ae60;
              }

              &.red {
                background: #e74c3c;
              }

              &.orange {
                background: #f39c12;
              }
            }

            .status-text {
              color: #ffffff;
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  .pv-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #39b6f7;  // 青色发光
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0, 212, 255, 0.4);  // 主题青色边框
    }

    .pv-table {
      :deep(.el-table) {
        background: transparent;
        
        .el-table__body-wrapper {
          background: transparent;
        }

        .el-table__row {
          background: rgba(0, 212, 255, 0.15);  // 主题青色背景
          
          &:hover {
            background: rgba(0, 212, 255, 0.35) !important;  // 主题青色hover效果
          }
        }

        .el-table__header {
          background: #0d2344;  // 深蓝背景
        }

        .el-table__cell {
          border-color: #0d2344;  // 深蓝边框
        }
      }
    }
  }

  // 列表视图样式
  .list-view {
    margin-top: 20px;

    :deep(.el-table) {
      background: transparent;
      
      .el-table__body-wrapper {
        background: transparent;
      }

      .el-table__row {
        background: rgba(0, 212, 255, 0.15);  // 主题青色背景
        
        &:hover {
          background: rgba(0, 212, 255, 0.35) !important;  // 主题青色hover效果
        }
      }

      .el-table__header {
        background: #0d2344;  // 深蓝背景
      }

      .el-table__cell {
        border-color: #0d2344;  // 深蓝边框
        font-size: 14px;
      }
    }
  }
}

// 自定义滚动条
.monitor-info-tab::-webkit-scrollbar {
  width: 6px;
}

.monitor-info-tab::-webkit-scrollbar-track {
  background: #0d2344;  // 深蓝背景
  border-radius: 3px;
}

.monitor-info-tab::-webkit-scrollbar-thumb {
  background: #39b6f7;  // 青色发光
  border-radius: 3px;
  
  &:hover {
    background: #1680ca;  // 青色主按钮
  }
}

// 移动端适配
@media (max-width: 768px) {
  .monitor-info-tab {
    padding: 12px;
    
    .refresh-bar {
      margin-bottom: 15px;
      
      .left-info {
        gap: 10px;
        
        .total-count {
          font-size: 12px;
        }
      }
      
      .view-toggle-btn {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
    
    .card-view {
      .top-section {
        flex-direction: column;
        gap: 15px;
        
        .overview-section {
          width: 100%;
          
          .overview-title {
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          // 移动端专用的网格布局
          .mobile-overview-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            
            .overview-item {
              background: rgba(0, 212, 255, 0.15);
              border: 1px solid #0d2344;
              border-radius: 4px;
              padding: 10px;
              display: flex;
              flex-direction: column;
              gap: 6px;
              
              .item-label {
                font-size: 11px;
                color: #00d4ff;
                font-weight: 600;
              }
              
              .item-value {
                font-size: 13px;
                color: #ffffff;
                font-weight: 500;
              }
            }
          }
        }
        
        .status-section {
          width: 100%;
          
          .status-title {
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .status-grid {
            gap: 10px;
            
            .status-item {
              font-size: 12px;
              padding: 8px 10px;
              
              .status-indicator {
                width: 8px;
                height: 8px;
              }
            }
          }
        }
      }
      
      .pv-section {
        margin-top: 15px;
        
        .pv-title {
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .pv-table {
          :deep(.el-table) {
            font-size: 11px;
            
            .el-table__cell {
              padding: 6px 4px;
            }
          }
        }
      }
    }
    
    .list-view {
      margin-top: 15px;
      
      :deep(.el-table) {
        font-size: 11px;
        
        .el-table__cell {
          padding: 6px 4px;
          font-size: 11px;
        }
      }
    }
  }
}
</style>
