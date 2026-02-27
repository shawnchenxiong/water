<template>
  <el-dialog
    v-model="visible"
    title="报告预览"
    width="90%"
    top="5vh"
    :before-close="handleClose"
    class="report-preview-dialog"
  >
    <div class="preview-container" v-loading="loading">
      <!-- 预览工具栏 -->
      <div class="preview-toolbar">
        <div class="toolbar-left">
          <span class="report-info">
            {{ report?.reportName }} - {{ report?.stationName }}
          </span>
        </div>
        
        <div class="toolbar-right">
          <el-button-group>
            <el-button 
              :icon="ZoomOut" 
              @click="zoomOut"
              :disabled="scale <= 0.5"
            />
            <el-button class="scale-display">
              {{ Math.round(scale * 100) }}%
            </el-button>
            <el-button 
              :icon="ZoomIn" 
              @click="zoomIn"
              :disabled="scale >= 2.0"
            />
          </el-button-group>
          
          <el-button 
            :icon="FullScreen"
            @click="toggleFullscreen"
            class="ml-2"
          />
          
          <el-button 
            :icon="Download" 
            type="primary"
            @click="handleDownload"
            :loading="downloading"
            class="ml-2"
          >
            下载
          </el-button>
        </div>
      </div>
      
          <!-- PDF预览内容 -->
      <!-- 注意：实际项目中应该使用html2pdf在后端生成PDF，这里只是前端模拟预览 -->
      <div class="preview-content" ref="previewContainer">
        <div class="pdf-viewer" :style="{ transform: `scale(${scale})` }">
          <!-- 模拟PDF页面 -->
          <div class="pdf-page" v-for="page in totalPages" :key="page">
            <div class="page-header">
              <div class="page-number">第{{ page }}页 / 共{{ totalPages }}页</div>
            </div>
            
            <!-- 第一页显示完整报告内容 -->
            <div v-if="page === 1" class="report-content">
              <div class="report-title-section">
                <h1>{{ reportDetail?.header.title }}</h1>
                <p class="subtitle">{{ reportDetail?.header.subtitle }}</p>
              </div>
              
              <div class="basic-info-section">
                <h2>基本信息</h2>
                <table class="info-table">
                  <tr>
                    <td class="label">电站名称:</td>
                    <td class="value">{{ reportDetail?.basicInfo.stationName }}</td>
                  </tr>
                  <tr>
                    <td class="label">装机容量:</td>
                    <td class="value">{{ reportDetail?.basicInfo.stationCapacity }}</td>
                  </tr>
                  <tr>
                    <td class="label">报告时间:</td>
                    <td class="value">{{ reportDetail?.basicInfo.reportPeriod }}</td>
                  </tr>
                  <tr>
                    <td class="label">生成日期:</td>
                    <td class="value">{{ reportDetail?.basicInfo.generateDate }}</td>
                  </tr>
                </table>
              </div>
              
              <div class="summary-section">
                <h2>诊断摘要</h2>
                <div class="summary-grid">
                  <div class="summary-card score">
                    <div class="score-value">{{ reportDetail?.executiveSummary.overallScore }}</div>
                    <div class="score-label">综合评分</div>
                    <div class="score-level">{{ reportDetail?.executiveSummary.scoreLevel }}</div>
                  </div>
                  <div class="summary-card">
                    <div class="card-value">{{ reportDetail?.executiveSummary.totalIssues }}</div>
                    <div class="card-label">问题总数</div>
                  </div>
                  <div class="summary-card">
                    <div class="card-value critical">{{ reportDetail?.executiveSummary.criticalIssues }}</div>
                    <div class="card-label">严重问题</div>
                  </div>
                  <div class="summary-card">
                    <div class="card-value warning">{{ reportDetail?.executiveSummary.warningIssues }}</div>
                    <div class="card-label">警告问题</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 第二页显示诊断详情 -->
            <div v-else-if="page === 2" class="report-content">
              <div class="diagnosis-section">
                <h2>诊断详情</h2>
                
                <div class="diagnosis-category" v-for="category in diagnosisCategories" :key="category.name">
                  <h3>{{ category.name }}</h3>
                  <div class="category-status" :class="category.status">
                    整体状态: {{ category.statusText }}
                  </div>
                  
                  <table class="diagnosis-table">
                    <thead>
                      <tr>
                        <th>诊断项目</th>
                        <th>状态</th>
                        <th>详情</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in category.items" :key="item.name">
                        <td>{{ item.name }}</td>
                        <td>
                          <span class="status-badge" :class="item.status">
                            {{ getStatusText(item.status) }}
                          </span>
                        </td>
                        <td>{{ item.detail }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- 第三页显示建议措施 -->
            <div v-else-if="page === 3" class="report-content">
              <div class="recommendations-section">
                <h2>建议措施</h2>
                
                <div class="recommendation-item" v-for="(rec, index) in reportDetail?.recommendations" :key="index">
                  <div class="recommendation-header">
                    <span class="priority-badge" :class="rec.priority">
                      {{ getPriorityText(rec.priority) }}
                    </span>
                    <span class="category">{{ rec.category }}</span>
                  </div>
                  
                  <div class="recommendation-content">
                    <div class="issue">
                      <strong>问题描述:</strong> {{ rec.issue }}
                    </div>
                    <div class="suggestion">
                      <strong>处理建议:</strong> {{ rec.suggestion }}
                    </div>
                    <div class="benefit">
                      <strong>预期效果:</strong> {{ rec.expectedBenefit }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 其他页面显示占位内容 -->
            <div v-else class="report-content">
              <div class="placeholder-content">
                <h2>报告内容 - 第{{ page }}页</h2>
                <p>这里是报告的其他内容页面。</p>
                <p>实际项目中，这里会显示完整的PDF内容或使用PDF.js等库来渲染真实的PDF文档。</p>
              </div>
            </div>
            
            <div class="page-footer">
              <div class="footer-info">
                {{ reportDetail?.basicInfo.stationName }} - {{ reportDetail?.basicInfo.reportType }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 页面导航 -->
      <div class="page-navigation">
        <el-pagination
          v-model:current-page="currentPage"
          :total="totalPages"
          :page-size="1"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { 
  ZoomIn, 
  ZoomOut, 
  FullScreen, 
  Download 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getReportDetail } from '@/api/diagnosis/diagnosisReport'
import type { DiagnosisReport, ReportDetail } from '@/api/types/diagnosis/diagnosisReport'
import html2pdf from 'html2pdf.js'

interface Props {
  modelValue: boolean
  report?: DiagnosisReport | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框显示控制
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 状态管理
const loading = ref(false)
const downloading = ref(false)
const reportDetail = ref<ReportDetail | null>(null)

// 预览控制
const scale = ref(1.0)
const currentPage = ref(1)
const totalPages = ref(5)
const previewContainer = ref<HTMLElement>()

/**
 * 获取状态文字
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'normal': '正常',
    'warning': '警告',
    'error': '异常'
  }
  return textMap[status] || status
}

/**
 * 获取优先级文字
 */
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || priority
}

/**
 * 诊断类别数据
 */
const diagnosisCategories = computed(() => {
  if (!reportDetail.value) return []
  
  const { diagnosisResults } = reportDetail.value
  
  return [
    {
      name: diagnosisResults.communication.categoryName,
      status: diagnosisResults.communication.overallStatus === '良好' ? 'good' : 'warning',
      statusText: diagnosisResults.communication.overallStatus,
      items: diagnosisResults.communication.details.map(item => ({
        name: item.itemName,
        status: item.status,
        detail: item.availability || `${item.checkCount}次检查，${item.abnormalCount}次异常`
      }))
    },
    {
      name: diagnosisResults.dataQuality.categoryName,
      status: diagnosisResults.dataQuality.overallStatus === '良好' ? 'good' : 'warning',
      statusText: diagnosisResults.dataQuality.overallStatus,
      items: diagnosisResults.dataQuality.details.map(item => ({
        name: item.itemName,
        status: item.status,
        detail: `数据完整性: ${item.dataIntegrity}, 质量分数: ${item.qualityScore}`
      }))
    },
    {
      name: diagnosisResults.deviceOperation.categoryName,
      status: diagnosisResults.deviceOperation.overallStatus === '良好' ? 'good' : 'warning',
      statusText: diagnosisResults.deviceOperation.overallStatus,
      items: diagnosisResults.deviceOperation.details.map(item => ({
        name: item.itemName,
        status: item.status,
        detail: item.uptime ? `运行时间: ${item.uptime}` : item.recommendAction || '正常运行'
      }))
    }
  ]
})

/**
 * 加载报告详情
 */
const loadReportDetail = async () => {
  if (!props.report) return
  
  try {
    loading.value = true
    const response = await getReportDetail(props.report.reportId, true)
    
    if (response.code === 200) {
      reportDetail.value = response.data
    } else {
      ElMessage.error(response.message || '加载报告详情失败')
    }
  } catch (error) {
    console.error('加载报告详情失败:', error)
    ElMessage.error('加载报告详情失败')
  } finally {
    loading.value = false
  }
}

/**
 * 放大
 */
const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 2.0)
}

/**
 * 缩小
 */
const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}

/**
 * 切换全屏
 */
const toggleFullscreen = () => {
  if (!previewContainer.value) return
  
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    previewContainer.value.requestFullscreen()
  }
}

/**
 * 页面切换
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
}

/**
 * 下载报告
 */
const handleDownload = async () => {
  if (!props.report || !reportDetail.value) return
  
  try {
    downloading.value = true
    
    // 使用html2pdf生成PDF
    await generatePdfReport()
    
    ElMessage.success('报告下载成功')
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
  if (!reportDetail.value || !props.report) return
  
  // 使用现有的PDF页面内容
  const pdfElement = document.querySelector('.pdf-page')
  if (!pdfElement) return
  
  // 配置html2pdf选项
  const opt = {
    margin: 0.5,
    filename: `${props.report.reportName}_${props.report.dateRange}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
  }
  
  // 生成PDF
  await html2pdf().from(pdfElement as HTMLElement).set(opt).save()
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  visible.value = false
  // 重置状态
  scale.value = 1.0
  currentPage.value = 1
}

// 监听报告变化
watch(() => props.report, (newReport) => {
  if (newReport && visible.value) {
    loadReportDetail()
  }
})

// 监听对话框显示
watch(() => visible.value, (show) => {
  if (show && props.report) {
    nextTick(() => {
      loadReportDetail()
    })
  }
})
</script>

<style scoped lang="scss">
.report-preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    height: 80vh;
  }
}

.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color);
  
  .toolbar-left {
    .report-info {
      font-size: 14px;
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    
    .scale-display {
      min-width: 60px;
      cursor: default;
      
      &:hover {
        background-color: transparent;
      }
    }
    
    .ml-2 {
      margin-left: 8px;
    }
  }
}

.preview-content {
  flex: 1;
  overflow: auto;
  background-color: #f0f2f5;
  padding: 20px;
  
  .pdf-viewer {
    transform-origin: top center;
    transition: transform 0.3s ease;
    
    .pdf-page {
      width: 794px; // A4纸宽度
      min-height: 1123px; // A4纸高度
      margin: 0 auto 20px;
      background-color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      padding: 40px;
      
      .page-header {
        position: absolute;
        top: 10px;
        right: 20px;
        
        .page-number {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
      
      .page-footer {
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
        text-align: center;
        
        .footer-info {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
      
      .report-content {
        .report-title-section {
          text-align: center;
          margin-bottom: 40px;
          
          h1 {
            font-size: 28px;
            margin-bottom: 8px;
            color: var(--el-text-color-primary);
          }
          
          .subtitle {
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }
        }
        
        .basic-info-section,
        .summary-section,
        .diagnosis-section,
        .recommendations-section {
          margin-bottom: 32px;
          
          h2 {
            font-size: 20px;
            margin-bottom: 16px;
            color: var(--el-text-color-primary);
            border-bottom: 2px solid var(--el-color-primary);
            padding-bottom: 4px;
          }
          
          h3 {
            font-size: 16px;
            margin-bottom: 12px;
            color: var(--el-text-color-primary);
          }
        }
        
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          
          td {
            padding: 8px 12px;
            border: 1px solid var(--el-border-color);
            
            &.label {
              background-color: var(--el-fill-color-lighter);
              font-weight: 500;
              width: 120px;
            }
            
            &.value {
              background-color: white;
            }
          }
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
          
          .summary-card {
            text-align: center;
            padding: 16px;
            border: 1px solid var(--el-border-color);
            border-radius: 6px;
            
            &.score {
              background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
              color: white;
              border: none;
              box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
              
              .score-value {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 4px;
              }
              
              .score-label,
              .score-level {
                font-size: 12px;
              }
            }
            
            .card-value {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 4px;
              
              &.critical {
                color: var(--el-color-danger);
              }
              
              &.warning {
                color: var(--el-color-warning);
              }
            }
            
            .card-label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
        
        .diagnosis-category {
          margin-bottom: 24px;
          
          .category-status {
            font-size: 14px;
            padding: 4px 8px;
            border-radius: 4px;
            margin-bottom: 12px;
            
            &.good {
              background-color: #f0f9ff;
              color: #10b981;
            }
            
            &.warning {
              background-color: #fffbeb;
              color: #f59e0b;
            }
          }
        }
        
        .diagnosis-table {
          width: 100%;
          border-collapse: collapse;
          
          th,
          td {
            padding: 8px 12px;
            border: 1px solid var(--el-border-color);
            text-align: left;
          }
          
          th {
            background-color: var(--el-fill-color-lighter);
            font-weight: 500;
          }
          
          .status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            
            &.normal {
              background-color: #f0f9ff;
              color: #10b981;
            }
            
            &.warning {
              background-color: #fffbeb;
              color: #f59e0b;
            }
            
            &.error {
              background-color: #fef2f2;
              color: #ef4444;
            }
          }
        }
        
        .recommendation-item {
          margin-bottom: 20px;
          border: 1px solid var(--el-border-color);
          border-radius: 6px;
          overflow: hidden;
          
          .recommendation-header {
            background-color: var(--el-fill-color-lighter);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            
            .priority-badge {
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              
              &.high {
                background-color: #fef2f2;
                color: #ef4444;
              }
              
              &.medium {
                background-color: #fffbeb;
                color: #f59e0b;
              }
              
              &.low {
                background-color: #f0f9ff;
                color: #3b82f6;
              }
            }
            
            .category {
              font-weight: 500;
              color: var(--el-text-color-primary);
            }
          }
          
          .recommendation-content {
            padding: 16px;
            
            .issue,
            .suggestion,
            .benefit {
              margin-bottom: 8px;
              font-size: 14px;
              line-height: 1.5;
              
              strong {
                color: var(--el-text-color-primary);
              }
            }
          }
        }
        
        .placeholder-content {
          text-align: center;
          padding: 60px 40px;
          color: var(--el-text-color-secondary);
          
          h2 {
            font-size: 18px;
            margin-bottom: 16px;
          }
          
          p {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 8px;
          }
        }
      }
    }
  }
}

.page-navigation {
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color);
  text-align: center;
}
</style>
