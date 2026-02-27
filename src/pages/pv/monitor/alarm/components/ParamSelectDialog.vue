<template>
  <el-dialog
    v-model="visible"
    title="参数选择"
    :width="isMobile ? '95%' : '600px'"
    :top="isMobile ? '2vh' : '15vh'"
    :close-on-click-modal="false"
    destroy-on-close
    class="param-select-dialog"
  >
    <div class="param-select-container" v-loading="loading">
      <div class="dialog-content">
        <!-- 参数选择面板 -->
        <div class="param-panel">
          <div class="param-list">
            <el-checkbox-group v-model="selectedParams">
              <el-checkbox
                v-for="param in allParams"
                :key="param.value"
                :label="param.value"
                class="param-checkbox"
              >
                {{ param.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleRestoreDefault">恢复默认</el-button>
        <el-button @click="handleClearSelection">清空选择</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getHistoryDataParameters } from '@/api/alarm/history'
import type { HistoryDataParameter } from '@/api/types/alarm/history'
import dayjs from 'dayjs'

interface Props {
  visible: boolean
  deviceId: string
  selectedParams?: string[]
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', params: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedParams: () => []
})

const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const allParams = ref<HistoryDataParameter[]>([])
const selectedParams = ref<string[]>([])

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}


// 默认选中的参数（可以根据需要调整）
const defaultParams = ref<string[]>([])

/**
 * 加载参数列表
 */
const loadParameters = async () => {
  if (!props.deviceId) return

  loading.value = true
  try {
    const response = await getHistoryDataParameters(props.deviceId)
    if (response.success && response.code === 200) {
      allParams.value = response.result || []
      
      // 设置默认参数（前两个）
      if (allParams.value.length > 0) {
        const defaultCount = Math.min(2, allParams.value.length)
        defaultParams.value = allParams.value.slice(0, defaultCount).map(p => p.value)
      }
      
      // 如果有传入的选中参数，使用传入的；否则使用默认的
      if (props.selectedParams.length > 0) {
        selectedParams.value = [...props.selectedParams]
      } else {
        // 使用默认参数
        selectedParams.value = [...defaultParams.value]
      }
    } else {
      ElMessage.error(response.message || '加载参数列表失败')
    }
  } catch (error: any) {
    console.error('加载参数列表失败:', error)
    ElMessage.error('加载参数列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 恢复默认
 */
const handleRestoreDefault = () => {
  selectedParams.value = [...defaultParams.value]
}

/**
 * 清空选择
 */
const handleClearSelection = () => {
  selectedParams.value = []
}

/**
 * 确认
 */
const handleConfirm = () => {
  if (selectedParams.value.length === 0) {
    ElMessage.warning('请至少选择一个参数')
    return
  }
  
  emit('confirm', [...selectedParams.value])
  visible.value = false
}

// 监听弹窗显示
watch(visible, (newVal) => {
  if (newVal) {
    loadParameters()
  }
})

// 初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.param-select-dialog {
  :deep(.el-dialog) {
    background: rgba(10, 30, 50, 0.95);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    
    .el-dialog__header {
      background: rgba(0, 212, 255, 0.1);
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
      padding: 16px 20px;
      
      .el-dialog__title {
        color: #00d4ff;
        font-size: 16px;
        font-weight: 600;
      }
      
      .el-dialog__headerbtn {
        .el-dialog__close {
          color: rgba(255, 255, 255, 0.8);
          
          &:hover {
            color: #00d4ff;
          }
        }
      }
    }
    
    .el-dialog__body {
      padding: 20px;
      background: rgba(10, 30, 50, 0.6);
    }
    
    .el-dialog__footer {
      background: rgba(0, 212, 255, 0.05);
      border-top: 1px solid rgba(0, 212, 255, 0.2);
      padding: 16px 20px;
    }
  }
}

.param-select-container {
  max-height: 60vh;
}

.dialog-content {
  height: 100%;
}

.param-panel {
  display: flex;
  flex-direction: column;
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  
  .param-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    
    :deep(.el-checkbox-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .param-checkbox {
      margin: 0;
      
      :deep(.el-checkbox__label) {
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
        padding-left: 8px;
      }
      
      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #00d4ff;
        border-color: #00d4ff;
      }
      
      :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
        color: #00d4ff;
      }
      
      :deep(.el-checkbox__inner) {
        border-color: rgba(0, 212, 255, 0.5);
        background-color: rgba(10, 30, 50, 0.6);
        
        &:hover {
          border-color: #00d4ff;
        }
      }
    }
  }
  
  // 自定义滚动条
  .param-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .param-list::-webkit-scrollbar-track {
    background: rgba(10, 30, 50, 0.4);
    border-radius: 3px;
  }
  
  .param-list::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.5);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  
  :deep(.el-button) {
    min-width: 100px;
    
    &:not(.el-button--primary) {
      background: rgba(0, 212, 255, 0.1);
      border-color: rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.85);
      
      &:hover {
        background: rgba(0, 212, 255, 0.2);
        border-color: #00d4ff;
        color: #fff;
      }
    }
    
    &.el-button--primary {
      background: #00d4ff;
      border-color: #00d4ff;
      color: #fff;
      
      &:hover {
        background: #39b6f7;
        border-color: #39b6f7;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .param-select-container {
    max-height: 50vh;
  }
  
  .param-panel {
    .param-list {
      max-height: 40vh;
    }
  }
  
  .dialog-footer {
    flex-direction: column-reverse;
    
    :deep(.el-button) {
      width: 100%;
      margin-left: 0 !important;
    }
  }
}
</style>

