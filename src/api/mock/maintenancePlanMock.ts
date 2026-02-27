/**
 * 运维计划 Mock 数据
 * @description 提供运维计划功能的模拟数据
 */

import type {
  MaintenancePlan,
  WorkOrderType,
  User,
  Station,
  MaintenancePlanBasicDataResponse,
  MaintenancePlanListResponse,
} from '../types/maintenance-plan'

/**
 * 工单类型数据
 */
export const mockWorkOrderTypes: WorkOrderType[] = [
  {
    value: '检修工单',
    label: '检修工单',
    icon: 'repair',
    color: '#e74c3c',
  },
  {
    value: '维护工单',
    label: '维护工单',
    icon: 'maintenance',
    color: '#3498db',
  },
  {
    value: '巡检工单',
    label: '巡检工单',
    icon: 'inspection',
    color: '#f39c12',
  },
  {
    value: '清洁工单',
    label: '清洁工单',
    icon: 'cleaning',
    color: '#27ae60',
  },
  {
    value: '其他工单',
    label: '其他工单',
    icon: 'other',
    color: '#9b59b6',
  },
]

/**
 * 用户数据
 */
export const mockUsers: User[] = [
  {
    id: 'user001',
    name: '张三',
    role: '维护主管',
    department: '运维部',
  },
  {
    id: 'user002',
    name: '李四',
    role: '技术员',
    department: '运维部',
  },
  {
    id: 'user003',
    name: '王五',
    role: '审批员',
    department: '管理部',
  },
  {
    id: 'supervisor001',
    name: '运维主管',
    role: '主管',
    department: '运维部',
  },
]

/**
 * 电站数据
 */
export const mockStations: Station[] = [
  {
    id: 'LHYR98NH00000014',
    name: '芜湖城南污水厂',
    capacity: '50MW',
    status: 'online',
  },
  {
    id: 'LHYR98NH00000003',
    name: '亳州利辛县城污水厂',
    capacity: '30MW',
    status: 'online',
  },
  {
    id: 'LHYR98NH00000008',
    name: '宿州市第二污水厂',
    capacity: '40MW',
    status: 'online',
  },
]

/**
 * 运维计划数据
 */
export const mockMaintenancePlans: MaintenancePlan[] = [
  {
    id: 'plan001',
    planName: '季度设备检修计划',
    planStatus: '进行中',
    statusColor: '#3498db',
    workOrderType: '检修工单',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    firstStartTime: '2025-10-21 08:00:00',
    nextStartTime: '2025-11-21 08:00:00',
    cycleType: '月',
    cycleEndTime: '2025-12-31 23:59:59',
    updater: '张三',
    updaterId: 'user001',
    updateTime: '2025-10-21 15:20:00',
    createTime: '2025-10-01 09:00:00',
    workOrderLevel: '重要',
    workOrderDescription: '对电站主要设备进行季度检修，包括逆变器、变压器、开关设备等',
    isEnabled: true,
    approver: '王五',
    approverId: 'user003',
    processor: '张三',
    processorId: 'user001',
    otherProcessors: ['李四'],
    otherProcessorIds: ['user002'],
    firstEndTime: '2025-10-21 18:00:00',
    processingAdvice: '检修期间注意安全操作，确保设备断电后再进行维护',
    attachments: ['检修计划书.pdf', '安全操作规程.pdf'],
    workOrderObjects: [
      {
        id: 'obj001',
        serialNumber: 1,
        stationId: 'LHYR98NH00000014',
        stationName: '芜湖城南污水厂',
        objectDescription: '1#逆变器设备检修',
      },
      {
        id: 'obj002',
        serialNumber: 2,
        stationId: 'LHYR98NH00000014',
        stationName: '芜湖城南污水厂',
        objectDescription: '主变压器设备检修',
      },
    ],
  },
  {
    id: 'plan002',
    planName: '日常清洁维护',
    planStatus: '已完成',
    statusColor: '#27ae60',
    workOrderType: '清洁工单',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    firstStartTime: '2025-10-01 06:00:00',
    nextStartTime: '',
    cycleType: '周',
    cycleEndTime: '2025-10-20 23:59:59',
    updater: '李四',
    updaterId: 'user002',
    updateTime: '2025-10-20 18:30:00',
    createTime: '2025-09-25 10:00:00',
    workOrderLevel: '常规',
    workOrderDescription: '定期清洁光伏组件表面，清除积尘和污垢，提高发电效率',
    isEnabled: false,
    processor: '李四',
    processorId: 'user002',
    firstEndTime: '2025-10-01 16:00:00',
    processingAdvice: '清洁时避开高温时段，使用专用清洁工具和清洁剂',
    attachments: ['清洁作业指导书.pdf'],
    workOrderObjects: [
      {
        id: 'obj003',
        serialNumber: 1,
        stationId: 'LHYR98NH00000014',
        stationName: '芜湖城南污水厂',
        objectDescription: 'A区光伏组件清洁',
      },
      {
        id: 'obj004',
        serialNumber: 2,
        stationId: 'LHYR98NH00000014',
        stationName: '芜湖城南污水厂',
        objectDescription: 'B区光伏组件清洁',
      },
    ],
  },
  {
    id: 'plan003',
    planName: '月度巡检计划',
    planStatus: '进行中',
    statusColor: '#3498db',
    workOrderType: '巡检工单',
    stationName: '亳州利辛县城污水厂',
    stationId: 'LHYR98NH00000003',
    firstStartTime: '2025-10-01 09:00:00',
    nextStartTime: '2025-11-01 09:00:00',
    cycleType: '月',
    cycleEndTime: '2025-12-31 23:59:59',
    updater: '张三',
    updaterId: 'user001',
    updateTime: '2025-10-21 10:15:00',
    createTime: '2025-09-28 14:00:00',
    workOrderLevel: '常规',
    workOrderDescription: '每月定期巡检电站设备运行状态，记录设备参数和异常情况',
    isEnabled: true,
    approver: '运维主管',
    approverId: 'supervisor001',
    processor: '张三',
    processorId: 'user001',
    firstEndTime: '2025-10-01 17:00:00',
    processingAdvice: '巡检时携带检测仪器，详细记录设备运行数据',
    attachments: ['巡检清单.xlsx', '设备参数表.pdf'],
    workOrderObjects: [
      {
        id: 'obj005',
        serialNumber: 1,
        stationId: 'LHYR98NH00000003',
        stationName: '亳州利辛县城污水厂',
        objectDescription: '全站设备巡检',
      },
    ],
  },
  {
    id: 'plan004',
    planName: '年度维护保养',
    planStatus: '暂停',
    statusColor: '#e67e22',
    workOrderType: '维护工单',
    stationName: '宿州市第二污水厂',
    stationId: 'LHYR98NH00000008',
    firstStartTime: '2025-11-01 08:00:00',
    nextStartTime: '2026-11-01 08:00:00',
    cycleType: '年',
    cycleEndTime: '2028-12-31 23:59:59',
    updater: '王五',
    updaterId: 'user003',
    updateTime: '2025-10-20 16:45:00',
    createTime: '2025-10-15 11:00:00',
    workOrderLevel: '重要',
    workOrderDescription: '年度设备维护保养，包括设备润滑、紧固、校准等工作',
    isEnabled: false,
    approver: '王五',
    approverId: 'user003',
    processor: '李四',
    processorId: 'user002',
    otherProcessors: ['张三'],
    otherProcessorIds: ['user001'],
    firstEndTime: '2025-11-01 18:00:00',
    processingAdvice: '维护期间需要停机作业，提前做好发电量损失评估',
    attachments: ['年度维护计划.pdf', '设备维护手册.pdf'],
    workOrderObjects: [
      {
        id: 'obj006',
        serialNumber: 1,
        stationId: 'LHYR98NH00000008',
        stationName: '宿州市第二污水厂',
        objectDescription: '主要设备年度维护',
      },
    ],
  },
  {
    id: 'plan005',
    planName: '应急检修预案',
    planStatus: '已取消',
    statusColor: '#95a5a6',
    workOrderType: '检修工单',
    stationName: '芜湖城南污水厂',
    stationId: 'LHYR98NH00000014',
    firstStartTime: '2025-09-15 00:00:00',
    nextStartTime: '',
    cycleType: '',
    cycleEndTime: '',
    updater: '运维主管',
    updaterId: 'supervisor001',
    updateTime: '2025-10-10 14:20:00',
    createTime: '2025-09-10 16:30:00',
    workOrderLevel: '紧急',
    workOrderDescription: '设备故障应急检修预案，用于突发设备故障时的快速响应',
    isEnabled: false,
    processor: '张三',
    processorId: 'user001',
    otherProcessors: ['李四'],
    otherProcessorIds: ['user002'],
    firstEndTime: '2025-09-15 23:59:59',
    processingAdvice: '应急检修时优先保证人员安全，快速恢复设备运行',
    attachments: ['应急预案.pdf'],
    workOrderObjects: [
      {
        id: 'obj007',
        serialNumber: 1,
        stationId: 'LHYR98NH00000014',
        stationName: '芜湖城南污水厂',
        objectDescription: '故障设备应急检修',
      },
    ],
  },
]

/**
 * 基础数据
 */
export const mockBasicData: MaintenancePlanBasicDataResponse = {
  workOrderTypes: mockWorkOrderTypes,
  users: mockUsers,
  stations: mockStations,
  planStatuses: [
    { label: '进行中', value: '进行中', color: '#3498db' },
    { label: '已完成', value: '已完成', color: '#27ae60' },
    { label: '暂停', value: '暂停', color: '#e67e22' },
    { label: '已取消', value: '已取消', color: '#95a5a6' },
  ],
  cycleTypes: [
    { label: '日', value: '日' },
    { label: '周', value: '周' },
    { label: '月', value: '月' },
    { label: '季度', value: '季度' },
    { label: '年', value: '年' },
  ],
  workOrderLevels: [
    { label: '常规', value: '常规', color: '#3498db' },
    { label: '重要', value: '重要', color: '#f39c12' },
    { label: '紧急', value: '紧急', color: '#e74c3c' },
  ],
}

/**
 * 运维计划列表数据
 */
export const mockMaintenancePlanListData: MaintenancePlanListResponse = {
  maintenancePlans: mockMaintenancePlans,
  pagination: {
    current: 1,
    pageSize: 20,
    total: mockMaintenancePlans.length,
    totalPages: Math.ceil(mockMaintenancePlans.length / 20),
  },
}
