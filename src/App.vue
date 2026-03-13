<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const handleGlobalClick = () => {
  ElMessage.closeAll()
}

onMounted(() => {
  // 使用捕获阶段 (true)，确保在点击目标元素（可能产生新消息）之前，先关闭页面上已有的旧消息
  document.addEventListener('click', handleGlobalClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true)
})
</script>
<style>
/* 全局样式在 styles/global.css 中定义 */
</style>

