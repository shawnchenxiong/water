<template>
  <div class="history-alarm-tab">
    <!-- 筛选条件 -->
    <div class="filter-bar" :class="{ 'mobile': isMobile }">
      <div class="filter-row">
        <div class="filter-item">
          <span class="label">告警等级</span>
          <el-select 
            v-model="filters.alarmLevel" 
            placeholder="全部" 
            :style="{ width: isMobile ? '100px' : '120px' }"
            :size="isMobile ? 'small' : 'default'"
          >
            <el-option label="全部" :value="undefined" />
            <el-option label="一级" :value="1" />
            <el-option label="二级" :value="2" />
            <el-option label="三级" :value="3" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="label">确认状态</span>
          <el-select 
            v-model="filters.confirmStatus" 
            placeholder="全部" 
            :style="{ width: isMobile ? '100px' : '120px' }"
            :size="isMobile ? 'small' : 'default'"
          >
            <el-option label="全部" :value="undefined" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="未确认" value="unconfirmed" />
          </el-select>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-item full-width">
          <span class="label">告警产生时间</span>
          <el-date-picker
            v-model="filters.alarmTimeRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :style="{ width: isMobile ? '100%' : '360px' }"
            :size="isMobile ? 'small' : 'default'"
          />
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-item full-width">
          <span class="label">告警消除时间</span>
          <el-date-picker
            v-model="filters.clearTimeRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :style="{ width: isMobile ? '100%' : '360px' }"
            :size="isMobile ? 'small' : 'default'"
          />
        </div>
      </div>
      
      <div class="filter-row">
        <el-button 
          type="primary" 
          :size="isMobile ? 'small' : 'default'"
          @click="handleSearch"
        >
          搜索
        </el-button>
      </div>
    </div>

    <!-- 告警列表 -->
    <div class="table-wrapper">
        <el-table 
          :data="alarmList" 
          v-loading="loading" 
          border 
          stripe 
          :size="isMobile ? 'small' : 'default'"
          style="width: 100%"
        >
        <el-table-column label="告警等级" prop="alarmLevel" :width="isMobile ? 80 : 100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.alarmLevel)" :size="isMobile ? 'small' : 'default'">
              {{ getAlarmLevelText(row.alarmLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="告警名称" prop="alarmName" :min-width="isMobile ? 120 : 150" />
        <el-table-column label="告警位置" prop="alarmLocation" :min-width="isMobile ? 120 : 150" />
        <el-table-column label="告警设备" prop="alarmDevice" :min-width="isMobile ? 120 : 150" />
        <el-table-column label="产生时间" prop="alarmTime" :width="isMobile ? 140 : 180">
          <template #default="{ row }">
            <span v-if="isMobile" class="mobile-time">{{ formatMobileTime(row.alarmTime) }}</span>
            <span v-else>{{ row.alarmTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消除时间" prop="clearTime" :width="isMobile ? 140 : 180">
          <template #default="{ row }">
            <span v-if="isMobile && row.clearTime" class="mobile-time">{{ formatMobileTime(row.clearTime) }}</span>
            <span v-else>{{ row.clearTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="处理建议" prop="suggestion" :min-width="isMobile ? 120 : 180" />
        <el-table-column label="状态" prop="confirmStatus" :width="isMobile ? 80 : 100" fixed="right">
          <template #default="{ row }">
            <el-tag 
              :type="row.confirmStatus === 'confirmed' ? 'success' : 'warning'"
              :size="isMobile ? 'small' : 'default'"
            >
              {{ row.confirmStatus === 'confirmed' ? '已确认' : '未确认' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="isMobile ? [5, 10, 15] : [20, 40, 60, 80]"
          :total="total"
          :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
          :size="isMobile ? 'small' : 'default'"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getHistoryAlarms } from '@/api/device/inverterDetail';
import type { AlarmInfo } from '@/api/types/device/inverterDetail';

interface Props {
  deviceId: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const alarmList = ref<AlarmInfo[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 移动端检测
const isMobile = ref(false);
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768;
  const wasChanged = isMobile.value !== newIsMobile;
  isMobile.value = newIsMobile;
  
  // 如果切换到移动端，调整页面大小
  if (wasChanged && newIsMobile) {
    pageSize.value = 5;
    currentPage.value = 1;
    loadData();
  } else if (wasChanged && !newIsMobile) {
    pageSize.value = 20;
    currentPage.value = 1;
    loadData();
  }
};

const filters = reactive({
  alarmLevel: undefined as number | undefined,
  alarmTimeRange: null as [Date, Date] | null,
  clearTimeRange: null as [Date, Date] | null,
  confirmStatus: undefined as string | undefined
});

// 告警等级类型
const getAlarmLevelType = (level: number) => {
  const typeMap: Record<number, any> = { 1: 'danger', 2: 'warning', 3: 'info' };
  return typeMap[level] || 'info';
};

const getAlarmLevelText = (level: number) => {
  const textMap: Record<number, string> = { 1: '一级', 2: '二级', 3: '三级' };
  return textMap[level] || level;
};

// 格式化移动端时间显示
const formatMobileTime = (timeStr: string) => {
  if (!timeStr) return '-';
  // 只显示月-日 时:分
  const date = new Date(timeStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const response = await getHistoryAlarms({
      deviceId: props.deviceId,
      alarmLevel: filters.alarmLevel,
      startTime: filters.alarmTimeRange?.[0]?.toISOString(),
      endTime: filters.alarmTimeRange?.[1]?.toISOString(),
      clearStartTime: filters.clearTimeRange?.[0]?.toISOString(),
      clearEndTime: filters.clearTimeRange?.[1]?.toISOString(),
      confirmStatus: filters.confirmStatus,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    });
    alarmList.value = response.list;
    total.value = response.total;
  } catch (error) {
    console.error('加载历史告警失败:', error);
    ElMessage.error('加载历史告警失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadData();
};

watch(() => props.deviceId, () => {
  loadData();
});

onMounted(() => {
  // 初始化移动端检测
  checkIsMobile();
  // 初始设置页面大小
  if (isMobile.value) {
    pageSize.value = 5;
  }
  window.addEventListener('resize', checkIsMobile);
  
  loadData();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.history-alarm-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
    }

    &.full-width {
      width: 100%;
    }
  }

  &.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;

    .filter-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;

      &:last-child {
        justify-content: center;
      }
    }

    .filter-item {
      gap: 6px;

      .label {
        font-size: 13px;
        min-width: 80px;
      }

      &.full-width {
        flex-direction: column;
        align-items: stretch;
        
        .label {
          align-self: flex-start;
        }
      }
    }
  }
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;

  :deep(.el-table) {
    background: rgba(0, 30, 60, 0.4);
    color: rgba(255, 255, 255, 0.85);

    th {
      background: rgba(0, 212, 255, 0.1);
      color: rgba(255, 255, 255, 0.85);
      border-color: rgba(0, 212, 255, 0.2);
    }

    td {
      border-color: rgba(0, 212, 255, 0.1);
    }

    .el-table__row--striped {
      background: rgba(0, 20, 40, 0.5);
    }

    &::before {
      display: none;
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

// 移动端表格优化
@media (max-width: 768px) {
  .table-wrapper {
    :deep(.el-table) {
      font-size: 12px;

      th, td {
        padding: 8px 4px;
      }

      .mobile-time {
        font-size: 11px;
        line-height: 1.2;
      }

      .el-tag {
        font-size: 10px;
        padding: 2px 4px;
        height: auto;
        line-height: 1.2;
      }
    }

    .pagination-wrapper {
      :deep(.el-pagination) {
        .el-pager .number {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
        }

        .btn-prev, .btn-next {
          min-width: 28px;
          height: 28px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

