import { seedAccounts, seedRecords } from "../data/seed";

export const STORAGE_KEYS = {
  accounts: "pf_accounts",
  records: "pf_records",
  rates: "pf_rates",
  lastRatesFetched: "pf_rates_last_fetched",
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const loadItem = (key, fallback) => {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  return raw ? safeParse(raw, fallback) : fallback;
};

export const saveItem = (key, value) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const ensureSeedData = () => {
  const accounts = loadItem(STORAGE_KEYS.accounts, null);
  const records = loadItem(STORAGE_KEYS.records, null);

  const data = {
    accounts: accounts ?? seedAccounts,
    records: records ?? seedRecords,
  };

  if (!accounts) saveItem(STORAGE_KEYS.accounts, data.accounts);
  if (!records) saveItem(STORAGE_KEYS.records, data.records);

  return data;
};

export const uid = () => `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
