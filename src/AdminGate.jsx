import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isRemoteGameMode } from './utils/remoteGameFlag'

function AdminGateRemote({ children }) {
  const [status, setStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const check = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/me', { credentials: 'include' })
      const data = await r.json()
      setStatus(data.ok ? 'ok' : 'need-login')
    } catch {
      setStatus('need-login')
    }
  }, [])

  useEffect(() => {
    const id = setTimeout(() => void check(), 0)
    return () => clearTimeout(id)
  }, [check])

  const login = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        setError(data.error || 'Login failed')
        return
      }
      setPassword('')
      setStatus('ok')
    } catch {
      setError('Network error')
    }
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    setStatus('need-login')
  }

  if (status === 'checking') {
    return (
      <div className="admin-gate">
        <p>Checking admin session…</p>
      </div>
    )
  }

  if (status !== 'ok') {
    return (
      <div className="admin-gate">
        <h1>Admin sign-in</h1>
        <p className="admin-gate-lead">Enter the event password to open the control panel.</p>
        <form className="admin-login-form" onSubmit={login}>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">Sign in</button>
          {error && <p className="form-msg admin-gate-error">{error}</p>}
        </form>
        <p className="admin-gate-links">
          <Link to="/display">View scoreboard</Link>
          {' · '}
          <Link to="/join">Join a team</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <div className="admin-bar">
        <span className="admin-bar-label">Signed in as admin</span>
        <button type="button" className="admin-bar-out" onClick={logout}>
          Sign out
        </button>
      </div>
      {children}
    </div>
  )
}

/** Password gate when live server game mode is on (same flag as `/api/game` + polling). */
export default function AdminGate({ children }) {
  if (!isRemoteGameMode()) return children
  return <AdminGateRemote>{children}</AdminGateRemote>
}
