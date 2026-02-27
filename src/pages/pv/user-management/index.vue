<template>
  <div class="user-management-container">
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <span>角色模拟与用户管理</span>
        </div>
      </template>

      <el-alert
        title="角色切换"
        type="info"
        show-icon
        style="margin-bottom: 20px"
      />

      <el-table :data="roleList" style="width: 100%" border>
        <el-table-column prop="username" label="账户名" width="180" />
        <el-table-column prop="realname" label="角色名称" width="180" />
        <el-table-column prop="tenantName" label="系统权限等级" width="180" />
        <el-table-column prop="desc" label="功能说明" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button 
              :type="currentUsername === scope.row.username ? 'success' : 'primary'" 
              size="small" 
              :disabled="currentUsername === scope.row.username"
              @click="switchRole(scope.row)"
            >
              {{ currentUsername === scope.row.username ? '当前使用' : '切换角色' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useTenantStore } from '@/stores/tenant'
import { useUserStore } from '@/stores/user'

const tenantStore = useTenantStore()
const userStore = useUserStore()

const currentUsername = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.username
    } catch(e) {}
  }
  return localStorage.getItem('username') || ''
})

const roleList = ref([
  {
    roleKey: 'engineer',
    username: 'admin',
    realname: '工程师',
    tenantName: '高级权限',
    tenantId: 1,
    desc: '拥有系统的所有操作、设备控制和配置权限。'
  },
  {
    roleKey: 'user',
    username: 'user',
    realname: '用户',
    tenantName: '标准权限',
    tenantId: 2,
    desc: '拥有系统的基础查询与部分受限控制权限。'
  },
  {
    roleKey: 'guest',
    username: 'guest',
    realname: '访客',
    tenantName: '只读权限',
    tenantId: 3,
    desc: '仅享受查看数据的权利，无任何操作、修改或删除权限。'
  }
])

const switchRole = (role: any) => {
  // 模拟登录
  const mockUserInfo = {
    username: role.username,
    realname: role.realname,
    tenantName: role.tenantName
  }
  
  localStorage.setItem('token', 'demo-token-' + role.roleKey)
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userInfo', JSON.stringify(mockUserInfo))
  localStorage.setItem('username', mockUserInfo.username)
  
  tenantStore.saveTenant(role.tenantId, mockUserInfo.tenantName)
  
  if (userStore) {
    userStore.userInfo = mockUserInfo as any
    userStore.token = 'demo-token-' + role.roleKey
  }
  
  ElMessage.success('角色已成功切换为：' + mockUserInfo.realname)
  
  // 刷新页面重新加载
  setTimeout(() => {
    window.location.href = '/#/pv/dashboard'
    window.location.reload()
  }, 500)
}
</script>

<style scoped>
.user-management-container {
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
