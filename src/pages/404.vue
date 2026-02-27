<template>
  <div class="not-found-page flex-col-center">
    <div class="text-center">
      <div class="i-carbon:warning-alt text-8xl text-primary mb-8" />
      <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p class="text-xl text-gray-600 mb-8">Page Not Found</p>
      <el-button type="primary" size="large" @click="goHome">
        <div class="i-carbon:home mr-2" />
        Back to Home
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/pv/dashboard')
}
</script>

<style scoped>
.not-found-page {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>

