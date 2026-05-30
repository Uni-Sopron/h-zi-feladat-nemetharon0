import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { api } from '../utils/api'
import { fetchRates, DEFAULT_SUPPORTED_SYMBOLS } from '../utils/rates'

const DataContext = createContext(null)

const FALLBACK_RATES = { HUF: 1, EUR: 380, USD: 330, GBP: 440 }
const ONE_DAY = 1000 * 60 * 60 * 24   // fixer.io limit miatt napi 1x frissítjük az árfolyamokat

export const DataProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([])
  const [records, setRecords] = useState([])
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('pf_rates')
    return saved ? JSON.parse(saved) : FALLBACK_RATES
  })
  const [lastRatesFetched, setLastRatesFetched] = useState(() => {
    const saved = localStorage.getItem('pf_lastRatesFetched')
    return saved ? parseInt(saved, 10) : null
  })
  const [currencies] = useState(DEFAULT_SUPPORTED_SYMBOLS)
  const [loading, setLoading] = useState(true)

  // Adatok betöltése a backendről
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [accs, recs] = await Promise.all([
          api.get('/accounts'),
          api.get('/records'),
        ])
        setAccounts(accs)
        setRecords(recs)
      } catch (err) {
        console.error('Betöltési hiba:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // Árfolyamok frissítése
  const refreshRates = useCallback(async () => {
    const apiKey = import.meta.env.VITE_FIXER_KEY
    if (!apiKey) {
      setRates(FALLBACK_RATES)
      setLastRatesFetched(Date.now())
      return
    }
    try {
      const result = await fetchRates(apiKey)
      if (result?.rates) {
        setRates(result.rates)
        setLastRatesFetched(Date.now())
        localStorage.setItem('pf_rates', JSON.stringify(result.rates))
        localStorage.setItem('pf_lastRatesFetched', Date.now().toString())
      }
    } catch {
      // Hiba esetén megtartjuk az eddigi értékeket, legfeljebb 1 nap múlva újra próbálja
      setLastRatesFetched(Date.now())
      localStorage.setItem('pf_lastRatesFetched', Date.now().toString())
    }
  }, [])

  useEffect(() => {
    const now = Date.now()
    const tooOld = !lastRatesFetched || now - lastRatesFetched > ONE_DAY
    if (tooOld) refreshRates()
    const interval = setInterval(refreshRates, ONE_DAY)
    return () => clearInterval(interval)
  }, [])

  const convertToHuf = (amount, currency) => {
    if (!amount || Number.isNaN(amount)) return 0
    if (!currency || currency === 'HUF') return amount
    const rate = rates?.[currency]
    if (!rate) return amount
    return amount * rate
  }

  // --- ACCOUNT CRUD ---
  const addAccount = async (partial) => {
    const created = await api.post('/accounts', partial)
    setAccounts(prev => [...prev, created])
  }

  const updateAccount = async (id, updates) => {
    const updated = await api.put(`/accounts/${id}`, updates)
    setAccounts(prev => prev.map(acc => acc._id === id ? updated : acc))
  }

  const deleteAccount = async (id) => {
    await api.delete(`/accounts/${id}`)
    setAccounts(prev => prev.filter(acc => acc._id !== id))
    setRecords(prev => prev.filter(rec => rec.accountId !== id))
  }

  // --- RECORD CRUD ---
  const addRecord = async (partial) => {
    const created = await api.post('/records', partial)
    // balance frissítés lokálisan is
    const delta = created.type === 'income' ? created.amount : -created.amount
    setAccounts(prev => prev.map(acc =>
      acc._id === created.accountId ? { ...acc, balance: acc.balance + delta } : acc
    ))
    setRecords(prev => [...prev, created])
    return created
  }

  const updateRecord = async (id, updates) => {
    const old = records.find(r => r._id === id)
    const updated = await api.put(`/records/${id}`, updates)
    // balance korrekció lokálisan
    if (old) {
      const revert = old.type === 'income' ? -old.amount : old.amount
      const delta = updated.type === 'income' ? updated.amount : -updated.amount
      setAccounts(prev => prev.map(acc => {
        if (acc._id === old.accountId) return { ...acc, balance: acc.balance + revert }
        return acc
      }))
      setAccounts(prev => prev.map(acc => {
        if (acc._id === updated.accountId) return { ...acc, balance: acc.balance + delta }
        return acc
      }))
    }
    setRecords(prev => prev.map(r => r._id === id ? updated : r))
  }

  const deleteRecord = async (id) => {
    const rec = records.find(r => r._id === id)
    await api.delete(`/records/${id}`)
    if (rec) {
      const revert = rec.type === 'income' ? -rec.amount : rec.amount
      setAccounts(prev => prev.map(acc =>
        acc._id === rec.accountId ? { ...acc, balance: acc.balance + revert } : acc
      ))
    }
    setRecords(prev => prev.filter(r => r._id !== id))
  }

  const value = useMemo(() => ({
    accounts,
    records,
    rates,
    lastRatesFetched,
    currencies,
    loading,
    refreshRates,
    convertToHuf,
    addAccount,
    updateAccount,
    deleteAccount,
    addRecord,
    updateRecord,
    deleteRecord,
    setRecords,
  }), [accounts, records, rates, lastRatesFetched, loading])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useDataContext = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataContext csak DataProvideren belül hívható')
  return ctx
}