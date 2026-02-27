<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0919"
        :auto-select-first-leaf="false"
        @node-click="handleStationSelect"
      />
    </template>

    <!-- 右侧知识库管理区 -->
    <template #right>
      <div class="knowledge-base-container">
        <!-- 分类标签导航 -->
        <div class="category-tabs">
          <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
            <el-tab-pane
              v-for="category in categories"
              :key="category.id"
              :name="category.id"
              :label="getCategoryLabel(category)"
            />
          </el-tabs>
        </div>

        <!-- 筛选控制区域 -->
        <div class="filter-section">
          <div class="search-controls">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入关键字搜索"
              :prefix-icon="Search"
              clearable
              style="width: 300px"
              @input="handleSearch"
            />
            <el-select
              v-model="selectedDocumentType"
              placeholder="资料类型"
              clearable
              style="width: 150px; margin-left: 10px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="category in categories.filter(c => c.id !== 'all')"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          </div>

          <div class="action-controls">
            <el-button type="primary" :icon="Plus" @click="handleUpload">新增</el-button>
            <el-button
              type="danger"
              :icon="Delete"
              :disabled="selectedDocuments.length === 0"
              @click="handleBatchDelete"
            >
              删除
            </el-button>
            <div class="view-controls">
              <el-radio-group v-model="viewMode" @change="handleViewModeChange">
                <el-radio-button value="card">
                  <el-icon><Grid /></el-icon>
                </el-radio-button>
                <el-radio-button value="list">
                  <el-icon><List /></el-icon>
                </el-radio-button>
              </el-radio-group>
            </div>
    </div>
        </div>

        <!-- 文档展示区域 -->
        <div class="documents-section">
          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="card-view">
            <div v-loading="loading" class="document-grid">
              <DocumentCard
                v-for="document in documents"
                :key="document.id"
                :document="document"
                :selected="selectedDocuments.includes(document.id)"
                @select="handleDocumentSelect"
                @download="handleDownload"
                @preview="handlePreview"
                @edit="handleEdit"
                @delete="handleDeleteSingle"
              />
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="list-view">
            <el-table
              v-loading="loading"
              :data="documents"
              border
              stripe
              height="calc(100vh - 400px)"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="文档名称" min-width="200">
                <template #default="{ row }">
                  <div class="document-name">
                    <el-icon class="file-icon" :class="`icon-${row.fileIcon}`">
                      <Document />
                    </el-icon>
                    <span class="name-text" @click="handlePreview(row)">{{ row.documentName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="documentType" label="文档类型" width="120">
                <template #default="{ row }">
                  {{ getCategoryName(row.documentType) }}
                </template>
              </el-table-column>
              <el-table-column prop="fileFormat" label="格式" width="80" />
              <el-table-column prop="fileSizeDisplay" label="大小" width="100" />
              <el-table-column prop="uploader" label="上传人" width="100" />
              <el-table-column prop="relativeTime" label="上传时间" width="120" />
              <el-table-column prop="downloadCount" label="下载" width="80" align="center" />
              <el-table-column prop="viewCount" label="查看" width="80" align="center" />
              <el-table-column label="操作" width="200" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" :icon="View" @click="handlePreview(row)">
                    预览
                  </el-button>
                  <el-button link type="primary" :icon="Download" @click="handleDownload(row)">
                    下载
                  </el-button>
                  <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
                    编辑
                  </el-button>
                  <el-button link type="danger" :icon="Delete" @click="handleDeleteSingle(row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[12, 18, 36, 72]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
      </div>
    </div>
  </div>
    </template>
  </DeviceMonitorLayout>

  <!-- 上传弹窗 -->
  <DocumentUploadDialog
    v-model="uploadDialogVisible"
    :categories="categories"
    @success="handleUploadSuccess"
  />

  <!-- 编辑弹窗 -->
  <DocumentEditDialog
    v-model="editDialogVisible"
    :document-id="currentDocumentId"
    :categories="categories"
    @success="handleEditSuccess"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Delete,
  Grid,
  List,
  View,
  Download,
  Edit,
  Document,
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import DocumentCard from './components/DocumentCard.vue'
import DocumentUploadDialog from './components/DocumentUploadDialog.vue'
import DocumentEditDialog from './components/DocumentEditDialog.vue'
import {
  getKnowledgeDocuments,
  getDocumentCategories,
  deleteDocument,
  batchDeleteDocuments,
  downloadDocument,
  previewDocument,
} from '@/api/maintenance/knowledgeBaseApi'
import type {
  KnowledgeDocument,
  DocumentCategory,
} from '@/api/types/knowledge-base'
import type { StationTreeNode } from '@/types/station'
import { downloadBlobFile } from '@/utils/download'

// 响应式数据
const loading = ref(false)
const documents = ref<KnowledgeDocument[]>([])
const categories = ref<DocumentCategory[]>([])
const activeCategory = ref('all')
const searchKeyword = ref('')
const selectedDocumentType = ref('')
const viewMode = ref<'card' | 'list'>('card')
const selectedDocuments = ref<string[]>([])
const currentStationId = ref('')

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 18,
  total: 0,
})

// 弹窗
const uploadDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentDocumentId = ref('')

/**
 * 获取分类标签文本
 */
const getCategoryLabel = (category: DocumentCategory) => {
  return category.name
}

/**
 * 获取分类名称
 */
const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || categoryId
}

/**
 * 加载文档分类
 */
const loadCategories = async () => {
  try {
    const response = await getDocumentCategories(currentStationId.value)
    categories.value = response.documentCategories
  } catch (error) {
    ElMessage.error('Failed to load categories')
  }
}

/**
 * 加载文档列表
 */
const loadDocuments = async () => {
  try {
    loading.value = true
    const params = {
      category: activeCategory.value === 'all' ? undefined : activeCategory.value,
      stationId: currentStationId.value || undefined,
      keyword: searchKeyword.value || undefined,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: 'uploadTime',
      sortOrder: 'desc' as const,
    }
    
    // 如果有选择特定文档类型，覆盖分类筛选
    if (selectedDocumentType.value) {
      params.category = selectedDocumentType.value
    }

    const response = await getKnowledgeDocuments(params)
    documents.value = response.documents
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error('Failed to load documents')
  } finally {
    loading.value = false
  }
}

/**
 * 电站选择
 */
const handleStationSelect = (node: StationTreeNode) => {
  console.log('Selected station:', node)
  currentStationId.value = node.regionId
  pagination.current = 1
  loadCategories()
  loadDocuments()
}

/**
 * 分类切换
 */
const handleCategoryChange = (categoryId: string | number) => {
  activeCategory.value = String(categoryId)
  selectedDocumentType.value = '' // 清空文档类型筛选
  pagination.current = 1
  loadDocuments()
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadDocuments()
}

/**
 * 视图模式切换
 */
const handleViewModeChange = () => {
  // 卡片视图和列表视图的分页大小不同
  if (viewMode.value === 'card') {
    pagination.pageSize = 18
  } else {
    pagination.pageSize = 20
  }
  pagination.current = 1
  loadDocuments()
}

/**
 * 文档选择（卡片视图）
 */
const handleDocumentSelect = (documentId: string, selected: boolean) => {
  if (selected) {
    if (!selectedDocuments.value.includes(documentId)) {
      selectedDocuments.value.push(documentId)
    }
  } else {
    const index = selectedDocuments.value.indexOf(documentId)
    if (index > -1) {
      selectedDocuments.value.splice(index, 1)
    }
  }
}

/**
 * 表格选择变化（列表视图）
 */
const handleSelectionChange = (selection: KnowledgeDocument[]) => {
  selectedDocuments.value = selection.map(item => item.id)
}

/**
 * 上传
 */
const handleUpload = () => {
  uploadDialogVisible.value = true
}

/**
 * 批量删除
 */
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedDocuments.value.length} 个文档吗？`,
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await batchDeleteDocuments({ documentIds: selectedDocuments.value })
    ElMessage.success('Batch delete successfully')
    selectedDocuments.value = []
    loadDocuments()
    loadCategories() // 重新加载分类统计
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to batch delete')
    }
  }
}

/**
 * 下载文档
 */
const handleDownload = async (document: KnowledgeDocument) => {
  try {
    const blob = await downloadDocument(document.id)
    downloadBlobFile(blob, `${document.documentName}.${document.fileFormat.toLowerCase()}`)
    ElMessage.success('Download successfully')
  } catch (error) {
    ElMessage.error('Failed to download')
  }
}

/**
 * 预览文档
 */
const handlePreview = async (document: KnowledgeDocument) => {
  try {
    const response = await previewDocument(document.id)
    if (response.canPreview) {
      // 在新窗口打开预览
      window.open(response.previewUrl, '_blank')
    } else {
      ElMessage.warning('This document cannot be previewed')
    }
  } catch (error) {
    ElMessage.error('Failed to preview')
  }
}

/**
 * 编辑文档
 */
const handleEdit = (document: KnowledgeDocument) => {
  currentDocumentId.value = document.id
  editDialogVisible.value = true
}

/**
 * 删除单个文档
 */
const handleDeleteSingle = async (document: KnowledgeDocument) => {
  try {
    await ElMessageBox.confirm(`确定要删除文档"${document.documentName}"吗？`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })

    await deleteDocument(document.id)
    ElMessage.success('Delete successfully')
    loadDocuments()
    loadCategories() // 重新加载分类统计
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete')
    }
  }
}

/**
 * 分页大小变化
 */
const handleSizeChange = () => {
  pagination.current = 1
  loadDocuments()
}

/**
 * 页码变化
 */
const handlePageChange = () => {
  loadDocuments()
}

/**
 * 上传成功回调
 */
const handleUploadSuccess = () => {
  loadDocuments()
  loadCategories()
}

/**
 * 编辑成功回调
 */
const handleEditSuccess = () => {
  loadDocuments()
  loadCategories()
}

// 初始化
onMounted(() => {
  loadCategories()
  loadDocuments()
})
</script>

<style scoped lang="scss">
.knowledge-base-container {
  height: calc(100vh - 120px); // 固定高度，为顶部导航留空间
  display: flex;
  flex-direction: column;
  padding: 20px;

  .category-tabs {
    margin-bottom: 20px;
    
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 0 20px;
    }
  }

  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border: 1px solid rgba(0, 212, 255, 0.15);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    .search-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-controls {
      display: flex;
      align-items: center;
      gap: 10px;

      .view-controls {
        margin-left: 20px;
      }
    }
  }

  .documents-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // 重要：允许flex子元素收缩

    .card-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0; // 重要：允许flex子元素收缩

      .document-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 20px;
        justify-items: center;
        flex: 1;
        overflow-y: auto;
        padding-bottom: 20px; // 为分页留出空间
      }
    }

    .list-view {
      flex: 1;

      .document-name {
        display: flex;
        align-items: center;
        gap: 8px;

        .file-icon {
          font-size: 18px;
          color: #00d4ff;
        }

        .name-text {
          cursor: pointer;
          color: #00d4ff;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .pagination-section {
      margin-top: 20px;
      padding: 16px 20px 16px 0; // 右侧添加20px间距
      display: flex;
      justify-content: flex-end;
      flex-shrink: 0; // 防止分页组件被压缩
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  .knowledge-base-container {
    padding: 16px;

    .category-tabs {
      margin-bottom: 16px;

      :deep(.el-tabs__item) {
        font-size: 13px;
        padding: 0 16px;
      }
    }

    .filter-section {
      padding: 12px;
      margin-bottom: 16px;

      .search-controls {
        gap: 8px;

        .el-input {
          width: 250px !important;
        }

        .el-select {
          width: 130px !important;
        }
      }

      .action-controls {
        gap: 8px;

        .view-controls {
          margin-left: 16px;
        }
      }
    }

    .documents-section {
      .card-view {
        .document-grid {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .knowledge-base-container {
    padding: 12px;
    height: calc(100vh - 100px);

    .category-tabs {
      margin-bottom: 12px;

      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }

      :deep(.el-tabs__nav-scroll) {
        overflow-x: auto;
      }

      :deep(.el-tabs__item) {
        font-size: 12px;
        padding: 0 12px;
        white-space: nowrap;
        min-width: 60px;
      }
    }

    .filter-section {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      padding: 12px;
      margin-bottom: 12px;

      .search-controls {
        flex-direction: column;
        gap: 8px;

        .el-input {
          width: 100% !important;
        }

        .el-select {
          width: 100% !important;
        }

        .el-button {
          width: 100%;
        }
      }

      .action-controls {
        justify-content: space-between;
        align-items: center;
        gap: 8px;

        .view-controls {
          margin-left: 0;
        }
      }
    }

    .documents-section {
      .card-view {
        .document-grid {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          padding-bottom: 16px;
        }
      }

      .list-view {
        // 移动端列表视图使用横向滚动
        overflow-x: auto;

        :deep(.el-table) {
          min-width: 800px;
          font-size: 12px;

          .el-table__header {
            th {
              padding: 8px 4px;
              font-size: 11px;
            }
          }

          .el-table__body {
            td {
              padding: 8px 4px;
              font-size: 11px;
            }
          }
        }
      }

      .pagination-section {
        margin-top: 12px;
        padding: 12px 0;
        justify-content: center;

        :deep(.el-pagination) {
          .el-pagination__sizes,
          .el-pagination__jump {
            display: none;
          }
        }
      }
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  .knowledge-base-container {
    padding: 8px;

    .category-tabs {
      margin-bottom: 8px;

      :deep(.el-tabs__item) {
        font-size: 11px;
        padding: 0 8px;
        min-width: 50px;
      }
    }

    .filter-section {
      padding: 8px;
      margin-bottom: 8px;
      gap: 8px;

      .action-controls {
        .el-button {
          font-size: 11px;
          padding: 6px 8px;
        }
      }
    }

    .documents-section {
      .card-view {
        .document-grid {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
          padding-bottom: 12px;
        }
      }

      .list-view {
        :deep(.el-table) {
          min-width: 700px;
          font-size: 11px;

          .el-table__header {
            th {
              padding: 6px 2px;
              font-size: 10px;
            }
          }

          .el-table__body {
            td {
              padding: 6px 2px;
              font-size: 10px;
            }
          }
        }
      }

      .pagination-section {
        margin-top: 8px;
        padding: 8px 0;

        :deep(.el-pagination) {
          .el-pager {
            li {
              min-width: 24px;
              height: 24px;
              line-height: 24px;
              font-size: 11px;
            }
          }

          .btn-prev,
          .btn-next {
            min-width: 24px;
            height: 24px;
            line-height: 24px;
            font-size: 11px;
          }
        }
      }
    }
  }
}

:deep(.el-table) {
  background-color: transparent;

  th,
  td {
    background-color: transparent;
  }
}

// 移动端下拉菜单优化
@media (max-width: 768px) {
  :deep(.el-select-dropdown) {
    max-height: 200px;
  }
}
</style>