<template>
  <DeviceMonitorLayout>
    <!-- 左侧：设备树 -->
    <template #left>
      <div class="device-tree-section">
      <div class="tree-header">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键字搜索"
          clearable
          @input="filterTree"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="tree-actions">
          <el-button text @click="toggleEmptyFolder">
            <el-icon><Folder /></el-icon>
            空文件夹隐藏
          </el-button>
          <el-button text @click="filterOnline">在线</el-button>
          <el-button text @click="filterOffline">离线</el-button>
          <el-button text @click="loadDeviceTree">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      <el-tree
        ref="deviceTreeRef"
        :data="filteredTreeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :filter-node-method="filterNode"
        @check="handleTreeCheck"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span v-if="data.type !== 'camera'" class="device-count">
              ({{ data.onlineCount }}/{{ data.totalCount }})
            </span>
            <span
              v-if="data.type === 'camera'"
              :class="['device-status', data.status]"
            >
              {{ data.status === 'online' ? '在线' : '离线' }}
            </span>
          </span>
        </template>
      </el-tree>
      </div>
    </template>

    <!-- 右侧：内容区域 -->
    <template #right>
      <div class="content-section">
      <!-- 筛选条件 -->
      <div class="filter-section" :class="{ 'mobile-filter-section': isMobile }">
        <el-form :inline="!isMobile" :model="filterForm" :label-width="isMobile ? '80px' : 'auto'">
          <div class="filter-grid" :class="{ 'mobile-filter-grid': isMobile }">
            <!-- 基础筛选项（移动端始终显示） -->
            <el-form-item label="录像时间" class="date-range-item">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                :size="isMobile ? 'default' : 'default'"
                :style="{ width: '100%' }"
              />
            </el-form-item>
            
            <!-- 高级筛选项（移动端可折叠） -->
            <template v-if="!isMobile || isFilterExpanded">
              <el-form-item label="文件位置">
                <el-select v-model="filterForm.fileLocation" placeholder="请选择" :size="isMobile ? 'default' : 'default'" :style="{ width: '100%' }">
                  <el-option label="全部" value="" />
                  <el-option label="本地存储" value="本地存储" />
                  <el-option label="云端存储" value="云端存储" />
                </el-select>
              </el-form-item>
              <el-form-item label="文件类型">
                <el-select v-model="filterForm.fileType" placeholder="请选择" :size="isMobile ? 'default' : 'default'" :style="{ width: '100%' }">
                  <el-option label="全部" value="" />
                  <el-option label="普通录像" value="普通录像" />
                  <el-option label="告警录像" value="告警录像" />
                  <el-option label="手动录像" value="手动录像" />
                </el-select>
              </el-form-item>
            </template>
          </div>
        </el-form>
        
        <!-- 操作按钮组 -->
        <div class="action-buttons-section" :class="{ 'mobile-action-buttons': isMobile }">
          <el-button type="primary" @click="handleSearch" :size="isMobile ? 'default' : 'default'">
            搜索
          </el-button>
          <el-button
            type="primary"
            :disabled="selectedFiles.length === 0"
            @click="handlePlaySelected"
            :size="isMobile ? 'default' : 'default'"
          >
            播放所选文件
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
      </div>

      <!-- 数据表格 -->
      <div class="table-container" :class="{ 'mobile-table-container': isMobile }">
        <el-table
          :data="tableData"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          style="width: 100%"
          class="video-query-table"
          :class="{ 'mobile-table': isMobile }"
          height="100%"
        >
          <el-table-column type="selection" width="55" fixed="left" />
          <el-table-column prop="fileName" label="文件名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="startTime" label="开始时间" width="160" />
          <el-table-column prop="endTime" label="结束时间" width="160" />
          <el-table-column prop="location" label="存放位置" width="120" />
          <el-table-column prop="cameraName" label="摄像头名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="fileSizeMB" label="文件大小" width="120">
            <template #default="{ row }">
              {{ row.fileSizeMB }} MB
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handlePlay(row)">
                播放
              </el-button>
              <el-button link type="primary" size="small" @click="handleDownload(row)">
                下载
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 50, 100]"
          :small="isMobile"
          :disabled="loading"
          :background="true"
          :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox, ElTree } from 'element-plus';
import { Search, Folder, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import {
  getVideoDeviceTree,
  getRecordList,
  playRecord,
  downloadRecord,
  deleteRecord,
} from '@/api/video/query';
import type {
  VideoDeviceTreeNode,
  VideoRecordFile,
  QueryFilterForm,
} from '@/api/types/video/query';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';

// 设备树
const deviceTreeRef = ref<InstanceType<typeof ElTree>>();
const deviceTree = ref<VideoDeviceTreeNode[]>([]);
const filteredTreeData = ref<VideoDeviceTreeNode[]>([]);
const searchKeyword = ref('');
const treeProps = {
  children: 'children',
  label: 'name',
};
const selectedDevices = ref<string[]>([]);

// 筛选条件
const filterForm = ref<QueryFilterForm>({
  fileLocation: '',
  dateRange: [
    '2025-10-18 00:00:00',
    '2025-10-18 23:59:59',
  ],
  fileType: '',
});

// 表格数据
const tableData = ref<VideoRecordFile[]>([]);
const selectedFiles = ref<VideoRecordFile[]>([]);
const loading = ref(false);

// 分页
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
});

// 移动端检测
const isMobile = ref(false);
// 筛选项展开状态（仅移动端有效）
const isFilterExpanded = ref(false);

/**
 * 加载设备树
 */
async function loadDeviceTree() {
  try {
    const data = await getVideoDeviceTree();
    deviceTree.value = data;
    filteredTreeData.value = data;
  } catch (error) {
    ElMessage.error('加载设备树失败');
    console.error('Failed to load device tree:', error);
  }
}

/**
 * 过滤设备树
 */
function filterTree() {
  deviceTreeRef.value?.filter(searchKeyword.value);
}

/**
 * 树节点过滤方法
 */
function filterNode(value: string, data: any) {
  if (!value) return true;
  return data.name?.includes(value) || false;
}

/**
 * 切换空文件夹隐藏
 */
function toggleEmptyFolder() {
  ElMessage.info('功能开发中');
}

/**
 * 筛选在线设备
 */
function filterOnline() {
  ElMessage.info('筛选在线设备');
}

/**
 * 筛选离线设备
 */
function filterOffline() {
  ElMessage.info('筛选离线设备');
}

/**
 * 树节点勾选
 */
function handleTreeCheck() {
  const checkedNodes = deviceTreeRef.value?.getCheckedNodes() as VideoDeviceTreeNode[];
  // 只取camera类型的节点
  selectedDevices.value = checkedNodes
    .filter((node) => node.type === 'camera')
    .map((node) => node.id);
}

/**
 * 搜索
 */
async function handleSearch() {
  loading.value = true;
  try {
    const response = await getRecordList({
      deviceId: selectedDevices.value.length > 0 ? selectedDevices.value[0] : 'CAMERA_001', // 使用选中设备或默认设备
      fileLocation: filterForm.value.fileLocation,
      startTime: filterForm.value.dateRange[0],
      endTime: filterForm.value.dateRange[1],
      fileType: filterForm.value.fileType,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
    });
    tableData.value = response.list;
    pagination.value.total = response.total;
  } catch (error) {
    ElMessage.error('查询录像列表失败');
    console.error('Failed to load record list:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 表格选择变更
 */
function handleSelectionChange(rows: VideoRecordFile[]) {
  selectedFiles.value = rows;
}

/**
 * 播放单个文件
 */
async function handlePlay(row: VideoRecordFile) {
  try {
    const response = await playRecord({
      fileId: row.id,
      filePath: row.filePath,
    });
    ElMessage.success(`开始播放: ${row.fileName}`);
    console.log('Play URL:', response.playUrl);
    // TODO: 跳转到录像回放页面或弹窗播放
  } catch (error) {
    ElMessage.error('播放失败');
    console.error('Failed to play record:', error);
  }
}

/**
 * 播放所选文件
 */
function handlePlaySelected() {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }
  ElMessage.success(`开始播放 ${selectedFiles.value.length} 个文件`);
  // TODO: 批量播放逻辑
}

/**
 * 下载文件
 */
async function handleDownload(row: VideoRecordFile) {
  try {
    await downloadRecord(row.id);
    ElMessage.success(`开始下载: ${row.fileName}`);
  } catch (error) {
    ElMessage.error('下载失败');
    console.error('Failed to download record:', error);
  }
}

/**
 * 删除文件
 */
async function handleDelete(row: VideoRecordFile) {
  try {
    await ElMessageBox.confirm(
      `确定要删除录像文件"${row.fileName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deleteRecord({ fileId: row.id });
    ElMessage.success('删除成功');
    handleSearch(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('Failed to delete record:', error);
    }
  }
}

/**
 * 每页大小变更
 */
function handleSizeChange(val: number) {
  pagination.value.pageSize = val;
  handleSearch();
}

/**
 * 页码变更
 */
function handleCurrentChange(val: number) {
  pagination.value.pageNum = val;
  handleSearch();
}

/**
 * 检测是否为移动端
 */
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768;
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile;
    // 移动端调整分页大小
    if (newIsMobile) {
      pagination.value.pageSize = 10;
    } else {
      pagination.value.pageSize = 20;
    }
    // 桌面端时自动展开
    if (!newIsMobile) {
      isFilterExpanded.value = false;
    }
  }
};

/**
 * 切换筛选项展开状态
 */
const toggleFilterExpanded = () => {
  isFilterExpanded.value = !isFilterExpanded.value;
};

onMounted(() => {
  loadDeviceTree();
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
  // 页面加载时自动搜索数据
  handleSearch();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.device-tree-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 12px;
  }

    .tree-header {
      margin-bottom: 15px;

      .tree-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        flex-wrap: wrap;

        .el-button {
          font-size: 12px;
          padding: 5px 10px;
        }
        
        @media (max-width: 768px) {
          gap: 8px;
          justify-content: flex-start;
          
          .el-button {
            font-size: 11px;
            padding: 4px 8px;
          }
        }
      }
    }

    .el-tree {
      flex: 1;
      overflow-y: auto;
      background-color: transparent;

      .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;

        .device-count {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-left: 5px;
        }

        .device-status {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          &.online {
            background-color: var(--el-color-success-light-9);
            color: var(--el-color-success);
          }
          &.offline {
            background-color: var(--el-color-info-light-9);
            color: var(--el-color-info);
          }
        }
    }
  }
}

.content-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 12px;
  }

    .filter-section {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        align-items: end;
        
        /* Medium screen adaptation */
        @media (max-width: 1400px) {
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        
        /* Tablet adaptation */
        @media (max-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        
        /* Mobile adaptation */
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
        
        /* Date range picker spans full width on mobile */
        .date-range-item {
          @media (max-width: 768px) {
            grid-column: 1 / -1;
          }
        }
      }
      
      /* Action buttons section */
      .action-buttons-section {
        display: flex;
        gap: 10px;
        justify-content: flex-start;
        flex-wrap: wrap;
        margin-top: 12px;
        
        .el-button {
          min-width: 100px;
        }
        
        /* Mobile adaptation */
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
            
            /* Expand/collapse button special handling */
            &[type="text"] {
              min-width: auto;
              padding: 4px 8px;
              flex-shrink: 0;
              white-space: nowrap;
              margin-left: auto;
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
            
            /* Expand/collapse button special handling */
            &[type="text"] {
              padding: 4px 8px;
              font-size: 12px;
              white-space: nowrap;
              min-width: auto;
            }
          }
        }
      }
      
      &.mobile-filter-section {
        padding: 16px;
        margin-bottom: 12px;
        
        .el-form {
          margin: 0;
        }
      }
    }

    .action-section {
      margin-bottom: 15px;
      display: flex;
      justify-content: flex-end;
    }

    .table-container {
      flex: 1;
      margin-bottom: 15px;
      min-height: 0; /* 允许flex子元素压缩 */
      display: flex;
      flex-direction: column;
    }

    .video-query-table {
      width: 100%;
      flex: 1;
      min-height: 0;
      
      // 让Element Plus表格自己处理滚动
      :deep(.el-table) {
        height: 100%;
      }
      
      :deep(.el-table__body-wrapper) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      :deep(.el-table__header-wrapper) {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      :deep(table) {
        table-layout: auto;
        width: 100% !important;
        min-width: 900px; // 确保表格有最小宽度，触发横向滚动
      }
      
      // 确保空状态时表格不会异常拉宽
      :deep(.el-table__empty-block) {
        width: 100% !important;
        min-height: 200px;
      }
      
      // 移动端表格样式优化
      @media (max-width: 768px) {
        :deep(.el-table__header-wrapper) {
          .el-table__header {
            th {
              font-size: 13px;
              padding: 8px 4px;
            }
          }
        }
        
        :deep(.el-table__body-wrapper) {
          .el-table__body {
            td {
              font-size: 12px;
              padding: 8px 4px;
            }
          }
        }
        
        // 操作按钮在移动端的样式
        :deep(.el-button--small) {
          font-size: 11px;
          padding: 4px 8px;
          margin: 0 2px;
        }
      }
    }

    .pagination-section {
      display: flex;
      justify-content: flex-end;
      padding-top: 15px;
      border-top: 1px solid var(--el-border-color-lighter);
      
      @media (max-width: 768px) {
        justify-content: center;
        padding-top: 12px;
      }
    }
  }
</style>
