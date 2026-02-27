<template>
  <DeviceMonitorLayout>
    <!-- ========== 左侧工艺流程树菜单 ========== -->
    <template #left>
      <div style="padding: 10px; color: #fff;">
        <el-input v-model="treeSearch" placeholder="请输入关键字搜索" clearable style="margin-bottom: 15px;" />
        <el-tree
          :data="stationTree"
          :props="{ label: 'name', children: 'children' }"
          @node-click="handleNodeClick"
          default-expand-all
          highlight-current
          style="background: transparent; color: #fff;"
        />
      </div>
    </template>

    <!-- ========== 右侧内容区 ========== -->
    <template #right>
      <div class="custom-report-wrapper">
        <!-- 顶部：模板信息 -->
        <div class="template-header">
          <el-button type="primary" size="small" @click="handleNewTemplate">新建模板</el-button>
          <div class="template-info" v-if="currentTemplate">
            <span class="template-name">当前模板：{{ currentTemplate.name }}</span>
            <el-tag size="small" type="success">{{ currentTemplate.dataPoints.length }} 个数据点</el-tag>
          </div>
        </div>

        <!-- 模板编辑区 -->
        <div class="template-editor" v-if="showEditor">
          <!-- 顶部表单 -->
          <div class="editor-form">
            <el-row :gutter="16" align="middle">
              <el-col :span="6">
                <span class="form-label">模板名称：</span>
                <el-input v-model="templateForm.name" placeholder="请输入" size="small" style="width: calc(100% - 75px);" />
              </el-col>
              <el-col :span="6">
                <span class="form-label">横纵类型：</span>
                <el-radio-group v-model="templateForm.layout" size="small">
                  <el-radio-button label="horizon">对比报表</el-radio-button>
                  <el-radio-button label="vertical">纵向报表</el-radio-button>
                </el-radio-group>
              </el-col>
              <el-col :span="8">
                <el-tag size="small" type="info" style="margin-left: 8px;">
                  国际单列排列:最多显示20个数据列，每组合串更多显示20个数据列
                </el-tag>
              </el-col>
            </el-row>
          </div>

          <!-- 数据选择标签页 -->
          <div class="data-tabs">
            <span
              v-for="tab in dataTabs"
              :key="tab.id"
              :class="['data-tab', { active: activeDataTab === tab.id }]"
              @click="activeDataTab = tab.id"
            >{{ tab.name }}</span>
          </div>

          <!-- 数据点选择区域 -->
          <el-row :gutter="0" class="data-select-area">
            <!-- 时间粒度 -->
            <el-col :span="4" class="select-section">
              <div class="section-title">时间粒度</div>
              <el-radio-group v-model="templateForm.granularity" direction="vertical">
                <el-radio label="day">日</el-radio>
                <el-radio label="hour">小时</el-radio>
                <el-radio label="minute">分钟</el-radio>
              </el-radio-group>
            </el-col>

            <!-- 指标条件 -->
            <el-col :span="8" class="select-section">
              <div class="section-title">指标条件</div>
              <div class="search-inputs">
                <el-input v-model="filterKeyword1" placeholder="请输入关键字搜索" clearable size="small" style="margin-bottom: 6px;" />
                <el-input v-model="filterKeyword2" placeholder="请输入关键字搜索" clearable size="small" style="margin-bottom: 6px;" />
                <el-input v-model="filterKeyword3" placeholder="请输入关键字搜索" clearable size="small" />
              </div>
            </el-col>

            <!-- 显示方式 -->
            <el-col :span="4" class="select-section">
              <div class="section-title">显示方式</div>
              <el-checkbox-group v-model="templateForm.displayModes">
                <el-checkbox label="avg">平均值</el-checkbox>
                <el-checkbox label="max">最大值</el-checkbox>
                <el-checkbox label="min">最小值</el-checkbox>
                <el-checkbox label="sum">累计值</el-checkbox>
              </el-checkbox-group>
            </el-col>

            <!-- 可选数据点列表 -->
            <el-col :span="8" class="select-section data-points-section">
              <div class="section-title">可选数据点</div>
              <el-scrollbar height="200px">
                <div v-for="group in filteredDataPoints" :key="group.name" class="dp-group">
                  <div class="dp-group-title">▼ {{ group.name }}</div>
                  <el-checkbox-group v-model="templateForm.dataPoints">
                    <div v-for="item in group.items" :key="item.id" class="dp-item">
                      <el-checkbox :label="item.id">{{ item.name }}</el-checkbox>
                    </div>
                  </el-checkbox-group>
                </div>
              </el-scrollbar>
            </el-col>
          </el-row>

          <!-- 操作按钮 -->
          <div class="editor-footer">
            <el-button size="small" @click="showEditor = false">取消</el-button>
            <el-button type="warning" size="small" @click="handlePreview">预览</el-button>
            <el-button type="primary" size="small" @click="handleSaveTemplate">确认</el-button>
          </div>
        </div>

        <!-- 已保存模板列表 -->
        <div class="template-list" v-if="!showEditor">
          <el-table
            :data="templateList"
            stripe
            style="width: 100%"
            :header-cell-style="{ background: 'rgba(0,40,80,0.6)', color: '#00d4ff', fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.2)' }"
            :cell-style="{ fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.08)' }"
          >
            <el-table-column label="序号" width="60" align="center" type="index" />
            <el-table-column label="模板名称" min-width="150" prop="name">
              <template #default="{ row }">
                <el-link :underline="false" @click="handleUseTemplate(row)" style="color: #00d4ff;">{{ row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="报表类型" width="120" prop="layout" align="center">
              <template #default="{ row }">{{ row.layout === 'horizon' ? '对比报表' : '纵向报表' }}</template>
            </el-table-column>
            <el-table-column label="数据点数" width="90" align="center">
              <template #default="{ row }">{{ row.dataPoints.length }}</template>
            </el-table-column>
            <el-table-column label="时间粒度" width="90" prop="granularity" align="center">
              <template #default="{ row }">{{ { day:'日', hour:'小时', minute:'分钟' }[row.granularity] || '日' }}</template>
            </el-table-column>
            <el-table-column label="创建时间" width="170" prop="createTime" align="center" />
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditTemplate(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteTemplate(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 自定义报表页面 - 参考 jeecg 自定义报表模板编辑器
 * 左侧工艺树 + 右侧模板编辑器/列表
 */
import { ref, computed, onMounted } from 'vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// ==================== 左侧工艺树 ====================
const treeSearch = ref('')
const stationTree = ref([
  {
    name: '污水处理厂',
    children: [
      { id: 'pre-treatment', name: '预处理' },
      { id: 'stage1-aao', name: 'I段AAO' },
      { id: 'sedimentation', name: '二沉池及出水' },
      { id: 'sludge', name: '污泥脱水' },
      { id: 'high-sedimentation', name: '高效沉淀池' },
      { id: 'denitrification', name: '反硝化深床滤池' },
      { id: 'dosing', name: '加药系统' },
      { id: 'stage2-aao', name: 'II段AAO' },
      { id: 'blower', name: '鼓风机房' },
    ]
  }
])

const handleNodeClick = (_node: any) => {}

// ==================== 模板数据类型 ====================
interface TemplateItem {
  id: number
  name: string
  layout: string
  granularity: string
  dataPoints: string[]
  displayModes: string[]
  createTime: string
}

// ==================== 状态 ====================
const showEditor = ref(false)
const currentTemplate = ref<TemplateItem | null>(null)
const editingId = ref<number | null>(null)
const activeDataTab = ref('realtime')
const filterKeyword1 = ref('')
const filterKeyword2 = ref('')
const filterKeyword3 = ref('')

const dataTabs = [
  { id: 'realtime', name: '设备实时数据' },
  { id: 'summary', name: '综合报表' },
  { id: 'station', name: '设备报表' },
  { id: 'grid', name: '区域报表' },
  { id: 'quality', name: '质量报表' },
]

// ==================== 表单 ====================
const getEmptyForm = () => ({
  name: '',
  layout: 'horizon',
  granularity: 'day',
  dataPoints: [] as string[],
  displayModes: [] as string[],
})

const templateForm = ref(getEmptyForm())

// ==================== 可选数据点 ====================
const dataPointGroups = ref([
  {
    name: '水质参数',
    items: [
      { id: 'dp-01', name: '水质日均照量(MJ/m2)' },
      { id: 'dp-02', name: '进水COD(mg/L)' },
      { id: 'dp-03', name: '出水COD(mg/L)' },
      { id: 'dp-04', name: '进水氨氮(mg/L)' },
      { id: 'dp-05', name: '出水氨氮(mg/L)' },
      { id: 'dp-06', name: '进水总磷(mg/L)' },
      { id: 'dp-07', name: '出水总磷(mg/L)' },
      { id: 'dp-08', name: 'pH值' },
      { id: 'dp-09', name: '溶解氧浓度(mg/L)' },
      { id: 'dp-10', name: 'SS浓度(mg/L)' },
    ]
  },
  {
    name: '流量参数',
    items: [
      { id: 'dp-11', name: '瞬时流量(m³/h)' },
      { id: 'dp-12', name: '累计流量(m³)' },
      { id: 'dp-13', name: '回流污泥量(m³/h)' },
      { id: 'dp-14', name: '剩余污泥量(m³/h)' },
    ]
  },
  {
    name: '设备运行',
    items: [
      { id: 'dp-21', name: '水平辐射(MJ/m2)' },
      { id: 'dp-22', name: '波向直辐射(MJ/m2)' },
      { id: 'dp-23', name: '水平百辐射(hPa)' },
      { id: 'dp-24', name: '水平百辐照温(°C)' },
      { id: 'dp-25', name: '水平百日辐照量(Wh/m2)' },
      { id: 'dp-26', name: '水平百日辐照量(MJ/m2)' },
      { id: 'dp-27', name: '日照时数(h/s)' },
      { id: 'dp-28', name: '对件辐射(MJ/m2)' },
      { id: 'dp-29', name: '气压(hPa)' },
      { id: 'dp-30', name: '露点温度(W/m2)' },
      { id: 'dp-31', name: '最低温度(W/m2)' },
      { id: 'dp-32', name: '25分钟风速(°C)' },
      { id: 'dp-33', name: '10分钟风速(°C)' },
    ]
  }
])

const filteredDataPoints = computed(() => {
  if (!filterKeyword1.value) return dataPointGroups.value
  const kw = filterKeyword1.value.toLowerCase()
  return dataPointGroups.value.map(g => ({
    ...g,
    items: g.items.filter(item => item.name.toLowerCase().includes(kw))
  })).filter(g => g.items.length > 0)
})

// ==================== 模板列表（模拟） ====================
const templateList = ref<TemplateItem[]>([])

const generateMockTemplates = (): TemplateItem[] => {
  return [
    { id: 1, name: '日报模板-水质', layout: 'horizon', granularity: 'day', dataPoints: ['dp-01', 'dp-02', 'dp-03', 'dp-08'], displayModes: ['avg', 'max'], createTime: '2026-02-20 10:30:00' },
    { id: 2, name: '月报模板-能耗', layout: 'vertical', granularity: 'day', dataPoints: ['dp-11', 'dp-12'], displayModes: ['sum'], createTime: '2026-02-18 14:20:00' },
    { id: 3, name: '设备运行日报', layout: 'horizon', granularity: 'hour', dataPoints: ['dp-21', 'dp-22', 'dp-23', 'dp-30', 'dp-31'], displayModes: ['avg', 'max', 'min'], createTime: '2026-02-15 09:00:00' },
  ]
}

// ==================== 事件处理 ====================
const handleNewTemplate = () => {
  templateForm.value = getEmptyForm()
  editingId.value = null
  showEditor.value = true
}

const handleEditTemplate = (row: TemplateItem) => {
  templateForm.value = {
    name: row.name,
    layout: row.layout,
    granularity: row.granularity,
    dataPoints: [...row.dataPoints],
    displayModes: [...row.displayModes],
  }
  editingId.value = row.id
  showEditor.value = true
}

const handleDeleteTemplate = (row: TemplateItem) => {
  ElMessageBox.confirm(`确认删除模板 "${row.name}" ?`, '提示', { type: 'warning' }).then(() => {
    templateList.value = templateList.value.filter(t => t.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleUseTemplate = (row: TemplateItem) => {
  currentTemplate.value = row
  ElMessage.success(`已选择模板：${row.name}`)
}

const handleSaveTemplate = () => {
  if (!templateForm.value.name) { ElMessage.warning('请输入模板名称'); return }
  if (templateForm.value.dataPoints.length === 0) { ElMessage.warning('请选择至少一个数据点'); return }

  if (editingId.value !== null) {
    const idx = templateList.value.findIndex(t => t.id === editingId.value)
    if (idx >= 0) {
      templateList.value[idx] = { ...templateList.value[idx], ...templateForm.value }
    }
    ElMessage.success('模板修改成功')
  } else {
    templateList.value.unshift({
      id: Date.now(),
      ...templateForm.value,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
    ElMessage.success('模板创建成功')
  }
  showEditor.value = false
}

const handlePreview = () => { ElMessage.info('预览功能开发中...') }

// ==================== 生命周期 ====================
onMounted(() => { templateList.value = generateMockTemplates() })
</script>

<style scoped lang="scss">
.custom-report-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ========== 顶部模板信息栏 ========== */
.template-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  background: rgba(10, 24, 45, 0.6);
  border-bottom: 1px solid rgba(0, 212, 255, 0.15);
  flex-shrink: 0;

  .template-info {
    display: flex;
    align-items: center;
    gap: 8px;
    .template-name { color: rgba(255,255,255,0.8); font-size: 13px; }
  }
}

/* ========== 模板编辑器 ========== */
.template-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 14px;
}

.editor-form {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);

  .form-label {
    color: rgba(255,255,255,0.65);
    font-size: 12px;
    white-space: nowrap;
  }
}

/* 数据标签页 */
.data-tabs {
  display: flex;
  gap: 0;
  padding-top: 10px;
  flex-shrink: 0;

  .data-tab {
    padding: 7px 18px;
    font-size: 12px;
    cursor: pointer;
    color: rgba(255,255,255,0.5);
    background: rgba(0, 40, 80, 0.4);
    border: 1px solid rgba(0, 212, 255, 0.15);
    border-bottom: none;
    transition: all 0.2s;

    &:first-child { border-radius: 4px 0 0 0; }
    &:last-child { border-radius: 0 4px 0 0; }

    &.active {
      background: rgba(0, 212, 255, 0.15);
      color: #00d4ff;
      font-weight: 600;
    }
    &:hover:not(.active) { color: rgba(255,255,255,0.8); }
  }
}

/* 数据选择区 */
.data-select-area {
  flex: 1;
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 0 4px 4px 4px;
  min-height: 0;
  overflow: hidden;
}

.select-section {
  padding: 10px 12px;
  border-right: 1px solid rgba(0, 212, 255, 0.1);

  &:last-child { border-right: none; }

  .section-title {
    color: #00d4ff;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  }

  .search-inputs {
    display: flex;
    flex-direction: column;
  }

  :deep(.el-radio) {
    display: block;
    margin-bottom: 6px;
    color: rgba(255,255,255,0.75);
  }

  :deep(.el-checkbox) {
    display: block;
    margin-bottom: 4px;
    color: rgba(255,255,255,0.75);
  }
}

.data-points-section {
  .dp-group {
    margin-bottom: 8px;
  }
  .dp-group-title {
    color: #00d4ff;
    font-size: 11px;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .dp-item {
    padding-left: 12px;
    :deep(.el-checkbox__label) { font-size: 12px; }
  }
}

/* 底部按钮 */
.editor-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(0, 212, 255, 0.15);
  flex-shrink: 0;
}

/* ========== 模板列表 ========== */
.template-list {
  flex: 1;
  padding: 10px 14px;
  overflow: auto;
}
</style>
