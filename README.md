# SaaS Project

> AI-native SaaS 项目，从零搭建。

## 技术选型

| 层级 | 方案 | 理由 |
|------|------|------|
| 前端 | Next.js 14 (App Router) | SSR + API Routes 一体，Vercel 一键部署 |
| 后端 API | Next.js Route Handlers | 全栈统一，减少运维 |
| 数据库 | Supabase (PostgreSQL) | 免运维，自带 Auth + 实时订阅 |
| ORM | Prisma | 类型安全，迁移方便 |
| AI 集成 | Vercel AI SDK | 流式输出、多模型切换开箱即用 |
| 缓存 | Upstash Redis | Serverless Redis，按量付费 |
| 支付 | Stripe | SaaS 标配 |
| 部署 | Vercel + Supabase | 零服务器，AI-native |
| 监控 | Prometheus + Grafana + Loki | 自建，见下方方案 |
| 告警 | 企业微信 Bot | 微信实时通知 |

## 项目结构

```
saas-project/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # 认证相关页面
│   │   ├── (dashboard)/      # 主业务页面
│   │   └── api/              # API Routes
│   ├── components/           # UI 组件
│   ├── lib/                  # 工具函数
│   │   ├── ai/               # AI 相关封装
│   │   ├── db/               # 数据库操作
│   │   └── utils/            # 通用工具
│   └── styles/               # 样式
├── prisma/
│   └── schema.prisma         # 数据模型
├── monitoring/               # 监控配置
│   ├── docker-compose.yml    # Prometheus + Grafana + Loki
│   ├── prometheus/           # Prometheus 配置
│   ├── grafana/              # Grafana Dashboard
│   └── loki/                 # Loki 日志配置
├── .github/
│   └── workflows/            # CI/CD
├── docs/                     # 文档
├── .env.example
├── package.json
└── README.md
```

## 环境要求

- Node.js >= 18
- pnpm（包管理器）
- Docker（本地跑监控）
