import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ensureSeedData, loadItem, saveItem, STORAGE_KEYS, uid } from "../utils/storage";
import { fetchRates, DEFAULT_SUPPORTED_SYMBOLS } from "../utils/rates";
import { DEFAULT_ACCOUNT_COLOR } from "../constants/colors";

const DataContext = createContext(null);

// árfolyam fallback értékek, ha nincs api vagy nem jön válasz
const FALLBACK_RATES = {
  HUF: 1,
  EUR: 380,
  USD: 330,
  GBP: 440,
};

// free fixer.io limit: 100 req/month, szóval naponta egyszer frissítünk
const ONE_DAY = 1000 * 60 * 60 * 24;

export const DataProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [records, setRecords] = useState([]);
  const [rates, setRates] = useState(() => loadItem(STORAGE_KEYS.rates, FALLBACK_RATES));
  const [lastRatesFetched, setLastRatesFetched] = useState(() => loadItem(STORAGE_KEYS.lastRatesFetched, null));
  const [currencies] = useState(DEFAULT_SUPPORTED_SYMBOLS);

  // első betöltés: seed vagy localStorage tartalom
  useEffect(() => {
    const data = ensureSeedData();
    setAccounts(data.accounts);
    setRecords(data.records);
  }, []);

  // mentés localStorage-be, ha változik
  useEffect(() => {
    if (accounts.length) saveItem(STORAGE_KEYS.accounts, accounts);
  }, [accounts]);

  useEffect(() => {
    if (records.length) saveItem(STORAGE_KEYS.records, records);
  }, [records]);

  useEffect(() => {
    if (rates) saveItem(STORAGE_KEYS.rates, rates);
  }, [rates]);

  useEffect(() => {
    if (lastRatesFetched) saveItem(STORAGE_KEYS.lastRatesFetched, lastRatesFetched);
  }, [lastRatesFetched]);

  // árfolyam frissítésnél ha nincs kulcs, akkor fallbackre érték
  const refreshRates = async () => {
    const apiKey = import.meta.env.VITE_FIXER_KEY;
    if (!apiKey) {
      setRates((prev) => prev || FALLBACK_RATES);
      setLastRatesFetched(Date.now());
      return;
    }

    try {
      const result = await fetchRates(apiKey);
      if (result?.rates) {
        setRates(result.rates);
        setLastRatesFetched(Date.now());
      }
    } catch (err) {
      console.error("Nem sikerült frissíteni az árfolyamokat", err);
      setRates((prev) => prev || FALLBACK_RATES);
      setLastRatesFetched(Date.now());
    }
  };

  useEffect(() => {
    const now = Date.now();
    const tooOld = !lastRatesFetched || now - lastRatesFetched > ONE_DAY;
    if (tooOld) refreshRates();
    const interval = setInterval(refreshRates, ONE_DAY);
    return () => clearInterval(interval);
  }, [lastRatesFetched]);

  // devizanem HUF-ra
  const convertToHuf = (amount, currency) => {
    if (!amount || Number.isNaN(amount)) return 0;
    if (!currency || currency === "HUF") return amount;
    const rate = rates?.[currency];
    if (!rate) return amount;
    return amount * rate;
  };

  // ACCOUNT CRUD
  const addAccount = (partial) => {
    const newAccount = { id: uid(), balance: 0, color: partial.color || DEFAULT_ACCOUNT_COLOR, ...partial };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const updateAccount = (id, updates) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)));
  };

  const deleteAccount = (id) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    setRecords((prev) => prev.filter((rec) => rec.accountId !== id));
  };

  const adjustAccountBalance = (accountId, amount, type) => {
    if (!accountId) return;
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        const delta = type === "income" ? amount : -amount;
        return { ...acc, balance: acc.balance + delta };
      }),
    );
  };

  // RECORD CRUD
  const addRecord = (partial) => {
    const newRecord = { id: uid(), ...partial };
    adjustAccountBalance(newRecord.accountId, newRecord.amount, newRecord.type);
    setRecords((prev) => [...prev, newRecord]);
  };

  const updateRecord = (id, updates) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;

        // ha account/type/amount változik, korrigáljuk a balance-ot
        const next = { ...rec, ...updates };
        if (
          next.accountId !== rec.accountId ||
          next.amount !== rec.amount ||
          next.type !== rec.type
        ) {
          const inverseType = rec.type === "income" ? "expense" : "income";
          adjustAccountBalance(rec.accountId, rec.amount, inverseType);
          adjustAccountBalance(next.accountId, next.amount, next.type);
        }
        return next;
      }),
    );
  };

  const deleteRecord = (id) => {
    setRecords((prev) => {
      const rec = prev.find((r) => r.id === id);
      if (rec) {
        const inverseType = rec.type === "income" ? "expense" : "income";
        adjustAccountBalance(rec.accountId, rec.amount, inverseType);
      }
      return prev.filter((r) => r.id !== id);
    });
  };


  

  const value = useMemo(
    () => ({
      accounts,
      records,
      rates,
      lastRatesFetched,
      currencies,
      refreshRates,
      convertToHuf,
      addAccount,
      updateAccount,
      deleteAccount,
      addRecord,
      updateRecord,
      deleteRecord,
    }),
    [accounts, records, rates, lastRatesFetched],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDataContext csak DataProvideren belül hívható");
  return ctx;
};
