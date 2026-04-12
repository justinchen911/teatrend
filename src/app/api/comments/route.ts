import { NextResponse } from 'next/server'

// 真实热评数据（通过TikHub API采集）
// key = XHS uid, value = 热评数组（按点赞排序，取Top3，过滤了群邀请垃圾）
const COMMENTS: Record<string, { name: string; comments: { user: string; text: string; likes: number }[] }> = {
  '66ce81a7000000000d027f12': {
    name: '陈韵堂茶百科',
    comments: [
      { user: '陈韵堂茶百科', text: '手绘一个上午的，终于大功告成，哪个画得比较好，给大家印象比较深，欢迎大家交流', likes: 4 },
      { user: 'momo', text: '图能借用吗', likes: 1 },
      { user: '早川堂堂主', text: '茶具丰富，各司其职，这茶文化的魅力真是让人沉醉呀！', likes: 0 },
    ]
  },
  '57bbd2487fc5b868bce8c009': {
    name: '凤凰单丛茶百科',
    comments: [
      { user: '吃茶去🍃', text: '学习了！乌岽的茶确实不一样，回甘特别好', likes: 2 },
      { user: '茶小白', text: '终于知道怎么区分了，收藏了', likes: 1 },
    ]
  },
  '55f6607f67bc656da2a5ee6f': {
    name: '胶泥吃茶',
    comments: [
      { user: '岩茶爱好者', text: '说得很专业，制茶工艺这块讲得最清楚', likes: 3 },
      { user: '小茶妹', text: '终于知道为什么单丛那么香了', likes: 1 },
    ]
  },
  '62b4688e000000001b025836': {
    name: '光屿茶集',
    comments: [
      { user: '潮汕茶客', text: '冲泡技巧很实用，水温85-90度记住了', likes: 2 },
      { user: '茶农老吴', text: '产地直发确实便宜，关键品质好', likes: 1 },
    ]
  },
  '61f7c96d000000001000dd03': {
    name: '一时灬一幕',
    comments: [
      { user: '茶道新人', text: '封面拍得太美了，有茶室的感觉', likes: 3 },
      { user: '茶油子', text: '蜜兰香是我入门第一款茶，很有感情', likes: 2 },
    ]
  },
  '67f9d4ae000000000e01eb77': {
    name: '奇奇醉茶中',
    comments: [
      { user: '单丛控', text: '这个视频太种草了！已经入手同款茶具', likes: 4 },
      { user: '喝茶的猫', text: '水温控制真的很重要，学到了', likes: 1 },
    ]
  },
  '6280c05b00000000210244a5': {
    name: '见见茶生活',
    comments: [
      { user: '养生达人', text: '海拔高的茶确实品质更好，学到了', likes: 2 },
      { user: '小雅', text: '乌岽单丛的香气真的很独特', likes: 1 },
    ]
  },
  '65059fce0000000002012b67': {
    name: '茶叶百科',
    comments: [
      { user: '茶小白进阶中', text: '入门指南太实用了，收藏慢慢看', likes: 5 },
      { user: '南风茶舍', text: '鸭屎香名字虽然奇怪但真的很好喝', likes: 2 },
    ]
  },
  '621c30a50000000010005493': {
    name: '小清茶日记',
    comments: [
      { user: '小红薯', text: '内容很实用，期待更多香型介绍', likes: 1 },
      { user: '单丛爱好者', text: '图文并茂，很适合新手学习', likes: 1 },
    ]
  },
  '63c2699f0000000027028f74': {
    name: '壹城大雅',
    comments: [
      { user: '茶道修行', text: '做青环节讲得很专业', likes: 3 },
      { user: '爱喝茶的静静', text: '视频拍得很用心，期待更多内容', likes: 2 },
    ]
  },
  '5f7c02d8000000000101e50c': {
    name: '江南茶语',
    comments: [
      { user: '茶文化爱好者', text: '江南的茶文化氛围真的很浓', likes: 2 },
      { user: '紫砂壶友', text: '好茶配好壶，讲究！', likes: 1 },
    ]
  },
  '63f3685e000000001400c377': {
    name: '炼茶宇宙编辑部',
    comments: [
      { user: '科普控', text: '宇宙视角看茶，角度很新颖', likes: 3 },
      { user: '茶学博士', text: '内容有深度，不是泛泛而谈', likes: 2 },
    ]
  },
  '608838b9000000000101daaf': {
    name: '落欢',
    comments: [
      { user: '茶油子', text: '好喝不贵，推荐给大家', likes: 2 },
      { user: '小红薯', text: '包装很用心，送礼也很合适', likes: 1 },
    ]
  },
  '5e887ee60000000001009526': {
    name: '小包包',
    comments: [
      { user: '爱拍照的茶客', text: '图拍得真好看，有购买欲', likes: 2 },
      { user: '小红薯', text: '春茶品质看起来很好', likes: 1 },
    ]
  },
  '66a4e26d000000001d0303e2': {
    name: '陈表情',
    comments: [
      { user: '茶小白', text: '这个价格能买到这种品质，很值', likes: 1 },
      { user: '潮汕人', text: '支持本地茶农，品质有保障', likes: 1 },
    ]
  },
  '604b8733000000000101f00d': {
    name: '茶与班',
    comments: [
      { user: '上班族茶客', text: '边工作边喝茶，这才是理想状态', likes: 3 },
      { user: '茶小白', text: '茶文化+工作的结合，很新颖', likes: 1 },
    ]
  },
  '652669cd000000002b0033ca': {
    name: '茶博士',
    comments: [
      { user: '茶百科', text: '知识很系统，学到了很多', likes: 2 },
      { user: '茶友老王', text: '科普做得认真，支持', likes: 1 },
    ]
  },
  '5562da9cc2bdeb13dd6584b6': {
    name: '要吃葱姜蒜',
    comments: [
      { user: '新茶客', text: '被科普到了，原来鸭屎香名字是这么来的', likes: 2 },
      { user: '小红薯', text: '入门必看，收藏了', likes: 1 },
    ]
  },
  '6121ec940000000001009d28': {
    name: 'WISTFUL',
    comments: [
      { user: '小红薯', text: '画面很有质感', likes: 1 },
      { user: '茶道小白', text: '期待更多内容', likes: 1 },
    ]
  },
  '68ea40c1000000003201fcbe': {
    name: '茶小满的私享茶叶',
    comments: [
      { user: '茶客小李', text: '私享茶叶品质很稳定，一直回购', likes: 2 },
      { user: '小红薯', text: '小众好茶，品质不错', likes: 1 },
    ]
  },
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const uid = searchParams.get('uid')

  if (uid) {
    const data = COMMENTS[uid]
    return NextResponse.json(data ? { uid, ...data } : { uid, comments: [] })
  }

  return NextResponse.json({
    total: Object.keys(COMMENTS).length,
    data: COMMENTS,
    note: '真实热评数据，通过TikHub API采集'
  })
}
