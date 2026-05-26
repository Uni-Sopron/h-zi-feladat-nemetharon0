import { useMemo, useState } from "react";
import useData from "../hooks/useData";

const periodOptions = [
  { value: "month", label: "Aktuális hónap" },
  { value: "30days", label: "Elmúlt 30 nap" },
  { value: "all", label: "Összes adat" },
];

const formatCurrency = (value, currency) =>
  `${(value ?? 0).toLocaleString("hu-HU", { maximumFractionDigits: 2 })} ${currency}`;

const Dashboard = () => {
  const { accounts, records, convertToHuf, rates, lastRatesFetched } = useData();
  const [period, setPeriod] = useState("month");

  const accountMap = useMemo(
    () => Object.fromEntries(accounts.map((acc) => [acc.id, acc])),
    [accounts],
  );

  const filteredRecords = useMemo(() => {
    const now = new Date();
    return records.filter((rec) => {
      if (!rec.date) return false;
      const recDate = new Date(rec.date);
      if (Number.isNaN(recDate.getTime())) return false;

      if (period === "all") return true;
      if (period === "30days") {
        const diff = (now - recDate) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      }
      // aktuális hónap
      return recDate.getFullYear() === now.getFullYear() && recDate.getMonth() === now.getMonth();
    });
  }, [records, period]);

  const totals = useMemo(() => {
    const income = filteredRecords
      .filter((r) => r.type === "income")
      .reduce((sum, r) => {
        const acc = accountMap[r.accountId];
        return sum + convertToHuf(r.amount || 0, acc?.currency);
      }, 0);
    const expense = filteredRecords
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => {
        const acc = accountMap[r.accountId];
        return sum + convertToHuf(r.amount || 0, acc?.currency);
      }, 0);
    return { income, expense, net: income - expense };
  }, [filteredRecords, accountMap, convertToHuf]);

  const categoryTotals = useMemo(() => {
    const map = {};
    filteredRecords
      .filter((r) => r.type === "expense")
      .forEach((r) => {
        const acc = accountMap[r.accountId];
        const hufValue = convertToHuf(r.amount || 0, acc?.currency);
        const key = r.category || "Ismeretlen";
        map[key] = (map[key] || 0) + hufValue;
      });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredRecords, accountMap, convertToHuf]);

  const accountTotalsByCurrency = useMemo(() => {
    const map = {};
    accounts.forEach((acc) => {
      map[acc.currency] = (map[acc.currency] || 0) + (acc.balance || 0);
    });
    return Object.entries(map).map(([currency, amount]) => ({ currency, amount }));
  }, [accounts]);

  const totalHuf = useMemo(
    () => accounts.reduce((sum, acc) => sum + convertToHuf(acc.balance || 0, acc.currency), 0),
    [accounts, convertToHuf],
  );

  return (
    <section className="space-y-6">

      {/* Számlák blokk */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Számlák</h2>
            <p className="text-sm text-slate-600">Aktuális egyenlegek pénznemenként.</p>
          </div>
          <a
            href="/accounts"
            className="inline-flex items-center gap-2 bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-sky-600 transition"
          >
            + Számla hozzáadása
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="border border-slate-200 rounded-xl p-4"
              style={{ backgroundColor: acc.color || "#f1f5f9" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-slate-600">{acc.type}</div>
                  <div className="font-semibold text-slate-900">{acc.name}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                  {acc.currency}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900">{formatCurrency(acc.balance, acc.currency)}</div>
              {acc.currency !== "HUF" && (
                <div className="text-xs text-slate-500 mt-1">
                  = {formatCurrency(convertToHuf(acc.balance, acc.currency), "HUF")}
                </div>
              )}
            </div>
          ))}
          {accounts.length === 0 && (
            <div className="text-sm text-slate-500">Nincs még számla.</div>
          )}
        </div>
      </div>

      {/* Statisztikák blokk */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Statisztikák</h2>
            <p className="text-sm text-slate-600">Időszakos pénzáramlások és kiadások.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            Időszak:
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-sm text-slate-600">Összes egyenleg</div>
            <div className="font-bold text-lg text-slate-900 mt-1">{formatCurrency(totalHuf, "HUF")}</div>
            <div className="text-xs text-slate-500 mt-2">Pénznemenként:</div>
            <div className="font-semibold text-sm text-slate-900 mt-1 space-y-0.5">
              {accountTotalsByCurrency.map((row) => (
                <div key={row.currency}>{formatCurrency(row.amount, row.currency)}</div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-sm text-slate-600">
              Pénzáramlás ({periodOptions.find((p) => p.value === period)?.label})
            </div>
            <div className="flex justify-between text-sm text-slate-700">
              <span>Bevétel</span>
              <span className="text-emerald-700">+{formatCurrency(totals.income, "HUF")}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-700">
              <span>Kiadás</span>
              <span className="text-rose-700">-{formatCurrency(totals.expense, "HUF")}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-slate-900">
              <span>Nettó</span>
              <span className={totals.net >= 0 ? "text-emerald-700" : "text-rose-700"}>
                {totals.net >= 0 ? "+" : ""}
                {formatCurrency(totals.net, "HUF")}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-m text-slate-600">Top kiadási kategóriák</div>
            <div className="mt-3 space-y-2">
              {categoryTotals.length === 0 && <div className="text-xs text-slate-500">Nincs még kiadás.</div>}
              {categoryTotals.map((item) => (
                <div key={item.category} className="flex justify-between text-sm text-slate-700">
                  <span>{item.category}</span>
                  <span className="text-rose-700">-{formatCurrency(item.amount, "HUF")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Árfolyamok blokk */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Mai árfolyamok (fixer.io)</h2>
            <p className="text-sm text-slate-600">
              Utolsó frissítés:{" "}
              {lastRatesFetched ? new Date(lastRatesFetched).toLocaleString("hu-HU") : "még nincs adat"}
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {["EUR", "USD", "GBP"].map((code) => (
            <div key={code} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500">1 {code} =</div>
              <div className="text-xl font-semibold text-slate-900">
                {rates?.[code] ? rates[code].toLocaleString("hu-HU", { maximumFractionDigits: 2 }) : "-"} HUF
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
