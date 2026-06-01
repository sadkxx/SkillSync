import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import CartDrawer from './CartDrawer'
import { cn } from '../lib/utils'
import { useScroll } from './ui/use-scroll'
import { MenuToggleIcon } from './ui/menu-toggle-icon'

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const scrolled = useScroll(10)

  if (isAdmin) {
    return (
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[rgb(21_14_10_/_0.84)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/admin/orders" className="flex items-center gap-3 text-white">
            <img
              src="/shabby-logo.png"
              alt="Shabby logo"
              className="h-14 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
                Dashboard
              </p>
              <p className="font-serif text-2xl leading-none">Shabby Admin</p>
            </div>
          </Link>
          <Link
            to="/"
            className="secondary-button border-white/15 bg-white/8 text-white hover:border-amber-300/40 hover:text-amber-100"
          >
            Müşteri görünümü
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <>
      <div className="h-28 w-full sm:h-32" />
      <nav className="fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            'mx-auto w-full transition-all duration-300 ease-out',
            scrolled ? 'max-w-6xl px-2 pt-2 sm:px-4' : 'max-w-[100vw] px-0 pt-0'
          )}
        >
          <div
            className={cn(
              'overflow-hidden border border-transparent bg-[linear-gradient(145deg,#2a1d14,#8e4d13)] text-white backdrop-blur-xl transition-all duration-300 ease-out',
              scrolled
                ? 'rounded-[2.35rem] border-[rgb(218_185_137_/_0.35)] shadow-[0_18px_46px_rgba(72,44,18,0.18)]'
                : 'rounded-none shadow-none'
            )}
          >
            <div
              className={cn(
                'mx-auto grid max-w-6xl items-center px-4 sm:px-6',
                'grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr]',
                scrolled ? 'h-20' : 'h-24'
              )}
            >
              <div className="flex md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-lg p-2 text-white transition hover:bg-white/10"
                >
                  <MenuToggleIcon open={mobileMenuOpen} className="size-5" duration={300} />
                </button>
              </div>

              <div className="hidden items-center gap-1 md:flex">
                <Link
                  to="/menu"
                  className={cn(
                    'pill-filter border-white/25 bg-white/12 text-white/90 hover:border-white/40 hover:bg-white/20 hover:text-white',
                    location.pathname === '/menu' && 'bg-white text-[color:var(--color-ink-900)]'
                  )}
                >
                  Menü
                </Link>
                <Link
                  to="/"
                  className={cn(
                    'pill-filter border-white/25 bg-white/12 text-white/90 hover:border-white/40 hover:bg-white/20 hover:text-white',
                    location.pathname === '/' && 'bg-white text-[color:var(--color-ink-900)]'
                  )}
                >
                  Ön Sipariş
                </Link>
                <Link
                  to="/track"
                  className={cn(
                    'pill-filter border-white/25 bg-white/12 text-white/90 hover:border-white/40 hover:bg-white/20 hover:text-white',
                    location.pathname === '/track' && 'bg-white text-[color:var(--color-ink-900)]'
                  )}
                >
                  Sipariş Takip
                </Link>
              </div>

              <Link to="/" className="justify-self-center -translate-y-0.5">
                <img
                  src="/shabby-logo.png"
                  alt="Shabby Cafe & Restaurant"
                  className={cn(
                    'h-[4.75rem] w-auto object-contain drop-shadow-[0_10px_18px_rgba(81,66,51,0.22)] transition-all duration-300',
                    scrolled ? 'sm:h-[5.4rem]' : 'sm:h-[5.4rem]'
                  )}
                />
              </Link>

              <div className="justify-self-end">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="relative inline-flex items-center gap-2 rounded-full bg-[color:var(--color-brand-500)] px-3 py-2 text-sm font-bold text-white shadow-[0_14px_32px_rgba(187,109,31,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-brand-600)] active:translate-y-0 md:px-4 md:py-2.5 lg:px-5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sepet</span>
                  {itemCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[color:var(--color-brand-600)]">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div
              className={cn(
                'md:hidden overflow-hidden border-t border-white/10 transition-all duration-300 ease-out',
                mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="space-y-2 px-4 py-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block rounded-lg px-4 py-3 text-sm font-semibold transition',
                    location.pathname === '/'
                      ? 'bg-white text-[color:var(--color-ink-900)]'
                      : 'hover:bg-white/10'
                  )}
                >
                  Ön Sipariş
                </Link>
                <Link
                  to="/menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block rounded-lg px-4 py-3 text-sm font-semibold transition',
                    location.pathname === '/menu'
                      ? 'bg-white text-[color:var(--color-ink-900)]'
                      : 'hover:bg-white/10'
                  )}
                >
                  Menü
                </Link>
                <Link
                  to="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block rounded-lg px-4 py-3 text-sm font-semibold transition',
                    location.pathname === '/track'
                      ? 'bg-white text-[color:var(--color-ink-900)]'
                      : 'hover:bg-white/10'
                  )}
                >
                  Sipariş Takip
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
