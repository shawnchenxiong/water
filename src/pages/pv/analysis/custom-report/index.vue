<template>
  <div class="custom-report-page">
    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item>
          <el-select v-model="filterForm.templateType" placeholder="全部类型">
            <el-option label="全部类型" value="" />
            <el-option label="对比报表" value="对比报表" />
            <el-option label="统计报表" value="统计报表" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filterForm.stationName" placeholder="电站名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button @click="taskDialogVisible = true">任务列表</el-button>
        <el-button type="primary" @click="handleAddTemplate">新增模板</el-button>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <el-row :gutter="20">
        <el-col 
          v-for="template in templateList" 
          :key="template.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="8" 
          :xl="8"
        >
          <el-card class="template-card">
            <div class="card-header">
              <span class="template-name">{{ template.templateName }}</span>
              <el-tag size="small">{{ template.templateType }}</el-tag>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span>创建时间：</span>
                <span>{{ template.createTime }}</span>
              </div>
              <div class="info-item">
                <span>创建人：</span>
                <span>{{ template.creator }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
              <el-button link type="primary" size="small">导出</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="templateList.length === 0" description="暂无数据" />
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[20, 40, 60, 80]"
        :disabled="loading"
        :background="true"
        :layout="paginationLayout"
        :total="pagination.total"
        :small="isMobile"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 任务列表弹窗 -->
    <el-dialog 
      v-model="taskDialogVisible" 
      title="任务列表" 
      :width="isMobile ? '95%' : '900px'"
      :fullscreen="isMobile"
    >
      <div class="task-search">
        <el-form :inline="true">
          <el-form-item label="任务名称">
            <el-input v-model="taskForm.taskName" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select v-model="taskForm.status" placeholder="全部">
              <el-option label="全部" value="" />
              <el-option label="进行中" value="processing" />
              <el-option label="已完成" value="completed" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadTaskList">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="taskList" v-loading="taskLoading" style="width: 100%">
        <el-table-column prop="taskName" label="任务名称" />
        <el-table-column prop="createTime" label="任务创建时间" width="160" />
        <el-table-column prop="dataTimeRange" label="数据时间范围" width="200" />
        <el-table-column label="任务状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status === 'completed'" link type="primary" size="small">下载</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="task-pagination">
        <el-pagination
          v-model:current-page="taskPagination.pageNum"
          v-model:page-size="taskPagination.pageSize"
          :page-sizes="[20, 40, 60, 80]"
          :disabled="taskLoading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="taskPagination.total"
        />
      </div>
      <el-alert
        title="已生成的文件七天后会自动删除，请及时下载"
        type="warning"
        :closable="false"
        show-icon
        style="margin-top: 15px"
      />
    </el-dialog>

    <!-- 新增模板弹窗 -->
    <el-dialog 
      v-model="templateDialogVisible" 
      title="新增模板" 
      :width="isMobile ? '95%' : '1200px'"
      :fullscreen="isMobile"
      :close-on-click-modal="false"
    >
      <div class="template-form">
        <el-form :inline="true" label-width="100px">
          <el-form-item label="*模板名称">
            <el-input v-model="templateForm.templateName" placeholder="请输入" style="width: 200px;" />
          </el-form-item>
          <el-form-item label="模板类型">
            <el-radio-group v-model="templateForm.templateType">
              <el-radio label="对比报表" />
              <el-radio label="统计报表" />
            </el-radio-group>
          </el-form-item>
        </el-form>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="设备原始数据" name="deviceRaw" />
          <el-tab-pane label="设备报表" name="deviceReport" />
          <el-tab-pane label="电站报表" name="stationReport" />
          <el-tab-pane label="区域报表" name="regionReport" />
          <el-tab-pane label="集团报表" name="groupReport" />
        </el-tabs>
        <div class="selection-summary">
          已选择对象 {{ selectedObjects.length }} 个，已选择指标 {{ selectedIndicators.length }} 个
        </div>
      </div>

      <!-- 三列选择区域 -->
      <!-- 桌面端：三列布局 -->
      <div v-if="!isMobile" class="selection-area">
        <!-- 左：对象选择 -->
        <div class="selection-column">
          <div class="column-header">对象选择</div>
          <el-input v-model="objectSearch" placeholder="请输入关键字搜索" style="margin-bottom: 10px;">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button @click="loadDeviceTree" size="small" style="margin-bottom: 10px;">刷新</el-button>
          <el-tree
            :data="deviceTree"
            :props="treeProps"
            node-key="id"
            show-checkbox
            @check="handleObjectCheck"
          />
        </div>

        <!-- 中：已选对象 -->
        <div class="selection-column">
          <div class="column-header">已选对象</div>
          <el-input v-model="selectedObjectSearch" placeholder="请输入关键字搜索" style="margin-bottom: 10px;">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <div class="selected-list">
            <div v-for="obj in selectedObjects" :key="obj.id" class="selected-item">
              <span>{{ obj.name }}</span>
              <el-icon @click="removeObject(obj.id)" style="cursor: pointer;"><Close /></el-icon>
            </div>
            <el-empty v-if="selectedObjects.length === 0" description="暂无数据" :image-size="60" />
          </div>
        </div>

        <!-- 右：指标选择 -->
        <div class="selection-column">
          <div class="column-header">指标选择</div>
          <el-input v-model="indicatorSearch" placeholder="请输入关键字搜索" style="margin-bottom: 10px;">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-radio-group v-model="timeGranularity" size="small" style="margin-bottom: 10px;">
            <el-radio-button label="日" />
          </el-radio-group>
          <el-tree
            :data="indicatorTree"
            :props="treeProps"
            node-key="id"
            show-checkbox
            @check="handleIndicatorCheck"
          />
        </div>
      </div>
      
      <!-- 移动端：选项卡布局 -->
      <div v-else class="mobile-selection-area">
        <el-tabs v-model="activeSelectionTab" type="card">
          <el-tab-pane label="对象选择" name="objects">
            <el-input v-model="objectSearch" placeholder="请输入关键字搜索" style="margin-bottom: 10px;">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button @click="loadDeviceTree" size="small" style="margin-bottom: 10px;">刷新</el-button>
            <el-tree
              :data="deviceTree"
              :props="treeProps"
              node-key="id"
              show-checkbox
              @check="handleObjectCheck"
            />
          </el-tab-pane>
          
          <el-tab-pane name="selected">
            <template #label>
              已选对象 <el-badge :value="selectedObjects.length" :hidden="selectedObjects.length === 0" />
            </template>
            <el-input v-model="selectedObjectSearch" placeholder="请输入关键字搜索" style="margin-bottom: 10px;">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <div class="selected-list mobile-selected-list">
              <div v-for="obj in selectedObjects" :key="obj.id" class="selected-item">
                <span>{{ obj.name }}</span>
                <el-icon @click="removeObject(obj.id)" style="cursor: pointer;"><Close /></el-icon>
              </div>
              <el-empty v-if="selectedObjects.length === 0" description="暂无数据" :image-size="60" />
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="指标选择" name="indicators">
            <el-input v-model="indicatorSearch" placeholder="请输入关键字搜索" style="margin-bottom: 10px;">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-radio-group v-model="timeGranularity" size="small" style="margin-bottom: 10px;">
              <el-radio-button label="日" />
            </el-radio-group>
            <el-tree
              :data="indicatorTree"
              :props="treeProps"
              node-key="id"
              show-checkbox
              @check="handleIndicatorCheck"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 底部提示 -->
      <div class="template-footer">
        <div class="display-mode">显示方式</div>
        <el-alert
          title="图形中最多显示20项图列，表格中最多展示200列"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button>预览</el-button>
        <el-button type="primary">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Close } from '@element-plus/icons-vue';
import {
  getDeviceTree,
  getIndicatorTree,
  getTemplateList,
  getTaskList,
} from '@/api/analysis/customReport';
import type { ReportTemplate, ReportTask, DeviceTreeNode, IndicatorTreeNode } from '@/api/types/analysis/customReport';

// 移动端检测
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value <= 768);
const paginationLayout = computed(() => 
  isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
);

// 监听窗口大小变化
function handleResize() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// 筛选条件
const filterForm = ref({ templateType: '', stationName: '' });

// 模板列表
const templateList = ref<ReportTemplate[]>([]);
const loading = ref(false);
const pagination = ref({ pageNum: 1, pageSize: 20, total: 0 });

// 任务列表
const taskDialogVisible = ref(false);
const taskForm = ref({ taskName: '', status: '' });
const taskList = ref<ReportTask[]>([]);
const taskLoading = ref(false);
const taskPagination = ref({ pageNum: 1, pageSize: 20, total: 0 });

// 新增模板
const templateDialogVisible = ref(false);
const templateForm = ref({ templateName: '', templateType: '对比报表' });
const activeTab = ref('deviceRaw');
const activeSelectionTab = ref('objects'); // 移动端选择区域的选项卡
const deviceTree = ref<DeviceTreeNode[]>([]);
const indicatorTree = ref<IndicatorTreeNode[]>([]);
const selectedObjects = ref<DeviceTreeNode[]>([]);
const selectedIndicators = ref<IndicatorTreeNode[]>([]);
const objectSearch = ref('');
const selectedObjectSearch = ref('');
const indicatorSearch = ref('');
const timeGranularity = ref('日');
const treeProps = { children: 'children', label: 'name' };

/**
 * 加载模板列表
 */
async function loadTemplateList() {
  loading.value = true;
  try {
    const response = await getTemplateList({
      templateType: filterForm.value.templateType,
      stationName: filterForm.value.stationName,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
    });
    templateList.value = response.list;
    pagination.value.total = response.total;
  } catch (error) {
    ElMessage.error('加载模板列表失败');
    console.error('Failed to load template list:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 搜索
 */
function handleSearch() {
  pagination.value.pageNum = 1;
  loadTemplateList();
}

/**
 * 新增模板
 */
function handleAddTemplate() {
  templateForm.value = { templateName: '', templateType: '对比报表' };
  selectedObjects.value = [];
  selectedIndicators.value = [];
  templateDialogVisible.value = true;
  loadDeviceTree();
  loadIndicatorTree();
}

/**
 * 加载设备树
 */
async function loadDeviceTree() {
  try {
    const data = await getDeviceTree();
    deviceTree.value = data;
  } catch (error) {
    ElMessage.error('加载设备树失败');
    console.error('Failed to load device tree:', error);
  }
}

/**
 * 加载指标树
 */
async function loadIndicatorTree() {
  try {
    const data = await getIndicatorTree();
    indicatorTree.value = data;
  } catch (error) {
    ElMessage.error('加载指标树失败');
    console.error('Failed to load indicator tree:', error);
  }
}

/**
 * 对象勾选
 */
function handleObjectCheck(data: any, checked: any) {
  const checkedNodes = checked.checkedNodes.filter((n: any) => n.type === 'device');
  selectedObjects.value = checkedNodes;
}

/**
 * 指标勾选
 */
function handleIndicatorCheck(data: any, checked: any) {
  selectedIndicators.value = checked.checkedNodes.filter((n: any) => !n.children);
}

/**
 * 移除对象
 */
function removeObject(id: string) {
  selectedObjects.value = selectedObjects.value.filter((obj) => obj.id !== id);
}

/**
 * 加载任务列表
 */
async function loadTaskList() {
  taskLoading.value = true;
  try {
    const response = await getTaskList({
      taskName: taskForm.value.taskName,
      status: taskForm.value.status,
      pageNum: taskPagination.value.pageNum,
      pageSize: taskPagination.value.pageSize,
    });
    taskList.value = response.list;
    taskPagination.value.total = response.total;
  } catch (error) {
    ElMessage.error('加载任务列表失败');
    console.error('Failed to load task list:', error);
  } finally {
    taskLoading.value = false;
  }
}

/**
 * 获取状态类型
 */
function getStatusType(status: string) {
  const map: Record<string, any> = {
    completed: 'success',
    processing: 'warning',
    failed: 'danger',
  };
  return map[status] || 'info';
}

/**
 * 获取状态文本
 */
function getStatusText(status: string) {
  const map: Record<string, string> = {
    completed: '已完成',
    processing: '进行中',
    failed: '失败',
  };
  return map[status] || '未知';
}

/**
 * 每页大小变更
 */
function handleSizeChange(val: number) {
  pagination.value.pageSize = val;
  loadTemplateList();
}

/**
 * 页码变更
 */
function handleCurrentChange(val: number) {
  pagination.value.pageNum = val;
  loadTemplateList();
}

onMounted(() => {
  loadTemplateList();
});
</script>

<style scoped lang="scss">
.custom-report-page {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  height: calc(100vh - 104px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 15px;
    height: calc(100vh - 60px);
    
    // 表格移动端适配
    :deep(.el-table) {
      font-size: 13px;
      
      .el-table__cell {
        padding: 8px 5px;
      }
      
      .el-button {
        padding: 4px 8px;
        font-size: 12px;
      }
    }
    
    // 对话框移动端适配
    :deep(.el-dialog) {
      .el-dialog__header {
        padding: 15px 15px 10px;
        
        .el-dialog__title {
          font-size: 16px;
        }
      }
      
      .el-dialog__body {
        padding: 15px;
        max-height: 70vh;
        overflow-y: auto;
      }
      
      .el-dialog__footer {
        padding: 10px 15px 15px;
        
        .el-button {
          flex: 1;
          margin-left: 0;
          margin-right: 8px;
          
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }

  .filter-section {
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    // 移动端适配
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      
      .el-form {
        .el-form-item {
          margin-bottom: 12px;
          margin-right: 0;
        }
      }
      
      .action-buttons {
        justify-content: center;
        
        .el-button {
          flex: 1;
          min-width: 100px;
        }
      }
    }
  }

  .template-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;

    .template-card {
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        box-shadow: var(--el-box-shadow);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        .template-name {
          font-weight: 500;
          font-size: 16px;
          color: #00d4ff;
        }

        // 移动端适配
        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          
          .template-name {
            font-size: 14px;
          }
        }
      }

      .card-content {
        margin-bottom: 15px;

        .info-item {
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--el-text-color-secondary);
          
          // 移动端适配
          @media (max-width: 768px) {
            font-size: 12px;
            margin-bottom: 6px;
          }
        }
      }

      .card-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        
        // 移动端适配
        @media (max-width: 768px) {
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          
          .el-button {
            flex: 1;
            min-width: 60px;
          }
        }
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    
    // 移动端适配
    @media (max-width: 768px) {
      justify-content: center;
      padding: 12px;
      
      :deep(.el-pagination) {
        .el-pager li {
          min-width: 32px;
          height: 32px;
          line-height: 32px;
        }
        
        .btn-prev,
        .btn-next {
          min-width: 32px;
          height: 32px;
        }
      }
    }
  }

  .task-search {
    margin-bottom: 15px;
    
    // 移动端适配
    @media (max-width: 768px) {
      .el-form {
        .el-form-item {
          margin-bottom: 12px;
          margin-right: 0;
          display: block;
          
          .el-form-item__label {
            display: block;
            margin-bottom: 5px;
          }
          
          .el-form-item__content {
            margin-left: 0 !important;
          }
        }
      }
    }
  }

  .task-pagination {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
    
    // 移动端适配
    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .template-form {
    margin-bottom: 20px;

    // 移动端适配
    @media (max-width: 768px) {
      .el-form {
        .el-form-item {
          margin-bottom: 15px;
          margin-right: 0;
          display: block;
          
          .el-form-item__label {
            display: block;
            margin-bottom: 8px;
            text-align: left;
          }
          
          .el-form-item__content {
            margin-left: 0 !important;
          }
          
          .el-input {
            width: 100% !important;
          }
        }
      }
    }

    .selection-summary {
      margin-top: 10px;
      padding: 10px;
      background-color: var(--el-fill-color-lighter);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      text-align: center;
      font-weight: 500;
      color: var(--el-text-color-primary);
      
      // 移动端适配
      @media (max-width: 768px) {
        padding: 12px;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }

  .selection-area {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
    min-height: 400px;

    .selection-column {
      border: 1px solid var(--el-border-color);
      background-color: var(--el-bg-color);
      border-radius: 8px;
      padding: 15px;
      overflow-y: auto;

      .column-header {
        font-weight: 500;
        margin-bottom: 10px;
        font-size: 16px;
        color: #00d4ff;
      }

      .selected-list {
        .selected-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color: var(--el-fill-color-lighter);
          border: 1px solid var(--el-border-color-light);
          border-radius: 4px;
          margin-bottom: 8px;
          color: var(--el-text-color-regular);
          
          .el-icon {
            color: #ff6b6b;
            
            &:hover {
              color: #ff5252;
            }
          }
        }
      }
    }
  }

  // 移动端选择区域
  .mobile-selection-area {
    margin-bottom: 20px;
    min-height: 400px;
    
    :deep(.el-tabs__content) {
      padding: 15px 0;
      min-height: 350px;
    }
    
    :deep(.el-tab-pane) {
      min-height: 350px;
      overflow-y: auto;
    }
    
    .mobile-selected-list {
      max-height: 300px;
      overflow-y: auto;
      
      .selected-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background-color: var(--el-fill-color-lighter);
        border: 1px solid var(--el-border-color-light);
        border-radius: 6px;
        margin-bottom: 10px;
        color: var(--el-text-color-regular);
        font-size: 14px;
        
        .el-icon {
          color: #ff6b6b;
          font-size: 16px;
          
          &:hover {
            color: #ff5252;
          }
        }
      }
    }
  }

  .template-footer {
    .display-mode {
      font-weight: 500;
      margin-bottom: 10px;
      color: var(--el-text-color-primary);
    }
  }
}
</style>
