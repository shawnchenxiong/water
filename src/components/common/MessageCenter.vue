<template>
  <el-dialog
    v-model="visible"
    title="消息中心"
    :width="isMobile ? '95%' : '1200px'"
    :top="isMobile ? '2vh' : '5vh'"
    :before-close="handleClose"
    class="message-center-dialog"
    :class="{ 'mobile-dialog': isMobile }"
    :z-index="3000"
    :append-to-body="true"
    :modal="true"
  >
    <div class="message-center-container">
      <!-- 标签页 -->
      <el-tabs
        v-model="activeTab"
        type="card"
        class="message-tabs"
        @tab-change="handleTabChange"
      >
        <el-tab-pane
          v-for="tab in messageTabs"
          :key="tab.key"
          :name="tab.key"
          :label="`${tab.label}${tab.count > 0 ? ` (${tab.count})` : ''}`"
        />
      </el-tabs>

      <!-- 操作栏 -->
      <div class="message-actions">
        <div class="left-actions">
          <el-button
            v-if="unreadCount > 0"
            type="primary"
            size="small"
            @click="handleMarkAllAsRead"
          >
            全部标记为已读
          </el-button>
          <el-button
            size="small"
            @click="handleRefresh"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        <div class="right-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索消息..."
            size="small"
            style="width: 200px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="search-icon" @click="handleSearch">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="message-list" v-loading="loading">
        <el-table
          :data="messageList"
          stripe
          @row-click="handleRowClick"
          class="message-table"
        >
          <el-table-column width="60" align="center">
            <template #default="{ row }">
              <div class="message-status">
                <el-badge
                  v-if="row.readFlag === '0' || row.readFlag === 0"
                  is-dot
                  type="primary"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="titile"
            label="标题"
            min-width="300"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="message-title" :class="{ 'unread': row.readFlag === '0' || row.readFlag === 0 }">
                {{ row.titile }}
              </div>
            </template>
          </el-table-column>

          <el-table-column
            label="发布时间"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatMessageTime(row) }}
            </template>
          </el-table-column>

          <el-table-column
            label="发布人"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              {{ row.sender || '系统' }}
            </template>
          </el-table-column>

          <el-table-column
            label="类型"
            width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-tag :type="getMessageTypeTag(row.msgCategory)" size="small">
                {{ getMessageTypeLabel(row.msgCategory) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                text
                @click.stop="handleViewDetail(row)"
              >
                查看
              </el-button>
              <el-button
                v-if="row.readFlag === '0' || row.readFlag === 0"
                type="success"
                size="small"
                text
                @click.stop="handleMarkAsRead(row)"
              >
                标记已读
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <div v-if="!loading && messageList.length === 0" class="empty-state">
          <el-empty description="暂无数据" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 消息详情弹窗 -->
    <MessageDetailDialog
      v-model="detailDialogVisible"
      :message="selectedMessage"
      @read="handleMessageRead"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import type {
  Message,
  MessageTab,
  MessageType,
  MessageQueryParams
} from '@/api/types/message-center'
import {
  getMessageList,
  getMessageTabs,
  markMessageAsRead,
  markAllMessagesAsRead
} from '@/api/common/messageCenterApi'
import MessageDetailDialog from './MessageDetailDialog.vue'

// Props
interface Props {
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const activeTab = ref<string>('all')
const searchKeyword = ref('')
const messageList = ref<Message[]>([])
const messageTabs = ref<MessageTab[]>([])
const selectedMessage = ref<Message | null>(null)
const detailDialogVisible = ref(false)

// 移动端响应式状态
const isMobile = ref(false)

// 响应式检测
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 计算属性
const unreadCount = computed(() => {
  return messageList.value.filter(msg => msg.readFlag === '0' || msg.readFlag === 0).length
})

// 方法
const handleClose = () => {
  visible.value = false
}

const handleTabChange = (tabName: string | number) => {
  activeTab.value = String(tabName)
  pagination.page = 1
  loadMessageList()
}

const handleSearch = () => {
  pagination.page = 1
  loadMessageList()
}

const handleRefresh = () => {
  loadMessageList()
  loadMessageTabs()
}

const handleMarkAllAsRead = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将所有消息标记为已读吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用全部已读接口，不需要传递参数
    await markAllMessagesAsRead()
    
    ElMessage.success('操作成功')
    loadMessageList()
    loadMessageTabs()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleRowClick = (row: Message) => {
  handleViewDetail(row)
}

const handleViewDetail = (message: Message) => {
  selectedMessage.value = message
  detailDialogVisible.value = true
  
  // 如果是未读消息，自动标记为已读
  if (message.readFlag === '0' || message.readFlag === 0) {
    handleMarkAsRead(message)
  }
}

const handleMarkAsRead = async (message: Message) => {
  try {
    await markMessageAsRead(message.id)
    // 刷新列表以获取最新状态
    await loadMessageList()
    loadMessageTabs()
    ElMessage.success( '已标记为已读')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleMessageRead = (messageId: string) => {
  const message = messageList.value.find(msg => msg.id === messageId)
  if (message) {
    message.readFlag = '1'
    loadMessageTabs()
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadMessageList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadMessageList()
}

// 加载消息列表
const loadMessageList = async () => {
  try {
    loading.value = true
    
    const params: MessageQueryParams = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    }
    
    // 只有非"全部"标签才传type参数
    if (activeTab.value !== 'all') {
      params.type = Number(activeTab.value)  // 1, 2, 3
    }
    
    const response = await getMessageList(params)
    messageList.value = response.list
    pagination.total = response.total
  } catch (error) {
    ElMessage.error('加载消息列表失败')
  } finally {
    loading.value = false
  }
}

// 加载消息标签页
const loadMessageTabs = async () => {
  try {
    messageTabs.value = await getMessageTabs()
  } catch (error) {
    ElMessage.error('加载消息标签失败')
  }
}

// 格式化消息时间
const formatMessageTime = (message: Message): string => {
  return message.sendTime || ''
}

// 获取消息类型标签
const getMessageTypeTag = (msgCategory: string): 'primary' | 'danger' | 'info' | 'warning' => {
  const tagMap: Record<string, 'primary' | 'danger' | 'info' | 'warning'> = {
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
  return labelMap[msgCategory] || '未知'
}

// 监听弹窗显示状态
watch(visible, (newVal) => {
  if (newVal) {
    loadMessageTabs()
    loadMessageList()
  }
})

// 组件挂载
onMounted(() => {
  // 初始化移动端检测
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  if (visible.value) {
    loadMessageTabs()
    loadMessageList()
  }
})

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.message-center-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.message-center-container {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.message-tabs {
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
  z-index: 1;
  
}

.message-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  
  .left-actions {
    display: flex;
    gap: 10px;
  }
  
  .search-icon {
    cursor: pointer;
    color: var(--el-text-color-placeholder);
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.message-list {
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
  
  .message-table {
    :deep(.el-table__row) {
      cursor: pointer;
      
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }
  
  .message-status {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .message-title {
    &.unread {
      font-weight: bold;
      color: var(--el-text-color-primary);
    }
  }
  
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }
}

.pagination-section {
  padding: 15px 20px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: center;
}

/* 移动端适配 */
.message-center-dialog.mobile-dialog {
  :deep(.el-dialog) {
    margin: 0 !important;
    height: 96vh;
    max-height: 96vh;
    border-radius: 8px 8px 0 0;
  }
  
  :deep(.el-dialog__header) {
    padding: 16px 20px 12px;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
    }
    
    .el-dialog__headerbtn {
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      
      .el-dialog__close {
        font-size: 18px;
      }
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
    height: calc(96vh - 60px);
    overflow: hidden;
  }
  
  .message-center-container {
    height: 100%;
    max-height: none;
    
    // 移动端调整容器高度
    @media (max-width: 768px) {
      height: calc(96vh - 60px);
    }
  }
  
  .message-tabs {
    padding: 0 16px;
    position: relative;
    z-index: 1;

  }
  
  .message-actions {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
    
    .left-actions {
      flex: 1;
      min-width: 0;
      
      .el-button {
        font-size: 13px;
        padding: 6px 12px;
        height: 32px;
      }
    }
    
    .right-actions {
      .el-input {
        width: 160px !important;
        
        :deep(.el-input__wrapper) {
          font-size: 13px;
          height: 32px;
        }
      }
    }
  }
  
  .message-list {
    padding: 0 16px;
    
    .message-table :deep(.el-table) {
      font-size: 13px;
      
      .el-table__header th {
        padding: 8px 4px;
        font-size: 12px;
      }
      
      .el-table__body td {
        padding: 8px 4px;
      }
      
      .cell {
        line-height: 1.4;
      }
    }
    
    .empty-state {
      height: 150px;
      
      :deep(.el-empty) {
        .el-empty__image {
          width: 80px;
        }
        
        .el-empty__description {
          font-size: 13px;
        }
      }
    }
  }
  
  .pagination-section {
    padding: 12px 16px;
    
    :deep(.el-pagination) {
      --el-pagination-font-size: 12px;
      
      .el-pagination__total,
      .el-pagination__jump {
        display: none;
      }
      
      .el-pagination__sizes {
        .el-select .el-select__wrapper {
          font-size: 12px;
          height: 28px;
        }
      }
      
      .el-pager li {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
      }
      
      .btn-prev,
      .btn-next {
        width: 28px;
        height: 28px;
        line-height: 28px;
      }
    }
  }
}

@media (max-width: 480px) {
  .message-center-dialog.mobile-dialog {
    :deep(.el-dialog) {
      height: 98vh;
      border-radius: 0;
    }
    
    .message-actions {
      flex-direction: column;
      padding: 10px 12px;
      
      .left-actions,
      .right-actions {
        width: 100%;
      }
      
      .right-actions .el-input {
        width: 100% !important;
      }
    }
    
    .message-list {
      padding: 0 12px;
      
      .message-table :deep(.el-table) {
        .el-table__body td {
          padding: 6px 2px;
        }
        
        .cell {
          font-size: 12px;
        }
      }
    }
    
    .pagination-section {
      padding: 10px 12px;
      
      :deep(.el-pagination) {
        .el-pagination__sizes {
          display: none;
        }
      }
    }
  }
}
</style>
