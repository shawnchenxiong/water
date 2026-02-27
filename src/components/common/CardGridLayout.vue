<template>
  <div class="card-grid-layout">
    <!-- 卡片网格容器 -->
    <div 
      class="card-grid"
      :class="{
        'is-loading': loading,
        [`grid-cols-${columns}`]: columns,
        [`grid-gap-${gap}`]: gap
      }"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>{{ loadingText }}</span>
        </div>
      </div>
      
      <!-- 空数据状态 -->
      <div v-else-if="!data || data.length === 0" class="empty-container">
        <div class="empty-content">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="9,11 12,8 15,11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="empty-text">{{ emptyText }}</div>
          <el-button v-if="showRefreshBtn" @click="handleRefresh">
            刷新数据
          </el-button>
        </div>
      </div>
      
      <!-- 卡片列表 -->
      <template v-else>
        <slot 
          v-for="(item, index) in currentPageData" 
          :key="getItemKey(item, index)"
          :item="item"
          :index="index"
          :onClick="(clickedItem: T) => handleCardClick(clickedItem, index)"
        >
          <!-- 默认卡片内容：如果没有提供插槽，显示简单的卡片 -->
          <div class="default-card" @click="handleCardClick(item, index)">
            <div class="card-content">
              <h3 class="card-title">{{ getDisplayTitle(item) }}</h3>
              <p class="card-description">{{ getDisplayDescription(item) }}</p>
            </div>
          </div>
        </slot>
      </template>
    </div>
    
    <!-- 分页组件 -->
    <CardPagination
      v-if="!loading && data && data.length > 0 && showPagination"
      :current-page="internalCurrentPage"
      :page-size="internalPageSize"
      :total="total"
      :page-size-options="pageSizeOptions"
      @change="handlePaginationChange"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts" generic="T = any">
import { ref, computed, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import CardPagination from './CardPagination.vue';

interface Props {
  /** 数据源 */
  data?: T[];
  /** 是否加载中 */
  loading?: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 空数据文本 */
  emptyText?: string;
  /** 是否显示刷新按钮 */
  showRefreshBtn?: boolean;
  /** 是否显示分页 */
  showPagination?: boolean;
  /** 当前页 */
  currentPage?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 总条数 */
  total?: number;
  /** 每页条数选项 */
  pageSizeOptions?: number[];
  /** 网格列数 */
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto';
  /** 网格间距 */
  gap?: 'small' | 'medium' | 'large';
  /** 数据项的唯一键名 */
  itemKey?: string;
  /** 默认卡片标题字段名 */
  titleField?: string;
  /** 默认卡片描述字段名 */
  descriptionField?: string;
}

interface Emits {
  (e: 'update:current-page', page: number): void;
  (e: 'update:page-size', size: number): void;
  (e: 'page-change', page: number): void;
  (e: 'size-change', size: number): void;
  (e: 'pagination-change', currentPage: number, pageSize: number): void;
  (e: 'card-click', item: T, index: number): void;
  (e: 'item-click', item: T, index: number): void;
  (e: 'refresh'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  showRefreshBtn: true,
  showPagination: true,
  currentPage: 1,
  pageSize: 12,
  pageSizeOptions: () => [12, 24, 36, 48],
  columns: 'auto',
  gap: 'medium',
  itemKey: 'id',
  titleField: 'name',
  descriptionField: 'description'
});

const emit = defineEmits<Emits>();

// 内部状态
const internalCurrentPage = ref(props.currentPage);
const internalPageSize = ref(props.pageSize);

// 监听外部传入的页码变化
watch(() => props.currentPage, (newPage) => {
  if (newPage !== undefined) {
    internalCurrentPage.value = newPage;
  }
});

watch(() => props.pageSize, (newSize) => {
  if (newSize !== undefined) {
    internalPageSize.value = newSize;
  }
});

// 计算总条数
const total = computed(() => {
  if (props.total !== undefined) {
    return props.total;
  }
  return props.data?.length || 0;
});

// 计算当前页数据
const currentPageData = computed(() => {
  if (!props.data || props.total !== undefined) {
    // 如果传入了总数，说明是服务端分页，直接返回数据
    return props.data || [];
  }
  
  // 客户端分页
  const start = (internalCurrentPage.value - 1) * internalPageSize.value;
  const end = start + internalPageSize.value;
  return props.data.slice(start, end);
});

// 获取数据项的键
const getItemKey = (item: T, index: number): string | number => {
  if (props.itemKey && item && typeof item === 'object' && props.itemKey in item) {
    return (item as any)[props.itemKey];
  }
  return index;
};

// 分页变化处理
const handlePaginationChange = (currentPage: number, pageSize: number) => {
  internalCurrentPage.value = currentPage;
  internalPageSize.value = pageSize;
  emit('update:current-page', currentPage);
  emit('update:page-size', pageSize);
  emit('pagination-change', currentPage, pageSize);
};

const handlePageChange = (page: number) => {
  internalCurrentPage.value = page;
  emit('update:current-page', page);
  emit('page-change', page);
};

const handleSizeChange = (size: number) => {
  internalPageSize.value = size;
  emit('update:page-size', size);
  emit('size-change', size);
};

// 获取显示标题
const getDisplayTitle = (item: T): string => {
  if (props.titleField && item && typeof item === 'object' && props.titleField in item) {
    return String((item as any)[props.titleField]);
  }
  return '未命名';
};

// 获取显示描述
const getDisplayDescription = (item: T): string => {
  if (props.descriptionField && item && typeof item === 'object' && props.descriptionField in item) {
    return String((item as any)[props.descriptionField]);
  }
  return '无描述信息';
};

// 卡片点击
const handleCardClick = (item: T, index: number) => {
  emit('card-click', item, index);
  emit('item-click', item, index);
};

// 刷新
const handleRefresh = () => {
  emit('refresh');
};

// 暴露内部状态
defineExpose({
  currentPage: internalCurrentPage,
  pageSize: internalPageSize,
  total
});
</script>

<style scoped lang="scss">
.card-grid-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, rgba(20, 50, 100, 0.95) 0%, rgba(10, 40, 80, 0.9) 100%);
  overflow: hidden;
}

.card-grid {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  
  // 网格布局 - 自动适应
  &:not(.is-loading):not(:has(.empty-container)) {
    display: grid;
    
    // 自动列数 - 调整最小宽度以适应更多卡片
    &:not([class*="grid-cols-"]) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    
    // 固定列数
    &.grid-cols-1 { grid-template-columns: 1fr; }
    &.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    &.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
    &.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
    &.grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
    &.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
    
    // 间距
    &.grid-gap-small { gap: 12px; }
    &.grid-gap-medium { gap: 20px; }
    &.grid-gap-large { gap: 28px; }
    
    // 响应式调整
    @media (max-width: 1400px) {
      &.grid-cols-4 { grid-template-columns: repeat(3, 1fr); }
      &.grid-cols-5 { grid-template-columns: repeat(3, 1fr); }
      &.grid-cols-6 { grid-template-columns: repeat(3, 1fr); }
    }
    
    @media (max-width: 1024px) {
      &:not([class*="grid-cols-"]) {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
      &.grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
      &.grid-cols-4 { grid-template-columns: repeat(3, 1fr); }
      &.grid-cols-5 { grid-template-columns: repeat(3, 1fr); }
      &.grid-cols-6 { grid-template-columns: repeat(3, 1fr); }
    }
    
    @media (max-width: 768px) {
      &:not([class*="grid-cols-"]) {
        grid-template-columns: 1fr;
      }
      &[class*="grid-cols-"] { grid-template-columns: 1fr; }
      &.grid-gap-medium { gap: 16px; }
      &.grid-gap-large { gap: 20px; }
      padding: 16px;
    }
  }
  
  // 滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(20, 50, 100, 0.3);
  }
}

// 加载状态
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #00d4ff;
  
  .el-icon {
    font-size: 48px;
  }
  
  span {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
  }
}

// 空数据状态
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(20, 50, 100, 0.9) 0%, rgba(10, 40, 80, 0.8) 100%);
  border-radius: 50%;
  color: #00d4ff;
  
  svg {
    width: 40px;
    height: 40px;
  }
}

.empty-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

// 默认卡片样式
.default-card {
  background: linear-gradient(135deg, rgba(25, 55, 110, 0.8) 0%, rgba(15, 45, 90, 0.7) 100%);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  
  &:hover {
    border-color: rgba(0, 212, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 212, 255, 0.15),
      0 0 20px rgba(0, 212, 255, 0.1);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
}

.card-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
}
</style>
