<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="450px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form :model="formData">
      <!-- 租户选择 -->
      <el-form-item v-if="isMultiTenant">
        <template #label>
          <div class="label-with-icon">
            <el-icon :size="20" color="#87d068">
              <OfficeBuilding />
            </el-icon>
            <span class="ml-2">选择登录租户</span>
          </div>
        </template>
        <el-select
          v-model="formData.tenantId"
          placeholder="您有多个租户，请选择登录租户"
          class="w-full"
          :class="{ 'valid-error': validateStatus.tenant === 'error' }"
          @change="handleTenantChange"
        >
          <el-option
            v-for="tenant in tenantList"
            :key="tenant.id"
            :label="tenant.name"
            :value="tenant.id"
          />
        </el-select>
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { TenantInfo, DepartInfo, LoginResponse } from '@/types/user'

// Emits
interface Emits {
  (e: 'success', tenantId: number, tenantName: string): void
}
const emit = defineEmits<Emits>()

// 响应式数据
const visible = ref(false)
const isMultiTenant = ref(false)
const isMultiDepart = ref(false)
const tenantList = ref<TenantInfo[]>([])
const departList = ref<DepartInfo[]>([])
const username = ref('')

const formData = reactive({
  tenantId: undefined as number | undefined,
})

const validateStatus = reactive({
  tenant: '',
  depart: '',
})

// 对话框标题
const dialogTitle = computed(() => {
  return '请选择租户'
})

/**
 * 清空数据
 */
const clear = () => {
  visible.value = false
  isMultiTenant.value = false
  isMultiDepart.value = false
  tenantList.value = []
  departList.value = []
  formData.tenantId = undefined
  validateStatus.tenant = ''
  validateStatus.depart = ''
}

/**
 * 处理部门逻辑
 */
const bizDepart = (loginResult: LoginResponse) => {
  const multiDepart = loginResult.multi_depart
  // 0:无部门 1:一个部门 2:多个部门
  if (multiDepart === 0) {
    ElMessage.warning('您尚未归属部门,请确认账号信息')
    isMultiDepart.value = false
  } else if (multiDepart === 2) {
    visible.value = true
    isMultiDepart.value = true
    departList.value = loginResult.departs || []
  } else {
    isMultiDepart.value = false
  }
}

/**
 * 处理租户列表逻辑
 */
const bizTenantList = (loginResult: LoginResponse) => {
  const tenants = loginResult.tenantList
  if (Array.isArray(tenants)) {
    if (tenants.length === 0) {
      // 无租户
      isMultiTenant.value = false
      formData.tenantId = undefined
    } else if (tenants.length === 1) {
      // 单租户，直接保存租户信息
      formData.tenantId = tenants[0].id
      isMultiTenant.value = false
      // 保存租户列表，用于后续获取租户名称
      tenantList.value = tenants
    } else {
      // 多租户，显示选择对话框，默认不选择任何租户
      visible.value = true
      isMultiTenant.value = true
      tenantList.value = tenants
      formData.tenantId = undefined // 默认为空，让用户选择
    }
  }
}

/**
 * 显示租户/部门选择对话框
 */
const show = (loginResult: LoginResponse, user: string) => {
  clear()
  username.value = user
  
  // 处理部门
  bizDepart(loginResult)
  
  // 处理租户
  bizTenantList(loginResult)
  
  // 如果不需要弹窗，直接触发成功回调
  if (!visible.value) {
    // 获取租户名称
    const tenantName = tenantList.value.find(t => t.id === formData.tenantId)?.name || ''
    emit('success', formData.tenantId || 0, tenantName)
  }
}


/**
 * 确认选择
 */
const handleConfirm = async () => {
  // 验证租户
  if (!formData.tenantId) {
    validateStatus.tenant = 'error'
    ElMessage.warning('请选择登录租户')
    return
  }

  // 关闭对话框
  visible.value = false
  
  // 获取租户名称
  const tenantName = tenantList.value.find(t => t.id === formData.tenantId)?.name || ''
  
  // 触发成功回调
  emit('success', formData.tenantId, tenantName)
}

/**
 * 租户选择改变
 */
const handleTenantChange = () => {
  validateStatus.tenant = ''
}

// 暴露方法给父组件
defineExpose({
  show,
  clear,
})
</script>

<style scoped lang="scss">
.label-with-icon {
  display: flex;
  align-items: center;
}

.ml-2 {
  margin-left: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.w-full {
  width: 100%;
}

.valid-error {
  :deep(.el-input__wrapper) {
    border-color: var(--el-color-danger);
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }
}
</style>

