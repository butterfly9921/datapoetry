import { NextResponse } from 'next/server';

const NEWS_API = 'https://60s.viki.moe/v2/60s';
const BING_API = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1';

export interface NewsItem {
  text: string;
  sourceUrl: string;
}

export interface DailyNewsData {
  date: string;
  news: NewsItem[];
  cover: string;
  coverCopyright?: string;
  topics: TopicGroup[];
}

interface TopicGroup {
  id: string;
  name: string;
  news: NewsItem[];
}

/** 为每条新闻生成搜索链接 */
function enrichNews(newsList: string[]): NewsItem[] {
  return newsList.map((text) => ({
    text,
    sourceUrl: `https://www.bing.com/search?q=${encodeURIComponent(text)}`,
  }));
}

/** 关键词分类 — 每条新闻归入第一个匹配的主题（要闻 > 文娱），都不匹配则仅出现在「全部」 */
function categorize(news: NewsItem[]): TopicGroup[] {
  const yaowen: NewsItem[] = [];
  const wenyu: NewsItem[] = [];

  const yaowenKW = [
    '经济', '金融', '股市', '央行', '汇率', 'GDP', '投资', 'A股', '基金',
    '政策', '法规', '国务院', '人社部', '住建部', '教育部', '发改委', '商务部',
    '证监会', '银保监', '立法', '条例', '税',
    'AI', '人工智能', '芯片', '半导体', '5G', '互联网', '科技', '卫星', '航天', '新能源',
    '美国', '日本', '欧洲', '俄罗斯', '韩国', '朝鲜', '国际', '外交', '北约', '军事', '联合国',
    '贸易', '制裁', '关税', '谈判',
  ];

  const wenyuKW = [
    '电影', '音乐', '明星', '综艺', '演员', '票房', '球赛', '冠军', '奥运', '体育',
    '足球', '篮球', '比赛', '演唱会', '歌曲', '电视剧', '娱乐', '艺人', '导演', '专辑',
    '舞台', '演出', '网剧', '动漫', '游戏',
  ];

  for (const item of news) {
    // 要闻优先
    if (yaowenKW.some((kw) => item.text.includes(kw))) {
      yaowen.push(item);
      continue;
    }
    // 其次文娱
    if (wenyuKW.some((kw) => item.text.includes(kw))) {
      wenyu.push(item);
    }
  }

  return [
    { id: 'yaowen', name: '要闻', news: yaowen },
    { id: 'wenyu', name: '文娱', news: wenyu },
  ];
}

async function fetchBingWallpaper(): Promise<{ url: string; copyright: string }> {
  try {
    const res = await fetch(BING_API, { next: { revalidate: 3600 } });
    const json = await res.json();
    if (json.images?.length > 0) {
      const img = json.images[0];
      return {
        url: `https://www.bing.com${img.url}`,
        copyright: img.copyright || '',
      };
    }
  } catch { /* ignore */ }
  return { url: '', copyright: '' };
}

export async function GET() {
  try {
    const [newsRes, bing] = await Promise.all([
      fetch(NEWS_API, { next: { revalidate: 3600 } }),
      fetchBingWallpaper(),
    ]);

    if (!newsRes.ok) {
      return NextResponse.json(
        { success: false, error: 'NEWS_API_ERROR', message: '新闻接口暂不可用' },
        { status: 502 }
      );
    }

    const raw = await newsRes.json();

    if (raw.code !== 200 || !raw.data) {
      return NextResponse.json(
        { success: false, error: 'NEWS_API_ERROR', message: raw.message || '新闻数据异常' },
        { status: 502 }
      );
    }

    const rawNews: string[] = raw.data.news || [];
    const newsItems = enrichNews(rawNews);

    const data: DailyNewsData = {
      date: raw.data.date,
      news: newsItems,
      // 优先 Bing 每日壁纸（高清，无版权争议），降级到微信封面
      cover: bing.url || raw.data.cover || '',
      coverCopyright: bing.copyright || undefined,
      topics: categorize(newsItems),
    };

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: 'NETWORK_ERROR', message: e.message || '网络请求失败' },
      { status: 500 }
    );
  }
}
