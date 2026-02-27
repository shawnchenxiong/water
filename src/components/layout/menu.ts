export const pvMenuList = [
  {
    id: 'pv-dashboard',
    name: '综合信息',
    path: '/pv/dashboard'
  },
  {
    id: 'pv-monitor',
    name: '工艺流程',
    children: [
      { id: 'pv-process-pre-treatment', name: '预处理', path: '/pv/monitor/pre-treatment' },
      { id: 'pv-process-stage1-aao', name: 'I段AAO', path: '/pv/monitor/stage1-aao' },
      { id: 'pv-process-secondary-clarifier', name: '二沉池及出水', path: '/pv/monitor/secondary-clarifier' },
      { id: 'pv-process-sludge-dewatering', name: '污泥脱水', path: '/pv/monitor/sludge-dewatering' },
      { id: 'pv-process-high-eff-sedimentation', name: '高效沉淀池', path: '/pv/monitor/high-eff-sedimentation' },
      { id: 'pv-process-denitrification-filter', name: '反硝化深床滤池', path: '/pv/monitor/denitrification-filter' },
      { id: 'pv-process-dosing-system', name: '加药系统', path: '/pv/monitor/dosing-system' },
      { id: 'pv-process-stage2-aao', name: 'II段AAO', path: '/pv/monitor/stage2-aao' },
      { id: 'pv-process-blower-room', name: '鼓风机房', path: '/pv/monitor/blower-room' },
    ],
  },
  {
    id: 'pv-analysis',
    name: '趋势分析',
    children: [
      { id: 'pv-data-trend-query', name: '数据趋势查询', path: '/pv/analysis/data-trend-query' },
      { id: 'pv-energy-consumption', name: '能耗数据分析', path: '/pv/analysis/energy-consumption' },
    ],
  },
  {
    id: 'pv-diagnosis',
    name: '告警分析',
    children: [
      { id: 'pv-alarm-overview', name: '告警概览', path: '/pv/diagnosis/alarm-overview' },
      { id: 'pv-alarm-realtime', name: '实时告警', path: '/pv/diagnosis/alarm-realtime' },
      { id: 'pv-alarm-history', name: '历史告警', path: '/pv/diagnosis/alarm-history' },
      { id: 'pv-alarm-rules', name: '告警规则', path: '/pv/diagnosis/alarm-rules' },
      { id: 'pv-alarm-statistics', name: '告警统计', path: '/pv/diagnosis/alarm-statistics' },
    ],
  },
  {
    id: 'pv-maintenance',
    name: '报表查询',
    children: [
      { id: 'pv-report-statistics', name: '统计报表', path: '/pv/report/statistics' },
      { id: 'pv-report-custom', name: '自定义报表', path: '/pv/report/custom' },
    ],
  },
  {
    id: 'pv-user-management',
    name: '用户管理',
    path: '/pv/user-management'
  },
  {
    id: 'pv-system-management',
    name: '系统管理',
    children: [
      { id: 'pv-sys-message-center', name: '消息中心', path: '/pv/system/message-center' },
      { id: 'pv-sys-notifications', name: '通知管理', path: '/pv/system/notifications' },
      { id: 'pv-sys-settings', name: '系统设置', path: '/pv/system/settings' },
      { id: 'pv-sys-operation-log', name: '操作记录', path: '/pv/system/operation-log' },
    ],
  },
]

export const esMenuList = [
  {
    id: 'es-dashboard',
    name: '综合信息',
    path: '/es/dashboard'
  },
  {
    id: 'es-monitor',
    name: '工艺流程',
    children: [
      { id: 'es-station-overview', name: '电站概览', path: '/es/monitor/station-overview' },
      { id: 'es-electrical-monitor', name: '电气监视', path: '/es/monitor/electrical' },
      {
        id: 'es-device-monitor',
        name: '设备监视',
        children: [
          { id: 'es-battery-overview', name: '电池总览', path: '/es/monitor/device/battery-overview' },
          { id: 'es-battery-array', name: '电池阵列', path: '/es/monitor/device/battery-array' },
          { id: 'es-battery-cluster', name: '电池簇', path: '/es/monitor/device/battery-cluster' },
          { id: 'es-battery-module', name: '电池模块', path: '/es/monitor/device/battery-module' },
          { id: 'es-pcs', name: 'PCS', path: '/es/monitor/device/pcs' },
          { id: 'es-box-transformer', name: '箱变', path: '/es/monitor/device/box-transformer' },
          { id: 'es-electric-meter', name: '电能表', path: '/es/monitor/device/electric-meter' },
          { id: 'es-secondary-equipment', name: '二次设备', path: '/es/monitor/device/secondary-equipment' },
        ]
      },
      {
        id: 'es-ai-monitor',
        name: 'AI监视',
        children: [
          { id: 'es-ai-recognition-result', name: 'AI识别结果', path: '/es/monitor/ai/recognition-result' }
        ]
      },
      {
        id: 'es-video-monitor',
        name: '视频监视',
        children: [
          { id: 'es-video-browsing', name: '视频浏览', path: '/es/monitor/video/browsing' },
          { id: 'es-video-query', name: '录像查询', path: '/es/monitor/video/query' },
          { id: 'es-video-playback', name: '录像回放', path: '/es/monitor/video/playback' },
          { id: 'es-video-patrol', name: '视频巡检', path: '/es/monitor/video/patrol' },
          { id: 'es-preset-patrol', name: '预置位巡检', path: '/es/monitor/video/preset-patrol' },
        ]
      }
    ]
  },
  {
    id: 'es-analysis',
    name: '智能分析',
    children: [
      { id: 'es-backward-cell', name: '落后单体分析', path: '/es/analysis/backward-cell' },
      { id: 'es-statistics-report', name: '统计报表', path: '/es/analysis/statistics-report' }
    ]
  },
  {
    id: 'es-alarm',
    name: '智能告警',
    children: [
      { id: 'es-alarm-overview', name: '告警概览', path: '/es/alarm/overview' },
      { id: 'es-realtime-alarm', name: '实时告警', path: '/es/alarm/realtime' },
      { id: 'es-history-alarm', name: '历史告警', path: '/es/alarm/history' },
      { id: 'es-alarm-shield', name: '告警屏蔽', path: '/es/alarm/shield' },
      { id: 'es-fault-library', name: '故障库', path: '/es/alarm/fault-library' }
    ]
  },
  {
    id: 'es-maintenance',
    name: '智能运维',
    children: [
      {
        id: 'es-ai-patrol',
        name: 'AI巡检',
        children: [
          { id: 'es-ai-patrol-monitor', name: '巡检监控', path: '/es/maintenance/ai-patrol/monitor' },
          { id: 'es-ai-patrol-records', name: '巡检记录', path: '/es/maintenance/ai-patrol/records' },
          { id: 'es-ai-patrol-tasks', name: '任务管理', path: '/es/maintenance/ai-patrol/tasks' }
        ]
      },
      {
        id: 'es-mobile-patrol',
        name: '移动巡检',
        children: [
          { id: 'es-mobile-patrol-records', name: '巡检记录', path: '/es/maintenance/mobile-patrol/records' },
          { id: 'es-mobile-patrol-issues', name: '巡检问题', path: '/es/maintenance/mobile-patrol/issues' },
          { id: 'es-mobile-patrol-statistics', name: '巡检统计', path: '/es/maintenance/mobile-patrol/statistics' }
        ]
      },
      { id: 'es-defect-management', name: '缺陷管理', path: '/es/maintenance/defect-management' },
      { id: 'es-maintenance-plan', name: '运维计划', path: '/es/maintenance/plan' },
      { id: 'es-work-order', name: '工单管理', path: '/es/maintenance/work-order' },
      { id: 'es-knowledge-base', name: '知识库', path: '/es/maintenance/knowledge-base' }
    ]
  }
];