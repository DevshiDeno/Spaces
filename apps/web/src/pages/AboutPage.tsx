import { Container } from '@/components/ui/Container';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ValuesSection } from '@/features/home/ValuesSection';
import { HowItWorksSection } from '@/features/home/HowItWorksSection';
import { CtaSection } from '@/features/home/CtaSection';

const impactStats = [
  { value: '120+', label: 'Verified Venues' },
  { value: '5,400+', label: 'Community Members' },
  { value: '8', label: 'Cities Covered' },
  { value: '850+', label: 'Events Hosted' },
];

export default function AboutPage() {
  return (
    <>
      <Section spacing="tight" className="bg-cream/40 dark:bg-card/30">
        <Container>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            About Qreative Spaces
          </span>
          <h1 className="heading-display mt-3 max-w-3xl text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
            Building inclusive communities, one space at a time.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Whether you are looking to book an inclusive venue for your next event or want to make
            your space more welcoming, we are here to help.
          </p>
        </Container>
      </Section>

      <Section spacing="normal">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Our Mission"
                title="Safer experiences, especially powerful for niche or identity-centered platforms"
                description="At Qreative Spaces, we partner with hospitality venues across Kenya to make every space safer, more welcoming, and unmistakably ours."
              />
              <p className="mt-4 text-base text-muted-foreground text-pretty">
                We measure success by the positive change we create in our communities. From
                listening parties to wellness circles, queer socials to grief support gatherings —
                we believe every gathering deserves a venue that holds it well.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="text-xl font-semibold tracking-tight">Our Impact</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Numbers from our growing inclusive ecosystem.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                {impactStats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-3xl font-bold leading-none">{s.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <ValuesSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
