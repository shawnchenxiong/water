<template>
  <DeviceMonitorLayout>
    <!-- 左侧报告管理区 -->
    <template #left>
      <div class="report-management-panel">
        <!-- 筛选控制区 -->
        <div class="filter-controls">
          <!-- 生成报告 -->
          <div class="generate-section">
            <el-input
              v-model="newReportName"
              placeholder="生成报告"
              clearable
              class="generate-input"
              @keyup.enter="handleGenerateReport"
              @focus="handleInputFocus"
            />
            <el-button 
              class="refresh-btn"
              :icon="Refresh" 
              @click="handleRefresh"
              circle
            />
          </div>
        </div>

        <!-- 报告列表区 -->
        <div class="report-list" v-loading="loading">
          <div 
            v-for="report in reportList" 
            :key="report.reportId"
            :class="['report-card', { 'selected': selectedReport?.reportId === report.reportId }]"
            @click="handleSelectReport(report)"
          >
            <div class="report-title">{{ report.reportName }}</div>
            <div class="report-date-range">{{ report.dateRange }}</div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="!loading && reportList.length === 0" class="empty-state">
            <el-empty description="暂无报告数据" />
          </div>
        </div>

        <!-- 分页信息 -->
        <div class="pagination-info" v-if="pagination.total > 0">
          <span>共{{ pagination.total }}条</span>
          <el-pagination
            v-model:current-page="pagination.current"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            layout="prev, pager, next"
            @current-change="handlePageChange"
            small
            background
          />
        </div>
      </div>
    </template>

    <!-- 右侧报告预览区 -->
    <template #right>
      <div class="report-preview-container">
        <!-- 操作按钮区 -->
        <div class="preview-actions" v-if="selectedReport">
          <el-button 
            type="primary" 
            :icon="Download"
            @click="handleDownload"
            :loading="downloading"
          >
            下载
          </el-button>
          
          
          <el-button 
            :icon="Delete"
            @click="handleDeleteReport"
            type="danger"
            plain
          >
            删除
          </el-button>
        </div>

        <!-- A4纸样式的报告预览 -->
        <div class="a4-report-container" v-if="selectedReport && reportDetail" v-loading="!reportDetail">
          <div class="a4-page">
            <!-- 报告头部 -->
            <div class="report-header-pdf">
              <h1>{{ reportDetail.header.title }}</h1>
              <p class="subtitle">{{ reportDetail.header.subtitle }}</p>
              <h2>{{ selectedReport.reportName }}</h2>
            </div>
            
            <!-- 基本信息 -->
            <div class="basic-info-pdf">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">电站名称:</span>
                  <span class="value">{{ reportDetail.basicInfo.stationName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">装机容量:</span>
                  <span class="value">{{ reportDetail.basicInfo.stationCapacity }}</span>
                </div>
                <div class="info-item">
                  <span class="label">报告时间:</span>
                  <span class="value">{{ reportDetail.basicInfo.reportPeriod }}</span>
                </div>
                <div class="info-item">
                  <span class="label">生成时间:</span>
                  <span class="value">{{ reportDetail.basicInfo.generateDate }}</span>
                </div>
              </div>
            </div>
            
            <!-- 诊断摘要 -->
            <div class="diagnosis-summary-pdf">
              <h3>诊断摘要</h3>
              
              <div class="summary-cards">
                <div class="summary-card score-card">
                  <div class="card-value">{{ reportDetail.executiveSummary.overallScore }}</div>
                  <div class="card-label">综合评分</div>
                  <div class="card-level">{{ reportDetail.executiveSummary.scoreLevel }}</div>
                </div>
                <div class="summary-card">
                  <div class="card-value">{{ reportDetail.executiveSummary.totalIssues }}</div>
                  <div class="card-label">问题总数</div>
                </div>
                <div class="summary-card">
                  <div class="card-value critical">{{ reportDetail.executiveSummary.criticalIssues }}</div>
                  <div class="card-label">严重问题</div>
                </div>
                <div class="summary-card">
                  <div class="card-value warning">{{ reportDetail.executiveSummary.warningIssues }}</div>
                  <div class="card-label">警告问题</div>
                </div>
              </div>
              
              <div class="key-findings-pdf">
                <h4>关键发现</h4>
                <ul>
                  <li v-for="finding in reportDetail.executiveSummary.keyFindings" :key="finding">
                    {{ finding }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-preview">
          <el-empty description="请从左侧选择一个报告进行预览" />
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 报告生成对话框 -->
  <ReportGenerateDialog
    v-model="showGenerateDialog"
    :report-name="newReportName"
    @generate="handleConfirmGenerate"
  />

</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { 
  Refresh, 
  Download, 
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import ReportGenerateDialog from './components/ReportGenerateDialog.vue'
import {
  getReportList,
  generateReport,
  getReportDetail,
  downloadReport,
  deleteReport,
} from '@/api/diagnosis/diagnosisReport'
import type {
  DiagnosisReport,
  ReportListParams,
  ReportDetail,
  GenerateReportRequest,
  ReportType,
  ReportStatus
} from '@/api/types/diagnosis/diagnosisReport'
import { downloadBlobFile } from '@/utils/download'
import html2pdf from 'html2pdf.js'

// 状态管理
const loading = ref(false)
const generating = ref(false)
const downloading = ref(false)

// 报告列表和选中
const reportList = ref<DiagnosisReport[]>([])
const selectedReport = ref<DiagnosisReport | null>(null)
const reportDetail = ref<ReportDetail | null>(null)

// 搜索和筛选
const searchKeyword = ref('')
const newReportName = ref('')
const filterParams = reactive({
  reportType: '',
  status: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1
})

// 对话框控制
const showGenerateDialog = ref(false)

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    'completed': 'success',
    'generating': 'warning',
    'failed': 'danger',
    'expired': 'info'
  }
  return typeMap[status] || 'info'
}

/**
 * 获取状态文字
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'completed': '已完成',
    'generating': '生成中',
    'failed': '生成失败',
    'expired': '已过期'
  }
  return textMap[status] || status
}

/**
 * 加载报告列表
 */
const loadReportList = async () => {
  try {
    loading.value = true
    
    const params: ReportListParams = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      reportType: (filterParams.reportType as ReportType) || undefined,
      status: (filterParams.status as ReportStatus) || undefined,
      sortField: 'generateTime',
      sortOrder: 'desc'
    }

    const response = await getReportList(params)
    
    if (response.code === 200) {
      reportList.value = response.data.diagnosisReports
      pagination.current = response.data.pagination.current
      pagination.pageSize = response.data.pagination.pageSize
      pagination.total = response.data.pagination.total
      pagination.totalPages = response.data.pagination.totalPages
      
      // 自动选择第一个报告
      if (reportList.value.length > 0 && !selectedReport.value) {
        await handleSelectReport(reportList.value[0])
      }
    } else {
      ElMessage.error(response.message || '加载报告列表失败')
    }
  } catch (error) {
    console.error('加载报告列表失败:', error)
    ElMessage.error('加载报告列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 选择报告
 */
const handleSelectReport = async (report: DiagnosisReport) => {
  selectedReport.value = report
  
  // 加载报告详细内容
  try {
    const response = await getReportDetail(report.reportId, true)
    if (response.code === 200) {
      reportDetail.value = response.data
    }
  } catch (error) {
    console.error('加载报告详情失败:', error)
  }
}

/**
 * 搜索报告
 */
const handleSearch = () => {
  pagination.current = 1
  loadReportList()
}

/**
 * 页面大小变化
 */
const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadReportList()
}

/**
 * 页码变化
 */
const handlePageChange = (page: number) => {
  pagination.current = page
  loadReportList()
}

/**
 * 刷新报告列表
 */
const handleRefresh = () => {
  loadReportList()
}

/**
 * 输入框获得焦点
 */
const handleInputFocus = () => {
  // 可以在这里添加焦点逻辑,比如清空之前的输入
}

/**
 * 生成报告
 */
const handleGenerateReport = () => {
  if (!newReportName.value.trim()) {
    ElMessage.warning('请输入报告名称')
    return
  }
  
  showGenerateDialog.value = true
}

/**
 * 确认生成报告
 */
const handleConfirmGenerate = async (params: GenerateReportRequest) => {
  try {
    generating.value = true
    
    const response = await generateReport(params)
    
    if (response.code === 200) {
      ElMessage.success('报告生成任务已启动，请稍后刷新查看')
      newReportName.value = ''
      showGenerateDialog.value = false
      
      // 3秒后自动刷新列表
      setTimeout(() => {
        loadReportList()
      }, 3000)
    } else {
      ElMessage.error(response.message || '报告生成失败')
    }
  } catch (error) {
    console.error('报告生成失败:', error)
    ElMessage.error('报告生成失败')
  } finally {
    generating.value = false
  }
}

/**
 * 下载报告
 */
const handleDownload = async () => {
  if (!selectedReport.value || !reportDetail.value) return
  
  try {
    downloading.value = true
    
    // 尝试从后端下载
    try {
      const blob = await downloadReport(selectedReport.value.reportId)
      const fileName = `${selectedReport.value.reportName}_${selectedReport.value.dateRange}.pdf`
      downloadBlobFile(blob, fileName)
    } catch (error: any) {
      // 如果后端返回错误（Mock模式），则使用html2pdf生成
      if (error.message === 'MOCK_USE_HTML2PDF') {
        await generatePdfReport()
      } else {
        throw error
      }
    }
    
    ElMessage.success('报告下载成功')
    
    // 更新下载次数（实际项目中应该由后端处理）
    selectedReport.value.downloadCount += 1
  } catch (error) {
    console.error('报告下载失败:', error)
    ElMessage.error('报告下载失败')
  } finally {
    downloading.value = false
  }
}

/**
 * 使用html2pdf生成PDF报告
 */
const generatePdfReport = async () => {
  if (!reportDetail.value || !selectedReport.value) return
  
  // 创建带内联样式的HTML内容用于PDF生成
  const htmlContent = `
    <div style="
      font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif; 
      width: 210mm; 
      min-height: 297mm; 
      background: white; 
      padding: 20mm; 
      box-sizing: border-box;
      color: #333;
      line-height: 1.6;
    ">
      <!-- 报告头部 -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #00D4FF; padding-bottom: 20px;">
        <h1 style="color: #333; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">${reportDetail.value.header.title}</h1>
        <p style="color: #666; font-size: 14px; margin: 5px 0;">${reportDetail.value.header.subtitle}</p>
        <h2 style="color: #333; margin: 10px 0 0 0; font-size: 18px; font-weight: 500;">${selectedReport.value.reportName}</h2>
      </div>
      
      <!-- 基本信息 -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #00D4FF;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500; color: #555;">电站名称:</span>
            <span style="color: #333;">${reportDetail.value.basicInfo.stationName}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500; color: #555;">装机容量:</span>
            <span style="color: #333;">${reportDetail.value.basicInfo.stationCapacity}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500; color: #555;">报告时间:</span>
            <span style="color: #333;">${reportDetail.value.basicInfo.reportPeriod}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 500; color: #555;">生成时间:</span>
            <span style="color: #333;">${reportDetail.value.basicInfo.generateDate}</span>
          </div>
        </div>
      </div>
      
      <!-- 诊断摘要 -->
      <div style="margin: 20px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #00D4FF; padding-bottom: 8px; display: inline-block; margin-bottom: 20px;">诊断摘要</h3>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
          <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%); color: white; border-radius: 6px;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 5px;">${reportDetail.value.executiveSummary.overallScore}</div>
            <div style="font-size: 12px;">综合评分</div>
            <div style="font-size: 12px;">${reportDetail.value.executiveSummary.scoreLevel}</div>
          </div>
          <div style="text-align: center; padding: 15px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #333;">${reportDetail.value.executiveSummary.totalIssues}</div>
            <div style="font-size: 12px; color: #666;">问题总数</div>
          </div>
          <div style="text-align: center; padding: 15px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #ef4444;">${reportDetail.value.executiveSummary.criticalIssues}</div>
            <div style="font-size: 12px; color: #666;">严重问题</div>
          </div>
          <div style="text-align: center; padding: 15px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #f59e0b;">${reportDetail.value.executiveSummary.warningIssues}</div>
            <div style="font-size: 12px; color: #666;">警告问题</div>
          </div>
        </div>
        
        <div>
          <h4 style="color: #00D4FF; margin: 15px 0 10px 0; font-weight: 500;">关键发现</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${reportDetail.value.executiveSummary.keyFindings.map(finding => 
              `<li style="margin: 5px 0; color: #666; line-height: 1.5;">${finding}</li>`
            ).join('')}
          </ul>
        </div>
      </div>
    </div>
  `
  
  // 创建临时元素用于PDF生成
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  tempDiv.style.top = '0'
  document.body.appendChild(tempDiv)
  
  try {
    // 配置html2pdf选项
    const opt = {
      margin: 0,
      filename: `${selectedReport.value.reportName}_${selectedReport.value.dateRange}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const
      }
    }
    
    // 生成PDF
          await html2pdf().from(tempDiv.firstElementChild as HTMLElement).set(opt).save()
  } finally {
    // 清理临时元素
    document.body.removeChild(tempDiv)
  }
}


/**
 * 删除报告
 */
const handleDeleteReport = async () => {
  if (!selectedReport.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除报告"${selectedReport.value.reportName}"吗？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteReport(selectedReport.value.reportId)
    
    if (response.code === 200) {
      ElMessage.success('报告删除成功')
      
      // 重新加载列表
      selectedReport.value = null
      reportDetail.value = null
      loadReportList()
    } else {
      ElMessage.error(response.message || '报告删除失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('报告删除失败:', error)
    ElMessage.error('报告删除失败')
  }
}

// 监听搜索关键词变化
watch(() => searchKeyword.value, () => {
  // 防抖处理
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (searchKeyword.value !== lastSearchKeyword) {
      lastSearchKeyword = searchKeyword.value
      handleSearch()
    }
  }, 500)
})

let searchTimer: NodeJS.Timeout
let lastSearchKeyword = ''

// 初始化
onMounted(() => {
  loadReportList()
})
</script>

<style scoped lang="scss">
.report-management-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.filter-controls {
  margin-bottom: 16px;
  
  .generate-section {
    display: flex;
    gap: 8px;
    align-items: center;
    
    .generate-input {
      flex: 1;
    }
    
    .refresh-btn {
      flex-shrink: 0;
      background: rgba(0, 212, 255, 0.1);
      border-color: #00D4FF;
      color: #00D4FF;
      
      &:hover {
        background: rgba(0, 212, 255, 0.2);
        border-color: #00D4FF;
        color: #00D4FF;
      }
    }
  }
}

.report-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
  
  .report-card {
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: #00D4FF;
    }
    
    &.selected {
      background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
      border-color: #00D4FF;
      
      .report-title,
      .report-date-range {
        color: #ffffff;
      }
    }
    
    .report-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 6px;
    }
    
    .report-date-range {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  
  :deep(.el-pagination) {
    .btn-prev,
    .btn-next,
    .el-pager li {
      background: rgba(0, 212, 255, 0.05);
      color: var(--el-text-color-primary);
      
      &:hover {
        color: #00D4FF;
      }
      
      &.is-active {
        background: #00D4FF;
        color: #ffffff;
      }
    }
  }
}

.report-preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(135deg, #0a1525 0%, #152238 100%);
  position: relative;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 5px;
  justify-content: flex-end;
}

.a4-report-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px 20px;
  overflow-y: auto;
}

.a4-page {
  width: 850px;
  min-height: 1000px;
  background-color: #ffffff;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 255, 0.15);
  padding: 20mm;
  position: relative;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  color: #333;
  line-height: 1.6;
  
  // 报告头部
  .report-header-pdf {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 3px solid #00D4FF;
    padding-bottom: 20px;
    
    h1 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .subtitle {
      color: #666;
      font-size: 14px;
      margin: 5px 0;
    }
    
    h2 {
      color: #333;
      margin: 10px 0 0 0;
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  // 基本信息
  .basic-info-pdf {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    margin: 20px 0;
    border-left: 4px solid #00D4FF;
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      
      .info-item {
        display: flex;
        justify-content: space-between;
        
        .label {
          font-weight: 500;
          color: #555;
        }
        
        .value {
          color: #333;
        }
      }
    }
  }
  
  // 诊断摘要
  .diagnosis-summary-pdf {
    margin: 20px 0;
    
    h3 {
      color: #333;
      border-bottom: 2px solid #00D4FF;
      padding-bottom: 8px;
      display: inline-block;
      margin-bottom: 20px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
      
      .summary-card {
        text-align: center;
        padding: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        
        &.score-card {
          background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
          color: white;
          border: none;
        }
        
        .card-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
          
          &.critical {
            color: #ef4444;
          }
          
          &.warning {
            color: #f59e0b;
          }
        }
        
        .card-label {
          font-size: 12px;
          color: #666;
        }
        
        .card-level {
          font-size: 12px;
        }
        
        &.score-card {
          .card-value,
          .card-label,
          .card-level {
            color: white;
          }
        }
      }
    }
    
    .key-findings-pdf {
      h4 {
        color: #00D4FF;
        margin: 15px 0 10px 0;
        font-weight: 500;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          margin: 5px 0;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }
}

.report-content-preview {
    flex: 1;
    overflow-y: auto;
    background-color: #ffffff;
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
  
    .preview-header {
      text-align: center;
      margin-bottom: 24px;
      
      .ai-subtitle {
        font-size: 14px;
        color: #666666;
        margin-bottom: 8px;
      }
      
      .report-title {
        font-size: 24px;
        font-weight: 600;
        margin: 0;
        color: #333333;
      }
    }
  
  .report-basic-info {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 24px;
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: #666666;
        font-weight: 500;
      }
      
      .value {
        color: #333333;
      }
    }
  }
  
  .report-summary {
    margin-bottom: 32px;
    
    h3 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #333333;
      border-bottom: 2px solid #00D4FF;
      padding-bottom: 8px;
      display: inline-block;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
      
      .summary-item {
        text-align: center;
        padding: 16px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 6px;
        
      &.score {
        background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        
        .score-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .score-label {
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .score-level {
          font-size: 14px;
          font-weight: 500;
        }
      }
        
        .item-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
          
          &.critical {
            color: var(--el-color-danger);
          }
          
          &.warning {
            color: var(--el-color-warning);
          }
        }
        
        .item-label {
          font-size: 12px;
          color: #666666;
        }
      }
    }
    
    .key-findings {
      h4 {
        font-size: 14px;
        margin-bottom: 8px;
        color: #00D4FF;
        font-weight: 500;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          font-size: 13px;
          color: #666666;
          margin-bottom: 4px;
          line-height: 1.5;
        }
      }
    }
  }
  
  .report-summary-a4 {
        margin: 25px 0;
        
        h3 {
          color: #1f2937;
          border-bottom: 3px solid #00D4FF;
          padding-bottom: 10px;
          display: inline-block;
          margin-bottom: 25px;
          font-size: 20px;
          font-weight: 700;
        }
        
        .summary-grid-a4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 25px 0;
          
          .summary-item {
            text-align: center;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            
            &.score {
              background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
              color: white;
              border: none;
              box-shadow: 0 4px 14px rgba(0, 212, 255, 0.3);
              
              .score-value {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 8px;
              }
              
              .score-label,
              .score-level {
                font-size: 13px;
                opacity: 0.9;
              }
            }
            
            .item-value {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1f2937;
              
              &.critical {
                color: #ef4444;
              }
              
              &.warning {
                color: #f59e0b;
              }
            }
            
            .item-label {
              font-size: 13px;
              color: #6b7280;
              font-weight: 500;
            }
          }
        }
        
        .key-findings {
          background: #f1f5f9;
          padding: 20px;
          border-radius: 8px;
          margin-top: 25px;
          border-left: 4px solid #00D4FF;
          
          h4 {
            color: #00D4FF;
            margin: 0 0 15px 0;
            font-weight: 600;
            font-size: 16px;
          }
          
          ul {
            margin: 0;
            padding-left: 20px;
            
            li {
              margin: 8px 0;
              color: #374151;
              line-height: 1.6;
              font-size: 14px;
            }
          }
        }
      }
    }

.empty-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
