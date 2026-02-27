<template>
  <div class="station-overview-page">
    <div class="station-overview-content">
        <!-- SPEC 1: 顶部筛选栏 -->
        <div class="stats-filter-bar">
      <div
        v-for="stat in statsButtons"
        :key="stat.id"
        :class="['stat-button', { active: activeFilter === stat.id }]"
        @click="handleFilterClick(stat.id)"
      >
        <el-icon v-if="stat.icon" :class="`icon-${stat.id}`">
          <component :is="stat.icon" />
        </el-icon>
        <span class="label">{{ stat.label }}</span>
        <span class="count">({{ stats[stat.countKey] }})</span>
      </div>
    </div>

    <!-- SPEC 2: 搜索和操作栏 -->
    <div class="search-action-bar">
      <!-- 左侧: 视图切换 -->
      <el-button-group class="view-switcher">
        <el-button
          :type="viewMode === 'list' ? 'primary' : 'default'"
          @click="viewMode = 'list'"
        >
          <el-icon><List /></el-icon>
          <span>切换列表展示</span>
        </el-button>
        <el-button
          :type="viewMode === 'card' ? 'primary' : 'default'"
          @click="viewMode = 'card'"
        >
          <el-icon><Grid /></el-icon>
          <span>切换卡片展示</span>
        </el-button>
      </el-button-group>

      <!-- 中间: 搜索框 -->
      <el-input
        v-model="searchKeyword"
        placeholder="请输入电站名称"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #suffix>
          <el-button text @click="handleSearch">搜索</el-button>
        </template>
      </el-input>

      <!-- 右侧: 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="showAdvancedFilter = !showAdvancedFilter">
          <span>{{ showAdvancedFilter ? '收起筛选' : '展开筛选' }}</span>
          <el-icon :class="{ rotate: showAdvancedFilter }"><ArrowDown /></el-icon>
        </el-button>

        <el-button @click="handleDownload">
          <el-icon><Download /></el-icon>
        </el-button>

        <el-button text type="primary" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- SPEC 3: 高级筛选表单 -->
    <transition name="filter-slide">
      <div v-show="showAdvancedFilter" class="advanced-filter-form">
        <el-form :model="filterForm" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="所在位置">
                <el-select v-model="filterForm.location" placeholder="请选择">
                  <el-option label="全部" value="" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="所在地区">
                <el-cascader
                  v-model="filterForm.region"
                  :options="regionOptions"
                  placeholder="请选择"
                  clearable
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="建设状态">
                <el-select v-model="filterForm.buildStatus" placeholder="全部">
                  <el-option label="全部" value="" />
                  <el-option label="在建" value="building" />
                  <el-option label="并网" value="connected" />
                  <el-option label="停运" value="stopped" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="装机容量">
                <div class="capacity-range">
                  <el-input
                    v-model="filterForm.minCapacity"
                    placeholder="最小容量"
                    class="capacity-input"
                  >
                    <template #suffix>kWp</template>
                  </el-input>
                  <span class="range-separator">~</span>
                  <el-input
                    v-model="filterForm.maxCapacity"
                    placeholder="最大容量"
                    class="capacity-input"
                  >
                    <template #suffix>kWp</template>
                  </el-input>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="并网时间">
                <el-date-picker
                  v-model="filterForm.gridTimeRange"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="联系人">
                <el-input v-model="filterForm.contact" placeholder="请输入" />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="联系电话">
                <el-input v-model="filterForm.phone" placeholder="请输入" />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label=" ">
                <el-button @click="handleFilterReset">重置</el-button>
                <el-button type="primary" @click="handleFilterConfirm">确认</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </transition>

    <!-- SPEC 4: 提示信息 -->
    <div class="info-banner">
      <el-icon><InfoFilled /></el-icon>
      <span>电站概览聚合了你可见电站下的所有数据，由于数据量较大，电站概览界面更新频率预计需要5分钟。</span>
    </div>

    <!-- 加载状态 -->
    <div v-loading="loading" class="content-area">
      <!-- SPEC 5 & 7: 电站列表（卡片/列表视图） -->
      <div v-if="viewMode === 'card'" class="station-cards">
        <StationCard
          v-for="station in stationList"
          :key="station.id"
          :station="station"
          @click="handleStationClick"
        />
      </div>

      <div v-else class="station-table">
        <el-table
          :data="stationList"
          stripe
          :header-cell-style="{
            background: 'rgba(10, 24, 45, 0.8)',
            color: 'rgba(255, 255, 255, 0.85)',
            borderColor: 'rgba(0, 212, 255, 0.3)',
          }"
          :cell-style="{
            background: 'rgba(10, 24, 45, 0.6)',
            color: 'rgba(255, 255, 255, 0.85)',
            borderColor: 'rgba(0, 212, 255, 0.2)',
          }"
        >
          <el-table-column prop="name" label="电站名称" width="200" fixed="left" />

          <el-table-column label="通讯" width="80" align="center">
            <template #default="{ row }">
              <el-icon :class="`comm-icon-${row.commStatus}`">
                <Connection />
              </el-icon>
            </template>
          </el-table-column>

          <el-table-column label="告警" width="80" align="center">
            <template #default="{ row }">
              <el-icon :class="`alarm-icon-${row.alarmStatus}`">
                <Check v-if="row.alarmStatus === 'none'" />
                <Warning v-else />
              </el-icon>
            </template>
          </el-table-column>

          <el-table-column label="所在地区" width="180">
            <template #default="{ row }">
              <span>{{ formatLocation(row) }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="capacity"
            label="装机容量(kWp)"
            width="130"
            align="right"
            sortable
          >
            <template #default="{ row }">
              {{ row.capacity.toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column label="天气" width="80" align="center">
            <template #default>
              <span>☁️</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="realPower"
            label="实时功率(kW)"
            width="120"
            align="right"
            sortable
          >
            <template #default="{ row }">
              {{ row.realPower.toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column label="功率曲线" width="150" align="center">
            <template #default="{ row }">
              <MiniPowerChart :data="row.powerTrend.power" />
            </template>
          </el-table-column>

          <el-table-column
            prop="dailyEnergy"
            label="当日发电量(kWh)"
            width="140"
            align="right"
            sortable
          >
            <template #default="{ row }">
              {{ row.dailyEnergy.toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column
            label="当月发电量(kWh)"
            width="140"
            align="right"
            sortable
          >
            <template #default="{ row }">
              {{ (row.dailyEnergy * 30).toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="dailyHours"
            label="当日等效小时(h)"
            width="140"
            align="right"
            sortable
          >
            <template #default="{ row }">
              {{ row.dailyHours.toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column label="更新时间" width="160" align="center" sortable>
            <template #default>
              {{ formatTime(new Date()) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

        <!-- SPEC 8: 分页器 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="isMobile ? [6, 9, 12] : [9, 12, 20, 50]"
            :total="total"
            :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next, sizes, jumper'"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  List,
  Grid,
  ArrowDown,
  Download,
  InfoFilled,
  Connection,
  Check,
  Warning,
} from '@element-plus/icons-vue'
import type { StationData, StationStats } from '@/types/station'
import { getStationList, exportStationData } from '@/api/monitor/stationOverview'
import { getDeviceAlarmRate } from '@/api/monitor/alarmStatistics'
import { downloadExcel, generateTimestampFilename } from '@/utils/download'
import StationCard from './components/StationCard.vue'
import MiniPowerChart from './components/MiniPowerChart.vue'

// 状态管理
const viewMode = ref<'card' | 'list'>('card')
const loading = ref(false)
const activeFilter = ref('total')
const searchKeyword = ref('')
const showAdvancedFilter = ref(false)
const currentPage = ref(1)
const pageSize = ref(9)
const total = ref(0)

// 移动端检测
const isMobile = ref(false)

// 检测是否为移动端
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 电站列表数据
const stationList = ref<StationData[]>([])

// 统计数据
const stats = ref<StationStats>({
  total: 24,
  commNormal: 20,
  allOffline: 0,
  partialOffline: 4,
  commonlyAlarm: 0,
  seriousAlarm: 0,
  emergentAlarm: 0,
})

// 高级筛选表单
const filterForm = reactive({
  location: '',
  region: [],
  buildStatus: '',
  minCapacity: '',
  maxCapacity: '',
  gridTimeRange: [],
  contact: '',
  phone: '',
})

// 地区选项（示例数据）
const regionOptions = ref([
  {
    value: 'anhui',
    label: '安徽省',
    children: [
      { value: 'bozhou', label: '亳州市' },
      { value: 'luan', label: '六安市' },
      { value: 'wuhu', label: '芜湖市' },
    ],
  },
])

// 顶部筛选按钮配置
const statsButtons = computed(() => [
  {
    id: 'total',
    label: '总数',
    countKey: 'total' as keyof StationStats,
    icon: null,
    filterable: true, // 是否可筛选
  },
  {
    id: 'comm_normal',
    label: '通讯正常',
    countKey: 'commNormal' as keyof StationStats,
    icon: Connection,
    filterable: true,
  },
  {
    id: 'all_offline',
    label: '全部设备离线',
    countKey: 'allOffline' as keyof StationStats,
    icon: Connection,
    filterable: true,
  },
  {
    id: 'partial_offline',
    label: '部分设备离线',
    countKey: 'partialOffline' as keyof StationStats,
    icon: Connection,
    filterable: true,
  },
  {
    id: 'commonly_alarm',
    label: '普通告警',
    countKey: 'commonlyAlarm' as keyof StationStats,
    icon: Check,
    filterable: false, // 不关联筛选
  },
  {
    id: 'serious_alarm',
    label: '重要告警',
    countKey: 'seriousAlarm' as keyof StationStats,
    icon: Warning,
    filterable: false, // 不关联筛选
  },
  {
    id: 'emergent_alarm',
    label: '紧急告警',
    countKey: 'emergentAlarm' as keyof StationStats,
    icon: Warning,
    filterable: false, // 不关联筛选
  },
])

// 事件处理
const handleFilterClick = (filterId: string) => {
  // 查找按钮配置
  const button = statsButtons.value.find(btn => btn.id === filterId)
  
  // 只有可筛选的按钮才触发筛选
  if (button && button.filterable) {
    activeFilter.value = filterId
    currentPage.value = 1
    fetchStationList()
  } else {
    // 告警统计按钮只展示数据，不触发筛选
    ElMessage.info(`${button?.label || '该项'}仅用于展示统计数据`)
  }
}

// 搜索防抖
let searchTimer: ReturnType<typeof setTimeout> | null = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchStationList()
  }, 500) // 500ms防抖
}

const handleRefresh = () => {
  // 清除缓存
  // sessionStorage.removeItem(CACHE_KEY)
  fetchStationList()
  ElMessage.success('数据已刷新')
}

const handleDownload = () => {
  try {
    // 定义导出列配置
    const exportColumns = [
      {
        label: '电站名称',
        prop: 'name',
        width: 200
      },
      {
        label: '通讯状态',
        getValue: (row: StationData) => {
          const statusMap: Record<StationData['commStatus'], string> = {
            normal: '正常',
            partial_offline: '部分离线',
            all_offline: '全部离线',
            connecting: '接入中'
          }
          return statusMap[row.commStatus] || row.commStatus
        },
        width: 100
      },
      {
        label: '告警状态',
        getValue: (row: StationData) => {
          const statusMap: Record<StationData['alarmStatus'], string> = {
            none: '无告警',
            has_alarm: '有告警'
          }
          return statusMap[row.alarmStatus] || row.alarmStatus
        },
        width: 100
      },
      {
        label: '所在地区',
        getValue: (row: StationData) => formatLocation(row),
        width: 180
      },
      {
        label: '装机容量(kWp)',
        formatter: (row: StationData) => row.capacity.toFixed(2),
        width: 130
      },
      {
        label: '天气',
        getValue: () => '多云',
        width: 80
      },
      {
        label: '实时功率(kW)',
        formatter: (row: StationData) => row.realPower.toFixed(2),
        width: 120
      },
      {
        label: '当日发电量(kWh)',
        formatter: (row: StationData) => row.dailyEnergy.toFixed(2),
        width: 140
      },
      {
        label: '当月发电量(kWh)',
        formatter: (row: StationData) => (row.dailyEnergy * 30).toFixed(2),
        width: 140
      },
      {
        label: '当日等效小时(h)',
        formatter: (row: StationData) => row.dailyHours.toFixed(2),
        width: 140
      },
      {
        label: '更新时间',
        getValue: () => formatTime(new Date()),
        width: 160
      }
    ]

    // 获取所有原始数据（未分页的完整数据）
    let dataToExport = stationList.value

    // 如果当前是分页显示，询问是否导出全部数据
    if (total.value > stationList.value.length) {
      // 这里简化处理，直接导出当前页面数据
      // 实际项目中可以添加确认对话框让用户选择导出当前页还是全部数据
      dataToExport = stationList.value
    }

    // 生成文件名
    const filename = generateTimestampFilename('站点概览')

    // 执行下载
    downloadExcel(dataToExport, exportColumns, filename)
    
    ElMessage.success(`成功导出 ${dataToExport.length} 条记录至Excel文件`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

const handleFilterReset = () => {
  Object.assign(filterForm, {
    location: '',
    region: [],
    buildStatus: '',
    minCapacity: '',
    maxCapacity: '',
    gridTimeRange: [],
    contact: '',
    phone: '',
  })
}

const handleFilterConfirm = () => {
  showAdvancedFilter.value = false
  currentPage.value = 1
  fetchStationList()
}

const handlePageChange = () => {
  fetchStationList()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchStationList()
}

const handleStationClick = (station: StationData) => {
  console.log('点击电站：', station.name)
  // TODO: 跳转到电站详情页
}

// 格式化地区
const formatLocation = (_station: StationData) => {
  // 简单示例：从电站名称提取地区
  return '安徽省 亳州市 利辛县'
}

// 格式化时间
const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取电站列表
const fetchStationList = async () => {
  loading.value = true
  try {
    const response = await getStationList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      filter: activeFilter.value
    })
    
    if (response.code === 200) {
      stationList.value = response.data.list
      
      // 保存告警统计数据，避免被覆盖
      const alarmStats = {
        commonlyAlarm: stats.value.commonlyAlarm,
        seriousAlarm: stats.value.seriousAlarm,
        emergentAlarm: stats.value.emergentAlarm,
      }
      
      // 更新stats，但保留告警统计数据
      stats.value = {
        ...response.data.stats,
        ...alarmStats,
      }
      
      total.value = response.data.total
    } else {
      ElMessage.error(response.message || '获取电站数据失败')
    }
  } catch (error) {
    console.error('获取电站列表失败：', error)
    ElMessage.error('获取电站数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 数据处理逻辑已移至API层

// 监听视图模式切换，自动调整每页条数
watch(viewMode, (newMode) => {
  if (isMobile.value) {
    // 移动端减少每页显示数量
    pageSize.value = newMode === 'card' ? 6 : 12
  } else {
    pageSize.value = newMode === 'card' ? 9 : 20
  }
  currentPage.value = 1
  fetchStationList()
})

// 监听移动端状态变化，调整每页条数
watch(isMobile, (newIsMobile) => {
  if (newIsMobile) {
    // 切换到移动端时减少每页显示数量
    pageSize.value = viewMode.value === 'card' ? 6 : 12
  } else {
    // 切换到桌面端时恢复正常数量
    pageSize.value = viewMode.value === 'card' ? 9 : 20
  }
  currentPage.value = 1
  fetchStationList()
})


// 组件挂载时获取数据
/**
 * 获取告警统计数据
 */
const fetchAlarmStatistics = async () => {
  try {
    const alarmData = await getDeviceAlarmRate(7) // 获取最近7天的告警统计
    stats.value.commonlyAlarm = alarmData.commonly
    stats.value.seriousAlarm = alarmData.serious
    stats.value.emergentAlarm = alarmData.emergent
  } catch (error) {
    console.error('获取告警统计失败:', error)
  }
}

onMounted(() => {
  checkIsMobile()
  fetchStationList()
  fetchAlarmStatistics() // 获取告警统计数据
  window.addEventListener('resize', checkIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.station-overview-page {
  width: 100%;
  height: 100%;
  background: transparent; // 使用透明背景，让MainLayout的背景图片透出来
  overflow: hidden;
}

.station-overview-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 20, 40, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(0, 212, 255, 0.5);
    }
  }
}

// SPEC 1: 顶部筛选栏样式
.stats-filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(10, 22, 40, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    padding: 10px;
    margin-bottom: 12px;
  }

  .stat-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    cursor: pointer;
    border: 1px solid rgba(0, 212, 255, 0.35);
    background: rgba(10, 30, 50, 0.5);
    border-radius: 4px;
    transition: all 0.3s ease;
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      flex: 1 1 calc(50% - 4px);
      min-width: calc(50% - 4px);
      padding: 10px 12px;
      gap: 6px;
    }
    
    @media (max-width: 480px) {
      flex: 1 1 calc(50% - 3px);
      min-width: calc(50% - 3px);
      padding: 8px 10px;
      gap: 4px;
    }

    .label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      
      @media (max-width: 768px) {
        font-size: 12px;
      }
      
      @media (max-width: 480px) {
        font-size: 11px;
      }
    }

    .count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.65);
      
      @media (max-width: 768px) {
        font-size: 12px;
      }
      
      @media (max-width: 480px) {
        font-size: 11px;
      }
    }

    // 图标颜色
    .icon-comm_normal {
      color: #67c23a;
    }

    .icon-all_offline {
      color: #f56c6c;
    }

    .icon-partial_offline {
      color: #e6a23c;
    }

    .icon-connecting {
      color: #909399;
    }

    .icon-no_alarm {
      color: #67c23a;
    }

    .icon-has_alarm {
      color: #f56c6c;
    }

    &:hover {
      border-color: rgba(0, 212, 255, 0.7);
      background: rgba(0, 212, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
    }

    &.active {
      border-color: #00d4ff;
      background: rgba(0, 212, 255, 0.25);
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.5), inset 0 0 10px rgba(0, 212, 255, 0.1);

      .label,
      .count {
        color: #00d4ff;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
      }
    }
  }
}

// SPEC 2: 搜索和操作栏样式
.search-action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  
  /* 移动端适配 */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 12px;
  }

  .view-switcher {
    flex-shrink: 0;
    
    @media (max-width: 768px) {
      order: 1;
      
      :deep(.el-button) {
        padding: 8px 12px;
        font-size: 13px;
        
        .el-icon {
          font-size: 14px;
        }
      }
    }
  }

  .search-input {
    width: 300px;
    
    @media (max-width: 768px) {
      order: 2;
      width: 100%;
    }

    :deep(.el-input__inner) {
      background: rgba(10, 30, 50, 0.6);
      border-color: rgba(0, 212, 255, 0.4);
      color: #fff;
      transition: all 0.3s ease;

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
      
      &:hover {
        border-color: rgba(0, 212, 255, 0.6);
      }
      
      &:focus {
        border-color: #00d4ff;
        box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
      }
    }
  }

  .action-buttons {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .rotate {
      transform: rotate(180deg);
      transition: transform 0.3s;
    }
    
    @media (max-width: 768px) {
      order: 3;
      justify-content: center;
      gap: 10px;
      
      .el-button {
        padding: 8px 12px;
        font-size: 13px;
      }
    }
  }
}

// SPEC 3: 高级筛选表单样式
.advanced-filter-form {
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(10, 30, 50, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  .capacity-range {
    display: flex;
    align-items: center;
    gap: 8px;

    .capacity-input {
      flex: 1;
    }

    .range-separator {
      color: rgba(255, 255, 255, 0.65);
    }
  }

  :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.85);
  }

  :deep(.el-input__inner),
  :deep(.el-select__wrapper),
  :deep(.el-date-editor) {
    background: rgba(10, 30, 50, 0.8);
    border-color: rgba(0, 212, 255, 0.4);
    color: #fff;
    
    &:hover {
      border-color: rgba(0, 212, 255, 0.6);
    }
    
    &:focus,
    &.is-focus {
      border-color: #00d4ff;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
    }
  }
}

// 筛选表单滑动动画
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.filter-slide-enter-from,
.filter-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

// SPEC 4: 提示信息样式
.info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin-bottom: 20px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;

  .el-icon {
    color: #00d4ff;
    font-size: 18px;
    filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
  }
}

// 内容区域
.content-area {
  min-height: 400px;
  margin-bottom: 20px;
}

// 卡片视图样式
.station-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  /* 移动端适配 */
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

// 列表视图样式
.station-table {
  // 通讯图标颜色
  .comm-icon-normal {
    color: #67c23a;
  }

  .comm-icon-partial_offline {
    color: #e6a23c;
  }

  .comm-icon-all_offline {
    color: #f56c6c;
  }

  .comm-icon-connecting {
    color: #909399;
  }

  // 告警图标颜色
  .alarm-icon-none {
    color: #67c23a;
  }

  .alarm-icon-has_alarm {
    color: #f56c6c;
  }
}

// SPEC 8: 分页器样式
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: rgba(10, 24, 45, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;

  :deep(.el-pagination) {
    .el-pager li {
      background: rgba(10, 24, 45, 0.6);
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.85);

      &.is-active {
        background: #00d4ff;
        color: #000;
      }
    }

    button {
      background: rgba(10, 24, 45, 0.6);
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
</style>
