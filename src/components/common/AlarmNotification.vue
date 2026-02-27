<template>
  <!-- 可拖拽的浮动铃铛 -->
  <div 
    class="floating-alarm-bell"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="handleMouseDown"
  >
    <!-- 铃铛按钮 -->
    <el-badge :value="totalCount" :max="99" :hidden="totalCount === 0" class="bell-badge">
      <el-button 
        :icon="Bell" 
        circle 
        @click.stop="togglePopover"
        class="bell-button"
        size="large"
      />
    </el-badge>

    <!-- 告警列表弹窗 -->
    <Transition name="alarm-fade">
      <div v-if="showPopover" class="alarm-popover" @mousedown.stop>
        <div class="popover-header">
          <span class="header-title">告警</span>
          <div class="header-actions">
            <el-button text @click="handleGoToList" class="goto-list-btn" size="small">
              前往列表
            </el-button>
            <el-button text @click="handleClearAll" class="clear-btn" size="small">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="popover-content">
          <el-scrollbar 
            v-if="alarmList.length > 0" 
            max-height="300px"
            @scroll="handleScroll"
            ref="scrollbarRef"
          >
            <div 
              v-for="alarm in alarmList" 
              :key="alarm.id"
              class="alarm-item"
              @click="handleAlarmClick(alarm)"
            >
              <div class="alarm-badge" :class="`alarm-level-${getAlarmLevelNumber(alarm.level)}`">
                {{ getLevelText(alarm.level) }}
              </div>
              <div class="alarm-content">
                <div 
                  class="alarm-title" 
                  :title="alarm.content && alarm.content.length > 30 ? alarm.content : ''"
                >
                  {{ alarm.content }}
                </div>
                <div 
                  class="alarm-desc" 
                  :title="alarm.suggest && alarm.suggest.length > 50 ? alarm.suggest : ''"
                >
                  {{ alarm.suggest || alarm.deviceName }}
                </div>
              </div>
              <div class="alarm-time">{{ alarm.time }}</div>
            </div>
            <div v-if="loading" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <div v-else-if="hasMore && alarmList.length > 0" class="loading-more">
              <span>加载更多数据...</span>
            </div>
            <div v-else-if="alarmList.length > 0 && !hasMore" class="no-more">
              <span>没有更多了</span>
            </div>
          </el-scrollbar>
          <el-empty v-else description="暂无告警" :image-size="80" />
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bell, Delete, Loading } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const router = useRouter();

// 告警数据类型
interface MockAlarmItem {
  id: number;
  level: number;      // 1-一般, 2-重要, 3-紧急
  content: string;
  suggest: string;
  deviceName: string;
  time: string;
  source: string;
}

// 状态
const showPopover = ref(false);
const alarmList = ref<MockAlarmItem[]>([]);
const totalCount = ref(0);
let refreshTimer: number | null = null;

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(false);
const loading = ref(false);

// 拖拽相关
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// 滚动条引用
const scrollbarRef = ref<any>(null);

// 移动端检测
const isMobile = ref(false);

// 检测是否为移动端
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 窗口大小变化处理
let resizeTimer: number | null = null;
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    checkIsMobile();
    const buttonSize = 50;
    const maxX = window.innerWidth - buttonSize - 4;
    const maxY = window.innerHeight - buttonSize - 4;
    
    // 保持在原来的相对位置，只做边界限制
    position.value = {
      x: Math.min(Math.max(0, position.value.x), maxX),
      y: Math.min(Math.max(0, position.value.y), maxY)
    };
  }, 100);
};

// 处理滚动事件
const handleScroll = (scrollInfo: { scrollTop: number; scrollLeft: number; }) => {
  const scrollbarWrap = scrollbarRef.value?.wrapRef;
  if (!scrollbarWrap) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollbarWrap;
  
  // 当滚动到底部且还有更多数据时，自动加载更多
  if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore.value && !loading.value) {
    loadMore();
  }
};

// 获取告警等级文本（level 是数字：1-一般, 2-重要, 3-紧急）
const getLevelText = (level: number | string): string => {
  const levelNum = typeof level === 'string' ? parseInt(level) : level;
  const levelMap: Record<number, string> = {
    1: '一般',
    2: '重要',
    3: '紧急'
  };
  return levelMap[levelNum] || '一般';
};

// 获取告警等级对应的数字（用于样式）
const getAlarmLevelNumber = (level: number | string): number => {
  const levelNum = typeof level === 'string' ? parseInt(level) : level;
  return levelNum || 1;
};

// 切换弹窗显示
const togglePopover = () => {
  if (!isDragging.value) {
    showPopover.value = !showPopover.value;
    // 如果弹窗打开且列表为空，则加载数据
    if (showPopover.value && alarmList.value.length === 0) {
      resetPagination();
      loadAlarmData();
    }
  }
};

// 重置分页信息
const resetPagination = () => {
  currentPage.value = 1;
  hasMore.value = true;
  alarmList.value = [];
};

// 点击告警项 -> 跳转到实时告警页
const handleAlarmClick = (alarm: MockAlarmItem) => {
  showPopover.value = false;
  router.push('/pv/diagnosis/alarm-realtime');
};

// 清空所有告警
const handleClearAll = () => {
  alarmList.value = [];
  showPopover.value = false;
};

// 前往告警列表页面
const handleGoToList = () => {
  showPopover.value = false;
  router.push('/pv/diagnosis/alarm-realtime');
};

// 告警处理完成后的回调
const handleAlarmHandled = () => {
  // 重新加载告警数据
  resetPagination();
  loadAlarmData();
};

// 加载更多数据
const loadMore = async () => {
  if (loading.value || !hasMore.value) return;
  
  loading.value = true;
  currentPage.value++;
  
  try {
    await loadAlarmData();
  } finally {
    loading.value = false;
  }
};

// ========== 生成模拟三级告警数据 ==========
const generateMockAlarms = (): MockAlarmItem[] => {
  const sources = ['预处理', 'I段AAO', '二沉池及出水', '污泥脱水', '鼓风机房', '高效沉淀池', '反硝化深床滤池', '加药系统', 'II段AAO'];
  const devices = ['1#提升泵', '2#鼓风机', '进水闸门', 'PAC加药泵', '回流泵', '3#搅拌器', '脱水机A'];
  const urgentContents = ['设备过载严重，请立即停机检修', '温度超限告警，达危险阈值', 'pH值严重超标，出水不合格'];
  const importantContents = ['设备运行参数偏离标准', '液位传感器测量值偏高', 'COD浓度接近上限', '溶解氧浓度持续偏低'];
  const normalContents = ['设备巡检提醒：已到维护周期', '通信延迟轻微增大', '数据采集间隔异常', '备用设备未就绪'];
  const suggests = ['建议立即安排维修人员现场处理', '建议调整设备运行参数', '建议检查传感器接线', '建议提高巡检频次'];
  const items: MockAlarmItem[] = [];
  const now = dayjs();
  for (let i = 0; i < 12; i++) {
    const r = Math.random();
    const level = r < 0.25 ? 3 : r < 0.55 ? 2 : 1;
    const contents = level === 3 ? urgentContents : level === 2 ? importantContents : normalContents;
    items.push({
      id: 2000 + i,
      level,
      content: contents[Math.floor(Math.random() * contents.length)],
      suggest: suggests[Math.floor(Math.random() * suggests.length)],
      deviceName: devices[Math.floor(Math.random() * devices.length)],
      time: now.subtract(Math.floor(Math.random() * 180), 'minute').format('MM-DD HH:mm'),
      source: sources[Math.floor(Math.random() * sources.length)]
    });
  }
  items.sort((a, b) => b.level - a.level); // 紧急排前面
  return items;
};

// 加载告警数据（模拟）
const loadAlarmData = async () => {
  const data = generateMockAlarms();
  alarmList.value = data;
  totalCount.value = data.length;
  hasMore.value = false;
};

// 启动定时刷新
const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    // 只有当弹窗关闭时才自动刷新，避免干扰用户操作
    if (!showPopover.value) {
      resetPagination();
      loadAlarmData();
    }
  }, 30000);
};

// 停止定时刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 拖拽处理
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = false;
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  isDragging.value = true;
  showPopover.value = false; // 拖拽时关闭弹窗
  
  const newX = e.clientX - dragStart.value.x;
  const newY = e.clientY - dragStart.value.y;
  
  // 限制在窗口范围内 - 统一使用50px
  const buttonSize = 50;
  const maxX = window.innerWidth - buttonSize - 4;
  const maxY = window.innerHeight - buttonSize - 4;
  
  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  };
};

const handleMouseUp = () => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  
  // 延迟重置拖拽状态，避免触发点击事件
  setTimeout(() => {
    isDragging.value = false;
  }, 100);
};

// 初始化位置（右下角）
const initPosition = () => {
  const buttonSize = 50;
  const margin = 25;
  position.value = {
    x: window.innerWidth - buttonSize - margin,
    y: window.innerHeight - buttonSize - margin
  };
};

// 生命周期
onMounted(() => {
  checkIsMobile();
  initPosition();
  resetPagination();
  loadAlarmData();
  startAutoRefresh();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  stopAutoRefresh();
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('resize', handleResize);
  
  // 清理resize定时器
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
});
</script>

<style scoped lang="scss">
.floating-alarm-bell {
  position: fixed;
  z-index: 9999;
  cursor: move;
  user-select: none;

  .bell-badge {
    :deep(.el-badge__content) {
      background-color: #ff4444;
      border: 2px solid rgba(10, 24, 45, 0.9);
    }
  }

  .bell-button {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 150, 255, 0.2));
    backdrop-filter: blur(10px);
    border: 2px solid rgba(0, 212, 255, 0.4);
    color: #00d4ff;
    font-size: 20px;
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
      border-color: #00d4ff;
      box-shadow: 0 6px 30px rgba(0, 212, 255, 0.5);
      transform: scale(1.03);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .alarm-popover {
    position: absolute;
    bottom: calc(100% + 12px);
    right: 0;
    width: 500px;
    max-height: 375px;
    background: rgba(10, 24, 45, 0.98);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(0, 212, 255, 0.4);
    border-radius: 10px;
    box-shadow: 0 7px 28px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 212, 255, 0.2);
    overflow: hidden;
    cursor: default;
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      right: -15px;
    }
    
    @media (max-width: 480px) {
      width: 320px;
      right: -30px;
    }

    .popover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 11px 18px;
      border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      background: rgba(0, 20, 40, 0.8);

      .header-title {
        font-size: 15px;
        font-weight: 600;
        color: #00d4ff;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      }
      
      /* 移动端适配 */
      @media (max-width: 480px) {
        padding: 9px 14px;
        
        .header-title {
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .goto-list-btn {
        color: #00d4ff;
        font-size: 12px;
        
        &:hover {
          color: #00f0ff;
        }
        
        /* 移动端适配 */
        @media (max-width: 480px) {
          font-size: 11px;
          padding: 4px 7px;
        }
      }

      .clear-btn {
        color: rgba(255, 255, 255, 0.6);
        
        &:hover {
          color: #00d4ff;
        }
        
        /* 移动端适配 */
        @media (max-width: 480px) {
          padding: 4px;
          
          .el-icon {
            font-size: 13px;
          }
        }
      }
    }

    .popover-content {
      max-height: 300px;
      overflow: hidden;

      .alarm-item {
        display: grid;
        grid-template-columns: 48px 1fr 115px;
        gap: 14px;
        align-items: center;
        padding: 13px 18px;
        border-bottom: 1px solid rgba(0, 212, 255, 0.1);
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(0, 212, 255, 0.08);
        }

        &:last-child {
          border-bottom: none;
        }
        
        /* 移动端适配 */
        @media (max-width: 480px) {
          grid-template-columns: 40px 1fr 90px;
          gap: 10px;
          padding: 11px 14px;
        }

        .alarm-badge {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
          
          /* 移动端适配 */
          @media (max-width: 480px) {
            width: 36px;
            height: 36px;
            font-size: 10px;
            border-radius: 6px;
          }

          &.alarm-level-1 {
            background: rgba(0, 150, 255, 0.2);
            color: #0096ff;
            border: 1px solid rgba(0, 150, 255, 0.3);
          }

          &.alarm-level-2 {
            background: rgba(255, 184, 0, 0.2);
            color: #ffb800;
            border: 1px solid rgba(255, 184, 0, 0.3);
          }

          &.alarm-level-3 {
            background: rgba(255, 68, 68, 0.2);
            color: #ff4444;
            border: 1px solid rgba(255, 68, 68, 0.3);
          }
        }

        .alarm-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;

          .alarm-title {
            font-size: 14px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.95);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            
            /* 移动端适配 */
            @media (max-width: 480px) {
              font-size: 13px;
            }
          }

          .alarm-desc {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            
            /* 移动端适配 */
            @media (max-width: 480px) {
              font-size: 11px;
            }
          }
        }

        .alarm-time {
          flex-shrink: 0;
          font-size: 11px;
          color: rgba(0, 212, 255, 0.9);
          text-align: right;
          white-space: nowrap;
          
          /* 移动端适配 */
          @media (max-width: 480px) {
            font-size: 10px;
          }
        }
      }
      
      .loading-more, .no-more {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 12px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        
        .el-icon {
          margin-right: 5px;
        }
      }
    }

  }
}

// 动画
.alarm-fade-enter-active,
.alarm-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alarm-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.alarm-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
