import { useMemo, useState } from "react";
import useData from "../hooks/useData";
import { api } from "../utils/api";
import Modal from "../components/Modal";

const sortOptions = [
  { value: "newest", label: "Legújabb elől" },
  { value: "oldest", label: "Legrégebbi elől" },
];

const typeLabels = {
  income: "Bevétel",
  expense: "Kiadás",
};

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";

const Records = () => {
  const { records, accounts, addRecord, updateRecord, deleteRecord, setRecords } = useData();
  const [sortBy, setSortBy] = useState("newest");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [deleteAttachment, setDeleteAttachment] = useState(false);
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    note: "",
    party: "",
    accountId: accounts[0]?._id ?? "",
    date: new Date().toISOString().slice(0, 10),
  });

  const accountMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a._id, a])), [accounts]);

  const sortedRecords = useMemo(() => {
    const list = [...records];
    return list.sort((a, b) => {
      if (a.date === b.date) return 0;
      return sortBy === "newest" ? (a.date < b.date ? 1 : -1) : a.date > b.date ? 1 : -1;
    });
  }, [records, sortBy]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    sortedRecords.forEach((rec) => {
      if (!groups[rec.date]) groups[rec.date] = [];
      groups[rec.date].push(rec);
    });
    return groups;
  }, [sortedRecords]);

  const dateKeys = useMemo(
    () => Object.keys(groupedByDate).sort((a, b) => (sortBy === "newest" ? (a < b ? 1 : -1) : a > b ? 1 : -1)),
    [groupedByDate, sortBy],
  );

  // ha változik az accounts (pl. törlés), validáljuk az accountId-t a formban
  useMemo(() => {
    if (!accounts.find((a) => a._id === form.accountId)) {
      setForm((f) => ({ ...f, accountId: accounts[0]?._id ?? "" }));
    }
  }, [accounts]);

  const resetModalState = () => {
    setEditingId(null);
    setError("");
    setAttachmentFile(null);
    setExistingAttachment(null);
    setDeleteAttachment(false);
  };

  const openNewModal = () => {
    resetModalState();
    setForm({
      type: "expense",
      category: "",
      amount: "",
      note: "",
      party: "",
      accountId: accounts[0]?._id ?? "",
      date: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const handleEdit = (rec) => {
    resetModalState();
    setEditingId(rec._id);
    setForm({
      type: rec.type,
      category: rec.category || "",
      amount: rec.amount,
      note: rec.note || "",
      party: rec.party || "",
      accountId: rec.accountId,
      date: rec.date || new Date().toISOString().slice(0, 10),
    });
    setExistingAttachment(rec.attachment ?? null);
    setShowModal(true);
  };

  const closeModal = () => {
    resetModalState();
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = Number(form.amount);
    if (!form.accountId || Number.isNaN(parsedAmount) || !form.category.trim()) {
      setError("Kötelező: kategória, összeg, számla, dátum");
      return;
    }
    setError("");

    // Bizonylat törlése ha meg volt jelölve
    if (editingId && deleteAttachment) {
      await api.put(`/records/${editingId}`, { ...form, amount: parsedAmount, attachment: null });
      setRecords((prev) => prev.map((r) => r._id === editingId ? { ...r, attachment: null } : r));
    }

    const created = editingId ? null : await addRecord({ ...form, amount: parsedAmount });
    if (editingId) await updateRecord(editingId, { ...form, amount: parsedAmount });

    // Új fájl feltöltése ha van
    if (attachmentFile) {
      const savedId = editingId ?? created?._id;
      if (savedId) {
        const formData = new FormData();
        formData.append("file", attachmentFile);
        try {
          const updated = await api.upload(`/records/${savedId}/attachment`, formData);
          setRecords((prev) => prev.map((r) => r._id === savedId ? updated : r));
        } catch (err) {
          console.error("Feltöltési hiba:", err);
        }
      }
    }

    setForm((f) => ({ ...f, category: "", amount: "", note: "", party: "" }));
    closeModal();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Bejegyzések</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 flex items-center gap-2">
            Rendezés:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={openNewModal}
            className="bg-sky-500 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-sky-600 transition"
          >
            + Új bejegyzés
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        {dateKeys.length === 0 && (
          <div className="text-sm text-slate-500">Még nincs bejegyzés.</div>
        )}
        {dateKeys.map((date) => (
          <div key={date} className="space-y-2">
            <div className="text-sm font-semibold text-slate-700">{date}</div>
            <div className="space-y-2">
              {groupedByDate[date].map((rec) => {
                const acc = accountMap[rec.accountId];
                const isIncome = rec.type === "income";
                return (
                  <div
                    key={rec._id}
                    className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {typeLabels[rec.type]}
                        </span>
                        <span className="text-sm text-slate-600">{rec.category || ""}</span>
                      </div>
                      {rec.note && <div className="text-sm text-slate-700">{rec.note}</div>}
                      {rec.party && <div className="text-xs text-slate-500">Fizető: {rec.party}</div>}
                      <div className="text-xs text-slate-500">
                        {acc ? (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block w-3 h-3 rounded-full border border-slate-300"
                              style={{ backgroundColor: acc.color || "#f1f5f9" }}
                            />
                            {acc.name} ({acc.currency})
                          </span>
                        ) : "Számla törölve"}
                      </div>
                      {rec.attachment && (
                        <a
                          href={`${API_BASE}/uploads/${rec.attachment}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-sky-600 hover:underline inline-block mt-1"
                        >
                          📎 Bizonylat megtekintése
                        </a>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <div className={`text-lg font-semibold ${isIncome ? "text-emerald-700" : "text-rose-700"}`}>
                        {isIncome ? "+" : "-"}{rec.amount.toLocaleString("hu-HU")} {acc?.currency ?? ""}
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs">
                        <button type="button" onClick={() => handleEdit(rec)} className="text-sky-600 hover:underline">
                          Szerkesztés
                        </button>
                        <button type="button" onClick={() => {
                          if (window.confirm('Biztosan törölni akarod?')) {
                            deleteRecord(rec._id)
                          }
                        }} className="text-rose-600 hover:underline">
                          Törlés
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editingId ? "Bejegyzés szerkesztése" : "Új bejegyzés"} onClose={closeModal}>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              {["expense", "income"].map((t) => (
                <label
                  key={t}
                  className={`flex-1 text-center text-sm font-semibold border rounded-lg px-3 py-2 cursor-pointer transition ${
                    form.type === t ? "border-sky-500 bg-white text-sky-700" : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={form.type === t}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="sr-only"
                  />
                  {typeLabels[t]}
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-700">Kategória*</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="Pl. Kaja"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Összeg*</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="0"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Megjegyzés</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="Rövid leírás"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Fizető</label>
              <input
                type="text"
                value={form.party}
                onChange={(e) => setForm((f) => ({ ...f, party: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="Ki fizetett / kinek fizetsz"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Számla*</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>{acc.name} ({acc.currency})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Dátum*</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-700">Bizonylat (kép vagy PDF)</label>

              {/* Meglévő bizonylat — csak ha még nem jelöltük törlésre */}
              {existingAttachment && !deleteAttachment && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <a
                    href={`${API_BASE}/uploads/${existingAttachment}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-600 hover:underline"
                  >
                    📎 Meglévő bizonylat megtekintése
                  </a>
                  <button
                    type="button"
                    onClick={() => setDeleteAttachment(true)}
                    className="text-xs text-rose-600 hover:underline ml-3"
                  >
                    Törlés
                  </button>
                </div>
              )}

              {/* Új fájl input — ha nincs meglévő, vagy törlésre jelöltük */}
              {(!existingAttachment || deleteAttachment) && (
                <>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setAttachmentFile(e.target.files[0] ?? null)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  {attachmentFile && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{attachmentFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentFile(null);
                          if (deleteAttachment) setDeleteAttachment(false);
                        }}
                        className="text-xs text-rose-600 hover:underline ml-3"
                      >
                        Mégsem
                      </button>
                    </div>
                  )}
                  {/* Visszavonás ha csak törlésre jelöltük de még nem választottunk új fájlt */}
                  {deleteAttachment && !attachmentFile && (
                    <button
                      type="button"
                      onClick={() => setDeleteAttachment(false)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      ← Mégsem törlöm a bizonylatot
                    </button>
                  )}
                </>
              )}
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
                onClick={closeModal}
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

export default Records;