/**
 * 鹤问湖二期工厂路由
 *
 * 工艺流程模块使用动态参数路由 /es/monitor/process/:monitorId，
 * 由后端 getAllMonitorList 接口返回的菜单数据驱动，
 * 不再硬编码具体的工艺段路由。
 *
 * 一期（/pv/...）的路由和页面组件完全不受影响。
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
    // ==================== 工艺流程模块（动态路由） ====================
    // 使用动态参数 :monitorId 匹配后端返回的所有工艺节点
    {
      path: 'monitor/process/:monitorId',
      name: 'EsMonitorProcess',
      component: () => import('@/pages/es/monitor/process/index.vue'),
      meta: { title: '工艺流程', requiresAuth: true, breadcrumb: ['工艺流程'] },
    },
    // 组态预览（保留，兼容 SCADA 功能）
    {
      path: 'monitor/scada/:id',
      name: 'EsMonitorScadaPreview',
      component: () => import('@/pages/pv/monitor/scada-preview/index.vue'),
      meta: { title: '工艺流程组态', requiresAuth: true, breadcrumb: ['工艺流程', '工艺流程组态'] },
    },
    // ==================== 趋势分析模块 ====================
    {
      path: 'analysis/data-trend-query',
      name: 'EsAnalysisDataTrendQuery',
      component: () => import('@/pages/es/analysis/data-trend-query/index.vue'),
      meta: { title: '数据趋势查询', requiresAuth: true, breadcrumb: ['趋势分析', '数据趋势查询'] },
    },
    {
      path: 'analysis/energy-consumption',
      name: 'EsAnalysisEnergyConsumption',
      component: () => import('@/pages/pv/analysis/energy-consumption/index.vue'),
      meta: { title: '能耗数据分析', requiresAuth: true, breadcrumb: ['趋势分析', '能耗数据分析'] },
    },
    // ==================== 告警分析模块 ====================
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
    // ==================== 报表查询模块 ====================
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
    // ==================== 用户管理 ====================
    {
      path: 'user-management',
      name: 'EsUserManagement',
      component: () => import('@/pages/pv/user-management/index.vue'),
      meta: { title: '用户管理', requiresAuth: true, breadcrumb: ['用户管理'] },
    },
    // ==================== 系统管理 ====================
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