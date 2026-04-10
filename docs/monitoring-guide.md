# 监控系统使用指南

## 快速启动

```bash
cd monitoring
docker-compose up -d
```

启动后等待约 10-15 秒，所有服务初始化完成后即可访问。

## 服务访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| Grafana | http://localhost:3001 | 监控面板与仪表盘 |
| Prometheus | http://localhost:9090 | 指标存储与查询 |
| Loki | http://localhost:3100 | 日志聚合 |
| AlertManager | http://localhost:9093 | 告警管理 |

## 默认账号密码

### Grafana

- 用户名：`admin`
- 密码：`admin`
- 首次登录后系统会提示修改密码

### Prometheus / Loki

无需认证，直接通过 Web UI 访问。

## 查看日志

### 查看所有监控服务日志

```bash
cd monitoring
docker-compose logs -f
```

### 查看单个服务日志

```bash
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f loki
docker-compose logs -f alertmanager
```

### 应用日志（通过 Loki 查询）

1. 打开 Grafana → Explore
2. 选择 Loki 数据源
3. 使用 LogQL 查询，例如：

```logql
{job="saas-app"} |= "error"
{job="saas-app"} | json | line_format "{{.method}} {{.path}} {{.status}}"
```

## 仪表盘

启动后 Grafana 会自动加载 `dashboards/saas-overview.json`，包含以下面板：

- HTTP 请求总数（按状态码分布）
- P95 / P99 响应时间
- 错误率（5xx）
- CPU / 内存使用率

访问路径：Grafana → Dashboards → SaaS Overview

## 健康检查

使用内置健康检查脚本快速诊断所有服务状态：

```bash
bash monitoring/scripts/health-check.sh
```

脚本会输出彩色状态报告，任一服务异常时返回 exit code 1，适合集成到 CI/CD 流水线。

## 配置企业微信告警

### 步骤 1：创建企业微信机器人

1. 进入企业微信群 → 群设置 → 群机器人 → 添加机器人
2. 复制 Webhook URL，格式为：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx`

### 步骤 2：配置 AlertManager

编辑 `monitoring/alertmanager/config.yml`，在 `receivers` 中添加企业微信 Webhook：

```yaml
route:
  receiver: 'wecom'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  group_by: ['alertname']

receivers:
  - name: 'wecom'
    webhook_configs:
      - url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的KEY'
        send_resolved: true
```

### 步骤 3：配置告警规则

编辑 `monitoring/prometheus/alert-rules.yml`，添加告警规则：

```yaml
groups:
  - name: saas-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "5xx 错误率过高"
          description: "当前错误率 {{ $value | humanizePercentage }}，超过 5% 阈值"

      - alert: HighLatencyP99
        expr: |
          histogram_quantile(0.99,
            sum by (le) (rate(http_request_duration_seconds_bucket[5m]))
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 响应时间过高"
          description: "当前 P99 延迟 {{ $value }}s，超过 2s 阈值"
```

### 步骤 4：重启服务生效

```bash
cd monitoring
docker-compose restart prometheus alertmanager
```

## 常见问题

### Grafana 无法连接 Prometheus

确认 Prometheus 容器已启动：`docker-compose ps`，检查 Grafana 数据源配置中的 URL 是否为 `http://prometheus:9090`。

### Loki 日志为空

确认应用日志已配置输出到 Loki，检查 Docker network 中 Loki 容器是否可达。

### 告警未推送到企业微信

1. 检查 AlertManager 日志：`docker-compose logs alertmanager`
2. 确认 Webhook URL 正确且 Key 有效
3. 确认告警规则已触发：访问 Prometheus → Alerts
