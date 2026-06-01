import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    baseCurrency: user?.baseCurrency ?? "HUF",
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const currencyOptions = ["HUF", "EUR", "USD", "GBP"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // TODO: backend bekötés később
    setTimeout(() => {
      setSuccess("Profil sikeresen frissítve!");
      setLoading(false);
    }, 500);
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Profil szerkesztése</h1>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-700">Felhasználónév</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-700">Alapvaluta</label>
              <select
                value={form.baseCurrency}
                onChange={(e) => setForm((f) => ({ ...f, baseCurrency: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Jelszócsere */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="text-sm font-semibold text-slate-700">Jelszó módosítása</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-700">Jelenlegi jelszó</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-700">Új jelszó</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 text-white font-semibold py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-50"
            >
              {loading ? "Mentés..." : "Mentés"}
            </button>
          </form>
        </div>
    </section>
  );
};

export default Profile;