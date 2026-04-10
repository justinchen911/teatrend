#!/usr/bin/env python3
"""
AlertManager → 企业微信 Bot 转发服务

启动方式：python3 alert-to-wecom.py
监听端口：8080

环境变量：
  WECOM_BOT_WEBHOOK - 企业微信 Bot Webhook URL
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen

WECOM_WEBHOOK = os.environ.get("WECOM_BOT_WEBHOOK", "")


def format_alert(data: dict) -> str:
    """将 AlertManager 告警格式化为企业微信消息"""
    alerts = data.get("alerts", [])
    status = data.get("status", "firing")
    emoji = "🔴" if status == "firing" else "🟢"

    lines = [f"{emoji} **告警通知** ({status})\n"]

    for alert in alerts:
        labels = alert.get("labels", {})
        annotations = alert.get("annotations", {})
        severity = labels.get("severity", "P3")
        summary = annotations.get("summary", "未知告警")
        desc = annotations.get("description", "")

        lines.append(f"**[{severity}]** {summary}")
        if desc:
            lines.append(f"  → {desc}")
        lines.append(f"  开始：{alert.get('startsAt', '未知')}")
        if alert.get("endsAt"):
            lines.append(f"  结束：{alert['endsAt']}")
        lines.append("")

    return "\n".join(lines)


def send_to_wecom(content: str):
    """发送消息到企业微信 Bot"""
    if not WECOM_WEBHOOK:
        print("⚠️ WECOM_BOT_WEBHOOK 未配置，跳过发送")
        return

    payload = json.dumps({
        "msgtype": "markdown",
        "markdown": {"content": content}
    }).encode("utf-8")

    req = Request(
        WECOM_WEBHOOK,
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    resp = urlopen(req)
    print(f"✅ 企业微信发送结果: {resp.read().decode()}")


class AlertHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            return

        message = format_alert(data)
        print(message)
        send_to_wecom(message)

        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[AlertHandler] {args[0]}")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = HTTPServer(("0.0.0.0", port), AlertHandler)
    print(f"🚀 Alert-to-WeCom 服务启动，监听端口 {port}")
    if WECOM_WEBHOOK:
        print(f"📡 企业微信 Webhook 已配置")
    else:
        print("⚠️ WECOM_BOT_WEBHOOK 未配置，请设置环境变量")
    server.serve_forever()
