import { createAdminClient } from './supabaseAdmin.js';

export const DEFAULT_ACCOUNT_TYPES = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Ultra-low spreads with zero commission. Ideal for all traders.',
    min_deposit: 10,
    min_spread: 0.20,
    max_leverage: 500,
    commission: 'No commission',
    tag: 'Most Popular'
  },
  {
    id: 'standard_cent',
    name: 'Standard Cent',
    description: 'Trade micro lots with micro risk. Great for beginners.',
    min_deposit: 1,
    min_spread: 0.30,
    max_leverage: 500,
    commission: 'No commission',
    tag: 'Beginner'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Raw spreads with institutional execution for experienced traders.',
    min_deposit: 500,
    min_spread: 0.00,
    max_leverage: 500,
    commission: '$3.50 / lot',
    tag: 'Advanced'
  },
  {
    id: 'raw_spread',
    name: 'Raw Spread',
    description: 'Lowest raw spreads with fixed low commission per lot.',
    min_deposit: 500,
    min_spread: 0.00,
    max_leverage: 500,
    commission: '$3.50 / lot',
    tag: 'Low Spread'
  },
  {
    id: 'zero',
    name: 'Zero',
    description: 'Zero spread on top 30 instruments with ultra-low commission.',
    min_deposit: 500,
    min_spread: 0.00,
    max_leverage: 500,
    commission: '$0.05 / lot',
    tag: 'Zero Spread'
  }
];

export const ALLOWED_LEVERAGES = [1, 10, 50, 100, 200, 500];
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];
export const SUPPORTED_PLATFORMS = ['MT5', 'MT4', 'Webtrader'];
export const SUPPORTED_EXECUTION_TYPES = ['Market', 'Instant'];

export async function getAccountTypes() {
  const supabase = createAdminClient();
  try {
    const { data, error } = await supabase
      .from('account_types')
      .select('*')
      .order('min_deposit', { ascending: true });

    if (!error && data && data.length > 0) {
      // Map DB account types and merge with any missing defaults
      const dbTypes = data.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        min_deposit: parseFloat(t.min_deposit || 0),
        min_spread: parseFloat(t.min_spread || 0),
        max_leverage: parseInt(t.max_leverage || 500, 10),
        commission: t.commission || 'No commission',
        tag: DEFAULT_ACCOUNT_TYPES.find(d => d.id === t.id)?.tag || null
      }));

      // If db only had 3 types (standard, standard_micro, pro), ensure all 5 are present
      const merged = [...dbTypes];
      for (const def of DEFAULT_ACCOUNT_TYPES) {
        if (!merged.some(m => m.id === def.id || (def.id === 'standard_cent' && m.id === 'standard_micro'))) {
          merged.push(def);
        }
      }
      return merged;
    }
  } catch (e) {
    console.error('[getAccountTypes error]:', e);
  }

  return DEFAULT_ACCOUNT_TYPES;
}

export function validateLeverage(leverage, accountType = 'standard', accountTypesList = DEFAULT_ACCOUNT_TYPES) {
  const levNum = parseInt(leverage, 10);
  if (!ALLOWED_LEVERAGES.includes(levNum)) {
    return { valid: false, error: `Invalid leverage 1:${leverage}. Allowed: ${ALLOWED_LEVERAGES.map(l => `1:${l}`).join(', ')}` };
  }

  const normalizedType = accountType === 'standard_micro' ? 'standard_cent' : accountType;
  const typeConfig = accountTypesList.find(t => t.id === normalizedType || t.id === accountType) || DEFAULT_ACCOUNT_TYPES[0];
  if (levNum > typeConfig.max_leverage) {
    return { valid: false, error: `Leverage 1:${levNum} exceeds maximum allowed for ${typeConfig.name} (1:${typeConfig.max_leverage})` };
  }

  return { valid: true, leverage: levNum };
}

export function validateNickname(nickname) {
  if (!nickname) return { valid: true, nickname: '' };
  const trimmed = nickname.trim();
  if (trimmed.length > 0 && trimmed.length < 3) {
    return { valid: false, error: 'Nickname must be at least 3 characters long.' };
  }
  if (trimmed.length > 36) {
    return { valid: false, error: 'Nickname cannot exceed 36 characters.' };
  }
  // No special characters except space, hyphen, underscore
  const safeRegex = /^[a-zA-Z0-9 _-]+$/;
  if (trimmed.length > 0 && !safeRegex.test(trimmed)) {
    return { valid: false, error: 'Nickname cannot contain special characters (only letters, numbers, spaces, -, _ allowed).' };
  }
  return { valid: true, nickname: trimmed };
}

export function validateStartingBalance(amount, accountType = 'standard', accountTypesList = DEFAULT_ACCOUNT_TYPES) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Please enter a valid starting balance.' };
  }
  if (numAmount > 1000000) {
    return { valid: false, error: 'Maximum starting balance is $1,000,000.' };
  }

  const normalizedType = accountType === 'standard_micro' ? 'standard_cent' : accountType;
  const typeConfig = accountTypesList.find(t => t.id === normalizedType || t.id === accountType) || DEFAULT_ACCOUNT_TYPES[0];
  if (numAmount < typeConfig.min_deposit) {
    return { 
      valid: false, 
      error: `Minimum starting balance for ${typeConfig.name} is $${typeConfig.min_deposit.toLocaleString('en-US')}.` 
    };
  }

  return { valid: true, amount: numAmount };
}
