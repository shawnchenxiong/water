# VoltWise 鹤问湖水质净化厂

<div align="center">

![VoltWise Logo](https://img.shields.io/badge/VoltWise-光伏智慧运维-00d4ff?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.5-409EFF?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

一个基于 Vue 3 + TypeScript + Element Plus 的现代化鹤问湖水质净化厂

[快速开始](#-快速开始) · [功能特性](#-功能特性) · [技术栈](#-技术栈) · [部署指南](#-部署)

</div>

---

## 📖 项目简介

VoltWise 是一个专业的光伏电站智慧运维管理平台，提供实时监控、数据分析、告警管理等功能，帮助运维人员高效管理光伏电站。

### 核心功能

- 🏭 **站点概览** - 多站点统计、实时功率监控、发电量分析
- 📊 **数据分析** - 功率趋势、电量统计、离散量分析、自定义报表
- 🔔 **告警管理** - 实时告警、告警策略、告警屏蔽、告警统计
- 📹 **视频监控** - 视频巡检、视频回放、视频查询
- 🌡️ **设备监控** - 逆变器、电表、气象站等设备实时监控

---

## ✨ 功能特性

### 🎨 界面设计
- **深色科技风格** - 青色主题，适合长时间监控
- **响应式布局** - 适配各种屏幕尺寸
- **数据可视化** - ECharts 图表展示，直观清晰

### 📈 数据监控
- **实时数据** - 5分钟间隔的功率和辐射数据（288个点/天）
- **历史数据** - 日、月、年多维度数据查询
- **数据导出** - 支持 Excel 格式导出

### 🔐 系统功能
- **用户认证** - JWT Token 认证
- **权限管理** - 基于角色的访问控制
- **数据缓存** - 5分钟缓存，提升性能

---

## 🚀 快速开始

### 环境要求

确保您的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 （推荐）或 npm/yarn

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd volt-wise
```

#### 2. 安装依赖

使用 pnpm（推荐）：

```bash
pnpm install
```

或使用 npm：

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

#### 3. 配置环境变量（可选）

项目已包含默认的 `.env` 配置文件。如需自定义配置，可创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑配置（可选）
# VITE_MOCK=true          # 是否使用 Mock 数据
# VITE_API_BASE_URL=/api  # API 基础地址
```

详细配置说明请查看 [环境变量配置指南](./docs/ENV_SETUP.md)

#### 4. 启动开发服务器

```bash
pnpm dev
```

或

```bash
npm run dev
```

服务器将在 **http://localhost:5173** 启动（如果端口被占用，会自动使用其他端口）

#### 5. 访问系统

打开浏览器访问：http://localhost:5173

**测试账户**：
- 用户名：`test`
- 密码：`123456`

### 构建生产版本

```bash
pnpm build
```

构建产物将生成在 `dist/` 目录

### 预览生产构建

```bash
pnpm preview
```

---

## 📦 技术栈

### 核心框架
- **Vue 3.4** - 渐进式 JavaScript 框架
- **TypeScript 5.3** - JavaScript 的超集，提供类型安全
- **Vite 5.0** - 下一代前端构建工具，快速的开发体验

### UI 组件
- **Element Plus 2.5** - Vue 3 UI 组件库（自定义青色主题）
- **UnoCSS 0.58** - 原子化 CSS 引擎，快速样式开发
- **@element-plus/icons-vue** - Element Plus 图标库

### 状态管理 & 路由
- **Vue Router 4.2** - Vue 官方路由管理
- **Pinia 2.1** - Vue 3 状态管理，替代 Vuex

### 工具库
- **Axios 1.6** - HTTP 客户端，处理 API 请求
- **Day.js 1.11** - 轻量级日期处理库
- **ECharts 5.4** - 数据可视化图表库
- **VueUse 10.7** - Vue 组合式 API 工具集
- **NProgress 0.2** - 页面加载进度条
- **XLSX 0.18** - Excel 文件处理

### 开发工具
- **ESLint + Prettier** - 代码规范和格式化
- **Vitest** - 单元测试框架
- **Playwright** - E2E 测试框架

---

## 📁 项目结构

```
volt-wise/
├── docs/                   # 项目文档
│   ├── API_*.md           # API 接口文档
│   ├── SPEC_*.md          # 功能规格文档
│   └── STATION_OVERVIEW_DATA.md  # 数据结构说明
├── public/                 # 静态资源
│   └── images/            # 图片资源
├── src/
│   ├── api/               # API 接口层
│   │   ├── alarm/         # 告警相关 API
│   │   ├── analysis/      # 分析相关 API
│   │   ├── device/        # 设备相关 API
│   │   ├── electrical/    # 电气相关 API
│   │   ├── video/         # 视频相关 API
│   │   ├── mock/          # 模拟数据
│   │   └── types/         # API 类型定义
│   ├── components/        # 公共组件
│   │   ├── common/        # 通用组件
│   │   └── layout/        # 布局组件
│   ├── pages/             # 页面组件
│   │   ├── login/         # 登录页
│   │   ├── dashboard/     # 统计大盘
│   │   ├── monitor/       # 监控页面
│   │   │   ├── station-overview/  # 站点概览
│   │   │   ├── device/    # 设备监控
│   │   │   ├── alarm/     # 告警管理
│   │   │   └── video/     # 视频监控
│   │   └── analysis/      # 数据分析
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 样式文件
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   │   ├── mockData.ts    # 模拟数据生成
│   │   ├── request.ts     # Axios 封装
│   │   └── download.ts    # 文件下载工具
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── index.html             # HTML 入口
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript 配置
├── uno.config.ts          # UnoCSS 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

---

## 📜 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 构建前类型检查
pnpm build:check

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 运行单元测试
pnpm test:unit

# 运行组件测试
pnpm test:component

# 运行 E2E 测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```

---

## 🎨 主题配置

项目采用自定义青色科技风主题，主色调为 `#00D4FF`。

### 主题文件

- `src/styles/element-theme.scss` - Element Plus 自定义主题
- `src/styles/global.css` - 全局样式

### 主要颜色

```scss
$colors: (
  'primary': #00d4ff,  // 青色
  'success': #10b981,  // 绿色
  'warning': #f59e0b,  // 橙色
  'danger': #ef4444,   // 红色
);
```

详细的主题配置请查看 [主题配置指南](./docs/THEME_GUIDE.md)

---

## 📊 数据模拟说明

项目使用模拟数据进行开发和演示，完全匹配真实 API 数据结构。

### 关键特性

- **时间间隔**: 5分钟（全天288个数据点）
- **功率曲线**: 模拟真实的日出日落发电曲线（6:00-18:00）
- **云层影响**: 30%概率出现云层遮挡，功率降低50-80%
- **数据波动**: 功率±15%、辐射±30%的随机波动
- **辐射范围**: 20-340 W/m²

### 数据结构

```typescript
{
  regionName: "亳州利辛县经开区污水厂",
  monthElectric: "13172.40",
  nowTemp: "13",
  createdate: "2025-10-19 17:28:30",
  alarmData: {
    list: [],
    total: 0
  },
  curveData: {
    timeList: ["00:00", "00:05", ..., "23:55"],  // 288个点
    powerGenerationList: [0, 0, ..., 156.86],    // 功率数据
    irradiationList: [0, 0, ..., 250]            // 辐射数据
  }
}
```

详细说明请查看 [数据结构文档](./docs/STATION_OVERVIEW_DATA.md)

---

## 🌐 部署

### 构建

```bash
pnpm build
```

### 部署到服务器

将 `dist/` 目录的内容部署到您的 Web 服务器（如 Nginx、Apache）。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/volt-wise/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

详细部署说明请查看 [部署文档](./DEPLOYMENT.md)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 类型定义
- 编写清晰的注释
- 提交前运行 `pnpm lint` 和 `pnpm format`

---

## 📄 许可证

[MIT License](./LICENSE)

---

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [UnoCSS 文档](https://unocss.dev/)
- [Vite 文档](https://vitejs.dev/)
- [ECharts 文档](https://echarts.apache.org/)

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件至：your-email@example.com

---

**最后更新**：2025-10-19

**当前版本**：v1.0.0

**开发状态**：🚀 持续开发中

---

<div align="center">

Made with ❤️ by VoltWise Team

</div>
