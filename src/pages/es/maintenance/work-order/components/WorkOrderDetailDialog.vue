<template>
  <el-dialog
    v-model="visible"
    title="工单详情"
    :width="isMobile ? '95%' : '800px'"
    :top="isMobile ? '2vh' : '15vh'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="workOrderInfo" class="work-order-detail">
      <!-- 基本信息 -->
      <div class="section">
        <h4>基本信息</h4>
        <el-descriptions :column="isMobile ? 1 : 2" border>
          <el-descriptions-item label="工单编号">
            {{ workOrderInfo.workOrderNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="工单类型">
            {{ workOrderInfo.workOrderType }}
          </el-descriptions-item>
          <el-descriptions-item label="电站名称">
            {{ workOrderInfo.stationName }}
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag
              :type="getPriorityType(workOrderInfo.priority)"
              size="small"
            >
              {{ workOrderInfo.priority }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :color="workOrderInfo.statusColor" size="small">
              {{ workOrderInfo.flowStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前处理人">
            {{ workOrderInfo.currentProcessor }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ workOrderInfo.creator }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ workOrderInfo.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="计划完成时间">
            {{ workOrderInfo.plannedCompletionTime }}
          </el-descriptions-item>
          <el-descriptions-item label="实际完成时间">
            {{ workOrderInfo.actualCompletionTime || '未完成' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 工单描述 -->
      <div class="section">
        <h4>工单描述</h4>
        <div class="description-content">
          {{ workOrderInfo.workOrderDescription }}
        </div>
      </div>

      <!-- 对象信息 -->
      <div v-if="workOrderInfo.workOrderObjects?.length" class="section">
        <h4>对象信息</h4>
        <el-table
          :data="workOrderInfo.workOrderObjects"
          border
          style="width: 100%"
        >
          <el-table-column prop="objectType" label="对象类型" width="120" />
          <el-table-column prop="objectName" label="对象名称" />
          <el-table-column prop="objectId" label="对象ID" width="150" />
          <el-table-column prop="description" label="描述" />
        </el-table>
      </div>

      <!-- 流转记录 -->
      <div class="section">
        <h4>流转记录</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in workOrderInfo.flowRecords"
            :key="index"
            :timestamp="record.processTime"
            :color="getFlowStatusColor(record.action)"
          >
            <div class="flow-record">
              <div class="flow-header">
                <span class="processor">{{ record.processor }}</span>
                <el-tag :type="getFlowActionType(record.action)" size="small">
                  {{ record.action }}
                </el-tag>
              </div>
              <div v-if="record.comment" class="flow-comment">
                {{ record.comment }}
              </div>
              <div v-if="record.attachments?.length" class="flow-attachments">
                <span>附件：</span>
                <el-link
                  v-for="attachment in record.attachments"
                  :key="attachment"
                  type="primary"
                  :underline="false"
                  @click="handleDownloadAttachment(attachment)"
                >
                  {{ attachment }}
                </el-link>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <div v-else class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWorkOrderDetail } from '@/api/maintenance/workOrderApi'
import type { WorkOrder } from '@/api/types/work-order'

interface Props {
  modelValue: boolean
  workOrderId: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 工单信息
const workOrderInfo = ref<WorkOrder | null>(null)

/**
 * 获取优先级类型
 */
const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info',
  }
  return typeMap[priority] || 'info'
}

/**
 * 获取流转状态颜色
 */
const getFlowStatusColor = (action: string) => {
  const colorMap: Record<string, string> = {
    '创建': '#409eff',
    '审批通过': '#67c23a',
    '驳回': '#f56c6c',
    '完成': '#00d4ff',
    '转派': '#e6a23c',
  }
  return colorMap[action] || '#909399'
}

/**
 * 获取流转动作类型
 */
const getFlowActionType = (action: string) => {
  const typeMap: Record<string, string> = {
    '创建': 'info',
    '审批通过': 'success',
    '驳回': 'danger',
    '完成': 'success',
    '转派': 'warning',
  }
  return typeMap[action] || 'info'
}

/**
 * 下载附件
 */
const handleDownloadAttachment = (filename: string) => {
  // 模拟下载附件
  ElMessage.info(`正在下载附件：${filename}`)
}

/**
 * 加载工单详情
 */
const loadWorkOrderDetail = async () => {
  if (!props.workOrderId) return

  try {
    workOrderInfo.value = null
    const workOrder = await getWorkOrderDetail(props.workOrderId)
    workOrderInfo.value = workOrder as WorkOrder
  } catch (error) {
    ElMessage.error('Failed to load work order detail')
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  workOrderInfo.value = null
  visible.value = false
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.workOrderId) {
      loadWorkOrderDetail()
    }
  }
)
</script>

<style scoped lang="scss">
.work-order-detail {
  .section {
    margin-bottom: 24px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      margin-bottom: 12px;
      border-bottom: 1px solid #333;
      padding-bottom: 8px;
    }
  }

  .description-content {
    padding: 12px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    line-height: 1.6;
    color: #e5eaf3;
  }

  .flow-record {
    .flow-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .processor {
        font-weight: 600;
        color: #00d4ff;
      }
    }

    .flow-comment {
      color: #e5eaf3;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .flow-attachments {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      span {
        color: #909399;
        font-size: 12px;
      }
    }
  }
}

.loading {
  padding: 20px;
}

:deep(.el-descriptions) {
  .el-descriptions__header {
    .el-descriptions__title {
      color: #ffffff;
    }
  }

  .el-descriptions__body {
    .el-descriptions__table {
      .el-descriptions__cell {
        background-color: transparent;
      }
    }
  }
}

:deep(.el-timeline) {
  .el-timeline-item__timestamp {
    color: #909399;
  }
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
  
  .work-order-detail {
    .section {
      margin-bottom: 16px;
      
      h4 {
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      :deep(.el-descriptions) {
        font-size: 12px;
        
        .el-descriptions__label {
          font-size: 12px;
          width: 80px;
        }
        
        .el-descriptions__content {
          font-size: 12px;
        }
      }
    }
    
    .flow-history {
      :deep(.el-timeline) {
        .el-timeline-item {
          padding-bottom: 12px;
          
          .el-timeline-item__wrapper {
            .el-timeline-item__content {
              font-size: 12px;
              line-height: 1.4;
            }
            
            .el-timeline-item__timestamp {
              font-size: 11px;
            }
          }
        }
      }
    }
    
    .attachments {
      .attachment-list {
        .attachment-item {
          padding: 8px;
          font-size: 12px;
          
          .attachment-name {
            font-size: 12px;
          }
          
          .attachment-size {
            font-size: 11px;
          }
          
          .attachment-actions {
            .el-button {
              font-size: 11px;
              padding: 4px 8px;
            }
          }
        }
      }
    }
  }
}
</style>
