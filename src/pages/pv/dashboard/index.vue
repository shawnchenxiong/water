<template>
  <div
    :class="[
      'pv-dashboard',
      {
        'left-collapsed': leftPanelCollapsed,
        'right-collapsed': rightPanelCollapsed,
        'bottom-collapsed': bottomPanelCollapsed
      }
    ]"
  >
    <!-- 左侧面板 -->
    <div v-if="!leftPanelCollapsed" class="left-panel">
      <!-- 统计卡片 -->
      <div class="placeholder-card">
        <PowerStatsCard />
      </div>
      
      <!-- 趋势图表 -->
      <div class="placeholder-card">
        <PowerTrendCard />
      </div>
      
      <!-- 满发TOP20 -->
      <div class="placeholder-card">
        <FullHourTop20Card />
      </div>
    </div>

    <!-- 中间面板 -->
    <div class="center-panel">
      <!-- 地图区域 -->
      <div class="placeholder-card map-placeholder">
        <MapCard />
      </div>
    </div>

    <!-- 底部面板 -->
    <div v-if="!bottomPanelCollapsed" class="bottom-panel">
      <AlarmListCard />
    </div>

    <!-- 右侧面板 -->
    <div v-if="!rightPanelCollapsed" class="right-panel">
      <!-- 建设统计 -->
      <div class="placeholder-card">
        <ConstructionStatsCard />
      </div>
      
      <!-- 发电TOP20 -->
      <div class="placeholder-card">
        <GenerationTop20Card />
      </div>
      
      <!-- 功率曲线 -->
      <div class="placeholder-card">
        <PowerCurveCard />
      </div>
    </div>

    <!-- 所有折叠/展开按钮 -->
    <!-- 左侧折叠按钮 -->
    <div
      v-if="!leftPanelCollapsed"
      class="collapse-btn left-collapse-btn"
      @click="leftPanelCollapsed = true"
    ></div>
    
    <!-- 左侧展开按钮 -->
    <div
      v-if="leftPanelCollapsed"
      class="collapse-btn left-expand-btn"
      @click="leftPanelCollapsed = false"
    ></div>
    
    <!-- 右侧折叠按钮 -->
    <div
      v-if="!rightPanelCollapsed"
      class="collapse-btn right-collapse-btn"
      @click="rightPanelCollapsed = true"
    ></div>
    
    <!-- 右侧展开按钮 -->
    <div
      v-if="rightPanelCollapsed"
      class="collapse-btn right-expand-btn"
      @click="rightPanelCollapsed = false"
    ></div>
    
    <!-- 底部折叠按钮 -->
    <div
      v-if="!bottomPanelCollapsed"
      class="collapse-btn bottom-collapse-btn"
      @click="bottomPanelCollapsed = true"
    ></div>
    
    <!-- 底部展开按钮 -->
    <div
      v-if="bottomPanelCollapsed"
      class="collapse-btn bottom-expand-btn"
      @click="bottomPanelCollapsed = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AlarmListCard from './components/AlarmListCard.vue'
import PowerStatsCard from './components/PowerStatsCard.vue'
import PowerTrendCard from './components/PowerTrendCard.vue'
import FullHourTop20Card from './components/FullHourTop20Card.vue'
import MapCard from './components/MapCard.vue'
import ConstructionStatsCard from './components/ConstructionStatsCard.vue'
import GenerationTop20Card from './components/GenerationTop20Card.vue'
import PowerCurveCard from './components/PowerCurveCard.vue'

// 面板折叠状态
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)
const bottomPanelCollapsed = ref(false)
</script>

<style scoped lang="scss">
.pv-dashboard {
  position: relative;
  display: grid;
  grid-template-columns: 360px 1fr 360px;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    "left center right"
    "left center right"
    "left bottom right";
  gap: 16px;
  padding: 16px;
  height: 100%;
  background: linear-gradient(135deg, #0a1628 0%, #1a2f4a 100%);
  overflow: hidden;

  /* 左侧面板折叠状态 */
  &.left-collapsed {
    grid-template-columns: 0px 1fr 360px;
    grid-template-areas:
      "center center right"
      "center center right"
      "bottom bottom right";
  }

  /* 右侧面板折叠状态 */
  &.right-collapsed {
    grid-template-columns: 360px 1fr 0px;
    grid-template-areas:
      "left center center"
      "left center center"
      "left bottom bottom";
  }

  /* 底部折叠状态 */
  &.bottom-collapsed {
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      "left center right"
      "left center right";
  }

  /* 左右都折叠 */
  &.left-collapsed.right-collapsed {
    grid-template-columns: 0px 1fr 0px;
    grid-template-areas:
      "center center center"
      "center center center"
      "bottom bottom bottom";
  }

  /* 左侧和底部折叠 */
  &.left-collapsed.bottom-collapsed {
    grid-template-columns: 0px 1fr 360px;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      "center center right"
      "center center right";
  }

  /* 右侧和底部折叠 */
  &.right-collapsed.bottom-collapsed {
    grid-template-columns: 360px 1fr 0px;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      "left center center"
      "left center center";
  }

  /* 全部折叠 */
  &.left-collapsed.right-collapsed.bottom-collapsed {
    grid-template-columns: 0px 1fr 0px;
    grid-template-rows: 1fr;
    grid-template-areas:
      "center center center";
  }
}

/* 面板容器 */
.left-panel {
  grid-area: left;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 16px;
  overflow: hidden;
  position: relative;
}

.center-panel {
  grid-area: center;
  overflow: hidden;
  position: relative;
}

.right-panel {
  grid-area: right;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 16px;
  overflow: hidden;
  position: relative;
}

.bottom-panel {
  grid-area: bottom;
  overflow: hidden;
  position: relative;
  background: url('/images/transverse-box.png') no-repeat center center;
  background-size: 100% 100%;
  border-radius: 8px;
  
  :deep(.alarm-list-card) {
    height: 100%;
    width: 100%;
    background: transparent; // 让组件背景透明，使用面板背景
  }
}

/* 折叠按钮样式 */
.collapse-btn {
  position: absolute;
  z-index: 1000;
  width: 60px;
  height: 60px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    filter: brightness(1.2);
  }
  
  &:active {
    filter: brightness(0.8);
  }
}

/* 左侧折叠按钮 */
.left-collapse-btn {
  top: 50%;
  left: calc(360px - 9px);
  transform: translateY(-50%);
  background-image: url('/images/left.png');
}

.left-expand-btn {
  top: 50%;
  left: -19px;
  transform: translateY(-50%);
  background-image: url('/images/right.png');
}

/* 右侧折叠按钮 */
.right-collapse-btn {
  top: 50%;
  right: calc(360px - 9px);
  transform: translateY(-50%);
  background-image: url('/images/right.png');
}

.right-expand-btn {
  top: 50%;
  right: -19px;
  transform: translateY(-50%);
  background-image: url('/images/left.png');
}

/* 底部折叠按钮 */
.bottom-collapse-btn {
  bottom: calc(33.33% - 30px);
  left: 50%;
  transform: translateX(-50%);
  background-image: url('/images/up.png');
}

.bottom-expand-btn {
  bottom: -19px;
  left: 50%;
  transform: translateX(-50%);
  background-image: url('/images/down.png');
}

/* 占位卡片样式 */
.placeholder-card {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  
  /* 默认样式 - 适用于文本内容 */
  background: url('/images/tile-back.png') no-repeat center center;
  background-size: 100% 100%;
  border: 1px solid rgba(0, 212, 255, 0.3);
  backdrop-filter: blur(10px);
  padding: 20px;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #ffffff;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-color-primary);
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
}

/* 左侧面板所有卡片 - 让组件填满空间 */
.left-panel > .placeholder-card {
  padding: 0;
  justify-content: stretch;
  align-items: stretch;
}

/* 中间面板的地图卡片也应该填满空间 */
.center-panel > .placeholder-card {
  padding: 0;
  justify-content: stretch;
  align-items: stretch;
}

/* 右侧面板所有卡片 - 让组件填满空间 */
.right-panel > .placeholder-card {
  padding: 0;
  justify-content: stretch;
  align-items: stretch;
}

.map-placeholder {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.alarm-placeholder {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

/* ====================
   移动端适配 (≤768px)
==================== */
@media (max-width: 768px) {
  .pv-dashboard {
    /* 移动端改为单列垂直堆叠布局 */
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    height: auto;
    min-height: 100vh;
    
    /* 移除所有折叠相关的grid配置 */
    &.left-collapsed,
    &.right-collapsed,
    &.bottom-collapsed,
    &.left-collapsed.right-collapsed,
    &.left-collapsed.bottom-collapsed,
    &.right-collapsed.bottom-collapsed,
    &.left-collapsed.right-collapsed.bottom-collapsed {
      display: flex;
      flex-direction: column;
    }
  }

  /* 移动端隐藏所有折叠/展开按钮 */
  .collapse-btn {
    display: none !important;
  }

  /* 移动端所有面板都可见且自动堆叠 */
  .left-panel,
  .right-panel,
  .bottom-panel {
    display: flex !important;
    flex-direction: column;
    gap: 12px;
    overflow: visible;
  }

  .left-panel,
  .right-panel {
    /* 取消 grid-template-rows，改为自然堆叠 */
    display: flex;
    flex-direction: column;
  }

  .center-panel {
    overflow: visible;
  }

  /* 移动端卡片样式调整 */
  .placeholder-card {
    height: 350px; // 固定高度，让图表组件正常显示
    padding: 12px;
    
    h3 {
      font-size: 14px;
    }
    
    p {
      font-size: 12px;
    }
  }

  /* 地图卡片特殊处理 - 更大的高度 */
  .map-placeholder {
    height: 450px;
  }

  /* 底部面板（告警列表）适配 */
  .bottom-panel {
    background-size: cover; // 移动端调整背景图尺寸
  }
}
</style>