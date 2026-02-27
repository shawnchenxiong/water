<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0919"
        :auto-select-first-leaf="true"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧主内容区 -->
    <template #right>
      <div class="ai-recognition-container">
        <!-- Tab标签页 -->
        <div class="tab-section">
          <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
            <el-tab-pane label="实时推送" name="realtime">
              <!-- 实时推送内容 -->
              <div class="realtime-content">
                <div class="realtime-status">
                  <div class="status-icon">
                    <el-icon class="loading-icon"><Loading /></el-icon>
                  </div>
                  <div class="status-text">实时推送中</div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="历史数据" name="history">
              <!-- 历史数据筛选 -->
              <div class="filter-section">
                <el-form
                  ref="historyFormRef"
                  :model="historyForm"
                  label-width="auto"
                  inline
                >
                  <el-form-item label="巡检时间">
                    <el-date-picker
                      v-model="historyForm.timeRange"
                      type="datetimerange"
                      range-separator="—"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 350px"
                    />
                  </el-form-item>

                  <el-form-item label="识别结果">
                    <el-select
                      v-model="historyForm.recognitionResult"
                      placeholder="识别告警"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="option in recognitionResultOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="算法类型">
                    <el-select
                      v-model="historyForm.algorithmType"
                      placeholder="请选择"
                      style="width: 150px"
                    >
                      <el-option
                        v-for="option in algorithmTypeOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="handleHistorySearch">
                      搜索
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 历史数据表格 -->
              <div class="table-section">
                <el-table
                  v-loading="historyLoading"
                  :data="historyTableData"
                  border
                  stripe
                  style="width: 100%"
                  empty-text="暂无数据"
                >
                  <el-table-column prop="inspectionTime" label="巡检时间" width="180" align="center" />
                  <el-table-column prop="deviceName" label="设备名称" min-width="120" />
                  <el-table-column prop="algorithmType" label="算法类型" width="120" align="center" />
                  <el-table-column prop="recognitionResult" label="识别结果" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getResultTagType(row.recognitionResult)">
                        {{ row.recognitionResult }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="confidence" label="置信度" width="100" align="center" />
                  <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
                  <el-table-column label="操作" width="120" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleViewDetail(row)">
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 分页 -->
              <div class="pagination-section" v-if="historyTableData.length > 0">
                <el-pagination
                  v-model:current-page="historyPagination.current"
                  v-model:page-size="historyPagination.pageSize"
                  :total="historyPagination.total"
                  :page-sizes="[10, 20, 50, 100]"
                  :layout="paginationLayout"
                  @size-change="handleHistorySizeChange"
                  @current-change="handleHistoryCurrentChange"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="算法审核" name="audit">
              <!-- 算法审核筛选 -->
              <div class="filter-section">
                <el-form
                  ref="auditFormRef"
                  :model="auditForm"
                  label-width="auto"
                >
                  <!-- PC端：充分利用空间的自然排列 -->
                  <div class="filter-content" v-if="!isMobile">
                    <div class="filter-row">
                      <el-form-item label="巡检时间">
                        <el-date-picker
                          v-model="auditForm.timeRange"
                          type="datetimerange"
                          range-separator="—"
                          start-placeholder="开始时间"
                          end-placeholder="结束时间"
                          format="YYYY-MM-DD HH:mm"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          style="width: 350px"
                        />
                      </el-form-item>

                      <el-form-item label="识别结果">
                        <el-select
                          v-model="auditForm.recognitionResult"
                          placeholder="识别告警"
                          style="width: 150px"
                        >
                          <el-option
                            v-for="option in recognitionResultOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="审核状态">
                        <el-select
                          v-model="auditForm.auditStatus"
                          placeholder="请选择"
                          style="width: 150px"
                        >
                          <el-option
                            v-for="option in auditStatusOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </el-select>
                      </el-form-item>
                    </div>

                    <div class="filter-row">
                      <el-form-item label="告警误报">
                        <el-select
                          v-model="auditForm.alarmMisreport"
                          placeholder="请选择"
                          style="width: 150px"
                        >
                          <el-option
                            v-for="option in alarmMisreportOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="算法类型">
                        <el-select
                          v-model="auditForm.algorithmType"
                          placeholder="请选择"
                          style="width: 150px"
                        >
                          <el-option
                            v-for="option in algorithmTypeOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item>
                        <el-button type="primary" @click="handleAuditSearch">
                          搜索
                        </el-button>
                      </el-form-item>
                    </div>
                  </div>

                  <!-- 移动端：展开收起布局 -->
                  <div class="filter-content mobile-layout" v-else>
                    <!-- 基础筛选：始终显示 -->
                    <div class="filter-row basic-filters">
                      <el-form-item label="识别结果">
                        <el-select
                          v-model="auditForm.recognitionResult"
                          placeholder="识别告警"
                          clearable
                        >
                          <el-option
                            v-for="option in recognitionResultOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </el-select>
                      </el-form-item>

                      <el-form-item label="审核状态">
                        <el-select
                          v-model="auditForm.auditStatus"
                          placeholder="请选择"
                          clearable
                        >
                          <el-option
                            v-for="option in auditStatusOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </el-select>
                      </el-form-item>
                    </div>

                    <!-- 高级筛选：默认隐藏，可展开 -->
                    <div class="advanced-filters" :class="{ 'mobile-hidden': !isAuditFilterExpanded }">
                      <div class="filter-row">
                        <el-form-item label="告警误报">
                          <el-select
                            v-model="auditForm.alarmMisreport"
                            placeholder="请选择"
                            clearable
                          >
                            <el-option
                              v-for="option in alarmMisreportOptions"
                              :key="option.value"
                              :label="option.label"
                              :value="option.value"
                            />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="算法类型">
                          <el-select
                            v-model="auditForm.algorithmType"
                            placeholder="请选择"
                            clearable
                          >
                            <el-option
                              v-for="option in algorithmTypeOptions"
                              :key="option.value"
                              :label="option.label"
                              :value="option.value"
                            />
                          </el-select>
                        </el-form-item>
                      </div>

                      <div class="filter-row">
                        <!-- 日期选择器单独占满一行 -->
                        <el-form-item label="巡检时间" class="date-picker-item">
                          <el-date-picker
                            v-model="auditForm.timeRange"
                            type="datetimerange"
                            range-separator="—"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            format="YYYY-MM-DD HH:mm"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            class="mobile-date-picker"
                          />
                        </el-form-item>
                      </div>
                    </div>
                  </div>

                  <!-- 操作按钮行 -->
                  <div class="filter-actions">
                    <el-button type="primary" @click="handleAuditSearch">搜索</el-button>
                    <el-button @click="handleAuditReset">重置</el-button>
                    <el-button
                      v-if="isMobile"
                      type="text"
                      @click="toggleAuditFilterExpanded"
                    >
                      {{ isAuditFilterExpanded ? '收起筛选' : '展开筛选' }}
                      <el-icon>
                        <ArrowUp v-if="isAuditFilterExpanded" />
                        <ArrowDown v-else />
                      </el-icon>
                    </el-button>
                  </div>
                </el-form>
              </div>

              <!-- 操作按钮区域 -->
              <div class="action-section">
                <el-checkbox v-model="selectAll" @change="handleSelectAllChange">全选</el-checkbox>
                <div class="action-buttons">
                  <el-button type="primary" @click="handleAlgorithmAudit">算法审核</el-button>
                  <el-button @click="handleEvaluationExport">测评导出</el-button>
                  <el-button @click="handleImageExport">图片导出</el-button>
                  <el-button @click="handleTaskList">任务列表</el-button>
                </div>
              </div>

              <!-- 算法审核表格 -->
              <div class="table-section">
                <el-table
                  v-loading="auditLoading"
                  :data="auditTableData"
                  border
                  stripe
                  style="width: 100%"
                  empty-text="暂无数据"
                  @selection-change="handleAuditSelectionChange"
                >
                  <el-table-column type="selection" width="55" align="center" />
                  <el-table-column prop="inspectionTime" label="巡检时间" width="180" align="center" />
                  <el-table-column prop="deviceName" label="设备名称" min-width="120" />
                  <el-table-column prop="algorithmType" label="算法类型" width="120" align="center" />
                  <el-table-column prop="recognitionResult" label="识别结果" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getResultTagType(row.recognitionResult)">
                        {{ row.recognitionResult }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="auditStatus" label="审核状态" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getAuditTagType(row.auditStatus)">
                        {{ row.auditStatus }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="alarmMisreport" label="告警误报" width="120" align="center" />
                  <el-table-column prop="confidence" label="置信度" width="100" align="center" />
                  <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
                  <el-table-column label="操作" width="120" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleAuditItem(row)">
                        审核
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 分页 -->
              <div class="pagination-section" v-if="auditTableData.length > 0">
                <el-pagination
                  v-model:current-page="auditPagination.current"
                  v-model:page-size="auditPagination.pageSize"
                  :total="auditPagination.total"
                  :page-sizes="[10, 20, 50, 100]"
                  :layout="paginationLayout"
                  @size-change="handleAuditSizeChange"
                  @current-change="handleAuditCurrentChange"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 任务列表弹框 -->
  <el-dialog
    v-model="taskListDialogVisible"
    title="任务列表"
    width="80%"
    :close-on-click-modal="false"
    class="task-list-dialog"
  >
    <!-- 任务筛选 -->
    <div class="task-filter-section">
      <el-form :model="taskListForm" inline>
        <el-form-item label="任务名称">
          <el-input
            v-model="taskListForm.taskName"
            placeholder="请输入"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select
            v-model="taskListForm.taskStatus"
            placeholder="全部"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="进行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="已停止" value="stopped" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleTaskListSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 任务表格 -->
    <el-table
      v-loading="taskListLoading"
      :data="taskListData"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="taskName" label="任务名称" min-width="150" />
      <el-table-column prop="createTime" label="任务创建时间" width="180" align="center" />
      <el-table-column prop="dataTimeRange" label="数据时间范围" width="200" align="center" />
      <el-table-column prop="taskStatus" label="任务状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getTaskStatusType(row.taskStatus)">
            {{ getTaskStatusText(row.taskStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleTaskOperation(row)">
            {{ row.taskStatus === 'running' ? '停止' : '启动' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 任务列表分页 -->
    <div class="task-pagination-section" v-if="taskListData.length > 0">
      <el-pagination
        v-model:current-page="taskListPagination.current"
        v-model:page-size="taskListPagination.pageSize"
        :total="taskListPagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleTaskListSizeChange"
        @current-change="handleTaskListCurrentChange"
      />
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="taskListDialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 算法评测弹框 -->
  <el-dialog
    v-model="algorithmEvaluationDialogVisible"
    title="算法评测"
    :width="isMobile ? '95%' : '600px'"
    :close-on-click-modal="false"
    class="algorithm-evaluation-dialog"
  >
    <el-form :model="evaluationForm" label-width="100px">
      <el-form-item label="算法类型">
        <el-select v-model="evaluationForm.algorithmType" placeholder="未戴安全帽识别" style="width: 100%">
          <el-option label="未戴安全帽识别" value="safety_helmet_detection" />
          <el-option label="人员入侵检测" value="personnel_intrusion" />
          <el-option label="火灾烟雾检测" value="fire_smoke" />
          <el-option label="设备异常检测" value="device_abnormal" />
        </el-select>
      </el-form-item>

      <el-form-item label="统计结果">
        <div class="checkbox-group">
          <el-checkbox v-model="evaluationForm.statisticResults.correctRecognition" label="违规-识别正确" />
          <el-checkbox v-model="evaluationForm.statisticResults.incorrectRecognition" label="未违规-识别正确" />
          <el-checkbox v-model="evaluationForm.statisticResults.falseAlarm" label="误报" />
          <el-checkbox v-model="evaluationForm.statisticResults.missedDetection" label="漏报" />
          <el-checkbox v-model="evaluationForm.statisticResults.invalidData" label="无效数据" />
        </div>
      </el-form-item>

      <el-form-item label="能力评测">
        <div class="checkbox-group">
          <el-checkbox v-model="evaluationForm.performanceMetrics.accuracy" label="准确率" />
          <el-checkbox v-model="evaluationForm.performanceMetrics.precision" label="精准率" />
          <el-checkbox v-model="evaluationForm.performanceMetrics.recall" label="召回率" />
    </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="algorithmEvaluationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEvaluation">确认</el-button>
  </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import type { StationTreeNode } from '@/types/station'
import {
  getAIRecognitionHistoryRecords,
  getAIRecognitionAuditRecords,
  getAIRecognitionBasicData,
  getAIRecognitionDetail,
  executeAlgorithmAudit,
  exportEvaluationData,
  exportImageData
} from '@/api/aiRecognitionApi'
import type {
  AIRecognitionHistoryRecord,
  AIRecognitionAuditRecord,
  AIRecognitionBasicData,
  RecognitionResult,
  AlgorithmType,
  AuditStatus
} from '@/api/types/ai-recognition'

// 当前选中的Tab
const activeTab = ref('realtime')
const currentStationId = ref('')

// 响应式检测
const isMobile = computed(() => window.innerWidth <= 768)

// 移动端筛选展开状态
const isAuditFilterExpanded = ref(false)

// 分页布局
const paginationLayout = computed(() => {
  return isMobile.value ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
})

// 基础数据
const basicData = ref<AIRecognitionBasicData>({
  recognitionResults: [],
  algorithmTypes: [],
  auditStatuses: [],
  alarmMisreports: []
})

// 计算选项数据
const recognitionResultOptions = computed(() => basicData.value.recognitionResults)
const algorithmTypeOptions = computed(() => basicData.value.algorithmTypes)
const auditStatusOptions = computed(() => basicData.value.auditStatuses)
const alarmMisreportOptions = computed(() => basicData.value.alarmMisreports)

// 历史数据相关状态
const historyForm = reactive({
  timeRange: [] as string[],
  recognitionResult: '' as RecognitionResult | '',
  algorithmType: '' as AlgorithmType | ''
})

const historyTableData = ref<AIRecognitionHistoryRecord[]>([])
const historyLoading = ref(false)
const historyPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 算法审核相关状态
const auditForm = reactive({
  timeRange: [] as string[],
  recognitionResult: '' as RecognitionResult | '',
  auditStatus: '' as AuditStatus | '',
  alarmMisreport: '' as 'yes' | 'no' | '',
  algorithmType: '' as AlgorithmType | ''
})

const auditTableData = ref<AIRecognitionAuditRecord[]>([])
const auditLoading = ref(false)
const auditPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const selectAll = ref(false)
const selectedAuditItems = ref<AIRecognitionAuditRecord[]>([])

// 弹框状态
const taskListDialogVisible = ref(false)
const algorithmEvaluationDialogVisible = ref(false)

// 任务列表相关状态
const taskListForm = reactive({
  taskName: '',
  taskStatus: ''
})

interface TaskListItem {
  id: string
  taskName: string
  createTime: string
  dataTimeRange: string
  taskStatus: 'running' | 'completed' | 'stopped'
}

const taskListData = ref<TaskListItem[]>([])
const taskListLoading = ref(false)
const taskListPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 算法评测表单
const evaluationForm = reactive({
  algorithmType: 'safety_helmet_detection',
  statisticResults: {
    correctRecognition: false,
    incorrectRecognition: false,
    falseAlarm: false,
    missedDetection: false,
    invalidData: false
  },
  performanceMetrics: {
    accuracy: false,
    precision: false,
    recall: false
  }
})

/**
 * 电站选择处理
 */
const handleStationSelect = (node: StationTreeNode) => {
  currentStationId.value = node.regionId
  
  // 重新加载当前Tab的数据
  if (activeTab.value === 'history') {
    handleHistorySearch()
  } else if (activeTab.value === 'audit') {
    handleAuditSearch()
  }
}

/**
 * Tab切换处理
 */
const handleTabChange = (tabName: string | number) => {
  const tabNameStr = String(tabName)
  activeTab.value = tabNameStr
  
  if (tabNameStr === 'history') {
    handleHistorySearch()
  } else if (tabNameStr === 'audit') {
    handleAuditSearch()
  }
}

/**
 * 历史数据搜索
 */
const handleHistorySearch = async () => {
  historyLoading.value = true
  
  try {
    const params = {
      stationId: currentStationId.value,
      timeRange: historyForm.timeRange,
      recognitionResult: historyForm.recognitionResult,
      algorithmType: historyForm.algorithmType,
      current: historyPagination.current,
      pageSize: historyPagination.pageSize
    }
    
    const response = await getAIRecognitionHistoryRecords(params)
    
    if (response.code === 200) {
      historyTableData.value = response.data.records
      historyPagination.total = response.data.total
      historyPagination.current = response.data.current
    } else {
      ElMessage.error(response.message || '查询失败')
    }
  } catch (error) {
    console.error('查询历史数据失败:', error)
    ElMessage.error('查询失败')
  } finally {
    historyLoading.value = false
  }
}

/**
 * 算法审核搜索
 */
const handleAuditSearch = async () => {
  auditLoading.value = true
  
  try {
    const params = {
      stationId: currentStationId.value,
      timeRange: auditForm.timeRange,
      recognitionResult: auditForm.recognitionResult,
      auditStatus: auditForm.auditStatus,
      alarmMisreport: auditForm.alarmMisreport,
      algorithmType: auditForm.algorithmType,
      current: auditPagination.current,
      pageSize: auditPagination.pageSize
    }
    
    const response = await getAIRecognitionAuditRecords(params)
    
    if (response.code === 200) {
      auditTableData.value = response.data.records
      auditPagination.total = response.data.total
      auditPagination.current = response.data.current
    } else {
      ElMessage.error(response.message || '查询失败')
    }
  } catch (error) {
    console.error('查询审核数据失败:', error)
    ElMessage.error('查询失败')
  } finally {
    auditLoading.value = false
  }
}

/**
 * 算法审核重置
 */
const handleAuditReset = () => {
  Object.assign(auditForm, {
    timeRange: [],
    recognitionResult: '',
    auditStatus: '',
    alarmMisreport: '',
    algorithmType: ''
  })
  auditPagination.current = 1
  handleAuditSearch()
}

/**
 * 切换移动端筛选展开状态
 */
const toggleAuditFilterExpanded = () => {
  isAuditFilterExpanded.value = !isAuditFilterExpanded.value
}

/**
 * 获取识别结果标签类型
 */
const getResultTagType = (result: string): 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'normal': 'success',
    'abnormal': 'warning',
    'alarm': 'danger'
  }
  return typeMap[result] || 'info'
}

/**
 * 获取审核状态标签类型
 */
const getAuditTagType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'pending': 'warning',
    'audited': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

/**
 * 查看详情
 */
const handleViewDetail = async (row: AIRecognitionHistoryRecord) => {
  try {
    const response = await getAIRecognitionDetail(row.id)
    
    if (response.code === 200) {
      const detail = response.data
      ElMessage.info(`查看 ${detail.record.deviceName} 的识别详情`)
      // TODO: 打开详情弹窗显示完整信息
    } else {
      ElMessage.error(response.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取识别详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

/**
 * 全选处理
 */
const handleSelectAllChange = (val: string | number | boolean) => {
  const isSelected = Boolean(val)
  // TODO: 实现全选逻辑
  ElMessage.info(isSelected ? '已全选' : '已取消全选')
}

/**
 * 审核选择变化
 */
const handleAuditSelectionChange = (selection: AIRecognitionAuditRecord[]) => {
  selectedAuditItems.value = selection
  selectAll.value = selection.length === auditTableData.value.length
}

/**
 * 算法审核
 */
const handleAlgorithmAudit = () => {
  // 打开算法评测弹框
  algorithmEvaluationDialogVisible.value = true
}

/**
 * 测评导出
 */
const handleEvaluationExport = async () => {
  try {
    const params = {
      stationId: currentStationId.value,
      timeRange: auditForm.timeRange,
      recognitionResult: auditForm.recognitionResult,
      auditStatus: auditForm.auditStatus,
      alarmMisreport: auditForm.alarmMisreport,
      algorithmType: auditForm.algorithmType
    }
    
    const response = await exportEvaluationData(params)
    
    if (response.code === 200) {
      ElMessage.success('测评数据导出成功')
      // TODO: 处理文件下载
      console.log('下载链接:', response.data)
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('测评导出失败:', error)
    ElMessage.error('导出失败')
  }
}

/**
 * 图片导出
 */
const handleImageExport = async () => {
  if (selectedAuditItems.value.length === 0) {
    ElMessage.warning('请选择要导出的记录')
    return
  }
  
  try {
    const recordIds = selectedAuditItems.value.map(item => item.id)
    const response = await exportImageData(recordIds)
    
    if (response.code === 200) {
      ElMessage.success(response.message)
      // TODO: 处理文件下载
      console.log('下载链接:', response.data)
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    console.error('图片导出失败:', error)
    ElMessage.error('导出失败')
  }
}

/**
 * 任务列表
 */
const handleTaskList = () => {
  taskListDialogVisible.value = true
  loadTaskListData()
}

/**
 * 审核单项
 */
const handleAuditItem = async (row: AIRecognitionAuditRecord) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要审核 ${row.deviceName} 的识别结果吗？`,
      '审核确认',
      {
        confirmButtonText: '通过',
        cancelButtonText: '驳回',
        distinguishCancelAndClose: true,
        type: 'warning',
      }
    )
    
    const params = {
      recordIds: [row.id],
      auditResult: (result === 'confirm' ? 'pass' : 'reject') as 'pass' | 'reject',
      remark: result === 'confirm' ? '审核通过' : '审核驳回'
    }
    
    const response = await executeAlgorithmAudit(params)
    
    if (response.code === 200) {
      ElMessage.success(response.message)
      handleAuditSearch()
    } else {
      ElMessage.error(response.message || '审核失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      // 用户选择驳回
      const params = {
        recordIds: [row.id],
        auditResult: 'reject' as const,
        remark: '审核驳回'
      }
      
      const response = await executeAlgorithmAudit(params)
      
      if (response.code === 200) {
        ElMessage.success('审核驳回成功')
        handleAuditSearch()
      }
    } else if (error !== 'close') {
      console.error('审核失败:', error)
      ElMessage.error('审核失败')
    }
  }
}

/**
 * 历史数据分页处理
 */
const handleHistorySizeChange = (size: number) => {
  historyPagination.pageSize = size
  historyPagination.current = 1
  handleHistorySearch()
}

const handleHistoryCurrentChange = (page: number) => {
  historyPagination.current = page
  handleHistorySearch()
}

/**
 * 审核数据分页处理
 */
const handleAuditSizeChange = (size: number) => {
  auditPagination.pageSize = size
  auditPagination.current = 1
  handleAuditSearch()
}

const handleAuditCurrentChange = (page: number) => {
  auditPagination.current = page
  handleAuditSearch()
}

/**
 * 加载任务列表数据
 */
const loadTaskListData = async () => {
  taskListLoading.value = true
  
  try {
    // 模拟任务列表数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockTaskList: TaskListItem[] = [
      {
        id: 'task-1',
        taskName: 'AI识别任务-储能柜监控',
        createTime: '2025-11-01 10:00:00',
        dataTimeRange: '2025-11-01 ~ 2025-11-02',
        taskStatus: 'running'
      },
      {
        id: 'task-2',
        taskName: 'AI识别任务-人员入侵检测',
        createTime: '2025-11-01 09:30:00',
        dataTimeRange: '2025-11-01 ~ 2025-11-01',
        taskStatus: 'completed'
      },
      {
        id: 'task-3',
        taskName: 'AI识别任务-设备异常检测',
        createTime: '2025-11-01 08:00:00',
        dataTimeRange: '2025-10-31 ~ 2025-11-01',
        taskStatus: 'stopped'
      }
    ]
    
    taskListData.value = mockTaskList
    taskListPagination.total = mockTaskList.length
  } catch (error) {
    console.error('加载任务列表失败:', error)
    ElMessage.error('加载任务列表失败')
  } finally {
    taskListLoading.value = false
  }
}

/**
 * 任务列表搜索
 */
const handleTaskListSearch = () => {
  loadTaskListData()
}

/**
 * 任务状态标签类型
 */
const getTaskStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'running': 'success',
    'completed': 'info',
    'stopped': 'warning'
  }
  return typeMap[status] || 'info'
}

/**
 * 任务状态文本
 */
const getTaskStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'running': '进行中',
    'completed': '已完成',
    'stopped': '已停止'
  }
  return textMap[status] || status
}

/**
 * 任务操作
 */
const handleTaskOperation = async (row: any) => {
  const isRunning = row.taskStatus === 'running'
  const operation = isRunning ? '停止' : '启动'
  
  try {
    const result = await ElMessageBox.confirm(
      `确定要${operation}任务"${row.taskName}"吗？`,
      `${operation}任务`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    if (result === 'confirm') {
      // 模拟操作
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 更新任务状态
      row.taskStatus = isRunning ? 'stopped' : 'running'
      ElMessage.success(`任务${operation}成功`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`任务${operation}失败:`, error)
      ElMessage.error(`任务${operation}失败`)
    }
  }
}

/**
 * 任务列表分页处理
 */
const handleTaskListSizeChange = (size: number) => {
  taskListPagination.pageSize = size
  taskListPagination.current = 1
  loadTaskListData()
}

const handleTaskListCurrentChange = (page: number) => {
  taskListPagination.current = page
  loadTaskListData()
}

/**
 * 确认算法评测
 */
const handleConfirmEvaluation = () => {
  const selectedResults = Object.keys(evaluationForm.statisticResults).filter(
    key => evaluationForm.statisticResults[key as keyof typeof evaluationForm.statisticResults]
  )
  
  const selectedMetrics = Object.keys(evaluationForm.performanceMetrics).filter(
    key => evaluationForm.performanceMetrics[key as keyof typeof evaluationForm.performanceMetrics]
  )
  
  if (selectedResults.length === 0 && selectedMetrics.length === 0) {
    ElMessage.warning('请至少选择一项统计结果或能力评测')
    return
  }
  
  console.log('算法评测配置:', {
    algorithmType: evaluationForm.algorithmType,
    statisticResults: selectedResults,
    performanceMetrics: selectedMetrics
  })
  
  ElMessage.success('算法评测配置已保存')
  algorithmEvaluationDialogVisible.value = false
}

/**
 * 加载基础数据
 */
const loadBasicData = async () => {
  try {
    const response = await getAIRecognitionBasicData()
    
    if (response.code === 200) {
      basicData.value = response.data
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

// 组件挂载
onMounted(async () => {
  await loadBasicData()
  // 预加载任务列表数据
  await loadTaskListData()
  // 默认加载实时推送，无需特殊操作
})
</script>

<style scoped lang="scss">
.ai-recognition-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;

  .tab-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .el-tabs__header {
        flex-shrink: 0;
        margin-bottom: 20px;
      }

      .el-tabs__content {
        flex: 1;
        overflow: hidden;
        
        .el-tab-pane {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }

  .realtime-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .realtime-status {
      text-align: center;

      .status-icon {
        margin-bottom: 16px;

        .loading-icon {
          font-size: 48px;
          color: #00d4ff;
          animation: rotate 2s linear infinite;
        }
      }

      .status-text {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .filter-section {
    margin-bottom: 16px;
    padding: 16px;
    background: rgba(10, 30, 50, 0.5);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  .action-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: rgba(10, 30, 50, 0.3);
  border-radius: 8px;

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }

  .table-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-table) {
      flex: 1;
      background: transparent;

      th,
      td {
        background: transparent;
        border-color: rgba(0, 212, 255, 0.2);
      }

      th {
        background: rgba(10, 30, 50, 0.6);
        color: rgba(255, 255, 255, 0.85);
      }

      td {
        color: rgba(255, 255, 255, 0.85);
      }

      .el-table__body tr:hover > td {
        background: rgba(0, 212, 255, 0.1);
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0 0 0;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .ai-recognition-container {
    padding: 12px;

    .filter-section {
      padding: 12px;

      .filter-content {
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;

          :deep(.el-form-item) {
            flex: 0 0 calc(50% - 6px) !important;
            margin-bottom: 0;
            width: calc(50% - 6px);

            .el-form-item__label {
              font-size: 12px;
              min-width: 70px;
            }

            .el-form-item__content {
              flex: 1;

              .el-input,
              .el-select,
              .el-date-picker {
                width: 100% !important;
                font-size: 13px;

                .el-input__wrapper,
                .el-select__wrapper {
                  min-height: 32px;
                }
              }
            }

            // 日期选择器单独占满一行
            &.date-picker-item,
            &:has(.mobile-date-picker) {
              flex: 0 0 100% !important;
              width: 100% !important;

              .el-form-item__content {
                .mobile-date-picker {
                  width: 100% !important;
                  max-width: 260px !important;
                  font-size: 12px;

                  :deep(.el-input__wrapper) {
                    font-size: 11px;
                    min-height: 28px;
                    padding: 0 6px;
                  }

                  :deep(.el-range-separator) {
                    font-size: 10px;
                    padding: 0 4px;
                  }
                }
              }
            }
          }
        }

        .advanced-filters {
          &.mobile-hidden {
            display: none;
          }
        }
      }

      .filter-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-start;
        margin-top: 12px;

        .el-button {
          font-size: 12px;
        }
      }
    }

    .action-section {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .action-buttons {
        justify-content: space-between;

        .el-button {
          flex: 1;
          font-size: 12px;
        }
      }
    }

    .table-section {
      :deep(.el-table) {
        font-size: 12px;

        .el-table__header th,
        .el-table__body td {
          padding: 8px 4px;
        }

        .cell {
          padding: 0 4px;
        }
      }
    }

    .pagination-section {
      justify-content: center;

      :deep(.el-pagination) {
        .btn-prev,
        .btn-next {
          min-width: 28px;
          font-size: 11px;
        }

        .el-pager li {
          min-width: 24px;
          height: 24px;
          line-height: 24px;
          font-size: 11px;
        }
      }
    }
  }

  // 弹框移动端适配
  :deep(.algorithm-evaluation-dialog) {
    .el-dialog__body {
      padding: 16px 12px;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .el-form-item {
      margin-bottom: 16px;
      
      .el-form-item__label {
        font-size: 13px;
      }
      
      .el-input,
      .el-select {
        font-size: 13px;
      }
    }
    
    .checkbox-group {
      .el-checkbox {
        display: block;
        margin-bottom: 8px;
        margin-right: 0;
        
        .el-checkbox__label {
          font-size: 13px;
        }
      }
    }
    
    .dialog-footer {
      padding-top: 16px;
      
      .el-button {
        font-size: 13px;
        padding: 8px 16px;
      }
    }
  }
}
</style>