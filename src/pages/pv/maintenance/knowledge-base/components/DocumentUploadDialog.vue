<template>
  <el-dialog
    v-model="visible"
    title="上传文档"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="文档名称" prop="documentName">
            <el-input v-model="formData.documentName" placeholder="请输入文档名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文档类型" prop="documentType">
            <el-select v-model="formData.documentType" placeholder="请选择" style="width: 100%">
              <el-option
                v-for="category in categories.filter(c => c.id !== 'all')"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="文档描述" prop="documentDescription">
        <el-input
          v-model="formData.documentDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入文档描述（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关联电站" prop="associatedStations">
            <el-select
              v-model="formData.associatedStations"
              multiple
              placeholder="请选择关联电站（可选）"
              style="width: 100%"
            >
              <el-option
                v-for="station in stationOptions"
                :key="station.id"
                :label="station.name"
                :value="station.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否公开" prop="isPublic">
            <el-radio-group v-model="formData.isPublic">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="关键词" prop="keywords">
        <div class="keywords-input">
          <el-tag
            v-for="keyword in formData.keywords"
            :key="keyword"
            closable
            @close="removeKeyword(keyword)"
          >
            {{ keyword }}
          </el-tag>
          <el-input
            v-if="keywordInputVisible"
            ref="keywordInputRef"
            v-model="keywordInputValue"
            size="small"
            style="width: 100px"
            @keyup.enter="addKeyword"
            @blur="addKeyword"
          />
          <el-button v-else size="small" @click="showKeywordInput">+ 添加关键词</el-button>
        </div>
      </el-form-item>

      <el-form-item label="文件上传" prop="files" required>
        <div class="upload-section">
          <el-upload
            ref="uploadRef"
            :file-list="fileList"
            :auto-upload="false"
            :limit="10"
            :accept="acceptedFormats"
            multiple
            drag
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="beforeUpload"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、DOC、DOCX、PPT、PPTX、XLS、XLSX、TXT、JPG、PNG、ZIP、RAR 格式<br>
                单个文件最大 50MB，一次最多上传 10 个文件
              </div>
            </template>
          </el-upload>

          <!-- 上传进度 -->
          <div v-if="uploadProgress.length > 0" class="upload-progress">
            <div
              v-for="progress in uploadProgress"
              :key="progress.name"
              class="progress-item"
            >
              <div class="progress-info">
                <span class="file-name">{{ progress.name }}</span>
                <span class="progress-text">{{ progress.percent }}%</span>
              </div>
              <el-progress :percentage="progress.percent" :status="progress.status" />
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="uploading"
        :disabled="fileList.length === 0"
        @click="handleSubmit"
      >
        上传
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import { uploadDocuments } from '@/api/maintenance/knowledgeBaseApi'
import type { DocumentUploadFormData, DocumentCategory } from '@/api/types/knowledge-base'
import { SUPPORTED_FILE_FORMATS, MAX_FILE_SIZE } from '@/api/types/knowledge-base'

interface Props {
  modelValue: boolean
  categories: DocumentCategory[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 表单引用
const formRef = ref<FormInstance>()
const uploadRef = ref()
const keywordInputRef = ref()

// 表单数据
const formData = reactive<DocumentUploadFormData>({
  documentName: '',
  documentType: '',
  documentDescription: '',
  associatedStations: [],
  keywords: [],
  isPublic: true,
})

// 表单验证规则
const formRules: FormRules = {
  documentName: [
    { required: true, message: 'Please enter document name', trigger: 'blur' },
    { max: 100, message: 'Document name cannot exceed 100 characters', trigger: 'blur' },
  ],
  documentType: [
    { required: true, message: 'Please select document type', trigger: 'change' },
  ],
  documentDescription: [
    { max: 500, message: 'Description cannot exceed 500 characters', trigger: 'blur' },
  ],
}

// 文件相关
const fileList = ref<UploadFiles>([])
const uploading = ref(false)
const uploadProgress = ref<Array<{ name: string; percent: number; status: string }>>([])

// 关键词输入
const keywordInputVisible = ref(false)
const keywordInputValue = ref('')

// 电站选项（Mock数据）
const stationOptions = ref([
  { id: 'station001', name: '芜湖南亭市后水灯' },
  { id: 'station002', name: '芜湖繁昌光伏电站' },
  { id: 'station003', name: '南京江宁光伏电站' },
])

// 接受的文件格式
const acceptedFormats = computed(() => {
  return SUPPORTED_FILE_FORMATS.map(format => `.${format.toLowerCase()}`).join(',')
})

/**
 * 文件变化
 */
const handleFileChange = (file: UploadFile, files: UploadFiles) => {
  fileList.value = files
  
  // 自动填充文档名称（如果为空）
  if (!formData.documentName && files.length === 1) {
    const fileName = file.name
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
    formData.documentName = nameWithoutExt
  }
}

/**
 * 文件移除
 */
const handleFileRemove = (file: UploadFile, files: UploadFiles) => {
  fileList.value = files
}

/**
 * 上传前检查
 */
const beforeUpload = (file: File) => {
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error(`文件 ${file.name} 大小超过 50MB 限制`)
    return false
  }

  // 检查文件格式
  const fileExt = file.name.split('.').pop()?.toUpperCase()
  if (!fileExt || !SUPPORTED_FILE_FORMATS.includes(fileExt)) {
    ElMessage.error(`不支持的文件格式: ${fileExt}`)
    return false
  }

  return true
}

/**
 * 显示关键词输入框
 */
const showKeywordInput = () => {
  keywordInputVisible.value = true
  nextTick(() => {
    keywordInputRef.value?.focus()
  })
}

/**
 * 添加关键词
 */
const addKeyword = () => {
  const keyword = keywordInputValue.value.trim()
  if (keyword && !formData.keywords.includes(keyword)) {
    formData.keywords.push(keyword)
  }
  keywordInputValue.value = ''
  keywordInputVisible.value = false
}

/**
 * 移除关键词
 */
const removeKeyword = (keyword: string) => {
  const index = formData.keywords.indexOf(keyword)
  if (index > -1) {
    formData.keywords.splice(index, 1)
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    documentName: '',
    documentType: '',
    documentDescription: '',
    associatedStations: [],
    keywords: [],
    isPublic: true,
  })
  fileList.value = []
  uploadProgress.value = []
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (fileList.value.length === 0) {
      ElMessage.warning('Please select files to upload')
      return
    }

    uploading.value = true

    // 初始化进度
    uploadProgress.value = fileList.value.map(file => ({
      name: file.name,
      percent: 0,
      status: 'active',
    }))

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value.forEach(progress => {
        if (progress.percent < 90) {
          progress.percent += Math.random() * 20
        }
      })
    }, 200)

    // 执行上传
    const files = fileList.value.map(file => file.raw!).filter(Boolean)
    const result = await uploadDocuments(formData, files)

    clearInterval(progressInterval)

    // 完成进度
    uploadProgress.value.forEach(progress => {
      progress.percent = 100
      progress.status = 'success'
    })

    ElMessage.success(`Successfully uploaded ${result.successCount} documents`)
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Upload failed:', error)
    ElMessage.error('Upload failed')
    
    // 错误状态
    uploadProgress.value.forEach(progress => {
      progress.status = 'exception'
    })
  } finally {
    uploading.value = false
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  resetForm()
  visible.value = false
}
</script>

<style scoped lang="scss">
.keywords-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  .el-tag {
    margin: 0;
  }
}

.upload-section {
  width: 100%;

  :deep(.el-upload-dragger) {
    width: 100%;
    height: 120px;
  }

  .upload-progress {
    margin-top: 16px;

    .progress-item {
      margin-bottom: 12px;

      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 12px;

        .file-name {
          color: #ffffff;
        }

        .progress-text {
          color: #00d4ff;
        }
      }
    }
  }
}

:deep(.el-dialog__body) {
  max-height: 600px;
  overflow-y: auto;
}
</style>
