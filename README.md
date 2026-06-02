# DataPoetry · 数据诗意

> 一个自我成长工具。看世界、看作品、看书，在持续输入中看见自己的思想轨迹。

---

## 理念

不追踪心情，不统计效率。**成长来自持续输入好东西，思考来自关联与回顾。**

DataPoetry 是一个「思想消化系统」：新闻触发思考 → 思考沉淀为日记 → 回顾看见思想轨迹。

## 三支柱

| 支柱 | 含义 | 状态 |
|------|------|------|
| 🌍 **看世界** | 60秒读世界 · 每日新闻 + 原文链接 + 关联思考 | ✅ 已上线 |
| 🎭 **看作品** | 电影、话剧、展览、演出记录 | ⬜ 待建设 |
| 📚 **看书** | 书架 · 读书笔记 · 知识沉淀 | ⬜ 待建设 |

## 核心功能

- **60秒读世界** — 每日新闻聚合，支持全部/要闻/文娱 Tab 切换，Bing 每日壁纸作封面
- **🔗 原文搜索** — 每条新闻一键搜索原文，先读后思
- **💭 快速日记** — 从新闻直接写日记，自动关联引用来源
- **✍️ 日记系统** — 自由书写，支持标签、照片、引用来源
- **🧭 思想轨迹** — 连续记录统计、灵感来源分布、每周关键词、关联思考时间线
- **📊 周期性回顾** — 自动生成每周/每月思想总结
- **🌓 主题切换** — 浅色/深色模式，网易云风格设计

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| UI | React 18 + Tailwind CSS |
| 数据库 | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| 图表 | Recharts |
| 图标 | Lucide React |
| 工具 | date-fns, uuid, clsx, tailwind-merge |

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
datapoetry/
├── app/                  # Next.js App Router
│   ├── api/              # API 路由
│   │   ├── dashboard/    # streak / stats / heatmap
│   │   ├── diaries/      # 日记 CRUD
│   │   ├── external/     # 外部数据（60秒新闻）
│   │   └── retrospectives/ # 回顾生成
│   ├── diary/            # 日记页面
│   ├── settings/         # 设置页面
│   ├── trajectory/       # 思想轨迹页
│   ├── page.tsx          # 首页
│   └── globals.css       # 全局样式 + CSS 变量
├── components/
│   ├── ui/               # 基础 UI 组件
│   ├── layout/           # 布局（Sidebar/Header/MobileNav）
│   ├── dashboard/        # 首页组件（DailyNewsCard 等）
│   └── diary/            # 日记组件（QuickDiaryModal 等）
├── lib/
│   └── db/               # 数据库 schema + 连接
├── types/                # TypeScript 类型定义
└── public/               # 静态资源
```

## 设计系统

- CSS 变量驱动主题，所有颜色通过 `var(--color-xxx)` 引用
- 阴影采用网易云风格双层设计
- 深色模式通过 `.dark` 类切换
- 动效统一使用 CSS transition/animation
- 圆角层级：sm(6px) < md(10px) < lg(12px) < xl(16px) < 2xl(20px) < card-lg(24px) < 3xl(28px)

## 构建

```bash
# 类型检查
npx tsc --noEmit

# 生产构建
npm run build

# 启动生产服务
npm run start
```

> 注意：better-sqlite3 需要原生编译，需 Node 22+ 环境。构建前清除 `.next` 缓存可避免某些编译问题。

---

*Made with curiosity, not metrics.*
