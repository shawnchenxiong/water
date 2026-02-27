<template>
  <DeviceMonitorLayout>
    <!-- 左侧设备树 -->
    <template #left>
      <VideoDeviceTree 
        :tree-data="deviceTree"
        @device-click="handleDeviceClick"
        @refresh="loadDeviceTree"
      />
    </template>

    <!-- 右侧视频播放区域 -->
    <template #right>
      <div class="video-content">
        <!-- 云台控制按钮 -->
        <div class="ptz-trigger" @click="showPtzControl = true">
          <span>云台控制双向语音</span>
          <el-icon><ArrowRight /></el-icon>
        </div>

        <!-- 云台控制弹窗 -->
        <el-dialog
          v-model="showPtzControl"
          title="云台控制双向语音"
          width="400px"
        >
          <div class="ptz-content">
            <div class="ptz-direction">
              <!-- 云台方向控制 -->
              <div class="direction-grid">
                <el-button class="dir-btn" @mousedown="handlePtzControl('leftup')" @mouseup="handlePtzStop">↖</el-button>
                <el-button class="dir-btn" @mousedown="handlePtzControl('up')" @mouseup="handlePtzStop">↑</el-button>
                <el-button class="dir-btn" @mousedown="handlePtzControl('rightup')" @mouseup="handlePtzStop">↗</el-button>
                <el-button class="dir-btn" @mousedown="handlePtzControl('left')" @mouseup="handlePtzStop">←</el-button>
                <el-button class="dir-btn center">●</el-button>
                <el-button class="dir-btn" @mousedown="handlePtzControl('right')" @mouseup="handlePtzStop">→</el-button>
                <el-button class="dir-btn" @mousedown="handlePtzControl('leftdown')" @mouseup="handlePtzStop">↙</el-button>
                <el-button class="dir-btn" @mousedown="handlePtzControl('down')" @mouseup="handlePtzStop">↓</el-button>
                <el-button class="dir-btn" @mousedown="handlePtzControl('rightdown')" @mouseup="handlePtzStop">↘</el-button>
              </div>
            </div>
            <div class="ptz-controls">
              <div class="control-group">
                <span>变倍</span>
                <el-button @mousedown="handlePtzControl('zoomin')" @mouseup="handlePtzStop">+</el-button>
                <el-button @mousedown="handlePtzControl('zoomout')" @mouseup="handlePtzStop">-</el-button>
              </div>
              <div class="control-group">
                <span>焦距</span>
                <el-button @mousedown="handlePtzControl('focusin')" @mouseup="handlePtzStop">+</el-button>
                <el-button @mousedown="handlePtzControl('focusout')" @mouseup="handlePtzStop">-</el-button>
              </div>
              <div class="control-group">
                <span>光圈</span>
                <el-button @mousedown="handlePtzControl('irisin')" @mouseup="handlePtzStop">+</el-button>
                <el-button @mousedown="handlePtzControl('irisout')" @mouseup="handlePtzStop">-</el-button>
              </div>
            </div>
          </div>
        </el-dialog>

        <!-- 画面切换 -->
        <div class="layout-switcher">
          <el-button-group>
            <el-button :type="layout === 1 ? 'primary' : ''" @click="changeLayout(1)">1画面</el-button>
            <el-button :type="layout === 4 ? 'primary' : ''" @click="changeLayout(4)">4画面</el-button>
            <el-button :type="layout === 6 ? 'primary' : ''" @click="changeLayout(6)">6画面</el-button>
            <el-button :type="layout === 9 ? 'primary' : ''" @click="changeLayout(9)">9画面</el-button>
            <el-button :type="layout === 16 ? 'primary' : ''" @click="changeLayout(16)">16画面</el-button>
          </el-button-group>
        </div>

        <!-- 视频播放网格 -->
        <div class="video-grid" :class="`layout-${layout}`">
          <div 
            v-for="player in players" 
            :key="player.id" 
            class="video-player"
            :class="{ active: selectedPlayer === player.id }"
            @click="selectedPlayer = player.id"
          >
            <div v-if="player.status === 'idle'" class="player-empty">
              <el-icon><VideoCameraFilled /></el-icon>
              <span>请选择设备</span>
            </div>
            <div v-else-if="player.status === 'loading'" class="player-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
            <div v-else-if="player.status === 'playing'" class="player-video">
              <!-- 实际视频播放组件 -->
              <div class="video-placeholder">
                <span>{{ player.deviceName }}</span>
              </div>
            </div>
            <div v-else class="player-error">
              <el-icon><Warning /></el-icon>
              <span>播放失败</span>
            </div>
          </div>
        </div>

        <!-- 工具栏 -->
        <div class="video-toolbar">
          <el-button-group>
            <el-button @click="toggleSound">开启声音</el-button>
            <el-button @click="startRecord">录像</el-button>
            <el-button @click="toggleSubstream">子码流</el-button>
            <el-button @click="takeSnapshot">截图</el-button>
            <el-button @click="stopPlayer">停止</el-button>
            <el-button @click="stopAllPlayers">全部停止</el-button>
            <el-button @click="toggleFullscreen">全屏</el-button>
          </el-button-group>
        </div>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  ArrowRight, 
  Loading, 
  Warning,
  VideoCameraFilled
} from '@element-plus/icons-vue';
import { getVideoDeviceTree } from '@/api/video/browsing';
import type { VideoDeviceNode, VideoPlayer, VideoLayout } from '@/api/types/video/browsing';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';
import VideoDeviceTree from './components/VideoDeviceTree.vue';

// 设备树
const deviceTree = ref<VideoDeviceNode[]>([]);

// 云台控制
const showPtzControl = ref(false);

// 视频播放
const layout = ref<VideoLayout>(1);
const selectedPlayer = ref('player-1');
const players = ref<VideoPlayer[]>([]);

// 初始化播放器
function initPlayers() {
  const count = layout.value;
  players.value = Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    status: 'idle',
  }));
  selectedPlayer.value = 'player-1';
}

/**
 * 加载设备树
 */
async function loadDeviceTree() {
  try {
    deviceTree.value = await getVideoDeviceTree();
  } catch (error) {
    // 静默处理错误
  }
}

/**
 * 设备点击
 */
function handleDeviceClick(data: VideoDeviceNode) {
  if (data.type === 'device' && data.online) {
    const currentPlayer = players.value.find(p => p.id === selectedPlayer.value);
    if (currentPlayer) {
      currentPlayer.deviceId = data.id;
      currentPlayer.deviceName = data.name;
      currentPlayer.status = 'playing';
    }
  }
}

/**
 * 切换布局
 */
function changeLayout(newLayout: VideoLayout) {
  layout.value = newLayout;
  initPlayers();
}

/**
 * 云台控制
 */
function handlePtzControl(direction: string) {
  // TODO: 调用云台控制API
}

function handlePtzStop() {
  // TODO: 停止云台控制
}

/**
 * 工具栏操作
 */
function toggleSound() {
  // 静音切换
}

function startRecord() {
  // 开始录制
}

function toggleSubstream() {
  // 切换子码流
}

function takeSnapshot() {
  // 截图
}

function stopPlayer() {
  const currentPlayer = players.value.find(p => p.id === selectedPlayer.value);
  if (currentPlayer) {
    currentPlayer.status = 'idle';
    currentPlayer.deviceId = undefined;
    currentPlayer.deviceName = undefined;
  }
}

function stopAllPlayers() {
  players.value.forEach(p => {
    p.status = 'idle';
    p.deviceId = undefined;
    p.deviceName = undefined;
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// 初始化
onMounted(() => {
  loadDeviceTree();
  initPlayers();
});
</script>

<style scoped>
.video-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
}

.ptz-trigger {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, rgba(20, 40, 80, 0.9) 0%, rgba(30, 60, 120, 0.8) 100%);
  padding: 12px 16px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-left: none;
  z-index: 100;
  color: #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
  transition: all 0.3s ease;
}

.ptz-trigger:hover {
  background: linear-gradient(135deg, rgba(30, 50, 90, 0.95) 0%, rgba(40, 70, 130, 0.9) 100%);
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
  transform: translateY(-50%) translateX(2px);
}

.ptz-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.dir-btn {
  width: 60px;
  height: 60px;
  font-size: 24px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  transition: all 0.3s ease;
}

.dir-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.dir-btn.center {
  cursor: default;
  background: rgba(0, 212, 255, 0.15);
}

.ptz-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group span {
  width: 50px;
  color: rgba(255, 255, 255, 0.85);
}

.layout-switcher {
  display: flex;
  justify-content: flex-start;
  padding: 8px;
  background: rgba(10, 30, 50, 0.4);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.video-grid {
  flex: 1;
  display: grid;
  gap: 10px;
  overflow-y: auto;
  padding: 4px;
}

.video-grid.layout-1 {
  grid-template-columns: 1fr;
}

.video-grid.layout-4 {
  grid-template-columns: repeat(2, 1fr);
}

.video-grid.layout-6 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.video-grid.layout-9 {
  grid-template-columns: repeat(3, 1fr);
}

.video-grid.layout-16 {
  grid-template-columns: repeat(4, 1fr);
}

.video-player {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.video-player::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 212, 255, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.video-player:hover {
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
}

.video-player.active {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), inset 0 0 20px rgba(0, 212, 255, 0.1);
}

.player-empty,
.player-loading,
.player-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}

.player-empty .el-icon,
.player-error .el-icon {
  font-size: 48px;
  color: rgba(0, 212, 255, 0.4);
}

.player-loading .el-icon {
  font-size: 48px;
  color: #00d4ff;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.6));
}

.player-video {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.video-placeholder {
  text-align: center;
  color: #00d4ff;
  font-weight: 500;
  padding: 16px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.video-toolbar {
  display: flex;
  justify-content: center;
  padding: 8px;
  background: rgba(10, 30, 50, 0.4);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

/* Element Plus 按钮组样式覆盖 */
:deep(.el-button-group .el-button) {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s ease;
}

:deep(.el-button-group .el-button:hover) {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  color: #fff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

:deep(.el-button-group .el-button--primary) {
  background: rgba(0, 212, 255, 0.3);
  border-color: #00d4ff;
  color: #fff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
}

/* Element Plus 输入框样式 */
:deep(.el-input__wrapper) {
  background: rgba(10, 30, 50, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 212, 255, 0.5);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

:deep(.el-input__inner) {
  color: #fff;
}

:deep(.el-input__prefix .el-icon) {
  color: #00d4ff;
}

/* 滚动条样式 */
.video-grid::-webkit-scrollbar {
  width: 6px;
}

.video-grid::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.4);
  border-radius: 3px;
}

.video-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.video-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.5);
}
</style>