<template>
  <ElDialog
    v-model="visible"
    title="容量设置"
    :width="isMobile ? '90%' : '900px'"
    :top="isMobile ? '2vh' : '3vh'"
    :close-on-click-modal="false"
  >
    <div class="capacity-config-container">
      <!-- 批量配置区域 -->
      <div class="batch-config-section">
        <div class="section-title">
          <ElCheckbox
            :model-value="allSelected"
            :indeterminate="indeterminate"
            @change="handleSelectAll"
          >
            批量配置
          </ElCheckbox>
        </div>
        
        <div class="batch-operations">
          <ElButton size="small" @click="handleBatchEnable(true)">批量启用</ElButton>
          <ElButton size="small" @click="handleBatchEnable(false)">批量禁用</ElButton>
          <ElButton size="small" @click="handleResetAll">重置</ElButton>
        </div>
      </div>
      
      <!-- 设备配置区域 -->
      <div class="device-config-section">
        <div class="device-header">
          <span class="device-name">设备名称: {{ deviceInfo?.deviceName || 'CN-N0101' }}</span>
        </div>
        
        <div class="config-grid" v-loading="loading">
          <!-- 左列 -->
          <div class="config-column">
            <div 
              v-for="(row, index) in leftColumnData" 
              :key="row.stringId"
              class="config-row"
              :class="{ 'modified': row.isModified }"
            >
              <ElCheckbox
                v-model="row.enabled"
                @change="handleStatusChange(row)"
                class="row-checkbox"
              >
                {{ row.stringName }}
              </ElCheckbox>
              
              <div class="current-display">
                <span :class="{ 'zero-current': row.realTimeCurrent === 0 }">
                  {{ formatCurrent(row.realTimeCurrent) }}
                </span>
              </div>
              
              <div class="capacity-input-wrapper">
                <ElInput
                  v-model.number="row.stringCapacity"
                  :disabled="!row.enabled"
                  class="capacity-input"
                  @input="handleCapacityChange(row)"
                  @blur="handleCapacityBlur(row)"
                />
                <span class="unit">Wp</span>
              </div>
            </div>
          </div>
          
          <!-- 右列 -->
          <div class="config-column">
            <div 
              v-for="(row, index) in rightColumnData" 
              :key="row.stringId"
              class="config-row"
              :class="{ 'modified': row.isModified }"
            >
              <ElCheckbox
                v-model="row.enabled"
                @change="handleStatusChange(row)"
                class="row-checkbox"
              >
                {{ row.stringName }}
              </ElCheckbox>
              
              <div class="current-display">
                <span :class="{ 'zero-current': row.realTimeCurrent === 0 }">
                  {{ formatCurrent(row.realTimeCurrent) }}
                </span>
              </div>
              
              <div class="capacity-input-wrapper">
                <ElInput
                  v-model.number="row.stringCapacity"
                  :disabled="!row.enabled"
                  class="capacity-input"
                  @input="handleCapacityChange(row)"
                  @blur="handleCapacityBlur(row)"
                />
                <span class="unit">Wp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton 
          type="primary" 
          @click="handleSaveAll"
          :loading="saving"
          :disabled="modifiedCount === 0"
        >
          保存全部 ({{ modifiedCount }})
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { 
  StringDiagnosisRecord,
  CapacityConfigItem,
  CapacityConfigRequest
} from '@/api/types/diagnosis/stringDiagnosis'
import { updateCapacityConfig } from '@/api/diagnosis/stringDiagnosis'

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

interface Props {
  visible: boolean
  deviceInfo: StringDiagnosisRecord | null
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}

interface ConfigItemExtended extends CapacityConfigItem {
  originalEnabled: boolean
  originalCapacity: number
  isModified: boolean
  applying: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const saving = ref(false)
const configList = ref<ConfigItemExtended[]>([])

// 计算属性
const enabledCount = computed(() => 
  configList.value.filter(item => item.enabled).length
)

const disabledCount = computed(() => 
  configList.value.filter(item => !item.enabled).length
)

const modifiedCount = computed(() => 
  configList.value.filter(item => item.isModified).length
)

// 左右列数据分配
const leftColumnData = computed(() => {
  const leftData = []
  for (let i = 0; i < configList.value.length; i += 2) {
    leftData.push(configList.value[i])
  }
  return leftData
})

const rightColumnData = computed(() => {
  const rightData = []
  for (let i = 1; i < configList.value.length; i += 2) {
    rightData.push(configList.value[i])
  }
  return rightData
})

// 全选状态
const allSelected = computed(() => {
  return configList.value.length > 0 && configList.value.every(item => item.enabled)
})

const indeterminate = computed(() => {
  const enabledCount = configList.value.filter(item => item.enabled).length
  return enabledCount > 0 && enabledCount < configList.value.length
})

/**
 * 格式化电流显示
 */
const formatCurrent = (current: number): string => {
  if (current === 0) return '-'
  return current.toFixed(2)
}

/**
 * 处理全选
 */
const handleSelectAll = (checked: boolean) => {
  configList.value.forEach(row => {
    row.enabled = checked
    checkModified(row)
  })
}

/**
 * 处理容量输入失焦
 */
const handleCapacityBlur = (row: ConfigItemExtended) => {
  // 确保数值在合理范围内
  if (row.stringCapacity < 0) {
    row.stringCapacity = 0
  } else if (row.stringCapacity > 50000) {
    row.stringCapacity = 50000
  }
  
  // 保瘀2位小数
  row.stringCapacity = Number(row.stringCapacity.toFixed(2))
  
  checkModified(row)
}

/**
 * 检查是否修改
 */
const checkModified = (row: ConfigItemExtended) => {
  row.isModified = (
    row.enabled !== row.originalEnabled ||
    row.stringCapacity !== row.originalCapacity
  )
}

/**
 * 处理状态变化
 */
const handleStatusChange = (row: ConfigItemExtended) => {
  checkModified(row)
}

/**
 * 处理容量变化
 */
const handleCapacityChange = (row: ConfigItemExtended) => {
  checkModified(row)
}

/**
 * 批量启用/禁用
 */
const handleBatchEnable = (enabled: boolean) => {
  configList.value.forEach(row => {
    row.enabled = enabled
    checkModified(row)
  })
}

/**
 * 重置全部
 */
const handleResetAll = () => {
  configList.value.forEach(row => {
    row.enabled = row.originalEnabled
    row.stringCapacity = row.originalCapacity
    row.isModified = false
  })
}

/**
 * 重置单个
 */
const handleResetSingle = (row: ConfigItemExtended) => {
  row.enabled = row.originalEnabled
  row.stringCapacity = row.originalCapacity
  row.isModified = false
}

/**
 * 应用单个配置
 */
const handleApplySingle = async (row: ConfigItemExtended) => {
  if (!row.isModified) {
    ElMessage.info('该组串未修改')
    return
  }
  
  row.applying = true
  try {
    const response = await updateCapacityConfig(props.deviceInfo!.deviceId, {
      configurations: [{
        stringId: row.stringId,
        stringName: row.stringName,
        enabled: row.enabled,
        realTimeCurrent: row.realTimeCurrent,
        stringCapacity: row.stringCapacity
      }]
    })
    
    if (response.success) {
      ElMessage.success('配置应用成功')
      // 更新原始值
      row.originalEnabled = row.enabled
      row.originalCapacity = row.stringCapacity
      row.isModified = false
    } else {
      ElMessage.error(response.message || '配置应用失败')
    }
  } catch (error) {
    console.error('配置应用失败:', error)
    ElMessage.error('配置应用失败')
  } finally {
    row.applying = false
  }
}

/**
 * 保存全部配置
 */
const handleSaveAll = async () => {
  const modifiedItems = configList.value.filter(item => item.isModified)
  
  if (modifiedItems.length === 0) {
    ElMessage.info('没有修改的配置')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要保存 ${modifiedItems.length} 个组串的配置吗？`,
      '保存确认',
      { type: 'warning' }
    )
    
    saving.value = true
    
    const configurations: CapacityConfigItem[] = modifiedItems.map(item => ({
      stringId: item.stringId,
      stringName: item.stringName,
      enabled: item.enabled,
      realTimeCurrent: item.realTimeCurrent,
      stringCapacity: item.stringCapacity
    }))
    
    const response = await updateCapacityConfig(props.deviceInfo!.deviceId, {
      configurations
    })
    
    if (response.success && response.data) {
      const { successCount, failedCount } = response.data
      
      if (failedCount === 0) {
        ElMessage.success(`全部配置保存成功，共 ${successCount} 个`)
      } else {
        ElMessage.warning(`部分配置保存成功：成功 ${successCount} 个，失败 ${failedCount} 个`)
      }
      
      // 更新原始值
      modifiedItems.forEach(item => {
        item.originalEnabled = item.enabled
        item.originalCapacity = item.stringCapacity
        item.isModified = false
      })
      
      emit('success')
    } else {
      ElMessage.error(response.message || '配置保存失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('配置保存失败:', error)
      ElMessage.error('配置保存失败')
    }
  } finally {
    saving.value = false
  }
}

/**
 * 生成Mock组串配置数据
 */
const generateMockConfigurations = (): ConfigItemExtended[] => {
  const configs: ConfigItemExtended[] = []
  
  // 生成20个PV组串，模拟UI设计图中的数据
  const mockData = [
    { name: 'PV组流_1', enabled: true, current: 1.5, capacity: 9810 },
    { name: 'PV组流_2', enabled: true, current: 1.16, capacity: 9810 },
    { name: 'PV组流_3', enabled: true, current: 1.31, capacity: 9810 },
    { name: 'PV组流_4', enabled: true, current: 1.45, capacity: 9810 },
    { name: 'PV组流_5', enabled: false, current: 0, capacity: 0 },
    { name: 'PV组流_6', enabled: false, current: 0, capacity: 0 },
    { name: 'PV组流_7', enabled: false, current: 0, capacity: 0 },
    { name: 'PV组流_8', enabled: false, current: 0, capacity: 0 },
    { name: 'PV组流_9', enabled: true, current: 1.36, capacity: 9810 },
    { name: 'PV组流_10', enabled: true, current: 1.45, capacity: 9810 },
    { name: 'PV组流_11', enabled: true, current: 1.53, capacity: 9810 },
    { name: 'PV组流_12', enabled: true, current: 1.45, capacity: 9810 },
    { name: 'PV组流_13', enabled: true, current: 1.2, capacity: 9810 },
    { name: 'PV组流_14', enabled: false, current: 0, capacity: 0 },
    { name: 'PV组流_15', enabled: true, current: 1.45, capacity: 9810 },
    { name: 'PV组流_16', enabled: true, current: 1.38, capacity: 9810 },
    { name: 'PV组流_17', enabled: true, current: 1.47, capacity: 8720 },
    { name: 'PV组流_18', enabled: true, current: 1.18, capacity: 9265 },
    { name: 'PV组流_19', enabled: false, current: 0, capacity: 0 },
    { name: 'PV组流_20', enabled: false, current: 0, capacity: 0 }
  ]
  
  mockData.forEach((item, index) => {
    configs.push({
      stringId: `pv${index + 1}`,
      stringName: item.name,
      enabled: item.enabled,
      realTimeCurrent: item.current,
      stringCapacity: item.capacity,
      originalEnabled: item.enabled,
      originalCapacity: item.capacity,
      isModified: false,
      applying: false
    })
  })
  
  return configs
}

/**
 * 处理取消
 */
const handleCancel = () => {
  if (modifiedCount.value > 0) {
    ElMessageBox.confirm(
      '有未保存的修改，确定要关闭吗？',
      '关闭确认',
      { type: 'warning' }
    ).then(() => {
      visible.value = false
    }).catch(() => {})
  } else {
    visible.value = false
  }
}

// 监听弹窗显示
watch(visible, (newVal) => {
  if (newVal && props.deviceInfo) {
    // 生成配置数据
    configList.value = generateMockConfigurations()
  } else {
    // 清理数据
    configList.value = []
  }
})
</script>

<style scoped lang="scss">
.capacity-config-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 70vh;
}

// 批量配置区域
.batch-config-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  .section-title {
    :deep(.el-checkbox__label) {
      color: #00d4ff;
      font-size: 16px;
      font-weight: 600;
    }
    
    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background-color: #00d4ff;
      border-color: #00d4ff;
    }
    
    :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
      background-color: #00d4ff;
      border-color: #00d4ff;
    }
  }
  
  .batch-operations {
    display: flex;
    gap: 12px;
  }
}

// 设备配置区域
.device-config-section {
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  
  .device-header {
    padding: 16px 20px;
    background: rgba(0, 40, 80, 0.8);
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    
    .device-name {
      color: #00d4ff;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: rgba(0, 212, 255, 0.1);
    max-height: 400px;
    overflow-y: auto;
    
    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 40, 80, 0.4);
    }
    
    &::-webkit-scrollbar-thumb {
      background: #00d4ff;
      border-radius: 3px;
      
      &:hover {
        background: rgba(0, 212, 255, 0.8);
      }
    }
  }
  
  .config-column {
    display: flex;
    flex-direction: column;
  }
  
  .config-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: rgba(0, 40, 80, 0.6);
    transition: all 0.3s;
    min-height: 56px;
    gap: 12px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.1);
    }
    
    &.modified {
      background: rgba(230, 126, 34, 0.1);
      
      .row-checkbox {
        :deep(.el-checkbox__label) {
          color: #e67e22;
        }
      }
    }
    
    .row-checkbox {
      flex: 0 0 120px;
      
      :deep(.el-checkbox__label) {
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
      }
      
      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #00d4ff;
        border-color: #00d4ff;
      }
    }
    
    .current-display {
      flex: 0 0 60px;
      text-align: center;
      color: #ffffff;
      font-size: 14px;
      
      .zero-current {
        color: #e74c3c;
        font-weight: 600;
      }
    }
    
    .capacity-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .capacity-input {
        flex: 1;
        
        :deep(.el-input__wrapper) {
          background: rgba(0, 60, 120, 0.8);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 4px;
          
          .el-input__inner {
            color: #ffffff;
            text-align: center;
            font-size: 14px;
          }
          
          &:hover {
            border-color: #00d4ff;
          }
          
          &.is-focus {
            border-color: #00d4ff;
            box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
          }
        }
        
        &:disabled {
          :deep(.el-input__wrapper) {
            background: rgba(0, 40, 80, 0.4);
            border-color: rgba(255, 255, 255, 0.1);
            
            .el-input__inner {
              color: rgba(255, 255, 255, 0.3);
            }
          }
        }
      }
      
      .unit {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        flex-shrink: 0;
      }
    }
  }
}

// 对话框底部
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .el-button + .el-button {
    margin-left: 12px;
  }
}

// 响应式适配
@media (max-width: 1024px) {
  .capacity-config-container {
    max-height: 80vh;
  }
  
  .device-config-section .config-grid {
    max-height: 350px;
  }
}

@media (max-width: 768px) {
  .capacity-config-container {
    max-height: none;
    gap: 12px;
  }
  
  .batch-config-section {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
    padding: 12px;
    
    .section-title {
      :deep(.el-checkbox__label) {
        font-size: 14px;
      }
    }
    
    .batch-operations {
      gap: 8px;
      
      .el-button {
        flex: 1;
        font-size: 13px;
        padding: 8px 12px;
      }
    }
  }
  
  .device-config-section {
    .device-header {
      padding: 12px;
      
      .device-name {
        font-size: 14px;
      }
    }
    
    .config-grid {
      grid-template-columns: 1fr;
      max-height: none;
    }
    
    .config-row {
      flex-wrap: wrap;
      padding: 10px 12px;
      gap: 8px;
      min-height: auto;
      
      .row-checkbox {
        flex: 1 1 100%;
        
        :deep(.el-checkbox__label) {
          font-size: 13px;
        }
      }
      
      .current-display {
        flex: 0 0 auto;
        font-size: 13px;
        padding-right: 8px;
      }
      
      .capacity-input-wrapper {
        flex: 1 1 auto;
        min-width: 150px;
        
        .capacity-input {
          :deep(.el-input__wrapper) {
            .el-input__inner {
              font-size: 13px;
            }
          }
        }
        
        .unit {
          font-size: 11px;
        }
      }
    }
  }
  
  .dialog-footer {
    flex-direction: column-reverse;
    gap: 10px;
    
    .el-button {
      width: 100%;
      margin-left: 0 !important;
    }
  }
}
</style>
