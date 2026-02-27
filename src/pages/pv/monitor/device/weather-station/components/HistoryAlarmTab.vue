<template>
  <div v-loading="loading" class="history-alarm-tab">
    <div class="filter-bar" :class="{ 'mobile': isMobile }">
      <div class="filter-row">
        <div class="filter-item">
          <span class="label">告警等级</span>
          <el-select 
            v-model="filters.level" 
            @change="handleSearch"
            :size="isMobile ? 'small' : 'default'"
            :style="{ width: isMobile ? '100px' : '120px' }"
          >
            <el-option label="全部" value="" />
            <el-option label="一级" value="1" />
            <el-option label="二级" value="2" />
            <el-option label="三级" value="3" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="label">确认状态</span>
          <el-select 
            v-model="filters.status" 
            @change="handleSearch"
            :size="isMobile ? 'small' : 'default'"
            :style="{ width: isMobile ? '100px' : '120px' }"
          >
            <el-option label="全部" value="" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="未确认" value="unconfirmed" />
          </el-select>
        </div>
      </div>
      <div class="filter-item wide">
        <span class="label">告警产生时间</span>
        <el-date-picker
          v-model="filters.timeRange"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :size="isMobile ? 'small' : 'default'"
          :style="{ width: isMobile ? '100%' : '360px' }"
        />
      </div>
      <el-button 
        type="primary" 
        :size="isMobile ? 'small' : 'default'"
        @click="handleSearch"
      >
        搜索
      </el-button>
    </div>

    <div class="table-wrapper">
      <el-table 
        :data="alarmList" 
        stripe
        border
        :size="isMobile ? 'small' : 'default'"
        :scrollbar-always-on="isMobile"
        table-layout="auto"
      >
        <el-table-column prop="level" label="告警等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.level)" :size="isMobile ? 'small' : 'default'">
              {{ getAlarmLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="告警名称" width="200" />
        <el-table-column prop="location" label="告警位置" width="200" />
        <el-table-column prop="device" label="告警设备" width="200" />
        <el-table-column prop="time" label="告警产生时间" width="180">
          <template #default="{ row }">
            {{ isMobile ? formatMobileTime(row.time) : row.time }}
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" label="处理建议" width="250" />
        <el-table-column prop="status" label="确认状态" width="100" :fixed="isMobile ? 'right' : false">
          <template #default="{ row }">
            <el-tag :type="row.status === 'confirmed' ? 'success' : 'warning'" :size="isMobile ? 'small' : 'default'">
              {{ row.status === 'confirmed' ? '已确认' : '未确认' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="isMobile ? [5, 10, 15] : [20, 40, 60, 80]"
        :total="total"
        :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, sizes, jumper'"
        :size="isMobile ? 'small' : 'default'"
        @current-change="handlePageChange"
        @size-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { AlarmItem } from '@/api/types/device/weatherStation';
import { fetchHistoryAlarmList } from '@/api/device/weatherStation';

interface Props {
  deviceId: string;
}

const props = defineProps<Props>();

// 移动端检测
const isMobile = ref(false);

const checkIsMobile = () => {
  const oldIsMobile = isMobile.value;
  isMobile.value = window.innerWidth <= 768;
  
  // 如果移动端状态发生变化，调整分页大小并重新加载数据
  if (oldIsMobile !== isMobile.value) {
    pageSize.value = isMobile.value ? 5 : 20;
    currentPage.value = 1;
    loadData();
  }
};

const loading = ref(false);
const alarmList = ref<AlarmItem[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// 移动端时间格式化
const formatMobileTime = (timeStr: string) => {
  if (!timeStr || !isMobile.value) return timeStr;
  return timeStr.replace(/\d{4}-/, '').replace(/:\d{2}$/, '');
};

// 告警等级显示
const getAlarmLevelText = (level: string) => {
  const levelMap: Record<string, string> = { '1': '一级', '2': '二级', '3': '三级' };
  return levelMap[level] || level;
};

const getAlarmLevelType = (level: string) => {
  const typeMap: Record<string, any> = { '1': 'danger', '2': 'warning', '3': 'info' };
  return typeMap[level] || 'info';
};

const filters = ref({
  level: '',
  timeRange: null as [Date, Date] | null,
  status: '',
});

const loadData = async () => {
  loading.value = true;
  try {
    const result = await fetchHistoryAlarmList({
      deviceId: props.deviceId,
      level: filters.value.level,
      status: filters.value.status,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });
    alarmList.value = result.list;
    total.value = result.total;
  } catch (error) {
    console.error('Failed to load alarm list:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadData();
};

const handlePageChange = () => {
  loadData();
};

watch(() => props.deviceId, () => {
  loadData();
});

onMounted(() => {
  checkIsMobile();
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
  height: 100%;
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px;
  background: rgba(0, 30, 60, 0.4);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      white-space: nowrap;
    }

    &.wide {
      width: 100%;
    }
  }

  .filter-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  &.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;

    .filter-row {
      justify-content: space-between;
    }

    .filter-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;

      .label {
        font-size: 12px;
      }

      &.wide {
        width: 100%;
      }
    }

    .el-button {
      align-self: flex-start;
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

.pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>

