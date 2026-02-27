<template>
  <div class="system-canvas">
    <!-- 加载状态 -->
    <div v-if="loading" class="canvas-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!graphData" class="canvas-empty">
      <el-icon><Warning /></el-icon>
      <span>请从左侧选择电站查看系统图</span>
    </div>

    <!-- SVG内容 -->
    <div v-else class="canvas-content">
      <div class="canvas-header">
        <span class="graph-title">{{ graphData.graphName }}</span>
        <div class="canvas-tools">
          <el-button
            :icon="ZoomIn"
            circle
            size="small"
            @click="handleZoomIn"
            title="放大"
          />
          <el-button
            :icon="ZoomOut"
            circle
            size="small"
            @click="handleZoomOut"
            title="缩小"
          />
          <el-button
            :icon="RefreshRight"
            circle
            size="small"
            @click="handleReset"
            title="重置"
          />
        </div>
      </div>

      <div class="canvas-viewport" ref="viewportRef">
        <div
          class="svg-wrapper"
          :style="{
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          }"
          @mousedown="handleMouseDown"
        >
          <div v-html="graphData.svgContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Loading, Warning, ZoomIn, ZoomOut, RefreshRight } from '@element-plus/icons-vue';
import type { GraphData } from '@/api/types/electrical';

interface Props {
  graphData: GraphData | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const viewportRef = ref<HTMLElement>();

// 放大
const handleZoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 3);
};

// 缩小
const handleZoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.3);
};

// 重置
const handleReset = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};

// 拖拽开始
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  startX.value = e.clientX - translateX.value;
  startY.value = e.clientY - translateY.value;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// 拖拽中
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  translateX.value = e.clientX - startX.value;
  translateY.value = e.clientY - startY.value;
};

// 拖拽结束
const handleMouseUp = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

// 监听图形数据变化，重置视图
watch(() => props.graphData, () => {
  handleReset();
});
</script>

<style scoped lang="scss">
.system-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 20, 40, 0.4);
  position: relative;
}

.canvas-loading,
.canvas-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);

  .el-icon {
    font-size: 48px;
    color: #00d4ff;
  }

  span {
    font-size: 16px;
  }
}

.canvas-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 20, 40, 0.8);
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}

.graph-title {
  font-size: 16px;
  font-weight: 500;
  color: #00d4ff;
}

.canvas-tools {
  display: flex;
  gap: 8px;

  :deep(.el-button) {
    background: rgba(0, 212, 255, 0.1);
    border-color: rgba(0, 212, 255, 0.3);
    color: #00d4ff;

    &:hover {
      background: rgba(0, 212, 255, 0.2);
      border-color: #00d4ff;
    }
  }
}

.canvas-viewport {
  flex: 1;
  overflow: hidden;
  position: relative;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.svg-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform-origin: center center;

  :deep(svg) {
    max-width: 100%;
    max-height: 100%;
  }
}
</style>

