// Mock data for TeaTrend Dashboard
// 凤凰单丛热点追踪系统的模拟数据

export interface Account {
  id: string;
  nickname: string;
  avatar: string;
  platform: 'xiaohongshu' | 'douyin' | 'shipinhao';
  location: string;
  bio: string;
  followers: number;
  postsCount: number;
  lastPostDate: string;
  tags: string[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Account;
  platform: 'xiaohongshu' | 'douyin' | 'shipinhao';
  likes: number;
  comments: number;
  collects: number;
  shares: number;
  tags: string[];
  publishedAt: string;
}

export interface Topic {
  keyword: string;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface DailyReport {
  id: string;
  date: string;
  summary: string;
  newAccounts: Account[];
  newPostsCount: number;
  hotKeywords: Topic[];
  aiSuggestions: AISuggestion[];
}

export interface AISuggestion {
  id: string;
  title: string;
  reason: string;
  format: string;
}

export interface TrendData {
  date: string;
  posts: number;
  engagement: number;
}

// 10个模拟账号
export const mockAccounts: Account[] = [
  {
    id: '1',
    nickname: '潮州茶农老张',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laozhang',
    platform: 'xiaohongshu',
    location: '广东潮州',
    bio: '凤凰单丛茶农，只做正宗高山茶',
    followers: 12800,
    postsCount: 328,
    lastPostDate: '2026-04-09',
    tags: ['茶农', '鸭屎香', '高山茶']
  },
  {
    id: '2',
    nickname: '单丛测评师小李',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoli',
    platform: 'douyin',
    location: '广东广州',
    bio: '专注凤凰单丛茶测评，分享真实品鉴体验',
    followers: 45600,
    postsCount: 189,
    lastPostDate: '2026-04-10',
    tags: ['测评', '蜜兰香', '品鉴']
  },
  {
    id: '3',
    nickname: '凤凰茶商王姐',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangjie',
    platform: 'xiaohongshu',
    location: '广东潮州',
    bio: '20年老字号，专注凤凰单丛批发零售',
    followers: 8900,
    postsCount: 567,
    lastPostDate: '2026-04-08',
    tags: ['茶商', '批发', '黄枝香']
  },
  {
    id: '4',
    nickname: '茶文化研究者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=researcher',
    platform: 'shipinhao',
    location: '北京',
    bio: '茶叶文化研究者，单丛茶爱好者',
    followers: 23400,
    postsCount: 156,
    lastPostDate: '2026-04-09',
    tags: ['文化', '芝兰香', '研究']
  },
  {
    id: '5',
    nickname: '潮汕功夫茶阿明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aming',
    platform: 'douyin',
    location: '广东汕头',
    bio: '分享功夫茶冲泡技巧，传承潮汕茶文化',
    followers: 67800,
    postsCount: 412,
    lastPostDate: '2026-04-10',
    tags: ['功夫茶', '冲泡', '通天香']
  },
  {
    id: '6',
    nickname: '茶园日记',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=garden',
    platform: 'xiaohongshu',
    location: '广东潮州',
    bio: '记录茶园四季，讲述单丛故事',
    followers: 34500,
    postsCount: 278,
    lastPostDate: '2026-04-07',
    tags: ['茶园', '鸭屎香', '春茶']
  },
  {
    id: '7',
    nickname: '单丛茶痴',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chichi',
    platform: 'shipinhao',
    location: '上海',
    bio: '收藏各类稀有单丛，分享品茗心得',
    followers: 19200,
    postsCount: 98,
    lastPostDate: '2026-04-06',
    tags: ['收藏', '稀有茶', '品鉴']
  },
  {
    id: '8',
    nickname: '茶艺师小红',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohong',
    platform: 'xiaohongshu',
    location: '广东深圳',
    bio: '国家中级茶艺师，分享茶艺知识',
    followers: 56700,
    postsCount: 389,
    lastPostDate: '2026-04-10',
    tags: ['茶艺', '蜜兰香', '教学']
  },
  {
    id: '9',
    nickname: '凤凰山采茶姑娘',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=girl',
    platform: 'douyin',
    location: '广东潮州',
    bio: '记录采茶日常，分享原产地好茶',
    followers: 82300,
    postsCount: 534,
    lastPostDate: '2026-04-09',
    tags: ['采茶', '原产地', '春茶']
  },
  {
    id: '10',
    nickname: '单丛百科',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=baike',
    platform: 'shipinhao',
    location: '全国',
    bio: '单丛茶知识分享，解答茶友疑惑',
    followers: 15600,
    postsCount: 245,
    lastPostDate: '2026-04-08',
    tags: ['知识', '科普', '问答']
  }
];

// 30条模拟帖子
export const mockPosts: Post[] = [
  {
    id: '1',
    title: '终于找到正宗的鸭屎香了！',
    content: '这款鸭屎香真的是我喝过最特别的，香气浓郁，回甘持久...',
    author: mockAccounts[1],
    platform: 'xiaohongshu',
    likes: 2340,
    comments: 156,
    collects: 890,
    shares: 234,
    tags: ['鸭屎香', '测评', '推荐'],
    publishedAt: '2026-04-10T08:30:00Z'
  },
  {
    id: '2',
    title: '蜜兰香为什么这么受欢迎？',
    content: '蜜兰香是凤凰单丛最经典的香型之一，今天来聊聊它的独特之处...',
    author: mockAccounts[3],
    platform: 'shipinhao',
    likes: 1820,
    comments: 89,
    collects: 456,
    shares: 123,
    tags: ['蜜兰香', '知识', '科普'],
    publishedAt: '2026-04-10T07:15:00Z'
  },
  {
    id: '3',
    title: '采茶季实拍：凤凰山上的忙碌身影',
    content: '春天的凤凰山，茶农们开始了忙碌的采茶季...',
    author: mockAccounts[8],
    platform: 'douyin',
    likes: 5670,
    comments: 234,
    collects: 1230,
    shares: 456,
    tags: ['采茶', '春茶', '凤凰山'],
    publishedAt: '2026-04-10T06:00:00Z'
  },
  {
    id: '4',
    title: '新手必看：单丛茶冲泡技巧大全',
    content: '很多朋友问我单丛怎么泡好喝，今天详细讲解...',
    author: mockAccounts[4],
    platform: 'douyin',
    likes: 3450,
    comments: 178,
    collects: 890,
    shares: 267,
    tags: ['冲泡', '技巧', '新手'],
    publishedAt: '2026-04-09T19:30:00Z'
  },
  {
    id: '5',
    title: '黄枝香单丛品鉴报告',
    content: '今天品鉴一款30年树龄的黄枝香，香气层次丰富...',
    author: mockAccounts[6],
    platform: 'xiaohongshu',
    likes: 1230,
    comments: 67,
    collects: 345,
    shares: 89,
    tags: ['黄枝香', '品鉴', '老茶'],
    publishedAt: '2026-04-09T17:20:00Z'
  },
  {
    id: '6',
    title: '芝兰香的香气秘密',
    content: '芝兰香为什么会有兰花香？一起来探秘...',
    author: mockAccounts[3],
    platform: 'shipinhao',
    likes: 2100,
    comments: 112,
    collects: 567,
    shares: 145,
    tags: ['芝兰香', '知识', '香气'],
    publishedAt: '2026-04-09T15:45:00Z'
  },
  {
    id: '7',
    title: '茶艺表演：功夫茶的正确打开方式',
    content: '潮汕功夫茶的冲泡是一门艺术，看完你就懂了...',
    author: mockAccounts[7],
    platform: 'xiaohongshu',
    likes: 4560,
    comments: 201,
    collects: 980,
    shares: 312,
    tags: ['功夫茶', '茶艺', '教学'],
    publishedAt: '2026-04-09T14:00:00Z'
  },
  {
    id: '8',
    title: '通天香是什么香？一篇讲清楚',
    content: '通天香是凤凰单丛十大香型中最特别的存在...',
    author: mockAccounts[9],
    platform: 'shipinhao',
    likes: 1890,
    comments: 95,
    collects: 432,
    shares: 112,
    tags: ['通天香', '科普', '香型'],
    publishedAt: '2026-04-09T12:30:00Z'
  },
  {
    id: '9',
    title: '我的茶园日记：春茶采摘进行时',
    content: '今年春茶产量不错，茶农们都在忙碌着...',
    author: mockAccounts[5],
    platform: 'xiaohongshu',
    likes: 2890,
    comments: 134,
    collects: 678,
    shares: 189,
    tags: ['茶园', '春茶', '采摘'],
    publishedAt: '2026-04-09T10:15:00Z'
  },
  {
    id: '10',
    title: '单丛茶保存技巧，这样存才不发霉',
    content: '茶叶保存不当会变质，教你几招正确保存方法...',
    author: mockAccounts[2],
    platform: 'douyin',
    likes: 3210,
    comments: 156,
    collects: 789,
    shares: 234,
    tags: ['保存', '技巧', '干货'],
    publishedAt: '2026-04-08T20:00:00Z'
  },
  {
    id: '11',
    title: '鸭屎香真的"香"吗？实测告诉你',
    content: '很多人被鸭屎香的名字劝退，今天来说说它的真实味道...',
    author: mockAccounts[1],
    platform: 'xiaohongshu',
    likes: 4120,
    comments: 234,
    collects: 1020,
    shares: 345,
    tags: ['鸭屎香', '测评', '真相'],
    publishedAt: '2026-04-08T18:30:00Z'
  },
  {
    id: '12',
    title: '茶农老张的一天',
    content: '跟随老张体验一天的采茶生活...',
    author: mockAccounts[0],
    platform: 'douyin',
    likes: 6780,
    comments: 345,
    collects: 1560,
    shares: 567,
    tags: ['茶农', '日常', '记录'],
    publishedAt: '2026-04-08T16:00:00Z'
  },
  {
    id: '13',
    title: '如何辨别正宗凤凰单丛？',
    content: '市面上假茶太多，学会这几招不被坑...',
    author: mockAccounts[2],
    platform: 'xiaohongshu',
    likes: 2340,
    comments: 123,
    collects: 567,
    shares: 178,
    tags: ['辨别', '技巧', '防骗'],
    publishedAt: '2026-04-08T14:20:00Z'
  },
  {
    id: '14',
    title: '蜜兰香 vs 鸭屎香，哪个更好喝？',
    content: '两款经典香型对比测评，看看你更喜欢哪个...',
    author: mockAccounts[1],
    platform: 'shipinhao',
    likes: 3890,
    comments: 201,
    collects: 890,
    shares: 267,
    tags: ['对比', '测评', '蜜兰香'],
    publishedAt: '2026-04-08T11:45:00Z'
  },
  {
    id: '15',
    title: '单丛茶价格揭秘：多少钱一斤才算合理？',
    content: '从几十到几千的单丛都有，差别在哪里...',
    author: mockAccounts[2],
    platform: 'douyin',
    likes: 4560,
    comments: 278,
    collects: 1120,
    shares: 389,
    tags: ['价格', '选购', '干货'],
    publishedAt: '2026-04-07T19:30:00Z'
  },
  {
    id: '16',
    title: '茶汤颜色透露的秘密',
    content: '单丛茶汤从浅黄到橙红，每种颜色代表什么...',
    author: mockAccounts[7],
    platform: 'xiaohongshu',
    likes: 1890,
    comments: 89,
    collects: 456,
    shares: 123,
    tags: ['知识', '茶汤', '品鉴'],
    publishedAt: '2026-04-07T17:00:00Z'
  },
  {
    id: '17',
    title: '凤凰山的云海太美了！',
    content: '海拔1000米的凤凰山，云海环绕，如同仙境...',
    author: mockAccounts[8],
    platform: 'douyin',
    likes: 7890,
    comments: 456,
    collects: 2100,
    shares: 678,
    tags: ['风景', '凤凰山', '云海'],
    publishedAt: '2026-04-07T15:20:00Z'
  },
  {
    id: '18',
    title: '单丛茶的功效与禁忌',
    content: '喝茶也要讲究，这些功效和禁忌你要知道...',
    author: mockAccounts[9],
    platform: 'shipinhao',
    likes: 2340,
    comments: 112,
    collects: 678,
    shares: 189,
    tags: ['功效', '健康', '知识'],
    publishedAt: '2026-04-07T13:00:00Z'
  },
  {
    id: '19',
    title: '我的收藏：20年的老单丛',
    content: '分享一款存放20年的老单丛，价值连城...',
    author: mockAccounts[6],
    platform: 'xiaohongshu',
    likes: 3450,
    comments: 178,
    collects: 890,
    shares: 234,
    tags: ['收藏', '老茶', '珍贵'],
    publishedAt: '2026-04-07T10:30:00Z'
  },
  {
    id: '20',
    title: '如何选择适合自己的单丛？',
    content: '新手入门必看，根据口味选择合适的香型...',
    author: mockAccounts[4],
    platform: 'douyin',
    likes: 2890,
    comments: 145,
    collects: 780,
    shares: 234,
    tags: ['选购', '新手', '指南'],
    publishedAt: '2026-04-06T20:15:00Z'
  },
  {
    id: '21',
    title: '潮汕人为什么都爱喝单丛？',
    content: '揭秘潮汕人与单丛茶的不解之缘...',
    author: mockAccounts[3],
    platform: 'shipinhao',
    likes: 4120,
    comments: 234,
    collects: 980,
    shares: 312,
    tags: ['文化', '潮汕', '习俗'],
    publishedAt: '2026-04-06T17:45:00Z'
  },
  {
    id: '22',
    title: '茶空间设计：我的小茶室',
    content: '分享我的私人茶室设计案例...',
    author: mockAccounts[7],
    platform: 'xiaohongshu',
    likes: 3210,
    comments: 167,
    collects: 789,
    shares: 198,
    tags: ['茶室', '设计', '空间'],
    publishedAt: '2026-04-06T15:30:00Z'
  },
  {
    id: '23',
    title: '古法制作：传统炭焙工艺',
    content: '炭焙是单丛茶的灵魂，详解传统工艺...',
    author: mockAccounts[0],
    platform: 'douyin',
    likes: 4560,
    comments: 234,
    collects: 1120,
    shares: 345,
    tags: ['工艺', '炭焙', '传统'],
    publishedAt: '2026-04-06T13:00:00Z'
  },
  {
    id: '24',
    title: '单丛茶冷泡法：夏日必备',
    content: '冷泡单丛意想不到的好喝，教你正确方法...',
    author: mockAccounts[1],
    platform: 'xiaohongshu',
    likes: 2340,
    comments: 112,
    collects: 567,
    shares: 156,
    tags: ['冷泡', '方法', '夏日'],
    publishedAt: '2026-04-06T11:20:00Z'
  },
  {
    id: '25',
    title: '十大香型盘点：你喝过几种？',
    content: '凤凰单丛十大香型，一文全解析...',
    author: mockAccounts[9],
    platform: 'shipinhao',
    likes: 5670,
    comments: 289,
    collects: 1340,
    shares: 423,
    tags: ['香型', '盘点', '知识'],
    publishedAt: '2026-04-05T19:00:00Z'
  },
  {
    id: '26',
    title: '茶叶包装设计分享',
    content: '我们的新包装上线了，大家觉得怎么样...',
    author: mockAccounts[2],
    platform: 'xiaohongshu',
    likes: 1560,
    comments: 78,
    collects: 345,
    shares: 89,
    tags: ['包装', '设计', '分享'],
    publishedAt: '2026-04-05T16:30:00Z'
  },
  {
    id: '27',
    title: '采茶姑娘的日常',
    content: '每天凌晨4点起床采茶，虽然辛苦但很满足...',
    author: mockAccounts[8],
    platform: 'douyin',
    likes: 8900,
    comments: 567,
    collects: 2340,
    shares: 789,
    tags: ['日常', '采茶', '真实'],
    publishedAt: '2026-04-05T14:00:00Z'
  },
  {
    id: '28',
    title: '单丛茶周边产品测评',
    content: '茶具、茶盘、茶宠，哪些值得买...',
    author: mockAccounts[1],
    platform: 'shipinhao',
    likes: 2100,
    comments: 95,
    collects: 456,
    shares: 123,
    tags: ['测评', '周边', '购物'],
    publishedAt: '2026-04-05T11:45:00Z'
  },
  {
    id: '29',
    title: '茶道与人生',
    content: '喝茶十年悟出的道理，分享给大家...',
    author: mockAccounts[6],
    platform: 'xiaohongshu',
    likes: 3450,
    comments: 189,
    collects: 890,
    shares: 267,
    tags: ['感悟', '人生', '茶道'],
    publishedAt: '2026-04-04T18:20:00Z'
  },
  {
    id: '30',
    title: '新茶上市：2024年春茶尝鲜',
    content: '今年的新茶已经上市，欢迎品鉴...',
    author: mockAccounts[0],
    platform: 'douyin',
    likes: 5670,
    comments: 312,
    collects: 1450,
    shares: 456,
    tags: ['新茶', '春茶', '上市'],
    publishedAt: '2026-04-04T15:00:00Z'
  }
];

// 热门话题 TOP10
export const mockTopics: Topic[] = [
  { keyword: '鸭屎香', mentions: 8920, trend: 'up', change: 23 },
  { keyword: '蜜兰香', mentions: 7650, trend: 'up', change: 18 },
  { keyword: '春茶上市', mentions: 6540, trend: 'up', change: 15 },
  { keyword: '凤凰山', mentions: 5430, trend: 'stable', change: 2 },
  { keyword: '功夫茶', mentions: 4890, trend: 'down', change: -5 },
  { keyword: '黄枝香', mentions: 4320, trend: 'up', change: 12 },
  { keyword: '芝兰香', mentions: 3870, trend: 'stable', change: 3 },
  { keyword: '通天香', mentions: 3450, trend: 'up', change: 28 },
  { keyword: '采茶季', mentions: 2980, trend: 'down', change: -8 },
  { keyword: '单丛测评', mentions: 2560, trend: 'up', change: 16 }
];

// 7天趋势数据
export const mockTrendData: TrendData[] = [
  { date: '2026-04-04', posts: 42, engagement: 12500 },
  { date: '2026-04-05', posts: 38, engagement: 11200 },
  { date: '2026-04-06', posts: 51, engagement: 15800 },
  { date: '2026-04-07', posts: 65, engagement: 19200 },
  { date: '2026-04-08', posts: 58, engagement: 17400 },
  { date: '2026-04-09', posts: 72, engagement: 21500 },
  { date: '2026-04-10', posts: 45, engagement: 13800 }
];

// 3份日报数据
export const mockDailyReports: DailyReport[] = [
  {
    id: '1',
    date: '2026-04-10',
    summary: '今日凤凰单丛茶相关内容持续升温。鸭屎香仍然是热度最高的香型，蜜兰香紧随其后。春茶季带动了大量新茶上市相关内容，凤凰山采茶场景成为短视频热门素材。茶艺教学类内容互动率较高，显示出用户对冲泡技巧的强烈需求。',
    newAccounts: [mockAccounts[8], mockAccounts[9]],
    newPostsCount: 45,
    hotKeywords: [
      { keyword: '鸭屎香', mentions: 890, trend: 'up', change: 25 },
      { keyword: '蜜兰香', mentions: 760, trend: 'up', change: 18 },
      { keyword: '春茶', mentions: 650, trend: 'up', change: 15 },
      { keyword: '采茶', mentions: 540, trend: 'up', change: 12 }
    ],
    aiSuggestions: [
      {
        id: '1',
        title: '「鸭屎香」入门指南',
        reason: '鸭屎香是搜索热度最高的香型，但很多新用户对其名称存在误解，适合推出科普类内容',
        format: '图文笔记'
      },
      {
        id: '2',
        title: '春茶冲泡教学视频',
        reason: '春茶季带动了大量新茶相关内容，互动数据显示教学类视频完播率高出平均水平30%',
        format: '短视频'
      },
      {
        id: '3',
        title: '「蜜兰香」品鉴对比',
        reason: '蜜兰香与鸭屎香经常被一起比较，做对比测评能吸引双方粉丝关注',
        format: '直播'
      }
    ]
  },
  {
    id: '2',
    date: '2026-04-09',
    summary: '昨日平台内容发布量显著增长，较前日增长约30%。茶农日常类内容表现突出，展现原产地真实生活的内容更易获得高互动。功夫茶相关话题热度有所下降，但茶艺教学类内容需求依然旺盛。',
    newAccounts: [mockAccounts[5], mockAccounts[6]],
    newPostsCount: 72,
    hotKeywords: [
      { keyword: '采茶', mentions: 720, trend: 'up', change: 20 },
      { keyword: '茶农', mentions: 680, trend: 'up', change: 15 },
      { keyword: '鸭屎香', mentions: 650, trend: 'up', change: 10 },
      { keyword: '茶艺', mentions: 590, trend: 'stable', change: 3 }
    ],
    aiSuggestions: [
      {
        id: '4',
        title: '「茶农日记」系列内容',
        reason: '茶农类账号涨粉迅速，真实记录能引发用户共鸣，建议做成系列内容',
        format: '短视频'
      },
      {
        id: '5',
        title: '新手入门口腔茶选购指南',
        reason: '新手用户搜索频繁，但缺乏系统性指导，内容缺口明显',
        format: '图文笔记'
      }
    ]
  },
  {
    id: '3',
    date: '2026-04-08',
    summary: '本周内容整体呈现上升趋势，通天香作为小众香型热度上升最快。价格相关话题讨论增加，反映出用户购买意愿增强。茶具和周边产品类内容开始活跃，显示出生态内容的商业价值。',
    newAccounts: [mockAccounts[3], mockAccounts[7]],
    newPostsCount: 58,
    hotKeywords: [
      { keyword: '通天香', mentions: 450, trend: 'up', change: 35 },
      { keyword: '价格', mentions: 420, trend: 'up', change: 22 },
      { keyword: '茶具', mentions: 380, trend: 'up', change: 18 },
      { keyword: '蜜兰香', mentions: 350, trend: 'stable', change: 5 }
    ],
    aiSuggestions: [
      {
        id: '6',
        title: '「通天香」深度测评',
        reason: '通天香热度上升最快但内容较少，是抢占用户心智的好时机',
        format: '短视频'
      },
      {
        id: '7',
        title: '单丛茶送礼指南',
        reason: '临近节日，送礼需求增加，价格敏感度上升',
        format: '图文笔记'
      }
    ]
  }
];

// 统计数据
export const mockStats = {
  todayPosts: 45,
  totalAccounts: 10,
  hotTopicsCount: 10,
  avgEngagement: 3245
};
