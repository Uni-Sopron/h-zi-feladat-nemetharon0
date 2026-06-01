import { useMemo, useState } from "react";
import useData from "../hooks/useData";
import { ACCOUNT_COLOR_LIST } from "../constants/colors";
import Modal from "../components/Modal";

const sortOptions = [
  { value: "default", label: "Alapértelmezett" },
  { value: "name-asc", label: "Név (A-Z)" },
  { value: "name-desc", label: "Név (Z-A)" },
  { value: "balance-asc", label: "Összeg (növekvő)" },
  { value: "balance-desc", label: "Összeg (csökkenő)" },
];

const typeOptions = ["Készpénz", "Bankszámla", "Megtakarítás", "Befektetés"];
const fallbackCurrencies = ["HUF", "EUR", "USD", "GBP"];
const colorOptions = ACCOUNT_COLOR_LIST;

const Accounts = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, currencies } = useData();
  const [sortBy, setSortBy] = useState("default");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const currencyOptions = currencies?.length ? currencies : fallbackCurrencies;
  const [form, setForm] = useState({
    name: "",
    type: typeOptions[0],
    currency: currencyOptions[0],
    balance: "",
    color: colorOptions[0]?.value || "",
  });

  const sortedAccounts = useMemo(() => {
    const list = [...accounts];
    switch (sortBy) {
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name, "hu"));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name, "hu"));
      case "balance-asc":
        return list.sort((a, b) => a.balance - b.balance);
      case "balance-desc":
        return list.sort((a, b) => b.balance - a.balance);
      default:
        return list;
    }
  }, [accounts, sortBy]);

  const resetForm = () => {
    setForm({
      name: "",
      type: typeOptions[0],
      currency: currencyOptions[0],
      balance: "",
      color: colorOptions[0]?.value || "",
    });
    setEditingId(null);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedBalance = Math.max(0, Number(form.balance) || 0);
    if (!form.name.trim() || !form.currency) {
      setError("Kötelező: név, típus, pénznem, szín");
      return;
    }
    setError("");

    if (editingId) {
      updateAccount(editingId, {
        name: form.name.trim(),
        type: form.type,
        currency: form.currency,
        balance: parsedBalance,
        color: form.color,
      });
    } else {
      addAccount({
        name: form.name.trim() || "Új számla",
        type: form.type,
        currency: form.currency,
        balance: parsedBalance,
        color: form.color,
      });
    }
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (acc) => {
    setEditingId(acc._id);
    setForm({
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      balance: acc.balance,
      color: acc.color || colorOptions[0]?.value || "",
    });
    setError("");
    setShowModal(true);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Számlák</h1>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-sky-600 transition"
          >
            + Új számla
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <label className="text-sm text-slate-600 flex items-center gap-2">
              Rendezés:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            {sortedAccounts.length === 0 && (
              <div className="text-sm text-slate-500">Nincs még számla.</div>
            )}
            {sortedAccounts.map((acc) => (
              <div
                key={acc._id}
                className="border border-slate-200 rounded-lg p-4 flex justify-between"
                style={{ backgroundColor: acc.color || "#f1f5f9" }}
              >
                <div>
                  <div className="font-semibold text-slate-900">{acc.name}</div>
                  <div className="text-sm text-slate-600">{acc.type}</div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-lg font-semibold text-slate-900">
                    {acc.balance.toLocaleString("hu-HU")} {acc.currency}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <button type="button" onClick={() => handleEdit(acc)} className="text-sky-600 hover:underline">
                      Szerkesztés
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Biztosan törölni akarod?')) {
                          deleteAccount(acc._id)
                        }
                      }}
                      className="text-rose-600 hover:underline"
                    >
                      Törlés
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title={editingId ? "Számla szerkesztése" : "Új számla"} onClose={() => setShowModal(false)}>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Név*</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="Pl. Fő számla"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Típus*</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Pénznem*</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Kezdő egyenleg</label>
              <input
                type="number"
                value={form.balance}
                onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="0"
                min="1"
                step="0.01"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Szín*</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={`w-9 h-9 rounded-lg border ${
                      form.color === c.value ? "ring-2 ring-sky-500 border-sky-400" : "border-slate-300"
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={`Szín: ${c.id}`}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-sky-500 text-white font-semibold py-2 rounded-lg hover:bg-sky-600 transition"
            >
              {editingId ? "Mentés" : "Hozzáadás"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="w-full text-sm text-slate-600 underline"
              >
                Mégsem szerkesztek
              </button>
            )}
          </form>
        </Modal>
      )}
    </section>
  );
};

export default Accounts;
