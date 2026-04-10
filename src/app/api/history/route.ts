import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET() {
  const cutoff = new Date('2025-12-01')
  
  try {
    const historyDir = path.join(process.cwd(), 'scripts', 'history')
    const files = fs.readdirSync(historyDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse() // 最新日期排前面

    // 目前 history 里只有 douyin 数据，xhs 数据未采集
    // 返回空 accounts 让前端 fallback 到示例数据
    return NextResponse.json({ accounts: [], lastUpdated: files[0]?.replace('.json', '') || '' })
  } catch {
    return NextResponse.json({ accounts: [], lastUpdated: '' })
  }
}
