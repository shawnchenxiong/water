<template>
  <div class="system-container">
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <span>消息中心</span>
        </div>
      </template>

      <el-empty description="消息中心模块" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Placeholder for future development
</script>

<style scoped>
.system-container {
  padding: 20px;
}
.content-card {
  height: calc(100vh - 120px);
}
.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>
