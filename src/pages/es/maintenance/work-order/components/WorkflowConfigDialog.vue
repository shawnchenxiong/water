<template>
  <el-dialog
    v-model="visible"
    title="工作流配置"
    :width="isMobile ? '95%' : '1000px'"
    :top="isMobile ? '2vh' : '15vh'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="workflow-config">
      <!-- 工单类型选择 -->
      <div class="type-selector">
        <el-select
          v-model="selectedWorkOrderType"
          placeholder="请选择工单类型"
          style="width: 200px"
          @change="handleTypeChange"
        >
          <el-option
            v-for="type in basicData.workOrderTypes"
            :key="type.id"
            :label="type.name"
            :value="type.id"
          />
        </el-select>
      </div>

      <!-- 工作流图 -->
      <div v-if="workflowConfig" class="workflow-diagram">
        <div class="diagram-container" ref="diagramRef">
          <!-- 节点 -->
          <div
            v-for="node in workflowConfig.nodes"
            :key="node.id"
            class="workflow-node"
          :class="{ 
            'start-node': node.type === 'start',
            'end-node': node.type === 'end',
            'task-node': node.type === 'task',
            'approve-node': node.type === 'approve',
            'countersign-node': node.type === 'countersign'
          }"
            :style="{ 
              left: node.x + 'px', 
              top: node.y + 'px' 
            }"
            @click="handleNodeClick(node)"
          >
            <div class="node-content">
              <div class="node-title">{{ node.name }}</div>
              <div v-if="node.assignee" class="node-assignee">
                {{ node.assignee }}
              </div>
            </div>
          </div>

          <!-- 连线 -->
          <svg class="workflow-edges" :width="900" :height="400">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#00d4ff"
                />
              </marker>
            </defs>
            <path
              v-for="edge in workflowConfig.edges"
              :key="`${edge.source}-${edge.target}`"
              :d="getCurvePath(edge.source, edge.target)"
              stroke="#00d4ff"
              stroke-width="2"
              fill="none"
              marker-end="url(#arrowhead)"
            />
          </svg>
        </div>
      </div>

      <!-- 节点配置面板 -->
      <div v-if="selectedNode" class="node-config-panel">
        <h4>节点配置</h4>
        <el-form
          ref="nodeFormRef"
          :model="nodeForm"
          :rules="nodeFormRules"
          label-width="100px"
        >
          <el-form-item label="节点名称" prop="name">
            <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
          </el-form-item>
          <el-form-item 
            v-if="selectedNode.type === 'process'" 
            label="处理人" 
            prop="assignee"
          >
            <el-select v-model="nodeForm.assignee" placeholder="请选择处理人">
              <el-option
                v-for="user in basicData.users"
                :key="user.id"
                :label="`${user.name} (${user.role})`"
                :value="user.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="nodeForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入节点描述"
            />
          </el-form-item>
        </el-form>
        <div class="node-config-actions">
          <el-button @click="handleCancelNodeEdit">取消</el-button>
          <el-button type="primary" @click="handleSaveNode">保存</el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存配置
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getWorkflowConfig,
  updateWorkflowConfig,
} from '@/api/maintenance/workOrderApi'
import type {
  WorkflowConfig,
  WorkflowNode,
  WorkOrderBasicDataResponse,
} from '@/api/types/work-order'

interface Props {
  modelValue: boolean
  basicData: WorkOrderBasicDataResponse
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
const nodeFormRef = ref<FormInstance>()
const diagramRef = ref<HTMLElement>()

// 选中的工单类型
const selectedWorkOrderType = ref('')

// 工作流配置
const workflowConfig = ref<WorkflowConfig | null>(null)

// 选中的节点
const selectedNode = ref<WorkflowNode | null>(null)

// 节点表单数据
const nodeForm = reactive({
  name: '',
  assignee: '',
  description: '',
})

// 节点表单验证规则
const nodeFormRules: FormRules = {
  name: [
    { required: true, message: 'Please enter node name', trigger: 'blur' },
  ],
}

// 保存状态
const saving = ref(false)

// 移动端检测
const isMobile = ref(false)
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

/**
 * 获取节点连接点坐标
 */
const getNodeCenter = (nodeId: string) => {
  const node = workflowConfig.value?.nodes.find(n => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  return {
    x: node.x + 50, // 节点宽度的一半 (100/2)
    y: node.y + 25, // 节点高度的一半 (50/2)
  }
}

/**
 * 获取连线的起点和终点坐标
 */
const getLinePoints = (sourceId: string, targetId: string) => {
  const sourceNode = workflowConfig.value?.nodes.find(n => n.id === sourceId)
  const targetNode = workflowConfig.value?.nodes.find(n => n.id === targetId)
  
  if (!sourceNode || !targetNode) {
    return { x1: 0, y1: 0, x2: 0, y2: 0 }
  }
  
  // 计算连接点
  let x1, y1, x2, y2
  
  // 根据节点相对位置确定连接点
  if (targetNode.y < sourceNode.y) {
    // 目标节点在上方
    if (targetNode.x > sourceNode.x) {
      // 目标节点在右上方，从源节点右边缘连接到目标节点左边缘
      x1 = sourceNode.x + 100 // 节点右边缘
      y1 = sourceNode.y + 25  // 节点垂直中心
      x2 = targetNode.x       // 节点左边缘
      y2 = targetNode.y + 25  // 节点垂直中心
    } else {
      // 目标节点在正上方，从源节点顶部连接到目标节点底部
      x1 = sourceNode.x + 50  // 节点宽度的一半
      y1 = sourceNode.y       // 节点顶部
      x2 = targetNode.x + 50  // 节点宽度的一半
      y2 = targetNode.y + 50  // 节点底部
    }
  } else if (targetNode.y > sourceNode.y) {
    // 目标节点在下方
    if (targetNode.x > sourceNode.x) {
      // 目标节点在右下方，从源节点右边缘连接到目标节点左边缘
      x1 = sourceNode.x + 100 // 节点右边缘
      y1 = sourceNode.y + 25  // 节点垂直中心
      x2 = targetNode.x       // 节点左边缘
      y2 = targetNode.y + 25  // 节点垂直中心
    } else {
      // 目标节点在正下方，从源节点底部连接到目标节点顶部
      x1 = sourceNode.x + 50  // 节点宽度的一半
      y1 = sourceNode.y + 50  // 节点底部
      x2 = targetNode.x + 50  // 节点宽度的一半
      y2 = targetNode.y       // 节点顶部
    }
  } else {
    // 同一水平线，从右边缘连接到左边缘
    x1 = sourceNode.x + 100 // 节点右边缘
    y1 = sourceNode.y + 25  // 节点垂直中心
    x2 = targetNode.x       // 节点左边缘
    y2 = targetNode.y + 25  // 节点垂直中心
  }
  
  return { x1, y1, x2, y2 }
}

/**
 * 生成折线路径
 */
const getCurvePath = (sourceId: string, targetId: string) => {
  const { x1, y1, x2, y2 } = getLinePoints(sourceId, targetId)
  
  // 如果是同一水平线，使用直线
  if (y1 === y2) {
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }
  
  // 如果是垂直连接，使用直线
  if (x1 === x2) {
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }
  
  // 其他情况使用折线（直角转弯）
  const midX = (x1 + x2) / 2
  
  // 创建折线路径：水平 → 垂直 → 水平
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
}

/**
 * 工单类型变化
 */
const handleTypeChange = async (typeId: string) => {
  if (!typeId) return
  
  try {
    const config = await getWorkflowConfig(typeId)
    workflowConfig.value = config
    selectedNode.value = null
  } catch (error) {
    ElMessage.error('Failed to load workflow config')
  }
}

/**
 * 节点点击
 */
const handleNodeClick = (node: WorkflowNode) => {
  selectedNode.value = node
  Object.assign(nodeForm, {
    name: node.name,
    assignee: node.assignee || '',
    description: node.description || '',
  })
}

/**
 * 取消节点编辑
 */
const handleCancelNodeEdit = () => {
  selectedNode.value = null
  nodeFormRef.value?.resetFields()
}

/**
 * 保存节点
 */
const handleSaveNode = async () => {
  if (!nodeFormRef.value || !selectedNode.value || !workflowConfig.value) return

  try {
    await nodeFormRef.value.validate()

    // 更新节点信息
    const nodeIndex = workflowConfig.value.nodes.findIndex(
      n => n.id === selectedNode.value!.id
    )
    if (nodeIndex !== -1) {
      Object.assign(workflowConfig.value.nodes[nodeIndex], {
        name: nodeForm.name,
        assignee: nodeForm.assignee,
        description: nodeForm.description,
      })
    }

    selectedNode.value = null
    ElMessage.success('节点配置保存成功')
  } catch (error) {
    console.error('Save node failed:', error)
  }
}

/**
 * 保存配置
 */
const handleSave = async () => {
  if (!selectedWorkOrderType.value || !workflowConfig.value) {
    ElMessage.warning('请选择工单类型并配置工作流')
    return
  }

  try {
    saving.value = true
    await updateWorkflowConfig(selectedWorkOrderType.value, workflowConfig.value)
    ElMessage.success('工作流配置保存成功')
    emit('success')
    handleClose()
  } catch (error) {
    console.error('Save workflow config failed:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  selectedWorkOrderType.value = ''
  workflowConfig.value = null
  selectedNode.value = null
  nodeFormRef.value?.resetFields()
  visible.value = false
}

// 初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile)
})

// 监听弹窗打开
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.basicData.workOrderTypes.length > 0) {
      // 默认选择第一个工单类型
      selectedWorkOrderType.value = props.basicData.workOrderTypes[0].id
      nextTick(() => {
        handleTypeChange(selectedWorkOrderType.value)
      })
    }
  }
)
</script>

<style scoped lang="scss">
.workflow-config {
  .type-selector {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #333;
  }

  .workflow-diagram {
    margin-bottom: 20px;

    .diagram-container {
      position: relative;
      width: 900px;
      height: 400px;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid #333;
      border-radius: 4px;
      overflow: visible;
      padding: 20px;

      .workflow-node {
        position: absolute;
        width: 100px;
        height: 50px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &.start-node {
          background: linear-gradient(135deg, #67c23a, #85ce61);
          border: 3px solid #67c23a;
          box-shadow: 0 2px 8px rgba(103, 194, 58, 0.4);
        }

        &.end-node {
          background: linear-gradient(135deg, #f56c6c, #f78989);
          border: 3px solid #f56c6c;
          box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
        }

        &.task-node {
          background: linear-gradient(135deg, #00d4ff, #409eff);
          border: 3px solid #00d4ff;
          box-shadow: 0 2px 8px rgba(0, 212, 255, 0.4);
        }

        &.approve-node {
          background: linear-gradient(135deg, #e6a23c, #f39c12);
          border: 3px solid #e6a23c;
          box-shadow: 0 2px 8px rgba(230, 162, 60, 0.4);
        }

        &.countersign-node {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
          border: 3px solid #9b59b6;
          box-shadow: 0 2px 8px rgba(155, 89, 182, 0.4);
          border-radius: 50%; // 圆形节点表示会签
        }

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        .node-content {
          text-align: center;
          color: #ffffff;

          .node-title {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 2px;
          }

          .node-assignee {
            font-size: 10px;
            opacity: 0.9;
          }
        }
      }

      .workflow-edges {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1;
        overflow: visible;
      }
    }
  }

  .node-config-panel {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 20px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
      margin-bottom: 16px;
    }

    .node-config-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: 0;

    .el-dialog__body {
      padding: 12px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .el-dialog__footer {
      padding: 12px;

      .el-button {
        width: 100px;
        font-size: 13px;
      }
    }
  }

  .workflow-config {
    .type-selector {
      margin-bottom: 16px;
      text-align: center;

      .el-select {
        width: 100% !important;
        max-width: 300px;
      }
    }

    .workflow-diagram {
      .diagram-container {
        width: 100%; // 适应弹框宽度
        height: 400px; // 保持原来的高度
        overflow-x: auto; // 横向滚动
        overflow-y: hidden; // 隐藏纵向滚动
        -webkit-overflow-scrolling: touch;
        
        // 创建一个内部包装器来控制滚动区域大小
        &::before {
          content: '';
          display: block;
          width: 900px; // 设置滚动区域宽度
          height: 1px;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
        }
        
        // 确保SVG连线区域有足够的宽度
        .workflow-edges {
          min-width: 900px;
        }
      }
    }

    .node-config-panel {
      padding: 12px;
      margin-top: 16px;

      h4 {
        font-size: 14px;
        margin-bottom: 12px;
      }

      :deep(.el-form) {
        .el-form-item {
          margin-bottom: 12px;

          .el-form-item__label {
            font-size: 12px;
            line-height: 1.2;
          }

          .el-form-item__content {
            .el-input,
            .el-select {
              font-size: 13px;

              .el-input__wrapper,
              .el-select__wrapper {
                min-height: 32px;
              }

              .el-input__inner,
              .el-select__input {
                font-size: 13px;
              }
            }
          }
        }
      }

      .node-config-actions {
        justify-content: center;
        gap: 8px;
        margin-top: 16px;

        .el-button {
          flex: 1;
          max-width: 100px;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
