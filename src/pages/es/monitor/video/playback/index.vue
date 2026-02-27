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
        @node-click="handleNodeClick"
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
            <el-form-item label="日期" class="date-item">
              <el-date-picker
                v-model="filterForm.selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :size="isMobile ? 'default' : 'default'"
                :style="{ width: '100%' }"
              />
            </el-form-item>
            
            <!-- 高级筛选项（移动端可折叠） -->
            <template v-if="!isMobile || isFilterExpanded">
              <el-form-item label="文件位置">
                <el-select v-model="filterForm.fileLocation" placeholder="请选择" :size="isMobile ? 'default' : 'default'" :style="{ width: '100%' }">
                  <el-option label="前端" value="前端" />
                  <el-option label="存储服务器" value="存储服务器" />
                  <el-option label="全部" value="全部" />
                  <el-option label="扩展服务器一" value="扩展服务器一" />
                  <el-option label="扩展服务器二" value="扩展服务器二" />
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

      <!-- 视频播放区域 -->
      <div class="video-player-section">
        <!-- 视频文件Tabs -->
        <el-tabs v-if="videoFiles.length > 0" v-model="currentVideoId" type="card">
          <el-tab-pane
            v-for="file in videoFiles"
            :key="file.id"
            :label="file.fileName"
            :name="file.id"
          />
        </el-tabs>

        <!-- 视频播放器占位符 -->
        <div class="video-player">
          <div v-if="!currentVideoId" class="no-video">
            <el-icon><VideoCamera /></el-icon>
            <span>请选择设备和日期，点击搜索加载录像</span>
          </div>
          <video
            v-else
            ref="videoPlayerRef"
            class="video-element"
            controls
            @timeupdate="handleTimeUpdate"
            @play="handlePlay"
            @pause="handlePause"
          >
            <source :src="currentPlayUrl" type="video/mp4" />
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- 控制栏 -->
        <div class="control-bar" :class="{ 'mobile-control-bar': isMobile }">
          <div class="control-buttons" :class="{ 'mobile-control-buttons': isMobile }">
            <el-button @click="handleRecord" :size="isMobile ? 'small' : 'default'">
              <el-icon><VideoCameraFilled /></el-icon>
              {{ isMobile ? '' : '录像' }}
            </el-button>
            <el-button @click="handleCapture" :size="isMobile ? 'small' : 'default'">
              <el-icon><Crop /></el-icon>
              {{ isMobile ? '' : '截图' }}
            </el-button>
            <el-button @click="handleReplay" :size="isMobile ? 'small' : 'default'">
              <el-icon><RefreshLeft /></el-icon>
              {{ isMobile ? '' : '重新播放' }}
            </el-button>
            <el-button @click="handleStop" :size="isMobile ? 'small' : 'default'">
              <el-icon><VideoPause /></el-icon>
              {{ isMobile ? '' : '停止' }}
            </el-button>
            <el-button @click="setPlaySpeed(0.5)" :size="isMobile ? 'small' : 'default'">
              {{ isMobile ? '0.5x' : '慢进(0.5x)' }}
            </el-button>
            <el-button @click="togglePlay" :size="isMobile ? 'small' : 'default'">
              <el-icon v-if="playStatus === 'playing'"><VideoPause /></el-icon>
              <el-icon v-else><VideoPlay /></el-icon>
              {{ playStatus === 'playing' ? (isMobile ? '' : '暂停') : (isMobile ? '' : '播放') }}
            </el-button>
            <el-button @click="setPlaySpeed(2)" :size="isMobile ? 'small' : 'default'">
              {{ isMobile ? '2x' : '快进(2x)' }}
            </el-button>
          </div>
          <div class="control-right" :class="{ 'mobile-control-right': isMobile }">
            <el-button @click="handleBatchDownload" :size="isMobile ? 'small' : 'default'">
              <el-icon><Download /></el-icon>
              {{ isMobile ? '' : '批量下载' }}
            </el-button>
            <el-button @click="handleFullscreen" :size="isMobile ? 'small' : 'default'">
              <el-icon><FullScreen /></el-icon>
              {{ isMobile ? '' : '全屏' }}
            </el-button>
          </div>
        </div>

        <!-- 时间轴 -->
        <div class="timeline-section" :class="{ 'mobile-timeline-section': isMobile }">
          <div class="timeline-header">
            <el-radio-group v-model="filterForm.timeRange" :size="isMobile ? 'small' : 'small'">
              <el-radio-button :label="1">1天</el-radio-button>
              <el-radio-button :label="3">3天</el-radio-button>
              <el-radio-button :label="7">7天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="timeline-container">
            <div class="timeline-ruler">
              <div
                v-for="hour in 24"
                :key="hour"
                class="timeline-hour"
                :style="{ left: `${(hour / 24) * 100}%` }"
              >
                {{ String(hour - 1).padStart(2, '0') }}:00
              </div>
            </div>
            <div class="timeline-segments">
              <div
                v-for="segment in timelineData"
                :key="segment.fileId"
                class="timeline-segment"
                :style="getSegmentStyle(segment)"
                @click="handleTimelineClick(segment)"
              />
            </div>
            <div
              class="timeline-indicator"
              :style="{ left: `${currentTimePercent}%` }"
            />
          </div>
        </div>
      </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElTree } from 'element-plus';
import {
  Search,
  Folder,
  Refresh,
  VideoCamera,
  VideoCameraFilled,
  Crop,
  RefreshLeft,
  VideoPause,
  VideoPlay,
  Download,
  FullScreen,
  ArrowUp,
  ArrowDown,
} from '@element-plus/icons-vue';
import {
  getVideoDeviceTree,
  getFileList,
  startPlay,
  captureSnapshot,
  batchDownload,
} from '@/api/video/playback';
import type {
  VideoDeviceTreeNode,
  VideoFile,
  TimelineSegment,
  PlayStatus,
  PlaySpeed,
  PlaybackFilterForm,
} from '@/api/types/video/playback';
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
const selectedCamera = ref<string>('');

// 筛选条件
const filterForm = ref<PlaybackFilterForm>({
  fileLocation: '前端',
  selectedDate: new Date().toISOString().split('T')[0],
  timeRange: 1,
});

// 视频数据
const videoFiles = ref<VideoFile[]>([]);
const currentVideoId = ref<string>('');
const currentPlayUrl = ref<string>('');
const timelineData = ref<TimelineSegment[]>([]);

// 播放器
const videoPlayerRef = ref<HTMLVideoElement>();
const playStatus = ref<PlayStatus>('stopped');
const playSpeed = ref<PlaySpeed>(1);
const currentTime = ref<number>(0);

// 移动端检测
const isMobile = ref(false);
// 筛选项展开状态（仅移动端有效）
const isFilterExpanded = ref(false);

// 计算当前时间在时间轴上的百分比位置
const currentTimePercent = computed(() => {
  const totalSeconds = 24 * 60 * 60; // 一天的总秒数
  const currentSeconds =
    currentTime.value % totalSeconds;
  return (currentSeconds / totalSeconds) * 100;
});

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
 * 树节点点击
 */
function handleNodeClick(data: VideoDeviceTreeNode) {
  if (data.type === 'camera') {
    selectedCamera.value = data.id;
    ElMessage.info(`已选择摄像头: ${data.name}`);
  }
}

/**
 * 搜索
 */
async function handleSearch() {
  if (!selectedCamera.value) {
    ElMessage.warning('请先选择摄像头');
    return;
  }

  try {
    const response = await getFileList({
      cameraId: selectedCamera.value,
      fileLocation: filterForm.value.fileLocation,
      date: filterForm.value.selectedDate,
      timeRange: filterForm.value.timeRange,
    });

    videoFiles.value = response.files;
    timelineData.value = response.timeline;

    if (response.files.length > 0) {
      currentVideoId.value = response.files[0].id;
      handlePlayFile(response.files[0]);
    }

    ElMessage.success(`加载到 ${response.files.length} 个录像文件`);
  } catch (error) {
    ElMessage.error('加载录像文件失败');
    console.error('Failed to load files:', error);
  }
}

/**
 * 播放文件
 */
async function handlePlayFile(file: VideoFile) {
  try {
    const response = await startPlay({
      fileId: file.id,
      filePath: file.filePath,
    });

    // Mock: 使用本地测试视频或空地址
    currentPlayUrl.value = ''; // 实际应使用 response.playUrl
    ElMessage.success(`开始播放: ${file.fileName}`);
  } catch (error) {
    ElMessage.error('播放失败');
    console.error('Failed to play:', error);
  }
}

/**
 * 录像
 */
function handleRecord() {
  ElMessage.info('开始录制当前回放内容');
}

/**
 * 截图
 */
async function handleCapture() {
  if (!currentVideoId.value) {
    ElMessage.warning('没有正在播放的视频');
    return;
  }

  try {
    const currentVideoFile = videoFiles.value.find((f) => f.id === currentVideoId.value);
    if (!currentVideoFile) return;

    const response = await captureSnapshot({
      fileId: currentVideoId.value,
      timestamp: currentVideoFile.startTime,
    });

    ElMessage.success('截图成功');
    console.log('Screenshot:', response.imageUrl);
  } catch (error) {
    ElMessage.error('截图失败');
    console.error('Failed to capture:', error);
  }
}

/**
 * 重新播放
 */
function handleReplay() {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.currentTime = 0;
    videoPlayerRef.value.play();
  }
}

/**
 * 停止
 */
function handleStop() {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pause();
    videoPlayerRef.value.currentTime = 0;
    playStatus.value = 'stopped';
  }
}

/**
 * 切换播放/暂停
 */
function togglePlay() {
  if (videoPlayerRef.value) {
    if (playStatus.value === 'playing') {
      videoPlayerRef.value.pause();
    } else {
      videoPlayerRef.value.play();
    }
  }
}

/**
 * 设置播放速度
 */
function setPlaySpeed(speed: PlaySpeed) {
  playSpeed.value = speed;
  if (videoPlayerRef.value) {
    videoPlayerRef.value.playbackRate = speed;
  }
  ElMessage.info(`播放速度: ${speed}x`);
}

/**
 * 批量下载
 */
async function handleBatchDownload() {
  const checkedNodes = deviceTreeRef.value?.getCheckedNodes() as VideoDeviceTreeNode[];
  if (checkedNodes.length === 0) {
    ElMessage.warning('请先选择要下载的文件');
    return;
  }

  try {
    const fileIds = videoFiles.value.map((f) => f.id);
    await batchDownload({ fileIds });
    ElMessage.success('开始批量下载');
  } catch (error) {
    ElMessage.error('批量下载失败');
    console.error('Failed to batch download:', error);
  }
}

/**
 * 全屏
 */
function handleFullscreen() {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.requestFullscreen();
  }
}

/**
 * 时间轴点击
 */
function handleTimelineClick(segment: TimelineSegment) {
  const file = videoFiles.value.find((f) => f.id === segment.fileId);
  if (file) {
    currentVideoId.value = file.id;
    handlePlayFile(file);
  }
}

/**
 * 获取时间段样式
 */
function getSegmentStyle(segment: TimelineSegment) {
  const [startHour, startMinute, startSecond] = segment.startTime.split(':').map(Number);
  const [endHour, endMinute, endSecond] = segment.endTime.split(':').map(Number);

  const startSeconds = startHour * 3600 + startMinute * 60 + startSecond;
  const endSeconds = endHour * 3600 + endMinute * 60 + endSecond;

  const totalSeconds = 24 * 60 * 60;
  const leftPercent = (startSeconds / totalSeconds) * 100;
  const widthPercent = ((endSeconds - startSeconds) / totalSeconds) * 100;

  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
  };
}

/**
 * 时间更新
 */
function handleTimeUpdate() {
  if (videoPlayerRef.value) {
    currentTime.value = videoPlayerRef.value.currentTime;
  }
}

/**
 * 播放
 */
function handlePlay() {
  playStatus.value = 'playing';
}

/**
 * 暂停
 */
function handlePause() {
  playStatus.value = 'paused';
}

/**
 * 检测是否为移动端
 */
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
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
        
        /* Date picker full width on mobile */
        .date-item {
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

    .video-player-section {
      flex: 1;
      display: flex;
      flex-direction: column;

      .video-player {
        flex: 1;
        background-color: #000;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 15px;
        
        @media (max-width: 768px) {
          margin-bottom: 12px;
        }

        .no-video {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          color: #fff;
          font-size: 18px;

          .el-icon {
            font-size: 64px;
          }
          
          @media (max-width: 768px) {
            font-size: 14px;
            gap: 10px;
            
            .el-icon {
              font-size: 48px;
            }
          }
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .control-bar {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        margin-bottom: 15px;

        .control-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          
          &.mobile-control-buttons {
            gap: 6px;
          }
        }

        .control-right {
          display: flex;
          gap: 8px;
          
          &.mobile-control-right {
            gap: 6px;
          }
        }
        
        &.mobile-control-bar {
          padding: 8px 0;
          margin-bottom: 12px;
          flex-direction: column;
          gap: 8px;
          
          .control-buttons,
          .control-right {
            justify-content: center;
          }
        }
        
        @media (max-width: 768px) {
          flex-direction: column;
          gap: 8px;
          padding: 8px 0;
          margin-bottom: 12px;
          
          .control-buttons,
          .control-right {
            justify-content: center;
            gap: 6px;
          }
        }
        
        @media (max-width: 480px) {
          .control-buttons,
          .control-right {
            gap: 4px;
          }
        }
      }

      .timeline-section {
        .timeline-header {
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
          
          @media (max-width: 768px) {
            margin-bottom: 8px;
          }
        }

        .timeline-container {
          position: relative;
          height: 80px;
          background-color: var(--el-fill-color-lighter);
          border-radius: 4px;
          overflow: hidden;
          
          @media (max-width: 768px) {
            height: 60px;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
          }
          
          // 移动端时间轴内容需要最小宽度以触发滚动
          @media (max-width: 768px) {
            .timeline-ruler,
            .timeline-segments {
              min-width: 960px; // 最小宽度确保所有时间标记有足够空间
            }
          }

          .timeline-ruler {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 30px;
            border-bottom: 1px solid var(--el-border-color);
            
            @media (max-width: 768px) {
              height: 24px;
              width: 100%;
              min-width: 960px; /* 增加最小宽度，为每个小时标记提供40px空间 */
            }

            .timeline-hour {
              position: absolute;
              top: 5px;
              transform: translateX(-50%);
              font-size: 12px;
              color: var(--el-text-color-secondary);
              white-space: nowrap; /* 防止文本换行 */
              
              @media (max-width: 768px) {
                font-size: 10px;
                top: 3px;
              }
            }
          }

          .timeline-segments {
            position: absolute;
            top: 35px;
            left: 0;
            right: 0;
            height: 30px;
            
            @media (max-width: 768px) {
              top: 28px;
              height: 24px;
              width: 100%;
              min-width: 960px; /* 与ruler保持一致的最小宽度 */
            }

            .timeline-segment {
              position: absolute;
              height: 100%;
              background-color: var(--el-color-primary);
              cursor: pointer;
              transition: opacity 0.3s;

              &:hover {
                opacity: 0.8;
              }
            }
          }

          .timeline-indicator {
            position: absolute;
            top: 30px;
            bottom: 0;
            width: 2px;
            background-color: var(--el-color-danger);
            pointer-events: none;
            z-index: 10;
            
            @media (max-width: 768px) {
              top: 24px;
            }
          }
        }
        
        &.mobile-timeline-section {
          .timeline-header {
            margin-bottom: 8px;
          }
        }
      }
    }
  }
</style>
