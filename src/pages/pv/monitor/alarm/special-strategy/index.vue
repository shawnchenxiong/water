<template>
  <DeviceMonitorLayout>
    <!-- 左侧电站树 -->
    <template #left>
      <StationTree
        device-type="0917"
        @node-click="handleStationSelect"
      />
    </template>
    
    <!-- 右侧内容 -->
    <template #right>
      <div class="special-alarm-strategy-content">
        <!-- 筛选条件 -->
        <div class="filter-bar" :class="{ 'mobile-filter-bar': isMobile }">
          <el-form :inline="!isMobile" :label-width="isMobile ? '80px' : 'auto'">
            <div class="filter-grid" :class="{ 'mobile-filter-grid': isMobile }">
              <!-- 基础筛选项（移动端始终显示） -->
              <el-form-item label="告警等级">
                <el-select v-model="queryForm.alarmLevel" placeholder="全部" :size="isMobile ? 'default' : 'default'" :style="{ width: '100%' }">
                  <el-option label="全部" value="" />
                  <el-option label="紧急" value="0" />
                  <el-option label="一般" value="1" />
                  <el-option label="严重" value="2" />
                </el-select>
              </el-form-item>
              
              <!-- 高级筛选项（移动端可折叠） -->
              <template v-if="!isMobile || isFilterExpanded">
                <el-form-item label="策略状态">
                  <el-select v-model="queryForm.policyStatus" placeholder="全部" :size="isMobile ? 'default' : 'default'" :style="{ width: '100%' }">
                    <el-option label="全部" value="" />
                    <el-option label="已启用" value="1" />
                    <el-option label="已停用" value="0" />
                  </el-select>
                </el-form-item>
                <el-form-item label="关键字">
                  <el-input 
                    v-model="queryForm.keywords" 
                    placeholder="请输入告警名称、设备名称、测点名称" 
                    :size="isMobile ? 'default' : 'default'"
                    :style="{ width: '100%' }"
                  />
                </el-form-item>
              </template>
            </div>
            
            <!-- 操作按钮组 -->
            <div class="action-buttons-section" :class="{ 'mobile-action-buttons': isMobile }">
              <el-button type="primary" @click="handleSearch" :size="isMobile ? 'default' : 'default'">
                搜索
              </el-button>
              <el-button :size="isMobile ? 'default' : 'default'">
                导入
              </el-button>
              <el-button 
                :disabled="selectedRows.length === 0 || isBatchOperating" 
                :size="isMobile ? 'default' : 'default'"
                :loading="isBatchEnabling"
                @click="handleBatchEnable"
              >
                批量启用
              </el-button>
              <el-button 
                :disabled="selectedRows.length === 0 || isBatchOperating" 
                :size="isMobile ? 'default' : 'default'"
                :loading="isBatchDisabling"
                @click="handleBatchDisable"
              >
                批量停用
              </el-button>
              <el-button type="primary" :size="isMobile ? 'default' : 'default'" @click="handleAdd">
                新增策略
              </el-button>
              <!-- 移动端展开/折叠按钮 -->
              <el-button 
                v-if="isMobile"
                type="text" 
                @click="toggleFilterExpanded"
                :size="isMobile ? 'default' : 'small'"
              >
                {{ isFilterExpanded ? '收起筛选' : '展开筛选' }}
                <el-icon>
                  <ArrowUp v-if="isFilterExpanded" />
                  <ArrowDown v-else />
                </el-icon>
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <el-table
            :data="tableData"
            v-loading="loading"
            @selection-change="handleSelectionChange"
            height="100%"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="status" label="策略状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '1' ? 'success' : 'info'">
                  {{ row.status === '1' ? '已启用' : '已停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alarmName" label="告警名称" width="180" />
            <el-table-column prop="deviceName" label="设备名称" width="120" />
            <el-table-column prop="alarmLevel" label="告警等级" width="100" />
            <el-table-column prop="deviceType" label="设备类型" width="100" />
            <el-table-column prop="productName" label="产品名称" width="150" />
            <el-table-column prop="meteName" label="测点名称" width="150" />
            <el-table-column prop="advice" label="处理建议" width="150" />
            <el-table-column prop="createUser" label="创建人" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button 
                  link 
                  :type="row.status === '1' ? 'warning' : 'success'" 
                  size="small"
                  @click="handleToggleStatus(row)"
                  :loading="row._loading"
                >
                  {{ row.status === '1' ? '停用' : '启用' }}
                </el-button>
                <el-button link type="primary" size="small" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 40, 100]"
          :total="pagination.total"
          :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
          :small="isMobile"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>

      <!-- 策略表单对话框 -->
      <StrategyFormDialog
        v-model:visible="formDialogVisible"
        :policy-id="editingPolicyId"
        @success="handleFormSuccess"
      />
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue'
import StationTree from '@/components/layout/StationTree.vue'
import StrategyFormDialog from './StrategyFormDialog.vue'
import { getStrategyList, enablePolicy, deactivatePolicy, deletePolicy } from '@/api/alarm/specialStrategy';
import type { AlarmStrategyRow } from '@/api/types/alarm/specialStrategy';

// 电站树数据
const selectedRegionId = ref('');

// 筛选条件
const queryForm = ref({
  alarmLevel: '', // 告警等级：0紧急 1一般 2严重
  policyStatus: '', // 策略状态：0停用 1启用
  keywords: '', // 关键字
});

// 表格数据
const tableData = ref<AlarmStrategyRow[]>([]);
const loading = ref(false);
const selectedRows = ref<AlarmStrategyRow[]>([]);
const isBatchOperating = ref(false);
const isBatchEnabling = ref(false);
const isBatchDisabling = ref(false);

// 分页
const pagination = ref({
  pageNum: 1,
  pageSize: 40,
  total: 0,
});

// 移动端检测
const isMobile = ref(false);
// 筛选项展开状态（仅移动端有效）
const isFilterExpanded = ref(false);

// 表单对话框
const formDialogVisible = ref(false);
const editingPolicyId = ref<string | undefined>(undefined);

// 检测是否为移动端
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768;
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile;
    // 移动端调整分页大小
    if (newIsMobile) {
      pagination.value.pageSize = 10;
    } else {
      pagination.value.pageSize = 40;
    }
    // 桌面端时自动展开
    if (!newIsMobile) {
      isFilterExpanded.value = false;
    }
  }
};

// 切换筛选项展开状态
const toggleFilterExpanded = () => {
  isFilterExpanded.value = !isFilterExpanded.value;
};

/**
 * 电站选择
 */
function handleStationSelect(node: any) {
  selectedRegionId.value = node.regionId;
  handleSearch();
}

/**
 * 初始化数据
 */
function initData() {
  // 默认不选择场站，但执行一次搜索
  selectedRegionId.value = ''
  handleSearch()
}

/**
 * 搜索
 */
async function handleSearch() {
  loading.value = true;
  try {
    const params: any = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      ...(queryForm.value.alarmLevel && { alarmLevel: queryForm.value.alarmLevel }),
      ...(queryForm.value.policyStatus && { policyStatus: queryForm.value.policyStatus }),
      ...(queryForm.value.keywords && { keywords: queryForm.value.keywords }),
    };

    // 如果选择了场站，才添加factoryId参数
    if (selectedRegionId.value) {
      params.factoryId = selectedRegionId.value;
    }

    const response = await getStrategyList(params);
    tableData.value = response.list;
    pagination.value.total = response.total;
  } catch (error) {
    console.error('Failed to load strategy list:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 选择变更
 */
function handleSelectionChange(rows: AlarmStrategyRow[]) {
  selectedRows.value = rows;
}

/**
 * 切换策略状态（启用/停用）
 */
async function handleToggleStatus(row: AlarmStrategyRow & { _loading?: boolean }) {
  try {
    // 设置loading状态
    row._loading = true;

    if (row.status === '1') {
      // 当前是启用状态，执行停用
      await deactivatePolicy(row.id);
      ElMessage.success('停用成功');
      row.status = '0';
    } else {
      // 当前是停用状态，执行启用
      await enablePolicy(row.id);
      ElMessage.success('启用成功');
      row.status = '1';
    }

    // 刷新列表
    await handleSearch();
  } catch (error: any) {
    console.error('切换策略状态失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    row._loading = false;
  }
}

/**
 * 批量启用
 */
async function handleBatchEnable() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要启用的策略');
    return;
  }

  // 过滤出当前停用的策略
  const toEnable = selectedRows.value.filter(row => row.status === '0');
  if (toEnable.length === 0) {
    ElMessage.warning('所选策略中无停用状态的策略');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量启用 ${toEnable.length} 条策略吗？`,
      '批量启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    isBatchOperating.value = true;
    isBatchEnabling.value = true;

    // 并发调用启用接口
    const promises = toEnable.map(row => enablePolicy(row.id));
    await Promise.all(promises);

    ElMessage.success(`成功启用 ${toEnable.length} 条策略`);
    
    // 刷新列表
    await handleSearch();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量启用失败:', error);
      ElMessage.error(error.message || '批量启用失败');
    }
  } finally {
    isBatchOperating.value = false;
    isBatchEnabling.value = false;
  }
}

/**
 * 批量停用
 */
async function handleBatchDisable() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要停用的策略');
    return;
  }

  // 过滤出当前启用的策略
  const toDisable = selectedRows.value.filter(row => row.status === '1');
  if (toDisable.length === 0) {
    ElMessage.warning('所选策略中无启用状态的策略');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量停用 ${toDisable.length} 条策略吗？`,
      '批量停用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    isBatchOperating.value = true;
    isBatchDisabling.value = true;

    // 并发调用停用接口
    const promises = toDisable.map(row => deactivatePolicy(row.id));
    await Promise.all(promises);

    ElMessage.success(`成功停用 ${toDisable.length} 条策略`);
    
    // 刷新列表
    await handleSearch();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量停用失败:', error);
      ElMessage.error(error.message || '批量停用失败');
    }
  } finally {
    isBatchOperating.value = false;
    isBatchDisabling.value = false;
  }
}

// 初始化
onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
  initData();
});

/**
 * 新增策略
 */
function handleAdd() {
  editingPolicyId.value = undefined;
  formDialogVisible.value = true;
}

/**
 * 编辑策略
 */
function handleEdit(row: AlarmStrategyRow) {
  editingPolicyId.value = row.id;
  formDialogVisible.value = true;
}

/**
 * 删除策略
 */
async function handleDelete(row: AlarmStrategyRow) {
  try {
    await ElMessageBox.confirm(
      `确定要删除策略"${row.alarmName}"吗？`,
      '删除策略',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deletePolicy(row.id);
    ElMessage.success('删除策略成功');
    
    // 刷新列表
    await handleSearch();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除策略失败:', error);
      ElMessage.error(error.message || '删除策略失败');
    }
  }
}

/**
 * 表单提交成功回调
 */
function handleFormSuccess() {
  handleSearch();
}

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.special-alarm-strategy-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  gap: 16px;
  overflow: hidden;
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    gap: 10px;
  }
  
  .filter-bar {
    background: rgba(10, 30, 50, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 6px;
    padding: 16px;
    
    /* 移动端适配 */
    &.mobile-filter-bar {
      padding: 12px;
    }
    
    @media (max-width: 768px) {
      padding: 12px;
    }
    
    @media (max-width: 480px) {
      padding: 10px;
    }
    
    :deep(.el-form-item) {
      margin-bottom: 8px;
      
      @media (max-width: 768px) {
        margin-bottom: 12px;
      }
    }
    
    :deep(.el-form-item__label) {
      color: rgba(255, 255, 255, 0.85);
      
      @media (max-width: 768px) {
        font-size: 13px;
      }
      
      @media (max-width: 480px) {
        font-size: 12px;
      }
    }
    
    .filter-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      align-items: end;
      
      /* 中等屏幕适配 */
      @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      
      /* 平板端适配 */
      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      
      /* 移动端适配 */
      &.mobile-filter-grid {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 10px;
      }
    }
    
    /* 操作按钮区域 */
    .action-buttons-section {
      display: flex;
      gap: 10px;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin-top: 12px;
      
      .el-button {
        min-width: 100px;
      }
      
      /* 移动端适配 */
      &.mobile-action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .el-button {
          flex: 0 0 auto;
          min-width: 80px;
        }
      }
      
      @media (max-width: 768px) {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
        
        .el-button {
          flex: 0 0 auto;
          min-width: 80px;
          
          /* 展开折叠按钮特殊处理 */
          &[type="text"] {
            min-width: auto;
            padding: 4px 8px;
            flex-shrink: 0;
            white-space: nowrap;
          }
        }
      }
      
        @media (max-width: 480px) {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          
          .el-button {
            flex: 0 0 auto;
            min-width: 70px;
            font-size: 13px;
            padding: 8px 12px;
            
            /* 展开折叠按钮特殊处理 */
            &[type="text"] {
              padding: 4px 8px;
              font-size: 12px;
              white-space: nowrap;
              min-width: auto;
            }
          }
        }
    }
  }
  
  
  .table-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    
  }
  
  :deep(.el-pagination) {
    justify-content: center;
    
    @media (min-width: 769px) {
      justify-content: flex-end;
    }
  }
}

// el-select, el-input 样式由全局样式控制

:deep(.el-button) {
  &:not(.el-button--primary):not(.el-button--danger):not(.el-button--warning):not(.el-button--success):not(.el-button--link) {
    background: rgba(0, 212, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.3);
    color: rgba(255, 255, 255, 0.85);
    
    &:hover {
      background: rgba(0, 212, 255, 0.2);
      border-color: #00d4ff;
      color: #fff;
    }
  }
}


:deep(.el-pagination) {
  .btn-prev,
  .btn-next,
  .el-pager li {
    background: rgba(10, 30, 50, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: rgba(255, 255, 255, 0.85);
    
    &:hover {
      color: #00d4ff;
      border-color: #00d4ff;
    }
    
    &.is-active {
      background: rgba(0, 212, 255, 0.3);
      border-color: #00d4ff;
      color: #fff;
    }
  }
  
  .el-pagination__total,
  .el-pagination__jump {
    color: rgba(255, 255, 255, 0.85);
  }
}
</style>
