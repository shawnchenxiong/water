<template>
  <ElDialog
    v-model="visible"
    title="参数选择"
    :width="isMobile ? '95%' : '600px'"
    :top="isMobile ? '2vh' : '15vh'"
    :close-on-click-modal="false"
  >
    <div class="param-select-container" v-loading="loading">
      <!-- 操作栏 -->
      <div class="operation-bar">
        <div class="select-info">
          已选择 <span class="count">{{ selectedCount }}</span> 个参数
        </div>
        <div class="operation-buttons">
          <ElButton 
            size="small"
            @click="handleSelectAll"
          >
            全选
          </ElButton>
          <ElButton 
            size="small"
            @click="handleSelectNone"
          >
            清空
          </ElButton>
        </div>
      </div>
      
      <!-- 参数列表 -->
      <div class="param-groups">
        <div 
          v-for="group in paramGroups" 
          :key="group.groupName"
          class="param-group"
        >
          <div class="group-header">
            <ElCheckbox
              :model-value="getGroupCheckStatus(group)"
              :indeterminate="getGroupIndeterminate(group)"
              @change="handleGroupCheck(group, $event)"
            >
              {{ group.groupName }}
            </ElCheckbox>
            <span class="group-count">({{ group.params.length }})</span>
          </div>
          
          <div class="group-content">
            <ElCheckboxGroup v-model="internalSelectedParams">
              <ElCheckbox
                v-for="param in group.params"
                :key="param.name"
                :label="param.name"
                class="param-checkbox"
              >
                <span class="param-name">{{ param.name }}</span>
                <span class="param-unit">{{ param.unit }}</span>
              </ElCheckbox>
            </ElCheckboxGroup>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton 
          type="primary" 
          @click="handleConfirm"
          :disabled="internalSelectedParams.length === 0"
        >
          确认 ({{ internalSelectedParams.length }})
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { ParamGroup } from '@/api/types/diagnosis/stringDiagnosis'
import { getCompareParams } from '@/api/diagnosis/stringDiagnosis'

interface Props {
  visible: boolean
  deviceId: string
  selectedParams: string[]
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', params: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const paramGroups = ref<ParamGroup[]>([])
const internalSelectedParams = ref<string[]>([])

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 计算属性
const selectedCount = computed(() => internalSelectedParams.value.length)

/**
 * 获取分组的选中状态
 */
const getGroupCheckStatus = (group: ParamGroup): boolean => {
  const groupParams = group.params.map(p => p.name)
  return groupParams.every(param => internalSelectedParams.value.includes(param))
}

/**
 * 获取分组的半选状态
 */
const getGroupIndeterminate = (group: ParamGroup): boolean => {
  const groupParams = group.params.map(p => p.name)
  const selectedInGroup = groupParams.filter(param => 
    internalSelectedParams.value.includes(param)
  ).length
  return selectedInGroup > 0 && selectedInGroup < groupParams.length
}

/**
 * 处理分组选择
 */
const handleGroupCheck = (group: ParamGroup, checked: boolean) => {
  const groupParams = group.params.map(p => p.name)
  
  if (checked) {
    // 添加该组所有参数
    groupParams.forEach(param => {
      if (!internalSelectedParams.value.includes(param)) {
        internalSelectedParams.value.push(param)
      }
    })
  } else {
    // 移除该组所有参数
    internalSelectedParams.value = internalSelectedParams.value.filter(param => 
      !groupParams.includes(param)
    )
  }
}

/**
 * 全选
 */
const handleSelectAll = () => {
  const allParams: string[] = []
  paramGroups.value.forEach(group => {
    group.params.forEach(param => {
      allParams.push(param.name)
    })
  })
  internalSelectedParams.value = [...allParams]
}

/**
 * 清空选择
 */
const handleSelectNone = () => {
  internalSelectedParams.value = []
}

/**
 * 获取参数列表
 */
const fetchParams = async () => {
  if (!props.deviceId) return
  
  loading.value = true
  try {
    const response = await getCompareParams(props.deviceId)
    
    if (response.success && response.data) {
      paramGroups.value = response.data.paramGroups
    } else {
      ElMessage.error(response.message || '获取参数列表失败')
    }
  } catch (error) {
    console.error('获取参数列表失败:', error)
    ElMessage.error('获取参数列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  visible.value = false
}

/**
 * 处理确认
 */
const handleConfirm = () => {
  if (internalSelectedParams.value.length === 0) {
    ElMessage.warning('请至少选择一个参数')
    return
  }
  
  emit('confirm', [...internalSelectedParams.value])
  visible.value = false
}

// 初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 监听弹窗显示
watch(visible, (newVal) => {
  if (newVal) {
    // 初始化选中的参数
    internalSelectedParams.value = [...props.selectedParams]
    // 获取参数列表
    fetchParams()
  } else {
    // 重置数据
    paramGroups.value = []
    internalSelectedParams.value = []
  }
})
</script>

<style scoped lang="scss">
.param-select-container {
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

// 操作栏
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .select-info {
    font-size: 14px;
    color: #ffffff;
    position: relative;
    z-index: 2;
    
    .count {
      color: #00d4ff;
      font-weight: 600;
      text-shadow: 0 0 6px rgba(0, 212, 255, 0.5);
    }
  }
  
  .operation-buttons {
    display: flex;
    gap: 12px;
    position: relative;
    z-index: 2;
  }
}

// 参数分组
.param-groups {
  flex: 1;
  overflow-y: auto;
  
  .param-group {
    margin-bottom: 20px;
    background: linear-gradient(135deg, rgba(0, 30, 60, 0.9) 0%, rgba(10, 40, 80, 0.95) 100%);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 30%, rgba(0, 212, 255, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .group-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: rgba(0, 40, 80, 0.8);
      border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      font-weight: 600;
      color: #00d4ff;
      position: relative;
      z-index: 2;
      
      .group-count {
        margin-left: 10px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        font-weight: normal;
      }
    }
    
    .group-content {
      padding: 10px;
      position: relative;
      z-index: 2;
      
      .el-checkbox-group {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        
        .param-checkbox {
          display: flex;
          align-items: center;
          height: auto;
          margin: 0;
          
          :deep(.el-checkbox__label) {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex: 1;
            padding: 8px 12px;
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 8px;
            transition: all 0.3s;
            background: rgba(0, 40, 80, 0.4);
            color: #ffffff;
            
            &:hover {
              border-color: #00d4ff;
              background: rgba(0, 212, 255, 0.1);
              box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
            }
          }
          
          &.is-checked {
            :deep(.el-checkbox__label) {
              border-color: #00d4ff;
              background: rgba(0, 212, 255, 0.2);
              box-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
            }
          }
        }
      }
      
      .param-name {
        flex: 1;
        font-size: 13px;
        color: #ffffff;
        font-weight: 500;
      }
      
      .param-unit {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        margin-left: 8px;
      }
    }
  }
}

// 自定义滚动条
.param-groups {
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color);
    border-radius: 3px;
    
    &:hover {
      background-color: var(--el-border-color-dark);
    }
  }
}

// 对话框底部
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 移动端适配
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 0;

    .el-dialog__body {
      padding: 12px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 12px;

      .el-button {
        width: 100px;
        font-size: 13px;
      }
    }
  }

  .param-select-container {
    max-height: 75vh;
  }

  // 操作栏移动端适配
  .operation-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 12px 16px;
    margin-bottom: 16px;
    
    .select-info {
      text-align: center;
      font-size: 13px;
      
      .count {
        font-size: 14px;
      }
    }
    
    .operation-buttons {
      justify-content: center;
      gap: 8px;
      
      .el-button {
        flex: 1;
        max-width: 100px;
        font-size: 13px;
      }
    }
  }

  // 参数分组移动端适配
  .param-groups {
    .param-group {
      margin-bottom: 16px;
      
      .group-header {
        padding: 12px 16px;
        font-size: 14px;
        
        .group-count {
          font-size: 11px;
        }
      }
      
      .group-content {
        padding: 8px;
        
        .el-checkbox-group {
          grid-template-columns: 1fr; // 移动端单列显示
          gap: 8px;
          
          .param-checkbox {
            :deep(.el-checkbox__label) {
              padding: 10px 12px;
              font-size: 13px;
              
              .param-name {
                font-size: 13px;
              }
              
              .param-unit {
                font-size: 11px;
              }
            }
          }
        }
      }
    }
  }

  // 对话框底部移动端适配
  .dialog-footer {
    flex-direction: column-reverse;
    gap: 8px;
    
    .el-button {
      width: 100%;
      margin-left: 0 !important;
      font-size: 14px;
      padding: 10px;
    }
  }
}
</style>
