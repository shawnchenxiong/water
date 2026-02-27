<template>
  <div class="page-container">
    <div class="page-header">
      <h2>清洗查询</h2>
    </div>
    <div class="page-content">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <i class="el-icon-search"></i>
        </div>
        <h3>清洗查询</h3>
        <p>查询组件清洗记录和状态</p>
        <p class="placeholder-note">此页面正在开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const pageTitle = ref('清洗查询')
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  height: 100%;
  background: rgba(0, 20, 40, 0.8);
}

.page-header {
  margin-bottom: 20px;
  
  h2 {
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
}

.page-content {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 40px;
  height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #fff;
  
  .placeholder-icon {
    font-size: 64px;
    color: #00d4ff;
    margin-bottom: 20px;
    
    i {
      display: block;
    }
  }
  
  h3 {
    font-size: 28px;
    color: #00d4ff;
    margin: 0 0 16px 0;
    font-weight: 600;
  }
  
  p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 8px 0;
    line-height: 1.6;
  }
  
  .placeholder-note {
    margin-top: 24px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }
}
</style>
