#!/usr/bin/env python3
"""
TeaTrend 每日热搜日报推送
由 cron 定时调用，抓取多平台热搜并推送微信
"""
import urllib.request, urllib.error, json, sys, os
from datetime import datetime

# ─── 配置 ───────────────────────────────────────────────
API_KEY = os.environ.get('TIKHUB_API_KEY', 'tY4NLMACwHmApl6eO9OkwQz5GAmKdqVs4TWdtEreVP2aqQWSOFKNcD2GNw==')
WECHAT_ID = os.environ.get('WECHAT_ID', '')  # 运行时注入
OPENCLAW_PATH = os.environ.get('OPENCLAW_PATH', '/usr/local/bin/openclaw')
HISTORY_DIR = os.path.dirname(os.path.abspath(__file__)) + '/history'
# ─────────────────────────────────────────────────────────

os.makedirs(HISTORY_DIR, exist_ok=True)

HEADERS = {'Authorization': f'Bearer {API_KEY}', 'User-Agent': 'curl/8.1.2'}

TEA_KWS = ['茶','单丛','凤凰','乌龙','岩茶','铁观音','普洱','白茶','红茶',
           '绿茶','潮汕','工夫茶','潮州','茶叶','茶道','茶文化','泡茶','喝茶']


def apiGet(url: str) -> dict:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = json.loads(e.read())
        raise Exception(f"API Error {e.code}: {body.get('detail',{}).get('message',str(body))}")


def fetchDouyinHot():
    data = apiGet('https://api.tikhub.io/api/v1/douyin/web/fetch_hot_search_result')
    wl = data.get('data',{}).get('data',{}).get('word_list',[])
    return [{'keyword': w['word'], 'rank': i+1, 'hot': w.get('hot_value',0)} for i,w in enumerate(wl)]


def fetchWeiboHot():
    topics = []
    rank = 1
    for section in apiGet('https://api.tikhub.io/api/v1/weibo/app/fetch_hot_search').get('data',{}).get('items',[]):
        for it in section.get('items',[]):
            for p in (it.get('itemExt',{}).get('anchorId','')).split('|'):
                if p.startswith('key:'):
                    kw = p[4:].strip()
                    if kw: topics.append({'keyword': kw, 'rank': rank, 'hot': ''})
                    rank += 1
                    break
    return topics


def fetchBilibiliHot():
    data = apiGet('https://api.tikhub.io/api/v1/bilibili/web/fetch_hot_search?limit=20')
    return [
        {'keyword': w.get('keyword','') or w.get('show_name','') or str(w),
         'rank': i+1, 'hot': w.get('icon','')}
        for i, w in enumerate(data.get('data',{}).get('data',{}).get('trending',{}).get('list',[]))
    ]


def filterTea(topics):
    return [t for t in topics if any(k in t['keyword'] for k in TEA_KWS)]


def sendWechat(content: str):
    """通过 openclaw send 推送微信"""
    if not WECHAT_ID:
        print("⚠️ WECHAT_ID 未设置，跳过推送")
        return
    cmd = [
        OPENCLAW_PATH, 'send',
        '--channel', 'openclaw-weixin',
        '--to', WECHAT_ID,
        '--message', content,
    ]
    result = os.system(' '.join(cmd) + ' 2>&1')
    if result == 0:
        print('✅ 微信推送成功')
    else:
        print(f'⚠️ 微信推送失败 (code={result})')


def formatReport(douyin, weibo, bilibili, tea):
    now = datetime.now().strftime('%m月%d日 %H:%M')
    lines = [
        f"🍵 TeaTrend 每日热搜 {now}",
        "=" * 28,
        f"📊 今日概况 | 抖音 {len(douyin)} | 微博 {len(weibo)} | B站 {len(bilibili)}",
    ]
    if tea:
        lines.append(f"\n🔥 茶热搜 {len(tea)} 条:")
        # 限制每平台最多3条
        by_platform = {}
        for t in tea:
            by_platform.setdefault(t['platform'], []).append(t)
        for plat, items in by_platform.items():
            icon = {'douyin':'🎵','weibo':'💬','bilibili':'📺'}.get(plat,'📌')
            lines.append(f"  {icon} {plat}:")
            for t in items[:3]:
                lines.append(f"    · {t['keyword']}")
    else:
        lines.append("\n🌿 今日暂无茶热搜（正常，热搜竞争激烈）")
        # 降级：显示微博前3条给用户参考
        lines.append("\n💬 微博实时热搜 TOP3:")
        for t in weibo[:3]:
            lines.append(f"  · {t['keyword']}")

    lines.append("\n⏰ 关注 TeaTrend，发现茶赛道每一次爆发 🐸")
    return '\n'.join(lines)


def saveHistory(douyin, weibo, bilibili, tea):
    path = os.path.join(HISTORY_DIR, datetime.now().strftime('%Y-%m-%d') + '.json')
    with open(path, 'w') as f:
        json.dump({'douyin': douyin, 'weibo': weibo, 'bilibili': bilibili, 'tea': tea,
                   'fetched_at': datetime.now().isoformat()}, f, ensure_ascii=False, indent=2)
    print(f'📁 历史已存档: {path}')


if __name__ == '__main__':
    print(f'🌿 TeaTrend 热搜采集 {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    douyin = weibo = bilibili = []
    try:
        douyin = fetchDouyinHot()
        print(f'✅ 抖音 {len(douyin)} 条')
    except Exception as e:
        print(f'❌ 抖音: {e}')

    try:
        weibo = fetchWeiboHot()
        print(f'✅ 微博 {len(weibo)} 条')
    except Exception as e:
        print(f'❌ 微博: {e}')

    try:
        bilibili = fetchBilibiliHot()
        print(f'✅ B站 {len(bilibili)} 条')
    except Exception as e:
        print(f'❌ B站: {e}')

    tea = filterTea(douyin + weibo + bilibili)
    print(f'🍵 茶热搜 {len(tea)} 条')

    report = formatReport(douyin, weibo, bilibili, tea)
    saveHistory(douyin, weibo, bilibili, tea)
    print('\n' + report)

    # 发送微信
    if '--dry-run' not in sys.argv:
        sendWechat(report)
