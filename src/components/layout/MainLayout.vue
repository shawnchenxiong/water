<template>
  <div class="main-layout">
    <LayoutHeader />
    <div class="main-content">
      <RouterView />
    </div>
    <!-- 浮动告警铃铛 -->
    <AlarmNotification />
  </div>
</template>

<script setup lang="ts">
import AlarmNotification from '@/components/common/AlarmNotification.vue';
</script>

<style scoped>
.main-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: url('/images/layout/background.png') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  overflow: hidden;
}

.main-content {
  flex: 1;
  min-height: 0; /* 确保 flex 子元素可以正确收缩 */
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条 */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(10, 22, 40, 0.5);
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.5);
}
</style>
