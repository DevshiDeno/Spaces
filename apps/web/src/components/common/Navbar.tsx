import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';

const navLinks = [
  { to: '/venues', label: 'Find a Venue' },
  { to: '/events', label: 'Events' },
  { to: '/become-an-ally', label: 'For Venues' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrollPosition();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60'
          : 'bg-transparent'
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/venues"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:inline-flex"
            aria-label="Quick search"
          >
            <Search className="h-4 w-4" />
          </Link>
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary">
                {user?.name?.split(' ')[0]}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary md:inline-block"
              >
                Sign in
              </Link>
              <Button
                size="sm"
                onClick={() => navigate('/sign-up')}
                leftIcon={<LogIn className="h-3.5 w-3.5" />}
                className="hidden md:inline-flex"
              >
                Get Started
              </Button>
            </>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden hover:bg-secondary"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <nav className="container-page flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2.5 text-base font-medium',
                      isActive ? 'bg-secondary text-primary' : 'text-foreground'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base font-medium"
                    >
                      Dashboard
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout();
                        setOpen(false);
                        navigate('/');
                      }}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/sign-in"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base font-medium"
                    >
                      Sign in
                    </Link>
                    <Button onClick={() => { setOpen(false); navigate('/sign-up'); }} fullWidth>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
