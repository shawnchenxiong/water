<template>
  <el-dialog
    v-model="visible"
    title="编辑文档"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="文档名称" prop="documentName">
        <el-input v-model="formData.documentName" placeholder="请输入文档名称" />
      </el-form-item>

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

      <el-form-item label="是否公开" prop="isPublic">
        <el-radio-group v-model="formData.isPublic">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>

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
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { updateDocument, getDocumentDetail } from '@/api/maintenance/knowledgeBaseApi'
import type { DocumentUpdateData, DocumentCategory } from '@/api/types/knowledge-base'

interface Props {
  modelValue: boolean
  documentId: string
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
const keywordInputRef = ref()

// 表单数据
const formData = reactive<DocumentUpdateData>({
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

// 提交状态
const submitting = ref(false)

// 关键词输入
const keywordInputVisible = ref(false)
const keywordInputValue = ref('')

// 电站选项（Mock数据）
const stationOptions = ref([
  { id: 'station001', name: '芜湖南亭市后水灯' },
  { id: 'station002', name: '芜湖繁昌光伏电站' },
  { id: 'station003', name: '南京江宁光伏电站' },
])

/**
 * 加载文档详情
 */
const loadDocumentDetail = async () => {
  if (!props.documentId) return

  try {
    const document = await getDocumentDetail(props.documentId)
    if (document) {
      Object.assign(formData, {
        documentName: document.documentName,
        documentType: document.documentType,
        documentDescription: document.documentDescription,
        associatedStations: [...document.associatedStations],
        keywords: [...document.keywords],
        isPublic: document.isPublic,
      })
    }
  } catch (error) {
    ElMessage.error('Failed to load document detail')
  }
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
  if (keyword && !formData.keywords!.includes(keyword)) {
    formData.keywords!.push(keyword)
  }
  keywordInputValue.value = ''
  keywordInputVisible.value = false
}

/**
 * 移除关键词
 */
const removeKeyword = (keyword: string) => {
  const index = formData.keywords!.indexOf(keyword)
  if (index > -1) {
    formData.keywords!.splice(index, 1)
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
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    await updateDocument(props.documentId, formData)
    ElMessage.success('Update successfully')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Update failed:', error)
    ElMessage.error('Update failed')
  } finally {
    submitting.value = false
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  resetForm()
  visible.value = false
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.documentId) {
      loadDocumentDetail()
    }
  }
)
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
</style>
