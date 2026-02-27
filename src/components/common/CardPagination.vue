<template>
  <div class="card-pagination">
    <!-- 总数显示 -->
    <div class="pagination-info">
      共 {{ total }} 条
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination-controls">
      <!-- 上一页按钮 -->
      <button 
        class="pagination-btn prev-btn"
        :class="{ disabled: currentPage <= 1 }"
        @click="handlePrev"
        :disabled="currentPage <= 1"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <!-- 页码按钮 -->
      <template v-for="page in pageNumbers" :key="page">
        <button
          v-if="page !== '...'"
          class="pagination-btn page-btn"
          :class="{ active: page === currentPage }"
          @click="handlePageClick(page as number)"
        >
          {{ page }}
        </button>
        <span v-else class="pagination-ellipsis">...</span>
      </template>
      
      <!-- 下一页按钮 -->
      <button 
        class="pagination-btn next-btn"
        :class="{ disabled: currentPage >= totalPages }"
        @click="handleNext"
        :disabled="currentPage >= totalPages"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <!-- 每页显示数选择器 -->
    <div class="page-size-selector">
      <el-select
        :model-value="pageSize"
        @change="handlePageSizeChange"
        style="width: 90px"
        size="small"
        popper-class="page-size-dropdown"
      >
        <el-option
          v-for="size in pageSizeOptions"
          :key="size"
          :label="`${size}条/页`"
          :value="size"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /** 当前页码 */
  currentPage: number;
  /** 每页条数 */
  pageSize: number;
  /** 总条数 */
  total: number;
  /** 每页条数选项 */
  pageSizeOptions?: number[];
  /** 显示的页码按钮数量 */
  pagerCount?: number;
}

interface Emits {
  (e: 'update:current-page', page: number): void;
  (e: 'update:page-size', size: number): void;
  (e: 'change', currentPage: number, pageSize: number): void;
  (e: 'current-change', page: number): void;
  (e: 'size-change', size: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [12, 24, 36, 48],
  pagerCount: 7
});

const emit = defineEmits<Emits>();

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize);
});

// 计算显示的页码
const pageNumbers = computed(() => {
  const current = props.currentPage;
  const total = totalPages.value;
  const pagerCount = props.pagerCount;
  
  if (total <= pagerCount) {
    // 如果总页数小于等于显示的页码数，显示所有页码
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  const half = Math.floor(pagerCount / 2);
  let start = current - half;
  let end = current + half;
  
  // 调整起始和结束位置
  if (start < 1) {
    start = 1;
    end = pagerCount;
  }
  
  if (end > total) {
    end = total;
    start = total - pagerCount + 1;
  }
  
  const pages: (number | string)[] = [];
  
  // 如果起始页不是第一页，添加第一页和省略号
  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push('...');
    }
  }
  
  // 添加中间的页码
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  // 如果结束页不是最后一页，添加省略号和最后一页
  if (end < total) {
    if (end < total - 1) {
      pages.push('...');
    }
    pages.push(total);
  }
  
  return pages;
});

// 上一页
const handlePrev = () => {
  if (props.currentPage > 1) {
    const newPage = props.currentPage - 1;
    emit('update:current-page', newPage);
    emit('current-change', newPage);
    emit('change', newPage, props.pageSize);
  }
};

// 下一页
const handleNext = () => {
  if (props.currentPage < totalPages.value) {
    const newPage = props.currentPage + 1;
    emit('update:current-page', newPage);
    emit('current-change', newPage);
    emit('change', newPage, props.pageSize);
  }
};

// 页码点击
const handlePageClick = (page: number) => {
  if (page !== props.currentPage) {
    emit('update:current-page', page);
    emit('current-change', page);
    emit('change', page, props.pageSize);
  }
};

// 每页条数变化
const handlePageSizeChange = (size: number) => {
  emit('update:page-size', size);
  emit('size-change', size);
  // 重新计算当前页，确保不超出范围
  const newTotalPages = Math.ceil(props.total / size);
  const newCurrentPage = props.currentPage > newTotalPages ? newTotalPages : props.currentPage;
  if (newCurrentPage !== props.currentPage) {
    emit('update:current-page', newCurrentPage);
    emit('current-change', newCurrentPage);
  }
  emit('change', newCurrentPage, size);
};
</script>

<style scoped lang="scss">
.card-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(25, 55, 110, 0.6);
  border-top: 1px solid rgba(0, 212, 255, 0.3);
  min-height: 60px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 16px;
    min-height: 44px;
  }
}

.pagination-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 400;
  
  @media (max-width: 768px) {
    order: 1;
    font-size: 12px;
    flex: 0 0 auto;
  }
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  
  @media (max-width: 768px) {
    order: 2;
    flex: 1;
    justify-content: center;
  }
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: rgba(25, 55, 110, 0.7);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  
  &:hover:not(.disabled) {
    background: rgba(30, 70, 140, 0.9);
    border-color: #00d4ff;
    transform: translateY(-1px);
  }
  
  &.active {
    background: rgba(0, 212, 255, 0.8);
    border-color: #00d4ff;
    color: #ffffff;
    font-weight: 600;
  }
  
  &.disabled {
    background: rgba(20, 40, 80, 0.5);
    border-color: rgba(0, 212, 255, 0.2);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
}

.page-btn {
  font-weight: 500;
  
  &:not(.active):hover {
    background: rgba(0, 212, 255, 0.2);
  }
}

.prev-btn,
.next-btn {
  padding: 0;
  width: 32px;
  
  &:not(.disabled):hover {
    background: rgba(0, 212, 255, 0.2);
  }
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  user-select: none;
}

.page-size-selector {
  @media (max-width: 768px) {
    order: 3;
    flex: 0 0 auto;
  }
  
  :deep(.el-select) {
    .el-select__wrapper {
      background: rgba(25, 55, 110, 0.7) !important;
      border: 1px solid rgba(0, 212, 255, 0.4) !important;
      border-radius: 4px !important;
      height: 32px !important;
      
      &:hover {
        border-color: #00d4ff !important;
      }
      
      &.is-focused {
        border-color: #00d4ff !important;
        box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.2) !important;
      }
    }
    
    .el-select__selected-item {
      color: #ffffff !important;
      font-size: 12px !important;
    }
    
    .el-select__suffix {
      color: #00d4ff !important;
    }
  }
}

// 下拉菜单全局样式
:global(.page-size-dropdown) {
  background: rgba(20, 50, 100, 0.95) !important;
  border: 1px solid rgba(0, 212, 255, 0.4) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  
  .el-select-dropdown__item {
    color: #ffffff !important;
    font-size: 12px !important;
    
    &:hover {
      background: rgba(0, 212, 255, 0.2) !important;
    }
    
    &.is-selected {
      background: rgba(0, 212, 255, 0.4) !important;
      color: #ffffff !important;
    }
  }
}
</style>
