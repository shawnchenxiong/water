<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DustDiagnosisConfig } from '@/api/types/diagnosis/dustConfig'
import { 
  getDustDiagnosisConfigs, 
  updateDustDiagnosisConfigs, 
  resetDustDiagnosisConfigs,
  validateConfigValue 
} from '@/api/diagnosis/dustConfig'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import dayjs from 'dayjs'

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 响应式数据
const loading = ref(false)
const editMode = ref(false)
const configs = ref<DustDiagnosisConfig[]>([])
const originalConfigs = ref<DustDiagnosisConfig[]>([])
const selectedStationId = ref<string>('')

// 表格引用
const tableRef = ref()

// 生命周期
onMounted(async () => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
  await loadConfigs()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 加载配置数据
const loadConfigs = async () => {
  try {
    loading.value = true
    const response = await getDustDiagnosisConfigs()
    configs.value = response.data.configs
    originalConfigs.value = JSON.parse(JSON.stringify(response.data.configs))
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// 电站选择处理
const handleStationChange = async (data: any) => {
  if (!data || !data.regionId) return
  if (data.childList && data.childList.length > 0) return
  
  selectedStationId.value = data.regionId
  console.log('选择的电站:', data.stationName)
  
  // 重新加载配置数据
  await loadConfigs()
}

// 进入编辑模式
const handleEdit = () => {
  editMode.value = true
  ElMessage.info('已进入编辑模式，可直接在表格中修改参数值')
}

// 保存配置
const handleSave = async () => {
  try {
    // 验证所有可编辑的配置项
    const errors: string[] = []
    const updatedConfigs: any[] = []
    
    configs.value.forEach((config, index) => {
      if (config.editable) {
        const validation = validateConfigValue(
          config.paramValue,
          config.valueType,
          config.minValue,
          config.maxValue
        )
        
        if (!validation.valid) {
          errors.push(`${config.paramName}: ${validation.message}`)
        }
        
        // 检查值是否有变化
        const original = originalConfigs.value[index]
        if (original && config.paramValue !== original.paramValue) {
          updatedConfigs.push({
            id: config.id,
            paramName: config.paramName,
            paramValue: config.paramValue,
            modifier: 'admin', // 实际应该从用户信息获取
            modifyTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
          })
        }
      }
    })
    
    if (errors.length > 0) {
      ElMessage.error(`参数验证失败: ${errors.join('; ')}`)
      return
    }
    
    if (updatedConfigs.length === 0) {
      ElMessage.info('没有检测到配置变更')
      editMode.value = false
      return
    }
    
    loading.value = true
    
    const response = await updateDustDiagnosisConfigs({
      configs: updatedConfigs
    })
    
    if (response.code === 200) {
      ElMessage.success(`成功更新 ${response.data.updatedCount} 个配置项`)
      
      // 更新修改人和修改时间
      updatedConfigs.forEach(updated => {
        const config = configs.value.find(c => c.id === updated.id)
        if (config) {
          config.modifier = updated.modifier
          config.modifyTime = updated.modifyTime
        }
      })
      
      originalConfigs.value = JSON.parse(JSON.stringify(configs.value))
      editMode.value = false
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  } finally {
    loading.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  configs.value = JSON.parse(JSON.stringify(originalConfigs.value))
  editMode.value = false
  ElMessage.info('已取消编辑')
}

// 重置配置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有配置为默认值吗？此操作不可撤销。',
      '重置配置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    
    const configIds = configs.value.map(c => c.id)
    const response = await resetDustDiagnosisConfigs({
      configIds,
      operator: 'admin'
    })
    
    if (response.code === 200) {
      ElMessage.success(`成功重置 ${response.data.resetCount} 个配置项`)
      await loadConfigs()
      editMode.value = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置配置失败:', error)
      ElMessage.error('重置配置失败')
    }
  } finally {
    loading.value = false
  }
}

// 参数值输入处理
const handleValueInput = (config: DustDiagnosisConfig, value: string) => {
  if (config.valueType === 'number') {
    const numValue = Number(value)
    if (!isNaN(numValue)) {
      config.paramValue = numValue
    }
  } else {
    config.paramValue = value
  }
}

// 获取配置分类颜色
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    '成本参数': '#ff6b6b',
    '诊断阈值': '#4ecdc4',
    '环境系数': '#45b7d1',
    '计算参数': '#f9ca24'
  }
  return colorMap[category] || '#95a5a6'
}
</script>

<template>
  <DeviceMonitorLayout>
    <!-- 左侧面板 -->
    <template #left>
      <StationTree 
        :auto-select-first-leaf="true"
        @node-click="handleStationChange"
      />
    </template>

    <!-- 右侧面板 -->
    <template #right>
      <div class="dust-config-content">
        <!-- 顶部操作区 -->
        <div class="header-actions">
          <div class="title">积尘诊断配置</div>
          <div class="actions">
            <template v-if="!editMode">
              <el-button 
                type="primary" 
                @click="handleEdit"
                :loading="loading"
              >
                修改
              </el-button>
            </template>
            <template v-else>
              <el-button @click="handleCancel">取消</el-button>
              <el-button 
                type="danger" 
                @click="handleReset"
                :loading="loading"
              >
                重置
              </el-button>
              <el-button 
                type="primary" 
                @click="handleSave"
                :loading="loading"
              >
                保存
              </el-button>
            </template>
          </div>
        </div>

        <!-- 配置表格 -->
        <div class="table-container">
          <el-table
            ref="tableRef"
            :data="configs"
            v-loading="loading"
            :height="isMobile ? 500 : 'calc(100vh - 290px)'"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="paramName" label="参数名" width="180" fixed="left">
              <template #default="{ row }">
                <div class="param-name">
                  <span 
                    class="category-dot" 
                    :style="{ backgroundColor: getCategoryColor(row.category) }"
                  ></span>
                  {{ row.paramName }}
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="paramValue" label="参数值" width="120">
              <template #default="{ row }">
                <template v-if="editMode && row.editable">
                  <el-input
                    :model-value="String(row.paramValue)"
                    @input="(value: string) => handleValueInput(row, value)"
                    size="small"
                    :type="row.valueType === 'number' ? 'number' : 'text'"
                  />
                </template>
                <template v-else>
                  <span class="param-value">{{ row.paramValue }}</span>
                </template>
              </template>
            </el-table-column>

            <el-table-column prop="paramUnit" label="参数单位" width="100">
              <template #default="{ row }">
                <span class="param-unit">{{ row.paramUnit }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="modifier" label="修改人" width="100">
              <template #default="{ row }">
                <span>{{ row.modifier || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="modifyTime" label="修改日期" width="160">
              <template #default="{ row }">
                <span>{{ row.modifyTime || '-' }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="description" label="参数描述" min-width="300">
              <template #default="{ row }">
                <div class="param-description">
                  <el-tooltip
                    v-if="row.description && row.description.length > 50"
                    :content="row.description"
                    placement="top"
                    effect="dark"
                  >
                    <span>{{ row.description.slice(0, 50) }}...</span>
                  </el-tooltip>
                  <span v-else>{{ row.description }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<style scoped lang="scss">
.dust-config-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);

    .title {
      font-size: 18px;
      font-weight: 500;
      color: #00D4FF;
    }

    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .table-container {
    flex: 1;
    overflow: hidden;
    
    .param-name {
      display: flex;
      align-items: center;
      gap: 8px;

      .category-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }

    .param-value {
      font-weight: 500;
      color: #00D4FF;
    }

    .param-unit {
      color: #a3a3a3;
    }

    .param-description {
      line-height: 1.4;
      color: #d1d5db;
    }
  }
}

:deep(.el-table) {
  background: transparent;
  border-color: rgba(0, 212, 255, 0.2);

  .el-table__header {
    background: rgba(0, 212, 255, 0.1);
    
    th {
      background: transparent;
      border-color: rgba(0, 212, 255, 0.2);
      color: #00D4FF;
      font-weight: 500;
    }
  }

  .el-table__body {
    tr {
      background: transparent;
      border-color: rgba(0, 212, 255, 0.1);

      &:hover {
        background: rgba(0, 212, 255, 0.05);
      }

      td {
        border-color: rgba(0, 212, 255, 0.1);
        color: #d1d5db;
      }
    }

    .el-table__row--striped {
      background: rgba(0, 212, 255, 0.02);
    }
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    background: rgba(0, 212, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: none;

    &:hover {
      border-color: rgba(0, 212, 255, 0.5);
    }

    &.is-focus {
      border-color: #00D4FF;
    }
  }

  .el-input__inner {
    color: #d1d5db;
  }
}

:deep(.el-tooltip__trigger) {
  cursor: help;
}

// 移动端适配
@media (max-width: 768px) {
  .dust-config-content {
    padding: 12px;

    .header-actions {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      margin-bottom: 16px;
      padding-bottom: 12px;

      .title {
        font-size: 16px;
        text-align: center;
      }

      .actions {
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;

        .el-button {
          flex: 1;
          min-width: 80px;
          font-size: 13px;
        }
      }
    }

    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      :deep(.el-table) {
        width: 800px;
        font-size: 11px;

        .el-table__header {
          th {
            font-size: 12px;
            padding: 8px 4px;
          }
        }

        .el-table__body {
          td {
            padding: 8px 4px;
          }
        }
      }

      .param-name {
        font-size: 11px;
        gap: 6px;

        .category-dot {
          width: 6px;
          height: 6px;
        }
      }

      .param-value {
        font-size: 11px;
      }

      .param-unit {
        font-size: 10px;
      }

      .param-description {
        font-size: 10px;
        line-height: 1.3;
      }
    }
  }

  :deep(.el-input) {
    .el-input__wrapper {
      height: 28px;
    }

    .el-input__inner {
      font-size: 11px;
    }
  }
}
</style>
