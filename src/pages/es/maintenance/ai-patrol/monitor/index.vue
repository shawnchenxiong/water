<template>
  <div class="ai-patrol-monitor">
    <div class="monitor-container">
      <!-- 上半部分 -->
      <div class="monitor-top">
        <!-- 左侧：巡检任务列表 -->
        <div class="left-panel">
          <div class="panel-header">巡检任务列表</div>
          <div class="panel-body">
            <!-- 搜索框 -->
            <el-input
              v-model="searchKeyword"
              placeholder="请输入"
              clearable
              class="search-input"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <!-- 任务列表 -->
            <div class="task-list">
              <div
                v-for="task in filteredTasks"
                :key="task.id"
                class="task-item"
                :class="{ active: selectedTask?.id === task.id }"
                @click="handleSelectTask(task)"
              >
                <div class="task-name">{{ task.taskName }}</div>
                <div class="task-status">
                  <el-tag
                    :color="getTaskStatusColor(task.taskStatus)"
                    size="small"
                  >
                    {{ task.taskStatus }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 状态筛选 -->
            <div class="status-filter">
              <div class="filter-item">
                <span class="dot running"></span>
                <span>执行中</span>
              </div>
              <div class="filter-item">
                <span class="dot waiting"></span>
                <span>待执行</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button type="primary" :disabled="!selectedTask" size="small">
                执行任务
              </el-button>
              <el-button :disabled="!selectedTask || selectedTask?.taskStatus !== '执行中'" size="small">
                停止任务
              </el-button>
            </div>
          </div>
        </div>

        <!-- 中间：巡检任务单 -->
        <div class="task-detail-panel">
          <div class="panel-header">巡检任务单</div>
          <div class="panel-body">
            <div v-if="selectedTask" class="task-detail">
              <!-- 第一行：4个字段 -->
              <div class="detail-row multi-col col-4">
                <div class="detail-item">
                  <span class="label">任务名称：</span>
                  <span class="value">{{ selectedTask.taskName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">任务类型：</span>
                  <span class="value">{{ selectedTask.taskType }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">执行模式：</span>
                  <span class="value">{{ selectedTask.executeMode }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">任务状态：</span>
                  <span class="value">{{ selectedTask.taskStatus }}</span>
                </div>
              </div>

              <!-- 第二行：进度条 -->
              <div class="detail-row progress-row">
                <span class="label">总进度：</span>
                <el-progress
                  :percentage="selectedTaskProgress"
                  :stroke-width="10"
                  :color="progressColor"
                />
              </div>

              <!-- 第三行：2个字段 -->
              <div class="detail-row multi-col col-2">
                <div class="detail-item">
                  <span class="label">启动原因：</span>
                  <span class="value">定时任务</span>
                </div>
                <div class="detail-item">
                  <span class="label">启动时间：</span>
                  <span class="value">{{ selectedTask.lastExecuteTime }}</span>
                </div>
              </div>

              <!-- 统计信息 -->
              <div class="target-stats">
                <span class="stats-title">本次巡检目标：</span>
                <span class="stats-content">
                  共 {{ selectedTaskStats.total }} 个，已完成 {{ selectedTaskStats.completed }} 个，剩余 {{ selectedTaskStats.remaining }} 个
                </span>
              </div>
            </div>
            <div v-else class="no-task">
              <el-empty description="请选择巡检任务" />
            </div>
          </div>
        </div>

        <!-- 右侧上部：视频监控 -->
        <div class="video-panel">
          <div class="video-placeholder">
            <el-icon :size="60"><VideoCamera /></el-icon>
            <div class="video-text">视频监控</div>
          </div>
        </div>
      </div>

      <!-- 下半部分 -->
      <div class="monitor-bottom">
        <!-- 左侧：实时信息表格 -->
        <div class="table-panel">
          <div class="table-header">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
              <el-tab-pane label="实时信息" name="realtime" />
              <el-tab-pane label="告警信息" name="alarm" />
            </el-tabs>
          </div>

          <div class="table-body">
            <el-table
              v-loading="tableLoading"
              :data="tableData"
              border
              style="width: 100%"
            >
              <el-table-column prop="time" label="巡检时间" width="180" align="center" />
              <el-table-column prop="location" label="设备位置" min-width="120" />
              <el-table-column prop="deviceName" label="设备名称" min-width="150" />
              <el-table-column prop="pointName" label="点位名称" min-width="120" />
              <el-table-column prop="result" label="巡检结果" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :color="getResultColor(row.result)" size="small">
                    {{ row.result }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="auditStatus" label="审核状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :color="getAuditStatusColor(row.auditStatus)" size="small">
                    {{ row.auditStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleView(row)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="table-footer">
            <div class="record-count">共 {{ pagination.total }} 条</div>
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              :layout="paginationLayout"
              :pager-count="isMobile ? 3 : 7"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>

        <!-- 右侧：巡检图片 -->
        <div class="image-panel">
          <div class="panel-header">
            <el-icon><Picture /></el-icon>
            <span>巡检图片</span>
          </div>
          <div class="image-content">
            <el-empty description="暂无巡检图片" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, VideoCamera, Picture } from '@element-plus/icons-vue'
import { getPatrolTasks, getPatrolMonitorTableData } from '@/api/aiPatrolApi'
import type { PatrolTaskRecord, PatrolMonitorTableRecord } from '@/api/types/ai-patrol'

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 搜索关键字
const searchKeyword = ref('')

// 任务列表
const tasks = ref<PatrolTaskRecord[]>([])

// 筛选后的任务列表
const filteredTasks = computed(() => {
  if (!searchKeyword.value) {
    return tasks.value
  }
  return tasks.value.filter(task => 
    task.taskName.includes(searchKeyword.value)
  )
})

// 选中的任务
const selectedTask = ref<PatrolTaskRecord | null>(null)

// 选中任务的进度
const selectedTaskProgress = computed(() => {
  if (!selectedTask.value) return 0
  // 根据任务状态返回进度
  switch (selectedTask.value.taskStatus) {
    case '执行中':
      return 45 // 示例进度
    case '已完成':
      return 100
    case '待执行':
      return 0
    case '已暂停':
      return 30
    default:
      return 0
  }
})

// 选中任务的统计数据
const selectedTaskStats = computed(() => {
  const progress = selectedTaskProgress.value
  const total = 100
  const completed = Math.floor(total * progress / 100)
  const remaining = total - completed
  
  return {
    total,
    completed,
    remaining
  }
})

// 进度条颜色
const progressColor = computed(() => {
  const progress = selectedTaskProgress.value
  if (progress < 30) return '#f59e0b'
  if (progress < 70) return '#3498db'
  return '#27ae60'
})

/**
 * 获取任务状态颜色
 */
const getTaskStatusColor = (status: string) => {
  switch (status) {
    case '执行中':
      return '#27ae60' // 绿色
    case '待执行':
      return '#e67e22' // 橙色
    case '已完成':
      return '#3498db' // 蓝色
    case '已暂停':
      return '#95a5a6' // 灰色
    default:
      return '#95a5a6'
  }
}

/**
 * 选择任务
 */
const handleSelectTask = (task: PatrolTaskRecord) => {
  selectedTask.value = task
  // 加载该任务的实时信息
  loadTableData()
}

// Tab切换
const activeTab = ref('realtime')
const handleTabChange = () => {
  loadTableData()
}

// 表格数据
const tableData = ref<PatrolMonitorTableRecord[]>([])
const tableLoading = ref(false)

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value
    ? 'total, prev, pager, next'
    : 'total, sizes, prev, pager, next, jumper'
})

/**
 * 获取巡检结果颜色
 */
const getResultColor = (result: string) => {
  return result === '正常' ? '#27ae60' : '#ef4444'
}

/**
 * 获取审核状态颜色
 */
const getAuditStatusColor = (status: string) => {
  return status === '已审核' ? '#27ae60' : '#e67e22'
}

/**
 * 加载任务列表
 */
const loadTasks = async () => {
  try {
    const response = await getPatrolTasks({
      current: 1,
      pageSize: 100
    })
    
    if (response.code === 200) {
      tasks.value = response.data.records
      // 默认选中第一个任务
      if (tasks.value.length > 0) {
        selectedTask.value = tasks.value[0]
      }
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
  }
}

/**
 * 加载表格数据
 */
const loadTableData = async () => {
  if (!selectedTask.value) {
    tableData.value = []
    pagination.value.total = 0
    return
  }

  tableLoading.value = true
  try {
    const response = await getPatrolMonitorTableData({
      taskId: selectedTask.value.id,
      dataType: activeTab.value as 'realtime' | 'alarm',
      current: pagination.value.current,
      pageSize: pagination.value.pageSize
    })
    
    if (response.code === 200) {
      tableData.value = response.data.records
      pagination.value.total = response.data.total
    }
  } catch (error) {
    console.error('加载表格数据失败:', error)
    tableData.value = []
    pagination.value.total = 0
  } finally {
    tableLoading.value = false
  }
}

/**
 * 查看详情
 */
const handleView = (row: PatrolMonitorTableRecord) => {
  console.log('查看详情:', row)
}

/**
 * 分页大小变化
 */
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
  loadTableData()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (page: number) => {
  pagination.value.current = page
  loadTableData()
}

// 组件挂载
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  
  await loadTasks()
  loadTableData()
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.ai-patrol-monitor {
  height: 100%;
  padding: 16px;
  background-color: rgba(10, 22, 40, 0.5);
  box-sizing: border-box;
}

.monitor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

// 上半部分
.monitor-top {
  display: grid;
  grid-template-columns: 240px 1fr 360px;
  gap: 16px;
  height: calc(55% + 10px);
}

// 下半部分
.monitor-bottom {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  flex: 1;
}

// 左侧面板
.left-panel {
  background-color: rgba(13, 35, 68, 0.8);
  border: 1px solid rgba(24, 117, 183, 0.5);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-body {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(24, 117, 183, 0.5);
      border-radius: 3px;
    }
  }
}

.panel-header {
  padding: 12px 16px;
  background-color: rgba(24, 117, 183, 0.2);
  border-bottom: 1px solid rgba(24, 117, 183, 0.5);
  color: #00D4FF;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

// 搜索输入框
.search-input {
  margin-bottom: 12px;

  :deep(.el-input__wrapper) {
    background-color: rgba(0, 0, 0, 0.3);
    box-shadow: none;
  }
}

// 任务列表
.task-list {
  flex: 1;
  margin-bottom: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(24, 117, 183, 0.5);
    border-radius: 2px;
  }
}

.task-item {
  padding: 12px;
  margin-bottom: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(24, 117, 183, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.6);
    background-color: rgba(0, 212, 255, 0.1);
  }

  &.active {
    border-color: #00D4FF;
    background-color: rgba(0, 212, 255, 0.15);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
  }

  .task-name {
    color: #ffffff;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .task-status {
    display: flex;
    justify-content: flex-end;
  }
}

// 状态筛选
.status-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 12px;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.running {
        background-color: #27ae60;
        box-shadow: 0 0 6px rgba(39, 174, 96, 0.6);
      }

      &.waiting {
        background-color: #f59e0b;
        box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
      }
    }
  }
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
}

// 任务详情面板
.task-detail-panel {
  background-color: rgba(13, 35, 68, 0.8);
  border: 1px solid rgba(24, 117, 183, 0.5);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .panel-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(24, 117, 183, 0.5);
      border-radius: 3px;
    }
  }
}

.task-detail {
  color: rgba(255, 255, 255, 0.85);

  .detail-row {
    display: flex;
    margin-bottom: 10px;
    font-size: 13px;

    &.multi-col {
      gap: 16px;

      &.col-4 {
        .detail-item {
          flex: 1;
          min-width: 0;
        }
      }

      &.col-2 {
        .detail-item {
          flex: 1;
        }
      }

      .detail-item {
        display: flex;
        gap: 4px;

        .label {
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .value {
          color: #ffffff;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    &.progress-row {
      flex-direction: column;

      .label {
        margin-bottom: 6px;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  .target-stats {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    padding: 8px 10px;
    background-color: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 4px;

    .stats-title {
      color: #00D4FF;
      font-size: 12px;
      white-space: nowrap;
    }

    .stats-content {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
    }
  }
}

.no-task {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

// 表格面板
.table-panel {
  background-color: rgba(13, 35, 68, 0.8);
  border: 1px solid rgba(24, 117, 183, 0.5);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-header {
  padding: 0 16px;
  border-bottom: 1px solid rgba(24, 117, 183, 0.5);

  :deep(.el-tabs) {
    .el-tabs__header {
      margin: 0;
    }

    .el-tabs__nav-wrap::after {
      display: none;
    }

    .el-tabs__item {
      color: rgba(255, 255, 255, 0.6);

      &.is-active {
        color: #00D4FF;
      }

      &:hover {
        color: #00D4FF;
      }
    }

    .el-tabs__active-bar {
      background-color: #00D4FF;
    }
  }
}

.table-body {
  flex: 1;
  padding: 16px;
  overflow: auto;

  :deep(.el-table) {
    background-color: transparent;

    th,
    td {
      background-color: transparent;
      border-color: rgba(24, 117, 183, 0.3);
    }

    .el-table__header th {
      background-color: rgba(24, 117, 183, 0.2);
      color: #00D4FF;
    }

    .el-table__body tr {
      &:hover > td {
        background-color: rgba(0, 212, 255, 0.1);
      }
    }
  }
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid rgba(24, 117, 183, 0.5);

  .record-count {
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
  }
}

// 视频面板
.video-panel {
  background-color: rgba(13, 35, 68, 0.8);
  border: 1px solid rgba(24, 117, 183, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  .video-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);

    .el-icon {
      margin-bottom: 12px;
    }

    .video-text {
      font-size: 14px;
    }
  }
}

// 图片面板
.image-panel {
  background-color: rgba(13, 35, 68, 0.8);
  border: 1px solid rgba(24, 117, 183, 0.5);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .image-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
}

// 移动端适配
@media (max-width: 1024px) {
  .monitor-top {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
    gap: 12px;
  }

  .monitor-bottom {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 12px;
  }

  .left-panel {
    order: 1;
  }

  .task-detail-panel {
    order: 2;
  }

  .video-panel {
    order: 3;
    min-height: 200px;
  }

  .table-panel {
    order: 4;
  }

  .image-panel {
    order: 5;
    min-height: 200px;
  }
}

@media (max-width: 768px) {
  .ai-patrol-monitor {
    padding: 8px;
  }

  .monitor-container {
    gap: 8px;
  }

  .monitor-top,
  .monitor-bottom {
    gap: 8px;
  }

  // 左侧任务面板移动端优化
  .left-panel {
    .panel-body {
      padding: 12px;
    }

    .task-list {
      max-height: 200px; // 限制高度，避免占用太多空间
    }

    .task-item {
      padding: 8px 10px;
      margin-bottom: 6px;

      .task-name {
        font-size: 12px;
      }
    }

    .action-buttons {
      margin-top: 8px;
      padding-top: 8px;

      .el-button {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  }

  // 任务详情面板移动端优化
  .task-detail-panel {
    .panel-body {
      padding: 12px;
    }

    .task-detail {
      .detail-row {
        font-size: 12px;
        margin-bottom: 8px;

        &.multi-col {
          flex-direction: column;
          gap: 8px;

          &.col-4,
          &.col-2 {
            .detail-item {
              flex-direction: row;
              align-items: center;
              justify-content: space-between;

              .label {
                min-width: 80px;
                font-size: 11px;
              }

              .value {
                font-size: 12px;
                text-align: right;
              }
            }
          }
        }

        &.progress-row {
          .label {
            font-size: 11px;
            margin-bottom: 4px;
          }
        }
      }

      .target-stats {
        flex-direction: column;
        gap: 4px;
        padding: 6px 8px;

        .stats-title,
        .stats-content {
          font-size: 11px;
          text-align: center;
        }
      }
    }
  }

  // 视频面板移动端优化
  .video-panel {
    min-height: 160px;

    .video-placeholder {
      .el-icon {
        font-size: 40px;
      }

      .video-text {
        font-size: 12px;
        margin-top: 8px;
      }
    }
  }

  // 表格面板移动端优化
  .table-panel {
    .table-header {
      padding: 0 12px;

      :deep(.el-tabs__item) {
        font-size: 13px;
        padding: 0 12px;
      }
    }

    .table-body {
      padding: 8px 12px;
      overflow-x: auto;

      :deep(.el-table) {
        min-width: 600px; // 确保表格在移动端可以横向滚动
        font-size: 11px;

        .el-table__header th,
        .el-table__body td {
          padding: 6px 4px;
          white-space: nowrap;
        }

        .el-table__header th {
          font-size: 11px;
        }

        .el-button {
          padding: 2px 6px;
          font-size: 10px;
        }
      }
    }

    .table-footer {
      flex-direction: column;
      gap: 8px;
      padding: 8px 12px;

      .record-count {
        width: 100%;
        text-align: center;
        font-size: 11px;
      }

      :deep(.el-pagination) {
        justify-content: center;

        .btn-prev,
        .btn-next {
          min-width: 28px;
          padding: 0 4px;
          font-size: 11px;
        }

        .el-pager li {
          min-width: 24px;
          height: 24px;
          line-height: 24px;
          font-size: 11px;
          margin: 0 2px;
        }

        .el-pagination__total {
          font-size: 11px;
        }
      }
    }
  }

  // 图片面板移动端优化
  .image-panel {
    min-height: 160px;

    .panel-header {
      padding: 8px 12px;
      font-size: 13px;

      .el-icon {
        font-size: 16px;
      }
    }

    .image-content {
      padding: 12px;

      :deep(.el-empty) {
        .el-empty__image {
          width: 80px;
        }

        .el-empty__description {
          font-size: 12px;
        }
      }
    }
  }

  // 搜索输入框优化
  .search-input {
    margin-bottom: 8px;

    :deep(.el-input__wrapper) {
      height: 32px;

      .el-input__inner {
        font-size: 13px;
      }
    }
  }

  // 状态筛选优化
  .status-filter {
    padding: 6px 8px;
    margin-bottom: 8px;

    .filter-item {
      font-size: 11px;

      .dot {
        width: 6px;
        height: 6px;
      }
    }
  }

  // 面板头部优化
  .panel-header {
    padding: 8px 12px;
    font-size: 13px;
  }
}

// 超小屏幕适配 (< 480px)
@media (max-width: 480px) {
  .ai-patrol-monitor {
    padding: 6px;
  }

  .monitor-container {
    gap: 6px;
  }

  .left-panel .task-list {
    max-height: 150px;
  }

  .task-detail-panel {
    .task-detail .detail-row.multi-col {
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;

        .label {
          min-width: auto;
          font-size: 10px;
        }

        .value {
          font-size: 11px;
          text-align: left;
        }
      }
    }
  }

  .table-panel .table-body :deep(.el-table) {
    min-width: 500px;
    font-size: 10px;
  }
}
</style>
