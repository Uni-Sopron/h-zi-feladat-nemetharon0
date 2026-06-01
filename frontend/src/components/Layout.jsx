import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  // kattintás a menün kívülre → bezárja
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `no-underline font-semibold px-3 py-2 rounded-xl transition ${
      isActive
        ? "bg-sky-500 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
        <header className="bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-2xl px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md relative z-20">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-slate-900 no-underline">
            <img src="/zorshu-pk.ico" alt="PK" className="w-12 h-12 rounded" />
            <span>Pénzügykezelő</span>
          </NavLink>

          <nav className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <NavLink to="/" end className={navLinkClass}>Főoldal</NavLink>
            <NavLink to="/accounts" className={navLinkClass}>Számlák</NavLink>
            <NavLink to="/records" className={navLinkClass}>Bejegyzések</NavLink>

            {/* Avatar gomb */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-sky-500 text-white text-sm font-bold flex items-center justify-center hover:bg-sky-600 transition shadow-sm"
                aria-label="Felhasználói menü"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-xs text-slate-500">Bejelentkezve</div>
                    <div className="text-sm font-semibold text-slate-900 truncate">{user?.username}</div>
                  </div>
                  <NavLink to="/profile" className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition font-semibold border-b border-slate-100">Profil szerkesztése</NavLink>
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition font-semibold"
                  >
                    Kijelentkezés
                  </button>
                </div>
              )}
            </div>
          </nav>
        </header>

        <main className="mt-4 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-2xl p-4 sm:p-6 shadow-xl relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;