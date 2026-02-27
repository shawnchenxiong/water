<template>
  <DeviceMonitorLayout>
    <!-- 左侧：设备树 -->
    <template #left>
      <div class="device-tree-section">
        <div class="tree-header">
          <el-input v-model="searchKeyword" placeholder="请输入关键字搜索" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <div class="tree-actions">
            <el-button text><el-icon><Folder /></el-icon>空文件夹隐藏</el-button>
            <el-button text>在线</el-button>
            <el-button text>离线</el-button>
            <el-button text @click="loadDeviceTree"><el-icon><Refresh /></el-icon>刷新</el-button>
          </div>
        </div>
        <el-tree
          :data="deviceTree"
          :props="treeProps"
          node-key="id"
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span v-if="data.type === 'camera'" :class="['device-status', data.status]">
                {{ data.status === 'online' ? '在线' : '离线' }}
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </template>

    <!-- 右侧：内容区域 -->
    <template #right>
      <div class="content-section">
      <el-tabs v-model="activeTab" :class="{ 'mobile-tabs': isMobile }">
        <el-tab-pane label="预置位信息" name="info">
          <div class="info-content" :class="{ 'mobile-info-content': isMobile }">
            <!-- 视频预览 -->
            <div class="video-preview">
              <div class="video-header">
                <span>预览实时视频</span>
                <el-button size="small">停止</el-button>
              </div>
              <div class="video-player">
                <video v-if="selectedCamera" ref="videoPlayerRef" class="video-element" controls>
                  <source :src="currentPlayUrl" type="video/mp4" />
                  您的浏览器不支持视频播放
                </video>
                <div v-else class="no-video">
                  <el-icon><VideoCamera /></el-icon>
                  <span>请选择摄像头</span>
                </div>
              </div>
            </div>

            <!-- 云台控制 -->
            <div class="ptz-control">
              <div class="control-header">视频云台控制</div>
              <div class="control-content">
                <!-- 方向控制 -->
                <div class="direction-control">
                  <div class="direction-grid">
                    <el-button class="dir-btn" @mousedown="handlePTZ('leftup')" @mouseup="handlePTZStop">↖</el-button>
                    <el-button class="dir-btn" @mousedown="handlePTZ('up')" @mouseup="handlePTZStop">↑</el-button>
                    <el-button class="dir-btn" @mousedown="handlePTZ('rightup')" @mouseup="handlePTZStop">↗</el-button>
                    <el-button class="dir-btn" @mousedown="handlePTZ('left')" @mouseup="handlePTZStop">←</el-button>
                    <el-button class="dir-btn center">●</el-button>
                    <el-button class="dir-btn" @mousedown="handlePTZ('right')" @mouseup="handlePTZStop">→</el-button>
                    <el-button class="dir-btn" @mousedown="handlePTZ('leftdown')" @mouseup="handlePTZStop">↙</el-button>
                    <el-button class="dir-btn" @mousedown="handlePTZ('down')" @mouseup="handlePTZStop">↓</el-button>
                    <el-button class="dir-btn" @mousedown="handlePTZ('rightdown')" @mouseup="handlePTZStop">↘</el-button>
                  </div>
                </div>
                <!-- 其他控制 -->
                <div class="other-controls">
                  <div class="control-group">
                    <el-button size="small">申请控制</el-button>
                    <el-button size="small" disabled>取消控制</el-button>
                  </div>
                  <div class="control-group">
                    <span>焦距</span>
                    <el-button size="small" @mousedown="handlePTZ('zoomin')" @mouseup="handlePTZStop">+</el-button>
                    <el-button size="small" @mousedown="handlePTZ('zoomout')" @mouseup="handlePTZStop">-</el-button>
                  </div>
                </div>
              </div>
              <div class="control-operations">
                <div class="operations-header">相关操作</div>
                <div class="operations-buttons">
                  <el-button :disabled="!selectedCamera">新增预置位</el-button>
                  <el-button :disabled="!selectedCamera">设置看守</el-button>
                  <el-button :disabled="!selectedCamera">删除看守</el-button>
                </div>
              </div>
            </div>

            <!-- 预置位列表 -->
            <div class="preset-list">
              <el-table :data="presetList" v-loading="loading" style="width: 100%" class="preset-table">
                <el-table-column prop="presetNumber" label="预置位编号" width="120" />
                <el-table-column prop="presetName" label="预置位名称" width="150" show-overflow-tooltip />
                <el-table-column prop="description" label="预置位描述信息" min-width="200" show-overflow-tooltip />
                <el-table-column label="看守卫" width="80">
                  <template #default="{ row }">
                    <el-tag v-if="row.isGuard" type="success" size="small">是</el-tag>
                    <el-tag v-else type="info" size="small">否</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small">转到</el-button>
                    <el-button link type="primary" size="small">编辑</el-button>
                    <el-button link type="danger" size="small">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-section">
                <el-pagination
                  v-model:current-page="pagination.pageNum"
                  v-model:page-size="pagination.pageSize"
                  :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 30, 50]"
                  :disabled="loading"
                  :background="true"
                  :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                  :small="isMobile"
                  :total="pagination.total"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="预置位巡检" name="patrol">
          <div class="patrol-content">
            <!-- 表单区域 -->
            <div class="patrol-form">
              <el-form :inline="!isMobile" :label-width="isMobile ? '100px' : '120px'">
                <el-form-item label="*巡检名称">
                  <el-input v-model="patrolForm.name" placeholder="巡检名称" :disabled="!selectedCamera" />
                </el-form-item>
                <el-form-item label="默认切换时间">
                  <el-input-number v-model="patrolForm.switchTime" :min="10" :max="300" :disabled="!selectedCamera" />
                  <span style="margin-left: 5px;">秒</span>
                </el-form-item>
                <el-form-item label="选择预置位">
                  <el-select v-model="patrolForm.selectedPresets" multiple placeholder="请选择预置位名称" :disabled="!selectedCamera">
                    <el-option v-for="preset in presetList" :key="preset.id" :label="preset.presetName" :value="preset.id" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :disabled="!selectedCamera">保存</el-button>
                  <el-button :disabled="!selectedCamera">重置</el-button>
                </el-form-item>
              </el-form>
              <div class="patrol-points-label">巡检点</div>
            </div>

            <!-- 表格区域 -->
            <div class="patrol-table">
              <el-table :data="patrolList" v-loading="patrolLoading" style="width: 100%" class="patrol-points-table">
                <el-table-column prop="name" label="名称" width="200" show-overflow-tooltip />
                <el-table-column prop="patrolPoints" label="巡检点" min-width="300" show-overflow-tooltip />
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'running' ? 'success' : 'info'" size="small">
                      {{ row.status === 'running' ? '运行中' : '已停止' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="控制" width="120">
                  <template #default="{ row }">
                    <el-button v-if="row.status === 'stopped'" link type="primary" size="small">启动</el-button>
                    <el-button v-else link type="warning" size="small">停止</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small">编辑</el-button>
                    <el-button link type="danger" size="small">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-section">
                <el-pagination
                  v-model:current-page="patrolPagination.pageNum"
                  v-model:page-size="patrolPagination.pageSize"
                  :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 30, 50]"
                  :disabled="patrolLoading"
                  :background="true"
                  :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
                  :small="isMobile"
                  :total="patrolPagination.total"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      </div>
    </template>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Folder, Refresh, VideoCamera } from '@element-plus/icons-vue';
import { getVideoDeviceTree, getPresetList, ptzControl } from '@/api/video/presetPatrol';
import type { VideoDeviceTreeNode, PresetPosition } from '@/api/types/video/presetPatrol';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';

// 设备树
const deviceTree = ref<VideoDeviceTreeNode[]>([]);
const searchKeyword = ref('');
const treeProps = { children: 'children', label: 'name' };
const selectedCamera = ref<string>('');

// Tab
const activeTab = ref('info');

// 视频播放
const videoPlayerRef = ref<HTMLVideoElement>();
const currentPlayUrl = ref('');

// 预置位列表
const presetList = ref<PresetPosition[]>([]);
const loading = ref(false);
const pagination = ref({ pageNum: 1, pageSize: 10, total: 0 });

// 预置位巡检
const patrolForm = ref({ name: '', switchTime: 30, selectedPresets: [] as string[] });
const patrolList = ref<any[]>([]);
const patrolLoading = ref(false);
const patrolPagination = ref({ pageNum: 1, pageSize: 10, total: 0 });

// 移动端检测
const isMobile = ref(false);

/**
 * 加载设备树
 */
async function loadDeviceTree() {
  try {
    const data = await getVideoDeviceTree();
    deviceTree.value = data;
  } catch (error) {
    ElMessage.error('加载设备树失败');
    console.error('Failed to load device tree:', error);
  }
}

/**
 * 树节点点击
 */
function handleNodeClick(data: VideoDeviceTreeNode) {
  if (data.type === 'camera') {
    selectedCamera.value = data.id;
    loadPresetList();
    ElMessage.info(`已选择摄像头: ${data.name}`);
  }
}

/**
 * 加载预置位列表
 */
async function loadPresetList() {
  if (!selectedCamera.value) return;
  loading.value = true;
  try {
    const response = await getPresetList({
      cameraId: selectedCamera.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
    });
    presetList.value = response.list;
    pagination.value.total = response.total;
  } catch (error) {
    ElMessage.error('加载预置位列表失败');
    console.error('Failed to load preset list:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 云台控制
 */
async function handlePTZ(action: string) {
  if (!selectedCamera.value) {
    ElMessage.warning('请先选择摄像头');
    return;
  }
  try {
    await ptzControl({ cameraId: selectedCamera.value, action, speed: 5 });
    ElMessage.success(`云台控制: ${action}`);
  } catch (error) {
    ElMessage.error('云台控制失败');
    console.error('Failed to control PTZ:', error);
  }
}

/**
 * 云台控制停止
 */
function handlePTZStop() {
  // 停止云台控制
}

/**
 * 每页大小变更
 */
function handleSizeChange(val: number) {
  pagination.value.pageSize = val;
  loadPresetList();
}

/**
 * 页码变更
 */
function handleCurrentChange(val: number) {
  pagination.value.pageNum = val;
  loadPresetList();
}

/**
 * 检测是否为移动端
 */
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  loadDeviceTree();
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>

<style scoped lang="scss">
.device-tree-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 12px;
  }

  .tree-header {
    margin-bottom: 15px;
    
    .el-input {
      :deep(.el-input__wrapper) {
        background-color: rgba(10, 30, 50, 0.6);
        border-color: rgba(0, 212, 255, 0.3);
        
        .el-input__inner {
          color: rgba(255, 255, 255, 0.9);
          
          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
    
    .tree-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      flex-wrap: wrap;
      .el-button {
        font-size: 12px;
        padding: 5px 12px;
        min-width: 80px;
        color: rgba(255, 255, 255, 0.8);
        border-color: rgba(0, 212, 255, 0.4);
        background-color: rgba(0, 212, 255, 0.05);
        
        &:hover {
          color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          background-color: rgba(0, 212, 255, 0.15);
        }
      }
      
      @media (max-width: 768px) {
        gap: 8px;
        justify-content: flex-start;
        
        .el-button {
          font-size: 11px;
          padding: 4px 8px;
          min-width: 70px;
        }
      }
    }
  }

    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;

      .device-status {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        &.online {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }
        &.offline {
          background-color: var(--el-color-info-light-9);
          color: var(--el-color-info);
        }
      }
    }
  }

.content-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
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
        rgba(0, 180, 230, 1) 50%,
        rgba(0, 212, 255, 0.8) 100%
      );
    }
  }
  
  // Tabs 移动端适配
  :deep(.mobile-tabs) {
    @media (max-width: 768px) {
      .el-tabs__header {
        margin: 0 0 16px 0;
      }
      
      .el-tabs__nav-scroll {
        overflow-x: auto;
      }
      
      .el-tabs__item {
        padding: 0 16px;
        font-size: 14px;
      }
    }
  }

  .info-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 15px;
    height: 100%;
    
    .video-preview {
      grid-column: 1;
      grid-row: 1;
    }
    
    .ptz-control {
      grid-column: 2;
      grid-row: 1;
    }
    
    .preset-list {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    
    &.mobile-info-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 12px;
      height: auto;
      
      .video-preview,
      .ptz-control,
      .preset-list {
        grid-column: 1;
      }
      
      .video-preview {
        grid-row: 1;
      }
      
      .ptz-control {
        grid-row: 2;
      }
      
      .preset-list {
        grid-row: 3;
      }
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 12px;
      height: auto;
      
      .video-preview,
      .ptz-control,
      .preset-list {
        grid-column: 1;
      }
      
      .video-preview {
        grid-row: 1;
      }
      
      .ptz-control {
        grid-row: 2;
      }
      
      .preset-list {
        grid-row: 3;
      }
    }

        .video-preview {
        display: flex;
        flex-direction: column;
        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          
          span {
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
            font-size: 16px;
          }
          
          .el-button {
            border-color: rgba(0, 212, 255, 0.4);
            background: rgba(0, 212, 255, 0.1);
            color: var(--el-color-primary);
            
            &:hover {
              background: rgba(0, 212, 255, 0.2);
              border-color: var(--el-color-primary);
            }
          }
        }
        .video-player {
          flex: 1;
          background-color: #000;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          
          @media (max-width: 768px) {
            min-height: 180px;
          }
          
          .video-element {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .no-video {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            color: #fff;
            .el-icon {
              font-size: 48px;
            }
            
            @media (max-width: 768px) {
              gap: 8px;
              
              .el-icon {
                font-size: 36px;
              }
            }
          }
        }
      }

        .ptz-control {
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px;
        padding: 15px;
        background: rgba(10, 30, 50, 0.4);
        
        @media (max-width: 768px) {
          padding: 12px;
        }
        
        .control-header {
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
          padding-bottom: 10px;
          
          @media (max-width: 768px) {
            font-size: 14px;
            margin-bottom: 12px;
          }
        }
        .control-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          
          @media (max-width: 768px) {
            gap: 16px;
          }
          
          .direction-control {
            .direction-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              .dir-btn {
                width: 100%;
                height: 45px;
                font-weight: 600;
                font-size: 16px;
                border: 1px solid rgba(0, 212, 255, 0.5);
                background: rgba(0, 212, 255, 0.1);
                color: var(--el-color-primary);
                
                &:hover {
                  background: rgba(0, 212, 255, 0.2);
                  border-color: var(--el-color-primary);
                }
                
                &.center {
                  cursor: default;
                  background: rgba(0, 212, 255, 0.3);
                }
                
                @media (max-width: 768px) {
                  height: 40px;
                  font-size: 14px;
                }
              }
            }
          }
          .other-controls {
            display: flex;
            flex-direction: column;
            gap: 12px;
            .control-group {
              display: flex;
              gap: 12px;
              align-items: center;
              
              span {
                color: rgba(255, 255, 255, 0.8);
                font-weight: 500;
                min-width: 40px;
              }
              
              .el-button {
                min-width: 50px;
                border-color: rgba(0, 212, 255, 0.4);
                background: rgba(0, 212, 255, 0.1);
                color: var(--el-color-primary);
                
                &:hover {
                  background: rgba(0, 212, 255, 0.2);
                  border-color: var(--el-color-primary);
                }
                
                &:disabled {
                  opacity: 0.5;
                }
              }
              
              @media (max-width: 768px) {
                gap: 8px;
                
                .el-button {
                  font-size: 12px;
                  padding: 6px 12px;
                  min-width: 45px;
                }
              }
            }
          }
        }
        .control-operations {
          margin-top: 20px;
          border-top: 1px solid rgba(0, 212, 255, 0.2);
          padding-top: 15px;
          
          @media (max-width: 768px) {
            margin-top: 16px;
            padding-top: 12px;
          }
          
          .operations-header {
            font-weight: 600;
            margin-bottom: 12px;
            color: rgba(255, 255, 255, 0.9);
            
            @media (max-width: 768px) {
              font-size: 14px;
              margin-bottom: 10px;
            }
          }
          .operations-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            
            .el-button {
              width: 100%;
              min-height: 40px;
              border-color: rgba(0, 212, 255, 0.4);
              background: rgba(0, 212, 255, 0.1);
              color: var(--el-color-primary);
              font-weight: 500;
              
              &:hover:not(:disabled) {
                background: rgba(0, 212, 255, 0.2);
                border-color: var(--el-color-primary);
              }
              
              &:disabled {
                opacity: 0.4;
                color: rgba(255, 255, 255, 0.3);
                border-color: rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
              }
            }
            
            @media (max-width: 768px) {
              gap: 10px;
              
              .el-button {
                font-size: 13px;
                padding: 8px 16px;
                min-height: 36px;
              }
            }
          }
        }
      }

        .preset-list {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 8px;
          padding: 20px;
          background: rgba(10, 30, 50, 0.4);
          overflow: hidden; // 防止内容溢出
          
          @media (max-width: 768px) {
            padding: 16px;
          }
          
          // 添加标题
          &::before {
            content: "预置位列表";
            font-size: 16px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 15px;
            display: block;
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            padding-bottom: 10px;
          }
          
          .preset-table {
            flex: 1;
            margin-bottom: 15px;
            max-width: 100%;
            
            // 固定表格布局，防止列宽无限延伸
            :deep(.el-table__body-wrapper) {
              overflow-x: auto;
            }
            
            :deep(table) {
              table-layout: auto;
              width: 100% !important;
              max-width: 100%;
            }
            
            // 确保空状态时表格不会异常拉宽
            :deep(.el-table__empty-block) {
              width: 100% !important;
              min-height: 200px;
            }
            
            @media (max-width: 768px) {
              margin-bottom: 12px;
              
              :deep(.el-table__empty-block) {
                min-height: 150px;
              }
            }
          }
          
          .pagination-section {
            display: flex;
            justify-content: flex-end;
            
            @media (max-width: 768px) {
              justify-content: center;
            }
          }
        }
    }

    .patrol-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
      
      @media (max-width: 768px) {
        gap: 12px;
      }

      .patrol-form {
        padding: 20px;
        background: rgba(10, 30, 50, 0.4);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px;
        
        @media (max-width: 768px) {
          padding: 16px;
        }
        
        :deep(.el-form-item__label) {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        
        :deep(.el-input) {
          .el-input__wrapper {
            background-color: rgba(10, 30, 50, 0.6);
            border-color: rgba(0, 212, 255, 0.3);
            
            .el-input__inner {
              color: rgba(255, 255, 255, 0.9);
              
              &::placeholder {
                color: rgba(255, 255, 255, 0.5);
              }
            }
            
            &.is-focus {
              border-color: var(--el-color-primary);
              box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.2);
            }
          }
        }
        
        :deep(.el-input-number) {
          .el-input__wrapper {
            background-color: rgba(10, 30, 50, 0.6);
            border-color: rgba(0, 212, 255, 0.3);
            
            .el-input__inner {
              color: rgba(255, 255, 255, 0.9);
            }
          }
        }
        
        :deep(.el-select) {
          .el-select__wrapper {
            background-color: rgba(10, 30, 50, 0.6);
            border-color: rgba(0, 212, 255, 0.3);
            
            .el-select__placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            
            .el-select__selected-item {
              color: rgba(255, 255, 255, 0.9);
            }
            
            &.is-focused {
              border-color: var(--el-color-primary);
              box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.2);
            }
          }
        }
        
        .el-button {
          min-width: 100px;
          border-color: rgba(0, 212, 255, 0.4);
          background: rgba(0, 212, 255, 0.1);
          color: var(--el-color-primary);
          
          &:hover:not(:disabled) {
            background: rgba(0, 212, 255, 0.2);
            border-color: var(--el-color-primary);
          }
          
          &:disabled {
            opacity: 0.4;
            color: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
          }
          
          &--primary {
            background: var(--el-color-primary);
            border-color: var(--el-color-primary);
            color: #fff;
            
            &:hover:not(:disabled) {
              background: rgba(0, 212, 255, 0.8);
            }
            
            &:disabled {
              background: rgba(0, 212, 255, 0.3);
              border-color: rgba(0, 212, 255, 0.3);
            }
          }
        }

        .patrol-points-label {
          margin-top: 20px;
          font-weight: 600;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          border-top: 1px solid rgba(0, 212, 255, 0.2);
          padding-top: 15px;
          
          @media (max-width: 768px) {
            margin-top: 16px;
            font-size: 14px;
            padding-top: 12px;
          }
        }
      }

      .patrol-table {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: rgba(10, 30, 50, 0.4);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px;
        padding: 20px;
        overflow: hidden; // 防止内容溢出
        
        @media (max-width: 768px) {
          padding: 16px;
        }
        
        // 添加表格区域标题
        &::before {
          content: "巡检任务列表";
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 15px;
          display: block;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
          padding-bottom: 10px;
        }

        .patrol-points-table {
          flex: 1;
          margin-bottom: 15px;
          max-width: 100%;
          
          // 表格样式优化
          :deep(.el-table) {
            background: transparent;
            
            .el-table__header {
              th {
                background: rgba(0, 212, 255, 0.1);
                color: rgba(255, 255, 255, 0.9);
                border-color: rgba(0, 212, 255, 0.2);
                font-weight: 600;
              }
            }
            
            .el-table__body {
              tr {
                background: rgba(10, 30, 50, 0.2);
                
                &:hover {
                  background: rgba(0, 212, 255, 0.1) !important;
                }
                
                td {
                  color: rgba(255, 255, 255, 0.8);
                  border-color: rgba(0, 212, 255, 0.1);
                  
                  .el-button {
                    border-color: rgba(0, 212, 255, 0.4);
                    
                    &--primary {
                      color: var(--el-color-primary);
                    }
                    
                    &--warning {
                      color: var(--el-color-warning);
                    }
                  }
                }
              }
            }
          }
          
          // 固定表格布局，防止列宽无限延伸
          :deep(.el-table__body-wrapper) {
            overflow-x: auto;
          }
          
          :deep(table) {
            table-layout: auto;
            width: 100% !important;
            max-width: 100%;
          }
          
          // 确保空状态时表格不会异常拉宽
          :deep(.el-table__empty-block) {
            width: 100% !important;
            min-height: 200px;
            background: rgba(10, 30, 50, 0.2);
            color: rgba(255, 255, 255, 0.6);
          }
          
          @media (max-width: 768px) {
            margin-bottom: 12px;
            
            :deep(.el-table__empty-block) {
              min-height: 150px;
            }
          }
        }

        .pagination-section {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid rgba(0, 212, 255, 0.2);
          padding-top: 15px;
          
          @media (max-width: 768px) {
            justify-content: center;
            padding-top: 12px;
          }
        }
      }
    }
  }
</style>
