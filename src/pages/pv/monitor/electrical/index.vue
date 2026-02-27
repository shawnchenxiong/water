<template>
  <DeviceMonitorLayout>
    <template #left>
      <StationTree
        device-type="0916"
        @node-click="handleNodeClick"
      />
    </template>
    
    <template #right>
      <div class="electrical-config-page">
        <!-- 搜索筛选区 -->
        <div class="search-filter-bar">
          <el-form :model="queryForm" :inline="true" @submit.prevent="handleSearch">
            <el-form-item label="组态名称">
              <el-input
                v-model="queryForm.name"
                placeholder="请输入组态名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            
            <el-form-item label="组态描述">
              <el-input
                v-model="queryForm.remark"
                placeholder="请输入组态描述"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">
                查询
              </el-button>
              <el-button :icon="Refresh" @click="handleReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>


        <!-- 卡片列表区 -->
        <div v-loading="loading" class="config-card-list">
          <div v-for="item in configList" :key="item.id" class="config-card">
            <!-- 标题 -->
            <el-button
              class="card-title"
              :class="{ 'screen-config': item.isForScreen === 1 }"
              @click="handleTitleClick(item)"
            >
              {{ item.name }}
              {{ item.remark ? `(${item.remark})` : '' }}
            </el-button>
            
            <!-- iframe -->
            <div class="card-iframe-container">
              <!-- iframe容器 -->
              <div class="card-iframe-wrapper" :id="`iframe-wrapper-${item.id}`">
                <div
                  class="iframe-scale-container"
                  :style="{
                    transform: `scale(${getIframeScale(item.id)})`,
                    width: getScaledIframeWidth(item.id),
                    height: getScaledIframeHeight(item.id)
                  }"
                >
                  <iframe
                    v-if="item.id"
                    :src="getPreviewUrlForIframe(item.id)"
                    class="card-iframe"
                    :style="{
                      width: getIframeContentSize(item.id).width ? `${getIframeContentSize(item.id).width}px` : '100%',
                      height: getIframeContentSize(item.id).height ? `${getIframeContentSize(item.id).height}px` : '100%'
                    }"
                    frameborder="0"
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade"
                    @load="handleIframeLoad(item.id)"
                    @error="handleIframeError(item.id)"
                  />
                  <div v-else class="iframe-placeholder">
                    暂无预览地址
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty
            v-if="!loading && configList.length === 0"
            description="暂无组态设计"
          />
        </div>

        <!-- 分页器 -->
        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[6, 12, 18, 24]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          :title="dialogTitle"
          width="500px"
        >
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
          >
            <el-form-item label="组态名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入组态名称" />
            </el-form-item>
            <el-form-item label="组态描述" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入组态描述"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
              确定
            </el-button>
          </template>
        </el-dialog>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh
} from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import {
  getConfigList,
  addConfig,
  updateConfig,
  deleteConfig,
  exportConfig,
  getImportUrl,
  getDesignUrl,
  getPreviewUrl
} from '@/api/monitor/electricalConfig'
import type { ElectricalConfig } from '@/api/monitor/electricalConfig'
import type { StationTreeNode } from '@/types/station'

// 查询表单
const queryForm = reactive({
  name: '',
  remark: '',
  factoryId: undefined as number | undefined
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 6,
  total: 0
})

// 数据列表
const configList = ref<ElectricalConfig[]>([])
const loading = ref(false)

// iframe缩放比例（每个卡片独立的缩放比例）
const iframeScales = ref<Record<number, number>>({})

// iframe内容尺寸（每个卡片独立的内容尺寸）
const iframeContentSizes = ref<Record<number, { width: number; height: number }>>({})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增组态')
const formRef = ref()
const formData = reactive({
  id: null as number | null,
  name: '',
  remark: ''
})
const submitLoading = ref(false)

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入组态名称', trigger: 'blur' }
  ]
}

// 上传相关
const uploadRef = ref()
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  }
})
const importUrl = computed(() => getImportUrl())

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const response = await getConfigList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      name: queryForm.name || undefined,
      remark: queryForm.remark || undefined,
      factoryId: queryForm.factoryId
    })
    
    if (response.success) {
      configList.value = response.result.data || []
      pagination.total = response.result.total || 0
    } else {
      ElMessage.error(response.message || '加载数据失败')
    }
  } catch (error: any) {
    console.error('加载数据失败:', error)
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  queryForm.name = ''
  queryForm.remark = ''
  queryForm.factoryId = undefined
  pagination.current = 1
  loadData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增组态'
  formData.id = null
  formData.name = ''
  formData.remark = ''
  dialogVisible.value = true
}

// 编辑
const handleEdit = (item: ElectricalConfig) => {
  dialogTitle.value = '编辑组态'
  formData.id = item.id || null
  formData.name = item.name
  formData.remark = item.remark || ''
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const data: Partial<ElectricalConfig> = {
        name: formData.name,
        remark: formData.remark
      }
      
      if (formData.id) {
        data.id = formData.id
      }
      
      const response = formData.id 
        ? await updateConfig(data)
        : await addConfig(data)
      
      if (response.success) {
        ElMessage.success(formData.id ? '修改成功' : '新增成功')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(response.message || '操作失败')
      }
    } catch (error: any) {
      console.error('提交失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除
const handleDelete = async (item: ElectricalConfig) => {
  if (!item.id) return
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除组态名为"${item.name}"的数据项？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteConfig(item.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 导出
const handleExport = async (item: ElectricalConfig) => {
  if (!item.id) return
  
  try {
    const response = await exportConfig(item.id)
    
    if (response.size === 0) {
      ElMessage.warning('文件为空，请下载其他文件')
      return
    }
    
    const blob = new Blob([response], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.download = `${item.name}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error: any) {
    console.error('导出失败:', error)
    ElMessage.error(error.message || '导出失败')
  }
}

// 上传前检查
const beforeUpload = (file: File) => {
  const isTxt = file.name.endsWith('.txt')
  if (!isTxt) {
    ElMessage.error('只能上传 .txt 格式的文件')
  }
  return isTxt
}

// 上传成功
const handleUploadSuccess = (response: any) => {
  if (response.success) {
    ElMessage.success('导入成功')
    loadData()
  } else {
    ElMessage.error(`导入失败: ${response.message}`)
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('文件上传失败，请检查网络或文件格式')
}

// 设计
const handleDesign = (item: ElectricalConfig) => {
  if (!item.id) return
  const url = getDesignUrl(item.id)
  window.open(url, '_blank')
}

// 预览/运行
const handlePreview = (item: ElectricalConfig) => {
  if (!item.id) return
  const url = getPreviewUrl(item.id)
  window.open(url, '_blank')
}

// 获取iframe的预览URL
const getPreviewUrlForIframe = (deviceId: number): string => {
  const url = getPreviewUrl(deviceId)
  console.log('iframe URL:', url)
  return url
}

// iframe加载成功
const handleIframeLoad = (deviceId: number) => {
  console.log('iframe loaded successfully for deviceId:', deviceId)
  // 延迟一下，确保iframe内容完全加载，然后自动适应窗口
  setTimeout(() => {
    handleZoomFit(deviceId)
  }, 500)
  
  // 如果500ms后还没获取到尺寸，再尝试一次
  setTimeout(() => {
    const size = iframeContentSizes.value[deviceId]
    if (!size || size.width === 0 || size.height === 0) {
      handleZoomFit(deviceId)
    }
  }, 1500)
}

// iframe加载失败
const handleIframeError = (deviceId: number) => {
  console.error('iframe load error for deviceId:', deviceId)
  ElMessage.error('预览页面加载失败，请检查网络连接或URL是否正确')
}

// 获取iframe的缩放比例（默认1.0）
const getIframeScale = (deviceId: number): number => {
  return iframeScales.value[deviceId] ?? 1.0
}

// 设置iframe的缩放比例
const setIframeScale = (deviceId: number, scale: number) => {
  // 限制缩放范围在0.1到3.0之间
  const clampedScale = Math.max(0.1, Math.min(3.0, scale))
  iframeScales.value[deviceId] = clampedScale
}


// 适应窗口（计算合适的缩放比例）
const handleZoomFit = (deviceId: number) => {
  const wrapper = document.getElementById(`iframe-wrapper-${deviceId}`)
  const iframe = wrapper?.querySelector('iframe') as HTMLIFrameElement
  if (!wrapper || !iframe) return
  
  // 获取容器尺寸（卡片实际大小）
  const containerWidth = wrapper.clientWidth
  const containerHeight = wrapper.clientHeight
  
  // 尝试获取iframe内容的实际尺寸
  let iframeContentWidth = 0
  let iframeContentHeight = 0
  
  try {
    // 尝试从iframe内部获取文档尺寸
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (iframeDoc) {
      const scrollWidth = iframeDoc.documentElement.scrollWidth || iframeDoc.body?.scrollWidth || 0
      const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body?.scrollHeight || 0
      const clientWidth = iframeDoc.documentElement.clientWidth || iframeDoc.body?.clientWidth || 0
      const clientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body?.clientHeight || 0
      
      // 使用较大的值（scrollWidth/Height 或 clientWidth/Height）
      iframeContentWidth = Math.max(scrollWidth, clientWidth)
      iframeContentHeight = Math.max(scrollHeight, clientHeight)
    }
  } catch (e) {
    // 跨域限制，无法获取iframe内部尺寸
  }
  
  // 如果获取到的尺寸无效，使用默认尺寸（组态设计通常使用1920x1080）
  // 这样可以正确计算缩放比例，避免iframe内容过大
  if (iframeContentWidth <= 0 || iframeContentHeight <= 0) {
    // 使用常见的组态设计尺寸作为默认值
    iframeContentWidth = 1920
    iframeContentHeight = 1080
  }
  
  // 保存iframe内容尺寸
  iframeContentSizes.value[deviceId] = {
    width: iframeContentWidth,
    height: iframeContentHeight
  }
  
  // 计算适应窗口的缩放比例（取较小的比例，确保完全显示且不出现滚动条）
  const scaleX = containerWidth / iframeContentWidth
  const scaleY = containerHeight / iframeContentHeight
  const fitScale = Math.min(scaleX, scaleY)
  
  setIframeScale(deviceId, fitScale)
}

// 获取iframe内容尺寸
const getIframeContentSize = (deviceId: number): { width: number; height: number } => {
  return iframeContentSizes.value[deviceId] || { width: 0, height: 0 }
}

// 获取缩放后的iframe容器宽度（避免撑大页面）
const getScaledIframeWidth = (deviceId: number): string => {
  const size = getIframeContentSize(deviceId)
  const scale = getIframeScale(deviceId)
  if (size.width > 0 && scale > 0) {
    // 返回缩放后的宽度，这样不会撑大容器
    return `${size.width * scale}px`
  }
  return '100%'
}

// 获取缩放后的iframe容器高度（避免撑大页面）
const getScaledIframeHeight = (deviceId: number): string => {
  const size = getIframeContentSize(deviceId)
  const scale = getIframeScale(deviceId)
  if (size.height > 0 && scale > 0) {
    // 返回缩放后的高度
    return `${size.height * scale}px`
  }
  return '100%'
}

// 点击标题在新标签页打开预览
const handleTitleClick = (item: ElectricalConfig) => {
  if (!item.id) return
  const url = getPreviewUrl(item.id)
  window.open(url, '_blank')
}

// 分页
const handleSizeChange = () => {
  pagination.current = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// 树节点点击处理
const handleNodeClick = (node: StationTreeNode) => {
  // 设置选中的电站ID作为搜索条件
  if (node.factoryId) {
    queryForm.factoryId = node.factoryId
  } else {
    // 如果没有 factoryId，使用 regionId（兼容处理）
    queryForm.factoryId = node.regionId ? Number(node.regionId) : undefined
  }
  // 重置到第一页并重新加载数据
  pagination.current = 1
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.electrical-config-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(10, 24, 45, 0.8);
  padding: 3px;
  overflow-x: hidden; /* 防止横向滚动 */
  overflow-y: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  /* 移动端调整 */
  @media (max-width: 768px) {
    padding: 8px;
  }
}

.search-filter-bar {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 5px 16px 3px;
  margin-bottom: 12px;
  
  /* 移动端调整 */
  @media (max-width: 768px) {
    padding: 8px 12px;
    
    :deep(.el-form) {
      flex-direction: column;
    }
    
    :deep(.el-form-item) {
      width: 100%;
      margin-bottom: 10px;
    }
    
    :deep(.el-input) {
      width: 100% !important;
    }
  }
  
  :deep(.el-form-item) {
    margin-bottom: 8px;
  }
  
  :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.85);
  }
  
  :deep(.el-input__inner) {
    background: rgba(0, 10, 20, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
}

.action-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.config-card-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 一行3个，每个占1/3宽度 */
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden; /* 防止横向滚动 */
  padding-right: 10px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  align-content: start; /* 卡片从顶部开始排列，避免被拉伸 */
  
  /* 平板端：一行2个 */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr); /* 一行2个，每个占1/2宽度 */
    gap: 12px;
  }
  
  /* 移动端：一行1个 */
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* 一行1个，占100%宽度 */
    gap: 12px;
    padding-right: 5px;
  }
  
  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 212, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.5);
    }
  }
}

.config-card {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s;
  width: 100%;
  max-width: 100%; /* 防止超出容器 */
  height: fit-content; /* 根据内容自适应高度 */
  min-height: 350px; /* 500px * 0.7 = 350px */
  box-sizing: border-box; /* 包含padding在宽度内 */
  
  /* 移动端调整 */
  @media (max-width: 768px) {
    padding: 8px;
    gap: 10px;
    min-height: 280px; /* 400px * 0.7 = 280px */
  }
  
  &:hover {
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  align-self: flex-start;
  
  /* 移动端调整 */
  @media (max-width: 768px) {
    font-size: 14px;
    padding-bottom: 8px;
  }
}

.card-iframe-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%; /* 确保容器占满卡片宽度 */
  min-height: 0; /* 允许flex收缩 */
  overflow: hidden; /* 防止内容溢出 */
}


.card-iframe-wrapper {
  flex: 1;
  width: 100%; /* 确保占满容器宽度 */
  min-height: 0; /* 允许flex收缩，重要！让flex子元素可以收缩 */
  overflow: hidden;
  position: relative;
  background: #000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.iframe-scale-container {
  /* 尺寸由JavaScript动态设置，设置为原始内容尺寸 */
  /* 使用position: absolute脱离文档流，避免撑大容器 */
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  transition: transform 0.2s ease;
  box-sizing: border-box;
}

.card-iframe {
  /* 尺寸由JavaScript动态设置 */
  border: none;
  background: #000;
  display: block;
  flex-shrink: 0;
}

.iframe-placeholder {
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding-top: 30px;
  padding-bottom: 10px;
  margin-top: auto;
  
  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pagination__sizes,
    .el-pagination__jump {
      color: rgba(255, 255, 255, 0.85);
    }
    
    .btn-prev,
    .btn-next,
    .el-pager li {
      background: rgba(0, 10, 20, 0.6);
      border-color: rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);
      
      &:hover {
        color: #00d4ff;
      }
      
      &.is-active {
        background: rgba(0, 212, 255, 0.2);
        border-color: rgba(0, 212, 255, 0.6);
        color: #00d4ff;
      }
    }
    
    .el-select .el-input__inner {
      background: rgba(0, 10, 20, 0.6);
      border-color: rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);
    }
    
    .el-input__inner {
      background: rgba(0, 10, 20, 0.6);
      border-color: rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

/* 弹窗样式 */
:deep(.el-dialog) {
  background: rgba(10, 24, 45, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.3);
  
  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  }
  
  .el-dialog__title {
    color: #00d4ff;
  }
  
  .el-form-item__label {
    color: rgba(255, 255, 255, 0.85);
  }
  
  .el-input__inner,
  .el-textarea__inner {
    background: rgba(0, 10, 20, 0.6);
    border-color: rgba(0, 212, 255, 0.3);
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
}
</style>