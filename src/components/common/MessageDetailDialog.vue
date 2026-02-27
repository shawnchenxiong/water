<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
    :before-close="handleClose"
    class="message-detail-dialog"
  >
    <div v-if="message" class="message-detail-container">
      <!-- 消息头部信息 -->
      <div class="message-header">
        <div class="message-meta">
          <el-tag :type="getMessageTypeTag(message.msgCategory)" size="small">
            {{ getMessageTypeLabel(message.msgCategory) }}
          </el-tag>
          <span class="message-time">{{ message.sendTime || '' }}</span>
          <span class="message-publisher">{{ message.sender || '系统' }}</span>
          <el-tag
            v-if="message.readFlag === '0' || message.readFlag === 0"
            type="primary"
            size="small"
          >
            未读
          </el-tag>
        </div>
        
        <!-- 优先级 -->
        <div v-if="message.priority" class="priority">
          <el-tag :type="getPriorityTag(message.priority)" size="small">
            {{ getPriorityLabel(message.priority) }}
          </el-tag>
        </div>
      </div>

      <!-- 消息标题 -->
      <div class="message-title">
        <h3>{{ message.titile }}</h3>
      </div>

      <!-- 消息内容 -->
      <div class="message-content">
        <div class="content-text">
          {{ message.msgContent }}
        </div>
        
        <!-- 附件（仅公告消息可能有附件） -->
        <div v-if="'attachments' in message && message.attachments?.length" class="attachments">
          <h4>附件：</h4>
          <div class="attachment-list">
            <div
              v-for="(attachment, index) in message.attachments"
              :key="index"
              class="attachment-item"
            >
              <el-icon><Document /></el-icon>
              <span class="attachment-name">{{ attachment }}</span>
              <el-button type="primary" size="small" text>下载</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 扩展信息 -->
      <div class="message-extra">
        <div class="info-section">
          <div class="info-item">
            <span class="label">消息ID：</span>
            <span class="value">{{ message.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">发送时间：</span>
            <span class="value">{{ message.sendTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">发送人：</span>
            <span class="value">{{ message.sender }}</span>
          </div>
          <div class="info-item">
            <span class="label">消息类型：</span>
            <span class="value">{{ getMessageTypeLabel(message.msgCategory) }}</span>
          </div>
          <div class="info-item">
            <span class="label">优先级：</span>
            <span class="value">{{ getPriorityLabel(message.priority) }}</span>
          </div>
          <div class="info-item">
            <span class="label">阅读状态：</span>
            <span class="value">{{ message.readFlag === '0' || message.readFlag === 0 ? '未读' : '已读' }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          v-if="message && (message.readFlag === '0' || message.readFlag === 0)"
          type="primary"
          @click="handleMarkAsRead"
        >
          标记为已读
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import type { Message, MessageType } from '@/api/types/message-center'
import { markMessageAsRead } from '@/api/common/messageCenterApi'

// Props
interface Props {
  modelValue: boolean
  message: Message | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  message: null
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'read', messageId: string): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算属性
const dialogTitle = computed(() => {
  if (!props.message) return '消息详情'
  return `${getMessageTypeLabel(props.message.msgCategory)}详情`
})

// 方法
const handleClose = () => {
  visible.value = false
}

const handleMarkAsRead = async () => {
  if (!props.message) return
  
  try {
    await markMessageAsRead(props.message.id)
    emit('read', props.message.id)
    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 获取消息类型标签
const getMessageTypeTag = (msgCategory: string): string => {
  const tagMap: Record<string, string> = {
    '1': 'primary',  // 通知公告
    '2': 'info',     // 系统消息
    '3': 'danger',   // 告警消息
  }
  return tagMap[msgCategory] || 'info'
}

// 获取消息类型标签文本
const getMessageTypeLabel = (msgCategory: string): string => {
  const labelMap: Record<string, string> = {
    '1': '通知公告',
    '2': '系统消息',
    '3': '告警消息',
  }
  return labelMap[msgCategory] || '未知消息'
}

// 获取告警级别标签
const getAlarmLevelTag = (level: string): string => {
  const tagMap = {
    info: 'info',
    warning: 'warning',
    error: 'danger',
    critical: 'danger'
  }
  return tagMap[level] || 'info'
}

// 获取告警级别标签文本
const getAlarmLevelLabel = (level: string): string => {
  const labelMap = {
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重'
  }
  return labelMap[level] || '未知'
}

// 获取优先级标签
const getPriorityTag = (priority: string): string => {
  const tagMap: Record<string, string> = {
    'L': 'info',
    'M': 'warning',
    'H': 'danger'
  }
  return tagMap[priority] || 'info'
}

// 获取优先级标签文本
const getPriorityLabel = (priority: string): string => {
  const labelMap: Record<string, string> = {
    'L': '低',
    'M': '中',
    'H': '高'
  }
  return labelMap[priority] || '未知'
}
</script>

<style scoped lang="scss">
.message-detail-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.message-detail-container {
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .message-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .message-time {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
      
      .message-publisher {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }
  }
  
  .message-title {
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
    }
  }
  
  .message-content {
    margin-bottom: 20px;
    
    .content-text {
      color: var(--el-text-color-regular);
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .attachments {
      margin-top: 20px;
      
      h4 {
        margin: 0 0 10px 0;
        color: var(--el-text-color-primary);
        font-size: 14px;
        font-weight: 600;
      }
      
      .attachment-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .attachment-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background-color: var(--el-fill-color-lighter);
        border-radius: 4px;
        
        .attachment-name {
          flex: 1;
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }
    }
  }
  
  .message-extra {
    .station-info,
    .workorder-info,
    .category-info {
      padding: 15px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 6px;
      margin-bottom: 15px;
      
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          min-width: 80px;
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
        
        .value {
          color: var(--el-text-color-primary);
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
