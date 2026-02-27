<template>
  <div class="advanced-table-container">
    <!-- 表格工具栏 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right" />
      </div>
    </div>

    <!-- 高级表格 -->
    <div class="table-wrapper" :style="{ height: tableHeight }">
      <!-- 漂浮的列设置按钮 -->
      <div class="floating-column-setting" v-if="showColumnSetting">
        <el-dropdown 
          ref="columnDropdownRef"
          @command="handleColumnSetting" 
          trigger="click"
        >
          <el-button :icon="Setting" circle size="small" title="列设置" />
          <template #dropdown>
            <el-dropdown-menu class="column-setting-menu">
              <div class="column-setting-header">
                <span>显示列设置</span>
                <el-button 
                  type="primary" 
                  link 
                  size="small"
                  @click="resetTempColumns"
                >
                  重置
                </el-button>
              </div>
              <div class="column-setting-body">
                <el-checkbox-group v-model="tempVisibleColumns">
                  <div 
                    v-for="column in allColumns" 
                    :key="column.prop"
                    class="column-item"
                  >
                    <el-checkbox :label="column.prop">
                      {{ column.label }}
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              <div class="column-setting-footer">
                <el-button size="small" @click="cancelColumnSetting">取消</el-button>
                <el-button type="primary" size="small" @click="confirmColumnSetting">确定</el-button>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <el-table
        ref="tableRef"
        :data="tableData"
        :height="tableHeight"
        v-loading="loading"
        :element-loading-text="loadingText"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :fit="fit"
        :show-header="showHeader"
        :highlight-current-row="highlightCurrentRow"
        :row-class-name="rowClassName"
        :row-style="rowStyle"
        :cell-class-name="cellClassName"
        :cell-style="cellStyle"
        :header-row-class-name="headerRowClassName"
        :header-row-style="headerRowStyle"
        :header-cell-class-name="headerCellClassName"
        :header-cell-style="headerCellStyle"
        :row-key="rowKey"
        :empty-text="emptyText"
        :default-expand-all="defaultExpandAll"
        :expand-row-keys="expandRowKeys"
        :default-sort="defaultSort"
        :tooltip-effect="tooltipEffect"
        :show-summary="showSummary"
        :sum-text="sumText"
        :summary-method="summaryMethod"
        :span-method="spanMethod"
        :select-on-indeterminate="selectOnIndeterminate"
        :indent="indent"
        :lazy="lazy"
        :load="load"
        :tree-props="treeProps"
        :table-layout="tableLayout"
        :scrollbar-always-on="scrollbarAlwaysOn"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @cell-mouse-enter="handleCellMouseEnter"
        @cell-mouse-leave="handleCellMouseLeave"
        @cell-click="handleCellClick"
        @cell-dblclick="handleCellDblclick"
        @cell-contextmenu="handleCellContextmenu"
        @row-click="handleRowClick"
        @row-contextmenu="handleRowContextmenu"
        @row-dblclick="handleRowDblclick"
        @header-click="handleHeaderClick"
        @header-contextmenu="handleHeaderContextmenu"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @current-change="handleCurrentChange"
        @header-dragend="handleHeaderDragend"
        @expand-change="handleExpandChange"
        class="advanced-table"
      >
        <!-- 动态生成列 -->
        <template v-for="column in displayColumns" :key="column.prop">
          <!-- 选择列 -->
          <el-table-column
            v-if="column.type === 'selection'"
            type="selection"
            :width="column.width || 55"
            :fixed="column.fixed"
            :align="column.align || 'center'"
          />
          
          <!-- 索引列 -->
          <el-table-column
            v-else-if="column.type === 'index'"
            type="index"
            :label="column.label || '#'"
            :width="column.width || 50"
            :fixed="column.fixed"
            :align="column.align || 'center'"
            :index="column.index"
          />
          
          <!-- 展开列 -->
          <el-table-column
            v-else-if="column.type === 'expand'"
            type="expand"
            :width="column.width || 50"
            :fixed="column.fixed"
          >
            <template #default="scope">
              <slot name="expand" :row="scope.row" :index="scope.$index" />
            </template>
          </el-table-column>
          
          <!-- 普通列 -->
          <el-table-column
            v-else
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :render-header="column.renderHeader"
            :sortable="column.sortable"
            :sort-method="column.sortMethod"
            :sort-by="column.sortBy"
            :sort-orders="column.sortOrders"
            :resizable="column.resizable"
            :formatter="column.formatter"
            :show-overflow-tooltip="column.showOverflowTooltip"
            :align="column.align"
            :header-align="column.headerAlign"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
            :selectable="column.selectable"
            :reserve-selection="column.reserveSelection"
            :filters="column.filters"
            :filter-placement="column.filterPlacement"
            :filter-multiple="column.filterMultiple"
            :filter-method="column.filterMethod"
            :filtered-value="column.filteredValue"
          >
            <!-- 自定义列内容 -->
            <template #default="scope" v-if="column.slotName">
              <slot 
                :name="column.slotName" 
                v-bind="scope"
              />
            </template>
            
            <!-- 自定义表头 -->
            <template #header="scope" v-if="column.headerSlotName">
              <slot 
                :name="column.headerSlotName" 
                v-bind="scope"
              />
            </template>
          </el-table-column>
        </template>

        <!-- 空数据展示 -->
        <template #empty>
          <div class="table-empty">
            <slot name="empty">
              <el-empty :description="emptyText || '暂无数据'" />
            </slot>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :pager-count="pagerCount"
        :disabled="paginationDisabled"
        :hide-on-single-page="hideOnSinglePage"
        :small="smallPagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @prev-click="handlePrevClick"
        @next-click="handleNextClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ElTable, ElMessage } from 'element-plus';
import { 
  Setting,
  Sort,
  Filter
} from '@element-plus/icons-vue';

// 类型定义
export interface ColumnConfig {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  fixed?: boolean | 'left' | 'right';
  sortable?: boolean | 'custom';
  sortMethod?: Function;
  sortBy?: string | string[] | Function;
  sortOrders?: string[];
  resizable?: boolean;
  formatter?: Function;
  showOverflowTooltip?: boolean;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  className?: string;
  labelClassName?: string;
  type?: 'selection' | 'index' | 'expand';
  selectable?: Function;
  reserveSelection?: boolean;
  filters?: Array<{ text: string; value: any }>;
  filterPlacement?: string;
  filterMultiple?: boolean;
  filterMethod?: Function;
  filteredValue?: any[];
  index?: number | Function;
  renderHeader?: Function;
  slotName?: string;
  headerSlotName?: string;
  visible?: boolean;
}

// Props定义
interface Props {
  // 表格数据
  data: any[];
  columns: ColumnConfig[];
  
  // 加载状态
  loading?: boolean;
  loadingText?: string;
  
  // 表格配置
  height?: string | number;
  maxHeight?: string | number;
  stripe?: boolean;
  border?: boolean;
  fit?: boolean;
  showHeader?: boolean;
  highlightCurrentRow?: boolean;
  rowClassName?: string | Function;
  rowStyle?: object | Function;
  cellClassName?: string | Function;
  cellStyle?: object | Function;
  headerRowClassName?: string | Function;
  headerRowStyle?: object | Function;
  headerCellClassName?: string | Function;
  headerCellStyle?: object | Function;
  rowKey?: string | Function;
  emptyText?: string;
  defaultExpandAll?: boolean;
  expandRowKeys?: any[];
  defaultSort?: object;
  tooltipEffect?: 'dark' | 'light';
  showSummary?: boolean;
  sumText?: string;
  summaryMethod?: Function;
  spanMethod?: Function;
  selectOnIndeterminate?: boolean;
  indent?: number;
  lazy?: boolean;
  load?: Function;
  treeProps?: object;
  tableLayout?: 'fixed' | 'auto';
  scrollbarAlwaysOn?: boolean;
  
  // 工具栏配置
  showToolbar?: boolean;
  showColumnSetting?: boolean;
  
  // 分页配置
  showPagination?: boolean;
  pageSize?: number;
  pageSizes?: number[];
  total?: number;
  paginationLayout?: string;
  pagerCount?: number;
  paginationDisabled?: boolean;
  hideOnSinglePage?: boolean;
  smallPagination?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  loadingText: '加载中...',
  height: 'auto',
  stripe: true,
  border: true,
  fit: true,
  showHeader: true,
  highlightCurrentRow: true,
  emptyText: '暂无数据',
  defaultExpandAll: false,
  tooltipEffect: 'dark',
  showSummary: false,
  sumText: '合计',
  selectOnIndeterminate: true,
  indent: 16,
  lazy: false,
  tableLayout: 'fixed',
  scrollbarAlwaysOn: false,
  showToolbar: true,
  showColumnSetting: true,
  showPagination: true,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  total: 0,
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  pagerCount: 7,
  paginationDisabled: false,
  hideOnSinglePage: false,
  smallPagination: false
});

// Emits定义
const emit = defineEmits([
  'select',
  'select-all',
  'selection-change',
  'cell-mouse-enter',
  'cell-mouse-leave',
  'cell-click',
  'cell-dblclick',
  'cell-contextmenu',
  'row-click',
  'row-contextmenu',
  'row-dblclick',
  'header-click',
  'header-contextmenu',
  'sort-change',
  'filter-change',
  'current-change',
  'header-dragend',
  'expand-change',
  'size-change',
  'page-change',
  'prev-click',
  'next-click',
  'column-change'
]);

// 响应式数据
const tableRef = ref<InstanceType<typeof ElTable>>();
const columnDropdownRef = ref();
const currentPage = ref(1);
const currentPageSize = ref(props.pageSize);
const allColumns = ref<ColumnConfig[]>([...props.columns]);
const visibleColumns = ref<string[]>([]);
const tempVisibleColumns = ref<string[]>([]); // 临时存储用户选择的列
const columnSettings = ref<Map<string, { fixed?: boolean | 'left' | 'right' }>>(new Map());

// 计算属性
const tableData = computed(() => props.data);

const tableHeight = computed(() => {
  if (props.height === 'auto') {
    // 自适应高度计算
    return 'auto';
  }
  return props.height;
});

const displayColumns = computed(() => {
  return allColumns.value
    .filter(col => visibleColumns.value.includes(col.prop))
    .map(col => ({
      ...col,
      fixed: columnSettings.value.get(col.prop)?.fixed ?? col.fixed
    }))
    .sort((a, b) => {
      // 固定列排序：left -> normal -> right
      const aFixed = a.fixed;
      const bFixed = b.fixed;
      
      if (aFixed === 'left' && bFixed !== 'left') return -1;
      if (bFixed === 'left' && aFixed !== 'left') return 1;
      if (aFixed === 'right' && bFixed !== 'right') return 1;
      if (bFixed === 'right' && aFixed !== 'right') return -1;
      
      return 0;
    });
});

// 初始化可见列
const initVisibleColumns = () => {
  visibleColumns.value = allColumns.value
    .filter(col => col.visible !== false)
    .map(col => col.prop);
  // 同时初始化临时列设置
  tempVisibleColumns.value = [...visibleColumns.value];
};

// 监听列配置变化
watch(() => props.columns, (newColumns) => {
  allColumns.value = [...newColumns];
  initVisibleColumns();
}, { immediate: true, deep: true });

// 列设置相关方法
const handleColumnSetting = (_command: string) => {
  // 打开列设置时，复制当前显示状态到临时变量
  tempVisibleColumns.value = [...visibleColumns.value];
};

// 确定列设置
const confirmColumnSetting = () => {
  visibleColumns.value = [...tempVisibleColumns.value];
  ElMessage.success('列设置已应用');
  emit('column-change', displayColumns.value);
  // 关闭下拉菜单
  columnDropdownRef.value?.handleClose?.();
};

// 取消列设置
const cancelColumnSetting = () => {
  // 恢复临时变量到当前显示状态
  tempVisibleColumns.value = [...visibleColumns.value];
  // 关闭下拉菜单
  columnDropdownRef.value?.handleClose?.();
};

// 重置临时列设置
const resetTempColumns = () => {
  tempVisibleColumns.value = allColumns.value
    .filter(col => col.visible !== false)
    .map(col => col.prop);
};

const resetColumns = () => {
  initVisibleColumns();
  ElMessage.success('列设置已重置');
  emit('column-change', displayColumns.value);
};


// 表格事件处理
const handleSelect = (selection: any[], row: any) => {
  emit('select', selection, row);
};

const handleSelectAll = (selection: any[]) => {
  emit('select-all', selection);
};

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection);
};

const handleCellMouseEnter = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-mouse-enter', row, column, cell, event);
};

const handleCellMouseLeave = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-mouse-leave', row, column, cell, event);
};

const handleCellClick = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-click', row, column, cell, event);
};

const handleCellDblclick = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-dblclick', row, column, cell, event);
};

const handleCellContextmenu = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-contextmenu', row, column, cell, event);
};

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event);
};

const handleRowContextmenu = (row: any, column: any, event: Event) => {
  emit('row-contextmenu', row, column, event);
};

const handleRowDblclick = (row: any, column: any, event: Event) => {
  emit('row-dblclick', row, column, event);
};

const handleHeaderClick = (column: any, event: Event) => {
  emit('header-click', column, event);
};

const handleHeaderContextmenu = (column: any, event: Event) => {
  emit('header-contextmenu', column, event);
};

const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
  emit('sort-change', sort);
};

const handleFilterChange = (filters: any) => {
  emit('filter-change', filters);
};

const handleCurrentChange = (currentRow: any, oldCurrentRow: any) => {
  emit('current-change', currentRow, oldCurrentRow);
};

const handleHeaderDragend = (newWidth: number, oldWidth: number, column: any, event: Event) => {
  emit('header-dragend', newWidth, oldWidth, column, event);
};

const handleExpandChange = (row: any, expandedRows: any[]) => {
  emit('expand-change', row, expandedRows);
};

// 分页事件处理
const handleSizeChange = (size: number) => {
  currentPageSize.value = size;
  emit('size-change', size);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  emit('page-change', page);
};

const handlePrevClick = (page: number) => {
  emit('prev-click', page);
};

const handleNextClick = (page: number) => {
  emit('next-click', page);
};

// 公开方法
const clearSelection = () => {
  tableRef.value?.clearSelection();
};

const toggleRowSelection = (row: any, selected?: boolean) => {
  tableRef.value?.toggleRowSelection(row, selected);
};

const toggleAllSelection = () => {
  tableRef.value?.toggleAllSelection();
};

const toggleRowExpansion = (row: any, expanded?: boolean) => {
  tableRef.value?.toggleRowExpansion(row, expanded);
};

const setCurrentRow = (row: any) => {
  tableRef.value?.setCurrentRow(row);
};

const clearSort = () => {
  tableRef.value?.clearSort();
};

const clearFilter = (columnKeys?: string[]) => {
  tableRef.value?.clearFilter(columnKeys);
};

const doLayout = () => {
  nextTick(() => {
    tableRef.value?.doLayout();
  });
};

const sort = (prop: string, order: string) => {
  tableRef.value?.sort(prop, order);
};

// 暴露方法给父组件
defineExpose({
  clearSelection,
  toggleRowSelection,
  toggleAllSelection,
  toggleRowExpansion,
  setCurrentRow,
  clearSort,
  clearFilter,
  doLayout,
  sort,
  tableRef
});

// 生命周期
onMounted(() => {
  initVisibleColumns();
  doLayout();
});
</script>

<style lang="scss">
.advanced-table-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(25, 55, 110, 0.5);
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  
  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  
  .floating-column-setting {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    
    .el-button {
      background: rgba(20, 50, 100, 0.9) !important;
      border: 1px solid rgba(0, 212, 255, 0.6) !important;
      color: #00d4ff !important;
      backdrop-filter: blur(4px);
      
      &:hover {
        background: rgba(30, 70, 140, 0.9) !important;
        border-color: #00d4ff !important;
        transform: scale(1.05);
      }
    }
  }
  
  .advanced-table {
    height: 100%;
  }
}

.table-pagination {
  padding: 16px 20px;
  background: rgba(25, 55, 110, 0.6);
  border-top: 1px solid rgba(0, 212, 255, 0.3);
  display: flex;
  justify-content: center;
}

.table-empty {
  padding: 40px 0;
  
  :deep(.el-empty) {
    .el-empty__description {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// 列设置下拉菜单样式
.column-setting-menu {
  background: rgba(20, 50, 100, 0.95) !important;
  border: 1px solid rgba(0, 212, 255, 0.4) !important;
  width: 320px !important;  // 固定宽度
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important; // 整个浮框不滚动
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  .column-setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    color: #fff;
    font-weight: 500;
    flex-shrink: 0; // 头部固定不缩放
  }
  
  .column-setting-body {
    height: 350px !important; // 固定高度
    padding: 12px 16px !important;
    overflow-y: auto !important; // 纵向滚动
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 212, 255, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.4);
      border-radius: 3px;
      
      &:hover {
        background: rgba(0, 212, 255, 0.6);
      }
    }
    
    .column-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0, 212, 255, 0.1);
      transition: background-color 0.2s;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background: rgba(0, 212, 255, 0.05);
        border-radius: 4px;
      }
      
      .el-checkbox {
        flex: 1;
        
        :deep(.el-checkbox__label) {
          color: #fff;
        }
        
        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background-color: #00d4ff;
          border-color: #00d4ff;
        }
        
        :deep(.el-checkbox__inner) {
          border-color: rgba(0, 212, 255, 0.4);
          
          &:hover {
            border-color: #00d4ff;
          }
        }
      }
      
      .column-actions {
        display: flex;
        gap: 4px;
        
        .el-button {
          width: 24px;
          height: 24px;
          padding: 0;
          
          &:hover {
            color: #00d4ff;
          }
        }
      }
    }
  }
  
  .column-setting-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid rgba(0, 212, 255, 0.3);
    background: rgba(15, 40, 80, 0.8);
    flex-shrink: 0; // 底部固定不缩放
    
    .el-button {
      font-size: 12px;
      min-width: 60px;
      
      &:not(.el-button--primary) {
        background: transparent;
        border: 1px solid rgba(0, 212, 255, 0.4);
        color: rgba(255, 255, 255, 0.8);
        
        &:hover {
          border-color: #00d4ff;
          color: #00d4ff;
        }
      }
      
      &.el-button--primary {
        background: #00d4ff;
        border-color: #00d4ff;
        color: #0a1628;
        
        &:hover {
          background: rgba(0, 212, 255, 0.8);
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .column-setting-menu {
    width: 280px !important; // 移动端固定宽度
    
    .column-setting-body {
      height: 250px !important; // 移动端稍小的固定高度
      padding: 8px 12px !important;
      
      .column-item {
        padding: 8px 0;
        
        .el-checkbox {
          :deep(.el-checkbox__label) {
            font-size: 13px;
          }
        }
      }
    }
    
    .column-setting-footer {
      padding: 8px 12px;
      
      .el-button {
        font-size: 11px;
        padding: 4px 12px;
        min-width: 50px;
      }
    }
  }
}
</style>
