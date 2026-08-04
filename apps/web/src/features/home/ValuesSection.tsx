import { Container } from '@/components/ui/Container';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Heart, Shield, Sparkles, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Inclusivity',
    description: 'We believe everyone deserves safe, welcoming spaces regardless of identity.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Every spacer completes our safer-space training and code-of-conduct review.',
  },
  {
    icon: Sparkles,
    title: 'Creativity',
    description: 'We celebrate and support creative expression in all its forms.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We build connections between venues, organizers, and attendees.',
  },
];

export function ValuesSection() {
  return (
    <Section
      spacing="normal"
      className="bg-foreground text-background dark:bg-card dark:text-foreground"
    >
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Our Values"
          title={<span className="text-background dark:text-foreground">Core principles that guide everything we do</span>}
          description="These four values inform every booking, application, and event on the platform."
          className="text-background/80 dark:text-foreground"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10 dark:border-border dark:bg-background/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coral-500/20 text-coral-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/75 dark:text-muted-foreground">
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
