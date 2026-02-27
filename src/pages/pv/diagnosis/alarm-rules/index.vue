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
      <div class="alarm-rules-wrapper">
        <!-- 顶部二级导航标签栏 -->
        <div class="sub-nav-bar">
          <router-link
            v-for="tab in navTabs"
            :key="tab.path"
            :to="tab.path"
            :class="['nav-tab', { active: isActiveTab(tab.path) }]"
          >{{ tab.name }}</router-link>
        </div>

        <!-- 操作栏 -->
        <div class="action-bar">
          <el-button type="primary" size="small" @click="handleAdd">
            <el-icon><Plus /></el-icon> 添加规则
          </el-button>
        </div>

        <!-- 规则列表表格 -->
        <div class="table-area">
          <el-table
            :data="paginatedData"
            stripe
            style="width: 100%"
            :header-cell-style="{ background: 'rgba(0,40,80,0.6)', color: '#00d4ff', fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.2)' }"
            :cell-style="{ fontSize: '12px', borderBottom: '1px solid rgba(0,212,255,0.08)' }"
            max-height="calc(100vh - 240px)"
          >
            <el-table-column label="序号" width="60" align="center" type="index" :index="getIndex" />
            <el-table-column label="逻辑名称" min-width="130" align="center">
              <template #default="{ row }">
                <el-link :underline="false" @click="handleEdit(row)" style="color: #00d4ff;">
                  {{ row.dataType }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="地址" width="100" prop="address" align="center" />
            <el-table-column label="告警持续时间(秒)" width="140" prop="duration" align="center" />
            <el-table-column label="告警级别" width="100" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="row.level === 2 ? 'danger' : row.level === 1 ? 'warning' : 'info'"
                  size="small" effect="dark"
                >{{ getLevelText(row.level) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="事件归类" width="120" prop="categorize" align="center" />
            <el-table-column label="整改建议" min-width="160" prop="suggest" show-overflow-tooltip />
            <el-table-column label="告警内容" min-width="180" prop="content" show-overflow-tooltip />
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" link size="small" @click="handleDelete(row)">删除规则</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-bar">
            <span class="total-text">共 {{ ruleList.length }} 条</span>
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30]"
              :total="ruleList.length"
              layout="prev, pager, next, sizes, jumper"
              small
            />
          </div>
        </div>

        <!-- ========== 添加/编辑规则抽屉 ========== -->
        <el-drawer
          v-model="drawerVisible"
          :title="drawerTitle"
          size="42%"
          :close-on-click-modal="false"
          destroy-on-close
        >
          <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" style="padding: 0 10px;">
            <!-- 设备信息 -->
            <el-form-item label="设备信息" prop="deviceId">
              <el-select v-model="form.deviceId" placeholder="请选择设备信息" style="width: 100%" clearable>
                <el-option v-for="item in deviceOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <!-- 节点信息 -->
            <el-form-item label="节点信息：" prop="monitorId">
              <el-select v-model="form.monitorId" placeholder="请选择数据类型" style="width: 100%" clearable @change="handleMonitorChange">
                <el-option v-for="item in monitorOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <!-- 逻辑名称 -->
            <el-form-item label="逻辑名称：" prop="dataType">
              <el-input v-model="form.dataType" placeholder="请输入逻辑名称" maxlength="15" show-word-limit />
            </el-form-item>

            <!-- 地址 -->
            <el-form-item label="地址：" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" maxlength="15" show-word-limit />
            </el-form-item>

            <!-- 告警类型 -->
            <el-form-item label="告警类型：" prop="ruleType">
              <el-radio-group v-model="form.ruleType">
                <el-radio :value="1">单数值</el-radio>
                <el-radio :value="2">双数值</el-radio>
                <el-radio :value="3">高级</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 单数值规则 -->
            <template v-if="form.ruleType === 1">
              <el-form-item label="告警规则：" prop="rule">
                <el-select v-model="form.rule" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in ruleOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="告警数值：" prop="numerical">
                <el-input v-model="form.numerical" placeholder="请输入告警数值(限数字)" maxlength="15" show-word-limit />
              </el-form-item>
            </template>

            <!-- 双数值规则 -->
            <template v-if="form.ruleType === 2">
              <el-form-item label="规则表达式：">
                <el-row :gutter="8" style="width: 100%;">
                  <el-col :span="5">
                    <el-select v-model="form.ruleA" placeholder="选择" size="small">
                      <el-option v-for="item in ruleOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-input v-model="form.numericalA" placeholder="A" size="small" />
                  </el-col>
                  <el-col :span="4">
                    <el-select v-model="form.ruleC" placeholder="选择" size="small">
                      <el-option label="or" :value="0" />
                      <el-option label="and" :value="1" />
                    </el-select>
                  </el-col>
                  <el-col :span="5">
                    <el-select v-model="form.ruleB" placeholder="选择" size="small">
                      <el-option v-for="item in ruleOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-col>
                  <el-col :span="4">
                    <el-input v-model="form.numericalB" placeholder="B" size="small" />
                  </el-col>
                </el-row>
              </el-form-item>
            </template>

            <!-- 高级规则 -->
            <template v-if="form.ruleType === 3">
              <el-form-item label="规则表达式：" prop="ruleExpression">
                <el-input v-model="form.ruleExpression" placeholder="示例: taos_cs001_mx0 > 60" />
              </el-form-item>
            </template>

            <!-- 持续时间 -->
            <el-form-item label="持续时间(秒)：" prop="duration">
              <el-input v-model="form.duration" placeholder="请输入告警持续时间(秒)" maxlength="15" show-word-limit />
            </el-form-item>

            <!-- 告警级别 -->
            <el-form-item label="告警级别：" prop="level">
              <el-select v-model="form.level" placeholder="请选择" style="width: 100%">
                <el-option label="一般" :value="0" />
                <el-option label="严重" :value="1" />
                <el-option label="紧急" :value="2" />
              </el-select>
            </el-form-item>

            <!-- 事件归类 -->
            <el-form-item label="事件归类：" prop="categorize">
              <el-input v-model="form.categorize" placeholder="请输入事件归类" maxlength="20" show-word-limit />
            </el-form-item>

            <!-- 整改建议 -->
            <el-form-item label="整改建议：">
              <el-input v-model="form.suggest" placeholder="请输入整改建议" maxlength="100" show-word-limit />
            </el-form-item>

            <!-- 告警内容 -->
            <el-form-item label="告警内容：" prop="content">
              <el-input v-model="form.content" placeholder="请输入告警内容" maxlength="200" type="textarea" show-word-limit :rows="3" />
            </el-form-item>

            <!-- 告警通知人 -->
            <el-form-item label="告警通知人：">
              <el-select v-model="form.contactList" multiple placeholder="请选择" style="width: 100%">
                <el-option v-for="item in contactOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>

          <div class="drawer-footer">
            <el-button @click="drawerVisible = false">关 闭</el-button>
            <el-button type="primary" @click="handleSubmit">确 定</el-button>
          </div>
        </el-drawer>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
/**
 * 告警规则页面 - 参考 jeecg 告警规则管理
 * 左侧工艺流程树 + 顶部二级Tab导航 + 规则表格 + 添加/编辑抽屉
 */
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const prefix = computed(() => route.path.startsWith('/es') ? '/es' : '/pv')

// ==================== 二级导航 ====================
const navTabs = computed(() => [
  { name: '告警概览', path: `${prefix.value}/diagnosis/alarm-overview` },
  { name: '实时告警', path: `${prefix.value}/diagnosis/alarm-realtime` },
  { name: '历史告警', path: `${prefix.value}/diagnosis/alarm-history` },
  { name: '告警规则', path: `${prefix.value}/diagnosis/alarm-rules` },
  { name: '告警统计', path: `${prefix.value}/diagnosis/alarm-statistics` },
])
const isActiveTab = (path: string) => route.path === path

// ==================== 左侧工艺树 ====================
const treeSearch = ref('')
const selectedNode = ref('')
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
const handleNodeClick = (node: any) => {
  if (node.id) selectedNode.value = node.id
}

// ==================== 表格状态 ====================
const currentPage = ref(1)
const pageSize = ref(10)

// ==================== 规则数据类型 ====================
interface RuleItem {
  id: number
  deviceId: string
  monitorId: string
  dataType: string
  address: string
  ruleType: number
  rule: number | null
  numerical: string
  ruleA: number | null
  numericalA: string
  ruleC: number | null
  ruleB: number | null
  numericalB: string
  ruleExpression: string
  duration: string
  level: number
  categorize: string
  suggest: string
  content: string
  contactList: string[]
}

// ==================== 模拟数据 ====================
const ruleList = ref<RuleItem[]>([])

const generateMockRules = (): RuleItem[] => {
  const dataTypes = ['系统地址异常越限', '机组地址异常越限', '频率传感异常', '温度超限监控', '液位异常监控', 'COD浓度监控', 'pH值监控', '溶解氧监控']
  const addresses = ['MX', 'DX', 'AX', 'TX', 'PX']
  const categories = ['设备故障', '参数越限', '通信异常', '运行告警']
  const contents = ['变频器或控制器故障', '水泵部件过热告警', '数据采集异常告警', '传感器校准提醒']
  const suggests = ['检查通信链路', '调整设备运行参数', '安排维修人员现场处理', '提高巡检频次']

  const result: RuleItem[] = []
  for (let i = 0; i < 12; i++) {
    result.push({
      id: 8000 + i,
      deviceId: 'device-001',
      monitorId: `monitor-${i}`,
      dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
      address: addresses[Math.floor(Math.random() * addresses.length)],
      ruleType: 1,
      rule: Math.floor(Math.random() * 5),
      numerical: String(Math.floor(Math.random() * 100)),
      ruleA: null, numericalA: '', ruleC: null, ruleB: null, numericalB: '',
      ruleExpression: '',
      duration: String(Math.floor(Math.random() * 300) + 5),
      level: Math.floor(Math.random() * 3),
      categorize: categories[Math.floor(Math.random() * categories.length)],
      suggest: suggests[Math.floor(Math.random() * suggests.length)],
      content: contents[Math.floor(Math.random() * contents.length)],
      contactList: []
    })
  }
  return result
}

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return ruleList.value.slice(start, start + pageSize.value)
})
const getIndex = (index: number) => (currentPage.value - 1) * pageSize.value + index + 1
const getLevelText = (level: number) => ({ 0: '一般', 1: '严重', 2: '紧急' }[level] || '未知')

// ==================== 抽屉表单 ====================
const drawerVisible = ref(false)
const drawerTitle = ref('添加规则')
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const getEmptyForm = (): RuleItem => ({
  id: 0, deviceId: '', monitorId: '', dataType: '', address: '',
  ruleType: 1, rule: null, numerical: '',
  ruleA: null, numericalA: '', ruleC: null, ruleB: null, numericalB: '',
  ruleExpression: '', duration: '', level: 0,
  categorize: '', suggest: '', content: '', contactList: []
})

const form = reactive<RuleItem>(getEmptyForm())

const rules = reactive<FormRules>({
  deviceId: [{ required: true, message: '请选择设备信息', trigger: 'change' }],
  dataType: [{ required: true, message: '逻辑名称不能为空', trigger: 'blur' }],
  address: [{ required: true, message: '地址不能为空', trigger: 'blur' }],
  duration: [{ required: true, message: '持续时间不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '告警级别不能为空', trigger: 'change' }],
  categorize: [{ required: true, message: '事件归类不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '告警内容不能为空', trigger: 'blur' }],
})

// 下拉选项
const deviceOptions = ref([
  { id: 'device-001', name: '1#提升泵' }, { id: 'device-002', name: '2#鼓风机' },
  { id: 'device-003', name: 'PAC加药泵' }, { id: 'device-004', name: '回流泵A' },
  { id: 'device-005', name: '脱水机A' }, { id: 'device-006', name: '格栅机B' },
])
const monitorOptions = ref([
  { id: 'monitor-1', name: '温度传感器', dataType: '温度超限监控', address: 'TX' },
  { id: 'monitor-2', name: '液位传感器', dataType: '液位异常监控', address: 'AX' },
  { id: 'monitor-3', name: 'COD传感器', dataType: 'COD浓度监控', address: 'DX' },
  { id: 'monitor-4', name: 'pH传感器', dataType: 'pH值监控', address: 'PX' },
  { id: 'monitor-5', name: '溶解氧传感器', dataType: '溶解氧监控', address: 'MX' },
])
const ruleOptions = [
  { value: 0, label: '等于' }, { value: 1, label: '大于' },
  { value: 2, label: '小于' }, { value: 3, label: '小于等于' }, { value: 4, label: '大于等于' }
]
const contactOptions = ref([
  { id: 'c1', name: '张工' }, { id: 'c2', name: '李工' },
  { id: 'c3', name: '王工' }, { id: 'c4', name: '赵工' },
])

// 节点信息变更自动填充
const handleMonitorChange = (val: string) => {
  const selected = monitorOptions.value.find(item => item.id === val)
  if (selected) {
    form.dataType = selected.dataType
    form.address = selected.address
  }
}

// ==================== 事件处理 ====================
const handleAdd = () => {
  Object.assign(form, getEmptyForm())
  editingId.value = null
  drawerTitle.value = '添加规则'
  drawerVisible.value = true
}

const handleEdit = (row: RuleItem) => {
  Object.assign(form, { ...row })
  editingId.value = row.id
  drawerTitle.value = '修改规则'
  drawerVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    if (editingId.value !== null) {
      // 编辑模式
      const idx = ruleList.value.findIndex(r => r.id === editingId.value)
      if (idx >= 0) ruleList.value[idx] = { ...form }
      ElMessage.success('修改成功')
    } else {
      // 新增模式
      ruleList.value.unshift({ ...form, id: Date.now() })
      ElMessage.success('新增成功')
    }
    drawerVisible.value = false
  })
}

const handleDelete = (row: RuleItem) => {
  ElMessageBox.confirm('是否确认删除该规则?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// ==================== 生命周期 ====================
onMounted(() => { ruleList.value = generateMockRules() })
</script>

<style scoped lang="scss">
.alarm-rules-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ========== 二级导航栏 ========== */
.sub-nav-bar {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 42px;
  background: rgba(10, 24, 45, 0.9);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  flex-shrink: 0;

  .nav-tab {
    padding: 8px 20px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.25s;
    border-bottom: 2px solid transparent;
    line-height: 24px;

    &:hover { color: rgba(255, 255, 255, 0.85); }
    &.active {
      color: #00d4ff;
      border-bottom-color: #00d4ff;
      font-weight: 600;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
    }
  }
}

/* ========== 操作栏 ========== */
.action-bar {
  padding: 10px 14px;
  flex-shrink: 0;
}

/* ========== 表格区域 ========== */
.table-area {
  flex: 1;
  padding: 0 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 8px 0;
  flex-shrink: 0;

  .total-text {
    color: rgba(255,255,255,0.6);
    font-size: 12px;
  }
}

/* ========== 抽屉底部 ========== */
.drawer-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid rgba(0, 212, 255, 0.15);
}
</style>
