import { getRedisClient, acquireDistributedLock, releaseDistributedLock } from './redis.service';

declare const process: {
  env: Record<string, string | undefined>;
};

const HORIZON_URL = process.env.HORIZON_URL ?? 'https://horizon-testnet.stellar.org';
const REFRESH_INTERVAL_MS = 60_000; // 60 seconds
const LOCK_TTL_SECONDS = 55; // Slightly less than refresh interval for failover
const LOCK_KEY = 'mm:exchange:refresh:lock';
const CACHE_PREFIX = 'mm:exchange:rate:';

export interface ExchangeRate {
  baseAsset: string;
  counterAsset: string;
  rate: number;
  lastUpdated: Date;
}

// Asset pairs to monitor (6 pairs in both directions)
const ASSET_PAIRS = [
  { base: 'native', counter: 'USDC' },
  { base: 'USDC', counter: 'native' },
  { base: 'native', counter: 'PYUSD' },
  { base: 'PYUSD', counter: 'native' },
  { base: 'USDC', counter: 'PYUSD' },
  { base: 'PYUSD', counter: 'USDC' },
];

async function fetchOrderbook(baseAsset: string, counterAsset: string): Promise<number | null> {
  try {
    let baseParam = 'native';
    let baseIssuer = undefined;
    
    if (baseAsset !== 'native') {
      baseParam = baseAsset;
      // In production, you'd need the actual issuer address for non-native assets
      baseIssuer = process.env[`${baseAsset}_ISSUER`];
    }

    let counterParam = 'native';
    let counterIssuer = undefined;
    
    if (counterAsset !== 'native') {
      counterParam = counterAsset;
      counterIssuer = process.env[`${counterAsset}_ISSUER`];
    }

    let url = `${HORIZON_URL}/order_book?selling_asset_type=${baseParam}`;
    if (baseIssuer) {
      url += `&selling_asset_issuer=${baseIssuer}`;
    }
    if (baseAsset !== 'native') {
      url += `&selling_asset_code=${baseAsset}`;
    }

    url += `&buying_asset_type=${counterParam}`;
    if (counterIssuer) {
      url += `&buying_asset_issuer=${counterIssuer}`;
    }
    if (counterAsset !== 'native') {
      url += `&buying_asset_code=${counterAsset}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Horizon API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Calculate mid-price from bids and asks
    const bids = data.bids || [];
    const asks = data.asks || [];

    if (bids.length > 0 && asks.length > 0) {
      const bestBid = parseFloat(bids[0].price_r.n.toString()) / parseFloat(bids[0].price_r.d.toString());
      const bestAsk = parseFloat(asks[0].price_r.n.toString()) / parseFloat(asks[0].price_r.d.toString());
      return (bestBid + bestAsk) / 2; // Mid-price
    } else if (asks.length > 0) {
      return parseFloat(asks[0].price_r.n.toString()) / parseFloat(asks[0].price_r.d.toString());
    } else if (bids.length > 0) {
      return parseFloat(bids[0].price_r.n.toString()) / parseFloat(bids[0].price_r.d.toString());
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch orderbook for ${baseAsset}/${counterAsset}:`, error);
    return null;
  }
}

async function cacheExchangeRate(pair: string, rate: number): Promise<void> {
  const client = getRedisClient();
  const cacheKey = `${CACHE_PREFIX}${pair}`;
  const cacheData = JSON.stringify({
    rate,
    lastUpdated: new Date().toISOString(),
  });
  
  // Cache for 120 seconds (2 minutes) - longer than refresh interval
  await client.setex(cacheKey, 120, cacheData);
}

async function getCachedExchangeRate(pair: string): Promise<ExchangeRate | null> {
  const client = getRedisClient();
  const cacheKey = `${CACHE_PREFIX}${pair}`;
  
  const cacheData = await client.get(cacheKey);
  if (!cacheData) return null;

  try {
    const parsed = JSON.parse(cacheData);
    return {
      baseAsset: pair.split('/')[0],
      counterAsset: pair.split('/')[1],
      rate: parsed.rate,
      lastUpdated: new Date(parsed.lastUpdated),
    };
  } catch {
    return null;
  }
}

async function refreshAllRates(): Promise<void> {
  console.log('Refreshing exchange rates from Stellar DEX...');
  
  const refreshPromises = ASSET_PAIRS.map(async (pair) => {
    const rate = await fetchOrderbook(pair.base, pair.counter);
    
    if (rate !== null) {
      const pairKey = `${pair.base}/${pair.counter}`;
      await cacheExchangeRate(pairKey, rate);
      console.log(`Updated rate for ${pairKey}: ${rate}`);
    }
  });

  await Promise.allSettled(refreshPromises);
  console.log('Exchange rate refresh completed');
}

export async function getExchangeRate(baseAsset: string, counterAsset: string): Promise<ExchangeRate | null> {
  const pairKey = `${baseAsset}/${counterAsset}`;
  return await getCachedExchangeRate(pairKey);
}

export async function startRateRefresh(): Promise<void> {
  console.log('Starting exchange rate refresh service with distributed lock...');

  setInterval(async () => {
    try {
      // Try to acquire distributed lock
      const lockAcquired = await acquireDistributedLock(LOCK_KEY, LOCK_TTL_SECONDS);
      
      if (!lockAcquired) {
        // Another instance is handling the refresh
        console.log('Another instance is refreshing rates, skipping...');
        return;
      }

      // This instance has the lock - perform the refresh
      await refreshAllRates();
    } catch (error) {
      console.error('Error during rate refresh:', error);
    } finally {
      // Release the lock
      await releaseDistributedLock(LOCK_KEY);
    }
  }, REFRESH_INTERVAL_MS);

  // Run initial refresh immediately
  try {
    const lockAcquired = await acquireDistributedLock(LOCK_KEY, LOCK_TTL_SECONDS);
    
    if (lockAcquired) {
      await refreshAllRates();
      await releaseDistributedLock(LOCK_KEY);
    }
  } catch (error) {
    console.error('Error during initial rate refresh:', error);
  }
}
