import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Heart } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME, COMPANY_LOCATION, SOCIAL_LINKS, SUPPORT_EMAIL } from '@/constants';

const linkGroups = [
  {
    title: 'Discover',
    links: [
      { label: 'Find a Venue', to: '/venues' },
      { label: 'Events Calendar', to: '/events' },
      { label: 'About Us', to: '/about' },
      { label: 'How It Works', to: '/about#how-it-works' },
    ],
  },
  {
    title: 'For Venues',
    links: [
      { label: 'Become an Ally', to: '/become-an-ally' },
      { label: 'Training Program', to: '/become-an-ally#training' },
      { label: 'Sign in', to: '/sign-in' },
      { label: 'List your space', to: '/become-an-ally' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground text-pretty">
              Creating inclusive, creative spaces and documenting cultural change across Kenya.
              Safer experiences for everyone.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <SocialIcon href={SOCIAL_LINKS.instagram} label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>
              <SocialIcon href={SOCIAL_LINKS.twitter} label="Twitter"><Twitter className="h-4 w-4" /></SocialIcon>
              <SocialIcon href={SOCIAL_LINKS.facebook} label="Facebook"><Facebook className="h-4 w-4" /></SocialIcon>
              <SocialIcon href={SOCIAL_LINKS.linkedin} label="LinkedIn"><Linkedin className="h-4 w-4" /></SocialIcon>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-5">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold tracking-wide">{group.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold tracking-wide">Stay Connected</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Get updates on new venues, events, and community news.
            </p>
            <form
              className="mt-4 flex flex-col gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input type="email" placeholder="you@example.com" />
              <Button type="submit" variant="primary">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. {COMPANY_LOCATION}.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 fill-coral-500 text-coral-500" /> in Nairobi · {' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
