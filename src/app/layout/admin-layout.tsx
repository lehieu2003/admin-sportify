import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { env } from '../../core/config/env'
import { Button } from '../../core/ui/button'
import { useAuth } from '../../core/auth/use-auth'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/catalog', label: 'Catalog' },
  { to: '/spotify-import', label: 'Spotify Import' },
]

export function AdminLayout() {
  const { user, signout } = useAuth()
  const navigate = useNavigate()

  const handleSignout = async () => {
    await signout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1a1a1a_0%,#121212_45%,#0d0d0d_100%)] text-text">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-r border-border/80 bg-panel/95 p-5 backdrop-blur">
          <h1 className="text-2xl font-bold text-white">{env.appName}</h1>
          <p className="mt-1 text-sm text-muted">Admin management</p>

          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-primary text-black font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                      : 'text-muted hover:bg-panel-alt hover:text-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-border/80 bg-panel/70 px-8 py-5 backdrop-blur">
            <div>
              <p className="text-sm text-muted">Signed in as</p>
              <p className="text-base font-semibold text-white">{user?.email}</p>
            </div>
            <Button variant="secondary" onClick={handleSignout}>
              Sign out
            </Button>
          </header>

          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
