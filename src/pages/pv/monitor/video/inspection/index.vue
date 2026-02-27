<template>
  <DeviceMonitorLayout>
    <!-- 左侧：任务管理 -->
    <template #left>
      <div class="left-section">
        <div class="header">
          <h3>视频巡检</h3>
        </div>
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="输入关键字进行搜索"
            clearable
            @input="handleSearch"
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleAddTask" style="margin-top: 10px; width: 100%;">
            <el-icon><Plus /></el-icon>
            新增巡检
          </el-button>
        </div>
        <div class="task-list">
          <div class="task-list-header">
            <span>任务名称</span>
            <span>操作</span>
          </div>
          <el-scrollbar v-if="taskList.length > 0">
            <div
              v-for="task in taskList"
              :key="task.id"
              class="task-item"
              :class="{ active: currentTask?.id === task.id }"
            >
              <div class="task-info">
                <div class="task-name">
                  <el-tag :type="getStatusType(task.status)" size="small">
                    {{ getStatusText(task.status) }}
                  </el-tag>
                  <span>{{ task.taskName }}</span>
                </div>
                <div class="task-meta">
                  <span>{{ task.cameraCount }} 个摄像头</span>
                  <span>{{ task.playDuration }}秒/个</span>
                </div>
              </div>
              <div class="task-actions">
                <el-button
                  v-if="task.status === 'stopped'"
                  link
                  type="primary"
                  size="small"
                  @click="handleStartTask(task)"
                >
                  启动
                </el-button>
                <el-button
                  v-else
                  link
                  type="warning"
                  size="small"
                  @click="handleStopTask(task)"
                >
                  停止
                </el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  :disabled="task.status !== 'stopped'"
                  @click="handleEditTask(task)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  size="small"
                  :disabled="task.status !== 'stopped'"
                  @click="handleDeleteTask(task)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </el-scrollbar>
          <el-empty v-else description="暂无数据" />
        </div>
      </div>
    </template>

    <!-- 右侧：视频播放 -->
    <template #right>
      <div class="right-section">
        <div class="video-player-section">
          <div v-if="!currentTask" class="no-task">
            <el-icon><VideoCamera /></el-icon>
            <span>请选择或启动一个巡检任务</span>
          </div>
          <template v-else>
            <!-- 播放信息 -->
            <div class="play-info">
              <span class="task-name">{{ currentTask.taskName }}</span>
              <span class="camera-info">
                {{ currentCameraIndex + 1 }} / {{ currentTask.cameras.length }} -
                {{ currentTask.cameras[currentCameraIndex]?.cameraName }}
              </span>
              <span class="remaining-time">
                剩余 {{ remainingTime }}秒
              </span>
            </div>

            <!-- 视频播放器 -->
            <div class="video-player">
              <video
                ref="videoPlayerRef"
                class="video-element"
                controls
                autoplay
              >
                <source :src="currentPlayUrl" type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            </div>

            <!-- 进度条 -->
            <div class="progress-bar">
              <div
                v-for="(camera, index) in currentTask.cameras"
                :key="camera.cameraId"
                class="progress-item"
                :class="{ active: index === currentCameraIndex }"
                :style="{ width: `${100 / currentTask.cameras.length}%` }"
                @click="handleJumpToCamera(index)"
              >
                <span>{{ index + 1 }}</span>
              </div>
            </div>

            <!-- 控制栏 -->
            <div class="control-bar">
              <el-button @click="handleRecord">
                <el-icon><VideoCameraFilled /></el-icon>
                录像
              </el-button>
              <el-button @click="handleSubStream">
                <el-icon><Monitor /></el-icon>
                子码流
              </el-button>
              <el-button @click="handleCapture">
                <el-icon><Crop /></el-icon>
                截图
              </el-button>
              <el-button @click="handleStopTask(currentTask)">
                <el-icon><VideoPause /></el-icon>
                停止
              </el-button>
              <el-button @click="handleFullscreen">
                <el-icon><FullScreen /></el-icon>
                全屏
              </el-button>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- 新增/编辑任务弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑巡检任务' : '新增巡检任务'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskFormRules"
        label-width="120px"
      >
        <el-form-item label="任务名称" prop="taskName">
          <el-input
            v-model="taskForm.taskName"
            placeholder="请输入任务名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            placeholder="请输入任务描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="巡检设备" prop="selectedCameras">
          <el-button @click="deviceSelectVisible = true">选择设备</el-button>
          <span style="margin-left: 10px; color: var(--el-text-color-secondary);">
            已选 {{ taskForm.selectedCameras.length }} 个摄像头
          </span>
          <div v-if="taskForm.selectedCameras.length > 0" class="selected-cameras">
            <el-tag
              v-for="(camera, index) in taskForm.selectedCameras"
              :key="camera.id"
              closable
              @close="handleRemoveCamera(index)"
            >
              {{ camera.name }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="播放时长" prop="playDuration">
          <el-input-number
            v-model="taskForm.playDuration"
            :min="5"
            :max="60"
            :step="5"
          />
          <span style="margin-left: 10px;">秒</span>
        </el-form-item>
        <el-form-item label="巡检次数" prop="loopMode">
          <el-radio-group v-model="taskForm.loopMode">
            <el-radio label="loop">循环播放</el-radio>
            <el-radio label="count">播放</el-radio>
          </el-radio-group>
          <el-input-number
            v-if="taskForm.loopMode === 'count'"
            v-model="taskForm.loopCount"
            :min="1"
            :max="100"
            style="margin-left: 10px;"
          />
          <span v-if="taskForm.loopMode === 'count'" style="margin-left: 10px;">次</span>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="taskForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 设备选择器弹窗 -->
    <el-dialog
      v-model="deviceSelectVisible"
      title="选择巡检设备"
      width="500px"
    >
      <el-tree
        ref="deviceTreeRef"
        :data="deviceTree"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
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
      <template #footer>
        <el-button @click="deviceSelectVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmDevices">确定</el-button>
      </template>
    </el-dialog>
  </DeviceMonitorLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox, ElTree, FormInstance, FormRules } from 'element-plus';
import {
  Search,
  Plus,
  VideoCamera,
  VideoCameraFilled,
  Monitor,
  Crop,
  VideoPause,
  FullScreen,
} from '@element-plus/icons-vue';
import {
  getVideoDeviceTree,
  getTaskList,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  stopTask,
} from '@/api/video/inspection';
import type {
  InspectionTask,
  VideoDeviceTreeNode,
  TaskForm,
  TaskStatus,
} from '@/api/types/video/inspection';
import DeviceMonitorLayout from '@/components/layout/DeviceMonitorLayout.vue';

// 搜索
const searchKeyword = ref('');

// 移动端检测
const isMobile = ref(false);

// 任务列表
const taskList = ref<InspectionTask[]>([]);
const currentTask = ref<InspectionTask | null>(null);
const loading = ref(false);

// 视频播放
const videoPlayerRef = ref<HTMLVideoElement>();
const currentCameraIndex = ref(0);
const remainingTime = ref(0);
const currentPlayUrl = ref('');
let playTimer: number | null = null;

// 设备树
const deviceTree = ref<VideoDeviceTreeNode[]>([]);
const deviceTreeRef = ref<InstanceType<typeof ElTree>>();
const treeProps = {
  children: 'children',
  label: 'name',
};

// 弹窗
const dialogVisible = ref(false);
const deviceSelectVisible = ref(false);
const isEdit = ref(false);
const taskFormRef = ref<FormInstance>();
const taskForm = ref<TaskForm>({
  taskName: '',
  description: '',
  selectedCameras: [],
  playDuration: 10,
  loopMode: 'loop',
  loopCount: 1,
  enabled: true,
});

const taskFormRules: FormRules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  selectedCameras: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value.length === 0) {
          callback(new Error('请至少选择一个摄像头'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
  ],
};

/**
 * 加载任务列表
 */
async function loadTaskList() {
  loading.value = true;
  try {
    const response = await getTaskList({
      keyword: searchKeyword.value,
      pageNum: 1,
      pageSize: 100,
    });
    taskList.value = response.list;
  } catch (error) {
    ElMessage.error('加载任务列表失败');
    console.error('Failed to load task list:', error);
  } finally {
    loading.value = false;
  }
}

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
 * 搜索
 */
function handleSearch() {
  loadTaskList();
}

/**
 * 新增任务
 */
function handleAddTask() {
  isEdit.value = false;
  taskForm.value = {
    taskName: '',
    description: '',
    selectedCameras: [],
    playDuration: 10,
    loopMode: 'loop',
    loopCount: 1,
    enabled: true,
  };
  dialogVisible.value = true;
}

/**
 * 编辑任务
 */
function handleEditTask(task: InspectionTask) {
  isEdit.value = true;
  taskForm.value = {
    id: task.id,
    taskName: task.taskName,
    description: task.description,
    selectedCameras: task.cameras.map((c) => ({
      id: c.cameraId,
      name: c.cameraName,
      type: 'camera' as const,
    })),
    playDuration: task.playDuration,
    loopMode: task.loopCount === 0 ? 'loop' : 'count',
    loopCount: task.loopCount || 1,
    enabled: task.enabled,
  };
  dialogVisible.value = true;
}

/**
 * 删除任务
 */
async function handleDeleteTask(task: InspectionTask) {
  try {
    await ElMessageBox.confirm(
      `确定要删除巡检任务"${task.taskName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deleteTask({ id: task.id });
    ElMessage.success('删除成功');
    loadTaskList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('Failed to delete task:', error);
    }
  }
}

/**
 * 启动任务
 */
async function handleStartTask(task: InspectionTask) {
  try {
    const response = await startTask({ id: task.id });
    currentTask.value = {
      ...task,
      cameras: response.cameras,
      status: 'running',
    };
    currentCameraIndex.value = 0;
    remainingTime.value = task.playDuration;

    // 开始播放第一个摄像头
    playCamera(0);

    // 更新任务列表状态
    loadTaskList();

    ElMessage.success(`巡检任务"${task.taskName}"已启动`);
  } catch (error) {
    ElMessage.error('启动任务失败');
    console.error('Failed to start task:', error);
  }
}

/**
 * 停止任务
 */
async function handleStopTask(task: InspectionTask) {
  try {
    await stopTask({ id: task.id });
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    currentTask.value = null;
    currentCameraIndex.value = 0;
    remainingTime.value = 0;
    currentPlayUrl.value = '';

    // 更新任务列表状态
    loadTaskList();

    ElMessage.success(`巡检任务"${task.taskName}"已停止`);
  } catch (error) {
    ElMessage.error('停止任务失败');
    console.error('Failed to stop task:', error);
  }
}

/**
 * 播放摄像头
 */
function playCamera(index: number) {
  if (!currentTask.value) return;

  currentCameraIndex.value = index;
  const camera = currentTask.value.cameras[index];
  currentPlayUrl.value = camera.playUrl || '';
  remainingTime.value = currentTask.value.playDuration;

  // 清除旧定时器
  if (playTimer) {
    clearInterval(playTimer);
  }

  // 启动新定时器
  playTimer = window.setInterval(() => {
    remainingTime.value -= 1;

    if (remainingTime.value <= 0) {
      // 切换到下一个摄像头
      let nextIndex = currentCameraIndex.value + 1;
      if (nextIndex >= currentTask.value!.cameras.length) {
        nextIndex = 0;
      }
      playCamera(nextIndex);
    }
  }, 1000);
}

/**
 * 跳转到指定摄像头
 */
function handleJumpToCamera(index: number) {
  playCamera(index);
}

/**
 * 录像
 */
function handleRecord() {
  ElMessage.info('开始录制当前视频');
}

/**
 * 子码流
 */
function handleSubStream() {
  ElMessage.info('切换子码流');
}

/**
 * 截图
 */
function handleCapture() {
  ElMessage.info('截图成功');
}

/**
 * 全屏
 */
function handleFullscreen() {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.requestFullscreen();
  }
}

/**
 * 确认选择设备
 */
function handleConfirmDevices() {
  const checkedNodes = deviceTreeRef.value?.getCheckedNodes() as VideoDeviceTreeNode[];
  const cameras = checkedNodes.filter((node) => node.type === 'camera');
  taskForm.value.selectedCameras = cameras;
  deviceSelectVisible.value = false;
}

/**
 * 移除摄像头
 */
function handleRemoveCamera(index: number) {
  taskForm.value.selectedCameras.splice(index, 1);
}

/**
 * 提交表单
 */
async function handleSubmit() {
  if (!taskFormRef.value) return;

  try {
    await taskFormRef.value.validate();

    const params = {
      taskName: taskForm.value.taskName,
      description: taskForm.value.description,
      cameraIds: taskForm.value.selectedCameras.map((c) => c.id),
      playDuration: taskForm.value.playDuration,
      loopCount: taskForm.value.loopMode === 'loop' ? 0 : taskForm.value.loopCount,
      enabled: taskForm.value.enabled,
    };

    if (isEdit.value) {
      await updateTask({
        ...params,
        id: taskForm.value.id!,
      });
      ElMessage.success('更新成功');
    } else {
      await createTask(params);
      ElMessage.success('创建成功');
    }

    dialogVisible.value = false;
    loadTaskList();
  } catch (error) {
    console.error('Failed to submit:', error);
  }
}

/**
 * 关闭弹窗
 */
function handleDialogClose() {
  taskFormRef.value?.resetFields();
}

/**
 * 获取状态类型
 */
function getStatusType(status: TaskStatus) {
  const map = {
    running: 'success',
    stopped: 'info',
    paused: 'warning',
  };
  return map[status] || 'info';
}

/**
 * 获取状态文本
 */
function getStatusText(status: TaskStatus) {
  const map = {
    running: '运行中',
    stopped: '已停止',
    paused: '已暂停',
  };
  return map[status] || '未知';
}

/**
 * 检测是否为移动端
 */
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  loadTaskList();
  loadDeviceTree();
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
});
</script>

<style scoped lang="scss">
.left-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 12px;
  }

  .header {
    margin-bottom: 15px;
    h3 {
      margin: 0;
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);
      
      @media (max-width: 768px) {
        font-size: 16px;
      }
    }
  }

  .search-section {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .task-list {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .task-list-header {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-weight: bold;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);
      margin-bottom: 10px;
    }

    .el-scrollbar {
      flex: 1;
    }

    .task-item {
      padding: 15px;
      margin-bottom: 10px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover,
      &.active {
        background-color: var(--el-fill-color-light);
        border-color: var(--el-color-primary);
      }

      .task-info {
        margin-bottom: 10px;

        .task-name {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .task-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }

      .task-actions {
        display: flex;
        gap: 5px;
        justify-content: flex-end;
        flex-wrap: wrap;
        
        @media (max-width: 768px) {
          gap: 4px;
          
          .el-button {
            font-size: 12px;
            padding: 4px 8px;
          }
        }
      }
    }
  }
}

.right-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 12px;
  }

  .video-player-section {
    height: 100%;
    display: flex;
    flex-direction: column;

    .no-task {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 15px;
      color: var(--el-text-color-secondary);
      font-size: 18px;

      .el-icon {
        font-size: 64px;
      }
    }

    .play-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;
      margin-bottom: 15px;

      .task-name {
        font-weight: 500;
        font-size: 16px;
      }

      .camera-info {
        color: var(--el-text-color-secondary);
      }

      .remaining-time {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }

    .video-player {
      flex: 1;
      background-color: #000;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 15px;

      .video-element {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .progress-bar {
      display: flex;
      height: 40px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 15px;

      .progress-item {
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid var(--el-border-color);
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: var(--el-color-primary-light-7);
        }

        &.active {
          background-color: var(--el-color-primary);
          color: #fff;
          font-weight: 500;
        }

        &:last-child {
          border-right: none;
        }
      }
    }

    .control-bar {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      
      @media (max-width: 768px) {
        gap: 8px;
        
        .el-button {
          font-size: 12px;
          padding: 6px 12px;
        }
      }
    }
  }
}

.selected-cameras {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
</style>