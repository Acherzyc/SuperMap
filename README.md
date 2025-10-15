# 炒鸡Map - Nuxt.js 地图应用

一个基于 Nuxt.js 和 Supabase 的现代化地图应用，集成了高德地图 API，提供强大的绘图工具和数据管理功能。

## 项目概述

**炒鸡Map** 是一个功能丰富的地图应用，专为需要在地图上进行标注、绘图和数据管理的用户设计。项目采用现代化的技术栈，支持实时数据同步和跨设备访问。

**目标用户**：
- 地理信息系统开发者
- 需要地图标注和数据分析的用户
- 团队协作项目的数据管理人员

## 功能特性

### 🗺️ 地图功能
- 集成高德地图 API，支持多种地图模式
- 流畅的地图浏览和缩放操作
- 实时地理位置显示

### ✏️ 绘图工具
- 多种绘图工具（点、线、面标注）
- 自定义样式和颜色设置
- 图层管理和分组功能

### 📊 数据管理
- Excel 数据导入/导出（支持 XLSX 格式）
- 数据项管理和分类
- 批量操作和筛选功能

### ☁️ 云同步
- 基于 Supabase 的实时数据同步
- 用户认证和权限管理
- 数据版本控制和备份

### 🎨 用户界面
- 响应式设计，支持多设备访问
- 现代化的 Material Design 风格
- 直观的侧边栏和工具栏布局

## 环境要求

- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+

## 安装指南

### 1. 克隆项目
```bash
git clone <项目地址>
cd nuxt-supabase-mvp
```

### 2. 安装依赖
```bash
npm install
# 或使用其他包管理器
# yarn install
# pnpm install
```

### 3. 环境配置
创建 `.env` 文件并配置以下环境变量：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# 高德地图配置（可选，已在代码中配置）
AMAP_SECURITY_CODE=your_amap_security_code
AMAP_API_KEY=your_amap_api_key
```

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

## 使用方法

### 首次使用
1. 访问应用首页
2. 注册新账户或登录现有账户
3. 开始使用地图功能

### 基本操作
- **地图导航**: 使用鼠标拖拽和滚轮缩放
- **绘图工具**: 从工具栏选择绘图工具进行标注
- **数据管理**: 通过侧边栏管理数据项和导入导出
- **云同步**: 数据自动保存到云端，支持多设备同步

### 高级功能
- **数据分享**: 通过分享链接与他人协作
- **批量操作**: 支持多选和数据批量处理
- **自定义样式**: 个性化地图标记和界面主题

## 项目结构

```
nuxt-supabase-mvp/
├── assets/           # 静态资源
│   └── css/         # 样式文件
├── components/       # Vue 组件
│   ├── AppHeader.vue        # 应用头部
│   ├── CloudSyncPanel.vue   # 云同步面板
│   ├── DataItem.vue         # 数据项组件
│   ├── DrawingToolbar.vue   # 绘图工具栏
│   ├── LoadingIndicator.vue # 加载指示器
│   ├── SidePanel.vue        # 侧边栏
│   └── ToastNotification.vue # 通知组件
├── middleware/       # 中间件
│   └── auth.ts             # 认证中间件
├── pages/           # 页面组件
│   ├── index.vue           # 首页
│   ├── login.vue          # 登录页
│   └── share/             # 分享相关页面
│       └── [id].vue       # 动态分享页
├── public/          # 公共资源
│   ├── background.jpg     # 背景图片
│   ├── favicon.ico       # 网站图标
│   └── robots.txt        # 搜索引擎配置
├── nuxt.config.ts        # Nuxt 配置
├── package.json          # 项目依赖
└── tsconfig.json        # TypeScript 配置
```

## 技术栈

- **前端框架**: Nuxt.js 3 (Vue 3)
- **状态管理**: 内置 Composition API
- **后端服务**: Supabase (PostgreSQL + 实时订阅)
- **地图服务**: 高德地图 API
- **样式**: CSS3 + 自定义样式
- **构建工具**: Vite

## 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview

# 类型检查
npm run type-check
```

## 部署说明

### Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台
- Netlify
- Railway
- 自有服务器

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

MIT License