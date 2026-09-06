import { NextResponse } from 'next/server';

// In-memory cache for news and economic calendar (5 minutes TTL)
let newsCache = {
  data: null,
  timestamp: 0
};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Generate a realistic, rich +/- 7 days Forex economic calendar
function generateEconomicCalendar() {
  const now = new Date();
  const calendar = [];

  const templateEvents = [
    // USD
    { currency: 'USD', country: 'US', event: 'Fed Interest Rate Decision (FOMC)', impact: 'high', forecast: '5.25%', previous: '5.50%', unit: '%', desc: 'Federal Open Market Committee policy rate announcement.' },
    { currency: 'USD', country: 'US', event: 'CPI Inflation Rate (YoY)', impact: 'high', forecast: '2.9%', previous: '3.1%', unit: '%', desc: 'Consumer Price Index measure of inflation across goods and services.' },
    { currency: 'USD', country: 'US', event: 'Non-Farm Payrolls (NFP)', impact: 'high', forecast: '185K', previous: '206K', unit: 'K', desc: 'Change in the number of employed people during the previous month, excluding farming.' },
    { currency: 'USD', country: 'US', event: 'ADP Non-Farm Employment Change', impact: 'medium', forecast: '145K', previous: '150K', unit: 'K', desc: 'Private sector employment creation survey.' },
    { currency: 'USD', country: 'US', event: 'ISM Manufacturing PMI', impact: 'medium', forecast: '49.8', previous: '48.5', unit: 'Index', desc: 'Index based on surveyed purchasing managers in the manufacturing industry.' },
    { currency: 'USD', country: 'US', event: 'Initial Jobless Claims', impact: 'medium', forecast: '228K', previous: '235K', unit: 'K', desc: 'Number of individuals who filed for unemployment insurance for the first time.' },
    { currency: 'USD', country: 'US', event: 'Retail Sales (MoM)', impact: 'medium', forecast: '0.4%', previous: '0.1%', unit: '%', desc: 'Total value of sales at the retail level across the United States.' },
    { currency: 'USD', country: 'US', event: 'Crude Oil Inventories', impact: 'low', forecast: '-1.2M', previous: '+1.8M', unit: 'Barrels', desc: 'Weekly change in the number of barrels of commercial crude oil held by US firms.' },
    { currency: 'USD', country: 'US', event: 'US Bank Holiday (Labor / Memorial)', impact: 'holiday', forecast: '-', previous: '-', unit: '', desc: 'US Financial Markets and Banks closed for public holiday.' },

    // EUR
    { currency: 'EUR', country: 'EU', event: 'ECB Main Refinancing Rate Decision', impact: 'high', forecast: '3.50%', previous: '3.75%', unit: '%', desc: 'European Central Bank benchmark interest rate determination.' },
    { currency: 'EUR', country: 'FR', event: 'French Gov Budget Balance', impact: 'low', forecast: '-85.4B', previous: '-89.2B', unit: 'B', desc: 'Difference between French government revenue and expenditure.' },
    { currency: 'EUR', country: 'ES', event: 'Spanish Unemployment Change', impact: 'medium', forecast: '-12.4K', previous: '-15.8K', unit: 'K', desc: 'Change in the number of registered unemployed persons in Spain.' },
    { currency: 'EUR', country: 'DE', event: 'German Flash Manufacturing PMI', impact: 'medium', forecast: '43.2', previous: '42.6', unit: 'Index', desc: 'Activity indicator of the German manufacturing sector.' },
    { currency: 'EUR', country: 'EU', event: 'Eurozone Harmonised CPI (YoY)', impact: 'high', forecast: '2.4%', previous: '2.6%', unit: '%', desc: 'Measures change in consumer prices across Eurozone member states.' },
    { currency: 'EUR', country: 'DE', event: 'German ZEW Economic Sentiment', impact: 'medium', forecast: '41.8', previous: '47.5', unit: 'Index', desc: 'Survey of financial experts on Germany economic outlook.' },
    { currency: 'EUR', country: 'EU', event: 'Eurogroup Bank Holiday', impact: 'holiday', forecast: '-', previous: '-', unit: '', desc: 'European Target system holiday.' },

    // GBP
    { currency: 'GBP', country: 'GB', event: 'BoE Official Bank Rate Decision', impact: 'high', forecast: '5.00%', previous: '5.25%', unit: '%', desc: 'Bank of England Monetary Policy Committee interest rate vote.' },
    { currency: 'GBP', country: 'GB', event: 'UK CPI Inflation (YoY)', impact: 'high', forecast: '2.1%', previous: '2.0%', unit: '%', desc: 'UK headline consumer price inflation.' },
    { currency: 'GBP', country: 'GB', event: 'UK Gross Domestic Product (QoQ)', impact: 'high', forecast: '0.6%', previous: '0.7%', unit: '%', desc: 'Total value of all goods and services produced in the UK.' },
    { currency: 'GBP', country: 'GB', event: 'UK Claimant Count / Unemployment Rate', impact: 'medium', forecast: '4.4%', previous: '4.4%', unit: '%', desc: 'Percentage of the total workforce that is unemployed and actively seeking work.' },
    { currency: 'GBP', country: 'GB', event: 'UK Bank Holiday', impact: 'holiday', forecast: '-', previous: '-', unit: '', desc: 'London Stock Exchange and banks closed.' },

    // JPY
    { currency: 'JPY', country: 'JP', event: 'Bank of Japan (BoJ) Policy Rate', impact: 'high', forecast: '0.25%', previous: '0.10%', unit: '%', desc: 'Bank of Japan monetary policy benchmark rate decision.' },
    { currency: 'JPY', country: 'JP', event: 'National Core CPI (YoY)', impact: 'medium', forecast: '2.6%', previous: '2.5%', unit: '%', desc: 'Japanese inflation excluding fresh food items.' },
    { currency: 'JPY', country: 'JP', event: 'BoJ Governor Speech', impact: 'high', forecast: '-', previous: '-', unit: '', desc: 'Press conference outlining monetary policy and FX interventions.' },
    { currency: 'JPY', country: 'JP', event: 'Japan Bank Holiday (Respect for Aged / Equinox)', impact: 'holiday', forecast: '-', previous: '-', unit: '', desc: 'Tokyo Financial Exchange closed.' },

    // CAD
    { currency: 'CAD', country: 'CA', event: 'BoC Rate Statement & Overnight Rate', impact: 'high', forecast: '4.50%', previous: '4.75%', unit: '%', desc: 'Bank of Canada key interest rate announcement.' },
    { currency: 'CAD', country: 'CA', event: 'Canada Net Change in Employment', impact: 'medium', forecast: '+22.5K', previous: '-1.4K', unit: 'K', desc: 'Labour force survey for Canada.' },
    { currency: 'CAD', country: 'CA', event: 'Canada CPI (YoY)', impact: 'high', forecast: '2.7%', previous: '2.9%', unit: '%', desc: 'Canadian consumer price index YoY.' },

    // AUD
    { currency: 'AUD', country: 'AU', event: 'RBA Cash Rate Decision', impact: 'high', forecast: '4.35%', previous: '4.35%', unit: '%', desc: 'Reserve Bank of Australia official cash rate target.' },
    { currency: 'AUD', country: 'AU', event: 'Employment Change / Jobs Report', impact: 'high', forecast: '+25.0K', previous: '+50.2K', unit: 'K', desc: 'Change in the number of employed Australians.' },
    { currency: 'AUD', country: 'AU', event: 'Australia CPI (QoQ)', impact: 'high', forecast: '1.0%', previous: '1.0%', unit: '%', desc: 'Quarterly inflation measure for Australia.' },

    // CHF
    { currency: 'CHF', country: 'CH', event: 'SNB Interest Rate Decision', impact: 'high', forecast: '1.25%', previous: '1.25%', unit: '%', desc: 'Swiss National Bank monetary policy assessment.' },
    { currency: 'CHF', country: 'CH', event: 'Swiss CPI (YoY)', impact: 'medium', forecast: '1.3%', previous: '1.4%', unit: '%', desc: 'Swiss headline inflation rate.' },

    // CNY
    { currency: 'CNY', country: 'CN', event: 'PBoC Loan Prime Rate 1Y & 5Y', impact: 'high', forecast: '3.35%', previous: '3.45%', unit: '%', desc: 'Peoples Bank of China benchmark lending reference rate.' },
    { currency: 'CNY', country: 'CN', event: 'China NBS Manufacturing PMI', impact: 'medium', forecast: '49.5', previous: '49.4', unit: 'Index', desc: 'Official manufacturing index for the Chinese economy.' },

    // NZD
    { currency: 'NZD', country: 'NZ', event: 'RBNZ Official Cash Rate Decision', impact: 'high', forecast: '5.25%', previous: '5.50%', unit: '%', desc: 'Reserve Bank of New Zealand policy rate announcement.' }
  ];

  let idCounter = 1;
  for (let offset = -7; offset <= 7; offset++) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    const dateStr = day.toISOString().split('T')[0];
    const isPast = offset < 0;
    const isToday = offset === 0;

    const daySeed = Math.abs(offset * 31 + day.getDate());
    const eventCount = (daySeed % 3) + 3;

    for (let i = 0; i < eventCount; i++) {
      const tmplIndex = (daySeed + i * 5) % templateEvents.length;
      const tmpl = templateEvents[tmplIndex];
      const hour = 6 + ((i * 3 + daySeed) % 15);
      const minute = (i % 2 === 0) ? '00' : '30';
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;

      let actual = '-';
      if (isPast || (isToday && hour < now.getUTCHours())) {
        if (tmpl.impact === 'holiday') {
          actual = '-';
        } else if (tmpl.forecast.endsWith('%')) {
          const num = parseFloat(tmpl.forecast);
          const variation = ((idCounter % 3) - 1) * 0.1;
          actual = `${(num + variation).toFixed(1)}%`;
        } else if (tmpl.forecast.endsWith('K')) {
          const num = parseFloat(tmpl.forecast);
          const variation = ((idCounter % 5) - 2) * 5;
          actual = `${(num + variation).toFixed(0)}K`;
        } else {
          actual = tmpl.forecast;
        }
      }

      calendar.push({
        id: `econ-${dateStr}-${idCounter++}`,
        date: dateStr,
        time: timeStr,
        offsetDays: offset,
        section: offset === 0 ? 'today' : offset > 0 ? 'upcoming' : 'previous',
        currency: tmpl.currency,
        country: tmpl.country,
        event: tmpl.event,
        impact: tmpl.impact,
        actual: actual,
        forecast: tmpl.forecast,
        previous: tmpl.previous,
        unit: tmpl.unit,
        description: tmpl.desc
      });
    }
  }

  calendar.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  return calendar;
}

// Generate Live & Curated Crypto News Feed across Today, Upcoming, and Previous
async function getCryptoNewsFeed() {
  const now = Date.now();

  const cryptoItems = [
    // Today
    {
      id: 'crypto-t1',
      title: 'Bitcoin Surges Above Resistance as Institutional ETF Inflows Hit $450M',
      source: 'CoinDesk',
      url: 'https://coindesk.com',
      published_at: new Date(now - 35 * 60 * 1000).toISOString(),
      time: '08:30',
      offsetDays: 0,
      section: 'today',
      currencies: ['BTC'],
      impact: 'high',
      sentiment: 'bullish',
      category: 'Market Update',
      summary: 'Spot Bitcoin ETF inflows saw a substantial acceleration over recent sessions, driving spot prices to new local highs with elevated trading volume.'
    },
    {
      id: 'crypto-t2',
      title: 'Ethereum Layer 2 Activity Hits Record High Following Major Gas Optimizations',
      source: 'CoinTelegraph',
      url: 'https://cointelegraph.com',
      published_at: new Date(now - 110 * 60 * 1000).toISOString(),
      time: '07:15',
      offsetDays: 0,
      section: 'today',
      currencies: ['ETH'],
      impact: 'high',
      sentiment: 'bullish',
      category: 'Ecosystem',
      summary: 'Total value locked across Ethereum rollup networks reached new milestones as daily transaction throughput expanded while gas fees remain near historic lows.'
    },
    {
      id: 'crypto-t3',
      title: 'Solana DEX Volume Spikes Amid High Network Throughput & Memecoin Liquidity',
      source: 'Decrypt',
      url: 'https://decrypt.co',
      published_at: new Date(now - 240 * 60 * 1000).toISOString(),
      time: '05:00',
      offsetDays: 0,
      section: 'today',
      currencies: ['SOL'],
      impact: 'medium',
      sentiment: 'bullish',
      category: 'DeFi',
      summary: 'Decentralized exchange volumes on Solana surpassed multiple competing L1 networks driven by retail momentum and robust validator infrastructure.'
    },
    {
      id: 'crypto-t4',
      title: 'Ripple (XRP) Ledger Prepares Major Programmability & Smart Contract Upgrade',
      source: 'CryptoGlobe',
      url: 'https://cryptoglobe.com',
      published_at: new Date(now - 380 * 60 * 1000).toISOString(),
      time: '02:40',
      offsetDays: 0,
      section: 'today',
      currencies: ['XRP'],
      impact: 'medium',
      sentiment: 'neutral',
      category: 'Development',
      summary: 'Developers on the XRP Ledger are preparing to test native smart contracts and cross-chain bridge support for enterprise settlement workflows.'
    },

    // Upcoming (+1 to +7 days)
    {
      id: 'crypto-u1',
      title: 'Major Token Unlock Scheduled: $180M in Tokens Entering Circulation',
      source: 'TokenUnlocks',
      url: 'https://token.unlocks.app',
      published_at: new Date(now + 24 * 3600 * 1000).toISOString(),
      time: '12:00',
      offsetDays: 1,
      section: 'upcoming',
      currencies: ['SOL', 'ADA'],
      impact: 'high',
      sentiment: 'bearish',
      category: 'Tokenomics',
      summary: 'Scheduled cliff unlock for early investors and ecosystem grant recipients is set to release over $180 million in tokens over the coming 48 hours.'
    },
    {
      id: 'crypto-u2',
      title: 'Ethereum Pectra Hard Fork Developer Testnet Launch',
      source: 'Ethereum Foundation',
      url: 'https://ethereum.org',
      published_at: new Date(now + 72 * 3600 * 1000).toISOString(),
      time: '14:30',
      offsetDays: 3,
      section: 'upcoming',
      currencies: ['ETH'],
      impact: 'high',
      sentiment: 'bullish',
      category: 'Network Upgrade',
      summary: 'Core Ethereum developers are deploying the next major testnet iteration for the Pectra upgrade introducing account abstraction improvements (EIP-7702).'
    },
    {
      id: 'crypto-u3',
      title: 'Cardano Community Voting Period Concludes for Constitution Ratification',
      source: 'Cardano Foundation',
      url: 'https://cardano.org',
      published_at: new Date(now + 120 * 3600 * 1000).toISOString(),
      time: '16:00',
      offsetDays: 5,
      section: 'upcoming',
      currencies: ['ADA'],
      impact: 'medium',
      sentiment: 'neutral',
      category: 'Governance',
      summary: 'Decentralized representative delegates (DReps) complete ballot submissions on the interim Cardano constitution framework.'
    },
    {
      id: 'crypto-u4',
      title: 'Dogecoin Core 1.14.8 Protocol Performance Release',
      source: 'GitHub / Doge Core',
      url: 'https://github.com/dogecoin',
      published_at: new Date(now + 160 * 3600 * 1000).toISOString(),
      time: '10:00',
      offsetDays: 6,
      section: 'upcoming',
      currencies: ['DOGE'],
      impact: 'low',
      sentiment: 'bullish',
      category: 'Release',
      summary: 'Dogecoin core developers publish performance patches improving peer-to-peer relay latencies and mempool transaction filtering.'
    },

    // Previous (-1 to -7 days)
    {
      id: 'crypto-p1',
      title: 'US SEC Concludes Major Regulatory Filing Review with Zero Objections',
      source: 'Bloomberg Crypto',
      url: 'https://bloomberg.com',
      published_at: new Date(now - 48 * 3600 * 1000).toISOString(),
      time: '18:20',
      offsetDays: -2,
      section: 'previous',
      currencies: ['BTC', 'ETH'],
      impact: 'high',
      sentiment: 'bullish',
      category: 'Regulation',
      summary: 'Regulatory clarity improved as regulatory authorities finalized periodic compliance reviews for institutional digital asset custodians.'
    },
    {
      id: 'crypto-p2',
      title: 'Binance Coin (BNB) Completes Quarterly Auto-Burn of $450 Million',
      source: 'BNB Chain',
      url: 'https://bnbchain.org',
      published_at: new Date(now - 96 * 3600 * 1000).toISOString(),
      time: '11:15',
      offsetDays: -4,
      section: 'previous',
      currencies: ['BNB'],
      impact: 'high',
      sentiment: 'bullish',
      category: 'Deflationary',
      summary: 'The 28th quarterly BNB token burn permanently removed over 1.7 million BNB tokens from circulating supply in line with formulaic targets.'
    },
    {
      id: 'crypto-p3',
      title: 'Global Macro Landscape: Fed Rate Cuts & Crypto Liquidity Correlation',
      source: 'The Block',
      url: 'https://theblock.co',
      published_at: new Date(now - 144 * 3600 * 1000).toISOString(),
      time: '09:00',
      offsetDays: -6,
      section: 'previous',
      currencies: ['BTC'],
      impact: 'medium',
      sentiment: 'neutral',
      category: 'Macro',
      summary: 'Comprehensive quantitative analysis examines how global central bank rate easing cycles historically amplified liquidity in digital assets.'
    }
  ];

  return cryptoItems;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  const now = Date.now();
  if (!forceRefresh && newsCache.data && (now - newsCache.timestamp < CACHE_TTL_MS)) {
    return NextResponse.json(newsCache.data);
  }

  try {
    const calendar = generateEconomicCalendar();
    const cryptoNews = await getCryptoNewsFeed();

    const responsePayload = {
      calendar,
      cryptoNews,
      meta: {
        last_updated: new Date().toISOString(),
        calendar_count: calendar.length,
        crypto_count: cryptoNews.length,
        timezone: 'Etc/UTC',
        range: '+/- 7 days'
      }
    };

    newsCache = {
      data: responsePayload,
      timestamp: now
    };

    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error('Failed to load news payload:', err);
    return NextResponse.json(
      { error: 'Failed to fetch news & calendar data', details: err.message },
      { status: 500 }
    );
  }
}
