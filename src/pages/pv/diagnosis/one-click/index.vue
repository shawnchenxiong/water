<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        :auto-select-first-leaf="true"
        @node-click="handleStationChange"
      />
    </template>

    <!-- 右侧一键诊断内容 -->
    <template #right>
      <div class="one-click-diagnosis">
        <!-- 诊断状态显示区 -->
        <div class="diagnosis-header">
          <DiagnosisScoreDisplay
            :score="diagnosisResult?.overallScore || 0"
            :diagnosis-time="diagnosisResult?.diagnosisTime || ''"
            :abnormal-count="diagnosisResult?.abnormalCount || 0"
            :diagnosis-loading="diagnosisLoading"
            @start-diagnosis="handleStartDiagnosis"
            @view-history="handleViewHistory"
          />
        </div>

        <!-- 诊断分类卡片区域 -->
        <div class="diagnosis-categories">
          <div
            v-for="category in diagnosisResult?.categories || []"
            :key="category.categoryId"
            class="category-section"
          >
            <!-- 分类标题 -->
            <div class="category-header" @click="toggleCategory(category.categoryId)">
              <div class="category-title">
                <el-icon class="category-icon">
                  <Management />
                </el-icon>
                <span class="category-name">{{ category.categoryName }}</span>
              </div>
              <el-icon class="expand-icon" :class="{ expanded: expandedCategories.has(category.categoryId) }">
                <ArrowDown />
              </el-icon>
            </div>

            <!-- 分类内容 -->
            <div
              v-show="expandedCategories.has(category.categoryId)"
              class="category-content"
            >
            <div class="diagnosis-cards-container">
              <DiagnosisCard
                v-for="item in category.items"
                :key="item.itemId"
                :item="item"
                :selected="selectedAbnormalItem?.itemId === item.itemId"
                @click="handleCardClick"
              />
            </div>
            
            <!-- 分类异常对象表格 -->
            <Transition name="slide-down">
              <AbnormalObjectTable
                v-if="selectedAbnormalItem && isInCurrentCategory(selectedAbnormalItem, category)"
                :data="filteredAbnormalObjects"
                :initial-page-size="pageSize"
                @close="closeCategoryTable"
                @object-click="handleObjectClick"
              />
            </Transition>
            </div>
          </div>
        </div>


        <!-- 诊断历史记录对话框 -->
        <DiagnosisHistoryDialog
          v-model="historyDialogVisible"
          :station-id="selectedStation?.regionId || ''"
          @view-detail="handleViewHistoryDetail"
        />

        <!-- 诊断进度对话框 -->
        <el-dialog
          v-model="progressDialogVisible"
          title="诊断进度"
          :width="isMobile ? '90%' : '500px'"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
          :show-close="false"
        >
          <div class="progress-content" v-if="diagnosisProgress">
            <el-progress
              :percentage="diagnosisProgress.progress"
              :stroke-width="8"
              color="#00d4ff"
            />
            <div class="progress-info">
              <div class="current-item">
                正在进行: {{ diagnosisProgress.currentItem }}
              </div>
              <div class="progress-stats">
                已完成 {{ diagnosisProgress.completedItems }} / {{ diagnosisProgress.totalItems }} 项
              </div>
            </div>
          </div>
        </el-dialog>

        <!-- 设备详情对话框 -->
        <DeviceDetailDialog
          v-model:visible="deviceDetailVisible"
          :device-id="selectedDeviceId"
          :device-name="selectedDeviceName"
          @device-change="handleDeviceChange"
        />
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Management } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import DiagnosisScoreDisplay from '@/components/common/DiagnosisScoreDisplay.vue'
import DiagnosisCard from '@/components/common/DiagnosisCard.vue'
import DiagnosisHistoryDialog from '@/components/common/DiagnosisHistoryDialog.vue'
import AbnormalObjectTable from '@/components/common/AbnormalObjectTable.vue'
import DeviceDetailDialog from '../device-detail/DeviceDetailDialog.vue'
import {
  executeOneClickDiagnosis,
  getOneClickDiagnosisResult,
  getDiagnosisProgress,
  updateMockDiagnosisProgress
} from '@/api/diagnosis/oneClick'
import type {
  OneClickDiagnosisResult,
  DiagnosisItem,
  DiagnosisProgress,
  DiagnosisHistoryItem,
  AbnormalObject
} from '@/api/types/diagnosis'
import type { StationTreeNode } from '@/types/station'

// 当前选中的电站
const selectedStation = ref<StationTreeNode | null>(null)

// 移动端检测
const isMobile = ref(false)

// 诊断结果
const diagnosisResult = ref<OneClickDiagnosisResult | null>(null)

// 诊断状态
const diagnosisLoading = ref(false)
const progressDialogVisible = ref(false)
const diagnosisProgress = ref<DiagnosisProgress | null>(null)

// 历史记录对话框
const historyDialogVisible = ref(false)

// 分类展开状态
const expandedCategories = ref<Set<string>>(new Set(['communication', 'data_quality', 'device_operation']))

// 当前选中的异常项目
const selectedAbnormalItem = ref<DiagnosisItem | null>(null)

// 分页相关
const pageSize = ref(10)

// 过滤后的异常对象列表
const filteredAbnormalObjects = computed(() => {
  if (!selectedAbnormalItem.value || !diagnosisResult.value?.abnormalObjects) {
    return []
  }
  
  return diagnosisResult.value.abnormalObjects.filter(
    obj => obj.diagnosisItemId === selectedAbnormalItem.value?.itemId
  )
})

// 判断选中的异常项目是否在当前分类中
const isInCurrentCategory = (item: DiagnosisItem, category: any) => {
  return category.items.some((catItem: any) => catItem.itemId === item.itemId)
}

// 设备详情对话框相关
const deviceDetailVisible = ref(false)
const selectedDeviceId = ref('')
const selectedDeviceName = ref('')

// 轮询定时器
let progressTimer: NodeJS.Timeout | null = null

// 移动端检测函数
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  isMobile.value = newIsMobile
}

// 组件挂载时加载数据
onMounted(() => {
  // 初始化时不加载数据，等待用户选择电站
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  window.removeEventListener('resize', checkIsMobile)
})

// 处理电站变化
const handleStationChange = (station: StationTreeNode) => {
  console.log('选择的电站:', station)
  selectedStation.value = station
  loadDiagnosisResult()
}

// 加载诊断结果
const loadDiagnosisResult = async () => {
  if (!selectedStation.value?.regionId) {
    return
  }

  try {
    const response = await getOneClickDiagnosisResult(
      selectedStation.value.regionId,
      selectedStation.value.regionName
    )
    
    if (response.code === 200) {
      diagnosisResult.value = response.data
    } else {
      ElMessage.error(response.message || '获取诊断结果失败')
    }
  } catch (error) {
    console.error('加载诊断结果失败:', error)
    ElMessage.error('加载诊断结果失败')
  }
}

// 开始诊断
const handleStartDiagnosis = async () => {
  console.log('当前选中电站:', selectedStation.value)
  if (!selectedStation.value?.regionId) {
    ElMessage.warning('请先选择电站')
    return
  }

  try {
    const confirmed = await ElMessageBox.confirm(
      '确定要开始一键诊断吗？诊断过程可能需要几分钟时间。',
      '确认诊断',
      {
        confirmButtonText: '开始诊断',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    if (!confirmed) return

    diagnosisLoading.value = true

    // 调用诊断API
    const response = await executeOneClickDiagnosis({
      stationId: selectedStation.value.regionId,
      forceRefresh: true
    })
    
    if (response.code === 200) {
      const taskId = response.data.taskId
      
      // 获取初始进度
      const progressResponse = await getDiagnosisProgress(taskId)
      if (progressResponse.code === 200) {
        diagnosisProgress.value = { ...progressResponse.data, progress: 0 }
      }
      
      // 开始进度轮询
      startProgressPolling(taskId)
      
      progressDialogVisible.value = true
      ElMessage.success('诊断任务已启动')
    } else {
      throw new Error(response.message || '启动诊断失败')
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('启动诊断失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '启动诊断失败')
    }
    diagnosisLoading.value = false
  }
}

// 诊断进度轮询
const startProgressPolling = (taskId: string) => {
  progressTimer = setInterval(async () => {
    try {
      if (diagnosisProgress.value) {
        // 调用API更新进度
        const response = await updateMockDiagnosisProgress(taskId, diagnosisProgress.value.progress)
        
        if (response.code === 200) {
          diagnosisProgress.value = response.data
          
          // 检查是否完成
          if (response.data.progress >= 100) {
            finishDiagnosis()
          }
        }
      }
    } catch (error) {
      console.error('更新诊断进度失败:', error)
      // 发生错误时也完成诊断
      finishDiagnosis()
    }
  }, 1000)
}

// 完成诊断
const finishDiagnosis = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }

  if (diagnosisProgress.value) {
    diagnosisProgress.value = {
      ...diagnosisProgress.value,
      progress: 100,
      completedItems: diagnosisProgress.value.totalItems,
      status: 'completed'
    }
  }

  setTimeout(() => {
    progressDialogVisible.value = false
    diagnosisLoading.value = false
    
    // 重新加载诊断结果（API层会模拟40%概率显示异常）
    loadDiagnosisResult()
    
    ElMessage.success('诊断完成！')
  }, 1500)
}

// 查看历史记录
const handleViewHistory = () => {
  if (!selectedStation.value?.regionId) {
    ElMessage.warning('请先选择电站')
    return
  }
  historyDialogVisible.value = true
}

// 查看历史记录详情
const handleViewHistoryDetail = (record: DiagnosisHistoryItem) => {
  console.log('查看历史记录详情:', record)
  // 这里可以跳转到详情页面或打开详情对话框
}

// 切换分类展开状态
const toggleCategory = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
}

// 处理诊断卡片点击
const handleCardClick = (item: DiagnosisItem) => {
  console.log('点击诊断卡片:', item)
  
  // 如果是异常状态且有异常对象，显示异常对象表格
  if ((item.status === 'error' || item.status === 'warning') && 
      diagnosisResult.value?.abnormalObjects?.some(obj => obj.diagnosisItemId === item.itemId)) {
    selectedAbnormalItem.value = item
  }
}

// 关闭分类表格
const closeCategoryTable = () => {
  selectedAbnormalItem.value = null
}

// 处理对象点击 - 打开设备详情
const handleObjectClick = (object: AbnormalObject) => {
  console.log('点击异常对象:', object)
  selectedDeviceId.value = object.objectId
  selectedDeviceName.value = object.objectName
  deviceDetailVisible.value = true
}

// 处理设备切换
const handleDeviceChange = (deviceId: string) => {
  console.log('设备切换:', deviceId)
  selectedDeviceId.value = deviceId
}


</script>

<style scoped lang="scss">
.one-click-diagnosis {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden; // 防止内容溢出，滚动由父容器处理

  @media (max-width: 768px) {
    padding: 12px;
    gap: 16px;
  }
}

.diagnosis-header {
  flex-shrink: 0;
}

.diagnosis-categories {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px; // 为滚动条预留空间
}

.category-section {
  margin-bottom: 20px;
  
  .category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: linear-gradient(135deg, 
      rgba(0, 40, 80, 0.6) 0%, 
      rgba(0, 60, 120, 0.4) 50%, 
      rgba(0, 40, 80, 0.6) 100%
    );
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    transition: all 0.3s ease;

    @media (max-width: 768px) {
      padding: 12px 16px;
    }
    
    &:hover {
      background: linear-gradient(135deg, 
        rgba(0, 50, 100, 0.7) 0%, 
        rgba(0, 70, 140, 0.5) 50%, 
        rgba(0, 50, 100, 0.7) 100%
      );
      border-color: rgba(0, 212, 255, 0.5);
    }
    
    .category-title {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .category-icon {
        color: #00d4ff;
        font-size: 20px;

        @media (max-width: 768px) {
          font-size: 18px;
        }
      }
      
      .category-name {
        font-size: 16px;
        font-weight: 600;
        color: #fff;

        @media (max-width: 768px) {
          font-size: 14px;
        }
      }
    }
    
    .expand-icon {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      transition: transform 0.3s ease;
      
      &.expanded {
        transform: rotate(180deg);
      }
    }
  }
  
  .category-content {
    padding: 20px;
    background: rgba(0, 30, 60, 0.3);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-top: none;
    border-radius: 0 0 8px 8px;

    @media (max-width: 768px) {
      padding: 16px;
    }

    @media (max-width: 480px) {
      padding: 12px;
    }
  }
}

.diagnosis-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  
  // 设备诊断使用6列布局
  &.device-diagnosis {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

// 滑动动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.progress-content {
  text-align: center;
  color: #fff;
  
  .progress-info {
    margin-top: 20px;
    
    .current-item {
      font-size: 16px;
      margin-bottom: 8px;
      color: #00d4ff;
    }
    
    .progress-stats {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

/* 异常对象列表样式 */
.abnormal-objects-section {
  flex-shrink: 0;
  margin-top: 20px;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 0 4px;
    
    .section-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #00d4ff;
        margin: 0;
      }
      
      .section-subtitle {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
  
  .abnormal-table-container {
    background: rgba(0, 30, 60, 0.3);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 8px;
    padding: 20px;
    
    .abnormal-table {
      width: 100%;
      
      :deep(.el-table__header-wrapper) {
        background: rgba(0, 40, 80, 0.8);
      }
      
      :deep(.el-table__body-wrapper) {
        .el-table__row {
          &:hover {
            background-color: rgba(0, 212, 255, 0.1) !important;
          }
          
          &.el-table__row--striped {
            background-color: rgba(0, 40, 80, 0.3);
            
            &:hover {
              background-color: rgba(0, 212, 255, 0.1) !important;
            }
          }
        }
      }
      
      :deep(.el-table__border-line) {
        background-color: rgba(0, 212, 255, 0.3);
      }
      
      :deep(.el-table td) {
        border-bottom: 1px solid rgba(0, 212, 255, 0.2);
      }
      
      :deep(.el-table th) {
        border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      }
    }
    
    .table-pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      
      :deep(.el-pagination) {
        .btn-prev,
        .btn-next,
        .el-pager li {
          background-color: rgba(0, 40, 80, 0.6);
          color: #ffffff;
          border: 1px solid rgba(0, 212, 255, 0.3);
          
          &:hover {
            background-color: rgba(0, 212, 255, 0.2);
          }
          
          &.is-active {
            background-color: #00d4ff;
            color: #000;
          }
        }
        
        .el-select .el-input {
          .el-input__wrapper {
            background-color: rgba(0, 40, 80, 0.6);
            border-color: rgba(0, 212, 255, 0.3);
            
            .el-input__inner {
              color: #ffffff;
            }
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 1400px) {
  .diagnosis-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 1200px) {
  .diagnosis-cards-container {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .inline-abnormal-table {
    padding: 12px;
    
    :deep(.el-table) {
      .el-table td,
      .el-table th {
        font-size: 11px;
        padding: 4px 0;
      }
    }
    
    .inline-pagination {
      :deep(.el-pagination) {
        .el-pagination__sizes {
          display: none;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .one-click-diagnosis {
    .diagnosis-categories {
      padding-right: 2px; // 减少滚动条空间
    }
    
    .category-section {
      margin-bottom: 16px; // 减少分类间距
    }
  }

  .diagnosis-cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px; // 减少卡片间距
  }
  
  .inline-abnormal-table {
    padding: 8px;
    
    .table-header {
      .table-title {
        font-size: 12px;
      }
    }
    
    :deep(.el-table) {
      .el-table td,
      .el-table th {
        font-size: 10px;
        padding: 2px 0;
      }
    }
  }
}

@media (max-width: 480px) {
  .diagnosis-cards-container {
    grid-template-columns: 1fr; // 超小屏幕单列显示
    gap: 8px;
  }
  
  .one-click-diagnosis {
    .diagnosis-categories {
      padding-right: 0; // 移除滚动条空间
    }
    
    .category-section {
      margin-bottom: 12px;
    }
  }
}
</style>
