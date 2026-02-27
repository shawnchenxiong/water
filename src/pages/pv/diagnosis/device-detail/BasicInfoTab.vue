<template>
  <div class="basic-info-tab">
    <!-- 设备基础信息表格 -->
    <div class="device-info-table">
      <!-- 桌面端表格 -->
      <el-table
        v-if="!isMobile"
        :data="deviceInfoTableData"
        style="width: 100%"
        :show-header="false"
        :cell-style="getCellStyle"
      >
        <el-table-column prop="label1" width="120" class-name="label-column" />
        <el-table-column prop="value1" width="200" class-name="value-column" />
        <el-table-column prop="label2" width="120" class-name="label-column" />
        <el-table-column prop="value2" width="200" class-name="value-column" />
        <el-table-column prop="label3" width="120" class-name="label-column" />
        <el-table-column prop="value3" width="200" class-name="value-column" />
        <el-table-column prop="label4" width="120" class-name="label-column" />
        <el-table-column prop="value4" min-width="200" class-name="value-column" />
      </el-table>
      
      <!-- 移动端网格 -->
      <div v-else class="mobile-device-info-grid">
        <div 
          v-for="(item, index) in deviceInfoFlatData" 
          :key="index"
          class="device-info-item"
        >
          <div class="item-label">{{ item.label }}</div>
          <div class="item-value">{{ item.value }}</div>
        </div>
      </div>
    </div>

    <!-- 属性信息 -->
    <div class="info-section">
      <div class="section-title">属性信息</div>
      <div class="attributes-table">
        <el-table
          :data="attributes"
          style="width: 100%"
        >
          <el-table-column prop="attributeId" label="属性编号" width="120" align="center" />
          <el-table-column prop="attributeName" label="属性名称" min-width="150" />
          <el-table-column prop="attributeType" label="属性类型" width="120" align="center" />
          <el-table-column prop="attributeValue" label="属性值" min-width="150" />
        </el-table>
      </div>
    </div>

    <!-- 组串详情 -->
    <div class="info-section">
      <div class="section-title">组串详情</div>
      <div class="string-table">
        <el-table
          :data="stringInfo"
          style="width: 100%"
        >
          <el-table-column prop="stringName" label="组串" width="120" align="center" />
          <el-table-column label="配置容量状态" width="150" align="center">
            <template #default="{ row }">
              <span 
                class="status-text"
                :class="{ 'status-enabled': row.configStatus === '已启用' }"
              >
                {{ row.configStatus }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="实际电流(A)" width="120" align="center">
            <template #default="{ row }">
              {{ row.realTimeCurrent.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="组串容量(Wp)" min-width="150" align="center">
            <template #default="{ row }">
              {{ row.stringCapacity.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { 
  DeviceBasicInfo, 
  DeviceAttribute, 
  PVStringInfo 
} from '@/api/types/diagnosis/deviceDetail'

interface Props {
  deviceId: string
  visible: boolean
}

const props = defineProps<Props>()

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

// 响应式数据
const loading = ref(false)
const deviceInfo = ref<DeviceBasicInfo>()
const attributes = ref<DeviceAttribute[]>([])
const stringInfo = ref<PVStringInfo[]>([])

// 设备信息表格数据
const deviceInfoTableData = computed(() => {
  if (!deviceInfo.value) return []
  
  return [
    {
      label1: '设备名称',
      value1: 'CN-N0101',
      label2: '设备编号',
      value2: '0915011700313067173',
      label3: '设备类型',
      value3: '逆变器',
      label4: '产品类型',
      value4: '阳光云API'
    },
    {
      label1: '设备厂家',
      value1: '阳光',
      label2: '上级设备名称',
      value2: '智能运维平台/安徽省芜湖市/芜...',
      label3: '商标时间',
      value3: '',
      label4: '连接状态',
      value4: '在线'
    },
    {
      label1: '高级时长',
      value1: '',
      label2: '上级设备状态',
      value2: '',
      label3: '网络组件',
      value3: '阳光云交换平台',
      label4: '',
      value4: ''
    }
  ]
})

// 扁平化数据用于移动端网格显示
const deviceInfoFlatData = computed(() => {
  const tableData = deviceInfoTableData.value
  const flatData: Array<{ label: string; value: string }> = []
  
  tableData.forEach(row => {
    if (row.label1) flatData.push({ label: row.label1, value: String(row.value1 || '') })
    if (row.label2) flatData.push({ label: row.label2, value: String(row.value2 || '') })
    if (row.label3) flatData.push({ label: row.label3, value: String(row.value3 || '') })
    if (row.label4) flatData.push({ label: row.label4, value: String(row.value4 || '') })
  })
  
  return flatData
})

/**
 * 获取单元格样式（区分label和value）
 */
const getCellStyle = ({ row, column, rowIndex, columnIndex }: any) => {
  // 偶数列是label，奇数列是value
  const isLabel = columnIndex % 2 === 0
  return {
    color: isLabel ? '#39b6f7' : '#ffffff',  // label用青色，value用白色
    fontWeight: isLabel ? '600' : '400',  // label加粗
    padding: '8px 12px'
  }
}

/**
 * 获取基础信息数据
 */
const fetchBasicInfo = async () => {
  if (!props.deviceId) return
  
  try {
    loading.value = true
    
    // 模拟数据
    deviceInfo.value = {
      deviceName: 'CN-N0101',
      deviceNumber: '0915011700313067173',
      deviceType: '逆变器',
      manufacturer: '阳光',
      parentDeviceName: '智能运维平台/安徽省芜湖市/芜...',
      productType: '阳光云API',
      connectionStatus: '在线',
      uptime: '',
      parentDeviceStatus: '',
      apiInfo: '阳光云交换平台',
      location: ''
    } as DeviceBasicInfo
    
    // 模拟属性数据
    attributes.value = [
      { attributeId: '31', attributeName: '安装位置', attributeType: '文本类型', attributeValue: '-' },
      { attributeId: '25', attributeName: '坐标-X轴', attributeType: '数值类型', attributeValue: '-' },
      { attributeId: '26', attributeName: '坐标-Y轴', attributeType: '数值类型', attributeValue: '-' },
      { attributeId: '107', attributeName: '坐标-经度', attributeType: '文本类型', attributeValue: '-' },
      { attributeId: '108', attributeName: '坐标-纬度', attributeType: '文本类型', attributeValue: '-' }
    ]
    
    // 模拟组串数据
    stringInfo.value = [
      { stringName: 'PV组流_1', configStatus: '已启用', realTimeCurrent: 1.5, stringCapacity: 9810.00 },
      { stringName: 'PV组流_2', configStatus: '已启用', realTimeCurrent: 1.36, stringCapacity: 9810.00 },
      { stringName: 'PV组流_3', configStatus: '已启用', realTimeCurrent: 1.52, stringCapacity: 9810.00 },
      { stringName: 'PV组流_4', configStatus: '已启用', realTimeCurrent: 1.43, stringCapacity: 9810.00 }
    ]
    
  } catch (error) {
    console.error('获取设备基础信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && props.deviceId) {
    fetchBasicInfo()
  }
})

// 监听设备ID变化
watch(() => props.deviceId, (deviceId) => {
  if (deviceId && props.visible) {
    fetchBasicInfo()
  }
})

// 组件挂载时获取数据
onMounted(() => {
  if (props.visible && props.deviceId) {
    fetchBasicInfo()
  }
})
</script>

<style scoped lang="scss">
.basic-info-tab {
  padding: 20px;
  background: #0d2344;  // 深蓝背景
  color: #ffffff;
  height: 100%;
  overflow-y: auto;

  .device-info-table {
    margin-bottom: 30px;

    :deep(.el-table) {
      .el-table__cell {
        padding: 8px 12px;
        font-size: 14px;
      }

      // Label列样式
      .label-column {
        color: #39b6f7 !important;  // 青色发光
        font-weight: 600 !important;  // 加粗
      }

      // Value列样式  
      .value-column {
        color: #ffffff !important;  // 白色
        font-weight: 400 !important;  // 正常
      }
    }
  }

  .info-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #39b6f7;  // 青色发光
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #1875b7;  // 青蓝边框
    }

    .attributes-table,
    .string-table {
      .status-text {
        color: #95a5a6;
        
        &.status-enabled {
          color: #27ae60;
        }
      }
    }
  }
}

// 自定义滚动条
.basic-info-tab::-webkit-scrollbar {
  width: 6px;
}

.basic-info-tab::-webkit-scrollbar-track {
  background: #0d2344;  // 深蓝背景
  border-radius: 3px;
}

.basic-info-tab::-webkit-scrollbar-thumb {
  background: #39b6f7;  // 青色发光
  border-radius: 3px;
  
  &:hover {
    background: #1680ca;  // 青色主按钮
  }
}

// 移动端适配
@media (max-width: 768px) {
  .basic-info-tab {
    padding: 12px;
    
    .device-info-table {
      margin-bottom: 15px;
      
      // 移动端专用的网格布局
      .mobile-device-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        
        .device-info-item {
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
            word-break: break-all;
          }
        }
      }
    }
    
    .info-section {
      margin-bottom: 15px;
      
      .section-title {
        font-size: 14px;
        margin-bottom: 10px;
        padding: 8px 10px;
      }
      
      .attributes-table,
      .string-table {
        :deep(.el-table) {
          font-size: 11px;
          
          .el-table__cell {
            padding: 6px 4px;
          }
          
          .el-table__header {
            .el-table__cell {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}
</style>
