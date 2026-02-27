<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑策略' : '新增策略'"
    :width="isMobile ? '95%' : '850px'"
    :close-on-click-modal="false"
    @close="handleClose"
    class="strategy-form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="left"
    >
      <!-- 策略状态 -->
      <el-form-item label="策略状态" prop="isEnabled">
        <el-switch
          v-model="formData.isEnabled"
          :active-value="'1'"
          :inactive-value="'0'"
          active-text="已启用"
          inactive-text="已停用"
        />
      </el-form-item>

      <!-- 告警名称 -->
      <el-form-item label="告警名称" prop="alarmName" required>
        <el-input
          v-model="formData.alarmName"
          placeholder="输入告警名称"
          style="width: 400px"
        />
      </el-form-item>

      <!-- 告警等级 -->
      <el-form-item label="告警等级" prop="alarmLevel" required>
        <el-select
          v-model="formData.alarmLevel"
          placeholder="请选择告警等级"
          style="width: 400px"
        >
          <el-option label="严重" value="2" />
          <el-option label="一般" value="1" />
          <el-option label="紧急" value="0" />
        </el-select>
      </el-form-item>

      <!-- 触发条件 -->
      <el-form-item label="触发条件" required>
        <div class="trigger-conditions">
          <!-- 第一行：厂站和机组 -->
          <div class="condition-row">
            <el-select
              v-model="formData.factoryId"
              placeholder="请选择"
              style="width: 200px; margin-right: 10px"
              @change="handleFactoryChange"
            >
              <el-option
                v-for="item in factoryOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
            <el-select
              v-model="formData.unitId"
              placeholder="请选择设备"
              style="width: 200px"
              :disabled="!formData.factoryId"
              @change="handleUnitChange"
            >
              <el-option
                v-for="item in unitOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </div>

          <!-- 第二行：设备和点位 -->
          <div class="condition-row">
            <el-select
              v-model="formData.deviceId"
              placeholder="请选择设备"
              style="width: 200px; margin-right: 10px"
              :disabled="!formData.unitId"
              @change="handleDeviceChange"
            >
              <el-option
                v-for="item in deviceOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
            <el-select
              v-model="formData.monitorId"
              placeholder="请选择测点"
              style="width: 200px"
              :disabled="!formData.deviceId"
            >
              <el-option
                v-for="item in monitorOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </div>

          <!-- 单数值/双数值切换 -->
          <div class="rule-type-buttons">
            <el-button
              :type="formData.ruleType === 1 ? 'danger' : 'default'"
              :class="{ active: formData.ruleType === 1 }"
              @click="formData.ruleType = 1"
            >
              单数值
            </el-button>
            <el-button
              :type="formData.ruleType === 2 ? 'danger' : 'default'"
              :class="{ active: formData.ruleType === 2 }"
              @click="formData.ruleType = 2"
            >
              双数值
            </el-button>
          </div>

          <!-- 单数值输入 -->
          <div v-if="formData.ruleType === 1" class="rule-input-row">
            <el-select
              v-model="formData.rule"
              placeholder="请选择符号"
              style="width: 200px; margin-right: 10px"
            >
              <el-option label="等于" :value="0" />
              <el-option label="大于" :value="1" />
              <el-option label="小于" :value="2" />
              <el-option label="小于等于" :value="3" />
              <el-option label="大于等于" :value="4" />
            </el-select>
            <el-input
              v-model="formData.numerical"
              placeholder="请输入值"
              style="width: 200px"
            />
          </div>

          <!-- 双数值输入 -->
          <div v-if="formData.ruleType === 2" class="rule-input-row">
            <div class="double-value-row">
              <el-select
                v-model="formData.ruleA"
                placeholder="请选择符号"
                style="width: 140px; margin-right: 8px"
              >
                <el-option label="等于" :value="0" />
                <el-option label="大于" :value="1" />
                <el-option label="小于" :value="2" />
                <el-option label="小于等于" :value="3" />
                <el-option label="大于等于" :value="4" />
              </el-select>
              <el-input
                v-model="formData.numericalA"
                placeholder="请输入值"
                style="width: 140px; margin-right: 8px"
              />
              <el-select
                v-model="formData.logicRelation"
                placeholder="且/或"
                style="width: 80px; margin-right: 8px"
              >
                <el-option label="且" :value="1" />
                <el-option label="或" :value="2" />
              </el-select>
              <el-select
                v-model="formData.ruleB"
                placeholder="请选择符号"
                style="width: 140px; margin-right: 8px"
              >
                <el-option label="等于" :value="0" />
                <el-option label="大于" :value="1" />
                <el-option label="小于" :value="2" />
                <el-option label="小于等于" :value="3" />
                <el-option label="大于等于" :value="4" />
              </el-select>
              <el-input
                v-model="formData.numericalB"
                placeholder="请输入值"
                style="width: 140px"
              />
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 告警配置 -->
      <el-form-item label="告警配置">
        <div class="config-item">
          <span class="config-label">告警恢复不消失</span>
          <el-switch
            v-model="formData.isAlarmConf"
            :active-value="1"
            :inactive-value="0"
          />
        </div>
      </el-form-item>

      <!-- 防抖配置 -->
      <el-form-item label="防抖配置">
        <div class="config-item">
          <span class="config-label">告警防止抖动</span>
          <el-switch
            v-model="isDebounceEnabled"
            @change="handleDebounceChange"
          />
        </div>
      </el-form-item>
      
      <!-- 持续时间 -->
      <el-form-item label="持续时间">
        <el-input-number
          v-model="formData.duration"
          placeholder="请输入持续时间"
          :min="0"
          :precision="0"
          :step="1"
          style="width: 200px"
        />
        <span style="margin-left: 8px; color: rgba(255, 255, 255, 0.65)">秒</span>
      </el-form-item>

      <!-- 影响范围 -->
      <el-form-item label="影响范围">
        <el-input
          v-model="formData.isScope"
          type="textarea"
          :rows="3"
          placeholder="请输入影响范围,例如:通讯中断、发电低效、发电故障"
          maxlength="500"
          show-word-limit
          style="width: 600px"
        />
      </el-form-item>

      <!-- 可能原因 -->
      <el-form-item label="可能原因">
        <el-input
          v-model="formData.categorize"
          type="textarea"
          :rows="3"
          placeholder="请输入"
          maxlength="500"
          show-word-limit
          style="width: 600px"
        />
      </el-form-item>

      <!-- 处理建议 -->
      <el-form-item label="处理建议">
        <el-input
          v-model="formData.suggest"
          type="textarea"
          :rows="3"
          placeholder="请输入"
          maxlength="500"
          show-word-limit
          style="width: 600px"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '确定' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import type { StrategyFormData } from '@/api/types/alarm/specialStrategy';
import {
  addStrategy,
  editStrategy,
  getStrategyDetail,
  getFactoryOptions,
  getUnitOptions,
  getDeviceOptions,
  getMonitorOptions,
  type CascadeOption,
} from '@/api/alarm/specialStrategy';

interface Props {
  visible: boolean;
  policyId?: string; // 编辑时传入策略ID
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  policyId: undefined,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [];
}>();

const dialogVisible = ref(false);
const formRef = ref<InstanceType<typeof ElForm>>();
const submitting = ref(false);
const isEdit = ref(false);

// 移动端检测
const isMobile = ref(false);
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});

// 级联下拉选项
const factoryOptions = ref<CascadeOption[]>([]);
const unitOptions = ref<CascadeOption[]>([]);
const deviceOptions = ref<CascadeOption[]>([]);
const monitorOptions = ref<CascadeOption[]>([]);

// 防抖开关状态
const isDebounceEnabled = ref(false);

// 表单数据
const formData = reactive<StrategyFormData>({
  id: undefined,
  isEnabled: '1',
  alarmName: '',
  alarmLevel: '',
  factoryId: undefined,
  unitId: undefined,
  deviceId: undefined,
  monitorId: undefined,
  ruleType: 1, // 默认单数值
  rule: undefined,
  ruleA: undefined,
  ruleB: undefined,
  numerical: '',
  numericalA: '',
  numericalB: '',
  isAlarmConf: 0,
  duration: undefined,
  isScope: '',
  categorize: '',
  suggest: '',
});

// 表单验证规则
const formRules = {
  alarmName: [{ required: true, message: '请输入告警名称', trigger: 'blur' }],
  alarmLevel: [{ required: true, message: '请选择告警等级', trigger: 'change' }],
};

// 加载厂站列表
async function loadFactoryOptions() {
  try {
    factoryOptions.value = await getFactoryOptions();
  } catch (error: any) {
    console.error('加载厂站列表失败:', error);
    ElMessage.error(error.message || '加载厂站列表失败');
  }
}

// 厂站变化处理
async function handleFactoryChange() {
  formData.unitId = undefined;
  formData.deviceId = undefined;
  formData.monitorId = undefined;
  unitOptions.value = [];
  deviceOptions.value = [];
  monitorOptions.value = [];

  if (formData.factoryId) {
    try {
      unitOptions.value = await getUnitOptions(formData.factoryId);
    } catch (error: any) {
      console.error('加载机组列表失败:', error);
      ElMessage.error(error.message || '加载机组列表失败');
    }
  }
}

// 机组变化处理
async function handleUnitChange() {
  formData.deviceId = undefined;
  formData.monitorId = undefined;
  deviceOptions.value = [];
  monitorOptions.value = [];

  if (formData.unitId) {
    try {
      deviceOptions.value = await getDeviceOptions(formData.unitId);
    } catch (error: any) {
      console.error('加载设备列表失败:', error);
      ElMessage.error(error.message || '加载设备列表失败');
    }
  }
}

// 设备变化处理
async function handleDeviceChange() {
  formData.monitorId = undefined;
  monitorOptions.value = [];

  if (formData.deviceId) {
    try {
      monitorOptions.value = await getMonitorOptions(formData.deviceId);
    } catch (error: any) {
      console.error('加载点位列表失败:', error);
      ElMessage.error(error.message || '加载点位列表失败');
    }
  }
}

// 防抖开关变化处理
function handleDebounceChange(val: boolean) {
  if (!val) {
    formData.duration = '';
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      isEdit.value = !!props.policyId;
      if (isEdit.value && props.policyId) {
        loadStrategyDetail();
      } else {
        resetForm();
      }
      // 加载厂站列表
      loadFactoryOptions();
    }
  }
);

// 监听dialogVisible变化，同步到父组件
watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 监听ruleType变化，重置相关字段
watch(
  () => formData.ruleType,
  (newVal) => {
    if (newVal === 1) {
      // 切换到单数值，清空双数值字段
      formData.ruleA = undefined;
      formData.ruleB = undefined;
      formData.numericalA = '';
      formData.numericalB = '';
    } else if (newVal === 2) {
      // 切换到双数值，清空单数值字段
      formData.rule = undefined;
      formData.numerical = '';
    }
  }
);

/**
 * 加载策略详情（编辑时）
 */
async function loadStrategyDetail() {
  if (!props.policyId) return;

  try {
    const data = await getStrategyDetail(props.policyId);
    
    // 先加载厂站列表
    await loadFactoryOptions();
    
    // 并行加载所有级联下拉选项（使用详情接口返回的ID值）
    // 使用 Promise.allSettled 确保单个接口失败不影响其他接口
    const loadPromises: Promise<any>[] = [];
    
    if (data.factoryId) {
      loadPromises.push(
        getUnitOptions(data.factoryId)
          .then(res => {
            unitOptions.value = res;
          })
          .catch(err => {
            console.error('加载机组列表失败:', err);
            // 不显示错误提示，静默失败
          })
      );
      
      if (data.unitId) {
        loadPromises.push(
          getDeviceOptions(data.unitId)
            .then(res => {
              deviceOptions.value = res;
            })
            .catch(err => {
              console.error('加载设备列表失败:', err);
              // 不显示错误提示，静默失败
            })
        );
        
        if (data.deviceId) {
          loadPromises.push(
            getMonitorOptions(data.deviceId)
              .then(res => {
                monitorOptions.value = res;
              })
              .catch(err => {
                console.error('加载点位列表失败:', err);
                // 不显示错误提示，静默失败
              })
          );
        }
      }
    }
    
    // 等待所有级联数据加载完成（即使有失败的也不影响）
    await Promise.allSettled(loadPromises);
    
    // 转换ID为字符串类型（匹配下拉选项的value类型）
    // 注意：API返回的value是字符串类型（如"108"），需要确保类型一致
    // 但需要检查下拉选项中value的实际类型，可能也是数字类型
    const factoryIdValue = data.factoryId != null ? String(data.factoryId) : undefined;
    const unitIdValue = data.unitId != null ? String(data.unitId) : undefined;
    const deviceIdValue = data.deviceId != null ? String(data.deviceId) : undefined;
    const monitorIdValue = data.monitorId != null ? String(data.monitorId) : undefined;
    
    // 一次性填充所有表单数据
    Object.assign(formData, {
      id: props.policyId,
      isEnabled: String(data.isEnabled || '1'),
      alarmName: data.alarmName || '',
      alarmLevel: String(data.alarmLevel || ''),
      factoryId: factoryIdValue,
      unitId: unitIdValue,
      deviceId: deviceIdValue,
      monitorId: monitorIdValue,
      ruleType: data.ruleType || 1,
      rule: data.rule,
      ruleA: data.ruleA,
      ruleB: data.ruleB,
      numerical: String(data.numerical || ''),
      numericalA: String(data.numericalA || ''),
      numericalB: String(data.numericalB || ''),
      logicRelation: (data as any).logicRelation ?? 1, // 默认"且"
      isAlarmConf: data.isAlarmConf ?? 0,
      duration: data.duration != null ? Number(data.duration) : undefined,
      isScope: String(data.isScope || ''),
      categorize: String(data.categorize || ''),
      suggest: String(data.suggest || ''),
    });
    
    // 使用 nextTick 确保下拉选项已渲染完成后再强制更新值
    await nextTick();
    
    // 强制触发响应式更新，确保下拉框回显
    if (factoryIdValue) {
      formData.factoryId = factoryIdValue;
    }
    if (unitIdValue) {
      formData.unitId = unitIdValue;
    }
    if (deviceIdValue) {
      formData.deviceId = deviceIdValue;
    }
    if (monitorIdValue) {
      formData.monitorId = monitorIdValue;
    }

    // 设置防抖开关状态
    isDebounceEnabled.value = !!data.duration;
  } catch (error: any) {
    console.error('加载策略详情失败:', error);
    ElMessage.error(error.message || '加载策略详情失败');
  }
}

/**
 * 重置表单
 */
function resetForm() {
  Object.assign(formData, {
    id: undefined,
    isEnabled: '1',
    alarmName: '',
    alarmLevel: '',
    factoryId: undefined,
    unitId: undefined,
    deviceId: undefined,
    monitorId: undefined,
    ruleType: 1,
    rule: undefined,
    ruleA: undefined,
    ruleB: undefined,
    numerical: '',
    numericalA: '',
    numericalB: '',
    logicRelation: 1,
    isAlarmConf: 0,
    duration: undefined,
    isScope: '',
    categorize: '',
    suggest: '',
  });
  isDebounceEnabled.value = false;
  unitOptions.value = [];
  deviceOptions.value = [];
  monitorOptions.value = [];
  formRef.value?.clearValidate();
}

/**
 * 提交表单
 */
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const submitData: any = {
      isEnabled: String(formData.isEnabled),
      alarmName: formData.alarmName,
      alarmLevel: String(formData.alarmLevel),
      factoryId: String(formData.factoryId || ''),
      unitId: String(formData.unitId || ''),
      deviceId: String(formData.deviceId || ''),
      monitorId: String(formData.monitorId || ''),
      ruleType: String(formData.ruleType),
      isAlarmConf: formData.isAlarmConf ?? 0,
      isScope: formData.isScope || '',
      categorize: formData.categorize || '',
    };

    // 根据ruleType添加对应字段
    if (formData.ruleType === 1) {
      // 使用 ?? 而不是 ||，因为0是有效值
      submitData.rule = formData.rule != null ? String(formData.rule) : '';
      submitData.numerical = formData.numerical || '';
    } else if (formData.ruleType === 2) {
      // 使用 ?? 而不是 ||，因为0是有效值
      submitData.ruleA = formData.ruleA != null ? String(formData.ruleA) : '';
      submitData.ruleB = formData.ruleB != null ? String(formData.ruleB) : '';
      submitData.numericalA = formData.numericalA || '';
      submitData.numericalB = formData.numericalB || '';
    }

    // 防抖配置
    if (isDebounceEnabled.value && formData.duration != null) {
      submitData.duration = String(formData.duration);
    } else {
      submitData.duration = '';
    }

    // 处理建议
    if (formData.suggest) {
      submitData.suggest = formData.suggest;
    }

    // 编辑时添加id（转换为数字类型）
    if (isEdit.value && props.policyId) {
      submitData.id = Number(props.policyId);
      await editStrategy(props.policyId, submitData as StrategyFormData);
      ElMessage.success('编辑策略成功');
    } else {
      await addStrategy(submitData);
      ElMessage.success('添加策略成功');
    }

    emit('success');
    handleClose();
  } catch (error: any) {
    if (error !== false) {
      // false表示表单验证失败，不需要显示错误
      console.error('提交失败:', error);
      ElMessage.error(error.message || '操作失败');
    }
  } finally {
    submitting.value = false;
  }
}

/**
 * 关闭对话框
 */
function handleClose() {
  dialogVisible.value = false;
  resetForm();
}
</script>

<style scoped lang="scss">
.strategy-form-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.trigger-conditions {
  .condition-row {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }

  .rule-type-buttons {
    margin: 15px 0;
    display: flex;
    gap: 10px;

    .el-button {
      &.active {
        background-color: #f56c6c;
        border-color: #f56c6c;
        color: #fff;
      }
    }
  }

  .rule-input-row {
    margin-top: 10px;
    display: flex;
    align-items: center;

    .double-value-row {
      display: flex;
      align-items: center;
    }
  }
}

.config-item {
  display: flex;
  align-items: center;

  .config-label {
    margin-right: 10px;
    color: rgba(255, 255, 255, 0.85);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.el-input__wrapper) {
  background: rgba(10, 30, 50, 0.6);
  border-color: rgba(0, 212, 255, 0.3);

  &:hover {
    border-color: rgba(0, 212, 255, 0.5);
  }

  &.is-focus {
    border-color: #00d4ff;
  }
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: #fff;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(10, 30, 50, 0.6);
  border-color: rgba(0, 212, 255, 0.3);
}

:deep(.el-switch) {
  --el-switch-on-color: #00d4ff;
}

// 移动端适配
@media (max-width: 768px) {
  :deep(.el-dialog) {
    .el-dialog__body {
      padding: 16px 12px;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .el-form-item {
      margin-bottom: 16px;
      
      .el-form-item__label {
        font-size: 13px;
        width: 100px !important;
      }
    }
  }
  
  .trigger-conditions {
    .condition-row {
      flex-direction: column;
      gap: 10px;
      
      .el-select {
        width: 100% !important;
        margin-right: 0 !important;
      }
    }
    
    .rule-input-row {
      flex-direction: column;
      gap: 10px;
      
      .el-select,
      .el-input {
        width: 100% !important;
      }
      
      .double-value-row {
        flex-direction: column;
        gap: 10px;
        
        .el-select,
        .el-input {
          width: 100% !important;
          margin-right: 0 !important;
        }
        
        span {
          display: none;
        }
      }
    }
  }
  
  .config-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    
    .el-input {
      width: 100% !important;
      margin-left: 0 !important;
    }
  }
}
</style>
