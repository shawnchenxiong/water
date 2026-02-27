/**
 * 鹤问湖二期工厂路由 - 复用一期页面组件，共享同一套框架
 * 路由名称以 Es 前缀区分，路径 /es/... 对应二期
 */
export const esRouter = {
  path: '/es',
  component: () => import('@/components/layout/MainLayout.vue'),
  redirect: '/es/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'EsDashboard',
      component: () => import('@/pages/pv/dashboard/index.vue'),
      meta: { title: '综合信息', requiresAuth: true, breadcrumb: ['综合信息'] },
    },
    // 工艺流程模块
    {
      path: 'monitor/pre-treatment',
      name: 'EsProcessPreTreatment',
      component: () => import('@/pages/pv/monitor/pre-treatment/index.vue'),
      meta: { title: '预处理', requiresAuth: true, breadcrumb: ['工艺流程', '预处理'] },
    },
    {
      path: 'monitor/stage1-aao',
      name: 'EsProcessStage1AAO',
      component: () => import('@/pages/pv/monitor/stage1-aao/index.vue'),
      meta: { title: 'I段AAO', requiresAuth: true, breadcrumb: ['工艺流程', 'I段AAO'] },
    },
    {
      path: 'monitor/secondary-clarifier',
      name: 'EsProcessSecondaryClarifier',
      component: () => import('@/pages/pv/monitor/secondary-clarifier/index.vue'),
      meta: { title: '二沉池及出水', requiresAuth: true, breadcrumb: ['工艺流程', '二沉池及出水'] },
    },
    {
      path: 'monitor/sludge-dewatering',
      name: 'EsProcessSludgeDewatering',
      component: () => import('@/pages/pv/monitor/sludge-dewatering/index.vue'),
      meta: { title: '污泥脱水', requiresAuth: true, breadcrumb: ['工艺流程', '污泥脱水'] },
    },
    {
      path: 'monitor/high-eff-sedimentation',
      name: 'EsProcessHighEffSedimentation',
      component: () => import('@/pages/pv/monitor/high-eff-sedimentation/index.vue'),
      meta: { title: '高效沉淀池', requiresAuth: true, breadcrumb: ['工艺流程', '高效沉淀池'] },
    },
    {
      path: 'monitor/denitrification-filter',
      name: 'EsProcessDenitrificationFilter',
      component: () => import('@/pages/pv/monitor/denitrification-filter/index.vue'),
      meta: { title: '反硝化深床滤池', requiresAuth: true, breadcrumb: ['工艺流程', '反硝化深床滤池'] },
    },
    {
      path: 'monitor/dosing-system',
      name: 'EsProcessDosingSystem',
      component: () => import('@/pages/pv/monitor/dosing-system/index.vue'),
      meta: { title: '加药系统', requiresAuth: true, breadcrumb: ['工艺流程', '加药系统'] },
    },
    {
      path: 'monitor/stage2-aao',
      name: 'EsProcessStage2AAO',
      component: () => import('@/pages/pv/monitor/stage2-aao/index.vue'),
      meta: { title: 'II段AAO', requiresAuth: true, breadcrumb: ['工艺流程', 'II段AAO'] },
    },
    {
      path: 'monitor/blower-room',
      name: 'EsProcessBlowerRoom',
      component: () => import('@/pages/pv/monitor/blower-room/index.vue'),
      meta: { title: '鼓风机房', requiresAuth: true, breadcrumb: ['工艺流程', '鼓风机房'] },
    },
    // 趋势分析模块
    {
      path: 'analysis/data-trend-query',
      name: 'EsAnalysisDataTrendQuery',
      component: () => import('@/pages/pv/analysis/data-trend-query/index.vue'),
      meta: { title: '数据趋势查询', requiresAuth: true, breadcrumb: ['趋势分析', '数据趋势查询'] },
    },
    {
      path: 'analysis/energy-consumption',
      name: 'EsAnalysisEnergyConsumption',
      component: () => import('@/pages/pv/analysis/energy-consumption/index.vue'),
      meta: { title: '能耗数据分析', requiresAuth: true, breadcrumb: ['趋势分析', '能耗数据分析'] },
    },
    // 告警分析模块
    {
      path: 'diagnosis/alarm-overview',
      name: 'EsAlarmOverview',
      component: () => import('@/pages/pv/diagnosis/alarm-overview/index.vue'),
      meta: { title: '告警概览', requiresAuth: true, breadcrumb: ['告警分析', '告警概览'] },
    },
    {
      path: 'diagnosis/alarm-realtime',
      name: 'EsAlarmRealtime',
      component: () => import('@/pages/pv/diagnosis/alarm-realtime/index.vue'),
      meta: { title: '实时告警', requiresAuth: true, breadcrumb: ['告警分析', '实时告警'] },
    },
    {
      path: 'diagnosis/alarm-history',
      name: 'EsAlarmHistory',
      component: () => import('@/pages/pv/diagnosis/alarm-history/index.vue'),
      meta: { title: '历史告警', requiresAuth: true, breadcrumb: ['告警分析', '历史告警'] },
    },
    {
      path: 'diagnosis/alarm-rules',
      name: 'EsAlarmRules',
      component: () => import('@/pages/pv/diagnosis/alarm-rules/index.vue'),
      meta: { title: '告警规则', requiresAuth: true, breadcrumb: ['告警分析', '告警规则'] },
    },
    {
      path: 'diagnosis/alarm-statistics',
      name: 'EsAlarmStatistics',
      component: () => import('@/pages/pv/diagnosis/alarm-statistics/index.vue'),
      meta: { title: '告警统计', requiresAuth: true, breadcrumb: ['告警分析', '告警统计'] },
    },
    // 报表查询模块
    {
      path: 'report/statistics',
      name: 'EsReportStatistics',
      component: () => import('@/pages/pv/report/statistics/index.vue'),
      meta: { title: '统计报表', requiresAuth: true, breadcrumb: ['报表查询', '统计报表'] },
    },
    {
      path: 'report/custom',
      name: 'EsReportCustom',
      component: () => import('@/pages/pv/report/custom/index.vue'),
      meta: { title: '自定义报表', requiresAuth: true, breadcrumb: ['报表查询', '自定义报表'] },
    },
    // 用户管理
    {
      path: 'user-management',
      name: 'EsUserManagement',
      component: () => import('@/pages/pv/user-management/index.vue'),
      meta: { title: '用户管理', requiresAuth: true, breadcrumb: ['用户管理'] },
    },
    // 系统管理
    {
      path: 'system/message-center',
      name: 'EsSystemMessageCenter',
      component: () => import('@/pages/pv/system/message-center/index.vue'),
      meta: { title: '消息中心', requiresAuth: true, breadcrumb: ['系统管理', '消息中心'] },
    },
    {
      path: 'system/notifications',
      name: 'EsSystemNotifications',
      component: () => import('@/pages/pv/system/notifications/index.vue'),
      meta: { title: '通知管理', requiresAuth: true, breadcrumb: ['系统管理', '通知管理'] },
    },
    {
      path: 'system/settings',
      name: 'EsSystemSettings',
      component: () => import('@/pages/pv/system/settings/index.vue'),
      meta: { title: '系统设置', requiresAuth: true, breadcrumb: ['系统管理', '系统设置'] },
    },
    {
      path: 'system/operation-log',
      name: 'EsSystemOperationLog',
      component: () => import('@/pages/pv/system/operation-log/index.vue'),
      meta: { title: '操作记录', requiresAuth: true, breadcrumb: ['系统管理', '操作记录'] },
    },
  ],
}