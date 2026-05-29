const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('pf_token')

const request = async (method, path, body = null, isFormData = false) => {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Szerverhiba')
  return data
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  put:    (path, body)   => request('PUT',    path, body),
  delete: (path)         => request('DELETE', path),
  upload: (path, formData) => request('POST', path, formData, true),
}