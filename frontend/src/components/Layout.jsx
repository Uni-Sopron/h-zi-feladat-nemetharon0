import { NavLink } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
        <header className="bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-2xl px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-slate-900 no-underline">
          <img src="/zorshu-pk.ico" alt="PK" className="w-12 h-12 rounded" />
          {/* <span className="bg-sky-100 text-sky-600 px-2.5 py-1 rounded-full text-xs uppercase tracking-wider">
            💰PK
          </span> */}
          <span>Pénzügykezelő</span>
        </NavLink>
        <nav className="flex gap-2 sm:gap-3 flex-wrap">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `no-underline font-semibold px-3 py-2 rounded-xl transition ${
                isActive ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            Főoldal
          </NavLink>
          <NavLink
            to="/accounts"
            className={({ isActive }) =>
              `no-underline font-semibold px-3 py-2 rounded-xl transition ${
                isActive ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            Számlák
          </NavLink>
          <NavLink
            to="/records"
            className={({ isActive }) =>
              `no-underline font-semibold px-3 py-2 rounded-xl transition ${
                isActive ? "bg-sky-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            Bejegyzések
          </NavLink>
          <button
            onClick={logout}
            className="no-underline font-semibold px-3 py-2 rounded-xl transition text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Kijelentkezés
          </button>
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
