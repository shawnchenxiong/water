<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    :width="dialogWidth"
    :close-on-click-modal="false"
    class="device-ledger-dialog"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :disabled="mode === 'view'"
    >
      <el-row :gutter="20">
        <!-- 左列 -->
        <el-col :span="12">
          <el-form-item label="选择源" prop="dataSource">
            <el-select v-model="formData.dataSource" placeholder="请选择" style="width: 100%">
              <el-option label="选择源" value="选择源" />
            </el-select>
          </el-form-item>

          <el-form-item label="电站名称" prop="stationId">
            <el-select
              v-model="formData.stationId"
              placeholder="请选择"
              filterable
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

          <el-form-item label="设备编号" prop="deviceNumber">
            <el-input v-model="formData.deviceNumber" placeholder="请输入设备编号" />
          </el-form-item>

          <el-form-item label="设备类型" prop="deviceCategory">
            <el-select
              v-model="formData.deviceCategory"
              placeholder="请选择"
              style="width: 100%"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="category in basicData?.deviceCategories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="设备型号" prop="deviceType">
            <el-input v-model="formData.deviceType" placeholder="请输入设备型号" />
          </el-form-item>

          <el-form-item label="安装地点" prop="installLocation">
            <el-input v-model="formData.installLocation" placeholder="请输入安装地点" />
          </el-form-item>

          <el-form-item label="接入组件的支数编号" prop="connectedComponentsSerialNumbers">
            <el-input
              v-model="formData.connectedComponentsSerialNumbers"
              placeholder="请输入"
            />
          </el-form-item>

          <el-form-item label="所接组件厂商" prop="connectedComponentManufacturer">
            <el-input
              v-model="formData.connectedComponentManufacturer"
              placeholder="请输入"
            />
          </el-form-item>

          <el-form-item label="所接组件类别" prop="connectedComponentType">
            <el-input v-model="formData.connectedComponentType" placeholder="请输入" />
          </el-form-item>

          <el-form-item label="保修日期" prop="warrantyDate">
            <el-date-picker
              v-model="formData.warrantyDate"
              type="date"
              placeholder="请选择日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>

        <!-- 右列 -->
        <el-col :span="12">
          <el-form-item label="状态" prop="deviceStatus">
            <el-select v-model="formData.deviceStatus" placeholder="请选择" style="width: 100%">
              <el-option
                v-for="status in basicData?.deviceStatuses"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="设备名称" prop="deviceName">
            <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
          </el-form-item>

          <el-form-item label="KKS编码" prop="kksCode">
            <el-input v-model="formData.kksCode" placeholder="请输入KKS编码" />
          </el-form-item>

          <el-form-item label="设备子类" prop="deviceSubCategory">
            <el-select
              v-model="formData.deviceSubCategory"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="subCategory in subCategoryOptions"
                :key="subCategory.value"
                :label="subCategory.label"
                :value="subCategory.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="生产厂家" prop="manufacturer">
            <el-select
              v-model="formData.manufacturer"
              placeholder="请选择或输入"
              filterable
              allow-create
              style="width: 100%"
            >
              <el-option
                v-for="manu in manufacturerOptions"
                :key="manu.id"
                :label="manu.name"
                :value="manu.name"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="所属变电站" prop="associatedStation">
            <el-input v-model="formData.associatedStation" placeholder="请输入" />
          </el-form-item>

          <el-form-item label="接入组件容量(kWp)" prop="connectedComponentCapacity">
            <el-input-number
              v-model="formData.connectedComponentCapacity"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="所接组件型号" prop="connectedComponentModel">
            <el-input v-model="formData.connectedComponentModel" placeholder="请输入" />
          </el-form-item>

          <el-form-item label="所接组件期间" prop="connectedComponentPeriod">
            <el-input v-model="formData.connectedComponentPeriod" placeholder="请输入" />
          </el-form-item>

          <el-form-item label="投产日期" prop="commissioningDate">
            <el-date-picker
              v-model="formData.commissioningDate"
              type="date"
              placeholder="请选择日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 备注 -->
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（最多500字）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitLoading" @click="handleSubmit">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createDeviceLedger,
  updateDeviceLedger,
  getDeviceLedgerDetail,
} from '@/api/maintenance/deviceLedgerApi'
import type {
  DeviceLedgerFormData,
  DeviceLedgerBasicData,
  StationTreeNode,
} from '@/api/types/device-ledger'

interface Props {
  modelValue: boolean
  mode: 'add' | 'edit' | 'view'
  deviceId?: string
  basicData: DeviceLedgerBasicData | null
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

// 弹框宽度
const dialogWidth = computed(() => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth
    if (screenWidth <= 480) {
      return '98%'  // 小屏移动端
    } else if (screenWidth <= 768) {
      return '95%'  // 移动端
    } else if (screenWidth <= 1024) {
      return '90%'  // 平板端
    }
  }
  return '1200px'  // 桌面端
})

// 标签宽度
const labelWidth = computed(() => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth
    if (screenWidth <= 480) {
      return '80px'   // 小屏移动端
    } else if (screenWidth <= 768) {
      return '100px'  // 移动端
    } else if (screenWidth <= 1024) {
      return '120px'  // 平板端
    }
  }
  return '160px'  // 桌面端
})

// 弹窗标题
const dialogTitle = computed(() => {
  const titleMap = {
    add: '新增台账',
    edit: '编辑台账',
    view: '查看台账',
  }
  return titleMap[props.mode]
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<DeviceLedgerFormData>({
  dataSource: '选择源',
  stationId: '',
  deviceNumber: '',
  deviceCategory: '',
  deviceType: '',
  installLocation: '',
  connectedComponentsSerialNumbers: '',
  connectedComponentManufacturer: '',
  connectedComponentType: '',
  warrantyDate: '',
  deviceStatus: '收货',
  deviceName: '',
  kksCode: '',
  deviceSubCategory: '',
  manufacturer: '',
  associatedStation: '',
  connectedComponentCapacity: 0,
  connectedComponentModel: '',
  connectedComponentPeriod: '',
  commissioningDate: '',
  remarks: '',
})

// 表单验证规则
const formRules: FormRules = {
  stationId: [{ required: true, message: 'Please select station', trigger: 'change' }],
  deviceNumber: [{ required: true, message: 'Please enter device number', trigger: 'blur' }],
  deviceCategory: [{ required: true, message: 'Please select device category', trigger: 'change' }],
  deviceType: [{ required: true, message: 'Please enter device type', trigger: 'blur' }],
  deviceStatus: [{ required: true, message: 'Please select device status', trigger: 'change' }],
  deviceName: [{ required: true, message: 'Please enter device name', trigger: 'blur' }],
  deviceSubCategory: [{ required: true, message: 'Please select device sub category', trigger: 'change' }],
  manufacturer: [{ required: true, message: 'Please select or enter manufacturer', trigger: 'change' }],
}

// 提交加载状态
const submitLoading = ref(false)

// 电站选项（从电站树中提取）
const stationOptions = computed(() => {
  if (!props.basicData?.stations) return []
  const stations: StationTreeNode[] = []
  const extractStations = (nodes: StationTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.type === 'station') {
        stations.push(node)
      }
      if (node.children) {
        extractStations(node.children)
      }
    })
  }
  extractStations(props.basicData.stations)
  return stations
})

// 设备子类选项（根据设备分类动态变化）
const subCategoryOptions = computed(() => {
  if (!formData.deviceCategory || !props.basicData?.deviceCategories) return []
  const category = props.basicData.deviceCategories.find(
    (c) => c.value === formData.deviceCategory
  )
  return category?.subCategories || []
})

// 厂商选项（根据设备分类过滤）
const manufacturerOptions = computed(() => {
  if (!props.basicData?.manufacturers) return []
  if (!formData.deviceCategory) return props.basicData.manufacturers
  return props.basicData.manufacturers.filter((m) =>
    m.category.includes(formData.deviceCategory)
  )
})

/**
 * 设备分类变化
 */
const handleCategoryChange = () => {
  // 清空设备子类
  formData.deviceSubCategory = ''
  // 清空厂商（如果当前厂商不在新分类的厂商列表中）
  if (formData.manufacturer) {
    const isValid = manufacturerOptions.value.some((m) => m.name === formData.manufacturer)
    if (!isValid) {
      formData.manufacturer = ''
    }
  }
}

/**
 * 加载设备详情
 */
const loadDeviceDetail = async () => {
  if (!props.deviceId) return

  try {
    const detail = await getDeviceLedgerDetail(props.deviceId)
    if (detail) {
      Object.assign(formData, {
        dataSource: '选择源',
        stationId: detail.stationId,
        deviceNumber: detail.deviceNumber,
        deviceCategory: detail.deviceCategoryCode,
        deviceType: detail.deviceType,
        installLocation: detail.installLocation,
        connectedComponentsSerialNumbers: detail.connectedComponentsSerialNumbers,
        connectedComponentManufacturer: detail.connectedComponentManufacturer,
        connectedComponentType: detail.connectedComponentType,
        warrantyDate: detail.warrantyDate,
        deviceStatus: detail.deviceStatus,
        deviceName: detail.deviceName,
        kksCode: detail.kksCode,
        deviceSubCategory: detail.deviceSubCategory,
        manufacturer: detail.manufacturer,
        associatedStation: detail.associatedStation,
        connectedComponentCapacity: detail.connectedComponentCapacity,
        connectedComponentModel: detail.connectedComponentModel,
        connectedComponentPeriod: detail.connectedComponentPeriod,
        commissioningDate: detail.commissioningDate,
        remarks: detail.remarks,
      })
    }
  } catch (error) {
    ElMessage.error('Failed to load device detail')
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    dataSource: '选择源',
    stationId: '',
    deviceNumber: '',
    deviceCategory: '',
    deviceType: '',
    installLocation: '',
    connectedComponentsSerialNumbers: '',
    connectedComponentManufacturer: '',
    connectedComponentType: '',
    warrantyDate: '',
    deviceStatus: '收货',
    deviceName: '',
    kksCode: '',
    deviceSubCategory: '',
    manufacturer: '',
    associatedStation: '',
    connectedComponentCapacity: 0,
    connectedComponentModel: '',
    connectedComponentPeriod: '',
    commissioningDate: '',
    remarks: '',
  })
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (props.mode === 'add') {
      await createDeviceLedger(formData)
      ElMessage.success('Create successfully')
    } else if (props.mode === 'edit' && props.deviceId) {
      await updateDeviceLedger(props.deviceId, formData)
      ElMessage.success('Update successfully')
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Form validation or submit failed:', error)
  } finally {
    submitLoading.value = false
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
    if (newVal) {
      if (props.mode === 'edit' || props.mode === 'view') {
        loadDeviceDetail()
      } else {
        resetForm()
      }
    }
  }
)
</script>

<style scoped lang="scss">
:deep(.el-dialog__body) {
  max-height: 600px;
  overflow-y: auto;
}

:deep(.el-form-item) {
  margin-bottom: 18px;

  .el-form-item__label {
    color: #cccccc;
    font-weight: 500;
  }
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-date-picker),
:deep(.el-input-number) {
  .el-input__wrapper {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 6px;

    &:hover {
      border-color: rgba(0, 212, 255, 0.4);
    }

    &.is-focus {
      border-color: #00d4ff;
      box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
    }
  }

  .el-input__inner {
    color: #ffffff;
  }
}

:deep(.el-input-number) {
  width: 100%;
  
  .el-input-number__decrease,
  .el-input-number__increase {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border: none;
    color: #cccccc;

    &:hover {
      color: #00d4ff;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.08) 100%);
    }
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;

    &:hover {
      border-color: rgba(0, 212, 255, 0.4);
    }

    &:focus {
      border-color: #00d4ff;
      box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin-top: 3vh;

    .el-dialog__body {
      max-height: 70vh;
    }
  }

  :deep(.el-form) {
    label-width: 120px !important;

    .el-form-item {
      margin-bottom: 16px;

      .el-form-item__label {
        font-size: 13px;
      }
    }
  }

  :deep(.el-row) {
    .el-col {
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 2vh auto !important;
    max-height: 96vh;

    .el-dialog__header {
      padding: 16px;

      .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: #00d4ff;
      }
    }

    .el-dialog__body {
      padding: 16px;
      max-height: 78vh;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(0, 212, 255, 0.2);

      .el-button {
        width: 100px;
        font-size: 14px;
        height: 36px;
      }
    }
  }

  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 12px;
      flex-direction: column;
      align-items: stretch;

      .el-form-item__label {
        font-size: 12px;
        line-height: 1.4;
        margin-bottom: 6px;
        text-align: left !important;
        padding-bottom: 0;
        color: #cccccc;
        font-weight: 500;
      }

      .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }

  :deep(.el-row) {
    margin: 0 !important;

    .el-col {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
      margin-bottom: 8px;
      padding: 0 !important;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-picker),
  :deep(.el-input-number) {
    width: 100%;

    .el-input__wrapper {
      height: 36px;
      font-size: 14px;
    }
  }

  :deep(.el-input-number) {
    .el-input-number__decrease,
    .el-input-number__increase {
      height: 18px;
      line-height: 16px;

      &:hover {
        color: #00d4ff;
      }
    }
  }

  :deep(.el-textarea) {
    .el-textarea__inner {
      font-size: 14px;
      min-height: 80px;
    }
  }
}

// 小屏移动端适配
@media (max-width: 480px) {
  :deep(.el-dialog) {
    margin: 1vh auto !important;
    max-height: 98vh;

    .el-dialog__header {
      padding: 12px;

      .el-dialog__title {
        font-size: 15px;
        font-weight: 600;
        color: #00d4ff;
      }

      .el-dialog__headerbtn {
        top: 12px;
        right: 12px;
      }
    }

    .el-dialog__body {
      padding: 12px;
      max-height: 88vh;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 8px 12px;
      display: flex;
      gap: 8px;
      border-top: 1px solid rgba(0, 212, 255, 0.2);
      
      .el-button {
        flex: 1;
        height: 36px;
        font-size: 13px;
      }
    }
  }

  :deep(.el-form) {

    .el-form-item {
      margin-bottom: 8px;
      flex-direction: column;
      align-items: stretch;

      .el-form-item__label {
        font-size: 11px;
        line-height: 1.3;
        margin-bottom: 4px;
        text-align: left !important;
        padding-bottom: 0;
        color: #cccccc;
        font-weight: 500;
      }

      .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }

  :deep(.el-row) {
    margin: 0 !important;

    .el-col {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
      margin-bottom: 6px;
      padding: 0 !important;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-picker),
  :deep(.el-input-number) {
    .el-input__wrapper {
      height: 32px;
      font-size: 13px;
    }
  }

  :deep(.el-input-number) {
    .el-input-number__decrease,
    .el-input-number__increase {
      height: 16px;
      line-height: 14px;
      font-size: 11px;

      &:hover {
        color: #00d4ff;
      }
    }
  }

  :deep(.el-textarea) {
    .el-textarea__inner {
      font-size: 13px;
      min-height: 60px;
    }
  }
}

// 下拉菜单样式
:deep(.el-select-dropdown) {
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;

  .el-select-dropdown__item {
    color: #cccccc;

    &:hover {
      background-color: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
    }

    &.is-selected {
      background-color: #00d4ff;
      color: #ffffff;
    }
  }
}

// 日期选择器下拉面板样式
:deep(.el-date-picker__editor) {
  background: transparent;
}

:deep(.el-picker-panel) {
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  color: #ffffff;
}
</style>

