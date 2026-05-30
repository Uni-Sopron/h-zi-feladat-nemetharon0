import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('/login-bg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bejelentkezés</h1>
          <p className="text-sm text-slate-500 mt-1">Üdv újra!</p>
        </div>
        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              placeholder="email@pelda.hu"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">Jelszó</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 text-white font-semibold py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-50"
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>
        <p className="text-sm text-slate-500 text-center">
          Még nincs fiókod?{' '}
          <Link to="/register" className="text-sky-600 hover:underline">Regisztráció</Link>
        </p>
      </div>
    </div>
  )
}

export default Login