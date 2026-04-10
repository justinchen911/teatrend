#!/usr/bin/env python3
"""
TeaTrend 每日热搜日报推送
由 cron 定时调用，抓取多平台热搜 + 小红书单丛搜索并推送微信
"""
import urllib.request, urllib.error, urllib.parse, json, sys, os
from datetime import datetime

# ─── 配置 ───────────────────────────────────────────────
API_KEY = os.environ.get('TIKHUB_API_KEY', 'tY4NLMACwHmApl6eO9OkwQz5GAmKdqVs4TWdtEreVP2aqQWSOFKNcD2GNw==')
WECHAT_ID = os.environ.get('WECHAT_ID', '')
OPENCLAW_PATH = os.environ.get('OPENCLAW_PATH', '/usr/local/bin/openclaw')
HISTORY_DIR = os.path.dirname(os.path.abspath(__file__)) + '/history'
# ─────────────────────────────────────────────────────────

os.makedirs(HISTORY_DIR, exist_ok=True)

HEADERS = {'Authorization': f'Bearer {API_KEY}', 'User-Agent': 'curl/8.1.2'}

TEA_KWS = ['单丛', '凤凰', '单枞', '茶', '工夫茶', '潮州', '潮汕', '鸭屎', '蜜兰', '芝兰']

XHS_V1_KEYWORDS = [
    '凤凰单丛', '单丛茶', '单枞茶',      # 核心词
    '潮州茶叶', '潮州茶', '凤凰茶',        # 地域词
    '鸭屎香', '蜜兰香', '芝兰香',          # 香型（凤凰单丛特色）
    '工夫茶', '潮汕工夫茶',               # 泡茶文化
    '乌龙茶', '广东乌龙',                 # 大类扩展
]
XHS_V1_PAGES = 2
XHS_V1_RETRIES = 2


def apiGet(url: str, timeout: int = 20) -> dict:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except Exception as e:
        raise Exception(f"API Error: {e}")


def fetchWithRetry(url: str, retries: int = 1) -> dict:
    for i in range(retries + 1):
        try:
            return apiGet(url)
        except Exception as e:
            if i < retries and 'timeout' in str(e).lower():
                print('    重试...')
                continue
            raise


# ─── 抖音热搜 ─────────────────────────────────────────────
def fetchDouyinHot():
    data = apiGet('https://api.tikhub.io/api/v1/douyin/web/fetch_hot_search_result')
    wl = data.get('data', {}).get('data', {}).get('word_list', [])
    return [{'keyword': w['word'], 'rank': i+1, 'hot': w.get('hot_value', 0)} for i, w in enumerate(wl)]


# ─── 微博热搜 ─────────────────────────────────────────────
def fetchWeiboHot():
    topics = []
    rank = 1
    for section in apiGet('https://api.tikhub.io/api/v1/weibo/app/fetch_hot_search').get('data', {}).get('items', []):
        for it in section.get('items', []):
            for p in (it.get('itemExt', {}).get('anchorId', '')).split('|'):
                if p.startswith('key:'):
                    kw = p[4:].strip()
                    if kw:
                        topics.append({'keyword': kw, 'rank': rank, 'hot': ''})
                        rank += 1
                    break
    return topics


# ─── B站热搜 ─────────────────────────────────────────────
def fetchBilibiliHot():
    data = apiGet('https://api.tikhub.io/api/v1/bilibili/web/fetch_hot_search?limit=20')
    return [
        {'keyword': w.get('keyword', '') or w.get('show_name', '') or str(w),
         'rank': i+1, 'hot': w.get('icon', '')}
        for i, w in enumerate(data.get('data', {}).get('data', {}).get('trending', {}).get('list', []))
    ]


# ─── 小红书 v1 搜索（备用接口）──────────────────────────────
def fetchXiaohongshuV1():
    """用 app/v1 搜索笔记：
    - 字段 note.id（不是 note.note_id）
    - 字段 note.title 可能为 null，用 note.desc 兜底
    - 过滤条件：title + desc 包含茶关键词
    """
    seen_ids = set()
    all_notes = []
    for kw in XHS_V1_KEYWORDS:
        for page in range(1, XHS_V1_PAGES + 1):
            try:
                encoded_kw = urllib.parse.quote(kw)
                url = (f'https://api.tikhub.io/api/v1/xiaohongshu/app/search_notes'
                       f'?keyword={encoded_kw}&page={page}'
                       f'&sort_type=general&filter_note_type=%E4%B8%8D%E9%99%90&filter_note_time=%E4%B8%8D%E9%99%90')
                d = fetchWithRetry(url, retries=XHS_V1_RETRIES)
                items = d.get('data', {}).get('data', {}).get('items', [])
                added = 0
                for item in items:
                    if item.get('model_type') != 'note':
                        continue
                    note = item.get('note', {})
                    nid = note.get('id', '')       # 用 note.id，不是 note_id
                    title = note.get('title', '') or note.get('desc', '')[:50]  # title 可能为空
                    desc = note.get('desc', '')[:100]

                    # 去重
                    if nid in seen_ids:
                        continue
                    seen_ids.add(nid)

                    # 相关性过滤：标题+描述含茶关键词
                    if not any(k in (title + desc) for k in TEA_KWS):
                        continue

                    # 解析点赞数
                    likes_text = note.get('interaction_area', {}).get('text', '0') if isinstance(note.get('interaction_area'), dict) else '0'
                    try:
                        lt = likes_text.strip().lower().replace(',', '').replace('+', '')
                        if 'w' in lt:
                            likes = int(float(lt.replace('w', '')) * 10000)
                        else:
                            likes = int(lt)
                    except:
                        likes = 0

                    all_notes.append({
                        'keyword': kw,
                        'title': title,
                        'desc': desc,
                        'author': note.get('user', {}).get('nickname', '') if isinstance(note.get('user'), dict) else '',
                        'likes': likes,
                        'note_id': nid,
                        'page': page,
                        'source': 'xiaohongshu',
                    })
                    added += 1
                print(f'  ✅ 小红书[{kw}] 第{page}页: {added}条')
            except Exception as e:
                print(f'  ⚠️ 小红书[{kw}] 第{page}页: {e}')
    return all_notes


# ─── 微信推送 ─────────────────────────────────────────────
def sendWechat(content: str):
    if not WECHAT_ID:
        print("⚠️ WECHAT_ID 未设置，跳过推送")
        return
    cmd = [OPENCLAW_PATH, 'send', '--channel', 'openclaw-weixin', '--to', WECHAT_ID, '--message', content]
    result = os.system(' '.join(cmd) + ' 2>&1')
    print('✅ 微信推送成功' if result == 0 else f'⚠️ 微信推送失败 (code={result})')


# ─── 过滤茶热搜 ─────────────────────────────────────────────
def filterTea(topics):
    return [t for t in topics if any(k in t.get('keyword', '') for k in TEA_KWS)]


# ─── 格式化报告（精简版：只保留小红书）──────────────────────────
def formatReport(douyin, weibo, bilibili, xhs_notes, tea_hot):
    now = datetime.now().strftime('%m月%d日 %H:%M')
    lines = [
        f"🍵 TeaTrend 每日播报 {now}",
        "=" * 28,
        f"📕 今日采集小红书笔记 {len(xhs_notes)} 篇",
    ]

    # 小红书 TOP5（按热度排序）
    if xhs_notes:
        sorted_notes = sorted(xhs_notes, key=lambda x: x['likes'], reverse=True)
        lines.append(f"\n📕 小红书单丛笔记 TOP5（按热度）:")
        for n in sorted_notes[:5]:
            likes_str = f"{n['likes']//10000}w+" if n['likes'] >= 10000 else str(n['likes'])
            lines.append(f"  [{n['author']}] {n['title'][:28]}")
            lines.append(f"    赞 {likes_str} | {n['keyword']}")
    else:
        lines.append("\n📕 今日暂无采集到数据")

    lines.append("\n⏰ 关注 TeaTrend，发现茶赛道每一次爆发 🐸")
    return '\n'.join(lines)


# ─── 保存历史 ─────────────────────────────────────────────
def saveHistory(douyin, weibo, bilibili, xhs_notes, tea):
    path = os.path.join(HISTORY_DIR, datetime.now().strftime('%Y-%m-%d') + '.json')
    with open(path, 'w') as f:
        json.dump({
            'douyin': douyin, 'weibo': weibo, 'bilibili': bilibili,
            'xiaohongshu': xhs_notes, 'tea': tea,
            'fetched_at': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    print(f'📁 历史已存档: {path}')


# ─── 主程序 ─────────────────────────────────────────────
if __name__ == '__main__':
    print(f'🌿 TeaTrend 采集 {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    douyin = weibo = bilibili = xhs_notes = []
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

    try:
        xhs_notes = fetchXiaohongshuV1()
        print(f'✅ 小红书 {len(xhs_notes)} 条笔记')
    except Exception as e:
        print(f'❌ 小红书: {e}')

    for d in douyin:
        d['platform'] = 'douyin'
    for w in weibo:
        w['platform'] = 'weibo'
    for b in bilibili:
        b['platform'] = 'bilibili'

    tea = filterTea(douyin + weibo + bilibili)
    print(f'🍵 茶热搜 {len(tea)} 条')

    report = formatReport(douyin, weibo, bilibili, xhs_notes, tea)
    saveHistory(douyin, weibo, bilibili, xhs_notes, tea)
    print('\n--- 报告内容 ---')
    print(report)

    if '--dry-run' not in sys.argv:
        sendWechat(report)
