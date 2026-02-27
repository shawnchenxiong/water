<template>
  <div class="general-alarm-strategy-page" :class="{ 'mobile-page': isMobile }">
    <!-- 顶部筛选 + 操作 -->
    <div class="top-section" :class="{ 'mobile-top-section': isMobile }">
      <!-- 筛选条件 -->
      <div class="filter-section" :class="{ 'mobile-filter-section': isMobile }">
        <el-form :inline="!isMobile" :label-width="isMobile ? '80px' : 'auto'">
          <div class="filter-grid" :class="{ 'mobile-filter-grid': isMobile }">
            <!-- 基础筛选项（移动端始终显示） -->
            <el-form-item label="测点名称">
              <el-input 
                v-model="searchMeteName" 
                placeholder="请输入" 
                :size="isMobile ? 'default' : 'default'"
                :style="{ width: '100%' }"
              />
            </el-form-item>
            
            <!-- 高级筛选项（移动端可折叠，但这个页面没有高级筛选项） -->
          </div>
          
          <!-- 操作按钮组 -->
          <div class="action-buttons-section" :class="{ 'mobile-action-buttons': isMobile }">
            <el-button type="primary" @click="handleSearch" :size="isMobile ? 'default' : 'default'">
              搜索
            </el-button>
            <el-button 
              :disabled="selectedRows.length === 0" 
              :size="isMobile ? 'default' : 'default'"
            >
              批量启/停
            </el-button>
            <el-button :size="isMobile ? 'default' : 'default'">
              导入策略
            </el-button>
            <el-button :size="isMobile ? 'default' : 'default'">
              导出策略
            </el-button>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      
      <!-- 设备类型（带筛选） -->
      <el-table-column prop="deviceTypeName" label="设备类型" min-width="120">
        <template #header>
          <el-select 
            v-model="filters.deviceType" 
            placeholder="设备类型" 
            @change="handleFilterChange"
            style="width: 130px"
          >
            <el-option label="全部" value="" />
            <el-option label="门" value="0802" />
            <el-option label="温湿度" value="0901" />
            <el-option label="SF6" value="0904" />
          </el-select>
        </template>
      </el-table-column>
      
      <el-table-column prop="meteName" label="测点名称" min-width="150" />
      
      <!-- 测点分类（带筛选） -->
      <el-table-column prop="meteKindName" label="测点分类" min-width="100">
        <template #header>
          <el-select 
            v-model="filters.meteKind" 
            placeholder="测点分类" 
            @change="handleFilterChange"
            style="width: 130px"
          >
            <el-option label="全部" value="" />
            <el-option label="遥信" value="0" />
            <el-option label="遥测" value="1" />
          </el-select>
        </template>
      </el-table-column>
      
      <!-- 产品（带筛选） -->
      <el-table-column prop="modelName" label="产品" min-width="120">
        <template #header>
          <el-select 
            v-model="filters.modelId" 
            placeholder="产品" 
            @change="handleFilterChange"
            style="width: 130px"
          >
            <el-option label="全部" value="" />
            <el-option label="门" value="LHYR98NH00000003" />
            <el-option label="温湿度" value="LHYR98NH00000005" />
            <el-option label="SF6" value="LHYR98NH00000008" />
          </el-select>
        </template>
      </el-table-column>
      
      <!-- 启用状态（带筛选 + Switch） -->
      <el-table-column label="启用状态" width="100" align="center">
        <template #header>
          <el-select 
            v-model="filters.status" 
            placeholder="启用状态" 
            @change="handleFilterChange"
            style="width: 130px"
          >
            <el-option label="全部" value="" />
            <el-option label="开启" value="1" />
            <el-option label="关闭" value="0" />
          </el-select>
        </template>
        <template #default="{ row }">
          <el-switch 
            v-model="row.status" 
            :active-value="1" 
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      
      <el-table-column prop="name" label="告警名称" min-width="200" />
      <el-table-column prop="userName" label="修改人" width="100" />
      <el-table-column prop="updateTime" label="修改时间" width="160" />
      
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-section" :class="{ 'mobile-pagination-section': isMobile }">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 50, 100]"
        :total="pagination.total"
        :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
        :small="isMobile"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getGeneralStrategyList } from '@/api/alarm/generalStrategy';
import type { GeneralStrategyRow } from '@/api/types/alarm/generalStrategy';

// 顶部搜索
const searchMeteName = ref('');

// 列头筛选器
const filters = ref({
  deviceType: '',
  meteKind: '',
  modelId: '',
  status: '',
});

// 表格数据
const tableData = ref<GeneralStrategyRow[]>([]);
const loading = ref(false);
const selectedRows = ref<GeneralStrategyRow[]>([]);

// 分页
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
});

// 移动端检测
const isMobile = ref(false);

// 检测是否为移动端
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
  }
};

/**
 * 搜索
 */
async function handleSearch() {
  loading.value = true;
  try {
    const params = {
      meteName: searchMeteName.value,
      ...filters.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
    };

    const response = await getGeneralStrategyList(params);
    tableData.value = response.list;
    pagination.value.total = response.total;
  } catch (error) {
    console.error('Failed to load strategy list:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 筛选变更
 */
function handleFilterChange() {
  pagination.value.pageNum = 1;
  handleSearch();
}

/**
 * 状态变更
 */
function handleStatusChange(row: GeneralStrategyRow) {
  console.log('Toggle status:', row);
  // TODO: 调用API更新状态
}

/**
 * 选择变更
 */
function handleSelectionChange(rows: GeneralStrategyRow[]) {
  selectedRows.value = rows;
}

// 初始化
onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
  handleSearch();
});

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.general-alarm-strategy-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 104px);
  padding: 20px;
  gap: 16px;
  overflow: hidden;

  /* 移动端适配 */
  &.mobile-page {
    padding: 12px;
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    gap: 10px;
  }

  .top-section {
    background: rgba(0, 30, 60, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    /* 移动端适配 */
    &.mobile-top-section {
      padding: 12px;
      gap: 12px;
    }
    
    @media (max-width: 768px) {
      padding: 12px;
      gap: 12px;
    }
    
    @media (max-width: 480px) {
      padding: 10px;
      gap: 10px;
    }
    
    .filter-section {
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      
      /* 移动端适配 */
      &.mobile-filter-section {
        padding-bottom: 12px;
      }
      
      @media (max-width: 768px) {
        padding-bottom: 12px;
        
        :deep(.el-form-item) {
          margin-bottom: 12px;
        }
      }
      
      @media (max-width: 480px) {
        padding-bottom: 10px;
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
          }
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
    }

    .action-section {
      display: flex;
      gap: 12px;
      align-items: center;
      
      /* 移动端适配 */
      &.mobile-action-section {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      
      .button-group {
        display: flex;
        gap: 8px;
        
        &.mobile-button-group {
          flex-direction: column;
          gap: 8px;
        }
        
        @media (max-width: 768px) {
          flex-direction: column;
          gap: 8px;
        }
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: flex-end;
    background: rgba(0, 30, 60, 0.4);
    border: 1px solid rgba(0, 212, 255, 0.3);
    padding: 16px;
    border-radius: 8px;
    
    /* 移动端适配 */
    &.mobile-pagination-section {
      justify-content: center;
      padding: 12px;
    }
    
    @media (max-width: 768px) {
      justify-content: center;
      padding: 12px;
    }
    
    @media (max-width: 480px) {
      padding: 10px;
    }
    
    :deep(.el-pagination) {
      .el-pagination__total,
      .el-pagination__jump {
        color: rgba(255, 255, 255, 0.85);
      }
      
      /* 移动端表格优化 */
      @media (max-width: 768px) {
        .btn-prev,
        .btn-next,
        .el-pager li {
          min-width: 32px;
          height: 32px;
          font-size: 12px;
        }
      }
    }
  }
  
}
</style>
