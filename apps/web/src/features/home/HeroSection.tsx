import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

const stats = [
  { value: '120+', label: 'Verified Venues' },
  { value: '5,400+', label: 'Community Members' },
  { value: '8', label: 'Cities Covered' },
];

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/55 to-coral-500/30 dark:from-background/80 dark:via-background/70 dark:to-coral-700/30" />
        <div className="absolute inset-0 bg-grain opacity-60 mix-blend-overlay" />
      </div>

      <Container className="relative pb-24 pt-24 sm:pb-32 sm:pt-32 lg:pb-40 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Building inclusive communities across Kenya
          </span>
          <h1 className="heading-display mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Find Your Perfect{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-coral-500 to-accent bg-clip-text text-transparent">
                Inclusive Space
              </span>
              <svg
                className="absolute -bottom-2 left-0 h-2 w-full text-coral-400"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path d="M0 4 Q 50 0 100 4 T 200 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl text-pretty">
            Book your perfect space or apply to become a verified spacer. Safer experiences for
            every gathering — from listening parties to wellness circles.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/venues')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Find a Venue
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/become-an-ally')}
            >
              Become a Spacer
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-bold leading-none">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const q = form.get('q')?.toString() ?? '';
            const city = form.get('city')?.toString() ?? '';
            const params = new URLSearchParams();
            if (q) params.set('query', q);
            if (city) params.set('city', city);
            navigate(`/venues?${params.toString()}`);
          }}
          className="mt-10 flex flex-col gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-xl shadow-black/5 backdrop-blur sm:flex-row sm:items-center sm:gap-1"
        >
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              placeholder="Search venues…"
              className="h-12 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="flex flex-1 items-center gap-2 px-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <input
              name="city"
              placeholder="City (e.g. Nairobi)"
              className="h-12 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <Button type="submit" size="md" className="sm:rounded-xl">
            Search Venues
          </Button>
        </motion.form>
      </Container>
    </section>
  );
}
