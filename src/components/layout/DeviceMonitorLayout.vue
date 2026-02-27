<template>
  <div class="device-monitor-layout">
    <!-- 移动端浮动菜单按钮 -->
    <div class="mobile-menu-fab" v-if="isMobile" @click="toggleCollapse">
      <el-icon :size="20">
        <MenuIcon v-if="!mobileDrawerVisible" />
        <Close v-else />
      </el-icon>
    </div>

    <!-- 桌面端左侧面板 -->
    <div 
      class="left-panel" 
      :class="{ collapsed: isCollapsed }"
      v-show="!isMobile"
    >
      <div class="left-panel-content">
        <slot name="left" />
      </div>
      
      <!-- 桌面端收起/展开按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon>
          <DArrowLeft v-if="!isCollapsed" />
          <DArrowRight v-else />
        </el-icon>
      </div>
    </div>

    <!-- 移动端抽屉面板 -->
    <el-drawer
      v-model="mobileDrawerVisible"
      title="设备监控"
      direction="ltr"
      :modal="true"
      :size="300"
      class="mobile-device-drawer"
      @close="closeMobileDrawer"
    >
      <div class="mobile-drawer-content">
        <slot name="left" />
      </div>
    </el-drawer>

    <!-- 右侧面板 -->
    <div class="right-panel" :class="{ 'mobile-full': isMobile }">
      <div class="right-panel-content">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { DArrowLeft, DArrowRight, Menu as MenuIcon, Close } from '@element-plus/icons-vue';

// 左侧面板收起状态
const isCollapsed = ref(false);
// 移动端状态
const isMobile = ref(false);
const mobileDrawerVisible = ref(false);

// 响应式检测
const checkIsMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  const wasMobile = isMobile.value
  isMobile.value = newIsMobile
  
  if (newIsMobile) {
    // 切换到移动端模式
    isCollapsed.value = false // 移动端不使用收起功能，而是使用抽屉
  } else {
    // 切换到桌面端模式，如果之前是移动端则关闭抽屉
    if (wasMobile && mobileDrawerVisible.value) {
      mobileDrawerVisible.value = false
    }
  }
}

// 切换收起/展开状态
const toggleCollapse = () => {
  if (isMobile.value) {
    // 移动端切换抽屉显示
    mobileDrawerVisible.value = !mobileDrawerVisible.value
  } else {
    // 桌面端切换收起状态
    isCollapsed.value = !isCollapsed.value;
  }
};

// 关闭移动端抽屉
const closeMobileDrawer = () => {
  mobileDrawerVisible.value = false;
};

// 组件挂载时初始化
onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})
</script>

<style scoped lang="scss">
.device-monitor-layout {
  width: 100%;
  max-width: 100vw; /* 强制不超出视口宽度 */
  height: 100%; /* 使用相对高度而不是绝对计算 */
  min-height: 0; /* 允许flex子元素压缩 */
  display: flex;
  background: linear-gradient(180deg, rgba(15, 30, 60, 0.9) 0%, rgba(20, 40, 80, 0.95) 100%);
  position: relative;
  overflow: hidden; /* 防止子元素溢出 */
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(0, 212, 255, 0.08) 0%, transparent 60%);
    pointer-events: none;
    z-index: 1;
  }
}

.left-panel {
  width: 450px;
  height: 100%;
  flex-shrink: 0;
  position: relative;
  background: url('/images/left-box.png') no-repeat center center;
  background-size: 100% 100%;
  z-index: 2;
  transition: all 0.3s ease;
  
  &.collapsed {
    width: 50px;
    
    .left-panel-content {
      opacity: 0;
      pointer-events: none;
    }
    
    .collapse-btn {
      right: 5px;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(20, 40, 80, 0.5) 0%, 
      rgba(30, 60, 120, 0.4) 50%, 
      rgba(20, 40, 80, 0.5) 100%
    );
    border-radius: 0;
    border-right: 1px solid rgba(0, 212, 255, 0.3);
  }
  
  .left-panel-content {
    width: 100%;
    height: 100%;
    padding: 10px 5px;
    box-sizing: border-box;
    position: relative;
    z-index: 3;
    transition: opacity 0.3s ease;
    
    // 确保内容在背景图片上方
    background: transparent;
  }
  
  .collapse-btn {
    position: absolute;
    bottom: 20px;
    right: 15px;
    width: 32px;
    height: 32px;
    background: rgba(10, 30, 50, 0.85);
    border: 1px solid rgba(0, 212, 255, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 4;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(15, 40, 70, 0.95);
      border-color: #00d4ff;
      transform: scale(1.1);
    }
    
    .el-icon {
      color: #00d4ff;
      font-size: 16px;
    }
  }
}

.right-panel {
  flex: 1;
  min-width: 0; /* 关键：允许flex子元素缩小 */
  width: 100%;
  max-width: 100%;
  height: 100%;
  position: relative;
  background: url('/images/right-box.png') no-repeat center center;
  background-size: 100% 100%;
  z-index: 2;
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(25, 45, 85, 0.5) 0%, 
      rgba(35, 65, 125, 0.4) 50%, 
      rgba(25, 45, 85, 0.5) 100%
    );
    border-radius: 0;
  }
  
  .right-panel-content {
    width: 100%;
    max-width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
    position: relative;
    z-index: 3;
    overflow-y: auto;
    overflow-x: hidden;
    
    // 确保内容在背景图片上方  
    background: transparent;
    
    // 美化滚动条样式
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(10, 30, 50, 0.4);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, 
        rgba(0, 212, 255, 0.6) 0%, 
        rgba(0, 180, 230, 0.8) 50%,
        rgba(0, 212, 255, 0.6) 100%
      );
      border-radius: 4px;
      
      &:hover {
        background: linear-gradient(180deg, 
          rgba(0, 212, 255, 0.8) 0%, 
          rgba(0, 200, 255, 1) 50%,
          rgba(0, 212, 255, 0.8) 100%
        );
      }
    }
    
    &::-webkit-scrollbar-corner {
      background: rgba(10, 30, 50, 0.4);
    }
  }
}

/* 移动端浮动菜单按钮 */
.mobile-menu-fab {
  position: fixed;
  bottom: 30px; /* 距离底部30px */
  left: 20px;   /* 距离左侧20px */
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.9), rgba(0, 180, 230, 0.9));
  border: 2px solid rgba(0, 212, 255, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100; /* 降低z-index，避免遮挡dialog */
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 212, 255, 0.6);
    background: linear-gradient(135deg, rgba(0, 212, 255, 1), rgba(0, 180, 230, 1));
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  .el-icon {
    color: #fff;
    font-size: 22px;
  }
}

/* 移动端抽屉样式 */
:deep(.mobile-device-drawer) {
  z-index: 1000 !important; /* 降低z-index，低于dialog */
  
  .el-drawer {
    z-index: 1000 !important;
  }
  
  .el-overlay {
    z-index: 999 !important;
  }
  
  .el-drawer__header {
    background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95));
    color: #00d4ff;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
    margin-bottom: 0;
    padding: 16px 20px;
    position: relative;
    z-index: 1001; /* 调整内部元素z-index */
    
    .el-drawer__title {
      color: #00d4ff;
      font-weight: 600;
      font-size: 16px;
    }
    
    .el-drawer__close-btn {
      color: rgba(255, 255, 255, 0.8);
      font-size: 18px;
      z-index: 1002;
      
      &:hover {
        color: #00d4ff;
      }
    }
  }
  
  .el-drawer__body {
    background: linear-gradient(180deg, rgba(0, 20, 40, 0.98), rgba(0, 40, 80, 0.98));
    padding: 0;
    z-index: 1001;
  }
}

.mobile-drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  
  // 移动端抽屉内的滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(10, 30, 50, 0.4);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, 
      rgba(0, 212, 255, 0.6) 0%, 
      rgba(0, 180, 230, 0.8) 50%,
      rgba(0, 212, 255, 0.6) 100%
    );
    border-radius: 3px;
    
    &:hover {
      background: linear-gradient(180deg, 
        rgba(0, 212, 255, 0.8) 0%, 
        rgba(0, 200, 255, 1) 50%,
        rgba(0, 212, 255, 0.8) 100%
      );
    }
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .left-panel {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .device-monitor-layout {
    /* 移动端也使用相对高度 */
    height: 100%;
    min-height: 0;
  }
  
  .right-panel.mobile-full {
    width: 100%;
    height: 100%;
    flex: none;
  }
  
  .mobile-menu-fab {
    bottom: 50px; /* 调整底部距离 */
    left: 15px;
    width: 52px;
    height: 52px;
    
    .el-icon {
      font-size: 20px;
    }
  }
}

@media (max-width: 480px) {
  .mobile-menu-fab {
    bottom: 20px; /* 小屏幕底部距离稍小 */
    left: 12px;
    width: 48px;
    height: 48px;
    
    .el-icon {
      font-size: 18px;
    }
  }
  
  .mobile-drawer-content {
    padding: 8px;
  }
}
</style>
